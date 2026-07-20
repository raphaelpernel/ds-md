import './page.css'

interface FlowLink {
  title: string
  description: string
  href: string
}

const FLOWS: FlowLink[] = [
  {
    title: 'Recipe',
    description: "Parcours d'achat depuis une recette Marmiton (recette → panier → magasin → créneau → paiement).",
    href: '/recipe',
  },
  {
    title: 'Agent',
    description: 'Parcours agent conversationnel — en cours de refonte.',
    href: '/agent',
  },
]

export default function HomePage() {
  return (
    <main className="home">
      <h1 className="home__title">Marmiton Prototype</h1>
      <div className="home__grid">
        {FLOWS.map((flow) => (
          <a key={flow.href} className="home__card" href={flow.href}>
            <span className="home__card-title">{flow.title}</span>
            <span className="home__card-desc">{flow.description}</span>
          </a>
        ))}
      </div>
    </main>
  )
}
