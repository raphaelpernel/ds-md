'use client'

import { useState } from 'react'
import { Sparkle } from '@phosphor-icons/react'
import { Button, Drawer } from '@mealz-product-team/design-system'
import { ChatShell } from '@/components/chat/ChatShell/ChatShell'

/** Nav entry that opens the assistant drawer — a filled brand-color pill so
 *  it stands out from the plain nav links around it (Accueil / Catégorie / Panier). */
export function AssistantLauncher() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="primary"
        size="S"
        lIcon={<Sparkle size={16} weight="fill" />}
        label="Assistant"
        aria-label="Ouvrir l'assistant shopping"
        onClick={() => setOpen(true)}
      />

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        placement="right"
        mobilePlacement="bottom"
        title="Assistant Shopping"
      >
        <ChatShell hideHeader />
      </Drawer>
    </>
  )
}

export default AssistantLauncher
