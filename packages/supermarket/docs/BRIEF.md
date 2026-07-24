# Brief — packages/supermarket

## Intention

Simuler une expérience drive basique (rayon/catalogue/panier) pour la présentation du 2026-07-24 sur le fonctionnement du repo : recréer en live une feature cœur — le catalogue d'idées repas — pour démontrer l'intérêt du design system (réutilisation cross-package de `RecipeCard`, `StoreHeader`, `BottomNav`) plutôt que de le décrire à l'oral.

Vu le temps disponible pour la présentation, le périmètre de cette première session a été volontairement réduit à **la page catalogue seule** — décision validée avec l'utilisateur avant implémentation (voir Décisions ci-dessous).

## Décisions

- **Catalogue only, pas rayon/panier réel** : construire les 3 écrans (rayon, catalogue, panier) pour une vraie démo drive de bout en bout était trop ambitieux pour le temps disponible. Seule la page catalogue (`app/page.tsx`) est construite ; rayon et panier persistant restent hors périmètre — mentionnés à l'oral comme prochaine étape.
- **`RecipeCard` en variante Desktop/Catalog uniquement** : pas de variante Mobile/App horizontale ("Aisle") du Figma source aujourd'hui — le catalogue est le seul contexte d'usage de cette session.
- **Pas de prix façon partenaire (Leclerc)** : élément Figma ponctuel, ne correspond à aucun brand/partner défini dans les tokens du design-system (`neutral`/`marmiton`/`coursesu`, partner `carrefour`).
- **État panier local, pas de vrai module panier** : le bouton "Ajouter au panier" de chaque `RecipeCard` bascule un `Set<string>` en `useState` côté page — assez pour un feedback visuel vivant en démo, sans construire de persistance/contexte panier partagé.
- **Type `Recipe` propre au package** (`src/data/recipes.ts`), plutôt que d'importer l'un des 3 types `Recipe` déjà divergents dans `assistant-shopping`/`marmiton-agent`/`marmiton-prototype` (champs différents : image `StaticImageData` vs `string` vs absente, présence ou non de rating/tags/difficulty…). Repartir d'un type minimal évite d'hériter de la dette de convergence de ces trois packages.
- **Images réelles via TheMealDB** (API gratuite, sans inscription) plutôt que des emojis — URLs `strMealThumb` récupérées une fois et codées en dur dans `recipes.ts`, pas d'appel réseau tiers en direct pendant la démo.
- **Stack alignée sur le reste du monorepo** : Next.js + design-system (tokens + `BrandThemeSwitcher`), scaffoldé à partir de `packages/home` (référence la plus simple du repo).
- **`StoreHeader`/`BottomNav` responsive via `useMediaQuery` du DS** (breakpoint 768px), pas de détection interne au composant — reste au consommateur de choisir la plateforme, pour que les composants DS restent SSR-safe.

## Non fait (hors périmètre de cette session)

- Page rayon et variante `RecipeCard` Mobile/App ("Aisle")
- Panier réel (module `Cart`, persistance, checkout)
- Recipe Detail (Figma [Recipes — node 91:17801](https://www.figma.com/design/YDFZDIbtM9w9F5pWftkbUR/Recipes?node-id=91-17801)), non exploré en détail (frame trop large)
- Bannière promo glassmorphism + rangée de filtres du header catalogue Figma ([Catalog — node 4712:35838](https://www.figma.com/design/e8BpuLovSPh0SPseTl29tA/Catalog?node-id=4712-35838)) — dégradé vers un header simple (titre + sous-titre)
- `RecipeCard` `size="small"` (prop scaffoldée, non stylée)
- Déploiement Netlify (pas nécessaire pour une démo locale)
