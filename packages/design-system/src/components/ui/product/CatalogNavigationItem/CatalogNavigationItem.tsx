import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Badge } from '../../display/Badge/Badge'
import './CatalogNavigationItem.css'

const catalogNavItem = cva('catalog-nav-item', {
  variants: {
    tone: {
      default: 'catalog-nav-item--default',
      promo: 'catalog-nav-item--promo',
    },
  },
  defaultVariants: { tone: 'default' },
})

export type CatalogNavigationItemTone = NonNullable<VariantProps<typeof catalogNavItem>['tone']>

type SharedProps = VariantProps<typeof catalogNavItem> & {
  icon: ReactNode
  label?: string
  ariaLabel?: string
  count?: number
  className?: string
}

export type CatalogNavigationItemProps =
  | (SharedProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className'>)
  | (SharedProps & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>)

/**
 * Item de la barre "Catalog Navigation" — pastille icône + libellé optionnel + badge count optionnel.
 *
 * Rend un `<a>` quand `href` est fourni (navigation vers une autre page — ex. Promo, Mon carnet)
 * ou un `<button>` sinon (action en place — ex. Filtrer, Préférences, Search). Ne jamais choisir
 * la balise sur l'apparence : `<a>` = "ça va quelque part", `<button>` = "ça fait quelque chose"
 * (cf. RecipeCard.design.md / DESIGN.md §3 pour la règle CTA-sur-media, différente de celle-ci).
 */
export function CatalogNavigationItem({
  icon,
  label,
  ariaLabel,
  count,
  tone,
  href,
  className,
  ...rest
}: CatalogNavigationItemProps) {
  const classes = catalogNavItem({ tone, class: className })
  const content = (
    <>
      <span className="catalog-nav-item__icon" aria-hidden="true">
        {icon}
      </span>
      {label && <span className="catalog-nav-item__label">{label}</span>}
      {typeof count === 'number' && <Badge label={String(count)} variant="brand" size="M" />}
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        aria-label={label ? undefined : ariaLabel}
        {...(rest as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className'>)}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      type="button"
      className={classes}
      aria-label={label ? undefined : ariaLabel}
      {...(rest as Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>)}
    >
      {content}
    </button>
  )
}

export default CatalogNavigationItem
