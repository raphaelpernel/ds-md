import type { Recipe, RecipeIngredient } from '../data/types/recipe'

/**
 * Ingrédients de garde-manger courants qu'un filtre "moins de 30 min" ne lit
 * jamais dans les étapes — c'est précisément le point où l'agent lit les
 * étapes et un filtre classique ne le fait pas (brief §6 parcours E, §10).
 */
const PANTRY_KEYWORDS: { match: string; name: string; emoji: string; unit: string; quantityLabel: number; productId: string }[] = [
  { match: 'huile d’olive', name: 'huile d’olive', emoji: '🫒', unit: 'filet', quantityLabel: 1, productId: 'prod-huile' },
  { match: 'huile d\'olive', name: 'huile d’olive', emoji: '🫒', unit: 'filet', quantityLabel: 1, productId: 'prod-huile' },
]

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

/**
 * Détecte les ingrédients mentionnés dans les étapes mais absents de la
 * liste d'ingrédients listée — l'incohérence que l'agent doit attraper.
 * Retourne des entrées synthétiques marquées `missingFromList`.
 */
export function detectMissingIngredients(recipe: Recipe): RecipeIngredient[] {
  const stepsText = normalize(recipe.steps.join(' '))
  const listedNames = recipe.ingredients.map((i) => normalize(i.name))

  const found: RecipeIngredient[] = []
  const seen = new Set<string>()

  for (const pantryItem of PANTRY_KEYWORDS) {
    const normalizedMatch = normalize(pantryItem.match)
    const alreadyListed = listedNames.some((name) => name.includes(normalizedMatch) || normalizedMatch.includes(name))
    if (alreadyListed || seen.has(pantryItem.name)) continue
    if (stepsText.includes(normalizedMatch)) {
      seen.add(pantryItem.name)
      found.push({
        id: `missing-${pantryItem.name}`,
        name: pantryItem.name,
        quantity: pantryItem.quantityLabel,
        unit: pantryItem.unit,
        emoji: pantryItem.emoji,
        productId: pantryItem.productId,
        missingFromList: true,
      })
    }
  }

  return found
}

/** Liste d'ingrédients complète (déclarés + détectés dans les étapes mais absents de la liste). */
export function fullIngredientList(recipe: Recipe): RecipeIngredient[] {
  return [...recipe.ingredients, ...detectMissingIngredients(recipe)]
}
