# Décisions produit — Préférences alimentaires permanentes

## Décisions actées

| Sujet | Décision | Conséquence |
|---|---|---|
| Stratégie | Neutral-first dans Supermarket, déclinaison CoursesU ensuite | Une seule intention produit ; les variations de marque ne redéfinissent pas le modèle |
| Objet | Profil alimentaire permanent | Les envies temporaires restent hors de ce lot et sont la propriété du Planner |
| Domicile | Compte comme source de vérité ; accès rapide depuis le catalogue et le Planner | Le profil est transverse sans provoquer de sortie de contexte |
| Invitation | Unique, non bloquante, première arrivée catalogue après déploiement | `Plus tard` ferme le drawer sans relance automatique répétée |
| Accès catalogue | CTA `Préférences` conservé | L’accès reste volontaire après l’invitation initiale |
| Modal première entrée | Utiliser le composant Modal existant du design system, avec une action primaire pour personnaliser et une secondaire pour reporter | Reprendre l’idée de choix de Chronodrive, jamais sa DA ni ses assets |
| Navigation | Drawer niveau 0 = récapitulatif ; niveau 1 = section éditable avec Retour | Le catalogue reste derrière le drawer ; pas de navigation parallèle |
| Point d’entrée Neutral | Construire une page de profil dans Supermarket, inspirée du second écran Figma Preferences et accessible via `Joe` dans le StoreHeader | Le placement CoursesU reste libre sans modifier le modèle ou le drawer |
| Sauvegarde complexe | Brouillon + `Enregistrer` pour allergies/restrictions, ingrédients évités et écran En cuisine | Retour sans validation abandonne le brouillon |
| Sauvegarde courte | Convives modifiables directement | L’ajustement s’applique immédiatement ; le feedback doit rester non intrusif |
| Confirmation | Retour au récapitulatif et toaster après enregistrement | Copy retenue : `Préférences enregistrées. Vos prochaines suggestions en tiendront compte.` |
| Allergies/restrictions | Donnée séparée des régimes et goûts | Traitées comme contrainte renforcée, jamais comme une préférence esthétique |
| Promesse allergies | Exclure des suggestions personnalisées et du Planner uniquement si l’incompatibilité est identifiée de façon fiable ; catalogue toujours consultable | Pas de garantie de sécurité alimentaire ni de blocage du catalogue |
| Régimes | Une recette explicitement incompatible avec un régime déclaré est exclue du Planner et dépriorisée dans le catalogue | Le Planner ne génère pas une proposition incompatible ; le catalogue conserve tous ses items |
| Copy provisoire allergies | `Ces informations personnalisent vos suggestions et votre Planner. Une recette n’est écartée que si son incompatibilité est identifiée de façon fiable. Vous pouvez toujours consulter le catalogue. Vérifiez systématiquement les étiquettes.` | À valider juridiquement avant gel |
| États allergies | Absence de choix = `non renseigné`; `Aucune allergie ou restriction à signaler` = déclaration explicite exclusive | Aucun badge ni libellé `Non renseigné` dans le récapitulatif lorsque rien n’est affichable |
| Ingrédients évités | Déprioriser, ne pas masquer et ne pas retirer automatiquement de recette/panier | Un passage, retrait ou non-ajout n’est pas une preuve de rejet individuel |
| Suggestions d’évitements | Liste courte éditorialisée basée sur sources populationnelles, ajustable par données CoursesU agrégées | Pas d’inférence de goût individuel |
| Cuisines | Signaux d’affinité, sélection sans limite | Ne constituent pas des filtres d’exclusion |
| Expression cuisines | Drapeau secondaire + libellé visible sous chaque cible ; contrôle avec nom accessible et état sélectionné | Les drapeaux seuls sont exclus comme pattern final |
| Temps | Libellé `Temps pour cuisiner` avec aide : temps consacré à la préparation, hors cuisson au four | La recommandation utilise une durée concrète, non une notion de difficulté |
| En cuisine | Un écran unique avec blocs `Temps pour cuisiner`, `Cuisines que vous appréciez`, `Équipements` | Brouillon global et enregistrement unique |
| Équipements | Une absence de renseignement ou d’équipement déclaré n’a aucun effet sur les recettes du lot 1 | Ne pas déprioriser ni exclure une recette faute de four, air fryer ou robot |
| Cards recettes | Aucun badge ou explication de personnalisation | Préserver la lisibilité face aux badges Idées repas, Sponsor et Promo |

## Décisions de périmètre

- Pas de budget ni de promesse de recettes économiques dans le lot 1.
- Pas de filtres catalogue ; ils restent un sujet distinct et contextuel.
- Pas d’envies hebdomadaires, de champ prompt libre ou de contexte repas : lot 2 `Adapter ma semaine`.
- Pas de suppression automatique d’ingrédient au moment d’ajouter une recette.
- Pas de relance automatique répétée après `Plus tard`.

## Décisions en attente externe

- Le juridique valide ou modifie le libellé, la copy et la promesse relatives aux allergies/restrictions.
- Les tests utilisateurs valident la compréhension de l’absence silencieuse au récapitulatif, du drawer initial et de l’exclusion conditionnelle. Ces tests ne rouvrent pas les décisions ci-dessus sans signal observé.

## Références de construction

- La section `Preferences` du Figma Catalog, nœud `4745:37989`, est la référence visuelle pour l’intégration.
- Le CTA `Préférences` existant dans la barre de navigation du catalogue Supermarket ouvre le drawer ; il ne doit pas devenir un compteur ni un filtre catalogue.
- Les composants existants du design system sont privilégiés : Modal pour l’invitation bloquante courte, Drawer pour le profil à parcourir, Toast pour la confirmation éphémère.
- Le lot ne prévoit aucune diffusion externe. Une démonstration client éventuelle est traitée comme une décision ultérieure, avec les informations et validations adaptées.

## Conflit documentaire à résoudre pendant l’implémentation

La documentation historique `docs/Mealz Planner/docs/06-preferences-planner.md` décrit des règles désormais incompatibles avec ce lot : exclusions strictes pour `Je n’aime pas` et équipements, et badge compteur sur le CTA. Cette spec prévaut pour le nouveau flow. Héphaïstos devra définir une stratégie de mise à jour ou de retrait contrôlé de ces règles historiques sans appliquer de comportement contradictoire.