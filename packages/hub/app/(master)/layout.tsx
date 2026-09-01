// packages/hub/app/(master)/layout.tsx
import { MasterShell } from '@/components/MasterShell/MasterShell'
import './master-shell.css'

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  return <MasterShell>{children}</MasterShell>
}
