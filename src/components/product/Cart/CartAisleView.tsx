'use client'

import { ArrowLeft, CaretRight, Storefront } from '@phosphor-icons/react'
import { Button } from '../../ui/form/Button/Button'
import { ListItem } from '../../ui/display/ListItem/ListItem'
import { ProductCard } from '../ProductCard/ProductCard'
import { getAisleById, getSubAisle } from '../../../data/mock/aisles'
import { getProductsByIds } from '../../../data/mock/products'
import './CartAisleView.css'

interface CartAisleViewProps {
  aisleId: string
  subAisleId?: string
  onBack: () => void
  onBackToHome: () => void
  onSelectSubAisle: (subAisleId: string) => void
}

export function CartAisleView({
  aisleId,
  subAisleId,
  onBack,
  onBackToHome,
  onSelectSubAisle,
}: CartAisleViewProps) {
  const aisle = getAisleById(aisleId)
  if (!aisle) return null

  const subAisle = subAisleId ? getSubAisle(aisleId, subAisleId) : undefined
  const isProductView = !!subAisle || (!aisle.subAisles?.length && !!aisle.productIds?.length)

  const header = (title: string) => (
    <div className="cart-aisle-view__header">
      <Button
        variant="tertiary"
        size="S"
        iconOnly={<ArrowLeft size={16} weight="bold" />}
        label="Retour"
        onClick={onBack}
      />
      <h3 className="cart-aisle-view__title">{title}</h3>
    </div>
  )

  if (isProductView) {
    const productIds = subAisle?.productIds ?? aisle.productIds ?? []
    const products = getProductsByIds(productIds)
    const title = subAisle?.label ?? aisle.label

    return (
      <div className="cart-aisle-view">
        <Button
          variant="secondary"
          size="S"
          lIcon={<Storefront size={16} weight="regular" />}
          label="Retour aux rayons"
          onClick={onBackToHome}
        />

        {header(title)}

        <div className="cart-aisle-view__meta">
          <span className="cart-aisle-view__count">{products.length} résultats</span>
        </div>

        <div className="cart-aisle-view__products">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              orientation="horizontal"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="cart-aisle-view">
      <Button
        variant="secondary"
        size="S"
        lIcon={<Storefront size={16} weight="regular" />}
        label="Retour aux rayons"
        onClick={onBackToHome}
      />

      {header(aisle.label)}

      <div className="cart-aisle-view__sub-list">
        {aisle.subAisles?.map((sub) => (
          <ListItem
            key={sub.id}
            label={sub.label}
            onClick={() => onSelectSubAisle(sub.id)}
            rSlot={<CaretRight size={18} weight="bold" />}
          />
        ))}
      </div>
    </div>
  )
}

export default CartAisleView
