import { describe, it, expect } from 'vitest'
import { cartReducer, groupCartByRecipe, cartTotal, type CartAction } from '../CartContext'
import type { CartState } from '../../data/types/cart'
import type { Product } from '../../data/types/product'

const productA: Product = { id: 'p1', name: 'Spaghetti', brand: 'Barilla', emoji: '🍝', price: 1.5, pricePerUnit: '', unit: '500g', available: true, tags: [] }
const productB: Product = { id: 'p2', name: 'Lardons', brand: 'Fleury', emoji: '🥓', price: 2.6, pricePerUnit: '', unit: '200g', available: false, tags: [], substituteId: 'p3' }
const substitute: Product = { id: 'p3', name: 'Lardons bio', brand: 'Bio', emoji: '🥓', price: 3.4, pricePerUnit: '', unit: '200g', available: true, tags: [] }

const emptyState: CartState = { items: [], store: null }

function addItem(state: CartState, product: Product, recipe?: { id: string; name: string; emoji: string; servings: number | null }): CartState {
  const action: CartAction = {
    type: 'ADD_ITEM',
    product,
    recipeId: recipe?.id ?? null,
    recipeName: recipe?.name ?? null,
    recipeEmoji: recipe?.emoji ?? null,
    servings: recipe?.servings ?? null,
  }
  return cartReducer(state, action)
}

describe('cartReducer', () => {
  it('ADD_ITEM ajoute un nouveau produit avec quantité 1', () => {
    const next = addItem(emptyState, productA)
    expect(next.items).toHaveLength(1)
    expect(next.items[0]).toMatchObject({ product: productA, quantity: 1 })
  })

  it('ADD_ITEM incrémente la quantité si le produit existe déjà (pas de doublon)', () => {
    let state = addItem(emptyState, productA)
    state = addItem(state, productA)
    expect(state.items).toHaveLength(1)
    expect(state.items[0].quantity).toBe(2)
  })

  it('ADD_ITEM avec contexte recette renseigne recipeId/recipeName/servings', () => {
    const next = addItem(emptyState, productA, { id: 'r1', name: 'Carbonara', emoji: '🍝', servings: 2 })
    expect(next.items[0]).toMatchObject({ recipeId: 'r1', recipeName: 'Carbonara', servings: 2 })
  })

  it('REMOVE_ITEM retire le produit correspondant', () => {
    const state = addItem(emptyState, productA)
    const next = cartReducer(state, { type: 'REMOVE_ITEM', productId: productA.id })
    expect(next.items).toHaveLength(0)
  })

  it('UPDATE_QTY à 0 retire le produit (pas de ligne à quantité nulle)', () => {
    const state = addItem(emptyState, productA)
    const next = cartReducer(state, { type: 'UPDATE_QTY', productId: productA.id, quantity: 0 })
    expect(next.items).toHaveLength(0)
  })

  it('UPDATE_QTY positive met à jour la quantité sans dupliquer la ligne', () => {
    const state = addItem(emptyState, productA)
    const next = cartReducer(state, { type: 'UPDATE_QTY', productId: productA.id, quantity: 5 })
    expect(next.items).toHaveLength(1)
    expect(next.items[0].quantity).toBe(5)
  })

  it('SUBSTITUTE_ITEM remplace le produit et trace substitutedFromProductId', () => {
    const state = addItem(emptyState, productB)
    const next = cartReducer(state, { type: 'SUBSTITUTE_ITEM', productId: productB.id, substituteProduct: substitute })
    expect(next.items).toHaveLength(1)
    expect(next.items[0].product.id).toBe(substitute.id)
    expect(next.items[0].substitutedFromProductId).toBe(productB.id)
  })

  it('SET_STORE renseigne le magasin sans toucher aux items', () => {
    const state = addItem(emptyState, productA)
    const store = { id: 's1', name: 'Test', address: '', city: '', postalCode: '', distance: 0, openingHours: '', drive: true, delivery: false }
    const next = cartReducer(state, { type: 'SET_STORE', store })
    expect(next.store).toEqual(store)
    expect(next.items).toHaveLength(1)
  })

  it('CLEAR réinitialise le panier', () => {
    const state = addItem(emptyState, productA)
    const next = cartReducer(state, { type: 'CLEAR' })
    expect(next.items).toHaveLength(0)
    expect(next.store).toBeNull()
  })
})

describe('groupCartByRecipe', () => {
  it('groupe les items par recipeId, y compris les items sans recette (null)', () => {
    let state = addItem(emptyState, productA, { id: 'r1', name: 'Carbonara', emoji: '🍝', servings: 2 })
    state = addItem(state, productB, { id: 'r1', name: 'Carbonara', emoji: '🍝', servings: 2 })
    state = addItem(state, substitute)

    const sections = groupCartByRecipe(state.items)
    expect(sections).toHaveLength(2)
    const recipeSection = sections.find((s) => s.recipeId === 'r1')
    expect(recipeSection?.items).toHaveLength(2)
    const looseSection = sections.find((s) => s.recipeId === null)
    expect(looseSection?.items).toHaveLength(1)
  })
})

describe('cartTotal', () => {
  it('additionne prix * quantité pour tous les items', () => {
    let state = addItem(emptyState, productA)
    state = cartReducer(state, { type: 'UPDATE_QTY', productId: productA.id, quantity: 3 })
    state = addItem(state, substitute)
    expect(cartTotal(state.items)).toBeCloseTo(productA.price * 3 + substitute.price)
  })
})
