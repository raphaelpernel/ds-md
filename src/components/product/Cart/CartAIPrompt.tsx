'use client'

import { useState } from 'react'
import './CartAIPrompt.css'

const SUGGESTIONS = [
  'Ingrédients pour salade niçoise',
  'Ma liste de courses : patates, pâtes, bananes',
  'Ce qu\'il me faut pour faire une quiche',
]

interface CartAIPromptProps {
  onSubmit?: (prompt: string) => void
}

export function CartAIPrompt({ onSubmit }: CartAIPromptProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (text: string) => {
    if (!text.trim()) return
    onSubmit?.(text.trim())
    setValue('')
  }

  return (
    <div className="cart-ai-prompt">
      <div className="cart-ai-prompt__header">
        <span className="cart-ai-prompt__icon" aria-hidden="true">✨</span>
        <p className="cart-ai-prompt__label">Ajouter des produits</p>
      </div>
      <div className="cart-ai-prompt__field">
        <input
          className="cart-ai-prompt__input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit(value)}
          placeholder="Ingrédients pour salade niçoise..."
          aria-label="Saisir une liste de courses ou des ingrédients"
        />
        <button
          className="cart-ai-prompt__send"
          onClick={() => handleSubmit(value)}
          aria-label="Envoyer"
          disabled={!value.trim()}
        >
          →
        </button>
      </div>
      <div className="cart-ai-prompt__chips" role="list" aria-label="Exemples de saisie">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            role="listitem"
            className="cart-ai-prompt__chip"
            onClick={() => setValue(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CartAIPrompt
