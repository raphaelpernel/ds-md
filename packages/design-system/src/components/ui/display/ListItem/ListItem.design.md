# ListItem

## Description

Ligne d'une liste verticale — label, description secondaire optionnelle, et slots gauche/droite libres (icône, avatar, chevron, badge, switch…). Optionnellement interactive.

**Ne pas utiliser** pour :
- Une grille ou une card de contenu → composant Product (hors périmètre design-system)
- Un menu d'actions contextuelles → `Menu`
- Un item de navigation principale par onglets → `Tab`

---

## Variants

Pas de variant `cva` exposé — seuls `interactive` et `disabled` sont dérivés des props (`onClick`, `disabled`), pas configurables indépendamment.

---

## States

| State | Comportement | Notes |
|---|---|---|
| Défaut (pas d'`onClick`) | Rendu en `<div>`, non focusable | Ligne purement informative |
| Interactive (`onClick` fourni) | Rendu en `<button>`, hover `Surface/Primary Hover`, `cursor: pointer` | Devient focusable et activable au clavier nativement |
| `disabled` | Opacity 0.5, `pointer-events: none` | N'a d'effet de bouton natif (`disabled` HTML) que si `onClick` est aussi fourni — sinon la ligne est déjà un `<div>` inerte |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — | Texte principal (obligatoire) |
| `description` | `string` | — | Texte secondaire, sous le label |
| `lSlot` | `ReactNode` | — | Contenu libre à gauche (icône, avatar…) |
| `rSlot` | `ReactNode` | — | Contenu libre à droite (chevron, badge, switch…) |
| `onClick` | `() => void` | — | Rend la ligne interactive (sinon `<div>` inerte) |
| `disabled` | `boolean` | `false` | Désactive l'interaction |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Surface/Primary Hover` | `--color-surface-primary-hover` | Fond au survol si interactive |
| `Content/Weak` | `--color-content-weak` | Couleur des slots, texte `description` |
| `Content/Default` | `--color-content-default` | Couleur du `label` |
| `Font Family/Body`, `Font Size/Body/MD,SM` | `--font-family-body`, `--font-size-body-md/sm` | Typographie label / description |
| `Spacing/2,12,16` | `--spacing-2/12/16` | Gap interne, padding de la ligne |

---

## Accessibilité

- **Interactive** : rendu en `<button>` natif — focus clavier et activation (Enter/Espace) gratuits, pas de `role` à ajouter.
- **Non interactive** : rendu en `<div>` — correctement exclu de la navigation clavier, aucune sémantique interactive parasite.
- **Slots décoratifs** : le composant ne pose pas `aria-hidden` sur `lSlot`/`rSlot` — c'est à l'appelant de le faire si l'icône/avatar passé est purement décoratif.
- **Nom accessible** : porté automatiquement par `label` (contenu texte du bouton) — ne pas dupliquer via un `aria-label` sauf si `label` seul ne suffit pas à décrire l'action.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Utiliser pour des listes verticales scrollables (réglages, résultats de recherche, contacts) | Utiliser pour une mise en page en grille |
| Toujours passer `onClick` si la ligne doit être tapable | Styler visuellement une ligne comme cliquable sans lui donner d'`onClick` |
| Marquer soi-même les icônes décoratives de `lSlot`/`rSlot` en `aria-hidden` | Compter sur le composant pour le faire automatiquement |
| Si `rSlot` contient son propre élément interactif (ex. switch), stopper sa propagation de clic (cf. pattern `onRemove` de `ChipTag`) | Laisser deux handlers de clic se déclencher simultanément |

---

## Liens

- Figma : [DS.MD — List Item](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=374-1309)
- Storybook : `DS.MD/Display/List Item`
