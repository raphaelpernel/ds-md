import type { Product } from '../types/product'

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p-lait', name: 'Lait demi-écrémé', brand: 'Carrefour', emoji: '🥛', price: 1.15, unit: '1 L', tags: ['lait', 'petit-dejeuner', 'petit déjeuner'], economique: true },
  { id: 'p-lait-bio', name: 'Lait demi-écrémé bio', brand: 'Carrefour Bio', emoji: '🥛', price: 1.55, unit: '1 L', tags: ['lait', 'bio', 'petit-dejeuner'], bio: true },
  { id: 'p-oeufs', name: 'Œufs plein air', brand: 'Carrefour', emoji: '🥚', price: 2.79, unit: 'x 6', tags: ['oeuf', 'œuf', 'oeufs'] },
  { id: 'p-oeufs-bio', name: 'Œufs bio', brand: 'Carrefour Bio', emoji: '🥚', price: 3.49, unit: 'x 6', tags: ['oeuf', 'œuf', 'oeufs', 'bio'], bio: true },
  { id: 'p-pain', name: 'Pain de campagne', brand: 'Boulangerie', emoji: '🍞', price: 2.1, unit: '400 g', tags: ['pain', 'petit-dejeuner', 'petit déjeuner'] },
  { id: 'p-beurre', name: 'Beurre doux', brand: 'Carrefour', emoji: '🧈', price: 2.35, unit: '250 g', tags: ['beurre', 'petit-dejeuner'] },
  { id: 'p-confiture', name: 'Confiture de fraises', brand: 'Bonne Maman', emoji: '🍓', price: 2.9, unit: '370 g', tags: ['confiture', 'petit-dejeuner'] },
  { id: 'p-jus-orange', name: 'Jus d\u2019orange 100% pur jus', brand: 'Carrefour', emoji: '🧃', price: 2.2, unit: '1 L', tags: ['jus', 'orange', 'petit-dejeuner'] },
  { id: 'p-cafe', name: 'Café moulu', brand: 'Carte Noire', emoji: '☕', price: 4.5, unit: '250 g', tags: ['cafe', 'café', 'petit-dejeuner'] },
  { id: 'p-riz', name: 'Riz basmati', brand: 'Carrefour', emoji: '🍚', price: 2.6, unit: '1 kg', tags: ['riz'] },
  { id: 'p-tomates', name: 'Tomates rondes', brand: 'Origine Belgique', emoji: '🍅', price: 2.95, unit: 'kg', tags: ['tomate', 'tomates', 'legumes'] },
  { id: 'p-tomates-bio', name: 'Tomates rondes bio', brand: 'Carrefour Bio', emoji: '🍅', price: 3.95, unit: 'kg', tags: ['tomate', 'tomates', 'bio', 'legumes'], bio: true },
  { id: 'p-bananes', name: 'Bananes', brand: 'Origine Équateur', emoji: '🍌', price: 1.99, unit: 'kg', tags: ['banane', 'bananes'], economique: true },
  { id: 'p-fromage-raclette', name: 'Fromage à raclette', brand: 'Carrefour', emoji: '🧀', price: 6.5, unit: '450 g', tags: ['raclette', 'fromage'] },
  { id: 'p-pdt', name: 'Pommes de terre à raclette', brand: 'Origine Belgique', emoji: '🥔', price: 3.2, unit: '2,5 kg', tags: ['raclette', 'pomme de terre', 'pommes de terre'] },
  { id: 'p-charcuterie', name: 'Assortiment charcuterie', brand: 'Carrefour', emoji: '🥓', price: 5.4, unit: '300 g', tags: ['raclette', 'charcuterie'] },
  { id: 'p-cornichons', name: 'Cornichons extra-fins', brand: 'Carrefour', emoji: '🥒', price: 2.1, unit: '370 g', tags: ['raclette', 'cornichons'] },
  { id: 'p-legumes-surgeles', name: 'Poêlée de légumes', brand: 'Carrefour', emoji: '🥦', price: 2.45, unit: '1 kg', tags: ['legumes surgeles', 'legumes', 'surgele'] },
  { id: 'p-poulet', name: 'Filet de poulet', brand: 'Origine Belgique', emoji: '🍗', price: 8.9, unit: 'kg', tags: ['poulet'] },
  { id: 'p-pates', name: 'Pâtes penne', brand: 'Barilla', emoji: '🍝', price: 1.65, unit: '500 g', tags: ['pates', 'pâtes'], economique: true },
]
