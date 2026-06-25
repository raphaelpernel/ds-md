import './SegmentedControl.css'

export interface SegmentedOption {
  value: string
  label: string
}

export interface SegmentedControlProps {
  options: SegmentedOption[]
  value: string
  onChange?: (value: string) => void
  fullWidth?: boolean
  /** Label lu par les lecteurs d'écran pour identifier le groupe de choix */
  label?: string
  /** Désactive tout le composant */
  disabled?: boolean
  /** Désactive des options individuelles par leur valeur */
  disabledValues?: string[]
}

export function SegmentedControl({
  options,
  value,
  onChange,
  fullWidth = false,
  label,
  disabled = false,
  disabledValues = [],
}: SegmentedControlProps) {
  const activeIndex = options.findIndex((o) => o.value === value)

  return (
    <div
      className={[
        'segmented',
        fullWidth ? 'segmented--full' : '',
        disabled ? 'segmented--disabled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
    >
      {/* Sliding thumb */}
      <span
        className="segmented__thumb"
        style={{
          width: `calc((100% - var(--segmented-padding) * 2) / ${options.length})`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
        aria-hidden="true"
      />

      {options.map((option) => {
        const isActive = option.value === value
        const isDisabled = disabled || disabledValues.includes(option.value)
        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={isActive}
            aria-disabled={isDisabled || undefined}
            className={[
              'segmented__option',
              isActive ? 'segmented__option--active' : '',
              isDisabled ? 'segmented__option--disabled' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => !isDisabled && onChange?.(option.value)}
            tabIndex={isDisabled ? -1 : undefined}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default SegmentedControl
