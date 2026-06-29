'use client'

import { useState } from 'react'
import { ArrowLeft, MagnifyingGlass } from '@phosphor-icons/react'
import { Button } from '../../ui/form/Button/Button'
import { InputField } from '../../ui/form/InputField/InputField'
import { ChipTag } from '../../ui/display/ChipTag/ChipTag'
import { ProductCard } from '../ProductCard/ProductCard'
import { getAisleById, getAllProductIds } from '../../../data/mock/aisles'
import { getProductsByIds, searchProducts } from '../../../data/mock/products'
import './CartAisleView.css'

interface CartAisleViewProps {
  aisleId: string
  onBack: () => void
}

export function CartAisleView({ aisleId, onBack }: CartAisleViewProps) {
  const [query, setQuery] = useState('')
  const [subAisleId, setSubAisleId] = useState<string | null>(null)

  const aisle = getAisleById(aisleId)
  if (!aisle) return null

  const filteredIds = subAisleId
    ? aisle.subAisles?.find((s) => s.id === subAisleId)?.productIds ?? []
    : getAllProductIds(aisle)

  const pool = getProductsByIds(filteredIds)
  const products = query.trim() ? searchProducts(query, pool) : pool

  return (
    <div className="cart-aisle-view">
      <div className="cart-aisle-view__header">
        <Button
          variant="tertiary"
          size="S"
          iconOnly={<ArrowLeft size={16} weight="bold" />}
          label="Retour"
          onClick={onBack}
        />
        <h3 className="cart-aisle-view__title">{aisle.label}</h3>
      </div>

      <InputField
        lIcon={<MagnifyingGlass size={18} weight="regular" />}
        placeholder={`Rechercher dans ${aisle.label}`}
        aria-label={`Rechercher un produit dans ${aisle.label}`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {!!aisle.subAisles?.length && (
        <div className="cart-aisle-view__filters">
          <ChipTag
            label="Tous"
            type="neutral-outline"
            selected={subAisleId === null}
            onClick={() => setSubAisleId(null)}
          />
          {aisle.subAisles.map((sub) => (
            <ChipTag
              key={sub.id}
              label={sub.label}
              type="neutral-outline"
              selected={subAisleId === sub.id}
              onClick={() => setSubAisleId(sub.id)}
            />
          ))}
        </div>
      )}

      <div className="cart-aisle-view__meta">
        <span className="cart-aisle-view__count">{products.length} résultats</span>
      </div>

      <div className="cart-aisle-view__products">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} orientation="vertical" />
        ))}
      </div>
    </div>
  )
}

export default CartAisleView
