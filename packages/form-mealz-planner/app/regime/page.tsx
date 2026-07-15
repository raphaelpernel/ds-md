'use client'

import { useRouter } from 'next/navigation'
import { ChipTag } from '@mealz-product-team/design-system'
import { QuestionCard } from '@/components/QuestionCard/QuestionCard'
import { useWizard } from '@/context/WizardContext'
import { DIET_OPTIONS } from '@/data/mock/diets'
import '@mealz-product-team/design-system/styles/index.css'

export default function RegimePage() {
  const router = useRouter()
  const { state, toggleDiet } = useWizard()

  return (
    <QuestionCard
      step={4}
      totalSteps={4}
      title="Un régime alimentaire à suivre ?"
      subtitle="Sélectionnez tout ce qui s'applique."
      ctaLabel="Voir mes repas"
      onCta={() => router.push('/resultats')}
    >
      {DIET_OPTIONS.map((option) => (
        <ChipTag
          key={option.id}
          label={option.label}
          selected={state.dietIds.includes(option.id)}
          onClick={() => toggleDiet(option.id)}
          size="L"
        />
      ))}
    </QuestionCard>
  )
}
