# Ordering Settings PRD: changes for the Ordering controls rework

Target page: [Ordering Settings · PRD](https://limetray.atlassian.net/wiki/spaces/Tringg/pages/4789829645/Ordering+Settings+PRD).
Matches the prototype's Ordering controls screen (`prototype/tringg-ordering.html`, setting `ord-controls`).
Answers Puneet's open thread on OS-047 (16 Oct). The inline comment is not touched here.

**Anchored text.** The OS-047 phrase "see an Auto-accept switch in the ordering controls for each outlet" carries Puneet's comment. Editing it would unanchor the comment, so it stays as is until the thread is resolved. The "So that" cell of OS-047 gets a pointer to OS-047A instead.

## 1. Section 1, assumption 7

Before:
> Auto-accept lives on the Tringg dashboard. It is the owner's choice, with a default that depends on whether a POS is connected. When a POS disconnects, auto-accept switches off, and the owner can switch it on again.

After:
> Auto-accept lives on the Tringg dashboard. It is one account-wide setting, on by default, and an outlet that needs something different gets an exception. In phase 1 there is no POS, so every order is accepted or approved on the dashboard. POS behaviour is covered in 3H and returns with the POS phase.

## 2. Section 3E, stories

| ID | As a… | I want to… | So that… | Ph | Pri |
|---|---|---|---|---|---|
| OS-047 (edit "So that" only) | Owner | *(unchanged)* | I choose how orders reach my team. *Superseded for the control's scope by OS-047A.* | Ph 1 | **P0** |
| **OS-047A** (new) | Owner | see one **Auto-accept** switch for all outlets in the ordering controls, on by default | I set it once and it applies everywhere | Ph 1 | **P0** |
| **OS-047B** (new) | Owner | add an exception for an outlet that needs the opposite setting, and remove it again | one outlet can differ without me setting every outlet | Ph 1 | **P0** |
| **OS-047C** (new) | Owner | see a short explanation at the top of the screen of how orders are handled, with no POS wording | I understand what the controls do before I change them | Ph 1 | **P1** |
| OS-048 (replace) | Owner | have auto-accept on by default | every phone order reaches my dashboard, because there is nowhere else for it to go in phase 1 | Ph 1 | **P0** |
| OS-049 (edit) | Owner | turn auto-accept off for all outlets or for one outlet | my staff review each order and accept or decline it themselves | Ph 1 | **P0** |
| **OS-049A** (new) | Owner | set the time to accept (5, 10 or 15 minutes) only where auto-accept is off | orders nobody acts on expire, and the setting is not shown when it does nothing | Ph 1 | **P1** |
| OS-056 (replace) | Owner with several outlets | change auto-accept for all outlets with one switch | I do not repeat the change for each outlet | Ph 1 | **P0** |
| **OS-057A** (new) | Caller | change or cancel my order on a call-back **before** the outlet accepts it | I can fix a mistake | Ph 1 | **P0** |
| **OS-057B** (new) | Caller | have the agent flag a **Cancellation requested** on an accepted order and transfer me to the store (or give me its number) | the outlet, which has the order, decides | Ph 1 | **P0** |
| **OS-057C** (new) | Staff | see **Cancellation requested** on the order and cancel it, usually while preparation has not started | I can stop food that is not made yet | Ph 1 | **P1** |
| **OS-057D** (new) | Owner | have a paid order refunded from the order when the outlet cancels it (whole order or single items) | the caller gets their money back | Ph 1 | **P0** |

Stories OS-053 and OS-054 mention a POS. They stay, but are marked "POS phase" until the POS journey (3H) is reworked.

## 3. Section 6E, acceptance criteria

| # | Criterion |
|---|---|
| 1 | Auto-accept is one setting for all outlets and is on by default. |
| 1A | An outlet can be given an exception that is the opposite of the main setting. The exception can be removed. |
| 2 | With auto-accept on, a placed order moves straight to Accepted with no approval step. |
| 3 | With auto-accept off, staff can accept or decline each placed order. An order nobody acts on expires. Only pay-at-pickup orders wait for approval, so there is nothing to refund. Orders paid on the call are accepted when paid. |
| 3A | Time to accept (5, 10 or 15 minutes) is shown only when at least one outlet has auto-accept off. |
| 5 | Changing auto-accept affects new orders only. |
| 7 (new) | Before acceptance the agent can change or cancel the order on a call-back. |
| 8 (new) | After acceptance the agent cannot change or cancel the order. It flags **Cancellation requested** on the order and transfers the caller to the store, or gives the store number. |
| 9 (new) | The outlet decides on a cancellation request. A paid order is refunded only when the outlet cancels it, from Refund on the order. |

Criteria 4 and 6 are about the POS and wait for the POS rework.

## 4. Edge case EC-01

Before: "No POS is connected and the owner does not want auto-accept → The owner turns auto-accept off and staff accept or decline each order manually."

After: "The owner does not want auto-accept at an outlet → The owner adds an exception for that outlet (or turns it off for all outlets), and staff accept or decline each order there."

## 5. Section 3E title

Rename "3E. Order acceptance and auto-accept" to "3E. Order acceptance, auto-accept and cancellation requests", and 6E to match.

## Not changed

- No "Suggestions" story exists in the PRD, so nothing to remove there.
- The cancellation-request flag and "Cancel" action on the order screen are not in the prototype yet (the Orders screen is out of scope for this change).
- Open for you: whether staff can also cancel after preparation starts (OS-057C says "usually while preparation has not started").
