import { describe, expect, it } from 'vitest'
import { CLIENT_NAMESPACES, findClientNamespace, NEUTRAL_BRAND, MASTER_PASSWORD_ENV_VAR } from './namespaces'

describe('CLIENT_NAMESPACES', () => {
  it('excludes the neutral brand', () => {
    expect(CLIENT_NAMESPACES.some((namespace) => namespace.id === 'neutral')).toBe(false)
  })

  it('includes marmiton with the right password env var', () => {
    const marmiton = CLIENT_NAMESPACES.find((namespace) => namespace.id === 'marmiton')
    expect(marmiton).toMatchObject({
      id: 'marmiton',
      brand: 'marmiton',
      passwordEnvVar: 'HUB_PASSWORD_MARMITON',
    })
  })

  it('includes coursesu with the right password env var', () => {
    const coursesu = CLIENT_NAMESPACES.find((namespace) => namespace.id === 'coursesu')
    expect(coursesu).toMatchObject({
      id: 'coursesu',
      brand: 'coursesu',
      passwordEnvVar: 'HUB_PASSWORD_COURSESU',
    })
  })
})

describe('findClientNamespace', () => {
  it('finds a known client by id', () => {
    expect(findClientNamespace('marmiton')?.id).toBe('marmiton')
  })

  it('returns undefined for neutral', () => {
    expect(findClientNamespace('neutral')).toBeUndefined()
  })

  it('returns undefined for an unknown id', () => {
    expect(findClientNamespace('unknown-client')).toBeUndefined()
  })
})

describe('constants', () => {
  it('exposes the neutral brand value and the master password env var name', () => {
    expect(NEUTRAL_BRAND).toBe('neutral')
    expect(MASTER_PASSWORD_ENV_VAR).toBe('HUB_PASSWORD_MASTER')
  })
})
