import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createDefaultFoodPreferenceProfile } from '../model/defaults'
import { FoodPreferencesSummary } from './FoodPreferencesSummary'
import { RestrictionsEditor } from './RestrictionsEditor'
import { AvoidedIngredientsEditor } from './AvoidedIngredientsEditor'
import { KitchenPreferencesEditor } from './KitchenPreferencesEditor'

const profile = createDefaultFoodPreferenceProfile()

describe('food preference views', () => {
  it('keeps the summary silent for unset restrictions and exposes edit actions', () => {
    const { container } = render(<FoodPreferencesSummary profile={profile} onEdit={vi.fn()} onSaveGuests={vi.fn()} />)
    expect(screen.queryByText('Non renseigné')).not.toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Modifier' })).toHaveLength(3)
    expect(container.querySelectorAll('.food-preferences-card__header .link')).toHaveLength(3)
  })

  it('renders selected values as summary chip tags', () => {
    const filledProfile = {
      ...profile,
      dietIds: ['vegetarien'],
      restrictions: { status: 'declared' as const, ids: ['arachides'] },
      avoidedIngredientIds: ['champignons', 'coriandre'],
      cuisineIds: ['francaise', 'coreenne'],
      maxPreparationMinutes: 30 as const,
      equipmentIds: ['four', 'plaques'],
    }
    const { container } = render(<FoodPreferencesSummary profile={filledProfile} onEdit={vi.fn()} onSaveGuests={vi.fn()} />)
    expect(screen.getByText('Végétarien')).toBeInTheDocument()
    expect(screen.getByText('Arachide')).toBeInTheDocument()
    expect(screen.getByText('Champignons')).toBeInTheDocument()
    expect(screen.getByText('Coriandre')).toBeInTheDocument()
    expect(screen.getByText('30 min ou moins')).toBeInTheDocument()
    expect(screen.getByText('Française')).toBeInTheDocument()
    expect(screen.getByText('Coréenne')).toBeInTheDocument()
    expect(screen.getByText('Four')).toBeInTheDocument()
    expect(screen.getByText('Plaques de cuisson')).toBeInTheDocument()
    expect(container.querySelectorAll('.food-preferences-summary__tags')).toHaveLength(3)
  })

  it('keeps complex changes local until save and enforces restriction exclusivity', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    const onChange = vi.fn()
    const { container } = render(<RestrictionsEditor draft={profile} onChange={onChange} onSave={onSave} />)
    expect(container.querySelectorAll('fieldset')).toHaveLength(0)
    await user.click(screen.getByRole('button', { name: 'Aucune allergie ou restriction à signaler' }))
    expect(onSave).not.toHaveBeenCalled()
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ restrictions: { status: 'none' } }))
  })

  it('uses neutral copy without client-specific brand claims', () => {
    const { container } = render(<RestrictionsEditor draft={profile} onChange={vi.fn()} onSave={vi.fn()} />)
    expect(container.textContent).toContain('Vérifiez systématiquement les étiquettes.')
    expect(container.textContent).not.toMatch(/CoursesU|Carrefour/)
  })

  it('gives every cuisine control a visible label and selected state', () => {
    const draft = { ...profile, cuisineIds: ['francaise'] }
    const { container } = render(<KitchenPreferencesEditor draft={draft} onChange={vi.fn()} onSave={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Française' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Chinoise' })).toHaveAttribute('aria-pressed', 'false')
    expect(container.querySelector('.food-preferences-cuisine-selector')).toBeInTheDocument()
    expect(container.querySelector('.food-preferences-cuisine-selector .chip-tag')).not.toBeInTheDocument()
    expect(container.querySelector('.food-preferences-cuisine-selector__check')).toBeInTheDocument()
  })

  it('uses PreferencesCard for diets and equipment while keeping allergy chips', async () => {
    const user = userEvent.setup()
    let restrictionsDraft = profile
    const restrictionChange = vi.fn((next) => {
      restrictionsDraft = next
      rendered.rerender(<RestrictionsEditor draft={restrictionsDraft} onChange={restrictionChange} onSave={vi.fn()} />)
    })
    const rendered = render(<RestrictionsEditor draft={restrictionsDraft} onChange={restrictionChange} onSave={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Végétarien' }))
    expect(restrictionChange).toHaveBeenCalledWith(expect.objectContaining({ dietIds: ['vegetarien'] }))
    expect(screen.getByRole('button', { name: 'Végétarien' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Végétarien' })).toHaveAttribute('data-state', 'selected')
    expect(rendered.container.querySelector('.food-preferences-option-card .chip-tag')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Aucune allergie ou restriction à signaler' })).toHaveClass('food-preferences-selection-option')
    rendered.unmount()

    let kitchenDraft = profile
    const equipmentChange = vi.fn((next) => {
      kitchenDraft = next
      kitchenRendered.rerender(<KitchenPreferencesEditor draft={kitchenDraft} onChange={equipmentChange} onSave={vi.fn()} />)
    })
    const kitchenRendered = render(<KitchenPreferencesEditor draft={kitchenDraft} onChange={equipmentChange} onSave={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Four' }))
    expect(equipmentChange).toHaveBeenCalledWith(expect.objectContaining({ equipmentIds: ['four'] }))
    expect(screen.getByRole('button', { name: 'Four' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Four' })).toHaveAttribute('data-state', 'selected')
    expect(kitchenRendered.container.querySelector('.food-preferences-option-card .chip-tag')).not.toBeInTheDocument()
  })

  it('starts ingredient autocomplete at three characters and adds a suggestion', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<AvoidedIngredientsEditor draft={profile} onChange={onChange} onSave={vi.fn()} />)

    const search = screen.getByRole('searchbox', { name: 'Rechercher un ingrédient' })
    await user.type(search, 'ca')
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
    expect(screen.queryByDisplayValue('ca')).toHaveAttribute('type', 'text')
    await user.type(search, 'f')
    expect(screen.getByRole('option', { name: 'Café' })).toBeInTheDocument()
    await user.click(screen.getByRole('option', { name: 'Café' }))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ avoidedIngredientIds: ['cafe'] }))
  })
})
