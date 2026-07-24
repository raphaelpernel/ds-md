'use client'

import { useRouter } from 'next/navigation'
import { PlannerBanner } from '@mealz-product-team/design-system'
import { useWizard } from '@/context/WizardContext'
import '@mealz-product-team/design-system/styles/index.css'
import './page.css'

export default function Home() {
  const router = useRouter()
  const { state, setPeople } = useWizard()

  return (
    <div className="entry-page">
      <PlannerBanner peopleCount={state.people} onPeopleChange={setPeople} onCtaClick={() => router.push('/people')} />
    </div>
  )
}
