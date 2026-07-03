'use client'

import { useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { Modal } from '../../ui/feedback/Modal/Modal'
import { Button } from '../../ui/form/Button/Button'
import { InputField } from '../../ui/form/InputField/InputField'
import { StoreCard } from './StoreCard'
import { MOCK_STORES } from '../../../data/mock/stores'
import type { Store } from '../../../data/types/store'
import './StoreLocator.css'

interface StoreLocatorProps {
  open: boolean
  onClose: () => void
  onConfirm: (store: Store) => void
  initialStoreId?: string | null
}

export function StoreLocator({ open, onClose, onConfirm, initialStoreId }: StoreLocatorProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(initialStoreId ?? null)

  const filtered = MOCK_STORES.filter((s) => {
    const q = search.toLowerCase()
    return (
      s.name.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.postalCode.includes(q)
    )
  })

  const handleConfirm = () => {
    const store = MOCK_STORES.find((s) => s.id === selected)
    if (store) {
      onConfirm(store)
      // Navigation is handled by the parent via onConfirm — don't call onClose here
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="M"
      title="Choisir un magasin"
      footer={
        <div className="store-locator__footer-actions" data-partner="carrefour">
          <Button variant="secondary" size="M" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            size="M"
            onClick={handleConfirm}
            disabled={!selected}
          >
            Valider ce magasin
          </Button>
        </div>
      }
    >
      <div className="store-locator">
        <InputField
          placeholder="Ville, code postal…"
          aria-label="Rechercher un magasin"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          lIcon={<MagnifyingGlass size={16} weight="bold" aria-hidden="true" />}
        />

        <p className="store-locator__nearby-label">Magasins à proximité</p>

        <div className="store-locator__list" role="list">
          {filtered.length === 0 ? (
            <p className="store-locator__empty">Aucun magasin trouvé pour &ldquo;{search}&rdquo;.</p>
          ) : (
            filtered.map((store) => (
              <div key={store.id} role="listitem">
                <StoreCard
                  store={store}
                  selected={selected === store.id}
                  onSelect={(s) => setSelected(s.id)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  )
}

export default StoreLocator
