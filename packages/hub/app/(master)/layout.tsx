// packages/hub/app/(master)/layout.tsx
import { Sidebar } from '@/components/Sidebar/Sidebar'
import './master-shell.css'

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hub-shell">
      <Sidebar />
      <main className="hub-shell__content">{children}</main>
    </div>
  )
}
