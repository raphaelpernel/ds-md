import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Drawer } from './Drawer'

describe('Drawer', () => {
  it('renders the title when no headerContent is provided (regression: marmiton-prototype/recette usage)', () => {
    render(
      <Drawer open onClose={vi.fn()} title="Ma recette">
        <p>body</p>
      </Drawer>,
    )

    expect(screen.getByRole('heading', { name: 'Ma recette' })).toBeInTheDocument()
  })

  it('renders headerContent instead of title when both are provided', () => {
    render(
      <Drawer open onClose={vi.fn()} title="ignored" headerContent={<span>Custom header</span>}>
        <p>body</p>
      </Drawer>,
    )

    expect(screen.getByText('Custom header')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'ignored' })).not.toBeInTheDocument()
  })

  it('always renders the close button regardless of headerContent', () => {
    const onClose = vi.fn()
    render(
      <Drawer open onClose={onClose} headerContent={<span>Custom header</span>}>
        <p>body</p>
      </Drawer>,
    )

    expect(screen.getByRole('button', { name: 'Fermer' })).toBeInTheDocument()
  })
})
