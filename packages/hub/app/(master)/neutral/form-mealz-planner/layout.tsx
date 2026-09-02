import { PlannerProvider } from '@/features/mealz-planner/context/PlannerContext'

export default function MealzPlannerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlannerProvider basePath="/neutral/form-mealz-planner">
      <div className="planner-feature">{children}</div>
    </PlannerProvider>
  )
}
