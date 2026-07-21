'use client'

import Image from 'next/image'
import { ShoppingCart, Trash, Users } from '@phosphor-icons/react'
import { Button } from '@mealz-product-team/design-system'
import { useAssistant } from '@/context/AssistantContext'
import { MOCK_RECIPES } from '@/data/mock/recipes'
import { FullView } from '@/components/chat/FullView/FullView'
import { Slider } from '@/components/chat/Slider/Slider'
import './RecipeDetail.css'

const PRICE_LABEL = { 1: '€', 2: '€€', 3: '€€€' }

interface RecipeDetailProps {
  recipeId: string
  /** Recettes du carrousel d'origine, affichées dans le slider du bas — cliquer
   *  une carte fait basculer le détail affiché ici sur cette recette. */
  recipeIds: string[]
}

/** Détail d'une recette, rendu en vue plein cadre (`FullViewRenderer`) à la place
 *  du fil de conversation — jamais une modale, cf. plan "full view". */
export function RecipeDetail({ recipeId, recipeIds }: RecipeDetailProps) {
  const { isRecipeInCart, requestAddRecipe, removeRecipeFromCart, openFullView } = useAssistant()
  const recipe = MOCK_RECIPES.find((r) => r.id === recipeId)

  if (!recipe) return null

  const added = isRecipeInCart(recipe.id)
  const siblings = recipeIds.map((id) => MOCK_RECIPES.find((r) => r.id === id)).filter(Boolean) as typeof MOCK_RECIPES

  return (
    <FullView overMedia>
      <div className="recipe-detail">
        <div className="recipe-detail__hero">
          <Image src={recipe.image} alt="" fill sizes="650px" className="recipe-detail__hero-image" />
        </div>

        <div className="recipe-detail__content">
          <h3 className="recipe-detail__title">{recipe.name}</h3>

          <div className="recipe-detail__tags">
            <span className="recipe-detail__tag"><Users size={14} weight="bold" aria-hidden="true" /> {recipe.guests}</span>
            <span className="recipe-detail__tag recipe-detail__tag--capitalize">{recipe.mealType}</span>
            <span className="recipe-detail__tag">{recipe.difficulty}</span>
            <span className="recipe-detail__tag">{PRICE_LABEL[recipe.priceLevel]}</span>
          </div>

          {added && (
            <p className="recipe-detail__added-notice">Cette recette est déjà dans votre panier.</p>
          )}

          <div className="recipe-detail__ingredients">
            {recipe.ingredients.map((ingredient) => (
              <div key={ingredient.id} className="recipe-detail__ingredient">
                <span className="recipe-detail__ingredient-avatar" aria-hidden="true">{ingredient.emoji}</span>
                <div>
                  <p className="recipe-detail__ingredient-name">{ingredient.name}</p>
                  <p className="recipe-detail__ingredient-quantity">{ingredient.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="recipe-detail__divider" />

          <ol className="recipe-detail__steps">
            {recipe.steps.map((step, index) => (
              <li key={index}>
                <span className="recipe-detail__step-index">Étape {index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {siblings.length > 0 && (
          <div className="product-detail-content__actions">
            <Slider>
              {siblings.map((sibling) => {
                const siblingAdded = isRecipeInCart(sibling.id)
                return (
                  <div
                    key={sibling.id}
                    className={`product-mini-card ${sibling.id === recipe.id ? 'product-mini-card--active' : ''}`}
                    onClick={() => openFullView({ type: 'recipe-detail', recipeId: sibling.id, recipeIds })}
                  >
                    <div className="recipe-detail__slider-thumb">
                      <Image src={sibling.image} alt="" fill sizes="48px" />
                    </div>
                    <p className="product-mini-card__name">{sibling.name}</p>
                    <Button
                      variant="tertiary"
                      size="S"
                      iconOnly={siblingAdded ? <Trash size={16} aria-hidden="true" /> : <ShoppingCart size={16} weight="bold" aria-hidden="true" />}
                      label={siblingAdded ? `Retirer ${sibling.name} du panier` : `Ajouter ${sibling.name} au panier`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (siblingAdded) removeRecipeFromCart(sibling.id)
                        else requestAddRecipe(sibling.id, sibling.guests)
                      }}
                    />
                  </div>
                )
              })}
            </Slider>
          </div>
        )}
      </div>
    </FullView>
  )
}

export default RecipeDetail
