import './Shimmering.css'

/** Shimmering — full-surface shimmer overlay for content loading states (cards, images) */
export interface ShimmeringProps {
  width?: string | number
  height?: string | number
  borderRadius?: string
}

export function Shimmering({ width = '100%', height = 200, borderRadius }: ShimmeringProps) {
  return (
    <div
      className="shimmering"
      style={{ width, height, borderRadius: borderRadius ?? 'var(--shape-card)' }}
      aria-hidden="true"
    />
  )
}
export default Shimmering
