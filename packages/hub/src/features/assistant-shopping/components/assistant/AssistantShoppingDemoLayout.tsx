'use client'

import Link from 'next/link'
import { AssistantLauncher } from './AssistantLauncher/AssistantLauncher'
import { useAssistantShoppingRoutes } from '../../routing/AssistantShoppingRoutes'
import '../../assistant-shopping-demo.css'

export interface AssistantShoppingDemoLayoutProps {
  navigationLabel?: string
  className?: string
}

export function AssistantShoppingDemoLayout({ children, navigationLabel = 'Navigation assistant shopping', className = 'assistant-shopping-demo' }: AssistantShoppingDemoLayoutProps & { children: React.ReactNode }) {
  const { home, category, cart } = useAssistantShoppingRoutes()
  const pagesBeforeAssistant = [
    { href: home, label: 'Accueil' },
    { href: category, label: 'Catégorie' },
  ]
  const pagesAfterAssistant = [{ href: cart, label: 'Panier' }]

  return (
    <div className="assistant-shopping-feature">
      <div className={className}>
        <nav className="assistant-shopping-demo__nav" aria-label={navigationLabel}>
          {pagesBeforeAssistant.map((page) => (
            <Link key={page.href} href={page.href} className="assistant-shopping-demo__nav-link">
              {page.label}
            </Link>
          ))}
          <AssistantLauncher />
          {pagesAfterAssistant.map((page) => (
            <Link key={page.href} href={page.href} className="assistant-shopping-demo__nav-link">
              {page.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  )
}
