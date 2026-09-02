import type { NamespaceCard } from '@/components/NamespaceCardGrid/NamespaceCardGrid'

interface PrototypeMount {
  namespace: string
  href: string
}

interface PrototypeDefinition {
  id: string
  title: string
  description: string
  updatedAt: string
  mounts: PrototypeMount[]
}

const PROTOTYPES: PrototypeDefinition[] = [
  {
    id: 'marmiton-recipe',
    title: 'Recipe',
    description: "Parcours d'achat depuis une recette Marmiton (recette → panier → magasin → créneau → paiement).",
    updatedAt: '01/09/2026',
    mounts: [{ namespace: 'marmiton', href: '/marmiton/recipe' }],
  },
  {
    id: 'marmiton-agent',
    title: 'Agent',
    description: 'Parcours agent conversationnel Marmiton.',
    updatedAt: '01/09/2026',
    mounts: [{ namespace: 'marmiton', href: '/marmiton/agent' }],
  },
  {
    id: 'assistant-shopping',
    title: 'Assistant Shopping',
    description: 'Assistant conversationnel et démo CoursesU.',
    updatedAt: '02/09/2026',
    mounts: [
      { namespace: 'neutral', href: '/neutral/assistant-shopping' },
      { namespace: 'coursesu', href: '/coursesu/assistant-shopping' },
    ],
  },
  {
    id: 'form-mealz-planner',
    title: 'Form Mealz Planner',
    description: 'Planificateur de repas Mealz.',
    updatedAt: '02/09/2026',
    mounts: [{ namespace: 'neutral', href: '/neutral/form-mealz-planner' }],
  },
  {
    id: 'supermarket',
    title: 'Supermarket',
    description: 'Catalogue d’idées repas, collections et planificateur Mealz.',
    updatedAt: '02/09/2026',
    mounts: [{ namespace: 'neutral', href: '/neutral/supermarket' }],
  },
]

export function getPrototypeCards(namespace: string): NamespaceCard[] {
  return PROTOTYPES.flatMap((prototype) =>
    prototype.mounts
      .filter((mount) => mount.namespace === namespace)
      .map((mount) => ({
        title: prototype.title,
        description: prototype.description,
        updatedAt: prototype.updatedAt,
        href: mount.href,
      }))
  )
}
