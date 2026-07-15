# Mealz Planner — Contexte produit

## Positionnement et objectif business (confirmé par Raziel)

- **Objectif business principal :** augmenter le panier moyen (le Planner pousse à ajouter plusieurs recettes d'un coup, avec un budget cible qui encourage à remplir le menu) **et** fidéliser / faire revenir le shopper (le menu persistant donne une raison de revenir régulièrement sur le SDK retailer).
- **Retailer(s) actif(s) aujourd'hui :** Courses U.
- **Périmètre device actuel :** Web **et** App Mobile (webview) — les deux confirmés actifs. Le détail de l'écran "Mon menu" en version mobile reste à documenter (cf. `02-parcours-current-menu.md`, section "Non couvert").

## Ce qui est confirmé (code + contexte Mealz existant)

- Le Planner est une fonctionnalité de **construction de menu multi-recettes avec budget cible**, intégrée en marque blanche chez les retailers GMS via la nouvelle stack (`mealz-ssr-api` + `mealz-components`).
- Il coexiste avec le parcours "ajout 1 clic" d'une recette isolée (catalog / fiche recette) — cf. `ressources/composants-mealz.md` — sans le remplacer : ce sont deux modes d'usage distincts au sein du même SDK.
- Fonctionne en mode connecté et anonyme ("authless"), avec fusion du menu à la connexion (`transfer-authless`).
- Le Planner root (`/planner`) rend directement la vue "current-menu" : **un dashboard séparé existait par le passé et a été supprimé** (commentaire explicite dans le code source).
- Une route `/planner/help` a été créée spécifiquement pour la **webview mobile** — cohérent avec la confirmation produit d'une présence App Mobile.
- Un seul point d'entrée retenu en pratique chez Courses U : le composant teaser `planner-entry` en variante "Sélection du moment", sur la home "Idées repas en 1 clic" (bandeau "Qu'est-ce qu'on mange cette semaine ?"). La variante "Menu personnalisé" existe toujours dans le code mais n'est plus exposée en entrée — décision produit.

---

## État MVP vs cible (confirmé)

L'ensemble des fonctionnalités déjà documentées (Suggestions, Menu en cours, budget, Catalogue de recettes, Préférences, onboarding automatique + aide CTA "?", usage sans connexion/sans magasin) constitue le **périmètre MVP complet actuel** du Planner — pas de fonctionnalité partielle ou provisoire en attente de refonte.

**Aucune roadmap engagée à ce jour.** Deux idées ont été identifiées comme pistes à ressortir plus tard dans l'année (non engagées, non chiffrées) :
- Partage de menu (avec d'autres personnes du foyer)
- Export / impression de la liste de courses, indépendamment de l'ajout au panier

**Point de vigilance (hors périmètre Planner) :** "Mon Carnet" — l'historique de commandes accessible depuis l'accueil "Idées repas en 1 clic" (recettes dont le panier a été validé et confirmé par le retailer) — est une fonctionnalité de "Idées repas en 1 clic", pas du Planner. Elle reste à documenter séparément, hors de ce dossier.

## Métriques suivies (confirmé, events vérifiés dans le code `mealz-components` branche `2.0`)

Trois indicateurs calculés à partir des events analytics dédiés au Planner :

- **Taux de conversion "Menu en cours"** = `planner.mode.select` / `planner.finalize` × 100 — `planner.mode.select` est envoyé au clic sur "C'est parti !" / l'option de menu (composant `mealz-planner-menu-option`, rendu via `planner-menu-option.ejs`, utilisé sur la page d'entrée) avec les paramètres `mode`, `guests`, `variant` ; `planner.finalize` est envoyé au clic sur "Mettre le menu au panier" (`planner-current-menu.ts`) avec les paramètres `budget_user`, `recipe_count`, `guests`, `mode`.
- **Taux d'ajout de recette via les Suggestions IA** = `planner.recipe.add` (avec `recipe_source: "ai_suggestion"`) / `planner.recipe.add` total × 100.
- **Nombre moyen de recettes par Menu** = `SUM(planner.finalize.recipe_count WHERE mode = "from-featured")` / `COUNT(planner.finalize WHERE mode = "from-featured")`.

**Point de vigilance confirmé dans le code :** il existe un événement `recipe.add` (sans préfixe "planner.") distinct de `planner.recipe.add` — le premier est envoyé en boucle sur toutes les recettes du Menu au moment de `planner.finalize`, le second est envoyé à chaque ajout individuel. Ne pas les confondre dans une requête analytics.

Autres events Planner confirmés dans le code, disponibles pour d'autres analyses futures : `planner.recipe.delete`, `planner.recipe.swap`, `planner.recipe.catalog-prompt`, `planner.suggestion.show`, `planner.reset`, ainsi que les events d'onboarding/aide (`planner.onboarding.*`, `planner.help.*`).

## Persona — cible principale (confirmé par Raziel)

**Cœur de cible : les foyers actifs qui veulent gagner du temps.** Le problème résolu n'est pas "comment cuisiner" mais "qu'est-ce qu'on mange ce soir ?" et "comment faire les courses rapidement ?".

Profil commun :
- 25 à 45 ans
- Actifs (salariés, indépendants)
- En couple ou avec un ou plusieurs enfants
- Font les courses en ligne (drive ou livraison)
- Cuisinent régulièrement mais ne veulent pas y consacrer trop de temps
- Utilisent déjà leur smartphone pour simplifier leur quotidien

### Persona n°1 — le parent débordé (cible prioritaire)

**Profil :** couple 30-45 ans, 1 à 3 enfants, peu de temps en semaine, besoin de repas simples/équilibrés/appréciés par toute la famille, volonté de limiter le gaspillage alimentaire.

**Irritants :** "Qu'est-ce qu'on mange ?", faire une liste de courses, acheter trop ou oublier un ingrédient, répéter toujours les mêmes recettes.

### Persona n°2 — le jeune couple urbain

**Profil :** 25-35 ans, sans enfant ou premier enfant, habite en ville, fait souvent ses courses en livraison.

**Recherche :** recettes modernes, plats variés, peu de préparation, peu de vaisselle.

### Persona n°3 — les "anti charge mentale"

Veulent déléguer : le choix des repas, la liste de courses, le calcul des quantités, l'organisation de la semaine.

## Ce qui n'est PAS ciblé (confirmé par Raziel)

- Les passionnés de cuisine qui créent leurs propres recettes
- Les personnes recherchant des produits très spécialisés ou gastronomiques
- Les étudiants avec un budget très limité
- Les consommateurs qui n'utilisent jamais le drive ou les courses en ligne
