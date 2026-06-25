# SegmentedControl

## Description

Sélecteur segmenté avec thumb animé. Permet à l'utilisateur de choisir une option parmi 2 à 4 alternatives mutuellement exclusives. À utiliser quand les options sont courtes, connues à l'avance, et que le changement d'option a un effet immédiat et visible sur le contenu adjacent (ex: basculer entre "Drive" et "Livraison à domicile").

**Ne pas utiliser** pour :
- Plus de 4 options → utiliser `Tab` ou `Select`
- Options longues (> ~15 caractères chacune) → le thumb déborde visuellement
- Navigation entre pages → utiliser `Tab`
- Filtres multiples → utiliser `ChipTag`

---

## Variants

### fullWidth

| Valeur | Usage | Règle |
|---|---|---|
| `false` (défaut) | Composant hug-content, taille définie par les labels | Usage standard inline |
| `true` | S'étend à 100% de son conteneur | Dans les contextes pleine-largeur (drawer, bottom sheet, form) |

---

## States

| State | Comportement | Notes |
|---|---|---|
| Default | Thumb positionné sur l'option active, options inactives en `Content/Weak` | — |
| Active (option) | Couleur `Interactive/Content`, cursor default | Une seule option active à la fois |
| Hover (option) | Pas de style hover visible — le thumb sliding est l'affordance | Intentionnel : évite la surcharge visuelle |
| Focus visible | Outline `Interactive/Border` 2px, offset -2px | Navigation clavier obligatoire |
| Disabled (global) | Opacity 0.5, pointer-events none | Toute interaction bloquée |
| Disabled (option) | Couleur `Interactive/Disabled/Content`, pointer-events none, tabIndex -1 | Option indisponible (ex: livraison non disponible dans la zone) |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `options` | `SegmentedOption[]` | — | Tableau `{ value: string; label: string }`. Min 2, max 4. |
| `value` | `string` | — | Valeur de l'option actuellement sélectionnée |
| `onChange` | `(value: string) => void` | — | Callback déclenché au clic sur une option non-disabled |
| `fullWidth` | `boolean` | `false` | Si true, s'étend à 100% du conteneur |
| `label` | `string` | — | Label lu par les screen readers pour identifier le groupe (`aria-label` sur `radiogroup`) |
| `disabled` | `boolean` | `false` | Désactive tout le composant |
| `disabledValues` | `string[]` | `[]` | Désactive des options individuelles par leur valeur |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Surface/Secondary` | `--color-surface-secondary` | Fond du conteneur |
| `Surface/Primary` | `--color-surface-primary` | Fond du thumb sliding |
| `Elevation/100` | `--elevation-100` | Ombre portée du thumb |
| `Content/Weak` | `--color-content-weak` | Texte des options inactives |
| `Interactive/Content` | `--color-interactive-content` | Texte de l'option active |
| `Interactive/Border` | `--color-interactive-border` | Outline focus |
| `Interactive/Disabled Content` | `--color-interactive-disabled-content` | Texte option désactivée |
| `Shape/Pill` | `--shape-pill` | Border-radius du conteneur et du thumb |
| `Spacing/4` | `--spacing-4` | Padding interne du conteneur (`--segmented-padding`) |
| `Spacing/8` | `--spacing-8` | Padding vertical des options |
| `Spacing/16` | `--spacing-16` | Padding horizontal des options |
| `Font Family/Label` | `--font-family-label` | Famille typographique |
| `Font Size/Label/MD` | `--font-size-label-md` | Taille du texte des options |
| `Font Weight/Label` | `--font-weight-label` | Graisse des options |
| `Line Height/Label/MD` | `--line-height-label-md` | Hauteur de ligne |

---

## Accessibilité

- **Rôle ARIA** : `radiogroup` sur le conteneur, `radio` sur chaque option
- **aria-label** : toujours fournir la prop `label` pour que le screen reader annonce le contexte du groupe
- **aria-checked** : automatique selon la prop `value`
- **aria-disabled** : automatique si `disabled` ou si la valeur est dans `disabledValues`
- **Clavier** : Tab pour atteindre le groupe, puis les boutons sont focusables individuellement
- **Thumb** : `aria-hidden="true"` — élément purement décoratif

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Toujours fournir `label` pour le contexte screen reader | Omettre `label` — le radiogroup sera annoncé sans contexte |
| 2 à 4 options courtes (1-2 mots) | Plus de 4 options ou labels longs |
| Effet immédiat et visible au changement | Utiliser pour déclencher une navigation de page |
| `fullWidth` dans les drawers et formulaires pleine-largeur | `fullWidth` dans un layout avec d'autres éléments inline |
| `disabledValues` pour les options temporairement indisponibles | Cacher une option au lieu de la désactiver |

---

## Liens

- Figma : [DS.MD — SegmentedControl](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=434-328&m=dev)
- Storybook : `DS.MD/Navigation/SegmentedControl`
