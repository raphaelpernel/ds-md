import { describe, expect, it } from 'vitest'
import { getPrototypeCards } from './prototypes'

describe('getPrototypeCards', () => {
  it('returns the two Marmiton prototypes in gallery order', () => {
    expect(getPrototypeCards('marmiton')).toEqual([
      {
        title: 'Recipe',
        description: "Parcours d'achat depuis une recette Marmiton (recette → panier → magasin → créneau → paiement).",
        updatedAt: '01/09/2026',
        href: '/marmiton/recipe',
      },
      {
        title: 'Agent',
        description: 'Parcours agent conversationnel Marmiton.',
        updatedAt: '01/09/2026',
        href: '/marmiton/agent',
      },
    ])
  })

  it('returns the Assistant Shopping card for Neutral once its route is mounted', () => {
    expect(getPrototypeCards('neutral')).toEqual([
      {
        title: 'Assistant Shopping',
        description: 'Assistant conversationnel et démo CoursesU.',
        updatedAt: '02/09/2026',
        href: '/neutral/assistant-shopping',
      },
      {
        title: 'Form Mealz Planner',
        description: 'Planificateur de repas Mealz.',
        updatedAt: '02/09/2026',
        href: '/neutral/form-mealz-planner',
      },
      {
        title: 'Supermarket',
        description: 'Catalogue d’idées repas, collections et planificateur Mealz.',
        updatedAt: '02/09/2026',
        href: '/neutral/supermarket',
      },
    ])
  })

  it('mounts Assistant Shopping under CoursesU with a prefixed home route', () => {
    expect(getPrototypeCards('coursesu')).toEqual([
      {
        title: 'Assistant Shopping',
        description: 'Assistant conversationnel et démo CoursesU.',
        updatedAt: '02/09/2026',
        href: '/coursesu/assistant-shopping',
      },
    ])
    expect(getPrototypeCards('coursesu')[0]?.href).toMatch(/^\/coursesu\/assistant-shopping(?:\/|$)/)
  })

  it('does not expose mutable card definitions to callers', () => {
    const firstRead = getPrototypeCards('marmiton')
    firstRead.pop()

    expect(getPrototypeCards('marmiton')).toHaveLength(2)
  })
})
