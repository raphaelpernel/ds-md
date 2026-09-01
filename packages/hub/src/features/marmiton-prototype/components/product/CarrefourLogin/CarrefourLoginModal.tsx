'use client'

import { useState } from 'react'
import { Modal, Button, InputField, Alert } from '@mealz-product-team/design-system'
import './CarrefourLoginModal.css'

interface CarrefourLoginModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CarrefourLoginModal({ open, onClose, onSuccess }: CarrefourLoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    onSuccess?.()
    onClose()
  }

  return (
    /* data-partner="carrefour" → tous les Button primary deviennent bleus */
    <div data-partner="carrefour">
      <Modal
        open={open}
        onClose={onClose}
        size="S"
        title="Connexion Carrefour"
        footer={
          <div className="carrefour-login__footer-actions">
            <Button variant="secondary" size="M" onClick={onClose} type="button">
              Annuler
            </Button>
            <Button
              variant="primary"
              size="M"
              form="carrefour-login-form"
              type="submit"
              loading={loading}
            >
              Se connecter
            </Button>
          </div>
        }
      >
        <div className="carrefour-login">
          <div className="carrefour-login__brand">
            <CarrefourWordmark />
            <p className="carrefour-login__brand-sub">
              Connectez-vous pour commander vos ingrédients
            </p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <form id="carrefour-login-form" className="carrefour-login__form" onSubmit={handleSubmit}>
            <InputField
              label="Email"
              id="cl-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="prenom.nom@email.com"
              required
            />
            <InputField
              label="Mot de passe"
              id="cl-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
            <a
              className="carrefour-login__forgot"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Mot de passe oublié ?
            </a>
          </form>

          <p className="carrefour-login__create">
            Pas encore de compte ?{' '}
            <a href="#" onClick={(e) => e.preventDefault()}>
              Créer un compte Carrefour
            </a>
          </p>

          <Button
            variant="tertiary"
            size="M"
            className="carrefour-login__demo-btn"
            type="button"
            onClick={() => { onSuccess?.(); onClose() }}
          >
            ⚡ Continuer sans compte (démo)
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function CarrefourWordmark() {
  return (
    <div className="carrefour-wordmark">
      <img
        src="/logos/logo-carrefour.svg"
        alt=""
        aria-hidden="true"
        width={40}
        height={40}
        style={{ objectFit: 'contain', display: 'block' }}
      />
      <span className="carrefour-wordmark__text">Carrefour</span>
    </div>
  )
}

export default CarrefourLoginModal
