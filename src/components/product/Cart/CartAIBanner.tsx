'use client'

import { Sparkle } from '@phosphor-icons/react'
import { CartAIPrompt } from './CartAIPrompt'
import './CartAIBanner.css'

interface CartAIBannerProps {
  onSubmit?: (prompt: string) => void
  loading?: boolean
}

export function CartAIBanner({ onSubmit, loading = false }: CartAIBannerProps) {
  return (
    <div className="cart-ai-banner">
      <div className="cart-ai-banner__header">
        <div className="cart-ai-banner__icon">
          <Sparkle size={18} weight="fill" />
        </div>
        <div className="cart-ai-banner__header-text">
          <p className="cart-ai-banner__title">Dites-nous ce qu'il vous faut</p>
          <p className="cart-ai-banner__subtitle">Recette, liste de courses, produit précis...</p>
        </div>
      </div>

      <CartAIPrompt onSubmit={onSubmit} loading={loading} hideHeader />
    </div>
  )
}

export default CartAIBanner
