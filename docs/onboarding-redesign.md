# Onboarding redesign: audit and new flow

Prototype: `prototype/onboarding.html` (open in a browser; no build step). Covers sign up → Discover → Verify → Reservation → Meet your agent → Review → Go live → Live.

Scope note: the audit is based on five screenshots (Discover input, research progress, brand form, outlet picker, outlet detail). Steps 3–6 were inferred from the sidebar labels, so the Reservation, Agent, Review and Go live screens are a proposal to be checked against the real screens once shared.

## 1. Why it doesn't feel like an AI product

The current flow is a **form wizard with an AI feature inside it**. An AI-native flow makes the AI the thing the user watches and talks to. Four root causes:

| # | Finding | Evidence | Effect |
|---|---|---|---|
| 1 | **The AI is invisible.** Research is a generic progress card with ticks. Nothing the user can inspect or react to appears until the end. | Screen 2 | Feels like loading, not intelligence |
| 2 | **It asks for what it could infer.** After "Search complete, FOUND", Cuisine is empty, Description is empty, Country needs a dropdown. | Screen 3 | Contradicts "I'll pull the rest automatically" |
| 3 | **Data trust is broken.** The user searched for ABC \| Aladdin (Bengaluru) and the outlet detail shows *Music Café, Bhubaneswar*. | Screens 4–5 | One wrong record ends trust in the whole flow. Likely a stale state or fetch bug; needs an engineering check. |
| 4 | **Heavy chrome, no sense of progress.** A 330px black sidebar of 6 steps, with inactive steps near-invisible (about 1.3:1 contrast) and wide letter-spaced captions. | All screens | Looks like an admin console. Wastes 20% of the width. |
| 5 | **Dead ends with no explanation.** Disabled Continue with no reason. Two tabs (Name Search / Web URL) make the user pick a method before they've started. | Screens 1, 5 | Friction and doubt |
| 6 | **Visual inconsistency.** The brand name flips to a bold italic serif on screens 2–3. Cuisine and Country fields don't line up. The map screen is dense with a drag-pin instruction in warning orange. | Screens 2, 3, 5 | Reads as unfinished |

## 2. Design principles applied

1. **One question per screen.** One big input, one decision. (The ChatGPT Ads onboarding works this way: one task, generous space.)
2. **Minimal surface, intelligent behaviour.** White space, hairlines and type only: no sidebar, cards, gradients or dark panels. The AI feel comes from behaviour. The agent speaks its headings (typed out in first person), shows a quiet log of what it is reading, and the user can type any question into the test call.
3. **Pre-fill, then confirm.** Everything inferable is filled (cuisine, description, hours, FAQs). The user edits only what's wrong.
4. **Prove it, don't claim it.** The Review step is a chat with the agent. Free-text questions are answered from the user's own setup (hours, FAQs, booking rules), and unknown questions get the honest fallback "I'll take your number and have the team call back".
5. **Say why something is disabled.** Every disabled primary button has a reason beside it.
6. **Presets before parameters.** Reservation rules start as three styles, with steppers underneath and a plain-English readback of what callers will hear.

## 3. Structure change

| Today | Proposed |
|---|---|
| Sign up form | One headline, Google or email |
| Name Search / Web URL tabs, "Can't find it?" | One field. A pasted URL is auto-detected. Manual entry stays as a quiet link. |
| Generic progress card | Quiet research log: each finding appears as the agent completes it |
| Separate brand form + outlet picker + outlet detail (3 screens) | One **Verify** screen as settings-style rows: Restaurant, Location, Hours, Answers. Inline edit. |
| Black sidebar with 6 steps | 2px progress line and "Step 2 of 6 · Verify", same six step names |
| Reservation rules form | Three presets + three steppers + spoken readback |
| "Meet your agent" | Tap-to-hear voices, name, languages, editable greeting |
| Review checklist | Chat with the agent (typed or suggested questions) |
| Go live | Number + copy, "when should she answer" (missed calls vs every call), dial code, confirm checkbox, celebration + next steps |

## 4. Not in the prototype (recommendations)

- Real voice samples instead of browser speech synthesis. The prototype uses `speechSynthesis` so it works anywhere, but real samples are needed for the actual feel.
- Autosave and resume ("Welcome back, pick up at Verify"). State is in memory only here.
- Multi-outlet chains: Verify shows one outlet. Chains need a checklist-with-select-all variant and per-outlet hours.
- Verification of call forwarding by placing a real test call, instead of a self-reported checkbox.
- Ordering setup after Go live (see `docs/maple-ordering-analysis.md`): "Add your menu" on the final screen is the entry point.
- Measure: time to first test call, drop-off per step, and % of users who edit pre-filled data (the signal for how good the research is).

## 5. Visual language (matches production Tringg)

Warm canvas `#F2F1ED`, white 20px cards with hairline border, Poppins, the chunky mint Tringg wordmark, black 12px buttons with a chevron, `01 · DISCOVER` step chip, uppercase tracked field labels, mint tags, and selected cards use a black border with an offset black shadow (as in the production outlet picker). Back / Continue sit in a floating white bar.

**Research step.** Avatar with radar rings and an orbiting dot, a continuous progress bar, source pills (Google Maps, website, reviews) that go active then done, a monospace "now reading" ticker that types the real snippet being read, a checklist whose ticks draw in with the finding fading in underneath, and summary tags on completion. The heading re-types itself when it finishes.
