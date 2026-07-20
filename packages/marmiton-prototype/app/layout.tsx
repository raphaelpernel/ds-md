import type { Metadata } from 'next'
import '@mealz-product-team/design-system/styles/index.css'

export const metadata: Metadata = {
  title: 'Marmiton Prototype',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-color-scheme="light" data-brand="neutral">
      <body>{children}</body>
    </html>
  )
}
