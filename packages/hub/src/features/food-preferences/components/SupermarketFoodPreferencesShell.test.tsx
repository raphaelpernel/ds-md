import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FoodPreferencesProvider, useFoodPreferences } from '../context/FoodPreferencesContext'
import { SupermarketFoodPreferencesShell } from './SupermarketFoodPreferencesShell'

vi.mock('next/navigation', () => ({ usePathname: () => '/neutral/supermarket' }))

function createStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() { return values.size }, clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null, key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key), setItem: (key, value) => { values.set(key, value) },
  }
}

function PreferencesTrigger() {
  const { openDrawer } = useFoodPreferences()
  return <button type="button" aria-label="Préférences" onClick={(event) => openDrawer(event.currentTarget)}>Ouvrir les préférences</button>
}

function markInvitationSeen(storage: Storage) {
  storage.setItem('mealz.hub.neutral.food-preferences-invitation.v1', JSON.stringify({ deployment: '2026-09-profile-v1', seen: true }))
}

describe('SupermarketFoodPreferencesShell', () => {
  it('offers one non-blocking invitation and persists Plus tard', async () => {
    const user = userEvent.setup()
    const storage = createStorage()
    render(<FoodPreferencesProvider storage={storage}><SupermarketFoodPreferencesShell /></FoodPreferencesProvider>)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Personnalisez vos suggestions' })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Je le ferai plus tard' }))
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Personnalisez vos suggestions' })).not.toBeInTheDocument())
    expect(storage.getItem('mealz.hub.neutral.food-preferences-invitation.v1')).toContain('seen')
  })

  it('opens the summary drawer from the invitation primary action', async () => {
    const user = userEvent.setup()
    render(<FoodPreferencesProvider storage={createStorage()}><SupermarketFoodPreferencesShell /></FoodPreferencesProvider>)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Personnalisez vos suggestions' })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Personnaliser mon profil' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Mes préférences' })).toBeInTheDocument())
    expect(screen.getByText('Régimes et allergies')).toBeInTheDocument()
  })

  it('focuses the drawer on open and restores the explicit trigger after Escape', async () => {
    const user = userEvent.setup()
    const storage = createStorage()
    markInvitationSeen(storage)
    render(<FoodPreferencesProvider storage={storage}><PreferencesTrigger /><SupermarketFoodPreferencesShell /></FoodPreferencesProvider>)

    const trigger = screen.getByRole('button', { name: 'Préférences' })
    await user.click(trigger)
    await waitFor(() => expect(document.querySelector('.drawer--open')).toBeInTheDocument())
    expect(document.activeElement).toHaveAttribute('aria-label', 'Fermer')

    await user.keyboard('{Escape}')
    await waitFor(() => expect(document.querySelector('.drawer--open')).not.toBeInTheDocument())
    expect(document.activeElement).toBe(trigger)
  })

  it('keeps the external trigger when opening a section from the summary', async () => {
    const user = userEvent.setup()
    const storage = createStorage()
    markInvitationSeen(storage)
    render(<FoodPreferencesProvider storage={storage}><PreferencesTrigger /><SupermarketFoodPreferencesShell /></FoodPreferencesProvider>)

    const trigger = screen.getByRole('button', { name: 'Préférences' })
    await user.click(trigger)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Mes préférences' })).toBeInTheDocument())
    await user.click(screen.getAllByRole('link', { name: 'Modifier' })[0])
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Régimes et allergies' })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Fermer' }))
    await waitFor(() => expect(document.querySelector('.drawer--open')).not.toBeInTheDocument())
    expect(document.activeElement).toBe(trigger)
  })

  it('restores the Preferences CTA after closing the automatic invitation flow', async () => {
    const user = userEvent.setup()
    const storage = createStorage()
    render(<FoodPreferencesProvider storage={storage}><PreferencesTrigger /><SupermarketFoodPreferencesShell /></FoodPreferencesProvider>)

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Personnalisez vos suggestions' })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Personnaliser mon profil' }))
    await waitFor(() => expect(document.querySelector('.drawer--open')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Fermer' }))
    await waitFor(() => expect(document.querySelector('.drawer--open')).not.toBeInTheDocument())
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Préférences' }))
  })

  it('abandons a draft on Retour and shows the confirmation Toast after saving', async () => {
    const user = userEvent.setup()
    const storage = createStorage()
    markInvitationSeen(storage)
    render(<FoodPreferencesProvider storage={storage}><PreferencesTrigger /><SupermarketFoodPreferencesShell /></FoodPreferencesProvider>)

    await user.click(screen.getByRole('button', { name: 'Préférences' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Mes préférences' })).toBeInTheDocument())
    await user.click(screen.getAllByRole('link', { name: 'Modifier' })[0])
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Régimes et allergies' })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Végétarien' }))
    await user.click(screen.getByRole('button', { name: 'Retour' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Mes préférences' })).toBeInTheDocument())

    await user.click(screen.getAllByRole('link', { name: 'Modifier' })[0])
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Régimes et allergies' })).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Végétarien' })).toHaveAttribute('aria-pressed', 'false')
    await user.click(screen.getByRole('button', { name: 'Retour' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Mes préférences' })).toBeInTheDocument())

    await user.click(screen.getAllByRole('link', { name: 'Modifier' })[2])
    await waitFor(() => expect(screen.getByRole('heading', { name: 'En cuisine' })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Four' }))
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))
    await waitFor(() => expect(screen.getByText('Préférences enregistrées. Vos prochaines suggestions en tiendront compte.')).toBeInTheDocument())
  })
})
