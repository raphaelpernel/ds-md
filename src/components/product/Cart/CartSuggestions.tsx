import type { Product } from '../../../data/types/product'
import './CartSuggestions.css'

interface CartSuggestionsProps {
  products: Product[]
  onAdd: (product: Product) => void
}

export function CartSuggestions({ products, onAdd }: CartSuggestionsProps) {
  if (products.length === 0) return null

  return (
    <div className="cart-suggestions">
      <h3 className="cart-suggestions__title">Vous aimerez aussi</h3>
      <div className="cart-suggestions__list">
        {products.map((product) => (
          <div key={product.id} className="cart-suggestions__item">
            <div className="cart-suggestions__emoji" aria-hidden="true">
              {product.emoji}
            </div>
            <p className="cart-suggestions__name">{product.name}</p>
            <p className="cart-suggestions__price">
              {product.price.toFixed(2).replace('.', ',')} €
            </p>
            <button
              className="cart-suggestions__add"
              onClick={() => onAdd(product)}
              aria-label={`Ajouter ${product.name}`}
              data-partner="carrefour"
            >
              +
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CartSuggestions
