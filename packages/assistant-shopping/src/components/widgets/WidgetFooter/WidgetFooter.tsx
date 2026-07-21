'use client'

import { ShoppingCart } from '@phosphor-icons/react'
import { Button } from '@mealz-product-team/design-system'
import { useAssistant } from '@/context/AssistantContext'
import './WidgetFooter.css'

interface WidgetFooterDefaultProps {
  type?: 'default'
  label: string
  disabled?: boolean
  onSubmit: () => void
  /** Affiche un second bouton "Voir mon panier" à côté du CTA principal
   *  (ex : liste déjà ajoutée) — envoie le panier dans le chat via `openCart`. */
  secondaryAction?: boolean
}

interface WidgetFooterMoreProductsProps {
  type: 'more-products'
  count: number
  emojis: string[]
  onShowAll: () => void
}

type WidgetFooterProps = WidgetFooterDefaultProps | WidgetFooterMoreProductsProps

/** Pied partagé des widgets de contenu — seule `ShoppingList` l'utilise (recettes
 *  et panier le masquent, conformément au Figma). */
export function WidgetFooter(props: WidgetFooterProps) {
  const { openCart } = useAssistant()

  if (props.type === 'more-products') {
    return (
      <div className="widget-footer widget-footer--more-products">
        <div className="widget-footer__overflow">
          {props.emojis.slice(0, 2).map((emoji, index) => (
            <span key={index} className="widget-footer__overflow-thumb" aria-hidden="true">
              {emoji}
            </span>
          ))}
          <p className="widget-footer__overflow-count">{`+ ${props.count} produits`}</p>
        </div>
        <Button variant="secondary" size="S" onClick={props.onShowAll}>
          Voir tous les produits
        </Button>
      </div>
    )
  }

  return (
    <div className="widget-footer">
      <Button
        variant="primary"
        size="M"
        disabled={props.disabled}
        onClick={props.onSubmit}
        lIcon={<ShoppingCart size={20} weight="bold" aria-hidden="true" />}
        className="widget-footer__submit"
      >
        {props.label}
      </Button>
      {props.secondaryAction && (
        <Button variant="secondary" size="M" onClick={openCart} className="widget-footer__submit">
          Voir mon panier
        </Button>
      )}
    </div>
  )
}

export default WidgetFooter
