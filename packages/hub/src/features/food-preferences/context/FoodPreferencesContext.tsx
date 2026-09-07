'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createDefaultFoodPreferenceProfile } from '../model/defaults'
import type { EditablePreferenceSection, FoodPreferenceProfile } from '../model/types'
import {
  loadFoodPreferences,
  loadFoodPreferencesInvitation,
  saveFoodPreferences,
  saveFoodPreferencesInvitation,
} from '../persistence/foodPreferencesStorage'

interface FoodPreferencesContextValue {
  profile: FoodPreferenceProfile
  hydrated: boolean
  invitationSeen: boolean
  drawerOpen: boolean
  drawerTrigger: HTMLElement | null
  openDrawer: (trigger?: HTMLElement | null) => void
  closeDrawer: () => void
  saveGuests: (value: number) => void
  saveSection: (section: EditablePreferenceSection, draft: FoodPreferenceProfile) => void
  markInvitationSeen: () => void
}

const FoodPreferencesContext = createContext<FoodPreferencesContextValue | undefined>(undefined)

export function FoodPreferencesProvider({ children, storage }: { children: ReactNode; storage?: Storage }) {
  const [profile, setProfile] = useState(createDefaultFoodPreferenceProfile)
  const [hydrated, setHydrated] = useState(false)
  const [invitationSeen, setInvitationSeen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTrigger, setDrawerTrigger] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const adapter = storage ?? window.localStorage
    setProfile(loadFoodPreferences(adapter))
    setInvitationSeen(loadFoodPreferencesInvitation(adapter).seen)
    setHydrated(true)
  }, [storage])

  const openDrawer = useCallback((trigger?: HTMLElement | null) => {
    setDrawerTrigger(trigger ?? null)
    setDrawerOpen(true)
  }, [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const saveGuests = useCallback((value: number) => {
    setProfile((current) => {
      const next = { ...current, defaultGuests: value }
      saveFoodPreferences(storage ?? window.localStorage, next)
      return next
    })
  }, [storage])
  const saveSection = useCallback((_section: EditablePreferenceSection, draft: FoodPreferenceProfile) => {
    saveFoodPreferences(storage ?? window.localStorage, draft)
    setProfile({ ...draft })
  }, [storage])
  const markInvitationSeen = useCallback(() => {
    saveFoodPreferencesInvitation(storage ?? window.localStorage)
    setInvitationSeen(true)
  }, [storage])

  const value = useMemo(() => ({
    profile,
    hydrated,
    invitationSeen,
    drawerOpen,
    drawerTrigger,
    openDrawer,
    closeDrawer,
    saveGuests,
    saveSection,
    markInvitationSeen,
  }), [profile, hydrated, invitationSeen, drawerOpen, drawerTrigger, openDrawer, closeDrawer, saveGuests, saveSection, markInvitationSeen])

  return <FoodPreferencesContext.Provider value={value}>{children}</FoodPreferencesContext.Provider>
}

export function useFoodPreferences() {
  const context = useContext(FoodPreferencesContext)
  if (!context) throw new Error('useFoodPreferences must be used within a FoodPreferencesProvider')
  return context
}

export function useOptionalFoodPreferences() {
  return useContext(FoodPreferencesContext)
}
