# Architecture — Profil alimentaire permanent Neutral-first

Statut : prête pour implémentation du prototype interne
Package principal : `packages/hub/`
Package en lecture seule : `packages/design-system/`
Branche inspectée : `main`
Spec : `packages/hub/docs/product/2026-09-03-preferences-alimentaires/spec.md`
Référence Figma : fichier Catalog `e8BpuLovSPh0SPseTl29tA`, section `4745:37989`

## 1. Éléments observés dans le codebase

- `packages/hub/app/(master)/neutral/supermarket/layout.tsx` monte déjà `PlannerProvider` au-dessus du catalogue, des collections et du flow Planner. C’est le layout persistant le plus proche qui survit à toute navigation Supermarket.
- `packages/hub/src/features/supermarket/pages/CatalogPage.tsx` et `packages/hub/src/features/supermarket/components/CollectionView.tsx` rendent tous deux `StoreHeader`, `CatalogNavigation` et des `RecipeCard`. Les deux affichent aujourd’hui un compteur de préférences codé en dur à `3`.
- `packages/design-system/src/components/ui/product/CatalogNavigation/CatalogNavigation.tsx` expose déjà `onPreferencesClick`; sa documentation interdit d’embarquer la logique du panneau dans le composant.
- `packages/design-system/src/components/ui/layout/StoreHeader/StoreHeader.tsx` expose `accountHref`; un vrai lien est préféré à un routage piloté uniquement par `onClick`.
- `packages/hub/src/features/mealz-planner/context/PlannerContext.tsx` porte un état hebdomadaire éphémère (`people`, `meals`, `equipmentIds`, `dietIds`). Il ne persiste rien et ne doit pas devenir la source de vérité du profil permanent.
- `packages/hub/src/features/mealz-planner/data/mock/recipes.ts` choisit aujourd’hui les résultats via `pickRecipes`, tandis que le catalogue utilise `packages/hub/src/features/supermarket/data/recipes.ts`. Les deux modèles de recettes sont distincts.
- `packages/design-system/` fournit déjà `Modal`, `Drawer`, `Toast`, `Button`, `Stepper`, `Checkbox`, `InputField` et `ChipTag`. Les composants et tokens existants suffisent ; aucune promotion ou modification du design system n’est requise.
- Les tests Hub utilisent Vitest, jsdom et Testing Library. Les commandes ciblées vérifiées sont de la forme `pnpm --filter @mealz-product-team/hub exec vitest run <path>`.
- Le baseline observé passe : 4 fichiers / 13 tests pour `supermarket` + `mealz-planner`, puis build Next de 71 routes.

## 2. Contraintes structurantes

1. Le profil permanent et l’état hebdomadaire Planner restent deux modules différents.
2. Le catalogue ne masque aucune recette à cause du profil permanent.
3. La politique de personnalisation est une fonction pure unique consommée par le catalogue et le Planner.
4. Une incompatibilité n’est jamais inférée depuis un titre : elle vient de métadonnées de fixture explicites et auditables.
5. Les préférences complexes sont éditées dans un brouillon local ; le provider ne reçoit les changements qu’à `Enregistrer`.
6. La persistance navigateur est versionnée et séparée entre profil et présentation de l’invitation.
7. Les routes Supermarket restent dérivées de `basePath`.
8. Le design system reste en lecture seule pour ce lot.

## 3. Décisions d’architecture

### 3.1 Module propriétaire

Créer un module profond `packages/hub/src/features/food-preferences/`. Son interface publique est le hook `useFoodPreferences()` et la fonction pure `personalizeRecipes()`.

Le module cache :

- la représentation tri-état des allergies/restrictions ;
- la sérialisation et la validation défensive de `localStorage` ;
- la version de l’invitation ;
- la navigation récapitulatif / éditeurs ;
- l’abandon et la validation des brouillons ;
- le calcul des exclusions et affinités.

Les pages Supermarket ne connaissent que l’état courant, `openDrawer()`, `saveSection()` et la sortie ordonnée de la politique.

### 3.2 Modèle de profil

```ts
type RestrictionSelection =
  | { status: 'unset' }
  | { status: 'none' }
  | { status: 'declared'; ids: string[] }

interface FoodPreferenceProfile {
  defaultGuests: number
  dietIds: string[]
  restrictions: RestrictionSelection
  avoidedIngredientIds: string[]
  cuisineIds: string[]
  maxPreparationMinutes: 15 | 20 | 30 | null
  equipmentIds: string[]
}
```

`unset`, `none` et `declared` ne peuvent donc pas être confondus par une liste vide. Les sélections sont stockées par identifiant canonique ; les libellés restent dans un registre éditorial.

### 3.3 Persistance navigateur

Utiliser deux clés explicites :

- `mealz.hub.neutral.food-preferences.v1` pour le profil ;
- `mealz.hub.neutral.food-preferences-invitation.v1` pour `{ deployment: '2026-09-profile-v1', seen: true }`.

Les fonctions `loadFoodPreferences(storage: Storage)` et `saveFoodPreferences(storage: Storage, profile)` reçoivent l’adapter natif `Storage`. Il n’est pas utile de créer une interface de repository supplémentaire tant qu’un seul adapter réel existe.

Au chargement, toute donnée absente, invalide ou d’une version inconnue retombe sur `createDefaultFoodPreferenceProfile()` sans planter le rendu. Aucun secret ni donnée sensible n’est journalisé.

L’information d’invitation est persistée dès le choix primaire ou secondaire afin de garantir une présentation unique. Elle n’est jamais déduite de la complétion du profil.

### 3.4 Provider et shell Supermarket

`FoodPreferencesProvider` est monté dans `packages/hub/app/(master)/neutral/supermarket/layout.tsx`, à l’extérieur du `PlannerProvider`. Un `SupermarketFoodPreferencesShell` client rend une seule instance de l’invitation Modal, du Drawer et du Toast pour tout le sous-arbre.

Le contexte expose :

```ts
interface FoodPreferencesContextValue {
  profile: FoodPreferenceProfile
  hydrated: boolean
  invitationSeen: boolean
  openDrawer: (trigger?: HTMLElement | null) => void
  closeDrawer: () => void
  saveGuests: (value: number) => void
  saveSection: (section: EditablePreferenceSection, draft: FoodPreferenceProfile) => void
}
```

Le shell capture `document.activeElement` lors d’une ouverture volontaire et lui restitue le focus à la fermeture. Pour l’invitation automatique, il recherche le bouton `aria-label="Préférences"` dans le conteneur catalogue après fermeture. Cette recherche reste un adapter local rendu nécessaire par l’absence de prop `ref` dans `CatalogNavigation`; elle ne justifie pas une modification du design system dans ce lot.

La Modal n’apparaît que sur la route catalogue Supermarket exacte, après hydratation et uniquement si la clé de présentation n’est pas marquée. `Plus tard` persiste la présentation et ferme. Le CTA primaire persiste la présentation, ferme la Modal puis ouvre le Drawer.

### 3.5 Composition UI

Les vues partagées sont :

- `FoodPreferencesSummary` : récapitulatif de niveau 0 ; absence silencieuse pour `restrictions.status === 'unset'` ; convives appliqués directement.
- `RestrictionsEditor` : régimes et allergies/restrictions séparés dans les données ; exclusivité `none` / `declared`.
- `AvoidedIngredientsEditor` : recherche dans un registre éditorial local, filtrage par libellé et synonymes normalisés, stockage par ID et prévention des doublons.
- `KitchenPreferencesEditor` : seuil exclusif, cuisines multi-sélection avec libellé visible et `aria-pressed`, équipements multi-sélection ; sauvegarde globale.
- `FoodPreferencesDrawer` : orchestre récapitulatif, niveau 1, brouillon, Retour, Enregistrer et Toast.
- `FoodPreferencesProfilePage` : réutilise les mêmes vues et le même provider sur `/neutral/supermarket/profile`, sans dupliquer le modèle ni la persistance.

Les styles vivent dans `packages/hub/src/features/food-preferences/styles/food-preferences.css`, sont scopés sous `.supermarket-feature` et n’emploient que les variables du design system. Les URLs temporaires d’assets Figma ne sont pas intégrées.

### 3.6 Politique de personnalisation

Créer une interface générique afin de ne pas fusionner artificiellement les deux modèles de recettes :

```ts
interface RecipePreferenceFacts {
  incompatibleDietIds: string[]
  incompatibleRestrictionIds: string[]
  ingredientIds: string[]
  cuisineId: string | null
  preparationMinutes: number
}

interface PreferenceCandidate<T> {
  item: T
  facts: RecipePreferenceFacts
}

type PersonalizationSurface = 'catalog' | 'planner'

function personalizeRecipes<T>(
  candidates: readonly PreferenceCandidate<T>[],
  profile: FoodPreferenceProfile,
  surface: PersonalizationSurface,
): T[]
```

Règles retenues pour le prototype interne :

- `catalog` ne retire jamais un item ; il applique uniquement un ordre stable.
- `planner` retire une recette seulement si `incompatibleRestrictionIds` ou `incompatibleDietIds` intersecte une déclaration du profil.
- un ingrédient évité applique une pénalité de classement, sans masquer ;
- une cuisine appréciée applique un bonus d’affinité ;
- une durée au-dessus de `maxPreparationMinutes` applique une pénalité, sans masquer ;
- `equipmentIds` n’entre pas dans le score de profil permanent ;
- à score égal, l’ordre source est conservé.

Les règles régime et durée sont la traduction conservatrice retenue faute de réponse interactive : incompatibilité de régime explicitement déclarée = exclusion du Planner, mais dépriorisation seulement dans le catalogue qui reste complet ; dépassement de durée = dépriorisation. Elles doivent être signalées dans les notes d’implémentation et peuvent être révisées par Zeus sans changer l’interface du module.

Les fixtures catalogue et Planner reçoivent des `preferenceFacts` explicites. La politique ne parse ni `title` ni `name` et n’utilise aucun appel réseau.

`pickRecipes` conserve les intentions hebdomadaires existantes du Wizard, puis délègue le classement/exclusion permanent à `personalizeRecipes`. Le comportement historique spécifique du Wizard n’est pas promu dans le profil permanent.

### 3.7 Convives permanents et Planner

Le profil fournit une valeur par défaut, pas une obligation hebdomadaire. `PlannerContext` ajoute un mécanisme d’initialisation conditionnelle :

- `applyDefaultPeople(value)` change `people` uniquement tant que l’utilisateur n’a pas modifié ce champ dans le Wizard ;
- `setPeople(value)` marque le champ comme modifié pour la session ;
- `reset()` réarme l’application de la valeur permanente courante.

Un bridge interne sous les deux providers appelle `applyDefaultPeople(profile.defaultGuests)` après hydratation. Cela évite de coupler le module permanent au reducer Planner tout en respectant la distinction permanent / semaine courante.

### 3.8 Routage

Étendre `SupermarketRoutes` avec `profile: `${base}/profile``. `CatalogPage` et `CollectionView` passent :

- `accountHref={routes.profile}` à `StoreHeader` ;
- `onPreferencesClick={() => openDrawer(document.activeElement as HTMLElement)}` à `CatalogNavigation` ;
- aucun `preferencesCount`.

Créer `packages/hub/app/(master)/neutral/supermarket/profile/page.tsx` comme adapter fin vers `FoodPreferencesProfilePage`.

## 4. Alternatives rejetées

- Étendre `PlannerContext` pour stocker tout le profil : rejeté, car le cycle de vie permanent et les intentions hebdomadaires seraient confondus.
- Modifier `CatalogNavigation` ou `StoreHeader` dans le design system : rejeté, leurs interfaces actuelles suffisent et le lot est Hub-only.
- Créer une nouvelle librairie de persistance/repository : rejeté, un seul adapter réel (`localStorage`) ne justifie pas cette couture.
- Inférer allergènes, ingrédients ou cuisine depuis les titres : rejeté, non fiable et non auditable.
- Copier la structure Tailwind générée par Figma : rejeté, Hub utilise CSS tokenisé et les composants DS.
- Appliquer les équipements permanents comme filtre : rejeté par la spec.

## 5. Performance et sécurité

- Complexité du tri : `O(n log n)` sur les petites fixtures du prototype ; aucun calcul réseau.
- Les registres et métadonnées restent statiques et importés localement.
- `localStorage` ne convient pas à une donnée multi-device ou sensible ; cette implémentation est explicitement un adapter de prototype interne. Une future persistance compte remplacera le chargement/sauvegarde derrière le provider.
- La copy allergies/restrictions reste provisoire et ne doit pas être diffusée sans validation juridique.
- Aucun HTML utilisateur n’est injecté ; la recherche d’ingrédients sélectionne uniquement des IDs du registre.

## 6. Stratégie de test

- Modèle/persistance : round-trip, données invalides, tri-état, exclusivité, clés séparées.
- Politique : exclusion conditionnelle, catalogue intégral, pénalités ingrédients/durée, bonus cuisine, régime, équipements sans effet et stabilité.
- Provider : hydratation, sauvegarde immédiate convives, invitation versionnée.
- Workflow : première invitation, `Plus tard`, CTA volontaire, niveau 0/1, abandon du brouillon, sauvegarde, Toast et focus.
- Route : `profile` dérivée de plusieurs `basePath`, lien `Joe`, retour catalogue.
- Planner : défaut convives avant modification, conservation d’un override hebdomadaire et application de la politique commune.
- Vérification finale : suite Hub complète, build Hub, `git diff --check`, puis contrôle manuel mobile Figma.

## 7. Risques et décisions externes

- La copy allergies/restrictions doit être validée juridiquement avant diffusion.
- Zeus peut confirmer ou ajuster les deux règles conservatrices régime/durée ; l’interface de politique évite une refonte si les pondérations changent.
- Le `Drawer` et la `Modal` DS ne gèrent pas de focus trap. Le lot vérifie ouverture, fermeture et restitution du focus ; une correction générique du trap nécessiterait une décision séparée de promotion au design system.
- Le responsive complet desktop/tablette, les erreurs de sauvegarde et les états vides restent hors scope conformément à la spec.
