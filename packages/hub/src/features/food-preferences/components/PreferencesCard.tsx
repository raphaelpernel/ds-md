import type { CSSProperties } from 'react'

interface PreferencesCardProps {
  label: string
  iconSrc: string
  selected: boolean
  onClick: () => void
}

export function PreferencesCard({ label, iconSrc, selected, onClick }: PreferencesCardProps) {
  const iconStyle = {
    '--food-preferences-option-card-icon': `url("${iconSrc}")`,
  } as CSSProperties

  return (
    <button
      type="button"
      className={`food-preferences-option-card${selected ? ' food-preferences-option-card--selected' : ''}`}
      data-state={selected ? 'selected' : 'default'}
      aria-pressed={selected}
      onClick={onClick}
    >
      <span className="food-preferences-option-card__icon" style={iconStyle} aria-hidden="true" />
      <span className="food-preferences-option-card__label">{label}</span>
    </button>
  )
}
