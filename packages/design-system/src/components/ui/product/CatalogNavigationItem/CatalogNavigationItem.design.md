# CatalogNavigationItem

## Description

Pastille de la barre "Catalog Navigation" (catégorie **Product → Catalog**) : icône + libellé optionnel + badge de compte optionnel. Rend un `<a>` ou un `<button>` selon la présence de `href` — jamais choisi sur l'apparence (les deux partagent exactement le même style visuel).

**Règle appliquée** (cf. MDN, `<a>` vs `<button>`) : `<a href>` = "ça va quelque part" (navigation vers une nouvelle page/URL — ex. Mon carnet, Promo) ; `<button>` = "ça fait quelque chose sur place" (recherche déployée, panneau de filtres, panneau de préférences). Utiliser `href="#"` uniquement comme placeholder temporaire quand la page cible n'existe pas encore (ex. Mon carnet), jamais comme substitut à `<button>` — un `<a href="#">` casse le clic milieu, "ouvrir dans un nouvel onglet", le favori navigateur, et s'annonce mal aux lecteurs d'écran (cf. `StoreHeader.design.md`, même règle déjà appliquée là).

**Ne pas utiliser** pour :
- Un tag produit/merchandising ou un filtre à cocher classique → `ChipTag`
- Un compteur/statut sans action → `Badge`

---

## Variants

| Prop `tone` | Usage |
|---|---|
| `default` (défaut) | Pastille blanche, bordurée — la plupart des items |
| `promo` | Pastille pleine rouge (`Category/Promo/BG`), texte inversé — CTA promo uniquement |

---

## States

| State | Comportement |
|---|---|
| `href` fourni | Rend `<a href>` |
| `href` absent | Rend `<button type="button">` |
| `label` absent | Icône seule — `ariaLabel` alors **obligatoire** pour l'accessibilité |
| `count` fourni | Badge (`variant="brand"`, `size="M"`) après le libellé |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `icon` | `ReactNode` | — | Icône (obligatoire) |
| `label` | `string` | — | Libellé visible ; si absent, item icône seule |
| `ariaLabel` | `string` | — | Nom accessible quand `label` est absent |
| `count` | `number` | — | Badge de compte optionnel |
| `tone` | `'default'\|'promo'` | `'default'` | Voir Variants |
| `href` | `string` | — | Présence → rend `<a>` ; absence → rend `<button>` |
| `onClick` | `() => void` | — | Handler (fonctionne sur `<a>` comme `<button>`) |

Toutes les autres props HTML natives de `<a>`/`<button>` sont transmises (spread).

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Shape/Pill` | `--shape-pill` | Border-radius — pilule complète (999px), alignée sur `Shape/Pill` plutôt que sur le "Shape/Button" 8px du fichier Figma Catalog source |
| `Surface/Primary`, `Border/Default` | `--color-surface-primary`, `--color-border-default` | Tone `default` |
| `Category/Promo/BG` | `--color-category-promo-bg` | Tone `promo` |
| `Content/Default`, `Content/Inversed` | `--color-content-*` | Texte selon tone |
| `Spacing/4,12,16` | `--spacing-*` | Padding, gap |

Badge de compte : réutilise le composant `Badge` (`variant="brand"`, `size="M"`) — aucun style de badge custom.

---

## Accessibilité

- `aria-label` obligatoire quand `label` est omis (items icône seule).
- `<a>` sans `label` visible reste annoncé correctement via `aria-label` (pas de lien "vide" pour un lecteur d'écran).
- Icône toujours `aria-hidden="true"` — l'information est portée par le libellé/aria-label.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Choisir `href` vs `onClick` selon la destination (nouvelle page vs action en place), jamais selon le look | Utiliser `<a href="#">` comme substitut permanent à `<button>` |
| Passer `ariaLabel` pour tout item icône seule | Laisser un item icône seule sans nom accessible |
| Réserver `tone="promo"` au CTA promo | Utiliser `promo` pour un item générique — perd son sens merchandising |

---

## Liens

- Figma : [Catalog — Catalog Navigation Item](https://www.figma.com/design/e8BpuLovSPh0SPseTl29tA/Catalog?node-id=4712-35838)
- Storybook : `DS.MD/Product/Catalog/Catalog Navigation Item`
