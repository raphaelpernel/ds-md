import { type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import './Badge.css'

const badge = cva('badge', {
  variants: {
    variant: {
      default: 'badge--default',
      success: 'badge--success',
      danger:  'badge--danger',
      warning: 'badge--warning',
      info:    'badge--info',
      brand:   'badge--brand',
    },
    size: {
      S: 'badge--S',
      M: 'badge--M',
      L: 'badge--L',
    },
    dot: {
      true:  'badge--dot',
      false: '',
    },
    /** `solid` n'a d'effet que sur success/danger/warning/info (triade BG+BG Light+Content) — voir `.claude/design-system-tokens.md` §2.5. */
    emphasis: {
      light: '',
      solid: '',
    },
  },
  compoundVariants: [
    { variant: 'success', emphasis: 'solid', class: 'badge--success-solid' },
    { variant: 'danger',  emphasis: 'solid', class: 'badge--danger-solid' },
    { variant: 'warning', emphasis: 'solid', class: 'badge--warning-solid' },
    { variant: 'info',    emphasis: 'solid', class: 'badge--info-solid' },
  ],
  defaultVariants: { variant: 'default', size: 'M', dot: false, emphasis: 'light' },
})

export type BadgeVariant = NonNullable<VariantProps<typeof badge>['variant']>
export type BadgeSize    = NonNullable<VariantProps<typeof badge>['size']>
export type BadgeEmphasis = NonNullable<VariantProps<typeof badge>['emphasis']>

export interface BadgeProps extends VariantProps<typeof badge> {
  label: string
  icon?: ReactNode
}

export function Badge({ label, variant, size, dot = false, emphasis, icon }: BadgeProps) {
  return (
    <span className={badge({ variant, size, dot, emphasis })}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {icon && <span className="badge__icon" aria-hidden="true">{icon}</span>}
      {label}
    </span>
  )
}
export default Badge
