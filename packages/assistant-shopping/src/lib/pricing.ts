import type { Product } from '@/data/types/product'
import { formatPrice } from './format'

/**
 * Calcule le prix au kilo affiché à côté du prix (ex: "9,96€/kg"), à partir de
 * `product.unit` — uniquement pour les unités de poids (`kg`, `<n> kg`, `<n> g`).
 * Les autres unités (pièce, volume, lot…) n'ont pas d'équivalent prix/kg en
 * rayon réel : retourne `null`, pas de second prix affiché.
 */
export function getPricePerKg(product: Product): string | null {
  const unit = product.unit?.trim().toLowerCase()
  if (!unit) return null

  if (unit === 'kg') {
    return `${formatPrice(product.price)}/kg`
  }

  const kgMatch = unit.match(/^(\d+(?:[.,]\d+)?)\s*kg$/)
  if (kgMatch) {
    const kg = parseFloat(kgMatch[1].replace(',', '.'))
    return `${formatPrice(product.price / kg)}/kg`
  }

  const gramMatch = unit.match(/^(\d+(?:[.,]\d+)?)\s*g$/)
  if (gramMatch) {
    const kg = parseFloat(gramMatch[1].replace(',', '.')) / 1000
    return `${formatPrice(product.price / kg)}/kg`
  }

  return null
}
