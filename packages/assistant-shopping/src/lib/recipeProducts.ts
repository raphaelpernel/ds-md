import { MOCK_PRODUCTS } from '@/data/mock/products'
import type { Recipe } from '@/data/types/recipe'
import type { Product } from '@/data/types/product'
import type { CartState } from '@/data/types/cart'
import { tokenize, scoreByTags } from './matching'

/**
 * Résout les ingrédients d'une recette vers des produits réels du catalogue, par
 * correspondance de mots-clés (même logique que l'interprétation du chat — pas de
 * "règle de renvoi" complète frais > surgelé > boîte ici, cf. `ressources/regle-renvoi-produits.md`,
 * hors périmètre de ce catalogue mock). Un ingrédient sans produit correspondant est
 * simplement ignoré : on ne fabrique pas de produit inventé.
 */
export function resolveRecipeProducts(recipe: Recipe): Product[] {
  const resolved = new Map<string, Product>()

  for (const ingredient of recipe.ingredients) {
    const [bestMatch] = scoreByTags(MOCK_PRODUCTS, tokenize(ingredient.name))
    if (bestMatch) resolved.set(bestMatch.id, bestMatch)
  }

  return Array.from(resolved.values())
}

/**
 * Ajoute les ingrédients résolus de la recette au panier, tagués avec le nom de la
 * recette — on n'ajoute jamais une "recette" en tant que telle au panier, seulement
 * ses produits (cf. `docs/docs/02-parcours-recettes.md`, Étape 4).
 */
export function mergeRecipeIntoCart(cart: CartState, recipe: Recipe): CartState {
  const products = resolveRecipeProducts(recipe)
  if (products.length === 0) return cart

  const byId = new Map(cart.products.map((entry) => [entry.productId, entry]))
  for (const product of products) {
    const existing = byId.get(product.id)
    byId.set(product.id, existing ? { ...existing, recipeTag: recipe.name } : { productId: product.id, quantity: 1, recipeTag: recipe.name })
  }

  return { products: Array.from(byId.values()) }
}
