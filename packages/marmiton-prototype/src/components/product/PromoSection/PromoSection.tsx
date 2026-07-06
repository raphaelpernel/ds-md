'use client'

import { Link } from '@mealz-product-team/design-system'
import { ProductCard } from '../ProductCard/ProductCard'
import type { Product } from '../../../data/types/product'
import './PromoSection.css'

export interface PromoSectionProps {
  products: Product[]
  onAdd?: (product: Product) => void
  onViewAll?: () => void
}

export function PromoSection({ products, onAdd, onViewAll }: PromoSectionProps) {
  if (products.length === 0) return null

  return (
    <section className="promo-section" aria-label="Promos du moment">
      <div className="promo-section__header">
        <h3 className="promo-section__title">Promos du moment</h3>
        {onViewAll && (
          <Link
            href="#"
            size="SM"
            onClick={(e) => {
              e.preventDefault()
              onViewAll()
            }}
            aria-label="Voir toutes les promotions"
          >
            Voir tout
          </Link>
        )}
      </div>

      <div className="promo-section__list" role="list" aria-label="Liste des produits en promotion">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            role="listitem"
            onAdd={onAdd}
          />
        ))}
      </div>
    </section>
  )
}

export default PromoSection
