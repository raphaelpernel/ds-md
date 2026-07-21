'use client'

import { useMemo, useState } from 'react'
import { Check } from '@phosphor-icons/react'
import { useAssistant } from '@/context/AssistantContext'
import { formatPrice } from '@/lib/format'
import { MOCK_PRODUCTS } from '@/data/mock/products'
import { WidgetCard } from '../WidgetCard/WidgetCard'
import { WidgetHeader } from '../WidgetHeader/WidgetHeader'
import { ProductRow } from '../ProductRow/ProductRow'
import { Slider } from '@/components/chat/Slider/Slider'
import './CartWidget.css'

interface CartWidgetProps {
  /** Rendu par `FullViewRenderer` — pas de bouton "agrandir". */
  fullView?: boolean
}

export function CartWidget({ fullView = false }: CartWidgetProps) {
  const { cart, cartItemsCount, updateProductQuantity, getEffectiveProductId, openProductSwap, openFullView } = useAssistant()
  const [selectedRecipeTag, setSelectedRecipeTag] = useState<string | null>(null)

  // `originalId` reste la clé stable de la ligne panier (quantité, swap) — le
  // produit affiché passe par `getEffectiveProductId` pour refléter un swap
  // éventuel, exactement comme dans `ShoppingList`.
  const productRows = cart.products
    .map((entry) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === getEffectiveProductId(entry.productId))
      return product ? { originalId: entry.productId, product, quantity: entry.quantity, recipeTag: entry.recipeTag } : null
    })
    .filter(Boolean) as { originalId: string; product: (typeof MOCK_PRODUCTS)[number]; quantity: number; recipeTag?: string }[]

  const recipeTags = useMemo(() => {
    const byTag = new Map<string, number>()
    for (const row of productRows) {
      if (!row.recipeTag) continue
      byTag.set(row.recipeTag, (byTag.get(row.recipeTag) ?? 0) + row.product.price * row.quantity)
    }
    return Array.from(byTag.entries()).map(([name, total]) => ({ name, total }))
  }, [productRows])

  const visibleRows = selectedRecipeTag ? productRows.filter((row) => row.recipeTag === selectedRecipeTag) : productRows

  const grandTotal = productRows.reduce((sum, p) => sum + p.product.price * p.quantity, 0)

  if (productRows.length === 0) {
    return (
      <WidgetCard className="cart-widget--empty">
        <p>Votre panier est vide pour le moment.</p>
      </WidgetCard>
    )
  }

  return (
    <WidgetCard className="widget-card--flush">
      <WidgetHeader
        variant="cart"
        cartCount={cartItemsCount}
        cartTotal={grandTotal}
        onExpand={fullView ? undefined : () => openFullView({ type: 'cart' })}
      />

      {recipeTags.length > 0 && (
        <Slider className="cart-widget__recipes">
          {recipeTags.map(({ name, total }) => {
            const selected = selectedRecipeTag === name
            return (
              <button
                key={name}
                type="button"
                className={`cart-widget__recipe-token ${selected ? 'cart-widget__recipe-token--selected' : ''}`}
                aria-pressed={selected}
                onClick={() => setSelectedRecipeTag(selected ? null : name)}
              >
                <span className="cart-widget__recipe-token-name">{name}</span>
                <span className="cart-widget__recipe-token-price">{formatPrice(total)}</span>
                <span className="cart-widget__recipe-token-check" aria-hidden="true">
                  {selected && <Check size={12} weight="bold" />}
                </span>
              </button>
            )
          })}
        </Slider>
      )}

      <ul className="cart-widget__items">
        {visibleRows.map(({ originalId, product, quantity, recipeTag }) => (
          <li key={originalId}>
            <ProductRow
              variant="inCart"
              product={product}
              quantity={quantity}
              onQuantityChange={(value) => updateProductQuantity(originalId, value)}
              recipeTag={recipeTag}
              onReplace={() => openProductSwap(originalId)}
            />
          </li>
        ))}
      </ul>
    </WidgetCard>
  )
}

export default CartWidget
