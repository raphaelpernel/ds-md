import { ClientNamespaceShell } from '@/components/ClientNamespaceShell/ClientNamespaceShell'
import { CartProvider } from '@/features/marmiton-prototype/context/CartContext'
import { Header } from '@/features/marmiton-prototype/components/layout/Header/Header'
import { Footer } from '@/features/marmiton-prototype/components/layout/Footer/Footer'

export default function MarmitonLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientNamespaceShell>
      <CartProvider>
        <Header />
        {children}
        <Footer />
      </CartProvider>
    </ClientNamespaceShell>
  )
}
