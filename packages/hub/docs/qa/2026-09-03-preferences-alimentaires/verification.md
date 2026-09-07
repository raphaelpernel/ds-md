# Vérification QA — Profil alimentaire permanent Neutral-first

Date : 2026-09-07
Workspace : `F:/Workspace/Mealz/CLAUDE/Projects/DS.MD`
Branche : `dev`
Base observée : `1dc092d`
Package principal : `packages/hub/`

## Sources parcourues

- `AGENTS.md`
- `packages/hub/docs/BRIEF.md`
- `packages/design-system/docs/DESIGN.md`
- `packages/hub/docs/product/2026-09-03-preferences-alimentaires/brief.md`
- `packages/hub/docs/product/2026-09-03-preferences-alimentaires/decisions.md`
- `packages/hub/docs/product/2026-09-03-preferences-alimentaires/spec.md`
- `packages/hub/docs/technical/2026-09-03-preferences-alimentaires/architecture.md`
- `packages/hub/docs/technical/2026-09-03-preferences-alimentaires/plan.md`
- `packages/hub/docs/technical/2026-09-03-preferences-alimentaires/implementation-notes.md`
- `packages/hub/docs/design/2026-09-03-preferences-alimentaires/reviews/figma-preferences-mobile-v2.md`
- Figma `e8BpuLovSPh0SPseTl29tA`, nœud `4778:1180`

## Matrice des critères demandés

| Critère | Preuve | Résultat |
|---|---|---|
| Régimes sans `ChipTag` | `RestrictionsEditor.tsx:30`, test `FoodPreferencesViews.test.tsx:64-78` | PASS |
| Équipements sans `ChipTag` | `KitchenPreferencesEditor.tsx:31`, test `FoodPreferencesViews.test.tsx:80-90` | PASS |
| Allergies en `ChipTag` | `RestrictionsEditor.tsx:22-35` | PASS |
| Temps en `ChipTag` | `KitchenPreferencesEditor.tsx:22-29` | PASS |
| Summary en `ChipTag` | `FoodPreferencesSummary.tsx:1,11-14` | PASS |
| Cuisine distincte | `CuisineFlagSelector.tsx`, test `FoodPreferencesViews.test.tsx:54-62` | PASS |
| États Default/Hover/Selected | Figma `4778:1180`, `PreferencesCard.tsx:18-23`, CSS `food-preferences.css:167-220` | PASS statique |
| `aria-pressed` | `PreferencesCard.tsx:20`, tests régimes/équipements | PASS |
| Mappings SVG | 5 régimes, 5 équipements et 4 drapeaux contrôlés sur disque | PASS |
| Persistance durable | `foodPreferencesStorage.test.ts` et `FoodPreferencesContext.test.tsx` | PASS |
| Copy Neutral-first | `RestrictionsEditor.tsx:37` contient CoursesU | FAIL |
| Focus Drawer | trigger stocké mais jamais consommé ; plan 143-157 | FAIL |
| Diff reproductible | branche/doc contradictoires, fichiers non suivis et changements étrangers mêlés | FAIL |

## Commandes exécutées

### Tests ciblés

Commande :
`pnpm --filter @mealz-product-team/hub exec vitest run src/features/food-preferences src/features/supermarket src/features/mealz-planner`

Résultat :
- 14 fichiers passants
- 42 tests passants
- code de sortie 0

### Suite Hub complète

Commande :
`pnpm --filter @mealz-product-team/hub test`

Résultat :
- 34 fichiers passants
- 201 tests passants
- code de sortie 0

### TypeScript

Commande :
`pnpm --filter @mealz-product-team/hub exec tsc --noEmit`

Résultat : code de sortie 0, aucune erreur.

### Build Hub

Commande :
`pnpm --filter @mealz-product-team/hub build`

Résultat :
- compilation réussie ;
- vérification TypeScript réussie ;
- 72 pages générées ;
- `/neutral/supermarket/profile` présent ;
- code de sortie 0.

### Git et scope

- `git diff --check` : code 0.
- `git diff --exit-code -- packages/design-system` : code 0.
- `git status --short --branch --untracked-files=all` : changements suivis et nombreux fichiers non suivis ; diff non stabilisé.
- `git diff -- packages/hub/next-env.d.ts` : modification générée présente après build.

## Vérification Figma

Le contexte de design et la capture du nœud `4778:1180` ont été récupérés. La référence montre :
- trois états distincts Default, Hover et Selected ;
- carte d’environ 112 px de large avec bordure et rayon de carte ;
- icône centrée dans une zone de 40 px, pictogramme 24 px ;
- fond neutre au repos, fond hover gris, fond selected brand-light ;
- texte et icône qui passent en couleur interactive à l’état selected.

Le CSS local reprend ces dimensions et tokens. Aucun contrôle visuel du rendu navigateur réel n’a pu être effectué indépendamment : Browser Use exigeait une autorisation Chrome de débogage distant, et Computer Use n’a pas reçu l’approbation interactive. La confirmation manuelle de Raphaël est enregistrée comme observation externe, pas comme preuve QA indépendante.

## Runtime HTTP

Un serveur de production local a été démarré après le build. Les routes et assets renvoient HTTP 307 vers `/gate` sans session authentifiée. Leur consommation réseau en session authentifiée n’a donc pas été observée indépendamment. L’existence de tous les fichiers mappés a été contrôlée sur disque.

## Limites de preuve

- Pas de QA visuelle navigateur indépendante derrière le gate.
- Pas de vérification réelle du focus, mais l’inspection démontre que le trigger stocké n’est jamais consommé.
- Le diff de feature n’est pas isolé d’autres changements du workspace.

## Conclusion

Les preuves automatisées et le sous-scope `PreferencesCard` sont solides. Les écarts Neutral-first, accessibilité focus et stabilité du livrable doivent être corrigés avant une nouvelle passe QA.

Verdict : `changes-requested`

## Re-vérification du 2026-09-07 — passe corrective 2

### Preuves relancées

- Tests ciblés food-preferences/Supermarket/Planner : 14 fichiers, 46 tests, succès.
- Suite Hub : 34 fichiers, 205 tests, succès.
- `pnpm --filter @mealz-product-team/hub exec tsc --noEmit` : succès.
- Build exécuté sur le code corrigé : succès, 72 routes dont `/neutral/supermarket/profile`.
- `packages/hub/next-env.d.ts` restauré depuis `HEAD` après ce build; diff vide, aucun build relancé ensuite.
- `git diff --check` : succès.
- `git diff --exit-code -- packages/design-system` : succès.
- Suppression de `air-fryer.svg`, `pesco-vegetarien.svg` et des drapeaux dupliqués sous la feature Supermarket : vérifiée. Les 14 copies sous `food-preferences/assets/img` ont été réexaminées séparément en passe 4.

### Reproduction des corrections

| Ancien constat | Résultat |
|---|---|
| Copy CoursesU dans Neutral | PASS |
| Focus initial sur Fermer | PASS statique + test |
| Fallback invitation vers Préférences | PASS statique + test |
| Retour abandonne le brouillon | PASS test |
| Sauvegarde affiche le Toast | PASS test |
| `next-env.d.ts` propre | PASS |
| Assets non mappés/supermarket supprimés | PASS |
| Restitution après passage par `Modifier` | FAIL : le lien interne écrase le déclencheur externe |
| Diff reproductible | FAIL : commande manifeste invalide et contenu untracked non capturé |

### QA navigateur

Le navigateur intégré Hermes Desktop (`desktop_preview` / `drive_preview`) n’est pas exposé dans cette session CLI. La tentative de repli Browser Use a été arrêtée sur l’autorisation Chrome de débogage distant, conformément à l’instruction de ne pas retenter sans confirmation. Aucun mot de passe n’a été saisi ni stocké. Le serveur local de QA a été arrêté.

### Conclusion de la passe 2

La copy, les tests, le build, `next-env.d.ts` et le nettoyage d’assets sont conformes. Deux P1 restent ouverts : restitution de focus après navigation interne et matérialisation reproductible du diff.

Verdict : `changes-requested`

## Re-vérification finale du 2026-09-07 — passe corrective 3

### Focus

- Inspection : `SupermarketFoodPreferencesShell.tsx:43-47` conserve désormais `drawerTrigger` quand le Drawer est déjà ouvert.
- Test ciblé : `SupermarketFoodPreferencesShell.test.tsx:63-77` couvre CTA externe → Modifier → Fermer → retour du focus au CTA externe.
- Tests shell + vues : 2 fichiers, 13 tests passants.

### Suite complète et build

- Suite Hub : 34 fichiers, 206 tests passants.
- TypeScript : succès.
- Build exécuté sur le contenu final : succès, 72 routes.
- `/neutral/supermarket/profile` présent dans la table de routes.
- `next-env.d.ts` restauré depuis `HEAD` après le build ; aucun build relancé ensuite.
- `git diff --check` : succès.
- `packages/design-system` : diff vide.

### Patch reproductible

- Base : `1dc092d71c694f29fce07e4d94d1cd4a76d1f2e4`.
- Index Git réel du workspace principal : inchangé et propre.
- Commande Git Bash avec chemins `(master)` quotés : valide.
- Patch déclaré régénéré indépendamment depuis un index temporaire : contenu identique.
- Application vérifiée avec `GIT_INDEX_FILE=<index propre> git apply --cached --check scope.patch` : succès.

Le worktree `DS.MD-QA` est en retard sur les dernières versions de deux documents techniques. Cette copie auxiliaire n’est pas retenue comme source de vérité finale ; `scope.patch`, vérifié depuis l’index propre, est le livrable canonique.

### Limite navigateur

Le navigateur intégré Hermes Desktop n’est pas exposé dans cette session CLI. Cette limite reste documentée. Les interactions critiques disposent de tests DOM ciblés et Raphaël a confirmé manuellement le comportement général du parcours.

### Conclusion finale

Tous les critères d’acceptation ont été parcourus. Les preuves ciblées, complètes, TypeScript, build, scope et patch sont vertes. Aucun P0 ou P1 ne reste ouvert.

Verdict : `approved`

## Réexamen du 2026-09-07 — passe corrective 4

### Inspection du patch matérialisé

- Worktree inspecté : `F:/Workspace/Mealz/CLAUDE/Projects/DS.MD/.worktrees/feat-preferences-alimentaires`.
- Branche : `feat/preferences-alimentaires`.
- Base : `1dc092d71c694f29fce07e4d94d1cd4a76d1f2e4`.
- `scope.patch` appliqué et indexé : 14 SVG ajoutés sous `packages/hub/public/food-preferences/` et 14 sous `packages/hub/src/features/food-preferences/assets/img/`.
- Recherche de `assets/img` dans les sources de la feature : aucune référence consommatrice.
- `iconSources.ts` et `KitchenPreferencesEditor.tsx` utilisent exclusivement les URLs `/food-preferences/...` servies depuis `public`.
- Comparaison binaire des 14 paires : toutes identiques, y compris la paire renommée `south korea.svg` / `south-korea.svg`.

### Conclusion révisée

La conformité fonctionnelle antérieure n’est pas remise en cause, mais l’intégrité qualitative du livrable ne correspond pas à la clôture annoncée du constat d’assets dupliqués. Zeus refuse ce P2 dans le patch à matérialiser. Une régénération sans `src/features/food-preferences/assets/img/` est nécessaire avant livraison.

Verdict : `changes-requested`

## Re-vérification du 2026-09-07 — passe corrective 5

### Correctif d’intégrité des assets

- Patch Athéna reçu : 290496 octets.
- SHA-256 reçu et recalculé : `0ffc2eda89f846b31e7a61d574369b0a8a235816929f891623495adcad2a3415`.
- Hash Git blob : `353f7252235cdd4e7245feb3221df23390f1377c`.
- Inventaire `git apply --numstat` : 14 SVG publics, aucun fichier sous `src/features/food-preferences/assets/img/`.
- Le dossier `assets/img` est absent du workspace courant.
- `implementation-notes.md:49` documente les assets publics comme source consommée unique et la suppression des 14 copies.
- Régénération indépendante via index temporaire avant mise à jour QA : identité exacte avec le patch reçu.
- Application `--cached --check` depuis un index propre sur `1dc092d71c694f29fce07e4d94d1cd4a76d1f2e4` : succès.

### Gates relancées

- Tests `SupermarketFoodPreferencesShell.test.tsx` et `FoodPreferencesViews.test.tsx` : 2 fichiers, 13 tests passants.
- `pnpm --filter @mealz-product-team/hub exec tsc --noEmit` : succès.
- `git diff --check` : succès.
- `packages/design-system` : aucun diff.
- `packages/hub/next-env.d.ts` : aucun diff.
- Build non relancé : aucune source, URL consommée ou configuration de build n’a changé ; seul le retrait de fichiers morts et la documentation ont été modifiés.

### Conclusion finale

Le patch corrigé possède une seule copie de chaque asset consommé. Le P2 signalé par Zeus est fermé sans régression fonctionnelle observée.

Verdict : `approved`
