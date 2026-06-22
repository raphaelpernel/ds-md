'use client'

import { Button } from '../../ui/form/Button/Button'
import { Stepper } from '../../ui/form/Stepper/Stepper'
import type { CartItem as CartItemType } from '../../../data/types/cart'
import './CartItem.css'

interface CartItemProps {
  item: CartItemType
  onIncrement: () => void
  onDecrement: () => void
  onRemove: () => void
  onReplace?: () => void
}

export function CartItem({ item, onIncrement, onDecrement, onRemove, onReplace }: CartItemProps) {
  const { product, quantity } = item
  const totalPrice = (product.price * quantity).toFixed(2).replace('.', ',')

  return (
    <div className="cart-item">
      <div className="cart-item__emoji-wrap" aria-hidden="true">
        {product.emoji}
      </div>

      <div className="cart-item__info">
        <p className="cart-item__name">{product.name}</p>
        <p className="cart-item__brand">
          {product.brand} · {product.unit}
        </p>
        <button className="cart-item__replace" onClick={onReplace} aria-label={`Remplacer ${product.name}`}>
          Remplacer
        </button>
      </div>

      <div className="cart-item__right">
        <Stepper
          value={quantity}
          onChange={(v) => v > quantity ? onIncrement() : onDecrement()}
          min={1}
          size="S"
          label={`Quantité ${product.name}`}
        />
        <p className="cart-item__price">{totalPrice} €</p>
        <Button
          variant="tertiary"
          size="S"
          iconOnly={<span aria-hidden="true">✕</span>}
          onClick={onRemove}
          aria-label={`Supprimer ${product.name}`}
          className="cart-item__remove"
        />
      </div>
    </div>
  )
}

export default CartItem
