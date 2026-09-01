'use client'

import type { ComponentType } from 'react'
import { Basket, Clock, Leaf, PiggyBank, ShoppingCartSimple } from '@phosphor-icons/react'
import type { IconProps } from '@phosphor-icons/react'
import './CartAIPromptSuggestions.css'

interface Suggestion {
  icon: ComponentType<IconProps>
  label: string
}

const SUGGESTIONS: Suggestion[] = [
  { icon: Basket, label: 'Ingrédients pour une salade niçoise pour 4' },
  { icon: ShoppingCartSimple, label: 'Petit-déjeuner équilibré pour enfants' },
  { icon: PiggyBank, label: 'Repas complet à moins de 5 € par personne' },
  { icon: Leaf, label: 'Menu végétarien pour la semaine' },
  { icon: Clock, label: 'Dîner rapide en moins de 20 minutes' },
]

interface CartAIPromptSuggestionsProps {
  onSelect: (prompt: string) => void
  disabled?: boolean
}

export function CartAIPromptSuggestions({ onSelect, disabled = false }: CartAIPromptSuggestionsProps) {
  return (
    <div className="cart-ai-suggestions" role="list">
      {SUGGESTIONS.map(({ icon: Icon, label }) => (
        <button
          key={label}
          type="button"
          role="listitem"
          className="cart-ai-suggestions__item"
          onClick={() => onSelect(label)}
          disabled={disabled}
        >
          <Icon size={18} weight="regular" className="cart-ai-suggestions__icon" />
          <span className="cart-ai-suggestions__label">{label}</span>
        </button>
      ))}
    </div>
  )
}

export default CartAIPromptSuggestions
