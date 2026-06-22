import type { Recipe } from '../types/recipe'

export const MOCK_RECIPES: Recipe[] = [
  {
    id: 'r-tarte-abricots',
    name: 'Tarte crumble aux abricots',
    imageUrl: '/img/tarteabricot.jpg',
    servings: 6,
    duration: 45,
    estimatedPricePerServing: 3.25,
    ingredients: [
      {
        id: 'i-abricots',
        name: 'Abricots bien mûrs',
        quantity: 12,
        unit: 'pièces',
        emoji: '🍑',
        productId: 'p-abricots',
      },
      {
        id: 'i-beurre',
        name: 'Beurre',
        quantity: 50,
        unit: 'g',
        emoji: '🧈',
        productId: 'p-beurre',
      },
      {
        id: 'i-farine',
        name: 'Farine',
        quantity: 100,
        unit: 'g',
        emoji: '🌾',
        productId: 'p-farine',
      },
      {
        id: 'i-pate',
        name: 'Pâte feuilletée',
        quantity: 1,
        unit: 'rouleau',
        emoji: '🥐',
        productId: 'p-pate-feuilletee',
      },
      {
        id: 'i-cassonade',
        name: 'Cassonade',
        quantity: 100,
        unit: 'g',
        emoji: '🍯',
        productId: 'p-cassonade',
      },
    ],
  },
  {
    id: 'r-salade-nicoise',
    name: 'Salade niçoise',
    imageUrl: 'https://placehold.co/400x280/4CAF50/fff?text=Salade+niçoise',
    servings: 4,
    duration: 20,
    estimatedPricePerServing: 4.10,
    ingredients: [
      {
        id: 'i-tomates',
        name: 'Tomates cerises',
        quantity: 250,
        unit: 'g',
        emoji: '🍅',
        productId: 'p-tomates',
      },
      {
        id: 'i-thon',
        name: 'Thon en boîte',
        quantity: 2,
        unit: 'boîtes',
        emoji: '🐟',
        productId: 'p-thon',
      },
      {
        id: 'i-olives',
        name: 'Olives noires',
        quantity: 80,
        unit: 'g',
        emoji: '🫒',
        productId: 'p-olives',
      },
    ],
  },
  {
    id: 'r-gratin-dauphinois',
    name: 'Gratin Dauphinois',
    imageUrl: 'https://placehold.co/400x280/D4A843/fff?text=Gratin',
    servings: 4,
    duration: 90,
    estimatedPricePerServing: 2.80,
    ingredients: [
      {
        id: 'i-lait',
        name: 'Lait entier',
        quantity: 500,
        unit: 'ml',
        emoji: '🥛',
        productId: 'p-lait',
      },
    ],
  },
]

export function getRecipeById(id: string): Recipe | undefined {
  return MOCK_RECIPES.find((r) => r.id === id)
}
