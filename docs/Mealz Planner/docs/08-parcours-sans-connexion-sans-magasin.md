# Mealz Planner — Utilisation sans connexion et sans magasin sélectionné

> Confirmé pour **Courses U**. À ne pas généraliser sans vérification aux autres retailers : le gating store/connexion diffère déjà par ailleurs (cf. `ressources/contraintes-intermarche.md` — magasin obligatoire pour toute navigation chez Intermarché, contrairement au comportement décrit ici). La matrice générale magasin × connexion du SDK "Idées repas en 1 clic" est disponible en mémoire Claude (pas un fichier de ce projet) — la solliciter au besoin pour comparer avec d'autres retailers.

## Pourquoi c'est important

Le Mealz Planner est utilisable **sans compte connecté** et **sans magasin sélectionné**, quasiment dans son intégralité. Ça permet au retailer de communiquer sur le Planner (réseaux sociaux, campagnes) avec un lien direct : un utilisateur qui clique arrive sur une fonctionnalité presque entièrement utilisable, sans barrière de connexion ou de sélection de magasin en amont.

## Sans connexion

L'utilisateur peut composer entièrement son Menu (Suggestions, Catalogue, fiche recette) sans être connecté. Le blocage n'intervient qu'au moment de pousser au panier :

- Clic sur **"Mettre le menu au panier"** sans être connecté → la **modale de connexion Courses U** s'affiche
- Une fois connecté, le Menu est **automatiquement poussé au panier** (pas besoin de recliquer sur le CTA)

## Sans magasin sélectionné

L'utilisateur peut composer son Menu sans magasin sélectionné, avec certaines limitations d'affichage liées au prix (puisque le prix dépend du magasin) :

- Le **prix total du Menu** (footer de "Mon menu") **n'est pas affiché** tant qu'aucun magasin n'est sélectionné
- La **fiche recette** s'ouvre automatiquement sur l'onglet **"Je cuisine"** (pas "Je fais mes courses") en l'absence de magasin — puisque "Je fais mes courses" nécessite les produits du magasin
- Si l'utilisateur clique quand même sur l'onglet **"Je fais mes courses"** sans magasin : aucun produit n'est affiché, un CTA **"Sélectionner un magasin"** apparaît à la place. Au clic, l'utilisateur est redirigé vers la sélection de magasin ; une fois le magasin choisi, il est **automatiquement redirigé vers son "Menu en cours"**
- Le **prix par personne** de la fiche recette n'est pas affiché non plus sans magasin sélectionné

## Résultat d'un "Mettre le menu au panier" réussi

Documenté dans `02-parcours-current-menu.md` : loader illustré avec les recettes du Menu, transfert de tous les produits cochés au panier, vidage du Menu en cours, redirection vers le panier retailer.
