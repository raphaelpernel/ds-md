import type { Metadata } from 'next'
import { WizardProvider } from '@/context/WizardContext'
import '@mealz-product-team/design-system/styles/index.css'

export const metadata: Metadata = {
  title: 'Form Mealz Planner',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-color-scheme="light" data-brand="neutral">
      <body>
        <WizardProvider>{children}</WizardProvider>
      </body>
    </html>
  )
}
