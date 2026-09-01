# Hub Marmiton Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the `/marmiton/*` route tree inside the hub — routing structure, shared chrome (Header/Footer/CartContext), the real Marmiton home page — as the foundation the next two plans (recipe purchase funnel, agent flow) build their actual pages on top of.

**Architecture:** `packages/marmiton-prototype`'s routes are all client-specific to Marmiton — never declined to other clients — so they get a static folder `app/(client)/marmiton/` (Next.js resolves a static route ahead of the dynamic `(client)/[client]/` catch-all for the exact same path, so this coexists cleanly with the generic client stub CoursesU still uses). A new `ClientNamespaceShell` component factors the "render the master sidebar shell, or pass through untouched" decision out of `(client)/[client]/layout.tsx` so both route trees share it without duplicating the `x-hub-is-master` header read. Marmiton's own chrome (`CartProvider`, `Header`, `Footer`) is copied — not moved — from `marmiton-prototype` into `packages/hub/src/features/marmiton-prototype/`, per the spec's convention that each proto's code lives once under `src/features/<proto>/`. `marmiton-prototype` itself is left fully intact and deployable throughout — nothing is deleted from it in this plan; it only gets decommissioned once its hub route is live and confirmed (per the spec's migration rule).

**Tech Stack:** Next.js 16 (App Router, Server Components), React 19, TypeScript — no new dependencies. No automated tests in this plan: it copies existing, already-built UI code with routing/import-path adaptations, consistent with how the rest of the hub's UI layer (gate pages, shells) has no unit tests — only pure logic gets TDD treatment in this codebase.

## Global Constraints

- Never import from the design-system barrel (`@mealz-product-team/design-system`) in a Server Component — concrete subpaths only. Client Components (`'use client'`) may use the barrel — this is the existing pattern `Header.tsx` already follows and should keep following.
- `marmiton-prototype` is never deleted or modified by this plan — every migrated file is a **copy**, so the standalone package keeps working and stays deployable until a later plan explicitly decommissions it.
- Every internal link/navigation call in migrated code that assumed the app was mounted at `/` must be re-pointed to live under `/marmiton` (e.g. `/cart` → `/marmiton/cart`, `/` → `/marmiton`) — this is the single most error-prone part of this migration; each task below lists the exact call sites to fix.
- Route segments in English (already true for all of marmiton-prototype's routes per its own BRIEF.md); UI copy stays in French.
- CSS custom properties must be real design-system tokens (verified against `packages/design-system/src/styles/dist/*.generated.css` and `tokens/base.css`) — never invented names. The files copied in this plan already use real tokens (they're live, working code) — verify this holds after copying, don't introduce new invented ones.
- Follow the spec: [`docs/superpowers/specs/2026-09-01-hub-multi-client-design.md`](../specs/2026-09-01-hub-multi-client-design.md) and [`packages/marmiton-prototype/docs/BRIEF.md`](../../../packages/marmiton-prototype/docs/BRIEF.md).

---

## File Structure

```
packages/hub/
  src/
    components/
      ClientNamespaceShell/
        ClientNamespaceShell.tsx                    # new — master-shell-or-passthrough decision, shared
    features/
      marmiton-prototype/                            # new — copied from packages/marmiton-prototype
        context/
          CartContext.tsx
        data/
          types/
            aisle.ts
            cart.ts
            product.ts
            recipe.ts
            store.ts
            timeslot.ts
          mock/
            aisles.ts
            products.ts
            recipes.ts
            stores.ts
            timeslots.ts
        components/
          layout/
            Header/
              Header.tsx
              Header.css
            Footer/
              Footer.tsx
              Footer.css
  app/
    (client)/
      client-page.css                                 # modified — keeps .hub-client-shell + stub title/placeholder classes
      [client]/
        layout.tsx                                     # modified — uses ClientNamespaceShell
        page.tsx                                        # modified — owns its own .hub-client-shell wrapper now
      marmiton/                                         # new — static route tree, takes precedence over [client] for /marmiton
        layout.tsx                                      # new — ClientNamespaceShell + CartProvider + Header/Footer
        page.tsx                                        # new — Marmiton home (Recipe/Agent cards)
        page.css                                        # new — copied from marmiton-prototype's app/page.css
  public/
    logos/
      logo-marmiton.svg                                 # new — copied from marmiton-prototype/public/logos/
```

Files modified: `app/(client)/[client]/layout.tsx`, `app/(client)/[client]/page.tsx`, `app/(client)/client-page.css`. Everything else is new.

---

### Task 1: Extract `ClientNamespaceShell` and un-couple shell choice from stub padding

**Files:**
- Create: `packages/hub/src/components/ClientNamespaceShell/ClientNamespaceShell.tsx`
- Modify: `packages/hub/app/(client)/[client]/layout.tsx`
- Modify: `packages/hub/app/(client)/[client]/page.tsx`
- Modify: `packages/hub/app/(client)/client-page.css`

**Interfaces:**
- Produces: `ClientNamespaceShell({ children }: { children: React.ReactNode })` — an async Server Component. Renders `<MasterShell>{children}</MasterShell>` when the session holds a valid master cookie (`x-hub-is-master` header, same contract `proxy.ts` already sets), otherwise renders `children` completely unwrapped (a bare passthrough, no div, no padding) — consumed by Task 6's `marmiton/layout.tsx` in addition to `[client]/layout.tsx`.
- Consumes: `MasterShell` (existing, `@/components/MasterShell/MasterShell`).

**Why this task exists:** today `[client]/layout.tsx` wraps its locked (non-master) branch in `<div className="hub-client-shell">`, which adds padding meant for the CoursesU stub's empty state. Marmiton's real content brings its own full-bleed `Header`/`Footer` — reusing that padded wrapper for it would visually break them. Un-coupling "which shell" (this task) from "how much padding the stub content wants" (moved into the stub page itself) lets both route trees share the shell decision without forcing Marmiton into a wrapper it doesn't want.

- [ ] **Step 1: Create `ClientNamespaceShell.tsx`**

```tsx
// packages/hub/src/components/ClientNamespaceShell/ClientNamespaceShell.tsx
import { headers } from 'next/headers'
import { MasterShell } from '@/components/MasterShell/MasterShell'

/**
 * Shared between every client-specific route tree (the generic `[client]`
 * catch-all and each proto's own static folder, e.g. `marmiton/`): renders
 * the master sidebar shell for a team session, or passes children through
 * completely unwrapped otherwise. Deliberately has no styling opinion of
 * its own — a locked stub page and a fully-migrated proto's own chrome
 * have very different layout needs, and neither should inherit padding
 * this component doesn't own.
 */
export async function ClientNamespaceShell({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const isMaster = headersList.get('x-hub-is-master') === '1'

  if (isMaster) {
    return <MasterShell>{children}</MasterShell>
  }

  return <>{children}</>
}

export default ClientNamespaceShell
```

- [ ] **Step 2: Update `[client]/layout.tsx` to use it**

```tsx
// packages/hub/app/(client)/[client]/layout.tsx
import { notFound } from 'next/navigation'
import { findClientNamespace } from '@/config/namespaces'
import { ClientNamespaceShell } from '@/components/ClientNamespaceShell/ClientNamespaceShell'
import '../client-page.css'

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ client: string }>
}) {
  const { client } = await params
  const namespace = findClientNamespace(client)
  if (!namespace) {
    notFound()
  }

  return <ClientNamespaceShell>{children}</ClientNamespaceShell>
}
```

- [ ] **Step 3: Move the `.hub-client-shell` wrapper into `[client]/page.tsx`**

```tsx
// packages/hub/app/(client)/[client]/page.tsx
import { notFound } from 'next/navigation'
import { findClientNamespace } from '@/config/namespaces'
import { NamespaceCardGrid } from '@/components/NamespaceCardGrid/NamespaceCardGrid'

export default async function ClientPage({ params }: { params: Promise<{ client: string }> }) {
  const { client } = await params
  const namespace = findClientNamespace(client)
  if (!namespace) {
    notFound()
  }

  return (
    <div className="hub-client-shell">
      <section>
        <h1 className="hub-namespace-page__title">{namespace.label}</h1>
        <NamespaceCardGrid cards={[]} emptyMessage="Aucun prototype migré pour l'instant." />
      </section>
    </div>
  )
}
```

- [ ] **Step 4: `client-page.css` is unchanged in content** — it still defines `.hub-client-shell`, `.hub-namespace-page__title`, `.hub-namespace-page__placeholder`; only which file renders the `.hub-client-shell` div moved (layout → page). No edit needed to the CSS file itself — skip if it already matches; otherwise confirm it still reads:

```css
.hub-client-shell {
  min-height: 100vh;
  padding: var(--spacing-24);
}

.hub-namespace-page__title {
  font-size: var(--font-size-heading-lg);
  margin: 0 0 var(--spacing-16);
}

.hub-namespace-page__placeholder {
  color: var(--color-content-weak);
}
```

- [ ] **Step 5: Verify no regression on the CoursesU stub**

Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit` — expect no errors.

With the dev server running and a valid session (master or CoursesU-only), visit `/coursesu`: expect the exact same rendering as before this refactor — "CoursesU" heading, empty-state message, padded box, sidebar only in master session. Compare against a screenshot if unsure; this step must show zero visual change on `/coursesu`.

- [ ] **Step 6: Commit**

```bash
git add packages/hub/src/components/ClientNamespaceShell packages/hub/app/\(client\)/\[client\]/layout.tsx packages/hub/app/\(client\)/\[client\]/page.tsx
git commit -m "refactor(hub): extract ClientNamespaceShell, decouple shell choice from stub padding"
```

---

### Task 2: Copy the data/types layer

**Files:**
- Create: `packages/hub/src/features/marmiton-prototype/data/types/{aisle,cart,product,recipe,store,timeslot}.ts`
- Create: `packages/hub/src/features/marmiton-prototype/data/mock/{aisles,products,recipes,stores,timeslots}.ts`

**Interfaces:**
- Produces: the same named types/exports `marmiton-prototype` already has (`Product`, `Recipe`, `CartItem`, `CartSection`, `Cart`, `Store`, `Timeslot`, `Aisle`, and the mock data arrays) — consumed by Task 3 (`CartContext`) and by the recipe-funnel/agent plans that come after this one.

This is a **verbatim copy** — these files are pure data/type definitions with no logic to adapt, and their only imports are to siblings within this same `data/` folder (e.g. `cart.ts` imports `./product`, `./timeslot`), so the relative import structure stays valid unchanged as long as the folder shape (`types/` and `mock/` as siblings) is preserved exactly.

- [ ] **Step 1: Copy every file byte-for-byte**

```bash
mkdir -p packages/hub/src/features/marmiton-prototype/data/types
mkdir -p packages/hub/src/features/marmiton-prototype/data/mock
cp packages/marmiton-prototype/src/data/types/*.ts packages/hub/src/features/marmiton-prototype/data/types/
cp packages/marmiton-prototype/src/data/mock/*.ts packages/hub/src/features/marmiton-prototype/data/mock/
```

- [ ] **Step 2: Verify the copy is exact and compiles**

Run: `diff -rq packages/marmiton-prototype/src/data packages/hub/src/features/marmiton-prototype/data`
Expected: no output (directories identical).

Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit`
Expected: no errors — these files aren't imported by anything yet, but they must still parse/type-check standalone.

- [ ] **Step 3: Commit**

```bash
git add packages/hub/src/features/marmiton-prototype/data
git commit -m "feat(hub): copy marmiton-prototype data/types layer"
```

---

### Task 3: Copy `CartContext`

**Files:**
- Create: `packages/hub/src/features/marmiton-prototype/context/CartContext.tsx`

**Interfaces:**
- Produces: `CartProvider`, `useCart`, `useCartOptional`, `getCartSections`, `getCartTotal`, `getCartItemCount`, `getProductQuantity` — same exports as the source file, consumed by Task 4 (`Header`) and by the recipe-funnel plan's cart/checkout pages.
- Consumes: `CartItem`/`CartSection` (Task 2, `data/types/cart`), `Product` (Task 2, `data/types/product`), `Timeslot` (Task 2, `data/types/timeslot`).

- [ ] **Step 1: Copy the file unchanged**

```bash
mkdir -p packages/hub/src/features/marmiton-prototype/context
cp packages/marmiton-prototype/src/context/CartContext.tsx packages/hub/src/features/marmiton-prototype/context/CartContext.tsx
```

No edits needed — `CartContext.tsx` only imports its sibling `../data/types/*`, and `context/` sits next to `data/` in the new location exactly as it did in the old one (`src/context/` next to `src/data/`), so the relative paths resolve unchanged.

- [ ] **Step 2: Verify**

Run: `diff packages/marmiton-prototype/src/context/CartContext.tsx packages/hub/src/features/marmiton-prototype/context/CartContext.tsx`
Expected: no output.

Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/hub/src/features/marmiton-prototype/context
git commit -m "feat(hub): copy marmiton-prototype CartContext"
```

---

### Task 4: Copy and re-point `Header` and `Footer`

**Files:**
- Create: `packages/hub/src/features/marmiton-prototype/components/layout/Header/Header.tsx`
- Create: `packages/hub/src/features/marmiton-prototype/components/layout/Header/Header.css`
- Create: `packages/hub/src/features/marmiton-prototype/components/layout/Footer/Footer.tsx`
- Create: `packages/hub/src/features/marmiton-prototype/components/layout/Footer/Footer.css`

**Interfaces:**
- Produces: `Header`, `Footer` — consumed by Task 6 (`app/(client)/marmiton/layout.tsx`).
- Consumes: `useCart` (Task 3), `Button`/`Badge`/`InputField` from the design-system barrel (fine — both files are `'use client'`).

**Every hardcoded internal link in these two files must be re-pointed** — they were written assuming they're mounted at the site root:

| File | Old | New |
|---|---|---|
| `Header.tsx` | `router.push('/cart')` (in `goTo`, called by the cart icon button) | `router.push('/marmiton/cart')` |
| `Header.tsx` | `router.push('/login')` (called 3 times: header login button, mega-menu "Connexion", mega-menu "Inscription") | `router.push('/marmiton/login')` |
| `Header.tsx` | `<Link href="/" ...>` (logo) | `<Link href="/marmiton" ...>` |
| `Footer.tsx` | `<Link href="/" ...>` (logo) | `<Link href="/marmiton" ...>` |

The CSS files (`Header.css`, `Footer.css`) are copied unchanged — no route-dependent values in them.

- [ ] **Step 1: Copy the CSS files unchanged**

```bash
mkdir -p packages/hub/src/features/marmiton-prototype/components/layout/Header
mkdir -p packages/hub/src/features/marmiton-prototype/components/layout/Footer
cp packages/marmiton-prototype/src/components/layout/Header/Header.css packages/hub/src/features/marmiton-prototype/components/layout/Header/Header.css
cp packages/marmiton-prototype/src/components/layout/Footer/Footer.css packages/hub/src/features/marmiton-prototype/components/layout/Footer/Footer.css
```

- [ ] **Step 2: Copy `Header.tsx`, then apply exactly these edits**

First copy: `cp packages/marmiton-prototype/src/components/layout/Header/Header.tsx packages/hub/src/features/marmiton-prototype/components/layout/Header/Header.tsx`

Then, in the copied file:

```diff
 import { Button, Badge, InputField } from '@mealz-product-team/design-system'
-import { useCart } from '@/context/CartContext'
+import { useCart } from '@/features/marmiton-prototype/context/CartContext'
 import './Header.css'
```

```diff
-          <Link href="/" className="header__logo" aria-label="Marmiton — Accueil" onClick={closeMenu}>
+          <Link href="/marmiton" className="header__logo" aria-label="Marmiton — Accueil" onClick={closeMenu}>
```

```diff
-          <button type="button" className="header__cart" aria-label="Voir le panier" onClick={() => goTo('/cart')}>
+          <button type="button" className="header__cart" aria-label="Voir le panier" onClick={() => goTo('/marmiton/cart')}>
```

```diff
           <Button
             variant="primary"
             size="M"
             label="Se connecter"
             className="header__login"
-            onClick={() => goTo('/login')}
+            onClick={() => goTo('/marmiton/login')}
           />
```

```diff
               <div className="header__mega-menu-account-actions">
-                <Button variant="primary" size="M" label="Connexion" onClick={() => goTo('/login')} />
-                <Button variant="secondary" size="M" label="Inscription" onClick={() => goTo('/login')} />
+                <Button variant="primary" size="M" label="Connexion" onClick={() => goTo('/marmiton/login')} />
+                <Button variant="secondary" size="M" label="Inscription" onClick={() => goTo('/marmiton/login')} />
               </div>
```

Every other line (the mega-menu column data, secondary nav, all `href="#"` placeholder links) stays exactly as-is — those are placeholder content links unrelated to hub routing, out of scope.

- [ ] **Step 3: Copy `Footer.tsx`, then apply exactly this edit**

First copy: `cp packages/marmiton-prototype/src/components/layout/Footer/Footer.tsx packages/hub/src/features/marmiton-prototype/components/layout/Footer/Footer.tsx`

Then, in the copied file:

```diff
-      <Link href="/" className="footer__logo" aria-label="Marmiton — Accueil">
+      <Link href="/marmiton" className="footer__logo" aria-label="Marmiton — Accueil">
```

Everything else (footer columns, legal links, socials) stays exactly as-is.

- [ ] **Step 4: Verify**

Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit`
Expected: no errors.

Grep-check that no stale references survived: `grep -n "'/cart'\|'/login'\|href=\"/\"" packages/hub/src/features/marmiton-prototype/components/layout/Header/Header.tsx packages/hub/src/features/marmiton-prototype/components/layout/Footer/Footer.tsx` — expected: no matches (everything should now say `/marmiton/...`).

- [ ] **Step 5: Commit**

```bash
git add packages/hub/src/features/marmiton-prototype/components/layout
git commit -m "feat(hub): copy and re-point marmiton-prototype Header/Footer to /marmiton/*"
```

---

### Task 5: Copy the Marmiton logo asset

**Files:**
- Create: `packages/hub/public/logos/logo-marmiton.svg`

**Interfaces:** None — a static asset referenced by `Header`/`Footer` via the absolute path `/logos/logo-marmiton.svg`, which resolves correctly regardless of which route renders them.

- [ ] **Step 1: Copy the file**

```bash
mkdir -p packages/hub/public/logos
cp packages/marmiton-prototype/public/logos/logo-marmiton.svg packages/hub/public/logos/logo-marmiton.svg
```

- [ ] **Step 2: Verify**

Run: `diff packages/marmiton-prototype/public/logos/logo-marmiton.svg packages/hub/public/logos/logo-marmiton.svg`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add packages/hub/public/logos/logo-marmiton.svg
git commit -m "feat(hub): copy Marmiton logo asset"
```

---

### Task 6: `app/(client)/marmiton/layout.tsx` — the static Marmiton shell

**Files:**
- Create: `packages/hub/app/(client)/marmiton/layout.tsx`

**Interfaces:**
- Consumes: `ClientNamespaceShell` (Task 1), `CartProvider` (Task 3), `Header`, `Footer` (Task 4).
- Produces: chrome wrapping every route under `/marmiton/*` — consumed by Task 7 (`marmiton/page.tsx`) and every page the recipe-funnel/agent plans add later under this same folder.

This is a **static** route folder (no `[client]` dynamic segment, no `params`) — Next.js resolves `/marmiton` against this folder ahead of the dynamic `(client)/[client]/` catch-all, so no `notFound()`/namespace-lookup guard is needed here the way `[client]/layout.tsx` needs one.

- [ ] **Step 1: Implement the layout**

```tsx
// packages/hub/app/(client)/marmiton/layout.tsx
import { ClientNamespaceShell } from '@/components/ClientNamespaceShell/ClientNamespaceShell'
import { CartProvider } from '@/features/marmiton-prototype/context/CartContext'
import { Header } from '@/features/marmiton-prototype/components/layout/Header/Header'
import { Footer } from '@/features/marmiton-prototype/components/layout/Footer/Footer'

export default function MarmitonLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientNamespaceShell>
      <CartProvider>
        <Header />
        {children}
        <Footer />
      </CartProvider>
    </ClientNamespaceShell>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit`
Expected: no errors. (Full rendering is verified in Task 7, once there's a page for this layout to wrap — this layout alone has no route to test yet.)

- [ ] **Step 3: Commit**

```bash
git add "packages/hub/app/(client)/marmiton/layout.tsx"
git commit -m "feat(hub): add static /marmiton layout (CartProvider + Header/Footer + shell)"
```

---

### Task 7: `app/(client)/marmiton/page.tsx` — the real Marmiton home page

**Files:**
- Create: `packages/hub/app/(client)/marmiton/page.tsx`
- Create: `packages/hub/app/(client)/marmiton/page.css`

**Interfaces:** None new — this is the `/marmiton` route's page component, rendered inside Task 6's layout.

Adapted from `marmiton-prototype`'s own `app/page.tsx` — only the two card `href`s change (they pointed at the app's own root-level routes, which now live under `/marmiton`).

- [ ] **Step 1: Copy `page.css` unchanged**

```bash
cp packages/marmiton-prototype/app/page.css "packages/hub/app/(client)/marmiton/page.css"
```

- [ ] **Step 2: Create `page.tsx`**

```tsx
// packages/hub/app/(client)/marmiton/page.tsx
import './page.css'

interface FlowLink {
  title: string
  description: string
  href: string
}

const FLOWS: FlowLink[] = [
  {
    title: 'Recipe',
    description: "Parcours d'achat depuis une recette Marmiton (recette → panier → magasin → créneau → paiement).",
    href: '/marmiton/recipe',
  },
  {
    title: 'Agent',
    description: 'Parcours agent conversationnel — en cours de refonte.',
    href: '/marmiton/agent',
  },
]

export default function MarmitonHomePage() {
  return (
    <main className="home">
      <h1 className="home__title">Marmiton Prototype</h1>
      <div className="home__grid">
        {FLOWS.map((flow) => (
          <a key={flow.href} className="home__card" href={flow.href}>
            <span className="home__card-title">{flow.title}</span>
            <span className="home__card-desc">{flow.description}</span>
          </a>
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Verify it compiles**

Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "packages/hub/app/(client)/marmiton/page.tsx" "packages/hub/app/(client)/marmiton/page.css"
git commit -m "feat(hub): add /marmiton home page (Recipe/Agent cards)"
```

---

### Task 8: Full manual verification

**Files:** none (verification only).

- [ ] **Step 1: Type-check and build**

Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit` — expect no errors.
Run: `pnpm --filter @mealz-product-team/hub build` — expect success. Confirm the route table includes `/marmiton` as its own entry (not falling through to `[client]`).

- [ ] **Step 2: Start the dev server**

Reuse the existing `packages/hub/.env.local` (already has test credentials from prior sessions). Run: `pnpm --filter @mealz-product-team/hub dev`.

- [ ] **Step 3: Verify the master-session view**

With a valid master session, visit `/marmiton`. Expect: hub sidebar still visible on the left (Mealz/Marmiton/CoursesU groups — this route tree changed, the sidebar's own behavior didn't), and inside the content area: Marmiton's real `Header` (logo, search field, cart icon, "Se connecter" button, secondary nav), the two Recipe/Agent cards, and Marmiton's real `Footer` (columns, legal links, socials). Confirm `data-brand` reads `"marmiton"`.

- [ ] **Step 4: Verify internal links are correctly re-pointed**

Click the Marmiton logo in the Header — expect to land back on `/marmiton` (not `/`). Click the cart icon — expect navigation to `/marmiton/cart` (this 404s for now, that's expected — the recipe-funnel plan adds it; the point of this check is confirming the *link target*, via the browser's address bar, is `/marmiton/cart` and not `/cart`). Click "Se connecter" — expect navigation to `/marmiton/login` (same 404-is-expected caveat). Click the Recipe card on the home page — expect navigation to `/marmiton/recipe` (same caveat).

- [ ] **Step 5: Verify the CoursesU stub has zero regression from Task 1's refactor**

Visit `/coursesu` (master session): expect identical rendering to before this plan — "CoursesU" heading, empty-state message, sidebar visible, no Marmiton chrome leaking in.

- [ ] **Step 6: Report results**

If every check in Steps 3-5 matches its expectation: DONE. If anything fails, note exactly which assertion failed and its actual output before fixing.
