'use client'

import { useState } from 'react'
import { PaperPlaneRight } from '@phosphor-icons/react'
import { Button, ChipTag, InputField } from '@mealz-product-team/design-system'
import type { RecipeChip } from '@/lib/recipeAskScript'
import './RecipeAskBar.css'

interface RecipeAskBarProps {
  chips: RecipeChip[]
  /** Ouvre la conversation agent. Chaîne vide = ouverture sans question pré-remplie. */
  onOpen: (message: string) => void
}

export function RecipeAskBar({ chips, onOpen }: RecipeAskBarProps) {
  const [draft, setDraft] = useState('')

  function handleSubmit() {
    onOpen(draft)
    setDraft('')
  }

  return (
    <div className="recipe-ask-bar">
      {chips.length > 0 && (
        <div className="recipe-ask-bar__chips">
          {chips.map((chip) => (
            <ChipTag key={chip.tag} type="toned" size="S" label={chip.label} onClick={() => onOpen(chip.text)} />
          ))}
        </div>
      )}
      <div className="recipe-ask-bar__row">
        <InputField
          id="recipe-ask-input"
          aria-label="Poser une question sur cette recette"
          placeholder="Substituer un ingrédient, ajuster les portions..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => {
            if (!draft) onOpen('')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
        />
        <Button
          variant="primary"
          size="M"
          iconOnly={<PaperPlaneRight size={18} weight="bold" aria-hidden="true" />}
          label="Poser la question"
          onClick={handleSubmit}
        />
      </div>
    </div>
  )
}

export default RecipeAskBar
