# Finding — états allergies et cuisines

Statut : vérification ciblée de maquette Figma, non testée auprès d’utilisateurs.

## États vérifiés

- `Allergies et restrictions` sans sélection : affichage explicite `État : non renseigné`.
- Choix exclusif visible : `Aucune allergie ou restriction à signaler`.
- Les allergies/restrictions restent distinctes des goûts et cuisines.
- Le récapitulatif ne doit afficher aucun badge ni libellé pour une section sans donnée à résumer.
- Copy de prudence visible : personnalisation des suggestions et du Planner ; exclusion seulement si incompatibilité identifiée de façon fiable ; catalogue toujours consultable ; vérification systématique des étiquettes.
- Cuisines : drapeaux conservés comme repères secondaires, avec libellé visible sous chaque cible.
- Footer : bouton explicite `Enregistrer` pour les allergies/restrictions.

## Vérification visuelle

La nouvelle frame Figma `Preferences / Lot 1 — états vérifiés` a été ajoutée dans le node `4745:37989` (frame `4754:1112`). Le rendu vérifié montre les quatre drapeaux avec leurs libellés, sans chevauchement ; le choix exclusif, l’état `non renseigné` et le bouton `Enregistrer` restent lisibles.

## Limites et risques

- Prototype de maquette uniquement ; pas de comportement d’erreur, chargement, doublon ou responsive complet dans ce tour.
- La formulation allergies/restrictions reste soumise à validation juridique.
- La maquette ne promet pas l’absence d’allergènes et ne déclenche aucune suppression automatique.
