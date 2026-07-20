'use client'

import type { ReactNode } from 'react'
import { CartProvider } from '../context/CartContext'
import { ShoppingProvider } from '../context/ShoppingContext'
import { SessionMemoryProvider } from '../context/SessionMemoryContext'
import { StoreLocatorModal } from './widgets/StoreLocatorWidget/StoreLocatorWidget'

/** CartContext doit envelopper ShoppingContext : les actions d'achat dispatchent dans le panier, pas l'inverse. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <ShoppingProvider>
        <SessionMemoryProvider>
          {children}
          <StoreLocatorModal />
        </SessionMemoryProvider>
      </ShoppingProvider>
    </CartProvider>
  )
}
