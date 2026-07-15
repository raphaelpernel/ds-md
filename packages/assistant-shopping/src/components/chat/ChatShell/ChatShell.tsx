'use client'

import { useEffect, useRef } from 'react'
import { useAssistant } from '@/context/AssistantContext'
import { ChatShellHeader } from './ChatShellHeader'
import { ChatMessage } from '../ChatMessage/ChatMessage'
import { ChatComposer } from '../ChatComposer/ChatComposer'
import './ChatShell.css'

export interface ChatShellProps {
  /** Hides the internal header — use when composing ChatShell inside a container that
   *  renders its own header (e.g. Drawer's headerContent), to avoid a duplicated bar. */
  hideHeader?: boolean
}

export function ChatShell({ hideHeader = false }: ChatShellProps) {
  const { messages, loading } = useAssistant()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className={hideHeader ? 'chat-shell chat-shell--embedded' : 'chat-shell'}>
      {!hideHeader && <ChatShellHeader />}

      <div className="chat-shell__history" ref={scrollRef}>
        <div className="chat-shell__history-inner">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {loading && (
            <div className="chat-shell__loading" role="status">
              <span className="chat-shell__loading-dot" />
              <span className="chat-shell__loading-dot" />
              <span className="chat-shell__loading-dot" />
            </div>
          )}
        </div>
      </div>

      <ChatComposer />
    </div>
  )
}

export default ChatShell
