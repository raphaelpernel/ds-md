'use client'

import { useState } from 'react'
import { MagnifyingGlass, MapPin, CheckCircle } from '@phosphor-icons/react'
import { InputField, Button } from '@mealz-product-team/design-system'
import { useAssistant } from '@/context/AssistantContext'
import { MOCK_STORES } from '@/data/mock/stores'
import type { Store } from '@/data/types/store'
import { WidgetCard } from '../WidgetCard/WidgetCard'
import './StoreLocatorWidget.css'

export function StoreLocatorWidget() {
  const { confirmStore, cancelStoreLocator } = useAssistant()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Store | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const filtered = MOCK_STORES.filter((s) => {
    const q = search.toLowerCase()
    return s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.postalCode.includes(q)
  })

  const handleConfirm = () => {
    if (!selected) return
    setConfirmed(true)
    confirmStore(selected)
  }

  if (confirmed && selected) {
    return (
      <WidgetCard className="store-locator-widget--confirmed">
        <CheckCircle size={18} weight="fill" aria-hidden="true" />
        <span>{selected.name}</span>
      </WidgetCard>
    )
  }

  return (
    <WidgetCard className="store-locator-widget">
      <InputField
        placeholder="Ville, code postal…"
        aria-label="Rechercher un magasin"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        lIcon={<MagnifyingGlass size={16} weight="bold" aria-hidden="true" />}
      />

      <p className="store-locator-widget__label">Magasins à proximité</p>

      <div className="store-locator-widget__list" role="list">
        {filtered.length === 0 ? (
          <p className="store-locator-widget__empty">Aucun magasin trouvé pour « {search} ».</p>
        ) : (
          filtered.map((store) => (
            <div key={store.id} role="listitem">
              <button
                type="button"
                className={`store-locator-widget__item ${selected?.id === store.id ? 'store-locator-widget__item--selected' : ''}`}
                onClick={() => setSelected(store)}
                aria-pressed={selected?.id === store.id}
              >
                <MapPin size={16} weight="bold" aria-hidden="true" />
                <span>
                  <span className="store-locator-widget__item-name">{store.name}</span>
                  <span className="store-locator-widget__item-address">{store.address}, {store.postalCode} {store.city}</span>
                </span>
              </button>
            </div>
          ))
        )}
      </div>

      <div className="store-locator-widget__footer">
        <Button variant="secondary" size="M" onClick={cancelStoreLocator}>Annuler</Button>
        <Button variant="primary" size="M" onClick={handleConfirm} disabled={!selected}>Valider ce magasin</Button>
      </div>
    </WidgetCard>
  )
}

export default StoreLocatorWidget
