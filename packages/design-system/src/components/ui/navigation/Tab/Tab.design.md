# Tab

## Description

Navigation entre vues/sections d'une même page. Deux rendus visuels : soulignement (`default`) ou pilule (`pill`).

**Ne pas utiliser** pour :
- Un choix binaire simple avec effet immédiat sur 2-4 options courtes → `SegmentedControl`
- Un sélecteur de date → `DateTabs`
- Un menu d'actions contextuelles → `Menu`

---

## Variants

### variant

| Valeur | Rendu | Usage |
|---|---|---|
| `default` (défaut) | Soulignement sous l'onglet actif, ligne de base continue | Navigation de page classique |
| `pill` | Fond `Surface/Secondary`, onglet actif en pilule pleine | Contexte plus compact/casual |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `items` | `{value, label, icon?, disabled?}[]` | — | Liste des onglets |
| `value` | `string` | — | Onglet actif |
| `onChange` | `(value: string) => void` | — | Callback au clic sur un onglet non-disabled |
| `variant` | `'default'\|'pill'` | `'default'` | Rendu visuel |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Border/Default` | `--color-border-default` | Ligne de base (`default`) |
| `Interactive/Content` | `--color-interactive-content` | Texte de l'onglet actif/hover |
| `Interactive/Border` | `--color-interactive-border` | Soulignement de l'onglet actif (`default`) |
| `Interactive/BG Subtle` | `--color-interactive-bg-subtle` | Hover (les deux variants) |
| `Interactive/BG`, `BG Hover` | `--color-interactive-bg(-hover)` | Fond de l'onglet actif (`pill`) |
| `Content/Inversed` | `--color-content-inversed` | Texte de l'onglet actif (`pill`) |
| `Content/Weak` | `--color-content-weak` | Onglets inactifs |
| `Interactive/Disabled Content` | `--color-interactive-disabled-content` | Onglet désactivé |
| `Surface/Secondary` | `--color-surface-secondary` | Fond du conteneur (`pill`) |
| `Shape/Pill` | `--shape-pill` | Border-radius (`pill`) |
| `Spacing/4,8,16` | `--spacing-*` | Padding, gaps |

---

## Accessibilité

- **`role="tablist"` / `role="tab"` / `aria-selected`** posés correctement.
- Chaque onglet est un `<button>` natif — focus clavier et activation gratuits.
- **Pas de navigation clavier par flèches** entre onglets (pattern ARIA tablist complet non implémenté) — seul `Tab`/`Shift+Tab` standard fonctionne.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Utiliser pour basculer entre sections/vues d'une même page | Utiliser pour un choix ponctuel à effet immédiat sur peu d'options → `SegmentedControl` |
| Choisir `pill` pour un contexte visuel plus compact/casual, `default` sinon | Mélanger les deux variants dans un même contexte de page |
| Utiliser pour un sélecteur de vues, pas de dates | Utiliser pour un sélecteur de date → `DateTabs` |

---

## Liens

- Figma : [DS.MD — Tab](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=326-702)
- Storybook : `DS.MD/Navigation/Tab`
