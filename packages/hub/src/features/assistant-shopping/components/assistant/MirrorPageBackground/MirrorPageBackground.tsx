'use client'

import { useState } from 'react'
import Image from 'next/image'
import './MirrorPageBackground.css'

export function MirrorPageBackground({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="mirror-page-background mirror-page-background--fallback" role="img" aria-label={alt}>
        <p>Capture d'écran indisponible</p>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority
      className="mirror-page-background"
      onError={() => setFailed(true)}
    />
  )
}

export default MirrorPageBackground
