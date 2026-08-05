import { describe, it, expect } from 'vitest'
import { buildRecipeChips, answerRecipeAsk } from '../recipeAskScript'
import { EMPTY_SLOTS } from '../agentScript'
import type { Recipe } from '../../data/types/recipe'

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 'r-test',
    name: 'Recette test',
    imageUrl: '',
    servings: 4,
    duration: 20,
    ingredients: [],
    estimatedPricePerServing: 0,
    tags: [],
    ...overrides,
  }
}

describe('buildRecipeChips', () => {
  it("retourne un tableau vide quand la recette n'a pas d'avis", () => {
    expect(buildRecipeChips(makeRecipe())).toEqual([])
  })

  it("retourne un chip par tag distinct présent dans les avis, dans l'ordre canonique", () => {
    const recipe = makeRecipe({
      reviews: [
        { text: 'a', tag: 'time' },
        { text: 'b', tag: 'enfant' },
        { text: 'c', tag: 'sans-sauce' },
      ],
    })
    const chips = buildRecipeChips(recipe)
    expect(chips.map((c) => c.tag)).toEqual(['enfant', 'sans-sauce', 'time'])
  })

  it('déduplique les tags répétés sur plusieurs avis', () => {
    const recipe = makeRecipe({
      reviews: [
        { text: 'a', tag: 'enfant' },
        { text: 'b', tag: 'enfant' },
      ],
    })
    expect(buildRecipeChips(recipe)).toHaveLength(1)
  })

  it('plafonne à 3 chips même si plus de tags distincts sont présents', () => {
    const recipe = makeRecipe({
      reviews: [
        { text: 'a', tag: 'enfant' },
        { text: 'b', tag: 'sans-sauce' },
        { text: 'c', tag: 'vegetarien' },
        { text: 'd', tag: 'sans-gluten' },
      ],
    })
    const chips = buildRecipeChips(recipe)
    expect(chips).toHaveLength(3)
    expect(chips.map((c) => c.tag)).toEqual(['enfant', 'sans-sauce', 'vegetarien'])
  })

  it('chaque chip porte un label affichable et un texte de requête distincts', () => {
    const recipe = makeRecipe({ reviews: [{ text: 'a', tag: 'sans-lactose' }] })
    const [chip] = buildRecipeChips(recipe)
    expect(chip.label).toBe('Sans lactose ?')
    expect(chip.text).toBe('Une version sans lactose ?')
  })
})

describe('answerRecipeAsk', () => {
  it("confirme la contrainte quand le tag de la recette la couvre, et remonte l'avis correspondant", () => {
    const recipe = makeRecipe({
      tags: ['vegetarien'],
      reviews: [{ text: 'La ricotta remplace bien la viande.', tag: 'vegetarien' }],
    })
    const { answer } = answerRecipeAsk(recipe, 'Une alternative végétarienne ?', EMPTY_SLOTS)
    expect(answer.message).toBe('Oui, cette recette est végétarienne.')
    expect(answer.constraintLabel).toBe('Végétarien')
    expect(answer.communityQuote).toEqual({ text: 'La ricotta remplace bien la viande.' })
  })

  it("indique que la contrainte n'est pas couverte quand le tag est absent de la recette", () => {
    const recipe = makeRecipe({ tags: [] })
    const { answer } = answerRecipeAsk(recipe, 'Une version sans gluten ?', EMPTY_SLOTS)
    expect(answer.message).toBe("Cette recette n'est pas signalée comme sans gluten.")
    expect(answer.constraintLabel).toBeUndefined()
    expect(answer.communityQuote).toBeUndefined()
  })

  it("liste les allergènes déclarés quand la question porte sur une allergie", () => {
    const recipe = makeRecipe({ allergens: ['Lait', 'Œufs'] })
    const { answer } = answerRecipeAsk(recipe, "j'ai une allergie", EMPTY_SLOTS)
    expect(answer.message).toBe('Cette recette contient : lait, œufs.')
    expect(answer.allergens).toEqual(['Lait', 'Œufs'])
  })

  it("signale l'absence d'allergène déclaré quand la liste est vide", () => {
    const recipe = makeRecipe({ allergens: [] })
    const { answer } = answerRecipeAsk(recipe, 'il y a une allergie chez nous', EMPTY_SLOTS)
    expect(answer.message).toBe("Aucun allergène n'est signalé pour cette recette.")
  })

  it('remonte l\'avis tagué time quand la question porte sur la rapidité, quelle que soit la durée réelle', () => {
    const recipe = makeRecipe({
      duration: 90,
      reviews: [{ text: '90 minutes au four, mais 10 minutes de préparation seulement.', tag: 'time' }],
    })
    const { answer } = answerRecipeAsk(recipe, "C'est rapide à faire ?", EMPTY_SLOTS)
    expect(answer.communityQuote).toEqual({ text: '90 minutes au four, mais 10 minutes de préparation seulement.' })
  })

  it("retourne l'écart panier quand des ingrédients sont mentionnés dans la question", () => {
    const recipe = makeRecipe({
      ingredients: [
        { id: 'i1', name: 'Poulet', quantity: 1, unit: 'pièce', emoji: '🍗', productId: 'p1' },
        { id: 'i2', name: 'Citron', quantity: 1, unit: 'pièce', emoji: '🍋', productId: 'p2' },
      ],
    })
    const { answer } = answerRecipeAsk(recipe, "j'ai déjà du poulet", EMPTY_SLOTS)
    expect(answer.pantryMatch).toEqual({ matchedIngredientNames: ['Poulet'], missingCount: 1 })
  })

  it("retourne l'astuce anti-échec de la recette quand elle existe", () => {
    const recipe = makeRecipe({ tip: 'Ajoutez le jus de citron hors du feu.' })
    const { answer } = answerRecipeAsk(recipe, 'une question sans rapport', EMPTY_SLOTS)
    expect(answer.tip).toBe('Ajoutez le jus de citron hors du feu.')
  })

  it("retourne un message générique quand rien n'est reconnu dans la question", () => {
    const recipe = makeRecipe()
    const { answer } = answerRecipeAsk(recipe, 'bonjour', EMPTY_SLOTS)
    expect(answer.message).toBe('Voici ce que je peux vous dire sur cette recette.')
  })

  it('conserve les slots précédents entre deux tours (contrainte posée puis ingrédient ajouté)', () => {
    const recipe = makeRecipe({ tags: ['vegetarien'] })
    const first = answerRecipeAsk(recipe, 'Une alternative végétarienne ?', EMPTY_SLOTS)
    const second = answerRecipeAsk(recipe, "j'ai du poulet", first.slots)
    expect(second.slots.constraint).toBe('vegetarien')
  })

  it("ne répète pas le message de contrainte ni l'avis communautaire au tour suivant du même fil", () => {
    const recipe = makeRecipe({
      tags: ['vegetarien'],
      reviews: [{ text: 'La ricotta remplace bien la viande.', tag: 'vegetarien' }],
    })
    const first = answerRecipeAsk(recipe, 'Une alternative végétarienne ?', EMPTY_SLOTS)
    const second = answerRecipeAsk(recipe, "j'ai du poulet", first.slots)
    expect(second.answer.message).toBe('Voici ce que je peux vous dire sur cette recette.')
    expect(second.answer.communityQuote).toBeUndefined()
  })

  it("ne répète pas l'astuce anti-échec au tour suivant du même fil", () => {
    const recipe = makeRecipe({ tip: 'Ajoutez le jus de citron hors du feu.' })
    const first = answerRecipeAsk(recipe, 'une question sans rapport', EMPTY_SLOTS)
    expect(first.answer.tip).toBe('Ajoutez le jus de citron hors du feu.')
    const second = answerRecipeAsk(recipe, 'une autre question sans rapport', first.slots)
    expect(second.answer.tip).toBeUndefined()
  })
})
