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
  /** Mots-clés utilisés par l'interprétation de la demande. */
  tags: string[]
  recipeId?: string
  promo?: ProductPromo
  /**
   * Produit de substitution si celui-ci est en rupture. `null` signifie
   * explicitement "aucun substitut connu" — voir Failure mode #4 de la
   * revue /plan-eng-review (2026-07-20) : ce cas doit être géré dans l'UI,
   * jamais silencieux.
   */
  substituteId?: string | null
}
