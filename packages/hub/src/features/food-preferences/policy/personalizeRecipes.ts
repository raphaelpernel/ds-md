import type { FoodPreferenceProfile } from '../model/types'

export interface RecipePreferenceFacts {
  incompatibleDietIds: string[]
  incompatibleRestrictionIds: string[]
  ingredientIds: string[]
  cuisineId: string | null
  preparationMinutes: number
}

export interface PreferenceCandidate<T> {
  item: T
  facts: RecipePreferenceFacts
}

export type PersonalizationSurface = 'catalog' | 'planner'

function intersects(values: readonly string[], selected: readonly string[]): boolean {
  return values.some((value) => selected.includes(value))
}

function score(facts: RecipePreferenceFacts, profile: FoodPreferenceProfile, surface: PersonalizationSurface): number {
  let value = 0
  if (surface === 'catalog' && intersects(facts.incompatibleDietIds, profile.dietIds)) value -= 3
  if (facts.ingredientIds.some((id) => profile.avoidedIngredientIds.includes(id))) value -= 10
  if (facts.cuisineId && profile.cuisineIds.includes(facts.cuisineId)) value += 5
  if (profile.maxPreparationMinutes !== null && facts.preparationMinutes > profile.maxPreparationMinutes) value -= 2
  return value
}

export function personalizeRecipes<T>(
  candidates: readonly PreferenceCandidate<T>[],
  profile: FoodPreferenceProfile,
  surface: PersonalizationSurface,
): T[] {
  return candidates
    .map((candidate, index) => ({ candidate, index, score: score(candidate.facts, profile, surface) }))
    .filter(({ candidate }) => surface === 'catalog'
      || (!intersects(candidate.facts.incompatibleDietIds, profile.dietIds)
        && (profile.restrictions.status !== 'declared'
          || !intersects(candidate.facts.incompatibleRestrictionIds, profile.restrictions.ids))))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ candidate }) => candidate.item)
}
