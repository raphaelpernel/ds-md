import { PlannerProvider } from '@/features/mealz-planner/context/PlannerContext'

export default function SupermarketLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlannerProvider basePath="/neutral/supermarket/planner">
      <div className="supermarket-feature planner-feature">{children}</div>
    </PlannerProvider>
  )
}