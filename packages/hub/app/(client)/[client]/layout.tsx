// packages/hub/app/(client)/[client]/layout.tsx
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { findClientNamespace } from '@/config/namespaces'
import { MasterShell } from '@/components/MasterShell/MasterShell'
import '../client-page.css'

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ client: string }>
}) {
  const { client } = await params
  const namespace = findClientNamespace(client)
  if (!namespace) {
    notFound()
  }

  // A team member (master session) browsing into a client's namespace keeps
  // the sidebar — only a session authenticated with just that client's own
  // cookie gets the locked, chrome-less view external clients see.
  const headersList = await headers()
  const isMaster = headersList.get('x-hub-is-master') === '1'

  if (isMaster) {
    return <MasterShell>{children}</MasterShell>
  }

  return <div className="hub-client-shell">{children}</div>
}
