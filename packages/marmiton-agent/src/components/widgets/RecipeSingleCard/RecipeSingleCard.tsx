'use client'

import Link from 'next/link'
import { Check, Clock, Star } from '@phosphor-icons/react'
import { Button } from '@mealz-product-team/design-system'
import { useShoppingActions } from '../../../context/ShoppingContext'
import { useCart } from '../../../context/CartContext'
import { MOCK_RECIPES } from '../../../data/mock/recipes'
import '../RecipeSingleCard/RecipeSingleCard.css'

/**
 * Une seule recette recommandée, argumentée par un signal communautaire —
 * pas un carousel de résultats. Brief §5.2 : "une reco argumentée, pas un
 * formulaire déguisé".
 */
export function RecipeSingleCard({ recipeId, citedSignal }: { recipeId: string; citedSignal?: string }) {
  const { requestAddRecipe } = useShoppingActions()
  const cart = useCart()
  const recipe = MOCK_RECIPES.find((r) => r.id === recipeId)
  if (!recipe) return null

  const added = cart.state.items.some((i) => i.recipeId === recipe.id)

  return (
    <article className="recipe-single-card">
      <div className="recipe-single-card__media">
        <span className="recipe-single-card__emoji" aria-hidden="true">{recipe.emoji}</span>
      </div>
      <div className="recipe-single-card__body">
        <Link href={`/recette/${recipe.id}`} className="recipe-single-card__title">
          {recipe.name}
        </Link>
        <div className="recipe-single-card__meta">
          <span><Star size={14} weight="fill" aria-hidden="true" /> {recipe.rating} ({recipe.reviewCount})</span>
          <span><Clock size={14} weight="bold" aria-hidden="true" /> {recipe.duration} min</span>
        </div>
        {citedSignal && <p className="recipe-single-card__signal">« {citedSignal} »</p>}
        {added ? (
          <span className="recipe-single-card__added">
            <Check size={14} weight="bold" aria-hidden="true" /> Ajoutée au panier
          </span>
        ) : (
          <Button variant="primary" size="S" onClick={() => requestAddRecipe(recipe.id)}>
            Ajouter au panier
          </Button>
        )}
      </div>
    </article>
  )
}

export default RecipeSingleCard
