/** Formats a price in euros. Falls back to "—" for invalid input rather than rendering "NaN €". */
export function formatPrice(price: number): string {
  if (!Number.isFinite(price)) return '—'
  return price.toFixed(2).replace('.', ',') + ' €'
}
