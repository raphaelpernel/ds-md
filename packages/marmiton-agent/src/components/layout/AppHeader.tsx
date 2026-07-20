'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MagnifyingGlass, ShoppingCart } from '@phosphor-icons/react'
import { Badge, InputField } from '@mealz-product-team/design-system'
import { useCart } from '../../context/CartContext'
import './AppHeader.css'

/**
 * Header partagé — pas de composeur de chat ici. La recherche en langage
 * naturel vit dans la barre elle-même (brief : "la recherche devient le
 * fallback" ↔ ici, la recherche devient directement l'agent).
 */
export function AppHeader({ initialQuery }: { initialQuery?: string }) {
  const { itemCount } = useCart()
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/recherche?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="app-header">
      <Link href="/" className="app-header__brand">
        marmiton
      </Link>

      <form className="app-header__search" onSubmit={handleSubmit}>
        <InputField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Qu’est-ce qu’on mange ? (ex : « poulet, 20 min, enfants »)"
          aria-label="Rechercher une recette, en langage naturel"
          lIcon={<MagnifyingGlass size={16} weight="bold" aria-hidden="true" />}
          rIcon={
            <button type="submit" className="app-header__search-submit" disabled={!query.trim()} aria-label="Lancer la recherche">
              <MagnifyingGlass size={16} weight="bold" aria-hidden="true" />
            </button>
          }
        />
      </form>

      <Link href="/courses" className="app-header__cart" aria-label="Voir mes courses">
        <ShoppingCart size={22} weight="bold" />
        {itemCount > 0 && (
          <span className="app-header__cart-badge">
            <Badge variant="brand" label={String(itemCount)} />
          </span>
        )}
      </Link>
    </header>
  )
}

export default AppHeader
