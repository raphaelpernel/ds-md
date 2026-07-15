export type MealType = 'entrée' | 'plat' | 'dessert' | 'petit-déjeuner'
export type Difficulty = 'facile' | 'moyen' | 'difficile'

export interface RecipeIngredient {
  id: string
  name: string
  quantity: string
  emoji: string
}

export interface Recipe {
  id: string
  name: string
  emoji: string
  guests: number
  mealType: MealType
  difficulty: Difficulty
  /** Niveau de prix, 1 à 3 (€ à €€€) */
  priceLevel: 1 | 2 | 3
  /** Mots-clés utilisés par l'interprétation de la demande (régime, ingrédients, contexte…) */
  tags: string[]
  ingredients: RecipeIngredient[]
  steps: string[]
}
