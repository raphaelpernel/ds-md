import { type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import './ChipTag.css'

const chipTag = cva('chip-tag', {
  variants: {
    type: {
      'filled':          'chip-tag--filled',
      'toned':           'chip-tag--toned',
      'neutral-filled':  'chip-tag--neutral-filled',
      'neutral-outline': 'chip-tag--neutral-outline',
      'alpha':           'chip-tag--alpha',
    },
    size: {
      L: 'chip-tag--L',
      M: 'chip-tag--M',
      S: 'chip-tag--S',
    },
    selected: { true: 'chip-tag--selected', false: '' },
    disabled: { true: 'chip-tag--disabled', false: '' },
  },
  defaultVariants: { type: 'neutral-filled', size: 'M', selected: false, disabled: false },
})

export type ChipTagType = NonNullable<VariantProps<typeof chipTag>['type']>
export type ChipTagSize = NonNullable<VariantProps<typeof chipTag>['size']>

export interface ChipTagProps extends VariantProps<typeof chipTag> {
  label: string
  icon?: ReactNode
  onRemove?: () => void
  onClick?: () => void
}

export function ChipTag({ label, type, size, icon, onRemove, selected, onClick, disabled }: ChipTagProps) {
  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag
      className={chipTag({ type, size, selected, disabled })}
      onClick={!disabled ? onClick : undefined}
      disabled={Tag === 'button' ? !!disabled : undefined}
      aria-pressed={onClick ? !!selected : undefined}
    >
      {icon && <span className="chip-tag__icon" aria-hidden="true">{icon}</span>}
      <span>{label}</span>
      {onRemove && (
        <button
          className="chip-tag__remove"
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          aria-label={`Retirer ${label}`}
        >
          ✕
        </button>
      )}
    </Tag>
  )
}

export default ChipTag
