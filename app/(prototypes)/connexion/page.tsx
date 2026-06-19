'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CarrefourLoginModal } from '../../../src/components/product/CarrefourLogin/CarrefourLoginModal'
import '../../../src/styles/index.css'

export default function ConnexionPage() {
  const router = useRouter()
  const [open, setOpen] = useState(true)

  return (
    <main className="proto-page proto-page--centered">
      <p className="proto-bg-text">Connexion requise pour commander</p>
      <CarrefourLoginModal
        open={open}
        onClose={() => router.back()}
        onSuccess={() => router.push('/magasin')}
      />

      <style>{`
        .proto-page { min-height: 100vh; background-color: var(--color-surface-page); }
        .proto-page--centered { display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .proto-bg-text { font-size: 14px; color: var(--color-content-weak); position: absolute; top: 32px; }
      `}</style>
    </main>
  )
}
