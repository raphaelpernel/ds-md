'use client'

import { useState } from 'react'
import { MagnifyingGlass, MapPin } from '@phosphor-icons/react'
import { Modal, InputField, Button } from '@mealz-product-team/design-system'
import { useShoppingActions } from '../../../context/ShoppingContext'
import { MOCK_STORES } from '../../../data/mock/stores'
import type { Store } from '../../../data/types/store'
import './StoreLocatorWidget.css'

/** Modal global, monté une fois — s'ouvre au moment d'ajouter au panier sans magasin choisi. */
export function StoreLocatorModal() {
  const { storeLocatorOpen, closeStoreLocator, confirmStore } = useShoppingActions()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Store | null>(null)

  const filtered = MOCK_STORES.filter((s) => {
    const q = search.toLowerCase()
    return s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.postalCode.includes(q)
  })

  const handleConfirm = () => {
    if (!selected) return
    confirmStore(selected)
    setSelected(null)
    setSearch('')
  }

  return (
    <Modal open={storeLocatorOpen} onClose={closeStoreLocator} size="M" title="Choisir un magasin">
      <div className="store-locator-widget">
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
          <Button variant="secondary" size="M" onClick={closeStoreLocator}>Annuler</Button>
          <Button variant="primary" size="M" onClick={handleConfirm} disabled={!selected}>Valider ce magasin</Button>
        </div>
      </div>
    </Modal>
  )
}

export default StoreLocatorModal
