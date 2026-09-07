import { useMemo, useState } from 'react'
import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { Button, ChipTag, InputField } from '@mealz-product-team/design-system'
import type { FoodPreferenceProfile } from '../model/types'
import { AVOIDED_INGREDIENT_OPTIONS } from '../data/options'

interface Props { draft: FoodPreferenceProfile; onChange: (draft: FoodPreferenceProfile) => void; onSave: () => void }

export function AvoidedIngredientsEditor({ draft, onChange, onSave }: Props) {
  const [query, setQuery] = useState('')
  const normalized = query.trim().toLocaleLowerCase()
  const selectedOptions = useMemo(() => AVOIDED_INGREDIENT_OPTIONS.filter((option) => draft.avoidedIngredientIds.includes(option.id)), [draft.avoidedIngredientIds])
  const options = useMemo(() => {
    if (normalized.length < 3) return []
    return AVOIDED_INGREDIENT_OPTIONS.filter((option) => !draft.avoidedIngredientIds.includes(option.id))
      .filter((option) => [option.label, ...(option.aliases ?? [])].some((value) => value.toLocaleLowerCase().includes(normalized)))
  }, [draft.avoidedIngredientIds, normalized])
  const toggle = (id: string) => onChange({ ...draft, avoidedIngredientIds: draft.avoidedIngredientIds.includes(id) ? draft.avoidedIngredientIds.filter((item) => item !== id) : [...draft.avoidedIngredientIds, id] })
  return (
    <section aria-label="Ingrédients à éviter" className="food-preferences-editor food-preferences-avoided-editor">
      <p className="food-preferences-editor__intro">Recherchez un ingrédient dans la barre de recherche en dessous.</p>
      <div className="food-preferences-searchbox">
        <InputField id="avoided-ingredients-search" type="text" role="searchbox" aria-label="Rechercher un ingrédient" placeholder="Ex : champignons" value={query} onChange={(event) => setQuery(event.target.value)} lIcon={<MagnifyingGlass size={20} aria-hidden="true" />} />
        {query && <Button variant="tertiary" size="XS" className="food-preferences-searchbox__clear" iconOnly={<X size={16} weight="bold" />} label="Effacer la recherche" onClick={() => setQuery('')} />}
        {options.length > 0 && <div className="food-preferences-autocomplete" role="listbox" aria-label="Suggestions d’ingrédients">
          {options.map((option) => <Button variant="tertiary" size="S" role="option" key={option.id} label={option.label} onClick={() => { toggle(option.id); setQuery('') }} />)}
        </div>}
      </div>
      <div className="food-preferences-token-section">
        <h3>Votre liste</h3>
        <div className="food-preferences-token-list" aria-label="Ingrédients sélectionnés">
          {selectedOptions.map((option) => <ChipTag key={option.id} type="neutral-outline" size="L" label={option.label} onRemove={() => toggle(option.id)} />)}
        </div>
      </div>
      <div className="food-preferences-actions"><Button variant="primary" size="M" label="Enregistrer" onClick={onSave} /></div>
    </section>
  )
}
