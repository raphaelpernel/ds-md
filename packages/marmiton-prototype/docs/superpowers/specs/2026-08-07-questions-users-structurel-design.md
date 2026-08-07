# Design — Contraintes combinées et correction en conversation (sous-projet 2/2)

Contexte : suite directe du [sous-projet 1](2026-08-06-questions-users-vocabulaire-design.md) (vocabulaire
additif, terminé et mergé sur `dev`). Ce document couvre les deux changements structurels identifiés
lors du brainstorming du 2026-08-06 et explicitement exclus du sous-projet 1 car ils touchent la forme
même de `AgentSlots` plutôt que d'ajouter du vocabulaire par-dessus. Discussion validée le 2026-08-07
via `superpowers:brainstorming`.

## Point de départ du problème

`AgentSlots.constraint?: Constraint` ne retient qu'une seule valeur à la fois : un user exprimant
"un enfant qui n'aime pas trop la sauce, et sans gluten" voit la seconde contrainte silencieusement
écrasée (la boucle `CONSTRAINT_WORDS` dans `extractSlots` s'arrête au premier match). Par ailleurs,
`extractSlots` est purement additif — rien ne permet de retirer un ingrédient ou une contrainte déjà
posée dans le fil ("finalement pas de poulet", "en fait peu importe le sans-gluten").

## Décisions

### 1. `AgentSlots.constraint?: Constraint` devient `AgentSlots.constraints: Constraint[]`

Renommage assumé (pas juste un changement de type) — un champ au singulier porterait mal un tableau.
`constraints: []` remplace `constraint: undefined` comme état "aucune contrainte" (`EMPTY_SLOTS` mis à
jour en conséquence). Ce changement de forme se propage à tous les points de consommation : `agentScript.ts`,
`recipeAskScript.ts`, `AgentConversation.tsx`, `RecipeAgentDrawer.tsx`.

### 2. `extractSlots` — accumulation et retrait, même mécanique que `avoidIngredients`

- Nouveau déclencheur `RETRACT_WORDS` (`finalement`, `en fait`, `plutôt pas`, `peu importe`, `oublie`,
  `annule`), testé sur le texte normalisé — même registre que `AVOID_WORDS`/`BUDGET_WORDS` (sous-projet 1).
- **Boucle `CONSTRAINT_WORDS`** : le `break` qui arrêtait la boucle au premier match disparaît — toutes
  les contraintes mentionnées dans un même tour sont collectées. Pour chaque contrainte reconnue :
  - Tour de retrait (`RETRACT_WORDS` détecté) → retirée de `constraints` si présente.
  - Tour normal → ajoutée à `constraints` si absente (idempotent, pas de doublon).
- **Boucle `INGREDIENT_WORDS`** : un troisième branchement (retrait) s'ajoute aux deux existants
  (j'ai / j'évite, sous-projet 1) — un ingrédient reconnu dans un tour de retrait est retiré de
  `ingredients` **et** `avoidIngredients` (peu importe lequel des deux le portait).
- **Cas ambigu volontairement non traité** : un déclencheur de retrait sans contrainte/ingrédient
  reconnu dans le même texte ("finalement, peu importe" seul, sans mot-clé identifiable) ne produit
  aucun effet observable. Un classificateur scripté ne peut pas deviner *quoi* retirer sans un
  mot-clé pour l'ancrer — ne rien faire est plus sûr qu'un effacement large et surprenant.
- **Priorité entre branchements** : si un même tour matche à la fois `RETRACT_WORDS` et `AVOID_WORDS`
  (ex. "finalement j'aime pas le poulet" — cas limite, phrasé improbable mais possible), le retrait
  est prioritaire : le mot-clé ingrédient reconnu est retiré des deux slots plutôt qu'ajouté à l'un d'eux.

### 3. Repli sur échec — abandon global, pas de retrait sélectif

Quand plusieurs contraintes sont posées et qu'aucune recette ne les satisfait toutes, l'agent abandonne
**toutes** les contraintes d'un coup plutôt que de retenter en relâchant une contrainte à la fois
(décision validée avec l'utilisateur — évite d'avoir à définir un ordre de priorité/spécificité entre
les 8 valeurs de `Constraint`, complexité non justifiée par le besoin actuel).

- `AgentTurnResult`'s `relaxed` variant : `droppedConstraint: string` devient `droppedConstraints: string[]`.
- Message combiné quand plusieurs contraintes sont abandonnées : jointure des formes accordées de
  `RELAXED_REASON` avec « et » (ex. *"Je n'ai pas trouvé de recette adaptée aux enfants et sans
  gluten, voici ce qui s'en rapproche le plus : {nom}."*). Une seule contrainte abandonnée reprend
  le message actuel tel quel (rétrocompatible).

### 4. Scoring, labels, avis — passage du singulier au pluriel

- **`scoreRecipe`** : `+2` par contrainte satisfaite plutôt qu'une seule fois — une recette qui coche
  2 contraintes sur 2 posées sort naturellement devant celle qui n'en coche qu'une.
- **Nouvelle fonction `satisfiedConstraints(recipe, slots, matched): Constraint[]`** remplace
  `constraintApplies` + la vérification individuelle par tag : retourne le sous-ensemble de
  `slots.constraints` réellement satisfait par la recette — exclut `'allergie'` (mot-clé approximatif,
  jamais présentable comme "satisfait", inchangé du sous-projet 1) et retourne `[]` sur un résultat
  `relaxed` (`matched=false`), même garde de sécurité qu'aujourd'hui, appliquée à un tableau.
- **`constraintLabel` devient `constraintLabels(recipe, slots, matched): string[]`** — mappe
  `satisfiedConstraints(...)` vers `CONSTRAINT_LABELS`. La carte multi-recette affiche un `ChipTag`
  par contrainte confirmée au lieu d'un seul.
- **`selectCommunityQuote`** : garde un seul avis — celui de la **première** contrainte satisfaite
  (ordre de `slots.constraints`, donc ordre d'expression par l'utilisateur). Empiler plusieurs
  citations alourdirait la carte sans ajouter de signal supplémentaire ; ce n'est pas un compromis,
  c'est cohérent avec la position déjà actée du sous-projet 1 ("pas de compteur, une seule attribution
  compte").
- **`reasonFor`** (message de recommandation `/agent`) : boucle sur `slots.constraints`, construit un
  fragment de phrase par contrainte reconnue (réutilise les formes accordées existantes — "adaptée aux
  enfants", "sans sauce"), jointes par virgule comme le fait déjà la fonction pour les autres signaux.
- **`hasEnoughSignal`** : `slots.constraints.length > 0` remplace `slots.constraint !== undefined`.

### 5. `recipeAskScript.ts` (fiche recette) — confirmation et accusé de retrait

- La détection "contrainte nouvellement posée ce tour" (aujourd'hui une comparaison directe
  `prevSlots.constraint !== slots.constraint`) se généralise au tableau via un diff
  `slots.constraints.filter(c => !prevSlots.constraints.includes(c))` — même patron que
  `newlyAvoided` déjà utilisé pour `avoidIngredients` (sous-projet 1). Une phrase de confirmation
  par contrainte nouvellement mentionnée (Oui/Non, comme aujourd'hui), plusieurs phrases si le
  tour en mentionne plusieurs à la fois.
- **Nouveau — accusé de retrait explicite** : quand une contrainte ou un ingrédient disparaît entre
  deux tours (diff inverse : présent dans `prevSlots`, absent de `slots`), l'agent le dit
  explicitement (*"D'accord, je ne tiens plus compte de : sans gluten."*). Nécessaire ici — c'est un
  dialogue direct sur une recette déjà affichée, un retrait silencieux serait déroutant. **Différent
  de `/agent`** (point 6 ci-dessous), où l'ajout d'une nouvelle contrainte ne produit déjà aujourd'hui
  aucun accusé de réception dédié — juste une nouvelle recommandation qui la reflète.

### 6. `/agent` (multi-recette) — pas d'accusé de retrait dédié

Contrairement à `recipeAskScript.ts`, le moteur multi-recette ne produit pas de message dédié pour un
retrait : la contrainte disparaît simplement de `slots.constraints`, et la recommandation suivante
(`recommend`/`relaxed`) reflète naturellement le nouvel état — cohérent avec le fait que l'**ajout**
d'une contrainte ne produit pas non plus d'accusé de réception séparé aujourd'hui, juste une nouvelle
recommandation. Asymétrie assumée entre les deux moteurs : `/agent` est un flux de recherche itératif
(chaque tour re-résout "quelle recette"), `recipeAskScript.ts` est un dialogue de confirmation sur une
recette déjà connue (chaque tour répond "est-ce que ça marche pour moi ?") — le second a plus besoin
d'accusés de réception explicites que le premier.

## Hors scope pour cette passe

- Aucun plafond artificiel sur le nombre de contraintes simultanées (le classificateur reste scripté,
  la boucle `CONSTRAINT_WORDS` accepte structurellement n'importe quelle combinaison des 8 valeurs).
- Aucune nouvelle donnée mock : le cas combiné `vegan` + `vegetarien` existe déjà sur la recette curry
  (sous-projet 1) et suffit à démontrer/tester le scoring multi-contrainte sans recette supplémentaire.
- Retrait de `time`/`servings` : une nouvelle valeur mentionnée écrase déjà l'ancienne (comportement
  actuel, pas de "retrait" explicite nécessaire) — confirmé hors scope avec l'utilisateur.
- Retrait de `avoidIngredients`/`budgetFocus`/`healthFocus` autrement que via le mécanisme d'ingrédient
  ci-dessus (ex. "en fait je m'en fiche du prix" pour annuler `budgetFocus`) — non demandé, pourrait
  être une itération future sur le même patron si le besoin est validé.

## Composants DS concernés

Aucun nouveau composant — `ChipTag` déjà utilisé pour un label de contrainte est simplement rendu
plusieurs fois (un par contrainte satisfaite) au lieu d'une fois, sur `AgentConversation.tsx`.

## Questions ouvertes pour la phase de plan d'implémentation

- Exact texte de l'accusé de retrait dans `recipeAskScript.ts` quand plusieurs éléments sont retirés
  dans le même tour (contrainte(s) + ingrédient(s) à la fois) — un seul message combiné ou une phrase
  par catégorie ? À trancher en écrivant les tests.

## Vérification faite pendant le brainstorming

`constraintApplies` (retiré, remplacé par `satisfiedConstraints`) n'est consommé que par
`agentScript.ts` lui-même et son fichier de test (`agentScript.test.ts`, describe dédié, 3 tests) —
aucun import externe (`recipeAskScript.ts`, composants React). Le plan d'implémentation doit remplacer
ce describe par l'équivalent pour `satisfiedConstraints`, pas juste le supprimer.
