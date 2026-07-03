import { ArrowRight } from '@phosphor-icons/react'
import { Button } from '../../ui/form/Button/Button'
import './CartFooter.css'

interface CartFooterProps {
  total: number
  itemCount: number
  recipeCount: number
  storeName?: string | null
  onCheckout?: () => void
  onChangeStore?: () => void
  /** Affiche un message contextuel quand le panier est vide */
  isEmpty?: boolean
  /**
   * Identifiant partenaire transmis en `data-partner` pour le theming.
   * Contrôle la couleur du bouton CTA via CSS. Le CTA de commande mène
   * toujours vers Carrefour : ne pas passer "marmiton" ici.
   * @example "carrefour"
   */
  partner?: string
  /**
   * 'checkout' (défaut) : CTA "Commander" → finalise la commande.
   * 'view' : CTA "Voir mon panier" → ouvre la page /panier. Utilisé dans le
   * drawer d'aperçu rapide, qui ne finalise plus la commande lui-même.
   */
  mode?: 'checkout' | 'view'
  onViewCart?: () => void
}

export function CartFooter({
  total,
  itemCount,
  recipeCount,
  storeName,
  onCheckout,
  onChangeStore,
  isEmpty = false,
  partner = 'carrefour',
  mode = 'checkout',
  onViewCart,
}: CartFooterProps) {
  const isViewMode = mode === 'view'

  return (
    <div className="cart-footer" data-partner={partner}>
      <div className="cart-footer__main">
        <div className="cart-footer__left">
          {isEmpty ? (
            <p className="cart-footer__empty-hint">
              Ajoutez des articles pour commander
            </p>
          ) : (
            <>
              <p className="cart-footer__price">
                {total.toFixed(2).replace('.', ',')} €
              </p>
              <p className="cart-footer__meta">
                {itemCount} produit{itemCount > 1 ? 's' : ''}
                {recipeCount > 0 && ` · ${recipeCount} recette${recipeCount > 1 ? 's' : ''}`}
              </p>
            </>
          )}
        </div>

        {isViewMode ? (
          <Button
            variant="primary"
            size="L"
            rIcon={<ArrowRight size={16} weight="bold" aria-hidden="true" />}
            onClick={onViewCart}
            disabled={isEmpty || itemCount === 0}
          >
            Voir mon panier
          </Button>
        ) : (
          <Button
            variant="primary"
            size="L"
            lIcon={<CarrefourIcon white />}
            onClick={onCheckout}
            disabled={isEmpty || itemCount === 0}
          >
            Commander
          </Button>
        )}
      </div>

      {storeName && (
        <div className="cart-footer__store">
          <CarrefourIcon small />
          <span className="cart-footer__store-name">{storeName}</span>
          <Button variant="tertiary" size="S" onClick={onChangeStore}>
            Changer
          </Button>
        </div>
      )}
    </div>
  )
}

function CarrefourIcon({ small = false, white = false }: { small?: boolean; white?: boolean }) {
  const size = small ? 40 : 16
  return (
    <img
      src="/logos/logo-carrefour.svg"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{ objectFit: 'contain', display: 'block', filter: white ? 'brightness(0) invert(1)' : undefined }}
    />
  )
}

export default CartFooter
