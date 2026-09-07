import type { FoodPreferenceProfile, RestrictionSelection } from '../model/types'
import { DIET_OPTIONS, RESTRICTION_OPTIONS } from '../data/options'
import { DIET_ICON_SOURCES } from '../data/iconSources'
import { Check } from '@phosphor-icons/react'
import { Alert, Button, ChipTag } from '@mealz-product-team/design-system'
import { PreferencesCard } from './PreferencesCard'

interface Props {
  draft: FoodPreferenceProfile
  onChange: (draft: FoodPreferenceProfile) => void
  onSave: () => void
}

export function RestrictionsEditor({ draft, onChange, onSave }: Props) {
  const restrictions = draft.restrictions.status === 'declared' ? draft.restrictions.ids : []
  const toggleRestriction = (id: string) => {
    const ids = restrictions.includes(id) ? restrictions.filter((item) => item !== id) : [...restrictions, id]
    const next: RestrictionSelection = ids.length ? { status: 'declared', ids } : { status: 'declared', ids: [] }
    onChange({ ...draft, restrictions: next })
  }
  const toggleDiet = (id: string) => onChange({ ...draft, dietIds: draft.dietIds.includes(id) ? draft.dietIds.filter((item) => item !== id) : [...draft.dietIds, id] })
  const selectionChip = (id: string, label: string, selected: boolean, onClick: () => void) => (
    <span className="food-preferences-selection-chip" key={id}>
      <ChipTag type="neutral-outline" size="L" className="food-preferences-selection-option" label={label} selected={selected} icon={selected ? <Check size={16} weight="bold" /> : undefined} onClick={onClick} />
    </span>
  )
  return (
    <section aria-label="Régimes et allergies" className="food-preferences-editor food-preferences-restrictions-editor">
      <p className="food-preferences-editor__intro">Ces informations personnalisent vos suggestions et votre Planner. Une recette n’est écartée que si son incompatibilité est identifiée de façon fiable. Vous pouvez toujours consulter le catalogue. Vérifiez systématiquement les étiquettes.</p>
      <div className="food-preferences-option-group"><h3>Régimes</h3><div className="food-preferences-selection-list">{DIET_OPTIONS.map((option) => <PreferencesCard key={option.id} label={option.label} iconSrc={DIET_ICON_SOURCES[option.id]} selected={draft.dietIds.includes(option.id)} onClick={() => toggleDiet(option.id)} />)}</div></div>
      <div className="food-preferences-option-group"><h3>Allergies ou restrictions</h3>
        <div className="food-preferences-selection-list">
          {draft.restrictions.status !== 'declared' && selectionChip('no-restriction', 'Aucune allergie ou restriction à signaler', draft.restrictions.status === 'none', () => onChange({ ...draft, restrictions: draft.restrictions.status === 'none' ? { status: 'unset' } : { status: 'none' } }))}
          {RESTRICTION_OPTIONS.filter((option) => option.id !== 'gluten' || restrictions.includes('gluten')).map((option) => selectionChip(option.id, option.label, restrictions.includes(option.id), () => toggleRestriction(option.id)))}
        </div>
      </div>
      <Alert variant="warning" title="Important">Ces informations personnalisent vos suggestions et votre Planner. Une recette n’est écartée que si son incompatibilité est identifiée de façon fiable. Vous pouvez toujours consulter le catalogue. Vérifiez systématiquement les étiquettes.</Alert>
      <div className="food-preferences-actions"><Button variant="primary" size="M" label="Enregistrer" onClick={onSave} /></div>
    </section>
  )
}
