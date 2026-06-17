import { cva, type VariantProps } from 'class-variance-authority'
import './Skeleton.css'

const skeleton = cva('skeleton', {
  variants: {
    variant: {
      text:   'skeleton--text',
      rect:   'skeleton--rect',
      circle: 'skeleton--circle',
    },
  },
  defaultVariants: { variant: 'rect' },
})

export interface SkeletonProps extends VariantProps<typeof skeleton> {
  width?: string | number
  height?: string | number
  lines?: number
}

export function Skeleton({ width, height, variant, lines = 1 }: SkeletonProps) {
  if (variant === 'text' && lines > 1) {
    return (
      <div className="skeleton-lines">
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className={skeleton({ variant: 'text' })} style={{ width: i === lines - 1 ? '60%' : '100%' }} />
        ))}
      </div>
    )
  }
  return <span className={skeleton({ variant })} style={{ width, height }} aria-hidden="true" />
}
export default Skeleton
