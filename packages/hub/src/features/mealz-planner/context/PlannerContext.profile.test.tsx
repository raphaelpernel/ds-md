import { renderHook, act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PlannerProvider, usePlanner } from './PlannerContext'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PlannerProvider basePath="/neutral/supermarket/planner">{children}</PlannerProvider>
)

describe('Planner permanent guest default bridge', () => {
  it('applies the permanent default before weekly interaction', () => {
    const { result } = renderHook(() => usePlanner(), { wrapper })
    act(() => result.current.applyDefaultPeople(4))
    expect(result.current.state.people).toBe(4)
  })

  it('preserves a weekly people override until reset', () => {
    const { result } = renderHook(() => usePlanner(), { wrapper })
    act(() => result.current.setPeople(6))
    act(() => result.current.applyDefaultPeople(4))
    expect(result.current.state.people).toBe(6)
    act(() => result.current.reset())
    act(() => result.current.applyDefaultPeople(4))
    expect(result.current.state.people).toBe(4)
  })
})
