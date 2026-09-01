import { describe, it, expect } from 'vitest'
import { buildRecipeChips, answerRecipeAsk } from './recipeAskScript'
import { EMPTY_SLOTS } from './agentScript'
import type { Recipe } from '../data/types/recipe'

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
  it("confirme la contrainte quand le tag de la recette la couvre, et fond l'avis correspondant dans la même phrase", () => {
    const recipe = makeRecipe({
      tags: ['vegetarien'],
      reviews: [{ text: 'La ricotta remplace bien la viande.', tag: 'vegetarien' }],
    })
    const { answer } = answerRecipeAsk(recipe, 'Une alternative végétarienne ?', EMPTY_SLOTS)
    expect(answer.message).toBe(
      "Oui, cette recette est végétarienne : d'après les avis, « La ricotta remplace bien la viande. »"
    )
  })

  it("confirme la contrainte sans mention d'avis quand aucun avis ne porte ce tag", () => {
    const recipe = makeRecipe({ tags: ['vegetarien'], reviews: [] })
    const { answer } = answerRecipeAsk(recipe, 'Une alternative végétarienne ?', EMPTY_SLOTS)
    expect(answer.message).toBe('Oui, cette recette est végétarienne.')
  })

  it("indique que la contrainte n'est pas couverte quand le tag est absent de la recette", () => {
    const recipe = makeRecipe({ tags: [] })
    const { answer } = answerRecipeAsk(recipe, 'Une version sans gluten ?', EMPTY_SLOTS)
    expect(answer.message).toBe("Cette recette n'est pas signalée comme sans gluten.")
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

  it('fond l\'avis tagué time dans le message quand la question porte sur la rapidité, quelle que soit la durée réelle', () => {
    const recipe = makeRecipe({
      duration: 90,
      reviews: [{ text: '90 minutes au four, mais 10 minutes de préparation seulement.', tag: 'time' }],
    })
    const { answer } = answerRecipeAsk(recipe, "C'est rapide à faire ?", EMPTY_SLOTS)
    expect(answer.message).toBe("D'après les avis, « 90 minutes au four, mais 10 minutes de préparation seulement. »")
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
    expect(second.slots.constraints).toEqual(['vegetarien'])
  })

  it("ne répète pas le message de contrainte (avis inclus) au tour suivant du même fil", () => {
    const recipe = makeRecipe({
      tags: ['vegetarien'],
      reviews: [{ text: 'La ricotta remplace bien la viande.', tag: 'vegetarien' }],
    })
    const first = answerRecipeAsk(recipe, 'Une alternative végétarienne ?', EMPTY_SLOTS)
    const second = answerRecipeAsk(recipe, "j'ai du poulet", first.slots)
    expect(second.answer.message).toBe('Voici ce que je peux vous dire sur cette recette.')
  })

  it("ne répète pas l'astuce anti-échec au tour suivant du même fil", () => {
    const recipe = makeRecipe({ tip: 'Ajoutez le jus de citron hors du feu.' })
    const first = answerRecipeAsk(recipe, 'une question sans rapport', EMPTY_SLOTS)
    expect(first.answer.tip).toBe('Ajoutez le jus de citron hors du feu.')
    const second = answerRecipeAsk(recipe, 'une autre question sans rapport', first.slots)
    expect(second.answer.tip).toBeUndefined()
  })

  it("suggère un substitut quand l'équipement demandé est requis et connu", () => {
    const recipe = makeRecipe({ equipment: ['four'] })
    const { answer } = answerRecipeAsk(recipe, "j'ai pas de four, je peux utiliser quoi à la place ?", EMPTY_SLOTS)
    expect(answer.equipmentNote).toBe(
      'Pas de souci, vous pouvez remplacer le four par une poêle avec couvercle, à feu doux, en surveillant la cuisson.'
    )
    expect(answer.message).toBe('Voici ce que je peux vous dire sur cette recette.')
  })

  it("indique que l'équipement demandé n'est pas nécessaire quand la recette ne le requiert pas", () => {
    const recipe = makeRecipe({ equipment: ['four'] })
    const { answer } = answerRecipeAsk(recipe, "je n'ai pas de robot, ça marche quand même ?", EMPTY_SLOTS)
    expect(answer.equipmentNote).toBe('Cette recette ne nécessite pas de robot.')
  })

  it("indique qu'aucun équipement n'est requis quand la recette n'en déclare aucun", () => {
    const recipe = makeRecipe({ equipment: [] })
    const { answer } = answerRecipeAsk(recipe, "j'ai pas de four, je fais comment ?", EMPTY_SLOTS)
    expect(answer.equipmentNote).toBe('Cette recette ne nécessite pas de four.')
  })

  it("ne détecte pas de question d'équipement dans une question sans rapport", () => {
    const recipe = makeRecipe({ equipment: ['four'] })
    const { answer } = answerRecipeAsk(recipe, 'bonjour', EMPTY_SLOTS)
    expect(answer.equipmentNote).toBeUndefined()
  })

  it("suggère un substitut d'ingrédient connu quand on demande une alternative", () => {
    const recipe = makeRecipe({
      ingredients: [{ id: 'i1', name: 'Ricotta', quantity: 250, unit: 'g', emoji: '🧀', productId: 'p1' }],
    })
    const { answer } = answerRecipeAsk(recipe, "j'ai pas de ricotta, je remplace par quoi ?", EMPTY_SLOTS)
    expect(answer.ingredientSubstituteNote).toBe(
      'Pas de souci, vous pouvez remplacer ricotta par du mascarpone ou du fromage frais épais.'
    )
  })

  it("reconnaît une demande de substitution conjuguée (\"je remplace\")", () => {
    const recipe = makeRecipe({
      ingredients: [{ id: 'i1', name: 'Parmesan râpé', quantity: 50, unit: 'g', emoji: '🧀', productId: 'p1' }],
    })
    const { answer } = answerRecipeAsk(recipe, 'je remplace le parmesan par quoi ?', EMPTY_SLOTS)
    expect(answer.ingredientSubstituteNote).toBe('Pas de souci, vous pouvez remplacer parmesan râpé par du gruyère râpé.')
  })

  it("propose une réponse neutre quand l'ingrédient demandé n'a pas de substitut connu", () => {
    const recipe = makeRecipe({
      ingredients: [{ id: 'i1', name: 'Courgettes', quantity: 3, unit: 'pièces', emoji: '🥒', productId: 'p1' }],
    })
    const { answer } = answerRecipeAsk(recipe, 'je remplace les courgettes par quoi ?', EMPTY_SLOTS)
    expect(answer.ingredientSubstituteNote).toBe(
      "Je n'ai pas de suggestion précise pour remplacer courgettes, mais vous pouvez tenter une texture ou un goût similaire."
    )
  })

  it("avertit et suggère un substitut quand un ingrédient évité par goût est présent dans la recette", () => {
    const recipe = makeRecipe({
      ingredients: [{ id: 'i1', name: 'Ricotta', quantity: 250, unit: 'g', emoji: '🧀', productId: 'p1' }],
    })
    const { answer } = answerRecipeAsk(recipe, "j'aime pas la ricotta", EMPTY_SLOTS)
    expect(answer.avoidedIngredientNote).toBe(
      'Cette recette contient ricotta, que vous évitez : vous pouvez le remplacer par du mascarpone ou du fromage frais épais.'
    )
  })

  it("avertit sans substitut quand l'ingrédient évité n'a pas d'alternative connue", () => {
    const recipe = makeRecipe({
      ingredients: [{ id: 'i1', name: 'Escalopes de poulet', quantity: 4, unit: 'pièces', emoji: '🍗', productId: 'p1' }],
    })
    const { answer } = answerRecipeAsk(recipe, "j'aime pas le poulet", EMPTY_SLOTS)
    expect(answer.avoidedIngredientNote).toBe('Cette recette contient escalopes de poulet, que vous évitez.')
  })

  it("ne signale rien quand l'ingrédient évité n'est pas dans la recette", () => {
    const recipe = makeRecipe({
      ingredients: [{ id: 'i1', name: 'Ricotta', quantity: 250, unit: 'g', emoji: '🧀', productId: 'p1' }],
    })
    const { answer } = answerRecipeAsk(recipe, "j'aime pas le poulet", EMPTY_SLOTS)
    expect(answer.avoidedIngredientNote).toBeUndefined()
  })

  it('répond au budget quand la question porte sur le prix', () => {
    const recipe = makeRecipe({ estimatedPricePerServing: 3.25 })
    const { answer } = answerRecipeAsk(recipe, "c'est cher ?", EMPTY_SLOTS)
    expect(answer.budgetNote).toBe('Cette recette coûte environ 3,25 € par personne.')
  })

  it('ne répète pas la réponse budget au tour suivant du même fil', () => {
    const recipe = makeRecipe({ estimatedPricePerServing: 3.25 })
    const first = answerRecipeAsk(recipe, "c'est cher ?", EMPTY_SLOTS)
    expect(first.answer.budgetNote).toBeDefined()
    const second = answerRecipeAsk(recipe, 'et sinon niveau temps ?', first.slots)
    expect(second.answer.budgetNote).toBeUndefined()
  })

  it("suggère un substitut pour un œuf même si l'utilisateur tape « oeuf » sans ligature", () => {
    const recipe = makeRecipe({
      ingredients: [{ id: 'i1', name: 'Œufs', quantity: 3, unit: 'pièces', emoji: '🥚', productId: 'p1' }],
    })
    const { answer } = answerRecipeAsk(recipe, "j'ai pas d'oeufs, je remplace par quoi ?", EMPTY_SLOTS)
    expect(answer.ingredientSubstituteNote).toBe(
      "Pas de souci, vous pouvez remplacer œufs par de l'aquafaba (l'eau de cuisson des pois chiches), environ 3 c. à soupe par œuf."
    )
  })

  it("ne répète pas l'avertissement pour un ingrédient déjà signalé, mais avertit pour un nouvel ingrédient évité au tour suivant", () => {
    const recipe = makeRecipe({
      ingredients: [
        { id: 'i1', name: 'Ricotta', quantity: 250, unit: 'g', emoji: '🧀', productId: 'p1' },
        { id: 'i2', name: 'Escalopes de poulet', quantity: 4, unit: 'pièces', emoji: '🍗', productId: 'p2' },
      ],
    })
    const first = answerRecipeAsk(recipe, "j'aime pas la ricotta", EMPTY_SLOTS)
    expect(first.answer.avoidedIngredientNote).toBeDefined()
    const second = answerRecipeAsk(recipe, "j'aime pas le poulet", first.slots)
    expect(second.answer.avoidedIngredientNote).toBe('Cette recette contient escalopes de poulet, que vous évitez.')
  })

  it("ne double-affiche pas la substitution et l'évitement pour le même ingrédient dans la même question", () => {
    const recipe = makeRecipe({
      ingredients: [{ id: 'i1', name: 'Lardons fumés', quantity: 200, unit: 'g', emoji: '🥓', productId: 'p1' }],
    })
    const { answer } = answerRecipeAsk(recipe, "j'aime pas les lardons, je remplace par quoi ?", EMPTY_SLOTS)
    expect(answer.avoidedIngredientNote).toBeDefined()
    expect(answer.ingredientSubstituteNote).toBeUndefined()
  })

  it('confirme plusieurs contraintes nouvellement mentionnées dans le même tour', () => {
    const recipe = makeRecipe({ tags: ['vegetarien'] })
    const { answer } = answerRecipeAsk(recipe, 'Un plat végétarien et sans gluten ?', EMPTY_SLOTS)
    expect(answer.message).toBe(
      "Oui, cette recette est végétarienne. Cette recette n'est pas signalée comme sans gluten."
    )
  })

  it("accuse réception d'une contrainte retirée entre deux tours", () => {
    const recipe = makeRecipe({ tags: [] })
    const first = answerRecipeAsk(recipe, 'Une version sans gluten ?', EMPTY_SLOTS)
    expect(first.slots.constraints).toEqual(['sans-gluten'])
    const second = answerRecipeAsk(recipe, 'en fait peu importe le sans gluten', first.slots)
    expect(second.slots.constraints).toEqual([])
    expect(second.answer.message).toBe("D'accord, je ne tiens plus compte de : sans gluten.")
  })

  it("accuse réception d'un ingrédient retiré entre deux tours", () => {
    const recipe = makeRecipe({ ingredients: [] })
    const first = answerRecipeAsk(recipe, "j'ai du poulet", EMPTY_SLOTS)
    expect(first.slots.ingredients).toEqual(['poulet'])
    const second = answerRecipeAsk(recipe, 'finalement pas de poulet', first.slots)
    expect(second.slots.ingredients).toEqual([])
    expect(second.answer.message).toBe("D'accord, je ne tiens plus compte de : poulet.")
  })

  it('accuse réception dans un seul message quand contrainte et ingrédient sont retirés ensemble', () => {
    const recipe = makeRecipe({ tags: [], ingredients: [] })
    const first = answerRecipeAsk(recipe, 'sans gluten, avec du poulet', EMPTY_SLOTS)
    expect(first.slots.constraints).toEqual(['sans-gluten'])
    expect(first.slots.ingredients).toEqual(['poulet'])
    const second = answerRecipeAsk(recipe, 'en fait oublie le sans gluten et le poulet', first.slots)
    expect(second.answer.message).toBe("D'accord, je ne tiens plus compte de : sans gluten et poulet.")
  })

  it("utilise le label neutre (pas la forme accordée) dans l'accusé de retrait, pour une contrainte où les deux diffèrent", () => {
    const recipe = makeRecipe({ tags: [] })
    const first = answerRecipeAsk(recipe, 'pour un enfant', EMPTY_SLOTS)
    expect(first.slots.constraints).toEqual(['enfant'])
    const second = answerRecipeAsk(recipe, 'finalement pas pour un enfant', first.slots)
    expect(second.answer.message).toBe("D'accord, je ne tiens plus compte de : adapté aux enfants.")
  })

  it("ne fait rien de visible quand le retrait n'a pas de mot-clé identifiable", () => {
    const recipe = makeRecipe({ tags: ['vegetarien'] })
    const first = answerRecipeAsk(recipe, 'Une alternative végétarienne ?', EMPTY_SLOTS)
    const second = answerRecipeAsk(recipe, 'en fait peu importe', first.slots)
    expect(second.slots.constraints).toEqual(['vegetarien'])
    expect(second.answer.message).toBe('Voici ce que je peux vous dire sur cette recette.')
  })

  it("exclut allergie de l'accusé de retrait (jamais de phrase RELAXED_REASON cassée)", () => {
    const recipe = makeRecipe({ allergens: ['Arachides'] })
    const first = answerRecipeAsk(recipe, "j'ai une allergie", EMPTY_SLOTS)
    expect(first.slots.constraints).toEqual(['allergie'])
    const second = answerRecipeAsk(recipe, `en fait peu importe l${String.fromCharCode(0x2019)}allergie`, first.slots)
    expect(second.slots.constraints).toEqual([])
    expect(second.answer.message).not.toContain('allerg')
    expect(second.answer.message).toBe('Voici ce que je peux vous dire sur cette recette.')
  })
})
