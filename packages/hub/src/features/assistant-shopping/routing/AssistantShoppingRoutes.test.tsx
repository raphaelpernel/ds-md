import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  AssistantShoppingRoutesProvider,
  useAssistantShoppingRoutes,
} from './AssistantShoppingRoutes'

describe('AssistantShoppingRoutes', () => {
  it('derives all routes from its base path', () => {
    const { result } = renderHook(() => useAssistantShoppingRoutes(), {
      wrapper: ({ children }) => (
        <AssistantShoppingRoutesProvider basePath="/neutral/assistant-shopping">
          {children}
        </AssistantShoppingRoutesProvider>
      ),
    })

    expect(result.current).toEqual({
      home: '/neutral/assistant-shopping',
      category: '/neutral/assistant-shopping/category',
      cart: '/neutral/assistant-shopping/cart',
      chat: '/neutral/assistant-shopping/chat',
    })
  })

  it('preserves the CoursesU namespace on every route', () => {
    const { result } = renderHook(() => useAssistantShoppingRoutes(), {
      wrapper: ({ children }) => (
        <AssistantShoppingRoutesProvider basePath="/coursesu/assistant-shopping">
          {children}
        </AssistantShoppingRoutesProvider>
      ),
    })

    expect(result.current).toEqual({
      home: '/coursesu/assistant-shopping',
      category: '/coursesu/assistant-shopping/category',
      cart: '/coursesu/assistant-shopping/cart',
      chat: '/coursesu/assistant-shopping/chat',
    })
  })

  it('normalizes repeated leading and trailing slashes', () => {
    const { result } = renderHook(() => useAssistantShoppingRoutes(), {
      wrapper: ({ children }) => (
        <AssistantShoppingRoutesProvider basePath="//neutral/assistant-shopping//">
          {children}
        </AssistantShoppingRoutesProvider>
      ),
    })

    expect(result.current).toEqual({
      home: '/neutral/assistant-shopping',
      category: '/neutral/assistant-shopping/category',
      cart: '/neutral/assistant-shopping/cart',
      chat: '/neutral/assistant-shopping/chat',
    })
  })

  it('uses root-relative routes when mounted at the root', () => {
    const { result } = renderHook(() => useAssistantShoppingRoutes(), {
      wrapper: ({ children }) => <AssistantShoppingRoutesProvider basePath="/">{children}</AssistantShoppingRoutesProvider>,
    })

    expect(result.current).toEqual({ home: '/', category: '/category', cart: '/cart', chat: '/chat' })
  })

  it('throws a useful error outside the provider', () => {
    expect(() => renderHook(() => useAssistantShoppingRoutes())).toThrow(
      'useAssistantShoppingRoutes must be used within an AssistantShoppingRoutesProvider'
    )
  })
})
