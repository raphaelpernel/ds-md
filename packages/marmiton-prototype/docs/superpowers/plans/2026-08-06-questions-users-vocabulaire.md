# Élargir le vocabulaire de l'agent (sous-projet 1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Élargir le vocabulaire reconnu par `extractSlots` (partagé) et `answerRecipeAsk` (mono-recette) : distinguer vegan de végétarien, reconnaître un signal "débutant", reconnaître un ingrédient évité par goût (distinct d'une allergie), répondre aux questions de substitution d'ingrédient et de budget/prix, avec une nouvelle recette mock réellement vegan.

**Architecture:** Toutes les additions sont additives — `AgentSlots.constraint` reste une valeur unique (pas de combinaison de contraintes, cf. sous-projet 2 séparé). Deux nouvelles valeurs de `Constraint` (`vegan`, `debutant`) réutilisent le mécanisme existant de `CONSTRAINT_WORDS`/`CONSTRAINT_LABELS`/`RELAXED_REASON`. Deux nouveaux slots (`avoidIngredients`, `budgetFocus`) suivent le patron déjà établi par `healthFocus`. La substitution d'ingrédient (mono-recette) réplique exactement le patron de `detectEquipmentQuestion`/`EQUIPMENT_SUBSTITUTES` déjà livré aujourd'hui pour l'équipement.

**Tech Stack:** TypeScript, Vitest (logique pure — `agentScript.ts`, `recipeAskScript.ts`). React/Next.js pour `AgentConversation.tsx` et `RecipeAgentDrawer.tsx`, vérifiés manuellement (pas de test automatisé — voir contraintes globales).

## Global Constraints

- Aucun tiret cadratin (« — ») dans les messages agent affichés à l'utilisateur — règle produit déjà en place (cf. `recommendationMessage` dans `agentScript.ts`). Utiliser un deux-points ou une virgule à la place.
- Toujours utiliser une variable sémantique CSS (`--color-semantic-*`), jamais une primitive ni un hex en dur — déjà respecté par les classes `*-highlight--warning`/`--info` réutilisées ici, aucune nouvelle classe CSS n'est nécessaire.
- Pas de test automatisé pour `AgentConversation.tsx` / `RecipeAgentDrawer.tsx` (composants React) — ce package n'a ni `@testing-library/react` ni environnement `jsdom` configuré (même contrainte que le plan du 2026-08-05, ne pas l'introduire ici). Vérification manuelle en dev server uniquement.
- Aucune contrainte combinée ni correction en cours de conversation dans ce plan (sous-projet 2, hors scope).
- Pas de filtrage/scoring de `/agent` basé sur `avoidIngredients` ou `budgetFocus` — informationnel uniquement (cf. spec, section "Hors scope").

---

### Task 1: Contraintes `vegan` et `debutant` (`agentScript.ts`, `recipe.ts`)

**Files:**
- Modify: `packages/marmiton-prototype/src/data/types/recipe.ts:29-32` (ajout `tipForBeginners`)
- Modify: `packages/marmiton-prototype/src/lib/agentScript.ts` (types, `CONSTRAINT_LABELS`, `RELAXED_REASON`, `CONSTRAINT_WORDS`, `constraintLabel`, `scoreRecipe`, `selectTip`)
- Test: `packages/marmiton-prototype/src/lib/__tests__/agentScript.test.ts`

**Interfaces:**
- Produit (utilisé par Task 2, 3, 4) : `Constraint` inclut désormais `'vegan' | 'debutant'` ; `Recipe.tipForBeginners?: string`.

- [ ] **Step 1: Ajouter `tipForBeginners` au type `Recipe`**

Dans `packages/marmiton-prototype/src/data/types/recipe.ts`, remplacer :

```ts
  /** Astuce alternative utilisée à la place de `tip` quand la conversation signale un contexte enfant. */
  tipForKids?: string
```

par :

```ts
  /** Astuce alternative utilisée à la place de `tip` quand la conversation signale un contexte enfant. */
  tipForKids?: string
  /** Astuce alternative utilisée à la place de `tip` quand la conversation signale un contexte débutant. */
  tipForBeginners?: string
```

- [ ] **Step 2: Écrire les tests (échouent, `vegan`/`debutant` n'existent pas encore)**

Dans `packages/marmiton-prototype/src/lib/__tests__/agentScript.test.ts`, remplacer la ligne d'import :

```ts
import { constraintApplies, selectCommunityQuote, buildRecipeSlate, processTurn, EMPTY_SLOTS } from '../agentScript'
```

par :

```ts
import {
  constraintApplies,
  selectCommunityQuote,
  buildRecipeSlate,
  processTurn,
  extractSlots,
  constraintLabel,
  selectTip,
  EMPTY_SLOTS,
} from '../agentScript'
```

Puis ajouter à la fin du fichier (après le dernier `describe`, avant la fin du fichier) :

```ts

describe('extractSlots — vegan distinct de végétarien', () => {
  it('reconnaît vegan comme une contrainte distincte', () => {
    expect(extractSlots('je cherche une recette vegan', EMPTY_SLOTS).constraint).toBe('vegan')
  })

  it('reconnaît toujours végétarien séparément', () => {
    expect(extractSlots('un plat végétarien', EMPTY_SLOTS).constraint).toBe('vegetarien')
  })
})

describe('extractSlots — signal débutant', () => {
  it('reconnaît un signal débutant', () => {
    expect(extractSlots('je débute en cuisine', EMPTY_SLOTS).constraint).toBe('debutant')
  })

  it('reconnaît une formulation alternative', () => {
    expect(extractSlots("j'ai jamais cuisiné", EMPTY_SLOTS).constraint).toBe('debutant')
  })
})

describe('constraintLabel — vegan et débutant', () => {
  it('confirme vegan uniquement si recipe.tags contient vegan', () => {
    const recipe = makeRecipe({ tags: ['vegan', 'vegetarien'] })
    expect(constraintLabel(recipe, makeSlots({ constraint: 'vegan' }), true)).toBe('Vegan')
  })

  it('ne confirme pas vegan si seul vegetarien est tagué', () => {
    const recipe = makeRecipe({ tags: ['vegetarien'] })
    expect(constraintLabel(recipe, makeSlots({ constraint: 'vegan' }), true)).toBeUndefined()
  })

  it('confirme débutant via recipe.difficulty plutôt qu\'un tag', () => {
    const recipe = makeRecipe({ tags: [], difficulty: 'facile' })
    expect(constraintLabel(recipe, makeSlots({ constraint: 'debutant' }), true)).toBe('Facile pour débuter')
  })

  it('ne confirme pas débutant si la difficulté n\'est pas facile', () => {
    const recipe = makeRecipe({ difficulty: 'moyen' })
    expect(constraintLabel(recipe, makeSlots({ constraint: 'debutant' }), true)).toBeUndefined()
  })
})

describe('selectTip — débutant', () => {
  it('utilise tipForBeginners quand la contrainte est débutant', () => {
    const recipe = makeRecipe({ tip: 'Astuce générale', tipForBeginners: 'Astuce débutant' })
    expect(selectTip(recipe, makeSlots({ constraint: 'debutant' }))).toBe('Astuce débutant')
  })

  it('retombe sur tip si tipForBeginners est absent', () => {
    const recipe = makeRecipe({ tip: 'Astuce générale' })
    expect(selectTip(recipe, makeSlots({ constraint: 'debutant' }))).toBe('Astuce générale')
  })
})
```

Note : `makeSlots` (déjà défini en tête du fichier) ne connaît pas encore `avoidIngredients` — Task 2 mettra à jour sa définition. Ces tests n'en dépendent pas.

- [ ] **Step 3: Lancer les tests pour vérifier qu'ils échouent**

Run: `cd packages/marmiton-prototype && npx vitest run src/lib/__tests__/agentScript.test.ts`
Expected: FAIL — `constraintLabel`/`selectTip`/`extractSlots` importés mais `'vegan'`/`'debutant'` pas reconnus (les nouveaux tests échouent, les existants passent toujours).

- [ ] **Step 4: Ajouter `vegan` et `debutant` au type `Constraint`**

Dans `packages/marmiton-prototype/src/lib/agentScript.ts`, remplacer :

```ts
export type Constraint = 'enfant' | 'sans-sauce' | 'vegetarien' | 'sans-gluten' | 'sans-lactose' | 'allergie'
```

par :

```ts
export type Constraint = 'enfant' | 'sans-sauce' | 'vegetarien' | 'vegan' | 'sans-gluten' | 'sans-lactose' | 'allergie' | 'debutant'
```

- [ ] **Step 5: Mettre à jour `CONSTRAINT_LABELS` et `RELAXED_REASON`**

Remplacer :

```ts
const CONSTRAINT_LABELS: Record<Exclude<Constraint, 'allergie'>, string> = {
  enfant: 'Adapté aux enfants',
  'sans-sauce': 'Sans sauce',
  vegetarien: 'Végétarien',
  'sans-gluten': 'Sans gluten',
  'sans-lactose': 'Sans lactose',
}
```

par :

```ts
const CONSTRAINT_LABELS: Record<Exclude<Constraint, 'allergie'>, string> = {
  enfant: 'Adapté aux enfants',
  'sans-sauce': 'Sans sauce',
  vegetarien: 'Végétarien',
  vegan: 'Vegan',
  'sans-gluten': 'Sans gluten',
  'sans-lactose': 'Sans lactose',
  debutant: 'Facile pour débuter',
}
```

Remplacer :

```ts
export const RELAXED_REASON: Record<Constraint, string> = {
  enfant: 'adaptée aux enfants',
  'sans-sauce': 'sans sauce',
  vegetarien: 'végétarienne',
  'sans-gluten': 'sans gluten',
  'sans-lactose': 'sans lactose',
  allergie: "garantissant l'absence de l'allergène mentionné",
}
```

par :

```ts
export const RELAXED_REASON: Record<Constraint, string> = {
  enfant: 'adaptée aux enfants',
  'sans-sauce': 'sans sauce',
  vegetarien: 'végétarienne',
  vegan: 'vegane',
  'sans-gluten': 'sans gluten',
  'sans-lactose': 'sans lactose',
  allergie: "garantissant l'absence de l'allergène mentionné",
  debutant: 'facile pour débuter',
}
```

- [ ] **Step 6: Mettre à jour `CONSTRAINT_WORDS`**

Remplacer :

```ts
const CONSTRAINT_WORDS: Array<[RegExp, Constraint]> = [
  [/enfant|gosse|petit(e)?\b.*mange/i, 'enfant'],
  [/sans sauce/i, 'sans-sauce'],
  [/vegan|végétarien|vegetarien/i, 'vegetarien'],
  [/sans gluten/i, 'sans-gluten'],
  [/sans lactose/i, 'sans-lactose'],
  [/allerg/i, 'allergie'],
]
```

par :

```ts
const CONSTRAINT_WORDS: Array<[RegExp, Constraint]> = [
  [/enfant|gosse|petit(e)?\b.*mange/i, 'enfant'],
  [/sans sauce/i, 'sans-sauce'],
  [/vegan/i, 'vegan'],
  [/végétarien|vegetarien/i, 'vegetarien'],
  [/sans gluten/i, 'sans-gluten'],
  [/sans lactose/i, 'sans-lactose'],
  [/allerg/i, 'allergie'],
  [/débutant|debutant|jamais cuisiné|jamais cuisine|nul(le)? en cuisine/i, 'debutant'],
]
```

- [ ] **Step 7: Faire de `debutant` un cas spécial dans `constraintLabel` et `scoreRecipe`**

Remplacer :

```ts
export function constraintLabel(recipe: Recipe, slots: AgentSlots, matched: boolean): string | undefined {
  if (!constraintApplies(slots, matched)) return undefined
  if (!(recipe.tags ?? []).includes(slots.constraint!)) return undefined
  return CONSTRAINT_LABELS[slots.constraint as Exclude<Constraint, 'allergie'>]
}
```

par :

```ts
/** `debutant` n'est pas porté par `recipe.tags` (pas de nouveau tag à maintenir sur les recettes
 * existantes) — la correspondance se fait via `recipe.difficulty === 'facile'`, déjà peuplé. */
function constraintSatisfiedBy(recipe: Recipe, constraint: Constraint): boolean {
  if (constraint === 'debutant') return recipe.difficulty === 'facile'
  return (recipe.tags ?? []).includes(constraint)
}

export function constraintLabel(recipe: Recipe, slots: AgentSlots, matched: boolean): string | undefined {
  if (!constraintApplies(slots, matched)) return undefined
  if (!constraintSatisfiedBy(recipe, slots.constraint!)) return undefined
  return CONSTRAINT_LABELS[slots.constraint as Exclude<Constraint, 'allergie'>]
}
```

Remplacer :

```ts
function scoreRecipe(recipe: Recipe, slots: AgentSlots): number {
  const tags = recipe.tags ?? []
  let score = 0
  for (const ingredient of slots.ingredients) {
    if (tags.includes(ingredient) || tags.includes(ingredient === 'pates' ? 'pates' : ingredient)) score += 3
  }
  if (slots.constraint && tags.includes(slots.constraint)) score += 2
  if (slots.time !== undefined && recipe.duration <= slots.time + 5) score += 1
  return score
}
```

par :

```ts
function scoreRecipe(recipe: Recipe, slots: AgentSlots): number {
  const tags = recipe.tags ?? []
  let score = 0
  for (const ingredient of slots.ingredients) {
    if (tags.includes(ingredient) || tags.includes(ingredient === 'pates' ? 'pates' : ingredient)) score += 3
  }
  if (slots.constraint && constraintSatisfiedBy(recipe, slots.constraint)) score += 2
  if (slots.time !== undefined && recipe.duration <= slots.time + 5) score += 1
  return score
}
```

- [ ] **Step 8: Ajouter `tipForBeginners` dans `selectTip`**

Remplacer :

```ts
export function selectTip(recipe: Recipe, slots: AgentSlots): string | undefined {
  if (slots.constraint === 'enfant' && recipe.tipForKids) return recipe.tipForKids
  return recipe.tip
}
```

par :

```ts
export function selectTip(recipe: Recipe, slots: AgentSlots): string | undefined {
  if (slots.constraint === 'enfant' && recipe.tipForKids) return recipe.tipForKids
  if (slots.constraint === 'debutant' && recipe.tipForBeginners) return recipe.tipForBeginners
  return recipe.tip
}
```

- [ ] **Step 9: Lancer les tests pour vérifier qu'ils passent**

Run: `cd packages/marmiton-prototype && npx vitest run src/lib/__tests__/agentScript.test.ts`
Expected: PASS — tous les tests (existants + nouveaux) verts.

- [ ] **Step 10: Vérifier la compilation TypeScript**

Run: `cd packages/marmiton-prototype && npx tsc --noEmit`
Expected: aucune erreur (`CONSTRAINT_LABELS`/`RELAXED_REASON` couvrent bien toutes les clés de `Constraint`).

- [ ] **Step 11: Commit**

```bash
git add packages/marmiton-prototype/src/data/types/recipe.ts packages/marmiton-prototype/src/lib/agentScript.ts packages/marmiton-prototype/src/lib/__tests__/agentScript.test.ts
git commit -m "feat(marmiton-prototype): distingue vegan de vegetarien, ajoute la contrainte debutant"
```

---

### Task 2: Slots `avoidIngredients` et `budgetFocus` (`agentScript.ts`)

**Files:**
- Modify: `packages/marmiton-prototype/src/lib/agentScript.ts` (`AgentSlots`, `extractSlots`, `pantryMatch`, `EMPTY_SLOTS`)
- Modify: `packages/marmiton-prototype/src/lib/__tests__/agentScript.test.ts` (`makeSlots`, nouveaux tests)

**Interfaces:**
- Produit (utilisé par Task 3, 4, 5) : `AgentSlots.avoidIngredients: string[]`, `AgentSlots.budgetFocus?: boolean`, `export function avoidedIngredientMatch(recipe: Recipe, slots: AgentSlots): string[]`.

- [ ] **Step 1: Mettre à jour `makeSlots` et écrire les tests (échouent, les champs n'existent pas encore)**

Dans `packages/marmiton-prototype/src/lib/__tests__/agentScript.test.ts`, remplacer :

```ts
function makeSlots(overrides: Partial<AgentSlots> = {}): AgentSlots {
  return { ingredients: [], ...overrides }
}
```

par :

```ts
function makeSlots(overrides: Partial<AgentSlots> = {}): AgentSlots {
  return { ingredients: [], avoidIngredients: [], ...overrides }
}
```

Puis ajouter à la fin du fichier :

```ts

describe('extractSlots — avoidIngredients (dégoût, distinct de "j\'ai")', () => {
  it('détecte un ingrédient évité par goût, sans le mettre dans "ingredients"', () => {
    const slots = extractSlots("j'aime pas les courgettes", EMPTY_SLOTS)
    expect(slots.avoidIngredients).toEqual(['courgette'])
    expect(slots.ingredients).toEqual([])
  })

  it('reconnaît une formulation alternative ("j\'évite")', () => {
    expect(extractSlots("j'évite les lardons", EMPTY_SLOTS).avoidIngredients).toEqual(['lardons'])
  })

  it('ne mélange pas un ingrédient évité avec un ingrédient déclaré dans un tour différent', () => {
    const first = extractSlots("j'ai déjà du poulet", EMPTY_SLOTS)
    expect(first.ingredients).toEqual(['poulet'])
    const second = extractSlots("j'évite les lardons", first)
    expect(second.ingredients).toEqual(['poulet'])
    expect(second.avoidIngredients).toEqual(['lardons'])
  })
})

describe('extractSlots — budgetFocus', () => {
  it('détecte un intérêt budget', () => {
    expect(extractSlots('je cherche pas cher', EMPTY_SLOTS).budgetFocus).toBe(true)
  })

  it('ne déclenche pas budgetFocus sur un mot contenant "cher" sans être le mot "cher"', () => {
    expect(extractSlots('je cherche une recette vegan', EMPTY_SLOTS).budgetFocus).toBeUndefined()
  })
})

describe('avoidedIngredientMatch', () => {
  it("retourne les ingrédients de la recette présents dans avoidIngredients", () => {
    const recipe = makeRecipe({
      ingredients: [
        { id: 'i1', name: 'Ricotta', quantity: 250, unit: 'g', emoji: '🧀', productId: 'p1' },
        { id: 'i2', name: 'Parmesan râpé', quantity: 50, unit: 'g', emoji: '🧀', productId: 'p2' },
      ],
    })
    expect(avoidedIngredientMatch(recipe, makeSlots({ avoidIngredients: ['ricotta'] }))).toEqual(['Ricotta'])
  })

  it('retourne un tableau vide si avoidIngredients est vide', () => {
    const recipe = makeRecipe({
      ingredients: [{ id: 'i1', name: 'Ricotta', quantity: 250, unit: 'g', emoji: '🧀', productId: 'p1' }],
    })
    expect(avoidedIngredientMatch(recipe, makeSlots())).toEqual([])
  })
})
```

Puis remplacer la ligne d'import en tête du fichier :

```ts
import {
  constraintApplies,
  selectCommunityQuote,
  buildRecipeSlate,
  processTurn,
  extractSlots,
  constraintLabel,
  selectTip,
  EMPTY_SLOTS,
} from '../agentScript'
```

par :

```ts
import {
  constraintApplies,
  selectCommunityQuote,
  buildRecipeSlate,
  processTurn,
  extractSlots,
  constraintLabel,
  selectTip,
  avoidedIngredientMatch,
  EMPTY_SLOTS,
} from '../agentScript'
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

Run: `cd packages/marmiton-prototype && npx vitest run src/lib/__tests__/agentScript.test.ts`
Expected: FAIL — `avoidIngredients`/`budgetFocus`/`avoidedIngredientMatch` n'existent pas encore.

- [ ] **Step 3: Ajouter les champs à `AgentSlots` et mettre à jour `EMPTY_SLOTS`**

Remplacer :

```ts
export interface AgentSlots {
  time?: number
  servings?: number
  constraint?: Constraint
  ingredients: string[]
  /** Signale un intérêt pour les infos nutritionnelles (indépendant de `constraint`) — affiche calories/protéines sur la carte. */
  healthFocus?: boolean
}
```

par :

```ts
export interface AgentSlots {
  time?: number
  servings?: number
  constraint?: Constraint
  ingredients: string[]
  /** Signale un intérêt pour les infos nutritionnelles (indépendant de `constraint`) — affiche calories/protéines sur la carte. */
  healthFocus?: boolean
  /** Ingrédients évités par goût (ex. "j'aime pas les champignons") — distinct d'une allergie
   * (`constraint: 'allergie'`, médical) et de `ingredients` (ce que l'utilisateur *a*, sens opposé). */
  avoidIngredients: string[]
  /** Signale un intérêt pour le prix (indépendant de `constraint`) — même schéma que `healthFocus`. */
  budgetFocus?: boolean
}
```

Remplacer :

```ts
export const EMPTY_SLOTS: AgentSlots = { ingredients: [] }
```

par :

```ts
export const EMPTY_SLOTS: AgentSlots = { ingredients: [], avoidIngredients: [] }
```

- [ ] **Step 4: Factoriser `pantryMatch` et ajouter `avoidedIngredientMatch`**

Remplacer :

```ts
export function pantryMatch(recipe: Recipe, slots: AgentSlots): PantryMatch | null {
  if (slots.ingredients.length === 0) return null

  const shoppable = recipe.ingredients.filter((ingredient) => !ingredient.staple)

  const matched: string[] = []
  for (const ingredient of shoppable) {
    const normName = normalize(ingredient.name)
    const hit = slots.ingredients.some((key) => {
      const aliases = INGREDIENT_ALIASES[key] ?? [key]
      return aliases.some((alias) => normName.includes(normalize(alias)))
    })
    if (hit) matched.push(ingredient.name)
  }

  if (matched.length === 0) return null
  return { matchedIngredientNames: matched, missingCount: shoppable.length - matched.length }
}
```

par :

```ts
/** Ingrédients "achetables" (hors `staple`) de la recette dont le nom (normalisé) correspond à au
 * moins une des clés fournies (via `INGREDIENT_ALIASES`) — factorisation partagée entre `pantryMatch`
 * (ce que l'utilisateur a déjà) et `avoidedIngredientMatch` (ce qu'il évite), même logique de matching. */
function matchIngredientNames(recipe: Recipe, keys: string[]): string[] {
  const shoppable = recipe.ingredients.filter((ingredient) => !ingredient.staple)
  const matched: string[] = []
  for (const ingredient of shoppable) {
    const normName = normalize(ingredient.name)
    const hit = keys.some((key) => {
      const aliases = INGREDIENT_ALIASES[key] ?? [key]
      return aliases.some((alias) => normName.includes(normalize(alias)))
    })
    if (hit) matched.push(ingredient.name)
  }
  return matched
}

export function pantryMatch(recipe: Recipe, slots: AgentSlots): PantryMatch | null {
  if (slots.ingredients.length === 0) return null
  const matched = matchIngredientNames(recipe, slots.ingredients)
  if (matched.length === 0) return null
  const shoppable = recipe.ingredients.filter((ingredient) => !ingredient.staple)
  return { matchedIngredientNames: matched, missingCount: shoppable.length - matched.length }
}

/** Ingrédients de la recette que l'utilisateur évite par goût (`slots.avoidIngredients`) — utilisé
 * pour un avertissement sur la carte/le drawer, jamais pour filtrer ou noter une recommandation
 * (`/agent` reste inchangé au niveau du classement pour cette passe). */
export function avoidedIngredientMatch(recipe: Recipe, slots: AgentSlots): string[] {
  if (slots.avoidIngredients.length === 0) return []
  return matchIngredientNames(recipe, slots.avoidIngredients)
}
```

- [ ] **Step 5: Ajouter la détection dans `extractSlots`**

Remplacer :

```ts
const HEALTH_WORDS = /léger|healthy|calories?|régime|diète|minceur/i
```

par :

```ts
const HEALTH_WORDS = /léger|healthy|calories?|régime|diète|minceur/i
const BUDGET_WORDS = /\bcher\b|économique|abordable|budget|coûte|prix/i
const AVOID_WORDS = /j'aime pas|je n'aime pas|j'evite|je deteste/
```

Remplacer :

```ts
  if (HEALTH_WORDS.test(text)) {
    next.healthFocus = true
  }

  for (const word of INGREDIENT_WORDS) {
    const key = normalize(word).replace('pâtes', 'pates')
    if (norm.includes(key) && !next.ingredients.includes('pates') && !next.ingredients.includes(key)) {
      const canonical = key === 'courgettes' ? 'courgette' : key === 'abricots' ? 'abricot' : key
      if (!next.ingredients.includes(canonical)) next.ingredients.push(canonical)
    }
  }

  return next
}
```

par :

```ts
  if (HEALTH_WORDS.test(text)) {
    next.healthFocus = true
  }

  if (BUDGET_WORDS.test(text)) {
    next.budgetFocus = true
  }

  // Un tour qui exprime un dégoût ("j'aime pas X") va au slot avoidIngredients plutôt qu'au
  // slot ingredients ("ce que j'ai") — un même tour ne porte qu'une seule de ces deux intentions.
  const isAvoidTurn = AVOID_WORDS.test(norm)

  for (const word of INGREDIENT_WORDS) {
    const key = normalize(word).replace('pâtes', 'pates')
    if (!norm.includes(key)) continue
    const canonical = key === 'courgettes' ? 'courgette' : key === 'abricots' ? 'abricot' : key
    if (isAvoidTurn) {
      if (!next.avoidIngredients.includes(canonical)) next.avoidIngredients.push(canonical)
    } else if (!next.ingredients.includes('pates') && !next.ingredients.includes(key) && !next.ingredients.includes(canonical)) {
      next.ingredients.push(canonical)
    }
  }

  return next
}
```

Et dans `extractSlots`, remplacer la ligne d'initialisation :

```ts
  const next: AgentSlots = { ...prev, ingredients: [...prev.ingredients] }
```

par :

```ts
  const next: AgentSlots = { ...prev, ingredients: [...prev.ingredients], avoidIngredients: [...prev.avoidIngredients] }
```

- [ ] **Step 6: Lancer les tests pour vérifier qu'ils passent**

Run: `cd packages/marmiton-prototype && npx vitest run src/lib/__tests__/agentScript.test.ts`
Expected: PASS — tous les tests verts (existants + Task 1 + Task 2).

- [ ] **Step 7: Vérifier la compilation TypeScript**

Run: `cd packages/marmiton-prototype && npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 8: Commit**

```bash
git add packages/marmiton-prototype/src/lib/agentScript.ts packages/marmiton-prototype/src/lib/__tests__/agentScript.test.ts
git commit -m "feat(marmiton-prototype): slots avoidIngredients et budgetFocus, factorise le matching d'ingredients"
```

---

### Task 3: Recette mock vegan et régression `MOCK_RECIPES`

**Files:**
- Modify: `packages/marmiton-prototype/src/data/mock/recipes.ts` (`tipForBeginners` sur la carbonara, nouvelle recette `r-curry-pois-chiches`)
- Modify: `packages/marmiton-prototype/src/lib/__tests__/agentScript.test.ts` (met à jour le test `vegetarien` existant, ajoute `vegan` et `debutant` via `buildRecipeSlate`)

**Interfaces:**
- Consomme : `Recipe`, `Ingredient` (`../data/types/recipe`), `MOCK_RECIPES` (déjà importé dans le fichier de test).
- Produit (utilisé par aucune tâche suivante directement, mais change le comportement observable de `buildRecipeSlate`/`/agent`) : `MOCK_RECIPES` contient 7 recettes, dont `r-curry-pois-chiches` (`tags: ['vegan', 'vegetarien']`, `difficulty: 'facile'`).

- [ ] **Step 1: Ajouter `tipForBeginners` à la recette carbonara**

Dans `packages/marmiton-prototype/src/data/mock/recipes.ts`, dans l'objet `id: 'r-pates-carbonara'`, remplacer :

```ts
    tipForKids: "Pas de piment ni d'épice forte dans cette recette : elle convient telle quelle aux palais des enfants.",
    allergens: ['Œufs', 'Lait', 'Gluten'],
```

par :

```ts
    tipForKids: "Pas de piment ni d'épice forte dans cette recette : elle convient telle quelle aux palais des enfants.",
    tipForBeginners: "Goûtez les pâtes une minute avant la fin de cuisson annoncée : mieux vaut les égoutter un peu tôt que trop tard.",
    allergens: ['Œufs', 'Lait', 'Gluten'],
```

- [ ] **Step 2: Ajouter la recette vegan à la fin de `MOCK_RECIPES`**

Dans le même fichier, remplacer la fin du tableau :

```ts
    ingredients: [
      {
        id: 'i-lait',
        name: 'Lait entier',
        quantity: 500,
        unit: 'ml',
        emoji: '🥛',
        productId: 'p-lait',
      },
    ],
  },
]
```

par :

```ts
    ingredients: [
      {
        id: 'i-lait',
        name: 'Lait entier',
        quantity: 500,
        unit: 'ml',
        emoji: '🥛',
        productId: 'p-lait',
      },
    ],
  },
  {
    id: 'r-curry-pois-chiches',
    name: 'Curry de pois chiches et lait de coco',
    imageUrl: 'https://placehold.co/400x280/D97B3D/fff?text=Curry+pois+chiches',
    servings: 4,
    duration: 30,
    estimatedPricePerServing: 2.10,
    tags: ['vegan', 'vegetarien'],
    rating: 4.5,
    reviewCount: 134,
    difficulty: 'facile',
    tip: "Faites revenir les épices à sec 30 secondes avant d'ajouter le lait de coco : ça réveille leur parfum.",
    allergens: [],
    calories: 380,
    protein: 12,
    season: ['automne', 'hiver'],
    prepDuration: 10,
    reviews: [
      { text: 'Sans aucun produit animal, tout le monde à table peut en manger.', tag: 'vegetarien' },
      { text: '30 minutes montre en main, principalement de la cuisson à couvert.', tag: 'time' },
    ],
    ingredients: [
      {
        id: 'i-pois-chiches',
        name: 'Pois chiches cuits',
        quantity: 400,
        unit: 'g',
        emoji: '🫘',
        productId: 'p-pois-chiches',
      },
      {
        id: 'i-lait-coco',
        name: 'Lait de coco',
        quantity: 400,
        unit: 'ml',
        emoji: '🥥',
        productId: 'p-lait-coco',
      },
      {
        id: 'i-riz-basmati',
        name: 'Riz basmati',
        quantity: 300,
        unit: 'g',
        emoji: '🍚',
        productId: 'p-riz-basmati',
      },
      {
        id: 'i-oignon-curry',
        name: 'Oignon',
        quantity: 1,
        unit: 'pièce',
        emoji: '🧅',
        productId: 'p-oignon',
      },
      {
        id: 'i-curry-poudre',
        name: 'Curry en poudre',
        quantity: 2,
        unit: 'c. à soupe',
        emoji: '🌶️',
        productId: 'p-curry-poudre',
      },
      {
        id: 'i-huile-curry',
        name: "Huile d'olive",
        quantity: 1,
        unit: 'c. à soupe',
        emoji: '🫒',
        productId: null,
        staple: true,
      },
    ],
  },
]
```

- [ ] **Step 3: Mettre à jour le test `buildRecipeSlate` existant pour `vegetarien`**

La nouvelle recette vegan porte aussi le tag `vegetarien` (vegan ⊂ végétarien) : une question végétarienne trouve désormais **deux** vrais matchs au lieu d'un seul. Dans `packages/marmiton-prototype/src/lib/__tests__/agentScript.test.ts`, remplacer :

```ts
  it('complète avec des quasi-matchs (matched=false) quand un seul vrai match existe, sans doublon', () => {
    const { recipes, hasRealMatch } = buildRecipeSlate(makeSlots({ constraint: 'vegetarien' }))
    expect(hasRealMatch).toBe(true)
    expect(recipes).toHaveLength(3)
    expect(recipes[0]).toMatchObject({ matched: true })
    expect(recipes[0].recipe.id).toBe('r-courgettes-ricotta')
    expect(recipes[1].matched).toBe(false)
    expect(recipes[2].matched).toBe(false)
    const ids = recipes.map((r) => r.recipe.id)
    expect(new Set(ids).size).toBe(3) // pas de doublon
  })
```

par :

```ts
  it('complète avec un quasi-match (matched=false) quand deux vrais matchs existent, sans doublon', () => {
    // La recette vegan porte aussi le tag vegetarien (vegan ⊂ végétarien) — deux vrais matchs désormais.
    const { recipes, hasRealMatch } = buildRecipeSlate(makeSlots({ constraint: 'vegetarien' }))
    expect(hasRealMatch).toBe(true)
    expect(recipes).toHaveLength(3)
    expect(recipes[0]).toMatchObject({ matched: true, recipe: { id: 'r-courgettes-ricotta' } })
    expect(recipes[1]).toMatchObject({ matched: true, recipe: { id: 'r-curry-pois-chiches' } })
    expect(recipes[2].matched).toBe(false)
    const ids = recipes.map((r) => r.recipe.id)
    expect(new Set(ids).size).toBe(3) // pas de doublon
  })

  it('un vrai match vegan existe et n\'inclut pas les recettes seulement végétariennes', () => {
    const { recipes, hasRealMatch } = buildRecipeSlate(makeSlots({ constraint: 'vegan' }))
    expect(hasRealMatch).toBe(true)
    expect(recipes[0].matched).toBe(true)
    expect(recipes[0].recipe.id).toBe('r-curry-pois-chiches')
  })

  it('debutant matche les recettes difficulty facile sans dépendre de tags', () => {
    const { recipes, hasRealMatch } = buildRecipeSlate(makeSlots({ constraint: 'debutant' }))
    expect(hasRealMatch).toBe(true)
    expect(recipes.every((r) => r.matched)).toBe(true)
    expect(recipes.map((r) => r.recipe.id)).toEqual(['r-poulet-citron', 'r-courgettes-ricotta', 'r-pates-carbonara'])
  })
```

- [ ] **Step 4: Lancer la suite de tests complète du package**

Run: `cd packages/marmiton-prototype && npm test`
Expected: PASS — tous les tests de `agentScript.test.ts` et `recipeAskScript.test.ts` verts (aucune régression sur les tests `sans-gluten`/`sans-lactose`/`poulet, courgette, thon` déjà en place, la nouvelle recette n'y matche jamais).

- [ ] **Step 5: Vérifier la compilation TypeScript**

Run: `cd packages/marmiton-prototype && npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 6: Commit**

```bash
git add packages/marmiton-prototype/src/data/mock/recipes.ts packages/marmiton-prototype/src/lib/__tests__/agentScript.test.ts
git commit -m "feat(marmiton-prototype): ajoute une recette mock vegan et une astuce debutant"
```

---

### Task 4: Substitution d'ingrédient, ingrédient évité et budget (`recipeAskScript.ts`)

**Files:**
- Modify: `packages/marmiton-prototype/src/lib/recipeAskScript.ts`
- Modify: `packages/marmiton-prototype/src/lib/__tests__/recipeAskScript.test.ts`

**Interfaces:**
- Consomme : `avoidedIngredientMatch` (Task 2, `./agentScript`), `AgentSlots.avoidIngredients`/`budgetFocus` (Task 2).
- Produit (utilisé par Task 6) : `RecipeAskAnswer` gagne `ingredientSubstituteNote?: string`, `avoidedIngredientNote?: string`, `budgetNote?: string`.

- [ ] **Step 1: Écrire les tests (échouent, les champs n'existent pas encore)**

Dans `packages/marmiton-prototype/src/lib/__tests__/recipeAskScript.test.ts`, ajouter à la fin du fichier, avant le `})` final du `describe('answerRecipeAsk', ...)` :

```ts

  it("suggère un substitut d'ingrédient connu quand on demande une alternative", () => {
    const recipe = makeRecipe({
      ingredients: [{ id: 'i1', name: 'Ricotta', quantity: 250, unit: 'g', emoji: '🧀', productId: 'p1' }],
    })
    const { answer } = answerRecipeAsk(recipe, "j'ai pas de ricotta, je remplace par quoi ?", EMPTY_SLOTS)
    expect(answer.ingredientSubstituteNote).toBe(
      'Pas de souci, vous pouvez remplacer ricotta par du mascarpone ou du fromage frais épais.'
    )
  })

  it("reconnaît une demande de substitution conjuguée (\"je remplace\")", () => {
    const recipe = makeRecipe({
      ingredients: [{ id: 'i1', name: 'Parmesan râpé', quantity: 50, unit: 'g', emoji: '🧀', productId: 'p1' }],
    })
    const { answer } = answerRecipeAsk(recipe, 'je remplace le parmesan par quoi ?', EMPTY_SLOTS)
    expect(answer.ingredientSubstituteNote).toBe('Pas de souci, vous pouvez remplacer parmesan râpé par du gruyère râpé.')
  })

  it("propose une réponse neutre quand l'ingrédient demandé n'a pas de substitut connu", () => {
    const recipe = makeRecipe({
      ingredients: [{ id: 'i1', name: 'Courgettes', quantity: 3, unit: 'pièces', emoji: '🥒', productId: 'p1' }],
    })
    const { answer } = answerRecipeAsk(recipe, 'je remplace les courgettes par quoi ?', EMPTY_SLOTS)
    expect(answer.ingredientSubstituteNote).toBe(
      "Je n'ai pas de suggestion précise pour remplacer courgettes, mais vous pouvez tenter une texture ou un goût similaire."
    )
  })

  it("avertit et suggère un substitut quand un ingrédient évité par goût est présent dans la recette", () => {
    const recipe = makeRecipe({
      ingredients: [{ id: 'i1', name: 'Ricotta', quantity: 250, unit: 'g', emoji: '🧀', productId: 'p1' }],
    })
    const { answer } = answerRecipeAsk(recipe, "j'aime pas la ricotta", EMPTY_SLOTS)
    expect(answer.avoidedIngredientNote).toBe(
      'Cette recette contient ricotta, que vous évitez : vous pouvez le remplacer par du mascarpone ou du fromage frais épais.'
    )
  })

  it("avertit sans substitut quand l'ingrédient évité n'a pas d'alternative connue", () => {
    const recipe = makeRecipe({
      ingredients: [{ id: 'i1', name: 'Escalopes de poulet', quantity: 4, unit: 'pièces', emoji: '🍗', productId: 'p1' }],
    })
    const { answer } = answerRecipeAsk(recipe, "j'aime pas le poulet", EMPTY_SLOTS)
    expect(answer.avoidedIngredientNote).toBe('Cette recette contient escalopes de poulet, que vous évitez.')
  })

  it("ne signale rien quand l'ingrédient évité n'est pas dans la recette", () => {
    const recipe = makeRecipe({
      ingredients: [{ id: 'i1', name: 'Ricotta', quantity: 250, unit: 'g', emoji: '🧀', productId: 'p1' }],
    })
    const { answer } = answerRecipeAsk(recipe, "j'aime pas le poulet", EMPTY_SLOTS)
    expect(answer.avoidedIngredientNote).toBeUndefined()
  })

  it('répond au budget quand la question porte sur le prix', () => {
    const recipe = makeRecipe({ estimatedPricePerServing: 3.25 })
    const { answer } = answerRecipeAsk(recipe, "c'est cher ?", EMPTY_SLOTS)
    expect(answer.budgetNote).toBe('Cette recette coûte environ 3,25 € par personne.')
  })

  it('ne répète pas la réponse budget au tour suivant du même fil', () => {
    const recipe = makeRecipe({ estimatedPricePerServing: 3.25 })
    const first = answerRecipeAsk(recipe, "c'est cher ?", EMPTY_SLOTS)
    expect(first.answer.budgetNote).toBeDefined()
    const second = answerRecipeAsk(recipe, 'et sinon niveau temps ?', first.slots)
    expect(second.answer.budgetNote).toBeUndefined()
  })
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

Run: `cd packages/marmiton-prototype && npx vitest run src/lib/__tests__/recipeAskScript.test.ts`
Expected: FAIL — `ingredientSubstituteNote`/`avoidedIngredientNote`/`budgetNote` sont `undefined` partout, "je remplace le parmesan" n'est pas reconnu (regex pas encore corrigée).

- [ ] **Step 3: Corriger le déclencheur de substitution pour couvrir les formes conjuguées**

Dans `packages/marmiton-prototype/src/lib/recipeAskScript.ts`, remplacer :

```ts
/** Détecte une question du type « j'ai pas de four, je peux utiliser quoi à la place ? » —
 * retourne la clé d'équipement reconnue, ou `undefined` si la question n'en mentionne aucune. */
function detectEquipmentQuestion(text: string): string | undefined {
  const norm = normalize(text)
  if (!/\b(pas de|sans|remplacer|à la place|autre chose)\b/.test(norm)) return undefined
  for (const [key, aliases] of Object.entries(EQUIPMENT_ALIASES)) {
    if (aliases.some((alias) => norm.includes(normalize(alias)))) return key
  }
  return undefined
}
```

par :

```ts
/** Déclencheur commun aux questions de substitution (équipement et ingrédient) — `remplac` sans
 * limite de mot en fin de motif pour couvrir "remplace"/"remplacer"/"remplacez", pas seulement
 * l'infinitif. */
const SUBSTITUTION_TRIGGER = /\b(pas de|sans|à la place|autre chose)\b|remplac/

/** Détecte une question du type « j'ai pas de four, je peux utiliser quoi à la place ? » —
 * retourne la clé d'équipement reconnue, ou `undefined` si la question n'en mentionne aucune. */
function detectEquipmentQuestion(text: string): string | undefined {
  const norm = normalize(text)
  if (!SUBSTITUTION_TRIGGER.test(norm)) return undefined
  for (const [key, aliases] of Object.entries(EQUIPMENT_ALIASES)) {
    if (aliases.some((alias) => norm.includes(normalize(alias)))) return key
  }
  return undefined
}
```

- [ ] **Step 4: Ajouter la table de substituts d'ingrédients et la détection dynamique**

Dans le même fichier, juste après la fonction `detectEquipmentQuestion` (avant `function normalize`), ajouter :

```ts

/** Substituts suggérés pour les ingrédients récurrents des recettes mock — même schéma que
 * `EQUIPMENT_SUBSTITUTES`, réutilisé à la fois pour "j'ai pas de X" (Task 4) et pour un ingrédient
 * évité par goût (`avoidedIngredientMatch`, Task 2). Clés normalisées (minuscules, sans accents). */
const INGREDIENT_SUBSTITUTES: Record<string, string> = {
  ricotta: 'du mascarpone ou du fromage frais épais',
  parmesan: 'du gruyère râpé',
  œuf: "de l'aquafaba (l'eau de cuisson des pois chiches), environ 3 c. à soupe par œuf",
  lardons: 'des allumettes de dinde fumées',
}

function findIngredientSubstitute(ingredientName: string): string | undefined {
  const normName = normalize(ingredientName)
  const key = Object.keys(INGREDIENT_SUBSTITUTES).find((k) => normName.includes(k))
  return key ? INGREDIENT_SUBSTITUTES[key] : undefined
}

/** Détecte une question de substitution d'ingrédient — contrairement à l'équipement, pas de
 * vocabulaire fixe : chaque recette a ses propres ingrédients, donc la recherche se fait
 * dynamiquement dans `recipe.ingredients` de la recette affichée. */
function detectIngredientSubstitutionQuestion(recipe: Recipe, text: string): { name: string; substitute?: string } | undefined {
  const norm = normalize(text)
  if (!SUBSTITUTION_TRIGGER.test(norm)) return undefined
  for (const ingredient of recipe.ingredients) {
    const words = normalize(ingredient.name)
      .split(/[^a-zœ]+/)
      .filter((w) => w.length > 2)
    if (words.some((w) => norm.includes(w))) {
      return { name: ingredient.name, substitute: findIngredientSubstitute(ingredient.name) }
    }
  }
  return undefined
}
```

- [ ] **Step 5: Importer `avoidedIngredientMatch` et étendre `RecipeAskAnswer`**

Remplacer :

```ts
import { extractSlots, selectTip, pantryMatch, constraintLabel, RELAXED_REASON, EMPTY_SLOTS } from './agentScript'
```

par :

```ts
import { extractSlots, selectTip, pantryMatch, avoidedIngredientMatch, constraintLabel, RELAXED_REASON, EMPTY_SLOTS } from './agentScript'
```

Remplacer :

```ts
export interface RecipeAskAnswer {
  message: string
  tip?: string
  pantryMatch: PantryMatch | null
  allergens?: string[]
  /** Présent uniquement quand la question porte sur un équipement précis (four, robot…). */
  equipmentNote?: string
}
```

par :

```ts
export interface RecipeAskAnswer {
  message: string
  tip?: string
  pantryMatch: PantryMatch | null
  allergens?: string[]
  /** Présent uniquement quand la question porte sur un équipement précis (four, robot…). */
  equipmentNote?: string
  /** Présent uniquement quand la question porte sur la substitution d'un ingrédient précis de cette recette. */
  ingredientSubstituteNote?: string
  /** Présent uniquement quand un ingrédient évité par goût (slots.avoidIngredients) est présent dans cette recette. */
  avoidedIngredientNote?: string
  /** Présent uniquement quand la question porte sur le prix de cette recette. */
  budgetNote?: string
}
```

- [ ] **Step 6: Brancher la nouvelle logique dans `answerRecipeAsk`**

Remplacer :

```ts
  let equipmentNote: string | undefined
  const askedEquipment = detectEquipmentQuestion(text)
  if (askedEquipment) {
    const required = recipe.equipment ?? []
    const needsIt = required.some((e) => normalize(e).includes(askedEquipment))
    if (needsIt) {
      const substitute = EQUIPMENT_SUBSTITUTES[askedEquipment]
      equipmentNote = substitute
        ? `Pas de souci, vous pouvez remplacer le ${askedEquipment} par ${substitute}.`
        : `Cette recette nécessite un ${askedEquipment}, je n'ai pas d'alternative à vous proposer pour l'instant.`
    } else {
      equipmentNote = `Cette recette ne nécessite pas de ${askedEquipment}.`
    }
    bits.push(equipmentNote)
  }

  const match = pantryMatch(recipe, slots)
```

par :

```ts
  let equipmentNote: string | undefined
  const askedEquipment = detectEquipmentQuestion(text)
  if (askedEquipment) {
    const required = recipe.equipment ?? []
    const needsIt = required.some((e) => normalize(e).includes(askedEquipment))
    if (needsIt) {
      const substitute = EQUIPMENT_SUBSTITUTES[askedEquipment]
      equipmentNote = substitute
        ? `Pas de souci, vous pouvez remplacer le ${askedEquipment} par ${substitute}.`
        : `Cette recette nécessite un ${askedEquipment}, je n'ai pas d'alternative à vous proposer pour l'instant.`
    } else {
      equipmentNote = `Cette recette ne nécessite pas de ${askedEquipment}.`
    }
    bits.push(equipmentNote)
  }

  let ingredientSubstituteNote: string | undefined
  const askedIngredient = detectIngredientSubstitutionQuestion(recipe, text)
  if (askedIngredient) {
    ingredientSubstituteNote = askedIngredient.substitute
      ? `Pas de souci, vous pouvez remplacer ${askedIngredient.name.toLowerCase()} par ${askedIngredient.substitute}.`
      : `Je n'ai pas de suggestion précise pour remplacer ${askedIngredient.name.toLowerCase()}, mais vous pouvez tenter une texture ou un goût similaire.`
    bits.push(ingredientSubstituteNote)
  }

  let avoidedIngredientNote: string | undefined
  const newlyAvoided = slots.avoidIngredients.filter((k) => !prevSlots.avoidIngredients.includes(k))
  if (newlyAvoided.length > 0) {
    const avoided = avoidedIngredientMatch(recipe, { ...slots, avoidIngredients: newlyAvoided })
    if (avoided.length > 0) {
      const [name] = avoided
      const substitute = findIngredientSubstitute(name)
      avoidedIngredientNote = substitute
        ? `Cette recette contient ${name.toLowerCase()}, que vous évitez : vous pouvez le remplacer par ${substitute}.`
        : `Cette recette contient ${name.toLowerCase()}, que vous évitez.`
      bits.push(avoidedIngredientNote)
    }
  }

  let budgetNote: string | undefined
  if (!prevSlots.budgetFocus && slots.budgetFocus) {
    budgetNote = `Cette recette coûte environ ${recipe.estimatedPricePerServing.toFixed(2).replace('.', ',')} € par personne.`
    bits.push(budgetNote)
  }

  const match = pantryMatch(recipe, slots)
```

Puis remplacer le `return` final :

```ts
  return {
    slots,
    answer: {
      message: bits.join(' '),
      tip,
      pantryMatch: match,
      allergens,
      equipmentNote,
    },
  }
}
```

par :

```ts
  return {
    slots,
    answer: {
      message: bits.join(' '),
      tip,
      pantryMatch: match,
      allergens,
      equipmentNote,
      ingredientSubstituteNote,
      avoidedIngredientNote,
      budgetNote,
    },
  }
}
```

- [ ] **Step 7: Lancer les tests pour vérifier qu'ils passent**

Run: `cd packages/marmiton-prototype && npx vitest run src/lib/__tests__/recipeAskScript.test.ts`
Expected: PASS — tous les tests verts, y compris le test de substitution d'équipement conjuguée si tu en ajoutes un (optionnel, la régression est déjà couverte indirectement par Step 1 de cette tâche pour l'ingrédient).

- [ ] **Step 8: Vérifier la compilation TypeScript et lancer la suite complète**

Run: `cd packages/marmiton-prototype && npx tsc --noEmit && npm test`
Expected: aucune erreur, tous les tests verts.

- [ ] **Step 9: Commit**

```bash
git add packages/marmiton-prototype/src/lib/recipeAskScript.ts packages/marmiton-prototype/src/lib/__tests__/recipeAskScript.test.ts
git commit -m "feat(marmiton-prototype): substitution d'ingredient, ingredient evite et reponse budget (fiche recette)"
```

---

### Task 5: Avertissement ingrédient évité sur la carte multi-recette (`AgentConversation.tsx`)

**Files:**
- Modify: `packages/marmiton-prototype/src/components/agent/AgentConversation.tsx`

**Interfaces:**
- Consomme : `avoidedIngredientMatch` (Task 2, `@/lib/agentScript`).

- [ ] **Step 1: Importer `avoidedIngredientMatch` et étendre `CardData`**

Remplacer :

```ts
import {
  EMPTY_SLOTS,
  processTurn,
  recommendationMessage,
  pantryMatch,
  selectTip,
  constraintLabel,
  selectCommunityQuote,
  isInSeason,
  type AgentSlots,
  type PantryMatch,
  type CommunityQuote,
  type RecommendedRecipe,
} from '@/lib/agentScript'
```

par :

```ts
import {
  EMPTY_SLOTS,
  processTurn,
  recommendationMessage,
  pantryMatch,
  avoidedIngredientMatch,
  selectTip,
  constraintLabel,
  selectCommunityQuote,
  isInSeason,
  type AgentSlots,
  type PantryMatch,
  type CommunityQuote,
  type RecommendedRecipe,
} from '@/lib/agentScript'
```

Remplacer :

```ts
interface CardData {
  recipe: Recipe
  /** false = quasi-match (complément du slate) — porte son propre marqueur visuel, distinct d'une correspondance confirmée. */
  matched: boolean
  pantryMatch: PantryMatch | null
  tip?: string
  /** Avis communautaire contextuel (contrainte ou temps), empilé avec `tip` sur la carte quand les deux existent — maximiser l'info visible d'un coup d'œil. */
  communityQuote?: CommunityQuote
  /** Affichés seulement quand la conversation a signalé une contrainte allergie — transparence, pas de filtrage automatique. */
  allergens?: string[]
  health?: { calories?: number; protein?: number }
  /** Label de contrainte confirmée (ex. "Végétarien"), absent sur un quasi-match ou pour `allergie`. */
  constraintLabel?: string
  inSeason?: boolean
  servings?: number
}
```

par :

```ts
interface CardData {
  recipe: Recipe
  /** false = quasi-match (complément du slate) — porte son propre marqueur visuel, distinct d'une correspondance confirmée. */
  matched: boolean
  pantryMatch: PantryMatch | null
  tip?: string
  /** Avis communautaire contextuel (contrainte ou temps), empilé avec `tip` sur la carte quand les deux existent — maximiser l'info visible d'un coup d'œil. */
  communityQuote?: CommunityQuote
  /** Affichés seulement quand la conversation a signalé une contrainte allergie — transparence, pas de filtrage automatique. */
  allergens?: string[]
  /** Ingrédients de cette recette que la conversation a signalés comme évités par goût — informationnel, ne filtre jamais la recommandation. */
  avoidedIngredients: string[]
  health?: { calories?: number; protein?: number }
  /** Label de contrainte confirmée (ex. "Végétarien"), absent sur un quasi-match ou pour `allergie`. */
  constraintLabel?: string
  inSeason?: boolean
  servings?: number
}
```

- [ ] **Step 2: Calculer `avoidedIngredients` dans `cardExtras`**

Remplacer :

```ts
function cardExtras(recipe: Recipe, slots: AgentSlots, matched: boolean) {
  return {
    pantryMatch: pantryMatch(recipe, slots),
    tip: selectTip(recipe, slots),
    communityQuote: selectCommunityQuote(recipe, slots, matched),
    allergens: slots.constraint === 'allergie' ? recipe.allergens : undefined,
    // Affichée directement dès que la recette porte la donnée — plus besoin de la demander
    // via une action séparée (ancien chip "Infos nutrition").
    health: recipe.calories !== undefined ? { calories: recipe.calories, protein: recipe.protein } : undefined,
    constraintLabel: constraintLabel(recipe, slots, matched),
    inSeason: isInSeason(recipe),
    servings: slots.servings,
  }
}
```

par :

```ts
function cardExtras(recipe: Recipe, slots: AgentSlots, matched: boolean) {
  return {
    pantryMatch: pantryMatch(recipe, slots),
    tip: selectTip(recipe, slots),
    communityQuote: selectCommunityQuote(recipe, slots, matched),
    allergens: slots.constraint === 'allergie' ? recipe.allergens : undefined,
    avoidedIngredients: avoidedIngredientMatch(recipe, slots),
    // Affichée directement dès que la recette porte la donnée — plus besoin de la demander
    // via une action séparée (ancien chip "Infos nutrition").
    health: recipe.calories !== undefined ? { calories: recipe.calories, protein: recipe.protein } : undefined,
    constraintLabel: constraintLabel(recipe, slots, matched),
    inSeason: isInSeason(recipe),
    servings: slots.servings,
  }
}
```

- [ ] **Step 3: Afficher le bandeau d'avertissement sur la carte**

Remplacer :

```tsx
                      {card.allergens && card.allergens.length > 0 && (
                        <p className="chat-card__highlight chat-card__highlight--warning">
                          <Warning size={16} weight="fill" aria-hidden="true" />
                          Contient : {card.allergens.join(', ').toLowerCase()}
                        </p>
                      )}

                      {card.communityQuote && (
```

par :

```tsx
                      {card.allergens && card.allergens.length > 0 && (
                        <p className="chat-card__highlight chat-card__highlight--warning">
                          <Warning size={16} weight="fill" aria-hidden="true" />
                          Contient : {card.allergens.join(', ').toLowerCase()}
                        </p>
                      )}

                      {card.avoidedIngredients.length > 0 && (
                        <p className="chat-card__highlight chat-card__highlight--warning">
                          <Warning size={16} weight="fill" aria-hidden="true" />
                          Contient {card.avoidedIngredients.join(', ').toLowerCase()} que vous évitez
                        </p>
                      )}

                      {card.communityQuote && (
```

- [ ] **Step 4: Vérifier la compilation TypeScript**

Run: `cd packages/marmiton-prototype && npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 5: Vérification manuelle en dev server**

Démarrer le serveur de dev (`marmiton-prototype-dev` dans `.claude/launch.json`) et ouvrir `/agent`. Écrire "j'aime pas les lardons" puis "pâtes" : le carousel doit afficher la carbonara avec un bandeau rouge/orange "Contient lardons fumés que vous évitez" (même registre visuel que le bandeau allergènes).

- [ ] **Step 6: Commit**

```bash
git add packages/marmiton-prototype/src/components/agent/AgentConversation.tsx
git commit -m "feat(marmiton-prototype): avertit sur la carte agent quand un ingredient evite est present"
```

---

### Task 6: Afficher les nouvelles réponses dans le drawer mono-recette (`RecipeAgentDrawer.tsx`)

**Files:**
- Modify: `packages/marmiton-prototype/src/components/agent/RecipeAgentDrawer.tsx`

**Interfaces:**
- Consomme : `RecipeAskAnswer.ingredientSubstituteNote` / `.avoidedIngredientNote` / `.budgetNote` (Task 4).

- [ ] **Step 1: Importer les icônes nécessaires**

Remplacer :

```ts
import { PaperPlaneRight, CheckCircle, Lightbulb, Warning, CookingPot } from '@phosphor-icons/react'
```

par :

```ts
import { PaperPlaneRight, CheckCircle, Lightbulb, Warning, CookingPot, ArrowsClockwise, Coins } from '@phosphor-icons/react'
```

- [ ] **Step 2: Afficher les trois nouveaux champs**

Remplacer :

```tsx
                      {m.answer.equipmentNote && (
                        <p className="recipe-ask-highlight recipe-ask-highlight--info">
                          <CookingPot size={16} weight="fill" aria-hidden="true" />
                          {m.answer.equipmentNote}
                        </p>
                      )}
                    </div>
                  )}
```

par :

```tsx
                      {m.answer.equipmentNote && (
                        <p className="recipe-ask-highlight recipe-ask-highlight--info">
                          <CookingPot size={16} weight="fill" aria-hidden="true" />
                          {m.answer.equipmentNote}
                        </p>
                      )}
                      {m.answer.ingredientSubstituteNote && (
                        <p className="recipe-ask-highlight recipe-ask-highlight--info">
                          <ArrowsClockwise size={16} weight="fill" aria-hidden="true" />
                          {m.answer.ingredientSubstituteNote}
                        </p>
                      )}
                      {m.answer.avoidedIngredientNote && (
                        <p className="recipe-ask-highlight recipe-ask-highlight--warning">
                          <Warning size={16} weight="fill" aria-hidden="true" />
                          {m.answer.avoidedIngredientNote}
                        </p>
                      )}
                      {m.answer.budgetNote && (
                        <p className="recipe-ask-highlight recipe-ask-highlight--info">
                          <Coins size={16} weight="fill" aria-hidden="true" />
                          {m.answer.budgetNote}
                        </p>
                      )}
                    </div>
                  )}
```

- [ ] **Step 3: Vérifier la compilation TypeScript**

Run: `cd packages/marmiton-prototype && npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 4: Lancer la suite de tests complète du package**

Run: `cd packages/marmiton-prototype && npm test`
Expected: PASS — tous les tests verts (Task 1 à 4).

- [ ] **Step 5: Vérification manuelle en dev server**

Ouvrir `/recipe` (recette par défaut avec équipement `four`, ex. tarte aux abricots) ou naviguer vers la nouvelle recette vegan (`/recipe?recipe=r-curry-pois-chiches`) via `/agent`. Dans le drawer mono-recette :
1. Taper "c'est cher ?" → réponse avec le prix, icône pièces.
2. Sur une recette avec ricotta (`/recipe?recipe=r-courgettes-ricotta`), taper "j'ai pas de ricotta, je remplace par quoi ?" → suggestion mascarpone/fromage frais, icône flèches.
3. Taper "j'aime pas la ricotta" → bandeau d'avertissement orange avec la même suggestion.
4. Sur mobile (`resize_window` preset `mobile`), vérifier que les nouveaux bandeaux s'affichent sans chevauchement.

Prendre une capture d'écran du drawer avec au moins un des trois nouveaux bandeaux visibles, à partager avec l'utilisateur.

- [ ] **Step 6: Commit**

```bash
git add packages/marmiton-prototype/src/components/agent/RecipeAgentDrawer.tsx
git commit -m "feat(marmiton-prototype): affiche substitution ingredient, ingredient evite et budget dans le drawer"
```

---

## Self-Review

- **Couverture de la spec** : vegan distinct de végétarien (Task 1) ✓, contrainte débutant via `difficulty` (Task 1) ✓, `tipForBeginners` (Task 1, Task 3) ✓, `avoidIngredients` détecté et affiché sur les deux surfaces (Task 2, 5, 6) ✓, substitution d'ingrédient mono-recette (Task 4) ✓, réutilisation de la table de substituts pour l'ingrédient évité (Task 4) ✓, budget/prix mono-recette sans effet sur `/agent` (Task 4) ✓, recette mock vegan (Task 3) ✓. Hors scope de la spec (contraintes combinées, correction en conversation, filtrage `/agent`) : non touchés ✓.
- **Placeholders** : aucun — chaque step contient le code complet, aucune section "TODO"/"similaire à Task N".
- **Cohérence de types** : `AgentSlots.avoidIngredients`/`budgetFocus` définis en Task 2, consommés identiquement en Task 4 (`recipeAskScript.ts`) et Task 5 (`AgentConversation.tsx`) ; `RecipeAskAnswer` étendu en Task 4, consommé avec les mêmes noms de champs en Task 6 ; `avoidedIngredientMatch(recipe, slots)` a la même signature partout où il est appelé (Task 2 tests, Task 4, Task 5).
- **Régression connue et traitée explicitement** : l'ajout d'une deuxième recette taguée `vegetarien` change le comportement du test `buildRecipeSlate` existant — corrigé dans Task 3 plutôt que découvert en exécutant la suite après coup.
