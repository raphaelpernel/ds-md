import { Sidebar } from '@/components/Sidebar/Sidebar'
import './MasterShell.css'

/**
 * The team/master session chrome — sidebar + content area. Reused by both
 * the `(master)` route group (Neutral, Guide) and, when the current
 * session holds a valid master cookie, the `(client)/[client]` route
 * group too: a team member browsing into a client's namespace keeps the
 * sidebar rather than hitting a dead end that only browser-back escapes.
 * A client authenticated with only that client's own cookie never sees
 * this — see `x-hub-is-master` in `proxy.ts`.
 */
export function MasterShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="hub-shell">
      <Sidebar />
      <main className="hub-shell__content">{children}</main>
    </div>
  )
}

export default MasterShell
