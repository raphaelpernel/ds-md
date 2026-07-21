# Pagination

## Description

Pagination numérotée avec troncature automatique (`…`) au-delà de 7 pages — garde toujours la première, la dernière, et une fenêtre autour de la page active visibles.

**Ne pas utiliser** pour :
- Une navigation entre vues d'une même page → `Tab`
- Un défilement infini — ce composant suppose un nombre de pages fini et connu

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `page` | `number` | — | Page active (1-indexée) |
| `pageCount` | `number` | — | Nombre total de pages |
| `onChange` | `(page: number) => void` | — | Callback avec la nouvelle page — appelé même pour Précédent/Suivant en bordure (l'appelant doit ignorer si hors bornes, le composant désactive déjà visuellement les boutons aux bornes) |

> La troncature ne s'active qu'au-delà de **7 pages** — en dessous, toutes les pages sont affichées sans `…`.

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Interactive/BG`, `BG Hover` | `--color-interactive-bg(-hover)` | Page active |
| `Content/Inversed` | `--color-content-inversed` | Texte de la page active |
| `Content/Default` | `--color-content-default` | Pages inactives |
| `Content/Weak` | `--color-content-weak` | Ellipsis |
| `Interactive/Disabled Content` | `--color-interactive-disabled-content` | Boutons Précédent/Suivant désactivés aux bornes |
| `Surface/Primary Hover` | `--color-surface-primary-hover` | Hover d'une page inactive |
| `Spacing/4` | `--spacing-4` | Gap entre boutons |

---

## Accessibilité

- **`<nav aria-label="Pagination">`**.
- **`aria-current="page"`** posé sur le bouton de la page active.
- **`aria-label="Previous"`/`"Next"`** — actuellement en anglais dans le code, à harmoniser en français si l'app est full-FR (contrairement à `Stepper`, dont les labels équivalents sont déjà en français).
- Boutons Précédent/Suivant automatiquement `disabled` aux bornes (`page<=1` / `page>=pageCount`).

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Utiliser pour un nombre de pages fini et connu à l'avance | Utiliser pour du contenu à défilement infini |
| Laisser le composant gérer la troncature automatiquement | Recalculer manuellement quelles pages afficher |
| Vérifier/harmoniser les `aria-label` Précédent/Suivant en français si le reste de l'app l'est | Laisser les labels anglais si c'est incohérent avec le reste de l'interface |

---

## Liens

- Figma : [DS.MD — Pagination](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=375-581)
- Storybook : `DS.MD/Navigation/Pagination`
