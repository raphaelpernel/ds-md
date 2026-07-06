'use client'

import { ArrowLeft } from '@phosphor-icons/react'
import { Modal, Button } from '@mealz-product-team/design-system'
import { CartAIPrompt } from './CartAIPrompt'
import { ProductCard } from '../ProductCard/ProductCard'
import type { Product } from '../../../data/types/product'
import './CartAIChatModal.css'

export type ChatTurnType = 'list' | 'product' | 'recipe'

export interface ChatTurn {
  id: number
  prompt: string
  type: ChatTurnType
  products: Product[]
}

interface CartAIChatModalProps {
  open: boolean
  onClose: () => void
  turns: ChatTurn[]
  onSubmit: (prompt: string) => void
  loading?: boolean
}

export function CartAIChatModal({ open, onClose, turns, onSubmit, loading = false }: CartAIChatModalProps) {
  return (
    <Modal open={open} onClose={onClose} hideHeader size="M" className="cart-ai-chat-modal">
      <div className="cart-ai-chat">
        <div className="cart-ai-chat__header">
          <Button
            variant="tertiary"
            size="S"
            iconOnly={<ArrowLeft size={16} weight="bold" />}
            label="Retour au panier"
            onClick={onClose}
          />
          <h3 className="cart-ai-chat__title">Assistant courses</h3>
        </div>

        <div className="cart-ai-chat__history">
          {turns.map((turn) => (
            <div key={turn.id} className="cart-ai-chat__turn">
              <p className="cart-ai-chat__bubble cart-ai-chat__bubble--user">{turn.prompt}</p>

              {turn.type === 'list' ? (
                <div className="cart-ai-chat__list">
                  {turn.products.map((product) => (
                    <ProductCard key={product.id} product={product} context="list" />
                  ))}
                </div>
              ) : (
                <div className="cart-ai-chat__row">
                  {turn.products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      orientation="vertical"
                      deferCartSync
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <p className="cart-ai-chat__loading" role="status">
              Recherche en cours...
            </p>
          )}
        </div>

        <div className="cart-ai-chat__composer">
          <CartAIPrompt onSubmit={onSubmit} loading={loading} hideHeader />
        </div>
      </div>
    </Modal>
  )
}

export default CartAIChatModal
