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
  /** Mots-clés de matching pour le classificateur scripté de l'agent conversationnel (Lot 1) — pas affiché en UI. */
  tags?: string[]
}
