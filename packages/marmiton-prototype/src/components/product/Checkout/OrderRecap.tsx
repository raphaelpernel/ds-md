import type { CartItem } from '../../../data/types/cart'
import type { Timeslot } from '../../../data/types/timeslot'
import './OrderRecap.css'

interface OrderRecapProps {
  items: CartItem[]
  total: number
  storeName: string | null
  timeslot: Timeslot | null
  deliveryPrice?: number
}

export function OrderRecap({
  items,
  total,
  storeName,
  timeslot,
  deliveryPrice = 0,
}: OrderRecapProps) {
  return (
    <div className="order-recap">
      <h2 className="order-recap__title">Récapitulatif</h2>

      {(storeName || timeslot) && (
        <div className="order-recap__delivery-info" data-partner="carrefour">
          {storeName && (
            <div className="order-recap__info-line">
              <span className="order-recap__info-icon">📍</span>
              <span>{storeName}</span>
            </div>
          )}
          {timeslot && (
            <div className="order-recap__info-line">
              <span className="order-recap__info-icon">🕐</span>
              <span>
                {timeslot.startTime} – {timeslot.endTime}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="order-recap__items">
        {items.map((item) => (
          <div key={item.product.id} className="order-recap__line">
            <div className="order-recap__emoji" aria-hidden="true">
              {item.product.emoji}
            </div>
            <div className="order-recap__line-info">
              <p className="order-recap__line-name">{item.product.name}</p>
              <p className="order-recap__line-qty">× {item.quantity}</p>
            </div>
            <p className="order-recap__line-price">
              {(item.product.price * item.quantity).toFixed(2).replace('.', ',')} €
            </p>
          </div>
        ))}
      </div>

      <div className="order-recap__totals">
        <div className="order-recap__total-line">
          <span>Sous-total</span>
          <span>{total.toFixed(2).replace('.', ',')} €</span>
        </div>
        <div className="order-recap__total-line">
          <span>Livraison</span>
          <span>{deliveryPrice === 0 ? 'Offerte' : `${deliveryPrice.toFixed(2).replace('.', ',')} €`}</span>
        </div>
        <div className="order-recap__grand-total">
          <span>Total</span>
          <span>{(total + deliveryPrice).toFixed(2).replace('.', ',')} €</span>
        </div>
      </div>
    </div>
  )
}

export default OrderRecap
