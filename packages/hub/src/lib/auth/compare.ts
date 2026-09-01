/**
 * Best-effort constant-time string comparison — iterates over the full
 * max length regardless of where a mismatch occurs, so total execution
 * time doesn't leak how many leading characters matched. Not a
 * cryptographic primitive; sufficient for comparing short passwords/
 * signatures in this internal tool.
 */
export function constantTimeEqual(a: string, b: string): boolean {
  const maxLength = Math.max(a.length, b.length)
  let mismatch = a.length === b.length ? 0 : 1
  for (let i = 0; i < maxLength; i++) {
    const charA = a.charCodeAt(i) || 0
    const charB = b.charCodeAt(i) || 0
    mismatch |= charA ^ charB
  }
  return mismatch === 0
}
