# DS.MD — Règles de travail pour la création de composants

> Ce fichier définit le comportement attendu de tout agent (Claude ou autre) travaillant sur le design system DS.MD, du composant Figma jusqu'au code Storybook.

---

## 0. Principes fondamentaux

- **Jamais de valeur en dur.** Aucune couleur hex, aucune valeur de spacing, aucun radius, aucune font-size codée en dur — ni dans Figma ni dans le code. Toute valeur doit être liée à une variable ou un token.
- **Toujours demander en cas de doute.** Si une correspondance de variable n'est pas certaine à 100 %, l'agent pose la question avant d'agir.
- **Lire avant d'écrire.** Avant toute création ou modification, lire les variables existantes, leurs descriptions, et les composants déjà construits pour assurer la cohérence.
- **Une page par composant dans Figma.** Chaque nouveau composant vit dans sa propre page dédiée.
- **In-place uniquement.** Ne jamais recréer un nœud pour le modifier — éditer en place par ID.

---

## 1. Avant de commencer un composant

### 1.1 Lire les variables disponibles

Avant toute création, charger et inspecter :

```
figma.variables.getLocalVariablesAsync()
figma.variables.getLocalVariableCollectionsAsync()
```

Collections à connaître :
| Collection | Usage |
|---|---|
| **Semantics** (`VariableCollectionId:3:3`) | Couleurs, Shape, Spacing — à utiliser sur tous les composants |
| **Typography** (`VariableCollectionId:3:4`) | Font size, line height, font family |
| **Primitives** | Source des alias Semantics — **ne jamais binder directement** |

**Règle stricte :** Ne jamais binder une variable de la collection Primitives sur un composant. Toujours passer par les alias Semantics.

### 1.2 Lire les descriptions des variables

Chaque variable a une description qui précise son usage. Les lire avant de décider laquelle utiliser. En cas d'ambiguïté entre deux variables proches (ex: `Content/Default` vs `Content/Weak`), poser la question.

### 1.3 Lire les composants existants

Avant de créer un nouveau composant, inspecter les composants déjà construits (Button, Input Field, etc.) pour :
- Identifier les patterns de structure (auto-layout, nommage des couches)
- Réutiliser les mêmes conventions de padding, gap, radius
- Éviter les doublons de variables

### 1.4 Questions à poser avant de commencer

Si l'une des informations suivantes manque, la demander **avant** de créer quoi que ce soit :

- Quels sont les **variants** attendus (axes de variation : Type, State, Size…) ?
- Quels **states** sont nécessaires (Default, Hover, Disabled, Loading, Error, Focus…) ?
- Y a-t-il des **icônes** à intégrer ? Depuis quelle bibliothèque ?
- Le composant est-il **standalone** ou composé d'autres composants DS existants ?
- Y a-t-il des **edge cases** connus (label vide, contenu tronqué, overflow…) ?
- Quelle est la **taille par défaut** si plusieurs sizes sont prévues ?

---

## 2. Création du composant dans Figma

### 2.1 Page dédiée

```
Toujours créer une page nommée exactement comme le composant (ex: "Button", "Input Field", "Tag")
avant de créer le composant.
```

Ne jamais créer un composant sur la page `_Sandbox`, `Foundations`, ou une page existante d'un autre composant.

### 2.2 Structure du composant

- **Auto-layout obligatoire** sur tous les frames, y compris les enfants.
- **FILL/HUG** réglés après `appendChild` (jamais avant).
- **Nommage des couches** : clair, en anglais, cohérent avec les autres composants (ex: `Label`, `Left`, `Right`, `Field`, `Helper text`, `Content`).
- **Pas de frame vide** : tout nœud doit avoir un rôle identifiable.

### 2.3 Bindings variables — règles strictes

| Propriété | Variable à utiliser |
|---|---|
| Fills couleurs | Variables Semantics COLOR |
| Strokes | Variables Semantics COLOR (Border/\*) |
| Corner radius | `Shape/Button`, `Shape/Input`, `Shape/Card`… |
| Padding top/bottom | `Spacing/8`, `Spacing/12`… |
| Padding left/right | `Spacing/8`, `Spacing/16`… |
| Item spacing (gap) | `Spacing/4`, `Spacing/8`… |
| Font size | Variables Typography `Font Size/…` |
| Line height | Variables Typography `Line Height/…` |
| Font family | Variables Typography `Font Family/Body` |

**Méthode de binding :**
```js
// Fills
node.fills = [figma.variables.setBoundVariableForPaint(
  { type: 'SOLID', color: fallbackColor }, 'color', variable
)];

// Scalar (padding, radius, gap)
node.setBoundVariable('paddingLeft', variable);
node.setBoundVariable('topLeftRadius', variable);
```

### 2.4 Text styles

Appliquer les text styles du DS via `textStyleId` plutôt que de setter font/size manuellement. Ne pas oublier de charger la font avant toute modification de texte.

Si Satoshi n'est pas chargeable dans l'environnement plugin, **ne pas modifier les text nodes des instances de composants maîtres** — les éditer manuellement dans Figma.

### 2.5 Variants et component properties

- **Variants** : axes de variation structurels (Type, State, Size) → `combineAsVariants`
- **Component properties** : Label (TEXT), icônes (BOOLEAN + INSTANCE_SWAP) → `addComponentProperty` + `componentPropertyReferences`
- **Preferred values** sur les INSTANCE_SWAP : toujours scoper à la bibliothèque Mealz Icons Set
- **Grille** : colonnes = State, lignes = Type × Size, gaps : 24px entre colonnes, 12px entre tailles, 32px entre groupes de types

### 2.6 Description du component set

Toujours écrire une description sur le `ComponentSet` qui couvre :
- Ce que fait le composant et quand l'utiliser
- Chaque variant (Type, State, Size) avec ses règles d'usage
- Les component properties et leur comportement
- Les règles d'usage (anti-patterns inclus)

Format cible : lisible par un agent sans contexte visuel.

### 2.7 Vérification avant de passer au code

Avant de fermer le travail Figma :

- [ ] Aucun nœud avec une couleur hex hardcodée
- [ ] Aucun padding/spacing hardcodé
- [ ] Tous les fills/strokes liés à des variables Semantics
- [ ] Tous les corner radius liés à `Shape/*`
- [ ] Text styles appliqués sur tous les nœuds TEXT
- [ ] Component properties wirées sur tous les variants
- [ ] Description du ComponentSet rédigée
- [ ] Page nommée correctement

---

## 3. Création du composant en code

### 3.1 Stack cible

```
Next.js + Tailwind v4 + shadcn/ui
Style Dictionary (JSON tokens → CSS custom properties)
Theming via attribut data-brand
Déploiement Vercel
```

### 3.2 Tokens avant le code

Avant d'écrire le composant, vérifier que les tokens CSS correspondants existent dans le pipeline Style Dictionary :

```
tokens/
  light.json
  dark.json
→ dist/
  variables.css   (--color-surface-primary, --spacing-8, --shape-input…)
```

**Jamais de valeur en dur dans le CSS ou le JSX.** Toujours utiliser une variable CSS ou une classe Tailwind mappée sur un token.

```tsx
// ❌ Interdit
<div style={{ backgroundColor: '#3B82F6', borderRadius: '8px' }}>

// ✅ Correct
<div className="bg-interactive-bg rounded-[var(--shape-input)]">
```

### 3.3 Nomenclature des tokens CSS

Suivre la même hiérarchie que les variables Figma :

| Variable Figma | Token CSS |
|---|---|
| `Surface/Primary` | `--color-surface-primary` |
| `Interactive/BG` | `--color-interactive-bg` |
| `Border/Default` | `--color-border-default` |
| `Shape/Input` | `--shape-input` |
| `Spacing/8` | `--spacing-8` |
| `Font Size/Body/MD` | `--font-size-body-md` |

### 3.4 Structure du fichier composant

```tsx
// components/ui/Button/Button.tsx

import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  // base classes — utiliser uniquement des tokens CSS
  'inline-flex items-center justify-center font-medium transition-colors',
  {
    variants: {
      type: {
        primary:   'bg-[var(--color-interactive-bg)] text-[var(--color-interactive-content)]',
        secondary: 'bg-transparent border border-[var(--color-interactive-border)] text-[var(--color-interactive-content)]',
        tertiary:  'bg-transparent text-[var(--color-interactive-content)]',
        danger:    'bg-[var(--color-semantic-danger-bg)] text-[var(--color-semantic-danger-content)]',
      },
      size: {
        L: 'px-[var(--spacing-20)] py-[var(--spacing-12)] text-[var(--font-size-label-lg)]',
        M: 'px-[var(--spacing-16)] py-[var(--spacing-8)]  text-[var(--font-size-label-md)]',
        S: 'px-[var(--spacing-12)] py-[var(--spacing-4)]  text-[var(--font-size-label-md)]',
      },
    },
    defaultVariants: { type: 'primary', size: 'L' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  lIcon?: React.ReactNode
  rIcon?: React.ReactNode
  loading?: boolean
  label?: string
}
```

### 3.5 Mapping Figma → code

Pour chaque component property Figma, documenter la prop code équivalente :

| Figma property | Type Figma | Prop code | Type TS |
|---|---|---|---|
| `Type` | VARIANT | `type` | `'primary' \| 'secondary' \| 'tertiary' \| 'danger'` |
| `State` | VARIANT | `disabled` / `loading` | `boolean` |
| `Size` | VARIANT | `size` | `'L' \| 'M' \| 'S'` |
| `Label` | TEXT | `children` ou `label` | `string` |
| `L Icon` | BOOLEAN | `showLIcon` | `boolean` |
| `Swap L Icon` | INSTANCE_SWAP | `lIcon` | `React.ReactNode` |
| `R Icon` | BOOLEAN | `showRIcon` | `boolean` |
| `Swap R Icon` | INSTANCE_SWAP | `rIcon` | `React.ReactNode` |

---

## 4. Création du design.md

Pour chaque composant, créer un fichier `components/ui/[ComponentName]/[ComponentName].design.md` qui contient :

### Structure obligatoire

```markdown
# [ComponentName]

## Description
[Ce que fait le composant, quand l'utiliser, ce qu'il ne fait pas]

## Variants

### Type
| Valeur | Usage | Règle |
|---|---|---|
| primary | CTA principal | 1 seul par section |
| ... | ... | ... |

### State
| Valeur | Comportement | Notes |
|---|---|---|
| default | Repos | — |
| hover | Survol | Ne pas simuler en JS |
| disabled | Non interactif | Uniquement si l'action deviendra disponible |
| loading | En cours | Garder le label visible |

### Size
| Valeur | Contexte | Padding | Font |
|---|---|---|---|
| L | Usage général | 12/20 | Label/LG (16px) |
| M | UI compacte | 8/16 | Label/MD (14px) |
| S | Dense, tableaux | 4/12 | Label/MD (14px) |

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| type | string | 'primary' | Variant visuel |
| ... | ... | ... | ... |

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| Interactive/BG | --color-interactive-bg | Fill primary |
| ... | ... | ... |

## Accessibilité
- **Rôle ARIA** : `button`
- **Clavier** : Tab pour focus, Enter/Space pour activer
- **Disabled** : `aria-disabled="true"`, pas `disabled` natif si loading
- **Loading** : `aria-busy="true"`, label inchangé pour les screen readers

## Do / Don't
| ✅ Do | ❌ Don't |
|---|---|
| 1 seul Primary par vue | Empiler 2 Primary côte à côte |
| Danger uniquement pour actions destructives | Utiliser Danger pour alertes visuelles |
| Désactiver si l'action sera disponible | Cacher un bouton avec Disabled |

## Liens
- Figma : [lien node-id]
- Storybook : [lien story]
```

---

## 5. Migration Storybook

### 5.1 Structure des stories

```tsx
// components/ui/Button/Button.stories.tsx

import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'DS.MD/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'danger'],
      description: 'Variant visuel — voir design.md pour les règles d\'usage',
    },
    size: {
      control: 'radio',
      options: ['L', 'M', 'S'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Button>

// Story par state par type
export const PrimaryDefault: Story = {
  args: { type: 'primary', size: 'L', label: 'Button' },
}
export const PrimaryDisabled: Story = {
  args: { type: 'primary', size: 'L', label: 'Button', disabled: true },
}
export const PrimaryLoading: Story = {
  args: { type: 'primary', size: 'L', label: 'Button', loading: true },
}
// ... répéter pour Secondary, Tertiary, Danger

// Story de référence complète (toutes les combinaisons)
export const AllVariants: Story = {
  render: () => (
    // grid montrant toutes les combinaisons Type × State × Size
  ),
}
```

### 5.2 Checklist de migration

Avant de considérer un composant comme "migré" dans Storybook :

- [ ] Toutes les stories couvrent tous les variants × states (au minimum Default + Disabled + Loading)
- [ ] `autodocs` activé avec description issue du `design.md`
- [ ] Aucune valeur hardcodée dans les stories
- [ ] Les tokens CSS sont injectés dans `.storybook/preview.ts`
- [ ] Thème light/dark fonctionnel via `data-brand`
- [ ] Tests d'accessibilité activés (`@storybook/addon-a11y`)
- [ ] Lien Figma ajouté dans les paramètres de la story (`parameters.design`)

### 5.3 Lien Figma ↔ Storybook

```tsx
export const PrimaryDefault: Story = {
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=XXX',
    },
  },
}
```

---

## 6. Workflow complet résumé

```
1. BRIEF
   └─ Poser les questions manquantes (variants, states, icônes, edge cases)

2. FIGMA
   ├─ Créer la page dédiée
   ├─ Lire les variables + descriptions
   ├─ Construire les variants (auto-layout, variable bindings, no hardcode)
   ├─ Ajouter les component properties
   ├─ Écrire la description du ComponentSet
   └─ Vérifier la checklist §2.7

3. TOKENS
   ├─ Vérifier que les tokens CSS existent dans Style Dictionary
   └─ Ajouter les tokens manquants dans light.json / dark.json

4. CODE
   ├─ Créer le composant React avec CVA
   ├─ Mapper chaque prop sur un token CSS
   └─ Documenter le mapping Figma → code

5. DESIGN.MD
   └─ Créer [ComponentName].design.md avec structure §4

6. STORYBOOK
   ├─ Créer les stories (toutes combinaisons)
   ├─ Activer autodocs + a11y
   ├─ Lier les stories au node Figma
   └─ Vérifier la checklist §5.2
```

---

## 7. Règles de communication de l'agent

- **Toujours confirmer** la liste des variants et states avant de commencer à coder dans Figma.
- **Toujours lister** les variables qu'on va utiliser et leur mapping avant d'appliquer.
- **Signaler explicitement** si une variable attendue n'existe pas dans le DS et proposer l'alternative la plus proche.
- **Ne jamais supposer** qu'un token existe — le vérifier par `getLocalVariablesAsync()`.
- **Une question à la fois** si plusieurs clarifications sont nécessaires.
- **Toujours vérifier inline** (dans le même script) après un rebinding — ne pas se fier à une relecture dans un appel séparé.
