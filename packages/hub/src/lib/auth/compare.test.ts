import { describe, expect, it } from 'vitest'
import { constantTimeEqual } from './compare'

describe('constantTimeEqual', () => {
  it('returns true for identical strings', () => {
    expect(constantTimeEqual('hunter2', 'hunter2')).toBe(true)
  })

  it('returns false for different strings of the same length', () => {
    expect(constantTimeEqual('hunter2', 'hunter3')).toBe(false)
  })

  it('returns false for strings of different length', () => {
    expect(constantTimeEqual('short', 'much-longer-string')).toBe(false)
  })

  it('returns true for two empty strings', () => {
    expect(constantTimeEqual('', '')).toBe(true)
  })
})
