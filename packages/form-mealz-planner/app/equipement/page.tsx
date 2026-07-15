'use client'

import { useRouter } from 'next/navigation'
import { ChipTag } from '@mealz-product-team/design-system'
import { QuestionCard } from '@/components/QuestionCard/QuestionCard'
import { useWizard } from '@/context/WizardContext'
import { EQUIPMENT_OPTIONS } from '@/data/mock/equipment'
import '@mealz-product-team/design-system/styles/index.css'

export default function EquipementPage() {
  const router = useRouter()
  const { state, toggleEquipment } = useWizard()

  return (
    <QuestionCard
      step={3}
      totalSteps={4}
      title="Quel équipement avez-vous ?"
      subtitle="Pour ne jamais vous proposer une recette que vous ne pouvez pas faire."
      ctaLabel="Continuer"
      onCta={() => router.push('/regime')}
    >
      {EQUIPMENT_OPTIONS.map((option) => (
        <ChipTag
          key={option.id}
          label={option.label}
          selected={state.equipmentIds.includes(option.id)}
          onClick={() => toggleEquipment(option.id)}
          size="L"
        />
      ))}
    </QuestionCard>
  )
}
