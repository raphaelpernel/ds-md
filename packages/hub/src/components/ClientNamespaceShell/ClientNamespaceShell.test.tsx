import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const { headersMock } = vi.hoisted(() => ({ headersMock: vi.fn() }))
vi.mock('next/headers', () => ({ headers: headersMock }))

import { ClientNamespaceShell } from './ClientNamespaceShell'

describe('ClientNamespaceShell', () => {
  beforeEach(() => {
    headersMock.mockReset()
  })

  it('renders the master shell (sidebar) when x-hub-is-master is 1', async () => {
    headersMock.mockResolvedValue(new Headers({ 'x-hub-is-master': '1' }))
    const jsx = await ClientNamespaceShell({ children: <p>content</p> })
    render(jsx)
    expect(screen.getByRole('navigation', { name: 'Navigation du hub' })).toBeInTheDocument()
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('renders children unwrapped, no sidebar, when not a master session', async () => {
    headersMock.mockResolvedValue(new Headers({ 'x-hub-is-master': '0' }))
    const jsx = await ClientNamespaceShell({ children: <p>content</p> })
    render(jsx)
    expect(screen.queryByRole('navigation', { name: 'Navigation du hub' })).not.toBeInTheDocument()
    expect(screen.getByText('content')).toBeInTheDocument()
  })
})
