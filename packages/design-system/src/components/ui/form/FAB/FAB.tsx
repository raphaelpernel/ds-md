import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import './FAB.css'

const fab = cva('fab', {
  variants: {
    size:  { S: 'fab--S', M: 'fab--M', L: 'fab--L' },
    alpha: { true: 'fab--alpha', false: '' },
  },
  defaultVariants: { size: 'M', alpha: false },
})

export type FABSize = NonNullable<VariantProps<typeof fab>['size']>

export interface FABProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<VariantProps<typeof fab>, 'alpha'> {
  /** Icon to display — always rendered at 24×24 */
  icon?: ReactNode
  /** State=Alpha — renders over images/blurred surfaces */
  alpha?: boolean
}

export function FAB({ size, icon, alpha = false, disabled = false, className, ...props }: FABProps) {
  return (
    <button
      className={fab({ size, alpha, class: className })}
      disabled={disabled}
      aria-disabled={disabled}
      {...props}
    >
      {icon && <span className="fab__icon" aria-hidden="true">{icon}</span>}
    </button>
  )
}

export default FAB
