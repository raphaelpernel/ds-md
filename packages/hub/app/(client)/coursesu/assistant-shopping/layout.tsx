import { AssistantProvider } from '@/features/assistant-shopping/context/AssistantContext'
import { CoursesUDemoLayout } from '@/features/assistant-shopping/components/assistant/CoursesUDemoLayout'
import { AssistantShoppingRoutesProvider } from '@/features/assistant-shopping/routing/AssistantShoppingRoutes'
import { ClientNamespaceShell } from '@/components/ClientNamespaceShell/ClientNamespaceShell'

export default function CoursesUAssistantShoppingLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientNamespaceShell>
      <AssistantShoppingRoutesProvider basePath="/coursesu/assistant-shopping">
        <AssistantProvider>
          <CoursesUDemoLayout>{children}</CoursesUDemoLayout>
        </AssistantProvider>
      </AssistantShoppingRoutesProvider>
    </ClientNamespaceShell>
  )
}
