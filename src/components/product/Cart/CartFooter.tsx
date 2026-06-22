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
}

export function CartFooter({
  total,
  itemCount,
  recipeCount,
  storeName,
  onCheckout,
  onChangeStore,
  onViewDetail,
}: CartFooterProps) {
  return (
    /* data-partner="carrefour" → Button primary hérite automatiquement de la couleur bleue */
    <div className="cart-footer" data-partner="carrefour">
      {onViewDetail && (
        <div className="cart-footer__detail">
          <button className="cart-footer__detail-btn" onClick={onViewDetail}>
            Voir le détail →
          </button>
        </div>
      )}

      <div className="cart-footer__main">
        <div className="cart-footer__left">
          <p className="cart-footer__price">
            {total.toFixed(2).replace('.', ',')} €
          </p>
          <p className="cart-footer__meta">
            {itemCount} produit{itemCount > 1 ? 's' : ''}
            {recipeCount > 0 && ` · ${recipeCount} recette${recipeCount > 1 ? 's' : ''}`}
          </p>
        </div>

        <Button
          variant="primary"
          size="L"
          lIcon={<CarrefourIcon white />}
          onClick={onCheckout}
          disabled={itemCount === 0}
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

export default CartFooter
