import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FoodPreferencesProvider } from '@/features/food-preferences/context/FoodPreferencesContext'
import { PlannerProvider } from '@/features/mealz-planner/context/PlannerContext'
import PlannerResultsPage from './Results'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

describe('PlannerResultsPage', () => {
  it('renders the requested meal count while applying explicit profile incompatibilities', async () => {
    const storage = {
      get length() { return 0 }, clear: vi.fn(), getItem: vi.fn(() => JSON.stringify({ version: 1, profile: { defaultGuests: 2, dietIds: ['vegan'], restrictions: { status: 'unset' }, avoidedIngredientIds: [], cuisineIds: [], maxPreparationMinutes: null, equipmentIds: [] } })), key: vi.fn(() => null), removeItem: vi.fn(), setItem: vi.fn(),
    } as unknown as Storage
    render(<PlannerProvider basePath="/neutral/supermarket/planner"><FoodPreferencesProvider storage={storage}><PlannerResultsPage /></FoodPreferencesProvider></PlannerProvider>)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Vos 5 repas de la semaine' })).toBeInTheDocument())
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
    expect(screen.queryByText('Poulet rôti aux herbes')).not.toBeInTheDocument()
  })
})
