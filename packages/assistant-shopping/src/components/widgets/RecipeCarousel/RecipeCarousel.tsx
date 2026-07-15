'use client'

import { useState } from 'react'
import { Check, Trash, Users } from '@phosphor-icons/react'
import { Button } from '@mealz-product-team/design-system'
import { useAssistant } from '@/context/AssistantContext'
import { MOCK_RECIPES } from '@/data/mock/recipes'
import { RecipeDetail } from '../RecipeDetail/RecipeDetail'
import './RecipeCarousel.css'

const PRICE_LABEL = { 1: '€', 2: '€€', 3: '€€€' }

export function RecipeCarousel({ recipeIds }: { recipeIds: string[] }) {
  const { isRecipeInCart, requestAddRecipe, removeRecipeFromCart } = useAssistant()
  const [detailRecipeId, setDetailRecipeId] = useState<string | null>(null)

  const recipes = recipeIds.map((id) => MOCK_RECIPES.find((r) => r.id === id)).filter(Boolean) as typeof MOCK_RECIPES

  return (
    <>
      <div className="recipe-carousel" role="list">
        {recipes.map((recipe) => {
          const added = isRecipeInCart(recipe.id)

          return (
            <article key={recipe.id} className="recipe-card" role="listitem">
              <button
                type="button"
                className="recipe-card__media"
                onClick={() => setDetailRecipeId(recipe.id)}
                aria-label={`Voir le détail de ${recipe.name}`}
              >
                <span className="recipe-card__emoji" aria-hidden="true">{recipe.emoji}</span>
              </button>

              <div className="recipe-card__body">
                <button type="button" className="recipe-card__title" onClick={() => setDetailRecipeId(recipe.id)}>
                  {recipe.name}
                </button>

                <div className="recipe-card__meta">
                  <span><Users size={14} weight="bold" aria-hidden="true" /> {recipe.guests}</span>
                  <span>{PRICE_LABEL[recipe.priceLevel]}</span>
                </div>

                {added ? (
                  <div className="recipe-card__added">
                    <span className="recipe-card__added-badge">
                      <Check size={14} weight="bold" aria-hidden="true" /> Ajoutée
                    </span>
                    <Button
                      variant="tertiary"
                      size="S"
                      iconOnly={<Trash size={16} aria-hidden="true" />}
                      label={`Retirer ${recipe.name} du panier`}
                      onClick={() => removeRecipeFromCart(recipe.id)}
                    />
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="S"
                    aria-label={`Ajouter ${recipe.name} au panier`}
                    onClick={() => requestAddRecipe(recipe.id, recipe.guests)}
                  >
                    Ajouter au panier
                  </Button>
                )}
              </div>
            </article>
          )
        })}
      </div>

      <RecipeDetail recipeId={detailRecipeId} onClose={() => setDetailRecipeId(null)} />
    </>
  )
}

export default RecipeCarousel
