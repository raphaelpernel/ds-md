'use client'

import { useState } from 'react'
import { Star, Clock, ChartBar, ChatCircleDots } from '@phosphor-icons/react'
import { Button, Badge, InputField } from '@mealz-product-team/design-system'
import { AppHeader } from '../layout/AppHeader'
import { MemoryStrip } from '../layout/MemoryStrip'
import { MOCK_RECIPES } from '../../data/mock/recipes'
import { MOCK_PRODUCTS } from '../../data/mock/products'
import { fullIngredientList, detectMissingIngredients } from '../../lib/recipeAnalysis'
import { interpretIngredientQuestion, type IngredientAnswer } from '../../lib/nlu'
import { useShoppingActions } from '../../context/ShoppingContext'
import { useCart } from '../../context/CartContext'
import { useSessionMemory } from '../../context/SessionMemoryContext'
import { formatPrice } from '../../lib/format'
import './RecipePage.css'

/**
 * Écran 04 (fiche recette) — aussi le point d'entrée du parcours D (arrivée
 * Google, non connecté). La conversation reste réelle (texte libre, plusieurs
 * tours possibles) mais s'annote directement sur la page plutôt que de
 * s'ouvrir dans un panneau séparé — piste retenue en session du 2026-07-20.
 * Les réponses données ici rejoignent la mémoire de session (voir
 * SessionMemoryContext) : si vous avez déjà dit "pas de crème" sur une autre
 * visite, l'annotation réapparaît sans qu'il faille reposer la question.
 */
export function RecipePage({ recipeId }: { recipeId: string }) {
  const { requestAddRecipe } = useShoppingActions()
  const cart = useCart()
  const memory = useSessionMemory()

  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<IngredientAnswer | null>(null)

  const recipe = MOCK_RECIPES.find((r) => r.id === recipeId)
  if (!recipe) {
    return (
      <main className="recipe-page recipe-page--not-found">
        <p>Recette introuvable.</p>
      </main>
    )
  }

  const missing = detectMissingIngredients(recipe)
  const allIngredients = fullIngredientList(recipe)
  const commandableIngredients = allIngredients.filter((i) => i.productId)
  const alreadyInCart = cart.state.items.some((i) => i.recipeId === recipe.id)
  const missingCount = commandableIngredients.length
  const missingTotal = commandableIngredients.reduce((sum, ing) => {
    const product = MOCK_PRODUCTS.find((p) => p.id === ing.productId)
    return sum + (product?.price ?? 0)
  }, 0)

  const topSignals = [...recipe.communitySignals].sort((a, b) => b.agreeCount - a.agreeCount)

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return
    const result = interpretIngredientQuestion(question, recipe)
    setAnswer(result)
    if (result.understood && result.suggestion && result.ingredientId) {
      // Id composite recette+ingrédient : les ids bruts ("ing-3") ne sont pas
      // uniques entre recettes (ing-3 = parmesan ici, crème ailleurs) — sans
      // ça, une réponse mémorisée s'afficherait sur le mauvais ingrédient
      // d'une autre recette (trouvé en revue /plan-design-review, Pass 7).
      memory.addIngredientAnswer({
        ingredientId: `${recipe.id}:${result.ingredientId}`,
        ingredientQuery: result.ingredientQuery ?? '',
        suggestion: result.suggestion,
      })
    }
    setQuestion('')
  }

  return (
    <>
      <AppHeader />
      <MemoryStrip />
      <main className="recipe-page">
        <header className="recipe-page__header">
          <span className="recipe-page__emoji" aria-hidden="true">{recipe.emoji}</span>
          <div>
            <h1 className="recipe-page__title">{recipe.name}</h1>
            <div className="recipe-page__meta">
              <span><Star size={16} weight="fill" aria-hidden="true" /> {recipe.rating} ({recipe.reviewCount} avis)</span>
              <span><Clock size={16} weight="bold" aria-hidden="true" /> {recipe.duration} min</span>
              <span><ChartBar size={16} weight="bold" aria-hidden="true" /> {recipe.difficulty}</span>
            </div>
          </div>
        </header>

        {missing.length > 0 && (
          <section className="recipe-page__callout" role="note">
            <p className="recipe-page__callout-title">L’agent a lu les étapes</p>
            <p>
              L’étape mentionne « {missing[0].name} » — absente des ingrédients listés. Je l’ai ajoutée à la liste
              ci-dessous, pour qu’elle ne vous manque pas au moment de cuisiner.
            </p>
          </section>
        )}

        {topSignals.length > 0 && (
          <section className="recipe-page__signals">
            <h2 className="recipe-page__section-title">Ce que la communauté a appris</h2>
            <ol className="recipe-page__signals-list">
              {topSignals.map((signal, i) => (
                <li key={i}>
                  <span className="recipe-page__signal-text">{signal.text}</span>
                  <span className="recipe-page__signal-agree">— {signal.agreeCount} personnes d’accord</span>
                </li>
              ))}
            </ol>
            <p className="recipe-page__signals-note">
              {topSignals.length > 1 ? `${topSignals.length} signaux tirés` : '1 signal tiré'} de {recipe.reviewCount} commentaires.
            </p>
          </section>
        )}

        <section className="recipe-page__section">
          <h2 className="recipe-page__section-title">Ingrédients ({recipe.servings} personnes)</h2>
          <ul className="recipe-page__ingredients">
            {allIngredients.map((ing) => {
              const freshAnswer = answer?.understood && answer.ingredientId === ing.id ? answer : null
              const remembered = memory.ingredientAnswers.find((a) => a.ingredientId === `${recipe.id}:${ing.id}`)
              const suggestion = freshAnswer?.suggestion ?? remembered?.suggestion
              const sourceNote = freshAnswer?.sourceNote

              return (
                <li key={ing.id} className="recipe-page__ingredient">
                  <span aria-hidden="true">{ing.emoji}</span>
                  <span>{ing.quantity} {ing.unit} {ing.name}</span>
                  {ing.missingFromList && <Badge variant="brand" label="ajouté par l’agent" />}
                  {suggestion && (
                    <p className="recipe-page__ingredient-annotation">
                      → remplacez par {suggestion}.{sourceNote && ` ${sourceNote}`}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        <section className="recipe-page__section">
          <h2 className="recipe-page__section-title">Préparation</h2>
          <ol className="recipe-page__steps">
            {recipe.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="recipe-page__cart-cta">
          {alreadyInCart ? (
            <p className="recipe-page__cart-note">Cette recette est déjà dans votre panier.</p>
          ) : missingCount > 0 ? (
            <>
              <p className="recipe-page__cart-note">
                {missingCount} produit{missingCount > 1 ? 's' : ''} manquant{missingCount > 1 ? 's' : ''} · {formatPrice(missingTotal)}
              </p>
              <Button variant="primary" size="M" onClick={() => requestAddRecipe(recipe.id)}>
                Commander les ingrédients
              </Button>
            </>
          ) : (
            <p className="recipe-page__cart-note">Vous avez déjà tout ce qu’il faut.</p>
          )}
        </section>

        <section className="recipe-page__ask">
          <form onSubmit={handleAsk} className="recipe-page__ask-form">
            <ChatCircleDots size={18} weight="bold" aria-hidden="true" />
            <InputField
              id="recipe-ask"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Une question sur cette recette ? Ex : « je n’ai pas de crème, je fais quoi ? »"
              aria-label="Poser une question sur cette recette"
            />
            <Button variant="secondary" size="S" type="submit" disabled={!question.trim()}>
              Demander
            </Button>
          </form>

          {answer && (
            <p className="recipe-page__ask-answer" role="status">
              {answer.understood
                ? answer.suggestion
                  ? 'Réponse ajoutée ci-dessus, à côté de l’ingrédient concerné — et retenue pour la suite de la session.'
                  : `J’ai bien identifié « ${answer.ingredientQuery} », mais je ne connais pas encore de bon remplaçant pour cet ingrédient précis.`
                : 'Je n’ai pas trouvé cet ingrédient dans cette recette — reformulez avec le nom exact ?'}
            </p>
          )}
        </section>
      </main>
    </>
  )
}

export default RecipePage
