import { type ReactNode, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import './Modal.css'

const modal = cva('modal', {
  variants: {
    size: {
      S: 'modal--S',
      M: 'modal--M',
      L: 'modal--L',
    },
  },
  defaultVariants: { size: 'M' },
})

export interface ModalProps extends VariantProps<typeof modal> {
  open: boolean
  onClose: () => void
  title?: string
  children?: ReactNode
  footer?: ReactNode
}

export function Modal({ open, onClose, title, children, footer, size }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose} aria-modal="true" role="dialog" aria-labelledby={title ? 'modal-title' : undefined}>
      <div className={modal({ size })} onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          {title && <h2 id="modal-title" className="modal__title">{title}</h2>}
          <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  )
}
export default Modal
