export type ChatRole = 'user' | 'assistant'

export type WidgetType =
  | 'recipe-carousel'
  | 'shopping-list'
  | 'store-locator'
  | 'cart'
  | 'offtopic'

export interface RecipeCarouselPayload {
  recipeIds: string[]
}

export interface ShoppingListPayload {
  productIds: string[]
  requestId: string
}

export interface StoreLocatorPayload {
  reason: 'add-to-cart' | 'manual'
}

export type ChatWidget =
  | { type: 'recipe-carousel'; payload: RecipeCarouselPayload }
  | { type: 'shopping-list'; payload: ShoppingListPayload }
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
