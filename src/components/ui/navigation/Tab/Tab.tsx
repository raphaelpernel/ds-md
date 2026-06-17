import { type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import './Tab.css'

const tabList = cva('tab', {
  variants: {
    variant: {
      default: 'tab--default',
      pill:    'tab--pill',
    },
  },
  defaultVariants: { variant: 'default' },
})

const tabItem = cva('tab__item', {
  variants: {
    active: { true: 'tab__item--active', false: '' },
  },
  defaultVariants: { active: false },
})

export interface TabItem { value: string; label: string; icon?: ReactNode; disabled?: boolean }

export interface TabProps extends VariantProps<typeof tabList> {
  items: TabItem[]
  value: string
  onChange?: (value: string) => void
}

export function Tab({ items, value, onChange, variant }: TabProps) {
  return (
    <div className={tabList({ variant })} role="tablist">
      {items.map((item) => (
        <button
          key={item.value}
          role="tab"
          className={tabItem({ active: value === item.value })}
          aria-selected={value === item.value}
          disabled={item.disabled}
          onClick={() => !item.disabled && onChange?.(item.value)}
        >
          {item.icon && <span className="tab__icon">{item.icon}</span>}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )
}
export default Tab
