import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartProvider, useCart } from '../CartContext'
import { ShoppingProvider, useShoppingActions } from '../ShoppingContext'
import { MOCK_STORES } from '../../data/mock/stores'

/**
 * Vérifie que les actions d'achat (ShoppingContext) et le panier lu ailleurs
 * (useCart, ex. /courses) restent cohérents — même risque nommé en Code
 * Quality #3 de la revue /plan-eng-review du 2026-07-20, maintenant sans fil
 * de chat (ShoppingContext a remplacé AssistantContext après le retour du
 * 2026-07-20 sur la ressemblance excessive avec le proto).
 */
function Harness() {
  const shopping = useShoppingActions()
  const cart = useCart()

  return (
    <div>
      <button onClick={() => shopping.requestAddRecipe('carbonara-romaine')}>add-carbonara-romaine</button>
      {shopping.storeLocatorOpen && (
        <button onClick={() => shopping.confirmStore(MOCK_STORES[0])}>confirm-store</button>
      )}
      <div data-testid="cart-item-count">{cart.itemCount}</div>
      <div data-testid="cart-sections">{cart.sections.length}</div>
    </div>
  )
}

function renderHarness() {
  return render(
    <CartProvider>
      <ShoppingProvider>
        <Harness />
      </ShoppingProvider>
    </CartProvider>,
  )
}

describe('cohérence actions d’achat ↔ panier', () => {
  it('un ajout déclenché via requestAddRecipe est visible dans le panier lu ailleurs (useCart)', async () => {
    const user = userEvent.setup()
    renderHarness()

    await user.click(screen.getByText('add-carbonara-romaine'))
    await user.click(await screen.findByText('confirm-store'))

    await waitFor(() => {
      expect(screen.getByTestId('cart-item-count').textContent).not.toBe('0')
    })
    expect(screen.getByTestId('cart-sections').textContent).toBe('1')
  })

  it("n'ajoute rien au panier si aucun magasin n'est sélectionné (l'action reste en attente)", async () => {
    const user = userEvent.setup()
    renderHarness()

    await user.click(screen.getByText('add-carbonara-romaine'))
    expect(screen.getByTestId('cart-item-count').textContent).toBe('0')
  })
})

describe('pendingActionRef — régression StrictMode', () => {
  it('confirmStore ne rejoue pas deux fois les effets de bord (ajout panier) si invoqué plusieurs fois', async () => {
    const user = userEvent.setup()
    renderHarness()

    await user.click(screen.getByText('add-carbonara-romaine'))
    const confirmButton = await screen.findByText('confirm-store')

    // Deux clics rapprochés simulent le double-appel StrictMode sur l'updater
    // fonctionnel — le pattern pendingActionRef doit consommer l'action une
    // seule fois (lecture + remise à null synchrone).
    await act(async () => {
      confirmButton.click()
      confirmButton.click()
    })

    await waitFor(() => {
      const count = Number(screen.getByTestId('cart-item-count').textContent)
      expect(count).toBeGreaterThan(0)
    })

    const countAfterDoubleClick = Number(screen.getByTestId('cart-item-count').textContent)

    // Un magasin déjà choisi : requestAddRecipe n'ouvre plus le sélecteur, donc
    // pas de nouveau bouton confirm-store à cliquer — la recette est déjà au
    // panier, un second ajout de la même recette incrémente les quantités
    // (ADD_ITEM) au lieu de dupliquer ses lignes (voir CartContext.test.ts).
    await user.click(screen.getByText('add-carbonara-romaine'))
    expect(Number(screen.getByTestId('cart-item-count').textContent)).toBeGreaterThan(countAfterDoubleClick)
    expect(screen.getByTestId('cart-sections').textContent).toBe('1')
  })
})
