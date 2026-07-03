import type { Product } from './product'
import type { Timeslot } from './timeslot'

export interface CartItem {
  product: Product
  quantity: number
  recipeId: string | null
  recipeName: string | null
  recipeImageUrl: string | null
  /** Nombre de personnes choisi sur la recette au moment de l'ajout au panier */
  servings: number | null
}

export interface CartSection {
  recipeId: string | null
  recipeName: string | null
  recipeImageUrl: string | null
  servings: number | null
  items: CartItem[]
}

export interface Cart {
  sections: CartSection[]
  storeId: string | null
  timeslot: Timeslot | null
  deliveryPrice: number
}
