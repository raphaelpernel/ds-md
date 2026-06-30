'use client'

import { useCart } from '../../../context/CartContext'
import { CartSection } from './CartSection'
import { CartCompleteBasket } from './CartCompleteBasket'
import './Cart.css'

interface CartProps {
  onChooseStore?: () => void
  onChangeStore?: () => void
}

export function Cart({ onChooseStore, onChangeStore }: CartProps) {
  const { sections, itemCount, state } = useCart()

  const storeBanner = (
    <div className="cart__store-banner">
      {state.storeName ? (
        <>
          <span className="cart__store-banner__name">{state.storeName}</span>
          <button className="cart__store-banner__change" onClick={onChangeStore}>
            Changer de magasin
          </button>
        </>
      ) : (
        <button className="cart__store-banner__choose" onClick={onChooseStore}>
          Choisir mon magasin
        </button>
      )}
    </div>
  )

  if (itemCount === 0) {
    return (
      <div className="cart cart--empty">
        {storeBanner}
        <div className="cart__empty-state">
          <p className="cart__empty-icon" aria-hidden="true">🛒</p>
          <p className="cart__empty-title">Votre panier est vide</p>
          <p className="cart__empty-sub">
            Ajoutez des ingrédients depuis une recette Marmiton.
          </p>
        </div>
        <CartCompleteBasket />
      </div>
    )
  }

  return (
    <div className="cart">
      {storeBanner}
      <div className="cart__sections">
        {sections.map((section, i) => (
          <CartSection
            key={section.recipeId ?? '__hors-recette__'}
            section={section}
            defaultOpen={i === 0}
          />
        ))}
      </div>

      <CartCompleteBasket />
    </div>
  )
}

export default Cart
