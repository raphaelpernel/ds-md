'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { interpretMessage } from '@/lib/nlu'
import { MOCK_PRODUCTS } from '@/data/mock/products'
import type { ChatMessage, PendingAction } from '@/data/types/chat'
import type { Store } from '@/data/types/store'

interface CartRecipeItem {
  recipeId: string
  guests?: number
}

interface CartProductItem {
  productId: string
  quantity: number
}

interface CartState {
  recipes: CartRecipeItem[]
  products: CartProductItem[]
}

interface AssistantState {
  messages: ChatMessage[]
  store: Store | null
  cart: CartState
  addedListRequests: string[]
  replacements: Record<string, string>
  loading: boolean
}

interface AssistantContextValue extends AssistantState {
  cartItemsCount: number
  sendMessage: (text: string) => void
  openStoreLocator: () => void
  openCart: () => void
  confirmStore: (store: Store) => void
  cancelStoreLocator: () => void
  requestAddRecipe: (recipeId: string, guests?: number) => void
  removeRecipeFromCart: (recipeId: string) => void
  isRecipeInCart: (recipeId: string) => boolean
  requestAddProducts: (requestId: string, productIds: string[]) => void
  isListRequestAdded: (requestId: string) => boolean
  updateProductQuantity: (productId: string, quantity: number) => void
  removeProductFromCart: (productId: string) => void
  replaceProduct: (productId: string, replacementId: string) => void
  getEffectiveProductId: (productId: string) => string
}

const AssistantContext = createContext<AssistantContextValue | null>(null)

function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}

function welcomeMessage(): ChatMessage {
  return {
    id: makeId(),
    role: 'assistant',
    text: 'Bonjour \u{1F44B} Je suis votre assistant shopping Carrefour Belgique. Je peux vous suggérer des recettes ou préparer une liste de courses \u2014 dites-moi ce dont vous avez besoin !',
  }
}

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage()])
  const [store, setStore] = useState<Store | null>(null)
  const [cart, setCart] = useState<CartState>({ recipes: [], products: [] })
  // Ref plutôt que state : cette action différée n'est jamais lue par le rendu, et la
  // consommer dans un ref évite le double-appel (StrictMode) des updaters fonctionnels
  // de useState, qui dupliquerait les effets de bord (messages, ajout panier).
  const pendingActionRef = useRef<PendingAction | null>(null)
  const [addedListRequests, setAddedListRequests] = useState<string[]>([])
  const [replacements, setReplacements] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const pushMessage = useCallback((message: Omit<ChatMessage, 'id'>) => {
    setMessages((prev) => [...prev, { ...message, id: makeId() }])
  }, [])

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return

      pushMessage({ role: 'user', text: trimmed })
      setLoading(true)

      // Simule un temps de réponse serveur (recherche catalogue en temps réel).
      window.setTimeout(() => {
        const result = interpretMessage(trimmed)

        if (result.intent === 'offtopic' || result.intent === 'unknown') {
          pushMessage({ role: 'assistant', text: result.contextSentence })
        } else if (result.intent === 'cart') {
          pushMessage({ role: 'assistant', text: result.contextSentence, widget: { type: 'cart' } })
        } else if (result.intent === 'recipes' && result.recipes) {
          pushMessage({
            role: 'assistant',
            text: result.contextSentence,
            widget: { type: 'recipe-carousel', payload: { recipeIds: result.recipes.map((r) => r.id) } },
          })
        } else if (result.intent === 'shopping-list' && result.products) {
          pushMessage({
            role: 'assistant',
            text: result.contextSentence,
            widget: {
              type: 'shopping-list',
              payload: { productIds: result.products.map((p) => p.id), requestId: makeId() },
            },
          })
        }

        setLoading(false)
      }, 500)
    },
    [pushMessage],
  )

  const openStoreLocator = useCallback(() => {
    pendingActionRef.current = null
    pushMessage({ role: 'assistant', text: 'Sélectionnez votre magasin Carrefour :', widget: { type: 'store-locator', payload: { reason: 'manual' } } })
  }, [pushMessage])

  const cancelStoreLocator = useCallback(() => {
    pendingActionRef.current = null
  }, [])

  const openCart = useCallback(() => {
    pushMessage({ role: 'assistant', text: 'Voici le contenu de votre panier.', widget: { type: 'cart' } })
  }, [pushMessage])

  const confirmStore = useCallback(
    (selected: Store) => {
      setStore(selected)

      // Consommation atomique via ref (lecture + remise à null synchrone) : évite de
      // rejouer les effets de bord (message, ajout panier) si confirmStore est invoqué
      // plusieurs fois pour la même action.
      const current = pendingActionRef.current
      pendingActionRef.current = null

      if (current?.type === 'add-recipe') {
        const { recipeId, guests } = current
        setCart((prev) =>
          prev.recipes.some((r) => r.recipeId === recipeId)
            ? prev
            : { ...prev, recipes: [...prev.recipes, { recipeId, guests }] },
        )
        pushMessage({
          role: 'assistant',
          text: `Magasin « ${selected.name} » sélectionné. La recette a été ajoutée à votre panier.`,
        })
      } else if (current?.type === 'add-products') {
        const { productIds, requestId } = current
        setCart((prev) => ({
          ...prev,
          products: [
            ...prev.products,
            ...productIds
              .filter((id) => !prev.products.some((p) => p.productId === id))
              .map((productId) => ({ productId, quantity: 1 })),
          ],
        }))
        setAddedListRequests((prev) => (prev.includes(requestId) ? prev : [...prev, requestId]))
        pushMessage({
          role: 'assistant',
          text: `Magasin « ${selected.name} » sélectionné. Les articles sélectionnés ont été ajoutés à votre panier.`,
        })
      } else {
        pushMessage({ role: 'assistant', text: `Magasin « ${selected.name} » sélectionné pour cette session.` })
      }
    },
    [pushMessage],
  )

  const isRecipeInCart = useCallback((recipeId: string) => cart.recipes.some((r) => r.recipeId === recipeId), [cart.recipes])

  const requestAddRecipe = useCallback(
    (recipeId: string, guests?: number) => {
      if (!store) {
        pendingActionRef.current = { type: 'add-recipe', recipeId, guests }
        pushMessage({
          role: 'assistant',
          text: 'Pour ajouter cette recette à votre panier, sélectionnez d\u2019abord votre magasin Carrefour :',
          widget: { type: 'store-locator', payload: { reason: 'add-to-cart' } },
        })
        return
      }
      setCart((prev) =>
        prev.recipes.some((r) => r.recipeId === recipeId) ? prev : { ...prev, recipes: [...prev.recipes, { recipeId, guests }] },
      )
    },
    [store, pushMessage],
  )

  const removeRecipeFromCart = useCallback((recipeId: string) => {
    setCart((prev) => ({ ...prev, recipes: prev.recipes.filter((r) => r.recipeId !== recipeId) }))
  }, [])

  const isListRequestAdded = useCallback((requestId: string) => addedListRequests.includes(requestId), [addedListRequests])

  const requestAddProducts = useCallback(
    (requestId: string, productIds: string[]) => {
      if (productIds.length === 0) return

      if (!store) {
        pendingActionRef.current = { type: 'add-products', productIds, requestId }
        pushMessage({
          role: 'assistant',
          text: 'Pour ajouter ces articles à votre panier, sélectionnez d\u2019abord votre magasin Carrefour :',
          widget: { type: 'store-locator', payload: { reason: 'add-to-cart' } },
        })
        return
      }

      setCart((prev) => ({
        ...prev,
        products: [
          ...prev.products,
          ...productIds
            .filter((id) => !prev.products.some((p) => p.productId === id))
            .map((productId) => ({ productId, quantity: 1 })),
        ],
      }))
      setAddedListRequests((prev) => [...prev, requestId])
    },
    [store, pushMessage],
  )

  const updateProductQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) => ({
      ...prev,
      products:
        quantity <= 0
          ? prev.products.filter((p) => p.productId !== productId)
          : prev.products.map((p) => (p.productId === productId ? { ...p, quantity } : p)),
    }))
  }, [])

  const removeProductFromCart = useCallback((productId: string) => {
    setCart((prev) => ({ ...prev, products: prev.products.filter((p) => p.productId !== productId) }))
  }, [])

  const replaceProduct = useCallback((productId: string, replacementId: string) => {
    setReplacements((prev) => ({ ...prev, [productId]: replacementId }))
  }, [])

  const getEffectiveProductId = useCallback((productId: string) => replacements[productId] ?? productId, [replacements])

  const cartItemsCount = useMemo(() => {
    const recipeGuestsWeight = cart.recipes.length
    const productsWeight = cart.products.reduce((sum, p) => sum + p.quantity, 0)
    return recipeGuestsWeight + productsWeight
  }, [cart])

  const value = useMemo<AssistantContextValue>(
    () => ({
      messages,
      store,
      cart,
      addedListRequests,
      replacements,
      loading,
      cartItemsCount,
      sendMessage,
      openStoreLocator,
      openCart,
      confirmStore,
      cancelStoreLocator,
      requestAddRecipe,
      removeRecipeFromCart,
      isRecipeInCart,
      requestAddProducts,
      isListRequestAdded,
      updateProductQuantity,
      removeProductFromCart,
      replaceProduct,
      getEffectiveProductId,
    }),
    [
      messages,
      store,
      cart,
      addedListRequests,
      replacements,
      loading,
      cartItemsCount,
      sendMessage,
      openStoreLocator,
      openCart,
      confirmStore,
      cancelStoreLocator,
      requestAddRecipe,
      removeRecipeFromCart,
      isRecipeInCart,
      requestAddProducts,
      isListRequestAdded,
      updateProductQuantity,
      removeProductFromCart,
      replaceProduct,
      getEffectiveProductId,
    ],
  )

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>
}

export function useAssistant(): AssistantContextValue {
  const ctx = useContext(AssistantContext)
  if (!ctx) throw new Error('useAssistant must be used within an AssistantProvider')
  return ctx
}

export function findProductById(id: string) {
  return MOCK_PRODUCTS.find((p) => p.id === id)
}
