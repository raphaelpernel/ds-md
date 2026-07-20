export type Difficulty = 'facile' | 'moyen' | 'difficile'

export interface RecipeIngredient {
  id: string
  name: string
  quantity: number
  unit: string
  emoji: string
  productId: string | null
  /** Absent des ingrédients listés mais requis par une étape — voir détection d'incohérence. */
  missingFromList?: boolean
}

export interface CommunitySignal {
  text: string
  agreeCount: number
}

export interface Recipe {
  id: string
  name: string
  emoji: string
  servings: number
  duration: number
  difficulty: Difficulty
  /** Mots-clés utilisés par l'interprétation de la demande (régime, ingrédients, contexte, occasion…) */
  tags: string[]
  ingredients: RecipeIngredient[]
  steps: string[]
  rating: number
  reviewCount: number
  /** Signaux extraits des avis communautaires, pré-calculés pour le POC (pas de vrai NLP sur corpus réel). */
  communitySignals: CommunitySignal[]
  estimatedPricePerServing: number
}
