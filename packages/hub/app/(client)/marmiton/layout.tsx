import { ClientNamespaceShell } from '@/components/ClientNamespaceShell/ClientNamespaceShell'

/**
 * The `/marmiton` index itself is a hub-style prototype gallery (see
 * `page.tsx`), not part of the real Marmiton site — so it does NOT get
 * Marmiton's own Header/Footer/CartProvider chrome here. Those wrap only
 * the actual migrated funnel pages, via `(funnel)/layout.tsx`.
 */
export default function MarmitonLayout({ children }: { children: React.ReactNode }) {
  return <ClientNamespaceShell>{children}</ClientNamespaceShell>
}
