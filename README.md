# DS.MD — Design System

Monorepo pnpm pour Mealz : un design system multi-brand pur (`packages/design-system`) et un premier prototype qui le consomme (`packages/marmiton-prototype`), construits avec React 19, TypeScript, Tailwind CSS v4 et Storybook 10.

## Stack technique

| Outil | Version | Rôle |
|---|---|---|
| pnpm | 11 | Gestionnaire de paquets + workspace monorepo |
| React | 19 | UI |
| TypeScript | 5.6 | Typage |
| Tailwind CSS | v4 | Utilitaires CSS |
| Next.js | 16 | App du prototype Marmiton |
| Storybook | 10 | Documentation interactive du design system |
| Style Dictionary | 5 | Génération des tokens CSS depuis Figma |
| CVA | 0.7 | Variants de composants |

---

## Pourquoi un monorepo

Le design system (`packages/design-system`) est indépendant de tout produit : composants UI purs, tokens, Storybook. Chaque prototype (Marmiton aujourd'hui, d'autres demain) vit dans son propre package sous `packages/`, et consomme le design system via `@mealz-product-team/design-system` (lien `workspace:*`, pas de publication sur un registre pour l'instant). Séparer les deux permet d'ajouter de nouveaux prototypes sans jamais toucher au design system, et inversement.

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

Les scripts `dev`/`build`/`storybook` régénèrent automatiquement les CSS de tokens avant de s'exécuter (hooks `predev`/`prebuild`/`prestorybook`) — pas besoin de lancer `tokens` à la main, sauf pour vérifier un changement de tokens Figma isolément.

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
    │   ├── scripts/verify-tokens.mjs # Vérifie l'absence de collision hand-written / généré
    │   ├── .storybook/                # Configuration Storybook
    │   ├── postcss.config.mjs
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts               # Barrel — tous les composants ui/ exportés
    │       ├── components/ui/         # Composants primitifs réutilisables
    │       ├── hooks/useMediaQuery.ts
    │       └── styles/
    │           ├── index.css          # Entry point global (Tailwind + tokens + reset)
    │           ├── fonts.css
    │           ├── dist/              # Généré par `tokens`, gitignored
    │           └── tokens/
    │               ├── base.css       # Spacing/Shape/Elevation/Font Family/Font Weight (jamais générés)
    │               ├── color-light.css # Exceptions brand-indirection — mode clair
    │               ├── color-dark.css  # Exceptions brand-indirection — mode sombre
    │               ├── brands/         # neutral.css, client-a.css, client-b.css
    │               └── partners/       # carrefour.css
    │
    └── marmiton-prototype/           # @mealz-product-team/marmiton-prototype
        ├── app/                      # App Next.js (prototype Marmiton)
        ├── public/
        ├── next.config.ts            # transpilePackages: design-system
        ├── tsconfig.json
        └── src/
            ├── components/product/   # Composants métier (Cart, ProductCard, RecipeIngredientWidget, ...)
            ├── context/               # CartContext
            ├── data/                  # Mock data + types
            ├── themes/                # ThemeProvider (wrapper de confort sur data-brand/data-color-scheme)
            └── assets/
```

---

## Système de thèmes

Le design system supporte le **multi-brand** et le **dark/light mode** via des attributs HTML et des CSS custom properties — ce mécanisme est au cœur du package `design-system` et fonctionne indépendamment de tout framework.

### Activation

```html
<!-- Brand + color scheme définis sur <html> -->
<html data-brand="neutral" data-color-scheme="light">
```

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

### Brands disponibles

| Valeur | Description |
|---|---|
| `neutral` | Brand neutre (défaut) |
| `client-a` | Brand client A |
| `client-b` | Brand client B |

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

Une poignée de variables restent **volontairement hand-written** dans `color-light.css`/`color-dark.css`/`base.css` : les indirections vers la couche brand (`--color-interactive-bg: var(--brand-500)`, etc. — Figma ne connaît pas cette indirection et la remplacerait par un hex figé), et `Spacing`/`Shape`/`Elevation`/`Font Family`/`Font Weight`/`label-badge` qui n'ont pas (encore) de source Figma. `verify-tokens.mjs` vérifie en continu que ces exceptions et les fichiers générés ne définissent jamais la même variable.

### Catégories de tokens

| Catégorie | Préfixe CSS | Généré ou hand-written |
|---|---|---|
| Couleurs surface/contenu/bordure/interactif/sémantique | `--color-*` | Généré (sauf indirections brand) |
| Spacing | `--spacing-*` | Hand-written |
| Formes (border-radius) | `--shape-*` | Hand-written |
| Élévation (ombres) | `--elevation-*` | Hand-written |
| Typographie (taille, interligne) | `--font-size-*`, `--line-height-*` | Généré (sauf label-badge) |
| Typographie (famille, poids) | `--font-family-*`, `--font-weight-*` | Hand-written |

---

## Composants

Chaque composant suit la structure :

```
ComponentName/
├── ComponentName.tsx      # Composant React + types exportés
├── ComponentName.css      # Styles (classes BEM + Tailwind)
└── ComponentName.stories.tsx  # Stories Storybook
```

### Conventions

- **Variants** : gérés via CVA (`class-variance-authority`)
- **Styles** : classes BEM dans un `.css` dédié, tokens CSS via Tailwind v4 `@theme inline`
- **Types** : props exportées explicitement (`ButtonProps`, `ButtonVariant`, etc.)
- **Accessibilité** : attributs `aria-*` systématiques, `:focus-visible` global

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

### Composants métier (`packages/marmiton-prototype`)

Spécifiques au prototype, ne font pas partie du design system :

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

---

## Storybook

Storybook documente uniquement le design system (`packages/design-system`) — les composants métier du prototype n'y apparaissent pas, par choix (le prototype pourra avoir son propre Storybook plus tard si besoin).

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
| `pnpm --filter @mealz-product-team/design-system storybook` | Storybook en dev |
| `pnpm --filter @mealz-product-team/design-system build-storybook` | Build statique de Storybook |

### `packages/marmiton-prototype`

| Commande | Description |
|---|---|
| `pnpm --filter @mealz-product-team/marmiton-prototype dev` | Next.js en dev (régénère les tokens du design system avant) |
| `pnpm --filter @mealz-product-team/marmiton-prototype build` | Build de production Next.js |
| `pnpm --filter @mealz-product-team/marmiton-prototype start` | Sert le build de production |
