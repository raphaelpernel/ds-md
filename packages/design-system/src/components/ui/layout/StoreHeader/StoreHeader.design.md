# StoreHeader

## Description

Barre de navigation principale d'un site marchand Mealz — logo, navigation, recherche, favoris, compte, panier. Chrome de page (site-wide), pas un contrôle de navigation intra-page : rejoint `Drawer` dans la catégorie `layout`, pas `navigation` (qui regroupe `Tab`/`Breadcrumb`/`Menu`).

Trois rendus selon `platform`, calqués sur le composant Figma `StoreHeader` :
- **Desktop** : logo + nav texte (Rayons, Idées repas) + barre de recherche + nav droite (Magasins, Favoris, compte, panier).
- **Mobile** (web mobile) : header condensé — menu, recherche, favoris, panier en icônes. La navigation passe dans `BottomNav`.
- **App** (app mobile native) : identique à Mobile sans le bouton menu (pas de navigation "plus" hors `BottomNav`).

**Ne pas utiliser** pour une navigation secondaire à l'intérieur d'une page (filtres, onglets de section) → `Tab`/`SegmentedControl`/`Breadcrumb`.

---

## Variants

| Prop `platform` | Usage |
|---|---|
| `Desktop` (défaut) | ≥ 1024px, layout `layout.css` |
| `Mobile` | < 768px, web responsive |
| `App` | < 768px, conteneur app native (pas de bouton menu) |

Le choix de la variante n'est **pas** détecté automatiquement par le composant (pas de `useMediaQuery` interne, pour rester un composant pur/SSR-safe) — c'est au consommateur de choisir `platform` selon le viewport (ex. via `useMediaQuery` du DS, voir `packages/supermarket/app/page.tsx`).

---

## States

| State | Comportement |
|---|---|
| Panier vide (`cartCount=0`) | Badge affiche "0", prix "0,00€" |
| Panier non vide | Badge + prix mis à jour, mêmes styles |
| `userName` non fourni (Desktop) | L'item "compte" n'est pas rendu |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `platform` | `'Desktop'\|'Mobile'\|'App'` | `'Desktop'` | Variante rendue |
| `storeName` | `string` | `'SUPAMRKT'` | Logo texte (Desktop uniquement) |
| `cartCount` | `number` | `0` | Badge quantité panier |
| `cartTotal` | `number` | `0` | Prix panier, formaté `X,XX€` |
| `userName` | `string` | — | Nom affiché à côté de l'icône compte (Desktop) |
| `searchPlaceholder` | `string` | `'Rechercher un produit'` | Placeholder du champ recherche (Desktop) |
| `aislesHref` / `recipesHref` / `storesHref` / `favoritesHref` / `accountHref` / `cartHref` | `string` | `'#'` | `href` de chaque item de navigation |
| `onMenuClick` / `onSearchClick` / `onSearchChange` / `onAislesClick` / `onRecipesClick` / `onStoresClick` / `onFavoritesClick` / `onAccountClick` / `onCartClick` | `() => void` | — | Handlers optionnels par item (ex. routage client) |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Border/Default` | `--color-border-default` | Séparation header/contenu |
| `Surface/Primary` | `--color-surface-primary` | Fond du header |
| `Content/Default` | `--color-content-default` | Logo, items nav, icônes |
| `Spacing/8,12,16,24` | `--spacing-*` | Paddings/gaps par plateforme |
| `Utilities/Price/M` | `--font-size-price-md`, `--line-height-price-md` | Total panier |
| `Heading/SM` | `--font-size-heading-sm` | Logo texte |

Composition : `InputField` (recherche Desktop), `Badge` (`variant="brand"` — compteur panier).

---

## Accessibilité

- Chaque action icône-seule a un `aria-label` explicite (`"Voir le panier"`, `"Rechercher"`, `"Ouvrir le menu"`, `"Favoris"`).
- Le champ de recherche Desktop a son propre `aria-label` en plus du placeholder.
- **Items de navigation réelle** (Rayons, Idées repas, Magasins, Favoris, compte, panier) : rendus en `<a href>` — ce sont des liens de navigation, pas des actions ponctuelles (ouvrent une autre page/vue), donc pas des `<button>` (cf. décision table `DESIGN.md` §3 : "Lien texte inline ou de navigation" → sémantique `<a>`). Toujours passer un `href` réel en prod, pas seulement `onClick`, pour le clic milieu/nouvel onglet et le SEO.
- **Actions ponctuelles** (menu hamburger, recherche mobile) : restent des `<button>` — elles ouvrent un panneau/une UI sur place, elles ne changent pas de page.
- Navigation au clavier : tous les items (`<a>` comme `<button>`) sont nativement focusables et activables au clavier.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Choisir `platform` via `useMediaQuery` côté app, pas en dur | Rendre le Desktop sur mobile — la recherche/nav texte déborde |
| Toujours fournir `onCartClick` pour une vraie navigation panier | Laisser le panier sans handler en dehors de Storybook |
| Combiner avec `BottomNav` sur Mobile/App pour la navigation principale | Dupliquer les items de nav (Rayons/Idées repas) dans le header condensé — ils vivent dans `BottomNav` |
| Passer un `href` réel à chaque item de navigation | Ne piloter la navigation qu'avec `onClick` sur un `<a href="#">` — casse le clic milieu/nouvel onglet |

---

## Liens

- Figma : [Mealz DS — Navbar](https://www.figma.com/design/QC58e6IUcVmrBndbmacDxv/Mealz-DS--DS?node-id=111-4078)
- Storybook : `DS.MD/Layout/Store Header`
