import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MarkdownDocument } from '@/features/guide/components/MarkdownDocument'
import { DESIGN_DOCS, getDesignDoc, storybookUrl } from '@/features/guide/lib/designDocs'
import '@/features/guide/guide.css'

export function generateStaticParams() {
  return DESIGN_DOCS.map(({ slug }) => ({ slug }))
}

export default async function ComponentGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doc = await getDesignDoc(slug)
  if (!doc) notFound()
  const docsUrl = storybookUrl(doc.storybookId)

  return (
    <div className="guide-doc">
      <div className="guide-doc-actions">
        <Link href="/guide">← Tous les composants</Link>
        {docsUrl && <a href={docsUrl} target="_blank" rel="noreferrer">Ouvrir dans Storybook ↗</a>}
      </div>
      <header className="guide-doc-header">
        <p className="guide-kicker">{doc.category}</p>
        <h1>{doc.name}</h1>
        <p>{doc.relativePath}</p>
      </header>
      <MarkdownDocument markdown={doc.markdown} sourcePath={doc.relativePath} />
    </div>
  )
}
