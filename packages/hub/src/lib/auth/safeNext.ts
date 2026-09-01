// packages/hub/src/lib/auth/safeNext.ts

/**
 * Validates a redirect target by resolving it against a fixed, invalid-TLD
 * base URL and checking the resolved origin didn't change — the only
 * reliable way to answer "does this resolve off-site", since prefix checks
 * like `startsWith('/') && !startsWith('//')` miss browser URL-parsing
 * quirks (e.g. a leading backslash is treated as `/` in the authority
 * position for http(s) URLs, so "/\evil.com" resolves externally despite
 * passing those checks).
 */
export function safeNext(rawNext: string, fallback: string): string {
  // A value not starting with "/" (including the empty string) can never
  // resolve to a same-origin path — reject it up front. This does not
  // weaken the backslash/protocol-relative defense below: "//evil.com" and
  // "/\evil.com" both still start with "/" and fall through to the
  // origin check, which is what actually catches them.
  if (!rawNext.startsWith('/')) {
    return fallback
  }

  try {
    const url = new URL(rawNext, 'http://hub.invalid')
    if (url.origin !== 'http://hub.invalid') {
      return fallback
    }
    return url.pathname + url.search + url.hash
  } catch {
    return fallback
  }
}
