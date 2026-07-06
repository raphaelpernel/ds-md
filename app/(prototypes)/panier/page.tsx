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
    <main className="cart-page">
      <div className="cart-card">
        <header className="cart-header">
          <Link href="/recette" className="cart-back">← Retour recette</Link>
          <span className="cart-header__title">Mon panier ({itemCount})</span>
          <span className="cart-header__spacer" />
        </header>

        <div className="cart-body">
          <Cart
            onChooseStore={() => router.push('/magasin')}
            onChangeStore={() => router.push('/magasin')}
          />
        </div>

        <div className="cart-footer-wrap">
          <CartFooter
            total={total}
            itemCount={itemCount}
            recipeCount={recipeCount}
            storeName={state.storeName}
            onCheckout={() => setLoginOpen(true)}
            onChangeStore={() => router.push('/magasin')}
          />
        </div>
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

        .cart-page {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--color-surface-page);
          font-family: var(--font-family-body);
          color: var(--color-content-default);
        }

        .cart-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          width: 100%;
          background-color: var(--color-surface-page);
        }

        .cart-header {
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

        .cart-back {
          font-size: 14px;
          color: var(--color-interactive-content);
          text-decoration: none;
          white-space: nowrap;
        }

        .cart-header__title {
          font-weight: 700;
          font-size: 16px;
          color: var(--color-content-default);
        }

        .cart-header__spacer {
          width: 80px;
        }

        .cart-body {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
        }

        .cart-footer-wrap {
          position: sticky;
          bottom: 0;
          z-index: 10;
        }

        /* Desktop — fluid container capped at 1200px, floats on the gray backdrop.
           Below 1024 the container stays full width, no side margin. */
        @media (min-width: 1024px) {
          .cart-page {
            background-color: #f5f5f5;
          }
          .cart-card {
            max-width: 1200px;
            margin: 32px auto;
            border-radius: var(--radius-card);
            box-shadow: var(--elevation-300);
            overflow: hidden;
          }
        }
      `}</style>
    </main>
  )
}
