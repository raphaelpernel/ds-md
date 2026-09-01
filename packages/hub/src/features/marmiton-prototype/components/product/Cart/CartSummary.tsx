import './CartSummary.css'

interface CartSummaryProps {
  total: number
  itemCount: number
  deliveryPrice?: number
  storeName?: string | null
  onCheckout: () => void
}

export function CartSummary({
  total,
  itemCount,
  deliveryPrice = 0,
  storeName,
  onCheckout,
}: CartSummaryProps) {
  const grandTotal = total + deliveryPrice

  return (
    <div className="cart-summary" data-partner="carrefour">
      <div className="cart-summary__lines">
        <div className="cart-summary__line">
          <span>Articles ({itemCount})</span>
          <span>{total.toFixed(2).replace('.', ',')} €</span>
        </div>
        <div className="cart-summary__line">
          <span>Livraison</span>
          <span>{deliveryPrice === 0 ? 'Offerte' : `${deliveryPrice.toFixed(2).replace('.', ',')} €`}</span>
        </div>
        {storeName && (
          <div className="cart-summary__store">
            <span className="cart-summary__store-icon">📍</span>
            <span>{storeName}</span>
          </div>
        )}
      </div>
      <div className="cart-summary__total">
        <span className="cart-summary__total-label">Total estimé</span>
        <span className="cart-summary__total-amount">
          {grandTotal.toFixed(2).replace('.', ',')} €
        </span>
      </div>
      <button className="cart-summary__cta" onClick={onCheckout} disabled={itemCount === 0}>
        Commander
      </button>
    </div>
  )
}

export default CartSummary
