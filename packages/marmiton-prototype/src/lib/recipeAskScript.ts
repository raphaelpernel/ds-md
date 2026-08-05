import { extractSlots, selectTip, pantryMatch, constraintLabel, RELAXED_REASON, EMPTY_SLOTS } from './agentScript'
import type { AgentSlots, PantryMatch } from './agentScript'
import type { Recipe } from '../data/types/recipe'

/**
 * Moteur scopé à une seule recette (fiche recette, parcours D du brief Marmiton
 * Agentique) — distinct de `processTurn` dans `agentScript.ts`, qui cherche une recette
 * dans tout le catalogue. Ici la recette est déjà connue : la question n'est plus
 * "laquelle ?" mais "est-ce que ça marche pour moi ?". Réutilise les briques déjà
 * éprouvées du moteur multi-recette plutôt que de les dupliquer.
 */

export type ReviewTag = 'enfant' | 'sans-sauce' | 'vegetarien' | 'sans-gluten' | 'sans-lactose' | 'time'

export interface RecipeChip {
  tag: ReviewTag
  /** Libellé affiché sur le chip. */
  label: string
  /** Texte réellement soumis à `answerRecipeAsk` quand le chip est cliqué. */
  text: string
}

const CHIP_ORDER: ReviewTag[] = ['enfant', 'sans-sauce', 'vegetarien', 'sans-gluten', 'sans-lactose', 'time']

const CHIP_LABEL: Record<ReviewTag, string> = {
  enfant: 'Adapté aux enfants ?',
  'sans-sauce': 'Sans sauce ?',
  vegetarien: 'Une alternative végétarienne ?',
  'sans-gluten': 'Sans gluten ?',
  'sans-lactose': 'Sans lactose ?',
  time: 'Un moyen de gagner du temps ?',
}

const CHIP_QUERY: Record<ReviewTag, string> = {
  enfant: 'Est-ce adapté aux enfants ?',
  'sans-sauce': 'Une version sans sauce ?',
  vegetarien: 'Une alternative végétarienne ?',
  'sans-gluten': 'Une version sans gluten ?',
  'sans-lactose': 'Une version sans lactose ?',
  time: "C'est rapide à faire ?",
}

const MAX_CHIPS = 3

/**
 * Chips de pré-prompts propres à cette recette, générées depuis les tags distincts
 * présents dans ses avis mockés (`recipe.reviews`) — pas une donnée à part à maintenir,
 * cf. principe 3 du brief ("la communauté est un actif à extraire").
 */
export function buildRecipeChips(recipe: Recipe): RecipeChip[] {
  const presentTags = new Set((recipe.reviews ?? []).map((r) => r.tag))
  return CHIP_ORDER.filter((tag) => presentTags.has(tag))
    .slice(0, MAX_CHIPS)
    .map((tag) => ({ tag, label: CHIP_LABEL[tag], text: CHIP_QUERY[tag] }))
}

function findRecipeReview(recipe: Recipe, tag: ReviewTag): { text: string } | undefined {
  const found = (recipe.reviews ?? []).find((r) => r.tag === tag)
  return found ? { text: found.text } : undefined
}

export interface RecipeAskAnswer {
  message: string
  tip?: string
  pantryMatch: PantryMatch | null
  communityQuote?: { text: string }
  constraintLabel?: string
  allergens?: string[]
}

/**
 * Traite une question posée sur la recette déjà affichée. `prevSlots` permet à l'appelant
 * (le composant Drawer) de faire persister le contexte entre deux tours de la même
 * conversation, comme `processTurn` le fait pour le moteur multi-recette.
 */
export function answerRecipeAsk(
  recipe: Recipe,
  text: string,
  prevSlots: AgentSlots
): { slots: AgentSlots; answer: RecipeAskAnswer } {
  const slots = extractSlots(text, prevSlots)
  const bits: string[] = []

  let communityQuote: { text: string } | undefined
  let constraintLabelResult: string | undefined
  let allergens: string[] | undefined

  if (slots.constraint === 'allergie') {
    allergens = recipe.allergens ?? []
    bits.push(
      allergens.length > 0
        ? `Cette recette contient : ${allergens.join(', ').toLowerCase()}.`
        : "Aucun allergène n'est signalé pour cette recette."
    )
  } else if (slots.constraint && prevSlots.constraint !== slots.constraint) {
    // Contrainte nouvellement détectée à ce tour seulement — sinon le message
    // "Oui, cette recette est..." / "n'est pas signalée comme..." rejouerait à
    // chaque tour suivant du même fil, alors que `slots.constraint` persiste via
    // `extractSlots(text, prevSlots)`.
    const label = constraintLabel(recipe, slots, true)
    constraintLabelResult = label
    if (label) {
      bits.push(`Oui, cette recette est ${RELAXED_REASON[slots.constraint]}.`)
      communityQuote = findRecipeReview(recipe, slots.constraint)
    } else {
      bits.push(`Cette recette n'est pas signalée comme ${RELAXED_REASON[slots.constraint]}.`)
    }
  }

  if (prevSlots.time === undefined && slots.time !== undefined) {
    communityQuote = communityQuote ?? findRecipeReview(recipe, 'time')
  }

  const match = pantryMatch(recipe, slots)
  // L'astuce n'a de sens qu'une fois, au premier tour du fil — la répéter à chaque
  // bulle serait bruyant. `EMPTY_SLOTS` est le singleton passé par `RecipeAgentDrawer`
  // au tout premier appel (jamais un clone), donc l'égalité de référence suffit à
  // détecter ce premier tour sans introduire de compteur/état supplémentaire.
  const tip = prevSlots === EMPTY_SLOTS ? selectTip(recipe, slots) : undefined

  if (bits.length === 0) {
    bits.push('Voici ce que je peux vous dire sur cette recette.')
  }

  return {
    slots,
    answer: {
      message: bits.join(' '),
      tip,
      pantryMatch: match,
      communityQuote,
      constraintLabel: constraintLabelResult,
      allergens,
    },
  }
}
