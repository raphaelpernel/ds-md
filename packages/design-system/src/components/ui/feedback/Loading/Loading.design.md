# Loading

## Description

Spinner pour une **attente courte ou globale** (soumission de formulaire, transition de page) — quand il n'y a pas de layout de contenu à préfigurer. Label textuel optionnel accolé au spinner.

**Ne pas utiliser** pour :
- Préfigurer la forme du contenu qui arrive (card, ligne de texte, avatar) → `Skeleton`/`Shimmering`
- L'état de chargement d'un `Button` → utiliser la prop `loading` intégrée du `Button`, ne jamais y imbriquer ce composant

---

## Variants

### size

| Valeur | Dimensions du spinner | Usage |
|---|---|---|
| `S` | 16px | Inline, dense |
| `M` (défaut) | 24px | Usage général |
| `L` | 40px (bordure 3px) | Chargement de page/section pleine |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `size` | `'S'\|'M'\|'L'` | `'M'` | Taille du spinner |
| `label` | `string` | — | Texte affiché à côté du spinner (aussi utilisé comme `aria-label` si fourni) |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Border/Default` | `--color-border-default` | Anneau du spinner |
| `Interactive/BG` | `--color-interactive-bg` | Segment coloré du spinner (rotation) |
| `Font Family/Body`, `Font Size/Body/MD` | `--font-family-body`, `--font-size-body-md` | Label |
| `Content/Weak` | `--color-content-weak` | Couleur du label |
| `Spacing/8` | `--spacing-8` | Gap spinner/label |

---

## Accessibilité

- **`role="status"`** avec `aria-label` (utilise `label` si fourni, sinon `"Loading…"` par défaut — en anglais, à harmoniser en français si l'app est full-FR).
- Le spinner visuel (`loading__spinner`) est `aria-hidden="true"` — c'est le conteneur qui porte l'information via `role="status"` + `aria-label`.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Utiliser pour une attente courte/globale sans layout de contenu à préfigurer | Utiliser pour préfigurer la forme du contenu à venir → `Skeleton`/`Shimmering` |
| Fournir un `label` descriptif (ex. "Chargement des recettes…") plutôt que de laisser le défaut générique | Imbriquer ce composant à l'intérieur d'un `Button` | 
| Utiliser la prop `loading` native de `Button` pour un état de chargement de bouton | Dupliquer l'état de chargement avec ce composant à l'intérieur d'un bouton |

---

## Liens

- Figma : [DS.MD — Skeleton/Loading](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=380-301)
- Storybook : `DS.MD/Feedback/Loading`
