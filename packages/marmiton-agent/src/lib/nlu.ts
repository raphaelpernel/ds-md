import { MOCK_RECIPES } from '../data/mock/recipes'
import { MOCK_PRODUCTS } from '../data/mock/products'
import { fullIngredientList } from './recipeAnalysis'
import type { Recipe } from '../data/types/recipe'
import type { Product } from '../data/types/product'

export type Intent = 'recipe-single' | 'disambiguation' | 'zero-match' | 'shopping-list' | 'cart' | 'offtopic' | 'unknown'

export interface ActiveConstraint {
  tag: string
  label: string
}

export interface Interpretation {
  intent: Intent
  contextSentence: string
  recipe?: Recipe
  citedSignal?: string
  disambiguationCandidates?: Recipe[]
  blockingConstraintLabel?: string
  relaxedRecipes?: Recipe[]
  products?: Product[]
  /** Contraintes actives après ce tour — à repasser au tour suivant pour affiner sans repartir de zéro. */
  activeTags: ActiveConstraint[]
  activeMaxDuration?: number
}

const OFFTOPIC_KEYWORDS = ['météo', 'meteo', 'actualité', 'actualite', 'football', 'politique', 'bourse', 'blague']
const CART_KEYWORDS = ['panier', 'mon panier']
const LIST_KEYWORDS = ['liste de courses', 'liste', 'courses']

/** Mots-clés utilisateur → tag canonique de recette. Un mot peut alimenter plusieurs tags (ex: "vite" et "rapide"). */
const TAG_KEYWORDS: { tag: string; label: string; match: string[] }[] = [
  { tag: 'rapide', label: 'rapide', match: ['rapide', 'vite', 'express'] },
  { tag: 'enfants', label: 'adapté aux enfants', match: ['enfant', 'enfants'] },
  { tag: 'vegetarien', label: 'végétarien', match: ['vegetarien', 'vegetarienne', 'végétarien', 'végétarienne', 'sans viande'] },
  { tag: 'sans-gluten', label: 'sans gluten', match: ['sans gluten', 'sans-gluten'] },
  { tag: 'sans-lactose', label: 'sans lactose', match: ['sans lactose', 'sans-lactose'] },
  { tag: 'poulet', label: 'au poulet', match: ['poulet'] },
  { tag: 'petit-dejeuner', label: 'petit-déjeuner', match: ['petit-dejeuner', 'petit dejeuner', 'petit déjeuner', 'petit-déjeuner'] },
]

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

/**
 * Mots-outils français exclus du matching par nom — sinon "sans sauce pour
 * les enfants" et "sans gluten, sans lactose" se recoupent sur "sans" et
 * déclenchent un faux positif de désambiguïsation (trouvé en test manuel).
 */
const STOPWORDS = new Set(['sans', 'avec', 'pour', 'les', 'des', 'une', 'dans', 'plus', 'tout', 'bien'])

function tokenize(text: string): string[] {
  return normalize(text)
    .split(/[^a-z0-9-]+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t))
}

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(normalize(n)))
}

/** Extrait les tags de contrainte présents dans le message (ex: "enfants difficiles" → 'enfants'). */
function extractConstraintTags(normalizedText: string): ActiveConstraint[] {
  return TAG_KEYWORDS.filter((entry) => entry.match.some((m) => normalizedText.includes(normalize(m)))).map((entry) => ({
    tag: entry.tag,
    label: entry.label,
  }))
}

/** Extrait une contrainte de durée en minutes (ex: "20 min", "20 minutes"). */
function extractTimeConstraint(normalizedText: string): number | undefined {
  const match = normalizedText.match(/(\d{1,3})\s*min/)
  return match ? Number(match[1]) : undefined
}

function matchesConstraints(recipe: Recipe, tags: string[], maxDuration: number | undefined): boolean {
  const tagsMatch = tags.every((t) => recipe.tags.includes(t))
  const durationMatch = maxDuration === undefined || recipe.duration <= maxDuration
  return tagsMatch && durationMatch
}

/**
 * Recherche par nom — c'est ici que l'ambiguïté entre recettes homonymes
 * (plusieurs "Pâte carbonara" aux ingrédients différents) est détectée,
 * plutôt que résolue en silence par un tri de pertinence.
 */
function findByName(tokens: string[]): Recipe[] {
  return MOCK_RECIPES.filter((r) => {
    const nameTokens = tokenize(r.name)
    return nameTokens.some((nt) => tokens.includes(nt))
  })
}

function groupByExactName(recipes: Recipe[]): Recipe[][] {
  const groups = new Map<string, Recipe[]>()
  for (const r of recipes) {
    const group = groups.get(r.name) ?? []
    group.push(r)
    groups.set(r.name, group)
  }
  return [...groups.values()]
}

function pickBest(recipes: Recipe[]): Recipe {
  return [...recipes].sort((a, b) => b.rating - a.rating)[0]
}

function topSignal(recipe: Recipe): string | undefined {
  return [...recipe.communitySignals].sort((a, b) => b.agreeCount - a.agreeCount)[0]?.text
}

/**
 * Aucune recette ne correspond à l'ensemble des contraintes cumulées :
 * identifie LA contrainte qui bloque en essayant de la relâcher une par une
 * — jamais un simple "aucun résultat" (brief §6 parcours A, §10, cas dégradés §07).
 */
function findBlockingConstraint(
  tags: ActiveConstraint[],
  maxDuration: number | undefined,
): { label: string; relaxed: Recipe[] } | undefined {
  const tagNames = tags.map((t) => t.tag)

  for (let i = 0; i < tagNames.length; i++) {
    const withoutOne = tagNames.filter((_, idx) => idx !== i)
    const relaxed = MOCK_RECIPES.filter((r) => matchesConstraints(r, withoutOne, maxDuration))
    if (relaxed.length > 0) {
      return { label: tags[i].label, relaxed }
    }
  }

  if (maxDuration !== undefined) {
    const withoutTime = MOCK_RECIPES.filter((r) => matchesConstraints(r, tagNames, undefined))
    if (withoutTime.length > 0) {
      const minDuration = Math.min(...withoutTime.map((r) => r.duration))
      return { label: `${maxDuration} min`, relaxed: withoutTime.filter((r) => r.duration <= minDuration) }
    }
  }

  return undefined
}

/**
 * Cœur du matching par contrainte, partagé entre la première requête
 * (interpretMessage) et l'affinage multi-tours (refineSearch) — même logique,
 * juste un jeu de contraintes déjà fusionné en entrée.
 */
export function resolveByConstraints(tags: ActiveConstraint[], maxDuration: number | undefined): Interpretation {
  const matches = MOCK_RECIPES.filter((r) => matchesConstraints(r, tags.map((t) => t.tag), maxDuration))

  if (matches.length > 0) {
    const recipe = pickBest(matches)
    return {
      intent: 'recipe-single',
      contextSentence: `Une recette à ${recipe.rating}★ colle pile : ${recipe.reviewCount} personnes l’ont commentée.`,
      recipe,
      citedSignal: topSignal(recipe),
      activeTags: tags,
      activeMaxDuration: maxDuration,
    }
  }

  const blocking = findBlockingConstraint(tags, maxDuration)
  if (blocking) {
    const example = pickBest(blocking.relaxed)
    return {
      intent: 'zero-match',
      contextSentence: `Avec toutes ces contraintes à la fois, je ne trouve rien de bien noté. Le point qui bloque, c’est « ${blocking.label} ». Si on le relâche, j’ai ${blocking.relaxed.length} recette${blocking.relaxed.length > 1 ? 's' : ''} à ${example.rating}★ qui coche${blocking.relaxed.length > 1 ? 'nt' : ''} tout le reste.`,
      blockingConstraintLabel: blocking.label,
      relaxedRecipes: blocking.relaxed,
      activeTags: tags,
      activeMaxDuration: maxDuration,
    }
  }

  return {
    intent: 'zero-match',
    contextSentence: 'Aucune recette ne correspond, même en relâchant une contrainte à la fois. Dites-m’en un peu plus ?',
    activeTags: tags,
    activeMaxDuration: maxDuration,
  }
}

/** Construit directement un résultat "recipe-single" pour une recette déjà choisie (désambiguïsation, relâchement de contrainte) — sans repasser par interpretMessage. */
export function presentRecipe(recipe: Recipe, activeTags: ActiveConstraint[] = [], activeMaxDuration?: number): Interpretation {
  return {
    intent: 'recipe-single',
    contextSentence: `Voici « ${recipe.name} », ${recipe.rating}★ (${recipe.reviewCount} avis).`,
    recipe,
    citedSignal: topSignal(recipe),
    activeTags,
    activeMaxDuration,
  }
}

/** Construit un résultat "disambiguation" pour un ensemble de recettes déjà déterminé (ex. relâchement de contrainte qui laisse plusieurs candidats). */
export function presentChoice(recipes: Recipe[], activeTags: ActiveConstraint[] = [], activeMaxDuration?: number): Interpretation {
  return {
    intent: 'disambiguation',
    contextSentence: `Voici ${recipes.length} recettes qui correspondent :`,
    disambiguationCandidates: recipes,
    activeTags,
    activeMaxDuration,
  }
}

export function interpretMessage(text: string): Interpretation {
  const normalized = normalize(text)
  const tokens = tokenize(text)

  if (includesAny(normalized, OFFTOPIC_KEYWORDS)) {
    return {
      intent: 'offtopic',
      contextSentence: 'Je suis là pour vos repas et vos courses — je ne peux pas vous aider sur ce sujet.',
      activeTags: [],
    }
  }

  if (includesAny(normalized, CART_KEYWORDS)) {
    return { intent: 'cart', contextSentence: 'Voici votre panier.', activeTags: [] }
  }

  if (includesAny(normalized, LIST_KEYWORDS)) {
    const products = MOCK_PRODUCTS.filter((p) => p.available).slice(0, 4)
    return { intent: 'shopping-list', contextSentence: 'Voici une liste de courses de base.', products, activeTags: [] }
  }

  const constraintTags = extractConstraintTags(normalized)
  const timeConstraint = extractTimeConstraint(normalized)

  // La recherche par contrainte a priorité sur la recherche par nom : un
  // message qui décrit des besoins (régime, temps) doit être évalué sur ses
  // contraintes réelles, même si son vocabulaire recoupe par hasard le nom
  // d'une recette (ex. "sans gluten" ne doit pas matcher directement "Buddha
  // bowl végétarien sans gluten" sans vérifier sa durée — bug trouvé en test
  // manuel). La recherche par nom ("une carbonara") reste le fallback quand
  // aucune contrainte n'est détectée dans le message.
  if (constraintTags.length === 0 && timeConstraint === undefined) {
    const nameMatches = findByName(tokens)
    if (nameMatches.length > 0) {
      const groups = groupByExactName(nameMatches)
      const biggestGroup = groups.sort((a, b) => b.length - a.length)[0]
      if (biggestGroup.length > 1) {
        return {
          intent: 'disambiguation',
          contextSentence: `Il existe ${biggestGroup.length} recettes « ${biggestGroup[0].name} » assez différentes — laquelle vous correspond ?`,
          disambiguationCandidates: biggestGroup,
          activeTags: [],
        }
      }
      const recipe = biggestGroup[0]
      return {
        intent: 'recipe-single',
        contextSentence: `Voici « ${recipe.name} », ${recipe.rating}★ (${recipe.reviewCount} avis).`,
        recipe,
        citedSignal: topSignal(recipe),
        activeTags: [],
      }
    }
  }

  if (constraintTags.length > 0 || timeConstraint !== undefined) {
    return resolveByConstraints(constraintTags, timeConstraint)
  }

  return {
    intent: 'unknown',
    contextSentence: 'Pas de souci, on va trouver ensemble. Dites-moi juste une chose : combien de temps vous avez ce soir, ou ce qu’il reste dans le frigo ?',
    activeTags: [],
  }
}

/**
 * Affinage multi-tours : "poulet 20 min enfants" puis "et sans lactose ?"
 * doit affiner la MÊME recherche, pas repartir de zéro — c'est la différence
 * entre une conversation réelle et une suite de requêtes isolées. Fusionne
 * les nouvelles contraintes du message avec celles déjà actives.
 */
export function refineSearch(text: string, priorTags: ActiveConstraint[], priorMaxDuration?: number): Interpretation {
  const normalized = normalize(text)

  const newTags = extractConstraintTags(normalized)
  const newDuration = extractTimeConstraint(normalized)

  const mergedTags = [...priorTags]
  for (const t of newTags) {
    if (!mergedTags.some((existing) => existing.tag === t.tag)) mergedTags.push(t)
  }

  const mergedDuration =
    newDuration !== undefined && priorMaxDuration !== undefined
      ? Math.min(newDuration, priorMaxDuration)
      : newDuration ?? priorMaxDuration

  return resolveByConstraints(mergedTags, mergedDuration)
}

/**
 * Applique la mémoire de session (contraintes apprises sur d'autres pages/
 * visites précédentes) à un résultat déjà obtenu — ex. une recherche par nom
 * ("une carbonara") garde son résultat de désambiguïsation intact ; seul un
 * résultat déjà basé sur des contraintes se voit enrichi par la mémoire.
 * Ne modifie rien si la mémoire n'apporte rien de nouveau (évite un
 * recalcul et un re-render inutiles).
 */
export function applyMemory(base: Interpretation, memoryTags: ActiveConstraint[], memoryMaxDuration?: number): Interpretation {
  if (base.intent !== 'recipe-single' && base.intent !== 'zero-match') return base

  const mergedTags = [...base.activeTags]
  for (const t of memoryTags) {
    if (!mergedTags.some((existing) => existing.tag === t.tag)) mergedTags.push(t)
  }
  const mergedDuration =
    memoryMaxDuration !== undefined && base.activeMaxDuration !== undefined
      ? Math.min(memoryMaxDuration, base.activeMaxDuration)
      : memoryMaxDuration ?? base.activeMaxDuration

  const nothingNew = mergedTags.length === base.activeTags.length && mergedDuration === base.activeMaxDuration
  if (nothingNew) return base

  return resolveByConstraints(mergedTags, mergedDuration)
}

// ─── Micro-conversation sur la fiche recette (swap d'ingrédient) ──────────

export interface IngredientAnswer {
  understood: boolean
  /** Id exact de l'ingrédient identifié — pour annoter la bonne ligne dans l'UI sans re-matcher un texte normalisé contre un nom accentué (bug trouvé en test manuel). */
  ingredientId?: string
  ingredientQuery?: string
  suggestion?: string
  sourceNote?: string
}

/** Substituts connus, y compris des références croisées vers d'autres recettes du catalogue. */
const KNOWN_SUBSTITUTES: { match: string; suggestion: string; note?: string }[] = [
  {
    match: 'creme fraiche',
    suggestion: 'un verre d’eau de cuisson des pâtes, hors du feu',
    note: 'C’est la technique de la version « à la romaine » de cette recette — elle n’utilise pas de crème du tout.',
  },
  { match: 'lardons', suggestion: 'des dés de jambon, ou des lardons de dinde' },
  { match: 'parmesan', suggestion: 'de l’emmental ou du comté râpé' },
  { match: 'champignons', suggestion: 'des courgettes ou des poivrons émincés' },
  { match: 'beurre', suggestion: 'un filet d’huile neutre' },
]

/**
 * Comprend une question libre sur un ingrédient de LA recette affichée
 * ("je n'ai pas de crème, je fais quoi ?") et répond en s'appuyant sur le
 * catalogue (ex. la technique d'une variante voisine) plutôt qu'une réponse
 * générique — c'est ce qu'un simple bouton "remplacer" ne peut pas faire.
 */
export function interpretIngredientQuestion(text: string, recipe: Recipe): IngredientAnswer {
  const normalized = normalize(text)
  const ingredients = fullIngredientList(recipe)

  const found = ingredients.find((ing) => {
    const normalizedName = normalize(ing.name)
    const significantWords = normalizedName.split(' ').filter((w) => w.length > 3)
    return significantWords.some((w) => normalized.includes(w))
  })

  if (!found) {
    return { understood: false }
  }

  const normalizedFoundName = normalize(found.name)
  const known = KNOWN_SUBSTITUTES.find((s) => normalizedFoundName.includes(s.match))
  if (known) {
    return { understood: true, ingredientId: found.id, ingredientQuery: found.name, suggestion: known.suggestion, sourceNote: known.note }
  }

  return { understood: true, ingredientId: found.id, ingredientQuery: found.name }
}
