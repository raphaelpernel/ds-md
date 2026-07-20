'use client'

import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react'
import type { CartItem, CartSection, CartState } from '../data/types/cart'
import type { Product } from '../data/types/product'
import type { Store } from '../data/types/store'

// ─── State ───────────────────────────────────────────────────────────────────
//
// Source unique de vérité pour le panier, lue à la fois par le chat (agent)
// et par l'écran /courses — décision Code Quality #1 de la revue
// /plan-eng-review du 2026-07-20 : AssistantContext ne maintient plus son
// propre state.cart, il dispatche ici.

const initialState: CartState = {
  items: [],
  store: null,
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export type CartAction =
  | {
      type: 'ADD_ITEM'
      product: Product
      recipeId: string | null
      recipeName: string | null
      recipeEmoji: string | null
      servings: number | null
    }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QTY'; productId: string; quantity: number }
  | {
      /**
       * Remplace un produit en rupture par un substitut choisi. Stub visuel
       * pour le POC : pas de vrai algorithme de matching (voir TODOS.md
       * "Vrai algorithme de substitution produit (marmiton-agent)").
       */
      type: 'SUBSTITUTE_ITEM'
      productId: string
      substituteProduct: Product
    }
  | { type: 'SET_STORE'; store: Store }
  | { type: 'CLEAR' }

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.product.id === action.product.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.id === action.product.id ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        }
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            product: action.product,
            quantity: 1,
            recipeId: action.recipeId,
            recipeName: action.recipeName,
            recipeEmoji: action.recipeEmoji,
            servings: action.servings,
          },
        ],
      }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.product.id !== action.productId) }
    case 'UPDATE_QTY':
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.product.id !== action.productId) }
      }
      return {
        ...state,
        items: state.items.map((i) => (i.product.id === action.productId ? { ...i, quantity: action.quantity } : i)),
      }
    case 'SUBSTITUTE_ITEM':
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.productId
            ? { ...i, product: action.substituteProduct, substitutedFromProductId: action.productId }
            : i,
        ),
      }
    case 'SET_STORE':
      return { ...state, store: action.store }
    case 'CLEAR':
      return initialState
    default:
      return state
  }
}

// ─── Sélecteurs dérivés ────────────────────────────────────────────────────

/** Groupe les items plats par recette pour l'affichage /courses — jamais stocké, toujours dérivé. */
export function groupCartByRecipe(items: CartItem[]): CartSection[] {
  const sections: CartSection[] = []
  for (const item of items) {
    let section = sections.find((s) => s.recipeId === item.recipeId)
    if (!section) {
      section = {
        recipeId: item.recipeId,
        recipeName: item.recipeName,
        recipeEmoji: item.recipeEmoji,
        servings: item.servings,
        items: [],
      }
      sections.push(section)
    }
    section.items.push(item)
  }
  return sections
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface CartContextValue {
  state: CartState
  addItem: (product: Product, recipe?: { id: string; name: string; emoji: string; servings: number | null }) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  substituteItem: (productId: string, substituteProduct: Product) => void
  setStore: (store: Store) => void
  clear: () => void
  isInCart: (productId: string) => boolean
  sections: CartSection[]
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const addItem = (product: Product, recipe?: { id: string; name: string; emoji: string; servings: number | null }) => {
    dispatch({
      type: 'ADD_ITEM',
      product,
      recipeId: recipe?.id ?? null,
      recipeName: recipe?.name ?? null,
      recipeEmoji: recipe?.emoji ?? null,
      servings: recipe?.servings ?? null,
    })
  }
  const removeItem = (productId: string) => dispatch({ type: 'REMOVE_ITEM', productId })
  const updateQuantity = (productId: string, quantity: number) => dispatch({ type: 'UPDATE_QTY', productId, quantity })
  const substituteItem = (productId: string, substituteProduct: Product) =>
    dispatch({ type: 'SUBSTITUTE_ITEM', productId, substituteProduct })
  const setStore = (store: Store) => dispatch({ type: 'SET_STORE', store })
  const clear = () => dispatch({ type: 'CLEAR' })
  const isInCart = (productId: string) => state.items.some((i) => i.product.id === productId)

  const sections = useMemo(() => groupCartByRecipe(state.items), [state.items])
  const total = useMemo(() => cartTotal(state.items), [state.items])
  const itemCount = useMemo(() => state.items.reduce((sum, i) => sum + i.quantity, 0), [state.items])

  const value = useMemo<CartContextValue>(
    () => ({ state, addItem, removeItem, updateQuantity, substituteItem, setStore, clear, isInCart, sections, total, itemCount }),
    [state, sections, total, itemCount],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
