import { type AnchorHTMLAttributes, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import './Link.css'

const link = cva('link', {
  variants: {
    size: {
      LG: 'link--LG',
      MD: 'link--MD',
      SM: 'link--SM',
    },
  },
  defaultVariants: { size: 'MD' },
})

export interface LinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof link> {
  lIcon?: ReactNode
  rIcon?: ReactNode
}

export function Link({ size, lIcon, rIcon, children, className, ...props }: LinkProps) {
  return (
    <a className={link({ size, class: className })} {...props}>
      {lIcon && <span className="link__icon">{lIcon}</span>}
      <span>{children}</span>
      {rIcon && <span className="link__icon">{rIcon}</span>}
    </a>
  )
}
export default Link
