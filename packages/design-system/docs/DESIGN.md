# DS.MD — Guide de design system (pour agents)

> Point d'entrée à lire avant toute utilisation ou extension du design system — en application
> de la règle de cadrage du `CLAUDE.md` racine (« vérifier `docs/` avant de construire »).
> Ce fichier ne duplique pas les données — il indexe et arbitre entre les documents existants.

---

## 1. Où trouver quoi

| Besoin | Fichier |
|---|---|
| Valeurs exactes des tokens (couleur, typo, spacing, shape, élévation), registre des composants | [`.claude/design-system-tokens.md`](../../../.claude/design-system-tokens.md) |
| Workflow complet de création d'un composant (Figma → tokens → code → design.md → Storybook), règles de comportement de l'agent | [`.claude/ds-md-rules.md`](../../../.claude/ds-md-rules.md) |
| Usage détaillé d'un composant précis (variants, states, tokens utilisés, accessibilité, Do/Don't) | `<Component>.design.md` à côté du composant — voir §4 |
| **Quel composant utiliser pour quel besoin** (ce que ce fichier documente en propre) | §3 ci-dessous |

**Règle de lecture** :
- Tu construis une page/feature avec des composants existants → lis `.claude/design-system-tokens.md` (valeurs + registre) et §3 ci-dessous (choix du bon composant).
- Tu crées un nouveau composant DS → lis `.claude/ds-md-rules.md` en entier, suis le workflow, termine par un `<Component>.design.md`.
- Tu hésites entre deux composants proches → §3. Si toujours ambigu après lecture, **pose la question plutôt que de deviner** (cf. `ds-md-rules.md` §7).

---

## 2. Architecture en un paragraphe

Les tokens se résolvent en cascade CSS (voir `src/styles/index.css`) : `tokens/base.css` (spacing/shape/élévation/font-family — agnostique mode et brand) → `dist/color-{light,dark}.generated.css` (généré par Style Dictionary depuis Figma, agnostique brand) → `tokens/brands/{neutral,marmiton,coursesu}.css` (primitives de marque, activées via `[data-brand]`) → `tokens/color-{light,dark}.css` (exceptions d'indirection brand qui ne peuvent pas être générées) → `tokens/partners/carrefour.css` (overrides via `[data-partner]`) → alias sémantiques (`Surface/*`, `Content/*`, `Border/*`, `Interactive/*`, `Semantic/*`, `Category/*`) consommés par les composants → mapping Tailwind v4 (`@theme inline`) pour les classes utilitaires (`bg-surface-*`, `text-content-*`…).

**Ne jamais** binder une Primitive ou une couleur de marque directement sur un composant — toujours passer par l'alias Semantics. Détails et valeurs résolues : `.claude/design-system-tokens.md` §0–§2.

---

## 3. Quel composant pour quel besoin

### Choix exclusif entre options

| Besoin | Composant | Ne pas utiliser pour | Voir aussi |
|---|---|---|---|
| 2 à 4 options courtes, effet immédiat et visible sur le contenu adjacent | `SegmentedControl` | >4 options, labels longs, navigation de page | `Tab`, `Select` |
| Navigation entre vues/sections d'une même page | `Tab` | Choix binaire simple avec effet immédiat | `SegmentedControl` |
| Beaucoup d'options (>4-5), champ de formulaire | `Select` | Choix binaire, peu d'options visibles | `SegmentedControl`, `Radio` |
| Choix exclusif parmi options toutes visibles dans un formulaire | `Radio` | Plus de 4-5 options → `Select` | `Select` |
| Filtres actifs/inactifs, sélection multiple de tags | `ChipTag` (prop `type`) | Choix exclusif | `SegmentedControl` |
| Sélection d'une date dans un planning/calendrier horizontal | `DateTabs` | — | — |

### Actions (cliquable)

| Besoin | Composant | Ne pas utiliser pour | Voir aussi |
|---|---|---|---|
| CTA principal, secondaire, tertiaire, danger | `Button` | — | — |
| Lien texte inline ou de navigation, sans effet de soumission | `Link` | Action qui déclenche un submit/modal → `Button` | `Button` |
| Icône seule sans label visible (close, menu burger) | `Button` avec `iconOnly` | — | — |
| Action flottante hors du flux normal | `FAB` | **Par défaut, préférer `Button`** en nav ou en bas de flux — le FAB n'a aujourd'hui aucun usage produit et l'assistant a explicitement remplacé son FAB flottant par un lien de nav (décision du 2026-07-21, voir `assistant-shopping/docs/docs/UIUX-DECISIONS.MD`). Ne l'introduire qu'en cas de besoin explicitement validé, pas par défaut. | `Button` |

### Feedback & overlays

| Besoin | Composant | Ne pas utiliser pour | Voir aussi |
|---|---|---|---|
| Interaction courte et bloquante centrée (confirmation, login, formulaire court) | `Modal` | Contenu long, navigation, liste à parcourir → `Drawer` | `Drawer` |
| Panel latéral pour formulaire long, liste, contenu à parcourir | `Drawer` | Confirmation courte et bloquante → `Modal` | `Modal` |
| Message éphémère non bloquant après une action utilisateur (ex. « Ajouté au panier ») | `Toast` | Message permanent intégré au layout → `Alert` | `Alert` |
| Message persistant intégré au layout (bandeau d'info/erreur/avertissement inline) | `Alert` | Message éphémère post-action → `Toast` | `Toast` |
| Aide contextuelle très courte au survol | `Tooltip` | Contenu actionnable ou long → `Menu` | `Menu` |
| Menu d'actions contextuelles (edit/duplicate/share/delete) | `Menu` | Choix de vue → `Tab`/`SegmentedControl` ; valeur de formulaire → `Select` | `Select`, `Tab` |

### États de chargement

Distinction par **forme vs mouvement** — les trois ne sont pas interchangeables :

| Besoin | Composant | Ne pas utiliser pour |
|---|---|---|
| Placeholder statique qui épouse la forme du contenu final (liste, card, avatar) pendant le chargement | `Skeleton` (`variant`: rect\|text\|circle) | Attente courte/globale sans layout à préfigurer → `Loading` |
| Variante avec animation de balayage lumineux, pour signaler explicitement « en cours » sur un bloc large (hero, image produit) | `Shimmering` | Petits éléments de liste répétés → `Skeleton` suffit |
| Spinner pour attente courte ou globale (submit, transition de page) | `Loading` | Remplacer un layout de contenu → `Skeleton`/`Shimmering` |

**Cas particulier** : le composant `Button` a son propre état `loading` intégré (spinner + `aria-busy`). Ne jamais imbriquer le composant `Loading` autonome à l'intérieur d'un `Button` — utiliser la prop `loading` du bouton.

### Petites étiquettes

| Besoin | Composant | Ne pas utiliser pour |
|---|---|---|
| Compteur numérique ou indicateur de statut (point coloré) | `Badge` | Étiquette produit (promo/new/healthy/express/low-cost) → `ChipTag` (prop `category`) |
| Tag produit, filtre, catégorie merchandising | `ChipTag` | Compteur numérique → `Badge` |

### Sélection binaire / multiple

| Besoin | Composant | Ne pas utiliser pour |
|---|---|---|
| Bascule d'un réglage avec effet **instantané**, pas de validation | `Toggle` | Sélection à valider dans un formulaire → `Checkbox` |
| Sélection indépendante, multiple, à valider (formulaire) | `Checkbox` | Réglage à effet instantané → `Toggle` |
| Choix exclusif parmi options visibles simultanément | `Radio` | Plus de 4-5 options → `Select` |

---

## 4. Documentation par composant (`<Component>.design.md`)

Chaque composant a son `<Component>.design.md` à côté de son code (template complet dans `.claude/ds-md-rules.md` §4 : description, variants, states, props, tokens utilisés, accessibilité, Do/Don't, liens Figma/Storybook).

**Couverture : 29/29** — tous les composants du package `design-system` ayant un `.stories.tsx` (les seuls dans le périmètre de cette convention ; `ProductCard`/`PromoSection` vivent dans `marmiton-prototype`, hors du package design-system).

À chaque nouveau composant ajouté au package :
1. Créer son `.design.md` dans la même PR (template `.claude/ds-md-rules.md` §4).
2. **Ajouter une ligne dans la table de décision §3 ci-dessus** — un `.design.md` isolé ne suffit pas si le composant n'apparaît pas dans "quel composant pour quel besoin", l'agent ne le trouvera jamais en comparant ses options.
3. Lancer `npm run verify-design-docs` (échoue si un composant Storybook n'a pas de `.design.md` — ne couvre pas l'étape 2, qui reste manuelle).

Ne jamais laisser la couverture redescendre sous 100%.

Plusieurs `.design.md` documentent des **gaps d'implémentation découverts en rédigeant** (à corriger un jour, pas seulement à documenter) :
- `Checkbox` : `indeterminate` n'est pas exposé aux lecteurs d'écran (`aria-checked="mixed"` absent, propriété DOM native non posée).
- `InputTextarea` et `Select` : pas de `aria-describedby` liant le helper/error text au champ (contrairement à `InputField`, qui le fait).
- `Pagination` : `aria-label` Précédent/Suivant en anglais ("Previous"/"Next") alors que l'app est en français ; même remarque pour `Alert`/`Loading`/`Toast` (`"Dismiss"`, `"Loading…"`).

---

## 5. Règles système (Do/Don't)

### Do
- Toujours utiliser une variable sémantique (`--color-interactive-bg`), jamais une primitive (`--color-brand-500`) ni un hex en dur.
- Toujours lire ce fichier + le `.design.md` du composant (s'il existe) avant de l'utiliser ou de l'étendre.
- En cas d'ambiguïté entre deux variables ou deux composants proches, vérifier §3 ci-dessus puis, si toujours incertain, poser la question.
- Mettre à jour `.claude/design-system-tokens.md` après toute modification de token ou de composant (cf. `ds-md-rules.md` §7).

### Don't
- Ne jamais coder une valeur hex/px en dur dans un composant, en dehors de `tokens/*.css` et `tokens/brands/*.css`.
- Ne jamais binder une Primitive directement — toujours passer par l'alias Semantics.
- Ne jamais modifier `brands.ts` ou `tokens/brands/*.css` en dehors de l'ajout d'un nouveau brand, sauf dérogation explicitement actée par l'utilisateur (voir précédent documenté dans `assistant-shopping/docs/docs/UIUX-DECISIONS.MD`).
- Ne jamais introduire un nouveau composant quand un existant couvre le besoin — vérifier §3 d'abord.
