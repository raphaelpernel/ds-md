'use client'

import { IngredientCard } from './IngredientCard'
import type { Recipe } from '../../../data/types/recipe'
import type { Product } from '../../../data/types/product'
import './RecipeIngredientWidget.css'

export type ViewMode = 'grid' | 'list'

interface RecipeIngredientWidgetProps {
  recipe: Recipe
  products: Product[]
  view?: ViewMode
}

export function RecipeIngredientWidget({ recipe, products, view = 'grid' }: RecipeIngredientWidgetProps) {
  const productMap = new Map(products.map((p) => [p.id, p]))

  return (
    <div className="riw">
      <div className={view === 'grid' ? 'riw__grid' : 'riw__list'}>
        {recipe.ingredients.map((ingredient) => {
          const product = ingredient.productId ? (productMap.get(ingredient.productId) ?? null) : null
          return (
            <IngredientCard
              key={ingredient.id}
              ingredient={ingredient}
              product={product}
              view={view}
              recipeId={recipe.id}
              recipeName={recipe.name}
            />
          )
        })}
      </div>
    </div>
  )
}

interface ViewToggleProps {
  view: ViewMode
  onChange: (view: ViewMode) => void
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="riw__toolbar">
      <button
        className={`riw__view-btn${view === 'grid' ? ' riw__view-btn--active' : ''}`}
        onClick={() => onChange('grid')}
        aria-label="Vue grille"
        aria-pressed={view === 'grid'}
      >
        <GridIcon />
      </button>
      <button
        className={`riw__view-btn${view === 'list' ? ' riw__view-btn--active' : ''}`}
        onClick={() => onChange('list')}
        aria-label="Vue liste"
        aria-pressed={view === 'list'}
      >
        <ListIcon />
      </button>
    </div>
  )
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="2" width="14" height="2" rx="1" fill="currentColor" />
      <rect x="1" y="7" width="14" height="2" rx="1" fill="currentColor" />
      <rect x="1" y="12" width="14" height="2" rx="1" fill="currentColor" />
    </svg>
  )
}

export default RecipeIngredientWidget
