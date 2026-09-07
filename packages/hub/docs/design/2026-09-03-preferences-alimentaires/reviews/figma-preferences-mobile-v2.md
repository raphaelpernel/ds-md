# Review design V2 — Préférences alimentaires, premier jet happy path

## Contexte

Cette relecture tient compte du niveau de maturité annoncé : premier jet destiné à poser l'architecture, les catégories et l'interaction principale sur un cas classique. Les états de chargement, d'erreur, de recherche vide, les cas limites et le responsive complet sont donc considérés comme du backlog d'itération, pas comme des conditions de validation de cette base.

Source : [Figma — Preferences, node 4745:37989](https://www.figma.com/design/e8BpuLovSPh0SPseTl29tA/Catalog?node-id=4745-37989).

## Verdict global : `ready`

La base est suffisamment claire pour poursuivre l'itération happy path. Les modifications ont corrigé la cardinalité du temps, la continuité des données et la lisibilité des sélections. Zeus a tranché le wording provisoire des allergies/restrictions, le modèle `non renseigné / déclaration explicite` et le traitement des cuisines. Les états techniques peuvent attendre un tour ultérieur. Le statut `ready` concerne cet incrément exploratoire, pas un handoff en production.

## Ce qui est solide

- Le flow conserve une vue récapitulative courte et des vues d'édition ciblées.
- `30 min ou moins` est désormais un choix exclusif cohérent avec un seuil de recommandation.
- Le récapitulatif et les vues d'édition montrent maintenant les mêmes valeurs (`Arachide`, `30 min ou moins`, équipements).
- Les coches visibles renforcent l'état sélectionné sans reposer uniquement sur la couleur.
- La copie `Temps passé à cuisiner` et l'explication `hors cuisson au four` sont plus précises.
- Les cuisines disposent d'une expression visuelle distincte, ce qui rompt utilement la répétition des pills.

## Décisions produit actées après review

### 1. Modèle mental allergies/restrictions

- **Décision :** conserver le libellé `Allergies et restrictions à signaler`.
- **Copy provisoire :** « Ces informations personnalisent vos suggestions et votre Planner. Une recette n’est écartée que si son incompatibilité est identifiée de façon fiable. Vous pouvez toujours consulter le catalogue. Vérifiez systématiquement les étiquettes. »
- **Statut :** décision produit actée ; validation juridique encore requise avant formulation finale.

### 2. `Non renseigné` versus déclaration explicite

- **Décision de données :** aucune sélection signifie `non renseigné` ; `Aucune allergie ou restriction à signaler` est une déclaration explicite et exclusive.
- **Décision d'affichage :** aucun badge ni libellé `Non renseigné` dans le récapitulatif lorsque la section ne contient aucune valeur affichable. La distinction reste portée par la donnée.
- **Point de contrôle UX :** le prochain prototype doit rendre le choix exclusif vérifiable et documenter le comportement silencieux du récapitulatif. La compréhension de cette absence d'affichage devra être testée, sans la rouvrir comme décision à ce stade.

## Retour sur les drapeaux pour les cuisines

### Ce que le changement améliore

- La section devient immédiatement distincte des régimes, allergies et équipements.
- Les cibles circulaires sont faciles à balayer et semblent rapidement sélectionnables.
- La coche en surimpression rend la sélection visible.
- Pour les quatre exemples actuels, la densité est faible et le rendu reste propre.

### Risque principal résiduel

- **Sévérité :** P2
- **Constat :** un drapeau représente un pays, pas toujours une cuisine. Il demande aussi de reconnaître le drapeau avant de comprendre la valeur. Le problème deviendra plus visible avec des cuisines régionales ou transnationales : méditerranéenne, levantine, créole, asiatique, tex-mex, etc.
- **Impact :** ambiguïté culturelle et sémantique, mémorisation plutôt que reconnaissance, accessibilité faible si le libellé n'est pas visible.
- **Décision :** ne pas conserver le drapeau seul comme information finale. Le drapeau reste un repère secondaire, accompagné du libellé visible.

### Alternatives

- **A — Drapeau seul** : très compact et visuel, mais faible sémantiquement. Acceptable pour explorer le rythme, déconseillé comme pattern final.
- **B — Drapeau circulaire + libellé sous la cible** ⭐ **Recommandée pour cette direction** : garde la différence visuelle avec les autres pills tout en nommant explicitement la cuisine.
- **C — Pill avec petit drapeau + libellé** : la solution la plus compacte et robuste, mais elle réintroduit fortement l'effet « tout est un badge » que la variation cherche justement à éviter.

Pour le premier jet, la direction B permet de tester le format sans construire un nouveau composant complexe : une cible verticale compacte, drapeau au-dessus, libellé dessous, coche sur le drapeau. Le contrôle complet doit être un bouton avec nom accessible et état `aria-pressed` ; le drapeau est décoratif.

## Points d'itération non bloquants

- **P2 — Brouillon :** définir plus tard le comportement retour/fermeture avec modifications non enregistrées, avant prototype interactif complet.
- **P2 — Drapeaux :** vérifier le reflow avec 6 à 10 cuisines, les libellés longs et le zoom texte.
- **P2 — Actions répétées :** donner aux trois `Modifier` des noms accessibles contextualisés.
- **P3 — États techniques :** recherche vide, doublon, chargement et erreur de sauvegarde peuvent être ajoutés lorsque le happy path et le modèle de données sont stabilisés.
- **P3 — Responsive :** desktop/tablette à traiter après validation de l'architecture mobile, sauf si le prochain test cible explicitement desktop.

## Prochaine action

### Dédale — prochain incrément

1. Ajouter les libellés visibles sous les drapeaux.
2. Rendre vérifiable le choix exclusif `Aucune allergie ou restriction à signaler`.
3. Documenter le comportement silencieux du récapitulatif pour les états sans donnée affichable.
4. Ne pas ouvrir à ce stade les états d'erreur, de chargement, de doublon ou le responsive complet.

### Raphaël

1. Obtenir la validation juridique de la formulation finale et du niveau de promesse.
2. Confirmer le cadrage après le prochain incrément de Dédale.

### Test ultérieur

Vérifier dans un prototype interactif la compréhension de l'exclusion conditionnelle et de l'absence de badge dans le récapitulatif.
