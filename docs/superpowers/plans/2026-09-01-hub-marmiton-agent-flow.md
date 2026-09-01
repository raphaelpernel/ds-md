# Marmiton Agent Conversational Flow Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the standalone `/agent` conversational-agent page from `packages/marmiton-prototype` into the hub at `/marmiton/agent`, completing the second (and final, for now) half of the Marmiton recipe-purchase experience — the "Agent" card on the `/marmiton` gallery index already points at this route and currently 404s.

**Architecture:** Same copy-based migration pattern as the already-shipped `2026-09-01-hub-marmiton-recipe-funnel` plan: files are copied (never moved) from `packages/marmiton-prototype` into `packages/hub`, preserving relative folder structure so relative imports stay valid unchanged. The new page lands at `packages/hub/app/(client)/marmiton/(funnel)/agent/page.tsx` — a sibling of `recipe/page.tsx`, `cart/page.tsx`, etc. — so it inherits `CartProvider`/`Header`/`Footer` from the existing `(funnel)/layout.tsx` for free, with zero new routing/provider wiring. The agent's scripted conversation engine (`agentScript.ts`), its slot-filling logic, and the `RecipeAgentDrawer` foundation were already migrated in the recipe-funnel plan (Tasks 1–2) and are reused here unchanged.

**Tech Stack:** Next.js 16 App Router, React, TypeScript, `@mealz-product-team/design-system`, Vitest.

## Global Constraints

- Universal import rule: every `from '@/X'` import in migrated code becomes `from '@/features/marmiton-prototype/X'`. Relative imports, `@mealz-product-team/design-system/...` imports, and third-party imports (e.g. `@phosphor-icons/react`, `next/navigation`) are left untouched.
- `packages/marmiton-prototype/` must NEVER be modified — it stays independently deployable throughout and after this migration.
- Every internal navigation target (`router.push`, JSX `Link` hrefs, data-literal hrefs) that points at a bare marmiton-prototype route must be re-pointed to the `/marmiton`-prefixed hub route. In this plan the only such targets are `router.push('/recipe?recipe=...')` calls, which become `router.push('/marmiton/recipe?recipe=...')`.
- No `.stories.tsx` or `.test.ts(x)` files exist for any file in this migration's scope (verified) — none to migrate or skip.
- Page-level CSS is inlined as a `<style>{\`...\`}</style>` block at the end of the page's JSX, matching the established convention in `recipe/page.tsx` and `cart/page.tsx` (Next.js's per-route-group CSS chunking made a separate imported `page.css` file unreliable in earlier plan work — see that plan's "Errors and fixes"). Component-level CSS (co-located with a component under `components/`) keeps the source's plain relative `import './X.css'` side-effect import, matching `RecipeAgentDrawer.css` and every other migrated component.
- `agentScript.ts`, `recipeAskScript.ts`, `RecipeAgentDrawer.tsx`/`.css`, `data/types/recipe.ts`, `data/mock/recipes.ts`, `data/mock/products.ts`, and `context/CartContext.tsx` are already migrated (recipe-funnel plan) at their `packages/hub/src/features/marmiton-prototype/...` paths — do not re-copy them in this plan, only re-point imports to reference them there.

---

### Task 1: `AgentConversation` and `ChatCarousel` component group

**Files:**
- Create: `packages/hub/src/features/marmiton-prototype/components/agent/AgentConversation.tsx`
- Create: `packages/hub/src/features/marmiton-prototype/components/agent/AgentConversation.css`
- Create: `packages/hub/src/features/marmiton-prototype/components/agent/ChatCarousel.tsx`
- Create: `packages/hub/src/features/marmiton-prototype/components/agent/ChatCarousel.css`

Source: `packages/marmiton-prototype/src/components/agent/{AgentConversation,ChatCarousel}.{tsx,css}`.

**Interfaces:**
- Consumes: `agentScript.ts` exports (`EMPTY_SLOTS`, `processTurn`, `recommendationMessage`, `pantryMatch`, `avoidedIngredientMatch`, `selectTip`, `constraintLabels`, `selectCommunityQuote`, `isInSeason`, types `AgentSlots`/`PantryMatch`/`CommunityQuote`/`RecommendedRecipe`) from `@/features/marmiton-prototype/lib/agentScript` — already migrated, exports confirmed present. Consumes `Recipe`/`RecipeDifficulty` types from `@/features/marmiton-prototype/data/types/recipe` — already migrated.
- Produces: `AgentConversation` (named + default export, props `{ open: boolean; onClose: () => void; initialMessage: string }`) and `ChatCarousel` (named + default export, props `{ children: ReactNode }`) — consumed by Task 2's `agent/page.tsx`.

| File | Old import | New import |
|---|---|---|
| `AgentConversation.tsx` | `from '@/lib/agentScript'` | `from '@/features/marmiton-prototype/lib/agentScript'` |
| `AgentConversation.tsx` | `from '@/data/types/recipe'` | `from '@/features/marmiton-prototype/data/types/recipe'` |
| `AgentConversation.tsx` | `from './ChatCarousel'` | unchanged (relative) |
| `AgentConversation.tsx` | `import './AgentConversation.css'` | unchanged (relative) |
| `ChatCarousel.tsx` | `import './ChatCarousel.css'` | unchanged (relative) |

`ChatCarousel.tsx` has no `@/` imports at all (only `react`, `@phosphor-icons/react`, `@mealz-product-team/design-system`, and its own relative CSS) — copy verbatim, no import edits needed.

- [ ] **Step 1: Copy all 4 files**

```bash
mkdir -p "packages/hub/src/features/marmiton-prototype/components/agent"
cp "packages/marmiton-prototype/src/components/agent/AgentConversation.tsx" "packages/hub/src/features/marmiton-prototype/components/agent/AgentConversation.tsx"
cp "packages/marmiton-prototype/src/components/agent/AgentConversation.css" "packages/hub/src/features/marmiton-prototype/components/agent/AgentConversation.css"
cp "packages/marmiton-prototype/src/components/agent/ChatCarousel.tsx" "packages/hub/src/features/marmiton-prototype/components/agent/ChatCarousel.tsx"
cp "packages/marmiton-prototype/src/components/agent/ChatCarousel.css" "packages/hub/src/features/marmiton-prototype/components/agent/ChatCarousel.css"
```

Note: `packages/hub/src/features/marmiton-prototype/components/agent/` already exists (it holds the already-migrated `RecipeAgentDrawer.tsx`/`.css` from the recipe-funnel plan) — `mkdir -p` is a no-op there, and this task adds two new component pairs alongside it.

- [ ] **Step 2: Apply the 2 import edits in `AgentConversation.tsx`** (table above). `ChatCarousel.tsx` needs no edits — verify by reading it, don't skip the read.

- [ ] **Step 3: Verify**

Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit` — expect **no errors**. Unlike the recipe-funnel plan's staged component tasks, nothing in the hub imports these two components yet, so this task's type-check should be fully clean on its own (no "expected to still show downstream errors" caveat).

- [ ] **Step 4: Commit**

```bash
git add "packages/hub/src/features/marmiton-prototype/components/agent/AgentConversation.tsx" "packages/hub/src/features/marmiton-prototype/components/agent/AgentConversation.css" "packages/hub/src/features/marmiton-prototype/components/agent/ChatCarousel.tsx" "packages/hub/src/features/marmiton-prototype/components/agent/ChatCarousel.css"
git commit -m "feat(hub): copy AgentConversation and ChatCarousel"
```

---

### Task 2: `/marmiton/agent` page

**Files:**
- Create: `packages/hub/app/(client)/marmiton/(funnel)/agent/page.tsx`

Source: `packages/marmiton-prototype/app/agent/page.tsx` (content) + `packages/marmiton-prototype/app/agent/page.css` (styles, to be inlined per the Global Constraints CSS convention — do not create a separate `page.css` file).

**Interfaces:**
- Consumes: `AgentConversation` from Task 1's `@/features/marmiton-prototype/components/agent/AgentConversation`. Consumes `MOCK_RECIPES` from `@/features/marmiton-prototype/data/mock/recipes`, `getProductsByRecipe` from `@/features/marmiton-prototype/data/mock/products`, `useCart` from `@/features/marmiton-prototype/context/CartContext` — all already migrated.
- Produces: the `/marmiton/agent` route, already linked from `packages/hub/app/(client)/marmiton/page.tsx`'s gallery card (`href: '/marmiton/agent'`) — no changes needed there, it starts resolving as soon as this task lands.

| File | Old import/target | New import/target |
|---|---|---|
| `page.tsx` | `from '@/components/agent/AgentConversation'` | `from '@/features/marmiton-prototype/components/agent/AgentConversation'` |
| `page.tsx` | `from '@/data/mock/recipes'` | `from '@/features/marmiton-prototype/data/mock/recipes'` |
| `page.tsx` | `from '@/data/mock/products'` | `from '@/features/marmiton-prototype/data/mock/products'` |
| `page.tsx` | `from '@/context/CartContext'` | `from '@/features/marmiton-prototype/context/CartContext'` |
| `page.tsx` | `router.push(\`/recipe?recipe=${recipe.id}\`)` (editorial grid `RecipeCard onClick`) | `router.push(\`/marmiton/recipe?recipe=${recipe.id}\`)` |

The `import './page.css'` line must be removed entirely — its rules go into an inlined `<style>{\`...\`}</style>` block at the end of the page's JSX instead (read `packages/marmiton-prototype/app/agent/page.css` in full and transcribe its rules verbatim into the block, exactly as `recipe/page.tsx` and `cart/page.tsx` already do — do not paraphrase or drop any rule).

Also apply the identical `router.push('/recipe?recipe=...')` → `router.push('/marmiton/recipe?recipe=...')` re-point inside `AgentConversation.tsx`'s `goToRecipe` function (copied in Task 1) — this was missed from Task 1's table because it only becomes relevant once the page wiring in this task makes the drawer reachable, but it is the SAME re-point rule and must be applied to the file created in Task 1.

- [ ] **Step 1: Copy the page**

```bash
mkdir -p "packages/hub/app/(client)/marmiton/(funnel)/agent"
cp "packages/marmiton-prototype/app/agent/page.tsx" "packages/hub/app/(client)/marmiton/(funnel)/agent/page.tsx"
```

- [ ] **Step 2: Apply the import/navigation edits in `page.tsx`** (table above), inline `page.css`'s rules as a `<style>` block, remove the `import './page.css'` line, and apply the `goToRecipe` re-point in `AgentConversation.tsx` from Task 1.

- [ ] **Step 3: Verify**

Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit` — expect no errors.
Run: `pnpm --filter @mealz-product-team/hub build` — expect success. Confirm the route table now lists `/marmiton/agent` alongside the 7 funnel routes from the recipe-funnel plan.
Grep-check: `grep -rn "'/recipe?recipe" "packages/hub/app/(client)/marmiton/(funnel)/agent/page.tsx" "packages/hub/src/features/marmiton-prototype/components/agent/AgentConversation.tsx"` — expected: every match already carries the `/marmiton` prefix (no un-prefixed `/recipe?recipe=` left).

- [ ] **Step 4: Commit**

```bash
git add "packages/hub/app/(client)/marmiton/(funnel)/agent" "packages/hub/src/features/marmiton-prototype/components/agent/AgentConversation.tsx"
git commit -m "feat(hub): add /marmiton/agent page"
```

---

### Task 3: Full manual verification — click through the agent flow

**Files:** none (verification only).

- [ ] **Step 1: Run the automated test suite and type-check**

Run: `pnpm --filter @mealz-product-team/hub test` — expect the same 133 tests passing as before this plan (no new test files are introduced by this plan; this confirms zero regressions).
Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit` — expect no errors.
Run: `pnpm --filter @mealz-product-team/hub build` — expect success.

- [ ] **Step 2: Start the dev server**

Reuse `packages/hub/.env.local` (create if missing: `HUB_COOKIE_SECRET=test`, `HUB_PASSWORD_MASTER=test`, `HUB_PASSWORD_MARMITON=test`, `HUB_PASSWORD_COURSESU=test`).

- [ ] **Step 3: Walk the agent flow end-to-end in a master session**

Log in as master, visit `/marmiton`, click the "Agent" card (opens `/marmiton/agent` in a new tab). On the agent page:
- Confirm the hero section renders (time-of-day greeting, subtitle, composer) — NOT a 404.
- Confirm Marmiton's `Header`/`Footer` are visible (this page is inside `(funnel)`, same as `recipe`/`cart`/etc.).
- Confirm the editorial grid of `RecipeCard`s renders below the hero.
- Click a `RecipeCard`'s add-to-cart toggle, confirm it visually marks as added (no crash — this exercises the already-migrated `CartContext`/`getProductsByRecipe` wiring).
- Click a `RecipeCard`'s title/image (not the add-to-cart toggle), confirm it navigates to `/marmiton/recipe?recipe=<id>` (not `/recipe`, and not a 404).
- Go back to `/marmiton/agent`. Type a message into the hero composer (e.g. "un dîner rapide pour ce soir") and submit — confirm `AgentConversation` opens as a drawer with the typed message as the first turn.
- Wait for the scripted "thinking" sequence to resolve — confirm it ends in a `ChatCarousel` of recipe cards (not stuck loading, not an error state).
- Confirm the carousel's left/right nav buttons appear/disappear correctly when scrolling (or are simply usable if all cards fit without scrolling).
- Click a card's "Voir la recette" button (or the card itself) — confirm it navigates to `/marmiton/recipe?recipe=<id>` (not `/recipe`).
- Click a suggestion chip if one is visible, confirm it populates/sends a message without crashing.

- [ ] **Step 4: Verify zero regression elsewhere**

Visit `/marmiton` again: confirm both Recipe and Agent cards are present and the gallery itself is unchanged (no Header/Footer leak). Spot-check `/marmiton/recipe` still works (recipe-funnel plan unaffected). Visit `/coursesu` and `/neutral`: confirm both are unchanged.

- [ ] **Step 5: Report results**

If every check in Steps 3–4 matches its expectation: DONE. If anything fails, note exactly which assertion failed and its actual output before fixing.
