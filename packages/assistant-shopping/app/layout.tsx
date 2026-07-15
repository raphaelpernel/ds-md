import type { Metadata } from 'next'
import { AssistantProvider } from '@/context/AssistantContext'
import '@mealz-product-team/design-system/styles/index.css'

export const metadata: Metadata = {
  title: 'Assistant Shopping — Carrefour Belgique',
  description: 'Prototype de l\u2019assistant shopping ChatGPT pour Carrefour Belgique.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-color-scheme="light" data-brand="neutral">
      <body>
        <AssistantProvider>{children}</AssistantProvider>
      </body>
    </html>
  )
}
