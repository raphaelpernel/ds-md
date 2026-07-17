import Link from 'next/link'
import { AssistantLauncher } from '@/components/assistant/AssistantLauncher/AssistantLauncher'
import './coursesu-demo.css'

const PAGES = [
  { href: '/', label: 'Accueil' },
  { href: '/categorie', label: 'Catégorie' },
  { href: '/panier', label: 'Panier' },
]

export default function CoursesUDemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="coursesu-demo">
      {/* Navigation interne à la démo — next/link uniquement, jamais <a>, pour
          préserver AssistantContext (panier/conversation) entre les pages miroir. */}
      <nav className="coursesu-demo__nav" aria-label="Navigation démo POC">
        {PAGES.map((page) => (
          <Link key={page.href} href={page.href} className="coursesu-demo__nav-link">
            {page.label}
          </Link>
        ))}
      </nav>

      {children}

      <AssistantLauncher />
    </div>
  )
}
