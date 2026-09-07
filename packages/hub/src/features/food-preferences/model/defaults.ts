import type { FoodPreferenceProfile } from './types'

export function createDefaultFoodPreferenceProfile(): FoodPreferenceProfile {
  return {
    defaultGuests: 2,
    dietIds: [],
    restrictions: { status: 'unset' },
    avoidedIngredientIds: [],
    cuisineIds: [],
    maxPreparationMinutes: null,
    equipmentIds: [],
  }
}
