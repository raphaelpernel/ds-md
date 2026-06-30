import './RecipeOrderBanner.css'

interface RecipeOrderBannerProps {
  pricePerServing: number
  onOrder: () => void
  allAdded?: boolean
  onViewCart?: () => void
}

export function RecipeOrderBanner({
  pricePerServing,
  onOrder,
  allAdded = false,
  onViewCart,
}: RecipeOrderBannerProps) {
  return (
    <div className="recipe-order-banner" data-partner="carrefour">
      <div className="recipe-order-banner__header">
        <div className="recipe-order-banner__logo">
          <CarrefourLogo />
        </div>
        <div className="recipe-order-banner__header-text">
          <p className="recipe-order-banner__title">Commander les ingrédients</p>
          <p className="recipe-order-banner__subtitle">Livraison ou drive Carrefour</p>
        </div>
      </div>
      <div className="recipe-order-banner__footer">
        <p className="recipe-order-banner__price">
          <strong>{pricePerServing.toFixed(2).replace('.', ',')} €</strong>
          {' '}
          <span className="recipe-order-banner__price-per-serving">par personne</span>
        </p>
        {allAdded ? (
          <button className="recipe-order-banner__cta recipe-order-banner__cta--secondary" onClick={onViewCart}>
            Voir mon panier
          </button>
        ) : (
          <button className="recipe-order-banner__cta" onClick={onOrder}>
            <CarrefourLogo small white />
            Ajouter au panier
          </button>
        )}
      </div>
    </div>
  )
}

function CarrefourLogo({ small = false, white = false }: { small?: boolean; white?: boolean }) {
  const size = small ? 24 : 40
  return (
    <img
      src="/logos/logo-carrefour.svg"
      alt="Carrefour"
      width={size}
      height={size}
      style={{ objectFit: 'contain', display: 'block', filter: white ? 'brightness(0) invert(1)' : undefined }}
    />
  )
}

export default RecipeOrderBanner
