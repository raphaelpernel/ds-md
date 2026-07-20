import type { Product } from '../types/product'

export const MOCK_PRODUCTS: Product[] = [
  { id: 'prod-pates', name: 'Spaghetti n°5', brand: 'Barilla', emoji: '🍝', price: 1.49, pricePerUnit: '2,98€/kg', unit: '500 g', available: true, tags: ['pates'], recipeId: 'carbonara-romaine' },
  { id: 'prod-tagliatelles', name: 'Tagliatelles', brand: 'Barilla', emoji: '🍝', price: 1.79, pricePerUnit: '3,58€/kg', unit: '500 g', available: true, tags: ['pates'], recipeId: 'carbonara-a-la-creme' },
  {
    id: 'prod-lardons',
    name: 'Lardons fumés',
    brand: 'Fleury Michon',
    emoji: '🥓',
    price: 2.6,
    pricePerUnit: '13,00€/kg',
    unit: '200 g',
    // Rupture de stock volontaire pour démontrer la substitution en flux (écran /courses).
    available: false,
    tags: ['lardons'],
    substituteId: 'prod-lardons-bio',
  },
  { id: 'prod-lardons-bio', name: 'Lardons fumés bio', brand: 'Bio Village', emoji: '🥓', price: 3.4, pricePerUnit: '17,00€/kg', unit: '200 g', available: true, tags: ['lardons'] },
  { id: 'prod-parmesan', name: 'Parmesan râpé', brand: 'Galbani', emoji: '🧀', price: 2.89, pricePerUnit: '28,90€/kg', unit: '100 g', available: true, tags: ['fromage'] },
  { id: 'prod-oeufs', name: 'Œufs plein air ×6', brand: 'Marque Repère', emoji: '🥚', price: 2.1, pricePerUnit: '0,35€/unité', unit: '6 unités', available: true, tags: ['oeufs'] },
  { id: 'prod-creme', name: 'Crème fraîche épaisse', brand: 'Elle & Vire', emoji: '🥛', price: 1.35, pricePerUnit: '6,75€/L', unit: '20 cl', available: true, tags: ['creme'] },
  {
    id: 'prod-champignons',
    name: 'Champignons de Paris',
    brand: 'Marque Repère',
    emoji: '🍄',
    price: 1.95,
    pricePerUnit: '13,00€/kg',
    unit: '150 g',
    // Rupture sans substitut connu — démontre explicitement l'état "aucun
    // substitut disponible" (Failure mode #4, revue /plan-eng-review du 2026-07-20),
    // jamais un panier silencieusement incomplet.
    available: false,
    tags: ['champignons'],
    substituteId: null,
  },
  { id: 'prod-huile', name: 'Huile d’olive vierge extra', brand: 'Puget', emoji: '🫒', price: 5.2, pricePerUnit: '6,93€/L', unit: '75 cl', available: true, tags: ['huile'], promo: { percent: 20, originalPrice: 6.5 } },
  { id: 'prod-poulet', name: 'Escalopes de poulet ×3', brand: 'Marque Repère', emoji: '🍗', price: 5.9, pricePerUnit: '19,67€/kg', unit: '450 g', available: true, tags: ['poulet'] },
  { id: 'prod-riz', name: 'Riz basmati', brand: 'Taureau Ailé', emoji: '🍚', price: 2.3, pricePerUnit: '4,60€/kg', unit: '500 g', available: true, tags: ['riz'] },
  { id: 'prod-carottes', name: 'Carottes', brand: 'Marque Repère', emoji: '🥕', price: 1.1, pricePerUnit: '1,10€/kg', unit: '1 kg', available: true, tags: ['carottes'] },
  { id: 'prod-quinoa', name: 'Quinoa', brand: 'Ebly', emoji: '🌾', price: 3.9, pricePerUnit: '15,60€/kg', unit: '250 g', available: true, tags: ['quinoa'] },
  { id: 'prod-poischiches', name: 'Pois chiches', brand: 'Marque Repère', emoji: '🫘', price: 0.95, pricePerUnit: '2,38€/kg', unit: '400 g', available: true, tags: ['poischiches'] },
  { id: 'prod-avocat', name: 'Avocat', brand: 'Marque Repère', emoji: '🥑', price: 1.2, pricePerUnit: '1,20€/unité', unit: '1 unité', available: true, tags: ['avocat'] },
  { id: 'prod-farine', name: 'Farine de blé T45', brand: 'Francine', emoji: '🌾', price: 1.15, pricePerUnit: '1,15€/kg', unit: '1 kg', available: true, tags: ['farine'] },
  { id: 'prod-lait', name: 'Lait demi-écrémé', brand: 'Lactel', emoji: '🥛', price: 1.05, pricePerUnit: '1,05€/L', unit: '1 L', available: true, tags: ['lait'] },
]
