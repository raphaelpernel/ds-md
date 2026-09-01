'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  List,
  X,
  MagnifyingGlass,
  ShoppingCartSimple,
  EnvelopeSimple,
  Newspaper,
  CaretRight,
} from '@phosphor-icons/react'
import { Button, Badge, InputField } from '@mealz-product-team/design-system'
import { useCart } from '@/features/marmiton-prototype/context/CartContext'
import './Header.css'

interface MegaMenuLink {
  label: string
  href: string
}

interface MegaMenuColumn {
  title: string
  href?: string
  links: MegaMenuLink[]
}

const SECONDARY_NAV: MegaMenuLink[] = [
  { label: "Qu'est-ce qu'on mange ce soir ?", href: '#' },
  { label: 'Univers Electroménager', href: '#' },
  { label: 'Actus Food', href: '#' },
  { label: "Du caddie à l'assiette", href: '#' },
]

const EVENT_LINKS: MegaMenuLink[] = [
  { label: 'Marmiton Kids', href: '#' },
  { label: "À fond le Petit Déj'", href: '#' },
  { label: 'Apéro', href: '#' },
]

// Colonnes réelles du mega-menu marmiton.org (contenu extrait du site le 2026-07-27).
const MEGA_MENU_COLUMNS: MegaMenuColumn[] = [
  { title: 'Actualités', href: '#', links: [] },
  {
    title: 'Recettes par catégorie',
    links: [
      { label: 'Apéro', href: '#' },
      { label: 'Entrées', href: '#' },
      { label: 'Plats', href: '#' },
      { label: 'Desserts', href: '#' },
      { label: 'Boissons', href: '#' },
      { label: 'Brunch & Petit Déj', href: '#' },
      { label: 'Au menu ce soir avec Cookeo', href: '#' },
    ],
  },
  {
    title: 'Recettes par thématique',
    links: [
      { label: 'Recettes rapides et faciles', href: '#' },
      { label: 'Nos menus 3€, 2€, 1€', href: '#' },
      { label: 'Recettes anti-gaspi', href: '#' },
      { label: 'Nouvelles Recettes', href: '#' },
      { label: 'Top des recettes', href: '#' },
      { label: 'Proposer une recette', href: '#' },
    ],
  },
  {
    title: 'Recettes par régime',
    links: [
      { label: 'Recettes Healthy', href: '#' },
      { label: 'Recettes Végétariennes', href: '#' },
      { label: 'Recettes Vegan', href: '#' },
      { label: 'Recettes Sans Gluten', href: '#' },
    ],
  },
  {
    title: 'Recettes par fêtes',
    links: [
      { label: 'Noël', href: '#' },
      { label: 'Chandeleur', href: '#' },
      { label: 'Pâques', href: '#' },
      { label: 'Saint-Valentin', href: '#' },
      { label: 'Halloween', href: '#' },
      { label: 'Ramadan', href: '#' },
    ],
  },
  {
    title: 'Univers Electroménager',
    href: '#',
    links: [
      { label: 'Gros Electroménager', href: '#' },
      { label: 'Petit Electroménager', href: '#' },
    ],
  },
  {
    title: 'Cuisine du Monde',
    href: '#',
    links: [
      { label: 'Recettes Italiennes', href: '#' },
      { label: 'Recettes Japonaises', href: '#' },
      { label: 'Recettes Indiennes', href: '#' },
      { label: 'Recettes Grecque', href: '#' },
      { label: 'Cuisine Française', href: '#' },
      { label: 'Recettes Libanaises', href: '#' },
    ],
  },
  {
    title: 'Conseils & Astuces',
    href: '#',
    links: [
      { label: 'Mieux manger', href: '#' },
      { label: 'Mieux Acheter', href: '#' },
    ],
  },
  {
    title: "Tout l'univers Marmiton",
    links: [
      { label: 'Regardez Marmiton TV', href: '#' },
      { label: 'Nos livres de cuisine', href: '#' },
      { label: 'Notre électroménager', href: '#' },
      { label: 'Prix Marmiton', href: '#' },
      { label: 'Le magazine Marmiton', href: '#' },
    ],
  },
]

export function Header() {
  const router = useRouter()
  const { itemCount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  const goTo = (href: string) => {
    closeMenu()
    router.push(href)
  }

  return (
    <header className="header">
      <div className="header__bar">
        <div className="header__left">
          <button
            type="button"
            className="header__burger"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={22} weight="bold" aria-hidden="true" /> : <List size={22} weight="bold" aria-hidden="true" />}
          </button>
          <Link href="/marmiton" className="header__logo" aria-label="Marmiton — Accueil" onClick={closeMenu}>
            <img src="/logos/logo-marmiton.svg" alt="Marmiton" width={130} height={20} />
          </Link>
        </div>

        <InputField
          id="header-search"
          className="header__search"
          placeholder="une recette, un ingrédient, de l'aide..."
          aria-label="Rechercher une recette, un ingrédient, de l'aide"
          lIcon={<MagnifyingGlass size={20} aria-hidden="true" />}
        />

        <button type="button" className="header__search-toggle" aria-label="Rechercher">
          <MagnifyingGlass size={22} aria-hidden="true" />
        </button>

        <div className="header__right">
          <button type="button" className="header__cart" aria-label="Voir le panier" onClick={() => goTo('/marmiton/cart')}>
            <ShoppingCartSimple size={22} aria-hidden="true" />
            {itemCount > 0 && (
              <span className="header__cart-badge">
                <Badge label={String(itemCount)} variant="brand" size="S" />
              </span>
            )}
          </button>
          <Button
            variant="primary"
            size="M"
            label="Se connecter"
            className="header__login"
            onClick={() => goTo('/marmiton/login')}
          />
          <button type="button" className="header__icon-link" aria-label="Newsletter Marmiton">
            <EnvelopeSimple size={20} aria-hidden="true" />
          </button>
          <button type="button" className="header__icon-link" aria-label="Le magazine Marmiton">
            <Newspaper size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <nav className="header__nav" aria-label="Navigation principale">
        <ul className="header__nav-list">
          {SECONDARY_NAV.map((item) => (
            <li key={item.label}>
              <a href={item.href} className="header__nav-link">{item.label}</a>
            </li>
          ))}
        </ul>
        <ul className="header__event-list">
          {EVENT_LINKS.map((item) => (
            <li key={item.label}>
              <a href={item.href} className="header__event-link">{item.label}</a>
            </li>
          ))}
        </ul>
      </nav>

      {menuOpen && (
        <div className="header__mega-menu" role="menu">
          <button type="button" className="header__mega-menu-overlay" aria-label="Fermer le menu" onClick={closeMenu} />
          <div className="header__mega-menu-panel">
            <div className="header__mega-menu-account">
              <p className="header__mega-menu-account-label">
                Découvrez des recettes personnalisées en créant votre profil Marmiton
              </p>
              <div className="header__mega-menu-account-actions">
                <Button variant="primary" size="M" label="Connexion" onClick={() => goTo('/marmiton/login')} />
                <Button variant="secondary" size="M" label="Inscription" onClick={() => goTo('/marmiton/login')} />
              </div>
            </div>

            <div className="header__mega-menu-columns">
              {MEGA_MENU_COLUMNS.map((col) => (
                <div key={col.title} className="header__mega-menu-column">
                  {col.href ? (
                    <a href={col.href} className="header__mega-menu-column-title header__mega-menu-column-title--link">
                      {col.title}
                      <CaretRight size={13} aria-hidden="true" />
                    </a>
                  ) : (
                    <p className="header__mega-menu-column-title">{col.title}</p>
                  )}
                  {col.links.length > 0 && (
                    <ul className="header__mega-menu-column-list">
                      {col.links.map((link) => (
                        <li key={link.label}>
                          <a href={link.href} className="header__mega-menu-column-link">{link.label}</a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
