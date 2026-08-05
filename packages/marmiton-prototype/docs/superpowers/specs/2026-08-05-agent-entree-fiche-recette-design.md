# Design — Point d'entrée agent sur la fiche recette (`/recipe`)

Contexte : parcours D du [Brief Marmiton Agentique](../../../marmiton-agent/docs/Brief%20projet%20—%20Marmiton%20Agentique.md) ("Je connais déjà ma recette", arrivée Google) — question ouverte #1 du brief, non tranchée à ce stade : *"comment l'agent se manifeste sur une page recette déjà satisfaisante"*. Discussion validée le 2026-08-05 via `superpowers:brainstorming`.

## Point de départ du problème

`app/(prototypes)/recipe/page.tsx` n'a aujourd'hui **aucun point d'entrée agent**. Une référence externe (proto jetable du CEO) proposait un footer avec CTA "discuter" pour ouvrir la vue conversationnelle. Ce pattern a été écarté : le **principe 1** du brief exclut explicitement *"une bulle en bas à droite"* comme anti-pattern (§10, "RATÉ" : *"Un chatbot greffé"*) — un footer CTA générique risque de reproduire ce pattern sans apporter de valeur visible avant le clic.

## Décisions

### 1. Un seul point d'entrée générique, pas de micro-points contextuels

Une seule affordance sur la page, capable de traiter tous les usages (substitution, astuce, portions, manquants), plutôt qu'une invite différente par section (ingrédients, avis...). Cohérent avec le principe 1 ("l'agent porte le parcours, il ne s'ajoute pas en morceaux") ; évite de fragmenter l'expérience en plusieurs mini-outils, ce que le brief exclut en §10 ("un formulaire déguisé en conversation").

### 2. Barre sticky pleine largeur, fixée en bas de viewport

Toujours atteignable, y compris quand l'utilisateur a scrollé jusqu'à la section Préparation. Traitement visuel : bandeau intégré au chrome de page (pleine largeur, fond plein, ancré comme un footer d'app) — **pas** une bulle circulaire flottante. C'est ce qui distingue ce pattern de l'anti-pattern "chatbot greffé" du principe 1 : le bandeau montre ouvertement son contenu (input + chips visibles) au lieu d'être une icône qu'il faut cliquer pour découvrir ce qu'elle fait.

Pas de conflit avec une navigation basse : `marmiton-prototype` n'utilise pas `BottomNav` sur cette page.

### 3. Contenu de la barre : input + pré-prompts visibles sans ouvrir le Drawer

- Un champ de saisie avec placeholder cadrant le rôle (ex. *"Substituer un ingrédient, ajuster les portions..."*).
- 2 à 3 chips cliquables à côté/en dessous, générées dynamiquement à partir des **tags distincts présents dans `recipe.reviews`** de la recette affichée (`enfant`, `sans-sauce`, `vegetarien`, `sans-gluten`, `sans-lactose`, `time` — champ déjà existant dans `src/data/types/recipe.ts`, pas de nouvelle donnée mock à créer). Copie canonique par tag (cohérente d'une recette à l'autre), mais présence conditionnée aux avis réels de *cette* recette — donc les chips varient naturellement d'une fiche à l'autre.
- Cette sourcing directe depuis le signal communautaire répond au principe 3 du brief ("la communauté est un actif à extraire, pas à afficher... c'est là que Marmiton devient inimitable") plutôt que d'inventer des suggestions génériques à côté.

Exemple de mapping tag → copie chip (à affiner en implémentation) :

| Tag `recipe.reviews` | Copie chip |
|---|---|
| `enfant` | "Adapté aux enfants ?" |
| `sans-sauce` | "Sans sauce ?" |
| `vegetarien` | "Une alternative végétarienne ?" |
| `sans-gluten` | "Sans gluten ?" |
| `sans-lactose` | "Sans lactose ?" |
| `time` | "Un moyen de gagner du temps ?" |

### 4. Interaction : ouverture du `Drawer` existant, pas un nouveau pattern d'overlay

Cliquer une chip, cliquer l'input, ou taper + valider — les trois ouvrent le même composant `Drawer` (DS) déjà utilisé sur cette page pour le panier (`placement="right"`, `mobilePlacement="bottom"`). Cohérence avec l'existant plutôt qu'un nouveau composant d'overlay :
- Clic sur une **chip** → Drawer ouvert, conversation déjà lancée, première réponse de l'agent déjà affichée (pas de temps mort pour re-saisir ce qui est déjà écrit sur la chip).
- Clic sur l'**input vide** ou saisie libre → Drawer ouvert sur l'écran de saisie, comportement identique à `AgentConversation` existant.

Une fois le Drawer ouvert (`mobilePlacement="bottom"` par défaut), il recouvre la barre sticky sur mobile — pas de conflit structurel à gérer entre les deux.

### 5. Contenu des réponses — moteur mono-recette, distinct du moteur multi-recette existant

Le moteur actuel (`src/lib/agentScript.ts`, fonction `buildRecipeSlate`) cherche *une recette* dans tout `MOCK_RECIPES` à partir de zéro (parcours A : "qu'est-ce qu'on mange"). Sur la fiche recette, l'utilisateur a déjà sa recette sous les yeux — la question n'est plus "laquelle ?" mais "est-ce que ça marche pour moi ?".

Contenu couvert (aligné §06.D du brief : substitutions, astuces extraites des avis, portions, puis manquants — **pas** la recette elle-même, déjà affichée en haut de page) :
- Correspondance à une contrainte exprimée / substitution
- Astuce anti-échec (`selectTip` — déjà existant)
- Écart panier (`pantryMatch` — déjà existant)
- Ajustement des portions

Implémentation : nouvelle fonction de traitement scopée à une seule recette (reçoit `Recipe` en paramètre, pas de recherche/score sur tout le catalogue), réutilisant `selectTip`, `pantryMatch`, `selectCommunityQuote` déjà présents dans `agentScript.ts` — pas de duplication de cette logique, seulement une nouvelle porte d'entrée qui saute l'étape de recherche multi-recette.

## Hors scope pour cette passe

- Le double CTA de la carte agent (déjà noté "à vérifier" dans `packages/marmiton-prototype/docs/BRIEF.md`, décision 3 du 2026-08-03) — non retouché ici.
- Personnalisation du ton/persona par partenaire (décision 4 du même document) — documentation seule, rien à construire.
- Tout ce qui touche `/agent` (parcours A, recherche multi-recette) — moteur et UI existants inchangés.
- Détection précise de l'allergène (le tag `allergie` reste un mot-clé approximatif, cf. `constraintApplies` dans `agentScript.ts`) — non traité par ce point d'entrée.

## Composants DS concernés (`design-system/docs/DESIGN.md` consulté)

- `Drawer` (`placement="right"`, `mobilePlacement="bottom"`) — réutilisation du pattern déjà en place sur cette page pour le panier.
- `ChipTag` pour les pré-prompts (cf. DESIGN.md §3 "Petites étiquettes" — tag/filtre, pas `Badge` qui est réservé aux compteurs numériques).
- Champ de saisie de la barre sticky : à confirmer en implémentation (`InputField` du DS vs. saisie custom légère, selon ce que la barre sticky doit porter comme validation/état).

## Questions ouvertes pour la phase de plan d'implémentation

- Faut-il, une fois le Drawer fermé, réinitialiser la conversation mono-recette, ou la garder en mémoire comme le fait déjà `AgentConversation` (le Drawer DS reste monté même fermé, cf. `Drawer.design.md` — "un formulaire interne garde son état entre deux ouvertures sauf reset explicite") ?
- Nombre maximal de chips à afficher si une recette a des avis sur plus de 3 tags distincts (troncature ? priorité ?).
- Comportement de la barre sticky quand le Drawer panier (existant) est ouvert en même temps — priorité d'affichage entre les deux Drawers si l'utilisateur ouvre l'un puis l'autre.
