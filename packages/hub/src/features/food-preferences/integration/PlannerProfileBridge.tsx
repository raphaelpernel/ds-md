'use client'

import { useEffect } from 'react'
import { useFoodPreferences } from '../context/FoodPreferencesContext'
import { usePlanner } from '@/features/mealz-planner/context/PlannerContext'

export function PlannerProfileBridge() {
  const { profile, hydrated } = useFoodPreferences()
  const { applyDefaultPeople } = usePlanner()
  useEffect(() => {
    if (hydrated) applyDefaultPeople(profile.defaultGuests)
  }, [hydrated, profile.defaultGuests, applyDefaultPeople])
  return null
}
