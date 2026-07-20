'use client'

import { Star, Clock } from '@phosphor-icons/react'
import { MOCK_RECIPES } from '../../../data/mock/recipes'
import './RecipeDisambiguation.css'

/**
 * Plusieurs recettes portent le même nom mais ne sont pas la même recette
 * (ingrédients/étapes différents). Trier par pertinence ne résout pas ce
 * choix — l'agent le pose explicitement. Observation de terrain propre à
 * cette session (design doc rapha-dev-design-20260720-114501.md).
 *
 * Réutilisé aussi pour présenter les recettes obtenues après relâchement
 * d'une contrainte (RelaxConstraint) — d'où le callback générique `onSelect`
 * plutôt qu'une dépendance à un contexte de chat.
 */
export function RecipeDisambiguation({ recipeIds, onSelect }: { recipeIds: string[]; onSelect: (recipeId: string) => void }) {
  const recipes = recipeIds.map((id) => MOCK_RECIPES.find((r) => r.id === id)).filter(Boolean) as typeof MOCK_RECIPES

  return (
    <div className="recipe-disambiguation" role="list">
      {recipes.map((recipe) => {
        const distinguishingTag = recipe.tags.find((t) => t !== 'rapide' && t !== 'pates') ?? recipe.tags[0]
        return (
          <button
            key={recipe.id}
            type="button"
            className="recipe-disambiguation__item"
            role="listitem"
            onClick={() => onSelect(recipe.id)}
          >
            <span className="recipe-disambiguation__emoji" aria-hidden="true">{recipe.emoji}</span>
            <span className="recipe-disambiguation__info">
              <span className="recipe-disambiguation__name">{recipe.name}</span>
              <span className="recipe-disambiguation__tag">{distinguishingTag.replace('-', ' ')}</span>
              <span className="recipe-disambiguation__meta">
                <Star size={12} weight="fill" aria-hidden="true" /> {recipe.rating}
                {' · '}
                <Clock size={12} weight="bold" aria-hidden="true" /> {recipe.duration} min
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default RecipeDisambiguation
