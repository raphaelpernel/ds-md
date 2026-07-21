# Skeleton

## Description

Placeholder de chargement **typé par forme** — épouse la forme du contenu final (`rect`, `text`, `circle`) pour préfigurer une card, une ligne de texte (multi-ligne supporté via `lines`), ou un avatar, avant que les données réelles n'arrivent.

**Ne pas utiliser** pour :
- Un bloc de grande surface unique (hero, image produit) sans besoin de typage de forme → `Shimmering` (voir note ci-dessous)
- Une attente courte/globale sans layout à préfigurer (submit, transition de page) → `Loading`

> **Note d'implémentation** : `Skeleton` et `Shimmering` utilisent aujourd'hui la **même animation de balayage lumineux** (gradient qui traverse le bloc). La distinction actuelle n'est donc pas "statique vs animé" mais **composabilité de forme** : `Skeleton` sait typer `rect`/`text` (avec support multi-ligne)/`circle`, `Shimmering` est un bloc unique sans typage. Si une distinction visuelle plus marquée (ex. `Shimmering` réservé à un balayage plus prononcé sur grande surface) est voulue, ce serait un changement de code à faire, pas seulement de doc.

---

## Variants

| Valeur | Rendu | Usage |
|---|---|---|
| `rect` (défaut) | Rectangle, `border-radius: Shape/Input` | Cards, images, blocs génériques |
| `text` | Barre fine (`height: 14px`), `border-radius: Shape/Pill` | Lignes de texte — voir prop `lines` pour le multi-ligne |
| `circle` | Cercle (`border-radius: 50%`) | Avatar, icône |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `variant` | `'rect'\|'text'\|'circle'` | `'rect'` | Forme |
| `width` | `string \| number` | — | Largeur (ignorée si `variant="text"` et `lines>1`, gérée automatiquement) |
| `height` | `string \| number` | — | Hauteur |
| `lines` | `number` | `1` | Nombre de lignes si `variant="text"` — la dernière ligne fait 60% de largeur pour un rendu naturel |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Surface/Secondary`, `Secondary Hover` | `--color-surface-secondary(-hover)` | Dégradé de l'animation shimmer |
| `Shape/Input` | `--shape-input` | Border-radius `rect` |
| `Shape/Pill` | `--shape-pill` | Border-radius `text` |
| `Spacing/8` | `--spacing-8` | Gap entre lignes en mode `text` multi-ligne |

---

## Accessibilité

- `aria-hidden="true"` sur chaque bloc — le skeleton est purement décoratif, l'état de chargement réel doit être communiqué ailleurs (ex. un `Loading` avec `role="status"`, ou un conteneur parent avec `aria-busy="true"`).

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Utiliser `text` + `lines` pour préfigurer plusieurs lignes de paragraphe | Empiler manuellement plusieurs `Skeleton` `rect` fins pour simuler du texte — `lines` le fait déjà |
| Utiliser `circle` pour préfigurer un `Avatar` | Utiliser `rect` avec un `border-radius` manuel pour un avatar |
| Poser `aria-busy="true"` sur le conteneur parent réel | Compter sur `Skeleton` seul pour communiquer l'état de chargement aux lecteurs d'écran |
| Utiliser pour composer un layout de plusieurs formes typées (avatar + lignes de texte) | Utiliser pour un bloc plein unique de grande taille sans typage → `Shimmering` |

---

## Liens

- Figma : [DS.MD — Skeleton/Loading](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=380-301)
- Storybook : `DS.MD/Feedback/Skeleton`
