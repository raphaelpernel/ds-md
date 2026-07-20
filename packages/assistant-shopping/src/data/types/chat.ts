export type ChatRole = 'user' | 'assistant'

export type WidgetType =
  | 'recipe-carousel'
  | 'recipe-detail'
  | 'shopping-list'
  | 'product-carousel'
  | 'store-locator'
  | 'cart'
  | 'offtopic'

export interface RecipeCarouselPayload {
  recipeIds: string[]
}

/** Détail d'une recette rendu inline dans le chat (widget `recipe-detail-inline` —
 *  cf. `docs/docs/04-architecture-technique.md`), et non plus dans une modale. */
export interface RecipeDetailPayload {
  recipeId: string
}

export interface ShoppingListPayload {
  productIds: string[]
  requestId: string
}

/** Quelques produits comparables pour une demande directe ("je veux des pâtes") —
 *  widget `product-carousel`, distinct de la liste de courses `shopping-list`. */
export interface ProductCarouselPayload {
  productIds: string[]
}

export interface StoreLocatorPayload {
  reason: 'add-to-cart' | 'manual'
}

export type ChatWidget =
  | { type: 'recipe-carousel'; payload: RecipeCarouselPayload }
  | { type: 'recipe-detail'; payload: RecipeDetailPayload }
  | { type: 'shopping-list'; payload: ShoppingListPayload }
  | { type: 'product-carousel'; payload: ProductCarouselPayload }
  | { type: 'store-locator'; payload: StoreLocatorPayload }
  | { type: 'cart' }
  | { type: 'offtopic' }

export interface ChatMessage {
  id: string
  role: ChatRole
  text?: string
  widget?: ChatWidget
  pending?: boolean
}

/** Action reportée en attendant la sélection d'un magasin. */
export type PendingAction =
  | { type: 'add-recipe'; recipeId: string; guests?: number }
  | { type: 'add-products'; productIds: string[]; requestId: string }
