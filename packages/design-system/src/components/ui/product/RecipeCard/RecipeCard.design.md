# RecipeCard

## Description

Carte affichant une recette dans une grille (catalogue, collection, rayon) : visuel, titre, nombre de portions, badges merchandising, prix, favori et action panier. Premier composant de la catégorie **Product** — composants modélisant une entité produit/commerce (recette, à terme peut-être produit catalogue), distincts des primitives UI génériques (`display`, `form`, etc.).

Périmètre actuel : variante **Desktop / Catalog** du Figma source uniquement (carte verticale, taille par défaut 240×360). Non couvert par ce composant :
- Variante Mobile/App horizontale ("Aisle")
- Taille `smallCard` (prop `size="small"` scaffoldée mais non stylée)
- Prix façon partenaire (ex. Leclerc, gros chiffre/petit) — jugé hors système de tokens brand/partner actuel
- `bottomCustom` (aperçu ingrédients + badge "+99") du Figma

**Ne pas utiliser** pour :
- Une carte produit générique de rayon (hors recette) → composant app-level `ProductCard` (`marmiton-prototype`)
- Une vue détaillée de recette → à venir, hors périmètre (Figma node 91:17801)

---

## Variants

| Prop | Valeur | Usage |
|---|---|---|
| `size` | `'default'` (implémenté), `'small'` (scaffoldé, non stylé) | Taille de carte |
| `mealIdea` | `boolean` | Badge "Idée repas" (ChipTag `type="toned"` + icône ChefHat). **Rayon uniquement — ne jamais l'activer dans un contexte catalogue.** |
| `promo` | `boolean` | Badge "Promo'" (ChipTag `category="promo"` `appearance="solid"`) |
| `sponsor` | `{ logoUrl, label? }` | Bulle logo sponsor, coin haut-gauche |

**Ordre des badges (fixe, ne pas réordonner) : Idée repas → Sponsor → Promo.**

---

## States

| State | Comportement | Notes |
|---|---|---|
| `loading` | Remplace le visuel + le bas de carte par des `Skeleton` | Dimensions de carte conservées (pas de layout shift) |
| `favorite` | Bouton cœur **toujours visible**, `Button` `variant="alpha"` fixe (posé sur le media → règle système, voir DESIGN.md §3 "CTA sur un media") ; l'état favori se lit à l'icône (`weight="fill"` vs `"regular"`), pas à la couleur du bouton | Volontairement pas de rouge, ni de bascule primary/secondary — un CTA sur image reste toujours alpha, quel que soit son état. Sans `onFavoriteToggle`, le bouton reste affiché mais n'a pas d'effet |
| `added` | Le bouton panier passe de `variant="primary"` (icône panier) à `variant="secondary"` (icône check) | Bascule via `onAddToggle`, pas de vrai état panier interne au composant |
| Cliquable (`onClick` fourni) | La carte entière devient `role="button"` focusable, `stopPropagation` sur favori/panier pour ne pas déclencher la navigation | Sans `onClick`, la carte n'est pas interactive elle-même |

---

## Sizes

| Valeur | Dimensions | Statut |
|---|---|---|
| `default` | 240×360px (min-width 200px) | ✅ Implémenté |
| `small` | 167×248px | ⏳ Prop acceptée, style identique à `default` pour l'instant |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | — | Titre de la recette (clampé 2 lignes) |
| `imageUrl` | `string` | — | Visuel recette |
| `imageAlt` | `string` | `''` | Alt du visuel (décoratif par défaut, le titre porte déjà l'info) |
| `guests` | `number` | — | Nombre de portions, affiché en pastille |
| `price` | `number` | — | Prix, formaté `XX,XX €` |
| `priceUnit` | `string` | `'/pers.'` | Unité affichée après le prix |
| `size` | `'default'\|'small'` | `'default'` | Voir Sizes |
| `mealIdea` | `boolean` | `false` | Badge "Idée repas" |
| `promo` | `boolean` | `false` | Badge "Promo'" |
| `sponsor` | `{ logoUrl, label? }` | — | Bulle logo sponsor |
| `favorite` | `boolean` | `false` | État du favori (bouton toujours rendu, actif ou non) |
| `onFavoriteToggle` | `() => void` | — | Handler du bouton favori |
| `added` | `boolean` | `false` | État "déjà dans le panier" |
| `onAddToggle` | `() => void` | — | Handler du bouton panier |
| `loading` | `boolean` | `false` | Affiche l'état skeleton |
| `onClick` | `() => void` | — | Rend la carte cliquable (ex. navigation vers le détail) |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Shape/Card` | `--shape-card` | Border-radius de la carte |
| `Shape/Pill` | `--shape-pill` | Badges, pastille portions, sponsor |
| `Shape/Button` | `--shape-button` (via `Button`) | Bouton favori et bouton panier — taille `M` (40×40) par défaut, comme tout bouton icône seul du système |
| `Interactive/Alpha BG` | `--color-interactive-alpha-bg` (via `Button variant="alpha"`) | Bouton favori — posé sur le media, cf. règle système CTA-sur-media |
| `Surface/Primary` | `--color-surface-primary` | Fond de carte, pastilles blanches |
| `Border/Default` | `--color-border-default` | Bordure bas de carte |
| `Content/Default`, `Content/Weak`, `Content/Inversed` | `--color-content-*` | Textes titre (inversé sur image), prix, unité |
| `Family/Heading`, `Family/Price`, `Family/Body` | `--font-family-*` | Titre, prix, unité/pastille |
| `Utilities/Price/L` | `--font-size-price-lg`, `--line-height-price-lg` | Prix |
| `Spacing/4,8,12` | `--spacing-*` | Paddings, gaps |

Badge "Idée repas" : réutilise `ChipTag type="toned"` (fond `--color-interactive-bg-subtle` = `Surface/Brand Light`, texte `--color-interactive-content` = `Content/Brand`) — aucune extension de `ChipTag` n'a été nécessaire, la palette `toned` existante correspond déjà à la maquette.

---

## Accessibilité

- **Titre** : porté par un `<p>` avec `-webkit-line-clamp: 2` — pas de balise `Heading` (overlay sur image avec `text-shadow`, cas non couvert par le composant `Heading`).
- **Bouton favori** : toujours rendu (jamais conditionné à `onFavoriteToggle`), `aria-pressed` + `aria-label` explicite ("Ajouter/Retirer {title} des favoris"), `stopPropagation` pour ne pas déclencher le clic de la carte.
- **Bouton panier** : `label` (aria-label via `Button`) explicite selon l'état ("Ajouter {title} au panier" / "{title} — déjà dans le panier").
- **Carte cliquable** : `role="button"` + `tabIndex={0}` + gestion clavier (`Enter`/`Espace`) uniquement quand `onClick` est fourni.
- **Image** : `alt` vide par défaut (décorative, le titre visible porte l'information).

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Utiliser pour toute grille de recettes (catalogue, rayon, collection) | Utiliser pour un produit non-recette → `ProductCard` |
| Passer `onFavoriteToggle`/`onAddToggle` pour rendre les actions interactives | S'attendre à un état panier géré en interne — c'est au consommateur de le piloter |
| Garder `imageAlt` vide si le titre visible décrit déjà la recette | Dupliquer le titre dans `imageAlt` |
| Activer `mealIdea` uniquement dans un contexte rayon | Activer `mealIdea` dans un catalogue de recettes — le badge n'a de sens que pour signaler une recette au milieu de produits rayon |
| Laisser l'ordre des badges Idée repas → Sponsor → Promo | Réordonner les badges au cas par cas |
| Garder le bouton favori en `variant="alpha"` (posé sur le media) | Lui donner `primary`/`secondary`/`tertiary`/`danger` — règle système, voir DESIGN.md §3 |

---

## Liens

- Figma : [Recipes — Recipe Card](https://www.figma.com/design/YDFZDIbtM9w9F5pWftkbUR/Recipes?node-id=378-53604)
- Storybook : `DS.MD/Product/Recipe Card`
