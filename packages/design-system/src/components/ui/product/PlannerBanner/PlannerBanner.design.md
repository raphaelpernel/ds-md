# PlannerBanner

## Description

Bannière de mise en avant du **Mealz Planner** (feature de composition de menu multi-recettes) : badge "Nouveau", accroche, sous-titre, avatars de recettes suggérées et CTA d'entrée dans le flow, avec un sélecteur de nombre de personnes intégré. Composant de la catégorie **Product** (comme `RecipeCard`, `CatalogNavigation`) — modélise une feature produit précise plutôt qu'une primitive UI générique.

Extrait de la page d'entrée de `form-mealz-planner` (markup `entry-banner*` d'origine) pour devenir un composant partagé, réutilisé à l'identique dans :
- `form-mealz-planner` (page d'entrée du wizard, mode **contrôlé** via son `WizardContext`, CTA fonctionnel vers `/people`)
- `supermarket` (catalogue de recettes, cross-sell de la feature planner, mode **contrôlé** via son propre `WizardContext` local, CTA fonctionnel vers `/planner/people` — le wizard complet a été porté dans `supermarket` pour y être testé comme "quick feature")

Pas de node Figma source dédié — composant extrait directement de l'app existante (feature déjà en production), pas d'un design Figma en amont.

**Ne pas utiliser** pour :
- Une carte recette individuelle → `RecipeCard`
- Un message permanent d'info/erreur intégré au layout → `Alert`
- Une bannière promo générique sans lien avec le Planner → à concevoir séparément, ne pas détourner `PlannerBanner`

---

## Variants

Pas de prop `variant` — un seul rendu visuel, mais deux modes de fonctionnement selon le contexte consommateur (voir Props) :

| Mode | Déclencheur | Comportement |
|---|---|---|
| Contrôlé | `peopleCount` fourni | Le composant reflète et ne modifie jamais son état interne ; `onPeopleChange` est la seule source de vérité (ex. `WizardContext`) |
| Non-contrôlé | `peopleCount` omis | État interne (`useState(defaultPeopleCount)`), `onPeopleChange` reste appelé en plus si fourni |

---

## States

| State | Comportement | Notes |
|---|---|---|
| CTA sans `onCtaClick` | Le bouton `Button` est rendu mais n'a aucun effet au clic | Capacité conservée pour d'éventuels usages purement décoratifs, mais aucun consommateur actuel ne l'utilise |
| CTA avec `onCtaClick` | Déclenche la navigation fournie par le consommateur | Cas `form-mealz-planner` (`router.push('/people')`) et `supermarket` (`router.push('/planner/people')`) — les deux apps exposent désormais le wizard complet |
| Stepper aux bornes (`min`/`max`) | Bouton +/- désactivé (comportement natif `Stepper`) | Voir `Stepper.design.md` |

---

## Props

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `badgeLabel` | `string` | `'NOUVEAU'` | Libellé du badge d'accroche |
| `title` | `ReactNode` | Copy planner par défaut | Titre de la bannière (remplace intégralement le défaut si fourni) |
| `subtitle` | `ReactNode` | Copy planner par défaut | Sous-titre |
| `thumbnails` | `string[]` | 6 URLs TheMealDB | Photos rondes affichées en pile (avatars de recettes suggérées) |
| `ctaLabel` | `string` | `"C'est parti !"` | Libellé du CTA |
| `onCtaClick` | `() => void` | — | Handler du CTA ; absent → bouton décoratif |
| `peopleCount` | `number` | — | Valeur contrôlée du nombre de personnes (fournie ⇒ mode contrôlé) |
| `onPeopleChange` | `(value: number) => void` | — | Callback à chaque changement, mode contrôlé ou non |
| `defaultPeopleCount` | `number` | `2` | Valeur initiale en mode non-contrôlé |
| `peopleMin` | `number` | `1` | Borne basse du `Stepper` |
| `peopleMax` | `number` | `12` | Borne haute du `Stepper` |
| `backgroundImageMobile` | `string` | `/img/planner-banner-bg-mobile.png` | Fond mobile — chemin résolu depuis `public/` de l'app consommatrice (comme les fonts Satoshi), pas depuis `design-system` |
| `backgroundImageDesktop` | `string` | `/img/planner-banner-bg-desktop.png` | Fond desktop (≥768px) |
| `className` | `string` | — | Classe additionnelle sur le conteneur racine |

---

## Tokens utilisés

| Token Figma | Variable CSS | Usage |
|---|---|---|
| `Shape/Card` | `--shape-card` | Border-radius du conteneur bannière |
| `Shape/Sheet` | `--shape-sheet` | Border-radius de la carte interne (`planner-banner__card`) |
| `Elevation/400` | `--elevation-400` | Ombre de la carte interne |
| `Surface/Page` | `--color-surface-page` | Fond de la carte, bordure des avatars |
| `Surface/Secondary` | `--color-surface-secondary` | Fond de repli des avatars (avant chargement image) |
| `Content/Default` | `--color-content-default` | Titre, sous-titre |
| `Interactive/Content` | `--color-interactive-content` | Accent du titre ("cette semaine ?") |
| `Family/Heading`, `Family/Body` | `--font-family-*` | Titre / sous-titre |
| `Font Size/Heading/MD,LG`, `Font Size/Body/SM` | `--font-size-*`, `--line-height-*` | Titre (responsive md→lg), sous-titre |
| `Spacing/8,12,16,20,24,32` | `--spacing-*` | Paddings, gaps |

---

## Accessibilité

- **Avatars de recettes** : conteneur `aria-hidden="true"` — purement décoratif, n'apporte pas d'information supplémentaire au titre/sous-titre déjà explicites.
- **`Stepper`** : `role="group"` + `aria-label="Nombre de personnes"`, hérité tel quel du composant `Stepper` (voir `Stepper.design.md`).
- **CTA** : reste un `<button>` (via `Button`) même quand il navigue (`onCtaClick` déclenche un `router.push`) — écart connu au principe `<a>` vs `<button>` du système (cf. `DESIGN.md` §3), hérité du markup d'origine `form-mealz-planner`, pas corrigé dans cette extraction pour rester fidèle au comportement existant.
- **Titre** : rendu via `Heading` (`as="h2"`) — jamais `h1`, pour ne pas entrer en conflit avec le titre de page hôte (hero catalogue, etc.).

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Fournir `peopleCount`/`onPeopleChange` si un état de nombre de personnes existe déjà dans la page hôte (ex. wizard) | Laisser le composant en mode non-contrôlé si un état parent doit rester la source de vérité — risque de désynchronisation |
| Fournir `onCtaClick` dès que le contexte hôte a une destination réelle pour le wizard (c'est le cas de tous les consommateurs actuels) | Simuler un `onCtaClick` qui ne fait rien de fonctionnel dans un contexte où une vraie navigation est attendue |
| Garder les visuels `thumbnails` cohérents avec des photos de recettes (pas des icônes génériques) | Réutiliser ce composant pour une bannière sans rapport avec le Planner |
| Copier les 2 PNG de fond (`planner-banner-bg-{mobile,desktop}.png`) dans le `public/img/` de toute nouvelle app consommatrice | Pointer `backgroundImageMobile`/`Desktop` vers un chemin qui n'existe pas dans le `public/` de l'app hôte (404 silencieux) |

---

## Liens

- Figma : aucun (composant extrait de l'app `form-mealz-planner`, pas d'un node Figma source)
- Storybook : `DS.MD/Product/Catalog/Planner Banner`
- Origine : [`packages/form-mealz-planner/app/page.tsx`](../../../../../../form-mealz-planner/app/page.tsx) (markup `entry-banner*` avant extraction)
