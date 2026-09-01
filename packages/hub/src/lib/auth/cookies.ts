// packages/hub/src/lib/auth/cookies.ts
export const MASTER_COOKIE_NAME = 'hub_master'

export function clientCookieName(clientId: string): string {
  return `hub_client_${clientId}`
}

export const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365
