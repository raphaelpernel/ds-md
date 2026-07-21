# Stepper

## Description

Composant de quantité `⊖ N ⊕` — composé en interne à partir de deux `Button` circulaires (`iconOnly`) et d'une valeur affichée entre les deux. Hérite automatiquement de la couleur interactive de marque active (corail Marmiton, bleu Carrefour…) via `--color-interactive-*`.

**Ne pas utiliser** pour :
- Une saisie de quantité libre en texte → `InputField` avec `type="number"`
- Un choix exclusif parmi options → `SegmentedControl`/`Radio`

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `value` | `number` | — | Valeur actuelle (contrôlé) |
| `onChange` | `(value: number) => void` | — | Callback avec la nouvelle valeur déjà clampée entre `min`/`max` |
| `min` | `number` | `0` | Borne basse — le bouton `-` se désactive automatiquement à cette valeur |
| `max` | `number` | `99` | Borne haute — le bouton `+` se désactive automatiquement à cette valeur |
| `size` | `'XS'\|'S'\|'M'` | `'S'` | Taille (répercutée sur les `Button` internes) |
| `disabled` | `boolean` | `false` | Désactive les deux boutons |
| `label` | `string` | `'Quantité'` | `aria-label` du groupe |
| `suffix` | `string` | — | Unité affichée après la valeur (ex. "kg") |

> **Asymétrie intentionnelle** : le bouton `-` utilise `Button variant="secondary"`, le bouton `+` utilise `variant="primary"` — ce n'est pas une incohérence, c'est le pattern voulu (l'action d'ajout est mise en avant). Ne pas "corriger" en symétrisant les deux variants.

---

## Tokens utilisés

Hérite intégralement des tokens de `Button` (`Interactive/BG`, `Interactive/Border`, etc.) pour les deux boutons internes, plus :

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Spacing/8` | `--spacing-8` | Gap entre les deux boutons et la valeur |
| `Font Family/Label`, `Font Size/Label/MD` | `--font-family-label`, `--font-size-label-md` | Affichage de la valeur |
| `Content/Default` | `--color-content-default` | Couleur de la valeur |

---

## Accessibilité

- **`role="group"` + `aria-label`** sur le conteneur (valeur par défaut `"Quantité"`).
- **`aria-live="polite"` + `aria-atomic="true"`** sur la valeur affichée — les changements sont annoncés aux lecteurs d'écran sans interruption.
- Boutons `-`/`+` avec `aria-label="Diminuer"`/`"Augmenter"` posés en dur (en français — cohérent avec le reste de l'app, contrairement à certains autres composants feedback en anglais).
- Désactivation automatique aux bornes `min`/`max` — pas besoin de gérer ça côté appelant.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Utiliser pour une quantité bornée avec incrément de 1 (panier, ingrédients) | Utiliser pour une saisie libre de grand nombre → `InputField type="number"` |
| Garder l'asymétrie secondary(`-`)/primary(`+`) | "Corriger" en mettant les deux boutons dans la même variante |
| Passer `suffix` pour une unité (ex. "kg", "pièces") | Concaténer l'unité manuellement dans un `label` séparé |

---

## Liens

- Figma : [DS.MD — Stepper](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=380-1043)
- Storybook : `DS.MD/Form/Stepper`
