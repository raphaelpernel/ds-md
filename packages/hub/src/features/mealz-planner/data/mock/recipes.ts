import { createDefaultFoodPreferenceProfile } from '@/features/food-preferences/model/defaults'
import { personalizeRecipes } from '@/features/food-preferences/policy/personalizeRecipes'
import type { MockRecipe } from '@/features/mealz-planner/data/types/wizard'
import type { FoodPreferenceProfile } from '@/features/food-preferences/model/types'

export const MOCK_RECIPES: MockRecipe[] = [
  { id: 'r1', name: 'Poêlée de légumes rôtis', minutes: 25, dietTags: ['vegetarien', 'vegan', 'sans-gluten', 'sans-lactose', 'sans-porc'], requiredEquipment: ['four'], preferenceFacts: { incompatibleDietIds: [], incompatibleRestrictionIds: [], ingredientIds: [], cuisineId: 'francaise', preparationMinutes: 25 } },
  { id: 'r2', name: 'Poulet rôti aux herbes', minutes: 40, dietTags: ['sans-gluten', 'sans-lactose'], requiredEquipment: ['four'], preferenceFacts: { incompatibleDietIds: ['vegan', 'vegetarien'], incompatibleRestrictionIds: [], ingredientIds: [], cuisineId: 'francaise', preparationMinutes: 40 } },
  { id: 'r3', name: 'Curry de lentilles corail', minutes: 30, dietTags: ['vegetarien', 'vegan', 'sans-gluten', 'sans-lactose', 'sans-porc'], requiredEquipment: ['plaques'], preferenceFacts: { incompatibleDietIds: [], incompatibleRestrictionIds: [], ingredientIds: [], cuisineId: 'indienne', preparationMinutes: 30 } },
  { id: 'r4', name: 'Gratin dauphinois', minutes: 50, dietTags: ['vegetarien', 'sans-porc'], requiredEquipment: ['four'], preferenceFacts: { incompatibleDietIds: ['vegan'], incompatibleRestrictionIds: ['lait'], ingredientIds: [], cuisineId: 'francaise', preparationMinutes: 50 } },
  { id: 'r5', name: 'Wok de nouilles sautées', minutes: 20, dietTags: ['vegetarien', 'sans-lactose', 'sans-porc'], requiredEquipment: ['plaques'], preferenceFacts: { incompatibleDietIds: ['vegan'], incompatibleRestrictionIds: ['gluten'], ingredientIds: [], cuisineId: 'japonaise', preparationMinutes: 20 } },
  { id: 'r6', name: 'Frites maison', minutes: 20, dietTags: ['vegetarien', 'vegan', 'sans-gluten', 'sans-lactose'], requiredEquipment: ['friteuse'], preferenceFacts: { incompatibleDietIds: [], incompatibleRestrictionIds: [], ingredientIds: [], cuisineId: 'francaise', preparationMinutes: 20 } },
  { id: 'r7', name: 'Velouté de butternut mixé', minutes: 30, dietTags: ['vegetarien', 'vegan', 'sans-gluten', 'sans-lactose', 'sans-porc'], requiredEquipment: ['mixeur', 'plaques'], preferenceFacts: { incompatibleDietIds: [], incompatibleRestrictionIds: [], ingredientIds: [], cuisineId: 'francaise', preparationMinutes: 30 } },
  { id: 'r8', name: 'Risotto express au micro-ondes', minutes: 15, dietTags: ['vegetarien', 'sans-gluten', 'sans-porc'], requiredEquipment: ['micro-ondes'], preferenceFacts: { incompatibleDietIds: ['vegan'], incompatibleRestrictionIds: ['lait'], ingredientIds: [], cuisineId: 'italienne', preparationMinutes: 15 } },
  { id: 'r9', name: 'Chili con carne', minutes: 35, dietTags: ['sans-gluten', 'sans-lactose'], requiredEquipment: ['plaques'], preferenceFacts: { incompatibleDietIds: ['vegetarien', 'vegan'], incompatibleRestrictionIds: [], ingredientIds: [], cuisineId: 'mexicaine', preparationMinutes: 35 } },
  { id: 'r10', name: 'Velouté minute au robot cuiseur', minutes: 15, dietTags: ['vegetarien', 'vegan', 'sans-gluten', 'sans-lactose', 'sans-porc'], requiredEquipment: ['robot'], preferenceFacts: { incompatibleDietIds: [], incompatibleRestrictionIds: [], ingredientIds: [], cuisineId: 'francaise', preparationMinutes: 15 } },
]

export function pickRecipes(
  state: { meals: number; equipmentIds: string[]; dietIds: string[] },
  profile: FoodPreferenceProfile = createDefaultFoodPreferenceProfile(),
): MockRecipe[] {
  const restrictiveDiets = state.dietIds.filter((id) => id !== 'sans-restriction')

  const matchesEquipment = (recipe: MockRecipe) =>
    recipe.requiredEquipment.every((eq) => state.equipmentIds.includes(eq))
  const matchesDiet = (recipe: MockRecipe) =>
    restrictiveDiets.length === 0 || restrictiveDiets.every((d) => recipe.dietTags.includes(d))

  let candidates = MOCK_RECIPES.filter((r) => matchesEquipment(r) && matchesDiet(r))
  if (candidates.length === 0) candidates = MOCK_RECIPES.filter(matchesEquipment)
  if (candidates.length === 0) candidates = MOCK_RECIPES

  const personalized = personalizeRecipes(
    candidates.map((item) => ({ item, facts: item.preferenceFacts })),
    profile,
    'planner',
  )
  return Array.from({ length: state.meals }, (_, i) => personalized[i % personalized.length])
}
