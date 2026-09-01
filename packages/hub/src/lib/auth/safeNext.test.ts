// packages/hub/src/lib/auth/safeNext.test.ts
import { describe, expect, it } from 'vitest'
import { safeNext } from './safeNext'

describe('safeNext', () => {
  it('passes through a normal relative path', () => {
    expect(safeNext('/marmiton', '/')).toBe('/marmiton')
  })

  it('preserves query string and hash', () => {
    expect(safeNext('/marmiton?next=%2Fx#y', '/')).toBe('/marmiton?next=%2Fx#y')
  })

  it('falls back for a value not starting with /', () => {
    expect(safeNext('evil.com', '/')).toBe('/')
  })

  it('falls back for a protocol-relative URL', () => {
    expect(safeNext('//evil.com', '/')).toBe('/')
  })

  it('falls back for a backslash-authority URL', () => {
    expect(safeNext('/\\evil.com', '/')).toBe('/')
    expect(safeNext('/\\/evil.com', '/')).toBe('/')
  })

  it('falls back for a fully-qualified external URL', () => {
    expect(safeNext('https://evil.com', '/')).toBe('/')
  })

  it('falls back for an empty string', () => {
    expect(safeNext('', '/fallback')).toBe('/fallback')
  })
})
