import { type ElementType, type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import './Heading.css'

const heading = cva('heading', {
  variants: {
    size: {
      xl: 'heading--xl',
      lg: 'heading--lg',
      md: 'heading--md',
      sm: 'heading--sm',
    },
  },
  defaultVariants: { size: 'lg' },
})

export type HeadingSize = NonNullable<VariantProps<typeof heading>['size']>

/** Balise HTML par défaut pour chaque taille — reste overridable via `as` pour les cas
 *  où la hiérarchie sémantique (un seul h1 par page) diffère de la taille visuelle voulue. */
const DEFAULT_TAG: Record<HeadingSize, ElementType> = {
  xl: 'h1',
  lg: 'h1',
  md: 'h2',
  sm: 'h3',
}

export interface HeadingProps
  extends VariantProps<typeof heading>,
    Omit<HTMLAttributes<HTMLHeadingElement>, 'color'> {
  as?: ElementType
}

export function Heading({ size, as, className, children, ...rest }: HeadingProps) {
  const resolvedSize = size ?? 'lg'
  const Tag = as ?? DEFAULT_TAG[resolvedSize]

  return (
    <Tag className={heading({ size: resolvedSize, className })} {...rest}>
      {children}
    </Tag>
  )
}

export default Heading
