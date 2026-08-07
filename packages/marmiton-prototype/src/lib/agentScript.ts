import { MOCK_RECIPES } from '../data/mock/recipes'
import type { Recipe, Season } from '../data/types/recipe'

/**
 * Classificateur scripté local à marmiton-prototype (Lot 1 — prototype de simulation,
 * pas un backend IA réel). Aucune dépendance à assistant-shopping, par principe
 * d'isolation entre packages. Le texte libre reste toujours la voie primaire ;
 * les chips ne sont qu'un raccourci qui produit le même texte reconnu.
 */

export type Constraint = 'enfant' | 'sans-sauce' | 'vegetarien' | 'vegan' | 'sans-gluten' | 'sans-lactose' | 'allergie' | 'debutant'

export interface AgentSlots {
  time?: number
  servings?: number
  /** Contraintes exprimées dans la conversation — un tableau, pas une valeur unique : un même
   * user peut cumuler "enfant" et "sans-gluten" dans un même fil. Vide = aucune contrainte. */
  constraints: Constraint[]
  ingredients: string[]
  /** Signale un intérêt pour les infos nutritionnelles (indépendant de `constraints`) — affiche calories/protéines sur la carte. */
  healthFocus?: boolean
  /** Ingrédients évités par goût (ex. "j'aime pas les champignons") — distinct d'une allergie
   * (`constraints` incluant `'allergie'`, médical) et de `ingredients` (ce que l'utilisateur *a*, sens opposé). */
  avoidIngredients: string[]
  /** Signale un intérêt pour le prix (indépendant de `constraints`) — même schéma que `healthFocus`. */
  budgetFocus?: boolean
}

export interface PantryMatch {
  matchedIngredientNames: string[]
  missingCount: number
}

/** Alias entre les mots-clés extraits de la conversation et les noms d'ingrédients affichés dans les recettes. */
const INGREDIENT_ALIASES: Record<string, string[]> = {
  pates: ['pâtes', 'pates', 'spaghetti'],
}

/** Ingrédients "achetables" (hors `staple`) de la recette dont le nom (normalisé) correspond à au
 * moins une des clés fournies (via `INGREDIENT_ALIASES`) — factorisation partagée entre `pantryMatch`
 * (ce que l'utilisateur a déjà) et `avoidedIngredientMatch` (ce qu'il évite), même logique de matching. */
function matchIngredientNames(recipe: Recipe, keys: string[]): string[] {
  const shoppable = recipe.ingredients.filter((ingredient) => !ingredient.staple)
  const matched: string[] = []
  for (const ingredient of shoppable) {
    const normName = normalize(ingredient.name)
    const hit = keys.some((key) => {
      const aliases = INGREDIENT_ALIASES[key] ?? [key]
      return aliases.some((alias) => normName.includes(normalize(alias)))
    })
    if (hit) matched.push(ingredient.name)
  }
  return matched
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
  const matched = matchIngredientNames(recipe, slots.ingredients)
  if (matched.length === 0) return null
  const shoppable = recipe.ingredients.filter((ingredient) => !ingredient.staple)
  return { matchedIngredientNames: matched, missingCount: shoppable.length - matched.length }
}

/** Ingrédients de la recette que l'utilisateur évite par goût (`slots.avoidIngredients`) — utilisé
 * pour un avertissement sur la carte/le drawer, jamais pour filtrer ou noter une recommandation
 * (`/agent` reste inchangé au niveau du classement pour cette passe). */
export function avoidedIngredientMatch(recipe: Recipe, slots: AgentSlots): string[] {
  if (slots.avoidIngredients.length === 0) return []
  return matchIngredientNames(recipe, slots.avoidIngredients)
}

/**
 * Choisit l'astuce la plus pertinente pour le contexte de la conversation. `tipForKids`
 * prend le pas sur `tip` quand `constraints` contient « enfant », `tipForBeginners`
 * quand elle contient « debutant ».
 */
export function selectTip(recipe: Recipe, slots: AgentSlots): string | undefined {
  if (slots.constraints.includes('enfant') && recipe.tipForKids) return recipe.tipForKids
  if (slots.constraints.includes('debutant') && recipe.tipForBeginners) return recipe.tipForBeginners
  return recipe.tip
}

const CONSTRAINT_LABELS: Record<Exclude<Constraint, 'allergie'>, string> = {
  enfant: 'Adapté aux enfants',
  'sans-sauce': 'Sans sauce',
  vegetarien: 'Végétarien',
  vegan: 'Vegan',
  'sans-gluten': 'Sans gluten',
  'sans-lactose': 'Sans lactose',
  debutant: 'Facile pour débuter',
}

/**
 * Variante accordée en genre de `CONSTRAINT_LABELS`, pour insertion dans une phrase
 * complète ("une recette {phrase}") côté message `relaxed` — `CONSTRAINT_LABELS` est
 * un label de chip autonome (accord neutre), pas grammaticalement bindable à "recette".
 */
export const RELAXED_REASON: Record<Constraint, string> = {
  enfant: 'adaptée aux enfants',
  'sans-sauce': 'sans sauce',
  vegetarien: 'végétarienne',
  vegan: 'vegane',
  'sans-gluten': 'sans gluten',
  'sans-lactose': 'sans lactose',
  allergie: "garantissant l'absence de l'allergène mentionné",
  debutant: 'facile pour débuter',
}

/** `debutant` n'est pas porté par `recipe.tags` (pas de nouveau tag à maintenir sur les recettes
 * existantes) — la correspondance se fait via `recipe.difficulty === 'facile'`, déjà peuplé.
 * Exporté (sous-projet 2) pour que `recipeAskScript.ts` puisse vérifier une contrainte à la fois. */
export function constraintSatisfiedBy(recipe: Recipe, constraint: Constraint): boolean {
  if (constraint === 'debutant') return recipe.difficulty === 'facile'
  return (recipe.tags ?? []).includes(constraint)
}

/**
 * Sous-ensemble de `slots.constraints` réellement satisfait par la recette recommandée —
 * exclut toujours `'allergie'` (mot-clé approximatif dans `recipe.tags`, pas un champ
 * d'allergènes vérifié, voir `allergens` sur la carte, seule sortie honnête pour ce cas) et
 * retourne `[]` sur un résultat `relaxed` (contrainte(s) abandonnée(s), `matched=false`) —
 * une contrainte ne doit jamais être présentée comme satisfaite dans ce cas, même si
 * `recipe.tags` la contient encore. Remplace `constraintApplies` (sous-projet 1), qui
 * opérait sur une contrainte unique.
 */
export function satisfiedConstraints(recipe: Recipe, slots: AgentSlots, matched: boolean): Exclude<Constraint, 'allergie'>[] {
  if (!matched) return []
  return slots.constraints.filter(
    (c): c is Exclude<Constraint, 'allergie'> => c !== 'allergie' && constraintSatisfiedBy(recipe, c)
  )
}

/**
 * Labels de correspondance à afficher sur la carte pour chaque contrainte exprimée
 * réellement satisfaite par la recette recommandée. Remplace `constraintLabel` (sous-projet 1),
 * qui retournait une seule valeur.
 */
export function constraintLabels(recipe: Recipe, slots: AgentSlots, matched: boolean): string[] {
  return satisfiedConstraints(recipe, slots, matched).map((c) => CONSTRAINT_LABELS[c])
}

export interface CommunityQuote {
  text: string
}

/**
 * Sélectionne un avis communautaire contextuel (signal contextuel, pas un résumé générique
 * de tous les avis — cf. design doc "Signal communautaire contextuel"). Priorité à la
 * première contrainte mentionnée (ordre d'expression par l'utilisateur, signal le plus
 * décisionnel) sur le temps. Volontairement basé sur `slots.constraints` (ce qui a été dit),
 * pas sur `satisfiedConstraints` (ce que le tag officiel confirme) — un avis communautaire
 * répond à « la communauté en a-t-elle parlé ? », pas à « la recette est-elle officiellement
 * taguée ? ». Retourne le premier avis du pool taggé pour cette contrainte. Pas de compteur —
 * le nombre d'avis n'est pas un signal utile pour l'utilisateur, seule l'attribution
 * ("Selon les avis") compte. Une seule citation même si plusieurs contraintes sont
 * mentionnées — en empiler plusieurs alourdirait la carte sans ajouter de signal.
 */
export function selectCommunityQuote(recipe: Recipe, slots: AgentSlots, matched: boolean): CommunityQuote | undefined {
  const reviews = recipe.reviews ?? []

  if (matched) {
    const firstConstraint = slots.constraints.find((c) => c !== 'allergie')
    if (firstConstraint) {
      const forConstraint = reviews.find((r) => r.tag === firstConstraint)
      if (forConstraint) return { text: forConstraint.text }
    }
  }

  if (slots.time !== undefined && recipe.duration <= slots.time) {
    const forTime = reviews.find((r) => r.tag === 'time')
    if (forTime) return { text: forTime.text }
  }

  return undefined
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

export interface RecommendedRecipe {
  recipe: Recipe
  /** true = recette réellement scorée (score > 0 via scoreRecipe) ; false = complément "proche" (quasi-match), jamais présentée comme une correspondance confirmée. */
  matched: boolean
  /** Score brut, 0 pour un quasi-match. Usage interne (tri, garde-fou signal insuffisant) — jamais affiché. */
  score: number
}

export type AgentTurnResult =
  | { kind: 'clarify'; message: string }
  | { kind: 'recommend'; recipes: RecommendedRecipe[]; reason: string }
  | { kind: 'relaxed'; recipes: RecommendedRecipe[]; droppedConstraints: Constraint[]; message: string }
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
  [/vegan/i, 'vegan'],
  [/végétarien|vegetarien/i, 'vegetarien'],
  [/sans gluten/i, 'sans-gluten'],
  [/sans lactose/i, 'sans-lactose'],
  [/allerg/i, 'allergie'],
  [/débutant|débute|debutant|jamais cuisiné|jamais cuisine|nul(le)? en cuisine/i, 'debutant'],
]

const HEALTH_WORDS = /léger|healthy|calories?|régime|diète|minceur/i
const BUDGET_WORDS = /\bcher\b|économique|abordable|budget|coûte|prix/i
const AVOID_WORDS = /j'aime pas|je n'aime pas|j'evite|je deteste/
/** Déclenche un retrait plutôt qu'un ajout dans `extractSlots` — contrainte ou ingrédient déjà
 * posé dans le fil que l'utilisateur annule ("finalement pas de poulet", "en fait peu importe
 * le sans-gluten"). Testé sur le texte normalisé, même registre que `AVOID_WORDS`/`BUDGET_WORDS`. */
const RETRACT_WORDS = /finalement|en fait|plutot pas|peu importe|oublie|annule/

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
    .replace(/œ/g, 'oe')
    .replace(/['']/g, "'")
}

export function extractSlots(text: string, prev: AgentSlots): AgentSlots {
  const next: AgentSlots = {
    ...prev,
    ingredients: [...prev.ingredients],
    avoidIngredients: [...prev.avoidIngredients],
    constraints: [...prev.constraints],
  }
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

  const isRetractTurn = RETRACT_WORDS.test(norm)

  for (const [re, val] of CONSTRAINT_WORDS) {
    if (!re.test(text)) continue
    if (isRetractTurn) {
      next.constraints = next.constraints.filter((c) => c !== val)
    } else if (!next.constraints.includes(val)) {
      next.constraints.push(val)
    }
  }

  if (HEALTH_WORDS.test(text)) {
    next.healthFocus = true
  }

  if (BUDGET_WORDS.test(text)) {
    next.budgetFocus = true
  }

  // Un tour qui exprime un dégoût ("j'aime pas X") va au slot avoidIngredients plutôt qu'au
  // slot ingredients ("ce que j'ai") — un même tour ne porte qu'une seule de ces deux intentions.
  // Un tour de retrait (isRetractTurn) est prioritaire sur les deux : il retire l'ingrédient
  // reconnu des deux slots plutôt que de l'ajouter à l'un d'eux.
  const isAvoidTurn = AVOID_WORDS.test(norm)

  for (const word of INGREDIENT_WORDS) {
    const key = normalize(word).replace('pâtes', 'pates')
    if (!norm.includes(key)) continue
    const canonical = key === 'courgettes' ? 'courgette' : key === 'abricots' ? 'abricot' : key
    if (isRetractTurn) {
      next.ingredients = next.ingredients.filter((i) => i !== canonical && i !== key)
      next.avoidIngredients = next.avoidIngredients.filter((i) => i !== canonical && i !== key)
    } else if (isAvoidTurn) {
      if (!next.avoidIngredients.includes(canonical)) next.avoidIngredients.push(canonical)
    } else if (!next.ingredients.includes('pates') && !next.ingredients.includes(key) && !next.ingredients.includes(canonical)) {
      next.ingredients.push(canonical)
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
  for (const constraint of slots.constraints) {
    if (constraintSatisfiedBy(recipe, constraint)) score += 2
  }
  if (slots.time !== undefined && recipe.duration <= slots.time + 5) score += 1
  return score
}

const TOP_N = 3
/** Même fenêtre de grâce que l'ancien fallback relaxed mono-recette. */
const RELAXED_GRACE_MIN = 15

/** Les `limit` recettes les mieux scorées (score > 0), triées décroissant. Tri stable : à score égal, l'ordre de `MOCK_RECIPES` est préservé (même comportement que l'ancien `bestMatch` à égalité). */
function topMatches(slots: AgentSlots, limit = TOP_N): { recipe: Recipe; score: number }[] {
  return MOCK_RECIPES.map((recipe) => ({ recipe, score: scoreRecipe(recipe, slots) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Complète le slate avec des recettes "proches" (reprend la logique de l'ancien fallback
 * relaxed : fenêtre de grâce de 15 min sur la durée, premier ordre du tableau qui convient)
 * quand moins de `limit` recettes ont réellement scoré. Exclut les recettes déjà retenues.
 * Si rien ne convient du tout, `MOCK_RECIPES[0]` sert d'ultime filet — le slate n'est jamais vide.
 */
function fillNearFits(slots: AgentSlots, excludeIds: Set<string>, limit: number): Recipe[] {
  const candidates = MOCK_RECIPES.filter(
    (r) => !excludeIds.has(r.id) && (slots.time === undefined || r.duration <= slots.time + RELAXED_GRACE_MIN)
  )
  const result = candidates.slice(0, limit)
  if (result.length === 0 && limit > 0 && !excludeIds.has(MOCK_RECIPES[0].id)) {
    result.push(MOCK_RECIPES[0])
  }
  return result
}

/** Construit le slate de recommandation (jusqu'à `limit` recettes) : vrais matchs d'abord, complété par des quasi-matchs si besoin. `hasRealMatch` indique si au moins une recette a réellement scoré. */
export function buildRecipeSlate(slots: AgentSlots, limit = TOP_N): { recipes: RecommendedRecipe[]; hasRealMatch: boolean } {
  const real = topMatches(slots, limit)
  const recipes: RecommendedRecipe[] = real.map((m) => ({ recipe: m.recipe, matched: true, score: m.score }))
  if (recipes.length < limit) {
    const excludeIds = new Set(recipes.map((r) => r.recipe.id))
    const fillers = fillNearFits(slots, excludeIds, limit - recipes.length)
    for (const f of fillers) recipes.push({ recipe: f, matched: false, score: 0 })
  }
  return { recipes, hasRealMatch: real.length > 0 }
}

function reasonFor(recipe: Recipe, slots: AgentSlots): string {
  const bits: string[] = []
  if (slots.time !== undefined) bits.push(`prête en ${recipe.duration} min`)
  for (const constraint of slots.constraints) {
    if (constraint !== 'allergie') bits.push(RELAXED_REASON[constraint])
  }
  if (slots.ingredients.length > 0) bits.push(`utilise ${slots.ingredients.join(', ')}`)
  if (bits.length === 0) bits.push('correspond à ce que vous avez décrit')
  return bits.join(', ')
}

/** Message complet côté agent, sans tiret cadratin (règle produit : jamais de « — » visible). */
export function recommendationMessage(recipe: Recipe, reason: string): string {
  return `Je vous propose ${recipe.name}, ${reason}.`
}

export function hasEnoughSignal(slots: AgentSlots): boolean {
  return slots.ingredients.length > 0 || slots.time !== undefined || slots.servings !== undefined || slots.constraints.length > 0
}

/** Jointure des formes accordées de `RELAXED_REASON` pour plusieurs contraintes abandonnées à la
 * fois — "et" avant le dernier élément, virgule entre les précédents (français standard). */
function joinReasons(constraints: Constraint[]): string {
  const reasons = constraints.map((c) => RELAXED_REASON[c])
  if (reasons.length <= 1) return reasons.join('')
  return `${reasons.slice(0, -1).join(', ')} et ${reasons[reasons.length - 1]}`
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
            "Je ne suis pas sûr de comprendre. Vous pouvez fermer cette fenêtre et piocher dans la sélection du moment, ou continuer à m'écrire avec un ingrédient, un temps, ou une envie. Je reste disponible dès que vous avez de quoi me guider.",
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

  const { recipes, hasRealMatch } = buildRecipeSlate(slots)

  if (!hasRealMatch) {
    if (clarifyAttempts >= 1) {
      // Cas dégradé : aucune recette ne correspond → on relâche toutes les contraintes d'un
      // coup plutôt que d'en relâcher une à la fois (pas d'ordre de priorité/spécificité
      // défini entre les 8 valeurs de Constraint — décision produit du 2026-08-07).
      const top = recipes[0]
      const droppedConstraints = slots.constraints
      return {
        slots,
        result: {
          kind: 'relaxed',
          recipes,
          droppedConstraints,
          message:
            droppedConstraints.length > 0
              ? `Je n'ai pas trouvé de recette ${joinReasons(droppedConstraints)}, voici ce qui s'en rapproche le plus : ${top.recipe.name}.`
              : `Je n'ai pas trouvé de recette qui corresponde exactement, voici ce qui s'en rapproche le plus : ${top.recipe.name}.`,
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
  if (recipes[0].score <= 2 && slots.time === undefined && slots.servings === undefined && clarifyAttempts < 1) {
    return {
      slots,
      result: {
        kind: 'clarify',
        message: "Vous avez combien de temps, ou vous êtes combien à table ? Ça m'aide à choisir la bonne version.",
      },
    }
  }

  return {
    slots,
    result: { kind: 'recommend', recipes, reason: reasonFor(recipes[0].recipe, slots) },
  }
}

export const EMPTY_SLOTS: AgentSlots = { ingredients: [], avoidIngredients: [], constraints: [] }
