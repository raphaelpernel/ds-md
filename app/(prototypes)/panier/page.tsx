'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Drawer } from '../../../src/components/ui/layout/Drawer/Drawer'
import { Cart } from '../../../src/components/product/Cart/Cart'
import { CartFooter } from '../../../src/components/product/Cart/CartFooter'
import { CarrefourLoginModal } from '../../../src/components/product/CarrefourLogin/CarrefourLoginModal'
import { useCart } from '../../../src/context/CartContext'
import '../../../src/styles/index.css'

export default function PanierPage() {
  const router = useRouter()
  const { itemCount, total, sections, state } = useCart()
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [loginOpen, setLoginOpen] = useState(false)

  const recipeCount = sections.filter((s) => s.recipeId !== null).length

  return (
    <main className="proto-page">
      <header className="proto-header">
        <Link href="/recette" className="proto-back">← Retour recette</Link>
        <span className="proto-header__title">Panier ({itemCount})</span>
      </header>

      <div className="proto-panier-trigger">
        <button className="proto-open-btn" onClick={() => setDrawerOpen(true)} data-partner="carrefour">
          Voir mon panier · {itemCount} article{itemCount !== 1 ? 's' : ''}
        </button>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title=""
        placement="right"
        footer={
          <CartFooter
            total={total}
            itemCount={itemCount}
            recipeCount={recipeCount}
            storeName={state.storeName}
            onCheckout={() => setLoginOpen(true)}
            onChangeStore={() => router.push('/magasin')}
          />
        }
      >
        <Cart />
      </Drawer>

      <CarrefourLoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => {
          setLoginOpen(false)
          router.push('/magasin')
        }}
      />

      <style>{`
        .proto-page { min-height: 100vh; background-color: var(--color-surface-page); }
        .proto-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--color-border-default); background: var(--color-surface-primary); }
        .proto-back { font-size: 14px; color: var(--color-interactive-content); text-decoration: none; }
        .proto-header__title { font-weight: 700; font-size: 16px; color: var(--color-content-default); }
        .proto-panier-trigger { display: flex; align-items: center; justify-content: center; padding: 40px 16px; }
        .proto-open-btn { background-color: var(--partner-bg); color: var(--partner-content); border: none; border-radius: var(--shape-button); height: 48px; padding: 0 24px; font-size: 16px; font-weight: 700; cursor: pointer; transition: background-color 0.15s; }
        .proto-open-btn:hover { background-color: var(--partner-bg-hover); }
      `}</style>
    </main>
  )
}
