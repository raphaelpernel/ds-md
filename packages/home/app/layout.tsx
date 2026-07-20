import type { Metadata } from 'next'
import Script from 'next/script'
import { BrandThemeSwitcher } from '@mealz-product-team/design-system/devtools/BrandThemeSwitcher/BrandThemeSwitcher'
import { getBrandThemeScript } from '@mealz-product-team/design-system/devtools/brandThemeScript'
import '@mealz-product-team/design-system/styles/index.css'

export const metadata: Metadata = {
  title: 'DS.MD — Packages',
  description: 'Accès aux prototypes et outils du monorepo DS.MD.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-color-scheme="light" data-brand="neutral" suppressHydrationWarning>
      <head>
        <Script
          id="brand-theme-anti-fouc"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: getBrandThemeScript() }}
        />
      </head>
      <body>
        {children}
        <BrandThemeSwitcher />
      </body>
    </html>
  )
}
