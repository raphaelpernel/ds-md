import './RecipeOrderBanner.css'

interface RecipeOrderBannerProps {
  estimatedPrice: number
  servings: number
  onOrder: () => void
  itemCount?: number
}

export function RecipeOrderBanner({
  estimatedPrice,
  servings,
  onOrder,
  itemCount = 0,
}: RecipeOrderBannerProps) {
  return (
    <div className="recipe-order-banner" data-partner="carrefour">
      <div className="recipe-order-banner__header">
        <div className="recipe-order-banner__logo">
          <CarrefourLogo />
        </div>
        <p className="recipe-order-banner__title">Commander les ingrédients</p>
        <p className="recipe-order-banner__subtitle">Livraison ou drive Carrefour</p>
      </div>
      <div className="recipe-order-banner__footer">
        <p className="recipe-order-banner__price">
          Total estimé :{' '}
          <strong>
            {estimatedPrice.toFixed(2).replace('.', ',')} €
          </strong>{' '}
          par personne
        </p>
        <button className="recipe-order-banner__cta" onClick={onOrder}>
          <CarrefourLogo small />
          Ajouter au panier
          {itemCount > 0 && (
            <span className="recipe-order-banner__count">{itemCount}</span>
          )}
        </button>
      </div>
    </div>
  )
}

function CarrefourLogo({ small = false }: { small?: boolean }) {
  const size = small ? 16 : 24
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Carrefour" role="img">
      <circle cx="12" cy="12" r="12" fill="#004899" />
      <path
        d="M8 7 L12 12 L8 17 M16 7 L12 12 L16 17"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export default RecipeOrderBanner
