'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { OrderRecap } from '../../../src/components/product/Checkout/OrderRecap'
import { PaymentForm } from '../../../src/components/product/Checkout/PaymentForm'
import { SegmentedControl } from '../../../src/components/ui/navigation/SegmentedControl/SegmentedControl'
import { useCart } from '../../../src/context/CartContext'
import '../../../src/styles/index.css'

const DELIVERY_OPTIONS = [
  { value: 'drive', label: 'Drive' },
  { value: 'home', label: 'Livraison à domicile' },
]

export default function PaiementPage() {
  const router = useRouter()
  const { state, total } = useCart()
  const [loading, setLoading] = useState(false)
  const [deliveryMode, setDeliveryMode] = useState('drive')

  const handleConfirm = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
    router.push('/confirmation')
  }

  return (
    <main className="proto-page">
      <header className="proto-header">
        <Link href="/creneau" className="proto-back">← Modifier le créneau</Link>
        <span className="proto-header__title">Paiement</span>
      </header>

      <div className="proto-store-bar">
        <div className="proto-store-info">
          <span className="proto-store-name">{state.storeName ?? 'Carrefour Boulogne-Billancourt'}</span>
          <span className="proto-store-sub">Retrait parking</span>
        </div>
        <div className="proto-delivery-toggle">
          <SegmentedControl
            options={DELIVERY_OPTIONS}
            value={deliveryMode}
            onChange={setDeliveryMode}
          />
        </div>
      </div>

      <div className="proto-content proto-content--two-col">
        <div className="proto-col">
          <OrderRecap
            items={state.items}
            total={total}
            storeName={state.storeName}
            timeslot={state.timeslot}
          />
        </div>
        <div className="proto-col">
          <PaymentForm total={total} onConfirm={handleConfirm} loading={loading} />
        </div>
      </div>

      <style>{`
        .proto-page { min-height: 100vh; background-color: var(--color-surface-page); }
        .proto-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--color-border-default); background: var(--color-surface-primary); }
        .proto-back { font-size: 14px; color: var(--color-interactive-content); text-decoration: none; }
        .proto-header__title { font-weight: 700; font-size: 16px; color: var(--color-content-default); }

        .proto-store-bar {
          display: flex; flex-direction: column;
          padding: 12px 16px; gap: 12px;
          border-bottom: 1px solid var(--color-border-default);
          background: var(--color-surface-primary);
        }
        .proto-store-info { display: flex; flex-direction: column; gap: 2px; }
        .proto-store-name { font-weight: 700; font-size: 14px; color: var(--color-content-default); }
        .proto-store-sub { font-size: 12px; color: var(--color-content-weak); }
        .proto-delivery-toggle { width: 100%; }

        .proto-content { padding: 16px; display: flex; flex-direction: column; gap: 24px; max-width: 900px; margin: 0 auto; }
        @media (min-width: 640px) {
          .proto-content--two-col { flex-direction: row; align-items: flex-start; }
          .proto-col { flex: 1; }
        }
      `}</style>
    </main>
  )
}
