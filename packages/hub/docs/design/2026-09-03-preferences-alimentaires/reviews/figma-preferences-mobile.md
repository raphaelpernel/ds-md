# Review design — Préférences alimentaires mobile

## Contexte et périmètre

- **Utilisateur :** client Supermarket/CoursesU qui consulte des recettes et prépare son Planner.
- **Objectif principal :** renseigner un profil permanent afin d'améliorer les suggestions sans masquer le catalogue.
- **Contexte d'usage :** entrée depuis le catalogue ou le Compte, consultation et édition sur mobile.
- **Sources revues :**
  - synthèse des décisions Zeus transmise par Raphaël ;
  - [Figma — Preferences, node 4745:37989](https://www.figma.com/design/e8BpuLovSPh0SPseTl29tA/Catalog?node-id=4745-37989) ;
  - `packages/hub/docs/2026-09-03-preferences-alimentaires-neutral-first/prototype-findings.md` ;
  - `packages/hub/docs/2026-09-03-planner-preferences-placement/prototype-findings.md` ;
  - `packages/design-system/docs/DESIGN.md` et docs `Drawer`, `Alert`, `Toast`.
- **Limite de la review :** le node fourni montre le récapitulatif et trois vues d'édition en 375 px. L'invitation initiale, l'entrée catalogue, les états desktop/tablette et les états techniques ne sont pas visibles.

## Verdict global : `needs-refinement`

La direction produit est saine : personnalisation non bloquante, source de vérité permanente, distinction entre évitement et exclusion, récapitulatif court, édition progressive. Le flow ne doit toutefois pas être transmis à l'implémentation en l'état. Le modèle de sécurité perçu, la distinction « non renseigné / aucun », la sémantique du temps, la sortie avec brouillon et plusieurs états/accessibilités restent insuffisamment définis.

## Ce qui est solide

- Le récapitulatif donne une vue d'ensemble utile sans transformer l'arrivée catalogue en onboarding obligatoire.
- Le niveau 0 puis les vues de niveau 1 réduisent la charge cognitive et respectent la divulgation progressive.
- Les catégories correspondent globalement aux données MVP et placent les sujets sensibles en premier.
- Le `Stepper` des convives permet une modification courte depuis le récapitulatif, tandis que les vues complexes disposent d'un CTA `Enregistrer`.
- La bannière allergies est persistante dans la vue concernée et emploie un wording prudent sans promettre une sécurité absolue.
- Le footer d'action fixe garde le CTA disponible sur les vues longues.
- Les collections de valeurs se replient sur plusieurs lignes plutôt que d'être tronquées.

## Risques et problèmes

### 1. Portée de la protection insuffisamment explicite

- **Sévérité :** P1
- **Zone :** vue `Régimes et allergies` et récapitulatif
- **Constat :** la copie dit que les données « personnalisent les suggestions » et que CoursesU ne garantit pas l'absence d'allergènes, mais n'explique pas le comportement convenu : exclusion uniquement lorsqu'une incompatibilité est identifiée de façon fiable, catalogue toujours consultable.
- **Impact :** un utilisateur peut croire soit que tout le catalogue est sécurisé, soit que ses allergies ne font qu'influencer un classement. Les deux interprétations sont contraires au modèle produit.
- **Recommandation :** expliquer les trois limites dans la même zone : suggestions/Planner concernés, exclusion seulement quand l'information est fiable, catalogue non filtré. Faire valider le wording par le juridique avant test.
- **Pourquoi :** une limitation de responsabilité seule ne suffit pas à former le bon modèle mental de la fonctionnalité.

### 2. État « non renseigné » absent

- **Sévérité :** P1
- **Zone :** récapitulatif, allergies/restrictions et toutes les sections vides
- **Constat :** la maquette ne montre que des profils déjà remplis. Aucun état ne distingue visuellement « non renseigné » d'une déclaration explicite « aucune allergie ou restriction ».
- **Impact :** risque direct de fausse assurance, de données mal interprétées et de mesure produit trompeuse.
- **Recommandation :** afficher `Non renseigné` avec un CTA explicite tant qu'aucune réponse n'a été enregistrée. N'afficher `Aucune allergie ou restriction déclarée` qu'après une action volontaire et horodatable. Ne jamais déduire cet état d'une liste vide.
- **Pourquoi :** l'absence de donnée est un état produit distinct, particulièrement pour une donnée sensible.

### 3. Sélection du temps ambiguë

- **Sévérité :** P1
- **Zone :** `En cuisine` — Temps passé à cuisiner
- **Constat :** `15 min`, `20 min` et `30 min` apparaissent simultanément sélectionnés, alors que la donnée ressemble à un seuil ou à une valeur unique. Le libellé « Temps passer à cuisiner » est en outre incorrect.
- **Impact :** la règle de recommandation devient indéterminée : trois valeurs concurrentes peuvent signifier une plage, plusieurs disponibilités ou une erreur de sélection.
- **Recommandation :** décider avec Zeus si la donnée est un maximum, une plage ou plusieurs disponibilités. Pour un maximum, utiliser un choix exclusif et un libellé comme `Temps de préparation habituel`, avec `15 min ou moins`, `30 min ou moins`, etc. Corriger en `Temps passé à cuisiner` si ce wording est conservé.
- **Pourquoi :** le contrôle doit refléter la cardinalité réelle du modèle de données.

### 4. Continuité d'état incohérente entre le récapitulatif et l'édition

- **Sévérité :** P1
- **Zone :** flow complet
- **Constat :** le récapitulatif affiche notamment `Arachides` et `30 min`, alors que les vues d'édition montrent `Crustacés` et trois durées sélectionnées. Les écrans ne représentent donc pas un même profil cohérent.
- **Impact :** le prototype ne permet pas de tester la confiance dans la sauvegarde et peut masquer un problème de mapping entre sections et récapitulatif.
- **Recommandation :** créer un jeu de données unique pour tout le flow et montrer au moins une séquence avant modification → brouillon → sauvegarde → récapitulatif mis à jour.
- **Pourquoi :** la continuité des données est la preuve principale de compréhension d'un formulaire de préférences.

### 5. Sortie avec brouillon non définie

- **Sévérité :** P1
- **Zone :** navigation niveau 1, fermeture du drawer
- **Constat :** les vues complexes utilisent un brouillon, mais le comportement du retour, de l'overlay, d'`Escape` et de la fermeture n'est pas spécifié. Le composant DS `Drawer` reste monté fermé et conserve naturellement son état interne.
- **Impact :** perte silencieuse de modifications ou, à l'inverse, réapparition ultérieure d'un brouillon que l'utilisateur croyait abandonné.
- **Recommandation :** choisir une règle unique : soit confirmation `Ignorer les modifications ?`, soit brouillon explicitement conservé et signalé. Réinitialiser volontairement l'état lors d'un abandon ; ne pas dépendre du cycle de montage du Drawer.
- **Pourquoi :** toutes les voies de sortie doivent produire le même résultat prévisible.

### 6. État sélectionné porté essentiellement par la couleur

- **Sévérité :** P1
- **Zone :** tags des régimes, allergies, temps, cuisines et équipements
- **Constat :** la sélection est indiquée par un fond bleu, sans marque textuelle ou iconographique visible. La sémantique d'interaction n'est pas montrée.
- **Impact :** ambiguïté pour les personnes ayant une déficience de perception des couleurs et risque de contrôles inexploitables au clavier ou au lecteur d'écran.
- **Recommandation :** utiliser de vrais boutons/checkboxes avec `aria-pressed` ou état `checked`, focus visible et annonce du statut. Ajouter une coche si le composant DS le permet sans surcharge. Vérifier le contraste texte/fond dans les deux états.
- **Pourquoi :** la couleur ne doit pas être le seul canal d'état ; le contrôle doit exposer nom, rôle et valeur.

### 7. Couverture du flow d'entrée et du responsive manquante

- **Sévérité :** P1
- **Zone :** invitation initiale, catalogue, Compte, desktop/tablette
- **Constat :** le node fourni ne montre ni l'invitation unique, ni `Plus tard`, ni le bouton catalogue, ni le comportement desktop du Drawer.
- **Impact :** les risques ouverts les plus importants — déclenchement initial, caractère non bloquant, retour au catalogue, cohérence Compte/catalogue — ne peuvent pas être validés avant implémentation.
- **Recommandation :** ajouter un mini-flow cliquable couvrant : arrivée catalogue → invitation → `Plus tard` ; arrivée catalogue → accepter → niveau 0 → niveau 1 → sauvegarde → récapitulatif → fermeture avec état catalogue préservé. Ajouter au moins un écran desktop et un cas mobile avec contenu long.
- **Pourquoi :** les écrans d'édition seuls ne valident pas l'hypothèse d'adoption non intrusive.

### 8. Découverte des cuisines restantes faible

- **Sévérité :** P2
- **Zone :** `En cuisine` — Cuisines que vous appréciez
- **Constat :** une puce `...` sert d'accès implicite aux autres cuisines.
- **Impact :** affordance opaque, nom accessible incertain et découverte faible d'une liste annoncée sans limite.
- **Recommandation :** remplacer par `Voir plus` / `Toutes les cuisines`, ou par une recherche si le catalogue est long. Une fois ouverte, conserver les valeurs choisies et permettre le retour.
- **Pourquoi :** les points de suspension décrivent une omission, pas une action ni sa destination.

### 9. États de recherche et de sauvegarde incomplets

- **Sévérité :** P2
- **Zone :** `Ingrédients à éviter`, footer et toast
- **Constat :** aucun état n'est montré pour résultat de recherche, aucun résultat, doublon, terme non reconnu, chargement, erreur de sauvegarde ou bouton désactivé. Le champ repose visuellement sur un exemple de placeholder.
- **Impact :** dette UX et technique probable au moment de brancher normalisation et persistance ; récupération d'erreur non cadrée.
- **Recommandation :** documenter ces états avant développement. Donner au champ un nom accessible et idéalement un label visible (`Ajouter un ingrédient`). Pendant l'enregistrement : bouton `loading` et désactivé ; en erreur : message récupérable sans perdre le brouillon ; en succès : retour puis Toast `role=status`.
- **Pourquoi :** la recherche libre et la sauvegarde distante sont les deux zones où le prototype statique masque le plus de complexité réelle.

### 10. Footer fixe à sécuriser

- **Sévérité :** P2
- **Zone :** vues longues, clavier logiciel et navigation clavier
- **Constat :** le footer fixe touche visuellement le dernier groupe d'équipements et la maquette ne montre ni safe area ni clavier ouvert.
- **Impact :** dernier contrôle ou focus potentiellement masqué, en particulier avec zoom texte ou clavier logiciel.
- **Recommandation :** réserver un padding bas égal au footer + safe area, utiliser `scroll-padding-bottom`, vérifier zoom 200 %, clavier ouvert et focus successif sur tous les contrôles.
- **Pourquoi :** WCAG 2.2 demande que le focus ne soit pas entièrement masqué par un contenu persistant.

### 11. Libellés d'action génériques

- **Sévérité :** P2
- **Zone :** récapitulatif
- **Constat :** trois liens portent visuellement le même texte `Modifier`.
- **Impact :** hors contexte visuel, un lecteur d'écran obtient plusieurs actions indifférenciées.
- **Recommandation :** conserver le texte visible court mais fournir des noms accessibles distincts : `Modifier les régimes et allergies`, `Modifier les ingrédients à éviter`, `Modifier les préférences en cuisine`.
- **Pourquoi :** chaque action répétée doit rester compréhensible isolément.

### 12. Cohérence éditoriale à nettoyer

- **Sévérité :** P3
- **Zone :** titres et microcopies
- **Constat :** `Ingrédient à éviter` est au singulier malgré une liste multiple ; `Temps passer à cuisiner` est incorrect ; `Votre type de cuisine préféré` contredit une sélection sans limite ; les noms de layers Figma réutilisent `Régimes` sur d'autres sections.
- **Impact :** baisse de précision et risque de propagation de mauvais libellés vers l'implémentation et l'analytics.
- **Recommandation :** passer une revue de contenu finale : `Ingrédients à éviter`, `Temps de préparation`, `Cuisines que vous appréciez`, noms de layers alignés sur leur contenu.
- **Pourquoi :** la terminologie doit refléter la cardinalité et la nature exacte des données.

## Alternatives

### A — Séparer complètement régimes et allergies

Deux cartes et deux vues dédiées. Plus clair sur les conséquences, mais augmente la longueur du récapitulatif et le nombre de niveaux.

### B — Conserver une vue commune, avec conséquences explicitement séparées ⭐ Recommandée

Conserver une seule entrée pour limiter la friction, mais structurer clairement :

- `Régimes` — influencent les suggestions ;
- `Allergies et restrictions` — écartent les suggestions incompatibles quand l'information est fiable ;
- avertissement : catalogue toujours consultable, vérification des étiquettes obligatoire.

Cette option garde le scope et réduit l'ambiguïté sans ajouter un écran.

### C — Onboarding séquentiel obligatoire

Clarifie chaque notion, mais contredit le principe non bloquant et augmente fortement le risque d'abandon. Non recommandé pour le MVP.

## Questions décisives

1. `Temps pour cuisiner` est-il un maximum unique, une plage ou plusieurs disponibilités acceptables ?
2. Une allergie explicitement déclarée doit-elle être distinguée d'une restriction non médicale dans les données et dans l'interface ?
3. En cas de fermeture avec modifications non enregistrées, veut-on abandonner avec confirmation ou conserver un brouillon explicite ?

## Prochaine action

- **Raphaël + Zeus :** arbitrer les trois questions décisives avant handoff technique.
- **Dédale :** rendre le jeu de données cohérent, ajouter les états `non renseigné`, le flow d'invitation et la fermeture avec brouillon, puis préparer un test utilisateur court.
- **Juridique :** valider le wording allergies/restrictions et la portée de la promesse.
- **Héphaïstos :** après arbitrage UX, cadrer persistance, distinction `unknown/none/values`, normalisation des ingrédients et reset du Drawer.
- **Minos :** inclure dans la QA les états clavier/lecteur d'écran, zoom texte, safe area, erreur de sauvegarde et conservation du contexte catalogue.
