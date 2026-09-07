import { PlannerProvider } from '@/features/mealz-planner/context/PlannerContext'
import { FoodPreferencesProvider } from '@/features/food-preferences/context/FoodPreferencesContext'
import { PlannerProfileBridge } from '@/features/food-preferences/integration/PlannerProfileBridge'
import { SupermarketFoodPreferencesShell } from '@/features/food-preferences/components/SupermarketFoodPreferencesShell'
import '@/features/food-preferences/styles/food-preferences.css'

export default function SupermarketLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlannerProvider basePath="/neutral/supermarket/planner">
      <FoodPreferencesProvider>
        <div className="supermarket-feature planner-feature">
          <PlannerProfileBridge />
          <SupermarketFoodPreferencesShell />
          {children}
        </div>
      </FoodPreferencesProvider>
    </PlannerProvider>
  )
}