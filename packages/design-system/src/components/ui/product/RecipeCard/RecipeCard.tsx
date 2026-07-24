import { type MouseEvent, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { ChefHat, Check, Heart, ShoppingCartSimple, User } from '@phosphor-icons/react'
import { ChipTag } from '../../display/ChipTag/ChipTag'
import { Button } from '../../form/Button/Button'
import { Skeleton } from '../../feedback/Skeleton/Skeleton'
import './RecipeCard.css'

const recipeCard = cva('recipe-card', {
  variants: {
    // 'small' n'est pas encore stylé différemment — prop scaffoldée pour une itération future
    // (variante smallCard du Figma, hors périmètre de cette session).
    size: {
      default: 'recipe-card--default',
      small: 'recipe-card--small',
    },
  },
  defaultVariants: { size: 'default' },
})

export type RecipeCardSize = NonNullable<VariantProps<typeof recipeCard>['size']>

export interface RecipeCardSponsor {
  logoUrl: string
  label?: string
}

export interface RecipeCardProps extends VariantProps<typeof recipeCard> {
  title: string
  imageUrl: string
  imageAlt?: string
  guests: number
  price: number
  priceUnit?: string
  mealIdea?: boolean
  promo?: boolean
  sponsor?: RecipeCardSponsor
  favorite?: boolean
  onFavoriteToggle?: () => void
  added?: boolean
  onAddToggle?: () => void
  loading?: boolean
  onClick?: () => void
  className?: string
}

function formatPrice(price: number): string {
  return price.toFixed(2).replace('.', ',') + ' €'
}

function stop<T extends (...args: never[]) => void>(handler?: T) {
  return (e: MouseEvent) => {
    e.stopPropagation()
    handler?.()
  }
}

export function RecipeCard({
  title,
  imageUrl,
  imageAlt,
  guests,
  price,
  priceUnit = '/pers.',
  size,
  mealIdea = false,
  promo = false,
  sponsor,
  favorite = false,
  onFavoriteToggle,
  added = false,
  onAddToggle,
  loading = false,
  onClick,
  className,
}: RecipeCardProps) {
  const classes = recipeCard({ size, class: className })

  if (loading) {
    return (
      <div className={classes} aria-busy="true" aria-label={`Chargement — ${title}`}>
        <div className="recipe-card__top">
          <Skeleton variant="rect" width="100%" height="100%" />
        </div>
        <div className="recipe-card__bottom">
          <Skeleton variant="text" width="72px" />
          <Skeleton variant="circle" width={32} height={32} />
        </div>
      </div>
    )
  }

  const hasBadges = !!sponsor || promo || mealIdea

  return (
    <article
      className={classes}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <div className="recipe-card__top">
        <img src={imageUrl} alt={imageAlt ?? ''} className="recipe-card__media" />
        <div className="recipe-card__overlay" aria-hidden="true" />

        {hasBadges && (
          <div className="recipe-card__badges">
            {/* Ordre fixe : Idée repas (rayon uniquement, jamais catalogue) → Sponsor → Promo */}
            {mealIdea && (
              <ChipTag
                type="toned"
                size="S"
                icon={<ChefHat size={16} weight="fill" aria-hidden="true" /> as ReactNode}
                label="Idée repas"
              />
            )}
            {sponsor && (
              <span className="recipe-card__sponsor">
                <img src={sponsor.logoUrl} alt={sponsor.label ?? ''} />
              </span>
            )}
            {promo && <ChipTag category="promo" appearance="solid" size="S" label="Promo’" />}
          </div>
        )}

        {/* Posé sur le media (image) → toujours variant="alpha" (règle système : tout CTA sur
            image/vidéo est alpha, jamais primary/secondary/tertiary/danger en direct). L'état
            favori se lit à l'icône (fill vs regular), pas à la couleur du bouton. */}
        <Button
          size="S"
          variant="alpha"
          iconOnly={<Heart size={20} weight={favorite ? 'fill' : 'regular'} aria-hidden="true" />}
          label={favorite ? `Retirer ${title} des favoris` : `Ajouter ${title} aux favoris`}
          aria-pressed={favorite}
          onClick={stop(onFavoriteToggle)}
          className="recipe-card__favorite"
        />

        <div className="recipe-card__title-row">
          <p className="recipe-card__title">{title}</p>
          <span className="recipe-card__portion">
            {guests}
            <User size={16} weight="fill" aria-hidden="true" />
          </span>
        </div>
      </div>

      <div className="recipe-card__bottom">
        <p className="recipe-card__price">
          <span className="recipe-card__price-value">{formatPrice(price)}</span>
          <span className="recipe-card__price-unit">{priceUnit}</span>
        </p>
        <Button
          size="M"
          variant={added ? 'secondary' : 'primary'}
          iconOnly={
            added ? (
              <Check size={20} weight="bold" aria-hidden="true" />
            ) : (
              <ShoppingCartSimple size={20} weight="bold" aria-hidden="true" />
            )
          }
          label={added ? `${title} — déjà dans le panier` : `Ajouter ${title} au panier`}
          onClick={stop(onAddToggle)}
        />
      </div>
    </article>
  )
}

export default RecipeCard
