import type { ReactNode } from 'react'
import { CartProvider } from '../../src/context/CartContext'

export default function PrototypesLayout({ children }: { children: ReactNode }) {
  return (
    <div data-brand="client-a" data-color-scheme="light" style={{ minHeight: '100vh' }}>
      <CartProvider>{children}</CartProvider>
    </div>
  )
}
