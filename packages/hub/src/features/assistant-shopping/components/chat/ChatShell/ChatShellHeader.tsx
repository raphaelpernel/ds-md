'use client'

import { ChatCircleDots } from '@phosphor-icons/react'
import { useAssistant } from '@/features/assistant-shopping/context/AssistantContext'
import { ChatShellActionsBar } from './ChatShellActionsBar'

/** Full standalone header — brand + title + actions. Used on the full-page chat route.
 *  When ChatShell is embedded in the assistant Drawer, the Drawer renders its own
 *  title/close bar instead, and only `ChatShellActionsBar` is shown below it. */
export function ChatShellHeader() {
  return (
    <div className="assistant-shopping-chat-shell__header">
      <div className="assistant-shopping-chat-shell__brand">
        <span className="assistant-shopping-chat-shell__brand-icon" aria-hidden="true">
          <ChatCircleDots size={22} weight="fill" />
        </span>
        <div>
          <p className="assistant-shopping-chat-shell__title">Assistant Shopping</p>
        </div>
      </div>

      <div className="assistant-shopping-chat-shell__actions">
        <ChatShellActionsBar />
      </div>
    </div>
  )
}

export default ChatShellHeader
