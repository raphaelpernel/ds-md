'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PaperPlaneRight, Star, CheckCircle, Lightbulb, Warning, Flame, Info, CookingPot } from '@phosphor-icons/react'
import { Drawer, Button, InputField, ChipTag, Loading, Skeleton } from '@mealz-product-team/design-system'
import {
  EMPTY_SLOTS,
  processTurn,
  recommendationMessage,
  pantryMatch,
  avoidedIngredientMatch,
  selectTip,
  constraintLabel,
  selectCommunityQuote,
  isInSeason,
  type AgentSlots,
  type PantryMatch,
  type CommunityQuote,
  type RecommendedRecipe,
} from '@/lib/agentScript'
import type { Recipe, RecipeDifficulty } from '@/data/types/recipe'
import { ChatCarousel } from './ChatCarousel'
import './AgentConversation.css'

const DIFFICULTY_LABEL: Record<RecipeDifficulty, string> = {
  facile: 'Facile',
  moyen: 'Moyen',
  difficile: 'Difficile',
}

interface CardData {
  recipe: Recipe
  /** false = quasi-match (complément du slate) — porte son propre marqueur visuel, distinct d'une correspondance confirmée. */
  matched: boolean
  pantryMatch: PantryMatch | null
  tip?: string
  /** Avis communautaire contextuel (contrainte ou temps), empilé avec `tip` sur la carte quand les deux existent — maximiser l'info visible d'un coup d'œil. */
  communityQuote?: CommunityQuote
  /** Affichés seulement quand la conversation a signalé une contrainte allergie — transparence, pas de filtrage automatique. */
  allergens?: string[]
  /** Ingrédients de cette recette que la conversation a signalés comme évités par goût — informationnel, ne filtre jamais la recommandation. */
  avoidedIngredients: string[]
  health?: { calories?: number; protein?: number }
  /** Label de contrainte confirmée (ex. "Végétarien"), absent sur un quasi-match ou pour `allergie`. */
  constraintLabel?: string
  inSeason?: boolean
  servings?: number
}

/**
 * État transitoire affiché pendant que l'agent "réfléchit", avant que le contenu final ne
 * remplace ce message (cf. décision produit : le carousel de cartes ne s'affiche qu'une fois
 * la réflexion terminée — jamais de contenu partiel qui change sous les yeux de l'utilisateur,
 * seul un skeleton qui préfigure la forme en attendant).
 */
interface Pending {
  label: string
  /** Présent seulement pour un tour qui va produire des cartes — nombre de cartes skeleton à afficher. */
  skeletonCount?: number
}

interface Message {
  id: string
  role: 'user' | 'agent'
  text: string
  cards?: CardData[]
  pending?: Pending
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
    communityQuote: selectCommunityQuote(recipe, slots, matched),
    allergens: slots.constraint === 'allergie' ? recipe.allergens : undefined,
    avoidedIngredients: avoidedIngredientMatch(recipe, slots),
    // Affichée directement dès que la recette porte la donnée — plus besoin de la demander
    // via une action séparée (ancien chip "Infos nutrition").
    health: recipe.calories !== undefined ? { calories: recipe.calories, protein: recipe.protein } : undefined,
    constraintLabel: constraintLabel(recipe, slots, matched),
    inSeason: isInSeason(recipe),
    servings: slots.servings,
  }
}

function buildCards(recipes: RecommendedRecipe[], slots: AgentSlots): CardData[] {
  return recipes.map(({ recipe, matched }) => ({ recipe, matched, ...cardExtras(recipe, slots, matched) }))
}

/**
 * Relance systématique après une carte : l'agent ne laisse jamais un carousel de recettes
 * sans y donner suite (cf. pattern GPT/Claude — un widget est toujours suivi d'un message
 * texte). `recommend` invite à choisir ou relancer ; `relaxed` (contrainte abandonnée)
 * invite plutôt à préciser, car le résultat est un compromis, pas une vraie correspondance.
 */
function relanceMessage(kind: 'recommend' | 'relaxed'): string {
  return kind === 'recommend'
    ? 'Une de ces recettes vous tente, ou je vous en cherche une autre ?'
    : "Ça peut convenir, ou vous voulez que j'affine encore avec d'autres critères ?"
}

/** Délais de simulation (prototype scripté, pas de latence réseau réelle à mesurer) — volontairement
 * plus lents qu'un minimum technique, pour un rendu plus proche d'un vrai backend. */
const THINK_DELAY = 1000
const MATCH_DELAY = 1800
const RELANCE_DELAY = 700

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
  const processedInitial = useRef<string | null>(null)
  const threadEndRef = useRef<HTMLDivElement>(null)
  const pendingTimeouts = useRef<ReturnType<typeof setTimeout>[]>([])

  function schedule(fn: () => void, delay: number) {
    const timeoutId = setTimeout(fn, delay)
    pendingTimeouts.current.push(timeoutId)
  }

  function clearPendingTimeouts() {
    pendingTimeouts.current.forEach(clearTimeout)
    pendingTimeouts.current = []
  }

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

  // Une réponse encore en cours de "réflexion" quand le tiroir se ferme ne doit jamais
  // se matérialiser après coup — sinon un carousel apparaîtrait dans une conversation
  // que l'utilisateur croit avoir quittée.
  useEffect(() => clearPendingTimeouts, [])

  function submitTurn(text: string, currentSlots: AgentSlots, attempts: number) {
    const trimmed = text.trim()
    if (!trimmed) return

    setMessages((prev) => [...prev, { id: newId(), role: 'user', text: trimmed }])

    const { slots: nextSlots, result } = processTurn(trimmed, currentSlots, attempts)
    setSlots(nextSlots)

    if (result.kind === 'clarify' || result.kind === 'not_understood') {
      setClarifyAttempts(result.kind === 'clarify' ? attempts + 1 : 0)
      const id = newId()
      setMessages((prev) => [...prev, { id, role: 'agent', text: '', pending: { label: 'Un instant…' } }])
      schedule(() => {
        setMessages((prev) => prev.map((m) => (m.id === id ? { id, role: 'agent', text: result.message } : m)))
      }, THINK_DELAY)
      return
    }

    // `recommend` / `relaxed` : un carousel de cartes arrive, en deux temps — le texte de
    // réflexion change pour refléter l'étape la plus significative (le croisement avis +
    // écart panier, pas juste la classification), puis le skeleton préfigure le carousel
    // avant que le contenu réel ne le remplace d'un coup, jamais en partiel.
    setClarifyAttempts(0)
    const finalText =
      result.kind === 'recommend' ? recommendationMessage(result.recipes[0].recipe, result.reason) : result.message
    const finalCards = buildCards(result.recipes, nextSlots)
    const id = newId()

    setMessages((prev) => [...prev, { id, role: 'agent', text: '', pending: { label: 'Je regarde ce qui pourrait coller…' } }])

    schedule(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                id,
                role: 'agent',
                text: '',
                pending: {
                  label: 'Je croise avec les avis de la communauté et ce qu’il vous reste à acheter…',
                  skeletonCount: finalCards.length,
                },
              }
            : m
        )
      )
    }, THINK_DELAY)

    schedule(() => {
      setMessages((prev) => prev.map((m) => (m.id === id ? { id, role: 'agent', text: finalText, cards: finalCards } : m)))
      schedule(() => {
        setMessages((prev) => [...prev, { id: newId(), role: 'agent', text: relanceMessage(result.kind) }])
      }, RELANCE_DELAY)
    }, THINK_DELAY + MATCH_DELAY)
  }

  function handleSend() {
    submitTurn(draft, slots, clarifyAttempts)
    setDraft('')
  }

  function handleChip(chip: Chip) {
    submitTurn(chip.text, slots, clarifyAttempts)
  }

  function handleClose() {
    clearPendingTimeouts()
    onClose()
    setMessages([])
    setSlots(EMPTY_SLOTS)
    setClarifyAttempts(0)
    processedInitial.current = null
  }

  const chips = nextChips(slots)

  return (
    <Drawer open={open} onClose={handleClose} title="Une idée pour ce soir" placement="right" mobilePlacement="bottom">
      <div className="chat-shell">
        <div className="chat-thread" aria-live="polite">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`chat-message chat-message--${m.role}${m.cards || m.pending?.skeletonCount ? ' chat-message--wide' : ''}`}
            >
              {m.pending ? (
                <div className="chat-bubble chat-bubble--pending">
                  <Loading size="S" label={m.pending.label} />
                </div>
              ) : (
                <p className="chat-bubble">{m.text}</p>
              )}
              {m.pending?.skeletonCount ? (
                <ChatCarousel>
                  {Array.from({ length: m.pending.skeletonCount }, (_, i) => (
                    <div key={i} className="chat-card chat-carousel__card chat-card--skeleton" aria-hidden="true">
                      <div className="chat-card__top">
                        <span className="chat-card__header">
                          <Skeleton variant="rect" width={96} height={96} />
                          <span className="chat-card__meta">
                            <Skeleton variant="text" lines={2} />
                          </span>
                        </span>
                      </div>
                      {/* Préfigure le bandeau avis/astuce quasi systématique sur une carte finale — sans ça
                          le skeleton paraît bien plus court que la carte réelle qui le remplace. */}
                      <Skeleton variant="rect" height={36} />
                    </div>
                  ))}
                </ChatCarousel>
              ) : (
                m.cards && m.cards.length > 0 && (
                <ChatCarousel>
                  {m.cards.map((card) => (
                    <div key={card.recipe.id} className="chat-card chat-carousel__card">
                      <button
                        type="button"
                        className="chat-card__top"
                        onClick={() => router.push(`/recipe?recipe=${card.recipe.id}`)}
                        aria-label={`Voir la recette ${card.recipe.name}`}
                      >
                        <span className="chat-card__header">
                          <img src={card.recipe.imageUrl} alt="" className="chat-card__image" />
                          <span className="chat-card__meta">
                            <span className="chat-card__title">{card.recipe.name}</span>
                            <span className="chat-card__meta-row">
                              {card.recipe.rating !== undefined && (
                                <span className="chat-card__meta-item chat-card__rating">
                                  <Star size={14} weight="fill" aria-hidden="true" />
                                  {card.recipe.rating.toFixed(1)}
                                  {card.recipe.reviewCount !== undefined && ` (${card.recipe.reviewCount} avis)`}
                                </span>
                              )}
                              <span className="chat-card__meta-item">
                                {card.recipe.duration} min
                                {card.recipe.prepDuration !== undefined && ` (${card.recipe.prepDuration} min actif)`}
                              </span>
                              {card.servings !== undefined && (
                                <span className="chat-card__meta-item">Pour {card.servings}</span>
                              )}
                              {card.recipe.difficulty && (
                                <span className="chat-card__meta-item">{DIFFICULTY_LABEL[card.recipe.difficulty]}</span>
                              )}
                              {card.health?.calories !== undefined && (
                                <span className="chat-card__meta-item">
                                  <Flame size={14} aria-hidden="true" />
                                  {card.health.calories} kcal
                                  {card.health.protein !== undefined && ` · ${card.health.protein} g prot.`}
                                </span>
                              )}
                            </span>
                          </span>
                        </span>

                        {(!card.matched || card.constraintLabel || card.inSeason) && (
                          <span className="chat-card__chips">
                            {!card.matched && (
                              <span className="chat-card__compromise">
                                <Info size={14} weight="fill" aria-hidden="true" />
                                Le plus proche, sans cette contrainte
                              </span>
                            )}
                            {card.constraintLabel && (
                              <span className="chat-card__chip-static">
                                <ChipTag type="toned" size="S" label={card.constraintLabel} />
                              </span>
                            )}
                            {card.inSeason && (
                              <span className="chat-card__chip-static">
                                <ChipTag type="toned" size="S" label="De saison" />
                              </span>
                            )}
                          </span>
                        )}
                      </button>

                      {/* Absorbe la différence de hauteur du header (ex. présence ou non du bandeau de
                          chips) pour que le bloc "Selon les avis" démarre au même niveau sur chaque carte
                          du carousel — les cartes sont étirées à hauteur égale par .chat-carousel__track. */}
                      <div className="chat-card__spacer" aria-hidden="true" />

                      {card.allergens && card.allergens.length > 0 && (
                        <p className="chat-card__highlight chat-card__highlight--warning">
                          <Warning size={16} weight="fill" aria-hidden="true" />
                          Contient : {card.allergens.join(', ').toLowerCase()}
                        </p>
                      )}

                      {card.avoidedIngredients.length > 0 && (
                        <p className="chat-card__highlight chat-card__highlight--warning">
                          <Warning size={16} weight="fill" aria-hidden="true" />
                          Contient {card.avoidedIngredients.join(', ').toLowerCase()} que vous évitez
                        </p>
                      )}

                      {card.communityQuote && (
                        <p className="chat-card__highlight chat-card__highlight--info chat-card__quote">
                          <span className="chat-card__quote-attribution">Selon les avis</span>
                          <span className="chat-card__quote-text">« {card.communityQuote.text} »</span>
                        </p>
                      )}

                      {(card.pantryMatch ||
                        card.tip ||
                        (card.recipe.equipment && card.recipe.equipment.length > 0)) && (
                        <div className="chat-card__secondary">
                          {card.pantryMatch && (
                            <p className="chat-card__highlight chat-card__highlight--success chat-card__highlight--compact">
                              <CheckCircle size={14} weight="fill" aria-hidden="true" />
                              Utilise vos {card.pantryMatch.matchedIngredientNames.join(', ').toLowerCase()}
                              {card.pantryMatch.missingCount > 0
                                ? ` · il manque ${card.pantryMatch.missingCount} produit${card.pantryMatch.missingCount > 1 ? 's' : ''}`
                                : ' · vous avez tout'}
                            </p>
                          )}

                          {card.tip && (
                            <p className="chat-card__highlight chat-card__highlight--info chat-card__highlight--compact">
                              <Lightbulb size={14} weight="fill" aria-hidden="true" />
                              Astuce : {card.tip}
                            </p>
                          )}

                          {card.recipe.equipment && card.recipe.equipment.length > 0 && (
                            <p className="chat-card__highlight chat-card__highlight--info chat-card__highlight--compact">
                              <CookingPot size={14} weight="fill" aria-hidden="true" />
                              Équipement : {card.recipe.equipment.join(', ')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </ChatCarousel>
                )
              )}
            </div>
          ))}
          <div ref={threadEndRef} />
        </div>

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
