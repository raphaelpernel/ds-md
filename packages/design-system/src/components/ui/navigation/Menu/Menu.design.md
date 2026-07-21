# Menu

## Description

Menu d'actions contextuelles (edit/duplicate/share/delete…) — liste verticale de boutons, avec support des diviseurs et d'un état `danger`. Ne gère pas son propre positionnement/ouverture (pas de popover intégré) — à envelopper dans le mécanisme d'ouverture au clic/hover de l'appelant.

**Ne pas utiliser** pour :
- Un choix de vue → `Tab`/`SegmentedControl`
- Une valeur de champ de formulaire → `Select`
- Une aide contextuelle courte → `Tooltip`

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `items` | `MenuItem[]` | — | `{value, label, icon?, disabled?, danger?, divider?}` |
| `onSelect` | `(value: string) => void` | — | Callback au clic sur un item non-disabled/non-divider |

> Un item avec `divider: true` ignore les autres champs — utiliser une entrée dédiée juste pour le séparateur.

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Surface/Primary`, `Primary Hover` | `--color-surface-primary(-hover)` | Fond du menu, hover d'un item |
| `Border/Default` | `--color-border-default` | Bordure du menu, diviseurs |
| `Elevation/300` | `--elevation-300` | Ombre portée |
| `Interactive/Danger Content`, `Danger BG` | `--color-interactive-danger-*` | Item `danger` |
| `Interactive/Disabled Content` | `--color-interactive-disabled-content` | Item `disabled` |
| `Shape/Card` | `--shape-card` | Border-radius |
| `Spacing/4,8,16` | `--spacing-*` | Padding |

---

## Accessibilité

- **`role="menu"` / `role="menuitem"` / `role="separator"`** posés correctement.
- Chaque item est un `<button>` natif — focus clavier et activation gratuits.
- **Pas de gestion clavier de type menu natif** (flèches haut/bas pour naviguer entre items, `Escape` pour fermer) — seul le focus/tab standard du navigateur s'applique. Si un vrai comportement de menu clavier est nécessaire, il reste à implémenter côté appelant ou à faire évoluer le composant.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Utiliser pour des actions contextuelles (edit/duplicate/share/delete) déclenchées par un clic/hover externe | Utiliser pour un choix de vue ou de valeur de formulaire |
| Réserver `danger` aux actions destructives (delete) | Utiliser `danger` pour une action non destructive |
| Regrouper les actions liées et séparer avec `divider` (ex. actions courantes / destructives) | Multiplier les diviseurs sans regroupement logique |

---

## Liens

- Figma : [DS.MD — Menu](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=374-1297)
- Storybook : `DS.MD/Navigation/Menu`
