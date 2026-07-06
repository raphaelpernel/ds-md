import { type HTMLAttributes, type ReactNode } from 'react'
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
    category: {
      promo:     'chip-tag--category-promo',
      new:       'chip-tag--category-new',
      healthy:   'chip-tag--category-healthy',
      express:   'chip-tag--category-express',
      'low-cost': 'chip-tag--category-low-cost',
    },
    appearance: {
      solid: 'chip-tag--appearance-solid',
      toned: 'chip-tag--appearance-toned',
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
export type ChipTagCategory = NonNullable<VariantProps<typeof chipTag>['category']>
export type ChipTagAppearance = NonNullable<VariantProps<typeof chipTag>['appearance']>

export interface ChipTagProps
  extends VariantProps<typeof chipTag>,
    Omit<HTMLAttributes<HTMLElement>, 'onClick'> {
  label: string
  icon?: ReactNode
  onRemove?: () => void
  onClick?: () => void
}

export function ChipTag({
  label,
  type,
  category,
  appearance,
  size,
  icon,
  onRemove,
  selected,
  onClick,
  disabled,
  className,
  ...rest
}: ChipTagProps) {
  const Tag = onClick ? 'button' : 'span'

  return (
    <Tag
      className={chipTag({
        ...(category ? {} : { type: type ?? 'neutral-filled' }),
        category,
        appearance: category ? (appearance ?? 'solid') : undefined,
        size,
        selected,
        disabled,
        className,
      })}
      onClick={!disabled ? onClick : undefined}
      disabled={Tag === 'button' ? !!disabled : undefined}
      aria-pressed={onClick ? !!selected : undefined}
      {...rest}
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
