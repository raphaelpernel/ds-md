import Link from 'next/link'
import '../page.css'

export default function AgentPage() {
  return (
    <main className="home">
      <h1 className="home__title">Agent</h1>
      <p className="home__card-desc">Parcours agent conversationnel — à venir. Cette page sera reconstruite ici prochainement.</p>
      <Link href="/" className="home__card-desc">← Retour</Link>
    </main>
  )
}
