# Hub Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `packages/home` into `packages/hub` — a single Next.js app with a master/per-client password gate, brand-locked namespaces, and a Design-Studio-style sidebar shell — with no real prototype content migrated yet (that's later plans).

**Architecture:** `proxy.ts` (Next.js 16's renamed `middleware.ts` convention) checks signed httpOnly cookies (one master cookie that unlocks everything, one cookie per external client scoped to its own path) and injects `x-hub-brand`/`x-hub-locked` request headers; the single root `app/layout.tsx` reads those headers to set `data-brand` on `<html>` and to decide whether to render the brand switcher. A `(master)` route group holds the sidebar shell (Mealz group: Neutral + Guide, one group per client) and the Neutral/Guide stub pages; a `(client)/[client]` route group holds the locked, sidebar-less client view. Two `/gate` pages (root + per-client) host password forms wired to Server Actions that verify the password against an env var and set the signed cookie.

**Tech Stack:** Next.js 16 (App Router, Server Actions, Proxy), React 19, TypeScript, Vitest + Testing Library (new to this package), Web Crypto (`crypto.subtle`) for HMAC signing — no new runtime dependency needed for that.

## Global Constraints

- Next `^16.2.9`, React `^19.2.7`, TypeScript `^5.6.3` — match versions already used across the monorepo's other packages, do not bump.
- pnpm workspace: new dependencies go in `packages/hub/package.json`, installed via `pnpm install` from repo root (workspace resolves `workspace:*` for `@mealz-product-team/design-system`).
- Never import from the design-system barrel (`@mealz-product-team/design-system`) in Server Components — always import the concrete subpath (e.g. `@mealz-product-team/design-system/devtools/BrandThemeSwitcher/BrandThemeSwitcher`). See root `CLAUDE.md`.
- Route segments and identifiers in English (`neutral`, `guide`, `gate`, client ids) — French is avoided in URLs across the monorepo (documented in `packages/marmiton-prototype/docs/BRIEF.md`). UI copy stays in French, matching the rest of the repo.
- No secret (password, cookie-signing key) ever hardcoded in source — always read from `process.env`, documented in `.env.example` with empty values, real values only in `.env.local` (gitignored) or Netlify's env var settings.
- Follow the spec exactly: [`docs/superpowers/specs/2026-09-01-hub-multi-client-design.md`](../specs/2026-09-01-hub-multi-client-design.md).

---

## File Structure

```
packages/hub/                                          # renamed from packages/home
  package.json                                          # renamed, + vitest deps + "test" script
  next.config.ts                                        # unchanged
  postcss.config.mjs                                    # unchanged
  tsconfig.json                                          # unchanged (already has @/* -> ./src/*)
  vitest.config.ts                                       # new
  vitest.setup.ts                                        # new
  proxy.ts                                               # new — auth gate + brand header injection (Next 16's proxy convention, formerly middleware.ts)
  .env.example                                           # new — documents required env vars
  docs/BRIEF.md                                          # rewritten for the new hub role
  app/
    layout.tsx                                           # rewritten — reads x-hub-brand/x-hub-locked headers
    gate/
      gate.css                                           # new
      page.tsx                                           # new — master password form
      [client]/
        page.tsx                                         # new — per-client password form
    (master)/
      master-shell.css                                   # new
      layout.tsx                                         # new — renders <Sidebar/> + content area
      page.tsx                                            # new — redirect('/neutral')
      neutral/
        page.tsx                                          # new — stub empty state
      guide/
        page.tsx                                          # new — "Bientôt disponible" stub
    (client)/
      client-page.css                                     # new
      [client]/
        layout.tsx                                        # new — 404s on unknown client, no sidebar
        page.tsx                                          # new — stub empty state for that client
  src/
    lib/
      env.ts                                              # new — getRequiredEnvVar, tested
      env.test.ts
      auth/
        compare.ts                                        # new — constantTimeEqual, tested
        compare.test.ts
        cookies.ts                                        # new — cookie names/maxAge, tested
        cookies.test.ts
        token.ts                                          # new — signToken/verifyToken (HMAC), tested
        token.test.ts
        actions.ts                                        # new — authenticateMaster/authenticateClient Server Actions
    config/
      namespaces.ts                                       # new — CLIENT_NAMESPACES registry, tested
      namespaces.test.ts
    components/
      NamespaceCardGrid/
        NamespaceCardGrid.tsx                              # new — reusable card grid, tested
        NamespaceCardGrid.css
        NamespaceCardGrid.test.tsx
      Sidebar/
        Sidebar.tsx                                        # new — Mealz + client groups, tested
        Sidebar.css
        Sidebar.test.tsx
```

The old `app/page.tsx` and `app/page.css` (the current "list of external links") are deleted — their content is superseded by `(master)/neutral/page.tsx` + `NamespaceCardGrid`.

Files that already exist and are reused unchanged: `public/fonts/*`, `next.config.ts`, `postcss.config.mjs`.

---

### Task 1: Rename `packages/home` to `packages/hub`

**Files:**
- Move: `packages/home/` → `packages/hub/`
- Modify: `packages/hub/package.json`
- Modify: `README.md`
- Modify: `.claude/launch.json`

**Interfaces:**
- Produces: the package `@mealz-product-team/hub`, dev server on port 3004, importable by no one yet (leaf package).

- [ ] **Step 1: Move the directory and rename the package**

```bash
git mv packages/home packages/hub
```

Edit `packages/hub/package.json` — change only the `name` field:

```diff
-  "name": "@mealz-product-team/home",
+  "name": "@mealz-product-team/hub",
```

- [ ] **Step 2: Update `.claude/launch.json`**

In `.claude/launch.json`, replace the `home-dev` entry:

```diff
     {
-      "name": "home-dev",
+      "name": "hub-dev",
       "runtimeExecutable": "pnpm",
-      "runtimeArgs": ["--filter", "@mealz-product-team/home", "dev"],
+      "runtimeArgs": ["--filter", "@mealz-product-team/hub", "dev"],
       "port": 3004,
       "autoPort": true
     },
```

- [ ] **Step 3: Update `README.md`**

In the packages table, replace the `home` row:

```diff
-| `home` | 3004 | Hub de navigation entre les prototypes déployés (liens vers les sites Netlify indépendants) | `docs/BRIEF.md` |
+| `hub` | 3004 | Hub multi-client : prototypes, gate mot de passe par espace, brand verrouillée par client | `docs/BRIEF.md` |
```

In the "Démarrage rapide" section, replace:

```diff
-pnpm --filter @mealz-product-team/home dev                  # port 3004
+pnpm --filter @mealz-product-team/hub dev                    # port 3004
```

In the architecture tree, replace:

```diff
-    ├── home/                          # @mealz-product-team/home — hub de navigation entre prototypes
+    ├── hub/                           # @mealz-product-team/hub — hub multi-client (gate + brand lock + prototypes)
```

In the "Système de thèmes" section, replace the mention of `home` in the list of apps using `BrandThemeSwitcher`:

```diff
-Les autres apps Next.js du monorepo (`assistant-shopping`, `form-mealz-planner`, `home`, `supermarket`) utilisent à la place `BrandThemeSwitcher`
+Les autres apps Next.js du monorepo (`assistant-shopping`, `form-mealz-planner`, `hub`, `supermarket`) utilisent à la place `BrandThemeSwitcher`
```

In the "Scripts disponibles" apps table, replace:

```diff
-| `home` | 3004 | `pnpm --filter @mealz-product-team/home dev` |
+| `hub` | 3004 | `pnpm --filter @mealz-product-team/hub dev` |
```

- [ ] **Step 4: Verify the rename didn't break the dev server**

Run: `pnpm install` (from repo root, to refresh the workspace symlink for the renamed package), then `pnpm --filter @mealz-product-team/hub dev`

Expected: server starts on port 3004 without error, `curl -sI http://localhost:3004/` returns `200` (old page content still renders — we haven't touched `app/page.tsx` yet). Stop the server after checking.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(hub): rename packages/home to packages/hub"
```

---

### Task 2: Add Vitest test infrastructure to `packages/hub`

**Files:**
- Create: `packages/hub/vitest.config.ts`
- Create: `packages/hub/vitest.setup.ts`
- Modify: `packages/hub/package.json`

**Interfaces:**
- Produces: `pnpm --filter @mealz-product-team/hub test` runs Vitest; `@/*` alias resolves to `./src/*` in tests, matching the app's tsconfig alias.

- [ ] **Step 1: Add devDependencies and the `test` script**

Edit `packages/hub/package.json`:

```diff
   "scripts": {
     "predev": "pnpm --filter @mealz-product-team/design-system tokens",
     "dev": "next dev -p 3004",
     "prebuild": "pnpm --filter @mealz-product-team/design-system tokens",
     "build": "next build",
-    "start": "next start -p 3004"
+    "start": "next start -p 3004",
+    "test": "vitest run"
   },
   "dependencies": {
     "@mealz-product-team/design-system": "workspace:*",
     "next": "^16.2.9",
     "react": "^19.2.7",
     "react-dom": "^19.2.7"
   },
   "devDependencies": {
     "@types/node": "^25.9.3",
     "@types/react": "^18.3.12",
     "@types/react-dom": "^18.3.1",
     "@tailwindcss/postcss": "^4.3.1",
     "postcss": "^8.5.15",
     "tailwindcss": "^4.3.1",
-    "typescript": "^5.6.3"
+    "typescript": "^5.6.3",
+    "vitest": "^3.2.4",
+    "@vitejs/plugin-react": "^4.3.4",
+    "@testing-library/react": "^16.1.0",
+    "@testing-library/jest-dom": "^6.6.3",
+    "jsdom": "^25.0.1"
   }
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import path from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

- [ ] **Step 3: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4: Install and verify the harness runs (no tests yet)**

Run: `pnpm install`, then `pnpm --filter @mealz-product-team/hub test`

Expected: Vitest starts and reports "No test files found" (or passes with 0 tests) — not an error. This confirms the config/deps are wired correctly before we write real tests in later tasks.

- [ ] **Step 5: Commit**

```bash
git add packages/hub/package.json packages/hub/vitest.config.ts packages/hub/vitest.setup.ts pnpm-lock.yaml
git commit -m "test(hub): add Vitest + Testing Library infrastructure"
```

---

### Task 3: `src/lib/env.ts` and `src/lib/auth/compare.ts` — env var and constant-time compare primitives

**Files:**
- Create: `packages/hub/src/lib/env.ts`
- Test: `packages/hub/src/lib/env.test.ts`
- Create: `packages/hub/src/lib/auth/compare.ts`
- Test: `packages/hub/src/lib/auth/compare.test.ts`

**Interfaces:**
- Produces: `getRequiredEnvVar(name: string): string` (throws if unset/empty). `constantTimeEqual(a: string, b: string): boolean`.
- Consumed by: Task 4 (`token.ts`), Task 8 (`actions.ts`), Task 6 (`proxy.ts`).

- [ ] **Step 1: Write the failing tests for `getRequiredEnvVar`**

```ts
// packages/hub/src/lib/env.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getRequiredEnvVar } from './env'

describe('getRequiredEnvVar', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns the value when the env var is set', () => {
    vi.stubEnv('HUB_TEST_VAR', 'secret-value')
    expect(getRequiredEnvVar('HUB_TEST_VAR')).toBe('secret-value')
  })

  it('throws a descriptive error when the env var is missing', () => {
    vi.stubEnv('HUB_TEST_VAR', '')
    expect(() => getRequiredEnvVar('HUB_TEST_VAR')).toThrow('Missing required env var: HUB_TEST_VAR')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mealz-product-team/hub test env.test`
Expected: FAIL — `./env` has no exported member `getRequiredEnvVar` (module doesn't exist yet).

- [ ] **Step 3: Implement `env.ts`**

```ts
// packages/hub/src/lib/env.ts
export function getRequiredEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @mealz-product-team/hub test env.test`
Expected: PASS (2 tests)

- [ ] **Step 5: Write the failing tests for `constantTimeEqual`**

```ts
// packages/hub/src/lib/auth/compare.test.ts
import { describe, expect, it } from 'vitest'
import { constantTimeEqual } from './compare'

describe('constantTimeEqual', () => {
  it('returns true for identical strings', () => {
    expect(constantTimeEqual('hunter2', 'hunter2')).toBe(true)
  })

  it('returns false for different strings of the same length', () => {
    expect(constantTimeEqual('hunter2', 'hunter3')).toBe(false)
  })

  it('returns false for strings of different length', () => {
    expect(constantTimeEqual('short', 'much-longer-string')).toBe(false)
  })

  it('returns true for two empty strings', () => {
    expect(constantTimeEqual('', '')).toBe(true)
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

Run: `pnpm --filter @mealz-product-team/hub test compare.test`
Expected: FAIL — module `./compare` doesn't exist yet.

- [ ] **Step 7: Implement `compare.ts`**

```ts
// packages/hub/src/lib/auth/compare.ts

/**
 * Best-effort constant-time string comparison — iterates over the full
 * max length regardless of where a mismatch occurs, so total execution
 * time doesn't leak how many leading characters matched. Not a
 * cryptographic primitive; sufficient for comparing short passwords/
 * signatures in this internal tool.
 */
export function constantTimeEqual(a: string, b: string): boolean {
  const maxLength = Math.max(a.length, b.length)
  let mismatch = a.length === b.length ? 0 : 1
  for (let i = 0; i < maxLength; i++) {
    const charA = a.charCodeAt(i) || 0
    const charB = b.charCodeAt(i) || 0
    mismatch |= charA ^ charB
  }
  return mismatch === 0
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `pnpm --filter @mealz-product-team/hub test compare.test`
Expected: PASS (4 tests)

- [ ] **Step 9: Commit**

```bash
git add packages/hub/src/lib/env.ts packages/hub/src/lib/env.test.ts packages/hub/src/lib/auth/compare.ts packages/hub/src/lib/auth/compare.test.ts
git commit -m "feat(hub): add env var and constant-time compare primitives"
```

---

### Task 4: `src/lib/auth/cookies.ts` and `src/lib/auth/token.ts` — signed session tokens

**Files:**
- Create: `packages/hub/src/lib/auth/cookies.ts`
- Test: `packages/hub/src/lib/auth/cookies.test.ts`
- Create: `packages/hub/src/lib/auth/token.ts`
- Test: `packages/hub/src/lib/auth/token.test.ts`

**Interfaces:**
- Consumes: `constantTimeEqual` from `./compare` (Task 3).
- Produces: `MASTER_COOKIE_NAME: string`, `clientCookieName(clientId: string): string`, `COOKIE_MAX_AGE_SECONDS: number`, `signToken(scope: string, expiresAt: number, secret: string): Promise<string>`, `verifyToken(token: string, scope: string, secret: string, now?: number): Promise<boolean>`.
- Consumed by: Task 6 (`proxy.ts`), Task 8 (`actions.ts`).

- [ ] **Step 1: Write the failing tests for `cookies.ts`**

```ts
// packages/hub/src/lib/auth/cookies.test.ts
import { describe, expect, it } from 'vitest'
import { MASTER_COOKIE_NAME, clientCookieName, COOKIE_MAX_AGE_SECONDS } from './cookies'

describe('cookie naming', () => {
  it('exposes a fixed master cookie name', () => {
    expect(MASTER_COOKIE_NAME).toBe('hub_master')
  })

  it('scopes a client cookie name to the client id', () => {
    expect(clientCookieName('marmiton')).toBe('hub_client_marmiton')
    expect(clientCookieName('coursesu')).toBe('hub_client_coursesu')
  })

  it('sets a one-year max age', () => {
    expect(COOKIE_MAX_AGE_SECONDS).toBe(60 * 60 * 24 * 365)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mealz-product-team/hub test cookies.test`
Expected: FAIL — module `./cookies` doesn't exist yet.

- [ ] **Step 3: Implement `cookies.ts`**

```ts
// packages/hub/src/lib/auth/cookies.ts
export const MASTER_COOKIE_NAME = 'hub_master'

export function clientCookieName(clientId: string): string {
  return `hub_client_${clientId}`
}

export const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @mealz-product-team/hub test cookies.test`
Expected: PASS (3 tests)

- [ ] **Step 5: Write the failing tests for `token.ts`**

Pin this test file to the Node environment explicitly — jsdom's Web Crypto support is inconsistent across versions, and `signToken`/`verifyToken` need a real `crypto.subtle`:

```ts
// packages/hub/src/lib/auth/token.test.ts
// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { signToken, verifyToken } from './token'

describe('signToken / verifyToken', () => {
  const secret = 'test-secret-do-not-use-in-prod'

  it('verifies a token it just signed', async () => {
    const expiresAt = Date.now() + 60_000
    const token = await signToken('master', expiresAt, secret)
    expect(await verifyToken(token, 'master', secret)).toBe(true)
  })

  it('rejects a token verified against the wrong scope', async () => {
    const expiresAt = Date.now() + 60_000
    const token = await signToken('master', expiresAt, secret)
    expect(await verifyToken(token, 'client:marmiton', secret)).toBe(false)
  })

  it('rejects a token verified with the wrong secret', async () => {
    const expiresAt = Date.now() + 60_000
    const token = await signToken('master', expiresAt, secret)
    expect(await verifyToken(token, 'master', 'a-different-secret')).toBe(false)
  })

  it('rejects an expired token', async () => {
    const expiresAt = Date.now() - 1_000
    const token = await signToken('master', expiresAt, secret)
    expect(await verifyToken(token, 'master', secret)).toBe(false)
  })

  it('rejects a tampered signature', async () => {
    const expiresAt = Date.now() + 60_000
    const token = await signToken('master', expiresAt, secret)
    const [expiresAtPart] = token.split('.')
    const tampered = `${expiresAtPart}.not-a-real-signature`
    expect(await verifyToken(tampered, 'master', secret)).toBe(false)
  })

  it('rejects a malformed token', async () => {
    expect(await verifyToken('not-a-token', 'master', secret)).toBe(false)
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

Run: `pnpm --filter @mealz-product-team/hub test token.test`
Expected: FAIL — module `./token` doesn't exist yet.

- [ ] **Step 7: Implement `token.ts`**

```ts
// packages/hub/src/lib/auth/token.ts
import { constantTimeEqual } from './compare'

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
}

function toBase64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Signs `${scope}.${expiresAt}` with HMAC-SHA256 and returns
 * `${expiresAt}.${signature}` — the full string is the cookie value.
 * `scope` binds the signature to one namespace (e.g. "master" or
 * "client:marmiton") so a token can't be replayed under a different
 * cookie name.
 */
export async function signToken(scope: string, expiresAt: number, secret: string): Promise<string> {
  const key = await getHmacKey(secret)
  const encoder = new TextEncoder()
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`${scope}.${expiresAt}`))
  return `${expiresAt}.${toBase64Url(signature)}`
}

export async function verifyToken(
  token: string,
  scope: string,
  secret: string,
  now: number = Date.now()
): Promise<boolean> {
  const parts = token.split('.')
  if (parts.length !== 2) {
    return false
  }
  const [expiresAtRaw, signature] = parts
  const expiresAt = Number(expiresAtRaw)
  if (!Number.isFinite(expiresAt) || now > expiresAt) {
    return false
  }
  const expected = await signToken(scope, expiresAt, secret)
  const [, expectedSignature] = expected.split('.')
  return constantTimeEqual(signature, expectedSignature)
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `pnpm --filter @mealz-product-team/hub test token.test`
Expected: PASS (6 tests)

- [ ] **Step 9: Commit**

```bash
git add packages/hub/src/lib/auth/cookies.ts packages/hub/src/lib/auth/cookies.test.ts packages/hub/src/lib/auth/token.ts packages/hub/src/lib/auth/token.test.ts
git commit -m "feat(hub): add signed session tokens (HMAC via Web Crypto)"
```

---

### Task 5: `src/config/namespaces.ts` — client namespace registry

**Files:**
- Create: `packages/hub/src/config/namespaces.ts`
- Test: `packages/hub/src/config/namespaces.test.ts`

**Interfaces:**
- Consumes: `BRANDS` from `@mealz-product-team/design-system/styles/tokens/brands/brands` (existing, read-only).
- Produces: `interface ClientNamespace { id: string; brand: string; label: string; passwordEnvVar: string }`, `CLIENT_NAMESPACES: ClientNamespace[]`, `findClientNamespace(id: string): ClientNamespace | undefined`, `NEUTRAL_BRAND: string`, `MASTER_PASSWORD_ENV_VAR: string`.
- Consumed by: Task 6 (`proxy.ts`), Task 8 (`actions.ts`), Task 9 (gate pages), Task 10 (`Sidebar`), Task 11 (client layout/page).

- [ ] **Step 1: Write the failing tests**

```ts
// packages/hub/src/config/namespaces.test.ts
import { describe, expect, it } from 'vitest'
import { CLIENT_NAMESPACES, findClientNamespace, NEUTRAL_BRAND, MASTER_PASSWORD_ENV_VAR } from './namespaces'

describe('CLIENT_NAMESPACES', () => {
  it('excludes the neutral brand', () => {
    expect(CLIENT_NAMESPACES.some((namespace) => namespace.id === 'neutral')).toBe(false)
  })

  it('includes marmiton with the right password env var', () => {
    const marmiton = CLIENT_NAMESPACES.find((namespace) => namespace.id === 'marmiton')
    expect(marmiton).toMatchObject({
      id: 'marmiton',
      brand: 'marmiton',
      passwordEnvVar: 'HUB_PASSWORD_MARMITON',
    })
  })

  it('includes coursesu with the right password env var', () => {
    const coursesu = CLIENT_NAMESPACES.find((namespace) => namespace.id === 'coursesu')
    expect(coursesu).toMatchObject({
      id: 'coursesu',
      brand: 'coursesu',
      passwordEnvVar: 'HUB_PASSWORD_COURSESU',
    })
  })
})

describe('findClientNamespace', () => {
  it('finds a known client by id', () => {
    expect(findClientNamespace('marmiton')?.id).toBe('marmiton')
  })

  it('returns undefined for neutral', () => {
    expect(findClientNamespace('neutral')).toBeUndefined()
  })

  it('returns undefined for an unknown id', () => {
    expect(findClientNamespace('unknown-client')).toBeUndefined()
  })
})

describe('constants', () => {
  it('exposes the neutral brand value and the master password env var name', () => {
    expect(NEUTRAL_BRAND).toBe('neutral')
    expect(MASTER_PASSWORD_ENV_VAR).toBe('HUB_PASSWORD_MASTER')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mealz-product-team/hub test namespaces.test`
Expected: FAIL — module `./namespaces` doesn't exist yet.

- [ ] **Step 3: Implement `namespaces.ts`**

```ts
// packages/hub/src/config/namespaces.ts
import { BRANDS } from '@mealz-product-team/design-system/styles/tokens/brands/brands'

export interface ClientNamespace {
  id: string
  brand: string
  label: string
  passwordEnvVar: string
}

export const NEUTRAL_BRAND = 'neutral'
export const MASTER_PASSWORD_ENV_VAR = 'HUB_PASSWORD_MASTER'

export const CLIENT_NAMESPACES: ClientNamespace[] = BRANDS.filter((brand) => brand.value !== NEUTRAL_BRAND).map(
  (brand) => ({
    id: brand.value,
    brand: brand.value,
    label: brand.label,
    passwordEnvVar: `HUB_PASSWORD_${brand.value.toUpperCase()}`,
  })
)

export function findClientNamespace(id: string): ClientNamespace | undefined {
  return CLIENT_NAMESPACES.find((namespace) => namespace.id === id)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @mealz-product-team/hub test namespaces.test`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add packages/hub/src/config/namespaces.ts packages/hub/src/config/namespaces.test.ts
git commit -m "feat(hub): add client namespace registry sourced from design-system brands"
```

---

### Task 6: `proxy.ts` — auth gate and brand header injection

**Files:**
- Create: `packages/hub/proxy.ts`

**Interfaces:**
- Consumes: `MASTER_COOKIE_NAME`, `clientCookieName` (Task 4), `verifyToken` (Task 4), `CLIENT_NAMESPACES`, `findClientNamespace`, `NEUTRAL_BRAND` (Task 5), `getRequiredEnvVar` (Task 3).
- Produces: for every non-static request, either a redirect to `/gate` or `/gate/<client>`, or a forwarded request carrying `x-hub-brand` and `x-hub-locked` headers — consumed by Task 7 (`app/layout.tsx`).

**Naming note:** Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts` (exported function `proxy` instead of `middleware`) — a leftover `middleware.ts` risks being silently ignored on a future Next 16.x point release with no build error, which would be a silent auth bypass for this whole hub. Use `proxy.ts` from the start. Everything else about the API is unchanged: same file location (package root), same `NextRequest`/`NextResponse` imports, same `NextResponse.next({ request: { headers } })` pattern for forwarding headers, same `config.matcher` shape. Proxy always runs on the Node.js runtime (not Edge) — irrelevant here since `signToken`/`verifyToken` (Task 4) use the Web Crypto API, which works identically on both.

No automated test for this file: it's Next.js Proxy built entirely from already-tested pure functions (Tasks 3-5). Verified manually against a running dev server, since `NextRequest`/`NextResponse` aren't practical to construct in Vitest without pulling in Next's test harness.

- [ ] **Step 1: Implement `proxy.ts`**

```ts
// packages/hub/proxy.ts
import { NextRequest, NextResponse } from 'next/server'
import { CLIENT_NAMESPACES, findClientNamespace, NEUTRAL_BRAND } from '@/config/namespaces'
import { MASTER_COOKIE_NAME, clientCookieName } from '@/lib/auth/cookies'
import { verifyToken } from '@/lib/auth/token'
import { getRequiredEnvVar } from '@/lib/env'

function withBrandHeaders(request: NextRequest, brand: string, locked: boolean) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-hub-brand', brand)
  requestHeaders.set('x-hub-locked', locked ? '1' : '0')
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const secret = getRequiredEnvVar('HUB_COOKIE_SECRET')

  const masterTokenValue = request.cookies.get(MASTER_COOKIE_NAME)?.value
  const hasMaster = masterTokenValue ? await verifyToken(masterTokenValue, 'master', secret) : false

  const firstSegment = pathname.split('/')[1] ?? ''
  const clientNamespace = findClientNamespace(firstSegment)

  if (clientNamespace) {
    const clientTokenValue = request.cookies.get(clientCookieName(clientNamespace.id))?.value
    const hasClient = clientTokenValue
      ? await verifyToken(clientTokenValue, `client:${clientNamespace.id}`, secret)
      : false

    if (!hasMaster && !hasClient) {
      const gateUrl = new URL(`/gate/${clientNamespace.id}`, request.url)
      gateUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(gateUrl)
    }

    return withBrandHeaders(request, clientNamespace.brand, true)
  }

  if (pathname === '/gate' || pathname.startsWith('/gate/')) {
    const gateClientId = pathname.split('/')[2]
    const gateClientNamespace = gateClientId ? findClientNamespace(gateClientId) : undefined
    if (gateClientNamespace) {
      return withBrandHeaders(request, gateClientNamespace.brand, true)
    }
    return withBrandHeaders(request, NEUTRAL_BRAND, false)
  }

  if (!hasMaster) {
    const gateUrl = new URL('/gate', request.url)
    gateUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(gateUrl)
  }

  return withBrandHeaders(request, NEUTRAL_BRAND, false)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts/).*)'],
}
```

- [ ] **Step 2: Verify manually — unauthenticated requests redirect**

Create a temporary `.env.local` in `packages/hub/` (gitignored, do not commit) with test values:

```
HUB_COOKIE_SECRET=local-dev-secret-please-change
HUB_PASSWORD_MASTER=master-test-pw
HUB_PASSWORD_MARMITON=marmiton-test-pw
HUB_PASSWORD_COURSESU=coursesu-test-pw
```

Run: `pnpm --filter @mealz-product-team/hub dev`, then in another terminal:

```bash
curl -sI http://localhost:3004/ | grep -E "HTTP|location"
curl -sI http://localhost:3004/marmiton | grep -E "HTTP|location"
curl -sI http://localhost:3004/coursesu/anything | grep -E "HTTP|location"
```

Expected: each returns a `307` (or `308`) status with a `location` header pointing at `/gate?next=%2F`, `/gate/marmiton?next=%2Fmarmiton`, `/gate/coursesu?next=%2Fcoursesu%2Fanything` respectively. (`app/gate/*` pages don't exist until Task 9, so following the redirect itself 404s for now — that's expected at this point.)

- [ ] **Step 3: Commit**

```bash
git add packages/hub/proxy.ts
git commit -m "feat(hub): add proxy auth gate (master + per-client cookies, brand headers)"
```

---

### Task 7: `app/layout.tsx` — brand-aware root layout

**Files:**
- Modify: `packages/hub/app/layout.tsx`

**Interfaces:**
- Consumes: `x-hub-brand`/`x-hub-locked` request headers set by Task 6's middleware, via `headers()` from `next/headers`.
- Produces: `<html data-brand="...">`, conditionally renders the anti-FOUC script and `BrandThemeSwitcher` only when not locked.

No automated test — verified manually via rendered HTML, consistent with the rest of this monorepo's `layout.tsx` files (none have unit tests today).

- [ ] **Step 1: Rewrite `app/layout.tsx`**

```tsx
// packages/hub/app/layout.tsx
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Script from 'next/script'
import { BrandThemeSwitcher } from '@mealz-product-team/design-system/devtools/BrandThemeSwitcher/BrandThemeSwitcher'
import { getBrandThemeScript } from '@mealz-product-team/design-system/devtools/brandThemeScript'
import '@mealz-product-team/design-system/styles/index.css'

export const metadata: Metadata = {
  title: 'DS.MD — Hub',
  description: 'Hub multi-client des prototypes et du design system Mealz.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const brand = headersList.get('x-hub-brand') ?? 'neutral'
  const locked = headersList.get('x-hub-locked') === '1'

  return (
    <html lang="fr" data-color-scheme="light" data-brand={brand} suppressHydrationWarning>
      <head>
        {!locked && (
          <Script
            id="brand-theme-anti-fouc"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: getBrandThemeScript() }}
          />
        )}
      </head>
      <body>
        {children}
        {!locked && <BrandThemeSwitcher />}
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Delete the now-superseded home page**

```bash
git rm packages/hub/app/page.tsx packages/hub/app/page.css
```

(A replacement root page is added under `(master)/` in Task 12 — until then, `/` legitimately 404s past the gate, which is fine since Task 6 already redirects unauthenticated requests to `/gate` before Next's router is even reached.)

- [ ] **Step 3: Verify manually**

With the dev server running and `.env.local` from Task 6 in place, visit `http://localhost:3004/gate` in a browser (the page itself doesn't exist yet — Task 9 — so this 404s, but check the response headers): `curl -sD - http://localhost:3004/gate -o /dev/null` should show a `200` or `404` (no redirect loop). This mainly confirms the middleware + layout combination doesn't crash the server — full brand verification happens in Task 15 once real pages exist.

- [ ] **Step 4: Commit**

```bash
git add packages/hub/app/layout.tsx
git commit -m "feat(hub): make root layout brand-aware via middleware headers"
```

---

### Task 8: `src/lib/auth/safeNext.ts` and `src/lib/auth/actions.ts` — login Server Actions

**Files:**
- Create: `packages/hub/src/lib/auth/safeNext.ts`
- Test: `packages/hub/src/lib/auth/safeNext.test.ts`
- Create: `packages/hub/src/lib/auth/actions.ts`

**Interfaces:**
- Consumes: `getRequiredEnvVar` (Task 3), `constantTimeEqual` (Task 3), `MASTER_COOKIE_NAME`, `clientCookieName`, `COOKIE_MAX_AGE_SECONDS`, `signToken` (Task 4), `MASTER_PASSWORD_ENV_VAR`, `findClientNamespace` (Task 5).
- Produces: `safeNext(rawNext: string, fallback: string): string`, `authenticateMaster(formData: FormData): Promise<void>`, `authenticateClient(clientId: string, formData: FormData): Promise<void>` — the two Server Actions are consumed by Task 9's gate pages.

**Correction (found in the final whole-branch review):** an earlier version of this task inlined `safeNext` in `actions.ts` as `rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : fallback`. That still lets a redirect target like `/\evil.com` or `/\/evil.com` through — the WHATWG URL parser treats a leading `\` the same as `/` in the authority position for `http(s)` URLs, so those resolve to an external `https://evil.com` origin despite passing both `startsWith` checks. Prefix-checking a string can never fully answer "does this resolve off-site" — only resolving it against a fixed base URL and checking the resulting origin can. `safeNext` is extracted to its own file specifically so this security-relevant logic is unit-tested (it has zero Next.js dependencies — the "Server Actions aren't practical to unit test" reasoning below applies to `authenticateMaster`/`authenticateClient`, not to this pure function).

- [ ] **Step 1: Write the failing tests for `safeNext`**

```ts
// packages/hub/src/lib/auth/safeNext.test.ts
import { describe, expect, it } from 'vitest'
import { safeNext } from './safeNext'

describe('safeNext', () => {
  it('passes through a normal relative path', () => {
    expect(safeNext('/marmiton', '/')).toBe('/marmiton')
  })

  it('preserves query string and hash', () => {
    expect(safeNext('/marmiton?next=%2Fx#y', '/')).toBe('/marmiton?next=%2Fx#y')
  })

  it('falls back for a value not starting with /', () => {
    expect(safeNext('evil.com', '/')).toBe('/')
  })

  it('falls back for a protocol-relative URL', () => {
    expect(safeNext('//evil.com', '/')).toBe('/')
  })

  it('falls back for a backslash-authority URL', () => {
    expect(safeNext('/\\evil.com', '/')).toBe('/')
    expect(safeNext('/\\/evil.com', '/')).toBe('/')
  })

  it('falls back for a fully-qualified external URL', () => {
    expect(safeNext('https://evil.com', '/')).toBe('/')
  })

  it('falls back for an empty string', () => {
    expect(safeNext('', '/fallback')).toBe('/fallback')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mealz-product-team/hub test safeNext.test`
Expected: FAIL — module `./safeNext` doesn't exist yet.

- [ ] **Step 3: Implement `safeNext.ts`**

```ts
// packages/hub/src/lib/auth/safeNext.ts

/**
 * Validates a redirect target by resolving it against a fixed, invalid-TLD
 * base URL and checking the resolved origin didn't change — the only
 * reliable way to answer "does this resolve off-site", since prefix checks
 * like `startsWith('/') && !startsWith('//')` miss browser URL-parsing
 * quirks (e.g. a leading backslash is treated as `/` in the authority
 * position for http(s) URLs, so "/\evil.com" resolves externally despite
 * passing those checks).
 */
export function safeNext(rawNext: string, fallback: string): string {
  // A value not starting with "/" (including the empty string) can never
  // resolve to a same-origin path — reject it up front. This does not
  // weaken the backslash/protocol-relative defense below: "//evil.com" and
  // "/\evil.com" both still start with "/" and fall through to the
  // origin check, which is what actually catches them.
  if (!rawNext.startsWith('/')) {
    return fallback
  }

  try {
    const url = new URL(rawNext, 'http://hub.invalid')
    if (url.origin !== 'http://hub.invalid') {
      return fallback
    }
    return url.pathname + url.search + url.hash
  } catch {
    return fallback
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @mealz-product-team/hub test safeNext.test`
Expected: PASS (7 tests)

- [ ] **Step 5: Implement `actions.ts`**, importing `safeNext` instead of redefining it

```ts
// packages/hub/src/lib/auth/actions.ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRequiredEnvVar } from '@/lib/env'
import { constantTimeEqual } from './compare'
import { MASTER_COOKIE_NAME, clientCookieName, COOKIE_MAX_AGE_SECONDS } from './cookies'
import { signToken } from './token'
import { safeNext } from './safeNext'
import { MASTER_PASSWORD_ENV_VAR, findClientNamespace } from '@/config/namespaces'

export async function authenticateMaster(formData: FormData) {
  const password = String(formData.get('password') ?? '')
  const next = safeNext(String(formData.get('next') ?? '/'), '/')

  const expected = getRequiredEnvVar(MASTER_PASSWORD_ENV_VAR)
  if (!constantTimeEqual(password, expected)) {
    redirect(`/gate?next=${encodeURIComponent(next)}&error=1`)
  }

  const secret = getRequiredEnvVar('HUB_COOKIE_SECRET')
  const expiresAt = Date.now() + COOKIE_MAX_AGE_SECONDS * 1000
  const token = await signToken('master', expiresAt, secret)

  const cookieStore = await cookies()
  cookieStore.set(MASTER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: '/',
  })

  redirect(next)
}

export async function authenticateClient(clientId: string, formData: FormData) {
  const namespace = findClientNamespace(clientId)
  if (!namespace) {
    redirect('/')
  }

  const password = String(formData.get('password') ?? '')
  const next = safeNext(String(formData.get('next') ?? `/${clientId}`), `/${clientId}`)

  const expected = getRequiredEnvVar(namespace.passwordEnvVar)
  if (!constantTimeEqual(password, expected)) {
    redirect(`/gate/${clientId}?next=${encodeURIComponent(next)}&error=1`)
  }

  const secret = getRequiredEnvVar('HUB_COOKIE_SECRET')
  const expiresAt = Date.now() + COOKIE_MAX_AGE_SECONDS * 1000
  const token = await signToken(`client:${clientId}`, expiresAt, secret)

  const cookieStore = await cookies()
  cookieStore.set(clientCookieName(clientId), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: `/${clientId}`,
  })

  redirect(next)
}
```

- [ ] **Step 6: Type-check**

Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit`
Expected: no errors referencing `src/lib/auth/actions.ts` or `src/lib/auth/safeNext.ts`.

- [ ] **Step 7: Commit**

```bash
git add packages/hub/src/lib/auth/safeNext.ts packages/hub/src/lib/auth/safeNext.test.ts packages/hub/src/lib/auth/actions.ts
git commit -m "feat(hub): add master and per-client login Server Actions"
```

---

### Task 9: Gate pages — `app/gate/page.tsx` and `app/gate/[client]/page.tsx`

**Files:**
- Create: `packages/hub/app/gate/page.tsx`
- Create: `packages/hub/app/gate/gate.css`
- Create: `packages/hub/app/gate/[client]/page.tsx`

**Interfaces:**
- Consumes: `authenticateMaster`, `authenticateClient` (Task 8), `findClientNamespace` (Task 5).
- Produces: the two password-entry pages the middleware (Task 6) redirects unauthenticated visitors to.

- [ ] **Step 1: Create `app/gate/gate.css`**

```css
.hub-gate {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-page);
  padding: var(--spacing-24);
}

.hub-gate__form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12);
  width: 100%;
  max-width: 320px;
  padding: var(--spacing-24);
  background: var(--color-surface-primary);
  border-radius: var(--shape-card);
}

.hub-gate__title {
  font-size: var(--font-size-heading-md);
  margin: 0 0 var(--spacing-8);
}

.hub-gate__label {
  font-size: var(--font-size-body-sm);
  color: var(--color-content-weak);
}

.hub-gate__input {
  padding: var(--spacing-8) var(--spacing-12);
  border: 1px solid var(--color-border-default);
  border-radius: var(--shape-input);
  font-size: var(--font-size-body-md);
}

.hub-gate__error {
  color: var(--color-semantic-danger-content);
  font-size: var(--font-size-body-sm);
  margin: 0;
}

.hub-gate__submit {
  margin-top: var(--spacing-8);
  padding: var(--spacing-8) var(--spacing-16);
  border: none;
  border-radius: var(--shape-button);
  background: var(--color-interactive-bg);
  color: var(--color-interactive-content);
  font-size: var(--font-size-body-md);
  cursor: pointer;
}
```

- [ ] **Step 2: Create `app/gate/page.tsx`**

```tsx
// packages/hub/app/gate/page.tsx
import { authenticateMaster } from '@/lib/auth/actions'
import './gate.css'

export default async function MasterGatePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams

  return (
    <main className="hub-gate">
      <form className="hub-gate__form" action={authenticateMaster}>
        <h1 className="hub-gate__title">Accès équipe</h1>
        <label className="hub-gate__label" htmlFor="password">
          Mot de passe
        </label>
        <input className="hub-gate__input" id="password" name="password" type="password" autoFocus required />
        <input type="hidden" name="next" value={next ?? '/'} />
        {error && <p className="hub-gate__error">Mot de passe incorrect.</p>}
        <button className="hub-gate__submit" type="submit">
          Entrer
        </button>
      </form>
    </main>
  )
}
```

- [ ] **Step 3: Create `app/gate/[client]/page.tsx`**

```tsx
// packages/hub/app/gate/[client]/page.tsx
import { notFound } from 'next/navigation'
import { findClientNamespace } from '@/config/namespaces'
import { authenticateClient } from '@/lib/auth/actions'
import '../gate.css'

export default async function ClientGatePage({
  params,
  searchParams,
}: {
  params: Promise<{ client: string }>
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { client } = await params
  const { next, error } = await searchParams
  const namespace = findClientNamespace(client)
  if (!namespace) {
    notFound()
  }

  const action = authenticateClient.bind(null, namespace.id)

  return (
    <main className="hub-gate">
      <form className="hub-gate__form" action={action}>
        <h1 className="hub-gate__title">Accès {namespace.label}</h1>
        <label className="hub-gate__label" htmlFor="password">
          Mot de passe
        </label>
        <input className="hub-gate__input" id="password" name="password" type="password" autoFocus required />
        <input type="hidden" name="next" value={next ?? `/${namespace.id}`} />
        {error && <p className="hub-gate__error">Mot de passe incorrect.</p>}
        <button className="hub-gate__submit" type="submit">
          Entrer
        </button>
      </form>
    </main>
  )
}
```

- [ ] **Step 4: Verify manually**

With the dev server running (`.env.local` from Task 6 still in place), open `http://localhost:3004/` in a browser — expect a redirect to `/gate` showing the "Accès équipe" form. Submit the wrong password — expect redirect back to `/gate?...&error=1` showing "Mot de passe incorrect." Submit `master-test-pw` — expect a redirect towards `/` (which still 404s until Task 12, that's fine for this task). Then visit `http://localhost:3004/marmiton` directly in a fresh incognito window (no cookies) — expect the "Accès Marmiton" form; visiting `http://localhost:3004/gate/unknown-client` should 404.

- [ ] **Step 5: Commit**

```bash
git add packages/hub/app/gate
git commit -m "feat(hub): add master and per-client gate pages"
```

---

### Task 10: `NamespaceCardGrid` component

**Files:**
- Create: `packages/hub/src/components/NamespaceCardGrid/NamespaceCardGrid.tsx`
- Create: `packages/hub/src/components/NamespaceCardGrid/NamespaceCardGrid.css`
- Test: `packages/hub/src/components/NamespaceCardGrid/NamespaceCardGrid.test.tsx`

**Interfaces:**
- Produces: `interface NamespaceCard { title: string; description: string; updatedAt: string }`, `NamespaceCardGrid({ cards, emptyMessage }: { cards: NamespaceCard[]; emptyMessage: string })`.
- Consumed by: Task 12 (`(master)/neutral/page.tsx`), Task 11 (`(client)/[client]/page.tsx`).

- [ ] **Step 1: Write the failing test**

```tsx
// packages/hub/src/components/NamespaceCardGrid/NamespaceCardGrid.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NamespaceCardGrid } from './NamespaceCardGrid'

describe('NamespaceCardGrid', () => {
  it('renders the empty message when there are no cards', () => {
    render(<NamespaceCardGrid cards={[]} emptyMessage="Rien pour l'instant." />)
    expect(screen.getByText("Rien pour l'instant.")).toBeInTheDocument()
  })

  it('renders one card per entry', () => {
    render(
      <NamespaceCardGrid
        cards={[
          { title: 'Prototype A', description: 'Description A', updatedAt: '01/09/2026' },
          { title: 'Prototype B', description: 'Description B', updatedAt: '02/09/2026' },
        ]}
        emptyMessage="Rien pour l'instant."
      />
    )
    expect(screen.getByText('Prototype A')).toBeInTheDocument()
    expect(screen.getByText('Description A')).toBeInTheDocument()
    expect(screen.getByText('Prototype B')).toBeInTheDocument()
    expect(screen.queryByText("Rien pour l'instant.")).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mealz-product-team/hub test NamespaceCardGrid`
Expected: FAIL — module doesn't exist yet.

- [ ] **Step 3: Create `NamespaceCardGrid.css`**

```css
.hub-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--spacing-16);
}

.hub-card-grid__card {
  padding: var(--spacing-16);
  border-radius: var(--shape-card);
  background: var(--color-surface-primary);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.hub-card-grid__card-title {
  font-size: var(--font-size-heading-sm);
  margin: 0;
}

.hub-card-grid__card-desc {
  font-size: var(--font-size-body-sm);
  color: var(--color-content-weak);
  margin: 0;
}

.hub-card-grid__card-date {
  font-size: var(--font-size-body-xs);
  color: var(--color-content-weak);
}

.hub-card-grid__empty {
  color: var(--color-content-weak);
  font-size: var(--font-size-body-md);
}
```

- [ ] **Step 4: Implement `NamespaceCardGrid.tsx`**

```tsx
// packages/hub/src/components/NamespaceCardGrid/NamespaceCardGrid.tsx
import './NamespaceCardGrid.css'

export interface NamespaceCard {
  title: string
  description: string
  updatedAt: string
}

export function NamespaceCardGrid({
  cards,
  emptyMessage,
}: {
  cards: NamespaceCard[]
  emptyMessage: string
}) {
  if (cards.length === 0) {
    return <p className="hub-card-grid__empty">{emptyMessage}</p>
  }

  return (
    <div className="hub-card-grid">
      {cards.map((card) => (
        <article className="hub-card-grid__card" key={card.title}>
          <h2 className="hub-card-grid__card-title">{card.title}</h2>
          <p className="hub-card-grid__card-desc">{card.description}</p>
          <span className="hub-card-grid__card-date">Mis à jour le {card.updatedAt}</span>
        </article>
      ))}
    </div>
  )
}

export default NamespaceCardGrid
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @mealz-product-team/hub test NamespaceCardGrid`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add packages/hub/src/components/NamespaceCardGrid
git commit -m "feat(hub): add NamespaceCardGrid component"
```

---

### Task 11: `Sidebar` component

**Files:**
- Create: `packages/hub/src/components/Sidebar/Sidebar.tsx`
- Create: `packages/hub/src/components/Sidebar/Sidebar.css`
- Test: `packages/hub/src/components/Sidebar/Sidebar.test.tsx`

**Interfaces:**
- Consumes: `CLIENT_NAMESPACES` (Task 5).
- Produces: `Sidebar()` — the Mealz group (Neutral + Guide links) and one group per client namespace.
- Consumed by: Task 12 (`(master)/layout.tsx`).

- [ ] **Step 1: Write the failing test**

```tsx
// packages/hub/src/components/Sidebar/Sidebar.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Sidebar } from './Sidebar'

describe('Sidebar', () => {
  it('renders the Mealz group with Neutral and Guide links', () => {
    render(<Sidebar />)
    expect(screen.getByText('Mealz')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Neutral' })).toHaveAttribute('href', '/neutral')
    expect(screen.getByRole('link', { name: 'Guide' })).toHaveAttribute('href', '/guide')
  })

  it('renders one group per client namespace', () => {
    render(<Sidebar />)
    expect(screen.getByText('Marmiton')).toBeInTheDocument()
    expect(screen.getByText('CoursesU')).toBeInTheDocument()
  })

  it('links each client group to its namespace route', () => {
    render(<Sidebar />)
    const marmitonLinks = screen.getAllByRole('link').filter((link) => link.getAttribute('href') === '/marmiton')
    expect(marmitonLinks).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mealz-product-team/hub test Sidebar`
Expected: FAIL — module doesn't exist yet.

- [ ] **Step 3: Create `Sidebar.css`**

```css
.hub-sidebar {
  width: 220px;
  flex-shrink: 0;
  padding: var(--spacing-16);
  border-right: 1px solid var(--color-border-default);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-20);
}

.hub-sidebar__group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.hub-sidebar__group-title {
  font-size: var(--font-size-body-xs);
  text-transform: uppercase;
  color: var(--color-content-weak);
  letter-spacing: 0.04em;
}

.hub-sidebar__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.hub-sidebar__link {
  display: block;
  padding: var(--spacing-4) var(--spacing-8);
  border-radius: var(--shape-button);
  color: var(--color-content-default);
  text-decoration: none;
  font-size: var(--font-size-body-md);
}

.hub-sidebar__link:hover {
  background: var(--color-surface-secondary);
}
```

- [ ] **Step 4: Implement `Sidebar.tsx`**

```tsx
// packages/hub/src/components/Sidebar/Sidebar.tsx
import Link from 'next/link'
import { CLIENT_NAMESPACES } from '@/config/namespaces'
import './Sidebar.css'

export function Sidebar() {
  return (
    <nav className="hub-sidebar" aria-label="Navigation du hub">
      <div className="hub-sidebar__group">
        <span className="hub-sidebar__group-title">Mealz</span>
        <ul className="hub-sidebar__list">
          <li>
            <Link className="hub-sidebar__link" href="/neutral">
              Neutral
            </Link>
          </li>
          <li>
            <Link className="hub-sidebar__link" href="/guide">
              Guide
            </Link>
          </li>
        </ul>
      </div>
      {CLIENT_NAMESPACES.map((namespace) => (
        <div className="hub-sidebar__group" key={namespace.id}>
          <span className="hub-sidebar__group-title">{namespace.label}</span>
          <ul className="hub-sidebar__list">
            <li>
              <Link className="hub-sidebar__link" href={`/${namespace.id}`}>
                Prototypes
              </Link>
            </li>
          </ul>
        </div>
      ))}
    </nav>
  )
}

export default Sidebar
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @mealz-product-team/hub test Sidebar`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add packages/hub/src/components/Sidebar
git commit -m "feat(hub): add Sidebar component (Mealz + per-client groups)"
```

---

### Task 12: Master shell — `(master)` layout, root redirect, Neutral and Guide stub pages

**Files:**
- Create: `packages/hub/app/(master)/master-shell.css`
- Create: `packages/hub/app/(master)/layout.tsx`
- Create: `packages/hub/app/(master)/page.tsx`
- Create: `packages/hub/app/(master)/neutral/page.tsx`
- Create: `packages/hub/app/(master)/guide/page.tsx`

**Interfaces:**
- Consumes: `Sidebar` (Task 11), `NamespaceCardGrid` (Task 10).
- Produces: `/` (redirects to `/neutral`), `/neutral` (stub list), `/guide` (stub placeholder) — all wrapped in the sidebar shell.

- [ ] **Step 1: Create `app/(master)/master-shell.css`**

```css
.hub-shell {
  display: flex;
  min-height: 100vh;
}

.hub-shell__content {
  flex: 1;
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

- [ ] **Step 2: Create `app/(master)/layout.tsx`**

```tsx
// packages/hub/app/(master)/layout.tsx
import { Sidebar } from '@/components/Sidebar/Sidebar'
import './master-shell.css'

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hub-shell">
      <Sidebar />
      <main className="hub-shell__content">{children}</main>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/(master)/page.tsx`**

```tsx
// packages/hub/app/(master)/page.tsx
import { redirect } from 'next/navigation'

export default function MasterRootPage() {
  redirect('/neutral')
}
```

- [ ] **Step 4: Create `app/(master)/neutral/page.tsx`**

```tsx
// packages/hub/app/(master)/neutral/page.tsx
import { NamespaceCardGrid } from '@/components/NamespaceCardGrid/NamespaceCardGrid'

export default function NeutralPage() {
  return (
    <section>
      <h1 className="hub-namespace-page__title">Neutral</h1>
      <NamespaceCardGrid cards={[]} emptyMessage="Aucun prototype migré pour l'instant." />
    </section>
  )
}
```

- [ ] **Step 5: Create `app/(master)/guide/page.tsx`**

```tsx
// packages/hub/app/(master)/guide/page.tsx
export default function GuidePage() {
  return (
    <section>
      <h1 className="hub-namespace-page__title">Guide</h1>
      <p className="hub-namespace-page__placeholder">Bientôt disponible.</p>
    </section>
  )
}
```

- [ ] **Step 6: Verify manually**

With the dev server running and a valid `hub_master` cookie (from Task 9's manual login), visit `http://localhost:3004/`: expect a redirect to `/neutral`, sidebar visible on the left (Mealz: Neutral, Guide; Marmiton; CoursesU groups), "Aucun prototype migré pour l'instant." shown. Visit `/guide`: expect "Bientôt disponible." Confirm no `BrandThemeSwitcher` FAB button is missing here — wait, `/neutral` and `/guide` are NOT locked (per middleware, only known client namespaces get `locked=true`), so the switcher SHOULD be visible here: confirm the palette FAB is present bottom-right.

- [ ] **Step 7: Commit**

```bash
git add "packages/hub/app/(master)"
git commit -m "feat(hub): add master shell (sidebar) with Neutral and Guide stub pages"
```

---

### Task 13: Client shell — `(client)/[client]` layout and stub page

**Files:**
- Create: `packages/hub/app/(client)/client-page.css`
- Create: `packages/hub/app/(client)/[client]/layout.tsx`
- Create: `packages/hub/app/(client)/[client]/page.tsx`

**Interfaces:**
- Consumes: `findClientNamespace` (Task 5), `NamespaceCardGrid` (Task 10).
- Produces: `/<client>` for each known client namespace — no sidebar, locked brand (already enforced by the root layout via Task 6/7's headers), 404 for unknown client ids.

- [ ] **Step 1: Create `app/(client)/client-page.css`**

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

**Correction (found in the final whole-branch review):** an earlier version of this task claimed `.hub-namespace-page__title`/`.hub-namespace-page__placeholder` didn't need redefining here because "both stylesheets end up bundled into the same app." That's wrong — Next.js App Router bundles CSS **per route group**, not per app: `master-shell.css` (imported only by `(master)/layout.tsx`) ends up in a chunk that never loads on `/marmiton` or `/coursesu`, so `(client)/[client]/page.tsx`'s `<h1 className="hub-namespace-page__title">` rendered with no styling at all — on the one page external clients actually see. The two rules are duplicated here deliberately (not extracted to a shared file) because they're genuinely separate CSS bundles by Next's design; a shared file would need to be imported by the root layout to guarantee it's always loaded, which is unnecessary weight on every request just for two rules used by two route groups.

- [ ] **Step 2: Create `app/(client)/[client]/layout.tsx`**

```tsx
// packages/hub/app/(client)/[client]/layout.tsx
import { notFound } from 'next/navigation'
import { findClientNamespace } from '@/config/namespaces'
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

  return <div className="hub-client-shell">{children}</div>
}
```

- [ ] **Step 3: Create `app/(client)/[client]/page.tsx`**

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
    <section>
      <h1 className="hub-namespace-page__title">{namespace.label}</h1>
      <NamespaceCardGrid cards={[]} emptyMessage="Aucun prototype migré pour l'instant." />
    </section>
  )
}
```

- [ ] **Step 4: Verify manually**

Visit `/marmiton` with a valid `hub_client_marmiton` cookie (or via master session): expect "Marmiton" heading, empty-state message, **no sidebar**, **no brand-switcher FAB** (locked). Visit `/marmiton/does-not-exist`: still resolves to the same page (single dynamic segment `[client]` doesn't match nested paths — this is expected; deeper proto routes are added in future plans). Visit `/unknown-brand` while master-authenticated: expect a 404 page.

- [ ] **Step 5: Commit**

```bash
git add "packages/hub/app/(client)"
git commit -m "feat(hub): add locked client shell with stub page"
```

---

### Task 14: `.env.example` and `docs/BRIEF.md`

**Files:**
- Create: `packages/hub/.env.example`
- Modify: `packages/hub/docs/BRIEF.md`

**Interfaces:** None — documentation only.

- [ ] **Step 1: Create `.env.example`**

```bash
# packages/hub/.env.example
# Hub — variables d'environnement requises. Ne jamais commiter de vraies
# valeurs : copier ce fichier en .env.local (gitignoré) pour le dev local,
# et configurer les vraies valeurs dans les variables d'env Netlify pour prod.

# Secret de signature des cookies de session (chaîne aléatoire longue,
# ex. généré via `openssl rand -hex 32`).
HUB_COOKIE_SECRET=

# Mot de passe de session équipe — protège la racine "/" et débloque
# tous les espaces (Neutral, Guide, tous les clients) sans re-saisie.
HUB_PASSWORD_MASTER=

# Mots de passe par client externe — un par entrée de CLIENT_NAMESPACES
# (src/config/namespaces.ts), dérivés du nom de la brand en majuscules.
HUB_PASSWORD_MARMITON=
HUB_PASSWORD_COURSESU=
```

- [ ] **Step 2: Rewrite `docs/BRIEF.md`**

```markdown
# Brief — packages/hub

## Intention

Hub multi-client des prototypes et du design system Mealz. Anciennement
`packages/home` (liste de liens vers des sites Netlify indépendants) —
repensé en app unique hébergeant directement le contenu, pour permettre le
partage de composants entre prototypes et une distribution contrôlée par
client externe.

Voir le design complet : [`docs/superpowers/specs/2026-09-01-hub-multi-client-design.md`](../../../docs/superpowers/specs/2026-09-01-hub-multi-client-design.md)
et le plan d'implémentation du squelette : [`docs/superpowers/plans/2026-09-01-hub-skeleton.md`](../../../docs/superpowers/plans/2026-09-01-hub-skeleton.md).

## Décisions clés (squelette)

- **Un seul package Next.js**, pas de packages séparés + lib partagée : le
  partage de code entre prototypes prime sur l'isolation de déploiement.
  Le risque est assumé au niveau du process (on ne push pas de code cassé).
- **Deux niveaux de mot de passe** : un mot de passe "master" protège la
  racine `/` et débloque tout (session équipe) ; un mot de passe par client
  externe (`marmiton`, `coursesu`) protège uniquement `/<client>/*`.
  Cookies httpOnly signés (HMAC via Web Crypto), jamais de secret en clair
  dans le code — voir `.env.example`.
- **Brand verrouillée par client** : `/<client>/*` fixe `data-brand` côté
  serveur (via des headers posés par `proxy.ts`, lus par
  `app/layout.tsx`) et n'affiche jamais `BrandThemeSwitcher`.
- **Sidebar façon "Design Studio"** (visible uniquement en session master) :
  groupe **Mealz** (Neutral + Guide, extensible plus tard), un groupe par
  client externe.
- **`src/config/namespaces.ts`** dérive la liste des clients directement du
  registre `BRANDS` du design-system (`neutral` exclu) — ajouter un client
  revient à ajouter une brand côté design-system + son mot de passe en env
  var, pas à modifier ce fichier à la main.

## Statut

Squelette seul pour l'instant (pas de vrai prototype migré) — les pages
`/neutral` et `/<client>` affichent un état vide. La migration de
`marmiton-prototype`, puis des protos neutres, fait l'objet de plans
séparés (voir la section "Migration progressive" de la spec).

## Limites connues (squelette, décisions assumées pour l'instant)

- **Pas de protection anti brute-force sur les gates** : un mot de passe
  partagé sans limite de tentatives HTTP est toute la barrière de sécurité
  d'un espace client. Acceptable pour un squelette à mots de passe distribués
  manuellement à une poignée de personnes, mais à revisiter avant d'exposer
  un vrai client externe en continu.
- **Pas de déconnexion, pas de redirection si déjà authentifié sur `/gate`** :
  les cookies durent un an sans moyen de les effacer depuis l'UI ; visiter
  `/gate` déjà authentifié réaffiche le formulaire plutôt que de rediriger.
```

- [ ] **Step 3: Commit**

```bash
git add packages/hub/.env.example packages/hub/docs/BRIEF.md
git commit -m "docs(hub): document required env vars and the new hub role"
```

---

### Task 15: Full manual integration verification

**Files:** none (verification only).

- [ ] **Step 1: Run the automated test suite**

Run: `pnpm --filter @mealz-product-team/hub test`
Expected: all tests from Tasks 3, 4, 5, 10, 11 pass (target: 25 tests across `env.test.ts`, `compare.test.ts`, `cookies.test.ts`, `token.test.ts`, `namespaces.test.ts`, `NamespaceCardGrid.test.tsx`, `Sidebar.test.tsx`).

- [ ] **Step 2: Type-check and build**

Run: `pnpm --filter @mealz-product-team/hub exec tsc --noEmit`
Expected: no errors.

Run: `pnpm --filter @mealz-product-team/hub build`
Expected: build succeeds (this also validates `proxy.ts` compiles — Proxy always runs on the Node.js runtime in Next 16, not Edge).

- [ ] **Step 3: Start the dev server with test credentials**

Ensure `packages/hub/.env.local` (gitignored) has the same test values as Task 6's Step 2. Run: `pnpm --filter @mealz-product-team/hub dev`.

- [ ] **Step 4: Verify the master session unlocks everything, using the gstack browse tool**

```bash
_ROOT=$(git rev-parse --show-toplevel)
B="$_ROOT/.claude/skills/gstack/browse/dist/browse"
$B goto http://localhost:3004/
$B snapshot -i   # expect the "Accès équipe" form
$B fill '#password' 'master-test-pw'
$B click 'button[type=submit]'
$B wait --load
$B text           # expect "Neutral" heading + "Aucun prototype migré pour l'instant."
$B is visible '.hub-sidebar'          # expect true
$B is visible '.brand-switcher__fab'  # expect true (not locked on /neutral)
$B goto http://localhost:3004/marmiton
$B text           # expect "Marmiton" heading, no re-prompt (master cookie covers it)
$B is visible '.hub-sidebar'          # expect false — locked client view has no sidebar
$B is visible '.brand-switcher__fab'  # expect false — locked, no switcher
$B css html data-brand                # expect "marmiton"
```

- [ ] **Step 5: Verify a client-only session stays isolated to its own namespace**

```bash
B="$_ROOT/.claude/skills/gstack/browse/dist/browse"
$B js "document.cookie = 'hub_master=; Max-Age=0; path=/'"
$B goto http://localhost:3004/coursesu
$B snapshot -i     # expect "Accès CoursesU" form (master cookie cleared, no coursesu cookie yet)
$B fill '#password' 'coursesu-test-pw'
$B click 'button[type=submit]'
$B wait --load
$B css html data-brand   # expect "coursesu"
$B goto http://localhost:3004/marmiton
$B snapshot -i     # expect "Accès Marmiton" form — the coursesu cookie does NOT unlock marmiton
```

- [ ] **Step 6: Verify a wrong password is rejected**

```bash
$B goto http://localhost:3004/gate
$B fill '#password' 'wrong-password'
$B click 'button[type=submit]'
$B wait --load
$B text   # expect "Mot de passe incorrect."
```

- [ ] **Step 7: Report results**

If every check in Steps 4-6 matches its expectation, the skeleton is done: DONE. If any check fails, note exactly which assertion failed and its actual output before fixing — don't silently patch and re-run without recording what broke (this plan's tasks are all independently re-checkable via the same commands above).

