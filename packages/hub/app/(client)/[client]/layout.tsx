// packages/hub/app/(client)/[client]/layout.tsx
import { notFound } from 'next/navigation'
import { findClientNamespace } from '@/config/namespaces'
import { ClientNamespaceShell } from '@/components/ClientNamespaceShell/ClientNamespaceShell'
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

  return <ClientNamespaceShell>{children}</ClientNamespaceShell>
}
