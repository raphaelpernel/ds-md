# Toast

## Description

Notification **éphémère et non bloquante** après une action utilisateur (ex. "Ajouté au panier", "Recette enregistrée"). Surface neutre — contrairement à `Alert`, le fond ne change **pas** de couleur selon le `variant` : seule l'icône porte la couleur sémantique.

**Ne pas utiliser** pour :
- Un message qui doit rester visible/persistant dans le layout → `Alert`
- Plusieurs actions de réponse → `Alert` (`Toast` n'a qu'une seule `action`)

---

## Variants

### variant

| Valeur | Usage |
|---|---|
| `default` (défaut) | Confirmation neutre |
| `success` | Action réussie |
| `danger` | Échec de l'action |
| `warning` | Avertissement lié à l'action |
| `info` | Information complémentaire |

> **Important** : le `variant` ne colore **que l'icône** (`.toast--{variant} .toast__icon`). Le fond reste toujours `Surface/Primary`, la bordure toujours `Border/Default`. Ne pas s'attendre au même comportement que `Alert`, dont tout le bandeau se teinte.

---

## States

| State | Comportement | Notes |
|---|---|---|
| Avec `action` | Un seul bouton texte sous le message | Pas de tableau d'actions comme `Alert` — une seule réponse possible |
| Avec `onDismiss` | Bouton "✕" | `aria-label="Dismiss"` |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | — | Message principal (obligatoire) |
| `description` | `string` | — | Contexte additionnel |
| `variant` | voir ci-dessus | `'default'` | Couleur de l'icône uniquement |
| `icon` | `ReactNode` | — | Icône, `aria-hidden` |
| `action` | `{label, onClick}` | — | Une seule action de réponse |
| `onDismiss` | `() => void` | — | Affiche le bouton de fermeture |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Surface/Primary` | `--color-surface-primary` | Fond — **constant, ne varie pas avec `variant`** |
| `Border/Default` | `--color-border-default` | Bordure — constante |
| `Elevation/400` | `--elevation-400` | Ombre portée |
| `Semantic/*/Content` | `--color-semantic-{success,danger,warning,info}-content` | Couleur de l'icône uniquement, par variant |
| `Content/Default` | `--color-content-default` | Titre, texte du toast |
| `Content/Weak` | `--color-content-weak` | Description, bouton fermeture |
| `Interactive/Content` | `--color-interactive-content` | Bouton `action` |
| `Shape/Card` | `--shape-card` | Border-radius |
| `Spacing/4,12,16` | `--spacing-*` | Padding, gaps |

---

## Accessibilité

- **`role="status"` + `aria-live="polite"`** : annoncé par les lecteurs d'écran **sans interrompre** ce que l'utilisateur est en train de faire — comportement volontairement différent d'`Alert` (`role="alert"`, interruptif). C'est le bon choix pour une confirmation qui n'exige pas d'action immédiate.
- **Icône** : toujours `aria-hidden="true"`.
- **Bouton de fermeture** : `aria-label="Dismiss"`.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Utiliser pour une confirmation éphémère après une action | Utiliser pour un état qui doit rester visible → `Alert` |
| Une seule `action` de réponse claire (ex. "Annuler", "Voir") | Essayer d'empiler plusieurs actions — pas supporté, utiliser `Alert` |
| Compter sur `role="status"`/`aria-live="polite"` pour ne pas interrompre l'utilisateur | Utiliser pour un message critique nécessitant une interruption → `Alert` (`role="alert"`) |
| Se souvenir que seule l'icône se teinte selon `variant` | Styliser un toast en supposant que le fond change de couleur comme `Alert` |

---

## Liens

- Figma : [DS.MD — Toast](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=332-702)
- Storybook : `DS.MD/Feedback/Toast`
