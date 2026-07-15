import { type ReactNode, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { ArrowLeft, X } from '@phosphor-icons/react'
import { Button } from '../../form/Button/Button'
import './Drawer.css'

const drawer = cva('drawer', {
  variants: {
    placement: {
      right:  'drawer--right',
      left:   'drawer--left',
      bottom: 'drawer--bottom',
    },
    mobilePlacement: {
      right:  'drawer--mobile-right',
      left:   'drawer--mobile-left',
      bottom: 'drawer--mobile-bottom',
    },
    open: { true: 'drawer--open', false: '' },
  },
  defaultVariants: { placement: 'right', mobilePlacement: 'bottom', open: false },
})

const drawerOverlay = cva('drawer-overlay', {
  variants: {
    open: { true: 'drawer-overlay--visible', false: '' },
  },
  defaultVariants: { open: false },
})

export type DrawerPlacement = NonNullable<VariantProps<typeof drawer>['placement']>

export interface DrawerProps extends Omit<VariantProps<typeof drawer>, 'open'> {
  open: boolean
  onClose: () => void
  title?: string
  /** Custom header content rendered in place of the title (takes priority over title) */
  headerContent?: ReactNode
  /** Renders a back button before the title (e.g. nested navigation within the drawer) */
  onBack?: () => void
  children?: ReactNode
  footer?: ReactNode
}

export function Drawer({ open, onClose, title, headerContent, onBack, children, footer, placement, mobilePlacement }: DrawerProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      <div className={drawerOverlay({ open })} onClick={onClose} aria-hidden="true" />
      <div
        className={drawer({ placement, mobilePlacement, open })}
        role="dialog"
        aria-modal="true"
        aria-labelledby={!headerContent && title ? 'drawer-title' : undefined}
      >
        <div className="drawer__header">
          <div className="drawer__header-start">
            {onBack && (
              <Button
                variant="tertiary"
                size="S"
                iconOnly={<ArrowLeft size={18} weight="bold" />}
                label="Retour"
                onClick={onBack}
              />
            )}
            {headerContent ?? (title && <h2 id="drawer-title" className="drawer__title">{title}</h2>)}
          </div>
          <Button
            variant="tertiary"
            size="S"
            iconOnly={<X size={18} weight="bold" />}
            label="Fermer"
            onClick={onClose}
          />
        </div>
        <div className="drawer__body">{children}</div>
        {footer && <div className="drawer__footer">{footer}</div>}
      </div>
    </>
  )
}
export default Drawer
