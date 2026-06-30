import { Truck, Car } from '@phosphor-icons/react'
import { Radio } from '../../ui/form/Radio/Radio'
import { ChipTag } from '../../ui/display/ChipTag/ChipTag'
import type { Store } from '../../../data/types/store'
import './StoreCard.css'

interface StoreCardProps {
  store: Store
  selected?: boolean
  onSelect: (store: Store) => void
}

export function StoreCard({ store, selected = false, onSelect }: StoreCardProps) {
  return (
    <button
      className={`store-card${selected ? ' store-card--selected' : ''}`}
      onClick={() => onSelect(store)}
      aria-pressed={selected}
    >
      <div className="store-card__main">
        <div className="store-card__left">
          <p className="store-card__name">{store.name}</p>
          <p className="store-card__address">
            {store.address}, {store.city} {store.postalCode}
          </p>
          <p className="store-card__hours">{store.openingHours}</p>
          <div className="store-card__badges">
            {store.delivery && (
              <ChipTag
                label="Livraison"
                size="S"
                icon={<Truck size={12} weight="bold" />}
              />
            )}
            {store.drive && (
              <ChipTag
                label="Drive"
                size="S"
                icon={<Car size={12} weight="bold" />}
              />
            )}
          </div>
        </div>
        <div className="store-card__right">
          <p className="store-card__distance">
            {store.distance < 1
              ? `${(store.distance * 1000).toFixed(0)} m`
              : `${store.distance.toFixed(1)} km`}
          </p>
          <Radio
            checked={selected}
            onChange={() => onSelect(store)}
            aria-label={`Sélectionner ${store.name}`}
          />
        </div>
      </div>
    </button>
  )
}

export default StoreCard
