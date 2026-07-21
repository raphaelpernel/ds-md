import type { Product } from '@/data/types/product'

/**
 * Fallback générique pour les sections Description / Informations pratiques /
 * Marque de la vue "swap" (remplacement produit) — la plupart des produits mock
 * n'ont pas ces champs renseignés individuellement (hors périmètre de cette
 * feature : la donnée de fond n'est pas le sujet, l'architecture UI l'est).
 */
export function getProductOrigin(product: Product): string {
  return product.origin ?? 'Non communiqué'
}

export function getProductStorage(product: Product): string {
  return product.storage ?? 'Voir emballage'
}

export function getProductPackaging(product: Product): string {
  return product.packaging ?? 'Non communiqué'
}

export function getProductSupplierAddress(product: Product): string {
  return product.supplierAddress ?? `${product.brand} — adresse fournisseur non communiquée`
}
