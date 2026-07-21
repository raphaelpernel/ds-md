'use client'

import { Check } from '@phosphor-icons/react'
import { Button } from '@mealz-product-team/design-system'
import { useAssistant } from '@/context/AssistantContext'
import { MOCK_PRODUCTS } from '@/data/mock/products'
import { formatPrice } from '@/lib/format'
import { getPricePerKg } from '@/lib/pricing'
import { findAlternatives } from '@/lib/alternatives'
import { FullView } from '@/components/chat/FullView/FullView'
import { Slider } from '@/components/chat/Slider/Slider'
import { ProductDetailContent } from '../ProductDetailContent/ProductDetailContent'
import './ProductSwapView.css'

/** Vue plein cadre de remplacement d'un produit — fiche détaillée + un slider
 *  d'alternatives (le produit courant en tête, marqué "Déjà sélectionné") —
 *  remplacement exclusif : sélectionner une alternative referme la vue. */
export function ProductSwapView({ originalId }: { originalId: string }) {
  const { getEffectiveProductId, replaceProduct, closeFullView } = useAssistant()

  const effectiveId = getEffectiveProductId(originalId)
  const product = MOCK_PRODUCTS.find((p) => p.id === effectiveId)

  if (!product) return null

  const alternatives = findAlternatives(product, [product.id])

  const handleSelect = (alternativeId: string) => {
    replaceProduct(originalId, alternativeId)
    closeFullView()
  }

  return (
    <FullView overMedia>
      <div className="product-swap-view">
        <ProductDetailContent product={product} />

        <div className="product-detail-content__actions">
          <Slider>
            <div className="product-mini-card product-mini-card--active">
              <span className="product-mini-card__emoji" aria-hidden="true">{product.emoji}</span>
              <div className="product-mini-card__info">
                <p className="product-mini-card__name">{product.name}</p>
                <p className="product-mini-card__price">
                  {formatPrice(product.price)}
                  {getPricePerKg(product) && <span> · {getPricePerKg(product)}</span>}
                </p>
              </div>
              <span className="product-mini-card__selected">
                <Check size={14} weight="bold" aria-hidden="true" /> Déjà sélectionné
              </span>
            </div>

            {alternatives.map((alt) => (
              <div key={alt.id} className="product-mini-card">
                <span className="product-mini-card__emoji" aria-hidden="true">{alt.emoji}</span>
                <div className="product-mini-card__info">
                  <p className="product-mini-card__name">{alt.name}</p>
                  <p className="product-mini-card__price">
                    {formatPrice(alt.price)}
                    {getPricePerKg(alt) && <span> · {getPricePerKg(alt)}</span>}
                  </p>
                </div>
                <Button variant="primary" size="XS" onClick={() => handleSelect(alt.id)}>
                  Sélectionner
                </Button>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </FullView>
  )
}

export default ProductSwapView
