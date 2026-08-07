# Design — Élargir le vocabulaire reconnu par l'agent (sous-projet 1/2)

Contexte : audit des questions qu'un vrai user pourrait poser à l'agent, déclenché depuis `/agent`
(hero + composer, moteur multi-recette `agentScript.ts`) ou depuis le `RecipeAskBar`/`RecipeAgentDrawer`
sur la fiche recette (moteur mono-recette `recipeAskScript.ts`). Discussion validée le 2026-08-06 via
`superpowers:brainstorming`, en continuité directe de la substitution d'équipement livrée le même jour.

Le sujet complet (audit + corrections) a été jugé trop large pour un seul spec : il mélange des ajouts
de vocabulaire sans risque (ce document) et un changement de structure de données qui touche les deux
moteurs en profondeur (sous-projet 2, spec séparé à suivre immédiatement après celui-ci).

## Point de départ du problème

`extractSlots` (partagé par les deux moteurs) et `answerRecipeAsk` (mono-recette) ne reconnaissent
aujourd'hui qu'un sous-ensemble étroit de ce qu'un user écrirait naturellement : temps, portions, une
poignée de contraintes, une liste fermée d'ingrédients "que j'ai". Cinq trous identifiés, tous additifs
(aucun ne change la forme de `AgentSlots.constraint`, qui reste une valeur unique — cf. sous-projet 2
pour la combinaison de contraintes) :

1. Vegan confondu avec végétarien
2. Aucun signal "débutant" (déjà noté comme trou connu dans `BRIEF.md`)
3. Aucune façon de signaler un ingrédient qu'on n'a pas *ou* qu'on n'aime pas, avec suggestion de
   substitut (le pendant "ingrédient" de la substitution d'équipement livrée aujourd'hui)
4. Aucune façon de répondre à une question de budget/prix
5. Pas de recette mock réellement vegan pour démontrer un cas positif

## Décisions

### 1. `vegan` devient une valeur de `Constraint` distincte de `vegetarien`

Aujourd'hui `CONSTRAINT_WORDS` route `vegan|végétarien|vegetarien` vers la même valeur `'vegetarien'`.
Un user demandant "vegan" peut donc recevoir une confirmation "Oui, cette recette est végétarienne" sur
une recette contenant des œufs — trompeur, sur le même registre que le trou allergène déjà traité par
`constraintApplies`.

- Nouveau `Constraint`: `'vegan'`, avec son propre pattern (`/vegan/i`, vérifié **avant** le pattern
  `vegetarien` dans `CONSTRAINT_WORDS` puisque le premier match gagne).
- `CONSTRAINT_LABELS.vegan = 'Vegan'`, `RELAXED_REASON.vegan = 'vegane'`.
- Correspondance : `recipe.tags.includes('vegan')`, comme les autres contraintes — pas de règle spéciale.
- Une recette vegan porte **aussi** le tag `'vegetarien'` (vegan ⊂ végétarien) pour qu'une question
  végétarienne trouve juste la recette vegan sans logique dédiée.

### 2. `debutant` : nouvelle contrainte, appuyée sur `recipe.difficulty` plutôt qu'un nouveau tag

- Nouveau `Constraint`: `'debutant'`, déclenché par ex. `/débutant|debutant|jamais cuisiné|nul(le)? en cuisine/i`.
- **Différence avec les autres contraintes** : pas de correspondance via `recipe.tags` (éviter de retaguer
  les 6 recettes existantes) — `constraintLabel` et `scoreRecipe` traitent `'debutant'` comme un cas
  spécial : correspondance = `recipe.difficulty === 'facile'`. Les 4 recettes déjà `'facile'`
  (poulet-citron, courgettes-ricotta, carbonara, salade-niçoise) qualifient sans changement de données.
- `CONSTRAINT_LABELS.debutant = 'Facile pour débuter'`, `RELAXED_REASON.debutant = 'facile pour débuter'`.
- Nouveau champ `Recipe.tipForBeginners?: string`, sélectionné par `selectTip()` quand
  `slots.constraint === 'debutant'` (même mécanique que `tipForKids`). Peuplé sur au moins une recette
  `'facile'` pour la démonstration (ex. la carbonara).

### 3. `avoidIngredients` : nouveau slot partagé (dégoût, distinct de l'allergie)

"J'aime pas les champignons", "j'évite les oignons" — différent de `allergie` (médical, déjà couvert)
et de `ingredients` (ce que l'utilisateur *a*, sens opposé).

- Nouveau champ `AgentSlots.avoidIngredients: string[]` (même forme que `ingredients`).
- Détection dans `extractSlots` partagé, déclenchée par des tournures dédiées **distinctes** de celles de
  la substitution d'équipement/ingrédient (point 4) pour éviter toute ambiguïté : `j'aime pas`,
  `je n'aime pas`, `j'évite`, `je déteste` — jamais `pas de`/`sans` (réservé à "je n'ai pas X" côté
  substitution). Vocabulaire reconnu : le même `INGREDIENT_WORDS` déjà utilisé pour le slot `ingredients`.
- Affichage : bandeau d'avertissement si un ingrédient de `avoidIngredients` est présent dans
  `recipe.ingredients` de la recette montrée — sur le même registre visuel que les allergènes
  (`chat-card__highlight--warning` / `recipe-ask-highlight--warning`), **sur la carte multi-recette et
  dans le drawer mono-recette**.
- **Pas de scoring/filtrage** dans `/agent` pour cette passe — reste informationnel, comme les allergènes.
  Filtrer les recommandations sur un dégoût est une vraie question d'algorithme de score, hors scope ici
  (peut devenir une itération 2 si besoin validé).

### 4. Substitution d'ingrédient (mono-recette uniquement) — même mécanique que l'équipement

- Nouvelle fonction `detectIngredientSubstitutionQuestion` dans `recipeAskScript.ts`, parallèle à
  `detectEquipmentQuestion` : mêmes tournures déclenchantes (`pas de`, `sans`, `remplacer`, `à la place`,
  `autre chose`), mais recherche **dynamique** dans `recipe.ingredients` de la recette affichée (pas un
  vocabulaire fixe — contrairement à l'équipement, les ingrédients varient par recette, donc on matche
  directement contre les noms réels de la recette en cours, normalize + includes, même approche que
  `pantryMatch`).
- Petite table `INGREDIENT_SUBSTITUTES` pour les ingrédients récurrents des recettes mock (ricotta →
  mascarpone ou fromage frais, parmesan → gruyère râpé, œufs → aquafaba, lardons → allumettes de dinde),
  fallback neutre sinon (même schéma que `EQUIPMENT_SUBSTITUTES`).
- **Cette même table est réutilisée par le point 3** : quand `avoidIngredients` matche un ingrédient de
  la recette *et* qu'un substitut est connu, le message inclut directement la suggestion plutôt qu'un
  simple avertissement ("Cette recette contient de la ricotta, que vous évitez — vous pouvez la
  remplacer par du mascarpone.").

### 5. Budget/prix (mono-recette uniquement)

- Nouveau slot partagé `AgentSlots.budgetFocus?: boolean`, déclenché par `cher`, `pas cher`,
  `petit budget`, `économique`, `abordable`, `coûte`, `prix` — même schéma que `healthFocus`.
- Réponse construite uniquement dans `recipeAskScript.ts` : formate `recipe.estimatedPricePerServing`
  (ex. *"Cette recette coûte environ 3,25 € par personne."*).
- **Pas d'affichage sur la carte, pas d'effet sur le classement `/agent`** — cohérent avec la décision
  déjà actée dans `BRIEF.md` ("le prix n'est pas mis en avant... le registre est confiance/effort, pas
  merchandising"). Même traitement asymétrique que `healthFocus` aujourd'hui (slot partagé, consommateur
  unique).

### 6. Nouvelle recette mock réellement vegan

Un vrai cas positif plutôt qu'un fallback honnête mais toujours vide. Recette proposée : **"Curry de
pois chiches et lait de coco"** (riz basmati, pois chiches, lait de coco, épices, légumes) —
`tags: ['vegan', 'vegetarien', ...]`, `allergens: []`, `difficulty: 'facile'` (qualifie aussi pour
`debutant`). Contenu exact (avis, astuce, temps, prix) à finaliser en plan d'implémentation, dans le
même format que les 6 recettes existantes de `MOCK_RECIPES`.

## Hors scope pour cette passe (sous-projet 2)

- Contraintes combinées ("un enfant ET sans porc") — `AgentSlots.constraint` reste une valeur unique.
- Correction en cours de conversation ("finalement pas de poulet") — `extractSlots` reste purement
  additif, aucune détection de négation/retrait.
- Filtrage/scoring de `/agent` basé sur `avoidIngredients` ou `budgetFocus`.
- Extension de `healthFocus` au moteur mono-recette (`recipeAskScript.ts`) — non demandé, pas dans
  l'audit initial.
- Détection précise de l'allergène (reste un mot-clé approximatif, inchangé).

## Composants DS concernés

Aucun nouveau composant — réutilisation de `ChipTag`, des classes `*-highlight--warning`/`--info` déjà
en place pour allergènes/astuces/écart panier sur les deux surfaces (carte `AgentConversation`, drawer
`RecipeAgentDrawer`).

## Questions ouvertes pour la phase de plan d'implémentation

- Contenu exact de `INGREDIENT_SUBSTITUTES` (couverture minimale : les ingrédients des 6 recettes
  existantes qui ont un substitut évident) — à trancher en écrivant les tests.
- Contenu détaillé de la recette vegan (temps, portions, avis, astuce, prix) — à rédiger en suivant le
  format des recettes existantes de `src/data/mock/recipes.ts`.
- Faut-il un chip dédié "Vegan ?" / "Débutant ?" dans `buildRecipeChips` (fiche recette), sourcé comme
  les autres depuis `recipe.reviews` — ou seulement une reconnaissance en texte libre pour cette passe ?
