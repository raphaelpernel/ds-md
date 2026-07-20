'use client'

import { useState } from 'react'
import { Button } from '@mealz-product-team/design-system'
import './RelaxConstraint.css'

/**
 * Aucune recette ne correspond à l'ensemble des contraintes — l'agent
 * identifie LA contrainte qui bloque et propose de la relâcher, plutôt
 * qu'un simple "aucun résultat" (brief §6 parcours A, cas dégradés §07).
 */
export function RelaxConstraint({
  blockingTagLabel,
  relaxedRecipeIds,
  onRelax,
}: {
  blockingTagLabel: string
  relaxedRecipeIds: string[]
  onRelax: (recipeIds: string[]) => void
}) {
  const [resolved, setResolved] = useState<'relaxed' | 'kept' | null>(null)

  if (resolved === 'relaxed') return null
  if (resolved === 'kept') {
    return <p className="relax-constraint__kept">Contrainte conservée — précisez encore si vous voulez ajuster.</p>
  }

  return (
    <div className="relax-constraint">
      <Button
        variant="primary"
        size="S"
        onClick={() => {
          setResolved('relaxed')
          onRelax(relaxedRecipeIds)
        }}
      >
        Oui, relâche « {blockingTagLabel} »
      </Button>
      <Button variant="secondary" size="S" onClick={() => setResolved('kept')}>
        Garde cette contrainte
      </Button>
    </div>
  )
}

export default RelaxConstraint
