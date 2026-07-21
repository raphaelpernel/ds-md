import { MOCK_PRODUCTS } from '@/data/mock/products'
import type { Product } from '@/data/types/product'

/** Produits alternatifs partageant au moins un tag avec `product` — utilisé par
 *  le remplacement d'un article (liste de courses, panier) et la vue "swap"
 *  plein cadre qui en présente plusieurs à la fois. */
export function findAlternatives(product: Product, excludeIds: string[], count = 5): Product[] {
  return MOCK_PRODUCTS.filter(
    (p) => p.id !== product.id && !excludeIds.includes(p.id) && p.tags.some((tag) => product.tags.includes(tag)),
  ).slice(0, count)
}
