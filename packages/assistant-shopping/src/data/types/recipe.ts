import type { StaticImageData } from 'next/image'

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
  /** Photo hero de la recette (import statique depuis src/assets/recipes) — l'emoji
   *  reste utilisé pour les ingrédients, aucune photo produit n'étant disponible. */
  image: StaticImageData
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
