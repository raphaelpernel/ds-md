# Heading

## Description

Titre de section — 4 tailles visuelles, chacune associée à une balise HTML par défaut (`h1`/`h2`/`h3`), surchargeable via `as` quand la hiérarchie sémantique de la page diffère de la taille visuelle voulue.

**Ne pas utiliser** pour :
- Un titre de composant interne déjà géré par un autre composant (ex. `Modal`/`Drawer` posent leur propre `<h2>` de titre) — ne pas dupliquer avec `Heading` à l'intérieur

---

## Variants

### size

| Valeur | Balise par défaut | Usage |
|---|---|---|
| `xl` | `h1` | Titre principal de page, le plus grand |
| `lg` (défaut) | `h1` | Titre principal de page, standard |
| `md` | `h2` | Titre de sous-section |
| `sm` | `h3` | Titre de sous-sous-section |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `size` | `'xl'\|'lg'\|'md'\|'sm'` | `'lg'` | Taille visuelle — détermine aussi la balise HTML par défaut |
| `as` | `ElementType` | voir tableau ci-dessus | Surcharge la balise rendue sans changer le style visuel |
| `children` | `ReactNode` | — | Contenu du titre |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Font Family/Heading` | `--font-family-heading` | Police |
| `Font Weight/Heading` | `--font-weight-heading` | Graisse |
| `Font Size/Heading/XL,LG,MD,SM` | `--font-size-heading-*` | Taille par variant |
| `Line Height/Heading/XL,LG,MD,SM` | `--line-height-heading-*` | Hauteur de ligne par variant |
| `Content/Default` | `--color-content-default` | Couleur du texte |

---

## Accessibilité

- **Un seul `h1` par page** — si plusieurs `Heading size="xl"`/`"lg"` sont nécessaires visuellement sur une même page, surcharger `as` sur tous sauf le titre principal réel (ex. `as="h2"`) pour garder une hiérarchie de titres valide, indépendamment de la taille visuelle voulue.
- La correspondance taille → balise n'est qu'un **défaut** : la hiérarchie sémantique (`h1` > `h2` > `h3`) doit rester correcte même si la taille visuelle ne suit pas cet ordre (ex. un `h2` peut être visuellement plus grand qu'un `h1` voisin si le design le demande — utiliser `size="xl" as="h2"`).

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Garder un seul `h1` réel par page, quitte à surcharger `as` sur les autres titres de même taille visuelle | Laisser plusieurs `Heading size="xl"/"lg"` générer chacun un `h1` sur la même page |
| Découpler taille visuelle et niveau sémantique via `as` quand le design l'exige | Changer la taille visuelle (`size`) pour "corriger" un niveau sémantique — utiliser `as` à la place |
| Utiliser pour tout titre de section de contenu | Dupliquer un titre déjà géré par `Modal`/`Drawer` (qui posent leur propre `h2`) |

---

## Liens

- Storybook : `DS.MD/Typography/Heading`
