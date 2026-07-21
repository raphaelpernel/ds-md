import Link from 'next/link'
import { AssistantLauncher } from '@/components/assistant/AssistantLauncher/AssistantLauncher'
import './coursesu-demo.css'

const PAGES_BEFORE_ASSISTANT = [
  { href: '/', label: 'Accueil' },
  { href: '/category', label: 'Catégorie' },
]

const PAGES_AFTER_ASSISTANT = [{ href: '/cart', label: 'Panier' }]

export default function CoursesUDemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="coursesu-demo">
      {/* Navigation interne à la démo — next/link uniquement, jamais <a>, pour
          préserver AssistantContext (panier/conversation) entre les pages miroir.
          Le lien assistant est placé entre Catégorie et Panier, avec un style
          distinct (pill pleine couleur brand) pour se différencier des liens
          de navigation neutres. */}
      <nav className="coursesu-demo__nav" aria-label="Navigation démo POC">
        {PAGES_BEFORE_ASSISTANT.map((page) => (
          <Link key={page.href} href={page.href} className="coursesu-demo__nav-link">
            {page.label}
          </Link>
        ))}

        <AssistantLauncher />

        {PAGES_AFTER_ASSISTANT.map((page) => (
          <Link key={page.href} href={page.href} className="coursesu-demo__nav-link">
            {page.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  )
}
