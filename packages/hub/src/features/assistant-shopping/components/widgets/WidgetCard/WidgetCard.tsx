import type { ReactNode } from 'react'
import './WidgetCard.css'

/** Shared card chrome for every chat widget — "un widget = un wrapper card avec le
 *  contenu du widget à l'intérieur". Widgets provide only their own inner content and
 *  layout; background, radius, shadow and padding always come from this component. */
export function WidgetCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className ? `widget-card ${className}` : 'widget-card'}>{children}</div>
}

export default WidgetCard
