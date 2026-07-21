'use client'

import { ChatCircleDots } from '@phosphor-icons/react'
import { useAssistant } from '@/context/AssistantContext'
import { ChatShellActionsBar } from './ChatShellActionsBar'

/** Full standalone header — brand + title + actions. Used on the full-page chat route.
 *  When ChatShell is embedded in the assistant Drawer, the Drawer renders its own
 *  title/close bar instead, and only `ChatShellActionsBar` is shown below it. */
export function ChatShellHeader() {
  const { isRetailerBrand } = useAssistant()

  return (
    <div className="chat-shell__header">
      <div className="chat-shell__brand">
        <span className="chat-shell__brand-icon" aria-hidden="true">
          <ChatCircleDots size={22} weight="fill" />
        </span>
        <div>
          <p className="chat-shell__title">Assistant Shopping</p>
        </div>
      </div>

      {!isRetailerBrand && (
        <div className="chat-shell__actions">
          <ChatShellActionsBar />
        </div>
      )}
    </div>
  )
}

export default ChatShellHeader
