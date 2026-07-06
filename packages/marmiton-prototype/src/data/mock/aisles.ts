import type { Aisle } from '../types/aisle'

export const AISLES: Aisle[] = [
  {
    id: 'fruits-legumes',
    label: 'Fruits & Légumes',
    emoji: '🥦',
    subAisles: [
      { id: 'offres', label: 'Les offres de la semaine', productIds: ['p-tomates', 'p-abricots'] },
      { id: 'primeur', label: 'Mon Primeur', productIds: ['p-abricots', 'p-nectarines', 'p-pomelo', 'p-peches', 'p-radis', 'p-tomates'] },
    ],
  },
  {
    id: 'viandes-poissons',
    label: 'Viandes & Poissons',
    emoji: '🥩',
    subAisles: [
      { id: 'boucher', label: 'Mon Boucher', productIds: ['p-steak', 'p-saucisses'] },
      { id: 'poissonnier', label: 'Mon Poissonnier', productIds: ['p-thon', 'p-saumon'] },
    ],
  },
  {
    id: 'cremerie',
    label: 'Crèmerie',
    emoji: '🧀',
    subAisles: [
      { id: 'fromager', label: 'Mon Fromager', productIds: ['p-beurre', 'p-emmental-rape'] },
      { id: 'laitiers', label: 'Produits laitiers', productIds: ['p-lait', 'p-yaourts-nature'] },
    ],
  },
  {
    id: 'boulangerie',
    label: 'Boulangerie',
    emoji: '🍞',
    productIds: ['p-pain', 'p-pate-feuilletee'],
  },
  {
    id: 'epicerie-sucree',
    label: 'Épicerie sucrée',
    emoji: '🍫',
    productIds: ['p-cassonade', 'p-farine'],
  },
  {
    id: 'epicerie-salee',
    label: 'Épicerie salée',
    emoji: '🥫',
    productIds: ['p-olives', 'p-spaghetti', 'p-huile-olive'],
  },
  {
    id: 'boissons',
    label: 'Boissons',
    emoji: '🥤',
    productIds: ['p-jus-pamplemousse', 'p-cafe-moulu'],
  },
  {
    id: 'surgeles',
    label: 'Surgelés',
    emoji: '🧊',
    productIds: ['p-legumes-surgeles'],
  },
  {
    id: 'hygiene',
    label: 'Hygiène & Beauté',
    emoji: '🧴',
    productIds: ['p-dentifrice'],
  },
]

export function getAisleById(id: string): Aisle | undefined {
  return AISLES.find((a) => a.id === id)
}

export function getSubAisle(aisleId: string, subAisleId: string) {
  const aisle = getAisleById(aisleId)
  return aisle?.subAisles?.find((s) => s.id === subAisleId)
}

export function getAllProductIds(aisle: Aisle): string[] {
  const own = aisle.productIds ?? []
  const fromSub = aisle.subAisles?.flatMap((s) => s.productIds) ?? []
  return [...new Set([...own, ...fromSub])]
}
