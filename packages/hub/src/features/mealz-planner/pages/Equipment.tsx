'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Basket, CookingPot, Fan, Flame, Oven, Robot, WaveSawtooth } from '@phosphor-icons/react'
import { ChipTag } from '@mealz-product-team/design-system'
import { QuestionCard } from '@/features/mealz-planner/components/QuestionCard/QuestionCard'
import { usePlanner } from '@/features/mealz-planner/context/PlannerContext'
import { EQUIPMENT_OPTIONS } from '@/features/mealz-planner/data/mock/equipment'
import '@mealz-product-team/design-system/styles/index.css'
import { plannerPath } from '@/features/mealz-planner/plannerRoutes'

const EQUIPMENT_ICONS: Record<string, ReactNode> = {
  four: <Oven size={18} />,
  plaques: <Flame size={18} />,
  'micro-ondes': <WaveSawtooth size={18} />,
  mixeur: <Fan size={18} />,
  friteuse: <Basket size={18} />,
  robot: <Robot size={18} />,
}

export default function EquipementPage() {
  const router = useRouter()
  const { state, toggleEquipment, basePath } = usePlanner()

  return (
    <QuestionCard
      step={3}
      totalSteps={4}
      icon={<CookingPot size={28} weight="duotone" />}
      title="Quel équipement avez-vous ?"
      subtitle="Pour ne jamais vous proposer une recette que vous ne pouvez pas faire."
      ctaLabel="Continuer"
      onCta={() => router.push(plannerPath(basePath, 'diet'))}
    >
      {EQUIPMENT_OPTIONS.map((option) => (
        <ChipTag
          key={option.id}
          icon={EQUIPMENT_ICONS[option.id]}
          label={option.label}
          selected={state.equipmentIds.includes(option.id)}
          onClick={() => toggleEquipment(option.id)}
          size="L"
        />
      ))}
    </QuestionCard>
  )
}
