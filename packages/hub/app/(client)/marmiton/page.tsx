// packages/hub/app/(client)/marmiton/page.tsx
import { headers } from 'next/headers'
import { NamespaceCardGrid } from '@/components/NamespaceCardGrid/NamespaceCardGrid'
import './page.css'

export default async function MarmitonHomePage() {
  const headersList = await headers()
  const isMaster = headersList.get('x-hub-is-master') === '1'

  const content = (
    <section>
      <h1 className="hub-namespace-page__title">Marmiton</h1>
      <NamespaceCardGrid
        cards={[
          {
            title: 'Recipe',
            description: "Parcours d'achat depuis une recette Marmiton (recette → panier → magasin → créneau → paiement).",
            updatedAt: '01/09/2026',
            href: '/marmiton/recipe',
          },
          {
            title: 'Agent',
            description: 'Parcours agent conversationnel Marmiton.',
            updatedAt: '01/09/2026',
            href: '/marmiton/agent',
          },
        ]}
        emptyMessage="Aucun prototype migré pour l'instant."
      />
    </section>
  )

  // Same convention as the [client] stub page: MasterShell already pads its
  // content, so only wrap in .hub-client-shell for a locked (non-master)
  // session, which has no other padding source.
  if (isMaster) {
    return content
  }

  return <div className="hub-client-shell">{content}</div>
}
