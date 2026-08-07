# Contraintes combinées et correction en conversation (sous-projet 2) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `AgentSlots.constraint?: Constraint` (valeur unique) devient `constraints: Constraint[]` (tableau) dans tout le moteur agent — un user peut exprimer plusieurs contraintes à la fois ("un enfant et sans gluten") et en retirer une en cours de conversation ("finalement pas de poulet").

**Architecture:** Le changement de forme part d'`agentScript.ts` (source de vérité de `AgentSlots`) et se propage par types : chaque fonction qui lisait `slots.constraint` (une valeur) est réécrite pour lire `slots.constraints` (un tableau) — `constraintApplies`/`constraintLabel` (une seule contrainte) sont remplacées par `satisfiedConstraints`/`constraintLabels` (plusieurs). `extractSlots` gagne un troisième mode par tour (ajout / retrait, en plus d'avoir/éviter déjà existant pour les ingrédients) via un nouveau déclencheur `RETRACT_WORDS`, même registre que `AVOID_WORDS`/`BUDGET_WORDS`. `recipeAskScript.ts` (fiche recette) généralise sa confirmation de contrainte au tableau et ajoute un accusé de réception explicite pour tout retrait — `/agent` (multi-recette) n'a besoin d'aucun accusé dédié, le retrait se reflète juste dans la recommandation suivante.

**Tech Stack:** TypeScript, Vitest (logique pure). React/Next.js pour `AgentConversation.tsx`, vérifié manuellement (pas de test automatisé — voir contraintes globales). `RecipeAgentDrawer.tsx` n'a besoin d'aucune modification pour ce plan (voir note en fin de document).

## Global Constraints

- Aucun tiret cadratin (« — ») dans les messages agent affichés à l'utilisateur.
- Repli sur échec : abandon de **toutes** les contraintes d'un coup, jamais une à la fois (pas d'ordre de priorité/spécificité entre les 8 valeurs de `Constraint`).
- Retrait de contrainte/ingrédient uniquement — pas de retrait de `time`/`servings` (une nouvelle valeur écrase déjà l'ancienne) ni de `avoidIngredients`/`budgetFocus`/`healthFocus` autrement que via le mécanisme d'ingrédient ci-dessus.
- Un déclencheur de retrait sans contrainte/ingrédient reconnu dans le même texte ne produit aucun effet observable (jamais d'effacement large et non ciblé).
- Pas de nouvelle donnée mock : le cas combiné `vegan`+`vegetarien` existe déjà (recette curry, sous-projet 1).
- Pas de test automatisé pour `AgentConversation.tsx` (composant React) — ce package n'a ni `@testing-library/react` ni environnement `jsdom` configuré. Vérification manuelle en dev server uniquement.

---

### Task 1: `agentScript.ts` — contraintes multiples, retrait, tous les consommateurs

**Files:**
- Modify: `packages/marmiton-prototype/src/lib/agentScript.ts` (remplacement intégral du contenu)
- Modify: `packages/marmiton-prototype/src/lib/__tests__/agentScript.test.ts` (remplacement intégral du contenu)

**Interfaces:**
- Produit (utilisé par Task 2 et Task 3) :
  - `AgentSlots.constraints: Constraint[]` (remplace `constraint?: Constraint`)
  - `export function constraintSatisfiedBy(recipe: Recipe, constraint: Constraint): boolean` (devient exporté)
  - `export function satisfiedConstraints(recipe: Recipe, slots: AgentSlots, matched: boolean): Exclude<Constraint, 'allergie'>[]` (remplace `constraintApplies`, retiré)
  - `export function constraintLabels(recipe: Recipe, slots: AgentSlots, matched: boolean): string[]` (remplace `constraintLabel`, retiré)
  - `AgentTurnResult`'s `relaxed` variant : `droppedConstraints: Constraint[]` (remplace `droppedConstraint: string`)
  - `EMPTY_SLOTS` inclut `constraints: []`

Ce changement touche la quasi-totalité du fichier de manière interdépendante au niveau du typage — chaque étape ci-dessous montre le contenu complet des deux fichiers plutôt que des diffs isolés, pour éviter toute ambiguïté sur un changement aussi transverse.

- [ ] **Step 1: Écrire les tests (échouent — le fichier source n'a pas encore changé)**

Remplacer l'intégralité de `packages/marmiton-prototype/src/lib/__tests__/agentScript.test.ts` par :

```ts
import { describe, it, expect } from 'vitest'
import {
  satisfiedConstraints,
  constraintLabels,
  selectCommunityQuote,
  buildRecipeSlate,
  processTurn,
  extractSlots,
  selectTip,
  avoidedIngredientMatch,
  EMPTY_SLOTS,
} from '../agentScript'
import type { AgentSlots } from '../agentScript'
import type { Recipe } from '../../data/types/recipe'
import { MOCK_RECIPES } from '../../data/mock/recipes'

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

function makeSlots(overrides: Partial<AgentSlots> = {}): AgentSlots {
  return { ingredients: [], avoidIngredients: [], constraints: [], ...overrides }
}

describe('satisfiedConstraints', () => {
  it('retourne les contraintes satisfaites quand matched=true', () => {
    const recipe = makeRecipe({ tags: ['enfant'] })
    expect(satisfiedConstraints(recipe, makeSlots({ constraints: ['enfant'] }), true)).toEqual(['enfant'])
  })

  it('retourne un tableau vide quand matched=false (résultat relaxed)', () => {
    const recipe = makeRecipe({ tags: ['enfant'] })
    expect(satisfiedConstraints(recipe, makeSlots({ constraints: ['enfant'] }), false)).toEqual([])
  })

  it('exclut toujours allergie du résultat, même quand matched=true', () => {
    const recipe = makeRecipe({ tags: ['allergie'] })
    expect(satisfiedConstraints(recipe, makeSlots({ constraints: ['allergie'] }), true)).toEqual([])
  })

  it('ne retourne que le sous-ensemble réellement satisfait quand plusieurs contraintes sont posées', () => {
    const recipe = makeRecipe({ tags: ['vegetarien'] })
    expect(
      satisfiedConstraints(recipe, makeSlots({ constraints: ['vegetarien', 'sans-gluten'] }), true)
    ).toEqual(['vegetarien'])
  })
})

describe('constraintLabels', () => {
  it('retourne un label par contrainte satisfaite', () => {
    const recipe = makeRecipe({ tags: ['vegetarien', 'enfant'] })
    expect(constraintLabels(recipe, makeSlots({ constraints: ['vegetarien', 'enfant'] }), true)).toEqual([
      'Végétarien',
      'Adapté aux enfants',
    ])
  })

  it('confirme vegan uniquement si recipe.tags contient vegan', () => {
    const recipe = makeRecipe({ tags: ['vegan', 'vegetarien'] })
    expect(constraintLabels(recipe, makeSlots({ constraints: ['vegan'] }), true)).toEqual(['Vegan'])
  })

  it('ne confirme pas vegan si seul vegetarien est tagué', () => {
    const recipe = makeRecipe({ tags: ['vegetarien'] })
    expect(constraintLabels(recipe, makeSlots({ constraints: ['vegan'] }), true)).toEqual([])
  })

  it('confirme débutant via recipe.difficulty plutôt qu\'un tag', () => {
    const recipe = makeRecipe({ tags: [], difficulty: 'facile' })
    expect(constraintLabels(recipe, makeSlots({ constraints: ['debutant'] }), true)).toEqual(['Facile pour débuter'])
  })

  it('ne confirme pas débutant si la difficulté n\'est pas facile', () => {
    const recipe = makeRecipe({ difficulty: 'moyen' })
    expect(constraintLabels(recipe, makeSlots({ constraints: ['debutant'] }), true)).toEqual([])
  })

  it('tableau vide sur un résultat relaxed', () => {
    const recipe = makeRecipe({ tags: ['vegetarien'] })
    expect(constraintLabels(recipe, makeSlots({ constraints: ['vegetarien'] }), false)).toEqual([])
  })
})

describe('selectCommunityQuote', () => {
  it('retourne undefined si aucune contrainte et aucun temps ne sont renseignés', () => {
    const recipe = makeRecipe({ reviews: [{ text: 'Astuce', tag: 'enfant' }] })
    expect(selectCommunityQuote(recipe, makeSlots(), true)).toBeUndefined()
  })

  it('retourne la quote du premier avis tagué correspondant à la contrainte, sans compteur', () => {
    const recipe = makeRecipe({
      reviews: [
        { text: 'Coupez le poulet en petits morceaux.', tag: 'enfant' },
        { text: 'Version sans piment pour les enfants.', tag: 'enfant' },
        { text: 'Se congèle très bien.', tag: 'time' },
      ],
    })
    const result = selectCommunityQuote(recipe, makeSlots({ constraints: ['enfant'] }), true)
    expect(result).toEqual({ text: 'Coupez le poulet en petits morceaux.' })
    expect(result).not.toHaveProperty('count')
  })

  it('retourne undefined si la contrainte matche mais qu\'aucun avis ne porte ce tag', () => {
    const recipe = makeRecipe({ reviews: [{ text: 'Se congèle très bien.', tag: 'time' }] })
    expect(selectCommunityQuote(recipe, makeSlots({ constraints: ['enfant'] }), true)).toBeUndefined()
  })

  it('régression critique : ne montre jamais de quote de contrainte sur un résultat relaxed, même si recipe.tags contient encore la contrainte abandonnée', () => {
    const recipe = makeRecipe({
      tags: ['enfant'],
      reviews: [{ text: 'Coupez le poulet en petits morceaux.', tag: 'enfant' }],
    })
    expect(selectCommunityQuote(recipe, makeSlots({ constraints: ['enfant'] }), false)).toBeUndefined()
  })

  it('exclut la contrainte allergie même quand matched=true', () => {
    const recipe = makeRecipe({ reviews: [{ text: 'Sans trace de fruits à coque.', tag: 'enfant' }] })
    expect(selectCommunityQuote(recipe, makeSlots({ constraints: ['allergie'] }), true)).toBeUndefined()
  })

  it('retourne une quote taguée time quand la recette tient dans le temps annoncé', () => {
    const recipe = makeRecipe({
      duration: 20,
      reviews: [
        { text: 'Vraiment prête en 20 minutes, chrono en main.', tag: 'time' },
        { text: 'Se prépare la veille sans problème.', tag: 'time' },
      ],
    })
    const result = selectCommunityQuote(recipe, makeSlots({ time: 25 }), true)
    expect(result).toEqual({ text: 'Vraiment prête en 20 minutes, chrono en main.' })
  })

  it('ne retourne pas de quote time si la recette dépasse le temps annoncé', () => {
    const recipe = makeRecipe({
      duration: 45,
      reviews: [{ text: 'Vraiment prête en 20 minutes.', tag: 'time' }],
    })
    expect(selectCommunityQuote(recipe, makeSlots({ time: 25 }), true)).toBeUndefined()
  })

  it('priorise la contrainte sur le temps quand les deux matchent', () => {
    const recipe = makeRecipe({
      duration: 20,
      reviews: [
        { text: 'Adaptée aux enfants difficiles.', tag: 'enfant' },
        { text: 'Vraiment rapide.', tag: 'time' },
      ],
    })
    const result = selectCommunityQuote(recipe, makeSlots({ constraints: ['enfant'], time: 25 }), true)
    expect(result).toEqual({ text: 'Adaptée aux enfants difficiles.' })
  })

  it('avec plusieurs contraintes satisfaites, utilise la quote de la première (ordre d\'expression)', () => {
    const recipe = makeRecipe({
      tags: ['enfant', 'sans-sauce'],
      reviews: [
        { text: 'Adaptée aux enfants difficiles.', tag: 'enfant' },
        { text: 'Aucune sauce à préparer.', tag: 'sans-sauce' },
      ],
    })
    const result = selectCommunityQuote(recipe, makeSlots({ constraints: ['sans-sauce', 'enfant'] }), true)
    expect(result).toEqual({ text: 'Aucune sauce à préparer.' })
  })

  it('ne plante pas et retourne undefined quand recipe.reviews est absent', () => {
    const recipe = makeRecipe({ reviews: undefined })
    expect(selectCommunityQuote(recipe, makeSlots({ constraints: ['enfant'] }), true)).toBeUndefined()
  })
})

describe('buildRecipeSlate', () => {
  it('retourne jusqu\'à 3 vrais matchs, triés par score décroissant, tous matched=true', () => {
    const { recipes, hasRealMatch } = buildRecipeSlate(makeSlots({ ingredients: ['poulet', 'courgette', 'thon'] }))
    expect(hasRealMatch).toBe(true)
    expect(recipes).toHaveLength(3)
    expect(recipes.every((r) => r.matched)).toBe(true)
    expect(recipes.map((r) => r.recipe.id)).toEqual(['r-poulet-citron', 'r-courgettes-ricotta', 'r-salade-nicoise'])
  })

  it('complète avec un quasi-match (matched=false) quand deux vrais matchs existent, sans doublon', () => {
    const { recipes, hasRealMatch } = buildRecipeSlate(makeSlots({ constraints: ['vegetarien'] }))
    expect(hasRealMatch).toBe(true)
    expect(recipes).toHaveLength(3)
    expect(recipes[0]).toMatchObject({ matched: true, recipe: { id: 'r-courgettes-ricotta' } })
    expect(recipes[1]).toMatchObject({ matched: true, recipe: { id: 'r-curry-pois-chiches' } })
    expect(recipes[2].matched).toBe(false)
    const ids = recipes.map((r) => r.recipe.id)
    expect(new Set(ids).size).toBe(3)
  })

  it('un vrai match vegan existe et n\'inclut pas les recettes seulement végétariennes', () => {
    const { recipes, hasRealMatch } = buildRecipeSlate(makeSlots({ constraints: ['vegan'] }))
    expect(hasRealMatch).toBe(true)
    expect(recipes[0].matched).toBe(true)
    expect(recipes[0].recipe.id).toBe('r-curry-pois-chiches')
  })

  it('debutant matche les recettes difficulty facile sans dépendre de tags', () => {
    const { recipes, hasRealMatch } = buildRecipeSlate(makeSlots({ constraints: ['debutant'] }))
    expect(hasRealMatch).toBe(true)
    expect(recipes.every((r) => r.matched)).toBe(true)
    expect(recipes.map((r) => r.recipe.id)).toEqual(['r-poulet-citron', 'r-courgettes-ricotta', 'r-pates-carbonara'])
  })

  it('slate entièrement composé de quasi-matchs quand aucune recette ne score, hasRealMatch=false', () => {
    const { recipes, hasRealMatch } = buildRecipeSlate(makeSlots({ constraints: ['sans-gluten'] }))
    expect(hasRealMatch).toBe(false)
    expect(recipes).toHaveLength(3)
    expect(recipes.every((r) => !r.matched)).toBe(true)
  })

  it('cas limite : slate jamais vide même quand aucun quasi-match ne convient (filet MOCK_RECIPES[0])', () => {
    const { recipes, hasRealMatch } = buildRecipeSlate(makeSlots({ constraints: ['sans-lactose'], time: 1 }))
    expect(hasRealMatch).toBe(false)
    expect(recipes.length).toBeGreaterThan(0)
    expect(recipes[0].recipe.id).toBe(MOCK_RECIPES[0].id)
  })

  it('une recette qui satisfait deux contraintes posées sort devant celle qui n\'en satisfait qu\'une', () => {
    // La recette curry porte à la fois vegan et vegetarien (score 2+2=4) ; courgettes-ricotta
    // ne porte que vegetarien (score 2) — le curry doit sortir en tête malgré son ordre
    // ultérieur dans MOCK_RECIPES (index 6 vs 1), le score prime sur l'ordre du tableau.
    const { recipes } = buildRecipeSlate(makeSlots({ constraints: ['vegan', 'vegetarien'] }))
    expect(recipes[0].recipe.id).toBe('r-curry-pois-chiches')
    expect(recipes[0].score).toBe(4)
  })
})

describe('processTurn — recommandation multi-recettes', () => {
  it('kind recommend avec un slate de recettes quand au moins un vrai match existe', () => {
    const { result } = processTurn('poulet', EMPTY_SLOTS, 0)
    expect(result.kind).toBe('recommend')
    if (result.kind === 'recommend') {
      expect(result.recipes.length).toBeGreaterThan(0)
      expect(result.recipes[0].matched).toBe(true)
    }
  })

  it('kind relaxed avec un slate entièrement matched=false quand aucun vrai match n\'existe, après un échec de clarification', () => {
    const { result } = processTurn('un plat sans gluten', EMPTY_SLOTS, 1)
    expect(result.kind).toBe('relaxed')
    if (result.kind === 'relaxed') {
      expect(result.recipes.every((r) => !r.matched)).toBe(true)
      expect(result.message).toContain(result.recipes[0].recipe.name)
    }
  })

  it('garde "signal insuffisant" toujours active sur le score du premier vrai match', () => {
    const { result } = processTurn('je suis vegetarien', EMPTY_SLOTS, 0)
    expect(result.kind).toBe('clarify')
  })

  it('message relaxed combine plusieurs contraintes abandonnées avec "et"', () => {
    const { result } = processTurn('sans gluten, sans lactose', EMPTY_SLOTS, 1)
    expect(result.kind).toBe('relaxed')
    if (result.kind === 'relaxed') {
      expect(result.droppedConstraints).toEqual(['sans-gluten', 'sans-lactose'])
      expect(result.message).toContain('sans gluten et sans lactose')
    }
  })

  it('reasonFor inclut désormais toutes les contraintes, pas seulement enfant/sans-sauce', () => {
    const { result } = processTurn('vegetarien, 20 minutes', EMPTY_SLOTS, 0)
    expect(result.kind).toBe('recommend')
    if (result.kind === 'recommend') {
      expect(result.reason).toContain('végétarienne')
    }
  })
})

describe('extractSlots — vegan distinct de végétarien', () => {
  it('reconnaît vegan comme une contrainte distincte', () => {
    expect(extractSlots('je cherche une recette vegan', EMPTY_SLOTS).constraints).toEqual(['vegan'])
  })

  it('reconnaît toujours végétarien séparément', () => {
    expect(extractSlots('un plat végétarien', EMPTY_SLOTS).constraints).toEqual(['vegetarien'])
  })
})

describe('extractSlots — signal débutant', () => {
  it('reconnaît un signal débutant', () => {
    expect(extractSlots('je débute en cuisine', EMPTY_SLOTS).constraints).toEqual(['debutant'])
  })

  it('reconnaît la formulation accentuée "je suis débutant"', () => {
    expect(extractSlots('je suis débutant', EMPTY_SLOTS).constraints).toEqual(['debutant'])
  })

  it('reconnaît une formulation alternative', () => {
    expect(extractSlots("j'ai jamais cuisiné", EMPTY_SLOTS).constraints).toEqual(['debutant'])
  })
})

describe('extractSlots — contraintes combinées', () => {
  it('accumule plusieurs contraintes mentionnées dans des tours différents', () => {
    const first = extractSlots('je suis vegetarien', EMPTY_SLOTS)
    const second = extractSlots('et sans gluten aussi', first)
    expect(second.constraints).toEqual(['vegetarien', 'sans-gluten'])
  })

  it('accumule plusieurs contraintes mentionnées dans le même tour', () => {
    expect(extractSlots('vegetarien et sans gluten', EMPTY_SLOTS).constraints).toEqual(['vegetarien', 'sans-gluten'])
  })

  it('ne duplique pas une contrainte déjà posée', () => {
    const first = extractSlots('je suis vegetarien', EMPTY_SLOTS)
    const second = extractSlots('toujours vegetarien', first)
    expect(second.constraints).toEqual(['vegetarien'])
  })
})

describe("extractSlots — retrait de contrainte et d'ingrédient", () => {
  it('retire une contrainte déjà posée sur un tour de retrait', () => {
    const first = extractSlots('je suis vegetarien', EMPTY_SLOTS)
    const second = extractSlots('finalement pas vegetarien', first)
    expect(second.constraints).toEqual([])
  })

  it("retire un ingrédient déjà déclaré (j'ai) sur un tour de retrait", () => {
    const first = extractSlots("j'ai du poulet", EMPTY_SLOTS)
    const second = extractSlots('finalement pas de poulet', first)
    expect(second.ingredients).toEqual([])
  })

  it('retire un ingrédient déjà évité sur un tour de retrait', () => {
    const first = extractSlots("j'aime pas les lardons", EMPTY_SLOTS)
    const second = extractSlots('en fait peu importe les lardons', first)
    expect(second.avoidIngredients).toEqual([])
  })

  it('ne retire rien quand le tour de retrait ne porte pas de mot-clé identifiable', () => {
    const first = extractSlots('je suis vegetarien', EMPTY_SLOTS)
    const second = extractSlots('en fait peu importe', first)
    expect(second.constraints).toEqual(['vegetarien'])
  })

  it("un tour de retrait ne peut jamais ajouter un ingrédient non encore posé", () => {
    const result = extractSlots('finalement pas de courgette', EMPTY_SLOTS)
    expect(result.ingredients).toEqual([])
    expect(result.avoidIngredients).toEqual([])
  })
})

describe('selectTip — débutant', () => {
  it('utilise tipForBeginners quand la contrainte est débutant', () => {
    const recipe = makeRecipe({ tip: 'Astuce générale', tipForBeginners: 'Astuce débutant' })
    expect(selectTip(recipe, makeSlots({ constraints: ['debutant'] }))).toBe('Astuce débutant')
  })

  it('retombe sur tip si tipForBeginners est absent', () => {
    const recipe = makeRecipe({ tip: 'Astuce générale' })
    expect(selectTip(recipe, makeSlots({ constraints: ['debutant'] }))).toBe('Astuce générale')
  })
})

describe("extractSlots — avoidIngredients (dégoût, distinct de \"j'ai\")", () => {
  it('détecte un ingrédient évité par goût, sans le mettre dans "ingredients"', () => {
    const slots = extractSlots("j'aime pas les courgettes", EMPTY_SLOTS)
    expect(slots.avoidIngredients).toEqual(['courgette'])
    expect(slots.ingredients).toEqual([])
  })

  it('reconnaît une formulation alternative ("j\'évite")', () => {
    expect(extractSlots("j'évite les lardons", EMPTY_SLOTS).avoidIngredients).toEqual(['lardons'])
  })

  it('reconnaît une apostrophe typographique (courbe) comme équivalente à une apostrophe droite', () => {
    expect(extractSlots('j’aime pas les courgettes', EMPTY_SLOTS).avoidIngredients).toEqual(['courgette'])
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
  it('retourne les ingrédients de la recette présents dans avoidIngredients', () => {
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

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

Run: `cd packages/marmiton-prototype && npx vitest run src/lib/__tests__/agentScript.test.ts`
Expected: FAIL — imports cassés (`satisfiedConstraints`/`constraintLabels` n'existent pas encore, `constraintApplies`/`constraintLabel` sont encore ceux importés par l'ancien code source), `makeSlots`/tests référencent `constraints` qui n'existe pas encore sur `AgentSlots`.

- [ ] **Step 3: Remplacer l'intégralité de `agentScript.ts`**

Remplacer l'intégralité de `packages/marmiton-prototype/src/lib/agentScript.ts` par :

```ts
import { MOCK_RECIPES } from '../data/mock/recipes'
import type { Recipe, Season } from '../data/types/recipe'

/**
 * Classificateur scripté local à marmiton-prototype (Lot 1 — prototype de simulation,
 * pas un backend IA réel). Aucune dépendance à assistant-shopping, par principe
 * d'isolation entre packages. Le texte libre reste toujours la voie primaire ;
 * les chips ne sont qu'un raccourci qui produit le même texte reconnu.
 */

export type Constraint = 'enfant' | 'sans-sauce' | 'vegetarien' | 'vegan' | 'sans-gluten' | 'sans-lactose' | 'allergie' | 'debutant'

export interface AgentSlots {
  time?: number
  servings?: number
  /** Contraintes exprimées dans la conversation — un tableau, pas une valeur unique : un même
   * user peut cumuler "enfant" et "sans-gluten" dans un même fil. Vide = aucune contrainte. */
  constraints: Constraint[]
  ingredients: string[]
  /** Signale un intérêt pour les infos nutritionnelles (indépendant de `constraints`) — affiche calories/protéines sur la carte. */
  healthFocus?: boolean
  /** Ingrédients évités par goût (ex. "j'aime pas les champignons") — distinct d'une allergie
   * (`constraints` incluant `'allergie'`, médical) et de `ingredients` (ce que l'utilisateur *a*, sens opposé). */
  avoidIngredients: string[]
  /** Signale un intérêt pour le prix (indépendant de `constraints`) — même schéma que `healthFocus`. */
  budgetFocus?: boolean
}

export interface PantryMatch {
  matchedIngredientNames: string[]
  missingCount: number
}

/** Alias entre les mots-clés extraits de la conversation et les noms d'ingrédients affichés dans les recettes. */
const INGREDIENT_ALIASES: Record<string, string[]> = {
  pates: ['pâtes', 'pates', 'spaghetti'],
}

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

/**
 * Croise ce que l'utilisateur a déclaré avoir (`AgentSlots.ingredients`) avec la liste
 * complète des ingrédients de la recette, pour afficher un écart panier concret sur la
 * carte recette de l'agent (ex. « Utilise vos lardons et vos œufs · il manque 2 produits »).
 * Les produits de base (`staple: true`, ex. huile, sel) sont exclus du calcul — ni comptés
 * comme correspondance ni comme manquants, pour ne pas diluer le signal avec des banalités.
 * Retourne `null` si l'utilisateur n'a mentionné aucun ingrédient — pas de bandeau à afficher.
 */
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

/**
 * Choisit l'astuce la plus pertinente pour le contexte de la conversation. `tipForKids`
 * prend le pas sur `tip` quand `constraints` contient « enfant », `tipForBeginners`
 * quand elle contient « debutant ».
 */
export function selectTip(recipe: Recipe, slots: AgentSlots): string | undefined {
  if (slots.constraints.includes('enfant') && recipe.tipForKids) return recipe.tipForKids
  if (slots.constraints.includes('debutant') && recipe.tipForBeginners) return recipe.tipForBeginners
  return recipe.tip
}

const CONSTRAINT_LABELS: Record<Exclude<Constraint, 'allergie'>, string> = {
  enfant: 'Adapté aux enfants',
  'sans-sauce': 'Sans sauce',
  vegetarien: 'Végétarien',
  vegan: 'Vegan',
  'sans-gluten': 'Sans gluten',
  'sans-lactose': 'Sans lactose',
  debutant: 'Facile pour débuter',
}

/**
 * Variante accordée en genre de `CONSTRAINT_LABELS`, pour insertion dans une phrase
 * complète ("une recette {phrase}") côté message `relaxed` — `CONSTRAINT_LABELS` est
 * un label de chip autonome (accord neutre), pas grammaticalement bindable à "recette".
 */
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

/** `debutant` n'est pas porté par `recipe.tags` (pas de nouveau tag à maintenir sur les recettes
 * existantes) — la correspondance se fait via `recipe.difficulty === 'facile'`, déjà peuplé.
 * Exporté (sous-projet 2) pour que `recipeAskScript.ts` puisse vérifier une contrainte à la fois. */
export function constraintSatisfiedBy(recipe: Recipe, constraint: Constraint): boolean {
  if (constraint === 'debutant') return recipe.difficulty === 'facile'
  return (recipe.tags ?? []).includes(constraint)
}

/**
 * Sous-ensemble de `slots.constraints` réellement satisfait par la recette recommandée —
 * exclut toujours `'allergie'` (mot-clé approximatif dans `recipe.tags`, pas un champ
 * d'allergènes vérifié, voir `allergens` sur la carte, seule sortie honnête pour ce cas) et
 * retourne `[]` sur un résultat `relaxed` (contrainte(s) abandonnée(s), `matched=false`) —
 * une contrainte ne doit jamais être présentée comme satisfaite dans ce cas, même si
 * `recipe.tags` la contient encore. Remplace `constraintApplies` (sous-projet 1), qui
 * opérait sur une contrainte unique.
 */
export function satisfiedConstraints(recipe: Recipe, slots: AgentSlots, matched: boolean): Exclude<Constraint, 'allergie'>[] {
  if (!matched) return []
  return slots.constraints.filter(
    (c): c is Exclude<Constraint, 'allergie'> => c !== 'allergie' && constraintSatisfiedBy(recipe, c)
  )
}

/**
 * Labels de correspondance à afficher sur la carte pour chaque contrainte exprimée
 * réellement satisfaite par la recette recommandée. Remplace `constraintLabel` (sous-projet 1),
 * qui retournait une seule valeur.
 */
export function constraintLabels(recipe: Recipe, slots: AgentSlots, matched: boolean): string[] {
  return satisfiedConstraints(recipe, slots, matched).map((c) => CONSTRAINT_LABELS[c])
}

export interface CommunityQuote {
  text: string
}

/**
 * Sélectionne un avis communautaire contextuel (signal contextuel, pas un résumé générique
 * de tous les avis — cf. design doc "Signal communautaire contextuel"). Priorité à la
 * première contrainte mentionnée (ordre d'expression par l'utilisateur, signal le plus
 * décisionnel) sur le temps ; retourne le premier avis du pool taggé pour cette contrainte.
 * Volontairement basé sur `slots.constraints` (ce qui a été *dit*), pas sur `satisfiedConstraints`
 * (ce que le tag officiel *confirme*) — un avis communautaire répond à "la communauté en a-t-elle
 * parlé ?", pas à "la recette est-elle officiellement taguée ?" ; ce sont deux signaux différents
 * (comportement hérité de l'ancien `constraintApplies`, seulement généralisé au tableau ici).
 * Pas de compteur — le nombre d'avis n'est pas un signal utile pour l'utilisateur, seule
 * l'attribution ("Selon les avis") compte. Une seule citation même si plusieurs contraintes
 * sont mentionnées — en empiler plusieurs alourdirait la carte sans ajouter de signal.
 */
export function selectCommunityQuote(recipe: Recipe, slots: AgentSlots, matched: boolean): CommunityQuote | undefined {
  const reviews = recipe.reviews ?? []

  if (matched) {
    const firstConstraint = slots.constraints.find((c) => c !== 'allergie')
    if (firstConstraint) {
      const forConstraint = reviews.find((r) => r.tag === firstConstraint)
      if (forConstraint) return { text: forConstraint.text }
    }
  }

  if (slots.time !== undefined && recipe.duration <= slots.time) {
    const forTime = reviews.find((r) => r.tag === 'time')
    if (forTime) return { text: forTime.text }
  }

  return undefined
}

function seasonFor(date: Date): Season {
  const month = date.getMonth()
  if (month === 11 || month <= 1) return 'hiver'
  if (month <= 4) return 'printemps'
  if (month <= 7) return 'ete'
  return 'automne'
}

/** Vrai si la recette est explicitement marquée comme "de saison" au mois courant. Pas de `season` déclaré = jamais affichée comme telle. */
export function isInSeason(recipe: Recipe, date: Date = new Date()): boolean {
  return !!recipe.season?.includes(seasonFor(date))
}

export interface RecommendedRecipe {
  recipe: Recipe
  /** true = recette réellement scorée (score > 0 via scoreRecipe) ; false = complément "proche" (quasi-match), jamais présentée comme une correspondance confirmée. */
  matched: boolean
  /** Score brut, 0 pour un quasi-match. Usage interne (tri, garde-fou signal insuffisant) — jamais affiché. */
  score: number
}

export type AgentTurnResult =
  | { kind: 'clarify'; message: string }
  | { kind: 'recommend'; recipes: RecommendedRecipe[]; reason: string }
  | { kind: 'relaxed'; recipes: RecommendedRecipe[]; droppedConstraints: Constraint[]; message: string }
  | { kind: 'not_understood'; message: string }

const TIME_WORDS: Array<[RegExp, number]> = [
  [/\brapide|vite|express\b/i, 20],
  [/\b(\d{1,3})\s*min/i, -1], // -1 = extraire le nombre capturé
]

const SERVINGS_WORDS: Array<[RegExp, number]> = [
  [/\bseul(e)?\b/i, 1],
  [/\ben couple|à deux\b/i, 2],
  [/\bfamille\b/i, 4],
  [/\b(\d{1,2})\s*(personnes?|convives?|pers\.?)\b/i, -1],
]

const CONSTRAINT_WORDS: Array<[RegExp, Constraint]> = [
  [/enfant|gosse|petit(e)?\b.*mange/i, 'enfant'],
  [/sans sauce/i, 'sans-sauce'],
  [/vegan/i, 'vegan'],
  [/végétarien|vegetarien/i, 'vegetarien'],
  [/sans gluten/i, 'sans-gluten'],
  [/sans lactose/i, 'sans-lactose'],
  [/allerg/i, 'allergie'],
  [/débutant|débute|debutant|jamais cuisiné|jamais cuisine|nul(le)? en cuisine/i, 'debutant'],
]

const HEALTH_WORDS = /léger|healthy|calories?|régime|diète|minceur/i
const BUDGET_WORDS = /\bcher\b|économique|abordable|budget|coûte|prix/i
const AVOID_WORDS = /j'aime pas|je n'aime pas|j'evite|je deteste/
/** Déclenche un retrait plutôt qu'un ajout dans `extractSlots` — contrainte ou ingrédient déjà
 * posé dans le fil que l'utilisateur annule ("finalement pas de poulet", "en fait peu importe
 * le sans-gluten"). Testé sur le texte normalisé, même registre que `AVOID_WORDS`/`BUDGET_WORDS`. */
const RETRACT_WORDS = /finalement|en fait|plutot pas|peu importe|oublie|annule/

const INGREDIENT_WORDS: string[] = [
  'poulet',
  'courgette',
  'courgettes',
  'ricotta',
  'pates',
  'pâtes',
  'lardons',
  'citron',
  'thon',
  'abricot',
  'abricots',
  'gratin',
]

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/[‘’]/g, "'")
}

export function extractSlots(text: string, prev: AgentSlots): AgentSlots {
  const next: AgentSlots = {
    ...prev,
    ingredients: [...prev.ingredients],
    avoidIngredients: [...prev.avoidIngredients],
    constraints: [...prev.constraints],
  }
  const norm = normalize(text)

  for (const [re, val] of TIME_WORDS) {
    const m = text.match(re)
    if (m) {
      next.time = val === -1 ? Number(m[1]) : val
      break
    }
  }

  for (const [re, val] of SERVINGS_WORDS) {
    const m = text.match(re)
    if (m) {
      next.servings = val === -1 ? Number(m[1]) : val
      break
    }
  }

  const isRetractTurn = RETRACT_WORDS.test(norm)

  for (const [re, val] of CONSTRAINT_WORDS) {
    if (!re.test(text)) continue
    if (isRetractTurn) {
      next.constraints = next.constraints.filter((c) => c !== val)
    } else if (!next.constraints.includes(val)) {
      next.constraints.push(val)
    }
  }

  if (HEALTH_WORDS.test(text)) {
    next.healthFocus = true
  }

  if (BUDGET_WORDS.test(text)) {
    next.budgetFocus = true
  }

  // Un tour qui exprime un dégoût ("j'aime pas X") va au slot avoidIngredients plutôt qu'au
  // slot ingredients ("ce que j'ai") — un même tour ne porte qu'une seule de ces deux intentions.
  // Un tour de retrait (isRetractTurn) est prioritaire sur les deux : il retire l'ingrédient
  // reconnu des deux slots plutôt que de l'ajouter à l'un d'eux.
  const isAvoidTurn = AVOID_WORDS.test(norm)

  for (const word of INGREDIENT_WORDS) {
    const key = normalize(word).replace('pâtes', 'pates')
    if (!norm.includes(key)) continue
    const canonical = key === 'courgettes' ? 'courgette' : key === 'abricots' ? 'abricot' : key
    if (isRetractTurn) {
      next.ingredients = next.ingredients.filter((i) => i !== canonical && i !== key)
      next.avoidIngredients = next.avoidIngredients.filter((i) => i !== canonical && i !== key)
    } else if (isAvoidTurn) {
      if (!next.avoidIngredients.includes(canonical)) next.avoidIngredients.push(canonical)
    } else if (!next.ingredients.includes('pates') && !next.ingredients.includes(key) && !next.ingredients.includes(canonical)) {
      next.ingredients.push(canonical)
    }
  }

  return next
}

function scoreRecipe(recipe: Recipe, slots: AgentSlots): number {
  const tags = recipe.tags ?? []
  let score = 0
  for (const ingredient of slots.ingredients) {
    if (tags.includes(ingredient) || tags.includes(ingredient === 'pates' ? 'pates' : ingredient)) score += 3
  }
  for (const constraint of slots.constraints) {
    if (constraintSatisfiedBy(recipe, constraint)) score += 2
  }
  if (slots.time !== undefined && recipe.duration <= slots.time + 5) score += 1
  return score
}

const TOP_N = 3
/** Même fenêtre de grâce que l'ancien fallback relaxed mono-recette. */
const RELAXED_GRACE_MIN = 15

/** Les `limit` recettes les mieux scorées (score > 0), triées décroissant. Tri stable : à score égal, l'ordre de `MOCK_RECIPES` est préservé (même comportement que l'ancien `bestMatch` à égalité). */
function topMatches(slots: AgentSlots, limit = TOP_N): { recipe: Recipe; score: number }[] {
  return MOCK_RECIPES.map((recipe) => ({ recipe, score: scoreRecipe(recipe, slots) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Complète le slate avec des recettes "proches" (reprend la logique de l'ancien fallback
 * relaxed : fenêtre de grâce de 15 min sur la durée, premier ordre du tableau qui convient)
 * quand moins de `limit` recettes ont réellement scoré. Exclut les recettes déjà retenues.
 * Si rien ne convient du tout, `MOCK_RECIPES[0]` sert d'ultime filet — le slate n'est jamais vide.
 */
function fillNearFits(slots: AgentSlots, excludeIds: Set<string>, limit: number): Recipe[] {
  const candidates = MOCK_RECIPES.filter(
    (r) => !excludeIds.has(r.id) && (slots.time === undefined || r.duration <= slots.time + RELAXED_GRACE_MIN)
  )
  const result = candidates.slice(0, limit)
  if (result.length === 0 && limit > 0 && !excludeIds.has(MOCK_RECIPES[0].id)) {
    result.push(MOCK_RECIPES[0])
  }
  return result
}

/** Construit le slate de recommandation (jusqu'à `limit` recettes) : vrais matchs d'abord, complété par des quasi-matchs si besoin. `hasRealMatch` indique si au moins une recette a réellement scoré. */
export function buildRecipeSlate(slots: AgentSlots, limit = TOP_N): { recipes: RecommendedRecipe[]; hasRealMatch: boolean } {
  const real = topMatches(slots, limit)
  const recipes: RecommendedRecipe[] = real.map((m) => ({ recipe: m.recipe, matched: true, score: m.score }))
  if (recipes.length < limit) {
    const excludeIds = new Set(recipes.map((r) => r.recipe.id))
    const fillers = fillNearFits(slots, excludeIds, limit - recipes.length)
    for (const f of fillers) recipes.push({ recipe: f, matched: false, score: 0 })
  }
  return { recipes, hasRealMatch: real.length > 0 }
}

function reasonFor(recipe: Recipe, slots: AgentSlots): string {
  const bits: string[] = []
  if (slots.time !== undefined) bits.push(`prête en ${recipe.duration} min`)
  for (const constraint of slots.constraints) {
    if (constraint !== 'allergie') bits.push(RELAXED_REASON[constraint])
  }
  if (slots.ingredients.length > 0) bits.push(`utilise ${slots.ingredients.join(', ')}`)
  if (bits.length === 0) bits.push('correspond à ce que vous avez décrit')
  return bits.join(', ')
}

/** Message complet côté agent, sans tiret cadratin (règle produit : jamais de « — » visible). */
export function recommendationMessage(recipe: Recipe, reason: string): string {
  return `Je vous propose ${recipe.name}, ${reason}.`
}

export function hasEnoughSignal(slots: AgentSlots): boolean {
  return slots.ingredients.length > 0 || slots.time !== undefined || slots.servings !== undefined || slots.constraints.length > 0
}

/** Jointure des formes accordées de `RELAXED_REASON` pour plusieurs contraintes abandonnées à la
 * fois — "et" avant le dernier élément, virgule entre les précédents (français standard). */
function joinReasons(constraints: Constraint[]): string {
  const reasons = constraints.map((c) => RELAXED_REASON[c])
  if (reasons.length <= 1) return reasons.join('')
  return `${reasons.slice(0, -1).join(', ')} et ${reasons[reasons.length - 1]}`
}

/**
 * Traite un tour de conversation. `clarifyAttempts` compte les clarifications déjà
 * posées pour ce fil — après 2 échecs, on bascule sur le message de repli (jamais
 * une impasse, cf. design doc "Cas dégradé").
 */
export function processTurn(text: string, prevSlots: AgentSlots, clarifyAttempts: number): { slots: AgentSlots; result: AgentTurnResult } {
  const slots = extractSlots(text, prevSlots)

  if (!hasEnoughSignal(slots)) {
    if (clarifyAttempts >= 1) {
      return {
        slots,
        result: {
          kind: 'not_understood',
          message:
            "Je ne suis pas sûr de comprendre. Vous pouvez fermer cette fenêtre et piocher dans la sélection du moment, ou continuer à m'écrire avec un ingrédient, un temps, ou une envie. Je reste disponible dès que vous avez de quoi me guider.",
        },
      }
    }
    return {
      slots,
      result: {
        kind: 'clarify',
        message: "Dites-m'en un peu plus : un ingrédient que vous avez sous la main, le temps que vous avez, ou pour combien de personnes ?",
      },
    }
  }

  const { recipes, hasRealMatch } = buildRecipeSlate(slots)

  if (!hasRealMatch) {
    if (clarifyAttempts >= 1) {
      // Cas dégradé : aucune recette ne correspond → on relâche toutes les contraintes d'un
      // coup plutôt que d'en relâcher une à la fois (pas d'ordre de priorité/spécificité
      // défini entre les 8 valeurs de Constraint — décision produit du 2026-08-07).
      const top = recipes[0]
      const droppedConstraints = slots.constraints
      return {
        slots,
        result: {
          kind: 'relaxed',
          recipes,
          droppedConstraints,
          message:
            droppedConstraints.length > 0
              ? `Je n'ai pas trouvé de recette ${joinReasons(droppedConstraints)}, voici ce qui s'en rapproche le plus : ${top.recipe.name}.`
              : `Je n'ai pas trouvé de recette qui corresponde exactement, voici ce qui s'en rapproche le plus : ${top.recipe.name}.`,
        },
      }
    }
    return {
      slots,
      result: {
        kind: 'clarify',
        message: slots.time === undefined ? 'Vous avez combien de temps devant vous ?' : 'Pour combien de personnes ?',
      },
    }
  }

  // Signal insuffisant pour trancher entre plusieurs recettes plausibles (ex. « pâtes » seul).
  if (recipes[0].score <= 2 && slots.time === undefined && slots.servings === undefined && clarifyAttempts < 1) {
    return {
      slots,
      result: {
        kind: 'clarify',
        message: 'Vous avez combien de temps, ou vous êtes combien à table ? Ça m’aide à choisir la bonne version.',
      },
    }
  }

  return {
    slots,
    result: { kind: 'recommend', recipes, reason: reasonFor(recipes[0].recipe, slots) },
  }
}

export const EMPTY_SLOTS: AgentSlots = { ingredients: [], avoidIngredients: [], constraints: [] }
```

- [ ] **Step 4: Lancer les tests pour vérifier qu'ils passent**

Run: `cd packages/marmiton-prototype && npx vitest run src/lib/__tests__/agentScript.test.ts`
Expected: PASS — tous les tests verts (≈ 45 tests).

- [ ] **Step 5: Vérifier la compilation TypeScript du package entier**

Run: `cd packages/marmiton-prototype && npx tsc --noEmit`
Expected: **des erreurs sont attendues à ce stade** dans `recipeAskScript.ts` et `AgentConversation.tsx` (Task 2 et Task 3 ne sont pas encore faites — ces fichiers utilisent encore `slots.constraint`/`constraintLabel`, qui n'existent plus). Confirmer que les erreurs sont bien limitées à ces deux fichiers (aucune dans `agentScript.ts` ni `agentScript.test.ts`) avant de continuer.

- [ ] **Step 6: Commit**

```bash
git add packages/marmiton-prototype/src/lib/agentScript.ts packages/marmiton-prototype/src/lib/__tests__/agentScript.test.ts
git commit -m "feat(marmiton-prototype): contraintes multiples et retrait en conversation (agentScript.ts)"
```

---

### Task 2: `recipeAskScript.ts` — confirmation multiple et accusé de retrait

**Files:**
- Modify: `packages/marmiton-prototype/src/lib/recipeAskScript.ts`
- Modify: `packages/marmiton-prototype/src/lib/__tests__/recipeAskScript.test.ts`

**Interfaces:**
- Consomme (Task 1) : `constraintSatisfiedBy(recipe: Recipe, constraint: Constraint): boolean`, `RELAXED_REASON`, `AgentSlots.constraints: Constraint[]`.
- Ne change pas : `RecipeAskAnswer` (aucun nouveau champ — l'accusé de retrait et les confirmations multiples restent fondus dans `message`, comme aujourd'hui pour la confirmation de contrainte simple).

- [ ] **Step 1: Mettre à jour les tests existants qui référencent `.constraint` (singulier)**

Dans `packages/marmiton-prototype/src/lib/__tests__/recipeAskScript.test.ts`, remplacer :

```ts
  it('conserve les slots précédents entre deux tours (contrainte posée puis ingrédient ajouté)', () => {
    const recipe = makeRecipe({ tags: ['vegetarien'] })
    const first = answerRecipeAsk(recipe, 'Une alternative végétarienne ?', EMPTY_SLOTS)
    const second = answerRecipeAsk(recipe, "j'ai du poulet", first.slots)
    expect(second.slots.constraint).toBe('vegetarien')
  })
```

par :

```ts
  it('conserve les slots précédents entre deux tours (contrainte posée puis ingrédient ajouté)', () => {
    const recipe = makeRecipe({ tags: ['vegetarien'] })
    const first = answerRecipeAsk(recipe, 'Une alternative végétarienne ?', EMPTY_SLOTS)
    const second = answerRecipeAsk(recipe, "j'ai du poulet", first.slots)
    expect(second.slots.constraints).toEqual(['vegetarien'])
  })
```

- [ ] **Step 2: Ajouter les nouveaux tests (échouent — le comportement n'est pas encore implémenté)**

Dans le même fichier, ajouter à la fin du `describe('answerRecipeAsk', ...)`, avant son `})` final :

```ts

  it('confirme plusieurs contraintes nouvellement mentionnées dans le même tour', () => {
    const recipe = makeRecipe({ tags: ['vegetarien'] })
    const { answer } = answerRecipeAsk(recipe, 'Un plat végétarien et sans gluten ?', EMPTY_SLOTS)
    expect(answer.message).toBe(
      "Oui, cette recette est végétarienne. Cette recette n'est pas signalée comme sans gluten."
    )
  })

  it("accuse réception d'une contrainte retirée entre deux tours", () => {
    const recipe = makeRecipe({ tags: [] })
    const first = answerRecipeAsk(recipe, 'Une version sans gluten ?', EMPTY_SLOTS)
    expect(first.slots.constraints).toEqual(['sans-gluten'])
    const second = answerRecipeAsk(recipe, 'en fait peu importe le sans gluten', first.slots)
    expect(second.slots.constraints).toEqual([])
    expect(second.answer.message).toBe("D'accord, je ne tiens plus compte de : sans gluten.")
  })

  it("accuse réception d'un ingrédient retiré entre deux tours", () => {
    const recipe = makeRecipe({ ingredients: [] })
    const first = answerRecipeAsk(recipe, "j'ai du poulet", EMPTY_SLOTS)
    expect(first.slots.ingredients).toEqual(['poulet'])
    const second = answerRecipeAsk(recipe, 'finalement pas de poulet', first.slots)
    expect(second.slots.ingredients).toEqual([])
    expect(second.answer.message).toBe("D'accord, je ne tiens plus compte de : poulet.")
  })

  it('accuse réception dans un seul message quand contrainte et ingrédient sont retirés ensemble', () => {
    const recipe = makeRecipe({ tags: [], ingredients: [] })
    const first = answerRecipeAsk(recipe, 'sans gluten, avec du poulet', EMPTY_SLOTS)
    expect(first.slots.constraints).toEqual(['sans-gluten'])
    expect(first.slots.ingredients).toEqual(['poulet'])
    const second = answerRecipeAsk(recipe, 'en fait oublie le sans gluten et le poulet', first.slots)
    expect(second.answer.message).toBe("D'accord, je ne tiens plus compte de : sans gluten, poulet.")
  })

  it("ne fait rien de visible quand le retrait n'a pas de mot-clé identifiable", () => {
    const recipe = makeRecipe({ tags: ['vegetarien'] })
    const first = answerRecipeAsk(recipe, 'Une alternative végétarienne ?', EMPTY_SLOTS)
    const second = answerRecipeAsk(recipe, 'en fait peu importe', first.slots)
    expect(second.slots.constraints).toEqual(['vegetarien'])
    expect(second.answer.message).toBe('Voici ce que je peux vous dire sur cette recette.')
  })
```

- [ ] **Step 3: Lancer les tests pour vérifier qu'ils échouent**

Run: `cd packages/marmiton-prototype && npx vitest run src/lib/__tests__/recipeAskScript.test.ts`
Expected: FAIL — le fichier source utilise encore `slots.constraint` (n'existe plus depuis Task 1, erreur de compilation), les nouveaux comportements (confirmation multiple, accusé de retrait) n'existent pas.

- [ ] **Step 4: Mettre à jour l'import**

Dans `packages/marmiton-prototype/src/lib/recipeAskScript.ts`, remplacer :

```ts
import { extractSlots, selectTip, pantryMatch, avoidedIngredientMatch, constraintLabel, RELAXED_REASON, EMPTY_SLOTS } from './agentScript'
```

par :

```ts
import { extractSlots, selectTip, pantryMatch, avoidedIngredientMatch, constraintSatisfiedBy, RELAXED_REASON, EMPTY_SLOTS } from './agentScript'
```

- [ ] **Step 5: Réécrire le début de `answerRecipeAsk`**

Remplacer :

```ts
  const slots = extractSlots(text, prevSlots)
  const bits: string[] = []

  let allergens: string[] | undefined

  if (slots.constraint === 'allergie') {
    allergens = recipe.allergens ?? []
    bits.push(
      allergens.length > 0
        ? `Cette recette contient : ${allergens.join(', ').toLowerCase()}.`
        : "Aucun allergène n'est signalé pour cette recette."
    )
  } else if (slots.constraint && prevSlots.constraint !== slots.constraint) {
    // Contrainte nouvellement détectée à ce tour seulement — sinon le message
    // "Oui, cette recette est..." / "n'est pas signalée comme..." rejouerait à
    // chaque tour suivant du même fil, alors que `slots.constraint` persiste via
    // `extractSlots(text, prevSlots)`. L'avis communautaire (s'il existe) est fondu
    // dans la même phrase plutôt qu'affiché à part : dans un fil de chat linéaire,
    // un bandeau "Selon les avis" séparé + un chip dupliquant la même info que la
    // phrase n'apportent rien qu'une carte de recommandation scannée n'apporterait
    // (retour utilisateur du 2026-08-05) — une seule bulle de texte suffit.
    const label = constraintLabel(recipe, slots, true)
    if (label) {
      const quote =
        slots.constraint === 'debutant' || slots.constraint === 'vegan'
          ? undefined
          : findRecipeReview(recipe, slots.constraint)
      bits.push(
        quote
          ? `Oui, cette recette est ${RELAXED_REASON[slots.constraint]} : d'après les avis, « ${quote.text} »`
          : `Oui, cette recette est ${RELAXED_REASON[slots.constraint]}.`
      )
    } else {
      bits.push(`Cette recette n'est pas signalée comme ${RELAXED_REASON[slots.constraint]}.`)
    }
  }

  if (bits.length === 0 && prevSlots.time === undefined && slots.time !== undefined) {
```

par :

```ts
  const slots = extractSlots(text, prevSlots)
  const bits: string[] = []

  let allergens: string[] | undefined

  const newlyAddedConstraints = slots.constraints.filter((c) => !prevSlots.constraints.includes(c))

  // Allergie traitée à part : la question "sécurité alimentaire" a une réponse dédiée
  // (liste complète des allergènes), pas un simple oui/non de correspondance.
  if (newlyAddedConstraints.includes('allergie')) {
    allergens = recipe.allergens ?? []
    bits.push(
      allergens.length > 0
        ? `Cette recette contient : ${allergens.join(', ').toLowerCase()}.`
        : "Aucun allergène n'est signalé pour cette recette."
    )
  }

  // Une phrase de confirmation par contrainte nouvellement mentionnée ce tour (hors allergie,
  // traitée ci-dessus) — sinon le message rejouerait à chaque tour suivant du même fil, alors
  // que `slots.constraints` persiste via `extractSlots(text, prevSlots)`. L'avis communautaire
  // (s'il existe) est fondu dans la même phrase plutôt qu'affiché à part : dans un fil de chat
  // linéaire, un bandeau "Selon les avis" séparé + un chip dupliquant la même info que la
  // phrase n'apportent rien qu'une carte de recommandation scannée n'apporterait (retour
  // utilisateur du 2026-08-05) — une seule bulle de texte suffit.
  for (const constraint of newlyAddedConstraints) {
    if (constraint === 'allergie') continue
    if (constraintSatisfiedBy(recipe, constraint)) {
      const quote = constraint === 'debutant' || constraint === 'vegan' ? undefined : findRecipeReview(recipe, constraint)
      bits.push(
        quote
          ? `Oui, cette recette est ${RELAXED_REASON[constraint]} : d'après les avis, « ${quote.text} »`
          : `Oui, cette recette est ${RELAXED_REASON[constraint]}.`
      )
    } else {
      bits.push(`Cette recette n'est pas signalée comme ${RELAXED_REASON[constraint]}.`)
    }
  }

  // Accusé de retrait explicite : contrairement à /agent (moteur multi-recette, où le retrait
  // se reflète silencieusement dans la prochaine recommandation), ce drawer est un dialogue
  // direct sur une recette déjà affichée — un retrait silencieux serait déroutant ici.
  const retractedConstraints = prevSlots.constraints.filter((c) => c !== 'allergie' && !slots.constraints.includes(c))
  const retractedIngredients = Array.from(new Set([...prevSlots.ingredients, ...prevSlots.avoidIngredients])).filter(
    (i) => !slots.ingredients.includes(i) && !slots.avoidIngredients.includes(i)
  )
  if (retractedConstraints.length > 0 || retractedIngredients.length > 0) {
    const labels = [...retractedConstraints.map((c) => RELAXED_REASON[c]), ...retractedIngredients]
    bits.push(`D'accord, je ne tiens plus compte de : ${labels.join(', ')}.`)
  }

  if (bits.length === 0 && prevSlots.time === undefined && slots.time !== undefined) {
```

- [ ] **Step 6: Lancer les tests pour vérifier qu'ils passent**

Run: `cd packages/marmiton-prototype && npx vitest run src/lib/__tests__/recipeAskScript.test.ts`
Expected: PASS — tous les tests verts (≈ 27 tests).

- [ ] **Step 7: Vérifier la compilation TypeScript du package entier**

Run: `cd packages/marmiton-prototype && npx tsc --noEmit`
Expected: erreurs restantes uniquement dans `AgentConversation.tsx` (Task 3 pas encore faite). Confirmer qu'aucune erreur ne subsiste dans `recipeAskScript.ts`.

- [ ] **Step 8: Commit**

```bash
git add packages/marmiton-prototype/src/lib/recipeAskScript.ts packages/marmiton-prototype/src/lib/__tests__/recipeAskScript.test.ts
git commit -m "feat(marmiton-prototype): confirmation multiple et accuse de retrait (fiche recette)"
```

---

### Task 3: `AgentConversation.tsx` — chips multiples et vérification manuelle

**Files:**
- Modify: `packages/marmiton-prototype/src/components/agent/AgentConversation.tsx`

**Interfaces:**
- Consomme (Task 1) : `constraintLabels(recipe: Recipe, slots: AgentSlots, matched: boolean): string[]`.

- [ ] **Step 1: Mettre à jour l'import**

Remplacer :

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

par :

```ts
import {
  EMPTY_SLOTS,
  processTurn,
  recommendationMessage,
  pantryMatch,
  avoidedIngredientMatch,
  selectTip,
  constraintLabels,
  selectCommunityQuote,
  isInSeason,
  type AgentSlots,
  type PantryMatch,
  type CommunityQuote,
  type RecommendedRecipe,
} from '@/lib/agentScript'
```

- [ ] **Step 2: Mettre à jour `CardData` et `cardExtras`**

Remplacer :

```ts
  /** Label de contrainte confirmée (ex. "Végétarien"), absent sur un quasi-match ou pour `allergie`. */
  constraintLabel?: string
```

par :

```ts
  /** Labels de contraintes confirmées (ex. "Végétarien", "Sans gluten"), vide sur un quasi-match ou pour `allergie`. */
  constraintLabels: string[]
```

Remplacer :

```ts
    constraintLabel: constraintLabel(recipe, slots, matched),
```

par :

```ts
    constraintLabels: constraintLabels(recipe, slots, matched),
```

- [ ] **Step 3: Mettre à jour `nextChips`**

Remplacer :

```ts
  if (slots.constraint === undefined) {
```

par :

```ts
  if (slots.constraints.length === 0) {
```

- [ ] **Step 4: Afficher un chip par contrainte confirmée**

Remplacer :

```tsx
                        {(!card.matched || card.constraintLabel || card.inSeason) && (
                          <span className="chat-card__chips">
                            {!card.matched && (
                              <span className="chat-card__compromise">
                                <Info size={14} weight="fill" aria-hidden="true" />
                                Le plus proche, sans cette contrainte
                              </span>
                            )}
                            {card.constraintLabel && (
                              <span className="chat-card__chip-static">
                                <ChipTag type="toned" size="S" label={card.constraintLabel} />
                              </span>
                            )}
                            {card.inSeason && (
                              <span className="chat-card__chip-static">
                                <ChipTag type="toned" size="S" label="De saison" />
                              </span>
                            )}
                          </span>
                        )}
```

par :

```tsx
                        {(!card.matched || card.constraintLabels.length > 0 || card.inSeason) && (
                          <span className="chat-card__chips">
                            {!card.matched && (
                              <span className="chat-card__compromise">
                                <Info size={14} weight="fill" aria-hidden="true" />
                                Le plus proche, sans cette contrainte
                              </span>
                            )}
                            {card.constraintLabels.map((label) => (
                              <span key={label} className="chat-card__chip-static">
                                <ChipTag type="toned" size="S" label={label} />
                              </span>
                            ))}
                            {card.inSeason && (
                              <span className="chat-card__chip-static">
                                <ChipTag type="toned" size="S" label="De saison" />
                              </span>
                            )}
                          </span>
                        )}
```

- [ ] **Step 5: Vérifier la compilation TypeScript du package entier**

Run: `cd packages/marmiton-prototype && npx tsc --noEmit`
Expected: aucune erreur (Task 1, 2 et 3 complètes — plus aucune référence à `slots.constraint`/`constraintLabel`/`constraintApplies` dans tout le package).

- [ ] **Step 6: Lancer la suite de tests complète du package**

Run: `cd packages/marmiton-prototype && npm test`
Expected: PASS — tous les tests de `agentScript.test.ts` et `recipeAskScript.test.ts` verts.

- [ ] **Step 7: Vérification manuelle en dev server**

Ouvrir `/agent`. Vérifier :
1. Taper "un enfant qui n'aime pas la sauce et sans gluten" (ou utiliser les chips "Enfant difficile" puis continuer en texte libre avec "sans gluten") → le carousel doit refléter les deux contraintes ; une carte qui satisfait les deux affiche deux chips (ex. "Adapté aux enfants" + "Sans gluten").
2. Sur une recette qui n'a jamais les deux, vérifier le message de repli combiné ("Je n'ai pas trouvé de recette adaptée aux enfants et sans gluten...").
3. Taper "finalement pas de contrainte enfant" (retrait pur — un tour qui mélange retrait et ajout ne fait que le retrait, cf. design §2 "un troisième mode par tour") puis, dans un tour séparé, "plutôt vegetarien" — vérifier que la recommandation suivante change en conséquence, sans accusé de réception dédié (comportement attendu pour `/agent`, différent de la fiche recette).
4. Ouvrir `/recipe`, poser une question via le drawer mono-recette avec deux contraintes dans le même message, puis en retirer une ("finalement pas de X") — vérifier l'accusé de réception explicite dans la bulle de réponse.

Prendre une capture d'écran du carousel avec une carte affichant deux chips de contrainte, à partager avec l'utilisateur.

- [ ] **Step 8: Commit**

```bash
git add packages/marmiton-prototype/src/components/agent/AgentConversation.tsx
git commit -m "feat(marmiton-prototype): affiche un chip par contrainte confirmee sur la carte agent"
```

---

## Note — `RecipeAgentDrawer.tsx` : aucune modification nécessaire

Ce fichier consomme uniquement les champs de `RecipeAskAnswer` (`allergens`, `pantryMatch`, `tip`,
`equipmentNote`, `ingredientSubstituteNote`, `avoidedIngredientNote`, `budgetNote`) — aucun d'eux ne
change de forme dans ce plan. La confirmation multiple et l'accusé de retrait (Task 2) restent fondus
dans `RecipeAskAnswer.message`, déjà rendu tel quel par ce composant. Vérifié : `grep -rn "constraint"
RecipeAgentDrawer.tsx` ne retourne aucun résultat avant ce plan et n'en aura aucun après.

## Self-Review

- **Couverture de la spec** : `constraint` → `constraints: Constraint[]` (Task 1) ✓, `RETRACT_WORDS` +
  retrait contrainte/ingrédient dans `extractSlots` (Task 1) ✓, priorité retrait > évitement sur un
  même tour (Task 1) ✓, aucun effet sur un retrait sans mot-clé identifiable (Task 1, testé) ✓, repli
  `relaxed` sur toutes les contraintes d'un coup + message combiné (Task 1) ✓, `scoreRecipe` +2 par
  contrainte satisfaite (Task 1, testé via le test de tri combiné) ✓, `satisfiedConstraints`/
  `constraintLabels` remplacent `constraintApplies`/`constraintLabel` (Task 1) ✓, `selectCommunityQuote`
  sur la première contrainte satisfaite (Task 1, testé) ✓, confirmation multiple + accusé de retrait
  explicite dans `recipeAskScript.ts` (Task 2) ✓, absence d'accusé dédié dans `/agent` (Task 3, note
  dans les étapes de vérification manuelle, comportement déjà natif du moteur) ✓, chips multiples sur
  la carte `AgentConversation.tsx` (Task 3) ✓, `RecipeAgentDrawer.tsx` explicitement documenté comme
  hors scope avec justification ✓. Hors scope de la spec (retrait time/servings/avoidIngredients-goût/
  budgetFocus/healthFocus, plafond de contraintes simultanées) : non touchés ✓.
- **Placeholders** : aucun — chaque step contient le code complet (fichiers entiers pour Task 1, diffs
  précis pour Task 2 et 3).
- **Cohérence de types** : `Constraint[]` utilisé identiquement dans les trois tâches ;
  `constraintSatisfiedBy`/`satisfiedConstraints`/`constraintLabels` ont la même signature partout où
  ils sont appelés (Task 1 les définit, Task 2 consomme `constraintSatisfiedBy`, Task 3 consomme
  `constraintLabels`) ; `AgentTurnResult`'s `droppedConstraints: Constraint[]` cohérent entre sa
  définition et son usage dans `processTurn`.
