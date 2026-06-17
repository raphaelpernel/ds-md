import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import './Button.css'

const button = cva('btn', {
  variants: {
    variant: {
      primary:   'btn--primary',
      secondary: 'btn--secondary',
      tertiary:  'btn--tertiary',
      danger:    'btn--danger',
      alpha:     'btn--alpha',
    },
    size: {
      L: 'btn--L',
      M: 'btn--M',
      S: 'btn--S',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'L',
  },
})

export type ButtonVariant = NonNullable<VariantProps<typeof button>['variant']>
export type ButtonSize    = NonNullable<VariantProps<typeof button>['size']>

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  label?: string
  lIcon?: ReactNode
  rIcon?: ReactNode
  iconOnly?: ReactNode
  loading?: boolean
}

export function Button({
  variant,
  size,
  label,
  lIcon,
  rIcon,
  iconOnly,
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = button({
    variant,
    size,
    class: [
      iconOnly  && 'btn--icon-only',
      loading   && 'btn--loading',
      className,
    ].filter(Boolean).join(' '),
  })

  if (iconOnly) {
    return (
      <button
        className={classes}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        aria-label={label}
        {...props}
      >
        <span className="btn__icon">{iconOnly}</span>
        {loading && <span className="btn__spinner" aria-hidden="true" />}
      </button>
    )
  }

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {lIcon && <span className="btn__icon btn__icon--left">{lIcon}</span>}
      <span className="btn__label">{children ?? label}</span>
      {rIcon && <span className="btn__icon btn__icon--right">{rIcon}</span>}
      {loading && <span className="btn__spinner" aria-hidden="true" />}
    </button>
  )
}

export default Button
