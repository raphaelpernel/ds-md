export interface ProductPromo {
  percent: number
  originalPrice: number
}

export interface Product {
  id: string
  name: string
  brand: string
  emoji: string
  price: number
  pricePerUnit: string
  unit: string
  available: boolean
  recipeId?: string
  promo?: ProductPromo
}
