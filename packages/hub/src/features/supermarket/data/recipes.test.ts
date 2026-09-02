import { describe, expect, it } from 'vitest'
import { COLLECTIONS, PROMO_COLLECTION_ID, getCollectionBySlug } from './recipes'

describe('Supermarket catalogue', () => {
  it('exposes stable collection slugs', () => {
    expect(COLLECTIONS.map((collection) => collection.id)).toEqual([
      'rapide-et-facile',
      'plats-du-moment',
      'petit-budget',
    ])
  })

  it('builds the virtual promo collection from promo recipes', () => {
    const promo = getCollectionBySlug(PROMO_COLLECTION_ID)
    expect(promo?.id).toBe(PROMO_COLLECTION_ID)
    expect(promo?.recipes.length).toBeGreaterThan(0)
    expect(promo?.recipes.every((recipe) => recipe.promo)).toBe(true)
  })

  it('rejects an unknown collection slug', () => {
    expect(getCollectionBySlug('does-not-exist')).toBeUndefined()
  })
})
