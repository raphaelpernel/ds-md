# Notes d’implémentation — Préférences alimentaires permanentes

## État

Implémentation réalisée dans `packages/hub` sur `dev` conformément au plan validé.
Aucun commit ni push n’est effectué dans cette passe. Les changements préexistants du
worktree ne sont ni nettoyés ni revendiqués.

## Comportement livré

- Profil permanent versionné dans deux clés `localStorage` distinctes : profil et invitation.
- États allergies/restrictions séparés : `unset`, `none`, `declared`.
- Politique pure partagée par le catalogue et le Planner, basée uniquement sur des faits de recette explicites.
- Régime déclaré incompatible : exclusion du Planner ; dépriorisation seulement dans le catalogue, qui reste complet et consultable.
- Allergie/restriction fiable : exclusion des résultats Planner ; le catalogue reste consultable.
- Ingrédient évité : dépriorisation sans masquage.
- Cuisine appréciée : bonus d’affinité.
- Temps dépassé : dépriorisation.
- Équipements permanents : aucun effet sur le classement ou la disponibilité.
- Convives permanents : défaut appliqué au Planner tant que l’utilisateur n’a pas modifié la semaine ; `reset()` réarme le défaut.
- Invitation Modal unique, `Plus tard`, drawer récapitulatif/éditeurs, confirmation Toast.
- CTA `Préférences` sans compteur et lien `Joe` vers `/neutral/supermarket/profile`.
- Page profil Neutral réutilisant le même provider et les mêmes éditeurs.
- Le composant feature-local `PreferencesCard` porte les sélections de régimes et d’équipements avec les états default/hover/selected et les SVG d’icônes existants ; les allergies, le temps et les tags du summary conservent `ChipTag`.
- La copy allergies/restrictions est générique Neutral-first et ne mentionne aucune marque client.
- À l’ouverture du Drawer, le focus va sur `Fermer`; à la fermeture, il revient au déclencheur explicite ou au CTA `Préférences` après l’invitation automatique.

## Vérifications réalisées

- Baseline avant implémentation : 4 fichiers / 13 tests ciblés Supermarket + Planner ; build Hub 71 routes.
- Tâche 1 : persistance ciblée 5 tests passants.
- Tâche 2 : politique + Planner 5 tests de politique et 3 tests d’intégration passants.
- Tâche 3 : provider 2 tests, bridge Planner 2 tests, contexte Planner historique 4 tests passants.
- Tâche 4 et carte `PreferencesCard` : vues 7 tests passants ; suites ciblées food-preferences/Supermarket/Planner 14 fichiers / 47 tests passants.
- Tâche 5 : shell 2 tests passants.
- Tâche 6 : routes 2 tests et page profil 1 test passants.
- Tâche 7 : Results 1 test passant.
- TypeScript `pnpm --filter @mealz-product-team/hub exec tsc --noEmit` : OK.
- Build Hub : OK, 72 routes, dont `/neutral/supermarket/profile`.
- Suite Hub complète : 34 fichiers / 206 tests passants.
- Suite ciblée food-preferences + Supermarket + Planner : 14 fichiers / 47 tests passants.
- TypeScript, `git diff --check` et absence de diff `packages/design-system` : OK.
- `packages/hub/next-env.d.ts` restauré depuis `HEAD` après le dernier build ; aucun build n’a été relancé ensuite conformément à la demande QA.

## Écarts et limitations assumés

- Les éditeurs utilisent des contrôles HTML accessibles et les composants DS d’overlay/feedback (`Modal`, `Drawer`, `Toast`) ; aucune modification du package design-system n’est introduite.
- Écart UX au plan initial : `ChipTag` n’est pas utilisé pour les régimes ni les équipements, car la maquette `4778:1180` impose une carte dédiée ; les allergies restent volontairement en `ChipTag` pour cette itération.
- Les SVG consommés sont servis depuis `public/food-preferences/{icons,flags}/` ; les 14 copies sous `src/features/food-preferences/assets/img/` ont été supprimées car elles étaient inutilisées et identiques octet pour octet aux assets publics. Les doublons sous `features/supermarket/assets` et les icônes non mappées `air-fryer`/`pesco-vegetarien` ont également été supprimés.
- Le focus trap générique des overlays DS reste hors scope ; la restitution fine du focus catalogue est à surveiller en QA manuelle.
- La copy allergies/restrictions reste provisoire et interdite de diffusion externe avant validation juridique.
- `localStorage` reste une persistance mono-navigateur de prototype interne.
- Responsive complet desktop/tablette, erreurs de sauvegarde et états vides restent hors scope du plan.

## Documentation historique

Les deux documents historiques Mealz Planner reçoivent un avertissement de supersession
sans suppression de leur contenu : le flow Hub du 2026-09-03 prévaut pour le profil
permanent, notamment sur régime, ingrédients évités, équipements et compteur.

## Reproductibilité Git

La branche active est `dev`, avec la base `1dc092d71c694f29fce07e4d94d1cd4a76d1f2e4`. Le workspace reste non commité pour préserver les changements préexistants. Le scope intentionnel, les exclusions et les commandes de reconstruction du diff sont indexés dans `scope-manifest.md` au même niveau ; aucune modification de `packages/design-system/` n’est revendiquée.

Le patch complet incluant les fichiers non suivis est `scope.patch` au même niveau. Il a été appliqué avec succès dans le worktree QA dédié `F:/Workspace/Mealz/CLAUDE/Projects/DS.MD-QA`, détaché sur la même base ; ce worktree ne contient aucun changement hors scope.

## Statut QA

Prêt pour vérification QA uniquement après confirmation de la gate finale ci-dessus.
