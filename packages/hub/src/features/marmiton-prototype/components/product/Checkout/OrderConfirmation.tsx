import './OrderConfirmation.css'

interface OrderConfirmationProps {
  orderId?: string
  storeName?: string | null
  timeslotLabel?: string
  total: number
  onContinue?: () => void
}

export function OrderConfirmation({
  orderId = `CMD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  storeName,
  timeslotLabel,
  total,
  onContinue,
}: OrderConfirmationProps) {
  return (
    <div className="order-confirmation">
      <div className="order-confirmation__hero" data-partner="carrefour">
        <span className="order-confirmation__checkmark" aria-hidden="true">✓</span>
        <h1 className="order-confirmation__title">Commande confirmée !</h1>
        <p className="order-confirmation__subtitle">
          Merci pour votre commande. Vous recevrez un email de confirmation.
        </p>
      </div>

      <div className="order-confirmation__details">
        <div className="order-confirmation__row">
          <span className="order-confirmation__row-label">Numéro de commande</span>
          <span className="order-confirmation__row-value order-confirmation__row-value--mono">
            {orderId}
          </span>
        </div>

        {storeName && (
          <div className="order-confirmation__row">
            <span className="order-confirmation__row-label">Magasin</span>
            <span className="order-confirmation__row-value">{storeName}</span>
          </div>
        )}

        {timeslotLabel && (
          <div className="order-confirmation__row">
            <span className="order-confirmation__row-label">Créneau</span>
            <span className="order-confirmation__row-value">{timeslotLabel}</span>
          </div>
        )}

        <div className="order-confirmation__row order-confirmation__row--total">
          <span className="order-confirmation__row-label">Total payé</span>
          <span className="order-confirmation__row-value">
            {total.toFixed(2).replace('.', ',')} €
          </span>
        </div>
      </div>

      <div className="order-confirmation__actions">
        <button className="order-confirmation__cta" onClick={onContinue} data-partner="carrefour">
          Continuer sur Marmiton
        </button>
        <a
          className="order-confirmation__track"
          href="#"
          onClick={(e) => e.preventDefault()}
        >
          Suivre ma commande Carrefour →
        </a>
      </div>
    </div>
  )
}

export default OrderConfirmation
