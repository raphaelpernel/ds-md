'use client'

import { useRouter } from 'next/navigation'
import { Stepper } from '@mealz-product-team/design-system'
import { QuestionCard } from '@/components/QuestionCard/QuestionCard'
import { useWizard } from '@/context/WizardContext'
import '@mealz-product-team/design-system/styles/index.css'

export default function PersonnesPage() {
  const router = useRouter()
  const { state, setPeople } = useWizard()

  return (
    <QuestionCard
      step={1}
      totalSteps={4}
      title="Combien de personnes ?"
      subtitle="Pour calculer les bonnes quantités dans chaque recette."
      ctaLabel="Continuer"
      onCta={() => router.push('/repas')}
    >
      <Stepper value={state.people} onChange={setPeople} min={1} max={12} size="M" label="Nombre de personnes" suffix="pers." />
    </QuestionCard>
  )
}
