export interface EquipmentOption {
  id: string
  label: string
}

export interface DietOption {
  id: string
  label: string
}

import type { RecipePreferenceFacts } from '@/features/food-preferences/policy/personalizeRecipes'

export interface MockRecipe {
  id: string
  name: string
  minutes: number
  dietTags: string[]
  requiredEquipment: string[]
  preferenceFacts: RecipePreferenceFacts
}

export interface WizardState {
  people: number
  meals: number
  equipmentIds: string[]
  dietIds: string[]
}
