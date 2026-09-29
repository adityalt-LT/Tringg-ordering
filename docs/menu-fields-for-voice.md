# Menu fields for voice ordering: LimeTray vs Maple vs what Allie needs

_2026-09-29 · Input: LimeTray Menu Manager v5 prototype (`tringg_menu_manager_v5.html`), Maple docs (docs.maple.inc, via search snippets) and the Tringg ordering flow._

**The test used for each field:** does Allie need it to take the order correctly, to answer a caller's question, or to decide what can be sold right now? If not, it stays off the Tringg dashboard. It can still live in the LimeTray menu.

## Decisions

| Field | LimeTray v5 | Maple | Voice need | Tringg dashboard |
|---|---|---|---|---|
| Category (name, description, order) | ✓ (+ image, type, parent) | ✓ | "What pizzas do you have?" Order = the order Allie lists things | **Keep** name, description and order. Drop image and type. |
| Item name | ✓ internal + display | ✓ | Critical | **Keep** one name |
| **Spoken names** ("pep", "marg") | — | — | Callers rarely say the menu name | **New:** "Also called" |
| Description | ✓ | ✓ (menu intelligence) | "What's on it?" | **Keep.** Flagged if empty. |
| Variants / sizes | ✓ (Regular / Double) | via POS modifier (Size) | Allie must ask the size | **Keep** as "Sizes". Auto-generates the size question. |
| Price per variant × channel × store group | ✓ (store groups) | ✓ from POS | Allie reads totals | **Keep, simplified:** a price per size, an optional different delivery price, and per-outlet overrides in that outlet's view |
| Modifier groups (compulsory, min, max) | ✓ | ✓ (POS min 1 = required) | Drives every question Allie asks | **Keep** + a "What Allie says" preview. Warn when no max is set. |
| Modifier options + extra price | ✓ (per store group) | ✓ | Totals | **Keep** option + extra price + in stock |
| Upsell suggestions | ✓ (multi) | ✓ | One suggestion per order | **Keep** as a single "Suggest with" |
| Veg / non-veg | ✓ | — | "Is it vegetarian?" | **Keep** as dietary tags: Vegetarian, Vegan, Gluten-free option, Spicy, Contains alcohol |
| Allergens (9) | ✓ | handled in conversation | Safety question | **Keep.** "No allergens" is an explicit choice, so an empty value is visible. |
| Meat type | ✓ | — | Covered by the description and dietary tags | **Drop** |
| Goods / services | ✓ | — | None | **Drop** |
| Nutrition (≈20 fields), additives, recipe, serves, prep time | ✓ per variant | — | Rarely asked; calorie questions can go in the description or FAQ | **Drop** from Tringg |
| Product / modifier image | ✓ | — | None for voice | **Drop** (kept in LimeTray) |
| Store availability (store picker) | ✓ | per location | What each outlet sells | **Keep** as "Sold at" per outlet |
| Channels (delivery / pickup) | ✓ | ✓ | Alcohol pickup-only, etc. | **Keep** per item |
| Slots (days, intervals, stores, channels, products) | ✓ | menu hours | No breakfast at 8 PM | **Keep** as "Ordering hours" windows |
| On / Off per store, staged publish | ✓ | 86 real-time (POS or dashboard) | Stop selling now | **Keep** + "back at" timing. Staged publish for all live edits. |
| Taxes & charges | ✓ | in totals | Totals read back | **Keep** |
| **Popular** flag | — | — | "What's good here?" | **New** |
| **Readiness check** | — | test calls | Stops Allie selling items she can't describe | **New:** % ready, filter "Missing info" |
| **Import confidence** | — | — | Imports are imperfect | **New:** "Needs a check" flags in the draft |

## Structural decisions

1. **The menu is built at brand level (All outlets).** Outlets decide what they sell, their stock and any price overrides. In a single-outlet view, the Menu page shows only Items (sold here, price here), Availability and Ordering hours. This matches LimeTray's brand menu plus store pickers.
2. **Imports become an editable draft, not a separate review screen.** Items with low confidence are flagged "Needs a check". The merchant can edit, delete, add or bulk-confirm before publishing, or publish straight away. Unchecked items stay hidden from Allie until someone confirms them.
3. **Staged publishing.** Every change to a live menu is queued ("N unpublished changes · Discard · Publish"), so a half-finished edit never reaches a caller. This extends LimeTray's On / Off pattern to the whole menu.
4. **POS-synced menus.** Name, sizes, prices and choices are read-only in Tringg (edit them in the POS). Description, spoken names, allergens, dietary tags, Popular and Suggest-with stay editable in Tringg.
5. **One "Connect your POS".** The merchant picks a POS and approves it in that POS's sign-in. Stream runs the connection behind the scenes, and the UI doesn't split POS into direct and Stream.
6. **The website import has no ownership checkbox and no aggregator warning** (per review feedback).

## What the prototype now covers (Menu, All outlets view)

- **Items:**
  - categories: add, rename, reorder, delete (with a choice to move the items elsewhere)
  - item table with a readiness score and filters (All / Needs a check / Missing info / Popular)
  - search, including spoken names
  - bulk select: move, confirm, delete
  - per-row actions: edit, duplicate, delete
- **Item editor:**
  - basics and spoken names
  - sizes and prices (optional delivery price)
  - choices (attach, reorder, detach, create a new group inline)
  - dietary tags and allergens
  - where and when it's sold (outlets, channels, ordering hours)
  - suggest-with
  - a "How Allie offers it" preview
  - delete
- **Modifiers:** groups with rule, "What Allie says", options with extra price and stock, the items that use each group; create, edit and delete.
- **Ordering hours:** windows with days, time ranges, outlets and channels; create, edit and delete.
- **Availability:** per-outlet stock with All on / All off, "back at" timing and modifier options.
- **Taxes & charges:** create, edit, delete.
- **Sources:** the current source, plus importing into a live menu (it creates a draft).
