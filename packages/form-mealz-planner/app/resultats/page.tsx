'use client'

import { useRouter } from 'next/navigation'
import { Button, ChipTag, Heading } from '@mealz-product-team/design-system'
import { useWizard } from '@/context/WizardContext'
import { pickRecipes } from '@/data/mock/recipes'
import '@mealz-product-team/design-system/styles/index.css'

export default function ResultatsPage() {
  const router = useRouter()
  const { state, reset } = useWizard()
  const recipes = pickRecipes(state)

  const handleRestart = () => {
    reset()
    router.push('/')
  }

  return (
    <div className="results-page">
      <div className="results-page__header">
        <Heading as="h1" size="lg" className="results-page__title">Vos {state.meals} repas de la semaine</Heading>
        <p className="results-page__subtitle">Pour {state.people} personne{state.people > 1 ? 's' : ''}</p>
      </div>

      <ul className="results-page__list">
        {recipes.map((recipe, i) => (
          <li key={`${recipe.id}-${i}`} className="recipe-card">
            <div className="recipe-card__thumb" aria-hidden="true" />
            <div className="recipe-card__body">
              <p className="recipe-card__name">{recipe.name}</p>
              <div className="recipe-card__meta">
                <ChipTag label={`${recipe.minutes} min`} size="S" type="neutral-outline" />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="results-page__footer">
        <Button variant="secondary" size="L" onClick={handleRestart} className="results-page__cta">
          Recommencer
        </Button>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .results-page {
          min-height: 100vh; max-width: 480px; margin: 0 auto;
          background: var(--color-surface-page); font-family: var(--font-family-body);
          display: flex; flex-direction: column;
        }

        .results-page__header {
          padding: var(--spacing-16);
          border-bottom: 1px solid var(--color-border-default);
        }
        .results-page__title {
          font-family: var(--font-family-heading);
          font-size: var(--font-size-heading-lg);
          line-height: var(--line-height-heading-lg);
          color: var(--color-content-default);
        }
        .results-page__subtitle {
          font-size: var(--font-size-body-md);
          color: var(--color-content-weak);
          margin-top: var(--spacing-4);
        }

        .results-page__list {
          flex: 1; list-style: none;
          display: flex; flex-direction: column; gap: var(--spacing-12);
          padding: var(--spacing-16);
        }

        .recipe-card {
          display: flex; align-items: center; gap: var(--spacing-12);
          padding: var(--spacing-12);
          border: 1px solid var(--color-border-weak);
          border-radius: var(--shape-card);
        }
        .recipe-card__thumb {
          width: 56px; height: 56px; flex-shrink: 0;
          border-radius: var(--shape-square);
          background: var(--color-surface-secondary);
        }
        .recipe-card__body { display: flex; flex-direction: column; gap: var(--spacing-8); }
        .recipe-card__name {
          font-size: var(--font-size-body-md);
          color: var(--color-content-default);
        }
        .recipe-card__meta { display: flex; gap: var(--spacing-8); }

        .results-page__footer {
          position: sticky; bottom: 0;
          background: var(--color-surface-page); border-top: 1px solid var(--color-border-default);
          padding: var(--spacing-16);
        }
        .results-page__cta { width: 100%; }
      `}</style>
    </div>
  )
}
