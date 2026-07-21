'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { Button } from '@mealz-product-team/design-system'
import './Slider.css'

/** Carrousel horizontal générique avec boutons chevron superposés, masqués en
 *  butée de scroll — utilisé par le carrousel de recettes, les alternatives de
 *  la vue "swap produit" et le filtre de recettes du panier. */
export function Slider({ children, className }: { children: ReactNode; className?: string }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    const updateScrollState = () => {
      setCanScrollLeft(el.scrollLeft > 4)
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
    }

    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    const resizeObserver = new ResizeObserver(updateScrollState)
    resizeObserver.observe(el)

    return () => {
      el.removeEventListener('scroll', updateScrollState)
      resizeObserver.disconnect()
    }
  }, [])

  const scrollByAmount = (direction: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <div className={className ? `slider ${className}` : 'slider'}>
      <div className="slider__track" ref={trackRef}>
        {children}
      </div>
      {canScrollLeft && (
        <Button
          variant="secondary"
          size="S"
          iconOnly={<CaretLeft size={16} weight="bold" aria-hidden="true" />}
          label="Précédent"
          className="slider__button slider__button--left"
          onClick={() => scrollByAmount(-1)}
        />
      )}
      {canScrollRight && (
        <Button
          variant="secondary"
          size="S"
          iconOnly={<CaretRight size={16} weight="bold" aria-hidden="true" />}
          label="Suivant"
          className="slider__button slider__button--right"
          onClick={() => scrollByAmount(1)}
        />
      )}
    </div>
  )
}

export default Slider
