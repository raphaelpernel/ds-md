'use client'

import { Check, Trash, Users, ChartBar, Coins } from '@phosphor-icons/react'
import { Button } from '@mealz-product-team/design-system'
import { useAssistant } from '@/context/AssistantContext'
import { MOCK_RECIPES } from '@/data/mock/recipes'
import { WidgetCard } from '../WidgetCard/WidgetCard'
import './RecipeDetail.css'

const PRICE_LABEL = { 1: '€', 2: '€€', 3: '€€€' }

/** Détail d'une recette rendu inline dans le chat (widget `recipe-detail-inline` —
 *  cf. `docs/docs/04-architecture-technique.md`) : un clic sur une carte du carrousel
 *  ne relève plus une modale, il ajoute ce widget comme nouveau tour de conversation. */
export function RecipeDetail({ recipeId }: { recipeId: string }) {
  const { isRecipeInCart, requestAddRecipe, removeRecipeFromCart } = useAssistant()
  const recipe = MOCK_RECIPES.find((r) => r.id === recipeId)

  if (!recipe) return null

  const added = isRecipeInCart(recipe.id)

  return (
    <WidgetCard className="recipe-detail">
      <h3 className="recipe-detail__title">{recipe.name}</h3>

      <div className="recipe-detail__hero">
        <span className="recipe-detail__emoji" aria-hidden="true">{recipe.emoji}</span>
      </div>

      <div className="recipe-detail__infos">
        <span><Users size={16} weight="bold" aria-hidden="true" /> {recipe.guests} convives</span>
        <span className="recipe-detail__infos-capitalize">{recipe.mealType}</span>
        <span><ChartBar size={16} weight="bold" aria-hidden="true" /> {recipe.difficulty}</span>
        <span><Coins size={16} weight="bold" aria-hidden="true" /> {PRICE_LABEL[recipe.priceLevel]}</span>
      </div>

      {added && (
        <p className="recipe-detail__added-notice">
          <Check size={16} weight="bold" aria-hidden="true" /> Cette recette est déjà dans votre panier.
        </p>
      )}

      <section className="recipe-detail__section">
        <h4 className="recipe-detail__section-title">Ingrédients</h4>
        <ul className="recipe-detail__ingredients">
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient.id}>
              <span aria-hidden="true">{ingredient.emoji}</span> {ingredient.name} — {ingredient.quantity}
            </li>
          ))}
        </ul>
      </section>

      <section className="recipe-detail__section">
        <h4 className="recipe-detail__section-title">Préparation</h4>
        <ol className="recipe-detail__steps">
          {recipe.steps.map((step, index) => (
            <li key={index}>
              <span className="recipe-detail__step-index">Étape {index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <div className="recipe-detail__footer-actions">
        {added ? (
          <Button
            variant="danger"
            size="M"
            lIcon={<Trash size={16} aria-hidden="true" />}
            onClick={() => removeRecipeFromCart(recipe.id)}
          >
            Retirer du panier
          </Button>
        ) : (
          <Button variant="primary" size="M" onClick={() => requestAddRecipe(recipe.id, recipe.guests)}>
            Ajouter au panier
          </Button>
        )}
      </div>
    </WidgetCard>
  )
}

export default RecipeDetail
