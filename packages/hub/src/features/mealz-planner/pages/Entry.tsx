'use client'

import { useRouter } from 'next/navigation'
import { PlannerBanner } from '@mealz-product-team/design-system'
import { usePlanner } from '@/features/mealz-planner/context/PlannerContext'
import '@mealz-product-team/design-system/styles/index.css'
import { plannerPath } from '@/features/mealz-planner/plannerRoutes'
import './entry.css'

export default function Home() {
  const router = useRouter()
  const { state, setPeople, basePath } = usePlanner()

  return (
    <div className="entry-page">
      <PlannerBanner
        peopleCount={state.people}
        onPeopleChange={setPeople}
        onCtaClick={() => router.push(plannerPath(basePath, 'people'))}
        backgroundImageMobile="/prototypes/mealz-planner/planner-banner-bg-mobile.png"
        backgroundImageDesktop="/prototypes/mealz-planner/planner-banner-bg-desktop.png"
      />
    </div>
  )
}
