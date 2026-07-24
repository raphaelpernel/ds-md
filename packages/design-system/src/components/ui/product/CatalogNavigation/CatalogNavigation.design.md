# CatalogNavigation

## Description

Barre d'outils du catalogue de recettes — recherche, promo, favoris ("Mon carnet"), filtres, préférences. Composée de 5 `CatalogNavigationItem`. Catégorie **Product → Catalog**, comme `CatalogNavigationItem`.

D'après le Figma [Catalog Page](https://www.figma.com/design/e8BpuLovSPh0SPseTl29tA/Catalog?node-id=4009-24278), cette barre est **réutilisée à l'identique** entre la page catalogue (`app/page.tsx`) et chaque Collection Page (`app/collections/[slug]/page.tsx`) — d'où le fait qu'elle vive dans le design-system plutôt que d'être dupliquée par page.

**Périmètre actuel** : Filtrer et Préférences n'ouvrent encore aucun panneau (pas de `Drawer`/`Modal` branché) — seuls les boutons et leur badge de compte sont modélisés, comme demandé. Mon carnet pointe vers une page favoris qui n'existe pas encore (`href="#"` par défaut, comme `StoreHeader`).

---

## Variants

Pas de prop `variant` — la composition est fixe (5 items dans un ordre donné). Personnalisable via props (voir Props).

---

## States

| State | Comportement |
|---|---|
| Search fermé (défaut) | `CatalogNavigationItem` icône seule (loupe) |
| Search ouvert (clic) | Remplacé par un `InputField` avec focus automatique ; `Échap` ou perte de focus referme |
| Transition fermé ↔ ouvert | Animation d'apparition (fade + scale, ~0.2s) sur l'élément entrant, dans les deux sens ; désactivée si `prefers-reduced-motion: reduce` |
| `filterCount`/`preferencesCount` non fournis | Pas de badge affiché sur l'item correspondant |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `searchPlaceholder` | `string` | `'Rechercher une recette'` | Placeholder du champ recherche déployé |
| `onSearchChange` | `(value: string) => void` | — | Handler de saisie recherche |
| `promoHref` | `string` | `'#'` | Destination du CTA Promo |
| `promoLabel` | `string` | `'Promo’'` | Libellé du CTA Promo |
| `favoritesHref` | `string` | `'#'` | Destination de "Mon carnet" |
| `filterCount` | `number` | — | Badge de compte sur "Filtrer" |
| `onFilterClick` | `() => void` | — | Handler du bouton Filtrer (pas de panneau branché aujourd'hui) |
| `preferencesCount` | `number` | — | Badge de compte sur "Préférences" |
| `onPreferencesClick` | `() => void` | — | Handler du bouton Préférences (pas de panneau branché aujourd'hui) |

---

## Tokens utilisés

Hérités de `CatalogNavigationItem` + `InputField` (recherche déployée). Layout propre : `--spacing-8` (gap entre items), `flex-wrap: wrap` pour rester utilisable sur petits écrans.

---

## Accessibilité

- Le champ de recherche déployé porte son propre `aria-label`.
- `Échap` referme la recherche sans perdre le focus ailleurs de façon inattendue.
- Chaque item hérite de l'accessibilité de `CatalogNavigationItem` (voir son `.design.md`).

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Passer un vrai `promoHref`/`favoritesHref` dès qu'une page existe | Laisser `href="#"` en production |
| Réutiliser ce composant tel quel entre catalogue et Collection Page | Recomposer une barre similaire à la main ailleurs |
| Brancher `onFilterClick`/`onPreferencesClick` sur un `Drawer`/`Modal` le jour où ces panneaux existent | Ajouter la logique du panneau directement dans ce composant — il reste une barre d'outils, pas un conteneur de panneau |

---

## Liens

- Figma : [Catalog — Catalog Navigation](https://www.figma.com/design/e8BpuLovSPh0SPseTl29tA/Catalog?node-id=4712-35838)
- Storybook : `DS.MD/Product/Catalog/Catalog Navigation`
