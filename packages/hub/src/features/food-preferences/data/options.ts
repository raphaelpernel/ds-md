export interface FoodPreferenceOption {
  id: string
  label: string
  aliases?: string[]
}

export const DIET_OPTIONS: FoodPreferenceOption[] = [
  { id: 'sans-gluten', label: 'Sans gluten' },
  { id: 'sans-lactose', label: 'Sans lactose' },
  { id: 'vegetarien', label: 'Végétarien' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'sans-porc', label: 'Sans porc' },
]

export const RESTRICTION_OPTIONS: FoodPreferenceOption[] = [
  { id: 'fruits-a-coque', label: 'Fruits à coque', aliases: ['noix'] },
  { id: 'arachides', label: 'Arachide', aliases: ['arachides', 'cacahuètes', 'cacahuete'] },
  { id: 'oeufs', label: 'Oeuf', aliases: ['œufs', 'oeufs'] },
  { id: 'lait', label: 'Lait', aliases: ['produits laitiers'] },
  { id: 'crustaces', label: 'Crustacés' },
  { id: 'gluten', label: 'Gluten' },
]

export const AVOIDED_INGREDIENT_OPTIONS: FoodPreferenceOption[] = [
  { id: 'cafe', label: 'Café', aliases: ['cafés'] },
  { id: 'asperges', label: 'Asperges', aliases: ['asperge'] },
  { id: 'brocoli', label: 'Brocoli' },
  { id: 'champignons', label: 'Champignons', aliases: ['champignon'] },
  { id: 'chou-blanc', label: 'Chou blanc' },
  { id: 'coriandre', label: 'Coriandre' },
  { id: 'celeri', label: 'Céleri' },
  { id: 'fenouil', label: 'Fenouil' },
  { id: 'anis', label: 'Anis' },
  { id: 'olives', label: 'Olives', aliases: ['olive'] },
  { id: 'poivrons', label: 'Poivrons', aliases: ['poivron'] },
  { id: 'oignons', label: 'Oignons', aliases: ['oignon'] },
]

export const CUISINE_OPTIONS: FoodPreferenceOption[] = [
  { id: 'chinoise', label: 'Chinoise' },
  { id: 'francaise', label: 'Française' },
  { id: 'coreenne', label: 'Coréenne' },
  { id: 'thailandaise', label: 'Thailandaise' },
]

export const PREPARATION_TIME_OPTIONS: readonly (15 | 20 | 30)[] = [15, 20, 30]

export const EQUIPMENT_OPTIONS: FoodPreferenceOption[] = [
  { id: 'four', label: 'Four' },
  { id: 'plaques', label: 'Plaques de cuisson' },
  { id: 'micro-ondes', label: 'Micro-ondes' },
  { id: 'robot', label: 'Robot cuiseur' },
  { id: 'friteuse', label: 'Friteuse' },
]
