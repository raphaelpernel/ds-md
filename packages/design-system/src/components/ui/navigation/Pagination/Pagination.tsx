import { cva } from 'class-variance-authority'
import './Pagination.css'

const paginationBtn = cva('pagination__btn', {
  variants: {
    active: { true: 'pagination__btn--active', false: '' },
  },
  defaultVariants: { active: false },
})

export interface PaginationProps {
  page: number
  pageCount: number
  onChange?: (page: number) => void
}

function getPageItems(page: number, pageCount: number): (number | '...')[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1)

  const wStart = Math.max(1, Math.min(page - 1, pageCount - 2))
  const wEnd = Math.min(pageCount, Math.max(page + 1, 3))

  const items: (number | '...')[] = []

  if (wStart > 1) {
    items.push(1)
    if (wStart > 2) items.push('...')
  }

  for (let p = wStart; p <= wEnd; p++) items.push(p)

  if (wEnd < pageCount) {
    if (wEnd < pageCount - 1) items.push('...')
    items.push(pageCount)
  }

  return items
}

export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  const items = getPageItems(page, pageCount)

  return (
    <nav aria-label="Pagination" className="pagination">
      <button className={paginationBtn({})} onClick={() => onChange?.(page - 1)} disabled={page <= 1} aria-label="Previous">
        ‹
      </button>
      {items.map((item, i) =>
        item === '...'
          ? <span key={`ellipsis-${i}`} className="pagination__ellipsis">…</span>
          : (
            <button
              key={item}
              className={paginationBtn({ active: item === page })}
              onClick={() => onChange?.(item)}
              aria-current={item === page ? 'page' : undefined}
            >
              {item}
            </button>
          )
      )}
      <button className={paginationBtn({})} onClick={() => onChange?.(page + 1)} disabled={page >= pageCount} aria-label="Next">
        ›
      </button>
    </nav>
  )
}
export default Pagination
