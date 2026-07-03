'use client'

import { useState } from 'react'
import { CaretDown, CaretRight } from '@phosphor-icons/react'
import { ProductCard } from '../ProductCard/ProductCard'
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
  const isRecipe = section.recipeId !== null

  return (
    <div className="cart-section">
      <button
        className="cart-section__header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div
          className={`cart-section__visual-wrap${isRecipe ? ' cart-section__visual-wrap--recipe' : ''}`}
          aria-hidden="true"
        >
          {isRecipe && section.recipeImageUrl ? (
            <img src={section.recipeImageUrl} alt="" className="cart-section__visual-img" />
          ) : (
            <span className="cart-section__visual-emoji">{emoji}</span>
          )}
        </div>
        <div className="cart-section__meta">
          <p className="cart-section__name">
            {section.recipeName ?? 'Produits hors recette'}
          </p>
          <p className="cart-section__subtitle">
            {itemCount} produit{itemCount > 1 ? 's' : ''}
            {isRecipe && section.servings ? ` · ${section.servings} personne${section.servings > 1 ? 's' : ''}` : ''}
            {' '}· {total.toFixed(2).replace('.', ',')} €
          </p>
        </div>
        <span className="cart-section__chevron" aria-hidden="true">
          {open ? <CaretDown size={16} /> : <CaretRight size={16} />}
        </span>
      </button>

      {open && (
        <div className="cart-section__items">
          {section.items.map((item) => (
            <ProductCard
              key={item.product.id}
              context="cart"
              product={item.product}
              quantity={item.quantity}
              onQuantityChange={(qty) => updateQty(item.product.id, qty)}
              onRemove={() => removeItem(item.product.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CartSection
