# DS.MD — Design System Tokens

> Référence exhaustive pour les agents Cursor. Dernière synchronisation Figma : 2026-06-22.
> Complément de `ds-md-rules.md` (règles de workflow) — ce fichier documente les **valeurs**.

> **Maintenance — obligation de l'agent :** ce fichier DOIT être mis à jour immédiatement après toute modification du design system :
> - **Variable Figma ajoutée/modifiée** (Semantics, Typography) → mettre à jour les sections 2–5 et la date de sync ci-dessus
> - **Text style ajouté/modifié** → mettre à jour la section 5.2
> - **Effect style ajouté/modifié** → mettre à jour la section 6
> - **Nouveau composant UI** (`src/components/ui/`) → ajouter une ligne en section 7
> - **Variants/props d'un composant modifiés** (stories ou `.tsx`) → mettre à jour la ligne correspondante en section 7
>
> Pour re-extraire les tokens depuis Figma : exécuter le script `use_figma` de lecture des variables (fileKey `ES4RxHAafQbIwWLTzHnyFF`), puis mettre à jour les sections concernées et la date ci-dessus.

---

## 0. Règles d'usage

- **Jamais de valeur en dur.** Toujours référencer un token CSS ou une variable Figma.
- **Jamais binder les Primitives directement** sur un composant. Toujours passer par les alias **Semantics**.
- **Notation CSS** : les variables CSS suivent le pattern `--{catégorie}-{chemin-figma-kebab-case}`.
  - `Surface/Primary` → `--color-surface-primary`
  - `Spacing/16` → `--spacing-16`
  - `Shape/Input` → `--shape-input`
  - `Font Size/Body/MD` → `--font-size-body-md`
- **Theming** : les tokens couleur changent automatiquement via `data-color-scheme="light|dark"` (géré par Style Dictionary).

---

## 1. Collections Figma

| Collection | ID Figma | Modes | Rôle |
|---|---|---|---|
| **Primitives** | `VariableCollectionId:1:2` | Light / Dark | Valeurs brutes — **ne jamais binder directement** |
| **Semantics** | `VariableCollectionId:3:3` | Light / Dark | Alias sémantiques — **utiliser en priorité** |
| **Typography** | `VariableCollectionId:3:4` | Desktop / Mobile | Tailles, hauteurs de ligne, familles |

---

## 2. Couleurs — Collection Semantics

### 2.1 Surface

Scope Figma : `FRAME_FILL`, `SHAPE_FILL`

| Token Figma | CSS var | Light → Primitive | Dark → Primitive | Description |
|---|---|---|---|---|
| `Surface/Page` | `--color-surface-page` | White/100% | Dark/100% | Fond racine — appliquer au `body` ou wrapper de niveau 0 |
| `Surface/Primary` | `--color-surface-primary` | White/100% | Dark/100% | Surfaces élevées : cards, modals, sidesheets |
| `Surface/Secondary` | `--color-surface-secondary` | Sand/50 | Sand/50 | Surfaces chaudes basse emphase : tags, pills, sections inset |
| `Surface/Inverse` | `--color-surface-inverse` | Dark/100% | White/100% | Sections inversées (header sombre, hero). Toujours associer à `Content/Inversed` |
| `Surface/Primary Hover` | `--color-surface-primary-hover` | Dark/5% | White/5% | Hover de surfaces interactives basées sur Surface/Primary |
| `Surface/Secondary Hover` | `--color-surface-secondary-hover` | Sand/200 | Sand/200 | Hover de tags et pills basés sur Surface/Secondary |
| `Surface/Overlay` | `--color-surface-overlay` | Dark/60% | Dark/60% | Scrim semi-transparent derrière modals et drawers |
| `Surface/Brand` | `--color-surface-brand` | Blue/500 | Blue/500 | Surface colorée brand — badges brand solides |
| `Surface/Brand Light` | `--color-surface-brand-light` | Blue/50 | Blue/50 | Fond brand basse emphase — chips, badges, highlights |
| `Surface/Brand Dark` | `--color-surface-brand-dark` | Blue/950 | Blue/950 | Fond brand haute emphase en mode sombre |

### 2.2 Content

Scope Figma : `ALL_FILLS`

| Token Figma | CSS var | Light → Primitive | Dark → Primitive | Description |
|---|---|---|---|---|
| `Content/Default` | `--color-content-default` | Dark/100% | White/100% | Couleur principale texte et icône sur fond clair |
| `Content/Inversed` | `--color-content-inversed` | White/100% | Dark/100% | Texte/icône sur Surface/Inverse ou fond foncé |
| `Content/Weak` | `--color-content-weak` | Dark/60% | White/60% | Texte secondaire : métadonnées, captions, placeholders, helper text |
| `Content/Weak Inversed` | `--color-content-weak-inversed` | White/60% | Dark/60% | Texte secondaire sur Surface/Inverse |

### 2.3 Border

Scope Figma : `STROKE_COLOR`

| Token Figma | CSS var | Light → Primitive | Dark → Primitive | Description |
|---|---|---|---|---|
| `Border/Default` | `--color-border-default` | Dark/10% | White/10% | Bordure standard (cards, inputs, containers, dividers majeurs) |
| `Border/Weak` | `--color-border-weak` | Dark/5% | White/5% | Séparateur subtil entre items de liste |
| `Border/Brand` | `--color-border-brand` | Brand/500 | Brand/500 | Bordure état sélectionné/focus/actif |
| `Border/Danger` | `--color-border-danger` | Red/500 | Red/500 | Bordure état d'erreur de validation |

### 2.4 Interactive

Scope Figma : `ALL_FILLS`, `STROKE_COLOR`

| Token Figma | CSS var | Light → Primitive | Dark → Primitive | Description |
|---|---|---|---|---|
| `Interactive/BG` | `--color-interactive-bg` | Brand/500 | White/100% | Fill primaire des boutons principaux et CTAs |
| `Interactive/BG Subtle` | `--color-interactive-bg-subtle` | Brand/50 | Brand/50 | Fond hover des boutons Ghost et Outline |
| `Interactive/BG Hover` | `--color-interactive-bg-hover` | Brand/700 | Brand/300 | Hover des éléments interactifs primaires |
| `Interactive/Content` | `--color-interactive-content` | Brand/500 | Brand/500 | Texte/icône brand — labels ghost/outline, liens inline |
| `Interactive/Border` | `--color-interactive-border` | Brand/500 | Brand/500 | Bordure éléments outlined et ghost |
| `Interactive/Disabled BG` | `--color-interactive-disabled-bg` | Neutral/300 | Neutral/300 | Fond état désactivé |
| `Interactive/Disabled Content` | `--color-interactive-disabled-content` | Neutral/400 | Neutral/400 | Texte/icône état désactivé |
| `Interactive/Alpha BG` | `--color-interactive-alpha-bg` | Dark/60% | Dark/60% | Fond semi-transparent avec blur — boutons sur image |
| `Interactive/Alpha BG Hover` | `--color-interactive-alpha-bg-hover` | Dark/30% | Dark/30% | Hover du fond alpha |
| `Interactive/Danger BG` | `--color-interactive-danger-bg` | Red/50 | Red/50 | Fond boutons danger Ghost/Outline et lignes en erreur |
| `Interactive/Danger BG Hover` | `--color-interactive-danger-bg-hover` | Red/100 | Red/100 | Hover boutons danger |
| `Interactive/Danger Content` | `--color-interactive-danger-content` | Red/500 | Red/500 | Texte/icône actions destructives |

### 2.5 Semantic (États métier)

Scope Figma : `ALL_FILLS`, `STROKE_COLOR`

| Token Figma | CSS var | Light → Primitive | Description |
|---|---|---|---|
| `Semantic/Success/BG` | `--color-semantic-success-bg` | Green/500 | Fond solide succès (badges remplis, icônes toast) |
| `Semantic/Success/BG Light` | `--color-semantic-success-bg-light` | Green/50 | Fond teinté succès (alerts inline, banners, tags) |
| `Semantic/Success/Content` | `--color-semantic-success-content` | Green/600 | Texte/icône sur Success/BG Light |
| `Semantic/Danger/BG` | `--color-semantic-danger-bg` | Red/500 | Fond solide erreur |
| `Semantic/Danger/BG Light` | `--color-semantic-danger-bg-light` | Red/50 | Fond teinté erreur (alerts, banners, tags) |
| `Semantic/Danger/Content` | `--color-semantic-danger-content` | Red/600 | Texte/icône sur Danger/BG Light |
| `Semantic/Warning/BG` | `--color-semantic-warning-bg` | Yellow/500 | Fond solide avertissement |
| `Semantic/Warning/BG Light` | `--color-semantic-warning-bg-light` | Yellow/50 | Fond teinté avertissement |
| `Semantic/Warning/Content` | `--color-semantic-warning-content` | Yellow/600 | Texte/icône sur Warning/BG Light |
| `Semantic/Info/BG` | `--color-semantic-info-bg` | Blue/500 | Fond solide info |
| `Semantic/Info/BG Light` | `--color-semantic-info-bg-light` | Blue/50 | Fond teinté info |
| `Semantic/Info/Content` | `--color-semantic-info-content` | Blue/600 | Texte/icône sur Info/BG Light |

> Note : les valeurs Light et Dark sont identiques pour tous les tokens Semantic.

### 2.6 Category (configurable par client)

Scope Figma : `ALL_SCOPES` — valeurs définies par intégration client, non interchangeables.

| Token Figma | CSS var | Par défaut Light | Usage |
|---|---|---|---|
| `Category/Promo/BG` | `--color-category-promo-bg` | Red/500 | Badge "Promo" solide |
| `Category/Promo/BG Light` | `--color-category-promo-bg-light` | Red/100 | Chip/tag "Promo" teinté |
| `Category/Promo/Content` | `--color-category-promo-content` | Red/500 | Texte "Promo" |
| `Category/New/BG` | `--color-category-new-bg` | _client_ | Badge "New" solide |
| `Category/New/BG Light` | `--color-category-new-bg-light` | _client_ | Chip/tag "New" teinté |
| `Category/New/Content` | `--color-category-new-content` | _client_ | Texte "New" |
| `Category/Healthy/BG` | `--color-category-healthy-bg` | _client_ | Badge "Healthy" solide |
| `Category/Healthy/BG Light` | `--color-category-healthy-bg-light` | _client_ | Chip/tag "Healthy" teinté |
| `Category/Healthy/Content` | `--color-category-healthy-content` | _client_ | Texte "Healthy" |
| `Category/Express/BG` | `--color-category-express-bg` | _client_ | Badge "Express" solide |
| `Category/Express/BG Light` | `--color-category-express-bg-light` | _client_ | Chip/tag "Express" teinté |
| `Category/Express/Content` | `--color-category-express-content` | _client_ | Texte "Express" |
| `Category/Low Cost/BG` | `--color-category-low-cost-bg` | _client_ | Badge "Low Cost" solide |
| `Category/Low Cost/BG Light` | `--color-category-low-cost-bg-light` | _client_ | Chip/tag "Low Cost" teinté |
| `Category/Low Cost/Content` | `--color-category-low-cost-content` | _client_ | Texte "Low Cost" |

---

## 3. Spacing — Collection Semantics

Scope Figma : `GAP` — alias vers les Primitives correspondants.

| Token Figma | CSS var | Valeur | Description Figma |
|---|---|---|---|
| `Spacing/2` | `--spacing-2` | 2px | — |
| `Spacing/4` | `--spacing-4` | 4px | Extra-small — espacement tight entre éléments inline |
| `Spacing/8` | `--spacing-8` | 8px | Small — padding compact dans les composants (chips, badges) |
| `Spacing/12` | `--spacing-12` | 12px | Small-medium — padding composants compacts, rythme vertical |
| `Spacing/16` | `--spacing-16` | 16px | **Base** — padding par défaut pour la plupart des composants |
| `Spacing/20` | `--spacing-20` | 20px | Medium — padding interne des composants larges |
| `Spacing/24` | `--spacing-24` | 24px | Large — padding de section, gap entre groupes de composants |
| `Spacing/32` | `--spacing-32` | 32px | XL — padding layout majeur, espace vertical entre sections |
| `Spacing/40` | `--spacing-40` | 40px | 2XL — padding layout desktop généreux |
| `Spacing/48` | `--spacing-48` | 48px | 3XL — hero sections, espacement module, rythme vertical page |

> Primitives également disponibles : `Spacing/0` (0px), `Spacing/64` (64px) — ne pas binder directement.

---

## 4. Shape — Collection Semantics

Scope Figma : `CORNER_RADIUS` — alias vers les Primitives Radius.

| Token Figma | CSS var | → Primitives Radius | Valeur résolue | Usage |
|---|---|---|---|---|
| `Shape/Button` | `--shape-button` | Radius/Full | 999px | Boutons et contrôles interactifs principaux |
| `Shape/Input` | `--shape-input` | Radius/MD | 8px | Champs texte, selects, formulaires |
| `Shape/Card` | `--shape-card` | Radius/LG | 12px | Cards, panels, conteneurs de contenu |
| `Shape/Sheet` | `--shape-sheet` | Radius/2XL | 24px | Bottom sheets et drawers (coins supérieurs) |
| `Shape/Tag` | `--shape-tag` | Radius/Full | 999px | Tags, chips, petits labels |
| `Shape/Square` | `--shape-square` | Radius/0 | 0px | Conteneurs icône carrés, avatars carrés, thumbnails |
| `Shape/Pill` | `--shape-pill` | Radius/Full | 999px | Badges pill, toggles, boutons pill |

### Référence Primitives Radius

| Token | CSS var | Valeur |
|---|---|---|
| `Radius/0` | — | 0px |
| `Radius/SM` | — | 4px |
| `Radius/MD` | — | 8px |
| `Radius/LG` | — | 12px |
| `Radius/XL` | — | 16px |
| `Radius/2XL` | — | 24px |
| `Radius/Full` | — | 999px |

---

## 5. Typography

### 5.1 Variables — Collection Typography (Desktop / Mobile)

**Font Family** — identique Desktop et Mobile

| Token Figma | Valeur |
|---|---|
| `Font Family/Heading` | Satoshi |
| `Font Family/Body` | Satoshi |
| `Font Family/Label` | Satoshi |
| `Font Family/Price` | Satoshi |

**Font Size**

| Token Figma | CSS var | Desktop | Mobile |
|---|---|---|---|
| `Font Size/Heading/XL` | `--font-size-heading-xl` | 40px | 32px |
| `Font Size/Heading/LG` | `--font-size-heading-lg` | 32px | 24px |
| `Font Size/Heading/MD` | `--font-size-heading-md` | 24px | 20px |
| `Font Size/Heading/SM` | `--font-size-heading-sm` | 20px | 16px |
| `Font Size/Body/LG` | `--font-size-body-lg` | 18px | 18px |
| `Font Size/Body/MD` | `--font-size-body-md` | 16px | 16px |
| `Font Size/Body/SM` | `--font-size-body-sm` | 14px | 14px |
| `Font Size/Body/XS` | `--font-size-body-xs` | 12px | 12px |
| `Font Size/Label/LG` | `--font-size-label-lg` | 16px | 16px |
| `Font Size/Label/MD` | `--font-size-label-md` | 14px | 14px |
| `Font Size/Label/SM` | `--font-size-label-sm` | 12px | 12px |
| `Font Size/Price/LG` | `--font-size-price-lg` | 20px | 20px |
| `Font Size/Price/MD` | `--font-size-price-md` | 16px | 16px |
| `Font Size/Price/SM` | `--font-size-price-sm` | 14px | 14px |
| `Font Size/Price/Strike` | `--font-size-price-strike` | 12px | 12px |

**Line Height**

| Token Figma | CSS var | Desktop | Mobile |
|---|---|---|---|
| `Line Height/Heading/XL` | `--line-height-heading-xl` | 44px | 36px |
| `Line Height/Heading/LG` | `--line-height-heading-lg` | 36px | 28px |
| `Line Height/Heading/MD` | `--line-height-heading-md` | 28px | 24px |
| `Line Height/Heading/SM` | `--line-height-heading-sm` | 24px | 20px |
| `Line Height/Body/LG` | `--line-height-body-lg` | 24px | 24px |
| `Line Height/Body/MD` | `--line-height-body-md` | 20px | 20px |
| `Line Height/Body/SM` | `--line-height-body-sm` | 16px | 16px |
| `Line Height/Body/XS` | `--line-height-body-xs` | 16px | 16px |
| `Line Height/Label/LG` | `--line-height-label-lg` | 16px | 16px |
| `Line Height/Label/MD` | `--line-height-label-md` | 16px | 16px |
| `Line Height/Label/SM` | `--line-height-label-sm` | 12px | 12px |
| `Line Height/Price/LG` | `--line-height-price-lg` | 20px | 20px |
| `Line Height/Price/MD` | `--line-height-price-md` | 16px | 16px |
| `Line Height/Price/SM` | `--line-height-price-sm` | 14px | 14px |
| `Line Height/Price/Strike` | `--line-height-price-strike` | 12px | 12px |

### 5.2 Text Styles (19 styles)

> Appliquer via `textStyleId` — ne jamais setter font/size manuellement. Toujours charger la font avant modification.

| Style Figma | Famille | Graisse | Taille | LH | Usage |
|---|---|---|---|---|---|
| `Heading/XL` | Satoshi | Bold | 40 | 44 | Titres hero et de page — Desktop: 40/44, Mobile: 32/36 |
| `Heading/LG` | Satoshi | Bold | 32 | 36 | En-têtes de section et titres de contenu majeurs — Desktop: 32/36, Mobile: 24/28 |
| `Heading/MD` | Satoshi | Bold | 24 | 28 | En-têtes de sous-section, titres de cards — Desktop: 24/28, Mobile: 20/24 |
| `Heading/SM` | Satoshi | Bold | 20 | 24 | Petits en-têtes, labels de groupe, titres de section de liste — Desktop: 20/24, Mobile: 16/20 |
| `Body/LG` | Satoshi | Regular | 18 | 24 | Corps large pour éditorial ou paragraphes d'introduction |
| `Body/MD` | Satoshi | Regular | 16 | 20 | **Corps par défaut** — descriptions et contenu |
| `Body/SM` | Satoshi | Regular | 14 | 16 | Corps secondaire — informations de support et métadonnées |
| `Body/XS` | Satoshi | Regular | 12 | 16 | Niveau caption — timestamps, mentions légales |
| `Body Bold/LG` | Satoshi | Bold | 18 | 24 | Corps large emphatisé — utiliser à la place de CTRL+B |
| `Body Bold/MD` | Satoshi | Bold | 16 | 20 | Corps standard emphatisé — utiliser à la place de CTRL+B |
| `Body Bold/SM` | Satoshi | Bold | 14 | 16 | Corps secondaire emphatisé — utiliser à la place de CTRL+B |
| `Body Bold/XS` | Satoshi | Bold | 12 | 16 | Caption emphatisée — utiliser à la place de CTRL+B |
| `Label/LG` | Satoshi | Medium | 16 | 16 | Labels de boutons, onglets, navigation (taille par défaut) |
| `Label/MD` | Satoshi | Medium | 14 | 16 | Labels de boutons petits, tags, chips, labels de formulaires |
| `Label/SM` | Satoshi | Medium | 12 | 12 | Petits badges, chips compacts, labels UI secondaires |
| `Price/LG` | Satoshi | Bold | 20 | 20 | Prix principal sur product cards et page détail |
| `Price/MD` | Satoshi | Bold | 16 | 16 | Prix inline dans les composants compacts |
| `Price/SM` | Satoshi | Bold | 14 | 14 | Prix en listes ou layouts denses |
| `Price/Strike` | Satoshi | Medium | 12 | 12 | Prix barré (original avant remise) — `textDecoration: STRIKETHROUGH` |

---

## 6. Effect Styles — Élévation & Blur

> Tous les effets d'élévation utilisent `Neutral/900` (#131526) à **12% d'opacité**, `blendMode: NORMAL`.

### 6.1 Shadows vers le haut (downward cast)

| Style Figma | CSS suggestion | offset Y | blur | spread | Usage |
|---|---|---|---|---|---|
| `Elevation/100` | `box-shadow: 0 1px 4px rgba(19,21,38,0.12)` | +1px | 4px | 0 | Séparation minimale — headers, footers flottants |
| `Elevation/200` | `box-shadow: 0 2px 8px rgba(19,21,38,0.12)` | +2px | 8px | 0 | Cards de base, popovers légers |
| `Elevation/300` | `box-shadow: 0 4px 12px rgba(19,21,38,0.12)` | +4px | 12px | 0 | Dropdowns, menus contextuels |
| `Elevation/400` | `box-shadow: 0 8px 16px rgba(19,21,38,0.12)` | +8px | 16px | 0 | Modals, tooltips, drawers |
| `Elevation/500` | `box-shadow: 0 16px 24px rgba(19,21,38,0.12)` | +16px | 24px | 0 | Éléments fortement élevés |
| `Elevation/600` | `box-shadow: 0 24px 32px rgba(19,21,38,0.12)` | +24px | 32px | 0 | Élévation maximale |

### 6.2 Shadows vers le bas (upward cast — bottom sheets, sticky headers)

| Style Figma | CSS suggestion | offset Y | blur | spread |
|---|---|---|---|---|
| `Elevation/-100` | `box-shadow: 0 -1px 4px rgba(19,21,38,0.12)` | -1px | 4px | 0 |
| `Elevation/-200` | `box-shadow: 0 -2px 8px rgba(19,21,38,0.12)` | -2px | 8px | 0 |
| `Elevation/-300` | `box-shadow: 0 -4px 12px rgba(19,21,38,0.12)` | -4px | 12px | 0 |
| `Elevation/-400` | `box-shadow: 0 -8px 16px rgba(19,21,38,0.12)` | -8px | 16px | 0 |
| `Elevation/-500` | `box-shadow: 0 -16px 24px rgba(19,21,38,0.12)` | -16px | 24px | 0 |
| `Elevation/-600` | `box-shadow: 0 -24px 32px rgba(19,21,38,0.12)` | -24px | 32px | 0 |

### 6.3 Blur

| Style Figma | Type | Radius | CSS suggestion | Usage |
|---|---|---|---|---|
| `Blur/BG` | BACKGROUND_BLUR | 8px | `backdrop-filter: blur(8px)` | Boutons alpha, surfaces frosted-glass sur image |

---

## 7. Component Registry

> Registre léger — **pas de documentation complète ici** (voir `[Composant].design.md` et Storybook autodocs).
> Import depuis `@/components` (barrel export via `src/components/index.ts`).

### 7.1 Display

| Composant | Import | Variants / Props clés | Figma |
|---|---|---|---|
| `Avatar` | `import { Avatar } from '@/components'` | `size`: XS\|S\|M\|L\|XL · `shape`: circle\|square · `initials` ou `src`+`alt` | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=335-638) |
| `Badge` | `import { Badge } from '@/components'` | `variant`: default\|brand\|success\|danger\|warning\|info · `size`: M\|S · `dot`: boolean | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=333-618) |
| `ChipTag` | `import { ChipTag } from '@/components'` | `type`: filled\|toned\|neutral-filled\|neutral-outline\|alpha · `category`: promo\|new\|healthy\|express\|low-cost · `appearance`: solid\|toned · `size`: L\|M\|S · `selected` · `onRemove` · `onClick` | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=380-430) |
| `ListItem` | `import { ListItem } from '@/components'` | `label` · `description` · `onClick` (rend interactif) · `disabled` | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=374-1309) |

**Notes Badge :**
- Usage réservé aux **compteurs numériques** (ex. nombre d'articles panier) et **indicateurs de statut** (point coloré). Pas pour les étiquettes produit.

**Notes ChipTag :**
- `type` — styles génériques (filtres, recettes, overlays alpha)
- `category` — tags produit / merchandising (`promo`, `new`, `healthy`, `express`, `low-cost`). Remplace `type` quand défini. Tokens `Category/*`.
- `appearance` — avec `category` : `solid` (fond plein, sur image) ou `toned` (fond clair, sur surface)
- `filled` — filtre actif/sélectionné
- `toned` — usage contextuel libre
- `neutral-filled` — tag statique sur fond clair
- `neutral-outline` — tag de recette, non cliquable
- `alpha` — sur image uniquement (fond semi-transparent)

### 7.2 Feedback

| Composant | Import | Variants / Props clés | Figma |
|---|---|---|---|
| `Alert` | `import { Alert } from '@/components'` | `variant`: success\|danger\|warning\|info · `title` · `children` · `onDismiss` | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=332-801) |
| `Loading` | `import { Loading } from '@/components'` | `size`: S\|M\|L · `label` (optionnel) | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=380-301) |
| `Modal` | `import { Modal } from '@/components'` | `open` · `onClose` · `title` · `size`: M · `footer` (ReactNode) | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=334-715) |
| `Shimmering` | `import { Shimmering } from '@/components'` | `width` · `height` · `borderRadius` (ex: `var(--shape-card)`) | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=380-312) |
| `Skeleton` | `import { Skeleton } from '@/components'` | `variant`: rect\|text\|circle · `width` · `height` · `lines` (pour text) | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=380-301) |
| `Toast` | `import { Toast } from '@/components'` | `variant`: default\|success\|danger\|warning\|info · `title` · `description` · `action` · `onDismiss` | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=332-702) |
| `Tooltip` | `import { Tooltip } from '@/components'` | `content` · `placement`: top\|bottom\|left\|right · wrapper autour de l'élément cible | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=334-622) |

### 7.3 Form

| Composant | Import | Variants / Props clés | Figma |
|---|---|---|---|
| `Button` | `import { Button } from '@/components'` | `variant`: primary\|secondary\|tertiary\|danger\|alpha · `size`: L\|M\|S · `loading` · `disabled` · `label` · `lIcon` · `rIcon` | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=345-1158) |
| `Checkbox` | `import { Checkbox } from '@/components'` | `label` · `state`: default\|error · `defaultChecked` · `indeterminate` · `disabled` | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=310-645) |
| `FAB` | `import { FAB } from '@/components'` | `size`: S\|M\|L · `alpha`: boolean · `disabled` · `icon` | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=380-1043) |
| `InputField` | `import { InputField } from '@/components'` | `state`: default\|error\|disabled · `label` · `placeholder` · `helperText` · `errorText` · `lIcon` · `rIcon` | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=345-1515) |
| `InputTextarea` | `import { InputTextarea } from '@/components'` | `state`: default\|error\|disabled · `label` · `placeholder` · `errorText` | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=309-640) |
| `Radio` | `import { Radio } from '@/components'` | `label` · `name` · `defaultChecked` · `disabled` | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=345-1511) |
| `Select` | `import { Select } from '@/components'` | `options`: `{value, label}[]` · `state`: default\|error\|disabled · `label` · `placeholder` · `errorText` | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=316-743) |
| `Stepper` | `import { Stepper } from '@/components'` | `value` · `onChange` · `min` · `max` · `size`: S\|M · `disabled` | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=380-1043) |
| `Toggle` | `import { Toggle } from '@/components'` | `label` · `size`: M\|S · `defaultChecked` · `disabled` | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=309-640) |

**Notes Button :**
- `primary` — CTA principal, 1 seul par section
- `secondary` — CTA secondaire (outlined)
- `tertiary` — action tertiaire (ghost)
- `danger` — actions destructives uniquement
- `alpha` — sur image/fond coloré (semi-transparent avec blur)

### 7.3b Product

| Composant | Import | Variants / Props clés | Figma |
|---|---|---|---|
| `ProductCard` | `import { ProductCard } from '@/components'` | `context`: catalog\|cart · `orientation`: vertical\|horizontal · `product`: Product · `onAdd`: callback (catalog) · `quantity` / `onQuantityChange` / `onRemove` / `onReplace` (cart) | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=461-211) |
| `PromoSection` | `import { PromoSection } from '@/components'` | `products`: Product[] · `onAdd`: callback · `onViewAll`: callback | — |

**Notes ProductCard :**
- `vertical` — carte portrait : image pleine largeur en haut, contenu + prix en bas. Largeur fixe 140px, idéale pour les grilles.
- `horizontal` — carte liste (Figma) : 2 lignes — ligne 1 image (56px) + détails, ligne 2 prix + stepper/ajouter. Largeur 100%, idéale pour listes scrollables et promos.
- `context="cart"` — variante panier : layout horizontal implicite, prix total (`price × quantity`), CTA remove (tertiary iconOnly, opacity 0.7) et remplacer. Props contrôlées (`quantity`, `onQuantityChange`, `onRemove`). Utilisé dans `CartSection`.
- `promo` — tag promo via `ChipTag category="promo"` (plus de badge custom). Prix barré si `product.promo` défini.

**Notes PromoSection :**
- Section "Promos du moment" pour le panier. Scroll horizontal masqué (`scrollbar-width: none`).
- Utilise `ProductCard` en mode `vertical` (min 160px, max 200px) en interne.
- `onViewAll` optionnel — si absent, le CTA "Voir tout" n'est pas affiché.

### 7.4 Layout

| Composant | Import | Variants / Props clés | Figma |
|---|---|---|---|
| `Drawer` | `import { Drawer } from '@/components'` | `open` · `onClose` · `title` · `placement`: right\|left\|bottom · `mobilePlacement`: right\|left\|bottom · `footer` (ReactNode) | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=381-442) |

### 7.5 Navigation

| Composant | Import | Variants / Props clés | Figma |
|---|---|---|---|
| `Breadcrumb` | `import { Breadcrumb } from '@/components'` | `items`: `{label, href?, icon?}[]` | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=375-410) |
| `DateTabs` | `import { DateTabs } from '@/components'` | `items`: `{date: 'YYYY-MM-DD', disabled?}[]` · `value` · `onChange` | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=345-694) |
| `Link` | `import { Link } from '@/components'` | `href` · `size`: LG\|MD\|SM · `children` | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=325-619) |
| `Menu` | `import { Menu } from '@/components'` | `items`: `{value, label, icon?, divider?, danger?, disabled?}[]` · `onSelect` | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=374-1297) |
| `Pagination` | `import { Pagination } from '@/components'` | `page` · `pageCount` · `onChange` | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=375-581) |
| `SegmentedControl` | `import { SegmentedControl } from '@/components'` | `options`: `{value, label}[]` · `value` · `onChange` · `fullWidth`: boolean | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=434-328) |
| `Tab` | `import { Tab } from '@/components'` | `items`: `{value, label, icon?, disabled?}[]` · `value` · `onChange` · `variant`: default\|pill | [Figma](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=326-702) |

---

## 8. Primitives — Palette de couleurs (référence)

> Ne jamais binder directement. Documenter ici à titre de référence pour tracer les alias Semantics.

### Marque principale (Brand = Blue)
`Brand/50` → `Brand/950` (11 niveaux) — identique à `Blue/50` → `Blue/950`

### Neutrals
`Neutral/50` (#F9FAFB) → `Neutral/100` → `Neutral/200` → `Neutral/300` → `Neutral/400` → `Neutral/500` → `Neutral/600` → `Neutral/700` → `Neutral/800` → `Neutral/900` (#131526)

### Sand (chaleureux)
`Sand/50` → `Sand/950` (11 niveaux) — beiges chauds

### Sémantiques brutes
- **Blue** : 50 → 950 (identique à Brand)
- **Green** : 50 → 900 (succès)
- **Red** : 50 → 900 (danger/erreur)
- **Yellow** : 50 → 950 (warning)
- **Lime** : 50 → disponible (non utilisé en Semantics actuellement)

> Pour les valeurs hexadécimales exactes, consulter la collection Primitives dans Figma : [DS.MD → Foundations](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=345-637)

---

## 9. Liens Figma

| Page | URL |
|---|---|
| Foundations (variables) | https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=345-637 |
| Typography | https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=345-694 |
| Spacing | https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=345-695 |
| Shape | https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=345-696 |
| Elevation | https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=345-697 |
