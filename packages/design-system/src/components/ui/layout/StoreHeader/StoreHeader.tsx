'use client'

import { type ChangeEvent } from 'react'
import { ForkKnife, Heart, List, MagnifyingGlass, ShoppingCartSimple, Storefront, User } from '@phosphor-icons/react'
import { InputField } from '../../form/InputField/InputField'
import { Badge } from '../../display/Badge/Badge'
import './StoreHeader.css'

export type StoreHeaderPlatform = 'Desktop' | 'Mobile' | 'App'

export interface StoreHeaderProps {
  platform?: StoreHeaderPlatform
  storeName?: string
  cartCount?: number
  cartTotal?: number
  userName?: string
  searchPlaceholder?: string
  aislesHref?: string
  recipesHref?: string
  storesHref?: string
  favoritesHref?: string
  accountHref?: string
  cartHref?: string
  onMenuClick?: () => void
  onSearchClick?: () => void
  onSearchChange?: (value: string) => void
  onAislesClick?: () => void
  onRecipesClick?: () => void
  onStoresClick?: () => void
  onFavoritesClick?: () => void
  onAccountClick?: () => void
  onCartClick?: () => void
  className?: string
}

function formatEuros(value: number): string {
  return value.toFixed(2).replace('.', ',') + '€'
}

export function StoreHeader({
  platform = 'Desktop',
  storeName = 'SUPAMRKT',
  cartCount = 0,
  cartTotal = 0,
  userName,
  searchPlaceholder = 'Rechercher un produit',
  aislesHref = '#',
  recipesHref = '#',
  storesHref = '#',
  favoritesHref = '#',
  accountHref = '#',
  cartHref = '#',
  onMenuClick,
  onSearchClick,
  onSearchChange,
  onAislesClick,
  onRecipesClick,
  onStoresClick,
  onFavoritesClick,
  onAccountClick,
  onCartClick,
  className,
}: StoreHeaderProps) {
  const isDesktop = platform === 'Desktop'
  const isMobile = platform === 'Mobile'
  const isApp = platform === 'App'

  const classes = ['store-header', `store-header--${platform.toLowerCase()}`, className].filter(Boolean).join(' ')

  const cartAction = (
    <a href={cartHref} className="store-header__cart" onClick={onCartClick} aria-label="Voir le panier">
      <span className="store-header__cart-icon">
        <ShoppingCartSimple size={24} weight={isDesktop ? 'regular' : 'bold'} aria-hidden="true" />
        <Badge label={String(cartCount)} variant="brand" size="S" />
      </span>
      <span className="store-header__cart-total">{formatEuros(cartTotal)}</span>
    </a>
  )

  if (isDesktop) {
    return (
      <header className={classes}>
        <div className="store-header__left">
          <span className="store-header__logo">{storeName}</span>
          <a href={aislesHref} className="store-header__nav-item" onClick={onAislesClick}>
            <List size={24} aria-hidden="true" />
            Rayons
          </a>
          <a href={recipesHref} className="store-header__nav-item" onClick={onRecipesClick}>
            <ForkKnife size={24} aria-hidden="true" />
            Idées repas
          </a>
        </div>

        <InputField
          id="store-header-search"
          placeholder={searchPlaceholder}
          lIcon={<MagnifyingGlass size={20} aria-hidden="true" />}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange?.(e.target.value)}
          aria-label="Rechercher un produit"
          className="store-header__search"
        />

        <div className="store-header__right">
          <a href={storesHref} className="store-header__nav-item" onClick={onStoresClick}>
            <Storefront size={24} aria-hidden="true" />
            Magasins
          </a>
          <a href={favoritesHref} className="store-header__nav-item" onClick={onFavoritesClick}>
            <Heart size={24} aria-hidden="true" />
            Favoris
          </a>
          {userName && (
            <a href={accountHref} className="store-header__nav-item" onClick={onAccountClick}>
              <User size={24} aria-hidden="true" />
              {userName}
            </a>
          )}
          {cartAction}
        </div>
      </header>
    )
  }

  return (
    <header className={classes}>
      {!isApp && (
        <button type="button" className="store-header__icon-btn" onClick={onMenuClick} aria-label="Ouvrir le menu">
          <List size={24} aria-hidden="true" />
        </button>
      )}
      <div className="store-header__right">
        <button type="button" className="store-header__icon-btn" onClick={onSearchClick} aria-label="Rechercher">
          <MagnifyingGlass size={24} aria-hidden="true" />
        </button>
        {isMobile && (
          <a href={favoritesHref} className="store-header__icon-btn" onClick={onFavoritesClick} aria-label="Favoris">
            <Heart size={24} aria-hidden="true" />
          </a>
        )}
        {cartAction}
      </div>
    </header>
  )
}

export default StoreHeader
