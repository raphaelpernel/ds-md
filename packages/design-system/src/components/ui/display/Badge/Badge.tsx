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
  },
  defaultVariants: { variant: 'default', size: 'M', dot: false },
})

export type BadgeVariant = NonNullable<VariantProps<typeof badge>['variant']>
export type BadgeSize    = NonNullable<VariantProps<typeof badge>['size']>

export interface BadgeProps extends VariantProps<typeof badge> {
  label: string
  icon?: ReactNode
}

export function Badge({ label, variant, size, dot = false, icon }: BadgeProps) {
  return (
    <span className={badge({ variant, size, dot })}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {icon && <span className="badge__icon" aria-hidden="true">{icon}</span>}
      {label}
    </span>
  )
}
export default Badge
