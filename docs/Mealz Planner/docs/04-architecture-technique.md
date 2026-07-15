# Mealz Planner — Architecture technique

> Base factuelle extraite du code réel (GitLab, `mealz-ssr-api` branche `main`, `mealz-components` branche `2.0`, commit de référence `14619e87`). À vérifier/rafraîchir avant toute estimation de ticket si le code a évolué depuis.

---

## Concept fonctionnel du Planner

Le Planner est une fonctionnalité de **construction de menu multi-recettes** : le shopper compose un "menu" (plusieurs recettes, avec un nombre de convives par recette) avant de transférer les ingrédients vers le panier retailer. C'est un mode d'usage distinct du parcours "ajout 1 clic" d'une recette isolée (catalog / recipe-details) : le Planner introduit la notion de **menu persistant** avec un budget cible.

Concepts backend clés (ressource `Menu` côté `miam-api`) :
- Un `menu` a un `title`, un `budget`, un `point-of-sale-id` (magasin), et une liste de `menu-recipes` (relation recette ↔ nombre de convives).
- Un menu est créé automatiquement (lazy) si l'utilisateur n'en a pas — pas d'écran de création explicite.
- Le coût total du menu est calculé côté API (`/menus/current-cost`) et comparé au budget cible → jauge budgétaire.
- Les utilisateurs non connectés ("authless") peuvent construire un menu ; à la connexion, ce menu est fusionné avec celui du compte via `/menus/transfer-authless`.

---

## Routes SSR (`mealz-ssr-api`, `src/controllers/components/planner/`)

| Route | Controller | Rôle |
|---|---|---|
| `GET /v2/planner` | `planner.controller.ts` | Route d'entrée historique du Planner. Le dashboard legacy a été supprimé : cette route rend désormais directement la vue "current-menu" (redirection fonctionnelle interne, pas de page dédiée). |
| `GET /v2/planner/entry` | `planner-entry.controller.ts` | Composant "teaser" d'entrée vers le Planner, avec 3 variantes pilotées par le param `variant` : **1** (défaut) = carte hero "sélection du moment" (recettes suggérées) ; **2** = carte hero "mon menu personnalisé" (menu déjà construit par l'utilisateur) ; **3** = les deux cartes affichées côte à côte. |
| `GET /v2/planner/current-menu` | `planner-current-menu.controller.ts` | Page principale du Planner : liste des recettes du menu, une recette suggérée à ajouter, jauge budget, navigation retour catalogue. |
| `GET /v2/planner/recipe-card` | `planner-recipe-card.controller.ts` | Rendu unitaire d'une carte recette du menu (params `recipe_id`, `recipe_index`, `store_id`, `guests`) — fragment réutilisé dans la liste. |
| `GET /v2/planner/help` | `planner-onboarding-modal.controller.ts` | Modale d'onboarding, **créée spécifiquement pour la webview mobile**. |
| `GET /v2/menu/merge-authless-menu` | `menu.controller.ts` | Fusionne le menu construit en mode anonyme avec le compte utilisateur après connexion. |

---

## Services métier (`mealz-ssr-api`, `src/v2/`)

- **`PlannerService`** (`src/v2/services/planner.service.ts`) — cœur métier :
  - `getCurrentMenu` : récupère (ou crée si inexistant) le menu courant, avec cache par `userId` actuellement **désactivé** (commentaire dans le code : "Setting cache gives back stale data").
  - `updateMenuPointOfSaleIdIfNeeded` : si le magasin sélectionné diffère du `point-of-sale-id` du menu, patch automatique du menu.
  - `getMenuPrice` : coût total courant du menu (`/menus/current-cost`).
  - `getSuggestedRecipes` : recettes suggérées (`/recipes/suggest`), filtrées par les préférences utilisateur.
  - `mergeAuthlessMenu` : fusion menu anonyme → compte (`/menus/transfer-authless`).
  - `getGuestsForRecipeInMenu` : nombre de convives enregistré pour une recette dans le menu.
  - `sortRecipes` : ordonne les `menu-recipes` et relie les sponsors aux recettes pour l'affichage des logos sponsors.

- **`PlannerCurrentMenuService`** (`src/v2/components/planner/planner-current-menu.service.ts`) — orchestration de la page current-menu : agrège menu courant, panier, recettes suggérées, jauge budget.
  - **Règle de calcul du nombre de convives par recette** (ordre de priorité) : convives déjà définis dans le panier > convives définis dans le menu > `modifiedGuests` > convives par défaut du menu > convives par défaut de la recette > **4 par défaut**.
  - Un flag `discounted` est calculé par recette (affichage promo).

- **`PlannerDashboardService`** (`src/v2/components/planner/planner-dashboard.service.ts`) — orchestration de la page entry : sépare la donnée "sélection du moment" (recettes vedettes) de la donnée "menu personnalisé" (menu réel de l'utilisateur), selon la variante demandée.

- **`PlannerRecipeCardService`** — orchestration de la carte recette unitaire.

---

## Composants UI (`mealz-components`, `src/components/planner/`)

| Composant | Rôle présumé (à confirmer en Design/Eng si besoin) |
|---|---|
| `planner-current-menu` | Conteneur principal de la page menu courant |
| `planner-current-menu-modal` | Variante modale de la vue menu courant |
| `planner-recipe-list` | Liste des recettes du menu |
| `planner-recipe-card` | Carte recette individuelle dans le menu |
| `planner-recipe-suggestion` | Bloc de suggestion d'une recette à ajouter |
| `planner-budget-gauge` | Jauge visuelle budget cible vs coût courant |
| `planner-budget-edit-modal` | Modale d'édition du budget cible |
| `planner-catalog` | Vue catalogue accessible depuis le Planner pour ajouter des recettes |
| `planner-open-catalog-modal` | Modale d'ouverture du catalogue depuis le Planner |
| `planner-menu-option` | **Confirmé (code) :** enveloppe le CTA "C'est parti !" dans `planner-entry.ejs` (variante hero) ainsi que les cartes d'option dans les variantes 2/3. Gère : l'event analytics `planner.mode.select`, la création/récupération du menu, et la redirection vers `/planner/current-menu`. Si l'utilisateur vient de `planner-entry`, redirige directement (skip formulaire) ; sinon affiche `planner-form`. |
| `planner-quick-menu` | **Confirmé (produit) :** bandeau de vignettes du Menu en cours affiché en bas de la vue "Suggestions" sur Mobile/WebMobile, avec CTA "Voir le menu" — permet de rester sur les suggestions tout en visualisant sa sélection. Spécifique au layout mobile (le desktop affiche les deux sections côte à côte, pas besoin de ce composant). |
| `planner-form` | **Confirmé (code) :** formulaire convives/budget affiché uniquement quand l'utilisateur n'arrive **pas** depuis `planner-entry` (chemin legacy). Chez Courses U, l'entrée se fait exclusivement via `planner-entry` → ce composant n'est en pratique pas rendu aujourd'hui pour ce retailer. |
| `planner-abandon-modal` | Modale de confirmation d'abandon |
| `planner-onboarding` / `planner-onboarding-modal` | Onboarding première utilisation |
| `planner-welcome-modal` | Modale de bienvenue |
| `to-basket-loader` | **Confirmé (produit) :** loader illustré avec les recettes du Menu, affiché pendant le transfert des produits vers le panier retailer (déclenché par "Mettre le menu au panier") |
| `planner-entry` (hors dossier `planner/`, top-level) | Composant "teaser" d'entrée vers le Planner (cf. route `/planner/entry`) |

Tous les composants listés ci-dessus sont désormais confirmés soit par le code, soit par les échanges produit avec Raziel.

---

## Analytics — events confirmés dans le code

> Vérifiés dans `mealz-components` branche `2.0`. Utile pour toute demande de métrique — vérifier ici avant de supposer qu'un event existe.

| Event | Déclenché par | Paramètres |
|---|---|---|
| `pageview` | Chargement de la vue current-menu | — |
| `planner.mode.select` | Clic CTA "C'est parti !" / carte option (`planner-menu-option`) | `mode`, `guests`, `variant` |
| `planner.finalize` | Clic "Mettre le menu au panier" | `budget_user`, `recipe_count`, `guests`, `mode` |
| `recipe.add` | Envoyé en boucle pour chaque recette du Menu, **au moment de** `planner.finalize` (pas à l'ajout) — ne pas confondre avec `planner.recipe.add` | `recipe_id`, `recipe_source`, `mode` |
| `planner.recipe.add` | Ajout individuel d'une recette au Menu (Suggestions, catalogue, fiche recette) | `recipe_id`, `recipe_source` (`ai_suggestion`, `catalog`, `collection_entrees/desserts/boissons`, `pre_filled`), `mode` |
| `planner.recipe.delete` | Retrait d'une recette du Menu (CTA "X") | `recipe_id` |
| `planner.recipe.swap` | Clic "Passer" sur une suggestion | `recipe_id` |
| `planner.recipe.catalog-prompt` | Ouverture auto du catalogue après 3 "Passer" consécutifs | — |
| `planner.suggestion.show` | Affichage d'une nouvelle recette suggérée | `recipe_id` |
| `planner.reset` | Clic "Vider le menu" / confirmation modale d'abandon | — |
| `planner.started` | Soumission du formulaire `planner-form` (chemin non-`planner-entry` uniquement) | `guests`, `budget`, `mode` |
| `planner.onboarding.display` / `.next` / `.close` / `.understood` / `.skip` / `.start` | Étapes de l'onboarding automatique (`07-onboarding-premiere-visite-planner.md`) | `type`, `step` |
| `planner.help.display` / `.previous` / `.next` / `.understood` / `.close` / `.question-mark` | Étapes de la modale d'aide CTA "?" (`05-aide-comment-faire-un-menu.md`) | `step`, `from` |

## Contraintes techniques à considérer pour toute évolution du Planner

- **Cache désactivé sur le menu courant** : chaque affichage de `/planner/current-menu` refait un aller-retour complet vers `miam-api` (menu + panier + suggestions + prix en parallèle). Toute feature ajoutant un appel supplémentaire sur cette route a un impact direct sur le temps de réponse (le controller logue déjà le temps total, ex. `planner landing call took Xms`).
- **Trois variantes de `planner-entry`** pilotées par un seul paramètre `variant` — toute évolution de l'entrée vers le Planner doit préciser explicitem la variante concernée pour éviter une régression sur les deux autres.
- **Mode authless** : toute feature Planner doit fonctionner sans compte utilisateur, avec fusion à la connexion (`transfer-authless`). Vérifier ce comportement pour toute nouvelle US touchant à la persistance du menu.
- **i18n** : `planner-entry.controller.ts` gère explicitement une résolution de langue par header et un suffixe d'image par langue (`plannerEntryImageLangSuffix`) — toute US ajoutant du texte ou du visuel doit prévoir les clés/variantes de langue.
- **Route `/planner/help` dédiée mobile webview** : ne pas supposer qu'elle est utilisée en desktop web.
- **Cohérence cross-device** : le Planner existe potentiellement sur Web, WebMobile et AppMobile (webview) — toute US doit préciser la ou les surfaces concernées (cf. règle générale Mealz).
