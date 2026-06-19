import './CartAisles.css'

const AISLES = [
  { id: 'fruits-legumes', label: 'Fruits & Légumes', emoji: '🥦' },
  { id: 'viandes',        label: 'Viandes',          emoji: '🥩' },
  { id: 'poissons',       label: 'Poissons',         emoji: '🐟' },
  { id: 'cremerie',       label: 'Crèmerie',         emoji: '🧀' },
  { id: 'epicerie',       label: 'Épicerie',         emoji: '🥫' },
  { id: 'boissons',       label: 'Boissons',         emoji: '🧃' },
  { id: 'surgeles',       label: 'Surgelés',         emoji: '❄️' },
  { id: 'hygiene',        label: 'Hygiène',          emoji: '🧴' },
]

interface CartAislesProps {
  onSelect?: (aisleId: string) => void
}

export function CartAisles({ onSelect }: CartAislesProps) {
  return (
    <div className="cart-aisles">
      <h3 className="cart-aisles__title">Rayons</h3>
      <div className="cart-aisles__list">
        {AISLES.map((aisle) => (
          <button
            key={aisle.id}
            className="cart-aisles__item"
            onClick={() => onSelect?.(aisle.id)}
            aria-label={`Voir le rayon ${aisle.label}`}
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
