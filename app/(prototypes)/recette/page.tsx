'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RecipeIngredientWidget } from '../../../src/components/product/RecipeIngredientWidget/RecipeIngredientWidget'
import { Button } from '../../../src/components/ui/form/Button/Button'
import { useCart } from '../../../src/context/CartContext'
import { getRecipeById } from '../../../src/data/mock/recipes'
import { getProductsByRecipe } from '../../../src/data/mock/products'
import '../../../src/styles/index.css'

const RECIPE = getRecipeById('r-tarte-abricots')!
const PRODUCTS = getProductsByRecipe('r-tarte-abricots')

export default function RecettePage() {
  const { addItem, itemCount } = useCart()
  const [liked, setLiked] = useState(false)
  const [servings, setServings] = useState(RECIPE.servings)

  const handleOrder = () => {
    PRODUCTS.filter((p) => p.available).forEach((p) =>
      addItem(p, RECIPE.id, RECIPE.name)
    )
  }

  return (
    <div className="mr-page">
      {/* ── Header sticky ── */}
      <header className="mr-header">
        <Link href="/" className="mr-header__back" aria-label="Retour">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </Link>
        <span className="mr-header__logo">
          <span className="mr-header__brand">marmiton</span>
        </span>
        <Link href="/panier" className="mr-header__cart" aria-label="Panier">
          🛒
          {itemCount > 0 && <span className="mr-header__cart-count">{itemCount}</span>}
        </Link>
      </header>

      {/* ── Hero image plein format ── */}
      <div className="mr-hero">
        <img src={RECIPE.imageUrl} alt={RECIPE.name} className="mr-hero__img" />
      </div>

      {/* ── Contenu ── */}
      <div className="mr-content">
        {/* Titre */}
        <h1 className="mr-title">{RECIPE.name}</h1>

        {/* Rating + commentaires */}
        <div className="mr-meta-row">
          <span className="mr-stars">★★★★☆</span>
          <span className="mr-rating-score">4,2/5</span>
          <span className="mr-dot">·</span>
          <span className="mr-comments">💬 12 avis</span>
        </div>

        {/* Badges */}
        <div className="mr-badges">
          <span className="mr-badge">⏱ {RECIPE.duration} min</span>
          <span className="mr-badge">👤 Facile</span>
          <span className="mr-badge">💰 Bon marché</span>
        </div>

        {/* Actions */}
        <div className="mr-actions">
          <Button
            variant={liked ? 'primary' : 'secondary'}
            size="S"
            lIcon={<span aria-hidden="true">{liked ? '❤️' : '🤍'}</span>}
            onClick={() => setLiked((v) => !v)}
          >
            J&rsquo;aime
          </Button>
          <Button variant="secondary" size="S" lIcon={<span aria-hidden="true">📤</span>}>
            Partager
          </Button>
        </div>

        <hr className="mr-divider" />

        {/* ── Section ingrédients ── */}
        <section>
          <div className="mr-section-head">
            <h2 className="mr-section-title">🥄 Ingrédients</h2>
          </div>

          <div className="mr-servings">
            <button
              className="mr-servings-btn"
              onClick={() => setServings((s) => Math.max(1, s - 1))}
              aria-label="Réduire les portions"
            >
              −
            </button>
            <span className="mr-servings-label">{servings} personnes</span>
            <button
              className="mr-servings-btn"
              onClick={() => setServings((s) => s + 1)}
              aria-label="Augmenter les portions"
            >
              +
            </button>
          </div>

          <RecipeIngredientWidget
            recipe={RECIPE}
            products={PRODUCTS}
            onOrder={handleOrder}
          />
        </section>

        <hr className="mr-divider" />

        {/* ── Préparation ── */}
        <section>
          <div className="mr-section-head">
            <h2 className="mr-section-title">👨‍🍳 Préparation</h2>
          </div>
          <ol className="mr-steps">
            {[
              'Préchauffez le four à 180°C. Étalez la pâte dans un moule à tarte beurré et fariné.',
              'Lavez et coupez les abricots en deux, retirez les noyaux et disposez-les sur la pâte, côté bombé vers le bas.',
              'Mélangez la cassonade, la farine et le beurre froid coupé en dés avec les doigts pour former un crumble grossier.',
              'Saupoudrez le crumble sur les abricots et enfournez 35 à 40 min. Laissez tiédir avant de servir.',
            ].map((step, i) => (
              <li key={i} className="mr-step">
                <span className="mr-step__num">{i + 1}</span>
                <p className="mr-step__text">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .mr-page {
          min-height: 100vh;
          background-color: #f5f5f5;
          font-family: var(--font-family-body);
          color: var(--color-content-default);
          max-width: 480px;
          margin: 0 auto;
        }

        /* Header */
        .mr-header {
          position: sticky; top: 0; z-index: 20;
          background: #fff;
          border-bottom: 1px solid var(--color-border-default);
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 16px;
          height: 52px;
        }
        .mr-header__back {
          color: var(--color-content-default);
          display: flex; align-items: center;
          text-decoration: none;
          width: 36px;
        }
        .mr-header__logo { flex: 1; text-align: center; }
        .mr-header__brand {
          font-size: 18px; font-weight: 800;
          font-family: var(--font-family-heading);
          color: var(--color-interactive-content);
          letter-spacing: -0.5px;
        }
        .mr-header__cart {
          position: relative; font-size: 22px;
          text-decoration: none; width: 36px;
          display: flex; justify-content: flex-end; align-items: center;
        }
        .mr-header__cart-count {
          position: absolute; top: -5px; right: -4px;
          background: var(--color-interactive-bg); color: #fff;
          border-radius: 50%; font-size: 10px; font-weight: 700;
          width: 17px; height: 17px;
          display: flex; align-items: center; justify-content: center;
        }

        /* Hero */
        .mr-hero { width: 100%; aspect-ratio: 4/3; max-height: 280px; overflow: hidden; }
        .mr-hero__img { width: 100%; height: 100%; object-fit: cover; display: block; }

        /* Content */
        .mr-content {
          background: #fff;
          padding: 20px 16px;
          display: flex; flex-direction: column; gap: 16px;
        }

        .mr-title {
          font-family: var(--font-family-heading);
          font-size: 22px; font-weight: 700;
          color: var(--color-content-default);
          line-height: 1.2;
        }

        /* Meta */
        .mr-meta-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .mr-stars { color: #FF6F61; font-size: 15px; letter-spacing: 1px; }
        .mr-rating-score { font-size: 13px; color: var(--color-content-weak); }
        .mr-dot { color: #ccc; }
        .mr-comments { font-size: 13px; color: var(--color-content-weak); }

        /* Badges */
        .mr-badges { display: flex; gap: 8px; flex-wrap: wrap; }
        .mr-badge {
          font-size: 13px; color: var(--color-content-default);
          background: #f5f5f5; border-radius: 20px;
          padding: 4px 10px;
        }

        /* Actions */
        .mr-actions { display: flex; gap: 8px; }
        .mr-action-btn {
          display: flex; align-items: center; gap: 5px;
          background: none;
          border: 1.5px solid var(--color-border-default);
          border-radius: 20px; padding: 6px 14px;
          font-size: 13px; font-family: var(--font-family-label);
          color: var(--color-content-default); cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .mr-action-btn:hover { background: #f5f5f5; }
        .mr-action-btn--active { border-color: var(--color-interactive-content); color: var(--color-interactive-content); }

        /* Divider */
        .mr-divider { border: none; border-top: 1px solid var(--color-border-default); }

        /* Section header */
        .mr-section-head { margin-bottom: 12px; }
        .mr-section-title {
          font-family: var(--font-family-heading);
          font-size: 18px; font-weight: 700;
          color: var(--color-content-default);
          display: flex; align-items: center; gap: 8px;
        }

        /* Servings */
        .mr-servings {
          display: inline-flex; align-items: center;
          border: 1.5px solid var(--color-border-default);
          border-radius: 24px; overflow: hidden;
          margin-bottom: 16px;
        }
        .mr-servings-btn {
          background: none; border: none;
          padding: 6px 14px; font-size: 18px; font-weight: 700;
          cursor: pointer; color: var(--color-interactive-content);
          transition: background 0.15s;
        }
        .mr-servings-btn:hover { background: #f5f5f5; }
        .mr-servings-label {
          font-size: 14px; font-weight: 600;
          color: var(--color-content-default);
          padding: 0 4px;
          border-left: 1.5px solid var(--color-border-default);
          border-right: 1.5px solid var(--color-border-default);
        }

        /* Steps */
        .mr-steps { list-style: none; display: flex; flex-direction: column; gap: 16px; }
        .mr-step { display: flex; gap: 14px; align-items: flex-start; }
        .mr-step__num {
          flex-shrink: 0; width: 26px; height: 26px;
          background: var(--color-interactive-bg); color: #fff;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700;
        }
        .mr-step__text {
          font-size: 15px; line-height: 1.6;
          color: var(--color-content-default);
          padding-top: 2px;
        }
      `}</style>
    </div>
  )
}
