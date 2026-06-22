'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Cart } from '../../../src/components/product/Cart/Cart'
import { CartFooter } from '../../../src/components/product/Cart/CartFooter'
import { CarrefourLoginModal } from '../../../src/components/product/CarrefourLogin/CarrefourLoginModal'
import { useCart } from '../../../src/context/CartContext'
import '../../../src/styles/index.css'

export default function PanierPage() {
  const router = useRouter()
  const { itemCount, total, sections, state } = useCart()
  const [loginOpen, setLoginOpen] = useState(false)

  const recipeCount = sections.filter((s) => s.recipeId !== null).length

  return (
    <main className="panier-page">
      <header className="panier-header">
        <Link href="/recette" className="panier-back">← Retour recette</Link>
        <span className="panier-header__title">Mon panier ({itemCount})</span>
        <span className="panier-header__spacer" />
      </header>

      <div className="panier-body">
        <Cart />
      </div>

      <div className="panier-footer">
        <CartFooter
          total={total}
          itemCount={itemCount}
          recipeCount={recipeCount}
          storeName={state.storeName}
          onCheckout={() => setLoginOpen(true)}
          onChangeStore={() => router.push('/magasin')}
        />
      </div>

      <CarrefourLoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => {
          setLoginOpen(false)
          router.push('/magasin')
        }}
      />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .panier-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--color-surface-page);
          font-family: var(--font-family-body);
          color: var(--color-content-default);
          max-width: 480px;
          margin: 0 auto;
        }

        .panier-header {
          position: sticky;
          top: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          height: 52px;
          border-bottom: 1px solid var(--color-border-default);
          background: var(--color-surface-primary);
        }

        .panier-back {
          font-size: 14px;
          color: var(--color-interactive-content);
          text-decoration: none;
          white-space: nowrap;
        }

        .panier-header__title {
          font-weight: 700;
          font-size: 16px;
          color: var(--color-content-default);
        }

        .panier-header__spacer {
          width: 80px;
        }

        .panier-body {
          flex: 1;
          overflow-y: auto;
        }

        .panier-footer {
          position: sticky;
          bottom: 0;
          z-index: 10;
        }
      `}</style>
    </main>
  )
}
