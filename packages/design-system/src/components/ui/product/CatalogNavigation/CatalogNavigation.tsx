'use client'

import { useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { Gear, Heart, MagnifyingGlass, SlidersHorizontal, Tag } from '@phosphor-icons/react'
import { InputField } from '../../form/InputField/InputField'
import { CatalogNavigationItem } from '../CatalogNavigationItem/CatalogNavigationItem'
import './CatalogNavigation.css'

export interface CatalogNavigationProps {
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  promoHref?: string
  promoLabel?: string
  favoritesHref?: string
  filterCount?: number
  onFilterClick?: () => void
  preferencesCount?: number
  onPreferencesClick?: () => void
  className?: string
}

/**
 * Barre d'outils du catalogue — recherche, promo, favoris, filtres, préférences.
 * Réutilisée telle quelle entre la page catalogue et chaque Collection Page.
 */
export function CatalogNavigation({
  searchPlaceholder = 'Rechercher une recette',
  onSearchChange,
  promoHref = '#',
  promoLabel = 'Promo’',
  favoritesHref = '#',
  filterCount,
  onFilterClick,
  preferencesCount,
  onPreferencesClick,
  className,
}: CatalogNavigationProps) {
  const [isSearchOpen, setSearchOpen] = useState(false)

  const closeSearch = () => setSearchOpen(false)

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') closeSearch()
  }

  return (
    <div className={['catalog-navigation', className].filter(Boolean).join(' ')}>
      {isSearchOpen ? (
        <InputField
          autoFocus
          placeholder={searchPlaceholder}
          lIcon={<MagnifyingGlass size={20} aria-hidden="true" />}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange?.(e.target.value)}
          onBlur={closeSearch}
          onKeyDown={handleSearchKeyDown}
          aria-label={searchPlaceholder}
          className="catalog-navigation__search"
        />
      ) : (
        <CatalogNavigationItem
          icon={<MagnifyingGlass size={20} weight="bold" aria-hidden="true" />}
          ariaLabel="Rechercher"
          onClick={() => setSearchOpen(true)}
          className="catalog-navigation__search-toggle"
        />
      )}

      <CatalogNavigationItem
        icon={<Tag size={20} weight="fill" aria-hidden="true" />}
        label={promoLabel}
        tone="promo"
        href={promoHref}
      />

      <CatalogNavigationItem icon={<Heart size={20} aria-hidden="true" />} label="Mon carnet" href={favoritesHref} />

      <CatalogNavigationItem
        icon={<SlidersHorizontal size={20} aria-hidden="true" />}
        label="Filtrer"
        count={filterCount}
        onClick={onFilterClick}
        ariaLabel="Filtrer"
      />

      <CatalogNavigationItem
        icon={<Gear size={20} aria-hidden="true" />}
        label="Préférences"
        count={preferencesCount}
        onClick={onPreferencesClick}
        ariaLabel="Préférences"
      />
    </div>
  )
}

export default CatalogNavigation
