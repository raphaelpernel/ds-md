'use client'

import { Check, Trash, Users, ChartBar, Coins } from '@phosphor-icons/react'
import { Modal, Button } from '@mealz-product-team/design-system'
import { useAssistant } from '@/context/AssistantContext'
import { MOCK_RECIPES } from '@/data/mock/recipes'
import './RecipeDetail.css'

const PRICE_LABEL = { 1: '€', 2: '€€', 3: '€€€' }

interface RecipeDetailProps {
  recipeId: string | null
  onClose: () => void
}

export function RecipeDetail({ recipeId, onClose }: RecipeDetailProps) {
  const { isRecipeInCart, requestAddRecipe, removeRecipeFromCart } = useAssistant()
  const recipe = recipeId ? MOCK_RECIPES.find((r) => r.id === recipeId) : null

  if (!recipe) return null

  const added = isRecipeInCart(recipe.id)

  return (
    <Modal
      open={!!recipe}
      onClose={onClose}
      size="M"
      title={recipe.name}
      footer={
        added ? (
          <div className="recipe-detail__footer-actions">
            <Button variant="secondary" size="M" onClick={onClose}>Fermer</Button>
            <Button
              variant="danger"
              size="M"
              lIcon={<Trash size={16} aria-hidden="true" />}
              onClick={() => removeRecipeFromCart(recipe.id)}
            >
              Retirer du panier
            </Button>
          </div>
        ) : (
          <div className="recipe-detail__footer-actions">
            <Button variant="secondary" size="M" onClick={onClose}>Fermer</Button>
            <Button
              variant="primary"
              size="M"
              onClick={() => requestAddRecipe(recipe.id, recipe.guests)}
            >
              Ajouter au panier
            </Button>
          </div>
        )
      }
    >
      <div className="recipe-detail">
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
      </div>
    </Modal>
  )
}

export default RecipeDetail
