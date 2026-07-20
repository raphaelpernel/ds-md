'use client'

import { ChipTag } from '@mealz-product-team/design-system'
import { useSessionMemory } from '../../context/SessionMemoryContext'
import './MemoryStrip.css'

/**
 * Bandeau discret de ce que l'agent sait déjà — pas un journal de chat.
 * Partagé entre /recherche et la fiche recette (revue /plan-design-review
 * du 2026-07-20, Pass 1 : sans ça, chaque page repartait de zéro). Réutilise
 * ChipTag du design system (Pass 5) plutôt qu'un chip fait main.
 */
export function MemoryStrip() {
  const memory = useSessionMemory()

  if (memory.isEmpty) return null

  return (
    <div className="memory-strip" role="list" aria-label="Ce que l’agent se souvient de cette session">
      <span className="memory-strip__label">se souvient :</span>

      {memory.constraints.map((c) => (
        <span role="listitem" key={c.tag}>
          <ChipTag label={c.label} type="toned" size="S" onRemove={() => memory.removeConstraint(c.tag)} />
        </span>
      ))}

      {memory.maxDuration !== undefined && (
        <span role="listitem">
          <ChipTag label={`${memory.maxDuration} min max`} type="toned" size="S" onRemove={() => memory.clearMaxDuration()} />
        </span>
      )}

      {memory.ingredientAnswers.map((a) => (
        <span role="listitem" key={a.ingredientId}>
          <ChipTag label={a.ingredientQuery} type="toned" size="S" onRemove={() => memory.removeIngredientAnswer(a.ingredientId)} />
        </span>
      ))}
    </div>
  )
}

export default MemoryStrip
