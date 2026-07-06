'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RecipeIngredientWidget, ViewToggle } from '../../../src/components/product/RecipeIngredientWidget/RecipeIngredientWidget'
import type { ViewMode } from '../../../src/components/product/RecipeIngredientWidget/RecipeIngredientWidget'
import { RecipeOrderBanner } from '../../../src/components/product/RecipeIngredientWidget/RecipeOrderBanner'
import { ShoppingCart, Heart, ShareNetwork } from '@phosphor-icons/react'
import { Button } from '../../../src/components/ui/form/Button/Button'
import { Stepper } from '../../../src/components/ui/form/Stepper/Stepper'
import { Drawer } from '../../../src/components/ui/layout/Drawer/Drawer'
import { Cart } from '../../../src/components/product/Cart/Cart'
import { CartFooter } from '../../../src/components/product/Cart/CartFooter'
import { useCart } from '../../../src/context/CartContext'
import { getRecipeById } from '../../../src/data/mock/recipes'
import { getProductsByRecipe } from '../../../src/data/mock/products'
import '../../../src/styles/index.css'

const RECIPE = getRecipeById('r-tarte-abricots')!
const PRODUCTS = getProductsByRecipe('r-tarte-abricots')

export default function RecettePage() {
  const router = useRouter()
  const { addItem, itemCount, total, sections, state } = useCart()
  const [liked, setLiked] = useState(false)
  const [servings, setServings] = useState(RECIPE.servings)
  const [ingredientView, setIngredientView] = useState<ViewMode>('grid')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const recipeCount = sections.filter((s) => s.recipeId !== null).length

  // Une part des coûts (emballage, conditionnement) est fixe et se répartit
  // sur davantage de personnes : le prix par personne baisse quand servings augmente.
  const FIXED_COST_RATIO = 0.18
  const baseTotal = RECIPE.estimatedPricePerServing * RECIPE.servings
  const fixedCost = baseTotal * FIXED_COST_RATIO
  const variableCostPerServing = (baseTotal - fixedCost) / RECIPE.servings
  const pricePerServing = (fixedCost + variableCostPerServing * servings) / servings

  const availableProducts = PRODUCTS.filter((p) => p.available)
  const cartProductIds = new Set(state.items.map((i) => i.product.id))
  const allAdded = availableProducts.length > 0 && availableProducts.every((p) => cartProductIds.has(p.id))

  const handleOrder = () => {
    availableProducts
      .filter((p) => !cartProductIds.has(p.id))
      .forEach((p) => addItem(p, RECIPE.id, RECIPE.name, RECIPE.imageUrl, servings))
    setDrawerOpen(true)
  }

  return (
    <div className="recipe-page">
      {/* ── Site header (global nav, sticky) ── */}
      <header className="site-header">
        <Link href="/" className="site-header__back" aria-label="Retour">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </Link>
        <span className="site-header__logo">
          <img
            src="/logos/logo-marmiton.svg"
            alt="Marmiton"
            className="site-header__brand"
            width={120}
            height={19}
          />
        </span>
        <div className="site-header__cart">
          <Button
            variant="secondary"
            size="M"
            label={
              itemCount > 0
                ? `Panier, ${itemCount} article${itemCount > 1 ? 's' : ''}`
                : 'Panier'
            }
            iconOnly={<ShoppingCart size={16} weight="bold" aria-hidden="true" />}
            onClick={() => setDrawerOpen(true)}
          />
          {itemCount > 0 && (
            <span className="site-header__cart-count" aria-hidden="true">
              {itemCount}
            </span>
          )}
        </div>
      </header>

      <div className="recipe-wrapper">
        {/* ── Fil d'Ariane + titre + rating ── */}
        <div className="recipe-header">
          <nav className="recipe-breadcrumb" aria-label="Fil d'Ariane">
            <span>Accueil</span>
            <span className="recipe-breadcrumb__sep">›</span>
            <span>Recettes</span>
            <span className="recipe-breadcrumb__sep">›</span>
            <span>Plats principaux</span>
          </nav>

          <h1 className="recipe-title">{RECIPE.name}</h1>

          <div className="recipe-meta-row">
            <span className="recipe-stars">★★★★½</span>
            <span className="recipe-rating-score">4,7/5</span>
            <span className="recipe-dot">·</span>
            <span className="recipe-comments">247 commentaires</span>
          </div>
        </div>

        {/* ── Image plein format ── */}
        <div className="recipe-media">
          <img src={RECIPE.imageUrl} alt={RECIPE.name} className="recipe-media__img" />
        </div>

        {/* ── Contenu ── */}
        <div className="recipe-content">
          {/* Badges */}
          <div className="recipe-badges">
            <span className="recipe-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {RECIPE.duration} min
            </span>
            <span className="recipe-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Très Facile
            </span>
            <span className="recipe-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Bon Marché
            </span>
          </div>

          {/* Actions icon-only */}
          <div className="recipe-actions">
            <Button
              variant={liked ? 'primary' : 'secondary'}
              size="M"
              label="J'aime"
              iconOnly={<Heart size={18} weight={liked ? 'fill' : 'regular'} aria-hidden="true" />}
              onClick={() => setLiked((v) => !v)}
            />
            <Button
              variant="secondary"
              size="M"
              label="Partager"
              iconOnly={<ShareNetwork size={18} weight="regular" aria-hidden="true" />}
            />
          </div>

          <hr className="recipe-divider" />

          {/* ── Section ingrédients ── */}
          <section>
            <div className="recipe-section-head">
              <h2 className="recipe-section-title">🥄 Ingrédients</h2>
            </div>

            <div className="recipe-servings-row">
              <Stepper
                value={servings}
                onChange={setServings}
                min={1}
                size="S"
                suffix="personnes"
                label="Nombre de personnes"
              />
              <ViewToggle view={ingredientView} onChange={setIngredientView} />
            </div>

            <RecipeOrderBanner
              pricePerServing={pricePerServing}
              onOrder={handleOrder}
              allAdded={allAdded}
              onViewCart={() => setDrawerOpen(true)}
            />

            <RecipeIngredientWidget
              recipe={RECIPE}
              products={PRODUCTS}
              view={ingredientView}
              servings={servings}
            />
          </section>

          <hr className="recipe-divider" />

          {/* ── Préparation ── */}
          <section>
            <div className="recipe-section-head">
              <h2 className="recipe-section-title">👨‍🍳 Préparation</h2>
            </div>
            <ol className="recipe-steps">
              {[
                'Préchauffez le four à 180°C. Étalez la pâte dans un moule à tarte beurré et fariné.',
                'Lavez et coupez les abricots en deux, retirez les noyaux et disposez-les sur la pâte, côté bombé vers le bas.',
                'Mélangez la cassonade, la farine et le beurre froid coupé en dés avec les doigts pour former un crumble grossier.',
                'Saupoudrez le crumble sur les abricots et enfournez 35 à 40 min. Laissez tiédir avant de servir.',
              ].map((step, i) => (
                <li key={i} className="recipe-step">
                  <span className="recipe-step__num">{i + 1}</span>
                  <p className="recipe-step__text">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Mon panier"
        placement="right"
        mobilePlacement="bottom"
        footer={
          <CartFooter
            total={total}
            itemCount={itemCount}
            recipeCount={recipeCount}
            storeName={state.storeName}
            mode="view"
            onViewCart={() => { setDrawerOpen(false); router.push('/panier') }}
            onChangeStore={() => router.push('/magasin')}
          />
        }
      >
        <Cart
          onChooseStore={() => { setDrawerOpen(false); router.push('/magasin') }}
          onChangeStore={() => { setDrawerOpen(false); router.push('/magasin') }}
        />
      </Drawer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .recipe-page {
          min-height: 100vh;
          background-color: #f5f5f5;
          font-family: var(--font-family-body);
          color: var(--color-content-default);
        }

        /* Site header — global nav, not part of the recipe card */
        .site-header {
          position: sticky; top: 0; z-index: 20;
          background: #fff;
          border-bottom: 1px solid var(--color-border-default);
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 16px;
          height: 52px;
        }
        .site-header__back {
          color: var(--color-content-default);
          display: flex; align-items: center;
          text-decoration: none;
          width: 36px;
        }
        .site-header__logo { flex: 1; text-align: center; }
        .site-header__brand {
          display: block;
          height: 19px;
          width: auto;
          margin: 0 auto;
        }
        .site-header__cart {
          position: relative;
          display: flex; justify-content: flex-end; align-items: center;
        }
        .site-header__cart-count {
          position: absolute; top: -5px; right: -4px;
          background: var(--color-interactive-bg); color: #fff;
          border-radius: 50%; font-size: 10px; font-weight: 700;
          width: 17px; height: 17px;
          display: flex; align-items: center; justify-content: center;
        }

        /* Recipe wrapper — the card holding this recipe's own content */
        .recipe-wrapper {
          width: 100%;
          margin: 0;
        }

        /* Recipe header : fil d'Ariane + titre + rating */
        .recipe-header {
          background: #fff;
          padding: 12px 16px 14px;
          display: flex; flex-direction: column; gap: 8px;
        }

        /* Fil d'Ariane */
        .recipe-breadcrumb {
          display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
          font-size: 12px; color: var(--color-content-weak);
        }
        .recipe-breadcrumb__sep { color: #ccc; }

        /* Media */
        .recipe-media { width: 100%; aspect-ratio: 4/3; max-height: 280px; overflow: hidden; }
        .recipe-media__img { width: 100%; height: 100%; object-fit: cover; display: block; }

        /* Content */
        .recipe-content {
          background: #fff;
          padding: 16px 16px 20px;
          display: flex; flex-direction: column; gap: 14px;
        }

        .recipe-title {
          font-family: var(--font-family-heading);
          font-size: 22px; font-weight: 700;
          color: var(--color-content-default);
          line-height: 1.2;
        }

        /* Meta */
        .recipe-meta-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .recipe-stars { color: #FF6F61; font-size: 15px; letter-spacing: 1px; }
        .recipe-rating-score { font-size: 13px; color: var(--color-content-weak); }
        .recipe-dot { color: #ccc; }
        .recipe-comments { font-size: 13px; color: var(--color-interactive-content); text-decoration: underline; cursor: pointer; }

        /* Badges */
        .recipe-badges { display: flex; gap: 8px; flex-wrap: wrap; }
        .recipe-badge {
          display: flex; align-items: center; gap: 5px;
          font-size: 13px; color: var(--color-content-default);
          background: #f5f5f5; border-radius: 20px;
          padding: 5px 10px;
        }

        /* Actions */
        .recipe-actions { display: flex; gap: 8px; }

        /* Divider */
        .recipe-divider { border: none; border-top: 1px solid var(--color-border-default); }

        /* Section header */
        .recipe-section-head { margin-bottom: 12px; }
        .recipe-section-title {
          font-family: var(--font-family-heading);
          font-size: 18px; font-weight: 700;
          color: var(--color-content-default);
          display: flex; align-items: center; gap: 8px;
        }

        /* Servings row */
        .recipe-servings-row {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        /* Steps */
        .recipe-steps { list-style: none; display: flex; flex-direction: column; gap: 16px; }
        .recipe-step { display: flex; gap: 14px; align-items: flex-start; }
        .recipe-step__num {
          flex-shrink: 0; width: 26px; height: 26px;
          background: var(--color-interactive-bg); color: #fff;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700;
        }
        .recipe-step__text {
          font-size: 15px; line-height: 1.6;
          color: var(--color-content-default);
          padding-top: 2px;
        }

        /* Desktop — fluid container capped at 1200px, starts floating on the gray backdrop.
           Below 1024 the container stays full width, no side margin. The site header stays
           full-bleed at every breakpoint — it's global nav, not part of the recipe card. */
        @media (min-width: 1024px) {
          .recipe-wrapper {
            width: 100%;
            max-width: 1200px;
            margin: 32px auto 48px;
            box-shadow: var(--elevation-300);
          }
          .recipe-header {
            border-top-left-radius: var(--radius-card);
            border-top-right-radius: var(--radius-card);
          }
          .recipe-content {
            border-bottom-left-radius: var(--radius-card);
            border-bottom-right-radius: var(--radius-card);
          }
          .recipe-media { max-height: 440px; }
          .recipe-title { font-size: 28px; }
        }
      `}</style>
    </div>
  )
}
