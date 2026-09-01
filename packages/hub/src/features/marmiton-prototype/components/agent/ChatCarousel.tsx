'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { Button } from '@mealz-product-team/design-system'
import './ChatCarousel.css'

/**
 * Piste horizontale à défilement snap, sans scrollbar visible, avec navigation par bouton
 * (pas de FAB — cf. décision DS du 2026-07-21 qui a retiré le seul FAB du produit au profit
 * de `Button`, et le précédent carousel du monorepo `assistant-shopping/Slider` qui utilise
 * déjà `Button iconOnly`). Les boutons n'apparaissent que quand il y a effectivement de quoi
 * défiler dans cette direction — avec une seule carte, ils restent cachés automatiquement.
 */
export function ChatCarousel({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 4)
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [])

  function scrollByAmount(dir: 1 | -1) {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <div className="chat-carousel">
      <div className="chat-carousel__track" ref={trackRef}>
        {children}
      </div>
      {canScrollLeft && (
        <Button
          variant="secondary"
          size="S"
          iconOnly={<CaretLeft size={16} weight="bold" aria-hidden="true" />}
          label="Précédent"
          className="chat-carousel__button chat-carousel__button--left"
          onClick={() => scrollByAmount(-1)}
        />
      )}
      {canScrollRight && (
        <Button
          variant="secondary"
          size="S"
          iconOnly={<CaretRight size={16} weight="bold" aria-hidden="true" />}
          label="Suivant"
          className="chat-carousel__button chat-carousel__button--right"
          onClick={() => scrollByAmount(1)}
        />
      )}
    </div>
  )
}

export default ChatCarousel
