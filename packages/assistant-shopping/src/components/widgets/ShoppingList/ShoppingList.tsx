'use client'

import { useMemo, useState } from 'react'
import { useAssistant } from '@/context/AssistantContext'
import { MOCK_PRODUCTS } from '@/data/mock/products'
import type { Product } from '@/data/types/product'
import { formatPrice } from '@/lib/format'
import { WidgetCard } from '../WidgetCard/WidgetCard'
import { WidgetHeader } from '../WidgetHeader/WidgetHeader'
import { WidgetFooter } from '../WidgetFooter/WidgetFooter'
import { ProductRow } from '../ProductRow/ProductRow'
import './ShoppingList.css'

const INLINE_ROW_CAP = 9

interface ShoppingListProps {
  productIds: string[]
  requestId: string
  /** Rendu par `FullViewRenderer` — pas de cap à 9 lignes, pas de bouton "agrandir". */
  fullView?: boolean
}

export function ShoppingList({ productIds, requestId, fullView = false }: ShoppingListProps) {
  const { isListRequestAdded, requestAddProducts, getEffectiveProductId, openProductSwap, openFullView } = useAssistant()
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

  const visibleRows = fullView ? rows : rows.slice(0, INLINE_ROW_CAP)
  const overflowRows = fullView ? [] : rows.slice(INLINE_ROW_CAP)

  const selectedIds = rows.filter((row) => checked[row.originalId]).map((row) => row.product.id)
  const total = rows.filter((row) => checked[row.originalId]).reduce((sum, row) => sum + row.product.price, 0)

  const expandToFullView = () => openFullView({ type: 'shopping-list', requestId, productIds })

  return (
    <WidgetCard className="shopping-list widget-card--flush">
      <WidgetHeader onExpand={fullView ? undefined : expandToFullView} />

      <ul className="shopping-list__items">
        {visibleRows.map(({ originalId, product }) => (
          <li key={originalId}>
            <ProductRow
              variant="selectable"
              product={product}
              checked={!!checked[originalId]}
              onToggle={(value) => setChecked((prev) => ({ ...prev, [originalId]: value }))}
              added={added}
              onReplace={() => openProductSwap(originalId)}
            />
          </li>
        ))}
      </ul>

      {overflowRows.length > 0 ? (
        <WidgetFooter
          type="more-products"
          count={overflowRows.length}
          emojis={overflowRows.map((r) => r.product.emoji)}
          onShowAll={expandToFullView}
        />
      ) : (
        <WidgetFooter
          type="default"
          label={added ? 'Produits déjà ajoutés au panier' : `Ajouter la sélection au panier (${formatPrice(total)})`}
          disabled={added || selectedIds.length === 0}
          onSubmit={() => requestAddProducts(requestId, selectedIds)}
          secondaryAction={added}
        />
      )}
    </WidgetCard>
  )
}

export default ShoppingList
