'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button, Drawer, Modal, Toast } from '@mealz-product-team/design-system'
import { useFoodPreferences } from '../context/FoodPreferencesContext'
import { FoodPreferencesSummary } from './FoodPreferencesSummary'
import { RestrictionsEditor } from './RestrictionsEditor'
import { AvoidedIngredientsEditor } from './AvoidedIngredientsEditor'
import { KitchenPreferencesEditor } from './KitchenPreferencesEditor'
import '@mealz-product-team/design-system/styles/index.css'

export function SupermarketFoodPreferencesShell() {
  const preferences = useFoodPreferences()
  const pathname = usePathname()
  const [section, setSection] = useState<'summary' | 'restrictions' | 'avoidedIngredients' | 'kitchen'>('summary')
  const [draft, setDraft] = useState(preferences.profile)
  const [toastOpen, setToastOpen] = useState(false)
  const drawerWasOpen = useRef(false)
  const sectionTitles = {
    summary: 'Mes préférences',
    restrictions: 'Régimes et allergies',
    avoidedIngredients: 'Ingrédients à éviter',
    kitchen: 'En cuisine',
  } as const

  useEffect(() => {
    if (section === 'summary') setDraft(preferences.profile)
  }, [preferences.profile, section])

  useEffect(() => {
    if (preferences.drawerOpen) {
      drawerWasOpen.current = true
      document.querySelector<HTMLElement>('.drawer--open button[aria-label="Fermer"]')?.focus()
      return
    }
    if (!drawerWasOpen.current) return
    drawerWasOpen.current = false
    const trigger = preferences.drawerTrigger ?? document.querySelector<HTMLElement>('[aria-label="Préférences"]')
    trigger?.focus()
  }, [preferences.drawerOpen, preferences.drawerTrigger])

  const edit = (next: typeof section, trigger?: HTMLElement | null) => {
    setDraft(preferences.profile)
    setSection(next)
    if (!preferences.drawerOpen) preferences.openDrawer(trigger)
  }
  const save = () => {
    preferences.saveSection(section === 'summary' ? 'kitchen' : section, draft)
    setSection('summary')
    setToastOpen(true)
  }
  const closeDrawer = () => {
    setSection('summary')
    preferences.closeDrawer()
  }
  const backToSummary = () => setSection('summary')

  return (
    <>
      <Modal
        open={preferences.hydrated && pathname === '/neutral/supermarket' && !preferences.invitationSeen}
        onClose={preferences.markInvitationSeen}
        title="Personnalisez vos suggestions"
        size="S"
        footer={<><Button variant="secondary" size="M" label="Je le ferai plus tard" onClick={preferences.markInvitationSeen} /><Button variant="primary" size="M" label="Personnaliser mon profil" onClick={() => { preferences.markInvitationSeen(); preferences.openDrawer() }} /></>}
      >
        <p>Renseignez votre profil alimentaire pour recevoir des suggestions plus adaptées.</p>
      </Modal>
      <Drawer open={preferences.drawerOpen} onClose={closeDrawer} onBack={section === 'summary' ? undefined : backToSummary} placement="right" mobilePlacement="right" title={sectionTitles[section]}>
        {section === 'summary' && <FoodPreferencesSummary profile={preferences.profile} onEdit={edit} onSaveGuests={preferences.saveGuests} />}
        {section === 'restrictions' && <RestrictionsEditor draft={draft} onChange={setDraft} onSave={save} />}
        {section === 'avoidedIngredients' && <AvoidedIngredientsEditor draft={draft} onChange={setDraft} onSave={save} />}
        {section === 'kitchen' && <KitchenPreferencesEditor draft={draft} onChange={setDraft} onSave={save} />}
      </Drawer>
      {toastOpen && <Toast title="Préférences enregistrées. Vos prochaines suggestions en tiendront compte." onDismiss={() => setToastOpen(false)} />}
    </>
  )
}
