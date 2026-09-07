export type RestrictionSelection =
  | { status: 'unset' }
  | { status: 'none' }
  | { status: 'declared'; ids: string[] }

export type EditablePreferenceSection = 'restrictions' | 'avoidedIngredients' | 'kitchen'

export interface FoodPreferenceProfile {
  defaultGuests: number
  dietIds: string[]
  restrictions: RestrictionSelection
  avoidedIngredientIds: string[]
  cuisineIds: string[]
  maxPreparationMinutes: 15 | 20 | 30 | null
  equipmentIds: string[]
}

export interface FoodPreferencesInvitation {
  deployment: '2026-09-profile-v1'
  seen: boolean
}
