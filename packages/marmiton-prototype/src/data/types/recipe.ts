export interface Ingredient {
  id: string
  name: string
  quantity: number
  unit: string
  emoji: string
  productId: string | null
}

export interface Recipe {
  id: string
  name: string
  imageUrl: string
  servings: number
  duration: number
  ingredients: Ingredient[]
  estimatedPricePerServing: number
}
