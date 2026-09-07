'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from '@phosphor-icons/react'
import { Button, Heading } from '@mealz-product-team/design-system'
import { useFoodPreferences } from '@/features/food-preferences/context/FoodPreferencesContext'
import { FoodPreferencesSummary } from '@/features/food-preferences/components/FoodPreferencesSummary'
import { RestrictionsEditor } from '@/features/food-preferences/components/RestrictionsEditor'
import { AvoidedIngredientsEditor } from '@/features/food-preferences/components/AvoidedIngredientsEditor'
import { KitchenPreferencesEditor } from '@/features/food-preferences/components/KitchenPreferencesEditor'
import { supermarketRoutes } from '@/features/supermarket/routing/SupermarketRoutes'

export function FoodPreferencesProfilePage({ basePath = '/neutral/supermarket' }: { basePath?: string }) {
  const router = useRouter()
  const routes = supermarketRoutes(basePath)
  const preferences = useFoodPreferences()
  const [section, setSection] = useState<'summary' | 'restrictions' | 'avoidedIngredients' | 'kitchen'>('summary')
  const [draft, setDraft] = useState(preferences.profile)
  const sectionTitles = { restrictions: 'Régimes et allergies', avoidedIngredients: 'Ingrédients à éviter', kitchen: 'En cuisine' } as const
  const save = () => { preferences.saveSection(section === 'summary' ? 'kitchen' : section, draft); setSection('summary') }
  const edit = (next: typeof section) => { setDraft(preferences.profile); setSection(next) }
  return (
    <main className="food-preferences-profile layout-container">
      {section === 'summary' ? <>
        <Button variant="secondary" size="S" label="Retour au catalogue" onClick={() => router.push(routes.home)} />
        <Heading as="h1" size="lg">Mes préférences alimentaires</Heading>
      </> : <div className="food-preferences-profile__section-header">
        <Button variant="secondary" size="S" iconOnly={<ArrowLeft size={18} weight="bold" />} label="Retour" onClick={() => setSection('summary')} />
        <Heading as="h1" size="lg">{sectionTitles[section]}</Heading>
      </div>}
      {section === 'summary' && <FoodPreferencesSummary profile={preferences.profile} onEdit={edit} onSaveGuests={preferences.saveGuests} />}
      {section === 'restrictions' && <RestrictionsEditor draft={draft} onChange={setDraft} onSave={save} />}
      {section === 'avoidedIngredients' && <AvoidedIngredientsEditor draft={draft} onChange={setDraft} onSave={save} />}
      {section === 'kitchen' && <KitchenPreferencesEditor draft={draft} onChange={setDraft} onSave={save} />}
    </main>
  )
}
