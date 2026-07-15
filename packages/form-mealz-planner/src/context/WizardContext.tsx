'use client'

import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react'
import { NO_RESTRICTION_ID } from '@/data/mock/diets'
import type { WizardState } from '@/data/types/wizard'

const initialState: WizardState = {
  people: 2,
  meals: 5,
  equipmentIds: [],
  dietIds: [],
}

type WizardAction =
  | { type: 'SET_PEOPLE'; value: number }
  | { type: 'SET_MEALS'; value: number }
  | { type: 'TOGGLE_EQUIPMENT'; id: string }
  | { type: 'TOGGLE_DIET'; id: string }
  | { type: 'RESET' }

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_PEOPLE':
      return { ...state, people: action.value }
    case 'SET_MEALS':
      return { ...state, meals: action.value }
    case 'TOGGLE_EQUIPMENT': {
      const has = state.equipmentIds.includes(action.id)
      return {
        ...state,
        equipmentIds: has
          ? state.equipmentIds.filter((id) => id !== action.id)
          : [...state.equipmentIds, action.id],
      }
    }
    case 'TOGGLE_DIET': {
      if (action.id === NO_RESTRICTION_ID) {
        return { ...state, dietIds: state.dietIds.includes(NO_RESTRICTION_ID) ? [] : [NO_RESTRICTION_ID] }
      }
      const withoutNoRestriction = state.dietIds.filter((id) => id !== NO_RESTRICTION_ID)
      const has = withoutNoRestriction.includes(action.id)
      return {
        ...state,
        dietIds: has
          ? withoutNoRestriction.filter((id) => id !== action.id)
          : [...withoutNoRestriction, action.id],
      }
    }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

interface WizardContextValue {
  state: WizardState
  setPeople: (value: number) => void
  setMeals: (value: number) => void
  toggleEquipment: (id: string) => void
  toggleDiet: (id: string) => void
  reset: () => void
}

const WizardContext = createContext<WizardContextValue | undefined>(undefined)

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState)

  const value = useMemo<WizardContextValue>(
    () => ({
      state,
      setPeople: (value) => dispatch({ type: 'SET_PEOPLE', value }),
      setMeals: (value) => dispatch({ type: 'SET_MEALS', value }),
      toggleEquipment: (id) => dispatch({ type: 'TOGGLE_EQUIPMENT', id }),
      toggleDiet: (id) => dispatch({ type: 'TOGGLE_DIET', id }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [state],
  )

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
}

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizard must be used within a WizardProvider')
  return ctx
}
