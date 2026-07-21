# Link

## Description

Lien texte inline ou de navigation, toujours souligné, sans effet de soumission.

**Ne pas utiliser** pour :
- Une action qui déclenche un submit, une ouverture de modal, ou tout effet de bord → `Button` (variante `tertiary` pour un rendu visuellement proche)

---

## Variants

### size

| Valeur | Usage |
|---|---|
| `LG` | Contexte éditorial, corps de texte large |
| `MD` (défaut) | Usage général |
| `SM` | UI compacte, mentions secondaires |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `size` | `'LG'\|'MD'\|'SM'` | `'MD'` | Taille |
| `lIcon` / `rIcon` | `ReactNode` | — | Icône gauche/droite |
| ...props natives | `AnchorHTMLAttributes<HTMLAnchorElement>` | — | `href`, `target`, `rel`, etc. |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Interactive/Content` | `--color-interactive-content` | Texte |
| `Interactive/BG Hover` | `--color-interactive-bg-hover` | Couleur au survol |
| `Font Size/Body/LG,MD,SM` | `--font-size-body-*` | Typographie par taille |
| `Spacing/4` | `--spacing-4` | Gap icône/texte |

---

## Accessibilité

- Rendu en `<a>` natif — sémantique de lien native, focus clavier et activation gratuits.
- Toujours souligné (`text-decoration: underline`) — ne pas retirer visuellement le soulignement par un `className` custom, c'est le signal visuel qui distingue un lien d'un texte statique coloré.
- Penser à ajouter `rel="noopener noreferrer"` pour tout `target="_blank"`.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Utiliser pour toute navigation ou lien inline sans effet de bord | Utiliser pour une action avec effet (submit, ouverture modal) → `Button` |
| Garder le soulignement natif | Retirer le soulignement pour un rendu "plus propre" — casse la reconnaissance de lien |
| Ajouter `rel="noopener noreferrer"` avec `target="_blank"` | Ouvrir un lien externe sans ces attributs |

---

## Liens

- Figma : [DS.MD — Link](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=325-619)
- Storybook : `DS.MD/Navigation/Link`
