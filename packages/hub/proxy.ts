// packages/hub/proxy.ts
import { NextRequest, NextResponse } from 'next/server'
import { CLIENT_NAMESPACES, findClientNamespace, NEUTRAL_BRAND } from '@/config/namespaces'
import { MASTER_COOKIE_NAME, clientCookieName } from '@/lib/auth/cookies'
import { verifyToken } from '@/lib/auth/token'
import { getRequiredEnvVar } from '@/lib/env'

function withBrandHeaders(request: NextRequest, brand: string, locked: boolean) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-hub-brand', brand)
  requestHeaders.set('x-hub-locked', locked ? '1' : '0')
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const secret = getRequiredEnvVar('HUB_COOKIE_SECRET')

  const masterTokenValue = request.cookies.get(MASTER_COOKIE_NAME)?.value
  const hasMaster = masterTokenValue ? await verifyToken(masterTokenValue, 'master', secret) : false

  const firstSegment = pathname.split('/')[1] ?? ''
  const clientNamespace = findClientNamespace(firstSegment)

  if (clientNamespace) {
    const clientTokenValue = request.cookies.get(clientCookieName(clientNamespace.id))?.value
    const hasClient = clientTokenValue
      ? await verifyToken(clientTokenValue, `client:${clientNamespace.id}`, secret)
      : false

    if (!hasMaster && !hasClient) {
      const gateUrl = new URL(`/gate/${clientNamespace.id}`, request.url)
      gateUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(gateUrl)
    }

    return withBrandHeaders(request, clientNamespace.brand, true)
  }

  if (pathname === '/gate' || pathname.startsWith('/gate/')) {
    const gateClientId = pathname.split('/')[2]
    const gateClientNamespace = gateClientId ? findClientNamespace(gateClientId) : undefined
    if (gateClientNamespace) {
      return withBrandHeaders(request, gateClientNamespace.brand, true)
    }
    return withBrandHeaders(request, NEUTRAL_BRAND, false)
  }

  if (!hasMaster) {
    const gateUrl = new URL('/gate', request.url)
    gateUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(gateUrl)
  }

  return withBrandHeaders(request, NEUTRAL_BRAND, false)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts/).*)'],
}
