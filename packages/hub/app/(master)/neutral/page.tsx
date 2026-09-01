// packages/hub/app/(master)/neutral/page.tsx
import { NamespaceCardGrid } from '@/components/NamespaceCardGrid/NamespaceCardGrid'

export default function NeutralPage() {
  return (
    <section>
      <h1 className="hub-namespace-page__title">Neutral</h1>
      <NamespaceCardGrid cards={[]} emptyMessage="Aucun prototype migré pour l'instant." />
    </section>
  )
}
