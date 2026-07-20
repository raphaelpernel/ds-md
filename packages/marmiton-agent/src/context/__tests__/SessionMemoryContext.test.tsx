import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionMemoryProvider, useSessionMemory } from '../SessionMemoryContext'

function Harness() {
  const memory = useSessionMemory()
  return (
    <div>
      <button onClick={() => memory.mergeConstraints([{ tag: 'enfants', label: 'adapté aux enfants' }], 20)}>merge</button>
      <button onClick={() => memory.mergeConstraints([{ tag: 'enfants', label: 'adapté aux enfants' }], 10)}>merge-stricter</button>
      <button onClick={() => memory.removeConstraint('enfants')}>remove</button>
      <button onClick={() => memory.addIngredientAnswer({ ingredientId: 'r1:ing-3', ingredientQuery: 'crème', suggestion: 'eau de cuisson' })}>
        add-answer
      </button>
      <div data-testid="constraints">{memory.constraints.map((c) => c.tag).join(',')}</div>
      <div data-testid="duration">{String(memory.maxDuration)}</div>
      <div data-testid="answers">{memory.ingredientAnswers.map((a) => a.ingredientId).join(',')}</div>
      <div data-testid="empty">{String(memory.isEmpty)}</div>
    </div>
  )
}

describe('SessionMemoryContext', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('démarre vide', async () => {
    render(
      <SessionMemoryProvider>
        <Harness />
      </SessionMemoryProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('empty').textContent).toBe('true'))
  })

  it('fusionne les contraintes et garde la durée la plus stricte entre deux fusions', async () => {
    const user = userEvent.setup()
    render(
      <SessionMemoryProvider>
        <Harness />
      </SessionMemoryProvider>,
    )

    await user.click(screen.getByText('merge'))
    expect(screen.getByTestId('duration').textContent).toBe('20')

    await user.click(screen.getByText('merge-stricter'))
    expect(screen.getByTestId('constraints').textContent).toBe('enfants')
    expect(screen.getByTestId('duration').textContent).toBe('10')
  })

  it('persiste en localStorage et recharge à l’initialisation d’un nouveau provider (survit à un refresh)', async () => {
    const user = userEvent.setup()
    const { unmount } = render(
      <SessionMemoryProvider>
        <Harness />
      </SessionMemoryProvider>,
    )
    await user.click(screen.getByText('merge'))
    await waitFor(() => expect(window.localStorage.getItem('marmiton-agent-memory')).toContain('enfants'))
    unmount()

    render(
      <SessionMemoryProvider>
        <Harness />
      </SessionMemoryProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('constraints').textContent).toBe('enfants'))
  })

  it('stocke les réponses d’ingrédient avec un id composite recette+ingrédient (pas l’id brut seul)', async () => {
    const user = userEvent.setup()
    render(
      <SessionMemoryProvider>
        <Harness />
      </SessionMemoryProvider>,
    )
    await user.click(screen.getByText('add-answer'))
    expect(screen.getByTestId('answers').textContent).toBe('r1:ing-3')
  })
})
