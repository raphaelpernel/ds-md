# Shimmering

## Description

Placeholder de chargement en **bloc plein unique**, sans typage de forme — pour une grande surface (image produit, hero, thumbnail) où l'on veut juste un bloc dimensionné avec animation de balayage, sans composer plusieurs formes.

**Ne pas utiliser** pour :
- Composer un layout de plusieurs formes typées (avatar + lignes de texte) → `Skeleton`
- Une attente courte/globale sans layout à préfigurer → `Loading`

> **Note d'implémentation** : voir la note dans `Skeleton.design.md` — `Shimmering` et `Skeleton` partagent aujourd'hui la même animation de balayage. `Shimmering` se distingue par l'absence de typage de forme (un seul bloc, `width`/`height`/`borderRadius` libres) plutôt que par un mouvement différent.

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `width` | `string \| number` | `'100%'` | Largeur du bloc |
| `height` | `string \| number` | `200` | Hauteur du bloc |
| `borderRadius` | `string` | `var(--shape-card)` | Radius custom — par défaut celui des cards |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Surface/Secondary`, `Secondary Hover` | `--color-surface-secondary(-hover)` | Dégradé de l'animation shimmer |
| `Shape/Card` | `--shape-card` | Border-radius par défaut |

---

## Accessibilité

- `aria-hidden="true"` — purement décoratif, comme `Skeleton`. Poser `aria-busy="true"` sur le conteneur parent réel pour communiquer l'état de chargement.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Utiliser pour un bloc plein unique de grande surface (image produit, hero) | Utiliser pour préfigurer plusieurs formes typées (texte + avatar) → `Skeleton` |
| Passer `borderRadius` pour matcher exactement la forme finale (ex. `var(--shape-input)` pour un input) | Laisser le radius par défaut si le contenu final n'est pas une card |
| Poser `aria-busy="true"` sur le conteneur parent | Compter sur `Shimmering` seul pour l'accessibilité de l'état de chargement |

---

## Liens

- Figma : [DS.MD — Skeleton/Loading](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=380-312)
- Storybook : `DS.MD/Feedback/Shimmering`
