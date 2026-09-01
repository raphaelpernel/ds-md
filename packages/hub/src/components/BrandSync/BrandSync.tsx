'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { findClientNamespace, NEUTRAL_BRAND } from '@/config/namespaces'

/**
 * The root layout sets `<html data-brand>` from `headers()`, which is only
 * correct for the request that produced the current hard page load —
 * Next.js does not guarantee the root layout re-renders on a client-side
 * (soft) navigation between routes it wraps, so clicking a sidebar Link
 * changes the URL without re-running that computation. This re-derives
 * the brand from the current pathname on every navigation and keeps
 * `data-brand` in sync — the same client-side attribute mutation the
 * anti-FOUC script and BrandThemeSwitcher already use, just reactive to
 * route changes instead of only to localStorage.
 */
export function BrandSync() {
  const pathname = usePathname()

  useEffect(() => {
    const firstSegment = pathname.split('/')[1] ?? ''
    const clientNamespace = findClientNamespace(firstSegment)
    const brand = clientNamespace ? clientNamespace.brand : NEUTRAL_BRAND
    document.documentElement.setAttribute('data-brand', brand)
  }, [pathname])

  return null
}

export default BrandSync
