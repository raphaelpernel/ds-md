# ChipTag

## Description

Composant double-usage : tags UI génériques (filtres, tags de recette, overlays sur image) via `type`, et étiquettes produit/merchandising (promo, nouveauté, healthy, express, low-cost) via `category`. `category` **remplace** `type` quand défini — les deux ne doivent pas être passés ensemble.

**Ne pas utiliser** pour :
- Un compteur numérique ou indicateur de statut → `Badge`
- Un choix exclusif parmi 2-4 options → `SegmentedControl`
- Une navigation entre vues → `Tab`

---

## Variants

### type (tags génériques — sans `category`)

| Valeur | Usage | Règle |
|---|---|---|
| `filled` | Filtre actif/sélectionné | Fond plein `Interactive/BG` |
| `toned` | Usage contextuel libre | Fond `Interactive/BG Subtle`, s'assombrit en `filled` au hover si cliquable |
| `neutral-filled` (défaut) | Tag statique sur fond clair (ex. tags de recette) | Non cliquable par défaut |
| `neutral-outline` | Tag de recette, non cliquable | Bordure visible, fond transparent |
| `alpha` | Sur image uniquement | Fond semi-transparent + blur — **jamais** sur fond plein |

### category (tags produit — remplace `type`)

| Valeur | Usage |
|---|---|
| `promo` | Réduction / prix barré |
| `new` | Nouveauté |
| `healthy` | Healthy / bien-être |
| `express` | Livraison/préparation rapide |
| `low-cost` | Prix bas |

### appearance (avec `category` uniquement)

| Valeur | Usage |
|---|---|
| `solid` | Sur image (fond plein, contraste garanti) |
| `toned` | Sur surface claire (fond teinté) |

### size

| Valeur | Hauteur | Usage |
|---|---|---|
| `L` | 40px | Mise en avant |
| `M` (défaut) | 32px | Usage général |
| `S` | 24px | Listes denses, tags de recette |

---

## States

| State | Comportement | Notes |
|---|---|---|
| Cliquable (`onClick` fourni) | Rendu en `<button>`, `aria-pressed` reflète `selected` | Sans `onClick`, rendu en `<span>` non focusable même si stylé comme un filtre |
| `selected` | Fond `Interactive/BG Subtle` + bordure `Interactive/Border` | Ne s'applique visuellement qu'aux types `neutral-filled`/`neutral-outline` (chips de filtre) |
| `disabled` | Opacity 0.5, `pointer-events: none` | `disabled` natif posé seulement si le tag est un `<button>` |
| Avec `onRemove` | Bouton "✕" intégré, `aria-label="Retirer {label}"`, `stopPropagation` | N'affecte pas l'`onClick` du chip parent |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — | Texte du tag |
| `type` | voir ci-dessus | `'neutral-filled'` | Ignoré si `category` est défini |
| `category` | voir ci-dessus | — | Remplace `type` quand présent |
| `appearance` | `'solid'\|'toned'` | `'solid'` si `category` | Uniquement pertinent avec `category` |
| `size` | `'L'\|'M'\|'S'` | `'M'` | Taille |
| `icon` | `ReactNode` | — | Icône avant le texte |
| `selected` | `boolean` | `false` | État sélectionné (filtres) |
| `disabled` | `boolean` | `false` | Désactive l'interaction |
| `onClick` | `() => void` | — | Rend le chip cliquable (sinon `<span>` statique) |
| `onRemove` | `() => void` | — | Ajoute un bouton de suppression intégré |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Interactive/BG`, `BG Hover` | `--color-interactive-bg`, `--color-interactive-bg-hover` | Type `filled` |
| `Interactive/BG Subtle` | `--color-interactive-bg-subtle` | Type `toned`, état `selected` |
| `Interactive/Content` | `--color-interactive-content` | Texte `toned`, `selected` |
| `Interactive/Border` | `--color-interactive-border` | Bordure `selected` |
| `Surface/Secondary`, `Secondary Hover` | `--color-surface-secondary(-hover)` | Type `neutral-filled` |
| `Border/Default` | `--color-border-default` | Type `neutral-outline` |
| `Interactive/Alpha BG`, `Alpha BG Hover` | `--color-interactive-alpha-bg(-hover)` | Type `alpha` |
| `Category/*/BG`, `BG Light`, `Content` | `--color-category-{promo,new,healthy,express,low-cost}-*` | `category` + `appearance` |
| `Shape/Pill` | `--shape-pill` | Border-radius |
| `Spacing/2,4,8,12,16` | `--spacing-*` | Padding par taille, gaps |
| `Font Size/Label/Badge` | `--font-size-label-badge` | Taille de texte (une seule taille pour toutes les tailles de chip — seul le padding varie) |

---

## Accessibilité

- **Rôle** : `button` natif si `onClick` fourni (focusable, activable au clavier), `span` sinon (non focusable — intentionnel pour les tags purement informatifs).
- **aria-pressed** : posé automatiquement sur les chips cliquables, reflète `selected`.
- **Bouton de suppression** : `aria-label` explicite ("Retirer {label}"), `stopPropagation` pour ne pas déclencher le clic du chip parent.
- **disabled** : `pointer-events: none` bloque l'interaction même en `<span>`.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Utiliser `category` (pas `type`) pour promo/new/healthy/express/low-cost, avec `appearance="solid"` sur image et `"toned"` sur surface claire | Passer `type` et `category` en même temps — `category` écrase silencieusement `type` |
| Toujours passer `onClick` si le chip doit être interactif | Styler un chip comme un filtre (`filled`/`selected`) sans lui donner d'`onClick` — il resterait un `<span>` non focusable |
| Réserver `alpha` aux tags posés sur une image/dégradé | Utiliser `alpha` sur un fond plein — contraste quasi nul |
| Utiliser `neutral-outline`/`neutral-filled` + `selected` pour une barre de filtres | Utiliser pour un choix exclusif → `SegmentedControl` |

---

## Liens

- Figma : [DS.MD — Chip Tag](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=380-430)
- Storybook : `DS.MD/Display/Chip Tag`
