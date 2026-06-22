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
}

export function SegmentedControl({
  options,
  value,
  onChange,
  fullWidth = false,
}: SegmentedControlProps) {
  const activeIndex = options.findIndex((o) => o.value === value)

  return (
    <div
      className={`segmented${fullWidth ? ' segmented--full' : ''}`}
      role="radiogroup"
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
        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={isActive}
            className={`segmented__option${isActive ? ' segmented__option--active' : ''}`}
            onClick={() => onChange?.(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default SegmentedControl
