export interface Recipe {
  id: string
  title: string
  imageUrl: string
  guests: number
  price: number
  promo?: boolean
}

// Pas de champ `mealIdea` ici : ce badge RecipeCard est réservé au contexte
// rayon (cf. RecipeCard.design.md) — cette page est un catalogue, jamais un rayon.

export interface RecipeCollection {
  id: string
  title: string
  description: string
  recipes: Recipe[]
}

// Visuels réels via TheMealDB (API gratuite, sans inscription — clé de test publique "1").
// URLs récupérées une fois pendant l'implémentation, codées en dur ici pour ne pas
// dépendre du service tiers pendant la démo.
export const COLLECTIONS: RecipeCollection[] = [
  {
    id: 'rapide-et-facile',
    title: 'Rapide et facile',
    description: 'Des recettes prêtes en un clin d’œil, sans sacrifier le goût.',
    recipes: [
      {
        id: 'burger-poulet-halloumi',
        title: 'Burger poulet & halloumi express',
        imageUrl: 'https://www.themealdb.com/images/media/meals/vdwloy1713225718.jpg',
        guests: 2,
        price: 4.2,
      },
      {
        id: 'sandwich-poulet-croustillant',
        title: 'Sandwich poulet croustillant',
        imageUrl: 'https://www.themealdb.com/images/media/meals/sbx7n71587673021.jpg',
        guests: 2,
        price: 3.1,
      },
      {
        id: 'tacos-poisson-epices',
        title: 'Tacos de poisson épicés',
        imageUrl: 'https://www.themealdb.com/images/media/meals/uvuyxu1503067369.jpg',
        guests: 4,
        price: 2.9,
        promo: true,
      },
      {
        id: 'patatas-bravas-minute',
        title: 'Patatas bravas minute',
        imageUrl: 'https://www.themealdb.com/images/media/meals/3m8yae1763257951.jpg',
        guests: 4,
        price: 1.8,
      },
    ],
  },
  {
    id: 'plats-du-moment',
    title: 'Plats du moment',
    description: 'Nos plats généreux à partager, parfaits pour la saison.',
    recipes: [
      {
        id: 'poulet-mijote-creole',
        title: 'Poulet mijoté à la créole',
        imageUrl: 'https://www.themealdb.com/images/media/meals/sypxpx1515365095.jpg',
        guests: 4,
        price: 3.5,
      },
      {
        id: 'saumon-roti-fenouil',
        title: 'Saumon rôti au fenouil et tomates',
        imageUrl: 'https://www.themealdb.com/images/media/meals/1548772327.jpg',
        guests: 2,
        price: 5.2,
        promo: true,
      },
      {
        id: 'poulet-alfredo-primavera',
        title: 'Poulet Alfredo primavera',
        imageUrl: 'https://www.themealdb.com/images/media/meals/syqypv1486981727.jpg',
        guests: 4,
        price: 3.9,
      },
      {
        id: 'moqueca-crevettes-bahia',
        title: 'Moqueca de crevettes à la Bahia',
        imageUrl: 'https://www.themealdb.com/images/media/meals/e2kcut1782591669.jpg',
        guests: 4,
        price: 4.6,
      },
    ],
  },
  {
    id: 'petit-budget',
    title: 'Petit budget',
    description: 'Bien manger sans se ruiner, recette après recette.',
    recipes: [
      {
        id: 'puree-aubergines-epicee',
        title: 'Purée d’aubergines épicée',
        imageUrl: 'https://www.themealdb.com/images/media/meals/urtpqw1487341253.jpg',
        guests: 4,
        price: 1.4,
      },
      {
        id: 'salade-couscous-aubergine',
        title: 'Salade de couscous à l’aubergine',
        imageUrl: 'https://www.themealdb.com/images/media/meals/02s6gc1763799560.jpg',
        guests: 4,
        price: 1.6,
        promo: true,
      },
      {
        id: 'trempette-avocat-pdt',
        title: 'Trempette avocat & pommes de terre nouvelles',
        imageUrl: 'https://www.themealdb.com/images/media/meals/flrajf1762341295.jpg',
        guests: 2,
        price: 1.9,
      },
      {
        id: 'gateau-aux-pommes',
        title: 'Gâteau aux pommes',
        imageUrl: 'https://www.themealdb.com/images/media/meals/c0gmo31766594751.jpg',
        guests: 6,
        price: 1.2,
      },
    ],
  },
]

/** Id réservé pour la collection virtuelle "Promo" — n'existe pas dans COLLECTIONS. */
export const PROMO_COLLECTION_ID = 'promo'

/**
 * Résout un slug de Collection Page. `promo` est une collection virtuelle,
 * recomposée à la volée à partir de toutes les recettes `promo: true` de
 * COLLECTIONS — pas une entrée statique, pour ne jamais désynchroniser des
 * vraies promos affichées sur le catalogue.
 */
export function getCollectionBySlug(slug: string): RecipeCollection | undefined {
  if (slug === PROMO_COLLECTION_ID) {
    return {
      id: PROMO_COLLECTION_ID,
      title: 'Promo',
      description: 'Toutes nos recettes actuellement en promotion.',
      recipes: COLLECTIONS.flatMap((collection) => collection.recipes).filter((recipe) => recipe.promo),
    }
  }
  return COLLECTIONS.find((collection) => collection.id === slug)
}
