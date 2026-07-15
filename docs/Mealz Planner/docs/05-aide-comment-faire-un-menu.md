# Mealz Planner — Modale d'aide "Comment faire un menu ?" (CTA "?")

> Accessible via le CTA **"?"** en haut à droite de l'écran "Mon menu". Distinct de l'onboarding automatique de première visite (cf. rappel en attente, non couvert ici).

## Fonctionnement

Modale à 7 étapes, navigable via **"Précédent" / "Suivant"** (indicateur de progression en pointillés), qui se termine par un CTA **"J'ai compris"**.

## ⚠️ Contenu obsolète — à corriger avant réutilisation

L'**étape 1** décrit encore l'ancien parcours à deux choix d'entrée ("Nous vous proposons : la sélection du moment" vs "C'est vous le chef : la sélection personnalisée"). Ce choix n'existe plus : un seul point d'entrée a été retenu en pratique (`planner-entry` variante "Sélection du moment", cf. `02-parcours-current-menu.md`). **Ne pas reprendre ce contenu tel quel dans un ticket** — il doit être mis à jour pour refléter le parcours actuel à entrée unique.

## Contenu des 7 étapes (état actuel, avant correction)

1. **"Choisissez votre type de menu"** *(obsolète, cf. ci-dessus)* — "Découvrez notre sélection du moment pour gagner du temps ou créez une sélection personnalisée adaptée à vos goûts et à votre budget."
2. **"Envie de compléter votre menu ?"** — "Visualisez nos propositions de recette rien que pour vous ici. Cliquez dessus pour en voir les détails."
3. **"Retrouvez votre menu"** — "Toutes les recettes que vous sélectionnerez et l'accès au catalogue de recettes seront visibles ici."
4. **"Une recette vous plaît ?"** — "Ajoutez-la en 1 clic à votre menu grâce au bouton 'Ajouter au menu'."
5. **"Une recette ne vous plaît pas ?"** — "Cliquez sur 'Passer' pour découvrir une nouvelle suggestion, ou sélectionnez la recette de votre choix en explorant notre catalogue."
6. **"Personnalisez votre recette"** — "Vous avez déjà certains produits ? Désélectionnez-les pour qu'ils ne soient pas ajoutés à votre panier. Les produits sélectionnés seront eux ajoutés automatiquement au panier." (correspond à l'onglet "Je fais mes courses" documenté dans `03-parcours-detail-recette-planner.md`)
7. **"Votre menu est terminé ?"** — "Quand votre menu sera terminé, utilisez le bouton 'Mettre le menu au panier' pour mettre les produits de toutes les recettes dans votre panier." *(dernière étape, CTA "J'ai compris")*

## Relation avec l'onboarding de première visite

Confirmé par Raziel : cette modale d'aide **n'est pas** l'onboarding automatique de première visite. Il existe un onboarding "automatique" distinct qui guide l'utilisateur lors de sa toute première utilisation du Planner — reste à documenter (cf. rappel en attente).
