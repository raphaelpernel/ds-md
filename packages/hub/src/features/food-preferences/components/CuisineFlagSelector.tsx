import { Check } from '@phosphor-icons/react'

interface Props {
  label: string
  flagSrc: string
  selected: boolean
  onClick: () => void
}

export function CuisineFlagSelector({ label, flagSrc, selected, onClick }: Props) {
  return (
    <button
      type="button"
      className={`food-preferences-cuisine-selector${selected ? ' food-preferences-cuisine-selector--selected' : ''}`}
      aria-pressed={selected}
      onClick={onClick}
    >
      <span className="food-preferences-cuisine-selector__flag">
        <img src={flagSrc} alt="" />
        {selected && <span className="food-preferences-cuisine-selector__check" aria-hidden="true"><Check size={16} weight="bold" /></span>}
      </span>
      <span className="food-preferences-cuisine-selector__label">{label}</span>
    </button>
  )
}
