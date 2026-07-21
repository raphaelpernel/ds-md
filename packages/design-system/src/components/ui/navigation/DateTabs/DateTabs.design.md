# DateTabs

## Description

Sélecteur de date scrollable horizontalement — adapté aux créneaux (drive, livraison, rendez-vous). Chaque item affiche jour/date/mois. Réutilise la sémantique ARIA `tablist`/`tab` de `Tab`, mais c'est un composant distinct spécialisé pour des **dates**, pas des vues génériques.

**Ne pas utiliser** pour :
- Une navigation entre vues génériques → `Tab`
- Un choix de 2-4 options courtes non temporelles → `SegmentedControl`

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `items` | `{date: 'YYYY-MM-DD', disabled?}[]` | — | Jours proposés |
| `value` | `string` | — | Date sélectionnée (ISO) |
| `onChange` | `(date: string) => void` | — | Callback au clic sur un jour non désactivé |
| `locale` | `string` | `'fr-FR'` | Locale de formatage jour/mois |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Interactive/BG` | `--color-interactive-bg` | Cercle du jour actif |
| `Interactive/Content` | `--color-interactive-content` | Texte jour/mois du jour actif |
| `Interactive/BG Subtle` | `--color-interactive-bg-subtle` | Hover d'un jour inactif |
| `Content/Default` | `--color-content-default` | Numéro du jour, repos |
| `Content/Weak` | `--color-content-weak` | Jour de semaine, mois, repos |
| `Content/Inversed` | `--color-content-inversed` | Numéro du jour actif |
| `Shape/Card` | `--shape-card` | Border-radius de l'item |
| `Spacing/4,8,12` | `--spacing-*` | Gaps, padding |

---

## Accessibilité

- **`role="tablist"` / `role="tab"` / `aria-selected`** — sémantique de sélection standard.
- **`aria-label`** par jour généré automatiquement en toutes lettres (ex. "lundi 21 juin") via `toLocaleDateString`, plus riche que le texte visuel compact (jour/date/mois abrégés) — les lecteurs d'écran obtiennent l'info complète même si l'affichage est condensé.
- Défilement horizontal natif (`overflow-x: auto`), scrollbar masquée visuellement mais navigation clavier/scroll native conservée.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Utiliser pour un sélecteur de créneau/date (drive, livraison, RDV) | Utiliser pour une navigation entre vues génériques → `Tab` |
| Laisser `locale` par défaut (`fr-FR`) sauf app explicitement internationalisée | Reformater manuellement les dates en dehors du composant |
| Utiliser `disabled` par item pour les jours indisponibles | Retirer un jour indisponible de la liste — le désactiver le rend visible mais non sélectionnable |

---

## Liens

- Storybook : `DS.MD/Navigation/DateTabs`
