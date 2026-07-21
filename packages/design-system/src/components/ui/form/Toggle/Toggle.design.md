# Toggle

## Description

Bascule d'un réglage avec **effet instantané**, sans étape de validation — par opposition à `Checkbox`, pensé pour une sélection à valider dans un formulaire.

**Ne pas utiliser** pour :
- Une sélection à valider dans un formulaire → `Checkbox`
- Un choix exclusif parmi options visibles → `Radio`

---

## Variants

### size

| Valeur | Dimensions piste | Usage |
|---|---|---|
| `M` (défaut) | 44×24px | Usage général |
| `S` | 36×20px | UI compacte |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — | Texte associé |
| `size` | `'M'\|'S'` | `'M'` | Taille |
| ...props natives | `InputHTMLAttributes` (sans `size`) | — | `checked`, `disabled`, `onChange`, etc. |

> Pas d'état `error` — cohérent avec son usage (réglage instantané, pas de validation de formulaire à signaler).

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Border/Default` | `--color-border-default` | Piste au repos (non coché) |
| `Interactive/BG` | `--color-interactive-bg` | Piste cochée |
| `Interactive/Disabled BG` | `--color-interactive-disabled-bg` | Piste désactivée (cochée ou non) |
| `Surface/Primary` | `--color-surface-primary` | Thumb (le rond mobile) |
| `Shape/Pill` | `--shape-pill` | Border-radius de la piste |
| `Content/Default` | `--color-content-default` | Label |
| `Spacing/8` | `--spacing-8` | Gap piste/label |

---

## Accessibilité

- **`role="switch"`** posé sur l'`<input type="checkbox">` — sémantique correcte pour un réglage on/off à effet immédiat (distinct de `role="checkbox"` implicite d'une case standard).
- `<label htmlFor>` correctement associé.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Utiliser pour un réglage dont l'effet est immédiat et visible | Utiliser dans un formulaire nécessitant une validation explicite → `Checkbox` |
| Garder le libellé au présent/impératif court (ex. "Notifications") | Utiliser un libellé qui implique une action à confirmer plus tard |

---

## Liens

- Figma : [DS.MD — Toggle](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=309-640)
- Storybook : `DS.MD/Form/Toggle`
