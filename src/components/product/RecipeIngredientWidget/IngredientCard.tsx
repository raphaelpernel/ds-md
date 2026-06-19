'use client'

import { useState } from 'react'
import type { Ingredient } from '../../../data/types/recipe'
import type { Product } from '../../../data/types/product'
import './IngredientCard.css'

interface IngredientCardProps {
  ingredient: Ingredient
  product: Product | null
  onAdd?: (product: Product) => void
}

export function IngredientCard({ ingredient, product, onAdd }: IngredientCardProps) {
  const [qty, setQty] = useState(0)

  const handleAdd = () => {
    if (!product) return
    const next = qty + 1
    setQty(next)
    if (next === 1) onAdd?.(product)
  }

  const handleDecrement = () => {
    if (qty <= 0) return
    setQty(qty - 1)
  }

  const handleIncrement = () => {
    setQty(qty + 1)
  }

  return (
    <div className="ingredient-card">
      <div className="ingredient-card__image-wrap">
        <span className="ingredient-card__emoji" aria-hidden="true">
          {ingredient.emoji}
        </span>
        {qty === 0 ? (
          <button
            className="ingredient-card__add-btn"
            onClick={handleAdd}
            disabled={!product || !product.available}
            aria-label={`Ajouter ${ingredient.name} au panier`}
          >
            +
          </button>
        ) : (
          <div className="ingredient-card__stepper" data-partner="carrefour">
            <button
              className="ingredient-card__stepper-btn"
              onClick={handleDecrement}
              aria-label="Diminuer la quantité"
            >
              −
            </button>
            <span className="ingredient-card__stepper-qty">{qty}</span>
            <button
              className="ingredient-card__stepper-btn"
              onClick={handleIncrement}
              aria-label="Augmenter la quantité"
            >
              +
            </button>
          </div>
        )}
      </div>
      <p className="ingredient-card__qty">
        {ingredient.quantity} {ingredient.unit}
      </p>
      <p className="ingredient-card__name">{ingredient.name}</p>
      {product && !product.available && (
        <p className="ingredient-card__unavailable">Indisponible</p>
      )}
    </div>
  )
}

export default IngredientCard
