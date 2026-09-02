export interface Product {
  id: string
  name: string
  brand: string
  emoji: string
  price: number
  unit?: string
  /** Mots-clés utilisés par l'interprétation de la demande */
  tags: string[]
  bio?: boolean
  economique?: boolean
  /** Champs optionnels affichés dans la vue "swap" (remplacement produit) —
   *  non renseignés sur tout le catalogue mock, un fallback générique s'applique
   *  quand absents (cf. `src/lib/productDetails.ts`). */
  origin?: string
  storage?: string
  packaging?: string
  supplierAddress?: string
}
