'use client'

import { useState } from 'react'
import { ArrowUp, Info } from '@phosphor-icons/react'
import { Button } from '../../ui/form/Button/Button'
import './CartAIPrompt.css'

const HINT =
  "Essayez « ingrédients pour une salade niçoise » ou « ma liste : farine, œufs, lait, pain, dentifrice »"

interface CartAIPromptProps {
  onSubmit?: (prompt: string) => void
  loading?: boolean
}

export function CartAIPrompt({ onSubmit, loading = false }: CartAIPromptProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (text: string) => {
    if (!text.trim() || loading) return
    onSubmit?.(text.trim())
    setValue('')
  }

  return (
    <div className="cart-ai-prompt">
      <div className="cart-ai-prompt__header">
        <h3 className="cart-ai-prompt__title">Compléter mon panier</h3>
        <Button
          variant="tertiary"
          size="XS"
          iconOnly={<Info size={16} weight="regular" />}
          label="En savoir plus sur la saisie assistée"
        />
      </div>

      <div className="cart-ai-prompt__field">
        <input
          className="cart-ai-prompt__input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit(value)}
          placeholder="Décrivez votre besoin..."
          aria-label="Décrire votre besoin en langage naturel"
          disabled={loading}
        />
        <Button
          variant="primary"
          size="XS"
          iconOnly={<ArrowUp size={16} weight="bold" />}
          label="Envoyer"
          onClick={() => handleSubmit(value)}
          disabled={!value.trim() || loading}
        />
      </div>

      <p className="cart-ai-prompt__hint">
        <span className="cart-ai-prompt__hint-icon" aria-hidden="true">✦</span>
        {HINT}
      </p>
    </div>
  )
}

export default CartAIPrompt
