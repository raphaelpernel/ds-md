export interface Ingredient {
  id: string
  name: string
  quantity: number
  unit: string
  emoji: string
  productId: string | null
  /** Produit de base assumé déjà présent (sel, huile...) — exclu du calcul d'écart panier de l'agent. */
  staple?: boolean
}

export type RecipeDifficulty = 'facile' | 'moyen' | 'difficile'

export type Season = 'printemps' | 'ete' | 'automne' | 'hiver'

export interface Recipe {
  id: string
  name: string
  imageUrl: string
  servings: number
  duration: number
  ingredients: Ingredient[]
  estimatedPricePerServing: number
  /** Mots-clés de matching pour le classificateur scripté de l'agent conversationnel (Lot 1) — pas affiché en UI. */
  tags?: string[]
  rating?: number
  reviewCount?: number
  difficulty?: RecipeDifficulty
  /** Astuce anti-échec par défaut (équivalent note d'auteur / avis Marmiton), affichée sur la carte recette de l'agent. */
  tip?: string
  /** Astuce alternative utilisée à la place de `tip` quand la conversation signale un contexte enfant. */
  tipForKids?: string
  /** Astuce alternative utilisée à la place de `tip` quand la conversation signale un contexte débutant. */
  tipForBeginners?: string
  /** Allergènes présents, affichés sur la carte uniquement quand la conversation signale une contrainte allergie. */
  allergens?: string[]
  /** Saisons où la recette est mise en avant comme "de saison" sur la carte agent. Absent = jamais affichée comme telle. */
  season?: Season[]
  calories?: number
  /** En grammes, par portion. */
  protein?: number
  /** Avis mockés taggés par contrainte ou par 'time', pour la carte agent (signal communautaire contextuel). */
  reviews?: { text: string; tag: 'enfant' | 'sans-sauce' | 'vegetarien' | 'vegan' | 'sans-gluten' | 'sans-lactose' | 'time' }[]
  /** Temps de préparation actif, en minutes — sous-ensemble de `duration` (total, four/repos inclus). Absent = pas de split connu, on n'affiche que `duration`. */
  prepDuration?: number
  /** Équipement nécessaire non-standard (ex. four, robot, mixeur) — absent ou vide = rien à signaler. */
  equipment?: string[]
}
