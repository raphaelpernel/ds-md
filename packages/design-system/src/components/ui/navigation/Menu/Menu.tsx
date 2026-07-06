import { type ReactNode } from 'react'
import './Menu.css'

export interface MenuItem {
  value: string
  label: string
  icon?: ReactNode
  disabled?: boolean
  danger?: boolean
  divider?: boolean
}

export interface MenuProps {
  items: MenuItem[]
  onSelect?: (value: string) => void
}

export function Menu({ items, onSelect }: MenuProps) {
  return (
    <ul className="menu" role="menu">
      {items.map((item, i) => (
        item.divider
          ? <li key={i} className="menu__divider" role="separator" />
          : <li key={item.value} role="menuitem" className={['menu__item', item.danger && 'menu__item--danger', item.disabled && 'menu__item--disabled'].filter(Boolean).join(' ')}>
              <button className="menu__btn" onClick={() => !item.disabled && onSelect?.(item.value)} disabled={item.disabled}>
                {item.icon && <span className="menu__icon">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            </li>
      ))}
    </ul>
  )
}
export default Menu
