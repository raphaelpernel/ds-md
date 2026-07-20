'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { BowlFood, DropSlash, GrainsSlash, Leaf, Plant, Prohibit, SealCheck } from '@phosphor-icons/react'
import { ChipTag } from '@mealz-product-team/design-system'
import { QuestionCard } from '@/components/QuestionCard/QuestionCard'
import { useWizard } from '@/context/WizardContext'
import { DIET_OPTIONS } from '@/data/mock/diets'
import '@mealz-product-team/design-system/styles/index.css'

const DIET_ICONS: Record<string, ReactNode> = {
  'sans-restriction': <SealCheck size={18} />,
  vegetarien: <Leaf size={18} />,
  vegan: <Plant size={18} />,
  'sans-gluten': <GrainsSlash size={18} />,
  'sans-lactose': <DropSlash size={18} />,
  'sans-porc': <Prohibit size={18} />,
}

export default function RegimePage() {
  const router = useRouter()
  const { state, toggleDiet } = useWizard()

  return (
    <QuestionCard
      step={4}
      totalSteps={4}
      icon={<BowlFood size={28} weight="duotone" />}
      title="Un régime alimentaire à suivre ?"
      subtitle="Sélectionnez tout ce qui s'applique."
      ctaLabel="Voir mes repas"
      onCta={() => router.push('/results')}
    >
      {DIET_OPTIONS.map((option) => (
        <ChipTag
          key={option.id}
          icon={DIET_ICONS[option.id]}
          label={option.label}
          selected={state.dietIds.includes(option.id)}
          onClick={() => toggleDiet(option.id)}
          size="L"
        />
      ))}
    </QuestionCard>
  )
}
