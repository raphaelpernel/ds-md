# FAB

## Description

Bouton d'action flottant, circulaire, icône seule. **Déconseillé par défaut** — voir `docs/DESIGN.md` §3 : aucun usage produit actuel, et l'assistant a explicitement remplacé son FAB flottant par un lien de nav (décision du 2026-07-21, `assistant-shopping/docs/docs/UIUX-DECISIONS.MD`). Ne réserver qu'à un besoin explicitement validé.

**Ne pas utiliser** pour :
- Un CTA principal de page ou de nav → `Button`
- Par défaut, sans justification produit explicite

---

## Variants

### size

| Valeur | Dimensions | Usage |
|---|---|---|
| `S` | 56px | — |
| `M` (défaut) | 64px | — |
| `L` | 72px | — |

Icône toujours rendue à 24×24px quelle que soit la taille du bouton.

### alpha

| Valeur | Usage |
|---|---|
| `false` (défaut) | Fond `Interactive/BG` plein |
| `true` | Fond semi-transparent + blur, pour affichage sur image |

---

## States

| State | Comportement |
|---|---|
| Hover | Fond `Interactive/BG Hover`, ombre plus prononcée (`Elevation/400`) — sauf en `alpha` |
| Disabled | Fond/couleur `Interactive/Disabled`, ombre supprimée |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `size` | `'S'\|'M'\|'L'` | `'M'` | Taille |
| `icon` | `ReactNode` | — | Icône (rendue 24×24) |
| `alpha` | `boolean` | `false` | Variante sur image |
| `disabled` | `boolean` | `false` | Désactive le bouton |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Interactive/BG`, `BG Hover` | `--color-interactive-bg(-hover)` | Fond par défaut |
| `Interactive/Alpha BG`, `Alpha BG Hover` | `--color-interactive-alpha-bg(-hover)` | Variante `alpha` |
| `Interactive/Disabled BG`, `Disabled Content` | `--color-interactive-disabled-*` | Désactivé |
| `Content/Inversed` | `--color-content-inversed` | Couleur icône |
| `Shape/Pill` | `--shape-pill` | Border-radius (cercle) |
| `Elevation/300`, `Elevation/400` | `--elevation-300/400` | Ombre au repos / hover |

---

## Accessibilité

- Pas d'`aria-label` posé automatiquement — le composant ne prend pas de prop `label` distincte de `icon`. **Toujours passer un `aria-label` explicite via les props natives du `<button>`** (le composant étend `ButtonHTMLAttributes`), sinon le bouton n'a aucun nom accessible.
- `aria-disabled` posé en plus de l'attribut natif `disabled`.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Ne l'introduire que pour un besoin explicitement validé (ex. action "ajouter" persistante dans une liste très longue à scroller) | L'utiliser par défaut pour un CTA principal — préférer `Button` en nav ou en bas de flux |
| Toujours passer un `aria-label` | Laisser le bouton sans nom accessible |
| Réserver `alpha` à un affichage sur image | Utiliser `alpha` sur fond plein |

---

## Liens

- Figma : [DS.MD — FAB](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=380-1043)
- Storybook : `DS.MD/Form/FAB`
