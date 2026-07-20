import type { Product } from './product'
import type { Store } from './store'

export interface CartItem {
  product: Product
  quantity: number
  recipeId: string | null
  recipeName: string | null
  recipeEmoji: string | null
  /** Nombre de personnes choisi sur la recette au moment de l'ajout au panier. */
  servings: number | null
  /**
   * Id du produit d'origine si celui-ci a été remplacé suite à une rupture.
   * `null`/absent = pas de substitution. Stub visuel pour le POC (décision
   * Code Quality #1, revue /plan-eng-review du 2026-07-20) : pas de vraie
   * logique de matching, juste le flag et le produit déjà substitué.
   */
  substitutedFromProductId?: string | null
}

export interface CartSection {
  recipeId: string | null
  recipeName: string | null
  recipeEmoji: string | null
  servings: number | null
  items: CartItem[]
}

export interface CartState {
  /** Source de vérité unique — les sections groupées par recette sont dérivées, jamais stockées. */
  items: CartItem[]
  store: Store | null
}
