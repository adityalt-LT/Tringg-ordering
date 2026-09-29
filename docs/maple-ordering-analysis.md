# Maple → Tringg: Ordering Analysis

_Last updated: 2026-09-28_

**Purpose.** Break down how Maple ([maple.inc](https://maple.inc)) does AI phone ordering, then check it against the Tringg ordering specs already in Confluence. The result is a list of gaps, contradictions and recommendations for Tringg Ordering v1.

**Sources.**
- Maple's public docs at `docs.maple.inc`, read through search-engine snippets. The session's network policy blocked direct fetches of `maple.inc`, so nothing on that site was read in full.
- Maple press releases and pricing.
- Tringg Competitor Pulse (weeks of 09-14 and 09-21).
- Tringg Confluence: *Ordering*, *Order Module for Ordering*, *Settings for ordering*, *Ordering Overview Module PRD*.

Claims about Maple's weaknesses come from competitors (Kea, Loman) and are marked as such.

---

## 1. Maple at a glance

| | |
|---|---|
| What | 24/7 voice AI for restaurant phones: orders, reservations ("Bookings"), FAQs, transfers |
| Scale (self-reported) | 1M+ calls since Dec 2023; 92–96% resolved without a human; 1,000–2,500+ locations |
| Distribution | Growth mostly comes through POS partnerships: SpotOn (GA 2026-09-08), Chowbus (09-02), OrderCounter (~08-31), Quantic (Apr), Shift4 SkyTab. Merchants activate from inside the POS dashboard. |
| Pricing | **Voice** $150/mo ($85 billed yearly): answering, FAQ, transfer, analytics. **Pro** $350/mo ($220 billed yearly): adds POS ordering, reservations, upselling, payment, confirmation texts, white-glove onboarding. Enterprise pricing is custom. |
| Product structure | **Voice Core**, included in every plan. **Orders** and **Bookings** are add-on modules on top of it. |

The structure matters. Maple sells *answering* as the base, and *ordering* is the upsell that unlocks through POS integration.

---

## 2. How Maple ordering works (from docs.maple.inc)

### 2.1 Setup → go-live
1. **Voice Core first**: welcome message, voice (4 options plus optional ambient background audio), extra languages (docs list EN / ES / Mandarin; the Chowbus PR adds Cantonese and Korean), and a knowledge base. The docs recommend **at least 10 KB entries before go-live**.
2. **Connect POS** (SpotOn example): **KYC verification (2–3 business days)**, then OAuth to the POS, then choose locations, then auto menu sync, then verify items, modifiers and prices, then place test orders.
3. **SMS A2P 10DLC registration** (~2–3 days): business verification, use-case review, campaign registration. This is needed for payment links and confirmation texts.
4. **Test**: call the agent number directly. There is **no test environment**, so test orders print in the real kitchen and the docs tell merchants to use "Test" as the customer name.
5. **Go live** by switching on call forwarding. Maple markets this as "live in 15 minutes", but KYC and A2P mean ~3 days in practice.

### 2.2 Menu
- The **POS is the source of truth**. Items, categories, modifier groups and items, prices and **86'd (sold-out)** status sync automatically. The merchant picks which menus to share, and edits must be made in the POS.
- **Required vs optional modifiers come from POS rules.** For example, a Toast modifier group with min = 1 is required and the AI asks for it; min = 0 is optional.
- Items can be 86'd in real time from the POS **or** the Maple dashboard.
- **Menu hours are separate from business hours.** Outside menu hours the agent says the kitchen isn't taking orders but keeps answering FAQs.
- If the POS isn't supported, the merchant builds the menu manually in the Maple dashboard.
- Supported POS: Toast, Square, Clover, SpotOn, SkyTab, NCR Aloha, **NCR Voyix**, Quantic, Tray, Chowbus, Smile.

### 2.3 On the call
- Natural-language ordering covering modifications, substitutions and special requests.
- **Upselling**: drinks, sides and combos, phrased as "Would you like…". Maple claims a 12–18% lift in average ticket.
- **Read-back confirmation** of the whole order before submitting.
- **Transfer to staff** is on by default. Settings: transfer number, **max transfer attempts**, and whether **after-hours transfer** is allowed. The docs warn the transfer number must differ from the main line to avoid an AI loop. There are also extra "Transfer Call" actions per topic, such as catering or reservations.
- **SMS ordering** is a second channel on the same engine. Chowbus also puts it on kiosk and drive-thru.

### 2.4 Payment
- **Pay by Link**: an SMS payment link (cards, Apple Pay and Google Pay). **The order goes to the kitchen only once it's paid.** Tips can be collected through the link.
- **Pay in store** is available for pickup on supported POS systems.
- No card numbers are taken by voice, which keeps Maple out of PCI voice scope.

### 2.5 Fulfilment
- Orders are **injected into the POS** and show up on KDS and printers like any in-store order. Staff don't need to change how they work.
- Pickup and delivery. Delivery runs through **Maple Fleet (DSP network)** or **BYOF**, with configurable **zones, fees and minimum order**.
- A **prep-time setting** drives the quoted time. Docs examples: pickup 15–25 min, delivery 35–55 min.
- The customer gets a **confirmation SMS with the make time**.
- **No in-place modification**: an order has to be cancelled and placed again.
- **Scheduled / future orders are "coming soon"**, so they're not live yet.

### 2.6 Dashboard and API
- Location nav: Orders · Bookings · Phone Calls · AI Agents · Menus · Knowledge · Analytics · My Location.
- **Order Summary** shows items, modifiers, payment method, **fulfilment time** and caller phone.
- Analytics covers Total Calls, Total Call Time, Calls Transferred, call-volume trends and a "Key Stats" sales-volume card.
- **Developer API**:
  - Order decisions are `accept · deny · ready · complete · cancel · status`.
  - Decisions are idempotent by design, with no idempotency key. Replaying a decision returns the same acknowledgement.
  - Webhooks are **at-least-once**, and the docs tell consumers to dedupe on the envelope id.
  - To get ordering right, reconcile with `GET /v1/orders/{id}` rather than relying on event order.

### 2.7 Reported weaknesses (from competitor sources, so treat with caution)
- Struggles with complex items such as half-and-half pizzas.
- Latency, and complex orders reaching the POS 5–8 minutes late.
- The confirmation SMS has **no itemised recap**, so the customer can't check the ticket.
- Onboarding sometimes takes more than 6 weeks despite the "15 min" claim.

---

## 3. Tringg today vs Maple

| Area | Maple | Tringg spec (Confluence) | Gap / action |
|---|---|---|---|
| Menu source | POS is the truth, with real-time 86 sync | POS sync (Toast / Square / Clover) **or** manual Menu Builder | Spec the **modifier min/max → required-question** mapping and **real-time 86 sync**. Neither is written down today. |
| Menu hours | Separate from business hours | Business hours only | Add **ordering hours per menu**. The agent answers FAQs but declines orders outside them. |
| Kitchen handoff | POS injection → KDS / printer, zero touch | **Phase 1: no KDS, kitchen notified manually**; auto-accept OFF means a 30-min Pending queue | **Biggest gap.** At minimum auto-print or a loud tablet alert in v1, with POS injection through LimeTray's existing POS pipes (NCR, etc.). |
| Pending expiry | Not applicable (order goes straight to kitchen once paid) | 30 min, fixed | The caller has already hung up expecting food, and 30 minutes is too long. Cut to 5–10 min, then SMS the customer on expiry or decline. |
| Payment | SMS link, and the kitchen gets the order only after payment; pay in store for pickup | Settings/Order Module say pay *before* order creation via `cart.tringg.com`. **Overview PRD says v1 = pay at pickup only, link is v1.5.** | **Contradiction.** Decide one v1 policy. Recommendation: pay-at-pickup plus the SMS link, following Maple's "kitchen after payment" rule. |
| Refund on decline | Avoided: nothing is charged until the order is accepted | Open question in the *Ordering* page; Settings adds an auto / manual refund queue | If staff approval is kept, **authorise the card, then capture on accept**, so no refunds are needed. |
| Caller number | Used for the payment link and confirmation SMS | **Caller-ID-through-forwarding is an open risk** | This blocks SMS payment. The agent must **read back / ask for a mobile number** every time. |
| Prep / quote time | Prep-time setting; make time in the SMS | "Pickup time" confirmed on the call, with no source for it | Add per-outlet **prep time** (pickup and delivery) and a **busy mode** that adds X minutes. |
| Delivery | Zones, fee, minimum, own fleet or DSP | Radius, rider type, manual rider | Add **delivery fee and minimum order** to Service Types. |
| Modify order | Cancel and re-place | AI can modify while Created or Pending | Tringg is ahead here. Keep it. |
| Upsell | "Intelligent", 12–18% lift claimed | Max one per order from "Suggest with this item"; `upsell_accepted` field | Aligned. Make sure `upsell_value` is logged from day 1 so we can claim a lift number. |
| Transfer | Max attempts, after-hours toggle, per-topic numbers, loop warning | Fallback number, 3-strike rule | Add **after-hours transfer** toggle, **per-topic transfer** (catering) and **fallback ≠ main line validation**. |
| Languages | EN / ES / ZH (+ Cantonese, Korean via Chowbus) | A single "Language" field on the agent | Auto-detect the caller's language, keep the ticket in the kitchen's language. **ES first** for the US. |
| Confirmation SMS | Make time only, no recap | Cart page exists | **Differentiator**: an itemised recap link (the `cart.tringg.com` page) for *every* order, paid or not. |
| Testing | No sandbox, so tests print in the kitchen | Not specced | Add a **test mode** (orders flagged, not sent to POS or KDS). Another differentiator. |
| Go-live | KYC + A2P ~3 days | Not specced | Start **A2P 10DLC registration at signup** so it runs in parallel. |
| Scheduled orders | Not live ("coming soon") | Not specced | Opportunity: pickup-later and catering in v1.5. |
| API / webhooks | Idempotent decisions, at-least-once webhooks | POS failure → retry ×3, queue, `POS_FAILED` | Copy the pattern: idempotent status transitions, dedupe POS webhooks by event id. |
| Traceability | Order Summary + calls list | Call ↔ order link, transcript, review log | Tringg is ahead. Lead demos with it. |

---

## 4. Contradictions inside Tringg's own specs (fix before engineering)

1. **Three different order state machines.**
   - *Ordering* page: `NEW → PAID → IN_PROGRESS → READY → COMPLETED`, with `PAYMENT_FAILED` / `POS_FAILED`.
   - *Overview PRD*: `capturing → completed → preparing → ready → fulfilled`, plus `failed`.
   - *Order Module*: `Pending / Accepted → Preparing → Prepared → Assigned / Dispatched / Delivered / Picked Up → Completed`, plus Cancelled / Declined / Expired. It also says "payment failure is never a status".

   The *Ordering* page also says "state machine will be of LimeTray". Pick **one** canonical enum, preferably the LimeTray Order API's, and map the others onto it.
2. **Payment timing.** The Overview PRD's v1 is pay at pickup, with the SMS link in v1.5. Settings and the Order Module treat the card link as v1 and pay-before-create.
3. **Autonomy.** The Overview PRD says "nothing waits for merchant approval". The Order Module has a Phase-1 Pending approval flow with a 30-min expiry. Both can hold if the Overview's review log sits alongside a Pending count, but the Overview PRD needs to say so.
4. **`failed` ReviewItem.** The Overview PRD emits one for "payment link expired". The Order Module says no order is created on payment failure. Decide whether a failed payment creates a *pre-order / cart* record or only a call outcome.

---

## 5. Recommended Tringg Ordering v1 scope

**Must have (parity):**
- POS menu sync, plus the Menu Builder fallback: modifier-rule enforcement, real-time 86, **ordering hours**.
- Order read-back, then mobile-number capture and confirmation, then quoted ready time from **prep time + busy mode**.
- Payment: **pay at pickup / on delivery + SMS card link**. The kitchen gets the order after payment or on commit; if approval is on, authorise then capture.
- Kitchen handoff that doesn't rely on someone watching a dashboard: POS injection where connected, otherwise **auto-print / tablet alert**.
- Transfer: fallback number, max attempts, after-hours toggle, loop validation.
- Pickup + delivery with zone, fee and minimum.
- Confirmation SMS **with an itemised recap link**.

**Differentiators (where Tringg can win):**
- Itemised recap + edit link: Maple doesn't have one.
- **Test mode / sandbox**: Maple doesn't have one.
- Modify-in-place for Pending orders, where Maple forces cancel and re-place.
- Call ↔ order traceability and the review log.
- **LimeTray's installed POS base and integrations** (NCR BSL, aggregators). This is our answer to Maple's POS-partnership distribution: ship ordering as a toggle inside the LimeTray dashboard.
- Spanish at launch. Mandarin and others to follow.

**Later (v1.5+):** scheduled / catering orders (Maple has none yet), SMS-text ordering channel, per-topic transfer routing, public order-decision API and webhooks.

**Targets to benchmark against Maple:** ≥90% autonomous completion on order-intent calls (Maple claims 92–96%), plus an upsell lift figure and time from call end to kitchen ticket (under 60 s, versus the reported 5–8 min for Maple).

---

## 6. QA approach (borrowed from Maple's "large menu" guide)
- Build a **golden call set** per pilot menu. Each case lists the script, expected items and modifiers, expected total, and expected outcome (order / transfer).
- On any menu or modifier-rule change, update one item, confirm the sync, and **re-run the affected cases**.
- Include hard cases: half-and-half, required modifier skipped, 86'd item, out-of-zone address, caller changes their mind mid-order, blocked caller ID.

---

## Sources
- Maple docs: [Orders overview](https://docs.maple.inc/orders/overview) · [Orders FAQ](https://docs.maple.inc/orders/faq) · [SpotOn](https://docs.maple.inc/orders/pos/spoton) · [Clover](https://docs.maple.inc/orders/pos/clover) · [SkyTab](https://docs.maple.inc/orders/pos/skytab) · [Dashboard overview](https://docs.maple.inc/dashboard-overview) · [Voice Core](https://docs.maple.inc/voice-core/overview) · [SMS A2P](https://docs.maple.inc/voice-core/sms-a2p) · [Quickstart](https://docs.maple.inc/quickstart) · [Going live](https://docs.maple.inc/going-live) · [Idempotency](https://docs.maple.inc/developer-api/concepts/idempotency)
- Maple site: [Pricing](https://maple.inc/pricing/) · [Large-menu testing](https://maple.inc/blog/restaurant-voice-ai-large-menus-2026) · [Upsells](https://maple.inc/blog/how-voice-ai-increases-upsells-in-restaurants-2025-guide)
- Press: [SpotOn](https://finance.yahoo.com/technology/ai/articles/maple-spoton-partner-modernize-restaurant-154600669.html) · [Quantic](https://www.businesswire.com/news/home/20260424097043/en/Maple-and-Quantic-Partner-to-Bring-AI-Phone-Ordering-to-Thousands-of-Restaurants) · [Chowbus](https://www.01net.it/chowbus-and-maple-announce-strategic-partnership-to-bring-multilingual-voice-ai-ordering-to-restaurants/) · [OrderCounter](https://www.01net.it/ordercounter-and-maple-launch-strategic-partnership-to-enable-ai-phone-ordering-built-for-hybrid-pos/)
- Competitor-authored (biased): [Loman on Maple](https://loman.ai/blog/maple-reviews-pricing-alternatives) · [Kea comparison](https://kea.ai/blog/restaurant-voice-ai-comparison-2026-kea-ai-vs-maple-revmo-loman)
- Internal Confluence: [Ordering](https://limetray.atlassian.net/wiki/spaces/Tringg/pages/4558618640) · [Order Module](https://limetray.atlassian.net/wiki/spaces/Tringg/pages/4558651460) · [Settings for ordering](https://limetray.atlassian.net/wiki/spaces/Tringg/pages/4558782492) · [Overview PRD](https://limetray.atlassian.net/wiki/spaces/Tringg/pages/4558651428) · [Competitor Pulse 09-14](https://limetray.atlassian.net/wiki/spaces/Tringg/pages/4753195009) · [Competitor Pulse 09-21](https://limetray.atlassian.net/wiki/spaces/Tringg/pages/4760502291)

## Addendum (2026-09-29): who gets the money on a pickup order

- **Maple takes no cut of orders.** It charges a flat subscription: Voice $85/mo, Pro $220/mo (billed yearly). Ordering is on Pro. There's no per-order or per-minute fee.
- **Pickup has two payment modes.**
  - **Pay by Link:** Maple texts a payment link during the call, and the kitchen gets the order only after it's paid.
  - **Pay in Store:** the order goes straight to the kitchen, and the customer pays at the counter through the restaurant's own POS. Maple never touches this money.
- **Where Pay in Store is available.** Supported on Toast, Clover, NCR Aloha, NCR Voyix, Quantic, Tray and Chowbus. Square, SkyTab, Smile and SpotOn require card payment up front.
- **Delivery.** Always paid by card up front.
- **Card money.** It goes through processing Maple says is "included" in the plan, after KYC (2–3 business days). On SpotOn and SkyTab it runs through the POS processor. Maple's revenue is the subscription, not the order value.
- **Tringg is the same.** Pay after (at the store) goes 100% to the outlet. Pay before is a direct charge on the merchant's own Stripe account, so the only deduction is Stripe's fee. Tringg's revenue is the one subscription.

Sources: [Maple pricing](https://maple.inc/pricing/) · [Orders Module overview](https://docs.maple.inc/orders/overview) · [Orders FAQ](https://docs.maple.inc/orders/faq)

## Decision (2026-09-29): payment by order type, no card holds

- **Pickup:** paid on the call (text link) or at pickup. The merchant keeps at least one on, and Allie asks which the caller prefers.
- **Delivery:** always paid on the call, because there's no counter to pay at. Delivery can't be turned on until Stripe is connected. Cash on delivery is out for now; revisit it for India and the Middle East.
- **No card holds.** The card is charged when the caller pays the link, and **paid orders go straight to the kitchen** (Accepted). Accept / decline and auto-accept only apply to pay-at-pickup orders, which cost nothing to decline.
- **Refund from the order,** for the rare paid order the kitchen can't make: the whole order (it moves to Cancelled) or single items. Stripe keeps its fee on refunds. This matches Maple's pay-by-link, where the kitchen gets the order once it's paid.
