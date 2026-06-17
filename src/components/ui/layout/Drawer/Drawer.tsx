import { type ReactNode, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import './Drawer.css'

const drawer = cva('drawer', {
  variants: {
    placement: {
      right:  'drawer--right',
      left:   'drawer--left',
      bottom: 'drawer--bottom',
    },
    open: { true: 'drawer--open', false: '' },
  },
  defaultVariants: { placement: 'right', open: false },
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
  children?: ReactNode
  footer?: ReactNode
}

export function Drawer({ open, onClose, title, children, footer, placement }: DrawerProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      <div className={drawerOverlay({ open })} onClick={onClose} aria-hidden="true" />
      <div
        className={drawer({ placement, open })}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
      >
        <div className="drawer__header">
          {title && <h2 id="drawer-title" className="drawer__title">{title}</h2>}
          <button className="drawer__close" onClick={onClose} aria-label="Close drawer">✕</button>
        </div>
        <div className="drawer__body">{children}</div>
        {footer && <div className="drawer__footer">{footer}</div>}
      </div>
    </>
  )
}
export default Drawer
