# Mealz Planner — Détail de la recette

> Fiche recette accessible depuis 3 points d'entrée : une carte de la section "Suggestions", une carte du "Menu en cours", ou une recette du Catalogue.

---

## Présentation UI

La fiche recette s'ouvre dans un **Drawer** (panneau latéral), pas en plein écran ni en modale centrée. La vue "Remplacer" (cf. plus bas) s'ouvre également dans un Drawer.

## Contenu de la fiche

- Visuel de la recette
- Nombre de convives **modifiable**, avec stepper (-/+)
- Tags : temps de préparation, temps de cuisson, difficulté — CTA "..." pour révéler des tags additionnels (ex. "Charcuterie", "Plat")
- Segmented control à deux entrées : **"Je fais mes courses"** (ouvert par défaut) / **"Je cuisine"**

## Convives — portée de la modification

Modifier le nombre de convives depuis cette fiche **ne s'applique qu'à cette recette précise**, pas à l'ensemble du Menu. Exemple : un Menu construit pour 2 personnes reste à 2 convives sur toutes les recettes, sauf celle où l'utilisateur a explicitement changé le nombre de convives (ex. passé à 4 pour une recette prévue à plus de monde). Les autres recettes du Menu ne sont pas impactées.

## Segmented control — comparaison avec "Idées repas en 1 clic"

Le segmented control lui-même existe dans les deux parcours (Planner et "Idées repas en 1 clic"), mais le comportement diffère :

| | Mealz Planner | Idées repas en 1 clic |
|---|---|---|
| Onglet "Je cuisine" | Identique | Identique |
| Onglet "Je fais mes courses" | **Coche / décoche** un produit : détermine s'il sera inclus au moment de "Mettre le menu au panier" (aucune action panier immédiate) | **CTA d'ajout au panier / ignorer** le produit (action différente, à documenter séparément si besoin dans le contexte "Idées repas en 1 clic") |

### Onglet "Je fais mes courses" (Planner)

- Affiche les **produits** correspondant aux **ingrédients** de la recette (cf. distinction ingrédient / produit, `ressources/product-context.md`)
- Tous les produits sont **cochés par défaut**, à l'exception des **ingrédients "déjà dans le placard"** (ex. sel, poivre), affichés en état **"ignoré"**. Cette liste est **fixe, définie par Mealz** (pas une préférence utilisateur).
- Ces ingrédients "déjà dans le placard" ne sont pas simplement décochés au milieu des autres : ils sont regroupés dans une **section repliable dédiée "Déjà dans le placard"**, séparée de la liste principale des produits.
- L'utilisateur peut **décocher** un produit qu'il ne veut pas commander
- CTA **"Remplacer"** par produit → ouvre la vue "Remplacer" (dans un Drawer, cf. "Présentation UI" ci-dessus) :
  - Liste d'autres produits disponibles pour l'ingrédient concerné, sélectionnés selon la `règle de renvoi des produits` déjà documentée (`ressources/regle-renvoi-produits.md`)
  - Barre de recherche permettant de substituer par un produit totalement différent (ex. remplacer l'ingrédient "tomate" par "carotte")
- **Règle importante :** rien n'est ajouté au panier retailer tant que l'utilisateur n'a pas cliqué sur "Mettre le menu au panier" depuis la vue "Mon menu". L'état coché/décoché ici ne fait que déterminer ce qui sera poussé à ce moment-là.

### Onglet "Je cuisine"

- Affiche les **ingrédients** de la recette (pas les produits) et les **étapes de réalisation**
- Comportement identique entre Planner et "Idées repas en 1 clic"

## Footer de la fiche

- **Prix par personne** = prix total des produits **cochés/sélectionnés** ÷ nombre de convives de la recette
- CTA **"Ajouter au menu"** — devient **"Retirer du Menu"** si la recette est déjà présente dans le Menu en cours

## Cas sans magasin sélectionné

- La fiche s'ouvre automatiquement sur l'onglet **"Je cuisine"** (pas "Je fais mes courses"), puisque ce dernier nécessite les produits du magasin
- Si l'utilisateur clique quand même sur "Je fais mes courses" : pas de produits affichés, un CTA **"Sélectionner un magasin"** apparaît à la place et redirige vers la sélection de magasin (retour automatique sur le Menu en cours une fois le magasin choisi)
- Le **prix par personne** n'est pas affiché

Détail complet : `08-parcours-sans-connexion-sans-magasin.md`
