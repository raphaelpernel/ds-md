'use client'

import type { ReactNode } from 'react'
import { ArrowLeft } from '@phosphor-icons/react'
import { Button } from '@mealz-product-team/design-system'
import { useAssistant } from '@/context/AssistantContext'
import './FullView.css'

interface FullViewProps {
  children: ReactNode
  /** Bouton retour flottant en alpha sur une image plutôt qu'un bouton standard
   *  au-dessus du contenu — utilisé par les vues avec un visuel plein cadre en tête
   *  (détail recette, swap produit). */
  overMedia?: boolean
}

/** Chrome commun des vues plein cadre — remplace tout `.chat-shell__history` (jamais
 *  une modale) : un seul bouton retour, `closeFullView` restaure le fil normal. */
export function FullView({ children, overMedia = false }: FullViewProps) {
  const { closeFullView } = useAssistant()

  return (
    <div className="full-view">
      <Button
        variant={overMedia ? 'alpha' : 'secondary'}
        size="S"
        iconOnly={<ArrowLeft size={18} weight="bold" aria-hidden="true" />}
        label="Retour"
        onClick={closeFullView}
        className={overMedia ? 'full-view__back full-view__back--over-media' : 'full-view__back'}
      />
      <div className="full-view__content">{children}</div>
    </div>
  )
}

export default FullView
