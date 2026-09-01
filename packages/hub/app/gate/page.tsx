// packages/hub/app/gate/page.tsx
import { authenticateMaster } from '@/lib/auth/actions'
import './gate.css'

export default async function MasterGatePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams

  return (
    <main className="hub-gate">
      <form className="hub-gate__form" action={authenticateMaster}>
        <h1 className="hub-gate__title">Accès équipe</h1>
        <label className="hub-gate__label" htmlFor="password">
          Mot de passe
        </label>
        <input className="hub-gate__input" id="password" name="password" type="password" autoFocus required />
        <input type="hidden" name="next" value={next ?? '/'} />
        {error && <p className="hub-gate__error">Mot de passe incorrect.</p>}
        <button className="hub-gate__submit" type="submit">
          Entrer
        </button>
      </form>
    </main>
  )
}
