---
target: agent workflow — homepage header (app/agent hero) + AgentConversation drawer
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
timestamp: 2026-07-30T10-30-35Z
slug: packages-marmiton-prototype-app-agent
---
Method: dual-agent (A: a83709bf2de6f5c1d · B: a8a56ccca53e5efaa)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No "agent is thinking" state between turns — fine for today's instant scripted classifier, will read as frozen the moment a real backend adds latency |
| 2 | Match System / Real World | 3 | Natural, warm French throughout; recommendation phrasing reads like a person |
| 3 | User Control and Freedom | 2 | No reset/"nouvelle recherche" inside the drawer once resolved — only escape is closing the whole drawer |
| 4 | Consistency and Standards | 2 | Same `ChipTag` renders both clickable quick-replies and static confirmation labels with zero visual differentiation; "Enfant difficile" (chip) vs "Adapté aux enfants" (confirmed label) — same concept, two labels |
| 5 | Error Prevention | 2 | No confirmation-of-understanding step before committing to a recommendation |
| 6 | Recognition Rather Than Recall | 3 | Suggestion chips reduce recall burden well for the first three turns |
| 7 | Flexibility and Efficiency | 1 | Chips vanish after turn 3; no shortcut once resolved besides "Voir la recette"; no "try another" affordance |
| 8 | Aesthetic and Minimalist Design | 2 | Recommendation card can stack up to 4 equal-weight banners (chip row, allergen warning, pantry match, tip) |
| 9 | Error Recovery | 2 | `not_understood` degrades gracefully; `relaxed` (dropped-constraint) fallback gets no card-level visual marker, only a text sentence above it |
| 10 | Help and Documentation | 2 | Never proactively discloses this is keyword-matching, not real NLU — only surfaces reactively after two failed clarifications |
| **Total** | | **21/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment**: Partially authored, partially generic. The hero is the strongest specific moment: the corail gradient, white heading with soft text-shadow, and floating pill composer with heavy shadow, reinforced by a time-aware greeting ("Bonjour, il est 14h32, on prépare à manger ?"), reads as a genuine "come talk to me" invitation that wouldn't survive being dropped into an unrelated product. Worth noting: the gradient is `--color-interactive-bg` → `--color-interactive-bg-subtle`, the same token pair presumably driving primary buttons elsewhere — so the "pop" hero is the existing interactive color stretched large, not a bespoke brand treatment, which is a fine trade-off but not free specificity.

The conversation drawer is more generic where it matters most. The brief's call to build a bespoke `chat-card` instead of reusing the catalog `RecipeCard` is right in principle — a recommendation justifying a choice already made is a different job than a catalog tile. But in execution, the payoff card is a stack of near-identical banners (chip row → allergen warning → pantry match → tip), sharing the same padding/font-size/icon-left layout, differentiated only by background hue — closer to a generic "form validation error list" than a purpose-built "here's tonight's dinner, and here's why" reveal. The climax of the whole flow doesn't feel more crafted than the composer leading into it.

**Deterministic scan**: `detect.mjs` ran clean (0 findings, exit 0) across `app/agent/page.tsx`, `app/agent/page.css`, `AgentConversation.tsx`, and `AgentConversation.css`, including a re-run with `--no-config` to rule out local suppression. No AI-slop patterns, no generic-template fingerprints flagged. No false positives to weigh — there was nothing to caveat.

**Visual overlays**: Unavailable this run. The Browser pane failed to composite frames (screenshot/navigate both denied) on both the orchestrator's own attempt and Assessment B's independent retry — a session-level limitation, not a one-off. No screenshots, console, or network evidence were collected for the hero, editorial grid, or open conversation drawer. Everything above is grounded in source/CSS reading only; the composition-level findings below (stacked banners, card layout) should be treated as high-confidence-but-visually-unverified until a working preview confirms them.

## Overall Impression

The hero does its job — it's warm, on-brand, and makes a real invitation to talk rather than search. The conversation logic (clarify → recommend → relaxed fallback → not-understood) is thoughtfully scoped and the BRIEF.md decisions behind the card's field selection (pantry gap, anti-fail tip, honest allergen disclosure, no price) are genuinely well-reasoned, not accidental omissions. The gap is that none of that careful *content* reasoning is backed by an equally careful *visual hierarchy* on the one screen that matters most — the recommendation card. Everything on it currently competes for the same attention, and the one moment where "confident match" and "compromise fallback" should look visibly different, they don't.

## What's Working

1. **Honest allergen disclosure over false confirmation** — when a constraint is `allergie`, the card shows the full ingredient allergen list instead of a misleading "matches ✓" chip. This is a deliberate, well-implemented trust decision, executed exactly as reasoned in BRIEF.md.
2. **Correct DS component selection at the structural level** — `Drawer` (not `Modal`) for the long scrollable thread matches `DESIGN.md` §3 exactly; `RecipeCard` stays correctly scoped to the catalog grid, keeping the bespoke `chat-card` out of the design system as documented.
3. **Screen-reader-conscious composer labeling** — the optional-chips row carries an `aria-label` explicitly telling assistive-tech users the chips are shortcuts, not the only path forward. A thoughtful touch most implementations skip.

## Priority Issues

**[P1] A "relaxed" (compromise) recommendation looks identical to a confident match**
- **Why it matters**: When the classifier can't satisfy the user's stated constraint, it silently drops it and recommends the closest alternative. The text above the card says so honestly, but the card itself — same layout, same chip styling minus one label — carries no visual marker that this is a compromise. A user skimming past small 14px agent-bubble text straight to the visually dominant card can easily miss that their constraint was dropped. For the `allergie` case specifically, this is no longer a cosmetic nit.
- **Fix**: Give the `relaxed` card state a distinct visual treatment — a leading label ("Le plus proche, sans cette contrainte"), a different border/background, or a small icon — so the compromise is legible from the card alone, not just from a sentence a user can scroll past.
- **Suggested command**: `/impeccable clarify`

**[P1] The entire recommendation card is one flat `<button>`, burying the allergen warning**
- **Why it matters**: Image, title, meta row, chips, allergen banner, pantry banner, and tip are all nested inside a single `<button onClick>`. A screen reader announces the whole thing as one undifferentiated accessible name — the safety-relevant "Contient : …" warning gets no distinct announcement priority from the star rating or the tip. There's also no `aria-live` region on the thread, so new agent turns aren't guaranteed to be announced as they arrive.
- **Fix**: Keep the card clickable for navigation, but pull the allergen block out of the button's flattened accessible name (e.g. `role="note"` with its own label, or a sibling live region), and add `aria-live="polite"` to the chat thread container.
- **Suggested command**: `/impeccable audit`

**[P1] `ChipTag` used identically for two incompatible affordances**
- **Why it matters**: The exact same `ChipTag type="toned" size="S"` renders both clickable quick-replies in the composer (has `onClick`) and static, non-interactive confirmation labels on the card (no `onClick`). Nothing visually distinguishes tappable from informational — across three consecutive turns (duration → servings → constraint), a user relying on "just tap the pills" has no visual cue which pills are live. Compounded by label drift: "Enfant difficile" (chip) vs. "Adapté aux enfants" (confirmed label) for the same concept.
- **Fix**: Give static card chips a non-affordance treatment (no hover/focus shell, or a plain styled span using the same tokens), or expose a `disabled`/`readOnly` state on `ChipTag` itself. Align the two "enfant" labels to one wording.
- **Suggested command**: `/impeccable layout`

**[P2] Up to four stacked banners with equal visual weight on one card**
- **Why it matters**: Chip row, allergen warning, pantry-match banner, and tip banner can all render simultaneously and share the same padding/font-size, differing only by background hue. Nothing on the card encodes the field-importance ranking the brief itself already worked out (constraint-match and duration should outrank pantry-gap and rating) — the highest-signal information doesn't read as more important than the lowest.
- **Fix**: Differentiate by size/weight — constraint chip and duration more prominent, pantry/tip secondary — or collapse pantry+tip into one lower-emphasis row.
- **Suggested command**: `/impeccable layout`

**[P2] Card image/meta composition likely reads as unresolved (pending visual verification)**
- **Why it matters**: `.chat-card__top` centers a 56px thumbnail and centers the meta block as a group, while the text inside that block stays left-aligned — a centered image over a left-justified-but-group-centered text block, on what should be the flow's payoff moment. Flagged with high confidence from CSS reading, but browser inspection was unavailable this run, so treat as needing visual confirmation before treating as certain.
- **Fix**: Go fully centered (center the meta text too) or fully left-aligned row layout (image left, text right). Verify against a screenshot once the preview environment is working.
- **Suggested command**: `/impeccable polish`

## Persona Red Flags

**Alex (time-pressured parent, per the hero's own framing)**: The hero's placeholder text ("j'ai du poulet, 25 minutes, un enfant difficile") is a perfectly tuned single-turn input that hits all three slots and skips clarification entirely. But that's the demo path — if Alex types the far more plausible "poulet" alone, he's walked through three *separate* sequential chip-tap turns (duration, then party size, then constraint) before any recommendation appears, for a persona whose entire framing is impatience. Combined with the P1 chip-consistency issue, Alex also can't immediately tell whether the "Adapté aux enfants" label on the resulting card is confirming the same thing he tapped moments earlier as "Enfant difficile."

**Jordan (screen reader / assistive tech)**: The P1 flat-button finding is Jordan's concrete failure — the entire card, including the allergen warning, is one `<button>` with a flattened accessible name. The single most safety-critical piece of information on the card is read no differently from the tip or the star rating, and there's no `aria-live` region guaranteeing new agent turns get announced at all.

**Casey (scans rather than reads, trusts the visual over the fine print)**: Casey's concrete failure is the `relaxed` fallback path. The text is honest, but Casey trusts the big, photogenic card more than a line of gray 14px bubble text above it — and the card looks exactly like a confident match minus one chip. Casey has to have already read and retained the caveat sentence to know the recommendation in front of them is a compromise, not a confirmed fit.

## Minor Observations

- No in-drawer "Recommencer" affordance once a recipe resolves — the only paths are "Voir la recette" or closing the whole drawer and re-triggering from the hero.
- `.chat-card__meta-row` allows up to 5 items to wrap (rating, duration, servings, difficulty, calories/protein) — a ragged multi-line meta block is possible under the centered thumbnail when several optional fields are all present at once.
- Drawer title is static ("Une idée pour ce soir") regardless of conversation state — doesn't distinguish "clarifying" from "here's your recommendation."
- No "agent is thinking" state between turns — invisible today since the classifier is instant, but will read as frozen the moment a real backend introduces latency.

## Questions to Consider

- If the recommendation card is meant to be the emotional payoff of the whole conversation, why does it currently share visual grammar — same chip component, same banner shape — with the clarification chips and degraded-state messaging that precede it?
- Given the brief already drew a hard line against a false constraint-confirmation chip, doesn't the same reasoning argue for a visible "compromise" marker on the `relaxed` card itself, not just in a sentence a user might skim past?
- The hero's placeholder is a perfectly-tuned single-turn input — has the far more common two-or-three-word opener ("poulet," "pâtes ce soir") been walked through end-to-end, or was the demo optimized around the one sentence everyone will type into the field first?
