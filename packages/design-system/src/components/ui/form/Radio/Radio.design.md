# Radio

## Description

Choix exclusif parmi des options **toutes visibles simultanément** dans un formulaire.

**Ne pas utiliser** pour :
- Plus de 4-5 options → `Select`
- Un réglage à effet immédiat → `Toggle`
- Une sélection multiple → `Checkbox`

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — | Texte associé |
| ...props natives | `InputHTMLAttributes<HTMLInputElement>` | — | `name` (obligatoire pour grouper plusieurs radios), `checked`, `disabled`, `onChange`, etc. |

> **Important** : le composant ne groupe pas les radios entre eux — c'est le prop natif `name` (identique sur toutes les options du groupe) qui assure l'exclusivité, comme pour tout `<input type="radio">` HTML. Oublier `name` casse le comportement exclusif.

---

## States

| State | Comportement |
|---|---|
| `checked` | Bordure + point central `Interactive/BG` |
| `disabled` | Bordure `Interactive/Disabled BG`, fond `Surface/Secondary`, curseur `not-allowed` |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Border/Default` | `--color-border-default` | Bordure repos |
| `Interactive/BG` | `--color-interactive-bg` | Bordure + point coché |
| `Interactive/Disabled BG,Content` | `--color-interactive-disabled-*` | Désactivé |
| `Surface/Secondary` | `--color-surface-secondary` | Fond désactivé |
| `Content/Default` | `--color-content-default` | Label |
| `Spacing/8` | `--spacing-8` | Gap point/label |

---

## Accessibilité

- `<label htmlFor>` correctement associé — cliquer sur le label active le radio.
- Sémantique native `input[type=radio]` — navigation clavier (flèches entre options du même `name`) gratuite, pas de rôle ARIA à ajouter.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Toujours donner le même `name` à toutes les options d'un même groupe | Oublier `name` — les radios ne s'excluront pas mutuellement |
| Réserver à 4-5 options maximum, toutes visibles | Utiliser pour beaucoup d'options → `Select` |
| Utiliser pour un choix qui doit être validé (formulaire) | Utiliser pour un réglage à effet immédiat → `Toggle` |

---

## Liens

- Figma : [DS.MD — Radio](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=345-1511)
- Storybook : `DS.MD/Form/Radio`
