# Plan d’implémentation — Hub roadmap

Feature : migration progressive du Hub multi-client
Date : 2026-09-02
Package principal : `packages/hub`
Branche : `feat/hub-roadmap`

## Tâche 1 — Registre et namespaces

Objectif : fournir une source de vérité pour les prototypes et namespaces exposés par le Hub.

Zones concernées : `packages/hub/src/config/`, galeries `app/(master)/`, tests de configuration.

Étapes :
1. Définir le registre des prototypes et les métadonnées de galerie.
2. Dériver les namespaces clients depuis les brands du design system.
3. Protéger les slugs et les liens Storybook configurables.

Vérification attendue : tests `prototypes`/`namespaces`, rendu des galeries, build Hub.

Risques/dépendances : dépendance au registre `BRANDS` du design system ; aucune modification de ce package.

## Tâche 2 — Assistant Shopping Neutral

Objectif : monter l’Assistant Shopping partagé sous `/neutral/assistant-shopping` sans contenu client-specific.

Zones concernées : `app/(master)/neutral/assistant-shopping/`, `src/features/assistant-shopping/`, assets `public/prototypes/assistant-shopping/`.

Étapes :
1. Migrer contexte, routes, widgets, données mock et composants de chat.
2. Utiliser `AssistantShoppingDemoLayout` et des assets `neutral-*` dédiés.
3. Conserver les règles métier identiques entre montages ; la brand ne pilote pas le comportement.
4. Déclarer la région de conversation en `role=log` avec une politique live polie.

Vérification attendue : tests Assistant Shopping, scan d’absence de références Carrefour/CoursesU dans Neutral, build et contrôle des assets.

Risques/dépendances : données mock locales ; composants du design system inchangés.

## Tâche 3 — Planner partagé et Form Mealz Planner

Objectif : exposer le noyau Planner et le flow Neutral sous `/neutral/form-mealz-planner`.

Zones concernées : `src/features/mealz-planner/`, routes Neutral correspondantes, assets `public/prototypes/mealz-planner/`.

Étapes :
1. Monter le provider partagé et les routes de progression.
2. Brancher `PlannerBanner` sur les fonds mobile/desktop namespacés.
3. Vérifier les transitions et le reset de l’état.

Vérification attendue : tests `PlannerContext`/`plannerRoutes`, TypeScript, requêtes 200 des deux assets Planner, build.

Risques/dépendances : API `PlannerBanner` du design system ; les chemins d’assets doivent rester cohérents avec `public/`.

## Tâche 4 — Supermarket Neutral

Objectif : monter Supermarket sous `/neutral/supermarket` en réutilisant le Planner partagé.

Zones concernées : `src/features/supermarket/`, routes Neutral Supermarket, assets `public/prototypes/supermarket/`.

Étapes :
1. Monter catalogue, collections et routes Planner.
2. Réutiliser le contexte et les routes Planner partagés.
3. Fournir les fonds namespacés au `PlannerBanner`.

Vérification attendue : tests Supermarket et Planner, routes générées par le build, assets mobile/desktop répondant 200.

Risques/dépendances : cohérence des chemins inter-feature ; pas de duplication du contexte Planner.

## Tâche 5 — Déclinaison CoursesU

Objectif : exposer l’Assistant Shopping sous `/coursesu/assistant-shopping` tout en conservant la navigation master.

Zones concernées : `app/(client)/coursesu/assistant-shopping/`, `CoursesUDemoLayout`, `ClientNamespaceShell`.

Étapes :
1. Monter les routes CoursesU avec leur base path.
2. Envelopper l’arbre statique par `ClientNamespaceShell`.
3. Vérifier que le shell apparaît en session master et reste absent pour une session client seule.

Vérification attendue : tests ClientNamespaceShell, routes CoursesU dans le build et contrôle runtime master/client.

Risques/dépendances : ordre des layouts Next.js et en-tête `x-hub-is-master` posé par le proxy.

## Tâche 6 — Guide Design System

Objectif : fournir une lecture navigable des documents `.design.md` sans remplacer Storybook.

Zones concernées : `src/features/guide/`, routes `app/(master)/guide/`, registre et liens Markdown.

Étapes :
1. Dériver l’index des documents design existants.
2. Whitelister les slugs et sécuriser les chemins.
3. Afficher les sources relatives et les liens Storybook configurables.

Vérification attendue : tests design docs/Markdown, tests de slug, build et route dynamique.

Risques/dépendances : structure documentaire du design system ; les documents absents doivent échouer explicitement.

## Tâche 7 — Intégration et traçabilité

Objectif : livrer un état reviewable et vérifiable du Hub.

Zones concernées : monorepo, `docs/technical/2026-09-02-hub-roadmap/`, `docs/qa/2026-09-02-hub-roadmap/`.

Étapes :
1. Relancer tests, TypeScript, build et `git diff --check`.
2. Vérifier routes et assets critiques, notamment les deux variantes Planner.
3. Versionner tous les fichiers intentionnels dans le diff de branche.
4. Transmettre à Minos les preuves et limitations connues.

Vérification attendue : 169 tests passants, TypeScript OK, build 71 pages, assets critiques HTTP 200, diff stabilisé.

Risques/dépendances : warning Next lié aux lockfiles multiples ; reset CSS historique Marmiton conservé hors scope.
