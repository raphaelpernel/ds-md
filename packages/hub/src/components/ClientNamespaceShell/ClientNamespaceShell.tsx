// packages/hub/src/components/ClientNamespaceShell/ClientNamespaceShell.tsx
import { headers } from 'next/headers'
import { MasterShell } from '@/components/MasterShell/MasterShell'

/**
 * Shared between every client-specific route tree (the generic `[client]`
 * catch-all and each proto's own static folder, e.g. `marmiton/`): renders
 * the master sidebar shell for a team session, or passes children through
 * completely unwrapped otherwise. Deliberately has no styling opinion of
 * its own — a locked stub page and a fully-migrated proto's own chrome
 * have very different layout needs, and neither should inherit padding
 * this component doesn't own.
 */
export async function ClientNamespaceShell({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const isMaster = headersList.get('x-hub-is-master') === '1'

  if (isMaster) {
    return <MasterShell>{children}</MasterShell>
  }

  return <>{children}</>
}

export default ClientNamespaceShell
