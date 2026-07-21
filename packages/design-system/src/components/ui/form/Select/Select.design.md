# Select

## Description

Sélection dans une liste déroulante native (`<select>` habillé) — pour un nombre d'options trop important pour des `Radio` ou un `SegmentedControl`.

**Ne pas utiliser** pour :
- 2-4 options courtes avec effet immédiat → `SegmentedControl`
- 4-5 options ou moins, toutes visibles → `Radio`

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — | Libellé au-dessus du champ |
| `options` | `{value, label}[]` | `[]` | Liste des options |
| `placeholder` | `string` | — | Ajoute une option vide en tête (`value=""`) |
| `helperText` | `string` | — | Texte d'aide (masqué si erreur) |
| `errorText` | `string` | — | Texte d'erreur — bascule l'état automatiquement |
| `state` | `'default'\|'error'\|'disabled'` | `'default'` | État explicite |
| ...props natives | `SelectHTMLAttributes` | — | `value`, `onChange`, etc. |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Border/Default`, `Border/Brand`, `Border/Danger` | `--color-border-*` | Repos / focus / erreur |
| `Interactive/Disabled BG,Content` | `--color-interactive-disabled-*` | Désactivé |
| `Surface/Primary` | `--color-surface-primary` | Fond |
| `Content/Weak` | `--color-content-weak` | Flèche, helper text |
| `Semantic/Danger/Content` | `--color-semantic-danger-content` | Texte d'erreur |
| `Shape/Input` | `--shape-input` | Border-radius |
| `Spacing/4,12,16,40` | `--spacing-*` | Padding (dont réserve de place pour la flèche) |

---

## Accessibilité

- **`aria-invalid`** posé automatiquement si `state="error"` ou `errorText` fourni.
- **⚠️ Pas de `aria-describedby`** — même gap que `InputTextarea` : le helper/error text n'est pas lié programmatiquement au `<select>`. À corriger si utilisé sur un formulaire critique.
- Sémantique `<select>` native — navigation clavier gratuite (flèches, recherche par lettre), pas de rôle ARIA custom nécessaire.
- Flèche décorative (`▾`) en `aria-hidden="true"`.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Utiliser dès que la liste d'options dépasse ~5 éléments | Utiliser pour 2-4 options courtes → `SegmentedControl` |
| Fournir `placeholder` si aucune option ne doit être présélectionnée | Laisser un `value` implicite sur la première option sans `placeholder` explicite |
| Passer `errorText` pour l'état erreur | Compter sur `aria-describedby` — pas implémenté ici |

---

## Liens

- Figma : [DS.MD — Select](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=316-743)
- Storybook : `DS.MD/Form/Select`
