'use client'

import { ShoppingCart, MapPin, ChatCircleDots } from '@phosphor-icons/react'
import { Button, Badge } from '@mealz-product-team/design-system'
import { useAssistant } from '@/context/AssistantContext'

export function ChatShellHeader() {
  const { store, cartItemsCount, openStoreLocator, openCart } = useAssistant()

  return (
    <div className="chat-shell__header">
      <div className="chat-shell__brand">
        <span className="chat-shell__brand-icon" aria-hidden="true">
          <ChatCircleDots size={22} weight="fill" />
        </span>
        <div>
          <p className="chat-shell__title">Assistant Shopping</p>
          <p className="chat-shell__subtitle">Carrefour Belgique · Prototype</p>
        </div>
      </div>

      <div className="chat-shell__actions">
        <Button
          variant={store ? 'secondary' : 'primary'}
          size="S"
          lIcon={<MapPin size={16} weight="bold" />}
          label={store ? store.name : 'Choisir un magasin'}
          onClick={openStoreLocator}
        />
        <div className="chat-shell__cart-button">
          <Button
            variant="tertiary"
            size="S"
            iconOnly={<ShoppingCart size={18} weight="bold" />}
            label="Voir mon panier"
            onClick={openCart}
          />
          {cartItemsCount > 0 && (
            <span className="chat-shell__cart-badge">
              <Badge variant="brand" label={String(cartItemsCount)} />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatShellHeader
