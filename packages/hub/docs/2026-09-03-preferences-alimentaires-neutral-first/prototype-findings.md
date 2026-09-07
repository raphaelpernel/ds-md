# Préférences alimentaires permanentes — Neutral-first / CoursesU

Statut : prototype UX exploratoire pour revue avec Raphaël. Non validé par des utilisateurs. Aucun code de production.

## Résultat du prototype

**Hypothèse :** une invitation unique et non bloquante ouvre un drawer d’accès initial ; après entrée, le profil est une page récapitulative par sections. Les sections complexes disposent d’une vue dédiée ; les réglages courts sont contrôlables directement et autosauvegardés.

**Prototype exploré :**
- Desktop et mobile commutables dans le même fichier.
- Invitation initiale « Mes préférences alimentaires », avec choix « Plus tard » et rappel non récurrent simulé.
- Drawer d’accès initial présentant séparément « Allergies et restrictions », « Goûts et cuisines », « Pratique en cuisine » et « Convives par défaut », chaque entrée ouvrant sa vue de section vérifiable.
- Récapitulatif avec sections : foyer/convives, allergies et restrictions, ingrédients à éviter, goûts/cuisine, temps actif/équipements.
- Vue dédiée allergies/restrictions avec wording prudent, séparation visuelle, rappel de vérification des emballages et bouton explicite « Enregistrer » ; les sélections restent en brouillon tant que ce bouton n’est pas activé.
- Vue dédiée ingrédients à éviter : liste courte pré-sélectionnée, suggestions agrégées simulées, recherche et ajout à une liste.
- Vue dédiée « Pratique en cuisine » avec durées concrètes de temps actif (« ≤ 15 min », « 15–30 min », « 30–45 min », « Plus de 45 min ») et équipements disponibles.
- Vue réglage simple « Convives » : sélection directe et toaster d’autosauvegarde.
- Comparaison implicite des patterns : page récapitulative, drawer d’entrée et panneau/drawer de sélection de section.

## Comparatif de patterns

| Pattern | Atout | Risque | Recommandation de test |
|---|---|---|---|
| Page dédiée | Meilleure lisibilité et URL/repère stable pour le profil complet | Peut sembler plus lourd depuis un contexte Planner/catalogue | Compréhension de la hiérarchie et capacité à retrouver une section |
| Drawer | Entrée rapide, sans navigation sortante, adapté à l’invitation initiale | Surface limitée pour allergies et évitements complexes | Taux de démarrage et compréhension de ce qui sera sauvegardé |
| Panneau de section | Bon compromis pour un réglage court ; garde le récapitulatif visible | Peut multiplier les niveaux de fermeture/retour | Temps de modification et erreurs de contexte |

## Constats

- ✅ Le CTA « Mes préférences alimentaires » est explicite et cohérent avec une invitation unique.
- ✅ « Allergies et restrictions » est séparé de « Goûts et cuisine » dans le récapitulatif.
- ✅ Le wording prudent évite de promettre une sécurité : personnalisation uniquement, vérification des emballages toujours nécessaire.
- ✅ Les incompatibilités sont présentées comme des contraintes de suggestions ; aucune suppression de produit ni de recette n’est simulée.
- ✅ La liste d’ingrédients à éviter expose la source agrégée des suggestions et ne prétend pas inférer les goûts individuels.
- ✅ Le réglage court des convives montre une autosauvegarde et un retour toaster post-action.
- ⚠️ Le drawer d’entrée concentre plusieurs choix : il faut vérifier qu’il ne soit pas vécu comme un formulaire obligatoire.
- ⚠️ Sur mobile, allergies et évitements nécessitent vraisemblablement une vue dédiée ; les faire tenir dans le drawer réduit la lisibilité.
- ⚠️ « Allergies et restrictions » peut rester juridiquement ambigu ; la terminologie finale doit être revue avant toute spécification.
- ⚠️ L’invitation « Plus tard » ne doit pas créer une relance persistante non décidée.
- ❌ Aucun pattern n’est validé par des utilisateurs réels.

## Recommandation

- Adopter la page dédiée comme source de vérité et point de retour du profil.
- Utiliser le drawer uniquement pour l’entrée initiale et le choix de la première section, avec fermeture claire et option « Plus tard ».
- Utiliser des vues dédiées pour allergies/restrictions et ingrédients à éviter.
- Utiliser des contrôles directs autosauvegardés pour convives et autres réglages courts, avec toaster temporaire et accessible.
- Tester en priorité le toaster post-sauvegarde et la compréhension de la portée « suggestions/Planner, pas catalogue ».

## Hypothèses à tester auprès d’utilisateurs

1. Les utilisateurs comprennent-ils que le profil est permanent et distinct d’un contexte temporaire ?
2. Le CTA est-il découvert sans badge dans les recipe cards ni bannière persistante ?
3. « Plus tard » est-il perçu comme un choix légitime plutôt qu’un abandon ?
4. Le drawer permet-il de commencer sans donner l’impression d’un engagement obligatoire ?
5. Le rappel prudent sur les allergies est-il compris sans créer une fausse garantie ni une alarme disproportionnée ?
6. Les suggestions pré-sélectionnées d’ingrédients sont-elles comprises comme agrégées et modifiables ?
7. Un toaster suffit-il à confirmer l’autosauvegarde, notamment sur mobile ?

## Questions ouvertes

- Quelle formulation juridique exacte pour allergies/restrictions ?
- Combien de temps le toaster reste-t-il visible et comment est-il annoncé aux technologies d’assistance ?
- Le profil incomplet nécessite-t-il un état dans Compte, sans badge recette ni bannière persistante ?
- Quel mécanisme de normalisation et de confirmation utiliser pour un ingrédient recherché ?
- Faut-il afficher « incompatibilités » ou une formulation plus compréhensible côté utilisateur ?

## Limites et périmètre

Données fictives, interactions en mémoire, pas de persistance, pas de tracking, pas de test utilisateur réel. Lot 2 hors scope : « Adapter ma semaine », prompt libre et contexte temporaire. Aucun badge recette, aucune suppression automatique et aucune promesse de sécurité allergènes.

## Impact sur la spec

À reporter seulement après revue et décision : page récapitulative source de vérité, drawer d’entrée unique, vues dédiées pour sections complexes, autosauvegarde des réglages courts, wording prudent allergies/restrictions et comportement du toaster.
