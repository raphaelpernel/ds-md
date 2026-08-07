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

  it("reasonFor n'inclut que les contraintes réellement satisfaites par la recette recommandée", () => {
    const { result } = processTurn('vegetarien et sans gluten, 25 min', EMPTY_SLOTS, 0)
    expect(result.kind).toBe('recommend')
    if (result.kind === 'recommend') {
      expect(result.reason).toContain('végétarienne')
      expect(result.reason).not.toContain('sans gluten')
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
    const curlyApostrophe = String.fromCharCode(0x2019)
    expect(extractSlots(`j${curlyApostrophe}aime pas les courgettes`, EMPTY_SLOTS).avoidIngredients).toEqual(['courgette'])
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
