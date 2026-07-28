# Brief — packages/marmiton-prototype

## Intention

`marmiton-prototype` devient le package unique pour tout ce qui se déploie sous marmiton.fr côté prototypes. Il regroupe deux parcours distincts, accessibles depuis une page d'accueil de type hub (cards → routes internes) :

- **Recipe** (`/recipe`) : parcours d'achat "recette → panier → magasin → créneau → paiement → confirmation", le contenu historique du package.
- **Agent** (`/agent`) : futur parcours conversationnel agent. Le package `packages/marmiton-agent` existant sera probablement déprécié à terme au profit de ce chemin — pour l'instant `/agent` est un simple placeholder "à venir", sans dépendance au package `marmiton-agent`.

## Décisions

- **Cards internes, pas des liens Netlify externes** : contrairement à `packages/home` (qui pointe vers d'autres domaines Netlify), ici les cards pointent vers des routes internes au même site (`/recipe`, `/agent`) — pattern CSS repris de `packages/home/app/page.css` (`home__grid`, `home__card`, tokens DS).
- **`/agent` = placeholder pour l'instant** : pas de redirection vers l'ancien site marmiton-agent, pas de migration de contenu. Juste une page "à venir" en attendant la refonte propre du parcours agent.
- **URLs en anglais** : toutes les routes du flow recipe ont été renommées FR→EN (le français dans les URLs est évité dans tout le monorepo, sauf `packages/marmiton-agent` qui n'a pas été touché car probablement voué à être déprécié) :

  | Ancien (FR) | Nouveau (EN) |
  |---|---|
  | `/recette` | `/recipe` |
  | `/panier` | `/cart` |
  | `/magasin` | `/store` |
  | `/creneau` | `/slot` |
  | `/paiement` | `/payment` |
  | `/connexion` | `/login` |
  | `/confirmation` | `/confirmation` (déjà EN) |

  Seuls les segments d'URL ont changé — les libellés UI visibles (ex. "Retour recette", "Modifier le créneau") restent en français, ce n'était pas dans le périmètre de cette passe.

- **Même passe appliquée à `assistant-shopping`** (`/categorie` → `/category`, `/panier` → `/cart`) et **`form-mealz-planner`** (`/equipement` → `/equipment`, `/personnes` → `/people`, `/regime` → `/diet`, `/repas` → `/meals`, `/resultats` → `/results`), pour rester cohérent à travers le monorepo.
- **Titre de page corrigé** : `app/layout.tsx` avait un `<title>` resté sur "DS.MD — Mealz Design System" (copié-collé depuis le template racine) → corrigé en "Marmiton Prototype".

## Non fait (hors périmètre de cette session)

- Pas de renommage des libellés UI (texte visible en français) — seulement les segments d'URL.
- Pas de retrait/dépréciation effective de `packages/marmiton-agent` — décision à prendre plus tard.
- ~~Pas de connexion réelle du parcours `/agent` à une logique conversationnelle — pure placeholder.~~ Obsolète : un moteur de conversation scripté (`src/lib/agentScript.ts`) et une UI de chat (`AgentConversation`) existent depuis une session ultérieure — voir section suivante.

---

## Carte recette enrichie (agent conversationnel)

Contexte : quand l'agent recommande une recette dans `AgentConversation`, la carte envoyée doit être **pertinente pour le contexte agentique**, pas une simple vignette catalogue. Analyse comparative faite via `/design:user-research` entre (a) un exemple de référence (carte agent Marmiton — capture d'écran fournie par l'utilisateur), (b) le contenu réel d'une fiche recette Marmiton (`marmiton.org`, JSON-LD `Recipe` + page), et (c) l'état existant (`RecipeCard` du DS + `chat-card` custom dans `AgentConversation.tsx`).

### Constat clé

`RecipeCard` (design-system) est scopé **catalogue/grille** (cf. `RecipeCard.design.md`) : son rôle est de faire choisir *parmi* plusieurs recettes. La carte de l'agent a un rôle différent : **justifier un choix déjà fait** à partir de ce que l'utilisateur vient de dire. Elle n'a donc **pas** sa place dans le design system — c'est un composant app-level (`marmiton-prototype`), au même titre que `ProductCard`. Aucune entrée DESIGN.md §3 ne la couvre, et ce n'est pas un oubli à corriger : c'est un pattern différent (bandeaux empilés sur une carte pleine largeur de fil de discussion, pas une grille).

### Modèle de contenu retenu

| Champ | Pourquoi il compte ici (pas juste "parce que la référence l'a") |
|---|---|
| `rating` + `reviewCount` | Signal de confiance générique — repris de Marmiton (`aggregateRating`), peu coûteux à afficher |
| `difficulty` (`facile`/`moyen`/`difficile`) | Deuxième signal anti-risque en plus de la durée — pertinent quand la conversation a exprimé une contrainte de risque ("enfants difficiles") |
| **Écart panier** (ingrédients déjà déclarés par l'utilisateur vs liste complète de la recette) | Le signal le plus actionnable : transforme "voici une recette" en "voici ce qu'il vous reste concrètement à acheter". Calculé en croisant `AgentSlots.ingredients` (ce que l'utilisateur a dit avoir) avec `Recipe.ingredients` — logique déjà à moitié là (`extractSlots`), il manquait le croisement |
| `tip` (astuce anti-échec) | Répond à l'anxiété du persona ciblé (rapide + zéro risque) en prévenant un point d'échec connu de la recette — équivalent produit de la "note d'auteur" / astuce d'avis chez Marmiton |

**Délibérément pas repris** : le prix n'est pas mis en avant sur la carte de l'agent (la référence ne le montre pas non plus) — le registre est confiance/effort, pas merchandising ; il reste consultable sur la fiche recette derrière "Voir la recette". Le raisonnement conversationnel ("pourquoi cette recette") n'est **pas dupliqué** sur la carte : il est déjà porté par le texte de la bulle agent (`recommendationMessage` / `reasonFor` dans `agentScript.ts`) juste au-dessus — la carte apporte ce qui n'y est pas déjà (note, difficulté, écart panier, astuce).

### Décisions de portée (validées avec l'utilisateur)

- **CTA simple pour cette itération** : uniquement "Voir la recette" (navigation), pas de bouton panier direct depuis la carte de conversation. Le double CTA (voir/ajouter au panier) de la référence est noté mais volontairement pas construit maintenant — reviendra si le parcours agent doit un jour raccourcir jusqu'au panier sans quitter le drawer.
- **Pas de composant `Alert` du DS** pour les bandeaux "écart panier" / "astuce" : `Alert` porte `role="alert"` (interruptif, réservé aux messages qui justifient une interruption lecteur d'écran d'après son propre design doc) — inadapté à du contenu persistant non-urgent. Utilisation directe des tokens `--color-semantic-{success,info}-bg-light`/`-content` (déjà prévus pour "bandeaux inline" d'après leur commentaire dans `color-light.generated.css`).

---

## Classement des champs de la carte recette par importance (2026-07-28)

Contexte : quels champs de la carte agent comptent le plus pour l'utilisateur, et dans quel ordre. Critère de classement retenu (validé avec l'utilisateur) : **réduire le risque de décision en premier** — "est-ce que ça va marcher pour MA contrainte ?" — plutôt que la confiance générique (rating) ou l'effort d'exécution (écart panier), qui passent après.

### Classement (du plus au moins critique)

| Rang | Champ | Pourquoi |
|---|---|---|
| 1 | Correspondance à la contrainte exprimée (enfant, sans-sauce, végétarien, sans gluten, sans lactose, allergie) | Répond directement à la contrainte la plus spécifique à la conversation en cours |
| 2 | Durée | Répond à "ai-je le temps ?" — cœur du persona "rapide" |
| 3 | Portions / convives | Répond à "est-ce que ça correspond au nombre de personnes ?" |
| 4 | Astuce anti-échec (`tip`) | Neutralise le point de friction connu de la recette |
| 5 | Difficulté | Anti-risque, partiellement redondant avec durée + astuce |
| 6 | Écart panier | Très actionnable mais répond à un risque d'*effort*, pas de *décision* |
| 7 | Note + avis | Confiance générique, la moins personnalisée à la contrainte exprimée |

### Manques identifiés et décisions

- **Chip de correspondance à la contrainte** — le rang #1 n'avait jusqu'ici aucune traduction visuelle sur la carte (seulement dans le texte de la bulle agent, `reasonFor`/`recommendationMessage`). Ajout d'un chip scannable (`ChipTag type="toned"`, cf. `DESIGN.md` §3 "Petites étiquettes" — tag produit/catégorie, pas `Badge` qui est réservé aux compteurs numériques), affiché uniquement si la contrainte est réellement satisfaite par la recette recommandée (présente dans `recipe.tags`) — **jamais sur un résultat `relaxed`** (contrainte abandonnée), pour ne jamais afficher une fausse confirmation. Labels : Enfants / Sans sauce / Végétarien / Sans gluten / Sans lactose.
- **`allergie` volontairement exclu de ce chip** — `allergie` dans `Recipe.tags` est un mot-clé approximatif de matching ("une allergie a été mentionnée"), pas un champ d'allergènes vérifié : afficher une confirmation de type "correspond ✓" serait trompeur sur un sujet de sécurité alimentaire. **Résolu par la section "Itération 2" ci-dessous** : plutôt qu'un chip de confirmation, affichage de la liste complète et honnête `Recipe.allergens` quand `slots.constraint === 'allergie'` — transparence plutôt que fausse promesse de filtrage précis.
- **Confirmation des portions** — `slots.servings` était capturé par le classificateur mais jamais reflété sur la carte. Ajout de "Pour {servings}" dans la ligne meta, affiché uniquement quand `slots.servings` a été renseigné par l'utilisateur.
- **Saisonnalité** — nouveau champ `Recipe.season?: Season[]` (`'printemps' | 'ete' | 'automne' | 'hiver'`), renseigné sur les 6 recettes mock. Chip "De saison" (`ChipTag`) affiché uniquement si le mois courant correspond à une saison déclarée sur la recette ; pas de valeur "toute-année" à gérer explicitement — une recette sans `season` déclaré n'affiche simplement pas le chip.
- **Prix/budget** — reste délibérément exclu (reconfirmé), cohérent avec la décision déjà actée plus haut dans ce document (registre confiance/effort, pas merchandising).
- **Notés pour une itération future, non construits maintenant** : temps de préparation vs temps total (un total identique peut cacher des profils d'effort réel différents), équipement nécessaire (four, robot...) — aucun champ actuel ne les porte, pas de besoin produit validé pour les construire cette fois-ci.

### Itération 2 — comparaison HelloFresh (meal-kit, même enjeu recette→courses)

Marmiton seul ne suffisait pas comme référence (site blog-recette, pas shopping-intégré). Sur une vraie fiche recette HelloFresh (`hellofresh.fr/recipes/...`) : allergènes affichés explicitement (+ disclaimer atelier partagé), calories/protéines en chiffre isolé à côté de la note, ingrédients marqués "non inclus dans la livraison" pour les produits de base (sel, huile), astuces à chaque étape à risque plutôt qu'une seule en fin de fiche, bouton "Enregistrer" séparé du parcours d'achat, et **prix absent de la fiche recette** (confirme la décision de ne pas l'afficher sur la carte agent).

Champs ajoutés en conséquence :

| Champ | Condition d'affichage | Pourquoi conditionnel |
|---|---|---|
| `Recipe.allergens` | Uniquement si `slots.constraint === 'allergie'` | Le classificateur détecte juste "une allergie a été mentionnée", pas laquelle — afficher la liste complète est le choix honnête (transparence) plutôt que de prétendre avoir filtré pour l'allergène précis |
| `Recipe.calories` / `Recipe.protein` | Uniquement si `slots.healthFocus` (mots-clés "léger/healthy/calories/régime/minceur", slot indépendant de `constraint`) | Évite d'afficher ces chiffres par défaut sur toutes les cartes — bruit pour qui n'a pas exprimé ce souci |
| `Ingredient.staple` | Exclut l'ingrédient du calcul d'écart panier (`pantryMatch`) | Sans ça, "il manque 3 produits" peut compter de l'huile ou du sel que tout le monde a déjà — dilue le signal |
| `Recipe.tipForKids` | Remplace `tip` quand `slots.constraint === 'enfant'` (via `selectTip()`) | Première étape vers des astuces choisies selon le risque exprimé, sans construire un moteur de sélection multi-contextes (pas d'autre signal de risque détectable pour l'instant, ex. "débutant") |

**Pas fait, noté pour plus tard si besoin** : astuces multiples par étape (comme HelloFresh) — hors périmètre d'une carte de recommandation (vs. une fiche recette complète) ; détection de l'allergène précis (nécessiterait une liste d'allergènes nommés dans le classificateur, pas juste un mot-clé générique).

### Portée d'implémentation retenue (fusion des deux passes)

Les deux sections ci-dessus (classement + Itération 2) ont été écrites en parallèle puis réconciliées — une seule passe d'implémentation couvre l'ensemble :

1. Chip de correspondance à la contrainte (`ChipTag`) pour enfant/sans-sauce/végétarien/sans-gluten/sans-lactose — jamais sur un résultat `relaxed`.
2. `Recipe.allergens` affiché en liste complète quand `slots.constraint === 'allergie'` (remplace tout chip de confirmation pour ce cas).
3. Confirmation des portions ("Pour {servings}") quand `slots.servings` est renseigné.
4. `Recipe.season` + chip "De saison" quand le mois courant correspond.
5. `Recipe.calories`/`protein` affichés quand `slots.healthFocus` (nouveau slot, mots-clés "léger/healthy/calories/régime/minceur") est détecté.
6. `Ingredient.staple` exclu du calcul d'écart panier (`pantryMatch`).
7. `Recipe.tipForKids` remplace `tip` via `selectTip()` quand `slots.constraint === 'enfant'`.

Prix/budget reste exclu. Temps de préparation vs total et équipement nécessaire restent notés pour plus tard, non construits dans cette passe.
