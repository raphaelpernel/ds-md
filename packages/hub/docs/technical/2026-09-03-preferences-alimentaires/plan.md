# Plan d’implémentation — Profil alimentaire permanent Neutral-first

**Objectif :** livrer dans Hub un profil alimentaire permanent persistant, éditable depuis le catalogue et une page de profil Neutral, puis appliquer une politique unique aux recettes du catalogue et du Planner sans bloquer le catalogue.

**Architecture :** un module `food-preferences` propriétaire du modèle, de la persistance, des vues et de la politique pure est monté dans le layout Supermarket. Le Planner conserve son état hebdomadaire et consomme uniquement le profil permanent via une couture explicite.

**Stack :** Next.js 16, React 19, TypeScript, CSS tokenisé, design system workspace, Vitest, Testing Library.

**Spec :** `packages/hub/docs/product/2026-09-03-preferences-alimentaires/spec.md`

**Architecture détaillée :** `packages/hub/docs/technical/2026-09-03-preferences-alimentaires/architecture.md`

**Contraintes globales :**
- Package modifiable : `packages/hub/` uniquement ; `packages/design-system/` reste en lecture seule.
- Aucun compteur de préférences ni badge de personnalisation sur les RecipeCard.
- Le catalogue reste intégralement consultable.
- Les équipements du profil permanent n’excluent ni ne dépriorisent aucune recette.
- La copy allergies/restrictions est provisoire et réservée au prototype interne.
- Les URLs d’assets Figma temporaires et le Tailwind généré ne sont pas intégrés.

---

### Tâche 1 — Modéliser et persister le profil permanent

**Objectif :** fournir un profil versionné dont les trois états allergies/restrictions survivent à un rechargement sans être confondus.

**Fichiers concernés :**
- `packages/hub/src/features/food-preferences/model/types.ts` — définir `FoodPreferenceProfile`, `RestrictionSelection` et les identifiants de sections.
- `packages/hub/src/features/food-preferences/model/defaults.ts` — construire le profil par défaut sans objet partagé mutable.
- `packages/hub/src/features/food-preferences/data/options.ts` — déclarer les options éditoriales de régimes, restrictions, ingrédients, cuisines, temps et équipements avec IDs stables.
- `packages/hub/src/features/food-preferences/persistence/foodPreferencesStorage.ts` — charger et sauvegarder le profil et l’état d’invitation dans deux clés versionnées.
- `packages/hub/src/features/food-preferences/persistence/foodPreferencesStorage.test.ts` — couvrir le round-trip, les données invalides, les versions inconnues et les clés séparées.

**Implémentation :**
1. Écrire les tests qui attendent `restrictions.status` successivement à `unset`, `none` et `declared`, et qui vérifient qu’un profil relu est égal au profil sauvegardé.
2. Exécuter `pnpm --filter @mealz-product-team/hub exec vitest run src/features/food-preferences/persistence/foodPreferencesStorage.test.ts` et confirmer l’échec initial pour modules absents.
3. Implémenter le type discriminé `RestrictionSelection`, `createDefaultFoodPreferenceProfile()`, les clés `mealz.hub.neutral.food-preferences.v1` et `mealz.hub.neutral.food-preferences-invitation.v1`, puis une validation défensive des objets relus.
4. Définir le registre d’ingrédients avec `id`, `label` et `aliases`; normaliser uniquement pour filtrer ce registre, et stocker les sélections par ID afin d’empêcher les doublons.
5. Relancer le test ciblé et vérifier le passage sans écrire dans le vrai `localStorage` global du navigateur de test.

**Tests / vérification :**
- `pnpm --filter @mealz-product-team/hub exec vitest run src/features/food-preferences/persistence/foodPreferencesStorage.test.ts`
- Vérifier que `unset` n’est jamais sérialisé comme `none` et que l’état d’invitation ne modifie pas la donnée profil.

**Risques / dépendances :**
- `localStorage` est un adapter de prototype mono-navigateur, pas une persistance de compte multi-device.

### Tâche 2 — Centraliser la politique de personnalisation

**Objectif :** ordonner ou exclure les recettes avec une fonction pure commune tout en garantissant que le catalogue conserve tous ses items.

**Fichiers concernés :**
- `packages/hub/src/features/food-preferences/policy/personalizeRecipes.ts` — définir `RecipePreferenceFacts`, `PreferenceCandidate<T>` et `personalizeRecipes<T>()`.
- `packages/hub/src/features/food-preferences/policy/personalizeRecipes.test.ts` — tester chaque règle métier à l’interface publique.
- `packages/hub/src/features/supermarket/data/recipes.ts` — ajouter des métadonnées explicites et auditables aux fixtures catalogue.
- `packages/hub/src/features/mealz-planner/data/types/wizard.ts` — ajouter les faits de personnalisation aux recettes mock sans fusionner les modèles UI.
- `packages/hub/src/features/mealz-planner/data/mock/recipes.ts` — renseigner les faits, accepter le profil permanent dans `pickRecipes` et déléguer à la politique commune.
- `packages/hub/src/features/mealz-planner/data/mock/recipes.test.ts` — vérifier l’intégration Planner sans tester l’implémentation interne du score.

**Implémentation :**
1. Écrire des tests avec des candidates minimales qui prouvent : exclusion fiable seulement en surface `planner`, aucune suppression en `catalog`, pénalité d’ingrédient évité, bonus cuisine, pénalité au-dessus du seuil, régime incompatible, équipements sans effet et ordre source stable à score égal.
2. Exécuter `pnpm --filter @mealz-product-team/hub exec vitest run src/features/food-preferences/policy/personalizeRecipes.test.ts` et confirmer l’échec initial.
3. Implémenter un score interne déterministe derrière `personalizeRecipes<T>()`; ne pas exposer les pondérations dans l’interface et ne lire aucun titre de recette.
4. Ajouter à chaque fixture les tableaux `incompatibleDietIds`, `incompatibleRestrictionIds`, `ingredientIds`, le `cuisineId` et `preparationMinutes` nécessaires au happy path.
5. Faire conserver à `pickRecipes` ses paramètres hebdomadaires existants, puis appliquer `personalizeRecipes(..., profile, 'planner')` avant la répétition jusqu’au nombre de repas demandé.
6. Relancer les deux tests ciblés et confirmer qu’un équipement du profil permanent ne change pas le résultat.

**Tests / vérification :**
- `pnpm --filter @mealz-product-team/hub exec vitest run src/features/food-preferences/policy/personalizeRecipes.test.ts src/features/mealz-planner/data/mock/recipes.test.ts`
- Vérifier que la longueur du catalogue personnalisé reste identique à la longueur source, même avec une restriction incompatible.

**Risques / dépendances :**
- Hypothèse produit retenue : incompatibilité de régime explicitement déclarée = exclusion du Planner, dépriorisation seulement dans le catalogue complet ; durée dépassée = dépriorisation. Signaler tout ajustement demandé par Zeus dans les notes d’implémentation.

### Tâche 3 — Exposer le profil par un provider stable

**Objectif :** partager une seule source de vérité persistée entre le catalogue, la page de profil et le Planner.

**Fichiers concernés :**
- `packages/hub/src/features/food-preferences/context/FoodPreferencesContext.tsx` — implémenter le provider, l’hydratation, les sauvegardes publiques et l’état d’ouverture du drawer.
- `packages/hub/src/features/food-preferences/context/FoodPreferencesContext.test.tsx` — tester les transitions observables du hook.
- `packages/hub/src/features/mealz-planner/context/PlannerContext.tsx` — distinguer valeur de convives par défaut et modification hebdomadaire explicite.
- `packages/hub/src/features/mealz-planner/context/PlannerContext.test.tsx` — couvrir `applyDefaultPeople`, l’override utilisateur et le reset.
- `packages/hub/src/features/food-preferences/integration/PlannerProfileBridge.tsx` — appliquer le défaut permanent au Planner sans importer son reducer dans le module profil.

**Implémentation :**
1. Écrire les tests du hook qui vérifient l’hydratation depuis un `Storage` injecté, la sauvegarde immédiate des convives, la sauvegarde atomique d’une section et la persistance de l’invitation.
2. Ajouter aux tests Planner les scénarios : défaut permanent appliqué avant interaction, `setPeople` protégeant l’override hebdomadaire, puis `reset` réarmant le défaut courant.
3. Exécuter les deux fichiers de tests et confirmer les échecs attendus sur les nouvelles interfaces.
4. Implémenter `FoodPreferencesProvider` avec `profile`, `hydrated`, `invitationSeen`, `openDrawer`, `closeDrawer`, `saveGuests` et `saveSection`; encapsuler tout accès `window.localStorage` dans un effet ou un adapter injecté.
5. Ajouter `applyDefaultPeople(value)` à l’interface Planner sans ajouter les autres champs permanents à `WizardState`.
6. Implémenter le bridge qui consomme les deux hooks et applique `profile.defaultGuests` uniquement après hydratation.
7. Relancer les tests ciblés et vérifier qu’une nouvelle sauvegarde de profil ne remplace pas une valeur Planner déjà modifiée pour la semaine.

**Tests / vérification :**
- `pnpm --filter @mealz-product-team/hub exec vitest run src/features/food-preferences/context/FoodPreferencesContext.test.tsx src/features/mealz-planner/context/PlannerContext.test.tsx`

**Risques / dépendances :**
- Dépend de la Tâche 1 pour la persistance et les types.

### Tâche 4 — Construire le récapitulatif et les trois éditeurs

**Objectif :** reproduire le happy path Figma avec brouillons annulables, libellés accessibles et enregistrement explicite.

**Fichiers concernés :**
- `packages/hub/src/features/food-preferences/components/FoodPreferencesSummary.tsx` — afficher les cartes de niveau 0 et appliquer les convives directement.
- `packages/hub/src/features/food-preferences/components/RestrictionsEditor.tsx` — gérer régimes et tri-état allergies/restrictions avec brouillon.
- `packages/hub/src/features/food-preferences/components/AvoidedIngredientsEditor.tsx` — rechercher le registre, sélectionner et retirer des ingrédients reconnus.
- `packages/hub/src/features/food-preferences/components/KitchenPreferencesEditor.tsx` — gérer temps exclusif, cuisines sans limite et équipements dans un brouillon global.
- `packages/hub/src/features/food-preferences/components/FoodPreferencesViews.test.tsx` — tester le contenu visible, les sélections et l’accessibilité.
- `packages/hub/src/features/food-preferences/styles/food-preferences.css` — convertir les layouts Figma en CSS scopé et tokenisé.

**Implémentation :**
1. Écrire des tests qui vérifient l’absence du texte `Non renseigné`, l’exclusivité `Aucune allergie ou restriction à signaler`, la déduplication des ingrédients et `aria-pressed` avec libellé visible pour chaque cuisine.
2. Ajouter un test prouvant que les modifications locales n’appellent pas `onSave` avant le clic `Enregistrer` et que `Retour` abandonne le brouillon.
3. Exécuter `pnpm --filter @mealz-product-team/hub exec vitest run src/features/food-preferences/components/FoodPreferencesViews.test.tsx` et confirmer l’échec initial.
4. Composer les vues avec les composants DS existants : `Stepper` pour les convives, `Checkbox` pour les listes, `InputField` pour la recherche, `ChipTag` sélectionnable pour temps/équipements et boutons avec `aria-pressed` pour cuisines.
5. Utiliser exactement la copy provisoire de la spec pour allergies/restrictions et le message d’aide `hors cuisson au four`; ne pas ajouter de promesse de sécurité.
6. Écrire les styles sous `.supermarket-feature .food-preferences-*` avec les variables `--spacing-*`, `--color-*`, `--font-*` et `--shape-*`; ne pas copier les classes Tailwind Figma.
7. Relancer le test ciblé, puis comparer le récapitulatif et les éditeurs au nœud Figma `4745:37989` à 375 px.

**Tests / vérification :**
- `pnpm --filter @mealz-product-team/hub exec vitest run src/features/food-preferences/components/FoodPreferencesViews.test.tsx`
- Contrôle manuel 375 px : libellés cuisines visibles, coche/état non porté par la couleur seule, bouton `Enregistrer` accessible au clavier.

**Risques / dépendances :**
- Dépend des Tâches 1 et 3.
- La copy allergies/restrictions doit rester marquée provisoire avant diffusion externe.

### Tâche 5 — Intégrer l’invitation, le Drawer et le Toast au catalogue

**Objectif :** présenter une invitation unique, ouvrir le profil sans quitter le catalogue et confirmer chaque sauvegarde complexe.

**Fichiers concernés :**
- `packages/hub/src/features/food-preferences/components/SupermarketFoodPreferencesShell.tsx` — orchestrer Modal, Drawer, niveaux de navigation, brouillon, Toast et focus.
- `packages/hub/src/features/food-preferences/components/SupermarketFoodPreferencesShell.test.tsx` — couvrir le workflow complet et les interactions clavier.
- `packages/hub/app/(master)/neutral/supermarket/layout.tsx` — monter le provider, le shell et le bridge autour du `PlannerProvider`.
- `packages/hub/src/features/supermarket/pages/CatalogPage.tsx` — connecter `onPreferencesClick`, supprimer le compteur et appliquer l’ordre `catalog`.
- `packages/hub/src/features/supermarket/components/CollectionView.tsx` — connecter le même accès volontaire et supprimer le compteur.
- `packages/hub/src/features/supermarket/pages/CatalogPage.test.tsx` — vérifier catalogue intégral, CTA et absence de compteur.

**Implémentation :**
1. Écrire les tests de shell : première arrivée éligible ouvre la Modal ; `Je le ferai plus tard` ferme et persiste ; le CTA primaire ouvre le Drawer ; le CTA catalogue le rouvre sans Modal ; Retour abandonne ; Enregistrer retourne au niveau 0 et montre le Toast exact.
2. Ajouter les assertions de focus après fermeture vers l’élément déclencheur et, pour l’invitation automatique, vers le bouton `Préférences` trouvé dans le conteneur catalogue.
3. Exécuter les tests shell/catalogue et confirmer les échecs initiaux.
4. Composer le shell avec `Modal size="S"`, actions secondaire puis primaire dans le footer, `Drawer placement="right" mobilePlacement="right"` et `Toast title="Préférences enregistrées. Vos prochaines suggestions en tiendront compte."`.
5. Monter `FoodPreferencesProvider` au layout Supermarket, conserver `PlannerProvider`, rendre une seule instance du shell et du bridge pour toutes les routes enfants.
6. Brancher `onPreferencesClick` dans `CatalogPage` et `CollectionView`, retirer `preferencesCount={3}`, puis appeler `personalizeRecipes(..., 'catalog')` avant le rendu des RecipeCard sans réduire le nombre d’items.
7. Relancer les tests ciblés et vérifier que `Plus tard` empêche une nouvelle Modal après remontage avec le même `Storage`.

**Tests / vérification :**
- `pnpm --filter @mealz-product-team/hub exec vitest run src/features/food-preferences/components/SupermarketFoodPreferencesShell.test.tsx src/features/supermarket/pages/CatalogPage.test.tsx`
- Test manuel : recharger `/neutral/supermarket`, choisir `Plus tard`, recharger à nouveau, puis ouvrir `Préférences` volontairement.

**Risques / dépendances :**
- Dépend des Tâches 1 à 4.
- `Modal` et `Drawer` DS n’ont pas de focus trap générique ; ne pas étendre le design system dans ce lot. Vérifier au minimum focus initial exploitable, Escape, fermeture et restitution.

### Tâche 6 — Ajouter la page profil et le point d’entrée Joe

**Objectif :** rendre le même profil permanent accessible à `/neutral/supermarket/profile` via un vrai lien du StoreHeader.

**Fichiers concernés :**
- `packages/hub/src/features/supermarket/routing/SupermarketRoutes.tsx` — ajouter la route `profile` dérivée du `basePath`.
- `packages/hub/src/features/supermarket/routing/SupermarketRoutes.test.tsx` — vérifier la nouvelle route pour les variantes avec ou sans slash final.
- `packages/hub/src/features/food-preferences/pages/FoodPreferencesProfilePage.tsx` — composer la page avec les vues partagées et un retour catalogue.
- `packages/hub/src/features/food-preferences/pages/FoodPreferencesProfilePage.test.tsx` — tester titre, édition, sauvegarde et retour.
- `packages/hub/app/(master)/neutral/supermarket/profile/page.tsx` — adapter Next fin vers la page de feature.
- `packages/hub/src/features/supermarket/pages/CatalogPage.tsx` — passer `accountHref={routes.profile}` à `StoreHeader`.
- `packages/hub/src/features/supermarket/components/CollectionView.tsx` — passer le même lien de compte.

**Implémentation :**
1. Étendre le test de routes pour attendre `profile: '/neutral/supermarket/profile'`, puis exécuter le test afin de constater l’échec.
2. Ajouter `profile` à `SupermarketRoutes` et à `supermarketRoutes(basePath)` sans coder le préfixe Neutral dans la feature.
3. Écrire le test de page qui ouvre une section, enregistre dans le provider partagé et active le lien Retour vers `routes.home`.
4. Implémenter `FoodPreferencesProfilePage` avec le second écran Preferences comme référence visuelle, en réutilisant `FoodPreferencesSummary` et les éditeurs plutôt qu’en recopiant leur logique.
5. Créer l’adapter App Router et fournir `accountHref={routes.profile}` aux deux `StoreHeader`; ne pas remplacer le lien par un `router.push` exclusif.
6. Relancer les tests et vérifier manuellement que cliquer `Joe`, puis Retour, conserve le profil et revient au catalogue.

**Tests / vérification :**
- `pnpm --filter @mealz-product-team/hub exec vitest run src/features/supermarket/routing/SupermarketRoutes.test.tsx src/features/food-preferences/pages/FoodPreferencesProfilePage.test.tsx`
- `pnpm --filter @mealz-product-team/hub build` doit lister `/neutral/supermarket/profile`.

**Risques / dépendances :**
- Dépend des Tâches 3 et 4.
- La position CoursesU reste hors scope ; la route est dérivée afin de permettre un futur adapter sans changer le modèle.

### Tâche 7 — Brancher le profil au Planner et fermer la documentation contradictoire

**Objectif :** faire consommer la politique permanente par les résultats Planner, puis produire les preuves nécessaires à la QA sans laisser les règles historiques actives sans avertissement.

**Fichiers concernés :**
- `packages/hub/src/features/mealz-planner/pages/Results.tsx` — fournir le profil courant à `pickRecipes`.
- `packages/hub/src/features/mealz-planner/pages/Results.test.tsx` — vérifier exclusion fiable, dépriorisation et nombre de repas rendu.
- `docs/Mealz Planner/docs/06-preferences-planner.md` — ajouter un avertissement de supersession pointant vers la spec Hub, sans réécrire l’historique.
- `docs/Mealz Planner/docs/regle-suggestion-recettes-planner.md` — ajouter le même avertissement sur les règles remplacées pour le nouveau flow.
- `packages/hub/docs/technical/2026-09-03-preferences-alimentaires/implementation-notes.md` — documenter diff, tests, critères vérifiés, hypothèses régime/durée et écarts au plan.

**Implémentation :**
1. Écrire un test de `PlannerResultsPage` avec providers contrôlés qui vérifie qu’une incompatibilité fiable absente n’exclut rien, qu’une incompatibilité déclarée n’est pas rendue et que la liste atteint toujours `state.meals` quand des candidates compatibles existent.
2. Exécuter le test ciblé et confirmer qu’il échoue avant consommation de `useFoodPreferences()`.
3. Lire le profil via le hook dans `Results.tsx`, le passer à `pickRecipes`, et conserver les états Planner hebdomadaires comme paramètres distincts.
4. Ajouter en tête des deux documents historiques un encadré indiquant que le flow Hub 2026-09-03 prévaut pour le profil permanent, notamment sur compteur, évitements et équipements ; ne pas supprimer leur contenu historique dans cette tâche.
5. Exécuter les suites ciblées `food-preferences`, `supermarket` et `mealz-planner`, puis la suite Hub complète et le build.
6. Rédiger `implementation-notes.md` avec les commandes et sorties réelles, les critères d’acceptation cochés, l’hypothèse produit régime/durée, les écarts et la mention `prêt pour vérification QA` seulement si tous les contrôles passent.
7. Vérifier le diff limité au scope attendu, puis préparer le handoff Athéna → Minos ; ne pas annoncer une approbation finale, qui appartient à Minos.

**Tests / vérification :**
- `pnpm --filter @mealz-product-team/hub exec vitest run src/features/food-preferences src/features/supermarket src/features/mealz-planner`
- `pnpm --filter @mealz-product-team/hub test`
- `pnpm --filter @mealz-product-team/hub build`
- `git diff --check`
- `git diff --exit-code -- packages/design-system` doit confirmer qu’aucune modification design-system n’a été introduite par cette feature.

**Risques / dépendances :**
- Dépend de toutes les tâches précédentes.
- La validation juridique reste requise avant toute diffusion externe.
- Les modifications préexistantes du worktree ne doivent pas être intégrées, nettoyées ou revendiquées dans les notes de cette feature.
