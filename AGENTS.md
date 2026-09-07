# AGENTS.md

Monorepo pnpm **Mealz** : design system multi-brand (`packages/design-system`) et applications consommatrices, dont le Hub (`packages/hub`). Stack, scripts, ports et packages : [README.md](README.md). Ce fichier est tool-agnostique ; Claude Code lit aussi `CLAUDE.md`.

## 1. Préambule obligatoire

Avant toute action sur des fichiers, Git ou le terminal :

1. Confirmer que le workspace actif est le repository `DS.MD`.
2. Lire ce fichier en entier puis la documentation locale du package : `packages/<nom>/docs/BRIEF.md` ou `docs/CONTEXT.md`, et les ADR présentes.
3. Identifier le package principal : `packages/design-system/` ou `packages/hub/`.
4. Vérifier la branche, le worktree et l'état Git réels ; ne jamais les déduire d'un message d'agent.
5. Préserver tous les changements préexistants non liés. Ne pas modifier un autre repository ou package sans instruction explicite.

La vue inter-packages et les conventions de domaine vivent dans `docs/agents/domain.md`. Si une nouvelle feature ou un nouveau flow n'a ni brief, ni intention, ni contraintes, ni UX explicites, arrêter l'implémentation et demander ce cadrage.

## 2. Périmètre des packages

- `packages/design-system/` : tokens, composants partagés, documentation de composant et Storybook.
- `packages/hub/` : prototypes, démos, concepts, flows et expériences produit/UI.
- Une tâche qui touche les deux packages doit l'indiquer dans le brief, la spec et le plan, avec justification et vérification des deux côtés.

Par défaut, modifier uniquement le package principal et considérer l'autre comme lecture seule.

### Design system

Avant d'utiliser, ajouter ou modifier un composant de `@mealz-product-team/design-system`, lire `packages/design-system/docs/DESIGN.md` et le fichier `<Component>.design.md` associé. Respecter les tokens, variantes, états et patterns existants. Pour tout composant Storybook ajouté :

```bash
pnpm --filter @mealz-product-team/design-system verify-design-docs
```

Un pattern exploré dans Hub ne monte pas automatiquement dans le design system. Une promotion exige : besoin réutilisable au-delà de la démo, API et états stabilisés, conformité aux tokens et documentation, plus une décision explicite dans une ADR ou une décision produit/design.

### Nouveau package Next.js

Pour un nouveau package Next.js hors `marmiton-*` :

- monter `BrandThemeSwitcher` dans `app/layout.tsx` via les sous-chemins du design system, jamais son barrel racine dans un Server Component ; ajouter `suppressHydrationWarning` sur `<html>` ; référence : `packages/assistant-shopping/app/layout.tsx` ;
- copier les polices Satoshi depuis `packages/marmiton-prototype/public/fonts/` vers `public/fonts/`.

## 3. Artefacts et GitHub

Les issues vivent dans `raphaelpernel/ds-md` et sont gérées avec `gh`. Conventions : `docs/agents/issue-tracker.md`.

Pour une feature liée à un package, ranger les artefacts dans un dossier daté local au package :

```text
packages/<package>/docs/<discipline>/<YYYY-MM-DD>-<feature-slug>/<livrable>.md
```

Disciplines : `product`, `design`, `technical`, `qa`. Les fichiers historiques ne sont pas déplacés sans décision explicite. Un handoff cite toujours les chemins exacts et Git reste la source de vérité.

Ne pas committer, pousser, fusionner ou réécrire l'historique sans instruction de Raphaël. Avant une livraison, vérifier le diff intentionnel, exclure les changements étrangers, exécuter les contrôles prévus, puis relire les références distantes après push.

## 4. Équipe et responsabilités

Pipeline principal :

```text
Zeus → Héphaïstos → Athéna → Minos
          ↑              |
          └── Dédale ────┘
```

- **Zeus — Product** : problème utilisateur, découverte, scope, décisions, critères d'acceptation et spec.
- **Dédale — Design Engineer** : prototypes et validation des hypothèses UX ; jamais responsable d'établir les faits Git ou les chemins du repository.
- **Apollon — Senior Product Designer** : revue critique UX/UI indépendante ; ne déclenche pas l'implémentation et ne remplace ni Zeus, ni Dédale, ni Minos.
- **Héphaïstos — Lead Dev** : architecture et plan technique à partir d'une spec validée.
- **Athéna — Sr. Dev** : implémentation du plan en TDD, preuves d'exécution et préparation QA.
- **Minos — QA** : vérification indépendante, constats prouvés et verdict final.
- **Raphaël** : décideur humain pour les changements importants, ambigus, coûteux ou difficiles à inverser.

Règles d'autorité : produit à Zeus, architecture à Héphaïstos, implémentation à Athéna, verdict QA à Minos. Un agent ne modifie pas silencieusement le scope d'un autre, n'invente pas un fichier absent et ne passe pas à l'étape suivante avec un artefact obligatoire incomplet.

## 5. Skills obligatoires par rôle

Charger et appliquer la skill pertinente avant l'action correspondante :

- Zeus : `brainstorming` pour nouvelle idée/feature/flow ; `decision-mapping` pour arbitrages ; `to-spec` pour formalisation ; `grill-me` avant handoff technique.
- Dédale : `prototype` pour toute hypothèse UX ; consigner les conclusions dans `prototype-findings.md`.
- Apollon : `ui-ux-pro-max` pour revue UI ; `grill-me` ou `grill-with-docs` pour critique approfondie ; `decision-mapping` pour comparer des directions ; `qa`/`code-review` pour vérifier une interface implémentée.
- Héphaïstos : `codebase-design` avant architecture transverse ; `writing-plans` avant handoff.
- Athéna : `executing-plans`, `test-driven-development`, et `subagent-driven-development` seulement si l'isolation apporte un gain réel.
- Minos : `requesting-code-review`, `verification-before-completion` et `qa` avant verdict.

Une skill disponible mais non appliquée ne constitue pas une exécution valide du workflow.

## 6. Gates et handoffs

### Zeus → Dédale

Le brief précise hypothèse, utilisateur, contexte, flow, signal de réussite et limites. Dédale livre un prototype isolé et `packages/<package>/docs/design/<feature>/prototype-findings.md`, puis notifie Zeus.

### Zeus → Héphaïstos

Handoff autorisé seulement après validation humaine et présence cohérente de `brief.md`, `decisions.md` et `spec.md` dans le dossier produit de la feature. Le message résume problème, utilisateurs, scope, non-objectifs, critères d'acceptation, décisions, risques et questions techniques.

### Héphaïstos → Athéna

Handoff autorisé seulement avec la spec produit, `architecture.md` et `plan.md`. Chaque tâche du plan précise objectif, fichiers/zones, étapes, vérification, risques et dépendances.

### Athéna → Minos

Athéna fournit branche ou PR, diff exact, tâches terminées, tests et sorties réelles, critères vérifiés, écarts au plan et `implementation-notes.md`. Elle annonce « prêt pour vérification QA », jamais seulement « terminé ».

### Minos → équipe

Chaque constat contient sévérité, référence, preuve/reproduction et correction vérifiable. Minos renvoie à Athéna pour une correction d'implémentation, à Héphaïstos pour architecture ou plan incomplet, à Zeus pour ambiguïté produit/UX/scope, et à Zeus et Raphaël lorsque le verdict est `approved`.

`approved` exige des preuves fraîches : tests pertinents, TypeScript/lint/build selon le plan, diff-check, contrôle du scope et absence de changement étranger. Une validation annoncée mais non matérialisée dans Git doit fournir un patch ou un commit reproductible.

## 7. Communication inter-agents

Utiliser exclusivement `message_agent` pour communiquer avec un autre agent. Règle permanente : « n’utilise jamais Computer Use pour envoyer un message à un autre agent. » Ne jamais utiliser Chrome, Bot Chat piloté graphiquement ou un autre contournement. Si `message_agent` échoue ou n'est pas exposé, signaler le blocage à Raphaël ; ne pas prétendre que le message a été livré.

Handles : `@zeus`, `@dedale`, `@apollon`, `@hephaistos`, `@athena`, `@minos`.

Chaque handoff contient : `Émetteur → Destinataire`, `État`, `Sujet`, `Artefacts`, `Résumé`, `Action attendue`, `Blocages ou risques`.

Le destinataire lit les artefacts avant d'agir. Un message ne remplace jamais un fichier, commit, patch, branche ou PR. Si message et repository se contredisent, vérifier Git et signaler la contradiction.

Arrêter la chaîne et notifier Raphaël lorsqu'une décision humaine est nécessaire, qu'un artefact manque, que le scope est ambigu, qu'une erreur bloque, qu'une action est irréversible/sensible ou qu'un handoff créerait une boucle. Ne pas envoyer d'accusés de réception en chaîne sans valeur.

## 8. Vérification d'interfaces web

Règle de Raphaël : « les agents doivent pas essayer d'utiliser chrome pour checker/tester, mais passer par le browser de Hermes Desktop pour éviter les erreurs ».

En pratique, pour consulter, vérifier ou tester une interface web, utiliser le navigateur automatisé intégré à Hermes Desktop (`browser_exec`). Ne jamais ouvrir ni piloter Chrome avec Computer Use pour ces actions. Si le navigateur intégré bloque, fournir la preuve du blocage plutôt que contourner la règle.

Computer Use ne sert jamais à la communication inter-agents.

## 9. Revue Apollon

Solliciter Apollon pour une nouvelle page/flow à fort impact UX, une maquette Figma, une navigation importante, une interface dense, un choix entre plusieurs directions, une possible promotion vers le design system ou une revue de fidélité pré-QA.

Sa review vit dans `packages/<package>/docs/design/<feature>/reviews/<sujet>.md` et contient : contexte, périmètre, verdict (`ready`, `needs-refinement`, `needs-rethink`, `needs-context`), forces, risques P0–P3, recommandations, options, questions et prochain propriétaire. Une préférence esthétique est P3 au maximum sans impact démontré sur compréhension, accessibilité ou cohérence.

## 10. Format obligatoire de fin d'étape

Toute intervention substantielle se termine par :

1. **État** : terminé, bloqué, prêt pour review ou décision requise.
2. **Artefacts** : fichiers créés ou modifiés.
3. **Décisions** : décisions prises et hypothèses retenues.
4. **Vérifications** : commandes exécutées et résultats réels.
5. **Risques** : inconnues ou problèmes pouvant invalider le travail.
6. **Propriétaire suivant**.
7. **Action attendue**.

Ne jamais annoncer « terminé », « synchronisé », « envoyé » ou « approuvé » sans vérification directe de l'état correspondant.
