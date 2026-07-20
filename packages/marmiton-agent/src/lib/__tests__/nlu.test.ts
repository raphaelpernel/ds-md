import { describe, it, expect } from 'vitest'
import { interpretMessage, refineSearch, interpretIngredientQuestion, applyMemory, presentRecipe } from '../nlu'
import { MOCK_RECIPES } from '../../data/mock/recipes'

describe('interpretMessage — désambiguïsation homonymes', () => {
  it('propose les 3 candidats "Pâte carbonara" quand le message nomme juste la recette', () => {
    const result = interpretMessage('une carbonara')
    expect(result.intent).toBe('disambiguation')
    expect(result.disambiguationCandidates).toHaveLength(3)
    expect(result.disambiguationCandidates?.every((r) => r.name === 'Pâte carbonara')).toBe(true)
  })

  it(
    // Régression : "sans gluten"/"sans lactose" recoupaient par hasard le nom
    // "Buddha bowl végétarien sans gluten" sur le mot-outil "sans" et
    // déclenchaient un faux positif de recherche par nom — trouvé en test
    // manuel (session /plan-eng-review du 2026-07-20).
    'ne confond pas une requête par contrainte avec une requête par nom sur un mot-outil commun',
    () => {
      const result = interpretMessage('sans gluten, sans lactose')
      expect(result.intent).not.toBe('disambiguation')
    },
  )
})

describe('interpretMessage — contraintes cumulées', () => {
  it('recommande une seule recette argumentée par un signal communautaire', () => {
    const result = interpretMessage('j’ai 20 min et des enfants difficiles')
    expect(result.intent).toBe('recipe-single')
    expect(result.recipe?.id).toBe('poulet-express-enfants')
    expect(result.citedSignal).toBeTruthy()
  })

  it(
    // Régression : ce message matchait "Buddha bowl végétarien sans gluten"
    // par le nom (mot-outil "sans" partagé) sans jamais vérifier sa durée
    // réelle (25 min > 15 min demandé) — trouvé en test manuel.
    'détecte zéro résultat quand la durée demandée est trop courte, plutôt que de matcher par hasard un nom de recette',
    () => {
      const result = interpretMessage('végétarien, sans gluten, sans lactose, prêt en 15 min')
      expect(result.intent).toBe('zero-match')
      expect(result.blockingConstraintLabel).toBe('15 min')
      expect(result.relaxedRecipes?.every((r) => r.tags.includes('vegetarien'))).toBe(true)
    },
  )

  it('identifie la contrainte la plus simple à relâcher quand plusieurs tags cumulés bloquent', () => {
    const result = interpretMessage('poulet, végétarien')
    // Aucune recette n'est à la fois poulet ET végétarien — zéro résultat attendu,
    // avec une contrainte nommée à relâcher plutôt qu'un blocage silencieux.
    expect(result.intent).toBe('zero-match')
    expect(result.blockingConstraintLabel).toBeTruthy()
  })
})

describe('refineSearch — conversation multi-tours', () => {
  it('affine la recherche précédente au lieu de repartir de zéro', () => {
    const first = interpretMessage('poulet, enfants')
    expect(first.intent).toBe('recipe-single')

    // Un deuxième tour qui ajoute une contrainte incompatible (poulet + végétarien)
    // doit repartir des tags déjà actifs, pas d'une recherche vierge.
    const second = refineSearch('et végétarien ?', first.activeTags, first.activeMaxDuration)
    expect(second.activeTags.map((t) => t.tag).sort()).toEqual(['enfants', 'poulet', 'vegetarien'])
    expect(second.intent).toBe('zero-match')
  })

  it('conserve la contrainte de durée la plus stricte entre deux tours', () => {
    const first = interpretMessage('rapide, 25 min')
    const second = refineSearch('plutot 15 min', first.activeTags, first.activeMaxDuration)
    expect(second.activeMaxDuration).toBe(15)
  })
})

describe('interpretIngredientQuestion — micro-conversation fiche recette', () => {
  it('répond avec une astuce croisée d’une autre recette du catalogue (pas une réponse générique)', () => {
    const recipe = MOCK_RECIPES.find((r) => r.id === 'carbonara-a-la-creme')!
    const answer = interpretIngredientQuestion('je n’ai pas de crème fraîche, je fais quoi ?', recipe)
    expect(answer.understood).toBe(true)
    expect(answer.suggestion).toContain('eau de cuisson')
    expect(answer.sourceNote).toBeTruthy()
  })

  it('reste honnête quand elle ne connaît pas de substitut pour un ingrédient identifié', () => {
    const recipe = MOCK_RECIPES.find((r) => r.id === 'carbonara-romaine')!
    const answer = interpretIngredientQuestion('je n’ai pas d’œufs entiers, je fais quoi ?', recipe)
    expect(answer.understood).toBe(true)
    expect(answer.suggestion).toBeUndefined()
  })

  it('signale explicitement quand l’ingrédient demandé n’appartient pas à la recette', () => {
    const recipe = MOCK_RECIPES.find((r) => r.id === 'pancakes-moelleux')!
    const answer = interpretIngredientQuestion('je n’ai pas de lardons', recipe)
    expect(answer.understood).toBe(false)
  })

  it(
    // Documente le piège qui a motivé le préfixage recipe.id: côté RecipePage
    // (revue /plan-design-review du 2026-07-20, Pass 7) : le même id brut
    // d'ingrédient désigne des ingrédients différents selon la recette — un
    // consommateur qui clé la mémoire sur cet id seul se trompe de recette.
    'les ids d’ingrédients bruts ne sont pas uniques entre recettes (piège mémoire)',
    () => {
      const romaine = MOCK_RECIPES.find((r) => r.id === 'carbonara-romaine')!
      const creme = MOCK_RECIPES.find((r) => r.id === 'carbonara-a-la-creme')!
      const sameId = 'ing-3'
      const nameInRomaine = romaine.ingredients.find((i) => i.id === sameId)?.name
      const nameInCreme = creme.ingredients.find((i) => i.id === sameId)?.name
      expect(nameInRomaine).toBeDefined()
      expect(nameInCreme).toBeDefined()
      expect(nameInRomaine).not.toBe(nameInCreme)
    },
  )
})

describe('applyMemory — mémoire de session appliquée à un résultat', () => {
  it('enrichit un résultat basé sur des contraintes avec les contraintes mémorisées', () => {
    const base = interpretMessage('poulet, enfants')
    const withMemory = applyMemory(base, [{ tag: 'vegetarien', label: 'végétarien' }], undefined)
    expect(withMemory.intent).toBe('zero-match')
    expect(withMemory.activeTags.map((t) => t.tag).sort()).toEqual(['enfants', 'poulet', 'vegetarien'])
  })

  it('ne modifie pas un résultat de désambiguïsation par nom (la mémoire ne s’y applique pas)', () => {
    const base = interpretMessage('une carbonara')
    const withMemory = applyMemory(base, [{ tag: 'vegetarien', label: 'végétarien' }], undefined)
    expect(withMemory).toBe(base)
  })

  it('ne recalcule rien si la mémoire n’apporte aucune contrainte nouvelle', () => {
    const recipe = MOCK_RECIPES.find((r) => r.id === 'poulet-express-enfants')!
    const base = presentRecipe(recipe, [{ tag: 'enfants', label: 'adapté aux enfants' }], 20)
    const withMemory = applyMemory(base, [{ tag: 'enfants', label: 'adapté aux enfants' }], 20)
    expect(withMemory).toBe(base)
  })
})

describe('interpretMessage — autres intents', () => {
  it('détecte le hors-sujet', () => {
    expect(interpretMessage('quelle est la météo demain ?').intent).toBe('offtopic')
  })

  it('détecte la demande de panier', () => {
    expect(interpretMessage('mon panier').intent).toBe('cart')
  })

  it('retombe sur une clarification quand rien n’est identifiable', () => {
    const result = interpretMessage('euh je sais pas trop un truc bien')
    expect(result.intent).toBe('unknown')
    expect(result.contextSentence).toContain('temps')
  })
})
