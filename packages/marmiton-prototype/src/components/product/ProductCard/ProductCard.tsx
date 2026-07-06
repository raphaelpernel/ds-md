'use client'

import { useState, type HTMLAttributes } from 'react'
import { ArrowsClockwise, Plus, Trash } from '@phosphor-icons/react'
import { ChipTag, Button, Checkbox, Stepper } from '@mealz-product-team/design-system'
import { getProductQuantity, useCartOptional } from '@/context/CartContext'
import type { Product } from '../../../data/types/product'
import './ProductCard.css'

function formatPrice(price: number): string {
  return price.toFixed(2).replace('.', ',') + '\u00a0€'
}

type ProductCardBaseProps = {
  product: Product
  role?: HTMLAttributes<HTMLElement>['role']
}

type ProductCardCatalogProps = ProductCardBaseProps & {
  context?: 'catalog'
  orientation?: 'vertical' | 'horizontal'
  /** Fallback when rendered outside CartProvider (e.g. Storybook) */
  onAdd?: (product: Product) => void
  recipeId?: string | null
  recipeName?: string | null
  /**
   * Ignore cart quantity until the user adds from this card
   * (e.g. AI suggestions that must not appear pre-added).
   */
  deferCartSync?: boolean
}

type ProductCardCartProps = ProductCardBaseProps & {
  context: 'cart'
  quantity: number
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
  onReplace?: () => void
}

type ProductCardListProps = ProductCardBaseProps & {
  /** Flat shopping-list row: price + recipe tag + replace + checkbox, no add/stepper */
  context: 'list'
  recipeName?: string
  /** Defaults to checked; omit onCheckedChange to let the card manage its own toggle state */
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  onReplace?: () => void
}

export type ProductCardProps = ProductCardCatalogProps | ProductCardCartProps | ProductCardListProps

export function ProductCard(props: ProductCardProps) {
  const { product, role } = props
  const isCart = props.context === 'cart'
  const isList = props.context === 'list'
  const orientation = isCart || isList ? 'horizontal' : (props.orientation ?? 'vertical')
  const isHorizontal = orientation === 'horizontal'

  const cart = useCartOptional()
  const [localActivated, setLocalActivated] = useState(false)
  const [localChecked, setLocalChecked] = useState(true)

  const catalogProps = !isCart && !isList ? (props as ProductCardCatalogProps) : null
  const cartQuantity = cart ? getProductQuantity(cart.state.items, product.id) : 0
  const quantity = isCart
    ? props.quantity
    : catalogProps?.deferCartSync && !localActivated
      ? 0
      : cartQuantity

  const hasPromo = !!product.promo
  const stepperSize = isHorizontal ? 'S' : 'XS'

  const handleCatalogQuantityChange = (newQty: number) => {
    if (!product.available || isCart || isList || !catalogProps) return

    const { onAdd, recipeId = null, recipeName = null, deferCartSync = false } = catalogProps

    if (cart) {
      if (newQty <= 0) {
        cart.updateQty(product.id, 0)
        if (deferCartSync) setLocalActivated(false)
      } else if (cartQuantity === 0) {
        cart.addItem(product, recipeId, recipeName)
        if (deferCartSync) setLocalActivated(true)
        if (newQty > 1) cart.updateQty(product.id, newQty)
      } else {
        cart.updateQty(product.id, newQty)
        if (deferCartSync && newQty > 0) setLocalActivated(true)
      }
      return
    }

    if (newQty > 0) onAdd?.(product)
  }

  const handleQuantityChange = isCart ? props.onQuantityChange : handleCatalogQuantityChange

  const action =
    quantity > 0 ? (
      <Stepper
        value={quantity}
        onChange={handleQuantityChange}
        min={0}
        size={stepperSize}
        label={`Quantité ${product.name}`}
        disabled={!product.available}
      />
    ) : (
      <Button
        size={isHorizontal ? 'S' : 'XS'}
        variant="primary"
        iconOnly={<Plus size={16} weight="bold" />}
        label={`Ajouter ${product.name} au panier`}
        onClick={() => handleQuantityChange(1)}
        disabled={!product.available}
      />
    )

  const displayPrice = isCart
    ? formatPrice(product.price * quantity)
    : formatPrice(product.price)

  const cardClassName = [
    'product-card',
    isHorizontal && 'product-card--horizontal',
    isCart && 'product-card--cart',
  ]
    .filter(Boolean)
    .join(' ')

  const meta = (
    <p className="product-card__meta">
      {product.brand}
      {product.unit ? ` · ${product.unit}` : ''}
    </p>
  )

  const promoTag = hasPromo ? (
    <ChipTag
      category="promo"
      appearance="solid"
      size="S"
      label={`-${product.promo!.percent}%`}
      aria-label={`Promotion -${product.promo!.percent}%`}
      className="product-card__tag"
    />
  ) : null

  if (isList) {
    const { recipeName, checked, onCheckedChange, onReplace } = props
    const isChecked = checked ?? localChecked

    const handleCheckedChange = (value: boolean) => {
      onCheckedChange?.(value)
      if (checked === undefined) setLocalChecked(value)
    }

    return (
      <article className="product-card product-card--list" aria-label={product.name} role={role}>
        <div className="product-card__main">
          <div className="product-card__media" aria-hidden="true">
            <span className="product-card__emoji">{product.emoji}</span>
          </div>

          <div className="product-card__content">
            <p className="product-card__name">{product.name}</p>
            {meta}
            <div className="product-card__price product-card__price--row">
              <span className="product-card__price-current">{displayPrice}</span>
              {product.pricePerUnit && (
                <span className="product-card__price-unit">{product.pricePerUnit}</span>
              )}
            </div>
            {recipeName && (
              <ChipTag
                label={recipeName}
                type="neutral-outline"
                size="S"
                className="product-card__recipe-tag"
              />
            )}
          </div>
        </div>

        <div className="product-card__list-footer">
          <button
            type="button"
            className="product-card__replace product-card__replace--icon"
            onClick={onReplace}
            aria-label={`Remplacer ${product.name}`}
          >
            <ArrowsClockwise size={16} aria-hidden="true" />
            Remplacer
          </button>
          <Checkbox
            checked={isChecked}
            onChange={(e) => handleCheckedChange(e.target.checked)}
            aria-label={`Inclure ${product.name} dans le panier`}
          />
        </div>
      </article>
    )
  }

  if (isHorizontal) {
    return (
      <article className={cardClassName} aria-label={product.name} role={role}>
        {promoTag}

        <div className="product-card__main">
          <div className="product-card__media" aria-hidden="true">
            <span className="product-card__emoji">{product.emoji}</span>
          </div>

          <div className="product-card__details">
            <div className="product-card__content">
              <p className="product-card__name">{product.name}</p>
              {meta}
              {isCart && (
                <button
                  type="button"
                  className="product-card__replace"
                  onClick={props.onReplace}
                  aria-label={`Remplacer ${product.name}`}
                >
                  Remplacer
                </button>
              )}
            </div>

            {isCart && (
              <div className="product-card__remove-wrap">
                <Button
                  size="S"
                  variant="tertiary"
                  iconOnly={<Trash size={16} aria-hidden="true" />}
                  label={`Supprimer ${product.name}`}
                  onClick={props.onRemove}
                />
              </div>
            )}
          </div>
        </div>

        <div className="product-card__footer">
          <div className="product-card__price">
            {!isCart && hasPromo && (
              <span className="product-card__price-strike">
                {formatPrice(product.promo!.originalPrice)}
              </span>
            )}
            <span className="product-card__price-current">{displayPrice}</span>
          </div>
          {action}
        </div>
      </article>
    )
  }

  return (
    <article className={cardClassName} aria-label={product.name} role={role}>
      {promoTag}

      <div className="product-card__media" aria-hidden="true">
        <span className="product-card__emoji">{product.emoji}</span>
      </div>

      <div className="product-card__body">
        <div className="product-card__content">
          <p className="product-card__name">{product.name}</p>
          <p className="product-card__meta">{product.brand}</p>
        </div>

        <div className="product-card__footer">
          <div className="product-card__price">
            {hasPromo && (
              <span className="product-card__price-strike">
                {formatPrice(product.promo!.originalPrice)}
              </span>
            )}
            <span className="product-card__price-current">{displayPrice}</span>
          </div>
          {action}
        </div>
      </div>
    </article>
  )
}

export default ProductCard
