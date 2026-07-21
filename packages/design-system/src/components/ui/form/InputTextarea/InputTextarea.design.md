# InputTextarea

## Description

Champ de saisie texte **multi-ligne**, redimensionnable verticalement, 4 lignes visibles par défaut.

**Ne pas utiliser** pour :
- Un texte court sur une ligne → `InputField`
- Une sélection parmi options prédéfinies → `Select`

---

## Variants

### state

| Valeur | Usage |
|---|---|
| `default` | Repos |
| `error` | Bordure `Border/Danger` — posé automatiquement aussi si `errorText` est fourni |
| `disabled` | Fond `Interactive/Disabled`, non éditable |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — | Libellé au-dessus du champ |
| `helperText` | `string` | — | Texte d'aide (masqué si erreur) |
| `errorText` | `string` | — | Texte d'erreur — bascule l'état automatiquement |
| `state` | `'default'\|'error'\|'disabled'` | `'default'` | État explicite |
| ...props natives | `TextareaHTMLAttributes` | — | `rows` (défaut 4, surchargeable), `placeholder`, `value`, `onChange`, etc. |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Border/Default`, `Border/Brand`, `Border/Danger` | `--color-border-*` | Repos / focus / erreur |
| `Interactive/Disabled BG,Content` | `--color-interactive-disabled-*` | Désactivé |
| `Surface/Primary` | `--color-surface-primary` | Fond |
| `Content/Weak` | `--color-content-weak` | Placeholder, helper text |
| `Semantic/Danger/Content` | `--color-semantic-danger-content` | Texte d'erreur |
| `Shape/Input` | `--shape-input` | Border-radius |
| `Spacing/4,12,16` | `--spacing-*` | Padding, gaps |

---

## Accessibilité

- **`aria-invalid`** posé automatiquement si `state="error"` ou `errorText` fourni.
- **⚠️ Pas de `aria-describedby`** contrairement à `InputField` — le texte d'aide/erreur n'est pas lié programmatiquement au `<textarea>` dans l'implémentation actuelle. Un lecteur d'écran ne l'annoncera pas automatiquement au focus du champ. À corriger si ce composant est utilisé sur un formulaire critique (répliquer le pattern `aria-describedby` d'`InputField`), pas juste documenter.
- `<label htmlFor>` correctement associé.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Utiliser pour un texte long (commentaire, description, message) | Utiliser pour un champ court sur une ligne → `InputField` |
| Passer `errorText` pour basculer l'état erreur automatiquement | Compter sur `aria-describedby` pour lier l'erreur au champ — pas implémenté ici |
| Surcharger `rows` si 4 lignes ne conviennent pas au contexte | Modifier `resize` par CSS custom sans vérifier la cohérence avec le reste du formulaire |

---

## Liens

- Figma : [DS.MD — Input Textarea](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=309-640)
- Storybook : `DS.MD/Form/Input Textarea`
