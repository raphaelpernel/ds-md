# Spec directrice — Reconstruction stable et multi-brand de DS.MD

**Statut :** approuvée par Raphaël, prête pour handoff technique

**Date :** 2026-09-08

## Problem Statement

Raphaël doit pouvoir faire évoluer seul un design system Mealz multi-brand sans dépendre d’une architecture historique difficile à comprendre, de tokens dispersés ou de composants dont les responsabilités sont ambiguës.

Le système actuel réunit design system, documentation, prototypes et expériences produit. Il constitue une source de connaissance, mais une migration mécanique conserverait des couplages et des choix que la nouvelle architecture cherche précisément à supprimer. La reconstruction doit donc préserver l’existant comme référence tout en établissant une nouvelle chaîne cohérente, réversible et vérifiable.

Raphaël doit notamment pouvoir examiner chaque token avant sa création, changer rapidement de bibliothèque Figma entre clients sans changer de contrat public, et valider les composants en contexte à travers des parcours continus et plusieurs shells distributeur.

## Solution

Reconstruire DS.MD progressivement dans le même repository, sur une branche et un worktree isolés. La nouvelle architecture sépare une source canonique de tokens, un `ui-kit` générique, une bibliothèque `mealz-ui`, une application Supermarket de référence et un portail documentaire.

La reconstruction commence par un inventaire complet de l’existant, puis progresse par tranches verticales guidées par des parcours Supermarket représentatifs. L’ancien système reste disponible pour comparaison jusqu’à promotion explicite de la nouvelle fondation.

Mealz, également appelé Neutral, définit le contrat sémantique complet. Chaque marque cliente implémente les mêmes identifiants et ne déclare que ses différences ou héritages approuvés. Les bibliothèques Figma clientes sont distinctes mais interchangeables au niveau de leur contrat public.

Chaque future spec de tokens constitue un gate humain bloquant. Elle doit présenter l’inventaire exhaustif de tous les tokens proposés avant leur création. Cette spec directrice n’autorise aucun token concret.

## User Stories

1. En tant que propriétaire du design system, je veux examiner chaque token proposé avant son implémentation, afin de garder le contrôle sur le langage visuel.
2. En tant que propriétaire du design system, je veux comprendre le rôle de chaque token, afin d’éviter les alias ambigus ou redondants.
3. En tant que propriétaire du design system, je veux voir les valeurs et héritages de chaque marque, afin de détecter les fallbacks ou incohérences.
4. En tant que propriétaire du design system, je veux pouvoir refuser ou modifier un token sans devoir analyser du code généré.
5. En tant que designer, je veux utiliser une bibliothèque Figma distincte par client, afin de changer rapidement de contexte de marque.
6. En tant que designer, je veux que toutes les bibliothèques clientes exposent les mêmes noms et propriétés, afin que le changement de bibliothèque ne casse pas mes maquettes.
7. En tant que designer, je veux conserver des styles Figma adaptés à l’outil, comme `Body` et `Body Bold`, sans imposer cette duplication au code.
8. En tant que designer, je veux que la couleur officielle 500 d’une marque reste inchangée, afin de préserver son identité.
9. En tant que designer, je veux vérifier les palettes générées en contexte, afin qu’une interpolation mathématique ne remplace pas mon jugement.
10. En tant que consommateur du `ui-kit`, je veux utiliser des primitives indépendantes du domaine Mealz, afin de les composer dans différents produits.
11. En tant que consommateur de `mealz-ui`, je veux recevoir des composants métier avec leurs états et comportements locaux, afin de ne pas reconstruire leurs interactions dans chaque application.
12. En tant que développeur d’application, je veux conserver la responsabilité du routing, de la persistance et de l’orchestration, afin que les bibliothèques ne contrôlent pas l’hôte.
13. En tant qu’intégrateur client, je veux appliquer une marque sans ajouter de conditions clientes dans les composants, afin de limiter les forks.
14. En tant qu’intégrateur client, je veux que les variations structurelles rares soient explicites, afin de distinguer thème, shell, données et expérience.
15. En tant qu’utilisateur de Supermarket, je veux parcourir les mêmes routes avec plusieurs shells distributeur, afin de comparer les expériences sans perdre mes repères.
16. En tant que concepteur produit, je veux utiliser des scénarios de données canoniques complétés par des overlays, afin de comparer les distributeurs sur une base commune.
17. En tant que concepteur produit, je veux vérifier les composants dans des parcours continus, afin d’évaluer leurs interactions plutôt que des captures isolées.
18. En tant que lecteur de la documentation, je veux alterner entre preview et code, afin de comprendre rapidement un composant.
19. En tant que lecteur de la documentation, je veux manipuler les variants et états, afin d’observer le contrat public sans écrire un exemple local.
20. En tant que lecteur de la documentation, je veux connaître les tokens consommés et les liens Figma, afin de relier intention visuelle et implémentation.
21. En tant que membre de l’équipe, je veux utiliser le portail pour atteindre les documentations, Figma, Supermarket, les icônes et les archives, afin de ne pas confondre portail et application produit.
22. En tant qu’Engineer, je veux disposer de limites de package explicites, afin de savoir où placer une responsabilité.
23. En tant qu’Engineer, je veux reconstruire par tranches verticales, afin de valider tôt tokens, composants et intégration.
24. En tant qu’Engineer, je veux traiter l’existant comme une source d’information plutôt qu’une obligation de migration, afin de ne pas reproduire ses défauts.
25. En tant qu’Engineer, je veux disposer d’une matrice contractuelle intégrée, afin de prouver que les sorties générées et les composants fonctionnent ensemble.
26. En tant qu’Engineer, je veux que les tests portent sur les interfaces publiques, afin de pouvoir modifier les détails internes sans casser la suite.
27. En tant qu’Engineer, je veux connaître les thèmes encore en draft ou expérimentaux, afin de ne pas les présenter comme validés.
28. En tant que QA, je veux vérifier une tranche contre un inventaire et des critères approuvés, afin de produire un verdict fondé sur des preuves.
29. En tant que QA, je veux voir les états clavier, responsive, chargement, erreur et désactivation, afin de ne pas valider seulement le chemin nominal.
30. En tant que décideur, je veux que toute modification d’une valeur Mealz héritée déclenche une revue multi-brand, afin d’éviter une régression silencieuse chez un client.
31. En tant que décideur, je veux pouvoir conserver l’ancienne fondation pendant la reconstruction, afin de revenir en arrière ou comparer les comportements.
32. En tant que décideur, je veux qu’un seul Staff Engineer possède la cohérence technique de la fondation, afin de limiter les divergences pendant sa construction.
33. En tant que décideur, je veux conserver des revues produit, design et QA indépendantes, afin que l’Engineer ne devienne pas l’unique autorité.
34. En tant que designer ou Engineer, je veux distinguer Surface et Card, afin qu’une primitive de conteneur ne soit pas confondue avec une composition sémantique.
35. En tant que propriétaire du système, je veux différer les abstractions sans preuve d’usage, afin de conserver un MVP net et compréhensible.

## Implementation Decisions

### Stratégie de repository

- La reconstruction reste dans le repository DS.MD.
- Une branche et un worktree dédiés isolent la nouvelle fondation du worktree principal chargé.
- Le système actuel reste disponible comme référence jusqu’à une promotion explicite.
- Aucun fork, reset destructif ou migration en place du `dev` historique n’est prévu.

### Responsabilités des modules

- Le module de tokens est la source canonique unique des fondations et alias partagés.
- Le `ui-kit` contient les primitives génériques et ne dépend pas du domaine Mealz.
- `mealz-ui` contient les composants métier et dépend du `ui-kit`, jamais l’inverse.
- Supermarket possède routing, shells, scénarios de données, persistance locale et orchestration inter-feature.
- Le portail ne porte pas de parcours produit ; il dirige vers les ressources.
- Le Lab reste facultatif, séparé et non canonique.
- Un module headless de domaine n’est introduit que lorsqu’un partage réel entre plusieurs consommateurs le justifie.

### Reconstruction progressive

- L’existant est inventorié avant la première vague de reconstruction.
- Chaque élément est classé comme à reconstruire, fusionner, remplacer, supprimer ou différer.
- L’ordre d’implémentation suit des tranches verticales représentatives plutôt qu’un catalogue exhaustif.
- La promotion d’un pattern vers une bibliothèque partagée exige une preuve de réutilisation ou un contrat produit explicite.

### Contrat multi-brand

- Mealz et Neutral désignent le thème canonique complet.
- Toutes les marques partagent les mêmes identifiants sémantiques.
- Les clients n’introduisent pas de namespace consommé par les composants.
- Les variations sont classées comme brand, shell, data overlay ou experience profile.
- Les différences de couleurs, typographies, radius principaux, focus, ombres et assets sont autorisées par marque.
- La grille, les breakpoints, le z-index et les contraintes structurelles restent communs.
- Une recipe de composant commune peut varier une dimension locale sans modifier une fondation globale.

### Autorité et génération des tokens

- Les tokens canoniques sont répartis en fichiers spécialisés sous une seule autorité.
- Les projections CSS, TypeScript, Tailwind, Figma et catalogue sont générées.
- Les fichiers générés ne sont pas modifiés manuellement.
- Les sorties de chaque marque sont entièrement résolues.
- Les thèmes sont classés `draft`, `validated` ou `experimental`.
- Un thème `validated` ne contient aucun fallback non résolu.
- Un héritage Mealz explicitement approuvé est distingué d’un fallback temporaire.
- Les couleurs utilisent une échelle 50–950 et conservent le niveau 500 officiel.
- Les valeurs OKLCH générées sont des propositions vérifiées puis figées, pas une génération runtime.

### Gate exhaustif de revue des tokens

- Cette spec directrice ne propose, ne crée et n’approuve aucun token concret.
- Avant toute tâche d’implémentation de tokens, une spec dédiée doit inventorier tous les tokens qui seront créés ou modifiés.
- Chaque token doit inclure son identifiant canonique, catégorie, type, rôle sémantique, alias, dépendances, valeurs Mealz Light/Dark, valeurs ou héritages clients, projections attendues, provenance et statut.
- Raphaël doit approuver explicitement l’inventaire complet.
- Un token absent de l’inventaire approuvé ne peut pas être créé.
- Toute addition ou modification découverte pendant l’implémentation nécessite une mise à jour de la spec et une nouvelle approbation avant reprise.
- La vérification automatisée compare l’inventaire approuvé aux sorties produites.

### Figma

- Chaque client conserve une bibliothèque DS distincte.
- Les bibliothèques publient un contrat strictement identique pour les collections, variables, types, styles, composants, propriétés, variants et états.
- Les valeurs résolues et l’organisation interne peuvent différer.
- Une identité canonique possède des projections de noms adaptées à chaque outil.
- La reconstruction stabilise d’abord le contrat dans le code, puis synchronise les fondations approuvées vers Figma.
- Seuls les modes documentés par des sources fiables sont publiés comme validés.

### Composants

- Appica guide principalement les API, anatomies, variants et patterns de documentation.
- LINE, les usages existants et les parcours Mealz déterminent la pertinence produit.
- Les variants sont ajoutés sur preuve de besoin, pas copiés exhaustivement.
- Le noyau initial couvre actions, formulaires, contenus, feedback, overlays et navigation locale nécessaires aux premiers parcours.
- `Toggle` est le nom public retenu pour la bascule instantanée.
- `Autocomplete` couvre notamment l’ajout d’ingrédients non aimés.
- `Pagination` fait partie du noyau initial.
- `Dialog` remplace l’ancien nom `Modal` et possède un comportement modal par défaut.
- `AlertDialog`, `Popover`, `Drawer` et `BottomSheet` restent distincts.
- Une Card est une Surface spécialisée ; toute Surface n’est pas une Card.
- Le contrat public de `Surface` et `Card` sera décidé dans une spec de tranche après examen des tokens et usages concernés.

### Documentation

- L’expérience documentaire principale est custom et s’inspire d’Appica.
- Elle expose preview, code, personnalisation, variants, états, exemples, tokens consommés et liens Figma.
- Storybook peut être conservé comme harness technique secondaire si son utilité est démontrée.
- Les bibliothèques partagées documentent responsabilités, non-objectifs, règles de contribution, critères de qualité et décisions durables.

### Atlas

- Atlas est un profil permanent de Staff Engineer combinant architecture, planification, implémentation, tests et documentation technique.
- Son identité durable ne mentionne pas DS.MD V2.
- Son affectation vient du workspace, des règles locales et de la mission versionnée.
- Le profil est créé Fresh/Create empty après validation de la spec et création du worktree V2.
- Un seul Engineer possède la fondation au démarrage.
- Atlas ne remplace ni l’autorité produit, ni l’autorité design, ni la QA indépendante.
- `ui-ux-pro-max` est déclenché uniquement pour contrôler l’implémentation d’une intention UI validée.
- Toute vérification web utilise le navigateur Hermes Desktop.
- Toute communication inter-agents utilise exclusivement `message_agent`.

## Testing Decisions

### Seam principal

Le seam décisif est une matrice contractuelle intégrée observant le système depuis son contrat public plutôt que ses détails internes.

Pour chaque tranche promue, elle vérifie :

1. que l’inventaire de tokens approuvé et les sources canoniques correspondent ;
2. que les sorties CSS, TypeScript, Tailwind, Figma et catalogue contiennent les identifiants attendus ;
3. que chaque thème validé est totalement résolu et expose le même contrat ;
4. que les composants représentatifs se rendent avec les variants et états approuvés ;
5. que les mêmes scénarios Supermarket fonctionnent avec Mealz et les shells clients concernés ;
6. que les comportements clavier, focus, responsive, erreur, chargement et désactivation restent observables.

### Principes de test

- Tester les comportements externes et les contrats publics, pas la structure DOM ou l’organisation interne lorsqu’elles ne constituent pas un contrat.
- Préférer le seam le plus haut capable de prouver une règle partagée.
- Ajouter des tests ciblés par package uniquement pour localiser les erreurs ou couvrir une logique qui ne peut pas être observée proprement par la matrice intégrée.
- Utiliser des scénarios et données déterministes.
- Vérifier séparément les thèmes `draft`, `validated` et `experimental` selon leurs règles de promotion.
- Bloquer la promotion lorsqu’une marque validée dépend encore d’un fallback.
- Recalculer et revoir toutes les marques héritières lorsqu’une valeur Mealz partagée change.

### Modules couverts

- Source et génération des tokens.
- Résolution des thèmes et contrôle de parité publique.
- Primitives du `ui-kit`.
- Composants métier de `mealz-ui`.
- Documentation interactive pour les exemples contractuels.
- Scénarios de référence dans Supermarket.

### Références existantes

Le repository utilise déjà Vitest, Testing Library, des tests de routing et des contrôles de génération et documentation. Ces pratiques servent de référence technique, sans imposer la structure de l’ancien système à la nouvelle fondation.

Les validations visuelles et comportementales web sont exécutées dans le navigateur Hermes Desktop. La lecture des maquettes et bibliothèques passe par le MCP Figma configuré.

## Out of Scope

- Implémenter des tokens ou composants à partir de cette seule spec directrice.
- Définir ici la liste exhaustive des tokens concrets ; chaque inventaire appartient à une spec de tokens dédiée et doit être approuvé avant implémentation.
- Garantir la compatibilité avec toutes les APIs historiques.
- Reconstruire immédiatement l’intégralité du catalogue actuel, d’Appica ou de LINE.
- Faire de Supermarket une application de production ou reproduire un backend distributeur complet.
- Déployer une architecture opérationnelle de production non nécessaire aux objectifs de référence.
- Publier des dark modes clients sans source fiable.
- Créer un système universel de slots ou de forks clients.
- Créer immédiatement un package de domaine headless.
- Utiliser Storybook comme expérience documentaire principale.
- Créer Atlas avant que la spec et le worktree V2 soient prêts.
- Nettoyer, supprimer ou réaligner les changements du worktree principal.

## Further Notes

### Catalogue initial indicatif

Le noyau initial comprend :

- actions : Button, IconButton, Link ;
- formulaires : Field, Input, Textarea, Checkbox, RadioGroup, Toggle, Select, Stepper, Autocomplete ;
- contenus et statuts : Avatar, Badge, Tag, Chip, Separator et décision ultérieure sur Surface/Card ;
- feedback : Alert, Toast, Spinner, Skeleton, Progress ;
- overlays : Dialog, AlertDialog, Drawer, BottomSheet, Popover, Tooltip, DropdownMenu ;
- navigation locale : Tabs, SegmentedControl, Pagination.

Ce catalogue est une direction de reconstruction, pas l’autorisation d’implémenter tous les composants dans une seule tranche.

### Points à résoudre dans les specs de livraison

- Premier parcours vertical Supermarket.
- Inventaire exhaustif des tokens de la première fondation.
- Contrat public final de Surface et Card.
- API, variants et états précis de chaque composant engagé.
- Outil de génération des tokens.
- Rôle éventuel de Storybook comme harness secondaire.
- Preuve nécessaire avant création d’un module de domaine headless.

### Ordre de travail

1. Relire et approuver l’artefact écrit de cette spec directrice.
2. Préserver les changements du worktree principal et créer le worktree V2 isolé.
3. Créer et configurer Atlas dans ce worktree.
4. Réaliser l’audit technique de la fondation actuelle.
5. Décomposer le programme en specs de livraison séquencées.
6. Commencer par la spec exhaustive des tokens nécessaires à la première tranche.
7. Obtenir l’approbation humaine de cet inventaire.
8. Produire le plan technique puis implémenter et vérifier la tranche.
