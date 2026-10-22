# Ordering Payments · Decisions and flow

Status as of 22 Oct 2026. Companion to the Ordering Settings PRD (sections 3F and 3G). Intended as a child page under "Ordering · Module PRDs" in the Tringg space. Not yet published to Confluence (the Atlassian connection timed out).

## 1. Decisions

Callers pay a restaurant through a texted link, the money goes straight to the restaurant's own Stripe account, and Tringg earns only a flat subscription.

| # | Question | Decision |
|---|---|---|
| D1 | Which processor and entity pay US restaurants | Stripe Connect from a **US Stripe entity** (confirmed). The Dubai Stripe account can only connect UAE businesses. |
| D2 | Who pays the card fee (about 2.9% + $0.30) | The restaurant. |
| D3 | Does Tringg take a cut per order | No. Flat subscription only. |
| D4 | Where the merchant sees payouts and refunds | On the Stripe dashboard. Tringg builds no payouts screen. |
| D5 | An unpaid payment link | No reminders. At expiry the order is cancelled, unless the owner turns on a fallback (section 3). |
| D6 | Cash on delivery when both rules are on | **Both rules must be met** (amount limit and repeat customer). |

## 2. How payment works

| Step | What happens |
|---|---|
| 1. On the call | The agent reads the order back, confirms the mobile number, texts the payment link and ends the call. It never waits on the line and never takes card numbers. |
| 2. The link | Valid 15 minutes in total. Retry and resend allowed; a failed attempt does not restart the clock. Card, Apple Pay or Google Pay on a Tringg-branded page; tip chosen on that page. |
| 3. The order | Pickup: visible to staff as Awaiting payment, locked. Delivery: hidden from staff. When paid it becomes Placed and follows the auto-accept setting. |
| 4. Declined or missed | A paid order that staff decline, or nobody acts on, is refunded in full and the caller is texted. |

Which options apply:

| Channel | Options |
|---|---|
| Pickup | Owner chooses Online, At pickup, or Both. |
| Delivery | Online only. Cash on delivery only if the order total is at or below the amount limit **and** the caller is a repeat customer. |
| Delivery before payments are connected | Can go live only if a cash rule is on. |
| Caller cannot receive a text | Pickup: pay at pickup. Delivery: ask them to call back. |

## 3. When the payment link expires

| | Pickup | Delivery |
|---|---|---|
| Before expiry | Visible, Awaiting payment, locked | Hidden from staff |
| At 15 min, default | Cancelled, caller texted | Cancelled, caller texted; the restaurant never sees it |
| At 15 min, fallback on | Switches to pay at pickup (needs pickup set to Both) | Switches to cash on delivery only if the order meets both cash rules; otherwise cancelled |

Two owner settings, both off by default. A new caller can never reach cash by letting the link expire. A delivery order switched at minute 15 reaches the restaurant 15 minutes late, so the agent must not promise the original time. If the caller is mid-payment at minute 15, the order should not expire until that attempt finishes.

## 4. Merchant account and payouts

| Topic | Position | Status |
|---|---|---|
| Account structure | Each restaurant has its own Stripe account under the Tringg platform; Tringg never holds restaurant money | Decided |
| Setup | "Connect payments", then Stripe verification (business and EIN, owner ID, bank); about 10 minutes | Proposed |
| Statuses | Not connected, Verifying, Action needed, Connected; only Connected unlocks online payment | Proposed |
| Payouts | Automatic daily; first payout about 7 to 14 days | Proposed |
| Where the owner looks | Stripe dashboard; no Tringg payouts table | Decided |
| Card fee and commission | Restaurant pays the fee; no Tringg cut | Decided |
| Refunds and chargebacks | From the restaurant's balance; Tringg sends call recording and transcript as evidence | Proposed |
| Who can manage | Owner only | Decided |

## 5. How this answers the review comments

| Review point | Answer |
|---|---|
| Send a link only, do not wait on the call | Section 2 |
| Journey when the caller fails, forgets or never receives the link | Sections 2 and 3; no reminders (D5) |
| Whose payment account | Section 4: each restaurant's own Stripe account under a US entity |
| Commission and who bears fees | D2, D3 |
| Delivery paid offline | Section 2, D6 |
| Dashboard did not give enough detail | D4 |

## 6. Changes needed in the Ordering Settings PRD

- Remove every Payserv mention: assumption 4, OS-075, OS-081, OS-124, EC-33, open item 1.
- Remove OS-084 (payouts table).
- Remove the on-the-call wait: OS-059, OS-060, criteria 11 and 12, section 4.6.
- OS-067 and 6F: both cash rules must be met; drop the either/both choice.
- Add the two expiry fallback settings; update OS-074 and section 4.3 step 5 (cancel by default).
- Add "Action needed" to the connection statuses (OS-082).
- Close open item 6: no commission; restaurant pays the card fee.

## 7. Still open

- India (UPI) and the UK are not covered by a US Stripe entity.
- Whether the existing LimeTray Stripe or payment setup can be reused; credentials and sandbox (separate integration document).
- Whether paid orders reach the POS marked as paid (depends on the Phase 1 POS list).
- Stripe checkout pages stay open at least 30 minutes, so Tringg must cancel the payment itself at 15 minutes and refund any late payment.
