'use client'

import { useRouter } from 'next/navigation'
import { OrderConfirmation } from '@/components/product/Checkout/OrderConfirmation'
import { useCart } from '@/context/CartContext'
import '@mealz-product-team/design-system/styles/index.css'

export default function ConfirmationPage() {
  const router = useRouter()
  const { state, total, clear } = useCart()

  const timeslotLabel = state.timeslot
    ? `${state.timeslot.startTime} – ${state.timeslot.endTime}`
    : undefined

  const handleContinue = () => {
    clear()
    router.push('/recipe')
  }

  return (
    <main className="proto-page">
      <div className="proto-confirmation-wrap">
        <OrderConfirmation
          storeName={state.storeName}
          timeslotLabel={timeslotLabel}
          total={total}
          onContinue={handleContinue}
        />
      </div>

      <style>{`
        .proto-page { min-height: 100vh; background-color: var(--color-surface-page); display: flex; align-items: center; justify-content: center; padding: 16px; }
        .proto-confirmation-wrap { width: 100%; max-width: 420px; }
      `}</style>
    </main>
  )
}
