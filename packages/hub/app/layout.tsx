// packages/hub/app/layout.tsx
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Script from 'next/script'
import { BrandThemeSwitcher } from '@mealz-product-team/design-system/devtools/BrandThemeSwitcher/BrandThemeSwitcher'
import { getBrandThemeScript } from '@mealz-product-team/design-system/devtools/brandThemeScript'
import { BrandSync } from '@/components/BrandSync/BrandSync'
import '@mealz-product-team/design-system/styles/index.css'

export const metadata: Metadata = {
  title: 'DS.MD — Hub',
  description: 'Hub multi-client des prototypes et du design system Mealz.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const brand = headersList.get('x-hub-brand') ?? 'neutral'
  const locked = headersList.get('x-hub-locked') === '1'

  return (
    <html lang="fr" data-color-scheme="light" data-brand={brand} suppressHydrationWarning>
      <head>
        {!locked && (
          <Script
            id="brand-theme-anti-fouc"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: getBrandThemeScript() }}
          />
        )}
      </head>
      <body>
        <BrandSync />
        {children}
        {!locked && <BrandThemeSwitcher />}
      </body>
    </html>
  )
}
