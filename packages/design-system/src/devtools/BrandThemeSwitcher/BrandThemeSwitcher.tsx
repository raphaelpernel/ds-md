'use client'

import { useEffect, useRef, useState } from 'react'
import { Palette, Check } from '@phosphor-icons/react'
import { BRANDS } from '../../styles/tokens/brands/brands'
import { BRAND_STORAGE_KEY } from '../brandStorage'
import './BrandThemeSwitcher.css'

/**
 * DS.MD — BrandThemeSwitcher
 *
 * Sélecteur de thème client persistant, façon FAB Next.js dev tools.
 * Autonome (pas de Provider/Context requis) : lit/écrit directement
 * l'attribut `data-brand` sur `<html>` + `localStorage`, sans jamais
 * déclencher de navigation ni de refresh.
 *
 * À monter une seule fois dans le root layout d'une app non-Marmiton, à
 * côté du script anti-FOUC (`getBrandThemeScript`) posé dans le `<head>`.
 */

function readStoredBrand(): string {
  try {
    return window.localStorage.getItem(BRAND_STORAGE_KEY) || 'neutral'
  } catch {
    return 'neutral'
  }
}

export function BrandThemeSwitcher() {
  const [brand, setBrand] = useState('neutral')
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Sync from whatever the anti-FOUC script already applied to <html> —
  // never resets to 'neutral' if the user previously picked something else.
  useEffect(() => {
    const current = document.documentElement.getAttribute('data-brand')
    setBrand(current || readStoredBrand())
  }, [])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const selectBrand = (value: string) => {
    document.documentElement.setAttribute('data-brand', value)
    try {
      window.localStorage.setItem(BRAND_STORAGE_KEY, value)
    } catch {
      // localStorage indisponible (navigation privée…) — le choix ne
      // persistera pas au reload mais reste actif pour la session courante.
    }
    setBrand(value)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="brand-switcher">
      {open && (
        <ul className="brand-switcher__menu" role="menu" aria-label="Thème client">
          {BRANDS.map(({ value, label }) => (
            <li key={value} role="none" className="brand-switcher__menu-item">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={value === brand}
                className="brand-switcher__item"
                onClick={() => selectBrand(value)}
              >
                <span>{label}</span>
                {value === brand && (
                  <Check size={14} weight="bold" className="brand-switcher__check" aria-hidden="true" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        className="brand-switcher__fab"
        aria-label="Changer de thème client"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Palette size={16} weight="fill" aria-hidden="true" />
      </button>
    </div>
  )
}

export default BrandThemeSwitcher
