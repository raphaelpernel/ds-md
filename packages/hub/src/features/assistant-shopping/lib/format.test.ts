import { describe, expect, it } from 'vitest'
import { formatPrice } from './format'

describe('formatPrice', () => {
  it('formats a whole number with two decimals and euro sign', () => {
    expect(formatPrice(0)).toBe('0,00 €')
  })

  it('formats decimals with a comma separator', () => {
    expect(formatPrice(1.5)).toBe('1,50 €')
  })

  it('falls back to an em dash for NaN instead of rendering "NaN €"', () => {
    expect(formatPrice(NaN)).toBe('—')
  })

  it('falls back to an em dash for Infinity', () => {
    expect(formatPrice(Infinity)).toBe('—')
  })
})
