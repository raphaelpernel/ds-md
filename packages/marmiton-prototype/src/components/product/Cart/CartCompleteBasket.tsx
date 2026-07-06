'use client'

import { useState } from 'react'
import { ArrowLeft, Info, MagnifyingGlass, Storefront } from '@phosphor-icons/react'
import { Modal, Button, InputField } from '@mealz-product-team/design-system'
import { CartAIBanner } from './CartAIBanner'
import { CartAIPromptSuggestions } from './CartAIPromptSuggestions'
import { CartAisles } from './CartAisles'
import { CartAisleView } from './CartAisleView'
import { CartAIChatModal, type ChatTurn, type ChatTurnType } from './CartAIChatModal'
import { ProductCard } from '../ProductCard/ProductCard'
import { PromoSection } from '../PromoSection/PromoSection'
import {
  getProductsByIds,
  getProductVariants,
  MOCK_PRODUCTS,
  PROMO_PRODUCTS,
  searchProducts,
} from '../../../data/mock/products'
import type { Product } from '../../../data/types/product'
import './CartCompleteBasket.css'

type NavState =
  | { level: 'home' }
  | { level: 'aisles' }
  | { level: 'aisle'; aisleId: string }

const RECIPE_KEYWORDS: Record<string, string[]> = {
  clafoutis: ['p-oeufs', 'p-lait', 'p-farine', 'p-cassonade'],
  salade: ['p-tomates', 'p-oeufs', 'p-thon', 'p-olives'],
  niçoise: ['p-tomates', 'p-oeufs', 'p-thon', 'p-olives'],
  nicoise: ['p-tomates', 'p-oeufs', 'p-thon', 'p-olives'],
}

const LIST_KEYWORDS: Record<string, string[]> = {
  liste: ['p-carottes', 'p-pomme-granny', 'p-bananes'],
  courses: ['p-carottes', 'p-pomme-granny', 'p-bananes'],
}

const PRODUCT_KEYWORDS: Record<string, string> = {
  abricot: 'p-abricots',
  abricots: 'p-abricots',
  pomme: 'p-pomme-granny',
  pommes: 'p-pomme-granny',
  farine: 'p-farine',
  oeufs: 'p-oeufs',
  lait: 'p-lait',
  pain: 'p-pain',
  dentifrice: 'p-dentifrice',
}

function classifyAIPrompt(prompt: string): { type: ChatTurnType; products: Product[] } {
  const lower = prompt.toLowerCase()

  for (const [keyword, productIds] of Object.entries(RECIPE_KEYWORDS)) {
    if (lower.includes(keyword)) {
      return { type: 'recipe', products: getProductsByIds(productIds) }
    }
  }

  for (const [keyword, productIds] of Object.entries(LIST_KEYWORDS)) {
    if (lower.includes(keyword)) {
      return { type: 'list', products: getProductsByIds(productIds) }
    }
  }

  for (const [keyword, productId] of Object.entries(PRODUCT_KEYWORDS)) {
    if (lower.includes(keyword)) {
      const base = MOCK_PRODUCTS.find((p) => p.id === productId)
      if (base) return { type: 'product', products: getProductVariants(base) }
    }
  }

  const fallback = MOCK_PRODUCTS.filter((p) => p.available).slice(0, 3)
  return { type: 'product', products: fallback }
}

export function CartCompleteBasket() {
  const [nav, setNav] = useState<NavState>({ level: 'home' })
  const [aiLoading, setAiLoading] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [aislesQuery, setAislesQuery] = useState('')

  const isModalOpen = nav.level !== 'home'

  const handleBackToHome = () => {
    setAislesQuery('')
    setNav({ level: 'home' })
  }

  const handleAISubmit = (prompt: string) => {
    setChatOpen(true)
    setAiLoading(true)

    window.setTimeout(() => {
      const { type, products } = classifyAIPrompt(prompt)
      setTurns((prev) => [...prev, { id: prev.length, prompt, type, products }])
      setAiLoading(false)
    }, 600)
  }

  const aislesResults = aislesQuery.trim() ? searchProducts(aislesQuery) : []

  return (
    <>
      <div className="cart-complete-basket">
        <div className="cart-complete-basket__header">
          <h3 className="cart-complete-basket__title">Compléter mon panier</h3>
          <Button
            variant="tertiary"
            size="XS"
            iconOnly={<Info size={16} weight="regular" />}
            label="En savoir plus sur la saisie assistée"
          />
        </div>
        <CartAIBanner onSubmit={handleAISubmit} loading={aiLoading && turns.length === 0} />
        {turns.length === 0 && (
          <CartAIPromptSuggestions onSelect={handleAISubmit} disabled={aiLoading} />
        )}
        <PromoSection products={PROMO_PRODUCTS} onViewAll={() => {}} />

        

        <Button
          variant="secondary"
          size="M"
          lIcon={<Storefront size={18} weight="regular" />}
          label="Voir les rayons"
          onClick={() => setNav({ level: 'aisles' })}
        />
      </div>

      <Modal
        open={isModalOpen}
        onClose={handleBackToHome}
        hideHeader
        size="M"
        className="cart-aisle-modal"
      >
        {nav.level === 'aisles' && (
          <div className="cart-complete-basket__aisles">
            <div className="cart-complete-basket__aisles-header">
              <Button
                variant="tertiary"
                size="S"
                iconOnly={<ArrowLeft size={16} weight="bold" />}
                label="Retour"
                onClick={handleBackToHome}
              />
              <h3 className="cart-complete-basket__aisles-title">Rayons</h3>
            </div>

            <InputField
              lIcon={<MagnifyingGlass size={18} weight="regular" />}
              placeholder="Rechercher un produit"
              aria-label="Rechercher un produit dans tous les rayons"
              value={aislesQuery}
              onChange={(e) => setAislesQuery(e.target.value)}
            />

            {aislesQuery.trim() ? (
              <div className="cart-complete-basket__aisles-results">
                {aislesResults.map((product) => (
                  <ProductCard key={product.id} product={product} orientation="vertical" />
                ))}
              </div>
            ) : (
              <CartAisles onSelect={(aisleId) => setNav({ level: 'aisle', aisleId })} />
            )}
          </div>
        )}

        {nav.level === 'aisle' && (
          <CartAisleView
            aisleId={nav.aisleId}
            onBack={() => setNav({ level: 'aisles' })}
          />
        )}
      </Modal>

      <CartAIChatModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        turns={turns}
        onSubmit={handleAISubmit}
        loading={aiLoading}
      />
    </>
  )
}

export default CartCompleteBasket
