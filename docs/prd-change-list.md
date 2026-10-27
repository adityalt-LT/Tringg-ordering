# Ordering Settings PRD: changes needed to match the updated prototype

Compared on 24 Oct 2026: the [Ordering Settings · PRD](https://limetray.atlassian.net/wiki/spaces/Tringg/pages/4789829645/Ordering+Settings+PRD) (last edited 22 Oct) against the prototype at https://claude.ai/artifact/B1HeTxYS2ns3b5vWvkuBJD (onboarding, then dashboard).
**Nothing has been changed on Confluence.** Copy the text below by hand.

**Screens for each change** are in `prototype/prd-views/` (open `index.html`). 13 files, one per screen.

## How to read this

- **EDIT** = change the text in place. **DELETE** = remove the row or sentence. **ADD** = new row, ready to paste. **PHASE 2** = keep but move out of Phase 1.
- ⚠ = this text carries one of Puneet's open comments. Editing or deleting it **detaches the comment**. Reply to and resolve the thread first, then edit. I list these again at the end.
- IDs: new stories use the next free `OS-1xx` number, or a suffix like `OS-047F`. Renumber however you prefer.

## What the prototype now does (the facts behind the changes)

1. **Onboarding step 2 (Verify)** has an Ordering row: pickup on/off and prep time, delivery on/off with radius, fee and minimum. The last onboarding screen says: finish ordering in the dashboard, turn on ordering in Agents (asked to subscribe), forward the line. After onboarding the owner lands on **Overview**, in All outlets view.
2. **One page: Settings › Ordering** replaces six screens. The outlet comes from the **left outlet selector**; there is no outlet picker in the page.
   - **Single outlet:** Menu, Pickup & delivery, Ordering hours, Taxes, Payments, then "More settings": Accepting orders, Pre-orders, Large orders.
   - **All outlets:** an outlet status table (status and what is left per outlet), then Menu, Taxes, Payments and Accepting orders (these apply to every outlet).
   - **POS connection** stays a separate Settings screen (also in single-outlet view).
3. **Checklist** (left menu, single outlet only): Menu, Pickup & delivery, Ordering hours, Taxes, Payments, **Turn on ordering**. It can be minimised to a ring with the steps left, marks the next step, and is not shown in All outlets. POS is not a step.
4. **Subscription:** if the account is not subscribed, Orders and Reservations show "Subscribe to make the agent active", and Agents shows a banner. Turning Ordering on in Agents asks to subscribe. Price shown is $350 per outlet per month (from the existing Billing screen), nothing billed until the owner subscribes.
5. **Pickup & delivery card:** pickup on/off with prep time; delivery on/off; each has its own **Pause for…** (15, 30, 60 min, or until resumed). Delivery area opens a **full-screen editor**: large map (Map/Satellite), draw zones by clicking corners, up to **5 zones**, each with name (Zone 1, 2…), colour, minimum, time and delivery charge, or one radius. **No "test an address".**
6. **Ordering hours:** "Same as opening hours" or "Different for pickup or delivery" (rows only for services that are on). **No last-order cut-off.** Special dates stay in Hours & booking.
7. **Auto-accept:** one switch for all outlets (on by default), per-outlet exceptions, time to accept (5, 10, 15 min) shown only where auto-accept is off.
8. **Payments** (Owner only, brand-wide): Stripe account status and "Open Stripe dashboard" (no payouts table), pickup payment (Online, At pickup, Both), cash on delivery with the amount limit and repeat-customer rule (**both must be met**), expiry fallbacks (pickup to pay at pickup, delivery to cash only if both rules met; off by default), preview of the texts and payment page. Payment is always **after the call**.
9. **Taxes** live in Settings › Ordering (not Menu). Delivery fees are set only per zone.
10. **Online menu link is removed from Phase 1.**
11. **Roles:** Owner sees everything. Manager sees Menu, Pickup & delivery, Ordering hours, Accepting orders, Pre-orders, Large orders (no Taxes, Payments, POS). Staff sees Pickup & delivery and Ordering hours, view only.

---

## 1. Objective / Problem statement

- **EDIT problem 3.** Replace "The caller pays from a text link, either while still on the call or after it ends. Every minute spent waiting on the phone costs money, so the owner needs to choose." with: "The caller pays from a text link after the call. The agent never waits on the line, because every minute on the phone costs money."
- **ADD problem 8:** "**Setup is scattered.** Ordering settings sit in several screens and the owner does not know the order to follow. A new owner needs one guided path from onboarding to the first order."
- **ADD problem 9:** "**The owner can activate the agent before paying.** Orders, reservations and the agent must stay inactive until the account is subscribed."

## 2. Assumptions

| # | Change |
|---|---|
| 3 | **EDIT:** "Ordering settings are managed per outlet. They are viewed and edited on one Ordering page in Settings. The outlet is chosen in the outlet selector in the left menu. The All outlets view shows an outlet status table and the settings that apply to every outlet (menu, taxes, payments, auto-accept)." |
| 4 | **EDIT (Payserv out):** "Online payment is taken through a payment link sent by text message after the call. The link is valid for **15 minutes in total**. Payments run through **Stripe Connect from a US Stripe entity**. Each restaurant has its own Stripe account and the money goes straight to it. The restaurant pays the card fee. Tringg takes no cut per order and charges a flat subscription. Payouts and refunds are seen on the Stripe dashboard." Details are in **Ordering Payments · PRD**. |
| 5, 6 | **DECISION NEEDED.** You told Puneet "Phase 1: no POS, dashboard accept/decline; Phase 2: first POS (Square)". Assumption 6 still says connecting a POS is Phase 1. Change to: "Connecting a POS is **Phase 2** (first vendor Square). In Phase 1 every outlet runs from the Tringg dashboard." Then move the 3H stories to Ph 2 (see 3H). |
| 7 | Already updated by you. Fine. |
| 12 | **DELETE** ("The setting for paying on the call or after the call…"). Payment is always after the call. |
| 15 | **DELETE** (online menu link). |
| new 16 | **ADD:** "Onboarding asks for a few ordering settings in step 2 (pickup prep time, delivery radius, fee and minimum). The owner then lands on the Overview with the ordering checklist." |
| new 17 | **ADD:** "The agent, orders and reservations are inactive until the account is subscribed. Turning Ordering on for the agent asks the owner to subscribe. Nothing is billed before that." |

## 3. Requirements: the "Already exists" table

- **EDIT row 1** (Signup, onboarding…): append "Ordering delta: onboarding step 2 asks the first ordering settings (see 3A)."
- **EDIT row "Business hours…"**: no change, but keep the note that special dates stay in Hours & booking.

## 3A. Setup checklist and going live

| Story | Change |
|---|---|
| OS-001 | **EDIT:** "see a setup checklist box in the left menu whenever a single outlet is selected and it is not fully set up for ordering". Remove "primary navigation" wording if you prefer; keep "left menu". |
| OS-002 | **EDIT steps:** "The steps are Menu, Pickup & delivery, Ordering hours, Taxes, Payments and Turn on ordering. POS is not a checklist step." |
| OS-003 | Keep. Add: "Menu opens the Menu screen; Turn on ordering opens the agent's settings in Agents." |
| OS-004 | **EDIT:** "collapse the checklist into a small ring that shows how many steps are left, and reopen it at any time" |
| OS-005 | Keep. |
| OS-006 | **EDIT:** "see how many steps are left, for example 'Set up ordering, 4 steps left', and which step is next" |
| OS-007 | **EDIT:** "see the checklist only for the outlet I have selected. In the All outlets view I see a status table with each outlet's status and what is still to do, and no checklist" |
| OS-008 | **EDIT:** "click **Start taking orders** only when Menu, Ordering hours, Taxes and Payments are done and the pickup and delivery settings are valid". |
| OS-009 | Keep. Add status "Taking orders" shown only when the account is subscribed and ordering is on. |
| OS-010, 011 | **EDIT OS-011:** "pause ordering for the outlet, or pause pickup or delivery on its own, for a set time (15, 30 or 60 minutes) or until I resume it". |
| **ADD** | "**OS-139** Owner \| land on the Overview, with the ordering checklist, after onboarding and see the ordering answers I gave in onboarding already filled in \| I continue from where onboarding stopped \| Ph 1 \| P0" |
| **ADD** | "**OS-140** Owner \| answer a few ordering questions in onboarding step 2: pickup on/off and prep time, delivery on/off with radius, fee and minimum \| my first ordering settings exist before I reach the dashboard \| Ph 1 \| P1" |
| **ADD** | "**OS-141** Owner \| turn on ordering for the agent as the last checklist step, in Agents \| ordering starts only when I choose \| Ph 1 \| P0" |

## 3A-new. Subscription (add as a new section, for example 3N)

| Story | Text |
|---|---|
| OS-142 | Owner \| see Orders, Reservations and Agents ask me to subscribe when the account is not subscribed, instead of showing live data \| I know why the agent is not active \| Ph 1 \| P0 |
| OS-143 | Owner \| be asked to subscribe when I switch Ordering on for the agent without a subscription \| the last step of setup is paying \| Ph 1 \| P0 |
| OS-144 | Owner \| see what I will pay before I subscribe (outlets × $350 a month) and that nothing is billed until I do \| no surprises \| Ph 1 \| P0 |
| OS-145 | Owner \| have the agent become active and ordering switch on when I subscribe \| I do not repeat a step \| Ph 1 \| P0 |
| OS-146 | Caller \| be told the outlet is not taking orders while the account is not subscribed (OS-013 already covers "no active subscription") \| I know to call back later \| Ph 1 \| P1 |

## 3B. Pickup and delivery

| Story | Change |
|---|---|
| OS-011 | See 3A. |
| OS-018, 019 | Keep (radius with fee, minimum, time). |
| OS-020 | **EDIT:** "define delivery zones by drawing them on a large map in a full-screen editor: click to place corners, then drag corners to reshape" |
| OS-021 | **EDIT:** "set a name, a colour, a minimum order amount, an estimated delivery time and a delivery charge for each zone" |
| OS-022 | Keep. |
| OS-023 | **DELETE** (address checker is removed). Delete criterion 4 in 6B too. |
| OS-030 | **EDIT:** "view and edit pickup and delivery settings on the Ordering page for the outlet I selected in the left menu. The All outlets view lists every outlet's status." |
| OS-031 | **DEFER** (not in the prototype; "apply the same settings to several outlets at once"). Keep as Ph 2 or leave open. |
| **ADD** | "**OS-147** Owner \| have at most **5 zones** per outlet \| the delivery area stays manageable \| Ph 1 \| P1" |
| **ADD** | "**OS-148** Owner \| name zones for the outlet I am setting up (Zone 1, Zone 2…) \| zones never carry another outlet's area name \| Ph 1 \| P2" |
| **ADD** | "**OS-149** Owner \| set the delivery fee only per zone (or for the radius), never as a charge in Taxes \| the fee is defined in one place \| Ph 1 \| P0" |
| **ADD** | "**OS-150** Owner \| pause pickup or delivery on its own, for 15, 30, 60 minutes or until I resume it, and also switch a service off \| I can stop one service without touching the other \| Ph 1 \| P0" |
| OS-016 | Not in the prototype (pickup instructions). Keep as is; decide whether it is Phase 1. |

⚠ The heading **"6B. Pickup and delivery"** carries a comment. Do not rename it.

## 3C. Ordering hours

⚠ The heading **"3C. Ordering hours"** and story **OS-036** carry comments. Resolve those threads first.

| Story | Change |
|---|---|
| OS-032, 033 | Keep. Add to 033: "Special dates and closures stay in the existing Hours & booking screen and are linked from the Ordering hours card." |
| OS-034 | **EDIT:** "set different ordering hours for pickup and for delivery, shown only for the services that are switched on" |
| **OS-036** | ⚠ **DELETE** (last-order cut-off). The end of the window is the last time the agent takes an order. Also delete: 4.5 step 2 "and sets a last-order cut-off"; 4.5 step 3 "before the cut-off"; 6C criterion 2; **EC-17**; the words "and cut-off" in OS-107 and 6J/6K criterion 2. |
| OS-038 | Keep. |
| OS-136 | Keep, but remove "before the cut-off" if present. |

## 3D. Pre-order

No change needed for the stories the prototype covers (on/off per service, shortest lead time, days ahead). **Not in the prototype:** ready windows (OS-134), the agent behaviour stories (OS-135, OS-138, EC-39, EC-41). Leave them as they are.

## 3E. Order acceptance and auto-accept

⚠ **OS-047** ("see an Auto-accept switch in the ordering controls for each outlet") carries a comment. Resolve the thread, then **DELETE OS-047**, because OS-047A replaces it.

| Story | Change |
|---|---|
| OS-047A, B | Keep (already added). Replace "ordering controls" with "the Ordering page". |
| OS-047C | **EDIT:** "see a three-step picture at the top of the Accepting orders card that changes when I flip the switch (caller orders, the order arrives or waits for me, the kitchen starts), with the detail in tooltips instead of paragraphs" |
| OS-047D | Keep. |
| OS-047E | **DELETE.** The prototype no longer shows the cash rules on the accepting screen. The cash rules are on the Payments card. |
| OS-049, 049A | Keep. |
| OS-052 | **DELETE** (duplicate of OS-049A). |
| OS-053, 054 | **PHASE 2** (POS). |
| OS-056 | **DELETE** (replaced by the single switch). |
| OS-057A to D | Keep. Rename to avoid a clash with OS-057 in 3F, for example OS-151 to OS-154. |
| delete the empty table row | The blank row between OS-049A and OS-050 is a paste leftover. |

## 3F. Payments and cash on delivery

⚠ The heading **"3F. Payments and cash on delivery"** carries a comment.

**Recommended:** replace the whole 3F and 3G tables with a short summary and a link to **Ordering Payments · PRD** (page 4810604548), which already holds the updated stories (PAY-001 to PAY-058). If you prefer to keep 3F here, apply the edits below.

| Story | Change |
|---|---|
| OS-057 | Keep (Online and Offline). |
| OS-059 | **DELETE.** Payment is always after the call. |
| OS-060 | **DELETE** (the agent never waits on the line). |
| OS-062 | Keep. |
| OS-067 | **EDIT:** "have cash on delivery allowed only when **both** rules are met when both are on". Remove "either". Close the [OPEN: default]. |
| OS-072 to OS-074 | Keep. Add to OS-074: "If the link expires unpaid the order is cancelled, unless the owner has turned on a fallback." |
| OS-075 | **EDIT (Payserv out):** "have online payments collected through Stripe and paid directly into my own Stripe account". Remove [OPEN]. |
| **ADD** | "**OS-155** Owner \| choose whether an unpaid pickup order switches to pay at pickup when the link expires (off by default; needs pickup set to Both) \| I keep a pickup the caller still plans to collect \| Ph 1 \| P1" |
| **ADD** | "**OS-156** Owner \| choose whether an unpaid delivery order switches to cash on delivery when the link expires, only if it already meets both cash rules, otherwise it is cancelled (off by default; needs a cash rule on) \| a new caller can never reach cash by letting the link expire \| Ph 1 \| P1" |
| **ADD** | "**OS-157** Caller \| be refunded automatically and told by text if I pay after my order was cancelled \| I am never charged for an order I will not get \| Ph 1 \| P0" |
| **ADD** | "**OS-158** Owner \| preview the texts and the payment page callers see \| I know what my callers receive \| Ph 1 \| P2" |
| 4.2 table | **DELETE the row "On / On, either rule".** Rename the last row's first cell to "On / On". |
| 4.3 step 5 | **EDIT:** "If the 15 minutes pass unpaid, the order is cancelled with the reason 'Payment link expired' and the caller is told by text, unless the owner turned on a fallback (see OS-155 and OS-156)." |
| 4.6 | **DELETE** the whole section ("Paying on the call or after the call"). |
| 6F | **DELETE criteria 11 and 12.** **EDIT 2:** "…When both are on, cash is allowed only when both are met." **EDIT 4:** the 4.2 table has four rows. **ADD:** "17. An order unpaid at 15 minutes is cancelled by default. The pickup and delivery fallbacks are off by default. The delivery fallback only applies to an order that meets both cash rules." |
| EC-08, EC-09 | **EDIT:** add "unless the owner turned on the matching fallback". |
| EC-27 | **DELETE** (on-the-call). |
| EC-33 | **EDIT:** replace "Payserv create-payment-link API" with "online payment setup". |

## 3G. Payment account and payouts

⚠ The heading **"3G. Payment account and payouts"** carries a comment.

| Story | Change |
|---|---|
| Intro line "This group depends on the Payserv flow…" | **DELETE** or replace with "Payments run through Stripe Connect from a US Stripe entity (see Ordering Payments · PRD)." |
| OS-081 | **EDIT:** "connect my Stripe payment account from Settings › Payments" |
| OS-082 | **EDIT:** add the status **Action needed** (Not connected, Verifying, Action needed, Connected). |
| OS-083 | Keep, but the prototype shows one account for the business. Decide whether per-outlet accounts are Phase 1. |
| OS-084 | **EDIT:** "open my Stripe dashboard from Tringg to see payouts, refunds and disputes". The payouts table is not built. |
| OS-124 | **EDIT:** replace "Payserv create-payment-link API" with "online payment setup" and remove [OPEN]. |
| 6G | **EDIT 1:** add Action needed. **EDIT 4:** same Payserv wording change. **ADD:** "5. Tringg shows no payouts table. A button opens the Stripe dashboard." |

## 3H. POS connection

⚠ The heading **"3H. POS connection"** and **OS-094** carry comments. You replied to both; resolve before editing.

- **PHASE 2** the whole group (OS-089 to OS-097), if you keep "no POS in Phase 1". The prototype keeps a POS screen (all outlets and single outlet) and does not use POS in the order flow.
- **ADD to 3H:** "POS connection is its own Settings screen, in the All outlets and single-outlet views. It is Owner only."
- Also update: EC-01 to EC-03 (POS cases) to Ph 2, 6E criteria 4 and 6, 4.4 (see below).

## 3I. New outlets and copying settings

- OS-098: keep (empty state with "Set up ordering" and "Copy from another outlet").
- OS-100, 101 (choose which settings to copy, review before saving): **not in the prototype**. Keep as P2.
- ⚠ **Mismatch:** OS-103 and EC-23 say the delivery area is never copied. The prototype's "Copy from another outlet" **does copy the zones**. Either fix the prototype or change the PRD. I recommend fixing the prototype (see the last section).

## 3J. Taxes

⚠ The heading **"6J. Taxes"** carries a comment.

- **EDIT the intro** "Where taxes are configured is still being decided…" to: "Taxes are configured in Settings › Ordering (step 4 of the checklist), not in Menu. Owner only. Delivery fees are not taxes or charges here: they are set per zone."
- OS-104: **EDIT:** "see Taxes as a checklist step that opens Settings › Ordering at the Taxes card".
- OS-105: keep.
- **ADD** "OS-159 Owner \| be unable to add a delivery fee as a charge in Taxes \| the fee is set only per zone \| Ph 1 \| P1".
- Close **open item 5**.

## 3K. Permissions

- **OS-107 (Manager):** **EDIT:** remove "ordering hours and cut-off" → "ordering hours", and remove "the menu link and texts". The Manager at assigned outlets can: start taking orders, turn ordering off and on, pause ordering or one service, edit pickup & delivery, ordering hours, pre-orders, large orders and auto-accept. The Manager cannot open Taxes, Payments, POS, or Subscribe.
- **ADD:** "Staff see Pickup & delivery and Ordering hours, view only."
- 6J/6K criterion 2: same edit as OS-107.

## 3L. Menu link and customer texts

⚠ The heading **"3L. Menu link and customer texts"** carries a comment.

**PHASE 2 for the whole section** (decision: removed from Phase 1):
- Mark OS-111 to OS-118 as Ph 2.
- **DELETE** assumption 15.
- Mark EC-28, EC-29, EC-30 as Ph 2.
- **DELETE** the words "the menu link and texts" from OS-107, from the manager criterion in 6J/6K, and from the checklist (OS-116).
- 6L: mark all criteria Ph 2.
- OS-117 (copy the menu link with settings): Ph 2.

## 3M. Large orders

No change. The prototype has an on/off switch and an amount per outlet.

## 4. User story and behaviour

| Section | Change |
|---|---|
| 4.1 | **EDIT steps 2 to 6:** "2. Onboarding step 2 asks the first ordering settings. 3. After go live the owner lands on the Overview. The checklist (Menu, Pickup & delivery, Ordering hours, Taxes, Payments, Turn on ordering) shows in the left menu for the selected outlet. 4. The owner opens a step, completes it, and the next step is marked. 5. When the first five steps are done, **Start taking orders** becomes available. 6. The last step opens Agents. Switching Ordering on asks the owner to subscribe if the account is not subscribed. When done the outlet is Live and the checklist disappears. 7. (unchanged)" |
| 4.2 | See 3F. |
| 4.3 | See 3F. |
| 4.4 | **EDIT first bullet:** "**Phase 1: no POS.** Auto-accept is one setting for all outlets, on by default, with per-outlet exceptions. With auto-accept off, staff accept or decline each order." Mark the POS bullets **Phase 2**. |
| 4.5 | See 3C. Add: "Special dates stay in Hours & booking." |
| 4.6 | **DELETE.** |
| **ADD 4.9** | "**Subscribe.** If the account is not subscribed, Orders and Reservations show a Subscribe prompt, and Agents shows a banner. The owner subscribes from there or by switching Ordering on in Agents. The confirmation shows outlets × $350 a month. On subscribing, the agent becomes active and ordering switches on." |
| **ADD 4.10** | "**Draw a delivery zone.** The owner opens Edit delivery area and clicks the map to place corners (at least 3), then Finish zone, and sets its name, colour, minimum, time and charge. Corners can be dragged afterwards. Up to 5 zones. Save delivery area keeps the changes; Cancel restores the previous area." |

## 5. Edge cases

| ID | Change |
|---|---|
| EC-01 | **EDIT:** "The owner does not want auto-accept at an outlet → adds an exception for that outlet (or turns it off for all), and staff accept or decline each order there." |
| EC-02, EC-03 | **PHASE 2** (POS). |
| EC-08, EC-09 | See 3F. |
| EC-17 | **DELETE** (cut-off). |
| EC-18, EC-19 | Keep the wording. The prototype blocks "Start taking orders" with these messages. |
| EC-22 | Extend: also Taxes and POS for Manager and Staff. |
| EC-24 | **EDIT:** "In the All outlets view each outlet shows its status in the outlet table. Per-outlet settings are changed after selecting an outlet in the left menu." |
| EC-27 | **DELETE.** |
| EC-28 to EC-30 | **PHASE 2** (menu link). |
| EC-33 | See 3F. |
| **ADD EC-43** | "An owner tries to add a sixth delivery zone → blocked. 'Up to 5 zones per outlet'." |
| **ADD EC-44** | "An owner cancels the delivery area editor → the area is exactly as before the editor was opened." |
| **ADD EC-45** | "The account is not subscribed → Orders and Reservations show the Subscribe prompt. Ordering cannot be switched on until the owner subscribes." |
| **ADD EC-46** | "All checklist steps are done but the account is not subscribed → the outlet shows 'Subscribe to go live' and the agent does not take orders." |
| **ADD EC-47** | "An owner removes the last zone or leaves the radius or charge empty and saves → blocked ('Draw at least one zone' or 'Add the radius and the delivery charge')." |

## 6. Acceptance criteria

| Section | Change |
|---|---|
| 6A | **EDIT 1:** "The checklist box appears in the left menu for a selected outlet that is not fully set up. It can be minimised to a ring showing the steps left. It does not appear in the All outlets view." **EDIT 2:** list the six steps. **EDIT 3:** "disabled until Menu, Ordering hours, Taxes and Payments are Done and the pickup and delivery settings are valid." **ADD 9:** "The Overview is the landing page after onboarding." **ADD 10:** "An outlet shows 'Taking orders' only when the account is subscribed and ordering is on." |
| 6B | **DELETE 4** (address checker). **EDIT 6:** "Pickup and delivery settings are edited on the Ordering page for the selected outlet." **ADD 8:** "At most 5 zones per outlet." **ADD 9:** "Each service can be paused on its own." |
| 6C | **DELETE 2** (cut-off). **ADD 6:** "Rows for pickup and delivery hours appear only for services that are switched on." |
| 6E | **Replace the whole table** with the one you pasted (1, 1A, 2, 3, 3A, 5, 7, 8, 9) after fixing its heading ("## 3. Section 6E, acceptance criteria" is a paste leftover) and **DELETE the old rows 1, 3, 4, 6**. Mark the POS rows (old 4 and 6) Ph 2. |
| 6F, 6G | See 3F and 3G. |
| 6L | Phase 2. |
| **ADD 6N** | "Subscription: 1. Orders and Reservations show a Subscribe prompt when not subscribed. 2. Agents shows a banner. 3. Turning Ordering on without a subscription opens the Subscribe confirmation. 4. The confirmation shows outlets × $350 a month and that nothing is billed until the owner subscribes. 5. Subscribing makes the agent active and switches ordering on." |

## 7. Success metrics

- **DELETE** "Pay on the call vs after".
- **ADD:** "Onboarding ordering answers: share of owners who give ordering settings in step 2", "Time from onboarding to subscription", "Subscribe conversion at the Orders and Agents prompts".
- Keep the rest.

## Open items

1. **Payserv flow.** ⚠ This text carries a comment. After you reply, **replace with:** "Payments run through Stripe Connect from a US entity (closed)." Then delete.
2. **COD rules default** → closed: both rules must be met.
3. **POS vendors in Phase 1** → change to "POS is Phase 2; first vendor Square".
4. Pre-order: unchanged.
5. **Taxes** → closed (in Settings › Ordering).
6. **Payment account and commission** → closed (restaurant pays the card fee; no per-order cut; flat subscription).
7. Large orders item limit: unchanged.
8. **ADD:** "India and the UK payment providers (the US Stripe entity does not cover them)." "Separate Stripe integration document: reuse of the existing LimeTray Stripe or payment setup, credentials and sandbox." "Per-outlet payment account (OS-083): Phase 1 or later." "Per-outlet override of the pickup payment option: not decided."

---

## Comments that would be detached by an edit (resolve first)

| Where | Comment is about |
|---|---|
| OS-047 text "see an Auto-accept switch in the ordering controls for each outlet" | Auto-accept thread (you replied) |
| Heading 3H | POS journey (you replied) |
| OS-094 text "have orders that could not reach the POS held and retried…" | POS held orders (you replied "Okay") |
| Heading 6B | Pickup and delivery (no reply yet) |
| Heading 3L | Menu link (no reply yet) |
| Heading 3C | Ordering hours rework (no reply yet) |
| OS-036 text "set a last-order cut-off in minutes before closing" | Last-order cut-off (no reply yet) |
| Heading 3F | Payments journey (you replied with the Payments PRD) |
| Heading 3G | Payment account (you replied) |
| Heading 6J | Taxes (no reply yet) |
| Open item 1 "Payserv flow. Akhilesh to agree…" | Payserv (no reply yet) |

The three page-level comments (cohesive journey, ordering hours vs outlet hours, "different for ordering" conflict) are not anchored to text and are not affected.

## Prototype and PRD disagree: decide before the stress test

1. **Copy from another outlet copies the delivery area**, but OS-103 and EC-23 say it must not. (Fix the prototype.)
2. **Not built in the prototype, but in the PRD:** pickup instructions (OS-016), apply settings to several outlets (OS-031), choose which settings to copy (OS-100, 101), pre-order ready windows (OS-134), per-outlet payment accounts (OS-083), the Payments PRD's SMS-failure paths, a "Needs reconnecting" POS status.
3. **Built in the prototype, but not in the PRD:** per-service pause, five-zone limit, zone colours and names, onboarding ordering row, subscription prompts, the outlet status table in All outlets.
4. **Other Confluence pages to check for the same changes:** Ordering · Module PRDs (index), Ordering Orders (mentions the menu-link setting OR-110 and the POS order sync), Ordering Permissions · Owner, Manager, Staff, 08 - Payment (ordering voice E2E) (SMS-failure behaviour), and Ordering Payments · PRD (add subscription and the checklist step; it already has the rest).

---

# Update 27 Oct: changes from the 26 Oct Product & Tech MoM

Prototype changes since the list above. PRD edits to make by hand (nothing was changed in Confluence).

## 1. Ordering hours move into Outlet hours (3C, 6C, checklist)
- EDIT: "Hours & booking" is renamed **Outlet hours** everywhere (3A, 4.1, nav text, other PRDs that link to it).
- EDIT 3C / 6C: Ordering hours is no longer a card on the Ordering page and no longer a checklist step. It is a card inside **Settings > Outlet hours** (single outlet only). Default "Same as opening hours"; the owner can switch to "Different for pickup or delivery".
- ADD (advanced, collapsed by default): day-by-day ordering hours (empty = follow the hours above, toggle a day off), and **special dates and closures for ordering** (no orders all day, or different hours). This answers the MoM line "Special dates: different for ordering".
- EDIT: checklist is now Menu, Pickup & delivery, Taxes, Payments, Turn on ordering (5 steps, was 6). Any "6 steps" or "step 3 Ordering hours" wording changes.
- EDIT: the card is greyed out when Ordering is not selected for the restaurant.

## 2. Choose services: Reservations, Ordering or both (3A, 4.1, onboarding)
- ADD: onboarding step 3 is **"What should the agent handle?"** with two large selectable cards, **both selected by default**; at least one must stay selected. The ordering questions (pickup, delivery) move here from the Verify step. Reservation rules show only if Reservations is selected; ordering answers only if Ordering is selected.
- ADD: Review and Go-live screens follow the choice (Services group; suggested test questions; "What's next" steps).
- ADD **Settings > Services** (owner only, in All outlets and single outlet): turn Reservations and Ordering on or off at any time. Settings are kept when one is turned off.
- ADD behaviour for a service that is off: its nav item shows an "Off" tag; its screen opens but is greyed out and not clickable, with a banner "Ordering/Reservations isn't turned on" and a **Turn on** button (owner) or "Ask the owner" (others). Overview tiles and cards for that service are greyed. The Ordering settings and POS pages, the Ordering hours card and the Booking rules card are greyed. The setup checklist is hidden when Ordering is off.
- EDIT: Billing text points to Settings > Services (not Agents > Edit).
- Rule to confirm with product: reservations-only restaurants see the existing reservation experience; Orders and Ordering settings are visible but greyed.

## 3. My profile (new, all roles)
- ADD: a profile page opened from the avatar at the top right and from **My profile** in the account block at the bottom left of the navigation. Sections: personal details (name, mobile, email read-only, language), password and two-step verification, notifications (email and text per alert; order and reservation alerts greyed when that service is off), and "Your access" (role and outlets). Sign out is on the page.

## 4. Orders list filter (6G / orders screen)
- EDIT: the Orders list uses the same structure as Calls: card title and count, **status tabs with counts** (Needs approval, Awaiting payment, Active, Completed, Cancelled, All), a search box and a **Filter** button. The Fulfilment and Payment chips above the list are removed.
- ADD: the Filter panel holds the advanced options: Fulfilment (Pickup, Delivery), Payment (Online, On arrival), Outlet (All outlets view only), Only show Pre-orders / Refunded. The button shows how many filters are active; Reset and Done at the bottom.

## 5. Not built yet from the MoM (need a decision, see discussion)
- Payment settings per outlet; Overview customizable widget; the MoM decision "retain modals, no sidebar UI" (the delivery-area editor is full screen and the Edit agent panel is a side drawer); regional payment rollout (UAE first); entry price and premium plan.

## Update 27 Oct (2): empty state and "enquiries only"
- ADD (Overview, 4.1): when the account is **not subscribed** (just signed up), the Overview shows **no data**: a "Not active yet" card with Subscribe (and "Set up ordering · n/5" when Ordering is selected), tiles with "—", empty Pending requests, an agent card marked "Not active", and "No calls yet". Reservations, Orders and Calls already show only the Subscribe prompt. Navigation badges (pending counts) are hidden until subscribed.
- ADD (greyed services): tiles and cards for a service that is off show "—" placeholders, never real figures.
- ADD (Services): **both services can be unselected**. Wording shown: "Enquiries only. The agent answers questions about your hours, location and FAQs, and passes other calls to your team. It doesn't take bookings or orders." Shown in onboarding step 3 (reservation and ordering settings hidden), Review ("Agent handles: Enquiries only"), Go-live next steps (subscribe, forward line), Settings > Services and the Overview banner (with a Change button for the owner).

---

# Update 28 Oct: multi-outlet services, outlet-level payments and taxes, checklist, menu (from the 26 Oct MoM)

## 1. Account menu (left navigation, bottom)
- EDIT 4.1: same as the launched product. Tapping the account block opens a card above it: avatar, name and email at the top (opens My profile), then Settings, then Sign out (red).

## 2. Setup checklist is dynamic
- EDIT: steps are Menu, Pickup & delivery, Taxes, Payments, and **Turn on ordering only while ordering is not on**. A restaurant that subscribed first, or already switched ordering on in Agents, does not see "Turn on ordering". Each step shows done from the data (published menu, taxes confirmed, payments connected, outlet service set). The checklist disappears when nothing is left.
- EDIT: the Ordering page outlet card no longer repeats the steps. It shows only the status ("Setup n of m", "Taking orders", "Paused"), the pause control and "Start taking orders".

## 3. Services are per outlet; agent capabilities follow (3A, 6A, 4.1)
- ADD: **Settings > Services** is a table in All outlets: one row per outlet, a toggle for Reservations and a toggle for Ordering, a column "The agent handles" (Enquiries is always on; "Enquiries only" when both are off), and "On for all / Off for all" shortcuts. In a single outlet the page shows two cards for that outlet.
- RULE: the agent's capabilities in Agents are derived from this page. A capability is on for the agent when at least one assigned outlet has it. The agent card shows "Reservations · on at 7 of 13 outlets" and "Ordering · on at 7 of 13 outlets"; the Edit agent panel shows the same counts with a link to Services. At call time the agent offers bookings or orders only for the outlet that was called, and answers enquiries everywhere else.
- RULE (All outlets view when outlets differ):
  - Navigation stays active if at least one outlet has the service.
  - Overview shows a strip: "Services differ by outlet. Reservations at 7 of 13 · Ordering at 7 of 13. Totals count only the outlets where each is on."
  - Orders and Reservations show only data from outlets where that service is on, with a banner "Ordering is on at 7 of 13 outlets" and a "By outlet" link.
  - The Ordering outlet table lists every outlet; outlets with ordering off are greyed with "Turn on". The checklist stays single-outlet only.
  - In a single outlet where the service is off, that outlet's screens are greyed out with a Turn on button (owner).
- EDIT: onboarding step 3 sets the starting choice for every outlet; Settings > Services changes it per outlet afterwards.

## 4. Payments can differ by outlet (3F, 3G, 6F)
- Model: **one default for all outlets plus exceptions**, the same pattern as auto-accept. The Stripe account is always shared.
- Single outlet: a row "This outlet" shows "Same as all outlets" with **Change for this outlet**, or "Different from all outlets" with **Match all outlets**. While the outlet follows the default, edits change the default for every outlet that follows it, and the row says how many. Overridable: pickup payment (Online, At pickup, Both) and the cash-on-delivery rules (order limit, repeat customers). Not overridable: Stripe account, expiry fallbacks, payment link text.
- All outlets: the Payments card shows the default and a table **Outlets that differ** (outlet, pickup payment, cash limit, Open, Match all). When empty it says "Every outlet follows these settings."

## 5. Taxes by outlet (3J, 6J)
- Taxes already apply to chosen outlets (set when a tax is edited). Single outlet: the card lists only taxes that apply there and says how many apply only at other outlets. All outlets: each tax shows its scope ("All outlets" or "n outlets") and a table **Taxes by outlet** (outlet, taxes that apply).

## 6. Menu changes from the MoM
- ADD import issues: a card listing items without an image and items without veg / non-veg, with **Fix here** (filters the list) and, when the menu comes from a POS, **Fix in {POS}**.
- ADD images: a thumbnail on every item row, with a dashed "No image" tile for quality checks. Voice ordering does not need images.
- EDIT filters: one **Filter** button next to search, same pattern as Orders and Calls. Status (All, Needs a check, Missing info, Out of stock, Popular) and Quality check (No image, Veg / non-veg not set).
- EDIT row actions: edit, duplicate and delete icons appear on hover, on keyboard focus and on a selected row (always visible on touch). **Duplicate asks for confirmation.** The unclear "OK" button on items that need a check is now **Fix** (opens the item).
- EDIT sizes and prices: column renamed "Sizes & prices"; the Choices column shows two add-on groups and "+n" for the rest (hover lists them).
- EDIT categories: drag and drop replaces move up / down, for the category list and for the numbered Voice highlights. The text explains that category order is the order the agent offers categories.
- EDIT: the duplicate "Category" button in the page header is removed; "Add category" stays under the category list.
- EDIT: **Slots tab is disabled** ("Slots · needs POS") until a POS is connected.
- EDIT: dietary options, allergens and "Allergens it adds" are removed from the item and option editors, and "allergens" is removed from the readiness rule. Rationale for the PRD: collecting them is manual work for every item and is deferred; the agent does not answer allergen or dietary questions in Phase 1 and hands those to the team.
- EDIT: stock availability stays a toggle in the list, outside the editor.
- DECISION applied: **no side panels**. The item, option, group, category, slot and tax editors and the Edit agent panel open as centred modals. The delivery-area editor stays full screen because it needs the map.
- Not changed (needs a decision): whether Modifiers stays a separate tab; the display of many add-on templates beyond the "+n" summary.
