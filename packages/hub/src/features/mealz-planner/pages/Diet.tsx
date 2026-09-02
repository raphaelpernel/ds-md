'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { BowlFood, DropSlash, GrainsSlash, Leaf, Plant, Prohibit, SealCheck } from '@phosphor-icons/react'
import { ChipTag } from '@mealz-product-team/design-system'
import { QuestionCard } from '@/features/mealz-planner/components/QuestionCard/QuestionCard'
import { usePlanner } from '@/features/mealz-planner/context/PlannerContext'
import { DIET_OPTIONS } from '@/features/mealz-planner/data/mock/diets'
import '@mealz-product-team/design-system/styles/index.css'
import { plannerPath } from '@/features/mealz-planner/plannerRoutes'

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
  const { state, toggleDiet, basePath } = usePlanner()

  return (
    <QuestionCard
      step={4}
      totalSteps={4}
      icon={<BowlFood size={28} weight="duotone" />}
      title="Un régime alimentaire à suivre ?"
      subtitle="Sélectionnez tout ce qui s'applique."
      ctaLabel="Voir mes repas"
      onCta={() => router.push(plannerPath(basePath, 'results'))}
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
