'use client'

import { MapPin } from '@phosphor-icons/react'
import { Button } from '@mealz-product-team/design-system'
import { useAssistant } from '@/features/assistant-shopping/context/AssistantContext'

export function ChatShellActionsBar() {
  const { store, openStoreLocator } = useAssistant()

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
