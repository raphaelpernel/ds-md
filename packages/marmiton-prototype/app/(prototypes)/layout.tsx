import type { ReactNode } from 'react'
import { CartProvider } from '@/context/CartContext'

export default function PrototypesLayout({ children }: { children: ReactNode }) {
  return (
    <div data-brand="marmiton" data-color-scheme="light" style={{ minHeight: '100vh' }}>
      <CartProvider>{children}</CartProvider>
    </div>
  )
}
