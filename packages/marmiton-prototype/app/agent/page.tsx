'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PaperPlaneRight } from '@phosphor-icons/react'
import { Button, InputField, RecipeCard } from '@mealz-product-team/design-system'
import { AgentConversation } from '@/components/agent/AgentConversation'
import { MOCK_RECIPES } from '@/data/mock/recipes'
import { getProductsByRecipe } from '@/data/mock/products'
import { useCart } from '@/context/CartContext'
import './page.css'

export default function AgentPage() {
  const router = useRouter()
  const { addItem, state } = useCart()
  const [heroText, setHeroText] = useState('')
  const [conversationOpen, setConversationOpen] = useState(false)
  const [conversationSeed, setConversationSeed] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const cartProductIds = new Set(state.items.map((i) => i.product.id))

  function startConversation(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    setConversationSeed(trimmed)
    setConversationOpen(true)
  }

  function handleCardAdd(recipeId: string, recipeName: string, imageUrl: string, servings: number) {
    const products = getProductsByRecipe(recipeId).filter((p) => p.available)
    products.forEach((p) => addItem(p, recipeId, recipeName, imageUrl, servings))
  }

  function toggleFavorite(recipeId: string) {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(recipeId)) next.delete(recipeId)
      else next.add(recipeId)
      return next
    })
  }

  return (
    <main className="agent-page">
      <section className="agent-hero">
        <h1 className="agent-hero__title">Qu'est-ce qu'on mange ce soir ?</h1>
        <p className="agent-hero__subtitle">
          Dites-moi ce que vous avez, le temps qu'il vous reste, ou juste une envie — je m'occupe du tri.
        </p>

        <form
          className="agent-hero__composer"
          onSubmit={(e) => {
            e.preventDefault()
            startConversation(heroText)
          }}
        >
          <InputField
            id="agent-hero-input"
            aria-label="Décrivez ce que vous cherchez à manger"
            placeholder="« j'ai du poulet, 25 minutes, un enfant difficile » ou « j'ai des courgettes dans le frigo »…"
            value={heroText}
            onChange={(e) => setHeroText(e.target.value)}
            className="agent-hero__input"
          />
          <Button
            type="submit"
            variant="primary"
            size="L"
            label="Discuter"
            rIcon={<PaperPlaneRight size={20} weight="bold" aria-hidden="true" />}
          />
        </form>
      </section>

      <section className="agent-editorial" aria-label="La sélection Marmiton du moment">
        <h2 className="agent-editorial__title">La sélection du moment</h2>
        <div className="agent-editorial__grid">
          {MOCK_RECIPES.map((recipe) => {
            const availableProducts = getProductsByRecipe(recipe.id).filter((p) => p.available)
            const allAdded = availableProducts.length > 0 && availableProducts.every((p) => cartProductIds.has(p.id))
            return (
              <RecipeCard
                key={recipe.id}
                title={recipe.name}
                imageUrl={recipe.imageUrl}
                guests={recipe.servings}
                price={recipe.estimatedPricePerServing}
                favorite={favorites.has(recipe.id)}
                onFavoriteToggle={() => toggleFavorite(recipe.id)}
                added={allAdded}
                onAddToggle={() => handleCardAdd(recipe.id, recipe.name, recipe.imageUrl, recipe.servings)}
                onClick={() => router.push(`/recipe?recipe=${recipe.id}`)}
              />
            )
          })}
        </div>
      </section>

      <AgentConversation
        open={conversationOpen}
        onClose={() => {
          setConversationOpen(false)
          setHeroText('')
        }}
        initialMessage={conversationSeed}
      />
    </main>
  )
}
