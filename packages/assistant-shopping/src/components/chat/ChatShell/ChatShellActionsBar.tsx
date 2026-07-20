'use client'

import { Fragment } from 'react'
import { ShoppingCart, MapPin } from '@phosphor-icons/react'
import { Button, Badge } from '@mealz-product-team/design-system'
import { useAssistant } from '@/context/AssistantContext'

/** The 2 CTAs only, no wrapper — the parent container (`.chat-shell__header` or
 *  `.chat-shell__toolbar`) already provides its own flex/gap layout, so this stays
 *  a plain fragment to avoid a redundant nested flex wrapper. */
export function ChatShellActionsBar() {
  const { store, cartItemsCount, openStoreLocator, openCart } = useAssistant()

  return (
    <Fragment>
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
    </Fragment>
  )
}

export default ChatShellActionsBar
