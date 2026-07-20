'use client'

import { useMemo, useState } from 'react'
import { Check } from '@phosphor-icons/react'
import { Button, Checkbox } from '@mealz-product-team/design-system'
import { useShoppingActions } from '../../../context/ShoppingContext'
import { MOCK_PRODUCTS } from '../../../data/mock/products'
import { formatPrice } from '../../../lib/format'
import './ShoppingListWidget.css'

export function ShoppingListWidget({ productIds, requestId }: { productIds: string[]; requestId: string }) {
  const { isListRequestAdded, requestAddProducts } = useShoppingActions()
  const [checked, setChecked] = useState<Record<string, boolean>>(() => Object.fromEntries(productIds.map((id) => [id, true])))

  const added = isListRequestAdded(requestId)

  const products = useMemo(
    () => productIds.map((id) => MOCK_PRODUCTS.find((p) => p.id === id)).filter(Boolean) as typeof MOCK_PRODUCTS,
    [productIds],
  )

  const selectedIds = products.filter((p) => checked[p.id]).map((p) => p.id)

  return (
    <div className="shopping-list-widget">
      <ul className="shopping-list-widget__items">
        {products.map((product) => (
          <li key={product.id} className="shopping-list-widget__item">
            <div className="shopping-list-widget__item-main">
              <span className="shopping-list-widget__item-emoji" aria-hidden="true">{product.emoji}</span>
              <div className="shopping-list-widget__item-info">
                <p className="shopping-list-widget__item-name">{product.name}</p>
                <p className="shopping-list-widget__item-price">{formatPrice(product.price)}</p>
              </div>
            </div>
            {!added && (
              <Checkbox
                checked={!!checked[product.id]}
                onChange={(e) => setChecked((prev) => ({ ...prev, [product.id]: e.target.checked }))}
                aria-label={`Inclure ${product.name} dans le panier`}
              />
            )}
          </li>
        ))}
      </ul>

      <Button
        variant={added ? 'secondary' : 'primary'}
        size="M"
        disabled={added || selectedIds.length === 0}
        onClick={() => requestAddProducts(requestId, selectedIds)}
      >
        {added ? (
          <>
            <Check size={14} weight="bold" aria-hidden="true" /> Produits ajoutés au panier
          </>
        ) : (
          'Ajouter la sélection au panier'
        )}
      </Button>
    </div>
  )
}

export default ShoppingListWidget
