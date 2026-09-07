import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FoodPreferencesProvider } from '@/features/food-preferences/context/FoodPreferencesContext'
import { PlannerProvider, usePlanner } from '@/features/mealz-planner/context/PlannerContext'
import { PlannerProfileBridge } from './PlannerProfileBridge'

function createStorage(): Storage {
  const profile = JSON.stringify({ version: 1, profile: { defaultGuests: 4, dietIds: [], restrictions: { status: 'unset' }, avoidedIngredientIds: [], cuisineIds: [], maxPreparationMinutes: null, equipmentIds: [] } })
  return {
    get length() { return 1 }, clear: () => undefined, getItem: () => profile, key: () => null,
    removeItem: () => undefined, setItem: () => undefined,
  }
}

function PeopleValue() {
  const { state } = usePlanner()
  return <output aria-label="people">{state.people}</output>
}

describe('PlannerProfileBridge', () => {
  it('applies the permanent default once without causing an update loop', async () => {
    render(
      <PlannerProvider basePath="/neutral/supermarket/planner">
        <FoodPreferencesProvider storage={createStorage()}>
          <PlannerProfileBridge />
          <PeopleValue />
        </FoodPreferencesProvider>
      </PlannerProvider>,
    )

    await waitFor(() => expect(screen.getByLabelText('people')).toHaveTextContent('4'))
  })
})
