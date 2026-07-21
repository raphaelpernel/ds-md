# InputField

## Description

Champ de saisie texte à une ligne — label, helper/error text, icônes gauche/droite optionnelles.

**Ne pas utiliser** pour :
- Un texte multi-ligne → `InputTextarea`
- Une sélection parmi options prédéfinies → `Select`

---

## Variants

### state

| Valeur | Usage |
|---|---|
| `default` | Repos |
| `error` | Bordure `Border/Danger` — posé automatiquement aussi si `errorText` est fourni, même sans `state="error"` explicite |
| `disabled` | Fond `Interactive/Disabled`, non éditable |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — | Libellé au-dessus du champ |
| `helperText` | `string` | — | Texte d'aide sous le champ (masqué si erreur) |
| `errorText` | `string` | — | Texte d'erreur — sa seule présence bascule le champ en état erreur |
| `lIcon` / `rIcon` | `ReactNode` | — | Icône gauche/droite (décorative, non interactive) |
| `state` | `'default'\|'error'\|'disabled'` | `'default'` | État explicite |
| ...props natives | `InputHTMLAttributes<HTMLInputElement>` | — | `type`, `placeholder`, `value`, `onChange`, etc. |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Border/Default` | `--color-border-default` | Bordure repos |
| `Border/Brand` | `--color-border-brand` | Bordure au focus |
| `Border/Danger` | `--color-border-danger` | Bordure erreur |
| `Interactive/Disabled BG,Content` | `--color-interactive-disabled-*` | Désactivé |
| `Surface/Primary` | `--color-surface-primary` | Fond du champ |
| `Content/Weak` | `--color-content-weak` | Placeholder, icônes, helper text |
| `Semantic/Danger/Content` | `--color-semantic-danger-content` | Texte d'erreur |
| `Shape/Input` | `--shape-input` | Border-radius |
| `Spacing/4,12,16` | `--spacing-*` | Padding, gap label/champ/helper |

---

## Accessibilité

- **`aria-invalid`** posé automatiquement si `state="error"` ou `errorText` fourni.
- **`aria-describedby`** posé automatiquement vers l'id du helper ou de l'erreur (`{fieldId}-error` / `{fieldId}-helper`) — lien correctement établi entre le champ et son texte d'assistance.
- **`<label htmlFor>`** correctement associé à l'input via un id généré ou fourni.
- Les icônes (`lIcon`/`rIcon`) sont positionnées en absolu avec `pointer-events: none` — purement décoratives, pas interactives (pas de bouton "afficher le mot de passe" cliquable intégré malgré l'exemple Storybook `Eye` en `rIcon` — c'est décoratif, l'interaction doit être ajoutée par l'appelant si besoin).

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Toujours fournir `label` (accessibilité + cohérence visuelle) | Se reposer sur `placeholder` seul comme label |
| Passer `errorText` pour basculer automatiquement en état erreur | Devoir aussi passer `state="error"` manuellement — `errorText` seul suffit |
| Utiliser `lIcon`/`rIcon` pour des icônes purement décoratives | Attendre qu'une icône passée en `rIcon` soit cliquable sans câblage additionnel |

---

## Liens

- Figma : [DS.MD — Input Field](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=345-1515)
- Storybook : `DS.MD/Form/Input Field`
