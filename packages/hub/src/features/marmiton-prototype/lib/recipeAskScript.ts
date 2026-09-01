import {
  extractSlots,
  selectTip,
  pantryMatch,
  avoidedIngredientMatch,
  constraintSatisfiedBy,
  CONSTRAINT_LABELS,
  RELAXED_REASON,
  joinList,
  EMPTY_SLOTS,
} from './agentScript'
import type { AgentSlots, Constraint, PantryMatch } from './agentScript'
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

/** Alias de reconnaissance entre les mots-clés de la question et `Recipe.equipment`. */
const EQUIPMENT_ALIASES: Record<string, string[]> = {
  four: ['four'],
  robot: ['robot'],
  mixeur: ['mixeur', 'mixer', 'blender'],
}

/** Substitut suggéré quand l'utilisateur n'a pas l'équipement demandé par la recette — pas de
 * garantie de résultat identique, juste une alternative plausible pour ne pas bloquer l'achat. */
const EQUIPMENT_SUBSTITUTES: Record<string, string> = {
  four: 'une poêle avec couvercle, à feu doux, en surveillant la cuisson',
  robot: 'un fouet ou une cuillère en bois, à la main',
  mixeur: 'une fourchette ou un presse-purée',
}

/** Déclencheur commun aux questions de substitution (équipement et ingrédient) — `remplac` sans
 * limite de mot en fin de motif pour couvrir "remplace"/"remplacer"/"remplacez", pas seulement
 * l'infinitif. */
const SUBSTITUTION_TRIGGER = /\b(pas de|sans|à la place|autre chose)\b|remplac/

/** Détecte une question du type « j'ai pas de four, je peux utiliser quoi à la place ? » —
 * retourne la clé d'équipement reconnue, ou `undefined` si la question n'en mentionne aucune. */
function detectEquipmentQuestion(text: string): string | undefined {
  const norm = normalize(text)
  if (!SUBSTITUTION_TRIGGER.test(norm)) return undefined
  for (const [key, aliases] of Object.entries(EQUIPMENT_ALIASES)) {
    if (aliases.some((alias) => norm.includes(normalize(alias)))) return key
  }
  return undefined
}

/** Substituts suggérés pour les ingrédients récurrents des recettes mock — même schéma que
 * `EQUIPMENT_SUBSTITUTES`, réutilisé à la fois pour "j'ai pas de X" (Task 4) et pour un ingrédient
 * évité par goût (`avoidedIngredientMatch`, Task 2). Clés normalisées (minuscules, sans accents). */
const INGREDIENT_SUBSTITUTES: Record<string, string> = {
  ricotta: 'du mascarpone ou du fromage frais épais',
  parmesan: 'du gruyère râpé',
  oeuf: "de l'aquafaba (l'eau de cuisson des pois chiches), environ 3 c. à soupe par œuf",
  lardons: 'des allumettes de dinde fumées',
}

function findIngredientSubstitute(ingredientName: string): string | undefined {
  const normName = normalize(ingredientName)
  const key = Object.keys(INGREDIENT_SUBSTITUTES).find((k) => normName.includes(k))
  return key ? INGREDIENT_SUBSTITUTES[key] : undefined
}

/** Détecte une question de substitution d'ingrédient — contrairement à l'équipement, pas de
 * vocabulaire fixe : chaque recette a ses propres ingrédients, donc la recherche se fait
 * dynamiquement dans `recipe.ingredients` de la recette affichée. */
function detectIngredientSubstitutionQuestion(recipe: Recipe, text: string): { name: string; substitute?: string } | undefined {
  const norm = normalize(text)
  if (!SUBSTITUTION_TRIGGER.test(norm)) return undefined
  for (const ingredient of recipe.ingredients) {
    const words = normalize(ingredient.name)
      .split(/[^a-zœ]+/)
      .filter((w) => w.length > 2)
    if (words.some((w) => norm.includes(w))) {
      return { name: ingredient.name, substitute: findIngredientSubstitute(ingredient.name) }
    }
  }
  return undefined
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/[‘’]/g, "'")
}

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
  allergens?: string[]
  /** Présent uniquement quand la question porte sur un équipement précis (four, robot…). */
  equipmentNote?: string
  /** Présent uniquement quand la question porte sur la substitution d'un ingrédient précis de cette recette. */
  ingredientSubstituteNote?: string
  /** Présent uniquement quand un ingrédient évité par goût (slots.avoidIngredients) est présent dans cette recette. */
  avoidedIngredientNote?: string
  /** Présent uniquement quand la question porte sur le prix de cette recette. */
  budgetNote?: string
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

  let allergens: string[] | undefined

  const newlyAddedConstraints = slots.constraints.filter((c) => !prevSlots.constraints.includes(c))

  // Allergie traitée à part : la question "sécurité alimentaire" a une réponse dédiée
  // (liste complète des allergènes), pas un simple oui/non de correspondance.
  if (newlyAddedConstraints.includes('allergie')) {
    allergens = recipe.allergens ?? []
    bits.push(
      allergens.length > 0
        ? `Cette recette contient : ${allergens.join(', ').toLowerCase()}.`
        : "Aucun allergène n'est signalé pour cette recette."
    )
  }

  // Une phrase de confirmation par contrainte nouvellement mentionnée ce tour (hors allergie,
  // traitée ci-dessus) — sinon le message rejouerait à chaque tour suivant du même fil, alors
  // que `slots.constraints` persiste via `extractSlots(text, prevSlots)`. L'avis communautaire
  // (s'il existe) est fondu dans la même phrase plutôt qu'affiché à part : dans un fil de chat
  // linéaire, un bandeau "Selon les avis" séparé + un chip dupliquant la même info que la
  // phrase n'apportent rien qu'une carte de recommandation scannée n'apporterait (retour
  // utilisateur du 2026-08-05) — une seule bulle de texte suffit.
  for (const constraint of newlyAddedConstraints) {
    if (constraint === 'allergie') continue
    if (constraintSatisfiedBy(recipe, constraint)) {
      const quote = constraint === 'debutant' || constraint === 'vegan' ? undefined : findRecipeReview(recipe, constraint)
      bits.push(
        quote
          ? `Oui, cette recette est ${RELAXED_REASON[constraint]} : d'après les avis, « ${quote.text} »`
          : `Oui, cette recette est ${RELAXED_REASON[constraint]}.`
      )
    } else {
      bits.push(`Cette recette n'est pas signalée comme ${RELAXED_REASON[constraint]}.`)
    }
  }

  // Accusé de retrait explicite : contrairement à /agent (moteur multi-recette, où le retrait
  // se reflète silencieusement dans la prochaine recommandation), ce drawer est un dialogue
  // direct sur une recette déjà affichée — un retrait silencieux serait déroutant ici.
  const retractedConstraints = prevSlots.constraints.filter(
    (c): c is Exclude<Constraint, 'allergie'> => c !== 'allergie' && !slots.constraints.includes(c)
  )
  const retractedIngredients = Array.from(new Set([...prevSlots.ingredients, ...prevSlots.avoidIngredients])).filter(
    (i) => !slots.ingredients.includes(i) && !slots.avoidIngredients.includes(i)
  )
  if (retractedConstraints.length > 0 || retractedIngredients.length > 0) {
    const labels = [
      ...retractedConstraints.map((c) => CONSTRAINT_LABELS[c].toLowerCase()),
      ...retractedIngredients,
    ]
    bits.push(`D'accord, je ne tiens plus compte de : ${joinList(labels)}.`)
  }

  if (bits.length === 0 && prevSlots.time === undefined && slots.time !== undefined) {
    const quote = findRecipeReview(recipe, 'time')
    if (quote) bits.push(`D'après les avis, « ${quote.text} »`)
  }

  let equipmentNote: string | undefined
  const askedEquipment = detectEquipmentQuestion(text)
  if (askedEquipment) {
    const required = recipe.equipment ?? []
    const needsIt = required.some((e) => normalize(e).includes(askedEquipment))
    if (needsIt) {
      const substitute = EQUIPMENT_SUBSTITUTES[askedEquipment]
      equipmentNote = substitute
        ? `Pas de souci, vous pouvez remplacer le ${askedEquipment} par ${substitute}.`
        : `Cette recette nécessite un ${askedEquipment}, je n'ai pas d'alternative à vous proposer pour l'instant.`
    } else {
      equipmentNote = `Cette recette ne nécessite pas de ${askedEquipment}.`
    }
  }

  let ingredientSubstituteNote: string | undefined
  const askedIngredient = detectIngredientSubstitutionQuestion(recipe, text)
  if (askedIngredient) {
    ingredientSubstituteNote = askedIngredient.substitute
      ? `Pas de souci, vous pouvez remplacer ${askedIngredient.name.toLowerCase()} par ${askedIngredient.substitute}.`
      : `Je n'ai pas de suggestion précise pour remplacer ${askedIngredient.name.toLowerCase()}, mais vous pouvez tenter une texture ou un goût similaire.`
  }

  let avoidedIngredientNote: string | undefined
  const newlyAvoided = slots.avoidIngredients.filter((k) => !prevSlots.avoidIngredients.includes(k))
  if (newlyAvoided.length > 0) {
    const avoided = avoidedIngredientMatch(recipe, { ...slots, avoidIngredients: newlyAvoided })
    if (avoided.length > 0) {
      const [name] = avoided
      const substitute = findIngredientSubstitute(name)
      avoidedIngredientNote = substitute
        ? `Cette recette contient ${name.toLowerCase()}, que vous évitez : vous pouvez le remplacer par ${substitute}.`
        : `Cette recette contient ${name.toLowerCase()}, que vous évitez.`
      // Un même ingrédient ne doit pas déclencher les deux bandeaux à la fois (ex. "j'aime pas
      // les lardons, je remplace par quoi ?" coche les deux détections) — le bandeau "évité"
      // est le plus riche des deux (avertissement + suggestion), il prime sur la substitution.
      if (askedIngredient && normalize(askedIngredient.name) === normalize(name)) {
        ingredientSubstituteNote = undefined
      }
    }
  }

  let budgetNote: string | undefined
  if (!prevSlots.budgetFocus && slots.budgetFocus) {
    budgetNote = `Cette recette coûte environ ${recipe.estimatedPricePerServing.toFixed(2).replace('.', ',')} € par personne.`
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
      allergens,
      equipmentNote,
      ingredientSubstituteNote,
      avoidedIngredientNote,
      budgetNote,
    },
  }
}
