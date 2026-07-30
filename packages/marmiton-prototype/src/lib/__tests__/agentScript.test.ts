import { describe, it, expect } from 'vitest'
import { constraintApplies, selectCommunityQuote } from '../agentScript'
import type { AgentSlots } from '../agentScript'
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

  it('retourne une quote et un compteur dérivé quand la contrainte matche un avis tagué', () => {
    const recipe = makeRecipe({
      reviews: [
        { text: 'Coupez le poulet en petits morceaux.', tag: 'enfant' },
        { text: 'Version sans piment pour les enfants.', tag: 'enfant' },
        { text: 'Se congèle très bien.', tag: 'time' },
      ],
    })
    const result = selectCommunityQuote(recipe, makeSlots({ constraint: 'enfant' }), true)
    expect(result).toEqual({ text: 'Coupez le poulet en petits morceaux.', count: 2 })
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
    expect(result).toEqual({ text: 'Vraiment prête en 20 minutes, chrono en main.', count: 2 })
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
    expect(result).toEqual({ text: 'Adaptée aux enfants difficiles.', count: 1 })
  })

  it('ne plante pas et retourne undefined quand recipe.reviews est absent', () => {
    const recipe = makeRecipe({ reviews: undefined })
    expect(selectCommunityQuote(recipe, makeSlots({ constraint: 'enfant' }), true)).toBeUndefined()
  })
})
