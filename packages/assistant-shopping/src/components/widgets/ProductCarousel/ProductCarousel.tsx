'use client'

import { Check } from '@phosphor-icons/react'
import { Button } from '@mealz-product-team/design-system'
import { useAssistant } from '@/context/AssistantContext'
import { MOCK_PRODUCTS } from '@/data/mock/products'
import { formatPrice } from '@/lib/format'
import { WidgetCard } from '../WidgetCard/WidgetCard'
import './ProductCarousel.css'

/** Quelques produits comparables pour une demande directe ("je veux des pâtes") —
 *  widget `product-carousel` : chaque carte s'ajoute individuellement, contrairement
 *  à la liste de courses (`shopping-list`) qui valide une sélection en une fois. */
export function ProductCarousel({ productIds }: { productIds: string[] }) {
  const { cart, requestAddProducts, getEffectiveProductId, openProductChoice } = useAssistant()

  const products = productIds.map((id) => MOCK_PRODUCTS.find((p) => p.id === id)).filter(Boolean) as typeof MOCK_PRODUCTS

  return (
    <WidgetCard>
      <div className="product-carousel" role="list">
        {products.map((product) => {
          const added = cart.products.some((p) => getEffectiveProductId(p.productId) === product.id)

          return (
            <article key={product.id} className="product-card" role="listitem">
              <button
                type="button"
                className="product-card__media"
                onClick={() => openProductChoice(productIds, product.id)}
                aria-label={`Voir le détail de ${product.name}`}
              >
                <span className="product-card__emoji" aria-hidden="true">{product.emoji}</span>
              </button>

              <div className="product-card__body">
                <button type="button" className="product-card__name" onClick={() => openProductChoice(productIds, product.id)}>
                  {product.name}
                </button>
                <p className="product-card__brand">{product.brand}{product.unit ? ` · ${product.unit}` : ''}</p>
                <p className="product-card__price">{formatPrice(product.price)}</p>

                {added ? (
                  <span className="product-card__added">
                    <Check size={14} weight="bold" aria-hidden="true" /> Ajouté
                  </span>
                ) : (
                  <Button
                    variant="primary"
                    size="S"
                    aria-label={`Ajouter ${product.name} au panier`}
                    onClick={() => requestAddProducts(`product-${product.id}`, [product.id])}
                  >
                    Ajouter au panier
                  </Button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </WidgetCard>
  )
}

export default ProductCarousel
