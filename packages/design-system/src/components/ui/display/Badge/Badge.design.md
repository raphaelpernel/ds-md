# Badge

## Description

Étiquette compacte non interactive pour **compteurs numériques** (ex. nombre d'articles au panier) et **indicateurs de statut** (point coloré + libellé, ex. "En ligne"). Statique — ne réagit pas au clic ni au survol.

**Ne pas utiliser** pour :
- Une étiquette produit/merchandising (promo, nouveauté, healthy…) → utiliser `ChipTag` avec la prop `category`
- Un filtre ou tag sélectionnable → utiliser `ChipTag`
- Une action ou un état qui doit être cliquable → aucun composant Badge ne doit être rendu cliquable ; envelopper dans `Button`/`ChipTag` si une interaction est nécessaire

---

## Variants

### variant

| Valeur | Usage |
|---|---|
| `default` (défaut) | Neutre — compteur générique, statut sans connotation |
| `brand` | Mise en avant liée à la marque |
| `success` | Statut positif (payé, livré, disponible) |
| `danger` | Statut critique (rupture, erreur, expiré) |
| `warning` | Statut à surveiller (stock faible, expire bientôt) |
| `info` | Statut informatif neutre |

### size

| Valeur | Usage |
|---|---|
| `S` | Contextes très denses (icône + badge inline) |
| `M` (défaut) | Usage général |
| `L` | Mise en avant, badges seuls hors contexte dense |

### dot

| Valeur | Usage |
|---|---|
| `false` (défaut) | Badge texte standard |
| `true` | Ajoute un point coloré avant le texte (ex. "● En ligne") |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — | Texte du badge (obligatoire) |
| `variant` | voir ci-dessus | `'default'` | Couleur sémantique |
| `size` | `'S'\|'M'\|'L'` | `'M'` | Taille |
| `dot` | `boolean` | `false` | Ajoute le point de statut |
| `icon` | `ReactNode` | — | Icône avant le texte (mutuellement peu utile avec `dot`) |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Surface/Secondary` | `--color-surface-secondary` | Fond variant `default` |
| `Content/Weak` | `--color-content-weak` | Texte variant `default` |
| `Surface/Brand Light` | `--color-surface-brand-light` | Fond variant `brand` |
| `Interactive/Content` | `--color-interactive-content` | Texte variant `brand` |
| `Semantic/*/BG Light` | `--color-semantic-{success,danger,warning,info}-bg-light` | Fond des variants sémantiques |
| `Semantic/*/Content` | `--color-semantic-{success,danger,warning,info}-content` | Texte des variants sémantiques |
| `Shape/Pill` | `--shape-pill` | Border-radius |
| `Spacing/2,4,8,12` | `--spacing-2/4/8/12` | Padding par taille, gap icône/texte |
| `Font Size/Label/SM,MD` | `--font-size-label-sm/md` | Taille de texte (`M`/`L`) |

> **Note** : la taille `S` utilise `10px`/`12px` codés en dur (pas de token `Font Size/Label/XS`). Ne pas inventer un token correspondant — c'est un gap existant.

---

## Accessibilité

- Élément non interactif (`<span>`) — aucun rôle ARIA requis.
- `dot` et `icon` sont rendus avec `aria-hidden="true"` : l'information doit être portée par `label`, pas par la couleur seule (ex. ne pas se contenter d'un badge `danger` sans texte explicite type "Rupture").
- Ne jamais rendre le badge focusable ou cliquable — si une action est nécessaire, c'est le mauvais composant.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Réserver aux compteurs numériques et indicateurs de statut | Utiliser pour des étiquettes produit → `ChipTag category` |
| Choisir le `variant` sémantique correspondant réellement à l'état (danger = critique) | Utiliser `danger`/`warning` par pur choix esthétique sans rapport avec l'état réel |
| Toujours porter l'information dans `label`, la couleur en renfort seulement | Compter sur la couleur seule (`dot`/`variant`) pour transmettre l'information |
| Un seul badge par élément | Empiler plusieurs badges sur le même élément |

---

## Liens

- Figma : [DS.MD — Badge](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=333-618)
- Storybook : `DS.MD/Display/Badge`
