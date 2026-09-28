# Menu import from third-party sources (free, legitimate)

_2026-09-28 · Question: when a merchant picks "DoorDash" (or another aggregator) in the menu import, can Tringg scrape that menu, or is there a legal and free way to get it?_

This isn't legal advice. Run the aggregator part past counsel before building anything that touches aggregator pages.

## Short answer

- **Server-side scraping of DoorDash, Uber Eats or Grubhub: don't.**
  - Their terms explicitly forbid automated access. DoorDash's reads: *"You may not use automated means to access or collect data from the DoorDash platform"*, and its developer terms prohibit "crawling, scraping or otherwise indexing information on the DoorDash Platform without prior written consent".
  - The pages sit behind bot protection. Keeping a scraper alive needs paid proxies or unblocker services, so it isn't free in practice.
  - It breaks every time the page changes.
- **Official aggregator APIs exist, but not for us yet.** Uber Eats has `GET /v2/eats/stores/{store_id}/menus` (OAuth `eats.store` scope). DoorDash has a Marketplace menu API. Both are free to call, but only for **approved integration partners**, and Uber notes that uses beyond order fulfilment "may require an aligned business agreement". This is a partnership track, not something we can switch on now. Stream is another path, since it holds these relationships.
- **Three routes are free, legal and buildable now.** They cover most merchants.

## The import waterfall to build

Try each source in order and stop at the first one that returns a usable menu. Every path ends in the **review screen that already exists** in the prototype (confidence per item, flags, then Publish).

| # | Source | How | Legal basis | Cost | Quality |
|---|---|---|---|---|---|
| 1 | **Google Business Profile menu** | `accounts.locations.getFoodMenus` (GBP API v4). OAuth with the `business.manage` scope, which **Tringg onboarding already asks for** to import restaurant info from GBP. | The merchant's own listing, pulled with the merchant's permission through Google's official API | Free (API quota) | Structured: sections, items, prices, allergens, spiciness. Only there if the merchant keeps a structured menu on Google. |
| 2 | **Merchant's own website / ordering page** | The merchant pastes the URL and ticks "this is my restaurant's site". We fetch the page, read the `schema.org` `Menu → MenuSection → MenuItem` JSON-LD if it's there, and otherwise have the LLM extract from the HTML text. | The merchant's own content, with the merchant's consent. Respect `robots.txt`: one fetch, not a crawl. | Free fetch + a small LLM cost | Good when JSON-LD exists; fair from HTML |
| 3 | **Photos / PDF of any menu, including the merchant's DoorDash page** | The merchant uploads photos, a PDF, or **"Save as PDF"** / screenshots of their own DoorDash store page or Merchant Portal menu. We run the existing OCR + LLM extraction. | The merchant supplies their own menu. No automated access to DoorDash by Tringg. | Small LLM/OCR cost | Good for items and prices. Modifiers need review. |
| 4 | **POS** (direct or via Stream) | Already designed | Official APIs | — | Best |

### What happens when the merchant picks "DoorDash / Uber Eats / Grubhub"

The prototype's "Import from another platform" option should change from paste-a-link to this:

1. The merchant picks DoorDash.
2. Tringg explains: *"We can't read DoorDash for you. Open your DoorDash store page or Merchant Portal menu, save it as a PDF (or take screenshots), and drop it here. It takes about a minute."* A 3-step GIF shows how.
3. The upload goes through the photo/PDF extractor and then the review screen, with the source labelled "DoorDash (uploaded)".
4. Prices get a warning: *"Delivery-app prices often include a markup. Set your phone prices."* A single "reduce all prices by X%" action handles it.

That keeps the merchant's experience close to one click, and Tringg never touches DoorDash's servers.

### Options considered and rejected (for now)

| Option | Why not |
|---|---|
| Server-side scraper of aggregator pages | Breaks their terms. Needs paid proxies to beat bot protection. Brittle. Reputational risk with DoorDash/Uber, whom LimeTray partners with. |
| Paid scraping APIs (Apify, scraping vendors) | Not free, and the same terms problem, just outsourced |
| Browser extension that reads the merchant's own logged-in DoorDash page | Technically neat and uses the merchant's own session. But the merchant's DoorDash terms also bar "automated means", so it still needs a legal opinion. Park it for phase 2 if the PDF route has too much friction. |

## Legal background (US)

- **Anti-hacking law (CFAA):** *hiQ v. LinkedIn* (9th Cir. 2022) and *Van Buren* narrowed it. Scraping **public, logged-out** data is generally not "unauthorised access".
- **Terms of service:** *Meta v. Bright Data* (N.D. Cal. 2024) found Meta's terms didn't bind logged-out scraping, but only because of how Meta's terms were worded. Meta then changed its terms to cover logged-out collection. DoorDash's wording already covers all automated access, so a **breach-of-contract** claim is the real risk, along with IP blocking and the business relationship.
- **Copyright:** menu facts (item names, prices) aren't copyrightable. Descriptions and **photos** can be. Photos shot by the aggregator's photographers may not even belong to the merchant. **Don't import photos from aggregator pages.**

## Build plan

1. **GBP menu pull (quick win).** Onboarding already connects GBP. Add a `getFoodMenus` call and map `FoodMenuSection` and `FoodMenuItem` to the Menu Builder. First check the location's `canHaveFoodMenus` flag. Show "Found 42 items on your Google profile" as the first suggestion in Menu › Add menu.
2. **Website import.** One fetch per merchant-submitted URL, with a user agent that identifies Tringg and a `robots.txt` check. Parse JSON-LD first and fall back to LLM extraction from the HTML text. Store the source URL and time for traceability.
3. **Aggregator = guided upload.** Reuse the photo/PDF extractor. Add a platform label, the markup warning and the bulk price adjustment.
4. **Common review step.** Confidence per item, duplicate detection, modifier suggestions (such as sizes becoming a required "Size" choice) and allergen prompts, as in the prototype.
5. **Later:** the Uber Eats / DoorDash partner programme, or Stream, for true menu sync.

## Sources
- DoorDash: [Developer terms](https://developer.doordash.com/en-US/terms/v2/1/) · [Dasher deactivation policy (scraping clause)](https://help.doordash.com/en-us/dashers/article/deactivation-policy-us-english-dx) · [ToS;DR case: no automated access](https://edit.tosdr.org/cases/150)
- Uber Eats: [Get menu endpoint](https://developer.uber.com/docs/eats/references/api/v2/get-eats-stores-storeid-menu) · [Marketplace API intro](https://developer.uber.com/docs/eats/introduction)
- Google: [getFoodMenus](https://developers.google.com/my-business/reference/rest/v4/accounts.locations/getFoodMenus) · [FoodMenus](https://developers.google.com/my-business/reference/rest/v4/FoodMenus) · [Update food menus guide](https://developers.google.com/my-business/content/update-food-menus)
- Schema.org: [Menu](https://schema.org/Menu) · [MenuItem](https://schema.org/MenuItem)
- Case law: [Quinn Emanuel on Meta v. Bright Data](https://www.quinnemanuel.com/the-firm/news-events/client-alert-meta-v-bright-data-significant-decision-for-web-scraping-industry/) · [Zyte on the Meta ruling](https://www.zyte.com/blog/california-court-meta-ruling/)
