import { Button } from '../../ui/form/Button/Button'
import './CartFooter.css'

interface CartFooterProps {
  total: number
  itemCount: number
  recipeCount: number
  storeName?: string | null
  onCheckout: () => void
  onChangeStore?: () => void
  onViewDetail?: () => void
  /** Affiche un message contextuel quand le panier est vide */
  isEmpty?: boolean
  /**
   * Identifiant partenaire transmis en `data-partner` pour le theming.
   * Contrôle la couleur du bouton CTA via CSS.
   * @example "carrefour" | "marmiton"
   */
  partner?: string
}

export function CartFooter({
  total,
  itemCount,
  recipeCount,
  storeName,
  onCheckout,
  onChangeStore,
  onViewDetail,
  isEmpty = false,
  partner,
}: CartFooterProps) {
  return (
    <div className="cart-footer" data-partner={partner}>
      {onViewDetail && (
        <div className="cart-footer__detail">
          <button className="cart-footer__detail-btn" onClick={onViewDetail}>
            Voir le détail
            <ArrowRightIcon />
          </button>
        </div>
      )}

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

        <Button
          variant="primary"
          size="L"
          lIcon={<CarrefourIcon white />}
          onClick={onCheckout}
          disabled={isEmpty || itemCount === 0}
        >
          Commander
        </Button>
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

function ArrowRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 4 }}
    >
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default CartFooter
