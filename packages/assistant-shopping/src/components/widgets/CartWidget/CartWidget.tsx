'use client'

import { Trash } from '@phosphor-icons/react'
import { Button, Stepper } from '@mealz-product-team/design-system'
import { useAssistant } from '@/context/AssistantContext'
import { MOCK_RECIPES } from '@/data/mock/recipes'
import { formatPrice } from '@/lib/format'
import { MOCK_PRODUCTS } from '@/data/mock/products'
import './CartWidget.css'

const PRICE_PER_GUEST = 3.5

export function CartWidget() {
  const { cart, removeRecipeFromCart, updateProductQuantity, removeProductFromCart } = useAssistant()

  const recipeRows = cart.recipes
    .map((entry) => {
      const recipe = MOCK_RECIPES.find((r) => r.id === entry.recipeId)
      if (!recipe) return null
      const guests = entry.guests ?? recipe.guests
      const total = recipe.priceLevel * PRICE_PER_GUEST * guests
      return { recipe, guests, total }
    })
    .filter(Boolean) as { recipe: (typeof MOCK_RECIPES)[number]; guests: number; total: number }[]

  const productRows = cart.products
    .map((entry) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === entry.productId)
      return product ? { product, quantity: entry.quantity } : null
    })
    .filter(Boolean) as { product: (typeof MOCK_PRODUCTS)[number]; quantity: number }[]

  const grandTotal =
    recipeRows.reduce((sum, r) => sum + r.total, 0) + productRows.reduce((sum, p) => sum + p.product.price * p.quantity, 0)

  const isEmpty = recipeRows.length === 0 && productRows.length === 0

  if (isEmpty) {
    return (
      <div className="cart-widget cart-widget--empty">
        <p>Votre panier est vide pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="cart-widget">
      {recipeRows.length > 0 && (
        <section className="cart-widget__section">
          <h4 className="cart-widget__section-title">Recettes</h4>
          {recipeRows.map(({ recipe, guests, total }) => (
            <div key={recipe.id} className="cart-widget__row">
              <span className="cart-widget__emoji" aria-hidden="true">{recipe.emoji}</span>
              <div className="cart-widget__row-info">
                <p className="cart-widget__row-name">{recipe.name}</p>
                <p className="cart-widget__row-meta">{guests} convives · {formatPrice(total / guests)}/pers.</p>
              </div>
              <div className="cart-widget__row-actions">
                <span className="cart-widget__row-price">{formatPrice(total)}</span>
                <Button
                  variant="tertiary"
                  size="S"
                  iconOnly={<Trash size={16} aria-hidden="true" />}
                  label={`Retirer ${recipe.name}`}
                  onClick={() => removeRecipeFromCart(recipe.id)}
                />
              </div>
            </div>
          ))}
        </section>
      )}

      {productRows.length > 0 && (
        <section className="cart-widget__section">
          <h4 className="cart-widget__section-title">Produits</h4>
          {productRows.map(({ product, quantity }) => (
            <div key={product.id} className="cart-widget__row">
              <span className="cart-widget__emoji" aria-hidden="true">{product.emoji}</span>
              <div className="cart-widget__row-info">
                <p className="cart-widget__row-name">{product.name}</p>
                <p className="cart-widget__row-meta">{formatPrice(product.price)} / unité</p>
              </div>
              <div className="cart-widget__row-actions">
                <Stepper
                  value={quantity}
                  onChange={(value) => updateProductQuantity(product.id, value)}
                  min={0}
                  size="S"
                  label={`Quantité ${product.name}`}
                />
                <Button
                  variant="tertiary"
                  size="S"
                  iconOnly={<Trash size={16} aria-hidden="true" />}
                  label={`Supprimer ${product.name}`}
                  onClick={() => removeProductFromCart(product.id)}
                />
              </div>
            </div>
          ))}
        </section>
      )}

      <div className="cart-widget__total">
        <span>Total</span>
        <span>{formatPrice(grandTotal)}</span>
      </div>
    </div>
  )
}

export default CartWidget
