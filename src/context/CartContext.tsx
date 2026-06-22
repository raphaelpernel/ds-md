'use client'

import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { CartItem, CartSection } from '../data/types/cart'
import type { Product } from '../data/types/product'
import type { Timeslot } from '../data/types/timeslot'

// ─── State ───────────────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[]
  storeId: string | null
  storeName: string | null
  timeslot: Timeslot | null
}

const initialState: CartState = {
  items: [],
  storeId: null,
  storeName: null,
  timeslot: null,
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; recipeId: string | null; recipeName: string | null }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QTY'; productId: string; quantity: number }
  | { type: 'SET_STORE'; storeId: string; storeName: string }
  | { type: 'SET_TIMESLOT'; timeslot: Timeslot }
  | { type: 'CLEAR' }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.product.id === action.product.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.id === action.product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }
      }
      return {
        ...state,
        items: [
          ...state.items,
          { product: action.product, quantity: 1, recipeId: action.recipeId, recipeName: action.recipeName },
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
        items: state.items.map((i) =>
          i.product.id === action.productId ? { ...i, quantity: action.quantity } : i
        ),
      }
    case 'SET_STORE':
      return { ...state, storeId: action.storeId, storeName: action.storeName }
    case 'SET_TIMESLOT':
      return { ...state, timeslot: action.timeslot }
    case 'CLEAR':
      return initialState
    default:
      return state
  }
}

// ─── Selectors ────────────────────────────────────────────────────────────────

export function getCartSections(items: CartItem[]): CartSection[] {
  const map = new Map<string | null, CartSection>()
  for (const item of items) {
    const key = item.recipeId
    if (!map.has(key)) {
      map.set(key, { recipeId: item.recipeId, recipeName: item.recipeName, items: [] })
    }
    map.get(key)!.items.push(item)
  }
  const sections = Array.from(map.values())
  return [
    ...sections.filter((s) => s.recipeId !== null),
    ...sections.filter((s) => s.recipeId === null),
  ]
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0)
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface CartContextValue {
  state: CartState
  addItem: (product: Product, recipeId?: string | null, recipeName?: string | null) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, quantity: number) => void
  setStore: (storeId: string, storeName: string) => void
  setTimeslot: (timeslot: Timeslot) => void
  clear: () => void
  total: number
  itemCount: number
  sections: CartSection[]
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const addItem = (product: Product, recipeId: string | null = null, recipeName: string | null = null) =>
    dispatch({ type: 'ADD_ITEM', product, recipeId, recipeName })

  const removeItem = (productId: string) => dispatch({ type: 'REMOVE_ITEM', productId })

  const updateQty = (productId: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QTY', productId, quantity })

  const setStore = (storeId: string, storeName: string) =>
    dispatch({ type: 'SET_STORE', storeId, storeName })

  const setTimeslot = (timeslot: Timeslot) => dispatch({ type: 'SET_TIMESLOT', timeslot })

  const clear = () => dispatch({ type: 'CLEAR' })

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQty,
        setStore,
        setTimeslot,
        clear,
        total: getCartTotal(state.items),
        itemCount: getCartItemCount(state.items),
        sections: getCartSections(state.items),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within <CartProvider>')
  return ctx
}
