import type { CartState } from '@/data/types/cart'

/**
 * Ajoute des `productIds` au panier avec quantité 1 — dédoublonne à la fois
 * contre le panier existant ET à l'intérieur du batch lui-même. Ce second cas
 * arrive concrètement quand deux articles distincts d'une liste de courses ont
 * été remplacés (swap) vers le même produit : `ShoppingList` calcule alors sa
 * sélection via le produit *effectif* (post-swap), donc le même id peut s'y
 * trouver deux fois — sans ce garde, on obtiendrait deux lignes panier portant
 * le même `productId`, ce qui casse la clé React de `CartWidget` (`key={originalId}`,
 * lui-même dérivé de `entry.productId`).
 */
export function addProductIdsToCart(cart: CartState, productIds: string[]): CartState {
  const seen = new Set(cart.products.map((p) => p.productId))
  const additions = []

  for (const productId of productIds) {
    if (seen.has(productId)) continue
    seen.add(productId)
    additions.push({ productId, quantity: 1 })
  }

  return { ...cart, products: [...cart.products, ...additions] }
}
