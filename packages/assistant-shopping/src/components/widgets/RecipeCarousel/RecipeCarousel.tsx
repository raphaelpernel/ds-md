'use client'

import Image from 'next/image'
import { Check, Trash, Users } from '@phosphor-icons/react'
import { Button } from '@mealz-product-team/design-system'
import { useAssistant } from '@/context/AssistantContext'
import { MOCK_RECIPES } from '@/data/mock/recipes'
import { WidgetCard } from '../WidgetCard/WidgetCard'
import { WidgetHeader } from '../WidgetHeader/WidgetHeader'
import { Slider } from '@/components/chat/Slider/Slider'
import './RecipeCarousel.css'

const PRICE_LABEL = { 1: '€', 2: '€€', 3: '€€€' }

interface RecipeCarouselProps {
  recipeIds: string[]
  /** Rendu par `FullViewRenderer` — pas de bouton "agrandir". */
  fullView?: boolean
}

export function RecipeCarousel({ recipeIds, fullView = false }: RecipeCarouselProps) {
  const { isRecipeInCart, requestAddRecipe, removeRecipeFromCart, openRecipeDetail, openFullView } = useAssistant()

  const recipes = recipeIds.map((id) => MOCK_RECIPES.find((r) => r.id === id)).filter(Boolean) as typeof MOCK_RECIPES

  return (
    <WidgetCard className="widget-card--flush">
      <WidgetHeader onExpand={fullView ? undefined : () => openFullView({ type: 'recipes', recipeIds })} />

      <Slider className="recipe-carousel">
        {recipes.map((recipe) => {
          const added = isRecipeInCart(recipe.id)

          return (
            <article key={recipe.id} className="recipe-card">
              <button
                type="button"
                className="recipe-card__media"
                onClick={() => openRecipeDetail(recipe.id, recipeIds)}
                aria-label={`Voir le détail de ${recipe.name}`}
              >
                <Image src={recipe.image} alt="" fill sizes="222px" className="recipe-card__image" />
              </button>

              <div className="recipe-card__body">
                <button type="button" className="recipe-card__title" onClick={() => openRecipeDetail(recipe.id, recipeIds)}>
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
      </Slider>
    </WidgetCard>
  )
}

export default RecipeCarousel
