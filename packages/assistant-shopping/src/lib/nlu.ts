import { MOCK_RECIPES } from '../data/mock/recipes'
import { MOCK_PRODUCTS } from '../data/mock/products'
import type { Recipe } from '../data/types/recipe'
import type { Product } from '../data/types/product'
import { normalize, includesAny, tokenize, scoreByTags } from './matching'

export type Intent = 'recipes' | 'shopping-list' | 'product-search' | 'cart' | 'store' | 'offtopic' | 'unknown'

export interface Interpretation {
  intent: Intent
  contextSentence: string
  recipes?: Recipe[]
  products?: Product[]
}

const OFFTOPIC_KEYWORDS = ['météo', 'meteo', 'actualité', 'actualite', 'football', 'politique', 'bourse', 'blague']

const RECIPE_KEYWORDS = ['recette', 'recettes', 'plat', 'plats', 'repas', 'manger', 'entrée', 'entree', 'dessert', 'cuisiner']

const LIST_KEYWORDS = ['liste', 'courses', 'liste de courses']

const CART_KEYWORDS = ['panier', 'mon panier']

/** Termes de repas/occasion qui déclenchent un ensemble de produits typiques. */
const OCCASION_PRODUCT_SETS: { match: string[]; tags: string[] }[] = [
  { match: ['raclette'], tags: ['raclette'] },
  { match: ['petit-déjeuner', 'petit dejeuner', 'petit déjeuner', 'petit-dejeuner'], tags: ['petit-dejeuner'] },
]

function pickDefaultRecipes(): Recipe[] {
  return MOCK_RECIPES.filter((r) => r.mealType === 'plat').slice(0, 4)
}

function interpretRecipeRequest(raw: string): Interpretation {
  const tokens = tokenize(raw)
  const normalized = normalize(raw)

  let matched = scoreByTags(MOCK_RECIPES, tokens)

  if (includesAny(normalized, ['entrée', 'entree', 'legere', 'légère'])) {
    matched = matched.filter((r) => r.mealType === 'entrée' || r.tags.includes('entree'))
  }
  if (includesAny(normalized, ['dessert', 'sucre', 'sucré', 'chocolat'])) {
    matched = matched.filter((r) => r.mealType === 'dessert')
  }
  if (includesAny(normalized, ['rapide', 'vite'])) {
    matched = matched.filter((r) => r.tags.includes('rapide'))
  }

  const recipes = matched.length > 0 ? matched.slice(0, 4) : pickDefaultRecipes()

  const contextSentence =
    matched.length > 0
      ? 'Voici quelques idées de recettes qui correspondent à votre demande.'
      : 'Voici quelques idées de plats principaux pour vous inspirer.'

  return { intent: 'recipes', contextSentence, recipes }
}

function interpretShoppingListRequest(raw: string): Interpretation {
  const tokens = tokenize(raw)
  const normalized = normalize(raw)

  const occasion = OCCASION_PRODUCT_SETS.find((set) => includesAny(normalized, set.match))

  let matched: Product[]
  if (occasion) {
    matched = MOCK_PRODUCTS.filter((p) => p.tags.some((t) => occasion.tags.includes(normalize(t))))
  } else {
    matched = scoreByTags(MOCK_PRODUCTS, tokens)
  }

  if (matched.length === 0) {
    matched = MOCK_PRODUCTS.slice(0, 6)
  }

  if (includesAny(normalized, ['bio'])) {
    matched = [...matched].sort((a, b) => Number(!!b.bio) - Number(!!a.bio))
  }
  if (includesAny(normalized, ['pas cher', 'pas chere', 'économique', 'economique'])) {
    matched = [...matched].sort((a, b) => Number(!!b.economique) - Number(!!a.economique))
  }

  const products = matched.slice(0, 8)

  return {
    intent: 'shopping-list',
    contextSentence: 'Voici une liste de courses basée sur votre demande. Vous pouvez décocher les articles que vous ne souhaitez pas ajouter.',
    products,
  }
}

/**
 * Demande de produit direct ("je veux des pâtes") : contrairement à une liste de
 * courses, on ne présente pas une case-à-cocher géante mais quelques alternatives
 * comparables (cf. widget `render.product.carousel` — `docs/docs/04-architecture-technique.md`).
 */
function interpretProductSearchRequest(raw: string): Interpretation | null {
  const tokens = tokenize(raw)
  const matched = scoreByTags(MOCK_PRODUCTS, tokens)

  if (matched.length === 0) return null

  return {
    intent: 'product-search',
    contextSentence: 'Voici plusieurs produits qui correspondent à votre demande.',
    products: matched.slice(0, 3),
  }
}

/**
 * Simule l'interprétation en langage naturel réalisée côté serveur MCP
 * (recipe.search / shopping_list.search) : reconnaissance par mots-clés,
 * pas de compréhension sémantique fine — fidèle au comportement MVP documenté.
 */
export function interpretMessage(raw: string): Interpretation {
  const normalized = normalize(raw)

  if (includesAny(normalized, OFFTOPIC_KEYWORDS)) {
    return { intent: 'offtopic', contextSentence: 'Je suis là pour vous aider à trouver des recettes ou faire vos courses chez Carrefour — je ne peux pas répondre à cette question.' }
  }

  if (includesAny(normalized, CART_KEYWORDS)) {
    return { intent: 'cart', contextSentence: 'Voici le contenu de votre panier.' }
  }

  if (includesAny(normalized, LIST_KEYWORDS)) {
    return interpretShoppingListRequest(raw)
  }

  if (includesAny(normalized, RECIPE_KEYWORDS)) {
    return interpretRecipeRequest(raw)
  }

  // Demande vague ("j'ai faim", "montre-moi des idées") → recettes par défaut, sans blocage.
  if (includesAny(normalized, ['faim', 'idee', 'idée', 'inspire', 'inspirer'])) {
    return interpretRecipeRequest(raw)
  }

  // Demande de produit direct, sans mot-clé "liste"/"recette" ("je veux des pâtes").
  const productSearch = interpretProductSearchRequest(raw)
  if (productSearch) return productSearch

  return {
    intent: 'unknown',
    contextSentence: 'Je peux vous suggérer des recettes ou générer une liste de courses. Essayez par exemple « des recettes avec du poulet » ou « une liste pour une raclette ».',
  }
}
