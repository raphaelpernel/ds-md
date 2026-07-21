# Breadcrumb

## Description

Fil d'ariane — trace le chemin de navigation jusqu'à la page courante. Le dernier item est toujours rendu comme texte non cliquable, même si un `href` est fourni.

**Ne pas utiliser** pour :
- Une navigation entre vues d'une même page → `Tab`
- Une pagination de résultats → `Pagination`

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `items` | `{label, href?, icon?}[]` | — | Chemin, du plus général au plus spécifique |
| `separator` | `ReactNode` | `'>'` | Séparateur entre les items |

> Le dernier élément de `items` est toujours affiché comme la page courante (non cliquable, `aria-current="page"`), **même si un `href` est fourni** — ne pas s'attendre à ce qu'il reste cliquable.

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Content/Weak` | `--color-content-weak` | Liens intermédiaires, séparateur |
| `Content/Default` | `--color-content-default` | Item courant, hover des liens |
| `Font Size/Body/SM` | `--font-size-body-sm` | Typographie |
| `Spacing/4` | `--spacing-4` | Gaps |

---

## Accessibilité

- **`<nav aria-label="Breadcrumb">`** + `<ol>` — structure sémantique correcte pour un fil d'ariane.
- **`aria-current="page"`** posé automatiquement sur le dernier item.
- Séparateurs `aria-hidden="true"`.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Toujours mettre l'item le plus spécifique en dernier dans `items` | Compter sur le dernier item pour rester cliquable si un `href` lui est passé |
| Utiliser pour tracer une hiérarchie de navigation (catégories, recette) | Utiliser pour une navigation entre onglets d'une même vue → `Tab` |

---

## Liens

- Figma : [DS.MD — Breadcrumb](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=375-410)
- Storybook : `DS.MD/Navigation/Breadcrumb`
