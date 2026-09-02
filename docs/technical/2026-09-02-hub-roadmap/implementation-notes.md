# Notes d'implémentation — Hub roadmap

## Périmètre

Cette passe concerne uniquement `packages/hub` et la documentation de traçabilité. Les packages sources (`assistant-shopping`, `form-mealz-planner`, `supermarket`) et le design system n'ont pas été modifiés.

## Décisions techniques

- Les routes CoursesU statiques sont enveloppées par `ClientNamespaceShell`, afin que la session master conserve la sidebar et qu'une session client reste sans shell master.
- Le montage Neutral référence des assets génériques dédiés (`neutral-*`) et des textes sans enseigne. CoursesU conserve ses assets et son chrome retailer.
- Les messages Carrefour restants dans le moteur partagé ont été remplacés par une formulation générique ; une déclinaison retailer pourra fournir une stratégie de magasin spécifique ultérieurement.
- L'historique du chat est une région `role="log"`, avec `aria-live="polite"` et `aria-relevant="additions text"`.

## Preuves à relancer

- Tests ciblés du shell, des routes Assistant Shopping et de l'accessibilité du chat.
- `pnpm --filter @mealz-product-team/hub test`
- `pnpm --filter @mealz-product-team/hub exec tsc --noEmit`
- `pnpm --filter @mealz-product-team/hub build`
- `git diff --check`

## Limitations et points QA

- Le reset CSS global de certaines pages Marmiton reste une dette connue hors scope.
- Les limites responsive master/mobile et placeholders desktop doivent être surveillées.
- Le warning Next lié aux lockfiles multiples est non bloquant.

## État Git

Le diff est entièrement indexé avant livraison ; aucun fichier généré (`.next`, `next-env.d.ts`) n'est inclus.
