import { AISLES } from '../../../data/mock/aisles'
import './CartAisles.css'

interface CartAislesProps {
  onSelect?: (aisleId: string) => void
  selectedId?: string | null
}

export function CartAisles({ onSelect, selectedId }: CartAislesProps) {
  return (
    <div className="cart-aisles">
      <h4 className="cart-aisles__title">Parcourir les rayons</h4>
      <div className="cart-aisles__grid" role="list">
        {AISLES.map((aisle) => (
          <button
            key={aisle.id}
            role="listitem"
            className={`cart-aisles__item${selectedId === aisle.id ? ' cart-aisles__item--selected' : ''}`}
            onClick={() => onSelect?.(aisle.id)}
            aria-label={`Voir le rayon ${aisle.label}`}
            aria-current={selectedId === aisle.id ? 'true' : undefined}
          >
            <span className="cart-aisles__emoji" aria-hidden="true">
              {aisle.emoji}
            </span>
            <span className="cart-aisles__label">{aisle.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default CartAisles
