# Spec — Profil alimentaire permanent

## Problem Statement

Les utilisateurs qui parcourent le catalogue ou préparent un menu ne disposent pas d’un profil alimentaire durable, compréhensible et directement éditable. Les réglages historiques confondent des informations de gravité différente, appliquent des exclusions trop agressives aux goûts et ne permettent pas de savoir clairement comment les suggestions et le Planner tiennent compte des préférences.

L’utilisateur doit pouvoir personnaliser durablement son expérience à partir de contraintes alimentaires, de goûts et de préférences pratiques, sans devoir compléter un formulaire obligatoire, sans perdre son contexte catalogue, et sans recevoir une promesse injustifiée de sécurité alimentaire.

## Solution

Mettre à disposition un profil alimentaire permanent conçu Neutral-first dans Supermarket et déclinable pour CoursesU. Le profil est une source de vérité accessible depuis le Compte, avec un accès direct depuis le catalogue dans un drawer.

Après une invitation unique et non bloquante lors de la première arrivée catalogue post-déploiement, l’utilisateur peut ouvrir le profil ou choisir `Plus tard`. Le CTA `Préférences` reste disponible ensuite. Le drawer montre un récapitulatif de niveau 0 ; les cartes ouvrent des vues de niveau 1 éditables, avec Retour explicite.

L’invitation est une Modal courte construite avec le composant existant du design system : une action primaire ouvre le drawer et une action secondaire reporte le remplissage. Elle s’inspire du mécanisme observé chez Chronodrive, mais ne réutilise ni sa direction artistique ni ses assets. Une page de profil Neutral est ajoutée dans Supermarket, basée sur le second écran de la section Preferences Figma ; elle est ouverte depuis l’action utilisateur `Joe` du StoreHeader et ne présume pas de l’emplacement futur chez CoursesU.

Le profil personnalise les suggestions et le Planner. Les allergies/restrictions sont traitées avec prudence, les ingrédients évités dépriorisent sans masquer, et les cuisines restent des signaux positifs. Les envies temporaires de semaine ne font pas partie de ce lot.

## User Stories

1. En tant que personne qui arrive pour la première fois dans le catalogue après le déploiement, je veux pouvoir découvrir le profil alimentaire sans être obligée de le remplir, afin de conserver le contrôle de mon parcours.
2. En tant que personne qui reporte l’invitation, je veux pouvoir continuer à consulter le catalogue sans relance répétée, afin que `Plus tard` soit un vrai choix.
3. En tant que personne qui souhaite personnaliser ses suggestions plus tard, je veux retrouver un CTA `Préférences` dans le catalogue, afin d’accéder volontairement à mon profil.
4. En tant que personne dans le catalogue, je veux ouvrir mes préférences dans un drawer, afin de ne pas perdre mon contexte de navigation.
5. En tant que personne qui arrive pour la première fois dans le catalogue, je veux choisir clairement entre personnaliser mon profil et le faire plus tard, afin que l’invitation ne ressemble pas à une obligation.
6. En tant que personne en environnement Neutral, je veux pouvoir ouvrir une page de profil permanent dans Supermarket depuis l’action `Joe` du StoreHeader, afin de disposer d’un point d’entrée interne hors du catalogue.
7. En tant que personne, je veux voir un récapitulatif de mon profil avant d’éditer une section, afin de comprendre ce qui est déjà renseigné.
8. En tant que personne, je veux ouvrir une section depuis sa carte ou son CTA `Modifier`, afin de ne changer que la donnée qui m’intéresse.
9. En tant que personne, je veux revenir du niveau d’édition au récapitulatif, afin de poursuivre l’enrichissement de mon profil sans quitter le drawer.
10. En tant que personne cuisinant pour un foyer, je veux enregistrer mon nombre de convives par défaut, afin que les suggestions et le Planner soient adaptés à ma situation habituelle.
11. En tant que personne suivant un régime, je veux le renseigner séparément de mes allergies et de mes goûts, afin que l’application comprenne la nature de ma préférence.
12. En tant que personne ayant une allergie ou une restriction, je veux pouvoir la signaler dans une section dédiée, afin qu’elle soit traitée comme une contrainte renforcée.
13. En tant que personne avec une allergie ou restriction, je veux comprendre que les suggestions et le Planner sont personnalisés sans garantie de sécurité, afin de continuer à vérifier les étiquettes.
14. En tant que personne, je veux que le catalogue reste consultable même lorsque j’ai renseigné une allergie ou restriction, afin de conserver l’accès à l’ensemble de l’offre.
15. En tant que personne, je veux que seule une incompatibilité identifiée de manière fiable exclue une recette des suggestions personnalisées et du Planner, afin d’éviter des exclusions injustifiées.
16. En tant que personne sans allergie ni restriction à déclarer, je veux pouvoir le confirmer explicitement, afin que cette information ne soit pas confondue avec une absence de renseignement.
17. En tant que personne qui n’a pas encore renseigné ses allergies/restrictions, je veux pouvoir laisser la section vide, afin de ne pas faire de déclaration implicite.
18. En tant que personne, je ne veux pas voir un badge `Non renseigné` dans mon récapitulatif, afin que le profil reste concis et non culpabilisant.
19. En tant que personne, je veux ajouter des ingrédients à éviter au moyen d’une recherche et de suggestions, afin d’exprimer mes goûts sans saisir des termes non reconnus.
20. En tant que personne qui évite un ingrédient, je veux que les recettes concernées soient moins mises en avant, mais restent accessibles, afin de conserver le choix de les adapter.
21. En tant que personne, je veux que le fait de passer une recette ou de retirer un ingrédient ne soit pas interprété automatiquement comme un rejet, afin que mes intentions ne soient pas surinterprétées.
22. En tant que personne, je veux sélectionner autant de cuisines appréciées que nécessaire, afin que mes affinités ne soient pas artificiellement limitées.
23. En tant que personne utilisant des repères visuels, je veux voir le nom de chaque cuisine à côté de son repère visuel, afin de ne pas devoir reconnaître un drapeau pour comprendre une sélection.
24. En tant que personne, je veux sélectionner le temps que je souhaite consacrer à la préparation, afin que les suggestions correspondent à ma disponibilité plutôt qu’à une notion vague de difficulté.
25. En tant que personne, je veux comprendre que le temps indiqué exclut la cuisson au four, afin de choisir une durée de préparation cohérente.
26. En tant que personne, je veux renseigner mes équipements disponibles, afin de compléter mon profil de pratique en cuisine sans voir des recettes disparaître ou être dépriorisées dans ce lot.
27. En tant que personne, je veux modifier temps, cuisines et équipements dans un même écran `En cuisine`, afin de traiter ensemble mes préférences pratiques.
28. En tant que personne qui modifie une section complexe, je veux que mes sélections restent en brouillon tant que je n’ai pas choisi `Enregistrer`, afin de pouvoir revenir en arrière sans effet involontaire.
29. En tant que personne qui enregistre une section, je veux revenir au récapitulatif et recevoir le message `Préférences enregistrées. Vos prochaines suggestions en tiendront compte.`, afin de confirmer mon action sans interrompre mon parcours.
30. En tant que personne utilisant les technologies d’assistance, je veux que les contrôles de cuisines et les CTA `Modifier` aient des noms accessibles et des états sélectionnés explicites, afin de pouvoir utiliser le profil sans dépendre de la couleur ou d’un drapeau.
31. En tant qu’équipe produit, nous voulons mesurer l’adoption qualifiée du profil et son effet sur la consultation de recettes et l’ajout au Planner, afin de vérifier que la personnalisation crée de la valeur.

## Implementation Decisions

- Le package applicatif principal est Hub ; l’implémentation initiale doit rester Neutral-first et isolée des modifications du design system, sauf décision explicite de promotion d’un pattern stabilisé.
- Le profil est une ressource utilisateur permanente distincte des intentions hebdomadaires du Planner.
- Le modèle doit séparer au minimum : foyer/convives, régimes, allergies/restrictions, ingrédients évités, cuisines, temps de préparation et équipements.
- Le modèle allergies/restrictions doit porter un état explicite : `non renseigné`, `aucune contrainte déclarée`, ou une liste de valeurs déclarées. Une liste vide seule ne signifie jamais `aucune contrainte déclarée`.
- L’option `Aucune allergie ou restriction à signaler` est exclusive : la sélectionner retire les sélections de contraintes ; sélectionner une contrainte retire l’option explicite.
- Les régimes, allergies/restrictions et ingrédients évités restent des catégories séparées même si certaines vues peuvent les présenter dans une même surface.
- La politique de recommandation doit être une frontière métier unique, consommée à la fois par les suggestions et le Planner :
  - incompatibilité fiable liée à une allergie/restriction : exclure de ces deux surfaces personnalisées ;
  - incompatibilité explicite avec un régime déclaré : exclure du Planner et déprioriser dans le catalogue, sans jamais rendre le catalogue incomplet ;
  - ingrédient évité : déprioriser uniquement ;
  - cuisine : augmenter l’affinité sans exclure ;
  - équipement renseigné ou non : ne pas modifier le classement ni exclure de recette dans ce lot ;
  - le catalogue ne devient pas une surface bloquée par cette politique.
- Les sections complexes utilisent un état brouillon local et une validation explicite. Fermer ou revenir avant validation abandonne ce brouillon.
- Le réglage des convives est une action courte directement appliquée.
- La première invitation est contrôlée par une information de présentation persistée séparément des données du profil : elle est montrée une seule fois après déploiement, et `Plus tard` ne crée pas de relance automatique répétée.
- Le drawer expose un niveau 0 récapitulatif et des vues de niveau 1. Une sauvegarde réussie revient au niveau 0 et affiche un toaster non bloquant.
- Le CTA `Préférences` existant de CatalogNavigation déclenche l’ouverture du drawer ; il ne porte aucun compteur de préférences.
- L’invitation initiale utilise le composant Modal existant du design system. Son action primaire ouvre le drawer ; son action secondaire ferme la Modal et persiste le report. Le visuel Chronodrive est une référence d’intention seulement, pas une référence de DA ou d’assets.
- Une page de profil est construite dans Supermarket Neutral à partir du second écran Figma Preferences. L’action `Joe` du StoreHeader est son point d’entrée ; sa route et son emplacement CoursesU seront définis par l’architecture sans modifier le modèle de données.
- L’écran `En cuisine` regroupe `Temps pour cuisiner`, `Cuisines que vous appréciez` et `Équipements`, avec un brouillon et un enregistrement global.
- Les cuisines doivent utiliser un contrôle sélectionnable avec libellé visible, nom accessible et état sélectionné ; le drapeau éventuel est décoratif et secondaire.
- La copy allergies/restrictions est provisoire jusqu’à validation juridique. Aucun écran ne doit prétendre garantir la sécurité alimentaire.
- Le moteur de normalisation des ingrédients et les sources de suggestions agrégées devront être définis techniquement sans utiliser de signaux individuels implicites.

## Testing Decisions

Les tests valident des comportements observables, jamais la structure interne des composants ou des reducers.

### Seams à tester

1. **Politique de personnalisation unique** : tester, à son API publique, la décision prise pour une recette donnée face à un profil donné. Vérifier séparément l’exclusion conditionnelle allergies/restrictions, la dépriorisation des ingrédients évités, l’affinité cuisines, l’absence d’effet des équipements et le maintien du catalogue consultable.
2. **Modèle de profil** : tester les transitions publiques de sélection et de sauvegarde, notamment l’exclusivité entre `aucune contrainte déclarée` et une contrainte renseignée, ainsi que la distinction durable avec `non renseigné`.
3. **Workflow drawer** : tester l’invitation unique, `Plus tard`, l’ouverture depuis le CTA, la navigation niveau 0/niveau 1, l’abandon de brouillon, l’enregistrement puis le retour au récapitulatif et le toaster.
4. **Invitation Modal** : tester l’ouverture à la première arrivée éligible, l’action primaire qui ouvre le drawer, l’action secondaire qui ferme puis empêche les relances, et la restitution du focus au CTA pertinent.
5. **Entrée profil Neutral** : tester l’accès depuis `Joe` dans le StoreHeader vers la page de profil, puis le retour au catalogue sans rupture de navigation.
6. **Comportements accessibles** : tester les noms accessibles contextualisés, l’état sélectionné des cuisines, la présence de texte visible pour les cuisines et le comportement clavier des actions principales.

### Prior art

- Les tests de contexte et transitions utilisent déjà Vitest et Testing Library avec `renderHook` / `act` dans le Planner Hub.
- Les tests de routage déterministes existent pour les routes Supermarket et Planner.
- La vérification devra privilégier une politique de recommandations au niveau le plus haut plutôt que des tests attachés à chaque surface qui la consomme.

### Validation produit et UX

- Prototype interactif : compréhension de l’invitation, de `Plus tard`, de l’absence silencieuse au récapitulatif et de la portée de l’exclusion allergies/restrictions.
- Juridique : validation de la copy et du niveau de promesse avant diffusion.
- Mesure : adoption qualifiée, consultation de recettes et ajout au Planner comparés à une baseline ou un groupe non personnalisé.

## Out of Scope

- Envies temporaires `Adapter ma semaine`, prompt libre et contexte repas hebdomadaire.
- Budget, recettes économiques et intégration promotions.
- Filtres catalogue contextuels.
- Badges de personnalisation, explications ou compteurs sur les recipe cards et CTA catalogue.
- Suppression automatique d’un ingrédient ou d’une recette à l’ajout au Planner/panier.
- Inférence d’un goût individuel depuis un passage, retrait ou non-ajout.
- États de chargement, erreurs de sauvegarde, recherche vide, doublons, responsive complet et desktop/tablette : différés après stabilisation du happy path.
- Modification du package design-system, connexion à des données de production ou lancement de marque simultané.

## Further Notes

### Référence de design

- Figma Catalog, section Preferences, nœud `4745:37989`.
- Review UX V2 : `packages/hub/docs/design/2026-09-03-preferences-alimentaires/reviews/figma-preferences-mobile-v2.md`.
- Exploration précédente : `packages/hub/docs/2026-09-03-preferences-alimentaires-neutral-first/`.

### Questions techniques ouvertes pour Héphaïstos

1. Quel contrat de persistance permet de stocker proprement les états `non renseigné`, `aucune contrainte déclarée` et valeurs déclarées sans ambiguïté ?
2. Quelle source de vérité et quelle stratégie de synchronisation relient le Compte, le catalogue et le Planner ?
3. Comment déterminer et auditer une incompatibilité recette/allergie suffisamment fiable pour justifier une exclusion dans les surfaces personnalisées ?
4. Comment versionner l’information `invitation déjà vue` et distinguer son déploiement d’une mise à jour de profil ?
5. Comment normaliser les ingrédients recherchés, gérer les synonymes et empêcher les doublons sans exposer une liste non maintenable ?
6. Comment appliquer une politique unique de personnalisation aux suggestions catalogue et au Planner sans faire du catalogue une surface de filtrage strict ?

### Révision requise avant production

La spec peut être utilisée pour l’architecture et le plan. Aucune diffusion externe n’est prévue dans ce lot ; une démonstration client éventuelle sera requalifiée au fil des itérations. La copy allergies/restrictions doit être revue après avis juridique avant toute diffusion. Toute proposition qui transforme les ingrédients évités, équipements ou goûts en exclusions strictes contredit cette spec et doit être renvoyée à Zeus.