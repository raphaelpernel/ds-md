import type { DietOption } from '@/features/mealz-planner/data/types/wizard'

export const NO_RESTRICTION_ID = 'sans-restriction'

export const DIET_OPTIONS: DietOption[] = [
  { id: NO_RESTRICTION_ID, label: 'Sans restriction' },
  { id: 'vegetarien', label: 'Végétarien' },
  { id: 'vegan', label: 'Végan' },
  { id: 'sans-gluten', label: 'Sans gluten' },
  { id: 'sans-lactose', label: 'Sans lactose' },
  { id: 'sans-porc', label: 'Sans porc' },
]
