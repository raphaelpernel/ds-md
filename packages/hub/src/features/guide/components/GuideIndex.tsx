import Link from 'next/link'
import { getDesignDocs } from '../lib/designDocs'

const categoryLabels: Record<string, string> = {
  display: 'Display', feedback: 'Feedback', form: 'Form', layout: 'Layout',
  navigation: 'Navigation', product: 'Product', typography: 'Typography',
}

export async function GuideIndex() {
  const docs = await getDesignDocs()
  const grouped = docs.reduce<Record<string, typeof docs>>((groups, doc) => {
    ;(groups[doc.category] ??= []).push(doc)
    return groups
  }, {})

  return (
    <nav className="guide-index" aria-label="Composants du design system">
      <div className="guide-index__header">
        <p className="guide-kicker">Référence composants</p>
        <h2>Explorer les composants</h2>
        <p>Chaque fiche précise les variantes, états, tokens, règles d’accessibilité et Do/Don&apos;t.</p>
      </div>
      <div className="guide-index__groups">
        {Object.entries(grouped).map(([category, categoryDocs]) => (
          <section key={category} className="guide-index__group" aria-labelledby={`guide-${category}`}>
            <h3 id={`guide-${category}`}>{categoryLabels[category] ?? category}</h3>
            <ul>
              {categoryDocs.map((doc) => <li key={doc.slug}><Link href={`/guide/${doc.slug}`}>{doc.name}</Link></li>)}
            </ul>
          </section>
        ))}
      </div>
    </nav>
  )
}
