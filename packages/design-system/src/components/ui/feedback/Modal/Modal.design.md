# Modal

## Description

Dialogue centré et **bloquant** pour une interaction courte et focalisée (confirmation, login, formulaire court). Ferme sur `Escape`, sur clic de l'overlay, ou via le bouton "✕" du header.

**Ne pas utiliser** pour :
- Un contenu long, une liste à parcourir, un formulaire étendu → `Drawer`
- Une notification non bloquante → `Toast`/`Alert`

---

## Variants

### size

| Valeur | Largeur max | Usage |
|---|---|---|
| `S` | 400px | Confirmation courte, message simple |
| `M` (défaut) | 560px | Formulaire court, login |
| `L` | 720px | Contenu plus riche restant ponctuel |

---

## States

| State | Comportement | Notes |
|---|---|---|
| `open=false` | Ne rend rien (`return null`) | Pas d'animation de sortie gérée par le composant |
| `hideHeader` | Masque le header (titre + bouton fermeture) | Pour un header custom dans `children` |
| Clic sur l'overlay | Déclenche `onClose` | Le clic à l'intérieur du modal fait `stopPropagation` — ne ferme pas |
| Touche `Escape` | Déclenche `onClose` | Actif uniquement quand `open=true` |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `open` | `boolean` | — | Affiche/masque le modal |
| `onClose` | `() => void` | — | Overlay, Escape, bouton "✕" |
| `title` | `string` | — | Titre du header |
| `children` | `ReactNode` | — | Corps |
| `footer` | `ReactNode` | — | Zone d'actions — **voir convention ci-dessous** |
| `size` | `'S'\|'M'\|'L'` | `'M'` | Taille |
| `hideHeader` | `boolean` | `false` | Masque le header par défaut |
| `className` | `string` | — | Classes additionnelles sur l'overlay |

### ⚠️ Convention footer — ordre des actions

Placer l'action **Primary en dernier** dans le JSX de `footer` (après Secondary/Tertiary). Sur desktop le footer est en ligne (l'ordre JSX = l'ordre visuel), mais sous 480px il passe en `column-reverse` : la dernière action du JSX remonte donc en haut, là où le Primary doit se trouver selon Figma (Mobile/App). Inverser l'ordre casse la hiérarchie visuelle mobile.

```tsx
footer={<>
  <Button variant="tertiary" label="Annuler" onClick={onClose} />
  <Button label="Confirmer" />  {/* Primary en dernier */}
</>}
```

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Surface/Overlay` | `--color-surface-overlay` | Scrim derrière le modal |
| `Surface/Primary` | `--color-surface-primary` | Fond du modal |
| `Elevation/600` | `--elevation-600` | Ombre portée |
| `Shape/Card` | `--shape-card` | Border-radius |
| `Border/Default` | `--color-border-default` | Séparateurs header/footer |
| `Font Family/Heading`, `Font Size/Heading/SM` | `--font-family-heading`, `--font-size-heading-sm` | Titre |
| `Content/Default` | `--color-content-default` | Titre, corps |
| `Content/Weak` | `--color-content-weak` | Bouton fermeture |
| `Spacing/16,20,24` | `--spacing-*` | Padding header/body/footer |

---

## Accessibilité

- **`role="dialog"` + `aria-modal="true"`** : signale correctement un contexte modal aux technologies d'assistance.
- **`aria-labelledby`** : pointe vers l'id du titre (`modal-title`) quand `title` est fourni — sinon absent (penser à fournir un `aria-label` alternatif via `className`/contenu si `hideHeader` est utilisé sans titre).
- **`Escape`** ferme le modal — attendu par convention clavier.
- **Focus trap** : non géré par le composant lui-même — vérifier que le focus initial et le piégeage du focus sont assurés par l'appelant si nécessaire.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Réserver aux interactions courtes et bloquantes (confirmation, login, formulaire court) | Utiliser pour un contenu long ou une liste à parcourir → `Drawer` |
| Placer l'action Primary en dernier dans le JSX du `footer` | Mettre le Primary en premier — casse le stacking mobile |
| Utiliser `hideHeader` uniquement avec un header custom dans `children` fournissant sa propre sémantique | Utiliser `hideHeader` sans alternative d'accessibilité (titre annoncé) |
| Fournir `title` pour bénéficier de `aria-labelledby` automatique | Ouvrir un modal sans aucun titre ni label accessible |

---

## Liens

- Figma : [DS.MD — Modal](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=334-715)
- Storybook : `DS.MD/Feedback/Modal`
