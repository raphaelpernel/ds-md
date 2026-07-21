export type ChatRole = 'user' | 'assistant'

export type WidgetType = 'recipe-carousel' | 'shopping-list' | 'product-carousel' | 'store-locator' | 'cart' | 'offtopic'

export interface RecipeCarouselPayload {
  recipeIds: string[]
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
  /** Message d'accueil affiché à l'ouverture du drawer — rendu via `AssistantIntro`
   *  (illustration + salutation) plutôt que la bulle de chat standard. */
  intro?: boolean
}

/** Action reportée en attendant la sélection d'un magasin. */
export type PendingAction =
  | { type: 'add-recipe'; recipeId: string; guests?: number }
  | { type: 'add-products'; productIds: string[]; requestId: string }

/** Vue plein cadre qui remplace tout `.chat-shell__history` (jamais une modale) —
 *  un seul état actif à la fois, partagé entre tous les widgets. */
export type FullViewState =
  | { type: 'shopping-list'; requestId: string; productIds: string[] }
  | { type: 'recipes'; recipeIds: string[] }
  | { type: 'cart' }
  | { type: 'recipe-detail'; recipeId: string; recipeIds: string[] }
  | { type: 'product-swap'; originalId: string }
  | { type: 'product-choice'; productIds: string[]; focusedProductId: string }
