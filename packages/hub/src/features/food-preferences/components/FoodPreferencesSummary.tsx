import { ChipTag, Link, Stepper } from '@mealz-product-team/design-system'
import { AVOIDED_INGREDIENT_OPTIONS, CUISINE_OPTIONS, DIET_OPTIONS, EQUIPMENT_OPTIONS, RESTRICTION_OPTIONS } from '../data/options'
import type { FoodPreferenceProfile } from '../model/types'

interface Props {
  profile: FoodPreferenceProfile
  onEdit: (section: 'restrictions' | 'avoidedIngredients' | 'kitchen', trigger?: HTMLElement | null) => void
  onSaveGuests: (value: number) => void
}

function SummaryTags({ labels, label }: { labels: string[]; label: string }) {
  if (!labels.length) return null
  return <div className="food-preferences-summary__tags" aria-label={label}>{labels.map((value) => <ChipTag key={value} type="neutral-filled" size="S" label={value} />)}</div>
}

export function FoodPreferencesSummary({ profile, onEdit, onSaveGuests }: Props) {
  const dietLabels = profile.dietIds.map((id) => DIET_OPTIONS.find((option) => option.id === id)?.label ?? id)
  const restrictionLabels = profile.restrictions.status === 'declared'
    ? profile.restrictions.ids.map((id) => RESTRICTION_OPTIONS.find((option) => option.id === id)?.label ?? id)
    : []
  const avoidedIngredientLabels = profile.avoidedIngredientIds.map((id) => AVOIDED_INGREDIENT_OPTIONS.find((option) => option.id === id)?.label ?? id)
  const cuisineLabels = profile.cuisineIds.map((id) => CUISINE_OPTIONS.find((option) => option.id === id)?.label ?? id)
  const equipmentLabels = profile.equipmentIds.map((id) => EQUIPMENT_OPTIONS.find((option) => option.id === id)?.label ?? id)
  const kitchenLabels = [
    ...(profile.maxPreparationMinutes ? [`${profile.maxPreparationMinutes} min ou moins`] : []),
    ...cuisineLabels,
    ...equipmentLabels,
  ]
  const hasRestrictions = dietLabels.length > 0 || restrictionLabels.length > 0 || profile.restrictions.status === 'none'
  return (
    <div className="food-preferences-summary">
      <section className="food-preferences-card" aria-labelledby="food-preferences-guests">
        <h3 id="food-preferences-guests">Pour combien de personnes cuisinez-vous ?</h3>
        <div className="food-preferences-inline-control">
          <Stepper value={profile.defaultGuests} onChange={onSaveGuests} min={1} max={12} size="S" label="Convives par défaut" />
        </div>
      </section>
      <section className="food-preferences-card" aria-labelledby="food-preferences-restrictions">
        <div className="food-preferences-card__header">
          <h3 id="food-preferences-restrictions">Régimes et allergies</h3>
          <Link size="SM" href="#restrictions" onClick={(event) => { event.preventDefault(); onEdit('restrictions', event.currentTarget) }}>Modifier</Link>
        </div>
        <p>{hasRestrictions ? 'Renseignez vos allergies et régimes.' : 'Aucun régime renseigné'}</p>
        <SummaryTags labels={[...dietLabels, ...restrictionLabels]} label="Régimes et allergies sélectionnés" />
        {profile.restrictions.status === 'none' && <p>Aucune allergie ou restriction à signaler</p>}
      </section>
      <section className="food-preferences-card" aria-labelledby="food-preferences-avoided">
        <div className="food-preferences-card__header">
          <h3 id="food-preferences-avoided">Ingrédients à éviter</h3>
          <Link size="SM" href="#avoided-ingredients" onClick={(event) => { event.preventDefault(); onEdit('avoidedIngredients', event.currentTarget) }}>Modifier</Link>
        </div>
        <p>{avoidedIngredientLabels.length ? 'Ajoutez les ingrédients que vous n’aimez pas.' : 'Aucun ingrédient sélectionné'}</p>
        <SummaryTags labels={avoidedIngredientLabels} label="Ingrédients sélectionnés" />
      </section>
      <section className="food-preferences-card" aria-labelledby="food-preferences-kitchen">
        <div className="food-preferences-card__header">
          <h3 id="food-preferences-kitchen">En cuisine</h3>
          <Link size="SM" href="#kitchen" onClick={(event) => { event.preventDefault(); onEdit('kitchen', event.currentTarget) }}>Modifier</Link>
        </div>
        <p>{kitchenLabels.length ? 'Votre type de cuisine préféré, le temps pour cuisiner, vos équipements.' : 'Temps pour cuisiner non renseigné'}</p>
        <SummaryTags labels={kitchenLabels} label="Préférences cuisine sélectionnées" />
      </section>
    </div>
  )
}
