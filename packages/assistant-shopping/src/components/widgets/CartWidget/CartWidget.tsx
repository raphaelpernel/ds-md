'use client'

import { Trash } from '@phosphor-icons/react'
import { Button, Stepper, ChipTag } from '@mealz-product-team/design-system'
import { useAssistant } from '@/context/AssistantContext'
import { formatPrice } from '@/lib/format'
import { MOCK_PRODUCTS } from '@/data/mock/products'
import { WidgetCard } from '../WidgetCard/WidgetCard'
import './CartWidget.css'

export function CartWidget() {
  const { cart, updateProductQuantity, removeProductFromCart } = useAssistant()

  const productRows = cart.products
    .map((entry) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === entry.productId)
      return product ? { product, quantity: entry.quantity, recipeTag: entry.recipeTag } : null
    })
    .filter(Boolean) as { product: (typeof MOCK_PRODUCTS)[number]; quantity: number; recipeTag?: string }[]

  const grandTotal = productRows.reduce((sum, p) => sum + p.product.price * p.quantity, 0)

  if (productRows.length === 0) {
    return (
      <WidgetCard className="cart-widget--empty">
        <p>Votre panier est vide pour le moment.</p>
      </WidgetCard>
    )
  }

  return (
    <WidgetCard className="cart-widget">
      {productRows.map(({ product, quantity, recipeTag }) => (
        <div key={product.id} className="cart-widget__row">
          <span className="cart-widget__emoji" aria-hidden="true">{product.emoji}</span>
          <div className="cart-widget__row-info">
            <p className="cart-widget__row-name">{product.name}</p>
            <p className="cart-widget__row-meta">{formatPrice(product.price)} / unité</p>
            {recipeTag && (
              <ChipTag type="neutral-outline" size="S" label={recipeTag} className="cart-widget__row-tag" />
            )}
          </div>
          <div className="cart-widget__row-actions">
            <Stepper
              value={quantity}
              onChange={(value) => updateProductQuantity(product.id, value)}
              min={0}
              size="S"
              label={`Quantité ${product.name}`}
            />
            <Button
              variant="tertiary"
              size="S"
              iconOnly={<Trash size={16} aria-hidden="true" />}
              label={`Supprimer ${product.name}`}
              onClick={() => removeProductFromCart(product.id)}
            />
          </div>
        </div>
      ))}

      <div className="cart-widget__total">
        <span>Total</span>
        <span>{formatPrice(grandTotal)}</span>
      </div>
    </WidgetCard>
  )
}

export default CartWidget
