# Tooltip

## Description

Aide contextuelle courte affichée au survol (ou au focus clavier) d'un élément enveloppé. Positionnement CSS pur — pas de détection de collision avec les bords du viewport.

**Ne pas utiliser** pour :
- Un contenu actionnable ou long (liens, boutons) → `Menu` ou repenser l'interaction
- Un menu d'actions → `Menu`

---

## Variants

### placement

| Valeur | Usage |
|---|---|
| `top` (défaut) | Par défaut, sauf contrainte d'espace |
| `bottom` | Élément proche du haut du viewport |
| `left` / `right` | Élément proche d'un bord vertical du viewport |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `content` | `string` | — | Texte du tooltip (obligatoire) |
| `children` | `ReactNode` | — | Élément déclencheur — **doit être focusable** (voir Accessibilité) |
| `placement` | voir ci-dessus | `'top'` | Position |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Surface/Inverse` | `--color-surface-inverse` | Fond du tooltip |
| `Content/Inversed` | `--color-content-inversed` | Texte |
| `Font Family/Label`, `Font Size/Label/SM` | `--font-family-label`, `--font-size-label-sm` | Typographie |
| `Shape/Input` | `--shape-input` | Border-radius |
| `Elevation/200` | `--elevation-200` | Ombre portée |
| `Spacing/4,8` | `--spacing-4/8` | Padding, décalage par rapport au déclencheur |

---

## Accessibilité

- **`role="tooltip"`** posé sur le contenu.
- **Affichage piloté en CSS pur** : `:hover` et `:focus-within` sur le wrapper — ce qui signifie que **`children` doit contenir un élément focusable** (bouton, lien, input) pour que les utilisateurs clavier voient le tooltip. Envelopper un `<span>`/`<div>` non focusable prive les utilisateurs clavier de l'information.
- **Pas de collision detection** : le tooltip peut déborder du viewport près des bords — à vérifier manuellement si l'élément déclencheur est en périphérie d'écran.
- **`content`** doit rester court (`white-space: nowrap` — pas de retour à la ligne géré), sous peine de débordement visuel.
- `pointer-events: none` sur le tooltip — aucun contenu interactif possible à l'intérieur, même si on essayait.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Envelopper un élément focusable (`Button`, `Link`, champ de formulaire) | Envelopper un `<span>`/`<div>` non focusable — inaccessible au clavier |
| Garder `content` court, une phrase courte maximum | Mettre un texte long — pas de wrap, débordement visuel garanti |
| Vérifier manuellement le `placement` près des bords du viewport | Supposer une détection de collision automatique — elle n'existe pas |
| Utiliser pour de l'aide contextuelle pure lecture | Mettre un lien ou un bouton dans `content` — `pointer-events: none` bloque toute interaction |

---

## Liens

- Figma : [DS.MD — Tooltip](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=334-622)
- Storybook : `DS.MD/Feedback/Tooltip`
