import { render, screen } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const assistant = {
  messages: [{ id: 'welcome', role: 'assistant', text: 'Bienvenue' }],
  loading: false,
  fullView: null,
  store: null,
  openStoreLocator: vi.fn(),
  cartItemsCount: 0,
}

vi.mock('@/features/assistant-shopping/context/AssistantContext', () => ({
  useAssistant: () => assistant,
}))
vi.mock('../ChatMessage/ChatMessage', () => ({ ChatMessage: ({ message }: { message: { text: string } }) => <p>{message.text}</p> }))
vi.mock('../ChatComposer/ChatComposer', () => ({ ChatComposer: () => <input aria-label="Message" /> }))
vi.mock('./ChatShellHeader', () => ({ ChatShellHeader: () => <header>Assistant Shopping</header> }))
vi.mock('./ChatShellActionsBar', () => ({ ChatShellActionsBar: () => <button>Choisir un magasin</button> }))
vi.mock('../FullView/FullViewRenderer', () => ({ FullViewRenderer: () => null }))

import { ChatShell } from './ChatShell'

describe('ChatShell accessibility', () => {
  beforeAll(() => {
    HTMLElement.prototype.scrollTo = vi.fn()
  })

  beforeEach(() => vi.clearAllMocks())

  it('exposes conversation history as a polite live log', () => {
    render(<ChatShell />)
    const history = screen.getByRole('log')
    expect(history).toHaveAttribute('aria-live', 'polite')
    expect(history).toHaveAttribute('aria-relevant', 'additions text')
  })
})
