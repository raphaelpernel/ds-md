'use client'

import { AssistantShoppingDemoLayout } from './AssistantShoppingDemoLayout'

export function CoursesUDemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <AssistantShoppingDemoLayout
      className="coursesu-demo"
      navigationLabel="Navigation démo CoursesU"
    >
      {children}
    </AssistantShoppingDemoLayout>
  )
}
