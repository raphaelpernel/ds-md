'use client'

import { Trash, Warning } from '@phosphor-icons/react'
import { Button, Stepper } from '@mealz-product-team/design-system'
import { AppHeader } from '../layout/AppHeader'
import { useCart } from '../../context/CartContext'
import { MOCK_PRODUCTS } from '../../data/mock/products'
import { formatPrice } from '../../lib/format'
import './CoursesPage.css'

/**
 * Écran 05 — /courses. Panier groupé par recette, substitution traitée dans
 * le flux (jamais un écran d'erreur), rien avant "Commander" (magasin/connexion
 * arrivent au clic, pas avant — brief §7, §9, diagnostic de conversion).
 * Header partagé ajouté (revue /plan-design-review du 2026-07-20, Pass 6) :
 * cette page n'avait aucune navigation retour — le "trunk test" échouait.
 */
export function CoursesPage() {
  const cart = useCart()

  if (cart.itemCount === 0) {
    return (
      <>
        <AppHeader />
        <main className="courses-page courses-page--empty">
          <p>Votre panier est vide pour le moment.</p>
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader />
      <main className="courses-page">
      <div className="courses-page__bar">
        <span className="courses-page__bar-total">{formatPrice(cart.total)}</span>
        <span className="courses-page__bar-count">{cart.itemCount} produit{cart.itemCount > 1 ? 's' : ''}</span>
        <Button variant="primary" size="M">Commander</Button>
      </div>

      <h1 className="courses-page__title">Mes courses</h1>

      {cart.sections.map((section) => (
        <section key={section.recipeId ?? 'sans-recette'} className="courses-page__section">
          <h2 className="courses-page__section-title">
            <span aria-hidden="true">{section.recipeEmoji ?? '🛒'}</span> {section.recipeName ?? 'Ajoutés hors recette'}
            {section.servings ? ` · ${section.servings} personnes` : ''}
          </h2>

          {section.items.map((item) => {
            const isOutOfStock = !item.product.available
            const substitute = item.product.substituteId ? MOCK_PRODUCTS.find((p) => p.id === item.product.substituteId) : null
            const hasNoSubstitute = isOutOfStock && item.product.substituteId === null

            return (
              <div key={item.product.id} className="courses-page__item">
                <span className="courses-page__item-emoji" aria-hidden="true">{item.product.emoji}</span>
                <div className="courses-page__item-info">
                  <p className="courses-page__item-name">{item.product.name}</p>
                  <p className="courses-page__item-brand">{item.product.brand} · {item.product.unit}</p>

                  {isOutOfStock && substitute && (
                    <div className="courses-page__substitution" role="alert">
                      <Warning size={14} weight="bold" aria-hidden="true" />
                      <span>Rupture de stock.</span>
                      <Button variant="tertiary" size="XS" onClick={() => cart.substituteItem(item.product.id, substitute)}>
                        Remplacer par {substitute.name}
                      </Button>
                    </div>
                  )}

                  {hasNoSubstitute && (
                    <div className="courses-page__substitution courses-page__substitution--blocked" role="alert">
                      <Warning size={14} weight="bold" aria-hidden="true" />
                      <span>Rupture de stock — aucun substitut disponible pour le moment. Retirez l’article ou repassez plus tard.</span>
                    </div>
                  )}

                  {item.substitutedFromProductId && (
                    <p className="courses-page__substituted-note">Remplacé suite à une rupture.</p>
                  )}
                </div>

                <div className="courses-page__item-actions">
                  <span className="courses-page__item-price">{formatPrice(item.product.price * item.quantity)}</span>
                  <Stepper
                    value={item.quantity}
                    onChange={(value) => cart.updateQuantity(item.product.id, value)}
                    min={0}
                    size="S"
                    label={`Quantité ${item.product.name}`}
                  />
                  <Button
                    variant="tertiary"
                    size="S"
                    iconOnly={<Trash size={16} aria-hidden="true" />}
                    label={`Supprimer ${item.product.name}`}
                    onClick={() => cart.removeItem(item.product.id)}
                  />
                </div>
              </div>
            )
          })}
        </section>
      ))}

      <div className="courses-page__total">
        <span>Total</span>
        <span>{formatPrice(cart.total)}</span>
      </div>
      </main>
    </>
  )
}

export default CoursesPage
