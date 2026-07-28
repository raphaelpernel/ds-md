import { MOCK_RECIPES } from '../data/mock/recipes'
import type { Recipe, Season } from '../data/types/recipe'

/**
 * Classificateur scripté local à marmiton-prototype (Lot 1 — prototype de simulation,
 * pas un backend IA réel). Aucune dépendance à assistant-shopping, par principe
 * d'isolation entre packages. Le texte libre reste toujours la voie primaire ;
 * les chips ne sont qu'un raccourci qui produit le même texte reconnu.
 */

export type Constraint = 'enfant' | 'sans-sauce' | 'vegetarien' | 'sans-gluten' | 'sans-lactose' | 'allergie'

export interface AgentSlots {
  time?: number
  servings?: number
  constraint?: Constraint
  ingredients: string[]
  /** Signale un intérêt pour les infos nutritionnelles (indépendant de `constraint`) — affiche calories/protéines sur la carte. */
  healthFocus?: boolean
}

export interface PantryMatch {
  matchedIngredientNames: string[]
  missingCount: number
}

/** Alias entre les mots-clés extraits de la conversation et les noms d'ingrédients affichés dans les recettes. */
const INGREDIENT_ALIASES: Record<string, string[]> = {
  pates: ['pâtes', 'pates', 'spaghetti'],
}

/**
 * Croise ce que l'utilisateur a déclaré avoir (`AgentSlots.ingredients`) avec la liste
 * complète des ingrédients de la recette, pour afficher un écart panier concret sur la
 * carte recette de l'agent (ex. « Utilise vos lardons et vos œufs · il manque 2 produits »).
 * Les produits de base (`staple: true`, ex. huile, sel) sont exclus du calcul — ni comptés
 * comme correspondance ni comme manquants, pour ne pas diluer le signal avec des banalités.
 * Retourne `null` si l'utilisateur n'a mentionné aucun ingrédient — pas de bandeau à afficher.
 */
export function pantryMatch(recipe: Recipe, slots: AgentSlots): PantryMatch | null {
  if (slots.ingredients.length === 0) return null

  const shoppable = recipe.ingredients.filter((ingredient) => !ingredient.staple)

  const matched: string[] = []
  for (const ingredient of shoppable) {
    const normName = normalize(ingredient.name)
    const hit = slots.ingredients.some((key) => {
      const aliases = INGREDIENT_ALIASES[key] ?? [key]
      return aliases.some((alias) => normName.includes(normalize(alias)))
    })
    if (hit) matched.push(ingredient.name)
  }

  if (matched.length === 0) return null
  return { matchedIngredientNames: matched, missingCount: shoppable.length - matched.length }
}

/**
 * Choisit l'astuce la plus pertinente pour le contexte de la conversation. `tipForKids`
 * prend le pas sur `tip` quand la contrainte détectée est « enfant » — les autres contextes
 * de risque (ex. débutant) ne sont pas encore détectables par le classificateur (Lot 1).
 */
export function selectTip(recipe: Recipe, slots: AgentSlots): string | undefined {
  if (slots.constraint === 'enfant' && recipe.tipForKids) return recipe.tipForKids
  return recipe.tip
}

const CONSTRAINT_LABELS: Record<Exclude<Constraint, 'allergie'>, string> = {
  enfant: 'Adapté aux enfants',
  'sans-sauce': 'Sans sauce',
  vegetarien: 'Végétarien',
  'sans-gluten': 'Sans gluten',
  'sans-lactose': 'Sans lactose',
}

/**
 * Label de correspondance à afficher sur la carte quand la contrainte exprimée est
 * réellement satisfaite par la recette recommandée (présente dans `recipe.tags`).
 * `matched` doit être `false` sur un résultat `relaxed` (contrainte abandonnée) — sinon
 * on afficherait une confirmation trompeuse. `allergie` n'a volontairement pas de label
 * ici : `Recipe.tags` n'y est qu'un mot-clé approximatif, pas un champ d'allergènes
 * vérifié — voir `allergens` sur la carte, seule sortie honnête pour ce cas.
 */
export function constraintLabel(recipe: Recipe, slots: AgentSlots, matched: boolean): string | undefined {
  if (!matched || !slots.constraint || slots.constraint === 'allergie') return undefined
  if (!(recipe.tags ?? []).includes(slots.constraint)) return undefined
  return CONSTRAINT_LABELS[slots.constraint]
}

function seasonFor(date: Date): Season {
  const month = date.getMonth()
  if (month === 11 || month <= 1) return 'hiver'
  if (month <= 4) return 'printemps'
  if (month <= 7) return 'ete'
  return 'automne'
}

/** Vrai si la recette est explicitement marquée comme "de saison" au mois courant. Pas de `season` déclaré = jamais affichée comme telle. */
export function isInSeason(recipe: Recipe, date: Date = new Date()): boolean {
  return !!recipe.season?.includes(seasonFor(date))
}

export type AgentTurnResult =
  | { kind: 'clarify'; message: string }
  | { kind: 'recommend'; recipe: Recipe; reason: string }
  | { kind: 'relaxed'; recipe: Recipe; droppedConstraint: string; message: string }
  | { kind: 'not_understood'; message: string }

const TIME_WORDS: Array<[RegExp, number]> = [
  [/\brapide|vite|express\b/i, 20],
  [/\b(\d{1,3})\s*min/i, -1], // -1 = extraire le nombre capturé
]

const SERVINGS_WORDS: Array<[RegExp, number]> = [
  [/\bseul(e)?\b/i, 1],
  [/\ben couple|à deux\b/i, 2],
  [/\bfamille\b/i, 4],
  [/\b(\d{1,2})\s*(personnes?|convives?|pers\.?)\b/i, -1],
]

const CONSTRAINT_WORDS: Array<[RegExp, Constraint]> = [
  [/enfant|gosse|petit(e)?\b.*mange/i, 'enfant'],
  [/sans sauce/i, 'sans-sauce'],
  [/vegan|végétarien|vegetarien/i, 'vegetarien'],
  [/sans gluten/i, 'sans-gluten'],
  [/sans lactose/i, 'sans-lactose'],
  [/allerg/i, 'allergie'],
]

const HEALTH_WORDS = /léger|healthy|calories?|régime|diète|minceur/i

const INGREDIENT_WORDS: string[] = [
  'poulet',
  'courgette',
  'courgettes',
  'ricotta',
  'pates',
  'pâtes',
  'lardons',
  'citron',
  'thon',
  'abricot',
  'abricots',
  'gratin',
]

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function extractSlots(text: string, prev: AgentSlots): AgentSlots {
  const next: AgentSlots = { ...prev, ingredients: [...prev.ingredients] }
  const norm = normalize(text)

  for (const [re, val] of TIME_WORDS) {
    const m = text.match(re)
    if (m) {
      next.time = val === -1 ? Number(m[1]) : val
      break
    }
  }

  for (const [re, val] of SERVINGS_WORDS) {
    const m = text.match(re)
    if (m) {
      next.servings = val === -1 ? Number(m[1]) : val
      break
    }
  }

  for (const [re, val] of CONSTRAINT_WORDS) {
    if (re.test(text)) {
      next.constraint = val
      break
    }
  }

  if (HEALTH_WORDS.test(text)) {
    next.healthFocus = true
  }

  for (const word of INGREDIENT_WORDS) {
    const key = normalize(word).replace('pâtes', 'pates')
    if (norm.includes(key) && !next.ingredients.includes('pates') && !next.ingredients.includes(key)) {
      const canonical = key === 'courgettes' ? 'courgette' : key === 'abricots' ? 'abricot' : key
      if (!next.ingredients.includes(canonical)) next.ingredients.push(canonical)
    }
  }

  return next
}

function scoreRecipe(recipe: Recipe, slots: AgentSlots): number {
  const tags = recipe.tags ?? []
  let score = 0
  for (const ingredient of slots.ingredients) {
    if (tags.includes(ingredient) || tags.includes(ingredient === 'pates' ? 'pates' : ingredient)) score += 3
  }
  if (slots.constraint && tags.includes(slots.constraint)) score += 2
  if (slots.time !== undefined && recipe.duration <= slots.time + 5) score += 1
  return score
}

function bestMatch(slots: AgentSlots): { recipe: Recipe; score: number } | null {
  let best: { recipe: Recipe; score: number } | null = null
  for (const recipe of MOCK_RECIPES) {
    const score = scoreRecipe(recipe, slots)
    if (score > 0 && (!best || score > best.score)) best = { recipe, score }
  }
  return best
}

function reasonFor(recipe: Recipe, slots: AgentSlots): string {
  const bits: string[] = []
  if (slots.time !== undefined) bits.push(`prête en ${recipe.duration} min`)
  if (slots.constraint === 'enfant') bits.push('adaptée aux enfants')
  if (slots.constraint === 'sans-sauce') bits.push('sans sauce')
  if (slots.ingredients.length > 0) bits.push(`utilise ${slots.ingredients.join(', ')}`)
  if (bits.length === 0) bits.push('correspond à ce que vous avez décrit')
  return bits.join(', ')
}

/** Message complet côté agent, sans tiret cadratin (règle produit : jamais de « — » visible). */
export function recommendationMessage(recipe: Recipe, reason: string): string {
  return `Je vous propose ${recipe.name}, ${reason}.`
}

export function hasEnoughSignal(slots: AgentSlots): boolean {
  return slots.ingredients.length > 0 || slots.time !== undefined || slots.servings !== undefined || slots.constraint !== undefined
}

/**
 * Traite un tour de conversation. `clarifyAttempts` compte les clarifications déjà
 * posées pour ce fil — après 2 échecs, on bascule sur le message de repli (jamais
 * une impasse, cf. design doc "Cas dégradé").
 */
export function processTurn(text: string, prevSlots: AgentSlots, clarifyAttempts: number): { slots: AgentSlots; result: AgentTurnResult } {
  const slots = extractSlots(text, prevSlots)

  if (!hasEnoughSignal(slots)) {
    if (clarifyAttempts >= 1) {
      return {
        slots,
        result: {
          kind: 'not_understood',
          message:
            "Je ne suis pas sûr de comprendre. Vous pouvez piocher dans la sélection ci-dessous, ou utiliser la recherche classique. Je reste disponible dès que vous avez une envie ou une contrainte à me donner.",
        },
      }
    }
    return {
      slots,
      result: {
        kind: 'clarify',
        message: "Dites-m'en un peu plus : un ingrédient que vous avez sous la main, le temps que vous avez, ou pour combien de personnes ?",
      },
    }
  }

  const match = bestMatch(slots)

  if (!match) {
    if (clarifyAttempts >= 1) {
      // Cas dégradé : aucune recette ne correspond → on relâche la contrainte la plus stricte.
      const fallback = MOCK_RECIPES.find((r) => slots.time === undefined || r.duration <= slots.time + 15) ?? MOCK_RECIPES[0]
      return {
        slots,
        result: {
          kind: 'relaxed',
          recipe: fallback,
          droppedConstraint: slots.constraint ?? 'contrainte',
          message: `Sans cette contrainte précise, voici ce qui s'en rapproche le plus : ${fallback.name}.`,
        },
      }
    }
    return {
      slots,
      result: {
        kind: 'clarify',
        message: slots.time === undefined ? 'Vous avez combien de temps devant vous ?' : 'Pour combien de personnes ?',
      },
    }
  }

  // Signal insuffisant pour trancher entre plusieurs recettes plausibles (ex. « pâtes » seul).
  if (match.score <= 2 && slots.time === undefined && slots.servings === undefined && clarifyAttempts < 1) {
    return {
      slots,
      result: {
        kind: 'clarify',
        message: 'Vous avez combien de temps, ou vous êtes combien à table ? Ça m’aide à choisir la bonne version.',
      },
    }
  }

  return {
    slots,
    result: { kind: 'recommend', recipe: match.recipe, reason: reasonFor(match.recipe, slots) },
  }
}

export const EMPTY_SLOTS: AgentSlots = { ingredients: [] }
