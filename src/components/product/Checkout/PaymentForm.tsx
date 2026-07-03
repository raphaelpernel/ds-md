'use client'

import { useState, type ReactNode } from 'react'
import {
  AppleLogo,
  CreditCard,
  Gift,
  GoogleLogo,
  Info,
  PaypalLogo,
  Ticket,
  Wallet,
} from '@phosphor-icons/react'
import { Radio } from '../../ui/form/Radio/Radio'
import './PaymentForm.css'

type PaymentMethod =
  | 'saved-card'
  | 'apple-pay'
  | 'card'
  | 'pass'
  | 'paypal'
  | 'google-pay'
  | 'gift-card'
  | 'meal-voucher'

interface PaymentFormProps {
  total: number
  onConfirm: () => void
  loading?: boolean
}

const OTHER_METHODS: { id: PaymentMethod; label: string; icon: ReactNode }[] = [
  { id: 'apple-pay', label: 'Apple Pay', icon: <AppleLogo size={20} weight="fill" aria-hidden="true" /> },
  { id: 'card', label: 'Carte bancaire', icon: <CreditCard size={20} weight="regular" aria-hidden="true" /> },
  { id: 'pass', label: 'Carte PASS', icon: <Wallet size={20} weight="regular" aria-hidden="true" /> },
  { id: 'paypal', label: 'Paypal / 4x Paypal', icon: <PaypalLogo size={20} weight="fill" aria-hidden="true" /> },
  { id: 'google-pay', label: 'Google Pay', icon: <GoogleLogo size={20} weight="regular" aria-hidden="true" /> },
  { id: 'gift-card', label: 'Carte Cadeau Carrefour', icon: <Gift size={20} weight="regular" aria-hidden="true" /> },
  { id: 'meal-voucher', label: 'Carte titre-restaurant (Bimpli, Pluxee, Up)', icon: <Ticket size={20} weight="regular" aria-hidden="true" /> },
]

export function PaymentForm({ total, onConfirm, loading = false }: PaymentFormProps) {
  const [method, setMethod] = useState<PaymentMethod>('saved-card')
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
      <h2 className="payment-form__title">Votre paiement</h2>

      {/* Moyen de paiement enregistré */}
      <section className="payment-form__section">
        <p className="payment-form__section-title">Utiliser un moyen de paiement enregistré</p>
        <label className="payment-form__method">
          <span className="payment-form__method-icon"><CreditCard size={20} weight="regular" aria-hidden="true" /></span>
          <span className="payment-form__method-label">416538XXXXXX5506 — 06/27</span>
          <Radio
            checked={method === 'saved-card'}
            onChange={() => setMethod('saved-card')}
            aria-label="Utiliser la carte enregistrée terminant par 5506"
          />
        </label>
      </section>

      {/* Autres moyens de paiement */}
      <section className="payment-form__section">
        <p className="payment-form__section-title">Utiliser un autre moyen de paiement</p>
        <div className="payment-form__methods">
          {OTHER_METHODS.map((m) => (
            <div key={m.id}>
              <label className="payment-form__method">
                <span className="payment-form__method-icon">{m.icon}</span>
                <span className="payment-form__method-label">{m.label}</span>
                <Radio
                  checked={method === m.id}
                  onChange={() => setMethod(m.id)}
                  aria-label={m.label}
                />
              </label>

              {m.id === 'pass' && method === 'pass' && (
                <p className="payment-form__hint">
                  <Info size={14} weight="bold" aria-hidden="true" />
                  Pensez à payer avec votre carte PASS pour cagnotter vos avantages PASS !
                </p>
              )}

              {m.id === 'card' && method === 'card' && (
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
              )}
            </div>
          ))}
        </div>
      </section>

      <p className="payment-form__secure-badge">
        <span aria-hidden="true">🔒</span>
        <span>Paiement 100% sécurisé — le paiement nécessitera une authentification via votre banque</span>
      </p>

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
