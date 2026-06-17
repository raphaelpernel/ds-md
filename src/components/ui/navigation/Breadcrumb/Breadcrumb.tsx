import { type ReactNode } from 'react'
import './Breadcrumb.css'

export interface BreadcrumbItem { label: string; href?: string; icon?: ReactNode }

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: ReactNode
}

export function Breadcrumb({ items, separator = '>' }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      <ol className="breadcrumb__list">
        {items.map((item, i) => {
          const isCurrent = i === items.length - 1
          return (
            <li key={i} className="breadcrumb__item">
              {item.href && !isCurrent ? (
                <a className="breadcrumb__link" href={item.href}>
                  {item.icon && <span className="breadcrumb__icon" aria-hidden="true">{item.icon}</span>}
                  {item.label}
                </a>
              ) : (
                <span className={isCurrent ? 'breadcrumb__current' : 'breadcrumb__link'} aria-current={isCurrent ? 'page' : undefined}>
                  {item.icon && <span className="breadcrumb__icon" aria-hidden="true">{item.icon}</span>}
                  {item.label}
                </span>
              )}
              {!isCurrent && <span className="breadcrumb__separator" aria-hidden="true">{separator}</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
export default Breadcrumb
