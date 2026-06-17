import { type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import './Toast.css'

const toast = cva('toast', {
  variants: {
    variant: {
      default: 'toast--default',
      success: 'toast--success',
      danger:  'toast--danger',
      warning: 'toast--warning',
      info:    'toast--info',
    },
  },
  defaultVariants: { variant: 'default' },
})

export type ToastVariant = NonNullable<VariantProps<typeof toast>['variant']>

export interface ToastProps extends VariantProps<typeof toast> {
  title: string
  description?: string
  icon?: ReactNode
  action?: { label: string; onClick: () => void }
  onDismiss?: () => void
}

export function Toast({ variant, title, description, icon, action, onDismiss }: ToastProps) {
  return (
    <div className={toast({ variant })} role="status" aria-live="polite">
      {icon && <span className="toast__icon" aria-hidden="true">{icon}</span>}
      <div className="toast__body">
        <p className="toast__title">{title}</p>
        {description && <p className="toast__desc">{description}</p>}
        {action && <button className="toast__action" onClick={action.onClick}>{action.label}</button>}
      </div>
      {onDismiss && <button className="toast__dismiss" onClick={onDismiss} aria-label="Dismiss">✕</button>}
    </div>
  )
}
export default Toast
