'use client'

import { MapPin } from '@phosphor-icons/react'
import { Button } from '@mealz-product-team/design-system'
import { useAssistant } from '@/context/AssistantContext'

/** Store-selection CTA. Hidden entirely on a retailer's own site (the site
 *  already has its own store picker — see `isRetailerBrand`). */
export function ChatShellActionsBar() {
  const { store, openStoreLocator, isRetailerBrand } = useAssistant()

  if (isRetailerBrand) return null

  return (
    <Button
      variant={store ? 'secondary' : 'primary'}
      size="S"
      lIcon={<MapPin size={16} weight="bold" />}
      label={store ? store.name : 'Choisir un magasin'}
      onClick={openStoreLocator}
    />
  )
}

export default ChatShellActionsBar
