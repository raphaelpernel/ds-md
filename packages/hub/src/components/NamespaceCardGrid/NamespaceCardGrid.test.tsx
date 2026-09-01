import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NamespaceCardGrid } from './NamespaceCardGrid'

describe('NamespaceCardGrid', () => {
  it('renders the empty message when there are no cards', () => {
    render(<NamespaceCardGrid cards={[]} emptyMessage="Rien pour l'instant." />)
    expect(screen.getByText("Rien pour l'instant.")).toBeInTheDocument()
  })

  it('renders one card per entry', () => {
    render(
      <NamespaceCardGrid
        cards={[
          { title: 'Prototype A', description: 'Description A', updatedAt: '01/09/2026' },
          { title: 'Prototype B', description: 'Description B', updatedAt: '02/09/2026' },
        ]}
        emptyMessage="Rien pour l'instant."
      />
    )
    expect(screen.getByText('Prototype A')).toBeInTheDocument()
    expect(screen.getByText('Description A')).toBeInTheDocument()
    expect(screen.getByText('Prototype B')).toBeInTheDocument()
    expect(screen.queryByText("Rien pour l'instant.")).not.toBeInTheDocument()
  })

  it('renders a card with an href as a link that opens in a new tab', () => {
    render(
      <NamespaceCardGrid
        cards={[{ title: 'Recipe', description: 'desc', updatedAt: '01/09/2026', href: '/marmiton/recipe' }]}
        emptyMessage="Rien pour l'instant."
      />
    )
    const link = screen.getByRole('link', { name: /Recipe/ })
    expect(link).toHaveAttribute('href', '/marmiton/recipe')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders a card without an href as static (non-link) content', () => {
    render(
      <NamespaceCardGrid
        cards={[{ title: 'Static Card', description: 'desc', updatedAt: '01/09/2026' }]}
        emptyMessage="Rien pour l'instant."
      />
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('Static Card')).toBeInTheDocument()
  })
})
