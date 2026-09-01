import { afterEach, describe, expect, it, vi } from 'vitest'
import { getRequiredEnvVar } from './env'

describe('getRequiredEnvVar', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns the value when the env var is set', () => {
    vi.stubEnv('HUB_TEST_VAR', 'secret-value')
    expect(getRequiredEnvVar('HUB_TEST_VAR')).toBe('secret-value')
  })

  it('throws a descriptive error when the env var is missing', () => {
    vi.stubEnv('HUB_TEST_VAR', '')
    expect(() => getRequiredEnvVar('HUB_TEST_VAR')).toThrow('Missing required env var: HUB_TEST_VAR')
  })
})
