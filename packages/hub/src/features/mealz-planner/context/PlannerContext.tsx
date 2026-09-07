'use client'

import { createContext, useCallback, useContext, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { NO_RESTRICTION_ID } from '@/features/mealz-planner/data/mock/diets'
import type { WizardState } from '@/features/mealz-planner/data/types/wizard'

export const initialPlannerState: WizardState = { people: 2, meals: 5, equipmentIds: [], dietIds: [] }

type PlannerAction =
  | { type: 'SET_PEOPLE'; value: number }
  | { type: 'SET_MEALS'; value: number }
  | { type: 'TOGGLE_EQUIPMENT'; id: string }
  | { type: 'TOGGLE_DIET'; id: string }
  | { type: 'RESET' }

export function plannerReducer(state: WizardState, action: PlannerAction): WizardState {
  switch (action.type) {
    case 'SET_PEOPLE': return { ...state, people: action.value }
    case 'SET_MEALS': return { ...state, meals: action.value }
    case 'TOGGLE_EQUIPMENT': {
      const has = state.equipmentIds.includes(action.id)
      return { ...state, equipmentIds: has ? state.equipmentIds.filter((id) => id !== action.id) : [...state.equipmentIds, action.id] }
    }
    case 'TOGGLE_DIET': {
      if (action.id === NO_RESTRICTION_ID) return { ...state, dietIds: state.dietIds.includes(NO_RESTRICTION_ID) ? [] : [NO_RESTRICTION_ID] }
      const withoutNoRestriction = state.dietIds.filter((id) => id !== NO_RESTRICTION_ID)
      const has = withoutNoRestriction.includes(action.id)
      return { ...state, dietIds: has ? withoutNoRestriction.filter((id) => id !== action.id) : [...withoutNoRestriction, action.id] }
    }
    case 'RESET': return { ...initialPlannerState, equipmentIds: [], dietIds: [] }
  }
}

interface PlannerContextValue {
  state: WizardState
  basePath: string
  setPeople: (value: number) => void
  applyDefaultPeople: (value: number) => void
  setMeals: (value: number) => void
  toggleEquipment: (id: string) => void
  toggleDiet: (id: string) => void
  reset: () => void
}

const PlannerContext = createContext<PlannerContextValue | undefined>(undefined)

export function PlannerProvider({ children, basePath }: { children: ReactNode; basePath: string }) {
  const [state, dispatch] = useReducer(plannerReducer, initialPlannerState)
  const peopleWasModified = useRef(false)
  const setPeople = useCallback((value: number) => {
    peopleWasModified.current = true
    dispatch({ type: 'SET_PEOPLE', value })
  }, [])
  const applyDefaultPeople = useCallback((value: number) => {
    if (!peopleWasModified.current) dispatch({ type: 'SET_PEOPLE', value })
  }, [])
  const setMeals = useCallback((value: number) => dispatch({ type: 'SET_MEALS', value }), [])
  const toggleEquipment = useCallback((id: string) => dispatch({ type: 'TOGGLE_EQUIPMENT', id }), [])
  const toggleDiet = useCallback((id: string) => dispatch({ type: 'TOGGLE_DIET', id }), [])
  const reset = useCallback(() => {
    peopleWasModified.current = false
    dispatch({ type: 'RESET' })
  }, [])
  const value = useMemo(() => ({
    state, basePath,
    setPeople,
    applyDefaultPeople,
    setMeals,
    toggleEquipment,
    toggleDiet,
    reset,
  }), [state, basePath, setPeople, applyDefaultPeople, setMeals, toggleEquipment, toggleDiet, reset])
  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
}

export function usePlanner() {
  const context = useContext(PlannerContext)
  if (!context) throw new Error('usePlanner must be used within a PlannerProvider')
  return context
}

export const useWizard = usePlanner
