# Règle de suggestion de recettes — section "Suggestions" du Mealz Planner

> Périmètre : spécifique à la section "Suggestions" du Planner (vue "Mon menu"). Ne pas appliquer par défaut à d'autres recommandations de recettes dans le SDK (catalogue, home, etc.) sans confirmation.

Règle appliquée par l'IA Mealz pour proposer une recette à la fois au shopper dans la section "Suggestions" du Planner (CTA "Ajouter au menu" / "Passer").

## Filtres obligatoires

Une recette n'est éligible que si :
1. Elle a le statut **"Publiée"** pour le retailer
2. Elle est taguée **"Plat principal"**
3. Ses **ingrédients primordiaux sont disponibles** pour le magasin sélectionné
4. Elle respecte le **régime particulier** coché dans les Préférences (Sans gluten, Sans lactose, Vegan, Végétarien) — cf. `06-preferences-planner.md`
5. Elle ne contient aucun ingrédient marqué **"Je n'aime pas"** dans les Préférences — cf. `06-preferences-planner.md`
6. Elle ne nécessite aucun **équipement décoché** dans les Préférences — cf. `06-preferences-planner.md`

Les filtres 4 à 6 sont partagés avec le Catalogue de recettes (même exclusion stricte appliquée aux deux surfaces).

## Critères de scoring (maximisés, non bloquants)

Parmi les recettes éligibles, la sélection favorise au maximum :
- Les recettes **populaires sur l'année** (popularité globale = succès utilisateurs sur les 12 derniers mois)
- Les recettes avec un **coût ≤ 6€/pers**
- Les recettes **sponsorisées**
- Les recettes **en promotion**
- Les recettes **récentes** (nouveautés)

## Exclusions

Sont exclues de la suggestion :
- Les recettes **déjà dans le panier**
- Les **doublons** entre propositions successives
- Les recettes **refusées par l'utilisateur** (CTA "Passer") **dans les 30 derniers jours**
- Les recettes **déjà présentes dans le Menu en cours**

## Comportement associé

- CTA **"Ajouter au menu"** : ajoute la recette suggérée au Menu en cours
- CTA **"Passer"** : rejette la proposition (déclenche l'exclusion 30 jours ci-dessus) et l'IA propose immédiatement une nouvelle recette

## À vérifier / non confirmé par le code

- Le code de `PlannerService.getSuggestedRecipes` (mealz-ssr-api) appelle un endpoint générique `/recipes/suggest` avec les filtres de préférences utilisateur — le détail des critères ci-dessus (popularité, coût ≤6€, exclusions 30 jours...) est une règle métier confirmée par Raziel, mais son implémentation exacte côté `miam-api` n'a pas été relue en détail. À vérifier avec l'Engineering avant de baser une estimation dessus si un ticket modifie cette logique.
