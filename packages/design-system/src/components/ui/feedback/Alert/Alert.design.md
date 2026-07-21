# Alert

## Description

Message **persistant**, intégré au layout (bandeau/callout inline) — reste visible tant qu'il n'est pas retiré (`onDismiss`) ou que le contexte ne change pas. Supporte un titre, un corps, une ou plusieurs actions.

**Ne pas utiliser** pour :
- Une confirmation éphémère après une action utilisateur (ex. "Ajouté au panier") → `Toast`
- Un état de chargement → `Loading`/`Skeleton`/`Shimmering`

---

## Variants

### variant

| Valeur | Usage |
|---|---|
| `success` | Confirmation d'un état positif durable |
| `danger` | Erreur bloquante nécessitant une action |
| `warning` | Avertissement à surveiller |
| `info` (défaut) | Information neutre |

Pas de variant `default`/neutre distinct — `info` en tient lieu.

---

## States

| State | Comportement | Notes |
|---|---|---|
| Avec `actions` | Un ou plusieurs boutons sous le corps du message | `variant: 'primary'` (fond plein sémantique) ou `'secondary'` (transparent, bordure neutre) |
| Avec `onDismiss` | Bouton "✕" en haut à droite | `aria-label="Dismiss"` |
| Sans `icon` | Pas d'icône affichée, le texte porte seul l'information | Toujours préférer une icône pour la reconnaissance visuelle rapide |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `variant` | `'success'\|'danger'\|'warning'\|'info'` | `'info'` | Couleur sémantique |
| `title` | `string` | — | Titre du message |
| `children` | `ReactNode` | — | Corps du message |
| `icon` | `ReactNode` | — | Icône, `aria-hidden` |
| `actions` | `{label, onClick, variant?: 'primary'\|'secondary'}[]` | — | Boutons de réponse |
| `onDismiss` | `() => void` | — | Affiche le bouton de fermeture |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Semantic/*/BG Light` | `--color-semantic-{success,danger,warning,info}-bg-light` | Fond du bandeau, par variant |
| `Semantic/*/BG` | `--color-semantic-{success,danger,warning,info}-bg` | Bordure du bandeau ET fond du bouton `actions` `primary`, par variant |
| `Semantic/*/Content` | `--color-semantic-{success,danger,warning,info}-content` | Couleur de l'icône, par variant |
| `Content/Default` | `--color-content-default` | Titre |
| `Content/Weak` | `--color-content-weak` | Corps, bouton `secondary`, bouton fermeture |
| `Border/Default` | `--color-border-default` | Bordure du bouton `actions` `secondary` |
| `Shape/Card` | `--shape-card` | Border-radius du bandeau |
| `Shape/Button` | `--shape-button` | Border-radius des boutons `actions` |
| `Spacing/4,8,12,16` | `--spacing-*` | Padding, gaps |
| `Font Family/Label`, `Font Size/Label/MD,SM` | — | Titre, boutons |
| `Font Size/Body/SM` | `--font-size-body-sm` | Corps du message |

---

## Accessibilité

- **`role="alert"`** : le message est annoncé **immédiatement et de façon interruptive** par les lecteurs d'écran, quoi que l'utilisateur soit en train de faire. Réserver ce composant aux messages qui justifient vraiment cette interruption — ne pas l'utiliser pour du contenu décoratif ou peu urgent.
- **Icône** : toujours `aria-hidden="true"` — l'information doit être portée par le texte.
- **Bouton de fermeture** : `aria-label="Dismiss"` (actuellement en anglais dans le code, à harmoniser en français si l'app est full-FR — signalé, pas corrigé ici).

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Utiliser pour un bandeau d'état persistant intégré au layout | Utiliser pour une confirmation éphémère post-action → `Toast` |
| Utiliser `actions` pour proposer plusieurs réponses (ex. "Réessayer" / "Annuler") | Empiler plus de 2 actions — au-delà, repenser le message |
| Réserver aux messages qui justifient une interruption lecteur d'écran (`role="alert"`) | Utiliser pour du texte informatif non urgent qui n'a pas besoin d'interrompre |
| Toujours accompagner d'un `icon` pour la reconnaissance visuelle rapide du variant | Se reposer uniquement sur la couleur de fond pour transmettre la sémantique |

---

## Liens

- Figma : [DS.MD — Alert](https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=332-801)
- Storybook : `DS.MD/Feedback/Alert`
