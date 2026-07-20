import type { Metadata } from 'next'
import '@mealz-product-team/design-system/styles/index.css'
import { Providers } from '../src/components/Providers'

export const metadata: Metadata = {
  title: 'Marmiton Agentique — POC',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-color-scheme="light" data-brand="marmiton">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
