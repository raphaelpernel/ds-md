'use client'

import { Plus } from '@phosphor-icons/react'
import type { Ingredient } from '../../../data/types/recipe'
import type { Product } from '../../../data/types/product'
import type { ViewMode } from './RecipeIngredientWidget'
import { Button } from '../../ui/form/Button/Button'
import { Stepper } from '../../ui/form/Stepper/Stepper'
import { getProductQuantity, useCartOptional } from '../../../context/CartContext'
import './IngredientCard.css'

interface IngredientCardProps {
  ingredient: Ingredient
  product: Product | null
  view?: ViewMode
  recipeId?: string | null
  recipeName?: string | null
}

export function IngredientCard({
  ingredient,
  product,
  view = 'grid',
  recipeId = null,
  recipeName = null,
}: IngredientCardProps) {
  const cart = useCartOptional()
  const quantity = product && cart ? getProductQuantity(cart.state.items, product.id) : 0

  const handleQuantityChange = (newQty: number) => {
    if (!product || !product.available || !cart) return

    if (newQty <= 0) {
      cart.updateQty(product.id, 0)
    } else if (quantity === 0) {
      cart.addItem(product, recipeId, recipeName)
      if (newQty > 1) cart.updateQty(product.id, newQty)
    } else {
      cart.updateQty(product.id, newQty)
    }
  }

  const addButtonControl = (
    <Button
      size="XS"
      variant="primary"
      iconOnly={<Plus size={16} weight="bold" />}
      label={`Ajouter ${ingredient.name} au panier`}
      onClick={() => handleQuantityChange(1)}
      disabled={!product || !product.available}
    />
  )

  const addButton =
    view === 'grid' ? (
      <div className="ingredient-card__stepper">{addButtonControl}</div>
    ) : (
      addButtonControl
    )

  const stepper =
    view === 'grid' ? (
      <div className="ingredient-card__stepper">
        <Stepper
          value={quantity}
          onChange={handleQuantityChange}
          min={0}
          size="XS"
          label={`Quantité ${ingredient.name}`}
          disabled={!product?.available}
        />
      </div>
    ) : (
      <Stepper
        value={quantity}
        onChange={handleQuantityChange}
        min={0}
        size="S"
        label={`Quantité ${ingredient.name}`}
        disabled={!product?.available}
      />
    )

  if (view === 'list') {
    return (
      <div className="ingredient-card ingredient-card--list">
        <div className="ingredient-card__image-wrap">
          <span className="ingredient-card__emoji" aria-hidden="true">
            {ingredient.emoji}
          </span>
        </div>
        <div className="ingredient-card__info">
          <span className="ingredient-card__qty">
            {ingredient.quantity} {ingredient.unit}
          </span>
          <span className="ingredient-card__name">{ingredient.name}</span>
          {product && !product.available && (
            <span className="ingredient-card__unavailable">Indisponible</span>
          )}
        </div>
        <div className="ingredient-card__action">
          {quantity === 0 ? addButton : stepper}
        </div>
      </div>
    )
  }

  return (
    <div className="ingredient-card">
      <div className="ingredient-card__image-wrap">
        <span className="ingredient-card__emoji" aria-hidden="true">
          {ingredient.emoji}
        </span>
        {quantity === 0 ? addButton : stepper}
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
