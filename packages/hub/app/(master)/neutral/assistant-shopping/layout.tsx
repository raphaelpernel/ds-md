import { AssistantProvider } from '@/features/assistant-shopping/context/AssistantContext'
import { AssistantShoppingDemoLayout } from '@/features/assistant-shopping/components/assistant/AssistantShoppingDemoLayout'
import { AssistantShoppingRoutesProvider } from '@/features/assistant-shopping/routing/AssistantShoppingRoutes'

export default function AssistantShoppingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AssistantShoppingRoutesProvider basePath="/neutral/assistant-shopping">
      <AssistantProvider>
        <AssistantShoppingDemoLayout>{children}</AssistantShoppingDemoLayout>
      </AssistantProvider>
    </AssistantShoppingRoutesProvider>
  )
}
