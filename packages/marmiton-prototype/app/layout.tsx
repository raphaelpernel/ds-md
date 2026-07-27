import type { Metadata } from 'next'
import { CartProvider } from '@/context/CartContext'
import { Header } from '@/components/layout/Header/Header'
import { Footer } from '@/components/layout/Footer/Footer'
import '@mealz-product-team/design-system/styles/index.css'

export const metadata: Metadata = {
  title: 'Marmiton Prototype',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-color-scheme="light" data-brand="marmiton">
      <body>
        <CartProvider>
          <Header />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
