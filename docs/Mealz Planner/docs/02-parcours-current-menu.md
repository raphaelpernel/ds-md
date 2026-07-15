# Mealz Planner — Parcours "Mon menu" (vue current-menu)

> Écran atteint après le point d'entrée `planner-entry` (bandeau "Qu'est-ce qu'on mange cette semaine ?") et le chargement de la "Sélection du moment". Correspond à la route `/v2/planner/current-menu`.

---

## Entrée sur l'écran

Point d'entrée unique retenu : le composant `planner-entry` en variante "Sélection du moment" (la variante "Menu personnalisé" existe toujours dans le code mais n'est plus exposée en entrée — décision produit). Ce bandeau est identique que l'utilisateur ait déjà un menu personnalisé en cours ou non.

Nombre de convives par défaut au moment du lancement : valeur des Préférences utilisateur si disponible, sinon dernière valeur mémorisée par l'utilisateur, sinon 4. **Cas Courses U** : les Préférences sont masquées côté UI **du bandeau d'entrée** (partie "Idées repas en 1 clic") → en pratique, mémorisation ou 4 à cet endroit précis. Une fois dans le Planner, le CTA "Préférences" est actif et permet de modifier cette même donnée partagée — cf. `06-preferences-planner.md`.

Au clic sur "C'est parti !", un loader s'affiche pendant le chargement de la "Sélection du moment" : 6 recettes de type plat principal, curées par l'équipe Content Mealz, renouvelées toutes les deux semaines selon saison / coût / popularité.

---

## Écran "Mon menu" — Desktop

### Section gauche — "Suggestions"

Affiche une recette à la fois, proposée par l'IA Mealz. Règle de sélection complète : voir `regle-suggestion-recettes-planner.md`.

- CTA **"Ajouter au menu"** → ajoute la recette suggérée au Menu en cours (section droite)
- CTA **"Passer"** → rejette la proposition, l'IA en propose immédiatement une nouvelle

### Section droite — "Menu en cours"

Affiche l'ensemble des recettes actuellement dans le menu : celles de la "Sélection du moment" initiale + celles ajoutées manuellement depuis "Suggestions" ou le catalogue.

- CTA **"X"** (coin haut-droit de chaque carte recette) → retire la recette du Menu
- CTA **"Choisir dans nos recettes"** → accès au Catalogue des recettes (détail ci-dessous)
- CTA **"Vider le menu"** → retire toutes les recettes du Menu en cours (le Menu lui-même n'est pas supprimé, seulement son contenu — équivalent à cliquer "X" sur chaque recette une par une)

### Bas de vue (zone d'action, sous le contenu — pas un footer de page)

- CTA **"Définir un budget"** → ouvre une modale de saisie d'un budget (optionnel). Une fois défini, une jauge budget apparaît pour suivre le coût du menu au fur et à mesure de sa construction.
- Prix total du Menu en cours, affiché en continu
- CTA **"Mettre le menu au panier"** → transfert en un clic de l'ensemble des recettes du menu vers le panier retailer, et donc de l'ensemble des **produits** correspondant aux **ingrédients** des recettes (cf. distinction ingrédient / produit, `ressources/product-context.md`). Sans connexion, ce CTA déclenche la modale de connexion Courses U avant de pousser le menu — cf. `08-parcours-sans-connexion-sans-magasin.md`. Le prix total ci-dessus n'est pas affiché sans magasin sélectionné (même référence).
  - **Grisé et non cliquable** si le Menu en cours ne contient aucune recette (0 repas)
  - Au clic : un **loader** s'affiche, illustré avec l'ensemble des recettes qui composent le Menu (composant `to-basket-loader`, cf. `04-architecture-technique.md`)
  - Résultat : toutes les recettes sont poussées au panier, avec l'intégralité des **produits cochés** de chacune (cf. logique de coche/décoche par recette, `03-parcours-detail-recette-planner.md`)
  - Le **Menu en cours se vide** après le push
  - L'utilisateur est **redirigé vers le panier retailer**

---

---

## Écran "Mon menu" — Mobile / WebMobile

Contrairement au desktop (vue scindée Suggestions / Menu en cours affichées côte à côte), le mobile fonctionne en **deux vues plein écran distinctes**, basculées via CTA :

- Après le loader, l'utilisateur arrive **directement sur la vue "Suggestions"** (recette suggérée en grand, CTA "Ajouter au menu" / "Passer" — identique au desktop dans le comportement).
- En bas de cette vue "Suggestions", un bandeau **"Quick Menu"** affiche en miniature les recettes actuellement dans le Menu en cours ("Ma sélection : N repas"), avec une tuile "+" et un CTA **"Voir le menu"** pour basculer vers la vue complète.
- La vue **"Menu en cours"** (atteinte via "Voir le menu") reprend les mêmes éléments que le desktop : grille de recettes avec retrait via "X", tuile "Choisir dans nos recettes", CTA "Définir un budget", prix total, CTA "Mettre le menu au panier". Un CTA **"Suggestions"** en haut permet de revenir à la vue Suggestions.

Il n'y a donc pas de vue "les deux sections visibles en même temps" sur mobile : c'est un des deux écrans à la fois, avec le Quick Menu comme lien de transition.

---

## Catalogue des recettes

Accessible via le CTA "Choisir dans nos recettes", s'ouvre dans un **Drawer** ("Ajouter une recette").

- Contient l'ensemble des recettes du catalogue **partagé avec le retailer** : recettes Mealz et recettes propres au retailer (ex. recettes Courses U)
- **Barre de recherche** (ingrédient ou recette)
- **Sections de navigation** : "Tout", "Plats", "Entrées", "Desserts", "Boissons"
- **Ordre de présentation** : les recettes les plus populaires auprès des utilisateurs et avec un prix ≤ 6€/pers sont affichées en tête (même logique de priorisation popularité/coût que la règle de suggestion, cf. `regle-suggestion-recettes-planner.md`, à confirmer s'il s'agit exactement du même algorithme ou d'un tri similaire mais distinct)
- Chaque carte recette affiche : visuel, titre, nombre de convives par défaut, prix/pers., CTA d'ajout au menu

---

## Principe du Menu unique

Un utilisateur ne peut avoir qu'**un seul Menu en cours à la fois**. Tant que ce Menu n'a pas été poussé au panier (via "Mettre le menu au panier"), il est impossible d'en démarrer un second en parallèle.

**Déclencheur unique :** si l'utilisateur reclique sur "C'est parti !" depuis le bandeau d'entrée alors qu'il a déjà un Menu en cours, une modale **"Menu déjà en cours"** apparaît : *"Vous avez déjà un menu en cours de planification. Souhaitez-vous le conserver ou le remplacer par les recettes de notre 'Sélection du moment' ?"*. Ce cas ne se déclenche que via ce bouton — naviguer directement vers `/planner` ou `/planner/current-menu` n'affiche jamais cette modale.

- CTA **"Conserver mon menu"** → ferme simplement la modale ; l'utilisateur revient sur son écran "Mon menu" actuel, sans aucun changement.
- CTA **"Remplacer mon menu"** → remplace le contenu du Menu en cours par les recettes de la "Sélection du moment" actuelle.

À distinguer du CTA **"Vider le menu"** (cf. section "Menu en cours" ci-dessus), qui retire manuellement toutes les recettes sans passer par cette modale ni recharger la "Sélection du moment".

---

## Non couvert pour l'instant

- Ce qu'il se passe **après** le clic sur "Mettre le menu au panier" (redirection, confirmation, état du panier retailer...)
- Comportement du CTA "?" et de l'onboarding sur mobile (probablement lié à la webview `/planner/help`, à confirmer)
