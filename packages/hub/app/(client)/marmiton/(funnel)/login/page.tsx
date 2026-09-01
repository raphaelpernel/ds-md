'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CarrefourLoginModal } from '@/features/marmiton-prototype/components/product/CarrefourLogin/CarrefourLoginModal'

export default function ConnexionPage() {
  const router = useRouter()
  const [open, setOpen] = useState(true)

  return (
    <main className="proto-page proto-page--centered">
      <p className="proto-bg-text">Connexion requise pour commander</p>
      <CarrefourLoginModal
        open={open}
        onClose={() => router.back()}
        onSuccess={() => router.push('/marmiton/store')}
      />

      <style>{`
        .proto-page { min-height: 100vh; background-color: var(--color-surface-page); }
        .proto-page--centered { display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .proto-bg-text { font-size: 14px; color: var(--color-content-weak); position: absolute; top: 32px; }
      `}</style>
    </main>
  )
}
