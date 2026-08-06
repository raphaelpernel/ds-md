import { describe, it, expect } from 'vitest'
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
  return { ingredients: [], ...overrides }
}

describe('constraintApplies', () => {
  it('est vrai quand matched=true et la contrainte n\'est pas allergie', () => {
    expect(constraintApplies(makeSlots({ constraint: 'enfant' }), true)).toBe(true)
  })

  it('est faux quand matched=false (résultat relaxed)', () => {
    expect(constraintApplies(makeSlots({ constraint: 'enfant' }), false)).toBe(false)
  })

  it('est faux quand la contrainte est allergie, même si matched=true', () => {
    expect(constraintApplies(makeSlots({ constraint: 'allergie' }), true)).toBe(false)
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
    const result = selectCommunityQuote(recipe, makeSlots({ constraint: 'enfant' }), true)
    expect(result).toEqual({ text: 'Coupez le poulet en petits morceaux.' })
    expect(result).not.toHaveProperty('count')
  })

  it('retourne undefined si la contrainte matche mais qu\'aucun avis ne porte ce tag', () => {
    const recipe = makeRecipe({ reviews: [{ text: 'Se congèle très bien.', tag: 'time' }] })
    expect(selectCommunityQuote(recipe, makeSlots({ constraint: 'enfant' }), true)).toBeUndefined()
  })

  it('régression critique : ne montre jamais de quote de contrainte sur un résultat relaxed, même si recipe.tags contient encore la contrainte abandonnée', () => {
    const recipe = makeRecipe({
      tags: ['enfant'],
      reviews: [{ text: 'Coupez le poulet en petits morceaux.', tag: 'enfant' }],
    })
    expect(selectCommunityQuote(recipe, makeSlots({ constraint: 'enfant' }), false)).toBeUndefined()
  })

  it('exclut la contrainte allergie même quand matched=true', () => {
    const recipe = makeRecipe({ reviews: [{ text: 'Sans trace de fruits à coque.', tag: 'enfant' }] })
    expect(selectCommunityQuote(recipe, makeSlots({ constraint: 'allergie' }), true)).toBeUndefined()
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
    const result = selectCommunityQuote(recipe, makeSlots({ constraint: 'enfant', time: 25 }), true)
    expect(result).toEqual({ text: 'Adaptée aux enfants difficiles.' })
  })

  it('ne plante pas et retourne undefined quand recipe.reviews est absent', () => {
    const recipe = makeRecipe({ reviews: undefined })
    expect(selectCommunityQuote(recipe, makeSlots({ constraint: 'enfant' }), true)).toBeUndefined()
  })
})

describe('buildRecipeSlate', () => {
  it('retourne jusqu\'à 3 vrais matchs, triés par score décroissant, tous matched=true', () => {
    // 3 ingrédients distincts, chacun ne matchant qu'une seule recette (score 3 chacun) —
    // le tri par score ne départage pas ces égalités, donc l'ordre du tableau MOCK_RECIPES prévaut.
    const { recipes, hasRealMatch } = buildRecipeSlate(makeSlots({ ingredients: ['poulet', 'courgette', 'thon'] }))
    expect(hasRealMatch).toBe(true)
    expect(recipes).toHaveLength(3)
    expect(recipes.every((r) => r.matched)).toBe(true)
    expect(recipes.map((r) => r.recipe.id)).toEqual(['r-poulet-citron', 'r-courgettes-ricotta', 'r-salade-nicoise'])
  })

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

  it('slate entièrement composé de quasi-matchs quand aucune recette ne score, hasRealMatch=false', () => {
    // 'sans-gluten' n'est taggé sur aucune recette du mock.
    const { recipes, hasRealMatch } = buildRecipeSlate(makeSlots({ constraint: 'sans-gluten' }))
    expect(hasRealMatch).toBe(false)
    expect(recipes).toHaveLength(3)
    expect(recipes.every((r) => !r.matched)).toBe(true)
  })

  it('cas limite : slate jamais vide même quand aucun quasi-match ne convient (filet MOCK_RECIPES[0])', () => {
    // time=1 exclut toute recette même avec la fenêtre de grâce de 15 min (durée min du mock = 20).
    const { recipes, hasRealMatch } = buildRecipeSlate(makeSlots({ constraint: 'sans-lactose', time: 1 }))
    expect(hasRealMatch).toBe(false)
    expect(recipes.length).toBeGreaterThan(0)
    expect(recipes[0].recipe.id).toBe(MOCK_RECIPES[0].id)
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
})

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
