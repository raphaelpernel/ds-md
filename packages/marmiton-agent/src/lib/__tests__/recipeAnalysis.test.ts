import { describe, it, expect } from 'vitest'
import { detectMissingIngredients, fullIngredientList } from '../recipeAnalysis'
import { MOCK_RECIPES } from '../../data/mock/recipes'

describe('detectMissingIngredients', () => {
  it('détecte l’huile d’olive mentionnée à l’étape 2 mais absente de la liste (carbonara-romaine)', () => {
    const recipe = MOCK_RECIPES.find((r) => r.id === 'carbonara-romaine')!
    const missing = detectMissingIngredients(recipe)
    expect(missing).toHaveLength(1)
    expect(missing[0].name).toBe('huile d’olive')
    expect(missing[0].missingFromList).toBe(true)
    expect(missing[0].productId).toBe('prod-huile')
  })

  it('ne signale rien pour une recette dont les ingrédients listés couvrent déjà les étapes', () => {
    const recipe = MOCK_RECIPES.find((r) => r.id === 'pancakes-moelleux')!
    expect(detectMissingIngredients(recipe)).toHaveLength(0)
  })

  it('ne détecte pas de doublon si le même ingrédient pantry apparaît dans plusieurs étapes', () => {
    // carbonara-romaine ne mentionne l'huile qu'une fois, mais la garde
    // (seen-set) protège contre une regression si plusieurs occurrences apparaissent.
    const recipe = MOCK_RECIPES.find((r) => r.id === 'carbonara-romaine')!
    const missing = detectMissingIngredients(recipe)
    const names = missing.map((m) => m.name)
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('fullIngredientList', () => {
  it('concatène les ingrédients déclarés et les ingrédients détectés manquants', () => {
    const recipe = MOCK_RECIPES.find((r) => r.id === 'carbonara-romaine')!
    const full = fullIngredientList(recipe)
    expect(full).toHaveLength(recipe.ingredients.length + 1)
    expect(full.some((i) => i.name === 'huile d’olive')).toBe(true)
  })
})
