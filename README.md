# DS.MD — Design System

Monorepo pnpm pour Mealz : un design system multi-brand pur (`packages/design-system`) et plusieurs apps Next.js qui le consomment (prototypes, démos, outils internes), construits avec React 19, TypeScript, Tailwind CSS v4 et Storybook 10.

## Stack technique

| Outil | Version | Rôle |
|---|---|---|
| pnpm | 11 | Gestionnaire de paquets + workspace monorepo |
| React | 19 | UI |
| TypeScript | 5.6 | Typage |
| Tailwind CSS | v4 | Utilitaires CSS |
| Next.js | 16 | Apps consommatrices (prototypes, démos) |
| Storybook | 10 | Documentation interactive du design system |
| Style Dictionary | 5 | Génération des tokens CSS depuis Figma |
| CVA | 0.7 | Variants de composants |

---

## Pourquoi un monorepo

Le design system (`packages/design-system`) est indépendant de tout produit : composants UI purs, tokens, Storybook. Chaque app (prototype, démo, outil interne) vit dans son propre package sous `packages/`, et consomme le design system via `@mealz-product-team/design-system` (lien `workspace:*`, pas de publication sur un registre pour l'instant). Séparer les deux permet d'ajouter de nouvelles apps sans jamais toucher au design system, et inversement.

## Packages du monorepo

| Package | Port dev | Rôle | Doc |
|---|---|---|---|
| `design-system` | 6006 (Storybook) | Design system multi-brand pur : tokens, composants UI, thèmes | `docs/DESIGN.md` |
| `marmiton-prototype` | 3000 (défaut Next.js) | Premier prototype : parcours courses/panier Marmiton × Carrefour | — |
| `assistant-shopping` | 3002 | Prototype UI de l'Assistant Shopping ChatGPT (commerce agentique, Carrefour Belgique) | `docs/docs/00-index.md` |
| `form-mealz-planner` | 3001 | "Quick Features" côté déploiement Netlify — features rapides / tests UI ponctuels (nom de code conservé côté repo) | — |
| `hub` | 3004 | Hub multi-client : prototypes, gate mot de passe par espace, brand verrouillée par client | `docs/BRIEF.md` |
| `supermarket` | 3006 | Démo drive (catalogue + wizard planner) illustrant la réutilisation cross-package du design system (`RecipeCard`, `StoreHeader`, `BottomNav`) | `docs/BRIEF.md` |

Chaque app consommatrice a son propre `docs/` (brief, contexte produit, décisions) — à lire avant d'y travailler, voir `CLAUDE.md` à la racine.

## Démarrage rapide

```bash
pnpm install

# Lance le prototype Marmiton (régénère automatiquement les tokens avant)
pnpm dev

# Lance Storybook — documentation du design system (port 6006)
pnpm storybook

# Build de production (tous les packages)
pnpm build
```

Pour lancer une autre app que `marmiton-prototype`, cibler le package directement :

```bash
pnpm --filter @mealz-product-team/assistant-shopping dev    # port 3002
pnpm --filter @mealz-product-team/form-mealz-planner dev    # port 3001
pnpm --filter @mealz-product-team/hub dev                    # port 3004
pnpm --filter @mealz-product-team/supermarket dev           # port 3006
```

Les scripts `dev`/`build`/`storybook` de chaque package régénèrent automatiquement les CSS de tokens avant de s'exécuter (hooks `predev`/`prebuild`/`prestorybook`) — pas besoin de lancer `tokens` à la main, sauf pour vérifier un changement de tokens Figma isolément.

---

## Architecture du projet

```
DS.MD/
├── pnpm-workspace.yaml
├── tsconfig.base.json                # Options TypeScript partagées
├── package.json                      # Racine — scripts de workspace uniquement
└── packages/
    ├── design-system/                # @mealz-product-team/design-system
    │   ├── tokens/                   # Fichiers de tokens Figma (W3C JSON)
    │   ├── sd.config.js              # Configuration Style Dictionary
    │   ├── scripts/verify-tokens.mjs       # Vérifie l'absence de collision hand-written / généré
    │   ├── scripts/verify-design-docs.mjs  # Vérifie qu'un composant Storybook a bien son .design.md
    │   ├── docs/DESIGN.md            # Guide de design system pour agents (cascade tokens, quel composant pour quel besoin)
    │   ├── .storybook/                # Configuration Storybook
    │   ├── postcss.config.mjs
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts               # Barrel — tous les composants ui/ exportés
    │       ├── components/ui/         # Composants primitifs réutilisables (display, feedback, form, layout, navigation, product, typography)
    │       ├── devtools/               # BrandThemeSwitcher, script anti-FOUC (pas des composants DS "produit")
    │       ├── hooks/useMediaQuery.ts
    │       └── styles/
    │           ├── index.css          # Entry point global (Tailwind + tokens + reset)
    │           ├── fonts.css
    │           ├── dist/              # Généré par `tokens`, gitignored
    │           └── tokens/
    │               ├── base.css       # Spacing/Shape/Elevation/Font Family/Font Weight (jamais générés)
    │               ├── layout.css     # Grille layout (colonnes/marge/gutter par breakpoint), hand-written
    │               ├── color-light.css # Exceptions brand-indirection — mode clair
    │               ├── color-dark.css  # Exceptions brand-indirection — mode sombre
    │               ├── brands/         # neutral.css, marmiton.css, coursesu.css + brands.ts (registre)
    │               └── partners/       # carrefour.css — overrides via [data-partner]
    │
    ├── marmiton-prototype/            # @mealz-product-team/marmiton-prototype — prototype Marmiton × Carrefour
    ├── assistant-shopping/            # @mealz-product-team/assistant-shopping — Assistant Shopping ChatGPT
    ├── form-mealz-planner/            # @mealz-product-team/form-mealz-planner — "Quick Features"
    ├── hub/                           # @mealz-product-team/hub — hub multi-client (gate + brand lock + prototypes)
    └── supermarket/                   # @mealz-product-team/supermarket — démo drive catalogue + planner
```

Chaque app consommatrice Next.js suit la même convention interne : `app/` (routes), `src/components/` (composants métier), `src/data/` (mock data + types), `docs/` (brief produit). Voir le détail de `marmiton-prototype` en fin de section « Composants ».

---

## Système de thèmes

Le design system supporte le **multi-brand** et le **dark/light mode** via des attributs HTML et des CSS custom properties — ce mécanisme est au cœur du package `design-system` et fonctionne indépendamment de tout framework.

### Activation

```html
<!-- Brand + color scheme définis sur <html> -->
<html data-brand="neutral" data-color-scheme="light">
```

Un attribut `data-partner` optionnel permet en plus d'appliquer des overrides propres à un partenaire retailer (ex. `carrefour`), au-dessus de la couche brand.

### ThemeProvider (côté app, ex. marmiton-prototype)

`ThemeProvider`/`useTheme` est un wrapper React de confort autour de ces attributs — il vit dans l'app consommatrice (`packages/marmiton-prototype/src/themes`), pas dans le design system lui-même :

```tsx
import { ThemeProvider, useTheme } from '@/themes'

export default function App({ children }) {
  return (
    <ThemeProvider defaultBrand="neutral" defaultColorScheme="light">
      {children}
    </ThemeProvider>
  )
}

function MyComponent() {
  const { theme, setBrand, setColorScheme } = useTheme()
  return (
    <button onClick={() => setColorScheme('dark')}>
      Mode : {theme.colorScheme}
    </button>
  )
}
```

Les autres apps Next.js du monorepo (`assistant-shopping`, `form-mealz-planner`, `hub`, `supermarket`) utilisent à la place `BrandThemeSwitcher` (`devtools/BrandThemeSwitcher`), un sélecteur de thème client intégré au `layout.tsx` — voir la règle d'intégration dans `CLAUDE.md` racine.

### Brands disponibles

| Valeur | Description |
|---|---|
| `neutral` | Brand neutre (défaut) |
| `marmiton` | Marmiton |
| `coursesu` | CoursesU (retailer) |

Le partenaire `carrefour` s'applique via `data-partner`, en overlay d'une brand, plutôt que comme une brand à part entière (voir `styles/tokens/partners/carrefour.css`).

---

## Tokens de design

Les tokens sont générés depuis les exports Figma (format W3C/DTCG JSON, dossier `packages/design-system/tokens/`) via **Style Dictionary**, pour les catégories qui ont un export Figma : couleurs (light/dark) et typographie (desktop/mobile).

```bash
pnpm --filter @mealz-product-team/design-system tokens          # régénère les CSS
pnpm --filter @mealz-product-team/design-system verify-tokens   # vérifie l'absence de collision
```

`sd.config.js` construit **4 instances Style Dictionary indépendantes** (une par fichier source : `color-Light`, `color-Dark`, `typo-Desktop`, `typo-Mobile`) plutôt qu'une seule — nécessaire car light/dark (et desktop/mobile) réutilisent volontairement les mêmes noms de variable CSS pour des valeurs différentes, ce que Style Dictionary ne peut pas résoudre dans un seul build. Chaque instance produit un fichier dans `src/styles/dist/` :

- `color-light.generated.css` / `color-dark.generated.css` — scopés `[data-color-scheme="light|dark"]`
- `typography-desktop.generated.css` — `:root`
- `typography-mobile.generated.css` — scopé `@media (max-width: 767px)`, ne contient que ce qui diffère réellement du desktop (les tailles de titres, pas le corps de texte)

Un transform de nommage personnalisé (`figma/name-css`) reproduit la convention déjà utilisée partout (`--color-surface-page`, `--font-size-heading-xl`, ...). Le transform couleur reconstruit un `rgba(...)` quand une couleur Figma a une alpha < 1 (le champ `hex` de Figma est toujours opaque).

Une poignée de variables restent **volontairement hand-written** dans `color-light.css`/`color-dark.css`/`base.css`/`layout.css` : les indirections vers la couche brand (`--color-interactive-bg: var(--brand-500)`, etc. — Figma ne connaît pas cette indirection et la remplacerait par un hex figé), et `Spacing`/`Shape`/`Elevation`/`Font Family`/`Font Weight`/`label-badge`/grille de layout qui n'ont pas (encore) de source Figma. `verify-tokens.mjs` vérifie en continu que ces exceptions et les fichiers générés ne définissent jamais la même variable.

### Catégories de tokens

| Catégorie | Préfixe CSS | Généré ou hand-written |
|---|---|---|
| Couleurs surface/contenu/bordure/interactif/sémantique | `--color-*` | Généré (sauf indirections brand) |
| Spacing | `--spacing-*` | Hand-written |
| Formes (border-radius) | `--shape-*` | Hand-written |
| Élévation (ombres) | `--elevation-*` | Hand-written |
| Grille layout (colonnes/marge/gutter par breakpoint) | `--layout-*` | Hand-written |
| Typographie (taille, interligne) | `--font-size-*`, `--line-height-*` | Généré (sauf label-badge) |
| Typographie (famille, poids) | `--font-family-*`, `--font-weight-*` | Hand-written |

---

## Composants

Chaque composant suit la structure :

```
ComponentName/
├── ComponentName.tsx      # Composant React + types exportés
├── ComponentName.css      # Styles (classes BEM + Tailwind)
├── ComponentName.stories.tsx  # Stories Storybook
└── ComponentName.design.md    # Doc d'usage : variants, states, tokens, accessibilité
```

### Conventions

- **Variants** : gérés via CVA (`class-variance-authority`)
- **Styles** : classes BEM dans un `.css` dédié, tokens CSS via Tailwind v4 `@theme inline`
- **Types** : props exportées explicitement (`ButtonProps`, `ButtonVariant`, etc.)
- **Accessibilité** : attributs `aria-*` systématiques, `:focus-visible` global
- **Doc** : chaque composant Storybook doit avoir son `<Component>.design.md` (`verify-design-docs` fait échouer le build sinon) et une entrée dans la table de décision `docs/DESIGN.md` §3

### Composants du design system (`packages/design-system`)

Tous exportés depuis le barrel `@mealz-product-team/design-system`.

#### Display
| Composant | Description |
|---|---|
| `Avatar` | Avatar utilisateur avec initiales ou image |
| `Badge` | Indicateur de statut ou compteur |
| `ChipTag` | Tag/étiquette cliquable ou statique |
| `ListItem` | Élément de liste générique |

#### Feedback
| Composant | Description |
|---|---|
| `Alert` | Message d'alerte (success, danger, warning, info) |
| `Loading` | Indicateur de chargement |
| `Modal` | Dialogue modal avec backdrop |
| `Shimmering` | Effet shimmer pour le chargement |
| `Skeleton` | Placeholder de chargement |
| `Toast` | Notification temporaire |
| `Tooltip` | Info-bulle au survol |

#### Form
| Composant | Description |
|---|---|
| `Button` | Bouton avec variants (primary, secondary, tertiary, danger, alpha) |
| `Checkbox` | Case à cocher |
| `FAB` | Floating Action Button |
| `InputField` | Champ de saisie texte |
| `InputTextarea` | Zone de texte multilignes |
| `Radio` | Bouton radio |
| `Select` | Liste déroulante |
| `Stepper` | Compteur ⊖ N ⊕ |
| `Toggle` | Interrupteur on/off |

#### Layout
| Composant | Description |
|---|---|
| `Drawer` | Panneau latéral coulissant |
| `StoreHeader` | Barre de navigation principale d'un site marchand (logo, navigation, recherche, favoris, compte, panier) — plateforme Desktop |
| `BottomNav` | Barre de navigation fixée en bas de viewport (5 onglets) — équivalent `StoreHeader` pour Mobile/App |

#### Navigation
| Composant | Description |
|---|---|
| `Breadcrumb` | Fil d'Ariane |
| `DateTabs` | Onglets de sélection de date |
| `Link` | Lien stylisé |
| `Menu` | Menu dropdown |
| `Pagination` | Navigation par pages |
| `SegmentedControl` | Sélecteur segmenté |
| `Tab` | Onglets |

#### Product
Composants modélisant une entité produit/feature métier (recette, catalogue, planner), distincts des primitives UI génériques ci-dessus.

| Composant | Description |
|---|---|
| `RecipeCard` | Carte recette de grille (catalogue, collection, rayon) : visuel, titre, portions, badges, prix, favori, action panier |
| `CatalogNavigation` | Barre d'outils du catalogue de recettes : recherche, promo, favoris, filtres, préférences |
| `CatalogNavigationItem` | Pastille individuelle de `CatalogNavigation` (icône + libellé + badge optionnels) |
| `PlannerBanner` | Bannière de mise en avant du Mealz Planner (badge, accroche, avatars de recettes suggérées, CTA, sélecteur de personnes) |

#### Typography
| Composant | Description |
|---|---|
| `Heading` | Titre de section, 4 tailles visuelles avec balise HTML par défaut surchargeable via `as` |

### Composants métier des apps consommatrices

Spécifiques à chaque app, ne font pas partie du design system.

**`packages/marmiton-prototype/src/components/product`**
| Dossier | Rôle |
|---|---|
| `CarrefourLogin` | Modale de connexion partenaire |
| `Cart` | Panier (sections, rayons, assistant IA, résumé...) |
| `Checkout` | Récap commande, formulaire de paiement, confirmation |
| `ProductCard` | Carte produit |
| `PromoBanner` / `PromoSection` | Bannières et sections promotionnelles |
| `RecipeIngredientWidget` | Widget ingrédients de recette + bannière de commande |
| `StoreLocator` | Sélection de magasin |
| `TimeslotPicker` | Sélection de créneau de livraison |

**`packages/supermarket/src`**
| Dossier | Rôle |
|---|---|
| `components/CollectionView` | Rendu d'une collection de recettes (catalogue) |
| `components/QuestionCard` | Carte question du wizard planner (diète, équipement, repas, personnes) |
| `context/WizardContext` | État partagé du flow planner multi-étapes |

D'autres apps (`assistant-shopping`, `form-mealz-planner`, `home`) ont leurs propres composants métier dans `src/components/` — voir leur `docs/` respectif pour le contexte produit.

---

## Storybook

Storybook documente uniquement le design system (`packages/design-system`) — les composants métier des apps consommatrices n'y apparaissent pas, par choix (chaque app pourra avoir son propre Storybook plus tard si besoin).

Configuré avec :
- **`@storybook/addon-a11y`** : audit d'accessibilité en temps réel
- **`@storybook/addon-themes`** : switcher brand + dark/light mode dans l'UI

```bash
pnpm storybook          # Dev (port 6006)
pnpm build-storybook    # Build statique
```

---

## Scripts disponibles

Convention npm : tout script `pre<X>` se lance automatiquement avant `<X>`.

### Racine (workspace)

| Commande | Description |
|---|---|
| `pnpm dev` | Lance le prototype Marmiton (régénère les tokens avant) |
| `pnpm build` | Build de production de tous les packages |
| `pnpm storybook` | Lance Storybook (design system) sur le port 6006 |
| `pnpm build-storybook` | Build statique de Storybook |
| `pnpm tokens` | Génère les CSS de tokens (design system) |

### `packages/design-system`

| Commande | Description |
|---|---|
| `pnpm --filter @mealz-product-team/design-system tokens` | Génère les CSS depuis les tokens Figma |
| `pnpm --filter @mealz-product-team/design-system verify-tokens` | Vérifie l'absence de collision hand-written/généré |
| `pnpm --filter @mealz-product-team/design-system verify-design-docs` | Vérifie qu'un composant Storybook a bien son `.design.md` |
| `pnpm --filter @mealz-product-team/design-system storybook` | Storybook en dev |
| `pnpm --filter @mealz-product-team/design-system build-storybook` | Build statique de Storybook |
| `pnpm --filter @mealz-product-team/design-system test` | Tests unitaires (Vitest) |

### Apps consommatrices

Chaque app suit le même trio `dev`/`build`/`start` (Next.js), avec régénération automatique des tokens avant `dev`/`build` :

| Package | Port | Commande dev |
|---|---|---|
| `marmiton-prototype` | 3000 | `pnpm --filter @mealz-product-team/marmiton-prototype dev` |
| `form-mealz-planner` | 3001 | `pnpm --filter @mealz-product-team/form-mealz-planner dev` |
| `assistant-shopping` | 3002 | `pnpm --filter @mealz-product-team/assistant-shopping dev` |
| `hub` | 3004 | `pnpm --filter @mealz-product-team/hub dev` |
| `supermarket` | 3006 | `pnpm --filter @mealz-product-team/supermarket dev` |

`assistant-shopping` et `marmiton-prototype` exposent en plus un script `test` (Vitest).
