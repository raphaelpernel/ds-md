import { cva, type VariantProps } from 'class-variance-authority'
import './Loading.css'

const loading = cva('loading', {
  variants: {
    size: {
      S: 'loading--S',
      M: 'loading--M',
      L: 'loading--L',
    },
  },
  defaultVariants: { size: 'M' },
})

export interface LoadingProps extends VariantProps<typeof loading> {
  label?: string
}

export function Loading({ size, label }: LoadingProps) {
  return (
    <div className={loading({ size })} role="status" aria-label={label ?? 'Loading…'}>
      <span className="loading__spinner" aria-hidden="true" />
      {label && <span className="loading__label">{label}</span>}
    </div>
  )
}
export default Loading
