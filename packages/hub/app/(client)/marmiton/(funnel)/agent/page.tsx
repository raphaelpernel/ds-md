'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PaperPlaneRight } from '@phosphor-icons/react'
import { Button, Heading, InputField, RecipeCard } from '@mealz-product-team/design-system'
import { AgentConversation } from '@/features/marmiton-prototype/components/agent/AgentConversation'
import { MOCK_RECIPES } from '@/features/marmiton-prototype/data/mock/recipes'
import { getProductsByRecipe } from '@/features/marmiton-prototype/data/mock/products'
import { useCart } from '@/features/marmiton-prototype/context/CartContext'

/** Salutation consciente de l'heure, facultative pour le Lot 1 mais demandée en session. */
function useGreeting() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  if (!now) return 'On prépare à manger ?'

  const hours = now.getHours()
  const salutation = hours >= 5 && hours < 18 ? 'Bonjour' : 'Bonsoir'
  const timeLabel = `${hours}h${String(now.getMinutes()).padStart(2, '0')}`

  return `${salutation}, il est ${timeLabel}, on prépare à manger ?`
}

export default function AgentPage() {
  const router = useRouter()
  const greetingTitle = useGreeting()
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
        <Heading size="lg" className="agent-hero__title">{greetingTitle}</Heading>
        <p className="agent-hero__subtitle">
          Un ingrédient dans le frigo, une envie du moment, le temps que vous avez, je trouve la recette qu'il vous faut.
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
            placeholder="« j'ai du poulet, 25 minutes, un enfant difficile »…"
            value={heroText}
            onChange={(e) => setHeroText(e.target.value)}
            className="agent-hero__input"
          />
          <Button
            type="submit"
            variant="primary"
            size="L"
            label="Discuter avec l'agent"
            iconOnly={<PaperPlaneRight size={20} weight="bold" aria-hidden="true" />}
            className="agent-hero__submit"
            disabled={!heroText.trim()}
          />
        </form>
      </section>

      <section className="agent-editorial" aria-label="La sélection Marmiton du moment">
        <Heading size="md" className="agent-editorial__title">La sélection du moment</Heading>
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
                onClick={() => router.push(`/marmiton/recipe?recipe=${recipe.id}`)}
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

      <style>{`
        .agent-page {
          min-height: 100vh;
          background: var(--color-surface-secondary, #f5f5f5);
        }

        /* ── Hero conversationnel — bloc corail "pop", pour donner envie d'ouvrir la conversation ── */
        .agent-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: var(--spacing-16);
          padding: var(--spacing-32) var(--spacing-16);
          background: linear-gradient(135deg, var(--color-interactive-bg) 0%, var(--color-interactive-bg-subtle) 100%);
        }

        /* Heading gère déjà font-family/weight/size/line-height (token --font-size-heading-xl) —
           ici on ne surcharge que la couleur (blanc, requis par le fond dégradé) et la largeur de ligne. */
        .agent-hero__title {
          color: #fff;
          text-shadow: 0 1px 12px rgba(0, 0, 0, 0.12);
        }

        .agent-hero__subtitle {
          font-family: var(--font-family-body);
          font-size: var(--font-size-body-md);
          line-height: var(--line-height-body-md);
          color: rgba(255, 255, 255, 0.92);
        }

        .agent-hero__composer {
          display: flex;
          align-items: center;
          gap: var(--spacing-8);
          width: 100%;
          max-width: 640px;
          margin-top: var(--spacing-8);
          background: var(--color-surface-primary);
          border-radius: var(--shape-pill, 999px);
          padding: var(--spacing-8);
          box-shadow: var(--elevation-600, 0 12px 32px rgba(0, 0, 0, 0.18));
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        /* Le composant InputField pose son propre indicateur de focus (border-color) sur
           .input-field__input — neutralisé ci-dessous puisqu'on retire cette bordure pour
           fondre l'input dans la pilule. On reporte donc l'indicateur de focus sur la pilule
           entière : plus cohérent visuellement qu'un anneau autour du seul champ, et ça
           double comme micro-interaction "je vous écoute" pour inviter à taper. */
        .agent-hero__composer:hover {
          transform: translateY(-2px);
        }

        .agent-hero__composer:focus-within {
          transform: translateY(-2px);
          box-shadow:
            var(--elevation-600, 0 12px 32px rgba(0, 0, 0, 0.18)),
            0 0 0 3px rgba(255, 255, 255, 0.55);
        }

        .agent-hero__input {
          flex: 1;
        }

        /* InputField pose son style visuel (border/background/radius) sur l'<input> natif
           lui-même, pas sur .input-field__wrapper (simple conteneur de positionnement) —
           c'est donc .input-field__input qu'il faut recadrer pour qu'il se fonde dans la
           pilule blanche de .agent-hero__composer, sans dupliquer le composant. */
        .agent-hero__input .input-field__input {
          border: none;
          background: transparent;
          border-radius: var(--shape-pill, 999px);
          max-height: none;
        }

        .agent-hero__submit {
          border-radius: var(--shape-pill, 999px);
          flex-shrink: 0;
        }

        /* Nudge du plan d'envoi vers sa propre direction de vol au survol — un seul
           mouvement autorisé sur ce composant, pas un traitement générique de bouton. */
        .agent-hero__submit .btn__icon {
          transition: transform 0.2s ease;
        }

        .agent-hero__submit:hover:not(:disabled) .btn__icon {
          transform: translate(2px, -2px);
        }

        @media (prefers-reduced-motion: reduce) {
          .agent-hero__composer,
          .agent-hero__submit .btn__icon {
            transition: none;
          }
          .agent-hero__composer:hover,
          .agent-hero__composer:focus-within,
          .agent-hero__submit:hover:not(:disabled) .btn__icon {
            transform: none;
          }
        }

        /* ── Grille éditoriale ── */
        .agent-editorial {
          padding: 32px 16px 56px;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Heading gère déjà typo + couleur — seul l'espacement bas est spécifique à ce layout. */
        .agent-editorial__title {
          margin-bottom: var(--spacing-16);
        }

        .agent-editorial__grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-16);
        }

        @media (min-width: 640px) {
          .agent-editorial__grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .agent-hero {
            padding: 72px 24px 56px;
          }
          .agent-hero__title {
            max-width: 24ch;
          }
          .agent-editorial__grid {
            grid-template-columns: repeat(4, 1fr);
            gap: var(--spacing-24, 24px);
          }
        }
      `}</style>
    </main>
  )
}
