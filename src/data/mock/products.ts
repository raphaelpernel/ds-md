import type { Product } from '../types/product'

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p-abricots',
    name: 'Abricots bien mûrs',
    brand: 'Carrefour Bio',
    emoji: '🍑',
    price: 2.99,
    pricePerUnit: '2,99 €/kg',
    unit: 'kg',
    available: true,
    recipeId: 'r-tarte-abricots',
  },
  {
    id: 'p-beurre',
    name: 'Beurre doux',
    brand: 'Elle & Vire',
    emoji: '🧈',
    price: 1.89,
    pricePerUnit: '1,89 €/250g',
    unit: '250g',
    available: true,
    recipeId: 'r-tarte-abricots',
  },
  {
    id: 'p-farine',
    name: 'Farine T55',
    brand: 'Francine',
    emoji: '🌾',
    price: 1.09,
    pricePerUnit: '1,09 €/kg',
    unit: 'kg',
    available: true,
    recipeId: 'r-tarte-abricots',
  },
  {
    id: 'p-pate-feuilletee',
    name: 'Pâte feuilletée pur beurre',
    brand: 'Herta',
    emoji: '🥐',
    price: 2.45,
    pricePerUnit: '2,45 €/pièce',
    unit: 'pièce',
    available: true,
    recipeId: 'r-tarte-abricots',
  },
  {
    id: 'p-cassonade',
    name: 'Cassonade',
    brand: 'Beghin Say',
    emoji: '🍯',
    price: 1.35,
    pricePerUnit: '1,35 €/500g',
    unit: '500g',
    available: true,
    recipeId: 'r-tarte-abricots',
  },
  {
    id: 'p-tomates',
    name: 'Tomates cerises',
    brand: 'Carrefour',
    emoji: '🍅',
    price: 2.29,
    pricePerUnit: '2,29 €/500g',
    unit: '500g',
    available: true,
    recipeId: 'r-salade-nicoise',
  },
  {
    id: 'p-thon',
    name: "Thon à l'huile d'olive",
    brand: 'Petit Navire',
    emoji: '🐟',
    price: 3.15,
    pricePerUnit: '3,15 €/boîte',
    unit: 'boîte',
    available: true,
    recipeId: 'r-salade-nicoise',
  },
  {
    id: 'p-olives',
    name: 'Olives noires dénoyautées',
    brand: 'Tramier',
    emoji: '🫒',
    price: 1.79,
    pricePerUnit: '1,79 €/160g',
    unit: '160g',
    available: false,
    recipeId: 'r-salade-nicoise',
  },
  {
    id: 'p-oeufs',
    name: 'Oeufs frais 6 pièces',
    brand: 'Carrefour',
    emoji: '🥚',
    price: 2.69,
    pricePerUnit: '2,69 €/6',
    unit: '6 pièces',
    available: true,
  },
  {
    id: 'p-lait',
    name: 'Lait demi-écrémé',
    brand: 'Lactel',
    emoji: '🥛',
    price: 1.15,
    pricePerUnit: '1,15 €/L',
    unit: '1L',
    available: true,
  },
]

export function getProductById(id: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === id)
}

export function getProductsByRecipe(recipeId: string): Product[] {
  return MOCK_PRODUCTS.filter((p) => p.recipeId === recipeId)
}

export const SUGGESTION_PRODUCTS: Product[] = MOCK_PRODUCTS.filter((p) => !p.recipeId)
