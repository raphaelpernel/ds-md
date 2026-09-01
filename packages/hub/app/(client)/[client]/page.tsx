// packages/hub/app/(client)/[client]/page.tsx
import { notFound } from 'next/navigation'
import { findClientNamespace } from '@/config/namespaces'
import { NamespaceCardGrid } from '@/components/NamespaceCardGrid/NamespaceCardGrid'

export default async function ClientPage({ params }: { params: Promise<{ client: string }> }) {
  const { client } = await params
  const namespace = findClientNamespace(client)
  if (!namespace) {
    notFound()
  }

  return (
    <div className="hub-client-shell">
      <section>
        <h1 className="hub-namespace-page__title">{namespace.label}</h1>
        <NamespaceCardGrid cards={[]} emptyMessage="Aucun prototype migré pour l'instant." />
      </section>
    </div>
  )
}
