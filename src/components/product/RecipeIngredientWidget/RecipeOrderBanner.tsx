import './RecipeOrderBanner.css'

interface RecipeOrderBannerProps {
  totalPrice: number
  pricePerServing: number
  onOrder: () => void
  itemCount?: number
}

export function RecipeOrderBanner({
  totalPrice,
  pricePerServing,
  onOrder,
  itemCount = 0,
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
          Total estimé :{' '}
          <strong>
            {totalPrice.toFixed(2).replace('.', ',')} €
          </strong>{' '}
          <span className="recipe-order-banner__price-per-serving">
            ({pricePerServing.toFixed(2).replace('.', ',')} €/personne)
          </span>
        </p>
        <button className="recipe-order-banner__cta" onClick={onOrder}>
          <CarrefourLogo small white />
          Ajouter au panier
          {itemCount > 0 && (
            <span className="recipe-order-banner__count">{itemCount}</span>
          )}
        </button>
      </div>
    </div>
  )
}

function CarrefourLogo({ small = false, white = false }: { small?: boolean; white?: boolean }) {
  const size = small ? 16 : 40
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
