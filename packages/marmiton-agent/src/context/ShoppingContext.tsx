'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { fullIngredientList } from '../lib/recipeAnalysis'
import { MOCK_RECIPES } from '../data/mock/recipes'
import { MOCK_PRODUCTS } from '../data/mock/products'
import { useCart } from './CartContext'
import type { Store } from '../data/types/store'

/**
 * Anciennement AssistantContext — renommé après avoir retiré le fil de chat
 * (voir session du 2026-07-20, retour du produit trop proche du proto CEO).
 * Ne reste que ce qui est vraiment nécessaire hors conversation : ajouter au
 * panier, choisir un magasin, différer l'action tant qu'aucun magasin n'est
 * choisi (pattern pendingActionRef, StrictMode-safe).
 */
type PendingAction =
  | { type: 'add-recipe'; recipeId: string; guests?: number }
  | { type: 'add-products'; productIds: string[]; requestId: string }

interface ShoppingContextValue {
  storeLocatorOpen: boolean
  addedListRequests: string[]
  openStoreLocator: () => void
  closeStoreLocator: () => void
  confirmStore: (store: Store) => void
  requestAddRecipe: (recipeId: string, guests?: number) => void
  requestAddProducts: (requestId: string, productIds: string[]) => void
  isListRequestAdded: (requestId: string) => boolean
}

const ShoppingContext = createContext<ShoppingContextValue | null>(null)

export function ShoppingProvider({ children }: { children: ReactNode }) {
  const cart = useCart()
  const [storeLocatorOpen, setStoreLocatorOpen] = useState(false)
  const [addedListRequests, setAddedListRequests] = useState<string[]>([])
  // Ref plutôt que state : cette action différée n'est jamais lue par le rendu, et la
  // consommer dans un ref évite le double-appel (StrictMode) des updaters fonctionnels
  // de useState, qui dupliquerait les effets de bord (ajout panier).
  const pendingActionRef = useRef<PendingAction | null>(null)

  const addRecipeIngredientsToCart = useCallback(
    (recipeId: string, guests?: number) => {
      const recipe = MOCK_RECIPES.find((r) => r.id === recipeId)
      if (!recipe) return
      const servings = guests ?? recipe.servings
      for (const ingredient of fullIngredientList(recipe)) {
        if (!ingredient.productId) continue
        const product = MOCK_PRODUCTS.find((p) => p.id === ingredient.productId)
        if (!product) continue
        cart.addItem(product, { id: recipe.id, name: recipe.name, emoji: recipe.emoji, servings })
      }
    },
    [cart],
  )

  const openStoreLocator = useCallback(() => {
    pendingActionRef.current = null
    setStoreLocatorOpen(true)
  }, [])

  const closeStoreLocator = useCallback(() => {
    pendingActionRef.current = null
    setStoreLocatorOpen(false)
  }, [])

  const confirmStore = useCallback(
    (selected: Store) => {
      cart.setStore(selected)
      setStoreLocatorOpen(false)

      // Consommation atomique via ref (lecture + remise à null synchrone) : évite de
      // rejouer les effets de bord (ajout panier) si confirmStore est invoqué
      // plusieurs fois pour la même action.
      const current = pendingActionRef.current
      pendingActionRef.current = null

      if (current?.type === 'add-recipe') {
        addRecipeIngredientsToCart(current.recipeId, current.guests)
      } else if (current?.type === 'add-products') {
        const { productIds, requestId } = current
        for (const productId of productIds) {
          const product = MOCK_PRODUCTS.find((p) => p.id === productId)
          if (product) cart.addItem(product)
        }
        setAddedListRequests((prev) => (prev.includes(requestId) ? prev : [...prev, requestId]))
      }
    },
    [cart, addRecipeIngredientsToCart],
  )

  const requestAddRecipe = useCallback(
    (recipeId: string, guests?: number) => {
      if (!cart.state.store) {
        pendingActionRef.current = { type: 'add-recipe', recipeId, guests }
        setStoreLocatorOpen(true)
        return
      }
      addRecipeIngredientsToCart(recipeId, guests)
    },
    [cart.state.store, addRecipeIngredientsToCart],
  )

  const isListRequestAdded = useCallback((requestId: string) => addedListRequests.includes(requestId), [addedListRequests])

  const requestAddProducts = useCallback(
    (requestId: string, productIds: string[]) => {
      if (productIds.length === 0) return

      if (!cart.state.store) {
        pendingActionRef.current = { type: 'add-products', productIds, requestId }
        setStoreLocatorOpen(true)
        return
      }

      for (const productId of productIds) {
        const product = MOCK_PRODUCTS.find((p) => p.id === productId)
        if (product) cart.addItem(product)
      }
      setAddedListRequests((prev) => [...prev, requestId])
    },
    [cart],
  )

  const value = useMemo<ShoppingContextValue>(
    () => ({
      storeLocatorOpen,
      addedListRequests,
      openStoreLocator,
      closeStoreLocator,
      confirmStore,
      requestAddRecipe,
      requestAddProducts,
      isListRequestAdded,
    }),
    [storeLocatorOpen, addedListRequests, openStoreLocator, closeStoreLocator, confirmStore, requestAddRecipe, requestAddProducts, isListRequestAdded],
  )

  return <ShoppingContext.Provider value={value}>{children}</ShoppingContext.Provider>
}

export function useShoppingActions(): ShoppingContextValue {
  const ctx = useContext(ShoppingContext)
  if (!ctx) throw new Error('useShoppingActions must be used within a ShoppingProvider')
  return ctx
}
