import { describe, expect, it } from 'vitest'
import { createDefaultFoodPreferenceProfile } from '../model/defaults'
import {
  FOOD_PREFERENCES_INVITATION_KEY,
  FOOD_PREFERENCES_STORAGE_KEY,
  loadFoodPreferences,
  loadFoodPreferencesInvitation,
  saveFoodPreferences,
  saveFoodPreferencesInvitation,
} from './foodPreferencesStorage'

function createStorage(initial: Record<string, string> = {}): Storage {
  const values = new Map(Object.entries(initial))
  return {
    get length() { return values.size },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => { values.set(key, value) },
  }
}

describe('food preferences storage', () => {
  it('round-trips the three restriction states without conflating them', () => {
    const storage = createStorage()
    const profile = createDefaultFoodPreferenceProfile()

    expect(profile.restrictions).toEqual({ status: 'unset' })
    saveFoodPreferences(storage, { ...profile, restrictions: { status: 'none' } })
    expect(loadFoodPreferences(storage).restrictions).toEqual({ status: 'none' })
    saveFoodPreferences(storage, { ...profile, restrictions: { status: 'declared', ids: ['peanuts'] } })
    expect(loadFoodPreferences(storage).restrictions).toEqual({ status: 'declared', ids: ['peanuts'] })
  })

  it('round-trips a profile and keeps invitation state in a separate key', () => {
    const storage = createStorage()
    const profile = { ...createDefaultFoodPreferenceProfile(), defaultGuests: 4, avoidedIngredientIds: ['mushrooms'] }

    saveFoodPreferences(storage, profile)
    saveFoodPreferencesInvitation(storage)

    expect(loadFoodPreferences(storage)).toEqual(profile)
    expect(loadFoodPreferencesInvitation(storage)).toEqual({ deployment: '2026-09-profile-v1', seen: true })
    expect(storage.getItem(FOOD_PREFERENCES_STORAGE_KEY)).not.toBe(storage.getItem(FOOD_PREFERENCES_INVITATION_KEY))
  })

  it('falls back to defaults for absent, malformed, and unknown-version data', () => {
    const defaultProfile = createDefaultFoodPreferenceProfile()
    const storage = createStorage({
      [FOOD_PREFERENCES_STORAGE_KEY]: '{not-json',
    })
    expect(loadFoodPreferences(storage)).toEqual(defaultProfile)

    storage.setItem(FOOD_PREFERENCES_STORAGE_KEY, JSON.stringify({ version: 99, profile: { defaultGuests: 9 } }))
    expect(loadFoodPreferences(storage)).toEqual(defaultProfile)
  })

  it('does not treat an empty declared list as an explicit absence declaration', () => {
    const storage = createStorage({
      [FOOD_PREFERENCES_STORAGE_KEY]: JSON.stringify({
        version: 1,
        profile: { ...createDefaultFoodPreferenceProfile(), restrictions: { status: 'declared', ids: [] } },
      }),
    })
    expect(loadFoodPreferences(storage).restrictions).toEqual({ status: 'declared', ids: [] })
  })

  it('ignores malformed invitation data without changing the profile key', () => {
    const storage = createStorage({
      [FOOD_PREFERENCES_INVITATION_KEY]: JSON.stringify({ version: 99, seen: true }),
    })
    expect(loadFoodPreferencesInvitation(storage)).toEqual({ deployment: '2026-09-profile-v1', seen: false })
    expect(storage.getItem(FOOD_PREFERENCES_STORAGE_KEY)).toBeNull()
  })
})
