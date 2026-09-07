import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FoodPreferencesProvider } from '@/features/food-preferences/context/FoodPreferencesContext'
import { FoodPreferencesProfilePage } from './FoodPreferencesProfilePage'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

describe('FoodPreferencesProfilePage', () => {
  it('shows the permanent profile and links back to the catalogue', async () => {
    const user = userEvent.setup()
    render(<FoodPreferencesProvider storage={localStorage}><FoodPreferencesProfilePage /></FoodPreferencesProvider>)
    expect(await screen.findByRole('heading', { name: 'Mes préférences alimentaires' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retour au catalogue' }))
    expect(push).toHaveBeenCalledWith('/neutral/supermarket')
  })

  it('updates the page header to the active section and returns to the profile summary', async () => {
    const user = userEvent.setup()
    render(<FoodPreferencesProvider storage={localStorage}><FoodPreferencesProfilePage /></FoodPreferencesProvider>)
    await user.click((await screen.findAllByRole('link', { name: 'Modifier' }))[0])
    expect(screen.getByRole('heading', { name: 'Régimes et allergies' })).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: 'Retour' })[0])
    expect(screen.getByRole('heading', { name: 'Mes préférences alimentaires' })).toBeInTheDocument()
  })
})
