// packages/hub/src/lib/auth/token.ts
import { constantTimeEqual } from './compare'

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
}

function toBase64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Signs `${scope}.${expiresAt}` with HMAC-SHA256 and returns
 * `${expiresAt}.${signature}` — the full string is the cookie value.
 * `scope` binds the signature to one namespace (e.g. "master" or
 * "client:marmiton") so a token can't be replayed under a different
 * cookie name.
 */
export async function signToken(scope: string, expiresAt: number, secret: string): Promise<string> {
  const key = await getHmacKey(secret)
  const encoder = new TextEncoder()
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`${scope}.${expiresAt}`))
  return `${expiresAt}.${toBase64Url(signature)}`
}

export async function verifyToken(
  token: string,
  scope: string,
  secret: string,
  now: number = Date.now()
): Promise<boolean> {
  const parts = token.split('.')
  if (parts.length !== 2) {
    return false
  }
  const [expiresAtRaw, signature] = parts
  const expiresAt = Number(expiresAtRaw)
  if (!Number.isFinite(expiresAt) || now > expiresAt) {
    return false
  }
  const expected = await signToken(scope, expiresAt, secret)
  const [, expectedSignature] = expected.split('.')
  return constantTimeEqual(signature, expectedSignature)
}
