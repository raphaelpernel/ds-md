'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StoreLocator } from '../../../src/components/product/StoreLocator/StoreLocator'
import { useCart } from '../../../src/context/CartContext'
import type { Store } from '../../../src/data/types/store'
import '../../../src/styles/index.css'

export default function MagasinPage() {
  const router = useRouter()
  const { setStore, state } = useCart()
  const [open, setOpen] = useState(true)

  const handleConfirm = (store: Store) => {
    setStore(store.id, store.name)
    router.push('/creneau')
  }

  const handleClose = () => {
    setOpen(false)
    router.back()
  }

  return (
    <main className="proto-page proto-page--centered" data-partner="carrefour">
      <p className="proto-bg-text">Choisissez un magasin Carrefour</p>
      <StoreLocator
        open={open}
        onClose={handleClose}
        onConfirm={handleConfirm}
        initialStoreId={state.storeId}
      />

      <style>{`
        .proto-page { min-height: 100vh; background-color: var(--color-surface-page); }
        .proto-page--centered { display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .proto-bg-text { font-size: 14px; color: var(--color-content-weak); position: absolute; top: 32px; }
      `}</style>
    </main>
  )
}
