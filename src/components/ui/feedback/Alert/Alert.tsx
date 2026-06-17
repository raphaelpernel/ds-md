import { type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import './Alert.css'

const alert = cva('alert', {
  variants: {
    variant: {
      success: 'alert--success',
      danger:  'alert--danger',
      warning: 'alert--warning',
      info:    'alert--info',
    },
  },
  defaultVariants: { variant: 'info' },
})

export type AlertVariant = NonNullable<VariantProps<typeof alert>['variant']>

export interface AlertAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export interface AlertProps extends VariantProps<typeof alert> {
  title?: string
  children?: ReactNode
  icon?: ReactNode
  actions?: AlertAction[]
  onDismiss?: () => void
}

export function Alert({ variant, title, children, icon, actions, onDismiss }: AlertProps) {
  return (
    <div className={alert({ variant })} role="alert">
      {icon && <span className="alert__icon" aria-hidden="true">{icon}</span>}
      <div className="alert__body">
        {title && <p className="alert__title">{title}</p>}
        {children && <div className="alert__content">{children}</div>}
        {actions && actions.length > 0 && (
          <div className="alert__actions">
            {actions.map((action, i) => (
              <button
                key={i}
                className={['alert__action-btn', `alert__action-btn--${action.variant ?? 'primary'}`].join(' ')}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {onDismiss && (
        <button className="alert__dismiss" onClick={onDismiss} aria-label="Dismiss">✕</button>
      )}
    </div>
  )
}
export default Alert
