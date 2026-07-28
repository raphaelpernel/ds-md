'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PaperPlaneRight, Star, CheckCircle, Lightbulb, Warning, Flame } from '@phosphor-icons/react'
import { Drawer, Button, InputField, ChipTag } from '@mealz-product-team/design-system'
import {
  EMPTY_SLOTS,
  processTurn,
  recommendationMessage,
  pantryMatch,
  selectTip,
  constraintLabel,
  isInSeason,
  type AgentSlots,
  type PantryMatch,
} from '@/lib/agentScript'
import type { Recipe, RecipeDifficulty } from '@/data/types/recipe'
import './AgentConversation.css'

const DIFFICULTY_LABEL: Record<RecipeDifficulty, string> = {
  facile: 'Facile',
  moyen: 'Moyen',
  difficile: 'Difficile',
}

interface Message {
  id: string
  role: 'user' | 'agent'
  text: string
  recipe?: Recipe
  pantryMatch?: PantryMatch | null
  tip?: string
  /** Affichés seulement quand la conversation a signalé une contrainte allergie — transparence, pas de filtrage automatique. */
  allergens?: string[]
  health?: { calories?: number; protein?: number }
  /** Label de contrainte confirmée (ex. "Végétarien"), absent sur un résultat `relaxed` ou pour `allergie`. */
  constraintLabel?: string
  inSeason?: boolean
  servings?: number
}

interface Chip {
  label: string
  text: string
}

function nextChips(slots: AgentSlots): Chip[] {
  if (slots.time === undefined) {
    return [
      { label: '15 min', text: '15 min' },
      { label: '25 min', text: '25 min' },
      { label: '45 min', text: '45 min' },
    ]
  }
  if (slots.servings === undefined) {
    return [
      { label: '1 personne', text: '1 personne' },
      { label: '2 personnes', text: '2 personnes' },
      { label: '4 personnes', text: '4 personnes' },
    ]
  }
  if (slots.constraint === undefined) {
    return [
      { label: 'Enfant difficile', text: "un enfant qui n'aime pas trop la sauce" },
      { label: 'Végétarien', text: 'plutôt végétarien' },
    ]
  }
  return []
}

function cardExtras(recipe: Recipe, slots: AgentSlots, matched: boolean) {
  return {
    pantryMatch: pantryMatch(recipe, slots),
    tip: selectTip(recipe, slots),
    allergens: slots.constraint === 'allergie' ? recipe.allergens : undefined,
    health: slots.healthFocus ? { calories: recipe.calories, protein: recipe.protein } : undefined,
    constraintLabel: constraintLabel(recipe, slots, matched),
    inSeason: isInSeason(recipe),
    servings: slots.servings,
  }
}

interface AgentConversationProps {
  open: boolean
  onClose: () => void
  initialMessage: string
}

let messageId = 0
function newId() {
  messageId += 1
  return `m-${messageId}`
}

export function AgentConversation({ open, onClose, initialMessage }: AgentConversationProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [slots, setSlots] = useState<AgentSlots>(EMPTY_SLOTS)
  const [clarifyAttempts, setClarifyAttempts] = useState(0)
  const [draft, setDraft] = useState('')
  const [resolvedRecipe, setResolvedRecipe] = useState<Recipe | null>(null)
  const processedInitial = useRef<string | null>(null)
  const threadEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && initialMessage && processedInitial.current !== initialMessage) {
      processedInitial.current = initialMessage
      submitTurn(initialMessage, EMPTY_SLOTS, 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialMessage])

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function submitTurn(text: string, currentSlots: AgentSlots, attempts: number) {
    const trimmed = text.trim()
    if (!trimmed) return

    setMessages((prev) => [...prev, { id: newId(), role: 'user', text: trimmed }])

    const { slots: nextSlots, result } = processTurn(trimmed, currentSlots, attempts)
    setSlots(nextSlots)

    if (result.kind === 'clarify') {
      setClarifyAttempts(attempts + 1)
      setMessages((prev) => [...prev, { id: newId(), role: 'agent', text: result.message }])
    } else if (result.kind === 'not_understood') {
      setClarifyAttempts(0)
      setMessages((prev) => [...prev, { id: newId(), role: 'agent', text: result.message }])
    } else if (result.kind === 'recommend') {
      setClarifyAttempts(0)
      setResolvedRecipe(result.recipe)
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: 'agent',
          text: recommendationMessage(result.recipe, result.reason),
          recipe: result.recipe,
          ...cardExtras(result.recipe, nextSlots, true),
        },
      ])
    } else if (result.kind === 'relaxed') {
      setClarifyAttempts(0)
      setResolvedRecipe(result.recipe)
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: 'agent',
          text: result.message,
          recipe: result.recipe,
          ...cardExtras(result.recipe, nextSlots, false),
        },
      ])
    }
  }

  function handleSend() {
    submitTurn(draft, slots, clarifyAttempts)
    setDraft('')
  }

  function handleChip(chip: Chip) {
    submitTurn(chip.text, slots, clarifyAttempts)
  }

  function handleClose() {
    onClose()
    setMessages([])
    setSlots(EMPTY_SLOTS)
    setClarifyAttempts(0)
    setResolvedRecipe(null)
    processedInitial.current = null
  }

  const chips = nextChips(slots)

  return (
    <Drawer open={open} onClose={handleClose} title="Une idée pour ce soir" placement="right" mobilePlacement="bottom">
      <div className="chat-shell">
        <div className="chat-thread">
          {messages.map((m) => (
            <div key={m.id} className={`chat-message chat-message--${m.role}`}>
              <p className="chat-bubble">{m.text}</p>
              {m.recipe && (
                <button
                  type="button"
                  className="chat-card"
                  onClick={() => router.push(`/recipe?recipe=${m.recipe!.id}`)}
                >
                  <span className="chat-card__top">
                    <img src={m.recipe.imageUrl} alt="" className="chat-card__image" />
                    <span className="chat-card__meta">
                      <span className="chat-card__title">{m.recipe.name}</span>
                      <span className="chat-card__meta-row">
                        {m.recipe.rating !== undefined && (
                          <span className="chat-card__meta-item chat-card__rating">
                            <Star size={14} weight="fill" aria-hidden="true" />
                            {m.recipe.rating.toFixed(1)}
                            {m.recipe.reviewCount !== undefined && ` (${m.recipe.reviewCount} avis)`}
                          </span>
                        )}
                        <span className="chat-card__meta-item">{m.recipe.duration} min</span>
                        {m.servings !== undefined && (
                          <span className="chat-card__meta-item">Pour {m.servings}</span>
                        )}
                        {m.recipe.difficulty && (
                          <span className="chat-card__meta-item">{DIFFICULTY_LABEL[m.recipe.difficulty]}</span>
                        )}
                        {m.health?.calories !== undefined && (
                          <span className="chat-card__meta-item">
                            <Flame size={14} aria-hidden="true" />
                            {m.health.calories} kcal
                            {m.health.protein !== undefined && ` · ${m.health.protein} g prot.`}
                          </span>
                        )}
                      </span>
                    </span>
                  </span>

                  {(m.constraintLabel || m.inSeason) && (
                    <span className="chat-card__chips">
                      {m.constraintLabel && <ChipTag type="toned" size="S" label={m.constraintLabel} />}
                      {m.inSeason && <ChipTag type="toned" size="S" label="De saison" />}
                    </span>
                  )}

                  {m.allergens && m.allergens.length > 0 && (
                    <span className="chat-card__highlight chat-card__highlight--warning">
                      <Warning size={16} weight="fill" aria-hidden="true" />
                      Contient : {m.allergens.join(', ').toLowerCase()}
                    </span>
                  )}

                  {m.pantryMatch && (
                    <span className="chat-card__highlight chat-card__highlight--success">
                      <CheckCircle size={16} weight="fill" aria-hidden="true" />
                      Utilise vos {m.pantryMatch.matchedIngredientNames.join(', ').toLowerCase()}
                      {m.pantryMatch.missingCount > 0
                        ? ` · il manque ${m.pantryMatch.missingCount} produit${m.pantryMatch.missingCount > 1 ? 's' : ''}`
                        : ' · vous avez tout'}
                    </span>
                  )}

                  {m.tip && (
                    <span className="chat-card__highlight chat-card__highlight--info">
                      <Lightbulb size={16} weight="fill" aria-hidden="true" />
                      Astuce : {m.tip}
                    </span>
                  )}
                </button>
              )}
            </div>
          ))}
          <div ref={threadEndRef} />
        </div>

        {resolvedRecipe && (
          <div className="chat-cta">
            <Button
              variant="primary"
              size="M"
              label="Voir la recette"
              onClick={() => router.push(`/recipe?recipe=${resolvedRecipe.id}`)}
            />
          </div>
        )}

        <div className="chat-composer">
          {chips.length > 0 && (
            <div className="chat-composer__suggestions" aria-label="Raccourcis facultatifs, vous pouvez aussi continuer à écrire">
              {chips.map((chip) => (
                <ChipTag key={chip.label} type="toned" size="S" label={chip.label} onClick={() => handleChip(chip)} />
              ))}
            </div>
          )}

          <div className="chat-composer__row">
            <InputField
              id="chat-composer-input"
              aria-label="Continuer la conversation"
              placeholder="Continuez à écrire, par exemple « et sans lactose ? »"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend()
              }}
            />
            <Button
              variant="primary"
              size="M"
              iconOnly={<PaperPlaneRight size={18} weight="bold" aria-hidden="true" />}
              label="Envoyer"
              onClick={handleSend}
            />
          </div>
        </div>
      </div>
    </Drawer>
  )
}

export default AgentConversation
