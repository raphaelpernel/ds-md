# Drawer

## Description

Panneau latéral (ou bas d'écran) pour formulaire long, liste, contenu à parcourir. Toujours monté dans le DOM (translaté hors écran via `transform`) pour permettre l'animation de glissement — contrairement à `Modal`, qui se démonte complètement quand fermé.

**Ne pas utiliser** pour :
- Une interaction courte et bloquante (confirmation, login) → `Modal`
- Une notification non bloquante → `Toast`/`Alert`

---

## Variants

### placement (desktop)

| Valeur | Usage |
|---|---|
| `right` (défaut) | Usage général |
| `left` | Navigation secondaire, filtres |
| `bottom` | Contenu court, sheet |

### mobilePlacement

| Valeur | Usage |
|---|---|
| `bottom` (défaut) | Bottom sheet standard sur mobile, quel que soit le `placement` desktop |
| `right` / `left` | Conserve le panneau latéral sur mobile (largeur `90vw` max, coins arrondis côté intérieur via `Shape/Sheet`) |

`mobilePlacement` prime sur `placement` sous 767px — les deux sont indépendants, pensés pour des layouts desktop ≠ mobile.

---

## States

| State | Comportement | Notes |
|---|---|---|
| `open` | Translation à 0, overlay visible | Toujours monté, transition CSS pure (`transform`, 0.25s) |
| `onBack` fourni | Affiche un bouton retour (`ArrowLeft`) avant le titre | Pour une navigation imbriquée à l'intérieur du drawer (ex. étape 2 d'un formulaire) |
| `headerContent` fourni | Remplace entièrement le rendu par défaut du titre | Prioritaire sur `title` |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `open` | `boolean` | — | Affiche/masque (translation, pas de démontage) |
| `onClose` | `() => void` | — | Overlay, Escape, bouton "Fermer" |
| `title` | `string` | — | Titre par défaut du header |
| `headerContent` | `ReactNode` | — | Header custom — remplace `title` |
| `onBack` | `() => void` | — | Affiche un bouton retour |
| `children` | `ReactNode` | — | Corps scrollable |
| `footer` | `ReactNode` | — | Zone d'actions — **pas de convention column-reverse mobile** (contrairement à `Modal`), le footer gère son propre padding |
| `placement` | `'right'\|'left'\|'bottom'` | `'right'` | Position desktop |
| `mobilePlacement` | `'right'\|'left'\|'bottom'` | `'bottom'` | Position mobile, indépendante |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Surface/Overlay` | `--color-surface-overlay` | Scrim |
| `Surface/Primary` | `--color-surface-primary` | Fond du panneau |
| `Elevation/600` | `--elevation-600` | Ombre portée |
| `Shape/Sheet` | `--shape-sheet` | Coins arrondis intérieurs en `mobilePlacement` latéral |
| `Border/Default` | `--color-border-default` | Séparateur du header |
| `Font Family/Heading`, `Font Size/Heading/SM` | — | Titre |
| `Spacing/8,16` | `--spacing-8/16` | Gaps et padding du header |

---

## Accessibilité

- **`role="dialog"` + `aria-modal="true"`**, `aria-labelledby` vers `drawer-title` quand `title` est utilisé sans `headerContent`. Si `headerContent` est fourni, penser à porter soi-même un `aria-label`/`aria-labelledby` équivalent — non posé automatiquement dans ce cas.
- **`Escape`** ferme le drawer.
- **Clic sur l'overlay** ferme le drawer — overlay et panneau sont des éléments **frères** (pas parent/enfant comme dans `Modal`), donc aucun `stopPropagation` n'est nécessaire ni présent dans le panneau lui-même.
- **Bouton retour** (`onBack`) : `aria-label="Retour"` posé en dur. Bouton fermeture : `aria-label="Fermer"`.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Réserver aux formulaires longs, listes, contenu à parcourir | Utiliser pour une confirmation courte et bloquante → `Modal` |
| Utiliser `onBack` pour une navigation imbriquée à l'intérieur du drawer | Fermer/rouvrir le drawer entier pour simuler une étape suivante |
| Se souvenir que le composant reste monté même fermé — un formulaire interne garde son état entre deux ouvertures sauf reset explicite | Supposer une réinitialisation automatique du contenu à la fermeture, comme le ferait un `Modal` démonté |
| Si `headerContent` remplace le titre, fournir son propre label accessible | Compter sur `aria-labelledby` automatique avec `headerContent` — il ne se déclenche qu'avec `title` |

---

## Liens

- Figma : [DS.MD — Drawer](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=381-442)
- Storybook : `DS.MD/Layout/Drawer`
