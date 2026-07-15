'use client'

import { useState } from 'react'
import { ArrowUp } from '@phosphor-icons/react'
import { Button, ChipTag } from '@mealz-product-team/design-system'
import { useAssistant } from '@/context/AssistantContext'
import './ChatComposer.css'

const SUGGESTIONS = [
  'Des recettes avec du poulet',
  'Une liste de courses pour une raclette',
  'Une idée de dessert au chocolat',
  'Mon panier',
]

export function ChatComposer() {
  const { sendMessage, loading } = useAssistant()
  const [value, setValue] = useState('')

  const handleSend = (text: string) => {
    if (!text.trim() || loading) return
    sendMessage(text)
    setValue('')
  }

  return (
    <div className="chat-composer">
      <div className="chat-composer__inner">
        <div className="chat-composer__suggestions">
          {SUGGESTIONS.map((suggestion) => (
            <ChipTag
              key={suggestion}
              label={suggestion}
              type="neutral-outline"
              size="S"
              onClick={() => handleSend(suggestion)}
            />
          ))}
        </div>

        <div className="chat-composer__field">
          <input
            className="chat-composer__input"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(value)}
            placeholder="Écrivez votre demande… (ex : « recettes végétariennes pour 4 personnes »)"
            aria-label="Écrire un message à l'assistant"
            disabled={loading}
          />
          <Button
            variant="primary"
            size="M"
            iconOnly={<ArrowUp size={18} weight="bold" />}
            label="Envoyer"
            onClick={() => handleSend(value)}
            disabled={!value.trim() || loading}
          />
        </div>
      </div>
    </div>
  )
}

export default ChatComposer
