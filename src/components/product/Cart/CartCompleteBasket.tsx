'use client'

import { useState } from 'react'
import { Modal } from '../../ui/feedback/Modal/Modal'
import { CartAIPrompt } from './CartAIPrompt'
import { CartAisles } from './CartAisles'
import { CartAisleView } from './CartAisleView'
import { ProductCard } from '../ProductCard/ProductCard'
import { getAisleById } from '../../../data/mock/aisles'
import { getProductsByIds, MOCK_PRODUCTS } from '../../../data/mock/products'
import type { Product } from '../../../data/types/product'
import './CartCompleteBasket.css'

type NavState =
  | { level: 'home' }
  | { level: 'aisle'; aisleId: string }
  | { level: 'products'; aisleId: string; subAisleId?: string }

const AI_KEYWORDS: Record<string, string[]> = {
  clafoutis: ['p-oeufs', 'p-lait', 'p-farine', 'p-cassonade'],
  pommes: ['p-abricots'],
  pomme: ['p-abricots'],
  salade: ['p-tomates', 'p-oeufs', 'p-thon', 'p-olives'],
  niçoise: ['p-tomates', 'p-oeufs', 'p-thon', 'p-olives'],
  nicoise: ['p-tomates', 'p-oeufs', 'p-thon', 'p-olives'],
  farine: ['p-farine'],
  oeufs: ['p-oeufs'],
  lait: ['p-lait'],
  pain: ['p-pain'],
  dentifrice: ['p-dentifrice'],
}

function resolveAIProducts(prompt: string): Product[] {
  const lower = prompt.toLowerCase()
  const ids = new Set<string>()

  for (const [keyword, productIds] of Object.entries(AI_KEYWORDS)) {
    if (lower.includes(keyword)) {
      productIds.forEach((id) => ids.add(id))
    }
  }

  if (ids.size === 0) {
    return MOCK_PRODUCTS.filter((p) => p.available).slice(0, 3)
  }

  return getProductsByIds([...ids])
}

export function CartCompleteBasket() {
  const [nav, setNav] = useState<NavState>({ level: 'home' })
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResults, setAiResults] = useState<Product[] | null>(null)
  const [aiSearchId, setAiSearchId] = useState(0)

  const isAisleOpen = nav.level !== 'home'

  const handleAisleSelect = (aisleId: string) => {
    const aisle = getAisleById(aisleId)
    if (!aisle) return

    if (aisle.subAisles?.length) {
      setNav({ level: 'aisle', aisleId })
    } else {
      setNav({ level: 'products', aisleId })
    }
  }

  const handleBack = () => {
    if (nav.level === 'products' && nav.subAisleId) {
      setNav({ level: 'aisle', aisleId: nav.aisleId })
      return
    }
    setNav({ level: 'home' })
  }

  const handleBackToHome = () => {
    setNav({ level: 'home' })
  }

  const handleAISubmit = (prompt: string) => {
    setAiLoading(true)

    window.setTimeout(() => {
      setAiResults(resolveAIProducts(prompt))
      setAiSearchId((id) => id + 1)
      setAiLoading(false)
    }, 600)
  }

  return (
    <>
      <div className="cart-complete-basket">
        <CartAIPrompt onSubmit={handleAISubmit} loading={aiLoading} />

        {aiLoading && (
          <p className="cart-complete-basket__loading" role="status">
            Recherche en cours...
          </p>
        )}

        {aiResults && aiResults.length > 0 && !aiLoading && (
          <div className="cart-complete-basket__ai-results">
            <h4 className="cart-complete-basket__ai-title">Suggestions pour vous</h4>
            <div className="cart-complete-basket__ai-list">
              {aiResults.map((product) => (
                <ProductCard
                  key={`${aiSearchId}-${product.id}`}
                  product={product}
                  orientation="horizontal"
                  deferCartSync
                />
              ))}
            </div>
          </div>
        )}

        <CartAisles onSelect={handleAisleSelect} />
      </div>

      <Modal
        open={isAisleOpen}
        onClose={handleBackToHome}
        hideHeader
        size="M"
        className="cart-aisle-modal"
      >
        {nav.level === 'aisle' && (
          <CartAisleView
            aisleId={nav.aisleId}
            onBack={handleBack}
            onBackToHome={handleBackToHome}
            onSelectSubAisle={(subAisleId) =>
              setNav({ level: 'products', aisleId: nav.aisleId, subAisleId })
            }
          />
        )}

        {nav.level === 'products' && (
          <CartAisleView
            aisleId={nav.aisleId}
            subAisleId={nav.subAisleId}
            onBack={handleBack}
            onBackToHome={handleBackToHome}
            onSelectSubAisle={() => {}}
          />
        )}
      </Modal>
    </>
  )
}

export default CartCompleteBasket
