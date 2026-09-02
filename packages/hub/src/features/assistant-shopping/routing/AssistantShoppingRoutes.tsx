'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'

interface AssistantShoppingRoutes {
  home: string
  category: string
  cart: string
  chat: string
}

const AssistantShoppingRoutesContext = createContext<AssistantShoppingRoutes | null>(null)

export function AssistantShoppingRoutesProvider({ basePath, children }: { basePath: string; children: ReactNode }) {
  const routes = useMemo(() => {
    const normalizedBasePath = `/${basePath.replace(/^\/+|\/+$/g, '')}`
    const withPath = (segment: string) => (normalizedBasePath === '/' ? `/${segment}` : `${normalizedBasePath}/${segment}`)

    return {
      home: normalizedBasePath,
      category: withPath('category'),
      cart: withPath('cart'),
      chat: withPath('chat'),
    }
  }, [basePath])

  return <AssistantShoppingRoutesContext.Provider value={routes}>{children}</AssistantShoppingRoutesContext.Provider>
}

export function useAssistantShoppingRoutes(): AssistantShoppingRoutes {
  const routes = useContext(AssistantShoppingRoutesContext)

  if (!routes) {
    throw new Error('useAssistantShoppingRoutes must be used within an AssistantShoppingRoutesProvider')
  }

  return routes
}
