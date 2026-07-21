'use client'

import { ArrowsClockwise, Check } from '@phosphor-icons/react'
import { Button, Checkbox, Stepper, ChipTag } from '@mealz-product-team/design-system'
import type { Product } from '@/data/types/product'
import { formatPrice } from '@/lib/format'
import './ProductRow.css'

interface ProductRowBaseProps {
  product: Product
  onReplace: () => void
  recipeTag?: string
}

interface SelectableProductRowProps extends ProductRowBaseProps {
  variant: 'selectable'
  checked: boolean
  onToggle: (checked: boolean) => void
  added?: boolean
}

interface InCartProductRowProps extends ProductRowBaseProps {
  variant: 'inCart'
  quantity: number
  onQuantityChange: (quantity: number) => void
}

type ProductRowProps = SelectableProductRowProps | InCartProductRowProps

/** Ligne produit partagée entre la liste de courses (`variant="selectable"`,
 *  case à cocher) et le panier (`variant="inCart"`, stepper de quantité) — même
 *  composant, deux variants, comme dans le design réel (cf. plan). */
export function ProductRow(props: ProductRowProps) {
  const { product, onReplace, recipeTag } = props

  return (
    <div className="product-row">
      <span className="product-row__emoji" aria-hidden="true">{product.emoji}</span>

      <div className="product-row__info">
        <p className="product-row__name">{product.name}</p>
        <p className="product-row__brand">{product.brand}{product.unit ? ` · ${product.unit}` : ''}</p>
        <p className="product-row__price">{formatPrice(product.price)}</p>
        {recipeTag && <ChipTag type="neutral-outline" size="S" label={recipeTag} className="product-row__tag" />}
      </div>

      <div className="product-row__actions">
        {props.variant === 'selectable' && props.added ? (
          <span className="product-row__added">
            <Check size={14} weight="bold" aria-hidden="true" /> Ajouté
          </span>
        ) : (
          <>
            <Button
              variant="tertiary"
              size="S"
              iconOnly={<ArrowsClockwise size={16} aria-hidden="true" />}
              label={`Remplacer ${product.name}`}
              onClick={onReplace}
            />
            {props.variant === 'selectable' ? (
              <Checkbox
                checked={props.checked}
                onChange={(e) => props.onToggle(e.target.checked)}
                aria-label={`Inclure ${product.name} dans le panier`}
              />
            ) : (
              <Stepper
                value={props.quantity}
                onChange={props.onQuantityChange}
                min={0}
                size="S"
                label={`Quantité ${product.name}`}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ProductRow
