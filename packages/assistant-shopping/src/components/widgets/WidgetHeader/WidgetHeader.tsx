'use client'

import { useRouter } from 'next/navigation'
import { ShoppingCart, ArrowsOut } from '@phosphor-icons/react'
import { Button } from '@mealz-product-team/design-system'
import { useAssistant } from '@/context/AssistantContext'
import { formatPrice } from '@/lib/format'
import './WidgetHeader.css'

interface WidgetHeaderProps {
  /** `cart` shows the widget's own "Panier (N)" title + CTA "Commander" instead of
   *  the "Panier" pill — used only by `CartWidget` itself. */
  variant?: 'default' | 'cart'
  cartCount?: number
  cartTotal?: number
  /** Absent in full view — the widget is already expanded, nothing to expand into. */
  onExpand?: () => void
}

/** Bandeau partagé par tous les widgets de contenu (liste de courses, recettes,
 *  panier) — la pill "Panier" envoie le panier courant dans le chat (`openCart`),
 *  seul mécanisme restant pour l'afficher depuis un widget. */
export function WidgetHeader({ variant = 'default', cartCount = 0, cartTotal = 0, onExpand }: WidgetHeaderProps) {
  const { openCart } = useAssistant()
  const router = useRouter()

  return (
    <div className="widget-header">
      {variant === 'cart' ? (
        <div className="widget-header__cart-title">
          <span className="widget-header__cart-name">Panier</span>
          <span className="widget-header__cart-count">({cartCount})</span>
        </div>
      ) : (
        <Button
          variant="secondary"
          size="S"
          lIcon={<ShoppingCart size={16} weight="bold" aria-hidden="true" />}
          label="Panier"
          aria-label="Envoyer le panier dans la conversation"
          onClick={openCart}
        />
      )}

      <div className="widget-header__actions">
        {variant === 'cart' && (
          <Button variant="primary" size="S" onClick={() => router.push('/cart')}>
            {`Commander (${formatPrice(cartTotal)})`}
          </Button>
        )}
        {onExpand && (
          <Button
            variant="tertiary"
            size="S"
            iconOnly={<ArrowsOut size={18} weight="bold" aria-hidden="true" />}
            label="Agrandir"
            onClick={onExpand}
          />
        )}
      </div>
    </div>
  )
}

export default WidgetHeader
