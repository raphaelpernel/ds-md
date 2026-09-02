'use client'

import { useRouter } from 'next/navigation'
import { UsersThree } from '@phosphor-icons/react'
import { Stepper } from '@mealz-product-team/design-system'
import { QuestionCard } from '@/features/mealz-planner/components/QuestionCard/QuestionCard'
import { usePlanner } from '@/features/mealz-planner/context/PlannerContext'
import '@mealz-product-team/design-system/styles/index.css'
import { plannerPath } from '@/features/mealz-planner/plannerRoutes'

export default function PersonnesPage() {
  const router = useRouter()
  const { state, setPeople, basePath } = usePlanner()

  return (
    <QuestionCard
      step={1}
      totalSteps={4}
      icon={<UsersThree size={28} weight="duotone" />}
      title="Combien de personnes ?"
      subtitle="Pour calculer les bonnes quantités dans chaque recette."
      ctaLabel="Continuer"
      onCta={() => router.push(plannerPath(basePath, 'meals'))}
    >
      <Stepper value={state.people} onChange={setPeople} min={1} max={12} size="M" label="Nombre de personnes" suffix="pers." />
    </QuestionCard>
  )
}
