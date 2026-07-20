'use client'

import { useRouter } from 'next/navigation'
import { ForkKnife } from '@phosphor-icons/react'
import { Stepper } from '@mealz-product-team/design-system'
import { QuestionCard } from '@/components/QuestionCard/QuestionCard'
import { useWizard } from '@/context/WizardContext'
import '@mealz-product-team/design-system/styles/index.css'

export default function RepasPage() {
  const router = useRouter()
  const { state, setMeals } = useWizard()

  return (
    <QuestionCard
      step={2}
      totalSteps={4}
      icon={<ForkKnife size={28} weight="duotone" />}
      title="Combien de repas cette semaine ?"
      subtitle="On vous proposera exactement ce nombre de recettes."
      ctaLabel="Continuer"
      onCta={() => router.push('/equipment')}
    >
      <Stepper value={state.meals} onChange={setMeals} min={1} max={21} size="M" label="Nombre de repas" suffix="repas" />
    </QuestionCard>
  )
}
