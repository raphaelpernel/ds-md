import { describe, expect, it } from 'vitest'
import { createDefaultFoodPreferenceProfile } from '../model/defaults'
import type { FoodPreferenceProfile } from '../model/types'
import { personalizeRecipes, type PreferenceCandidate } from './personalizeRecipes'

type Item = { id: string }
const candidate = (id: string, facts: Partial<PreferenceCandidate<Item>['facts']> = {}): PreferenceCandidate<Item> => ({
  item: { id },
  facts: {
    incompatibleDietIds: [],
    incompatibleRestrictionIds: [],
    ingredientIds: [],
    cuisineId: null,
    preparationMinutes: 15,
    ...facts,
  },
})

const profile = (changes: Partial<FoodPreferenceProfile>): FoodPreferenceProfile => ({
  ...createDefaultFoodPreferenceProfile(),
  ...changes,
})

describe('personalizeRecipes', () => {
  it('excludes only reliable incompatibilities from planner, never catalog', () => {
    const candidates = [candidate('safe'), candidate('blocked', { incompatibleRestrictionIds: ['arachides'] })]
    const current = profile({ restrictions: { status: 'declared', ids: ['arachides'] } })

    expect(personalizeRecipes(candidates, current, 'planner').map(({ id }) => id)).toEqual(['safe'])
    expect(personalizeRecipes(candidates, current, 'catalog').map(({ id }) => id)).toEqual(['safe', 'blocked'])
  })

  it('penalizes avoided ingredients and long preparation, while boosting liked cuisine', () => {
    const candidates = [
      candidate('neutral', { preparationMinutes: 15 }),
      candidate('preferred', { cuisineId: 'italienne', preparationMinutes: 15 }),
      candidate('avoided', { ingredientIds: ['champignons'] }),
      candidate('long', { preparationMinutes: 45 }),
    ]
    const current = profile({ cuisineIds: ['italienne'], avoidedIngredientIds: ['champignons'], maxPreparationMinutes: 30 })

    expect(personalizeRecipes(candidates, current, 'catalog').map(({ id }) => id)).toEqual(['preferred', 'neutral', 'long', 'avoided'])
  })

  it('does not use permanent equipment to alter ranking and preserves source order on ties', () => {
    const candidates = [candidate('first'), candidate('second')]
    const withEquipment = profile({ equipmentIds: ['four'] })

    expect(personalizeRecipes(candidates, withEquipment, 'catalog').map(({ id }) => id)).toEqual(['first', 'second'])
  })

  it('excludes explicitly incompatible diets in planner', () => {
    const candidates = [candidate('vegan', { incompatibleDietIds: ['vegan'] }), candidate('other')]
    const current = profile({ dietIds: ['vegan'] })

    expect(personalizeRecipes(candidates, current, 'planner').map(({ id }) => id)).toEqual(['other'])
  })

  it('deprioritizes an incompatible declared diet in catalog without removing it', () => {
    const candidates = [candidate('compatible'), candidate('incompatible', { incompatibleDietIds: ['vegan'] })]
    const current = profile({ dietIds: ['vegan'] })

    expect(personalizeRecipes(candidates, current, 'catalog').map(({ id }) => id)).toEqual(['compatible', 'incompatible'])
    expect(personalizeRecipes(candidates, current, 'catalog')).toHaveLength(2)
  })
})
