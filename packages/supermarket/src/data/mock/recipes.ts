import type { MockRecipe } from '@/data/types/wizard'

export const MOCK_RECIPES: MockRecipe[] = [
  { id: 'r1', name: 'Poêlée de légumes rôtis', minutes: 25, dietTags: ['vegetarien', 'vegan', 'sans-gluten', 'sans-lactose', 'sans-porc'], requiredEquipment: ['four'] },
  { id: 'r2', name: 'Poulet rôti aux herbes', minutes: 40, dietTags: ['sans-gluten', 'sans-lactose'], requiredEquipment: ['four'] },
  { id: 'r3', name: 'Curry de lentilles corail', minutes: 30, dietTags: ['vegetarien', 'vegan', 'sans-gluten', 'sans-lactose', 'sans-porc'], requiredEquipment: ['plaques'] },
  { id: 'r4', name: 'Gratin dauphinois', minutes: 50, dietTags: ['vegetarien', 'sans-porc'], requiredEquipment: ['four'] },
  { id: 'r5', name: 'Wok de nouilles sautées', minutes: 20, dietTags: ['vegetarien', 'sans-lactose', 'sans-porc'], requiredEquipment: ['plaques'] },
  { id: 'r6', name: 'Frites maison', minutes: 20, dietTags: ['vegetarien', 'vegan', 'sans-gluten', 'sans-lactose'], requiredEquipment: ['friteuse'] },
  { id: 'r7', name: 'Velouté de butternut mixé', minutes: 30, dietTags: ['vegetarien', 'vegan', 'sans-gluten', 'sans-lactose', 'sans-porc'], requiredEquipment: ['mixeur', 'plaques'] },
  { id: 'r8', name: 'Risotto express au micro-ondes', minutes: 15, dietTags: ['vegetarien', 'sans-gluten', 'sans-porc'], requiredEquipment: ['micro-ondes'] },
  { id: 'r9', name: 'Chili con carne', minutes: 35, dietTags: ['sans-gluten', 'sans-lactose'], requiredEquipment: ['plaques'] },
  { id: 'r10', name: 'Velouté minute au robot cuiseur', minutes: 15, dietTags: ['vegetarien', 'vegan', 'sans-gluten', 'sans-lactose', 'sans-porc'], requiredEquipment: ['robot'] },
]

export function pickRecipes(state: { meals: number; equipmentIds: string[]; dietIds: string[] }): MockRecipe[] {
  const restrictiveDiets = state.dietIds.filter((id) => id !== 'sans-restriction')

  const matchesEquipment = (recipe: MockRecipe) =>
    recipe.requiredEquipment.every((eq) => state.equipmentIds.includes(eq))
  const matchesDiet = (recipe: MockRecipe) =>
    restrictiveDiets.length === 0 || restrictiveDiets.every((d) => recipe.dietTags.includes(d))

  let candidates = MOCK_RECIPES.filter((r) => matchesEquipment(r) && matchesDiet(r))
  if (candidates.length === 0) candidates = MOCK_RECIPES.filter(matchesEquipment)
  if (candidates.length === 0) candidates = MOCK_RECIPES

  return Array.from({ length: state.meals }, (_, i) => candidates[i % candidates.length])
}
