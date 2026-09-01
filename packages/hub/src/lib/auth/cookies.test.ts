// packages/hub/src/lib/auth/cookies.test.ts
import { describe, expect, it } from 'vitest'
import { MASTER_COOKIE_NAME, clientCookieName, COOKIE_MAX_AGE_SECONDS } from './cookies'

describe('cookie naming', () => {
  it('exposes a fixed master cookie name', () => {
    expect(MASTER_COOKIE_NAME).toBe('hub_master')
  })

  it('scopes a client cookie name to the client id', () => {
    expect(clientCookieName('marmiton')).toBe('hub_client_marmiton')
    expect(clientCookieName('coursesu')).toBe('hub_client_coursesu')
  })

  it('sets a one-year max age', () => {
    expect(COOKIE_MAX_AGE_SECONDS).toBe(60 * 60 * 24 * 365)
  })
})
