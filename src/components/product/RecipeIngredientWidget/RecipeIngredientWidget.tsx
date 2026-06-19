'use client'

import { useState } from 'react'
import { IngredientCard } from './IngredientCard'
import { RecipeOrderBanner } from './RecipeOrderBanner'
import type { Recipe } from '../../../data/types/recipe'
import type { Product } from '../../../data/types/product'
import './RecipeIngredientWidget.css'

interface RecipeIngredientWidgetProps {
  recipe: Recipe
  products: Product[]
  /** Called when user clicks "Ajouter au panier" — no login gate here */
  onOrder?: () => void
}

export function RecipeIngredientWidget({ recipe, products, onOrder }: RecipeIngredientWidgetProps) {
  const [addedCount, setAddedCount] = useState(0)

  const productMap = new Map(products.map((p) => [p.id, p]))

  const handleAdd = (_product: Product) => {
    setAddedCount((c) => c + 1)
  }

  return (
    <div className="riw">
      <div className="riw__grid">
        {recipe.ingredients.map((ingredient) => {
          const product = ingredient.productId ? (productMap.get(ingredient.productId) ?? null) : null
          return (
            <IngredientCard
              key={ingredient.id}
              ingredient={ingredient}
              product={product}
              onAdd={handleAdd}
            />
          )
        })}
      </div>

      <RecipeOrderBanner
        estimatedPrice={recipe.estimatedPricePerServing}
        servings={recipe.servings}
        onOrder={() => onOrder?.()}
        itemCount={addedCount}
      />
    </div>
  )
}

export default RecipeIngredientWidget
