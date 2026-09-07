# Manifeste de scope — Préférences alimentaires permanentes

## Base reproductible

- Branche : `dev`
- Base observée : `1dc092d71c694f29fce07e4d94d1cd4a76d1f2e4`
- État : travail non commité, sans push, conservé dans le workspace existant conformément à la consigne utilisateur.
- Aucun changement de `packages/design-system/` n’appartient à ce scope.

## Fichiers intentionnels de la feature

### Code Hub suivi modifié

- `packages/hub/app/(master)/neutral/supermarket/layout.tsx`
- `packages/hub/src/features/mealz-planner/context/PlannerContext.tsx`
- `packages/hub/src/features/mealz-planner/data/mock/recipes.ts`
- `packages/hub/src/features/mealz-planner/data/types/wizard.ts`
- `packages/hub/src/features/mealz-planner/pages/Results.tsx`
- `packages/hub/src/features/supermarket/components/CollectionView.tsx`
- `packages/hub/src/features/supermarket/data/recipes.ts`
- `packages/hub/src/features/supermarket/pages/CatalogPage.tsx`
- `packages/hub/src/features/supermarket/routing/SupermarketRoutes.test.tsx`
- `packages/hub/src/features/supermarket/routing/SupermarketRoutes.tsx`
- `docs/Mealz Planner/docs/06-preferences-planner.md`
- `docs/Mealz Planner/docs/regle-suggestion-recettes-planner.md`

### Code et assets Hub non suivis de la feature

- `packages/hub/app/(master)/neutral/supermarket/profile/page.tsx`
- `packages/hub/src/features/food-preferences/**`
- `packages/hub/public/food-preferences/**`
- `packages/hub/src/features/mealz-planner/context/PlannerContext.profile.test.tsx`
- `packages/hub/src/features/mealz-planner/data/mock/recipes.test.ts`
- `packages/hub/src/features/mealz-planner/pages/Results.test.tsx`

### Documentation et preuves de la feature

- `packages/hub/docs/product/2026-09-03-preferences-alimentaires/**`
- `packages/hub/docs/design/2026-09-03-preferences-alimentaires/**`
- `packages/hub/docs/technical/2026-09-03-preferences-alimentaires/**`
- `packages/hub/docs/qa/2026-09-03-preferences-alimentaires/**`
- `packages/hub/docs/2026-09-03-preferences-alimentaires-neutral-first/**`
- `packages/hub/docs/2026-09-03-planner-preferences-placement/**`

## Changements explicitement hors scope

Ces éléments étaient déjà présents dans le workspace et ne sont pas revendiqués par ce livrable :

- `.gitignore`
- `AGENTS.md`
- `skills-lock.json`
- `packages/hub/src/components/NamespaceCardGrid/NamespaceCardGrid.css`
- `docs/qa/2026-09-02-hub-roadmap/**`
- `docs/technical/2026-09-02-hub-roadmap/**`
- `packages/hub/docs/product/spec.md`
- `packages/hub/docs/technical/architecture.md`
- `packages/hub/docs/technical/plan.md`
- `packages/hub/docs/2026-09-03-catalogue-hybride-coursesu/**`
- `packages/hub/docs/qa/2026-09-02-hub-roadmap/**`
- toute modification de `packages/design-system/**`

## Commandes de reproduction du diff

Depuis la racine du repository :

```bash
git diff --binary 1dc092d71c694f29fce07e4d94d1cd4a76d1f2e4 -- \
  'packages/hub/app/(master)/neutral/supermarket/layout.tsx' \
  packages/hub/src/features/mealz-planner \
  packages/hub/src/features/supermarket \
  'docs/Mealz Planner/docs/06-preferences-planner.md' \
  'docs/Mealz Planner/docs/regle-suggestion-recettes-planner.md'

git ls-files --others --exclude-standard -- \
  'packages/hub/app/(master)/neutral/supermarket/profile' \
  packages/hub/src/features/food-preferences \
  packages/hub/public/food-preferences \
  packages/hub/src/features/mealz-planner/context/PlannerContext.profile.test.tsx \
  packages/hub/src/features/mealz-planner/data/mock/recipes.test.ts \
  packages/hub/src/features/mealz-planner/pages/Results.test.tsx \
  packages/hub/docs/2026-09-03-preferences-alimentaires-neutral-first \
  packages/hub/docs/2026-09-03-planner-preferences-placement \
  packages/hub/docs/design/2026-09-03-preferences-alimentaires \
  packages/hub/docs/product/2026-09-03-preferences-alimentaires \
  packages/hub/docs/technical/2026-09-03-preferences-alimentaires \
  packages/hub/docs/qa/2026-09-03-preferences-alimentaires

git diff --check
git diff --exit-code -- packages/design-system
```

Pour matérialiser le contenu suivi et non suivi dans un patch complet sans modifier l’index réel :

```bash
PATCH='packages/hub/docs/technical/2026-09-03-preferences-alimentaires/scope.patch'
TMP_INDEX="$(mktemp)"
rm -f "$TMP_INDEX"
GIT_INDEX_FILE="$TMP_INDEX" git read-tree HEAD
GIT_INDEX_FILE="$TMP_INDEX" git add -A -- \
  'packages/hub/app/(master)/neutral/supermarket/layout.tsx' \
  'packages/hub/app/(master)/neutral/supermarket/profile' \
  packages/hub/src/features/food-preferences \
  packages/hub/public/food-preferences \
  packages/hub/src/features/mealz-planner \
  packages/hub/src/features/supermarket \
  'docs/Mealz Planner/docs/06-preferences-planner.md' \
  'docs/Mealz Planner/docs/regle-suggestion-recettes-planner.md' \
  packages/hub/docs/2026-09-03-preferences-alimentaires-neutral-first \
  packages/hub/docs/2026-09-03-planner-preferences-placement \
  packages/hub/docs/design/2026-09-03-preferences-alimentaires \
  packages/hub/docs/product/2026-09-03-preferences-alimentaires \
  packages/hub/docs/technical/2026-09-03-preferences-alimentaires \
  ':!packages/hub/docs/technical/2026-09-03-preferences-alimentaires/scope.patch' \
  packages/hub/docs/qa/2026-09-03-preferences-alimentaires
GIT_INDEX_FILE="$TMP_INDEX" git diff --cached --binary HEAD -- > "$PATCH"
rm -f "$TMP_INDEX"
```

Le fichier `scope.patch` est le livrable de diff complet ; il inclut les contenus non suivis via l’index temporaire. Le manifeste est une indexation du scope, pas un commit : les changements hors scope restent intacts et ne sont pas nettoyés automatiquement.
