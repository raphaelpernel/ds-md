import { cva, type VariantProps } from 'class-variance-authority'
import './Avatar.css'

const avatar = cva('avatar', {
  variants: {
    size: {
      XS: 'avatar--XS',
      S:  'avatar--S',
      M:  'avatar--M',
      L:  'avatar--L',
      XL: 'avatar--XL',
    },
    shape: {
      circle: 'avatar--circle',
      square: 'avatar--square',
    },
    hasImage: { true: '', false: 'avatar--initials' },
  },
  defaultVariants: { size: 'M', shape: 'circle', hasImage: false },
})

export type AvatarSize   = NonNullable<VariantProps<typeof avatar>['size']>
export type AvatarShape  = NonNullable<VariantProps<typeof avatar>['shape']>
export type AvatarStatus = 'online' | 'offline' | 'away'

export interface AvatarProps extends Omit<VariantProps<typeof avatar>, 'hasImage'> {
  src?: string
  alt?: string
  initials?: string
  status?: AvatarStatus
}

export function Avatar({ src, alt = '', initials, size, shape, status }: AvatarProps) {
  return (
    <div className={avatar({ size, shape, hasImage: !!src })}>
      {src
        ? <img className="avatar__img" src={src} alt={alt} />
        : <span className="avatar__text">{initials ?? alt.slice(0, 2).toUpperCase()}</span>
      }
      {status && <span className={`avatar__status avatar__status--${status}`} aria-label={status} />}
    </div>
  )
}
export default Avatar
