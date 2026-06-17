# DS.MD — Design System

Design system multi-brand pour Mealz, construit avec React 19, TypeScript, Tailwind CSS v4 et Storybook 10.

## Stack technique

| Outil | Version | Rôle |
|---|---|---|
| React | 19 | UI |
| TypeScript | 5.6 | Typage |
| Tailwind CSS | v4 | Utilitaires CSS |
| Next.js | 16 | App de preview |
| Storybook | 10 | Documentation interactive |
| Style Dictionary | 5 | Génération des tokens CSS depuis Figma |
| CVA | 0.7 | Variants de composants |

---

## Démarrage rapide

```bash
npm install

# Générer les CSS variables depuis les tokens Figma
npm run tokens

# Lancer Storybook (documentation interactive)
npm run storybook

# Lancer l'app Next.js de preview
npm run dev
```

---

## Architecture du projet

```
ds-md/
├── tokens/                    # Fichiers de tokens Figma (W3C JSON)
├── src/
│   ├── styles/
│   │   ├── index.css          # Entry point global (Tailwind + tokens + reset)
│   │   ├── fonts.css          # Déclarations @font-face
│   │   └── tokens/
│   │       ├── base.css       # Tokens de base (spacing, shape, typography, elevation)
│   │       ├── color-light.css # Tokens couleur — mode clair
│   │       ├── color-dark.css  # Tokens couleur — mode sombre
│   │       └── brands/
│   │           ├── neutral.css  # Palette brand neutre (défaut)
│   │           ├── client-a.css # Palette brand client A
│   │           └── client-b.css # Palette brand client B
│   ├── themes/
│   │   ├── ThemeProvider.tsx  # Context React pour brand + color scheme
│   │   └── index.ts           # Exports publics
│   ├── components/
│   │   ├── ui/                # Composants primitifs réutilisables
│   │   │   ├── display/       # Avatar, Badge, ChipTag, ListItem
│   │   │   ├── feedback/      # Alert, Loading, Modal, Shimmering, Skeleton, Toast, Tooltip
│   │   │   ├── form/          # Button, Checkbox, FAB, InputField, InputTextarea, Radio, Select, Toggle
│   │   │   ├── layout/        # Drawer
│   │   │   └── navigation/    # Breadcrumb, Link, Menu, Pagination, Tab
│   │   ├── product/           # Composants métier (à construire)
│   │   └── index.ts           # Barrel exports
│   └── assets/
│       └── icons/             # SVGs
├── app/                       # App Next.js (preview)
├── .storybook/                # Configuration Storybook
├── sd.config.js               # Configuration Style Dictionary
├── postcss.config.mjs         # Configuration PostCSS + Tailwind
└── tsconfig.json
```

---

## Système de thèmes

Le design system supporte le **multi-brand** et le **dark/light mode** via des attributs HTML et des CSS custom properties.

### Activation

```html
<!-- Brand + color scheme définis sur <html> -->
<html data-brand="neutral" data-color-scheme="light">
```

### Utilisation avec ThemeProvider

```tsx
import { ThemeProvider } from '@/themes'

export default function App({ children }) {
  return (
    <ThemeProvider defaultBrand="neutral" defaultColorScheme="light">
      {children}
    </ThemeProvider>
  )
}
```

### Hook useTheme

```tsx
import { useTheme } from '@/themes'

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

Les tokens sont générés depuis les exports Figma (format W3C JSON) via **Style Dictionary**.

```bash
# Régénérer les CSS variables
npm run tokens
```

Le fichier `sd.config.js` configure deux transforms personnalisés :
- `figma/color` : extrait `.hex` des objets couleur Figma
- `figma/number-to-px` : convertit les valeurs numériques en `px`

Les tokens générés sont placés dans `src/styles/dist/variables.css`.

### Catégories de tokens

| Catégorie | Préfixe CSS | Exemple |
|---|---|---|
| Couleurs surface | `--color-surface-*` | `--color-surface-page` |
| Couleurs contenu | `--color-content-*` | `--color-content-default` |
| Couleurs bordure | `--color-border-*` | `--color-border-brand` |
| Couleurs interactives | `--color-interactive-*` | `--color-interactive-bg` |
| Couleurs sémantiques | `--color-semantic-*` | `--color-semantic-success-bg` |
| Formes (border-radius) | `--shape-*` | `--shape-button` |
| Typographie | `--font-*` | `--font-size-body-md` |

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

### Composants disponibles

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
| `Toggle` | Interrupteur on/off |

#### Layout
| Composant | Description |
|---|---|
| `Drawer` | Panneau latéral coulissant |

#### Navigation
| Composant | Description |
|---|---|
| `Breadcrumb` | Fil d'Ariane |
| `Link` | Lien stylisé |
| `Menu` | Menu dropdown |
| `Pagination` | Navigation par pages |
| `Tab` | Onglets |

---

## Storybook

Storybook est configuré avec :
- **`@storybook/addon-a11y`** : audit d'accessibilité en temps réel
- **`@storybook/addon-themes`** : switcher brand + dark/light mode dans l'UI

```bash
npm run storybook        # Dev (port 6006)
npm run build-storybook  # Build statique
```

---

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Lance Next.js en mode développement |
| `npm run build` | Build de production Next.js |
| `npm run storybook` | Lance Storybook sur le port 6006 |
| `npm run build-storybook` | Build statique de Storybook |
| `npm run tokens` | Génère les CSS variables depuis les tokens Figma |
