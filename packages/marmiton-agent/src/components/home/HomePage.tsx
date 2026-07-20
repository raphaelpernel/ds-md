import Link from 'next/link'
import { AppHeader } from '../layout/AppHeader'
import { ProactiveBanner } from './ProactiveBanner'
import { MOCK_RECIPES } from '../../data/mock/recipes'
import './HomePage.css'

/**
 * Accueil éditorial — pas de takeover par un thread de chat (piste A+C+D
 * retenues en session : la conversation vit dans la recherche et la fiche
 * recette, pas sur un écran d'accueil dédié).
 */
export function HomePage() {
  const editorial = MOCK_RECIPES.slice(0, 4)

  return (
    <>
      <AppHeader />
      <main className="home-page">
        <ProactiveBanner />

        <section className="home-page__section">
          <h2 className="home-page__section-title">La semaine Marmiton</h2>
          <div className="home-page__grid">
            {editorial.map((recipe) => (
              <Link key={recipe.id} href={`/recette/${recipe.id}`} className="home-page__card">
                <span className="home-page__card-emoji" aria-hidden="true">{recipe.emoji}</span>
                <span className="home-page__card-name">{recipe.name}</span>
                <span className="home-page__card-meta">★ {recipe.rating} · {recipe.duration} min</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

export default HomePage
