# Brief projet — Marmiton Agentique

UNE EXPÉRIENCE DE CUISINE ET DE COURSES PILOTÉE PAR UN AGENT IA

**Mealz.ai × Marmiton** · Livrable attendu : wireframe d'une expérience Marmiton agentique

> Ce document décrit **un problème à résoudre, pas une solution arrêtée**. Les parcours sont des intentions à couvrir ; le choix des écrans relève du sprint. Les constats viennent d'une revue de l'app en conditions réelles (mobile, juillet 2026).

---

## [ 01 ] LE PROJET

Marmiton est la première marque culinaire francophone : ~70 000 recettes, une communauté massive, une audience que personne ne peut acheter.

Mealz opère le **SmartCart Assistant** : un agent conversationnel qui transforme une conversation culinaire en panier e-commerce validé, connecté aux APIs des distributeurs. Déployé sur Carrefour Belgique, en cours sur Coopérative U.

**L'opportunité : brancher l'un sur l'autre.** Marmiton apporte le contenu, la communauté, l'audience. Mealz apporte l'agent, la contextualisation produit et la connexion au panier.

> **La thèse :** transformer Marmiton d'un **moteur de recherche de recettes** en un **agent culinaire** — qui comprend un contexte de vie, recommande avec l'intelligence de sa communauté, accompagne jusqu'à la cuisine, et propose les courses quand c'est le bon moment.

---

## [ 02 ] LE PROBLÈME

Le sujet n'est pas le manque de recettes. **C'est leur abondance.**

Un utilisateur qui arrive un mardi soir à 18h30 ne cherche pas « une recette ». Il cherche une réponse à *« qu'est-ce que je fais à manger ce soir, avec ce que j'ai, dans le temps que j'ai, pour les gens qui seront là ? »*. Le seul outil à sa disposition est la recherche.

> Recherche « poulet » dans l'app → **4 837 recettes trouvées**, triées par *Pertinence*.

Aucune de ces 4 837 recettes n'est mauvaise. Le problème n'est pas la qualité du résultat : **la charge du tri est intégralement transférée à l'utilisateur**, au moment précis où il a le moins de disponibilité mentale pour l'assumer. Ce qu'il voudrait dire, c'est *« j'ai du poulet, 25 minutes, et un enfant qui ne mange pas de sauce »*. Il n'a pas d'endroit pour le dire — il a une barre de recherche.

Côté business : Marmiton est un des rares endroits du web où un foyer décide réellement de ce qu'il va manger — donc de ce qu'il va acheter. Cette intention est aujourd'hui peu capitalisée en aval. Or les modèles Retail Media des deux maisons se croisent naturellement : Marmiton monétise déjà l'intention côté média — jusque dans la liste d'ingrédients, où un produit de marque apparaît déjà, identifié et illustré. Mealz sait transformer ce même produit en référence disponible, au bon prix, dans un panier réel. Même actif, deux étapes de la chaîne.

---

## [ 03 ] CE QUI EXISTE DÉJÀ

**Constat central : Marmiton a déjà construit la quasi-totalité des composants d'une expérience agentique. Ce qui manque, c'est le liant.**

| Brique en production | Aujourd'hui | Dans l'agent |
|---|---|---|
| Mode découverte / personnalisé | Un toggle en tête de home | L'aveu que deux intentions coexistent — et que l'app fait choisir l'utilisateur |
| Mes préférences | Un formulaire à remplir, souvent vide | Ce que la conversation collecte sans le demander |
| Carnet / Favoris | Une bibliothèque manuelle | La mémoire de l'agent |
| Localisation | Opt-in pour les spécialités régionales | Le point d'ancrage magasin / drive |
| La semaine Marmiton | Calendrier éditorial, identique pour tous | Le squelette d'un menu personnel — l'entrée du Mealz Planner |
| Pour compléter le repas | Reco éditoriale entrée/dessert | La composition de repas, contextualisée |
| Sélecteur de portions | Un recalcul de quantités | Le dimensionnement du panier |
| Tuiles ingrédients illustrées | Un visuel, parfois un lien | Le produit référencé, disponible, commandable |
| Commencer la recette | Un mode cuisine déjà fonctionnel | Le parcours E — à brancher, pas à créer |
| Commentaires & photos | 61 avis / recette, signal noyé | La matière première de la recommandation |

Deux conséquences pour le sprint :

1. Le projet **n'ajoute pas des fonctionnalités manquantes** — il connecte des briques existantes et remplace le formulaire par la conversation. Une refonte du liant, pas un empilement.
2. Le besoin de personnalisation est déjà identifié par Marmiton. Ils l'ont résolu avec le seul outil disponible avant les LLM : un formulaire. *« Vous n'avez pas encore renseigné les aliments que vous n'aimez pas »* est une question qu'on ne devrait jamais avoir à poser.

---

## [ 04 ] CE QU'APPORTE LE SMARTCART

Ce que la brique Mealz sait déjà faire — à ne pas réinventer :

- **Conversation → panier validé** en un échange, avec les bonnes quantités
- **Matching ingrédient → produit référencé** chez le distributeur *(l'actif technique central, 7 ans de R&D)*
- **Contextualisation** : stock, prix, promotions, distribution par enseigne
- **Mealz Planner intégré** : planification multi-repas, consolidation et dédoublonnage du panier
- **Connexion panier / drive / créneau de livraison** via les APIs distributeur
- **Marque blanche (SDK)** ou connecteur MCP sur LLM grand public
- **Retail Media contextualisé** dans le parcours

*Mealz est à ce jour la seule société en Europe capable de connecter un agent IA à un panier de courses en ligne.*

---

## [ 05 ] PRINCIPES DIRECTEURS

Règles non négociables. Tout le reste est ouvert.

1. **L'agent remplace la recherche et le formulaire — il ne s'ajoute pas à côté.** Ni une bulle en bas à droite, ni un quatrième onglet. L'agent n'est pas un endroit où l'on va : c'est ce qui porte le parcours.
2. **La conversation part de la vie réelle, pas de la recette.** « Poulet » est un point d'entrée valide, mais l'agent rebondit — il ne rend pas 4 837 résultats.
3. **La communauté est un actif à extraire, pas à afficher.** Sur 61 commentaires, trois sont utiles. Les empiler en bas de page ne sert personne ; en extraire le signal au moment de la décision, c'est ce qu'un LLM fait bien et qu'un humain ne fera jamais à 18h30. **C'est là que Marmiton devient inimitable.**
4. **L'inspiration prime.** La valeur se crée dès qu'on aide quelqu'un à trouver quoi cuisiner, indépendamment de tout achat.
5. **Les courses se proposent, ne s'imposent pas.** Une suggestion au bon moment, jamais un péage.
6. **Marmiton reste Marmiton.** Marque blanche : sa voix, son ton, sa marque. Le partenaire technique est invisible.
7. **La sortie est toujours possible.** On n'enferme pas dans une conversation qui veut juste lire une recette.
8. **Mobile-first.** Le canapé à 18h30, la cuisine à 19h15.

---

## [ 06 ] LES PARCOURS À COUVRIR

Des **intentions**, pas des specs d'écran.

**A · « Qu'est-ce qu'on mange ce soir ? »** — *parcours principal.* De l'intention floue à la décision : temps, convives, contraintes, ce qu'on a déjà. Puis, si le moment s'y prête, le panier des manquants et un créneau drive.

**B · « J'ai ça dans le frigo »** — Entrée par les ingrédients disponibles, force déjà reconnue de Marmiton, à réexploiter en conversationnel. Ce qui est faisable maintenant, et ce qui le devient avec 2-3 achats.

**C · « Je planifie ma semaine »** — La semaine Marmiton existe, mais c'est un calendrier éditorial : même recette pour tous, non personnalisée, non commandable. Le Mealz Planner couvre déjà la planification personnelle. L'enjeu : comment la promesse éditoriale et la planification personnalisée s'articulent dans un même objet.

**D · « Je connais déjà ma recette »** — *parcours à fort volume.* Arrivée par Google sur une page recette. C'est le trafic dominant. La page est déjà riche. Comment l'agent se propose sans agresser ? Comment enrichit-il une lecture déjà satisfaisante — substitutions, astuces extraites des avis, portions, puis les manquants ? **Le plus important en volume, le plus délicat en UX.**

**E · « Je cuisine, là, maintenant »** — Le mode cuisine existe. Le rendre vivant : *« je n'ai pas de crème fraîche, je fais quoi ? »*. Et résoudre les contradictions du contenu. *Exemple réel : une recette annonce 25 min et un repos vide, alors que son étape 1 demande une heure au réfrigérateur. Un agent qui lit les étapes attrape ça. Un filtre « moins de 30 min » jamais.*

**F · Retour et boucle** — Notation, carnet, apprentissage. Ce qui rend l'agent meilleur la fois suivante — et ce qui remplit « Mes préférences » sans jamais ouvrir un formulaire.

---

## [ 07 ] LE LIVRABLE

**Un wireframe** — fidélité basse à moyenne : structure et flux avant esthétique.

**Doit couvrir**
- Parcours A de bout en bout
- Parcours D (entrée Google)
- **Comment l'agent se manifeste dans une navigation qui compte trois onglets** (Accueil, Rechercher, Favoris) — sachant qu'un quatrième est exclu
- L'état « panier constitué » avec substitutions et indisponibilités
- Au moins un cas dégradé (rupture, aucune recette ne correspond, agent qui ne comprend pas)

**Doit montrer**
- Comment le signal utile est extrait des commentaires et restitué au moment de la décision
- Comment les courses se proposent sans rompre l'inspiration
- Comment le produit de marque déjà présent dans les ingrédients devient commandable
- Ce que deviennent les briques de la section 03 : absorbées ou maintenues

**Hors scope** — design final et charte · spécification technique des APIs et modèle de données · parcours d'authentification distributeur *(à identifier comme dépendance, pas à concevoir)*

---

## [ 08 ] CONTRAINTES ISSUES DU RÉEL

Elles déterminent ce que le wireframe doit savoir gérer.

- **Les quantités sont souvent imprécises ou absentes.** Une même liste contient *« 3 escalopes de poulet »*, *« 4 tranches de bacon »*, *« ail » sans quantité*, *« 1 roquette » sans unité*. C'est le cœur du matching Mealz — mais l'UX doit assumer l'incertitude résiduelle plutôt que la masquer. **Un panier faussement précis est pire qu'un panier qui demande confirmation.**
- **Le contenu peut se contredire** (temps annoncé vs. temps réel). L'agent doit être plus fiable que les métadonnées.
- **Les photos communautaires sont de qualité inégale.** Ne pas bâtir un parcours qui en dépend.
- **La navigation compte trois onglets.** Toute proposition remplace ou absorbe — en ajouter un quatrième est exclu.

---

## [ 09 ] MODÈLE ÉCONOMIQUE

1. **Retail Media** — le point de rencontre des deux modèles : Marmiton monétise l'intention, Mealz la transforme en produit commandable. *Le produit de marque est déjà dans la recette ; il lui manque le panier.*
2. **Commission distributeur** — sur le panier converti.
3. **Valeur d'audience accrue** — un parcours qui va jusqu'à l'acte enrichit la donnée d'intention et la qualité de l'inventaire média.

---

## [ 10 ] BON LIVRABLE / MAUVAIS LIVRABLE

### RATÉ

- **Un chatbot greffé.** Une bulle « Besoin d'aide ? » en bas à droite. Le réflexe par défaut, l'échec par défaut.
- **Un formulaire déguisé en conversation.** Trois questions à choix multiples puis une liste. C'est un filtre avec une police plus ronde — et c'est déjà ce que fait l'écran de préférences.
- **Une couche de plus.** Un mode à côté de Découverte et Personnalisé, qui laisse encore l'utilisateur choisir où aller.
- **Une expérience générique.** Sans le catalogue ni le corpus communautaire, on reproduit ce qui existe ailleurs — sans les atouts qui rendent Marmiton unique.
- **Un tunnel sans issue.** L'utilisateur qui veut juste lire une recette et doit parler à un agent.
- **Un parcours qui pousse aux courses aux forceps.** Un agent qui ramène tout au panier trahit sa promesse.
- **Un parcours qui ignore l'entrée par Google.** Concevoir pour la home, c'est concevoir pour une minorité.

### BON

- On voit **précisément où l'IA change la donne** face à une recherche bien filtrée. Si *Filtrer + Trier par pertinence* suffirait, ce n'est pas un projet agentique.
- On comprend **en regardant le wireframe** pourquoi c'est Marmiton qui peut faire ça : le corpus communautaire et la profondeur du catalogue sont visiblement à l'œuvre.
- **Les briques existantes sont absorbées, pas doublonnées.** On ne demande plus ses préférences : on les apprend.
- Le chemin **« envie → décision »** tient en un nombre d'étapes qu'on compte sur une main.
- **Celui qui ne veut pas faire ses courses repart quand même content** — et celui qui veut les faire y arrive sans effort.
- **Les cas dégradés sont traités.** Le produit se juge sur la rupture de stock et l'ingrédient sans quantité, pas sur la démo.
- **Ça donne envie.** L'interlocuteur doit se projeter immédiatement.

---

## [ 11 ] QUESTIONS OUVERTES

Sans réponse arrêtée à ce stade. **Le sprint doit prendre position, quitte à se tromper — une position argumentée vaut mieux qu'un renvoi au commanditaire.**

1. **Le trafic dominant arrive par Google, sur une page recette. L'agent s'y déploie comment — et que devient la home ?** *La question la plus structurante du projet.* Le principe 1 tranche déjà le « où » : pas de quatrième onglet, l'agent porte le parcours au lieu de s'y ajouter. Reste le plus difficile : comment il se manifeste sur une page que l'utilisateur trouve déjà satisfaisante, et ce que devient la home quand elle n'est plus ni la porte d'entrée principale, ni le lieu de la recherche.
2. **La recherche disparaît, ou devient le fallback de l'agent ?** Elle ne peut pas cohabiter à parité — le principe 1 l'exclut. Reste à savoir si on la retire de la navigation, ou si elle subsiste comme filet quand l'agent ne comprend pas.
3. **Le formulaire de préférences : on le retire tout de suite, ou le temps que l'agent ait appris ?** Question de trajectoire, pas de principe — il a vocation à disparaître. Mais un agent sans historique ne sait rien d'un nouvel utilisateur. Que fait-on pendant ce temps-là ?
4. **Comment gère-t-on le choix de l'enseigne ?** Marmiton est agnostique : l'expérience ne peut pas être mono-distributeur. En début de parcours (friction immédiate) ou au panier (friction tardive mais réelle) ? *La demande de localisation existe déjà, pour un autre usage.*
5. **Que fait-on de l'utilisateur non connecté ?** L'écrasante majorité du trafic entrant — et donc le cas par défaut du parcours D, pas une exception à traiter à la fin.
6. **Comment l'agent cohabite-t-il avec la monétisation média existante ?** Un agent noyé dans les emplacements ne tient pas sa promesse ; couper la monétisation actuelle n'est pas réaliste. Il y a une voie entre les deux.

---

*MEALZ.AI × MARMITON · DOCUMENT DE TRAVAIL CONFIDENTIEL*
