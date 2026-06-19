'use client'

import { useState } from 'react'
import { CartItem } from './CartItem'
import type { CartSection as CartSectionType } from '../../../data/types/cart'
import { useCart } from '../../../context/CartContext'
import './CartSection.css'

interface CartSectionProps {
  section: CartSectionType
  defaultOpen?: boolean
}

export function CartSection({ section, defaultOpen = true }: CartSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const { updateQty, removeItem } = useCart()

  const itemCount = section.items.reduce((s, i) => s + i.quantity, 0)
  const total = section.items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const emoji = section.items[0]?.product.emoji ?? '🛒'

  return (
    <div className="cart-section">
      <button
        className="cart-section__header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="cart-section__emoji-wrap" aria-hidden="true">
          {emoji}
        </div>
        <div className="cart-section__meta">
          <p className="cart-section__name">
            {section.recipeName ?? 'Produits hors recette'}
          </p>
          <p className="cart-section__subtitle">
            {itemCount} produit{itemCount > 1 ? 's' : ''} · {total.toFixed(2).replace('.', ',')} €
          </p>
        </div>
        <span className="cart-section__chevron" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
      </button>

      {open && (
        <div className="cart-section__items">
          {section.items.map((item) => (
            <CartItem
              key={item.product.id}
              item={item}
              onIncrement={() => updateQty(item.product.id, item.quantity + 1)}
              onDecrement={() => updateQty(item.product.id, item.quantity - 1)}
              onRemove={() => removeItem(item.product.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CartSection
