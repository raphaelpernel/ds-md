'use client'

import type { FullViewState } from '@/data/types/chat'
import { ShoppingList } from '@/components/widgets/ShoppingList/ShoppingList'
import { RecipeCarousel } from '@/components/widgets/RecipeCarousel/RecipeCarousel'
import { CartWidget } from '@/components/widgets/CartWidget/CartWidget'
import { RecipeDetail } from '@/components/widgets/RecipeDetail/RecipeDetail'
import { ProductSwapView } from '@/components/widgets/ProductSwapView/ProductSwapView'
import { ProductChoiceView } from '@/components/widgets/ProductChoiceView/ProductChoiceView'
import { FullView } from './FullView'

/** Sélectionne le contenu plein cadre à afficher à la place du fil de conversation
 *  (cf. `AssistantContext.fullView`) — `recipe-detail`/`product-swap` gèrent déjà
 *  leur propre chrome `FullView` (bouton retour en alpha sur l'image), les widgets
 *  "agrandis" (liste de courses / recettes / panier) sont enveloppés ici. */
export function FullViewRenderer({ state }: { state: FullViewState }) {
  switch (state.type) {
    case 'shopping-list':
      return (
        <FullView>
          <ShoppingList productIds={state.productIds} requestId={state.requestId} fullView />
        </FullView>
      )
    case 'recipes':
      return (
        <FullView>
          <RecipeCarousel recipeIds={state.recipeIds} fullView />
        </FullView>
      )
    case 'cart':
      return (
        <FullView>
          <CartWidget fullView />
        </FullView>
      )
    case 'recipe-detail':
      return <RecipeDetail recipeId={state.recipeId} recipeIds={state.recipeIds} />
    case 'product-swap':
      return <ProductSwapView originalId={state.originalId} />
    case 'product-choice':
      return <ProductChoiceView productIds={state.productIds} focusedProductId={state.focusedProductId} />
    default:
      return null
  }
}

export default FullViewRenderer
