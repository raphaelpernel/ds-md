import type { Metadata } from 'next'
import Script from 'next/script'
import { WizardProvider } from '@/context/WizardContext'
// Import direct (pas le barrel racine) : app/layout.tsx est un Server Component,
// et le barrel réexporte des composants DS sans 'use client' propre (Modal, Drawer…),
// ce qui casse la compilation RSC si on l'importe depuis un Server Component.
import { BrandThemeSwitcher } from '@mealz-product-team/design-system/devtools/BrandThemeSwitcher/BrandThemeSwitcher'
import { getBrandThemeScript } from '@mealz-product-team/design-system/devtools/brandThemeScript'
import '@mealz-product-team/design-system/styles/index.css'

export const metadata: Metadata = {
  title: 'Form Mealz Planner',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning : data-brand est muté avant hydratation par le
    // script anti-FOUC ci-dessous (lecture localStorage) — écart attendu entre
    // le HTML SSR et le DOM client, cf. next-themes pour ce pattern.
    <html lang="fr" data-color-scheme="light" data-brand="neutral" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC : applique le brand persisté avant le premier paint.
            `next/script` + `beforeInteractive` (pas un <script> brut) : évite
            "Encountered a script tag while rendering React component" que
            Turbopack déclenche en dev quand le Fast Refresh d'un module
            'use client' force un re-render côté client de cet arbre. */}
        <Script
          id="brand-theme-anti-fouc"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: getBrandThemeScript() }}
        />
      </head>
      <body>
        <WizardProvider>{children}</WizardProvider>
        <BrandThemeSwitcher />
      </body>
    </html>
  )
}
