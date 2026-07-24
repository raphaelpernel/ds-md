# BottomNav

## Description

Barre de navigation principale fixée en bas de viewport, pour les plateformes Mobile/App du `StoreHeader` (où la navigation texte du header Desktop n'a pas sa place). 5 onglets fixes : Accueil, Rayons, Idées repas, Favoris, Compte — avec un fond ("pill") qui glisse vers l'onglet actif.

Chrome de page (site-wide), catégorie `layout` — comme `StoreHeader` et `Drawer`.

**Ne pas utiliser** :
- Sur Desktop — la navigation y vit dans `StoreHeader` (`platform="Desktop"`)
- Pour une navigation à onglets *dans* une page (contenu, pas chrome) → `Tab`

---

## Variants

Pas de variant à proprement parler — 5 onglets fixes, définis en interne (`home`/`aisles`/`recipes`/`favorites`/`account`). Le libellé du dernier onglet est personnalisable via `accountLabel` (nom d'utilisateur).

---

## States

| State | Comportement |
|---|---|
| Onglet actif | Icône `weight="fill"` (ou `"bold"` pour Rayons), libellé en `font-family-heading` bold, couleur `--color-interactive-content`, pill de fond positionnée dessous |
| Onglet inactif | Icône `weight="regular"`, libellé en `font-family-body`, couleur `--color-content-weak` |

---

## Sizes

Taille unique, hauteur pilotée par le padding (`--spacing-8`) + le contenu — pas de prop `size`.

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `activeTab` | `'home'\|'aisles'\|'recipes'\|'favorites'\|'account'` | — | Onglet actif |
| `onTabChange` | `(tab) => void` | — | Handler de changement d'onglet |
| `accountLabel` | `string` | `'Profil'` | Libellé du dernier onglet |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Border/Default` | `--color-border-default` | Bordure haute |
| `Surface/Primary` | `--color-surface-primary` | Fond de la barre |
| `Surface/Brand Light` | `--color-surface-brand-light` | Pill de l'onglet actif |
| `Interactive/Content` | `--color-interactive-content` | Icône/libellé actifs |
| `Content/Weak` | `--color-content-weak` | Icône/libellé inactifs |
| `Body/XS` | `--font-size-body-xs`, `--line-height-body-xs` | Libellés |
| `Shape/Input` | `--shape-input` | Border-radius de la pill |
| `Shadow/-100` | box-shadow -1px/4px, `rgba(3,24,32,0.12)` | Ombre portée vers le haut |

`env(safe-area-inset-bottom)` réservé sous la barre pour les mobiles avec indicateur home (iPhone).

---

## Accessibilité

- `<nav aria-label="Navigation principale">` englobe la barre.
- Chaque onglet est un `<button>` natif, `aria-current="page"` posé sur l'onglet actif.
- Icônes `aria-hidden="true"` — le libellé texte visible porte l'information.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Toujours combiner avec `StoreHeader platform="Mobile"`/`"App"` (pas Desktop) | Utiliser seul sans header au-dessus |
| Piloter `activeTab` depuis la route/l'état de la page courante | Laisser `activeTab` désynchronisé de la navigation réelle |
| Réserver un `padding-bottom` égal à la hauteur de la barre sur le contenu de page | Laisser le contenu de page passer sous la barre fixe |

---

## Liens

- Figma : [Mealz DS — Bottom Nav](https://www.figma.com/design/QC58e6IUcVmrBndbmacDxv/Mealz-DS--DS?node-id=266-2331)
- Storybook : `DS.MD/Layout/Bottom Nav`
