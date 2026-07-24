'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CaretLeft } from '@phosphor-icons/react'
import {
  BottomNav,
  Breadcrumb,
  Button,
  CatalogNavigation,
  RecipeCard,
  StoreHeader,
  useMediaQuery,
} from '@mealz-product-team/design-system'
import type { RecipeCollection } from '@/data/recipes'
import { PROMO_COLLECTION_ID } from '@/data/recipes'
import './collection.css'

export function CollectionView({ collection }: { collection: RecipeCollection }) {
  const router = useRouter()
  const isMobile = useMediaQuery('(max-width: 767px)')
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  const toggleInSet = (setter: typeof setAddedIds, id: string) => {
    setter((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const cartCount = addedIds.size
  const cartTotal = collection.recipes
    .filter((recipe) => addedIds.has(recipe.id))
    .reduce((sum, recipe) => sum + recipe.price, 0)

  const isPromo = collection.id === PROMO_COLLECTION_ID

  return (
    <>
      <StoreHeader
        platform={isMobile ? 'Mobile' : 'Desktop'}
        cartCount={cartCount}
        cartTotal={cartTotal}
        userName="Joe"
      />

      <div className="collection-breadcrumb-bar">
        <Breadcrumb
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Idées repas en 1 clic', href: '/' },
            { label: collection.title },
          ]}
        />
      </div>

      <main className={`collection-page layout-container${isMobile ? ' collection-page--mobile' : ''}`}>
        <div className="collection-page__title-row">
          <Button
            variant="secondary"
            size="M"
            iconOnly={<CaretLeft size={20} weight="bold" aria-hidden="true" />}
            label="Retour au catalogue"
            onClick={() => router.push('/')}
          />
          <div className="collection-page__title-text">
            <h1 className="collection-page__title">{collection.title}</h1>
            <p className="collection-page__description">{collection.description}</p>
          </div>
        </div>

        <CatalogNavigation
          promoHref={isPromo ? undefined : `/collections/${PROMO_COLLECTION_ID}`}
          filterCount={3}
          preferencesCount={3}
        />

        <div className="collection-page__grid">
          {collection.recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              title={recipe.title}
              imageUrl={recipe.imageUrl}
              guests={recipe.guests}
              price={recipe.price}
              promo={recipe.promo}
              added={addedIds.has(recipe.id)}
              onAddToggle={() => toggleInSet(setAddedIds, recipe.id)}
              favorite={favoriteIds.has(recipe.id)}
              onFavoriteToggle={() => toggleInSet(setFavoriteIds, recipe.id)}
            />
          ))}
        </div>
      </main>

      {isMobile && <BottomNav activeTab="recipes" />}
    </>
  )
}

export default CollectionView
