import { describe, expect, it } from 'vitest'
import { createDefaultFoodPreferenceProfile } from '@/features/food-preferences/model/defaults'
import { MOCK_RECIPES, pickRecipes } from './recipes'

describe('Planner recipe personalization', () => {
  it('keeps the requested meal count when compatible candidates exist', () => {
    const recipes = pickRecipes({ meals: 4, equipmentIds: [], dietIds: [] }, createDefaultFoodPreferenceProfile())
    expect(recipes).toHaveLength(4)
  })

  it('does not use permanent equipment to remove planner recipes', () => {
    const recipes = pickRecipes({ meals: MOCK_RECIPES.length, equipmentIds: [], dietIds: [] }, {
      ...createDefaultFoodPreferenceProfile(),
      equipmentIds: ['four'],
    })
    expect(recipes.length).toBe(MOCK_RECIPES.length)
  })

  it('removes a recipe only when explicit restriction metadata intersects the profile', () => {
    const recipes = pickRecipes({ meals: 10, equipmentIds: [], dietIds: [] }, {
      ...createDefaultFoodPreferenceProfile(),
      restrictions: { status: 'declared', ids: ['lait'] },
    })
    expect(recipes.every((recipe) => !recipe.preferenceFacts.incompatibleRestrictionIds.includes('lait'))).toBe(true)
  })
})
