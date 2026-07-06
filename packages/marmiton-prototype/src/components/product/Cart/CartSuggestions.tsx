import { ProductCard } from '../ProductCard/ProductCard'
import type { Product } from '../../../data/types/product'
import './CartSuggestions.css'

interface CartSuggestionsProps {
  products: Product[]
}

export function CartSuggestions({ products }: CartSuggestionsProps) {
  if (products.length === 0) return null

  return (
    <div className="cart-suggestions">
      <h3 className="cart-suggestions__title">Vous aimerez aussi</h3>
      <div className="cart-suggestions__list">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            orientation="horizontal"
          />
        ))}
      </div>
    </div>
  )
}

export default CartSuggestions
