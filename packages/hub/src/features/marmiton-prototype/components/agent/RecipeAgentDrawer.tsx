'use client'

import { useEffect, useRef, useState } from 'react'
import { PaperPlaneRight, CheckCircle, Lightbulb, Warning, CookingPot, ArrowsClockwise, Coins } from '@phosphor-icons/react'
import { Drawer, Button, InputField, ChipTag, Loading } from '@mealz-product-team/design-system'
import { EMPTY_SLOTS } from '@/features/marmiton-prototype/lib/agentScript'
import type { AgentSlots } from '@/features/marmiton-prototype/lib/agentScript'
import { answerRecipeAsk } from '@/features/marmiton-prototype/lib/recipeAskScript'
import type { RecipeAskAnswer, RecipeChip } from '@/features/marmiton-prototype/lib/recipeAskScript'
import type { Recipe } from '@/features/marmiton-prototype/data/types/recipe'
import './RecipeAgentDrawer.css'

interface AskMessage {
  id: string
  role: 'user' | 'agent'
  text: string
  pending?: boolean
  answer?: RecipeAskAnswer
}

/** Délai de simulation (prototype scripté, pas de latence réseau réelle) — même logique que
 * `THINK_DELAY` dans `AgentConversation.tsx`, redéfini ici car ce composant a un cycle plus
 * court (une seule étape de réflexion, pas de recherche multi-recette à simuler en deux temps). */
const THINK_DELAY = 900

interface RecipeAgentDrawerProps {
  open: boolean
  onClose: () => void
  recipe: Recipe
  chips: RecipeChip[]
  /** Question déjà posée à l'ouverture (ex. clic sur une chip de la barre) — chaîne vide = ouverture sans question. */
  initialMessage: string
}

let messageId = 0
function newId() {
  messageId += 1
  return `ra-${messageId}`
}

export function RecipeAgentDrawer({ open, onClose, recipe, chips, initialMessage }: RecipeAgentDrawerProps) {
  const [messages, setMessages] = useState<AskMessage[]>([])
  const [slots, setSlots] = useState<AgentSlots>(EMPTY_SLOTS)
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
      submitAsk(initialMessage, EMPTY_SLOTS)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialMessage])

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Le focus clavier doit suivre l'ouverture du Drawer : `RecipeAskBar` ouvre ce
  // Drawer au `onFocus` de son propre input, mais ne déplace pas le focus DOM —
  // sans ça, le focus reste coincé sur un champ masqué sous l'overlay (recouvert
  // en plein écran sur mobile, `mobilePlacement="bottom"`). `InputField` (design
  // system) ne forwarde pas de ref, d'où la récupération par `id` existant plutôt
  // que d'ajouter un `forwardRef` au composant partagé.
  useEffect(() => {
    if (open) {
      document.getElementById('recipe-ask-composer-input')?.focus()
    }
  }, [open])

  useEffect(() => clearPendingTimeouts, [])

  function submitAsk(text: string, currentSlots: AgentSlots) {
    const trimmed = text.trim()
    if (!trimmed) return

    setMessages((prev) => [...prev, { id: newId(), role: 'user', text: trimmed }])

    const id = newId()
    setMessages((prev) => [...prev, { id, role: 'agent', text: '', pending: true }])

    schedule(() => {
      const { slots: nextSlots, answer } = answerRecipeAsk(recipe, trimmed, currentSlots)
      setSlots(nextSlots)
      setMessages((prev) => prev.map((m) => (m.id === id ? { id, role: 'agent', text: answer.message, answer } : m)))
    }, THINK_DELAY)
  }

  function handleSend() {
    submitAsk(draft, slots)
    setDraft('')
  }

  function handleChip(chip: RecipeChip) {
    submitAsk(chip.text, slots)
  }

  function handleClose() {
    clearPendingTimeouts()
    onClose()
    setMessages([])
    setSlots(EMPTY_SLOTS)
    processedInitial.current = null
  }

  return (
    <Drawer open={open} onClose={handleClose} title={recipe.name} placement="right" mobilePlacement="bottom">
      <div className="recipe-ask-shell">
        <div className="recipe-ask-thread" aria-live="polite">
          {messages.map((m) => (
            <div key={m.id} className={`recipe-ask-message recipe-ask-message--${m.role}`}>
              {m.pending ? (
                <div className="recipe-ask-bubble recipe-ask-bubble--pending">
                  <Loading size="S" label="Un instant…" />
                </div>
              ) : (
                <>
                  <p className="recipe-ask-bubble">{m.text}</p>
                  {m.answer && (
                    <div className="recipe-ask-answer">
                      {m.answer.allergens && m.answer.allergens.length > 0 && (
                        <p className="recipe-ask-highlight recipe-ask-highlight--warning">
                          <Warning size={16} weight="fill" aria-hidden="true" />
                          Contient : {m.answer.allergens.join(', ').toLowerCase()}
                        </p>
                      )}
                      {m.answer.pantryMatch && (
                        <p className="recipe-ask-highlight recipe-ask-highlight--success">
                          <CheckCircle size={16} weight="fill" aria-hidden="true" />
                          Utilise vos {m.answer.pantryMatch.matchedIngredientNames.join(', ').toLowerCase()}
                          {m.answer.pantryMatch.missingCount > 0
                            ? ` · il manque ${m.answer.pantryMatch.missingCount} produit${m.answer.pantryMatch.missingCount > 1 ? 's' : ''}`
                            : ' · vous avez tout'}
                        </p>
                      )}
                      {m.answer.tip && (
                        <p className="recipe-ask-highlight recipe-ask-highlight--info">
                          <Lightbulb size={16} weight="fill" aria-hidden="true" />
                          Astuce : {m.answer.tip}
                        </p>
                      )}
                      {m.answer.equipmentNote && (
                        <p className="recipe-ask-highlight recipe-ask-highlight--info">
                          <CookingPot size={16} weight="fill" aria-hidden="true" />
                          {m.answer.equipmentNote}
                        </p>
                      )}
                      {m.answer.ingredientSubstituteNote && (
                        <p className="recipe-ask-highlight recipe-ask-highlight--info">
                          <ArrowsClockwise size={16} weight="fill" aria-hidden="true" />
                          {m.answer.ingredientSubstituteNote}
                        </p>
                      )}
                      {m.answer.avoidedIngredientNote && (
                        <p className="recipe-ask-highlight recipe-ask-highlight--warning">
                          <Warning size={16} weight="fill" aria-hidden="true" />
                          {m.answer.avoidedIngredientNote}
                        </p>
                      )}
                      {m.answer.budgetNote && (
                        <p className="recipe-ask-highlight recipe-ask-highlight--info">
                          <Coins size={16} weight="fill" aria-hidden="true" />
                          {m.answer.budgetNote}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          <div ref={threadEndRef} />
        </div>

        <div className="recipe-ask-composer">
          {chips.length > 0 && (
            <div
              className="recipe-ask-composer__suggestions"
              aria-label="Raccourcis facultatifs, vous pouvez aussi continuer à écrire"
            >
              {chips.map((chip) => (
                <ChipTag key={chip.tag} type="toned" size="S" label={chip.label} onClick={() => handleChip(chip)} />
              ))}
            </div>
          )}
          <div className="recipe-ask-composer__row">
            <InputField
              id="recipe-ask-composer-input"
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

export default RecipeAgentDrawer
