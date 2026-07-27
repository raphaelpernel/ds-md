'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PaperPlaneRight } from '@phosphor-icons/react'
import { Drawer, Button, InputField, ChipTag } from '@mealz-product-team/design-system'
import { EMPTY_SLOTS, processTurn, type AgentSlots } from '@/lib/agentScript'
import type { Recipe } from '@/data/types/recipe'
import './AgentConversation.css'

interface Message {
  id: string
  role: 'user' | 'agent'
  text: string
  recipe?: Recipe
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
        { id: newId(), role: 'agent', text: `${result.recipe.name} — ${result.reason}.`, recipe: result.recipe },
      ])
    } else if (result.kind === 'relaxed') {
      setClarifyAttempts(0)
      setResolvedRecipe(result.recipe)
      setMessages((prev) => [...prev, { id: newId(), role: 'agent', text: result.message, recipe: result.recipe }])
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
      <div className="agent-conv">
        <div className="agent-conv__thread">
          {messages.map((m) => (
            <div key={m.id} className={`agent-conv__turn agent-conv__turn--${m.role}`}>
              <p className="agent-conv__text">{m.text}</p>
              {m.recipe && (
                <button
                  type="button"
                  className="agent-conv__result-card"
                  onClick={() => router.push(`/recipe?recipe=${m.recipe!.id}`)}
                >
                  <img src={m.recipe.imageUrl} alt="" className="agent-conv__result-img" />
                  <span className="agent-conv__result-meta">
                    <span className="agent-conv__result-title">{m.recipe.name}</span>
                    <span className="agent-conv__result-sub">{m.recipe.duration} min · {m.recipe.servings} pers.</span>
                  </span>
                </button>
              )}
            </div>
          ))}
          <div ref={threadEndRef} />
        </div>

        {resolvedRecipe && (
          <div className="agent-conv__cta">
            <Button
              variant="primary"
              size="M"
              label="Voir la recette"
              onClick={() => router.push(`/recipe?recipe=${resolvedRecipe.id}`)}
            />
          </div>
        )}

        {chips.length > 0 && (
          <div className="agent-conv__chips" aria-label="Raccourcis — facultatif, vous pouvez aussi continuer à écrire">
            {chips.map((chip) => (
              <ChipTag key={chip.label} type="toned" size="S" label={chip.label} onClick={() => handleChip(chip)} />
            ))}
          </div>
        )}

        <div className="agent-conv__composer">
          <InputField
            id="agent-conv-input"
            aria-label="Continuer la conversation"
            placeholder="Continuez à écrire — « et sans lactose ? », « plutôt pour 4 »…"
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
    </Drawer>
  )
}

export default AgentConversation
