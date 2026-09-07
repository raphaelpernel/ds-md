# Brief produit — Préférences alimentaires permanentes

## Statut

Validée par Raphaël pour l’architecture et le plan technique. Le périmètre décrit le lot 1 exploratoire, conçu Neutral-first dans Supermarket puis déclinable pour CoursesU.

## Problème

Les préférences existantes sont limitées, difficilement compréhensibles et ne distinguent pas les contraintes alimentaires, les goûts et la pratique en cuisine. Elles vivent surtout comme un réglage local, sans offrir à l’utilisateur une représentation durable et éditable de ce qui personnalise ses suggestions.

Un utilisateur qui souhaite obtenir des recettes et un Planner plus pertinents doit pouvoir exprimer ses contraintes, ses goûts et ses moyens de cuisine sans quitter son contexte, sans remplir un long questionnaire obligatoire et sans croire que l’application garantit la sécurité alimentaire.

## Utilisateurs et contexte

- Personne qui consulte le catalogue de recettes CoursesU ou Supermarket et souhaite recevoir des suggestions plus adaptées.
- Personne qui construit un menu dans le Planner et souhaite vérifier ou ajuster rapidement son profil permanent sans perdre son contexte.
- Utilisateur mobile prioritaire ; le prototype Figma de référence est le nœud `4745:37989` du fichier Catalog.

## Objectif du lot 1

Créer un profil alimentaire permanent, enrichissable progressivement, qui personnalise les suggestions de recettes et le Planner.

Le profil doit :

- rester distinct des envies temporaires de la semaine ;
- permettre l’accès depuis le Compte et rapidement depuis le catalogue ;
- conserver la consultation du catalogue ;
- rendre visible et éditable le profil sans surcharger les recipe cards ;
- limiter les promesses autour des allergies et restrictions.

## Périmètre fonctionnel

### Données

- Convives par défaut.
- Régimes.
- Allergies et restrictions à signaler.
- Ingrédients à éviter.
- Cuisines appréciées.
- Temps pour cuisiner.
- Équipements disponibles.

### Parcours

- Invitation unique et non bloquante lors de la première arrivée dans le catalogue après déploiement.
- L’invitation utilise le composant Modal existant du design system : elle reprend le principe d’un choix primaire `Personnaliser mon profil` et secondaire `Je le ferai plus tard`, sans reprendre la direction artistique Chronodrive/Jow.
- CTA `Préférences` maintenu comme accès volontaire depuis le catalogue.
- Ouverture dans un drawer si l’utilisateur accepte l’invitation ou actionne le CTA, sans quitter le catalogue.
- Niveau 0 : même récapitulatif que dans le profil du Compte.
- Niveau 1 : édition d’une section depuis une carte ou son CTA `Modifier`, avec action Retour explicite.
- Enregistrement des vues complexes puis retour au récapitulatif avec confirmation brève.
- Nouvelle page de profil Neutral dans Supermarket, basée sur le second écran de la section Preferences Figma ; elle est atteignable en cliquant sur `Joe` dans le StoreHeader. CoursesU pourra la positionner autrement.

## Contraintes produit

- Supermarket est le socle Neutral-first interne ; CoursesU est une déclinaison de marque, non une cible de lancement indépendante.
- Allergies/restrictions, régimes et goûts sont des objets distincts.
- Une recette explicitement incompatible avec un régime déclaré est exclue du Planner et seulement dépriorisée dans le catalogue ; le catalogue reste intégralement consultable.
- L’absence de renseignement est distincte d’une déclaration explicite d’absence de contrainte.
- Les ingrédients évités sont des signaux de dépriorisation, pas des exclusions automatiques.
- Les équipements non renseignés ou absents du profil n'ont aucun effet sur la disponibilité ni le classement des recettes dans ce lot.
- Les données CoursesU peuvent informer des suggestions d’ingrédients fréquents de manière agrégée ; elles ne doivent jamais inférer un goût individuel.
- Aucun badge de personnalisation sur les recipe cards.
- La section Preferences du Figma Catalog est la référence visuelle d’intégration ; les composants et tokens du design system restent la référence de construction.

## Mesure de succès

Comparer l’adoption qualifiée du profil et l’évolution des consultations de recettes / ajouts au Planner à une baseline ou un groupe non personnalisé.

Une adoption qualifiée signifie qu’au moins une préférence exploitable a été explicitement enregistrée, sans considérer le simple affichage du drawer comme une complétion.

## Dépendances et risques

- La formulation finale et le niveau de promesse pour allergies/restrictions nécessitent une validation juridique.
- Le prototype happy path doit être complété et testé pour vérifier la compréhension de l’invitation, de l’absence de badge et de l’exclusion conditionnelle.
- La persistance, le moteur de recommandations, la normalisation d’ingrédients et les contraintes d’architecture sont à instruire par Héphaïstos.
- Aucune diffusion externe n’est prévue dans ce lot ; une démonstration client éventuelle reste conditionnée aux informations et validations obtenues au fil des itérations.