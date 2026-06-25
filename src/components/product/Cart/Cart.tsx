'use client'

import { useCart } from '../../../context/CartContext'
import { CartSection } from './CartSection'
import { Button } from '../../ui/form/Button/Button'
import { CartCompleteBasket } from './CartCompleteBasket'
import { CartSuggestions } from './CartSuggestions'
import { PROMO_PRODUCTS, SUGGESTION_PRODUCTS } from '../../../data/mock/products'
import { PromoSection } from '../PromoSection/PromoSection'
import './Cart.css'

interface CartProps {
  /** Called when user taps Commander in the sticky footer */
  onCheckout?: () => void
  onChangeStore?: () => void
}

export function Cart({ onCheckout, onChangeStore }: CartProps) {
  const { sections, itemCount } = useCart()

  const recipeCount = sections.filter((s) => s.recipeId !== null).length

  if (itemCount === 0) {
    return (
      <div className="cart cart--empty">
        <div className="cart__empty-state">
          <p className="cart__empty-icon" aria-hidden="true">🛒</p>
          <p className="cart__empty-title">Votre panier est vide</p>
          <p className="cart__empty-sub">
            Ajoutez des ingrédients depuis une recette Marmiton.
          </p>
        </div>
        <CartCompleteBasket />
        <CartSuggestions products={SUGGESTION_PRODUCTS} />
      </div>
    )
  }

  return (
    <div className="cart">
      <div className="cart__header">
        <h2 className="cart__title">Mon panier</h2>
      </div>

      <div className="cart__sections">
        {sections.map((section, i) => (
          <CartSection
            key={section.recipeId ?? '__hors-recette__'}
            section={section}
            defaultOpen={i === 0}
          />
        ))}
      </div>

      <PromoSection products={PROMO_PRODUCTS} onViewAll={() => {}} />

      <CartCompleteBasket />
    </div>
  )
}

export default Cart
