'use client'

import { useCart } from '../../../context/CartContext'
import { CartSection } from './CartSection'
import { Button } from '../../ui/form/Button/Button'
import { CartAIPrompt } from './CartAIPrompt'
import { CartSuggestions } from './CartSuggestions'
import { CartAisles } from './CartAisles'
import { SUGGESTION_PRODUCTS } from '../../../data/mock/products'
import type { Product } from '../../../data/types/product'
import './Cart.css'

interface CartProps {
  /** Called when user taps Commander in the sticky footer */
  onCheckout?: () => void
  onChangeStore?: () => void
}

export function Cart({ onCheckout, onChangeStore }: CartProps) {
  const { sections, itemCount, addItem } = useCart()

  const handleAddSuggestion = (product: Product) => {
    addItem(product, null, null)
  }

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
        <CartAIPrompt />
        <CartAisles />
        <CartSuggestions products={SUGGESTION_PRODUCTS} onAdd={handleAddSuggestion} />
      </div>
    )
  }

  return (
    <div className="cart">
      <div className="cart__header">
        <h2 className="cart__title">Mon panier</h2>
        <Button variant="tertiary" size="S" onClick={() => {}}>Tout afficher</Button>
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

      <CartAIPrompt />
      <CartAisles />
      <CartSuggestions products={SUGGESTION_PRODUCTS} onAdd={handleAddSuggestion} />
    </div>
  )
}

export default Cart
