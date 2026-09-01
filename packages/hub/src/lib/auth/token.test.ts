// packages/hub/src/lib/auth/token.test.ts
// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { signToken, verifyToken } from './token'

describe('signToken / verifyToken', () => {
  const secret = 'test-secret-do-not-use-in-prod'

  it('verifies a token it just signed', async () => {
    const expiresAt = Date.now() + 60_000
    const token = await signToken('master', expiresAt, secret)
    expect(await verifyToken(token, 'master', secret)).toBe(true)
  })

  it('rejects a token verified against the wrong scope', async () => {
    const expiresAt = Date.now() + 60_000
    const token = await signToken('master', expiresAt, secret)
    expect(await verifyToken(token, 'client:marmiton', secret)).toBe(false)
  })

  it('rejects a token verified with the wrong secret', async () => {
    const expiresAt = Date.now() + 60_000
    const token = await signToken('master', expiresAt, secret)
    expect(await verifyToken(token, 'master', 'a-different-secret')).toBe(false)
  })

  it('rejects an expired token', async () => {
    const expiresAt = Date.now() - 1_000
    const token = await signToken('master', expiresAt, secret)
    expect(await verifyToken(token, 'master', secret)).toBe(false)
  })

  it('rejects a tampered signature', async () => {
    const expiresAt = Date.now() + 60_000
    const token = await signToken('master', expiresAt, secret)
    const [expiresAtPart] = token.split('.')
    const tampered = `${expiresAtPart}.not-a-real-signature`
    expect(await verifyToken(tampered, 'master', secret)).toBe(false)
  })

  it('rejects a malformed token', async () => {
    expect(await verifyToken('not-a-token', 'master', secret)).toBe(false)
  })
})
