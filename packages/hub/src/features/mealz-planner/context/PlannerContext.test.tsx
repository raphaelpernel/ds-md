'use client'

import { renderHook, act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NO_RESTRICTION_ID } from '@/features/mealz-planner/data/mock/diets'
import { PlannerProvider, usePlanner } from './PlannerContext'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PlannerProvider basePath="/neutral/form-mealz-planner">{children}</PlannerProvider>
)

describe('PlannerContext', () => {
  it('exposes the initial state and configured base path', () => {
    const { result } = renderHook(() => usePlanner(), { wrapper })
    expect(result.current.state).toEqual({ people: 2, meals: 5, equipmentIds: [], dietIds: [] })
    expect(result.current.basePath).toBe('/neutral/form-mealz-planner')
  })

  it('supports all planner transitions', () => {
    const { result } = renderHook(() => usePlanner(), { wrapper })
    act(() => {
      result.current.setPeople(4)
      result.current.setMeals(7)
      result.current.toggleEquipment('four')
      result.current.toggleDiet('vegetarien')
    })
    expect(result.current.state).toEqual({ people: 4, meals: 7, equipmentIds: ['four'], dietIds: ['vegetarien'] })
    act(() => {
      result.current.toggleEquipment('four')
      result.current.toggleDiet('vegetarien')
    })
    expect(result.current.state.equipmentIds).toEqual([])
    expect(result.current.state.dietIds).toEqual([])
  })

  it('keeps aucune restriction mutually exclusive with other diets', () => {
    const { result } = renderHook(() => usePlanner(), { wrapper })
    act(() => result.current.toggleDiet('vegetarien'))
    act(() => result.current.toggleDiet(NO_RESTRICTION_ID))
    expect(result.current.state.dietIds).toEqual([NO_RESTRICTION_ID])
    act(() => result.current.toggleDiet('vegan'))
    expect(result.current.state.dietIds).toEqual(['vegan'])
    act(() => result.current.toggleDiet(NO_RESTRICTION_ID))
    expect(result.current.state.dietIds).toEqual([NO_RESTRICTION_ID])
  })

  it('resets state through the provider', () => {
    const { result } = renderHook(() => usePlanner(), { wrapper })
    act(() => {
      result.current.setPeople(8)
      result.current.toggleEquipment('robot')
      result.current.reset()
    })
    expect(result.current.state).toEqual({ people: 2, meals: 5, equipmentIds: [], dietIds: [] })
  })
})
