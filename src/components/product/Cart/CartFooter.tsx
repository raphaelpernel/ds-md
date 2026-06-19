import { Button } from '../../ui/form/Button/Button'
import './CartFooter.css'

interface CartFooterProps {
  total: number
  itemCount: number
  recipeCount: number
  storeName?: string | null
  onCheckout: () => void
  onChangeStore?: () => void
}

export function CartFooter({
  total,
  itemCount,
  recipeCount,
  storeName,
  onCheckout,
  onChangeStore,
}: CartFooterProps) {
  return (
    /* data-partner="carrefour" → Button primary hérite automatiquement de la couleur bleue */
    <div className="cart-footer" data-partner="carrefour">
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
          lIcon={<CarrefourIcon />}
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

function CarrefourIcon({ small = false }: { small?: boolean }) {
  const size = small ? 16 : 20
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="12" fill="#004899" />
      <path
        d="M8 7 L12 12 L8 17 M16 7 L12 12 L16 17"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export default CartFooter
