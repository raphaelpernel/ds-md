import { notFound } from 'next/navigation'
import { CollectionView } from '@/features/supermarket/components/CollectionView'
import { getCollectionBySlug } from '@/features/supermarket/data/recipes'

export default async function SupermarketCollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const collection = getCollectionBySlug(slug)
  if (!collection) notFound()
  return <CollectionView collection={collection} basePath="/neutral/supermarket" />
}