'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BottomNav,
  CatalogNavigation,
  Link,
  PlannerBanner,
  RecipeCard,
  StoreHeader,
  useMediaQuery,
} from '@mealz-product-team/design-system'
import { usePlanner } from '@/features/mealz-planner/context/PlannerContext'
import { useFoodPreferences } from '@/features/food-preferences/context/FoodPreferencesContext'
import { CATALOG_RECIPE_PREFERENCE_FACTS, COLLECTIONS, PROMO_COLLECTION_ID } from '@/features/supermarket/data/recipes'
import { personalizeRecipes } from '@/features/food-preferences/policy/personalizeRecipes'
import { supermarketRoutes } from '@/features/supermarket/routing/SupermarketRoutes'
import '@/features/supermarket/styles/page.css'

export default function CatalogPage({ basePath = '/neutral/supermarket' }: { basePath?: string }) {
  const router = useRouter()
  const { state, setPeople } = usePlanner()
  const { profile, openDrawer } = useFoodPreferences()
  const routes = supermarketRoutes(basePath)
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

  const allRecipes = COLLECTIONS.flatMap((collection) => collection.recipes)
  const cartCount = addedIds.size
  const cartTotal = allRecipes
    .filter((recipe) => addedIds.has(recipe.id))
    .reduce((sum, recipe) => sum + recipe.price, 0)

  return (
    <>
      <StoreHeader
        platform={isMobile ? 'Mobile' : 'Desktop'}
        cartCount={cartCount}
        cartTotal={cartTotal}
        userName="Joe"
        accountHref={routes.profile}
      />

      <header className="catalog-hero">
        <img
          src="https://www.themealdb.com/images/media/meals/nmxec11782498644.jpg"
          alt=""
          className="catalog-hero__bg"
        />
        <div className="catalog-hero__overlay" aria-hidden="true" />
        <div className="catalog-hero__content layout-container">
          <h1 className="catalog-hero__title">Idées repas en 1 clic</h1>
        </div>
      </header>

      <div className="catalog-page__nav layout-container">
        <CatalogNavigation promoHref={routes.collection.replace(':slug', PROMO_COLLECTION_ID)} filterCount={3} onPreferencesClick={() => openDrawer(document.activeElement as HTMLElement)} />
      </div>

      <div className="catalog-page__planner-banner layout-container">
        <PlannerBanner
          peopleCount={state.people}
          onPeopleChange={setPeople}
          backgroundImageMobile="/prototypes/supermarket/planner-banner-bg-mobile.png"
          backgroundImageDesktop="/prototypes/supermarket/planner-banner-bg-desktop.png"
          onCtaClick={() => router.push(`${routes.planner}/people`)}
        />
      </div>

      <main className={`catalog-page layout-container${isMobile ? ' catalog-page--mobile' : ''}`}>
        {COLLECTIONS.map((collection) => (
          <section key={collection.id} className="catalog-page__collection">
            <div className="catalog-page__collection-header">
              <h2 className="catalog-page__collection-title">{collection.title}</h2>
              <Link href={routes.collection.replace(':slug', collection.id)} size="SM">
                Voir tout
              </Link>
            </div>
            <div className="catalog-page__grid">
              {personalizeRecipes(collection.recipes.map((item) => ({ item, facts: CATALOG_RECIPE_PREFERENCE_FACTS[item.id]! })), profile, 'catalog').map((recipe) => (
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
          </section>
        ))}
      </main>

      {isMobile && <BottomNav activeTab="recipes" />}
    </>
  )
}
