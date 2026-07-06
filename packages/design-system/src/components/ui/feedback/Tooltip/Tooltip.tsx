import { type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import './Tooltip.css'

const tooltip = cva('tooltip', {
  variants: {
    placement: {
      top:    'tooltip--top',
      bottom: 'tooltip--bottom',
      left:   'tooltip--left',
      right:  'tooltip--right',
    },
  },
  defaultVariants: { placement: 'top' },
})

export type TooltipPlacement = NonNullable<VariantProps<typeof tooltip>['placement']>

export interface TooltipProps extends VariantProps<typeof tooltip> {
  content: string
  children: ReactNode
}

export function Tooltip({ content, children, placement }: TooltipProps) {
  return (
    <span className="tooltip-wrapper">
      {children}
      <span className={tooltip({ placement })} role="tooltip">{content}</span>
    </span>
  )
}
export default Tooltip
