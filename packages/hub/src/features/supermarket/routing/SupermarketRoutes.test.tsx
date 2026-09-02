import { describe, expect, it } from 'vitest'
import { supermarketRoutes } from './SupermarketRoutes'

describe('Supermarket routes', () => {
  it.each(['/neutral/supermarket', '/neutral/supermarket/'])('builds every route from %s', (basePath) => {
    expect(supermarketRoutes(basePath)).toEqual({
      home: '/neutral/supermarket',
      collection: '/neutral/supermarket/collections/:slug',
      planner: '/neutral/supermarket/planner',
    })
  })
})
