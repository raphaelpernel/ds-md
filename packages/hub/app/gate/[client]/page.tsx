// packages/hub/app/gate/[client]/page.tsx
import { notFound } from 'next/navigation'
import { findClientNamespace } from '@/config/namespaces'
import { authenticateClient } from '@/lib/auth/actions'
import '../gate.css'

export default async function ClientGatePage({
  params,
  searchParams,
}: {
  params: Promise<{ client: string }>
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { client } = await params
  const { next, error } = await searchParams
  const namespace = findClientNamespace(client)
  if (!namespace) {
    notFound()
  }

  const action = authenticateClient.bind(null, namespace.id)

  return (
    <main className="hub-gate">
      <form className="hub-gate__form" action={action}>
        <h1 className="hub-gate__title">Accès {namespace.label}</h1>
        <label className="hub-gate__label" htmlFor="password">
          Mot de passe
        </label>
        <input className="hub-gate__input" id="password" name="password" type="password" autoFocus required />
        <input type="hidden" name="next" value={next ?? `/${namespace.id}`} />
        {error && <p className="hub-gate__error">Mot de passe incorrect.</p>}
        <button className="hub-gate__submit" type="submit">
          Entrer
        </button>
      </form>
    </main>
  )
}
