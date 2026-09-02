import Link from 'next/link'
import { GuideIndex } from '@/features/guide/components/GuideIndex'
import { MarkdownDocument } from '@/features/guide/components/MarkdownDocument'
import { guideSourceLinks, readDesignSystemGuide } from '@/features/guide/lib/designDocs'
import '@/features/guide/guide.css'

export const metadata = { title: 'Guide — DS.MD' }

export default async function GuidePage() {
  const markdown = await readDesignSystemGuide()
  return (
    <div className="guide-page">
      <header className="guide-hero">
        <p className="guide-kicker">Mealz Design System</p>
        <h1>Le guide pour concevoir avec DS.MD</h1>
        <p>Un point d’entrée pratique pour choisir le bon composant, appliquer les bons tokens et construire des layouts cohérents. Commencez par les règles générales, puis ouvrez la fiche du composant dont vous avez besoin.</p>
        <div className="guide-links">
          <a href={guideSourceLinks.tokens} target="_blank" rel="noreferrer">Valeurs des tokens ↗</a>
          <a href={guideSourceLinks.rules} target="_blank" rel="noreferrer">Règles de contribution ↗</a>
          <a href={guideSourceLinks.design} target="_blank" rel="noreferrer">Source DESIGN.md ↗</a>
        </div>
      </header>
      <MarkdownDocument markdown={markdown} sourcePath="packages/design-system/docs/DESIGN.md" />
      <GuideIndex />
      <p className="guide-links"><Link href="/neutral">Retour aux prototypes</Link></p>
    </div>
  )
}
