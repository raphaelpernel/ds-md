# AGENTS.md

Monorepo pnpm "Mealz" : un design system multi-brand (`packages/design-system`) et plusieurs apps Next.js qui le consomment. Stack, scripts, ports dev et table des packages : voir [README.md](README.md) — ne pas la dupliquer ici.

Ce fichier est tool-agnostique : valable pour n'importe quel agent. Si tu es Claude Code, lis aussi `CLAUDE.md` à la racine, qui ajoute une couche de workflow (routing vers des skills, chaînes de commandes) propre à cet outil.

## Avant de toucher un package

Chaque package sous `packages/<nom>/` documente son propre cadrage — le lire en entier avant de construire quoi que ce soit :

- `packages/<nom>/docs/BRIEF.md` (ou `docs/CONTEXT.md` s'il existe) — intention, contraintes, UX attendue.
- `packages/<nom>/docs/adr/` — décisions actées pour ce contexte, si présent.

Pour la vue d'ensemble inter-packages : `docs/agents/domain.md` décrit comment ce repo organise sa doc de domaine (`CONTEXT-MAP.md`, ADRs système-larges, vocabulaire à respecter). Certains de ces fichiers n'existent pas encore partout — ils se créent au fil de l'eau ; leur absence n'est pas une erreur.

Si aucune doc n'existe pour un package et que la tâche touche une **nouvelle feature ou un nouveau flow UX** (pas un fix ciblé, pas une tâche déjà entièrement spécifiée) : le signaler, puis demander l'intention, les contraintes et l'UX attendue avant de construire — plutôt que d'exécuter tel quel ce qui a été demandé au premier degré.

## Composants design-system

Avant d'utiliser, ajouter ou modifier un composant importé depuis `@mealz-product-team/design-system` (`Button`, `Modal`, `ChipTag`, etc.) — dans **n'importe quel package consommateur** — lire `packages/design-system/docs/DESIGN.md` : cascade de tokens, table de décision "quel composant pour quel besoin" (évite par exemple un `Modal` là où un `Drawer` convient), Do/Don't système. Chaque composant a aussi son propre `<Component>.design.md` à côté de son code.

Si un nouveau composant est ajouté au design system (`packages/design-system/src/components/ui/`), lancer `pnpm --filter @mealz-product-team/design-system verify-design-docs` avant de considérer la tâche terminée — le script échoue si un composant Storybook n'a pas de `.design.md`.

## Nouveau package Next.js

Dès la création d'un package Next.js (`next.config.ts` + `app/layout.tsx`) qui n'est pas `marmiton-*` :

- **Sélecteur de thème** (`BrandThemeSwitcher`) dans `app/layout.tsx` : importer les sous-chemins du design system (jamais le barrel racine `@mealz-product-team/design-system` dans ce Server Component — casse la compilation RSC), ajouter `suppressHydrationWarning` sur `<html>`. Référence : `packages/assistant-shopping/app/layout.tsx`.
- **Polices Satoshi** (`Satoshi-Variable.woff2/.woff/.ttf`) copiées depuis `packages/marmiton-prototype/public/fonts/` vers `public/fonts/` du nouveau package — sans elles, 404 silencieux et fallback système sans erreur visible dans les DevTools.

## Tracker de issues

Issues et specs de ce repo vivent sur GitHub (`raphaelpernel/ds-md`), via le CLI `gh`. Conventions complètes (créer, lire, labelliser, fermer) : `docs/agents/issue-tracker.md`.
