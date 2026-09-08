# Décisions — Reconstruction stable et multi-brand de DS.MD

**Statut :** décisions de cadrage validées

**Date :** 2026-09-08

## Repository et migration

1. Conserver le repository DS.MD existant.
2. Ne pas créer de fork.
3. Ne pas casser ni réaligner brutalement le worktree principal chargé.
4. Créer une branche `rebuild/v2` et un worktree `.worktrees/v2` après validation de la spec directrice.
5. Conserver l’ancien système comme référence pendant la reconstruction.
6. Inventorier chaque composant comme : reconstruire, fusionner, remplacer, supprimer ou différer.
7. Reconstruire ensuite par tranches verticales guidées par les premiers parcours Supermarket.

## Architecture cible

1. Un package canonique de tokens alimente le `ui-kit` et `mealz-ui`.
2. Le `ui-kit` contient les primitives génériques, accessibles et sans connaissance du domaine Mealz.
3. `mealz-ui` contient les composants et interactions métier réutilisables.
4. Supermarket porte routing, scénarios, persistance locale, shells, overlays de données et orchestration.
5. Le portail Hub devient un ensemble de liens vers les ressources et outils.
6. Un Lab séparé peut accueillir les explorations exceptionnelles et jetables.
7. Un package de domaine headless ne sera créé que si plusieurs consommateurs démontrent un besoin partagé réel.

## Axes multi-brand

Les différences clientes sont séparées en quatre axes :

1. **Brand** — couleurs, typographies, radius, focus, ombres et assets approuvés.
2. **Shell** — navigation, compte, magasin, catégories, panier et framing mobile.
3. **Data overlay** — prix, disponibilité, mapping de catégories et libellés distributeur.
4. **Experience profile** — rares variantes ou compositions explicitement supportées.

Les routes et données canoniques restent communes lorsque la comparaison des expériences ne nécessite pas une divergence réelle.

## Tokens

1. Une seule autorité canonique, répartie en fichiers spécialisés dans un même package.
2. Mealz est le thème Neutral et définit le contrat complet.
3. Toutes les marques utilisent les mêmes identifiants sémantiques.
4. Les clients déclarent uniquement leurs valeurs différentes et héritages approuvés.
5. Les sorties clientes sont entièrement résolues.
6. Les sorties prévues couvrent CSS, TypeScript, Tailwind, Figma et catalogue documentaire.
7. Les thèmes suivent les statuts `draft`, `validated` et `experimental`.
8. Un fallback Mealz est autorisé en `draft`, interdit en `validated`.
9. Un héritage Mealz explicitement approuvé n’est pas un fallback.
10. La palette utilise les niveaux 50 à 950 ; le niveau 500 officiel reste immuable.
11. Les palettes générées en OKLCH sont des candidats à vérifier, approuver puis figer.
12. Un changement Mealz hérité déclenche une revue d’impact multi-brand bloquante.

## Gate humain sur les tokens

1. Cette spec directrice ne crée ni ne valide aucun token concret.
2. Avant toute implémentation, chaque spec de tokens doit inventorier exhaustivement chaque token proposé.
3. Chaque entrée doit exposer : identifiant canonique, catégorie, type, rôle, alias, dépendances, valeurs Mealz, valeurs ou héritages clients, projections, provenance et statut.
4. Raphaël doit approuver explicitement cet inventaire.
5. Aucun token absent de l’inventaire approuvé ne peut être ajouté par l’Engineer.
6. Toute modification ultérieure de l’inventaire repasse par le même gate.
7. La génération et les tests doivent détecter les divergences entre inventaire approuvé et sorties produites.

## Figma

1. Une bibliothèque DS distincte est publiée par client.
2. Toutes les bibliothèques exposent le même contrat public : collections, variables, types, styles de texte, composants, propriétés, états et variants.
3. Les valeurs et structures internes peuvent différer.
4. Les identifiants canoniques du code sont projetés vers des noms adaptés à Figma.
5. Figma peut exposer `Body` et `Body Bold` comme styles séparés tandis que le code les compose à partir de primitives communes.
6. La reconstruction débute code-first, puis les fondations stabilisées sont synchronisées vers Figma.

## Composants et catalogue

1. Appica est la référence principale pour les API, anatomies, variants et expérience documentaire.
2. LINE, les usages existants et les parcours Mealz déterminent la pertinence produit.
3. Un variant de référence n’entre dans l’API publique que si un besoin Mealz ou client le justifie.
4. Les primitives de navigation appartiennent au `ui-kit` ; les compositions complètes appartiennent aux shells.
5. `Dialog` remplace le nom historique `Modal` et possède un comportement modal par défaut.
6. `AlertDialog`, `Popover`, `Drawer` et `BottomSheet` conservent des responsabilités distinctes.
7. `Toggle`, `Autocomplete` et `Pagination` font partie du noyau initial.
8. Une Card est une Surface spécialisée, mais toute Surface n’est pas une Card.
9. La présence publique de `Surface`, de `Card` ou des deux sera décidée avec l’architecture de tokens et les usages des premières tranches.

## Documentation

1. L’expérience principale est une documentation custom inspirée d’Appica.
2. Elle présente preview réelle, `Preview / Code`, personnalisation, variants, états, exemples, tokens consommés et liens Figma.
3. Storybook peut rester un harness technique secondaire, sans devenir l’UX documentaire principale.
4. Les bibliothèques partagées documentent architecture, contribution, qualité et ADR.

## Validation

Le seam principal est une matrice contractuelle intégrée :

1. inventaire de tokens approuvé ;
2. sorties générées conformes et totalement résolues ;
3. même contrat public dans chaque thème validé ;
4. matrice représentative de composants, variants et états ;
5. scénarios Supermarket démontrant l’intégration réelle ;
6. vérification du clavier, du responsive, de l’accessibilité et des états décisifs.

## Atlas

1. Atlas est un Staff Engineer permanent combinant architecture, planification et implémentation.
2. Son identité professionnelle ne mentionne ni DS.MD ni V2.
3. Son affectation projet vient du worktree, des règles du repository et des specs.
4. Le profil est créé avec Fresh/Create empty après la spec et le worktree V2.
5. Un seul Engineer permanent intervient pendant la phase fondatrice.
6. Zeus conserve le produit, Raphaël avec Apollon ou Dédale l’intention UX/UI, et Minos le verdict QA indépendant.
7. `ui-ux-pro-max` est disponible uniquement pour contrôler une implémentation UI validée ; il ne peut pas réinventer le design.

## Points ouverts non bloquants

- Contrat public final de `Surface` et `Card`.
- Premier parcours vertical Supermarket.
- APIs et variants détaillés de chaque composant.
- Outil exact de génération des tokens.
- Rôle éventuel de Storybook comme harness secondaire.
- Seuil justifiant un package de domaine headless.
- Skills optionnelles ajoutées ultérieurement à Atlas.

Ces points doivent être résolus dans les specs de livraison avant l’implémentation concernée.
