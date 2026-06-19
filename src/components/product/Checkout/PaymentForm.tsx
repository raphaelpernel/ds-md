'use client'

import { useState } from 'react'
import './PaymentForm.css'

interface PaymentFormProps {
  total: number
  onConfirm: () => void
  loading?: boolean
}

export function PaymentForm({ total, onConfirm, loading = false }: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState('')

  const formatCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4)
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return digits
  }

  return (
    <div className="payment-form" data-partner="carrefour">
      <h2 className="payment-form__title">Paiement sécurisé</h2>

      <div className="payment-form__secure-badge">
        <span aria-hidden="true">🔒</span>
        <span>Vos données sont chiffrées et sécurisées</span>
      </div>

      <div className="payment-form__fields">
        <div className="payment-form__field payment-form__field--full">
          <label className="payment-form__label" htmlFor="pf-name">
            Nom sur la carte
          </label>
          <input
            id="pf-name"
            className="payment-form__input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jean Dupont"
            autoComplete="cc-name"
          />
        </div>

        <div className="payment-form__field payment-form__field--full">
          <label className="payment-form__label" htmlFor="pf-card">
            Numéro de carte
          </label>
          <input
            id="pf-card"
            className="payment-form__input"
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="0000 0000 0000 0000"
            autoComplete="cc-number"
            inputMode="numeric"
            maxLength={19}
          />
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label" htmlFor="pf-expiry">
            Date d&apos;expiration
          </label>
          <input
            id="pf-expiry"
            className="payment-form__input"
            type="text"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            placeholder="MM/AA"
            autoComplete="cc-exp"
            inputMode="numeric"
            maxLength={5}
          />
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label" htmlFor="pf-cvv">
            CVV
          </label>
          <input
            id="pf-cvv"
            className="payment-form__input"
            type="text"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
            placeholder="123"
            autoComplete="cc-csc"
            inputMode="numeric"
            maxLength={3}
          />
        </div>
      </div>

      <button
        className="payment-form__cta"
        onClick={onConfirm}
        disabled={loading}
      >
        {loading
          ? 'Traitement en cours…'
          : `Payer ${total.toFixed(2).replace('.', ',')} €`}
      </button>

      <p className="payment-form__disclaimer">
        En confirmant votre commande, vous acceptez les conditions générales de vente Carrefour.
      </p>
    </div>
  )
}

export default PaymentForm
