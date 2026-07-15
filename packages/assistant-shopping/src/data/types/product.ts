export interface Product {
  id: string
  name: string
  brand: string
  emoji: string
  price: number
  unit?: string
  /** Mots-clés utilisés par l'interprétation de la demande */
  tags: string[]
  bio?: boolean
  economique?: boolean
}
