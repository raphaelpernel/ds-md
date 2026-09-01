// packages/hub/src/lib/auth/actions.ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRequiredEnvVar } from '@/lib/env'
import { constantTimeEqual } from './compare'
import { MASTER_COOKIE_NAME, clientCookieName, COOKIE_MAX_AGE_SECONDS } from './cookies'
import { signToken } from './token'
import { MASTER_PASSWORD_ENV_VAR, findClientNamespace } from '@/config/namespaces'

function safeNext(rawNext: string, fallback: string): string {
  return rawNext.startsWith('/') ? rawNext : fallback
}

export async function authenticateMaster(formData: FormData) {
  const password = String(formData.get('password') ?? '')
  const next = safeNext(String(formData.get('next') ?? '/'), '/')

  const expected = getRequiredEnvVar(MASTER_PASSWORD_ENV_VAR)
  if (!constantTimeEqual(password, expected)) {
    redirect(`/gate?next=${encodeURIComponent(next)}&error=1`)
  }

  const secret = getRequiredEnvVar('HUB_COOKIE_SECRET')
  const expiresAt = Date.now() + COOKIE_MAX_AGE_SECONDS * 1000
  const token = await signToken('master', expiresAt, secret)

  const cookieStore = await cookies()
  cookieStore.set(MASTER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: '/',
  })

  redirect(next)
}

export async function authenticateClient(clientId: string, formData: FormData) {
  const namespace = findClientNamespace(clientId)
  if (!namespace) {
    redirect('/')
  }

  const password = String(formData.get('password') ?? '')
  const next = safeNext(String(formData.get('next') ?? `/${clientId}`), `/${clientId}`)

  const expected = getRequiredEnvVar(namespace.passwordEnvVar)
  if (!constantTimeEqual(password, expected)) {
    redirect(`/gate/${clientId}?next=${encodeURIComponent(next)}&error=1`)
  }

  const secret = getRequiredEnvVar('HUB_COOKIE_SECRET')
  const expiresAt = Date.now() + COOKIE_MAX_AGE_SECONDS * 1000
  const token = await signToken(`client:${clientId}`, expiresAt, secret)

  const cookieStore = await cookies()
  cookieStore.set(clientCookieName(clientId), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: `/${clientId}`,
  })

  redirect(next)
}
