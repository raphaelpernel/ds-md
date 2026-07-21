# Avatar

## Description

Représentation visuelle d'un utilisateur ou d'une entité — image, initiales en repli, ou pastille de présence optionnelle. Forme circulaire ou carrée.

**Ne pas utiliser** pour :
- Une image produit ou un visuel de contenu → utiliser le composant Product (hors périmètre design-system, voir `marmiton-prototype`)
- Un bouton icône seul → utiliser `Button` avec `iconOnly`

---

## Variants

### size

| Valeur | Dimensions | Usage |
|---|---|---|
| `XS` | 24px | Listes denses, mentions inline |
| `S` | 32px | Listes standard, commentaires |
| `M` (défaut) | 40px | Usage général, headers de card |
| `L` | 48px | Profils, headers de section |
| `XL` | 64px | Pages de profil, écrans de compte |

### shape

| Valeur | Usage |
|---|---|
| `circle` (défaut) | Usage général — personnes |
| `square` | Entités/organisations, contextes où le carré distingue d'un profil personnel |

---

## States

| State | Comportement | Notes |
|---|---|---|
| Avec image (`src` fourni) | Affiche l'image, `object-fit: cover` | — |
| Sans image | Affiche les initiales (`initials` ou 2 premières lettres de `alt` en majuscules) | Toujours prévoir un fallback lisible |
| Avec `status` | Pastille de présence en overlay bas-droite | `online` / `offline` / `away` — n'afficher que si l'information de présence est réelle |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `src` | `string` | — | URL de l'image |
| `alt` | `string` | `''` | Texte alternatif de l'image, et source du fallback initiales si `initials` absent |
| `initials` | `string` | — | Initiales affichées si pas d'image (prioritaire sur le calcul depuis `alt`) |
| `size` | `'XS'\|'S'\|'M'\|'L'\|'XL'` | `'M'` | Taille |
| `shape` | `'circle'\|'square'` | `'circle'` | Forme |
| `status` | `'online'\|'offline'\|'away'` | — | Pastille de présence, omise si absente |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Surface/Brand Light` | `--color-surface-brand-light` | Fond de repli derrière les initiales |
| `Interactive/Content` | `--color-interactive-content` | Couleur du texte des initiales |
| `Shape/Input` | `--shape-input` | Border-radius en variante `square` |
| `Surface/Primary` | `--color-surface-primary` | Bordure de la pastille de statut (créé l'effet de découpe) |
| `Semantic/Success/BG` | `--color-semantic-success-bg` | Pastille `online` |
| `Content/Weak` | `--color-content-weak` | Pastille `offline` |
| `Semantic/Warning/BG` | `--color-semantic-warning-bg` | Pastille `away` |
| `Font Size/Label/SM,MD,LG`, `Body/LG` | `--font-size-label-sm/md/lg`, `--font-size-body-lg` | Taille du texte des initiales, par `size` |

> **Note** : les dimensions par `size` (24/32/40/48/64px) sont codées en dur en px dans `Avatar.css`, pas de token `Spacing/*` ou `Size/*` dédié aujourd'hui. Ne pas en déduire un token qui n'existe pas — c'est un gap de tokenisation à signaler si on touche ce fichier.

---

## Accessibilité

- **Image** : `alt` toujours transmis à `<img>`.
- **Pastille de statut** : `aria-label` égal à la valeur du statut (`online`/`offline`/`away`).
- **Initiales** : texte visible, pas de rôle ARIA supplémentaire nécessaire (contenu textuel natif).
- Le composant n'est pas interactif par nature — s'il devient cliquable (ex. ouverture de profil), envelopper dans un élément focusable (`button`, `Link`) plutôt que d'ajouter un `onClick` sur l'`Avatar` lui-même (il n'en expose pas).

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Toujours fournir `alt` (même vide) ou `initials` explicites | Laisser l'utilisateur sans fallback si `src` échoue silencieusement |
| Réserver `status` aux cas où la présence est une donnée réelle et à jour | Afficher un `status` statique/factice à titre décoratif |
| Utiliser `square` pour distinguer une entité/organisation d'un profil personnel | Mélanger `circle` et `square` dans une même liste d'avatars similaires |
| Envelopper dans un élément focusable si l'avatar doit être cliquable | Ajouter un handler de clic directement sur l'`Avatar` (non supporté) |

---

## Liens

- Figma : [DS.MD — Avatar](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=335-638)
- Storybook : `DS.MD/Display/Avatar`
