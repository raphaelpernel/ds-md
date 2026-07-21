# Checkbox

## Description

Sélection indépendante, binaire ou multiple, **à valider** dans un formulaire (par opposition à un réglage à effet instantané — voir `Toggle`).

**Ne pas utiliser** pour :
- Un réglage à effet immédiat, sans validation → `Toggle`
- Un choix exclusif parmi plusieurs options → `Radio`

---

## Variants

### state

| Valeur | Usage |
|---|---|
| `default` | Repos |
| `error` | Bordure `Border/Danger` — validation échouée |

---

## States

| State | Comportement | Notes |
|---|---|---|
| `checked` | Fond/bordure `Interactive/BG`, icône check | Piloté par `checked`/`defaultChecked` natifs |
| `indeterminate` | Icône tiret au lieu du check | ⚠️ voir Accessibilité — implémentation visuelle uniquement |
| `disabled` | Fond `Interactive/Disabled`, curseur `not-allowed` | |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — | Texte associé (via `<label>` englobant) |
| `state` | `'default'\|'error'` | `'default'` | Style de bordure |
| `indeterminate` | `boolean` | `false` | État visuel "partiel" |
| ...props natives | `InputHTMLAttributes<HTMLInputElement>` | — | `checked`, `defaultChecked`, `disabled`, `onChange`, etc. |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Border/Default` | `--color-border-default` | Bordure repos |
| `Border/Danger` | `--color-border-danger` | Bordure `state="error"` |
| `Interactive/BG` | `--color-interactive-bg` | Fond coché/indéterminé |
| `Interactive/Disabled BG,Content` | `--color-interactive-disabled-*` | Désactivé |
| `Content/Inversed` | `--color-content-inversed` | Icône check/tiret |
| `Content/Default` | `--color-content-default` | Label |
| `Spacing/8` | `--spacing-8` | Gap case/label |

---

## Accessibilité

- **Case et label** : `<label htmlFor>` correctement associé à l'`<input>` — cliquer sur le label active la case.
- **⚠️ `indeterminate`** : posé uniquement comme attribut `data-indeterminate` pour le style CSS — **ne définit pas** la propriété DOM native `element.indeterminate` (qui nécessite une ref JS, HTML n'a pas d'attribut `indeterminate`) ni `aria-checked="mixed"`. Résultat : l'état visuel "tiret" est correct, mais **les lecteurs d'écran n'annoncent pas l'état indéterminé** — ils l'entendent comme non coché. À corriger si ce cas d'usage est réellement utilisé (poser `aria-checked="mixed"` et/ou une ref pour la propriété DOM), pas seulement documenter.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Utiliser pour une sélection multiple à valider (formulaire, filtres à confirmer) | Utiliser pour un réglage à effet immédiat → `Toggle` |
| Utiliser pour un choix multiple indépendant | Utiliser pour un choix exclusif → `Radio` |
| Si `indeterminate` est utilisé en production, vérifier/ajouter `aria-checked="mixed"` | Considérer l'implémentation actuelle de `indeterminate` comme accessible telle quelle |

---

## Liens

- Figma : [DS.MD — Checkbox](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=310-645)
- Storybook : `DS.MD/Form/Checkbox`
