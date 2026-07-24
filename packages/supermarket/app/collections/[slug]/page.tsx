import { notFound } from 'next/navigation'
import { getCollectionBySlug } from '@/data/recipes'
import { CollectionView } from '@/components/CollectionView'

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const collection = getCollectionBySlug(slug)

  if (!collection) {
    notFound()
  }

  return <CollectionView collection={collection} />
}
