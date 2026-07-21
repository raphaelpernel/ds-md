'use client'

import { useEffect, useState } from 'react'
import { BRANDS } from '@mealz-product-team/design-system'

function readBrand(): string {
  return document.documentElement.getAttribute('data-brand') || 'neutral'
}

/** True when the active brand is a retailer's own site (e.g. CoursesU) rather
 *  than a Mealz-owned surface — see `BrandOption.isRetailer`. Watches
 *  `data-brand` via MutationObserver since `BrandThemeSwitcher` mutates the
 *  attribute directly without dispatching an event. */
export function useIsRetailerBrand(): boolean {
  const [brand, setBrand] = useState('neutral')

  useEffect(() => {
    setBrand(readBrand())
    const observer = new MutationObserver(() => setBrand(readBrand()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-brand'] })
    return () => observer.disconnect()
  }, [])

  return BRANDS.find((b) => b.value === brand)?.isRetailer ?? false
}
