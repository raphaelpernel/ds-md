'use client'

import { type ReactNode } from 'react'
import { ForkKnife, Heart, House, List, User } from '@phosphor-icons/react'
import './BottomNav.css'

export type BottomNavTab = 'home' | 'aisles' | 'recipes' | 'favorites' | 'account'

interface BottomNavItemDef {
  key: BottomNavTab
  label: string
  icon: ReactNode
}

export interface BottomNavProps {
  activeTab: BottomNavTab
  onTabChange?: (tab: BottomNavTab) => void
  accountLabel?: string
  className?: string
}

export function BottomNav({ activeTab, onTabChange, accountLabel = 'Profil', className }: BottomNavProps) {
  const items: BottomNavItemDef[] = [
    { key: 'home', label: 'Accueil', icon: <House size={24} weight={activeTab === 'home' ? 'fill' : 'regular'} aria-hidden="true" /> },
    { key: 'aisles', label: 'Rayons', icon: <List size={24} weight={activeTab === 'aisles' ? 'bold' : 'regular'} aria-hidden="true" /> },
    { key: 'recipes', label: 'Idées repas', icon: <ForkKnife size={24} weight={activeTab === 'recipes' ? 'fill' : 'regular'} aria-hidden="true" /> },
    { key: 'favorites', label: 'Favoris', icon: <Heart size={24} weight={activeTab === 'favorites' ? 'fill' : 'regular'} aria-hidden="true" /> },
    { key: 'account', label: accountLabel, icon: <User size={24} weight={activeTab === 'account' ? 'fill' : 'regular'} aria-hidden="true" /> },
  ]

  const activeIndex = items.findIndex((item) => item.key === activeTab)

  return (
    <nav className={['bottom-nav', className].filter(Boolean).join(' ')} aria-label="Navigation principale">
      <div className="bottom-nav__items">
        <span
          className="bottom-nav__pill"
          style={{ left: `calc(${activeIndex} * (100% / ${items.length}) + var(--spacing-4))` }}
          aria-hidden="true"
        />
        {items.map((item) => {
          const isActive = item.key === activeTab
          return (
            <button
              key={item.key}
              type="button"
              className={['bottom-nav__item', isActive && 'bottom-nav__item--active'].filter(Boolean).join(' ')}
              onClick={() => onTabChange?.(item.key)}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.icon}
              <span className="bottom-nav__label">{item.label}</span>
            </button>
          )
        })}
      </div>
      <div className="bottom-nav__safe-area" />
    </nav>
  )
}

export default BottomNav
