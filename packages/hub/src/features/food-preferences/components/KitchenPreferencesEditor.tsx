import { Check } from '@phosphor-icons/react'
import type { FoodPreferenceProfile } from '../model/types'
import { CUISINE_OPTIONS, EQUIPMENT_OPTIONS, PREPARATION_TIME_OPTIONS } from '../data/options'
import { EQUIPMENT_ICON_SOURCES } from '../data/iconSources'
import { Button, ChipTag } from '@mealz-product-team/design-system'
import { CuisineFlagSelector } from './CuisineFlagSelector'
import { PreferencesCard } from './PreferencesCard'

interface Props { draft: FoodPreferenceProfile; onChange: (draft: FoodPreferenceProfile) => void; onSave: () => void }

export function KitchenPreferencesEditor({ draft, onChange, onSave }: Props) {
  const toggle = (key: 'cuisineIds' | 'equipmentIds', id: string) => {
    const values = draft[key]
    onChange({ ...draft, [key]: values.includes(id) ? values.filter((item) => item !== id) : [...values, id] })
  }
  const flags: Record<string, string> = {
    chinoise: '/food-preferences/flags/china.svg',
    francaise: '/food-preferences/flags/france.svg',
    coreenne: '/food-preferences/flags/south-korea.svg',
    thailandaise: '/food-preferences/flags/thailand.svg',
  }
  const selectionChip = (id: string, label: string, selected: boolean, onClick: () => void, className = 'food-preferences-selection-option') => (
    <span className="food-preferences-selection-chip" key={id}>
      <ChipTag type="neutral-outline" size="L" className={className} label={label} selected={selected} icon={selected ? <Check size={16} weight="bold" /> : undefined} onClick={onClick} />
    </span>
  )
  return (
    <section aria-label="En cuisine" className="food-preferences-editor food-preferences-kitchen-editor">
      <div className="food-preferences-option-group"><h3>Temps pour cuisiner</h3><p className="food-preferences-editor__intro">Temps consacré à la préparation, hors cuisson au four.</p><div className="food-preferences-pill-list">{PREPARATION_TIME_OPTIONS.map((minutes) => selectionChip(`time-${minutes}`, `${minutes} min`, draft.maxPreparationMinutes === minutes, () => onChange({ ...draft, maxPreparationMinutes: draft.maxPreparationMinutes === minutes ? null : minutes }), 'food-preferences-time-option'))}</div></div>
      <div className="food-preferences-option-group"><h3>Cuisines que vous appréciez</h3><div className="food-preferences-cuisine-list">{CUISINE_OPTIONS.map((option) => <CuisineFlagSelector key={option.id} label={option.label} flagSrc={flags[option.id]} selected={draft.cuisineIds.includes(option.id)} onClick={() => toggle('cuisineIds', option.id)} />)}</div></div>
      <div className="food-preferences-option-group"><h3>Équipements</h3><div className="food-preferences-equipment-list">{EQUIPMENT_OPTIONS.map((option) => <PreferencesCard key={option.id} label={option.label} iconSrc={EQUIPMENT_ICON_SOURCES[option.id]} selected={draft.equipmentIds.includes(option.id)} onClick={() => toggle('equipmentIds', option.id)} />)}</div></div>
      <div className="food-preferences-actions"><Button variant="primary" size="M" label="Enregistrer" onClick={onSave} /></div>
    </section>
  )
}
