# Button

## Description

Contrôle interactif principal pour actions et CTA. Cinq variantes sémantiques, quatre tailles, mode icône seule, état de chargement intégré.

**Ne pas utiliser** pour :
- Un lien de navigation inline sans effet de soumission → `Link`
- Une action flottante hors du flux → voir `FAB` (déconseillé par défaut, cf. `docs/DESIGN.md` §3)

---

## Variants

### variant

| Valeur | Usage | Règle |
|---|---|---|
| `primary` (défaut) | CTA principal | **1 seul par section/vue** |
| `secondary` | CTA secondaire (outline) | Action alternative à la primary |
| `tertiary` | Action tertiaire (ghost, sans fond ni bordure) | Actions à faible emphase |
| `danger` | Action destructive | **Uniquement** pour supprimer/annuler définitivement — jamais pour une simple alerte visuelle |
| `alpha` | Sur image ou fond coloré | Fond semi-transparent + blur — réservé aux surfaces avec image en arrière-plan |

### size

| Valeur | Hauteur | Usage |
|---|---|---|
| `L` (défaut) | 48px | CTA principal de page |
| `M` | 40px | Usage général, formulaires |
| `S` | 32px | UI compacte |
| `XS` | 24px | Contextes très denses |

---

## States

| State | Comportement | Notes |
|---|---|---|
| `iconOnly` | Bouton carré, icône seule, `aria-label` requis via `label` | Voir Accessibilité |
| `loading` | Spinner superposé, label masqué (`opacity:0`, pas retiré du DOM), `cursor:wait`, non cliquable | `aria-busy="true"` posé automatiquement |
| `disabled` | Fond/texte `Interactive/Disabled`, non cliquable | `aria-disabled="true"` posé même si `disabled` natif aussi actif |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `variant` | voir ci-dessus | `'primary'` | Variante sémantique |
| `size` | `'L'\|'M'\|'S'\|'XS'` | `'L'` | Taille |
| `label` | `string` | — | Texte (ou utiliser `children`) ; sert aussi d'`aria-label` en mode `iconOnly` |
| `lIcon` / `rIcon` | `ReactNode` | — | Icône gauche/droite, avec label |
| `iconOnly` | `ReactNode` | — | Rend un bouton carré icône seule |
| `loading` | `boolean` | `false` | Affiche le spinner, désactive le clic |
| `disabled` | `boolean` | `false` | Désactive le bouton |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Interactive/BG`, `BG Hover` | `--color-interactive-bg(-hover)` | `primary` |
| `Interactive/Border`, `BG Subtle` | `--color-interactive-border`, `--color-interactive-bg-subtle` | `secondary`/`tertiary` (fond hover) |
| `Interactive/Danger BG`, `Danger BG Hover`, `Danger Content` | `--color-interactive-danger-*` | `danger` |
| `Interactive/Alpha BG`, `Alpha BG Hover` | `--color-interactive-alpha-bg(-hover)` | `alpha` |
| `Interactive/Disabled BG`, `Disabled Content` | `--color-interactive-disabled-*` | `disabled` |
| `Content/Inversed` | `--color-content-inversed` | Texte sur `primary`/`danger`/`alpha` |
| `Shape/Button` | `--shape-button` | Border-radius (pill) |
| `Spacing/8,12,16,20,24,32,40,48` | `--spacing-*` | Hauteurs et paddings par taille |
| `Font Family/Label`, `Font Size/Label/SM,MD,LG` | — | Typographie par taille |

---

## Accessibilité

- **`iconOnly`** : `aria-label` posé automatiquement depuis la prop `label` — toujours fournir `label` même sans texte visible.
- **`loading`** : `aria-busy="true"` posé automatiquement ; le texte reste dans le DOM (juste invisible), donc toujours accessible aux lecteurs d'écran qui ne suivraient pas `aria-busy`.
- **`disabled`** : `aria-disabled` posé en plus de l'attribut natif `disabled`.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Un seul `primary` par section/vue | Empiler plusieurs `primary` côte à côte |
| Réserver `danger` aux actions destructives réelles (suppression, annulation définitive) | Utiliser `danger` pour une simple alerte visuelle |
| Utiliser la prop `loading` intégrée pour l'état de chargement d'un bouton | Imbriquer le composant `Loading` autonome à l'intérieur d'un `Button` |
| Réserver `alpha` aux boutons posés sur une image/fond coloré | Utiliser `alpha` sur un fond plein — contraste réduit sans raison |
| Toujours fournir `label` en mode `iconOnly` | Omettre `label` — le bouton perdrait son nom accessible |

---

## Liens

- Figma : [DS.MD — Button](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=345-1158)
- Storybook : `DS.MD/Form/Button`
