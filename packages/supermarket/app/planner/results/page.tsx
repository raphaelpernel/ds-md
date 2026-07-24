'use client'

import { useRouter } from 'next/navigation'
import { Button, ChipTag, Heading } from '@mealz-product-team/design-system'
import { useWizard } from '@/context/WizardContext'
import { pickRecipes } from '@/data/mock/recipes'
import '@mealz-product-team/design-system/styles/index.css'

export default function PlannerResultsPage() {
  const router = useRouter()
  const { state, reset } = useWizard()
  const recipes = pickRecipes(state)

  const handleRestart = () => {
    reset()
    router.push('/')
  }

  return (
    <div className="planner-results-page">
      <div className="planner-results-page__header">
        <Heading as="h1" size="lg" className="planner-results-page__title">Vos {state.meals} repas de la semaine</Heading>
        <p className="planner-results-page__subtitle">Pour {state.people} personne{state.people > 1 ? 's' : ''}</p>
      </div>

      <ul className="planner-results-page__list">
        {recipes.map((recipe, i) => (
          <li key={`${recipe.id}-${i}`} className="wizard-result-card">
            <div className="wizard-result-card__thumb" aria-hidden="true" />
            <div className="wizard-result-card__body">
              <p className="wizard-result-card__name">{recipe.name}</p>
              <div className="wizard-result-card__meta">
                <ChipTag label={`${recipe.minutes} min`} size="S" type="neutral-outline" />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="planner-results-page__footer">
        <Button variant="secondary" size="L" onClick={handleRestart} className="planner-results-page__cta">
          Recommencer
        </Button>
      </div>

      <style>{`
        .planner-results-page {
          min-height: 100vh; max-width: 480px; margin: 0 auto;
          background: var(--color-surface-page); font-family: var(--font-family-body);
          display: flex; flex-direction: column;
        }

        .planner-results-page__header {
          padding: var(--spacing-16);
          border-bottom: 1px solid var(--color-border-default);
        }
        .planner-results-page__title {
          font-family: var(--font-family-heading);
          font-size: var(--font-size-heading-lg);
          line-height: var(--line-height-heading-lg);
          color: var(--color-content-default);
        }
        .planner-results-page__subtitle {
          font-size: var(--font-size-body-md);
          color: var(--color-content-weak);
          margin-top: var(--spacing-4);
        }

        .planner-results-page__list {
          flex: 1; list-style: none; margin: 0;
          display: flex; flex-direction: column; gap: var(--spacing-12);
          padding: var(--spacing-16);
        }

        .wizard-result-card {
          display: flex; align-items: center; gap: var(--spacing-12);
          padding: var(--spacing-12);
          border: 1px solid var(--color-border-weak);
          border-radius: var(--shape-card);
        }
        .wizard-result-card__thumb {
          width: 56px; height: 56px; flex-shrink: 0;
          border-radius: var(--shape-square);
          background: var(--color-surface-secondary);
        }
        .wizard-result-card__body { display: flex; flex-direction: column; gap: var(--spacing-8); }
        .wizard-result-card__name {
          font-size: var(--font-size-body-md);
          color: var(--color-content-default);
          margin: 0;
        }
        .wizard-result-card__meta { display: flex; gap: var(--spacing-8); }

        .planner-results-page__footer {
          position: sticky; bottom: 0;
          background: var(--color-surface-page); border-top: 1px solid var(--color-border-default);
          padding: var(--spacing-16);
        }
        .planner-results-page__cta { width: 100%; }
      `}</style>
    </div>
  )
}
