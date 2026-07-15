'use client'

import { useMemo, useState } from 'react'
import { ArrowsClockwise, Check } from '@phosphor-icons/react'
import { Button, Checkbox } from '@mealz-product-team/design-system'
import { useAssistant } from '@/context/AssistantContext'
import { MOCK_PRODUCTS } from '@/data/mock/products'
import type { Product } from '@/data/types/product'
import { formatPrice } from '@/lib/format'
import './ShoppingList.css'

function findAlternative(product: Product, excludeIds: string[]): Product | null {
  const candidates = MOCK_PRODUCTS.filter(
    (p) => p.id !== product.id && !excludeIds.includes(p.id) && p.tags.some((tag) => product.tags.includes(tag)),
  )
  return candidates[0] ?? null
}

export function ShoppingList({ productIds, requestId }: { productIds: string[]; requestId: string }) {
  const { isListRequestAdded, requestAddProducts, getEffectiveProductId, replaceProduct } = useAssistant()
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(productIds.map((id) => [id, true])),
  )

  const added = isListRequestAdded(requestId)

  const rows = useMemo(
    () =>
      productIds
        .map((originalId) => {
          const effectiveId = getEffectiveProductId(originalId)
          const product = MOCK_PRODUCTS.find((p) => p.id === effectiveId)
          return product ? { originalId, product } : null
        })
        .filter(Boolean) as { originalId: string; product: Product }[],
    [productIds, getEffectiveProductId],
  )

  const selectedIds = rows.filter((row) => checked[row.originalId]).map((row) => row.product.id)

  const handleReplace = (originalId: string, product: Product) => {
    const alternative = findAlternative(product, rows.map((r) => r.product.id))
    if (alternative) replaceProduct(originalId, alternative.id)
  }

  return (
    <div className="shopping-list">
      <ul className="shopping-list__items">
        {rows.map(({ originalId, product }) => (
          <li key={originalId} className="shopping-list__item">
            <div className="shopping-list__item-main">
              <span className="shopping-list__item-emoji" aria-hidden="true">{product.emoji}</span>
              <div className="shopping-list__item-info">
                <p className="shopping-list__item-name">{product.name}</p>
                <p className="shopping-list__item-brand">{product.brand}{product.unit ? ` · ${product.unit}` : ''}</p>
              </div>
              <span className="shopping-list__item-price">{formatPrice(product.price)}</span>
            </div>

            <div className="shopping-list__item-actions">
              {added ? (
                <span className="shopping-list__item-added">
                  <Check size={14} weight="bold" aria-hidden="true" /> Ajouté
                </span>
              ) : (
                <>
                  <button
                    type="button"
                    className="shopping-list__replace"
                    onClick={() => handleReplace(originalId, product)}
                    aria-label={`Remplacer ${product.name}`}
                  >
                    <ArrowsClockwise size={14} aria-hidden="true" /> Remplacer
                  </button>
                  <Checkbox
                    checked={!!checked[originalId]}
                    onChange={(e) => setChecked((prev) => ({ ...prev, [originalId]: e.target.checked }))}
                    aria-label={`Inclure ${product.name} dans le panier`}
                  />
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      <Button
        variant={added ? 'secondary' : 'primary'}
        size="M"
        disabled={added || selectedIds.length === 0}
        onClick={() => requestAddProducts(requestId, selectedIds)}
        className="shopping-list__submit"
      >
        {added ? 'Produits déjà ajoutés au panier' : 'Ajouter la sélection au panier'}
      </Button>
    </div>
  )
}

export default ShoppingList
