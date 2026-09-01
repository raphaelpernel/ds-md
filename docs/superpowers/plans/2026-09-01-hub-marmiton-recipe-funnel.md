# Hub Marmiton Recipe Funnel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the real recipe purchase funnel (recipe → cart → login → store → slot → payment → confirmation) from `packages/marmiton-prototype` into the hub, under `/marmiton/*`, using the `(funnel)` route group already created (has `CartProvider`/`Header`/`Footer`).

**Architecture:** ~62 files (7 pages + ~15 component groups + 2 shared logic modules + 1 asset) move from `packages/marmiton-prototype/{app,src}` into `packages/hub/{app/(client)/marmiton/(funnel),src/features/marmiton-prototype}`, preserving the exact same relative folder structure they already have — this is what lets every relative import (`./Sibling`, `../../../data/types/x`) stay valid unchanged. The only imports that ever need editing are `@/`-prefixed ones (the tsconfig alias resolves differently in the hub than in `marmiton-prototype`): every `from '@/X'` becomes `from '@/features/marmiton-prototype/X'`. `marmiton-prototype` itself is never modified — every file is a copy, exactly as in the two prior plans.

Two files in the source tree are genuinely unused (confirmed via repo-wide grep: nothing imports them) and are deliberately **not** migrated: `Cart/CartSuggestions.tsx` and `PromoBanner` — don't recreate dead code.

**Tech Stack:** Next.js 16, React 19, TypeScript. No new automated tests for the copied UI (consistent with Plans 1 and 2's convention), **except** `agentScript.ts`/`recipeAskScript.ts`, which already have substantial existing test suites in the source — those tests are copied verbatim along with the code, giving real coverage for free.

## Global Constraints

- `packages/marmiton-prototype` is never modified or deleted — every file here is a **copy**.
- **The one universal edit rule:** any line `import ... from '@/something'` becomes `import ... from '@/features/marmiton-prototype/something'`. Relative imports (`./`, `../`), `@mealz-product-team/design-system` imports, and `@phosphor-icons/react` imports are **never** touched.
- Every page being migrated currently has its own `import '@mealz-product-team/design-system/styles/index.css'` line (needed when `marmiton-prototype` was a standalone app with its own root layout). The hub's root layout (`packages/hub/app/layout.tsx`) already imports this globally once — **remove this line from every migrated page**, it's redundant in the hub.
- Every hardcoded internal navigation target in the 7 pages must be re-pointed from root-relative (`/recipe`, `/cart`, `/login`, `/store`, `/slot`, `/payment`, `/confirmation`) to `/marmiton`-prefixed. Task 10 lists every occurrence explicitly — treat that list as ground truth.
- Never import from the design-system barrel in a Server Component. Not directly relevant here — every file in this plan is `'use client'` (they all use hooks/context) — but stated for completeness.
- Follow the spec: [`docs/superpowers/specs/2026-09-01-hub-multi-client-design.md`](../specs/2026-09-01-hub-multi-client-design.md) and [`packages/marmiton-prototype/docs/BRIEF.md`](../../../packages/marmiton-prototype/docs/BRIEF.md).

---

## File Structure

```
packages/hub/
  public/
    img/
      tarteabricot.jpg                                  # new — one recipe references this local asset
  src/
    features/marmiton-prototype/
      lib/
        agentScript.ts                                  # new — shared with the future agent-flow plan
        agentScript.test.ts
        recipeAskScript.ts
        recipeAskScript.test.ts
      components/
        agent/
          RecipeAgentDrawer.tsx                          # new — NOT the full agent/ folder (AgentConversation.tsx, ChatCarousel.tsx are a later plan)
          RecipeAgentDrawer.css
        product/
          RecipeAskBar/{RecipeAskBar.tsx,.css}
          RecipeIngredientWidget/{RecipeIngredientWidget,IngredientCard,RecipeOrderBanner}.{tsx,css}
          Cart/{Cart,CartSection,CartCompleteBasket,CartFooter,CartSummary}.{tsx,css}
          Cart/{CartAIBanner,CartAIPrompt,CartAIPromptSuggestions,CartAIChatModal,CartAisles,CartAisleView}.{tsx,css}
          ProductCard/{ProductCard.tsx,.css}              # .stories.tsx NOT migrated — no Storybook in the hub
          PromoSection/{PromoSection.tsx,.css}             # .stories.tsx NOT migrated
          StoreLocator/{StoreLocator,StoreCard}.{tsx,css}
          TimeslotPicker/{TimeslotPicker.tsx,.css}
          CarrefourLogin/{CarrefourLoginModal.tsx,.css}
          Checkout/{OrderConfirmation,OrderRecap,PaymentForm}.{tsx,css}
  app/(client)/marmiton/(funnel)/
    recipe/page.tsx                                       # new
    cart/page.tsx                                          # new
    login/page.tsx                                         # new
    store/page.tsx                                         # new
    slot/page.tsx                                           # new
    payment/page.tsx                                        # new
    confirmation/page.tsx                                    # new
```

`(funnel)/layout.tsx` (CartProvider + Header + Footer) already exists — created alongside the gallery-index restructuring, before this plan.

---

### Task 1: Shared agent-adjacent logic — `agentScript.ts` + `recipeAskScript.ts`

**Files:**
- Create: `packages/hub/src/features/marmiton-prototype/lib/agentScript.ts`
- Create: `packages/hub/src/features/marmiton-prototype/lib/agentScript.test.ts`
- Create: `packages/hub/src/features/marmiton-prototype/lib/recipeAskScript.ts`
- Create: `packages/hub/src/features/marmiton-prototype/lib/recipeAskScript.test.ts`

**Interfaces:**
- Produces: `EMPTY_SLOTS`, `AgentSlots` (type) from `agentScript.ts`; `answerRecipeAsk`, `buildRecipeChips`, `RecipeAskAnswer` (type), `RecipeChip` (type) from `recipeAskScript.ts` — consumed by Task 2 (`RecipeAskBar`, `RecipeAgentDrawer`) and Task 10 (`recipe/page.tsx`). A future plan (the full agent conversational flow) also builds on `agentScript.ts`.

Source: `packages/marmiton-prototype/src/lib/{agentScript,recipeAskScript}.ts` and their `__tests__/` counterparts. These are pure logic files with **no `@/` imports** (verified: they only import from `./` siblings or `../data/types/*`), so they need zero edits — a verbatim copy, same as Plan 1's data/types task.

- [ ] **Step 1: Copy the two logic files and their tests**

```bash
mkdir -p packages/hub/src/features/marmiton-prototype/lib
cp packages/marmiton-prototype/src/lib/agentScript.ts packages/hub/src/features/marmiton-prototype/lib/agentScript.ts
cp packages/marmiton-prototype/src/lib/recipeAskScript.ts packages/hub/src/features/marmiton-prototype/lib/recipeAskScript.ts
cp packages/marmiton-prototype/src/lib/__tests__/agentScript.test.ts packages/hub/src/features/marmiton-prototype/lib/agentScript.test.ts
cp packages/marmiton-prototype/src/lib/__tests__/recipeAskScript.test.ts packages/hub/src/features/marmiton-prototype/lib/recipeAskScript.test.ts
```

Note the test files move up one level (out of `__tests__/`, next to their subject) — this matches the convention every other test file in `packages/hub` already follows (e.g. `src/lib/auth/token.test.ts` sits next to `token.ts`, not in a `__tests__/` subfolder). Check the copied test files' own `import` lines: if they import their subject via a relative path like `'../agentScript'` (accounting for the old `__tests__/` nesting), fix it to `'./agentScript'` now that the test sits next to its subject. Read the file first to see which form it actually uses before assuming.

- [ ] **Step 2: Verify the logic files need no edits, and run the copied tests**

Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit` — expect no errors.
Run: `pnpm --filter @mealz-product-team/hub test agentScript` — expect all tests from `agentScript.test.ts` passing.
Run: `pnpm --filter @mealz-product-team/hub test recipeAskScript` — expect all tests from `recipeAskScript.test.ts` passing.

- [ ] **Step 3: Commit**

```bash
git add packages/hub/src/features/marmiton-prototype/lib
git commit -m "feat(hub): copy agentScript and recipeAskScript (+ existing tests)"
```

---

### Task 2: `RecipeAskBar` + `RecipeAgentDrawer`

**Files:**
- Create: `packages/hub/src/features/marmiton-prototype/components/product/RecipeAskBar/{RecipeAskBar.tsx,RecipeAskBar.css}`
- Create: `packages/hub/src/features/marmiton-prototype/components/agent/{RecipeAgentDrawer.tsx,RecipeAgentDrawer.css}`

**Interfaces:**
- Produces: `RecipeAskBar`, `RecipeAgentDrawer` — consumed by Task 10 (`recipe/page.tsx`).
- Consumes: `EMPTY_SLOTS`, `AgentSlots`, `answerRecipeAsk`, `RecipeAskAnswer`, `RecipeChip` (Task 1).

Source: `packages/marmiton-prototype/src/components/product/RecipeAskBar/` and `packages/marmiton-prototype/src/components/agent/RecipeAgentDrawer.{tsx,css}` (do **not** copy `AgentConversation.tsx`/`.css` or `ChatCarousel.tsx`/`.css` from that same `agent/` folder — those belong to a later plan for the full conversational flow; only `RecipeAgentDrawer` is needed here).

- [ ] **Step 1: Copy the CSS files unchanged**

```bash
mkdir -p packages/hub/src/features/marmiton-prototype/components/product/RecipeAskBar
mkdir -p packages/hub/src/features/marmiton-prototype/components/agent
cp packages/marmiton-prototype/src/components/product/RecipeAskBar/RecipeAskBar.css packages/hub/src/features/marmiton-prototype/components/product/RecipeAskBar/RecipeAskBar.css
cp packages/marmiton-prototype/src/components/agent/RecipeAgentDrawer.css packages/hub/src/features/marmiton-prototype/components/agent/RecipeAgentDrawer.css
```

- [ ] **Step 2: Copy `RecipeAskBar.tsx` and `RecipeAgentDrawer.tsx`, apply the universal `@/` fix**

```bash
cp packages/marmiton-prototype/src/components/product/RecipeAskBar/RecipeAskBar.tsx packages/hub/src/features/marmiton-prototype/components/product/RecipeAskBar/RecipeAskBar.tsx
cp packages/marmiton-prototype/src/components/agent/RecipeAgentDrawer.tsx packages/hub/src/features/marmiton-prototype/components/agent/RecipeAgentDrawer.tsx
```

Read each copied file and apply the Global Constraints' universal rule: every `from '@/...'` import becomes `from '@/features/marmiton-prototype/...'`. `RecipeAgentDrawer.tsx` has 4 such imports (`@/lib/agentScript` ×2 lines — value + type — `@/lib/recipeAskScript` ×2 lines, `@/data/types/recipe`). `RecipeAskBar.tsx`: check its own imports directly (read the file — do not assume the count, verify).

- [ ] **Step 3: Verify**

Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit` — expect no errors (this will fail if any `@/` import was missed or `@/data/types/recipe` doesn't resolve — it should, since Plan 1's Task 2 already copied `data/types/recipe.ts`).
Grep-check no stale imports remain: `grep -rn "from '@/lib\|from '@/data" packages/hub/src/features/marmiton-prototype/components/product/RecipeAskBar packages/hub/src/features/marmiton-prototype/components/agent` — expected: no matches (everything should now say `@/features/marmiton-prototype/...`).

- [ ] **Step 4: Commit**

```bash
git add packages/hub/src/features/marmiton-prototype/components/product/RecipeAskBar packages/hub/src/features/marmiton-prototype/components/agent
git commit -m "feat(hub): copy RecipeAskBar and RecipeAgentDrawer"
```

---

### Task 3: `RecipeIngredientWidget` group

**Files:**
- Create: `packages/hub/src/features/marmiton-prototype/components/product/RecipeIngredientWidget/{RecipeIngredientWidget,IngredientCard,RecipeOrderBanner}.{tsx,css}`

**Interfaces:**
- Produces: `RecipeIngredientWidget`, `ViewMode` (type), `ViewToggle`, `IngredientCard`, `RecipeOrderBanner` — consumed by Task 10 (`recipe/page.tsx`).

`IngredientCard.tsx` imports `ViewMode` from `'./RecipeIngredientWidget'` (relative, unchanged). `RecipeIngredientWidget.tsx` imports `IngredientCard` from `'./IngredientCard'` (relative, unchanged).

- [ ] **Step 1: Copy all 6 files**

```bash
mkdir -p packages/hub/src/features/marmiton-prototype/components/product/RecipeIngredientWidget
cp packages/marmiton-prototype/src/components/product/RecipeIngredientWidget/*.tsx packages/marmiton-prototype/src/components/product/RecipeIngredientWidget/*.css packages/hub/src/features/marmiton-prototype/components/product/RecipeIngredientWidget/
```

- [ ] **Step 2: Apply the universal `@/` fix**

Read each `.tsx` file and fix any `from '@/...'` import to `from '@/features/marmiton-prototype/...'`.

- [ ] **Step 3: Verify**

Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit` — expect no errors.
Grep-check: `grep -rn "from '@/" packages/hub/src/features/marmiton-prototype/components/product/RecipeIngredientWidget | grep -v "@/features/marmiton-prototype"` — expected: no matches.

- [ ] **Step 4: Commit**

```bash
git add packages/hub/src/features/marmiton-prototype/components/product/RecipeIngredientWidget
git commit -m "feat(hub): copy RecipeIngredientWidget group"
```

---

### Task 4: Cart core group

**Files:**
- Create: `packages/hub/src/features/marmiton-prototype/components/product/Cart/{Cart,CartSection,CartCompleteBasket,CartFooter,CartSummary}.{tsx,css}`

**Interfaces:**
- Produces: `Cart`, `CartSection`, `CartCompleteBasket`, `CartFooter`, `CartSummary` — `Cart` and `CartFooter` are consumed directly by Task 10's pages (`recipe`, `cart`); `CartSection`/`CartCompleteBasket`/`CartSummary` are consumed internally by `Cart`/`cart page` and by Task 5's AI-assist group.
- Consumes: `useCart` (already in the hub from Plan 1's `CartContext` copy), `ProductCard` (Task 6), `PromoSection` (Task 6).

`Cart.tsx` imports `CartSection`/`CartCompleteBasket` via relative paths (unchanged). `CartCompleteBasket.tsx` imports Task 5's AI components (`CartAIBanner`, `CartAIPromptSuggestions`, `CartAisles`, `CartAisleView`, `CartAIChatModal`) via relative paths — those don't exist yet at this point in the plan (Task 5 comes after), so `tsc --noEmit` **will fail after this task alone** — that's expected, don't try to fix it; Task 5 resolves it. Do the type-check verification for this task with that caveat in mind (see Step 3).

- [ ] **Step 1: Copy all 10 files**

```bash
mkdir -p packages/hub/src/features/marmiton-prototype/components/product/Cart
for f in Cart CartSection CartCompleteBasket CartFooter CartSummary; do
  cp "packages/marmiton-prototype/src/components/product/Cart/$f.tsx" "packages/hub/src/features/marmiton-prototype/components/product/Cart/$f.tsx"
  cp "packages/marmiton-prototype/src/components/product/Cart/$f.css" "packages/hub/src/features/marmiton-prototype/components/product/Cart/$f.css"
done
```

- [ ] **Step 2: Apply the universal `@/` fix**

Read each `.tsx` file and fix any `from '@/...'` import to `from '@/features/marmiton-prototype/...'`.

- [ ] **Step 3: Verify what can be verified yet**

Run: `grep -rn "from '@/" packages/hub/src/features/marmiton-prototype/components/product/Cart/{Cart,CartSection,CartCompleteBasket,CartFooter,CartSummary}.tsx | grep -v "@/features/marmiton-prototype"` — expected: no matches.

Do **not** run `tsc --noEmit` expecting a clean pass yet — `CartCompleteBasket.tsx` references `./CartAIBanner` etc. which Task 5 adds. If you want to sanity-check syntax only, note `tsc` will report missing-module errors for those specific relative imports and that is expected at this point — don't attempt to stub or work around it.

- [ ] **Step 4: Commit**

```bash
git add packages/hub/src/features/marmiton-prototype/components/product/Cart/{Cart,CartSection,CartCompleteBasket,CartFooter,CartSummary}.tsx packages/hub/src/features/marmiton-prototype/components/product/Cart/{Cart,CartSection,CartCompleteBasket,CartFooter,CartSummary}.css
git commit -m "feat(hub): copy Cart core group (depends on Task 5 for full type-check)"
```

---

### Task 5: Cart AI-assist group

**Files:**
- Create: `packages/hub/src/features/marmiton-prototype/components/product/Cart/{CartAIBanner,CartAIPrompt,CartAIPromptSuggestions,CartAIChatModal,CartAisles,CartAisleView}.{tsx,css}`

**Interfaces:**
- Produces: `CartAIBanner`, `CartAIPrompt`, `CartAIPromptSuggestions`, `CartAIChatModal` (+ `ChatTurn`, `ChatTurnType` types), `CartAisles`, `CartAisleView` — consumed by Task 4's `CartCompleteBasket` (already committed, references these via relative imports).
- Consumes: `ProductCard` (Task 6).

`CartAIBanner.tsx` and `CartAIChatModal.tsx` both import `CartAIPrompt` via `'./CartAIPrompt'` (relative, unchanged).

- [ ] **Step 1: Copy all 12 files**

```bash
for f in CartAIBanner CartAIPrompt CartAIPromptSuggestions CartAIChatModal CartAisles CartAisleView; do
  cp "packages/marmiton-prototype/src/components/product/Cart/$f.tsx" "packages/hub/src/features/marmiton-prototype/components/product/Cart/$f.tsx"
  cp "packages/marmiton-prototype/src/components/product/Cart/$f.css" "packages/hub/src/features/marmiton-prototype/components/product/Cart/$f.css"
done
```

- [ ] **Step 2: Apply the universal `@/` fix**

Read each `.tsx` file and fix any `from '@/...'` import to `from '@/features/marmiton-prototype/...'`.

- [ ] **Step 3: Verify — this is where the full Cart group's type-check must pass**

Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit` — expect no errors now that all of `Cart/` is present (this validates both this task's files and Task 4's `CartCompleteBasket` import chain together). If this still fails, check whether `ProductCard` (Task 6) needs to exist first — if so, report BLOCKED with the exact error rather than reordering tasks yourself.

- [ ] **Step 4: Commit**

```bash
git add packages/hub/src/features/marmiton-prototype/components/product/Cart/{CartAIBanner,CartAIPrompt,CartAIPromptSuggestions,CartAIChatModal,CartAisles,CartAisleView}.tsx packages/hub/src/features/marmiton-prototype/components/product/Cart/{CartAIBanner,CartAIPrompt,CartAIPromptSuggestions,CartAIChatModal,CartAisles,CartAisleView}.css
git commit -m "feat(hub): copy Cart AI-assist group, completing the Cart component tree"
```

---

### Task 6: `ProductCard` + `PromoSection`

**Files:**
- Create: `packages/hub/src/features/marmiton-prototype/components/product/ProductCard/{ProductCard.tsx,ProductCard.css}`
- Create: `packages/hub/src/features/marmiton-prototype/components/product/PromoSection/{PromoSection.tsx,PromoSection.css}`

**Interfaces:**
- Produces: `ProductCard`, `PromoSection` — consumed by Task 4/5's Cart components (`CartSection`, `CartCompleteBasket`, `CartAisleView`, `CartAIChatModal`).

Do **not** copy `ProductCard.stories.tsx` or `PromoSection.stories.tsx` — no Storybook is configured in the hub, these files would be dead weight.

`ProductCard.tsx` imports `Product` via a **relative** path: `'../../../data/types/product'` (not `@/`) — this stays valid unchanged only if the destination preserves the exact same nesting depth (`components/product/ProductCard/` → up 3 levels → `data/types/product`), which it does as long as you copy into `src/features/marmiton-prototype/components/product/ProductCard/` exactly. Do not "fix" this import — it does not need fixing, verify it resolves instead.

- [ ] **Step 1: Copy the 4 files (not the `.stories.tsx` files)**

```bash
mkdir -p packages/hub/src/features/marmiton-prototype/components/product/ProductCard
mkdir -p packages/hub/src/features/marmiton-prototype/components/product/PromoSection
cp packages/marmiton-prototype/src/components/product/ProductCard/ProductCard.tsx packages/hub/src/features/marmiton-prototype/components/product/ProductCard/ProductCard.tsx
cp packages/marmiton-prototype/src/components/product/ProductCard/ProductCard.css packages/hub/src/features/marmiton-prototype/components/product/ProductCard/ProductCard.css
cp packages/marmiton-prototype/src/components/product/PromoSection/PromoSection.tsx packages/hub/src/features/marmiton-prototype/components/product/PromoSection/PromoSection.tsx
cp packages/marmiton-prototype/src/components/product/PromoSection/PromoSection.css packages/hub/src/features/marmiton-prototype/components/product/PromoSection/PromoSection.css
```

- [ ] **Step 2: Apply the universal `@/` fix**

`ProductCard.tsx` has one `@/` import: `from '@/context/CartContext'` → `from '@/features/marmiton-prototype/context/CartContext'`. Check `PromoSection.tsx` for any `@/` imports directly (read the file, don't assume).

- [ ] **Step 3: Verify**

Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit` — expect no errors (this should now be fully clean, including the Cart tree from Tasks 4-5).

- [ ] **Step 4: Commit**

```bash
git add packages/hub/src/features/marmiton-prototype/components/product/ProductCard packages/hub/src/features/marmiton-prototype/components/product/PromoSection
git commit -m "feat(hub): copy ProductCard and PromoSection"
```

---

### Task 7: `StoreLocator` + `TimeslotPicker` + `CarrefourLogin`

**Files:**
- Create: `packages/hub/src/features/marmiton-prototype/components/product/StoreLocator/{StoreLocator,StoreCard}.{tsx,css}`
- Create: `packages/hub/src/features/marmiton-prototype/components/product/TimeslotPicker/{TimeslotPicker.tsx,TimeslotPicker.css}`
- Create: `packages/hub/src/features/marmiton-prototype/components/product/CarrefourLogin/{CarrefourLoginModal.tsx,CarrefourLoginModal.css}`

**Interfaces:**
- Produces: `StoreLocator`, `StoreCard`, `TimeslotPicker`, `CarrefourLoginModal` — consumed by Task 11's pages (`store`, `slot`, `cart`, `login`).

`StoreLocator.tsx` imports `StoreCard` via `'./StoreCard'` (relative, unchanged).

- [ ] **Step 1: Copy all 8 files**

```bash
mkdir -p packages/hub/src/features/marmiton-prototype/components/product/StoreLocator
mkdir -p packages/hub/src/features/marmiton-prototype/components/product/TimeslotPicker
mkdir -p packages/hub/src/features/marmiton-prototype/components/product/CarrefourLogin
cp packages/marmiton-prototype/src/components/product/StoreLocator/*.tsx packages/marmiton-prototype/src/components/product/StoreLocator/*.css packages/hub/src/features/marmiton-prototype/components/product/StoreLocator/
cp packages/marmiton-prototype/src/components/product/TimeslotPicker/*.tsx packages/marmiton-prototype/src/components/product/TimeslotPicker/*.css packages/hub/src/features/marmiton-prototype/components/product/TimeslotPicker/
cp packages/marmiton-prototype/src/components/product/CarrefourLogin/*.tsx packages/marmiton-prototype/src/components/product/CarrefourLogin/*.css packages/hub/src/features/marmiton-prototype/components/product/CarrefourLogin/
```

- [ ] **Step 2: Apply the universal `@/` fix**

Read each `.tsx` file and fix any `from '@/...'` import to `from '@/features/marmiton-prototype/...'`.

- [ ] **Step 3: Verify**

Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit` — expect no errors.
Grep-check: `grep -rln "from '@/" packages/hub/src/features/marmiton-prototype/components/product/{StoreLocator,TimeslotPicker,CarrefourLogin} | xargs grep -n "from '@/" | grep -v "@/features/marmiton-prototype"` — expected: no matches.

- [ ] **Step 4: Commit**

```bash
git add packages/hub/src/features/marmiton-prototype/components/product/StoreLocator packages/hub/src/features/marmiton-prototype/components/product/TimeslotPicker packages/hub/src/features/marmiton-prototype/components/product/CarrefourLogin
git commit -m "feat(hub): copy StoreLocator, TimeslotPicker, CarrefourLogin"
```

---

### Task 8: `Checkout` group

**Files:**
- Create: `packages/hub/src/features/marmiton-prototype/components/product/Checkout/{OrderConfirmation,OrderRecap,PaymentForm}.{tsx,css}`

**Interfaces:**
- Produces: `OrderConfirmation`, `OrderRecap`, `PaymentForm` — consumed by Task 11's `payment`/`confirmation` pages.

These three don't import each other — each is self-contained plus whatever `@/` imports it has.

- [ ] **Step 1: Copy all 6 files**

```bash
mkdir -p packages/hub/src/features/marmiton-prototype/components/product/Checkout
cp packages/marmiton-prototype/src/components/product/Checkout/*.tsx packages/marmiton-prototype/src/components/product/Checkout/*.css packages/hub/src/features/marmiton-prototype/components/product/Checkout/
```

- [ ] **Step 2: Apply the universal `@/` fix**

Read each `.tsx` file and fix any `from '@/...'` import to `from '@/features/marmiton-prototype/...'`.

- [ ] **Step 3: Verify**

Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit` — expect no errors. This should now be a fully clean type-check across every component group in this plan.

- [ ] **Step 4: Commit**

```bash
git add packages/hub/src/features/marmiton-prototype/components/product/Checkout
git commit -m "feat(hub): copy Checkout group (OrderConfirmation, OrderRecap, PaymentForm)"
```

---

### Task 9: Copy the recipe image asset

**Files:**
- Create: `packages/hub/public/img/tarteabricot.jpg`

**Interfaces:** None — a static asset. One recipe in the already-migrated mock data (`recipes.ts`, copied in Plan 1) references `imageUrl: '/img/tarteabricot.jpg'`; every other recipe uses an external `placehold.co` URL needing no local asset. `proxy.ts`'s matcher already excludes `img/` (added pre-emptively during Plan 1's final review specifically for this file) — verify that's still true, don't re-add it.

- [ ] **Step 1: Copy the file**

```bash
mkdir -p packages/hub/public/img
cp packages/marmiton-prototype/public/img/tarteabricot.jpg packages/hub/public/img/tarteabricot.jpg
```

- [ ] **Step 2: Verify**

Run: `diff packages/marmiton-prototype/public/img/tarteabricot.jpg packages/hub/public/img/tarteabricot.jpg` — expected: no output (identical).
Confirm `packages/hub/proxy.ts`'s `config.matcher` already contains `img/` in its exclusion list (added in a prior plan) — read the file, don't assume; if it's somehow missing, report BLOCKED rather than editing security-relevant routing code in what should be an asset-copy task.

- [ ] **Step 3: Commit**

```bash
git add packages/hub/public/img/tarteabricot.jpg
git commit -m "feat(hub): copy recipe image asset (tarteabricot.jpg)"
```

---

### Task 10: `recipe` and `cart` pages

**Files:**
- Create: `packages/hub/app/(client)/marmiton/(funnel)/recipe/page.tsx`
- Create: `packages/hub/app/(client)/marmiton/(funnel)/cart/page.tsx`

**Interfaces:** None new — these are route pages, rendered inside `(funnel)/layout.tsx` (already exists: `CartProvider` + `Header` + `Footer`).

Source: `packages/marmiton-prototype/app/(prototypes)/recipe/page.tsx` and `.../cart/page.tsx`.

Every internal navigation target in these two files must be re-pointed:

| File | Old | New |
|---|---|---|
| `recipe/page.tsx` | `router.push('/cart')` (in `onViewCart`) | `router.push('/marmiton/cart')` |
| `recipe/page.tsx` | `router.push('/store')` (3 occurrences: `onChangeStore` in the drawer footer, `onChooseStore` and `onChangeStore` on the `<Cart>` inside the drawer) | `router.push('/marmiton/store')` |
| `cart/page.tsx` | `<Link href="/recipe" className="cart-back">` | `<Link href="/marmiton/recipe" className="cart-back">` |
| `cart/page.tsx` | `router.push('/store')` (3 occurrences: `onChooseStore`/`onChangeStore` on `<Cart>`, `onChangeStore` on `<CartFooter>`) | `router.push('/marmiton/store')` |
| `cart/page.tsx` | `router.push('/store')` inside `<CarrefourLoginModal onSuccess>` | `router.push('/marmiton/store')` |

Also remove the redundant `import '@mealz-product-team/design-system/styles/index.css'` line from both files (per Global Constraints), and apply the universal `@/` fix to every other import.

- [ ] **Step 1: Copy both files**

```bash
mkdir -p "packages/hub/app/(client)/marmiton/(funnel)/recipe"
mkdir -p "packages/hub/app/(client)/marmiton/(funnel)/cart"
cp "packages/marmiton-prototype/app/(prototypes)/recipe/page.tsx" "packages/hub/app/(client)/marmiton/(funnel)/recipe/page.tsx"
cp "packages/marmiton-prototype/app/(prototypes)/cart/page.tsx" "packages/hub/app/(client)/marmiton/(funnel)/cart/page.tsx"
```

- [ ] **Step 2: Apply all edits from the table above, remove the redundant CSS import, apply the universal `@/` fix**

Read each file fully before editing — the table gives exact old/new values and occurrence counts; verify what you find matches before changing it, and ask if it doesn't.

- [ ] **Step 3: Verify**

Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit` — expect no errors.
Grep-check no stale internal links remain: `grep -n "'/cart'\|'/recipe'\|'/store'" "packages/hub/app/(client)/marmiton/(funnel)/recipe/page.tsx" "packages/hub/app/(client)/marmiton/(funnel)/cart/page.tsx"` — expected: no matches (everything should say `/marmiton/...`).
Grep-check the redundant CSS import is gone: `grep -n "styles/index.css" "packages/hub/app/(client)/marmiton/(funnel)/recipe/page.tsx" "packages/hub/app/(client)/marmiton/(funnel)/cart/page.tsx"` — expected: no matches.

- [ ] **Step 4: Commit**

```bash
git add "packages/hub/app/(client)/marmiton/(funnel)/recipe" "packages/hub/app/(client)/marmiton/(funnel)/cart"
git commit -m "feat(hub): add /marmiton/recipe and /marmiton/cart pages"
```

---

### Task 11: `login`, `store`, `slot` pages

**Files:**
- Create: `packages/hub/app/(client)/marmiton/(funnel)/login/page.tsx`
- Create: `packages/hub/app/(client)/marmiton/(funnel)/store/page.tsx`
- Create: `packages/hub/app/(client)/marmiton/(funnel)/slot/page.tsx`

Source: `packages/marmiton-prototype/app/(prototypes)/{login,store,slot}/page.tsx`.

| File | Old | New |
|---|---|---|
| `login/page.tsx` | `router.push('/store')` (in `CarrefourLoginModal`'s `onSuccess`) | `router.push('/marmiton/store')` |
| `store/page.tsx` | `router.push('/slot')` (in `handleConfirm`) | `router.push('/marmiton/slot')` |
| `slot/page.tsx` | `router.push('/payment')` (in `handleConfirm`) | `router.push('/marmiton/payment')` |
| `slot/page.tsx` | `router.push('/store')` (in the "Modifier" button next to the store name) | `router.push('/marmiton/store')` |
| `slot/page.tsx` | `{ label: 'Magasin', href: '/store' }` (inside the `Breadcrumb` items array) | `{ label: 'Magasin', href: '/marmiton/store' }` |

Remove the redundant `import '@mealz-product-team/design-system/styles/index.css'` line from all three files. Apply the universal `@/` fix to every other import.

- [ ] **Step 1: Copy all 3 files**

```bash
mkdir -p "packages/hub/app/(client)/marmiton/(funnel)/login"
mkdir -p "packages/hub/app/(client)/marmiton/(funnel)/store"
mkdir -p "packages/hub/app/(client)/marmiton/(funnel)/slot"
cp "packages/marmiton-prototype/app/(prototypes)/login/page.tsx" "packages/hub/app/(client)/marmiton/(funnel)/login/page.tsx"
cp "packages/marmiton-prototype/app/(prototypes)/store/page.tsx" "packages/hub/app/(client)/marmiton/(funnel)/store/page.tsx"
cp "packages/marmiton-prototype/app/(prototypes)/slot/page.tsx" "packages/hub/app/(client)/marmiton/(funnel)/slot/page.tsx"
```

- [ ] **Step 2: Apply all edits from the table above, remove the redundant CSS import, apply the universal `@/` fix**

Read each file fully before editing.

- [ ] **Step 3: Verify**

Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit` — expect no errors.
Grep-check: `grep -n "'/store'\|'/slot'\|'/payment'\|href: '/store'" "packages/hub/app/(client)/marmiton/(funnel)/login/page.tsx" "packages/hub/app/(client)/marmiton/(funnel)/store/page.tsx" "packages/hub/app/(client)/marmiton/(funnel)/slot/page.tsx"` — expected: no matches for un-prefixed targets.

- [ ] **Step 4: Commit**

```bash
git add "packages/hub/app/(client)/marmiton/(funnel)/login" "packages/hub/app/(client)/marmiton/(funnel)/store" "packages/hub/app/(client)/marmiton/(funnel)/slot"
git commit -m "feat(hub): add /marmiton/login, /marmiton/store, /marmiton/slot pages"
```

---

### Task 12: `payment` and `confirmation` pages

**Files:**
- Create: `packages/hub/app/(client)/marmiton/(funnel)/payment/page.tsx`
- Create: `packages/hub/app/(client)/marmiton/(funnel)/confirmation/page.tsx`

Source: `packages/marmiton-prototype/app/(prototypes)/{payment,confirmation}/page.tsx`.

| File | Old | New |
|---|---|---|
| `payment/page.tsx` | `<Link href="/slot" className="proto-back">` | `<Link href="/marmiton/slot" className="proto-back">` |
| `payment/page.tsx` | `router.push('/confirmation')` (in `handleConfirm`) | `router.push('/marmiton/confirmation')` |
| `confirmation/page.tsx` | `router.push('/recipe')` (in `handleContinue`) | `router.push('/marmiton/recipe')` |

Remove the redundant `import '@mealz-product-team/design-system/styles/index.css'` line from both files. Apply the universal `@/` fix to every other import.

- [ ] **Step 1: Copy both files**

```bash
mkdir -p "packages/hub/app/(client)/marmiton/(funnel)/payment"
mkdir -p "packages/hub/app/(client)/marmiton/(funnel)/confirmation"
cp "packages/marmiton-prototype/app/(prototypes)/payment/page.tsx" "packages/hub/app/(client)/marmiton/(funnel)/payment/page.tsx"
cp "packages/marmiton-prototype/app/(prototypes)/confirmation/page.tsx" "packages/hub/app/(client)/marmiton/(funnel)/confirmation/page.tsx"
```

- [ ] **Step 2: Apply all edits from the table above, remove the redundant CSS import, apply the universal `@/` fix**

Read each file fully before editing.

- [ ] **Step 3: Verify**

Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit` — expect no errors. This should now be a fully clean type-check across the entire plan (all 7 pages + all component groups).
Run: `pnpm --filter @mealz-product-team/hub exec next build` — expect success. Confirm the route table lists all 7 new `/marmiton/*` routes.
Grep-check: `grep -n "'/slot'\|'/confirmation'\|'/recipe'" "packages/hub/app/(client)/marmiton/(funnel)/payment/page.tsx" "packages/hub/app/(client)/marmiton/(funnel)/confirmation/page.tsx"` — expected: no un-prefixed matches.

- [ ] **Step 4: Commit**

```bash
git add "packages/hub/app/(client)/marmiton/(funnel)/payment" "packages/hub/app/(client)/marmiton/(funnel)/confirmation"
git commit -m "feat(hub): add /marmiton/payment and /marmiton/confirmation pages"
```

---

### Task 13: Full manual verification — click through the entire funnel

**Files:** none (verification only).

- [ ] **Step 1: Run the automated test suite and type-check**

Run: `pnpm --filter @mealz-product-team/hub test` — expect all existing tests plus `agentScript.test.ts`/`recipeAskScript.test.ts` passing.
Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit` — expect no errors.
Run: `pnpm --filter @mealz-product-team/hub build` — expect success.

- [ ] **Step 2: Start the dev server**

Reuse `packages/hub/.env.local` (create if missing: `HUB_COOKIE_SECRET=test`, `HUB_PASSWORD_MASTER=test`, `HUB_PASSWORD_MARMITON=test`, `HUB_PASSWORD_COURSESU=test`).

- [ ] **Step 3: Walk the funnel end-to-end in a master session**

Log in as master, visit `/marmiton`, click the "Recipe" card (opens `/marmiton/recipe` in a new tab — that's expected per the gallery redesign). On the recipe page:
- Confirm the real recipe renders (title, image, ingredients, price) — NOT a 404.
- Confirm Marmiton's `Header`/`Footer` are visible (this page is inside `(funnel)`, which has them; the gallery index does not).
- Click "Commander" (or equivalent order CTA) to add ingredients to cart, confirm the cart drawer opens.
- From the drawer, navigate to the full cart page (`/marmiton/cart`) — confirm items are present, total is correct.
- Click through cart → login (`/marmiton/login`) → confirm the Carrefour login modal appears, complete it → store (`/marmiton/store`) → pick a store → slot (`/marmiton/slot`) → pick a timeslot → payment (`/marmiton/payment`) → confirm → confirmation (`/marmiton/confirmation`).
- From confirmation, click through back to `/marmiton/recipe` and confirm the cart was cleared.

- [ ] **Step 4: Verify the recipe-ask / agent-adjacent UI on the recipe page**

Confirm `RecipeAskBar` renders below the recipe content, and clicking a chip or typing a question opens `RecipeAgentDrawer` with a real answer (not an error) — this exercises `recipeAskScript.ts`/`agentScript.ts` end-to-end, not just via their unit tests.

- [ ] **Step 5: Verify zero regression on the gallery index and other namespaces**

Visit `/marmiton` again: confirm it's still the clean gallery (no Header/Footer leaking in), Recipe/Agent cards still present. Visit `/coursesu` and `/neutral`: confirm both are unchanged from before this plan.

- [ ] **Step 6: Report results**

If every check in Steps 3-5 matches its expectation: DONE. If anything fails, note exactly which assertion failed and its actual output before fixing.
