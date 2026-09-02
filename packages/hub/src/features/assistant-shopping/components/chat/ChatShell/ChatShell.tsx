'use client'

import { useEffect, useRef } from 'react'
import { useAssistant } from '@/features/assistant-shopping/context/AssistantContext'
import { ChatShellHeader } from './ChatShellHeader'
import { ChatShellActionsBar } from './ChatShellActionsBar'
import { ChatMessage } from '../ChatMessage/ChatMessage'
import { ChatComposer } from '../ChatComposer/ChatComposer'
import { FullViewRenderer } from '../FullView/FullViewRenderer'
import './ChatShell.css'

export interface ChatShellProps {
  /** Use when composing ChatShell inside a container that renders its own title/close
   *  bar (e.g. Drawer with a `title`), to avoid a duplicated header. Only the actions
   *  toolbar (store + cart) is shown instead, as a slim banner fixed under that header. */
  hideHeader?: boolean
}

export function ChatShell({ hideHeader = false }: ChatShellProps) {
  const { messages, loading, fullView } = useAssistant()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (fullView) return
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading, fullView])

  return (
    <div className="assistant-shopping-feature">
      <div className={hideHeader ? 'assistant-shopping-chat-shell assistant-shopping-chat-shell--embedded' : 'assistant-shopping-chat-shell'}>
        {hideHeader ? (
          <div className="assistant-shopping-chat-shell__toolbar">
            <ChatShellActionsBar />
          </div>
        ) : (
          <ChatShellHeader />
        )}

      <div className="assistant-shopping-chat-shell__history" ref={scrollRef} role="log" aria-live="polite" aria-relevant="additions text">
        {fullView ? (
          <FullViewRenderer state={fullView} />
        ) : (
          <div className="assistant-shopping-chat-shell__history-inner">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {loading && (
              <div className="assistant-shopping-chat-shell__loading" role="status">
                <span className="assistant-shopping-chat-shell__loading-dot" />
                <span className="assistant-shopping-chat-shell__loading-dot" />
                <span className="assistant-shopping-chat-shell__loading-dot" />
              </div>
            )}
          </div>
        )}
      </div>

        <ChatComposer />
      </div>
    </div>
  )
}

export default ChatShell
