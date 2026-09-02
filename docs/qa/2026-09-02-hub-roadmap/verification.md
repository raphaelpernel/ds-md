# Vérification QA — Hub roadmap

Date : 2026-09-02
Verdict : `changes-requested`

## Environnement vérifié

- Repository : `DS.MD`
- Worktree : `F:/Workspace/Mealz/CLAUDE/Projects/DS.MD/.worktrees/feat-hub-roadmap`
- Branche : `feat/hub-roadmap`
- Base : `dev` (`30a06982ebbc4f090ad8931e799a3048eb6b81fb`)
- Package principal : `packages/hub/`
- Documentation lue : `AGENTS.md`, `packages/hub/docs/BRIEF.md`, `packages/design-system/docs/DESIGN.md`, `docs/superpowers/specs/2026-09-01-hub-multi-client-design.md`

## Vérifications automatisées exécutées

### Tests Hub

Commande : `pnpm --filter @mealz-product-team/hub test`

Résultat : succès — 21 fichiers, 169 tests passés.

Couverture fonctionnelle observée dans la suite :

- registre des prototypes ;
- routes Assistant Shopping Neutral/CoursesU ;
- état, reset et exclusivité du Planner ;
- routes Planner/Supermarket ;
- catalogue Guide, whitelist des slugs et liens markdown ;
- URL Storybook configurable ;
- auth et shells existants.

### TypeScript

Commande : `pnpm --filter @mealz-product-team/hub exec tsc --noEmit`

Résultat : succès, sortie vide, code 0.

### Build production

Commande : `pnpm --filter @mealz-product-team/hub build`

Résultat : succès — compilation et TypeScript réussis, 71 pages statiques générées. Les routes attendues Neutral, CoursesU, Guide, Planner et Supermarket figurent dans le manifeste Next.

Avertissement non bloquant : Next détecte plusieurs `pnpm-workspace.yaml` entre la racine et le worktree et demande éventuellement de fixer `turbopack.root`.

### Intégrité Git

- `git diff --check` : succès.
- `packages/design-system`, `packages/assistant-shopping`, `packages/form-mealz-planner` et `packages/supermarket` : inchangés.
- `pnpm-lock.yaml` : modifié conformément aux nouvelles dépendances Hub.

## Vérifications HTTP et rendu

Un serveur Hub isolé a été lancé sur `http://localhost:3014` avec des secrets QA temporaires. Un cookie master signé a été utilisé.

### Statuts de routes

Réponses 200 vérifiées :

- `/neutral`
- `/neutral/assistant-shopping` et ses routes `category`, `cart`, `chat`
- `/neutral/form-mealz-planner` et ses étapes `people`, `meals`, `equipment`, `diet`, `results`
- `/neutral/supermarket`, `/neutral/supermarket/planner`
- `/neutral/supermarket/collections/rapide-et-facile`
- `/neutral/supermarket/collections/promo`
- `/coursesu`
- `/coursesu/assistant-shopping` et ses routes `category`, `cart`, `chat`
- `/guide`
- `/guide/button`

Réponses 404 attendues vérifiées :

- `/neutral/supermarket/collections/unknown`
- `/guide/does-not-exist`

### États de marque et shell

Captures Chrome headless desktop vérifiées :

- Neutral : `data-brand="neutral"`, sidebar master visible.
- Guide : brand neutral, sidebar visible, rendu markdown lisible.
- CoursesU externe simulé par la route statique : brand CoursesU et prototype rendu.
- Défaut bloquant : sous cookie master, `/coursesu/assistant-shopping*` perd la sidebar alors que `/coursesu` et les routes Marmiton la conservent.
- Défaut bloquant : les usages de `PlannerBanner` demandent encore `/img/planner-banner-bg-{mobile,desktop}.png` et obtiennent des 404 ; les assets namespacés copiés ne sont jamais passés aux props prévues.
- Défaut bloquant : `/neutral/assistant-shopping` rend les placeholders CoursesU et conserve une logique Carrefour dans le cœur partagé ; la déclinaison dépasse un simple changement de brand.
- Défaut d’accessibilité non bloquant : l’historique conversationnel dynamique ne possède pas de région live.

### Responsive

Captures 390 × 844 effectuées sur Assistant Shopping, Planner, Supermarket, Guide et CoursesU. Deux limites ont été observées mais ne sont pas classées comme nouvelles régressions bloquantes faute de critère responsive explicite dans la spec de migration :

- la sidebar master fixe à 220 px laisse une zone de contenu très étroite sur mobile ;
- les fonds de démonstration CoursesU sont des placeholders desktop avec cadrage `object-fit: cover`, donc fortement recadrés sur mobile.

Ces limites doivent être consignées dans les notes d’implémentation et arbitrées si le Hub interne ou la démo client doivent officiellement supporter les petits écrans.

## Limites de la vérification

- Le plan annoncé et `implementation-notes.md` sont absents : impossible de vérifier les tâches 1–7 ligne par ligne et les écarts documentés.
- La vérification d’interaction complète au clavier/lecteur d’écran n’a pas été menée sur les 71 pages ; les contrôles ont ciblé les nouveaux chemins critiques, les tests existants et les rendus desktop/mobile.
- Les vraies captures CoursesU ne sont pas présentes : les assets indiquent explicitement des placeholders.

## Conclusion

Les preuves automatisées sont solides et les routes principales répondent. Quatre conditions empêchent néanmoins l’approbation : le shell master est perdu dans la déclinaison statique CoursesU, les fonds des deux `PlannerBanner` rendent 404, le montage Neutral reste client-spécifique, et le handoff obligatoire n’est pas traçable par ses artefacts de plan/notes. L’annonce accessible des messages du chat reste à corriger.

`changes-requested`

## Re-vérification ciblée — 2026-09-02

### Automatisation relancée

- `pnpm --filter @mealz-product-team/hub test` : succès, 21 fichiers et 169 tests.
- `pnpm --filter @mealz-product-team/hub exec tsc --noEmit` : succès, code 0.
- `pnpm --filter @mealz-product-team/hub build` : succès, 71 pages générées.
- `git diff --check` : succès.
- Packages sources et design system : inchangés.

### Contrôles runtime ciblés

- `/coursesu/assistant-shopping`, cookie master : HTTP 200 et `.hub-sidebar` présente.
- `/coursesu/assistant-shopping`, cookie client CoursesU seul : HTTP 200 et `.hub-sidebar` absente.
- `/neutral/assistant-shopping/chat` : sidebar présente ; région `role="log"` avec `aria-live="polite"` et `aria-relevant="additions text"`.
- Assets Neutral `neutral-*` : présents et servis en HTTP 200 ; aucune copie Carrefour/CoursesU trouvée dans les routes Neutral.
- Divergence fonctionnelle restante : `isRetailerBrand` fait sauter la sélection de magasin et masque le bandeau sous CoursesU, tandis que Neutral l’exige.
- `/neutral/supermarket` : fond demandé sous `/prototypes/supermarket/`, HTTP 200.
- `/neutral/form-mealz-planner` : fond encore demandé sous `/img/planner-banner-bg-mobile.png`, HTTP 404.

### Traçabilité

- `docs/technical/2026-09-02-hub-roadmap/plan.md` et `implementation-notes.md` sont présents.
- Le plan ne contient pas les champs obligatoires par tâche définis par `AGENTS.md`.
- `git log dev..HEAD` reste vide et la majorité des nouveaux fichiers demeurent non suivis.

### Conclusion de re-vérification

Le shell CoursesU, la copie/assets Neutral et la région live sont corrigés. Supermarket utilise aussi le bon fond Planner. Le Form Mealz Planner conserve cependant un 404 d’asset, la logique partagée diverge encore selon la brand retailer et la traçabilité n’atteint pas le format requis. Les tests de régression ciblés demandés ne sont pas présents.

`changes-requested`

## Deuxième re-vérification ciblée — 2026-09-02

### Corrections P1

- Form Mealz Planner : le HTML rendu référence les fonds mobile et desktop sous `/prototypes/mealz-planner/`; les deux requêtes authentifiées répondent HTTP 200.
- Supermarket : les deux fonds sous `/prototypes/supermarket/` restent consommés et répondent HTTP 200.
- Assistant Shopping : `/neutral/assistant-shopping/chat` et `/coursesu/assistant-shopping/chat` répondent HTTP 200 et rendent tous deux le bandeau d’actions magasin. L’inspection confirme `isRetailerBrand = false`, donc les règles de sélection sont actuellement identiques.
- Plan : les tâches 1 à 7 exposent chacune objectif, zones, étapes, vérification attendue et risques/dépendances.
- Index Git avant vérification : 166 fichiers suivis, 0 fichier non suivi, 0 artefact `.next`, aucun changement dans les packages sources historiques.

### Automatisation relancée

- `pnpm --filter @mealz-product-team/hub test` : succès, 21 fichiers et 169 tests.
- `pnpm --filter @mealz-product-team/hub exec tsc --noEmit` : succès, code 0.
- `pnpm --filter @mealz-product-team/hub build` : succès, 71 pages générées.
- `git diff --cached --check` : échec, code 2 ; espaces finaux dans `docs/technical/2026-09-02-hub-roadmap/plan.md:3-5`.
- Le build a temporairement modifié `packages/hub/next-env.d.ts`; le lancement runtime l’a restauré, et aucun changement non indexé ne subsiste avant l’écriture de ces artefacts QA.

### Dette non résolue

- Aucun test ciblé ne couvre le layout CoursesU, la région live ou l’égalité de comportement du store locator.
- `isRetailerBrand` est forcé à `false`, mais son API, ses branches, ses commentaires et le hook désormais inutilisé restent présents.

### Conclusion

Les trois P1 de la passe précédente sont corrigés. Trois P2 restent ouverts et aucun report produit explicite n’est documenté pour les deux dettes de régression/maintenabilité. Le contrôle whitespace du diff indexé est rouge.

`changes-requested`

## Troisième re-vérification ciblée — 2026-09-02

### Preuves relancées

- Tests Hub : 24 fichiers, 172 tests passants.
- `pnpm --filter @mealz-product-team/hub exec tsc --noEmit` : succès.
- Build Next.js : succès, 71 pages générées.
- `git diff --cached --check` : succès.
- État après build : 169 fichiers indexés, 0 fichier non indexé, 0 fichier non suivi.
- Packages sources historiques : inchangés.
- Scan production : aucune occurrence de `isRetailerBrand`, `useIsRetailerBrand` ou `lib/brand`.

### Runtime ciblé

- `/neutral/form-mealz-planner` : HTTP 200 ; les deux fonds `/prototypes/mealz-planner/planner-banner-bg-{mobile,desktop}.png` sont présents dans le rendu et répondent HTTP 200.
- `/neutral/assistant-shopping/chat` : HTTP 200, sidebar master présente, action « Choisir un magasin » présente, région live présente.
- `/coursesu/assistant-shopping/chat`, session master : HTTP 200, sidebar présente, action magasin présente, région live présente.
- `/coursesu/assistant-shopping/chat`, session client CoursesU : HTTP 200, sidebar absente, action magasin présente, région live présente.

### Écart restant

- `packages/hub/next-env.d.ts` demeure indexé avec une modification générée par le build (`.next/dev/types/routes.d.ts` vers `.next/types/routes.d.ts`), contrairement à la restauration annoncée et au scope intentionnel.

### Conclusion

Les comportements, tests ciblés et contrôles automatisés sont conformes. La validation finale reste suspendue uniquement au retrait de `packages/hub/next-env.d.ts` du diff de feature.

`changes-requested`

## Vérification finale de propreté — 2026-09-02

- Branche : `feat/hub-roadmap`.
- `git diff --cached -- packages/hub/next-env.d.ts` : vide.
- `git diff -- packages/hub/next-env.d.ts` : vide.
- `git diff --cached --name-only -- packages/hub/next-env.d.ts` : vide.
- `git diff --cached --check` : succès, code 0.
- Fichiers indexés : 168.
- Fichiers non indexés : 0.
- Fichiers non suivis : 0.
- Build non relancé après restauration ; dernière preuve valide : succès, 71 pages.

Tous les constats des passes précédentes sont fermés.

`approved`
