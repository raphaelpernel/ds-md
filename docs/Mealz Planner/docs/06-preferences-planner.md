# Mealz Planner — CTA "Préférences"

## Relation avec les Préférences "Idées repas en 1 clic"

**Donnée partagée, pas distincte.** Les Préférences du Mealz Planner sont exactement les mêmes que celles du parcours "Idées repas en 1 clic" — même ressource utilisateur. Si l'utilisateur a renseigné 3 convives dans les Préférences d'"Idées repas en 1 clic", ce sera 3 convives dans les Préférences du Planner, et inversement.

**Nuance d'affichage (Courses U) :** les Préférences sont actuellement **masquées côté UI dans "Idées repas en 1 clic"**, mais **actives et accessibles dans le Mealz Planner** via le CTA dédié. Cela ne change rien à la donnée partagée : un réglage fait dans le Planner s'applique aussi à "Idées repas en 1 clic", même si ce dernier ne montre pas l'UI pour le modifier chez Courses U.

## Présentation UI

Les Préférences s'ouvrent dans un **Drawer** (comme la fiche recette, la vue "Remplacer" et le Catalogue de recettes).

## Contenu du Drawer "Mes préférences"

- **Nombre de personnes** (stepper -/+)
- **"Avez-vous un régime particulier ?"** — cases à cocher : Sans gluten, Sans lactose, Vegan, Végétarien
- **"Je n'aime pas"** — tags d'ingrédients non appréciés. Saisie **contrainte par autocomplétion** : l'utilisateur ne peut pas taper une valeur libre (ex. "toto"), il doit sélectionner parmi les termes déjà référencés dans le back Mealz (recherche déclenche une liste de suggestions correspondantes, ex. "Ri" → Riz, ricotta, rillette, riz).
- **"Équipements"** — cases à cocher (cochées par défaut) : Barbecue, Croque-monsieur, Four, Friteuse, Mixeur, Plaque de cuisson, "sans cuisson"

CTA en bas de Drawer : **"Réinitialiser"** / **"Appliquer"**.

## Impact sur les recommandations — règle confirmée

Les trois catégories de Préférences ci-dessous constituent des **filtres obligatoires (exclusion stricte)**, appliqués à la fois dans la section **"Suggestions"** et dans le **Catalogue de recettes** :

- **Régime particulier** : une recette non compatible avec le régime coché n'est jamais proposée
- **"Je n'aime pas"** : toute recette contenant un ingrédient marqué comme non apprécié est totalement exclue
- **Équipements** : une recette nécessitant un équipement non coché n'est jamais proposée

> Ces trois filtres s'ajoutent à ceux déjà documentés dans `regle-suggestion-recettes-planner.md` (statut Publiée, tag Plat principal, ingrédients primordiaux disponibles). Voir ce fichier pour la liste consolidée.

## Indicateur visuel

Une fois au moins une Préférence appliquée, un **badge compteur** apparaît sur le CTA "Préférences" (ex. "Préférences 1") pour signaler à l'utilisateur que son réglage est bien pris en compte.
