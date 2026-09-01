import { CartProvider } from '@/features/marmiton-prototype/context/CartContext'
import { Header } from '@/features/marmiton-prototype/components/layout/Header/Header'
import { Footer } from '@/features/marmiton-prototype/components/layout/Footer/Footer'

/**
 * Wraps the real, migrated Marmiton experience (recipe → cart → login →
 * store → slot → payment → confirmation, and the agent flow) with the
 * site's own chrome. A route group (no URL segment) so these pages still
 * resolve as `/marmiton/recipe`, `/marmiton/cart`, etc. — kept separate
 * from `(client)/marmiton/layout.tsx` so the `/marmiton` gallery index
 * itself never gets Marmiton's own Header/Footer/CartProvider.
 */
export default function MarmitonFunnelLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      {children}
      <Footer />
    </CartProvider>
  )
}
