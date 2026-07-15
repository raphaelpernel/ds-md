# Mealz Planner — Onboarding automatique de première visite

> Distinct de la modale d'aide accessible via le CTA "?" (cf. `05-aide-comment-faire-un-menu.md`). Cet onboarding se déclenche automatiquement, sans action de l'utilisateur, lors de sa toute première visite.

## Étape 1 — Modale de bienvenue

À la toute première arrivée sur l'écran "Mon menu", une modale de bienvenue s'affiche : **"Bienvenue dans votre première sélection du moment"** — *"Découvrez le menu de la semaine que nous avons composé pour vous."*

Deux CTA :
- **"Passer le guide"** → ferme l'onboarding immédiatement, sans passer par le tour guidé
- **"Commencer"** → lance le tour guidé (étape suivante)

## Étape 2 — Tour guidé (4 étapes)

Si l'utilisateur clique sur "Commencer", un tour guidé en **4 étapes** s'affiche, avec à chaque étape une zone de l'écran réel mise en évidence (entourée/surlignée) et une bulle explicative :

1. **"Retrouvez votre menu ici"** — *"Les recettes qui composent votre menu sont visibles ici."* (met en évidence la section "Menu en cours")
2. **"Envie de compléter votre menu ?"** — *"Visualisez nos propositions de recette rien que pour vous ici. Cliquez dessus pour en voir les détails."* (met en évidence la section "Suggestions")
3. **"Une recette vous plaît ?"** — *"Ajoutez-la en 1 clic à votre menu grâce au bouton 'Ajouter au menu', ou cliquez sur 'Passer' pour découvrir une nouvelle suggestion."* (met en évidence les CTA "Ajouter au menu" / "Passer")
4. **"Votre menu est terminé ?"** — *"Utiliser le bouton 'Mettre le menu au panier' pour mettre les produits de toutes les recettes dans votre panier."* (met en évidence le CTA "Mettre le menu au panier") — dernière étape, se termine par le CTA **"J'ai compris"**

Navigation : CTA **"Suivant"** entre les étapes, indicateur de progression (ex. "2/4"). L'utilisateur peut **quitter à tout moment** via le CTA **"X"**.

## Étape 3 — Onboarding "Personnalisation de recette" (fiche recette)

Lors de la **première ouverture du Drawer "Détail de la recette"**, un second onboarding, séparé, s'affiche par-dessus le contenu : **"Personnalisez votre recette"** — *"Vous avez déjà certains produits ? Désélectionnez-les pour qu'ils ne soient pas ajoutés à votre panier. Les produits sélectionnés seront eux ajoutés automatiquement au panier."* — CTA unique **"J'ai compris"**.

> Note : les captures associées à cette étape ont aussi révélé que les ingrédients "déjà dans le placard" sont regroupés dans une section repliable dédiée — déjà reporté dans `03-parcours-detail-recette-planner.md`.
