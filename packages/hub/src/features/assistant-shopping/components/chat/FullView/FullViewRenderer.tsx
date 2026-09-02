'use client'

import type { FullViewState } from '@/features/assistant-shopping/data/types/chat'
import { ShoppingList } from '@/features/assistant-shopping/components/widgets/ShoppingList/ShoppingList'
import { RecipeCarousel } from '@/features/assistant-shopping/components/widgets/RecipeCarousel/RecipeCarousel'
import { CartWidget } from '@/features/assistant-shopping/components/widgets/CartWidget/CartWidget'
import { RecipeDetail } from '@/features/assistant-shopping/components/widgets/RecipeDetail/RecipeDetail'
import { ProductSwapView } from '@/features/assistant-shopping/components/widgets/ProductSwapView/ProductSwapView'
import { ProductChoiceView } from '@/features/assistant-shopping/components/widgets/ProductChoiceView/ProductChoiceView'
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
