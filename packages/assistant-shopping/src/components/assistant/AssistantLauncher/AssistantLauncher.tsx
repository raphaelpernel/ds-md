'use client'

import { useState } from 'react'
import { Sparkle } from '@phosphor-icons/react'
import { FAB, Drawer } from '@mealz-product-team/design-system'
import { ChatShell } from '@/components/chat/ChatShell/ChatShell'
import { ChatShellHeader } from '@/components/chat/ChatShell/ChatShellHeader'
import './AssistantLauncher.css'

export function AssistantLauncher() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="assistant-launcher__fab">
        <FAB
          size="M"
          alpha
          icon={<Sparkle size={24} weight="fill" />}
          aria-label="Ouvrir l'assistant shopping"
          onClick={() => setOpen(true)}
        />
      </div>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        placement="right"
        mobilePlacement="bottom"
        headerContent={<ChatShellHeader />}
      >
        <ChatShell hideHeader />
      </Drawer>
    </>
  )
}

export default AssistantLauncher
