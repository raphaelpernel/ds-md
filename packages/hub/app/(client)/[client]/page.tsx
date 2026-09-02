// packages/hub/app/(client)/[client]/page.tsx
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { findClientNamespace } from '@/config/namespaces'
import { NamespaceCardGrid } from '@/components/NamespaceCardGrid/NamespaceCardGrid'
import { getPrototypeCards } from '@/config/prototypes'

export default async function ClientPage({ params }: { params: Promise<{ client: string }> }) {
  const { client } = await params
  const namespace = findClientNamespace(client)
  if (!namespace) {
    notFound()
  }

  const headersList = await headers()
  const isMaster = headersList.get('x-hub-is-master') === '1'

  const content = (
    <section>
      <h1 className="hub-namespace-page__title">{namespace.label}</h1>
      <NamespaceCardGrid cards={getPrototypeCards(namespace.id)} emptyMessage="Aucun prototype migré pour l'instant." />
    </section>
  )

  // Inside MasterShell, .hub-shell__content already provides the padding —
  // wrapping again here would double it. Outside MasterShell (locked view),
  // there is no other padding source, so this wrapper supplies it.
  if (isMaster) {
    return content
  }

  return <div className="hub-client-shell">{content}</div>
}
