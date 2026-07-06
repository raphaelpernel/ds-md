import { type ReactNode } from 'react'
import { cva } from 'class-variance-authority'
import './ListItem.css'

const listItem = cva('list-item', {
  variants: {
    interactive: { true: 'list-item--interactive', false: '' },
    disabled:    { true: 'list-item--disabled',    false: '' },
  },
  defaultVariants: { interactive: false, disabled: false },
})

export interface ListItemProps {
  label: string
  description?: string
  lSlot?: ReactNode
  rSlot?: ReactNode
  onClick?: () => void
  disabled?: boolean
}

export function ListItem({ label, description, lSlot, rSlot, onClick, disabled = false }: ListItemProps) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      className={listItem({ interactive: !!onClick, disabled })}
      onClick={!disabled ? onClick : undefined}
      disabled={Tag === 'button' ? disabled : undefined}
    >
      {lSlot && <span className="list-item__slot list-item__slot--left">{lSlot}</span>}
      <div className="list-item__content">
        <span className="list-item__label">{label}</span>
        {description && <span className="list-item__desc">{description}</span>}
      </div>
      {rSlot && <span className="list-item__slot list-item__slot--right">{rSlot}</span>}
    </Tag>
  )
}
export default ListItem
