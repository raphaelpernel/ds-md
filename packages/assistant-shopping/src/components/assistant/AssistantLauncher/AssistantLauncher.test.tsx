import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssistantProvider } from '@/context/AssistantContext'
import { AssistantLauncher } from './AssistantLauncher'

function renderLauncher() {
  return render(
    <AssistantProvider>
      <AssistantLauncher />
    </AssistantProvider>,
  )
}

// Drawer always renders its content in the DOM (for the slide transition) —
// open/closed state is expressed via the `drawer--open` class, not presence.
function isDrawerOpen() {
  return screen.getByRole('dialog').className.includes('drawer--open')
}

describe('AssistantLauncher', () => {
  it('renders the FAB with the drawer closed by default', () => {
    renderLauncher()

    expect(screen.getByRole('button', { name: "Ouvrir l'assistant shopping" })).toBeInTheDocument()
    expect(isDrawerOpen()).toBe(false)
  })

  it('opens the drawer with the ChatShell header content when the FAB is clicked', async () => {
    const user = userEvent.setup()
    renderLauncher()

    await user.click(screen.getByRole('button', { name: "Ouvrir l'assistant shopping" }))

    expect(isDrawerOpen()).toBe(true)
    expect(screen.getByText('Assistant Shopping')).toBeInTheDocument()
  })

  it('closes the drawer when the close button is clicked', async () => {
    const user = userEvent.setup()
    renderLauncher()

    await user.click(screen.getByRole('button', { name: "Ouvrir l'assistant shopping" }))
    await user.click(screen.getByRole('button', { name: 'Fermer' }))

    expect(isDrawerOpen()).toBe(false)
  })
})
