# Brief — packages/home

## Intention

Hub central pour naviguer entre les prototypes du monorepo, déployés comme sites Netlify indépendants. Fait suite à la mise en place d'un site Netlify par package (au lieu d'un seul site buildant tout le monorepo via `pnpm -r build`, où l'échec d'un package bloquait le déploiement des autres).

## Décisions

- **Un 5e site Netlify, pas un proxy** : la home ne fait que lister des liens externes (`<a href>` vers les autres domaines Netlify). Un reverse-proxy (redirects Netlify) donnerait l'illusion d'un seul domaine mais ajoute de la complexité (assets relatifs, cache) pour un gain cosmétique — écarté.
- **Stack alignée sur le reste du monorepo** : Next.js + design-system (tokens + `BrandThemeSwitcher`), pas une page statique isolée.
- **Pas de composant `Card` générique dans le design-system** (`ListItem` existe mais est un pattern liste, pas grille de cards) → markup custom dans `app/page.css` avec les tokens DS (`--spacing-*`, `--shape-card`, `--color-surface-primary`, etc.) plutôt qu'un nouveau composant DS prématuré.

## Contenu (cards → URLs)

| Card | URL |
|---|---|
| Design System (Storybook) | https://mealz-design-system.netlify.app |
| Marmiton Prototype | https://marmiton-prototype.netlify.app |
| Assistant Shopping | https://assistant-shopping.netlify.app |
| Quick Features | https://quick-features.netlify.app |

Note : "Quick Features" est le nom Netlify du site déployé depuis `packages/form-mealz-planner` — le package n'a pas été renommé côté code, seul l'affichage sur la home utilise le nouveau nom. Ce package sert désormais aux features rapides / tests simples plutôt qu'au planner de repas (usage encore en évolution).

## Déploiement Netlify

- Base directory : racine du repo (comme les autres packages, requis pour la résolution pnpm workspace)
- Build command : `pnpm --filter @mealz-product-team/home... build`
- Publish directory : `packages/home/.next`
