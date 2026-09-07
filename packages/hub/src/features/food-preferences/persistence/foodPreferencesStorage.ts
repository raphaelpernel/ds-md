import { createDefaultFoodPreferenceProfile } from '../model/defaults'
import type { FoodPreferenceProfile, FoodPreferencesInvitation, RestrictionSelection } from '../model/types'

export const FOOD_PREFERENCES_STORAGE_KEY = 'mealz.hub.neutral.food-preferences.v1'
export const FOOD_PREFERENCES_INVITATION_KEY = 'mealz.hub.neutral.food-preferences-invitation.v1'

const PROFILE_VERSION = 1
const INVITATION_DEPLOYMENT: FoodPreferencesInvitation['deployment'] = '2026-09-profile-v1'

type StoredProfile = { version: typeof PROFILE_VERSION; profile: FoodPreferenceProfile }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isRestrictionSelection(value: unknown): value is RestrictionSelection {
  if (!isRecord(value) || typeof value.status !== 'string') return false
  if (value.status === 'unset' || value.status === 'none') return Object.keys(value).length === 1
  return value.status === 'declared' && isStringArray(value.ids)
}

function isProfile(value: unknown): value is FoodPreferenceProfile {
  if (!isRecord(value)) return false
  return Number.isInteger(value.defaultGuests)
    && (value.defaultGuests as number) > 0
    && isStringArray(value.dietIds)
    && isRestrictionSelection(value.restrictions)
    && isStringArray(value.avoidedIngredientIds)
    && isStringArray(value.cuisineIds)
    && (value.maxPreparationMinutes === null || value.maxPreparationMinutes === 15 || value.maxPreparationMinutes === 20 || value.maxPreparationMinutes === 30)
    && isStringArray(value.equipmentIds)
}

export function loadFoodPreferences(storage: Storage): FoodPreferenceProfile {
  const fallback = createDefaultFoodPreferenceProfile()
  const raw = storage.getItem(FOOD_PREFERENCES_STORAGE_KEY)
  if (!raw) return fallback

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || parsed.version !== PROFILE_VERSION || !isProfile(parsed.profile)) return fallback
    return {
      ...parsed.profile,
      dietIds: [...parsed.profile.dietIds],
      restrictions: parsed.profile.restrictions.status === 'declared'
        ? { status: 'declared', ids: [...parsed.profile.restrictions.ids] }
        : { status: parsed.profile.restrictions.status },
      avoidedIngredientIds: [...parsed.profile.avoidedIngredientIds],
      cuisineIds: [...parsed.profile.cuisineIds],
      equipmentIds: [...parsed.profile.equipmentIds],
    }
  } catch {
    return fallback
  }
}

export function saveFoodPreferences(storage: Storage, profile: FoodPreferenceProfile): void {
  const payload: StoredProfile = {
    version: PROFILE_VERSION,
    profile: {
      ...profile,
      dietIds: [...profile.dietIds],
      restrictions: profile.restrictions.status === 'declared'
        ? { status: 'declared', ids: [...profile.restrictions.ids] }
        : { status: profile.restrictions.status },
      avoidedIngredientIds: [...profile.avoidedIngredientIds],
      cuisineIds: [...profile.cuisineIds],
      equipmentIds: [...profile.equipmentIds],
    },
  }
  storage.setItem(FOOD_PREFERENCES_STORAGE_KEY, JSON.stringify(payload))
}

export function loadFoodPreferencesInvitation(storage: Storage): FoodPreferencesInvitation {
  const fallback: FoodPreferencesInvitation = { deployment: INVITATION_DEPLOYMENT, seen: false }
  const raw = storage.getItem(FOOD_PREFERENCES_INVITATION_KEY)
  if (!raw) return fallback

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || parsed.deployment !== INVITATION_DEPLOYMENT || typeof parsed.seen !== 'boolean') return fallback
    return { deployment: INVITATION_DEPLOYMENT, seen: parsed.seen }
  } catch {
    return fallback
  }
}

export function saveFoodPreferencesInvitation(storage: Storage): void {
  storage.setItem(FOOD_PREFERENCES_INVITATION_KEY, JSON.stringify({ deployment: INVITATION_DEPLOYMENT, seen: true } satisfies FoodPreferencesInvitation))
}
