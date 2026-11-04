// Tringg Ordering: Stripe Connect test server.
// Model (matches docs): each brand connects its own Express account; card payments are
// DIRECT CHARGES on that account, so the merchant is merchant of record, Stripe takes its
// fee, and Tringg takes no cut. Refunds are made from the order. Test mode only.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Stripe from 'stripe';

const KEY = process.env.STRIPE_SECRET_KEY || '';
if (!KEY.startsWith('sk_test_')) {
  console.error('Set STRIPE_SECRET_KEY to a TEST-mode key (sk_test_...). Live keys are refused.');
  process.exit(1);
}
const stripe = new Stripe(KEY);
const PORT = Number(process.env.PORT || 4242);
const BASE = process.env.BASE_URL || `http://localhost:${PORT}`;
const here = path.dirname(fileURLToPath(import.meta.url));
const STORE = path.join(here, 'accounts.json'); // brand -> connected account id (dev-only persistence)
const load = () => { try { return JSON.parse(fs.readFileSync(STORE, 'utf8')); } catch { return {}; } };
const save = (d) => fs.writeFileSync(STORE, JSON.stringify(d, null, 2));

const send = (res, code, body) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
const readBody = (req) => new Promise((ok) => { const c = []; req.on('data', (d) => c.push(d)); req.on('end', () => ok(Buffer.concat(c))); });
const json = async (req) => { const b = await readBody(req); return b.length ? JSON.parse(b) : {}; };
const acctOf = (brand) => { const id = load()[brand]; if (!id) throw Object.assign(new Error('No Stripe account for this brand yet'), { status: 404 }); return id; };

async function status(acct) {
  const a = await stripe.accounts.retrieve(acct);
  const bal = await stripe.balance.retrieve({ stripeAccount: acct });
  return {
    account: acct, name: a.business_profile?.name || a.settings?.dashboard?.display_name || null,
    details_submitted: a.details_submitted, charges_enabled: a.charges_enabled, payouts_enabled: a.payouts_enabled,
    requirements_due: a.requirements?.currently_due || [],
    state: a.charges_enabled ? 'active' : a.details_submitted ? 'pending' : 'none',
    balance: { available: bal.available, pending: bal.pending },
  };
}

const routes = {
  // Step 1+2+3 of "Connect with Stripe": create the Express account, then send the owner to Stripe.
  'POST /api/connect/start': async (req) => {
    const { brand = 'rossa', name = 'ROSSA Pizzeria', email } = await json(req);
    const db = load();
    if (!db[brand]) {
      const a = await stripe.accounts.create({
        type: 'express', country: 'US', email,
        business_profile: { name },
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      });
      db[brand] = a.id; save(db);
    }
    const link = await stripe.accountLinks.create({
      account: db[brand], type: 'account_onboarding',
      refresh_url: `${BASE}/connect-test.html?refresh=1`, return_url: `${BASE}/connect-test.html?returned=1`,
    });
    return { account: db[brand], url: link.url };
  },
  'GET /api/connect/status': async (_r, q) => status(acctOf(q.get('brand') || 'rossa')),
  // Express dashboard login link (payouts, disputes live there per the docs)
  'POST /api/connect/dashboard': async (req) => {
    const { brand = 'rossa' } = await json(req);
    return { url: (await stripe.accounts.createLoginLink(acctOf(brand))).url };
  },
  // "Caller pays": hosted Checkout page, direct charge on the connected account. Tringg takes no fee.
  'POST /api/pay/session': async (req) => {
    const { brand = 'rossa', orderId = 'ORD-1', amountCents = 2500, description = 'Order' } = await json(req);
    const acct = acctOf(brand);
    const s = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: amountCents, product_data: { name: `${description} ${orderId}` } } }],
      payment_intent_data: { metadata: { orderId, brand } },
      metadata: { orderId, brand },
      success_url: `${BASE}/connect-test.html?paid=${encodeURIComponent(orderId)}&session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE}/connect-test.html?cancelled=1`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Stripe minimum; app treats links as dead after 10 min
    }, { stripeAccount: acct });
    return { id: s.id, url: s.url };
  },
  'GET /api/pay/session': async (_r, q) => {
    const acct = acctOf(q.get('brand') || 'rossa');
    const s = await stripe.checkout.sessions.retrieve(q.get('id'), { expand: ['payment_intent.latest_charge.balance_transaction'] }, { stripeAccount: acct });
    const ch = s.payment_intent?.latest_charge, bt = ch?.balance_transaction;
    return { payment_status: s.payment_status, payment_intent: s.payment_intent?.id, amount: s.amount_total,
      stripe_fee: bt?.fee ?? null, net_to_merchant: bt?.net ?? null, charge: ch?.id };
  },
  // Refund from the order: whole order or a partial amount. Stripe keeps its fee.
  'POST /api/pay/refund': async (req) => {
    const { brand = 'rossa', paymentIntent, amountCents } = await json(req);
    const r = await stripe.refunds.create({ payment_intent: paymentIntent, ...(amountCents ? { amount: amountCents } : {}) }, { stripeAccount: acctOf(brand) });
    return { id: r.id, status: r.status, amount: r.amount };
  },
};

async function webhook(req, res) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return send(res, 501, { error: 'STRIPE_WEBHOOK_SECRET not set' });
  try {
    const ev = stripe.webhooks.constructEvent(await readBody(req), req.headers['stripe-signature'], secret);
    // Connect events carry ev.account (the brand's connected account).
    console.log('webhook', ev.type, ev.account || '', ev.data.object.id);
    // TODO: checkout.session.completed -> mark order paid & hand to the kitchen/POS as prepaid;
    //       account.updated -> refresh brand's Stripe state; charge.refunded -> order payState.
    send(res, 200, { received: true });
  } catch (e) { send(res, 400, { error: e.message }); }
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, BASE);
  try {
    if (req.method === 'POST' && url.pathname === '/webhook') return webhook(req, res);
    const h = routes[`${req.method} ${url.pathname}`];
    if (h) return send(res, 200, await h(req, url.searchParams));
    const f = path.join(here, 'public', url.pathname === '/' ? 'connect-test.html' : url.pathname);
    if (f.startsWith(path.join(here, 'public')) && fs.existsSync(f) && fs.statSync(f).isFile()) {
      res.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : 'text/plain' }); return res.end(fs.readFileSync(f));
    }
    send(res, 404, { error: 'not found' });
  } catch (e) { send(res, e.status || 500, { error: e.message, type: e.type }); }
}).listen(PORT, () => console.log(`Tringg Stripe test server on ${BASE}`));
