import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Sidebar } from './Sidebar'

describe('Sidebar', () => {
  it('renders the Mealz group with Neutral and Guide links', () => {
    render(<Sidebar />)
    expect(screen.getByText('Mealz')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Neutral' })).toHaveAttribute('href', '/neutral')
    expect(screen.getByRole('link', { name: 'Guide' })).toHaveAttribute('href', '/guide')
  })

  it('renders one group per client namespace', () => {
    render(<Sidebar />)
    expect(screen.getByText('Marmiton')).toBeInTheDocument()
    expect(screen.getByText('CoursesU')).toBeInTheDocument()
  })

  it('links each client group to its namespace route', () => {
    render(<Sidebar />)
    const marmitonLinks = screen.getAllByRole('link').filter((link) => link.getAttribute('href') === '/marmiton')
    expect(marmitonLinks).toHaveLength(1)
  })
})
