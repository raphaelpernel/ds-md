'use client'

import { Button, Stepper } from '@mealz-product-team/design-system'
import { useAssistant } from '@/context/AssistantContext'
import { MOCK_PRODUCTS } from '@/data/mock/products'
import { formatPrice } from '@/lib/format'
import { getPricePerKg } from '@/lib/pricing'
import { FullView } from '@/components/chat/FullView/FullView'
import { Slider } from '@/components/chat/Slider/Slider'
import { ProductDetailContent } from '../ProductDetailContent/ProductDetailContent'
import './ProductChoiceView.css'

/** Vue plein cadre de comparaison — plusieurs produits proposés pour une même
 *  demande (ex: "je veux du lait" → 3 laits). Contrairement au swap (remplacement
 *  exclusif), chaque option s'ajoute indépendamment : bouton panier tant qu'elle
 *  n'est pas ajoutée, puis stepper de quantité. Cliquer une carte du slider
 *  bascule le produit affiché en haut. */
export function ProductChoiceView({ productIds, focusedProductId }: { productIds: string[]; focusedProductId: string }) {
  const { cart, getEffectiveProductId, requestAddProducts, updateProductQuantity, openProductChoice } = useAssistant()

  const focusedProduct = MOCK_PRODUCTS.find((p) => p.id === focusedProductId)
  const candidates = productIds.map((id) => MOCK_PRODUCTS.find((p) => p.id === id)).filter(Boolean) as typeof MOCK_PRODUCTS

  if (!focusedProduct) return null

  return (
    <FullView overMedia>
      <div className="product-choice-view">
        <ProductDetailContent product={focusedProduct} />

        <div className="product-detail-content__actions">
          <Slider>
            {candidates.map((candidate) => {
              const cartEntry = cart.products.find((p) => getEffectiveProductId(p.productId) === candidate.id)

              return (
                <div
                  key={candidate.id}
                  className={`product-mini-card ${candidate.id === focusedProductId ? 'product-mini-card--active' : ''}`}
                  onClick={() => openProductChoice(productIds, candidate.id)}
                >
                  <span className="product-mini-card__emoji" aria-hidden="true">{candidate.emoji}</span>
                  <div className="product-mini-card__info">
                    <p className="product-mini-card__name">{candidate.name}</p>
                    <p className="product-mini-card__price">
                      {formatPrice(candidate.price)}
                      {getPricePerKg(candidate) && <span> · {getPricePerKg(candidate)}</span>}
                    </p>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    {cartEntry ? (
                      <Stepper
                        value={cartEntry.quantity}
                        onChange={(value) => updateProductQuantity(candidate.id, value)}
                        min={0}
                        size="S"
                        label={`Quantité ${candidate.name}`}
                      />
                    ) : (
                      <Button
                        variant="primary"
                        size="XS"
                        onClick={() => requestAddProducts(`product-choice-${candidate.id}`, [candidate.id])}
                      >
                        Ajouter au panier
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </Slider>
        </div>
      </div>
    </FullView>
  )
}

export default ProductChoiceView
