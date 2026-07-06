import './DateTabs.css'

export interface DateTabItem {
  /** ISO date string — YYYY-MM-DD */
  date: string
  disabled?: boolean
}

export interface DateTabsProps {
  items: DateTabItem[]
  value: string
  onChange: (date: string) => void
  locale?: string
}

export function DateTabs({
  items,
  value,
  onChange,
  locale = 'fr-FR',
}: DateTabsProps) {
  return (
    <div className="date-tabs" role="tablist" aria-label="Choisir une date">
      {items.map((item) => {
        const date = new Date(item.date)
        const isActive = value === item.date
        const dayNum = date.toLocaleDateString(locale, { day: 'numeric' })
        const dayShort = date.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '')
        const monthShort = date.toLocaleDateString(locale, { month: 'short' }).replace('.', '')

        return (
          <button
            key={item.date}
            role="tab"
            aria-selected={isActive}
            className={`date-tabs__item${isActive ? ' date-tabs__item--active' : ''}${item.disabled ? ' date-tabs__item--disabled' : ''}`}
            onClick={() => !item.disabled && onChange(item.date)}
            disabled={item.disabled}
            aria-label={date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
          >
            <span className="date-tabs__num">{dayNum}</span>
            <span className="date-tabs__day">{dayShort}</span>
            <span className="date-tabs__month">{monthShort}</span>
          </button>
        )
      })}
    </div>
  )
}

export default DateTabs
