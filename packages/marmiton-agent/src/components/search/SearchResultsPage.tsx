'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowClockwise } from '@phosphor-icons/react'
import { Button, InputField } from '@mealz-product-team/design-system'
import { AppHeader } from '../layout/AppHeader'
import { MemoryStrip } from '../layout/MemoryStrip'
import { RecipeSingleCard } from '../widgets/RecipeSingleCard/RecipeSingleCard'
import { RecipeDisambiguation } from '../widgets/RecipeDisambiguation/RecipeDisambiguation'
import { RelaxConstraint } from '../widgets/RelaxConstraint/RelaxConstraint'
import { ShoppingListWidget } from '../widgets/ShoppingListWidget/ShoppingListWidget'
import { interpretMessage, refineSearch, presentRecipe, presentChoice, applyMemory, type Interpretation } from '../../lib/nlu'
import { useSessionMemory } from '../../context/SessionMemoryContext'
import { MOCK_RECIPES } from '../../data/mock/recipes'
import './SearchResultsPage.css'

/**
 * La recherche EST l'agent (piste A retenue en session) : pas de fil de chat
 * séparé, mais une vraie conversation multi-tours — "poulet 20 min enfants"
 * puis "et sans lactose ?" affine la même recherche plutôt que d'en ouvrir
 * une nouvelle (voir nlu.refineSearch). La mémoire de session (nlu.applyMemory)
 * fait qu'une contrainte apprise ailleurs (ou lors d'une visite précédente)
 * s'applique dès la première requête, pas seulement dans la page en cours.
 */
export function SearchResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const memory = useSessionMemory()
  const initialQuery = searchParams.get('q') ?? ''

  const [history, setHistory] = useState<string[]>(initialQuery ? [initialQuery] : [])
  const [result, setResult] = useState<Interpretation | null>(null)
  const [refineText, setRefineText] = useState('')

  useEffect(() => {
    if (!initialQuery) return
    const base = interpretMessage(initialQuery)
    const withMemory = applyMemory(base, memory.constraints, memory.maxDuration)
    setResult(withMemory)
    memory.mergeConstraints(withMemory.activeTags, withMemory.activeMaxDuration)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // "mon panier" en recherche mène directement à /courses plutôt que
    // d'afficher un résumé inline — la page dédiée existe déjà pour ça.
    if (result?.intent === 'cart') router.replace('/courses')
  }, [result, router])

  const handleRefine = (e: React.FormEvent) => {
    e.preventDefault()
    if (!refineText.trim()) return
    const next = refineSearch(refineText.trim(), result?.activeTags ?? [], result?.activeMaxDuration)
    setResult(next)
    memory.mergeConstraints(next.activeTags, next.activeMaxDuration)
    setHistory((prev) => [...prev, refineText.trim()])
    setRefineText('')
  }

  const handleSelect = (recipeId: string) => {
    const recipe = MOCK_RECIPES.find((r) => r.id === recipeId)
    if (recipe) setResult(presentRecipe(recipe, result?.activeTags, result?.activeMaxDuration))
  }

  const handleRelax = (recipeIds: string[]) => {
    const recipes = recipeIds.map((id) => MOCK_RECIPES.find((r) => r.id === id)).filter(Boolean) as typeof MOCK_RECIPES
    if (recipes.length === 1) {
      setResult(presentRecipe(recipes[0]))
    } else {
      setResult(presentChoice(recipes))
    }
  }

  const startOver = () => {
    setResult(null)
    setHistory([])
  }

  return (
    <>
      <AppHeader initialQuery={initialQuery} />
      <MemoryStrip />
      <main className="search-results-page">
        {history.length > 0 && (
          <p className="search-results-page__history">
            {history.join(' → ')}
            <button type="button" onClick={startOver} className="search-results-page__reset">
              <ArrowClockwise size={14} weight="bold" aria-hidden="true" /> nouvelle recherche
            </button>
          </p>
        )}

        {!result && <p className="search-results-page__empty">Décrivez ce que vous cherchez dans la barre du haut.</p>}

        {result?.intent === 'recipe-single' && result.recipe && (
          <RecipeSingleCard recipeId={result.recipe.id} citedSignal={result.citedSignal} />
        )}

        {result?.intent === 'disambiguation' && result.disambiguationCandidates && (
          <>
            <p className="search-results-page__prompt">{result.contextSentence}</p>
            <RecipeDisambiguation recipeIds={result.disambiguationCandidates.map((r) => r.id)} onSelect={handleSelect} />
          </>
        )}

        {result?.intent === 'zero-match' && (
          <div className="search-results-page__zero-match">
            <p className="search-results-page__prompt">{result.contextSentence}</p>
            {result.relaxedRecipes && result.blockingConstraintLabel && (
              <RelaxConstraint
                blockingTagLabel={result.blockingConstraintLabel}
                relaxedRecipeIds={result.relaxedRecipes.map((r) => r.id)}
                onRelax={handleRelax}
              />
            )}
          </div>
        )}

        {result?.intent === 'shopping-list' && result.products && (
          <ShoppingListWidget productIds={result.products.map((p) => p.id)} requestId={`list-${Date.now()}`} />
        )}

        {(result?.intent === 'unknown' || result?.intent === 'offtopic') && (
          <p className="search-results-page__prompt">{result.contextSentence}</p>
        )}

        {result && (
          <form className="search-results-page__refine" onSubmit={handleRefine}>
            <InputField
              id="search-refine"
              value={refineText}
              onChange={(e) => setRefineText(e.target.value)}
              placeholder="Affiner : ex. « et sans lactose ? »"
              aria-label="Affiner la recherche"
            />
            <Button variant="secondary" size="S" type="submit" disabled={!refineText.trim()}>
              Affiner
            </Button>
          </form>
        )}
      </main>
    </>
  )
}

export default SearchResultsPage
