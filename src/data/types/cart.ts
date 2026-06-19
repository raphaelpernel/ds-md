import type { Product } from './product'
import type { Timeslot } from './timeslot'

export interface CartItem {
  product: Product
  quantity: number
  recipeId: string | null
  recipeName: string | null
}

export interface CartSection {
  recipeId: string | null
  recipeName: string | null
  items: CartItem[]
}

export interface Cart {
  sections: CartSection[]
  storeId: string | null
  timeslot: Timeslot | null
  deliveryPrice: number
}
