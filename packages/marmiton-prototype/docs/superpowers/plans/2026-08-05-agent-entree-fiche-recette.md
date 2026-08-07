# Point d'entrée agent sur la fiche recette — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un point d'entrée agent sur `app/(prototypes)/recipe/page.tsx` — une barre sticky (input + chips de pré-prompts) qui ouvre une conversation scopée à la recette affichée (substitution, astuce, écart panier, allergènes), sans toucher au moteur multi-recette existant.

**Architecture:** Une nouvelle fonction de traitement pure `answerRecipeAsk` (dans `src/lib/recipeAskScript.ts`) réutilise les briques déjà éprouvées d'`agentScript.ts` (`extractSlots`, `selectTip`, `pantryMatch`, `constraintLabel`, `RELAXED_REASON`) sans recherche multi-recette. Deux nouveaux composants React : `RecipeAskBar` (barre sticky pleine largeur, toujours visible) et `RecipeAgentDrawer` (le `Drawer` DS déjà utilisé sur cette page pour le panier, réutilisé pour la conversation). `page.tsx` calcule les chips une fois et les passe aux deux.

**Tech Stack:** Next.js 16 / React 19, TypeScript, Vitest (logique pure uniquement — ce package n'a pas de setup jsdom/RTL), composants `@mealz-product-team/design-system`.

## Global Constraints

- Aucune nouvelle donnée mock : les chips viennent uniquement des tags déjà présents dans `recipe.reviews` (`src/data/types/recipe.ts`, déjà existant).
- Ne pas dupliquer la logique multi-recette d'`agentScript.ts` — seule modification autorisée sur ce fichier : exporter `RELAXED_REASON` (actuellement privé).
- Composants DS autorisés pour cette passe : `Drawer`, `InputField`, `ChipTag`, `Button`, `Loading` — cf. `design-system/docs/DESIGN.md` §3 (déjà consulté pendant le brainstorming, pas de nouveau composant à créer).
- Toujours utiliser une variable sémantique (`--color-semantic-*`, `--color-content-*`...), jamais une primitive ni un hex en dur (sauf `#fff` déjà utilisé ainsi dans `AgentConversation.css` pour le texte sur bulle utilisateur — même convention à reprendre ici).
- CSS global classique (fichiers `.css` importés, pas de CSS modules) — suit la convention déjà en place dans `src/components/agent/` et `src/components/product/`.
- Tests automatisés uniquement pour `src/lib/recipeAskScript.ts` (logique pure, Vitest). Les deux composants React se vérifient manuellement en dev server — ce package n'a ni `@testing-library/react` ni environnement `jsdom` configuré, et aucun composant existant (`AgentConversation.tsx` compris) n'a de test. Ne pas ajouter cette dépendance dans ce plan — hors scope.

---

### Task 1: Moteur mono-recette (`src/lib/recipeAskScript.ts`)

**Files:**
- Modify: `packages/marmiton-prototype/src/lib/agentScript.ts:82` (exporter `RELAXED_REASON`)
- Create: `packages/marmiton-prototype/src/lib/recipeAskScript.ts`
- Test: `packages/marmiton-prototype/src/lib/__tests__/recipeAskScript.test.ts`

**Interfaces:**
- Consomme d'`agentScript.ts` (déjà exportés, sauf `RELAXED_REASON` à exporter dans ce task) : `extractSlots(text: string, prev: AgentSlots): AgentSlots`, `selectTip(recipe: Recipe, slots: AgentSlots): string | undefined`, `pantryMatch(recipe: Recipe, slots: AgentSlots): PantryMatch | null`, `constraintLabel(recipe: Recipe, slots: AgentSlots, matched: boolean): string | undefined`, `RELAXED_REASON: Record<Constraint, string>`, `EMPTY_SLOTS: AgentSlots`, types `AgentSlots`, `PantryMatch`.
- Produit (utilisé par Task 2 et Task 3) :
  - `export type ReviewTag = 'enfant' | 'sans-sauce' | 'vegetarien' | 'sans-gluten' | 'sans-lactose' | 'time'`
  - `export interface RecipeChip { tag: ReviewTag; label: string; text: string }`
  - `export function buildRecipeChips(recipe: Recipe): RecipeChip[]`
  - `export interface RecipeAskAnswer { message: string; tip?: string; pantryMatch: PantryMatch | null; communityQuote?: { text: string }; constraintLabel?: string; allergens?: string[] }`
  - `export function answerRecipeAsk(recipe: Recipe, text: string, prevSlots: AgentSlots): { slots: AgentSlots; answer: RecipeAskAnswer }`

- [x] **Step 1: Exporter `RELAXED_REASON` dans `agentScript.ts`**

Dans `packages/marmiton-prototype/src/lib/agentScript.ts`, ligne 82, remplacer :

```ts
const RELAXED_REASON: Record<Constraint, string> = {
```

par :

```ts
export const RELAXED_REASON: Record<Constraint, string> = {
```

Aucun autre changement dans ce fichier.

- [x] **Step 2: Écrire les tests (échouent, le module n'existe pas encore)**

Créer `packages/marmiton-prototype/src/lib/__tests__/recipeAskScript.test.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { buildRecipeChips, answerRecipeAsk } from '../recipeAskScript'
import { EMPTY_SLOTS } from '../agentScript'
import type { Recipe } from '../../data/types/recipe'

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 'r-test',
    name: 'Recette test',
    imageUrl: '',
    servings: 4,
    duration: 20,
    ingredients: [],
    estimatedPricePerServing: 0,
    tags: [],
    ...overrides,
  }
}

describe('buildRecipeChips', () => {
  it("retourne un tableau vide quand la recette n'a pas d'avis", () => {
    expect(buildRecipeChips(makeRecipe())).toEqual([])
  })

  it("retourne un chip par tag distinct présent dans les avis, dans l'ordre canonique", () => {
    const recipe = makeRecipe({
      reviews: [
        { text: 'a', tag: 'time' },
        { text: 'b', tag: 'enfant' },
        { text: 'c', tag: 'sans-sauce' },
      ],
    })
    const chips = buildRecipeChips(recipe)
    expect(chips.map((c) => c.tag)).toEqual(['enfant', 'sans-sauce', 'time'])
  })

  it('déduplique les tags répétés sur plusieurs avis', () => {
    const recipe = makeRecipe({
      reviews: [
        { text: 'a', tag: 'enfant' },
        { text: 'b', tag: 'enfant' },
      ],
    })
    expect(buildRecipeChips(recipe)).toHaveLength(1)
  })

  it('plafonne à 3 chips même si plus de tags distincts sont présents', () => {
    const recipe = makeRecipe({
      reviews: [
        { text: 'a', tag: 'enfant' },
        { text: 'b', tag: 'sans-sauce' },
        { text: 'c', tag: 'vegetarien' },
        { text: 'd', tag: 'sans-gluten' },
      ],
    })
    const chips = buildRecipeChips(recipe)
    expect(chips).toHaveLength(3)
    expect(chips.map((c) => c.tag)).toEqual(['enfant', 'sans-sauce', 'vegetarien'])
  })

  it('chaque chip porte un label affichable et un texte de requête distincts', () => {
    const recipe = makeRecipe({ reviews: [{ text: 'a', tag: 'sans-lactose' }] })
    const [chip] = buildRecipeChips(recipe)
    expect(chip.label).toBe('Sans lactose ?')
    expect(chip.text).toBe('Une version sans lactose ?')
  })
})

describe('answerRecipeAsk', () => {
  it("confirme la contrainte quand le tag de la recette la couvre, et remonte l'avis correspondant", () => {
    const recipe = makeRecipe({
      tags: ['vegetarien'],
      reviews: [{ text: 'La ricotta remplace bien la viande.', tag: 'vegetarien' }],
    })
    const { answer } = answerRecipeAsk(recipe, 'Une alternative végétarienne ?', EMPTY_SLOTS)
    expect(answer.message).toBe('Oui, cette recette est végétarienne.')
    expect(answer.constraintLabel).toBe('Végétarien')
    expect(answer.communityQuote).toEqual({ text: 'La ricotta remplace bien la viande.' })
  })

  it("indique que la contrainte n'est pas couverte quand le tag est absent de la recette", () => {
    const recipe = makeRecipe({ tags: [] })
    const { answer } = answerRecipeAsk(recipe, 'Une version sans gluten ?', EMPTY_SLOTS)
    expect(answer.message).toBe("Cette recette n'est pas signalée comme sans gluten.")
    expect(answer.constraintLabel).toBeUndefined()
    expect(answer.communityQuote).toBeUndefined()
  })

  it("liste les allergènes déclarés quand la question porte sur une allergie", () => {
    const recipe = makeRecipe({ allergens: ['Lait', 'Œufs'] })
    const { answer } = answerRecipeAsk(recipe, "j'ai une allergie", EMPTY_SLOTS)
    expect(answer.message).toBe('Cette recette contient : lait, œufs.')
    expect(answer.allergens).toEqual(['Lait', 'Œufs'])
  })

  it("signale l'absence d'allergène déclaré quand la liste est vide", () => {
    const recipe = makeRecipe({ allergens: [] })
    const { answer } = answerRecipeAsk(recipe, 'il y a une allergie chez nous', EMPTY_SLOTS)
    expect(answer.message).toBe("Aucun allergène n'est signalé pour cette recette.")
  })

  it('remonte l\'avis tagué time quand la question porte sur la rapidité, quelle que soit la durée réelle', () => {
    const recipe = makeRecipe({
      duration: 90,
      reviews: [{ text: '90 minutes au four, mais 10 minutes de préparation seulement.', tag: 'time' }],
    })
    const { answer } = answerRecipeAsk(recipe, "C'est rapide à faire ?", EMPTY_SLOTS)
    expect(answer.communityQuote).toEqual({ text: '90 minutes au four, mais 10 minutes de préparation seulement.' })
  })

  it("retourne l'écart panier quand des ingrédients sont mentionnés dans la question", () => {
    const recipe = makeRecipe({
      ingredients: [
        { id: 'i1', name: 'Poulet', quantity: 1, unit: 'pièce', emoji: '🍗', productId: 'p1' },
        { id: 'i2', name: 'Citron', quantity: 1, unit: 'pièce', emoji: '🍋', productId: 'p2' },
      ],
    })
    const { answer } = answerRecipeAsk(recipe, "j'ai déjà du poulet", EMPTY_SLOTS)
    expect(answer.pantryMatch).toEqual({ matchedIngredientNames: ['Poulet'], missingCount: 1 })
  })

  it("retourne l'astuce anti-échec de la recette quand elle existe", () => {
    const recipe = makeRecipe({ tip: 'Ajoutez le jus de citron hors du feu.' })
    const { answer } = answerRecipeAsk(recipe, 'une question sans rapport', EMPTY_SLOTS)
    expect(answer.tip).toBe('Ajoutez le jus de citron hors du feu.')
  })

  it("retourne un message générique quand rien n'est reconnu dans la question", () => {
    const recipe = makeRecipe()
    const { answer } = answerRecipeAsk(recipe, 'bonjour', EMPTY_SLOTS)
    expect(answer.message).toBe('Voici ce que je peux vous dire sur cette recette.')
  })

  it('conserve les slots précédents entre deux tours (contrainte posée puis ingrédient ajouté)', () => {
    const recipe = makeRecipe({ tags: ['vegetarien'] })
    const first = answerRecipeAsk(recipe, 'Une alternative végétarienne ?', EMPTY_SLOTS)
    const second = answerRecipeAsk(recipe, "j'ai du poulet", first.slots)
    expect(second.slots.constraint).toBe('vegetarien')
  })
})
```

- [x] **Step 3: Lancer les tests pour vérifier qu'ils échouent**

Run: `cd packages/marmiton-prototype && npx vitest run src/lib/__tests__/recipeAskScript.test.ts`
Expected: FAIL — `Cannot find module '../recipeAskScript'` (le module n'existe pas encore).

- [x] **Step 4: Implémenter `recipeAskScript.ts`**

Créer `packages/marmiton-prototype/src/lib/recipeAskScript.ts` :

```ts
import { extractSlots, selectTip, pantryMatch, constraintLabel, RELAXED_REASON } from './agentScript'
import type { AgentSlots, PantryMatch } from './agentScript'
import type { Recipe } from '../data/types/recipe'

/**
 * Moteur scopé à une seule recette (fiche recette, parcours D du brief Marmiton
 * Agentique) — distinct de `processTurn` dans `agentScript.ts`, qui cherche une recette
 * dans tout le catalogue. Ici la recette est déjà connue : la question n'est plus
 * "laquelle ?" mais "est-ce que ça marche pour moi ?". Réutilise les briques déjà
 * éprouvées du moteur multi-recette plutôt que de les dupliquer.
 */

export type ReviewTag = 'enfant' | 'sans-sauce' | 'vegetarien' | 'sans-gluten' | 'sans-lactose' | 'time'

export interface RecipeChip {
  tag: ReviewTag
  /** Libellé affiché sur le chip. */
  label: string
  /** Texte réellement soumis à `answerRecipeAsk` quand le chip est cliqué. */
  text: string
}

const CHIP_ORDER: ReviewTag[] = ['enfant', 'sans-sauce', 'vegetarien', 'sans-gluten', 'sans-lactose', 'time']

const CHIP_LABEL: Record<ReviewTag, string> = {
  enfant: 'Adapté aux enfants ?',
  'sans-sauce': 'Sans sauce ?',
  vegetarien: 'Une alternative végétarienne ?',
  'sans-gluten': 'Sans gluten ?',
  'sans-lactose': 'Sans lactose ?',
  time: 'Un moyen de gagner du temps ?',
}

const CHIP_QUERY: Record<ReviewTag, string> = {
  enfant: 'Est-ce adapté aux enfants ?',
  'sans-sauce': 'Une version sans sauce ?',
  vegetarien: 'Une alternative végétarienne ?',
  'sans-gluten': 'Une version sans gluten ?',
  'sans-lactose': 'Une version sans lactose ?',
  time: "C'est rapide à faire ?",
}

const MAX_CHIPS = 3

/**
 * Chips de pré-prompts propres à cette recette, générées depuis les tags distincts
 * présents dans ses avis mockés (`recipe.reviews`) — pas une donnée à part à maintenir,
 * cf. principe 3 du brief ("la communauté est un actif à extraire").
 */
export function buildRecipeChips(recipe: Recipe): RecipeChip[] {
  const presentTags = new Set((recipe.reviews ?? []).map((r) => r.tag))
  return CHIP_ORDER.filter((tag) => presentTags.has(tag))
    .slice(0, MAX_CHIPS)
    .map((tag) => ({ tag, label: CHIP_LABEL[tag], text: CHIP_QUERY[tag] }))
}

function findRecipeReview(recipe: Recipe, tag: ReviewTag): { text: string } | undefined {
  const found = (recipe.reviews ?? []).find((r) => r.tag === tag)
  return found ? { text: found.text } : undefined
}

export interface RecipeAskAnswer {
  message: string
  tip?: string
  pantryMatch: PantryMatch | null
  communityQuote?: { text: string }
  constraintLabel?: string
  allergens?: string[]
}

/**
 * Traite une question posée sur la recette déjà affichée. `prevSlots` permet à l'appelant
 * (le composant Drawer) de faire persister le contexte entre deux tours de la même
 * conversation, comme `processTurn` le fait pour le moteur multi-recette.
 */
export function answerRecipeAsk(
  recipe: Recipe,
  text: string,
  prevSlots: AgentSlots
): { slots: AgentSlots; answer: RecipeAskAnswer } {
  const slots = extractSlots(text, prevSlots)
  const bits: string[] = []

  let communityQuote: { text: string } | undefined
  let constraintLabelResult: string | undefined
  let allergens: string[] | undefined

  if (slots.constraint === 'allergie') {
    allergens = recipe.allergens ?? []
    bits.push(
      allergens.length > 0
        ? `Cette recette contient : ${allergens.join(', ').toLowerCase()}.`
        : "Aucun allergène n'est signalé pour cette recette."
    )
  } else if (slots.constraint) {
    const label = constraintLabel(recipe, slots, true)
    constraintLabelResult = label
    if (label) {
      bits.push(`Oui, cette recette est ${RELAXED_REASON[slots.constraint]}.`)
      communityQuote = findRecipeReview(recipe, slots.constraint)
    } else {
      bits.push(`Cette recette n'est pas signalée comme ${RELAXED_REASON[slots.constraint]}.`)
    }
  }

  if (slots.time !== undefined) {
    communityQuote = communityQuote ?? findRecipeReview(recipe, 'time')
  }

  const match = pantryMatch(recipe, slots)
  const tip = selectTip(recipe, slots)

  if (bits.length === 0) {
    bits.push('Voici ce que je peux vous dire sur cette recette.')
  }

  return {
    slots,
    answer: {
      message: bits.join(' '),
      tip,
      pantryMatch: match,
      communityQuote,
      constraintLabel: constraintLabelResult,
      allergens,
    },
  }
}
```

- [x] **Step 5: Lancer les tests pour vérifier qu'ils passent**

Run: `cd packages/marmiton-prototype && npx vitest run src/lib/__tests__/recipeAskScript.test.ts`
Expected: PASS — 13 tests verts (4 `buildRecipeChips` + 9 `answerRecipeAsk`).

- [x] **Step 6: Commit**

```bash
git add packages/marmiton-prototype/src/lib/agentScript.ts packages/marmiton-prototype/src/lib/recipeAskScript.ts packages/marmiton-prototype/src/lib/__tests__/recipeAskScript.test.ts
git commit -m "feat(marmiton-prototype): moteur mono-recette pour les questions sur la fiche recette"
```

---

### Task 2: Barre sticky (`RecipeAskBar`)

**Files:**
- Create: `packages/marmiton-prototype/src/components/product/RecipeAskBar/RecipeAskBar.tsx`
- Create: `packages/marmiton-prototype/src/components/product/RecipeAskBar/RecipeAskBar.css`

**Interfaces:**
- Consomme : `RecipeChip` (Task 1, `@/lib/recipeAskScript`) ; composants DS `Button`, `ChipTag`, `InputField` (déjà validés via `design-system/docs/DESIGN.md` §3, mêmes signatures que dans `AgentConversation.tsx`).
- Produit (utilisé par Task 4) : `export function RecipeAskBar({ chips, onOpen }: { chips: RecipeChip[]; onOpen: (message: string) => void }): JSX.Element`. `onOpen('')` = ouverture sans question pré-remplie (clic sur l'input vide) ; `onOpen(text)` = ouverture avec cette question déjà posée (clic sur un chip, ou saisie + Entrée).

- [x] **Step 1: Créer le composant**

Créer `packages/marmiton-prototype/src/components/product/RecipeAskBar/RecipeAskBar.tsx` :

```tsx
'use client'

import { useState } from 'react'
import { PaperPlaneRight } from '@phosphor-icons/react'
import { Button, ChipTag, InputField } from '@mealz-product-team/design-system'
import type { RecipeChip } from '@/lib/recipeAskScript'
import './RecipeAskBar.css'

interface RecipeAskBarProps {
  chips: RecipeChip[]
  /** Ouvre la conversation agent. Chaîne vide = ouverture sans question pré-remplie. */
  onOpen: (message: string) => void
}

export function RecipeAskBar({ chips, onOpen }: RecipeAskBarProps) {
  const [draft, setDraft] = useState('')

  function handleSubmit() {
    onOpen(draft)
    setDraft('')
  }

  return (
    <div className="recipe-ask-bar">
      {chips.length > 0 && (
        <div className="recipe-ask-bar__chips">
          {chips.map((chip) => (
            <ChipTag key={chip.tag} type="toned" size="S" label={chip.label} onClick={() => onOpen(chip.text)} />
          ))}
        </div>
      )}
      <div className="recipe-ask-bar__row">
        <InputField
          id="recipe-ask-input"
          aria-label="Poser une question sur cette recette"
          placeholder="Substituer un ingrédient, ajuster les portions..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => {
            if (!draft) onOpen('')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
        />
        <Button
          variant="primary"
          size="M"
          iconOnly={<PaperPlaneRight size={18} weight="bold" aria-hidden="true" />}
          label="Poser la question"
          onClick={handleSubmit}
        />
      </div>
    </div>
  )
}

export default RecipeAskBar
```

- [x] **Step 2: Ajouter le CSS**

Créer `packages/marmiton-prototype/src/components/product/RecipeAskBar/RecipeAskBar.css` :

```css
.recipe-ask-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
  padding: var(--spacing-8) var(--spacing-16) calc(var(--spacing-16) + env(safe-area-inset-bottom, 0px));
  background: var(--color-surface-primary);
  border-top: 1px solid var(--color-border-default);
  box-shadow: var(--elevation-300);
}

.recipe-ask-bar__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-8);
}

.recipe-ask-bar__row {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-8);
}

.recipe-ask-bar__row .input-field {
  flex: 1;
}

@media (min-width: 1024px) {
  .recipe-ask-bar {
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 1200px;
    border-radius: var(--radius-card) var(--radius-card) 0 0;
  }
}
```

- [x] **Step 3: Vérifier la compilation TypeScript**

Run: `cd packages/marmiton-prototype && npx tsc --noEmit`
Expected: aucune erreur liée à `RecipeAskBar.tsx` (le composant n'est pas encore importé nulle part, donc il doit compiler isolément sans erreur de type sur ses propres props).

- [x] **Step 4: Commit**

```bash
git add packages/marmiton-prototype/src/components/product/RecipeAskBar
git commit -m "feat(marmiton-prototype): barre sticky RecipeAskBar (input + pré-prompts)"
```

---

### Task 3: Drawer de conversation (`RecipeAgentDrawer`)

**Files:**
- Create: `packages/marmiton-prototype/src/components/agent/RecipeAgentDrawer.tsx`
- Create: `packages/marmiton-prototype/src/components/agent/RecipeAgentDrawer.css`

**Interfaces:**
- Consomme : `answerRecipeAsk`, `RecipeAskAnswer`, `RecipeChip` (Task 1, `@/lib/recipeAskScript`) ; `EMPTY_SLOTS`, `AgentSlots` (`@/lib/agentScript`) ; `Recipe` (`@/data/types/recipe`) ; composants DS `Drawer`, `Button`, `InputField`, `ChipTag`, `Loading`.
- Produit (utilisé par Task 4) : `export function RecipeAgentDrawer({ open, onClose, recipe, chips, initialMessage }: RecipeAgentDrawerProps): JSX.Element` où `RecipeAgentDrawerProps = { open: boolean; onClose: () => void; recipe: Recipe; chips: RecipeChip[]; initialMessage: string }`.

- [x] **Step 1: Créer le composant**

Créer `packages/marmiton-prototype/src/components/agent/RecipeAgentDrawer.tsx` :

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { PaperPlaneRight, CheckCircle, Lightbulb, Warning } from '@phosphor-icons/react'
import { Drawer, Button, InputField, ChipTag, Loading } from '@mealz-product-team/design-system'
import { EMPTY_SLOTS } from '@/lib/agentScript'
import type { AgentSlots } from '@/lib/agentScript'
import { answerRecipeAsk } from '@/lib/recipeAskScript'
import type { RecipeAskAnswer, RecipeChip } from '@/lib/recipeAskScript'
import type { Recipe } from '@/data/types/recipe'
import './RecipeAgentDrawer.css'

interface AskMessage {
  id: string
  role: 'user' | 'agent'
  text: string
  pending?: boolean
  answer?: RecipeAskAnswer
}

/** Délai de simulation (prototype scripté, pas de latence réseau réelle) — même logique que
 * `THINK_DELAY` dans `AgentConversation.tsx`, redéfini ici car ce composant a un cycle plus
 * court (une seule étape de réflexion, pas de recherche multi-recette à simuler en deux temps). */
const THINK_DELAY = 900

interface RecipeAgentDrawerProps {
  open: boolean
  onClose: () => void
  recipe: Recipe
  chips: RecipeChip[]
  /** Question déjà posée à l'ouverture (ex. clic sur une chip de la barre) — chaîne vide = ouverture sans question. */
  initialMessage: string
}

let messageId = 0
function newId() {
  messageId += 1
  return `ra-${messageId}`
}

export function RecipeAgentDrawer({ open, onClose, recipe, chips, initialMessage }: RecipeAgentDrawerProps) {
  const [messages, setMessages] = useState<AskMessage[]>([])
  const [slots, setSlots] = useState<AgentSlots>(EMPTY_SLOTS)
  const [draft, setDraft] = useState('')
  const processedInitial = useRef<string | null>(null)
  const threadEndRef = useRef<HTMLDivElement>(null)
  const pendingTimeouts = useRef<ReturnType<typeof setTimeout>[]>([])

  function schedule(fn: () => void, delay: number) {
    const timeoutId = setTimeout(fn, delay)
    pendingTimeouts.current.push(timeoutId)
  }

  function clearPendingTimeouts() {
    pendingTimeouts.current.forEach(clearTimeout)
    pendingTimeouts.current = []
  }

  useEffect(() => {
    if (open && initialMessage && processedInitial.current !== initialMessage) {
      processedInitial.current = initialMessage
      submitAsk(initialMessage, EMPTY_SLOTS)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialMessage])

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => clearPendingTimeouts, [])

  function submitAsk(text: string, currentSlots: AgentSlots) {
    const trimmed = text.trim()
    if (!trimmed) return

    setMessages((prev) => [...prev, { id: newId(), role: 'user', text: trimmed }])

    const id = newId()
    setMessages((prev) => [...prev, { id, role: 'agent', text: '', pending: true }])

    schedule(() => {
      const { slots: nextSlots, answer } = answerRecipeAsk(recipe, trimmed, currentSlots)
      setSlots(nextSlots)
      setMessages((prev) => prev.map((m) => (m.id === id ? { id, role: 'agent', text: answer.message, answer } : m)))
    }, THINK_DELAY)
  }

  function handleSend() {
    submitAsk(draft, slots)
    setDraft('')
  }

  function handleChip(chip: RecipeChip) {
    submitAsk(chip.text, slots)
  }

  function handleClose() {
    clearPendingTimeouts()
    onClose()
    setMessages([])
    setSlots(EMPTY_SLOTS)
    processedInitial.current = null
  }

  return (
    <Drawer open={open} onClose={handleClose} title={recipe.name} placement="right" mobilePlacement="bottom">
      <div className="recipe-ask-shell">
        <div className="recipe-ask-thread" aria-live="polite">
          {messages.map((m) => (
            <div key={m.id} className={`recipe-ask-message recipe-ask-message--${m.role}`}>
              {m.pending ? (
                <div className="recipe-ask-bubble recipe-ask-bubble--pending">
                  <Loading size="S" label="Un instant…" />
                </div>
              ) : (
                <>
                  <p className="recipe-ask-bubble">{m.text}</p>
                  {m.answer && (
                    <div className="recipe-ask-answer">
                      {m.answer.constraintLabel && <ChipTag type="toned" size="S" label={m.answer.constraintLabel} />}
                      {m.answer.allergens && m.answer.allergens.length > 0 && (
                        <p className="recipe-ask-highlight recipe-ask-highlight--warning">
                          <Warning size={16} weight="fill" aria-hidden="true" />
                          Contient : {m.answer.allergens.join(', ').toLowerCase()}
                        </p>
                      )}
                      {m.answer.communityQuote && (
                        <p className="recipe-ask-highlight recipe-ask-highlight--info recipe-ask-quote">
                          <span className="recipe-ask-quote__attribution">Selon les avis</span>
                          <span className="recipe-ask-quote__text">« {m.answer.communityQuote.text} »</span>
                        </p>
                      )}
                      {m.answer.pantryMatch && (
                        <p className="recipe-ask-highlight recipe-ask-highlight--success">
                          <CheckCircle size={16} weight="fill" aria-hidden="true" />
                          Utilise vos {m.answer.pantryMatch.matchedIngredientNames.join(', ').toLowerCase()}
                          {m.answer.pantryMatch.missingCount > 0
                            ? ` · il manque ${m.answer.pantryMatch.missingCount} produit${m.answer.pantryMatch.missingCount > 1 ? 's' : ''}`
                            : ' · vous avez tout'}
                        </p>
                      )}
                      {m.answer.tip && !m.answer.communityQuote && (
                        <p className="recipe-ask-highlight recipe-ask-highlight--info">
                          <Lightbulb size={16} weight="fill" aria-hidden="true" />
                          Astuce : {m.answer.tip}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          <div ref={threadEndRef} />
        </div>

        <div className="recipe-ask-composer">
          {chips.length > 0 && (
            <div
              className="recipe-ask-composer__suggestions"
              aria-label="Raccourcis facultatifs, vous pouvez aussi continuer à écrire"
            >
              {chips.map((chip) => (
                <ChipTag key={chip.tag} type="toned" size="S" label={chip.label} onClick={() => handleChip(chip)} />
              ))}
            </div>
          )}
          <div className="recipe-ask-composer__row">
            <InputField
              id="recipe-ask-composer-input"
              aria-label="Continuer la conversation"
              placeholder="Continuez à écrire, par exemple « et sans lactose ? »"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend()
              }}
            />
            <Button
              variant="primary"
              size="M"
              iconOnly={<PaperPlaneRight size={18} weight="bold" aria-hidden="true" />}
              label="Envoyer"
              onClick={handleSend}
            />
          </div>
        </div>
      </div>
    </Drawer>
  )
}

export default RecipeAgentDrawer
```

- [x] **Step 2: Ajouter le CSS**

Créer `packages/marmiton-prototype/src/components/agent/RecipeAgentDrawer.css` :

```css
.recipe-ask-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.recipe-ask-thread {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
  padding: var(--spacing-16);
}

.recipe-ask-message {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
  max-width: 88%;
}

.recipe-ask-message--user {
  align-self: flex-end;
  align-items: flex-end;
}

.recipe-ask-message--agent {
  align-self: flex-start;
  align-items: flex-start;
}

.recipe-ask-bubble {
  font-size: 14px;
  line-height: 1.5;
  padding: var(--spacing-8) var(--spacing-16);
  border-radius: var(--shape-sheet);
  color: var(--color-content-default);
}

.recipe-ask-message--user .recipe-ask-bubble {
  background: var(--color-interactive-bg);
  color: #fff;
}

.recipe-ask-message--agent .recipe-ask-bubble {
  background: var(--color-surface-secondary);
}

.recipe-ask-bubble--pending {
  display: inline-flex;
}

.recipe-ask-answer {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  align-items: flex-start;
}

.recipe-ask-highlight {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-8);
  padding: var(--spacing-8);
  border-radius: var(--radius-card);
  font-size: var(--font-size-body-xs);
  line-height: 1.4;
}

.recipe-ask-highlight--success {
  background: var(--color-semantic-success-bg-light);
  color: var(--color-semantic-success-content);
}

.recipe-ask-highlight--info {
  background: var(--color-semantic-info-bg-light);
  color: var(--color-semantic-info-content);
}

.recipe-ask-highlight--warning {
  background: var(--color-semantic-warning-bg-light);
  color: var(--color-semantic-warning-content);
}

.recipe-ask-highlight svg {
  flex-shrink: 0;
  margin-top: 1px;
}

.recipe-ask-quote {
  flex-direction: column;
  gap: var(--spacing-4);
}

.recipe-ask-quote__attribution {
  font-size: var(--font-size-body-xs);
  font-weight: 600;
  color: var(--color-content-weak);
}

.recipe-ask-quote__text {
  font-style: italic;
}

.recipe-ask-composer {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
  padding: var(--spacing-16);
  border-top: 1px solid var(--color-border-default);
}

.recipe-ask-composer__suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-8);
}

.recipe-ask-composer__row {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-8);
}

.recipe-ask-composer__row .input-field {
  flex: 1;
}
```

- [x] **Step 3: Vérifier la compilation TypeScript**

Run: `cd packages/marmiton-prototype && npx tsc --noEmit`
Expected: aucune erreur liée à `RecipeAgentDrawer.tsx`.

- [x] **Step 4: Commit**

```bash
git add packages/marmiton-prototype/src/components/agent/RecipeAgentDrawer.tsx packages/marmiton-prototype/src/components/agent/RecipeAgentDrawer.css
git commit -m "feat(marmiton-prototype): RecipeAgentDrawer, conversation agent mono-recette"
```

---

### Task 4: Intégration dans `page.tsx` et vérification manuelle

**Files:**
- Modify: `packages/marmiton-prototype/app/(prototypes)/recipe/page.tsx`

**Interfaces:**
- Consomme : `RecipeAskBar` (Task 2), `RecipeAgentDrawer` (Task 3), `buildRecipeChips` (Task 1, `@/lib/recipeAskScript`).

- [x] **Step 1: Ajouter les imports**

Dans `packages/marmiton-prototype/app/(prototypes)/recipe/page.tsx`, remplacer les lignes 1-15 :

```tsx
'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RecipeIngredientWidget, ViewToggle } from '@/components/product/RecipeIngredientWidget/RecipeIngredientWidget'
import type { ViewMode } from '@/components/product/RecipeIngredientWidget/RecipeIngredientWidget'
import { RecipeOrderBanner } from '@/components/product/RecipeIngredientWidget/RecipeOrderBanner'
import { Heart, ShareNetwork } from '@phosphor-icons/react'
import { Button, Stepper, Drawer } from '@mealz-product-team/design-system'
import { Cart } from '@/components/product/Cart/Cart'
import { CartFooter } from '@/components/product/Cart/CartFooter'
import { useCart } from '@/context/CartContext'
import { getRecipeById } from '@/data/mock/recipes'
import { getProductsByRecipe } from '@/data/mock/products'
import '@mealz-product-team/design-system/styles/index.css'
```

par :

```tsx
'use client'

import { Suspense, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RecipeIngredientWidget, ViewToggle } from '@/components/product/RecipeIngredientWidget/RecipeIngredientWidget'
import type { ViewMode } from '@/components/product/RecipeIngredientWidget/RecipeIngredientWidget'
import { RecipeOrderBanner } from '@/components/product/RecipeIngredientWidget/RecipeOrderBanner'
import { Heart, ShareNetwork } from '@phosphor-icons/react'
import { Button, Stepper, Drawer } from '@mealz-product-team/design-system'
import { Cart } from '@/components/product/Cart/Cart'
import { CartFooter } from '@/components/product/Cart/CartFooter'
import { RecipeAskBar } from '@/components/product/RecipeAskBar/RecipeAskBar'
import { RecipeAgentDrawer } from '@/components/agent/RecipeAgentDrawer'
import { buildRecipeChips } from '@/lib/recipeAskScript'
import { useCart } from '@/context/CartContext'
import { getRecipeById } from '@/data/mock/recipes'
import { getProductsByRecipe } from '@/data/mock/products'
import '@mealz-product-team/design-system/styles/index.css'
```

- [x] **Step 2: Ajouter l'état et les chips**

Dans le même fichier, remplacer :

```tsx
  const [drawerOpen, setDrawerOpen] = useState(false)

  const recipeCount = sections.filter((s) => s.recipeId !== null).length
```

par :

```tsx
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [askOpen, setAskOpen] = useState(false)
  const [askInitialMessage, setAskInitialMessage] = useState('')

  const askChips = useMemo(() => buildRecipeChips(RECIPE), [RECIPE])

  function handleAskOpen(message: string) {
    setAskInitialMessage(message)
    setAskOpen(true)
  }

  const recipeCount = sections.filter((s) => s.recipeId !== null).length
```

- [x] **Step 3: Rendre les deux nouveaux composants**

Toujours dans le même fichier, remplacer le bloc qui suit le `</Drawer>` du panier :

```tsx
      </Drawer>

      <style>{`
```

par :

```tsx
      </Drawer>

      <RecipeAskBar chips={askChips} onOpen={handleAskOpen} />
      <RecipeAgentDrawer
        open={askOpen}
        onClose={() => setAskOpen(false)}
        recipe={RECIPE}
        chips={askChips}
        initialMessage={askInitialMessage}
      />

      <style>{`
```

- [x] **Step 4: Laisser de la place à la barre sticky en bas de page**

Toujours dans le même fichier, dans le bloc `<style>`, remplacer :

```css
        .recipe-page {
          min-height: 100vh;
          background-color: #f5f5f5;
          font-family: var(--font-family-body);
          color: var(--color-content-default);
        }
```

par :

```css
        .recipe-page {
          min-height: 100vh;
          background-color: #f5f5f5;
          font-family: var(--font-family-body);
          color: var(--color-content-default);
          padding-bottom: 96px;
        }
```

- [x] **Step 5: Vérifier la compilation TypeScript**

Run: `cd packages/marmiton-prototype && npx tsc --noEmit`
Expected: aucune erreur.

- [x] **Step 6: Lancer la suite de tests complète du package**

Run: `cd packages/marmiton-prototype && npm test`
Expected: PASS — tous les tests existants (`agentScript.test.ts`) plus les 13 nouveaux (`recipeAskScript.test.ts`) sont verts.

- [x] **Step 7: Vérification manuelle en dev server**

Démarrer le serveur de dev (`preview_start` avec la config `.claude/launch.json` du package, ou `npm run dev` si aucune config n'existe encore) et ouvrir `/recipe`. Vérifier dans le navigateur :
1. La barre sticky est visible en bas de l'écran et le reste en scrollant jusqu'à la section Préparation.
2. Les chips affichées correspondent aux tags des avis de la recette par défaut (`r-tarte-abricots` — vérifier dans `src/data/mock/recipes.ts` quels tags elle porte réellement, probablement seulement `time`).
3. Cliquer une chip ouvre le `Drawer`, affiche la question posée puis, après le délai de réflexion, une réponse cohérente (message + éventuellement astuce/écart panier/avis).
4. Cliquer l'input vide ouvre le `Drawer` sans poser de question.
5. Taper une question libre (ex. « j'ai des courgettes ») puis Entrée déclenche une réponse.
6. Fermer le `Drawer` puis le rouvrir via un chip différent : la conversation précédente n'apparaît plus (reset au `onClose`, cf. `handleClose`).
7. Tester sur un viewport mobile (`resize_window` preset `mobile`) : le `Drawer` s'ouvre en `bottom sheet` et recouvre bien la barre sticky, pas de chevauchement visuel.

Prendre une capture d'écran de la barre sticky + du Drawer ouvert avec une réponse affichée, à partager avec l'utilisateur.

- [x] **Step 8: Commit**

```bash
git add "packages/marmiton-prototype/app/(prototypes)/recipe/page.tsx"
git commit -m "feat(marmiton-prototype): intègre RecipeAskBar et RecipeAgentDrawer sur la fiche recette"
```

---

## Self-Review

- **Couverture de la spec** : point d'entrée unique (Task 2) ✓, barre sticky pleine largeur (Task 2 CSS) ✓, chips sourcées des avis (Task 1 `buildRecipeChips`) ✓, ouverture du `Drawer` existant réutilisé (Task 3) ✓, moteur mono-recette réutilisant `selectTip`/`pantryMatch`/avis communautaire (Task 1 `answerRecipeAsk`) ✓. Hors scope de la spec (double CTA carte agent, persona multi-partenaire, `/agent`) : non touchés par ce plan ✓.
- **Placeholders** : aucun — chaque step contient le code complet, aucune section "TODO"/"similaire à".
- **Cohérence de types** : `RecipeChip`, `RecipeAskAnswer`, `AgentSlots` utilisés avec les mêmes noms et formes dans les trois fichiers (Task 1 les définit, Task 2 et Task 3 les consomment tels quels).
