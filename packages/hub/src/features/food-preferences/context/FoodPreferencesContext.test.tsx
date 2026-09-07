import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { FOOD_PREFERENCES_STORAGE_KEY } from '../persistence/foodPreferencesStorage'
import { createDefaultFoodPreferenceProfile } from '../model/defaults'
import { FoodPreferencesProvider, useFoodPreferences } from './FoodPreferencesContext'

function createStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() { return values.size },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => { values.set(key, value) },
  }
}

describe('FoodPreferencesProvider', () => {
  it('hydrates, saves guests immediately, and keeps invitation persistence separate', async () => {
    const storage = createStorage()
    const wrapper = ({ children }: { children: ReactNode }) => <FoodPreferencesProvider storage={storage}>{children}</FoodPreferencesProvider>
    const { result } = renderHook(() => useFoodPreferences(), { wrapper })

    await waitFor(() => expect(result.current.hydrated).toBe(true))
    expect(result.current.profile).toEqual(createDefaultFoodPreferenceProfile())
    act(() => result.current.saveGuests(4))
    expect(result.current.profile.defaultGuests).toBe(4)
    act(() => result.current.markInvitationSeen())
    expect(result.current.invitationSeen).toBe(true)
    expect(storage.getItem(FOOD_PREFERENCES_STORAGE_KEY)).toContain('defaultGuests')
  })

  it('saves sections atomically and controls drawer state', async () => {
    const storage = createStorage()
    const wrapper = ({ children }: { children: ReactNode }) => <FoodPreferencesProvider storage={storage}>{children}</FoodPreferencesProvider>
    const { result } = renderHook(() => useFoodPreferences(), { wrapper })
    await waitFor(() => expect(result.current.hydrated).toBe(true))

    const trigger = document.createElement('button')
    act(() => result.current.openDrawer(trigger))
    expect(result.current.drawerOpen).toBe(true)
    expect(result.current.drawerTrigger).toBe(trigger)
    act(() => result.current.saveSection('kitchen', { ...result.current.profile, cuisineIds: ['italienne'] }))
    expect(result.current.profile.cuisineIds).toEqual(['italienne'])
    act(() => result.current.closeDrawer())
    expect(result.current.drawerOpen).toBe(false)
  })
})
