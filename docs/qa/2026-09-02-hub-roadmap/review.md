# Review QA — Hub roadmap

Date : 2026-09-02
Branche : `feat/hub-roadmap`
Worktree : `F:/Workspace/Mealz/CLAUDE/Projects/DS.MD/.worktrees/feat-hub-roadmap`
Base examinée : `dev` (`30a06982ebbc4f090ad8931e799a3048eb6b81fb`)
Package principal : `packages/hub/`

## Critères parcourus

- Registre et galeries Neutral, Marmiton et CoursesU : vérifiés.
- Routes préfixées Neutral et CoursesU : vérifiées par tests, build et requêtes HTTP.
- Planner partagé, état, reset et exclusivité des régimes : vérifiés par tests.
- Supermarket réutilisant le Planner : routes et rendu vérifiés.
- Guide dérivé des 35 fichiers `.design.md`, whitelist des slugs, liens GitHub relatifs et URL Storybook configurable : vérifiés par tests, lecture du code et rendu.
- Assets namespacés et packages sources inchangés : vérifiés par Git.
- Shell master et vue client externe : échec sur les routes statiques CoursesU imbriquées en session master.

### P1 — La déclinaison CoursesU perd le shell master

**Référence :**
- Spec : `docs/superpowers/specs/2026-09-01-hub-multi-client-design.md:55-62` — le shell interne et sa sidebar sont visibles en session master ; chaque groupe client liste ses prototypes.
- Plan : tâche annoncée « Assistant Shopping CoursesU » ; aucun plan versionné correspondant n’a été trouvé.
- Code : `packages/hub/app/(client)/coursesu/assistant-shopping/layout.tsx:1-13` ; comparaison avec `packages/hub/app/(client)/marmiton/layout.tsx:1-10` et `packages/hub/src/components/ClientNamespaceShell/ClientNamespaceShell.tsx:14-23`.

**Constat :**
Le dossier statique `/coursesu/assistant-shopping/*` n’est pas enveloppé par `ClientNamespaceShell`. Next.js ne lui applique pas le layout dynamique `(client)/[client]`. En session master, la galerie `/coursesu` affiche donc la sidebar, mais celle-ci disparaît dès l’ouverture du prototype ou de ses sous-routes.

**Preuve / reproduction :**
1. Démarrer Hub avec des variables QA et utiliser un cookie `hub_master` signé valide.
2. Charger `/coursesu`, puis `/coursesu/assistant-shopping` et `/coursesu/assistant-shopping/chat`.
3. Résultat observé dans le HTML et dans une capture Chrome headless : `/coursesu` contient `.hub-sidebar`; les deux routes du prototype n’en contiennent aucune. Les routes Marmiton de contrôle conservent la sidebar.

Sortie observée :

- `/coursesu` → `sidebar=present`
- `/coursesu/assistant-shopping` → `sidebar=absent`
- `/coursesu/assistant-shopping/chat` → `sidebar=absent`
- `/marmiton/recipe` → `sidebar=present`

**Impact :**
La navigation interne unifiée promise à l’équipe est interrompue au sein du prototype CoursesU. L’utilisateur master perd l’accès direct à Neutral, Guide et aux autres espaces et doit utiliser l’historique du navigateur.

**Action demandée :**
Envelopper l’arbre statique CoursesU avec `ClientNamespaceShell` au niveau approprié, sans exposer la sidebar aux sessions authentifiées uniquement comme client CoursesU. Ajouter un test de régression couvrant les deux contextes : cookie master → shell présent ; cookie client seul → shell absent.

**Verdict :**
blocking

### P1 — Les fonds du Planner sont namespacés mais jamais fournis au composant

**Référence :**
- Spec : migration fonctionnelle des protos Neutral, `docs/superpowers/specs/2026-09-01-hub-multi-client-design.md:72-79`.
- Plan : tâches annoncées « Planner partagé + Form Mealz Planner » et « Supermarket réutilisant Planner ».
- Code : `packages/hub/src/features/mealz-planner/pages/Entry.tsx:14-17`, `packages/hub/src/features/supermarket/pages/CatalogPage.tsx` (usage `PlannerBanner`), `packages/design-system/src/components/ui/product/PlannerBanner/PlannerBanner.tsx:61-80`, `PlannerBanner.design.md:54-57,93-95`.

**Constat :**
Les quatre PNG ont été copiés sous `/prototypes/mealz-planner/` et `/prototypes/supermarket/`, mais les deux consommateurs laissent `PlannerBanner` utiliser ses valeurs par défaut `/img/planner-banner-bg-{mobile,desktop}.png`. Ces chemins n’existent pas dans Hub.

**Preuve / reproduction :**
1. Démarrer Hub et charger `/neutral/form-mealz-planner`, puis `/neutral/supermarket`.
2. Observer les requêtes réseau du serveur.
3. Résultat observé : `GET /img/planner-banner-bg-mobile.png 404` et `GET /img/planner-banner-bg-desktop.png 404`. La capture du Planner montre une bannière blanche, sans le fond attendu.

**Impact :**
Les deux migrations affichent un composant visuellement incomplet. Le problème est silencieux au build et contredit explicitement le Do/Don’t de `PlannerBanner.design.md`.

**Action demandée :**
Passer `backgroundImageMobile` et `backgroundImageDesktop` avec les chemins namespacés propres à chaque montage, puis ajouter une vérification qui échoue si les URLs d’assets rendent 404.

**Verdict :**
blocking

### P1 — Le montage « Neutral » contient encore une expérience et une logique client-spécifiques

**Référence :**
- Spec : `docs/superpowers/specs/2026-09-01-hub-multi-client-design.md:42-47` — un proto neutre peut être décliné avec uniquement la brand du layout qui change ; son contenu ne doit pas porter de copie ou logique spécifique à un client.
- Plan : tâche annoncée « Assistant Shopping Neutral » et déclinaison CoursesU ; aucun plan versionné correspondant n’a été trouvé.
- Code : `packages/hub/app/(master)/neutral/assistant-shopping/page.tsx:5-8`, `packages/hub/src/features/assistant-shopping/context/AssistantContext.tsx:130-133,208-224,235-252`, `packages/hub/src/features/assistant-shopping/components/assistant/CoursesUDemoLayout.tsx:8-35`.

**Constat :**
Le montage `/neutral/assistant-shopping` réutilise explicitement le layout et les placeholders CoursesU. Dans le cœur partagé, le comportement change selon que la brand est retailer : Neutral exige la sélection d’un magasin Carrefour et affiche des messages Carrefour, tandis que CoursesU contourne cette étape. La déclinaison ne se limite donc pas à un changement de brand.

**Preuve / reproduction :**
1. Charger `/neutral/assistant-shopping` avec une session master.
2. Observer la page d’accueil et déclencher une action d’ajout sans magasin.
3. Résultat observé : le rendu affiche « Bannière promo — placeholder CoursesU » et les assets `coursesu-*-placeholder.svg`; le code pousse « Sélectionnez votre magasin Carrefour » pour Neutral, comportement absent sous CoursesU via `isRetailerBrand`.

**Impact :**
L’espace présenté comme neutre expose une marque et une logique partenaire précises. Le même prototype ne se comporte pas uniquement par thémage lorsqu’il est décliné, contrairement au contrat de réutilisation de la spec.

**Action demandée :**
Rendre le montage Neutral réellement agnostique : assets/copie neutres et logique sans client codé en dur. Si une divergence fonctionnelle CoursesU est volontaire, la modéliser comme configuration explicite du montage et faire documenter cette dérogation dans la spec avant nouvelle QA.

**Verdict :**
blocking

### P2 — Les nouveaux messages du chat ne sont pas annoncés aux technologies d’assistance

**Référence :**
- Spec : qualité et accessibilité du prototype partagé ; aucune dérogation documentée.
- Plan : tâche annoncée « Assistant Shopping Neutral/CoursesU ».
- Code : `packages/hub/src/features/assistant-shopping/components/chat/ChatShell/ChatShell.tsx:41-58`.

**Constat :**
L’historique reçoit dynamiquement des messages après une saisie, mais son conteneur n’a ni rôle `log`, ni `aria-live`, ni `aria-relevant`. Seul l’indicateur de chargement porte `role="status"`.

**Preuve / reproduction :**
1. Ouvrir le chat avec un lecteur d’écran.
2. Envoyer une suggestion ou un message.
3. Résultat observé dans le DOM : un nouveau `ChatMessage` est ajouté, sans région live pour annoncer la réponse ; la recherche `aria-live` dans la feature ne retourne aucun résultat.

**Impact :**
Un utilisateur de lecteur d’écran n’est pas informé de l’arrivée de la réponse et doit retrouver manuellement le nouveau contenu.

**Action demandée :**
Donner à l’historique la sémantique de journal conversationnel appropriée (`role="log"`, nom accessible et politique live pertinente), puis ajouter un test vérifiant l’annonce des nouveaux messages sans réannoncer tout l’historique.

**Verdict :**
non-blocking

### P1 — Handoff QA incomplet et non traçable dans le repository

**Référence :**
- Spec : processus `AGENTS.md`, section « Athéna → Minos ».
- Plan : les « tâches 1–7 » sont mentionnées dans le message de handoff, mais aucun `plan.md` correspondant n’est présent dans le worktree.
- Code : repository entier ; aucune occurrence de `implementation-notes.md`, aucun dossier `docs/technical/<feature>/` et aucun dossier `docs/product/<feature>/` trouvé.

**Constat :**
Le handoff ne fournit pas l’artefact obligatoire `docs/technical/<feature>/implementation-notes.md`, ni le chemin du plan dont les tâches 1–7 auraient été exécutées. Le diff est en outre entièrement non commité, avec la majorité de l’implémentation non suivie, ce qui rend la référence `dev...HEAD` vide pour ces fichiers.

**Preuve / reproduction :**
1. Rechercher `implementation-notes.md`, `docs/technical/**/plan.md` et les documents de feature dans le worktree.
2. Exécuter `git log dev..HEAD --oneline`, `git diff --stat dev...HEAD` et `git status --short`.
3. Résultat observé : aucun artefact d’implémentation/plan de cette migration, aucun commit de branche, et l’implémentation apparaît principalement sous `??`.

**Impact :**
Les écarts au plan, décisions de migration et limites acceptées ne sont pas auditables depuis la source de vérité du projet. Le gate de validation défini par le repository n’est pas satisfait.

**Action demandée :**
Ajouter les notes d’implémentation obligatoires et identifier/versionner le plan exécuté, avec tâches terminées, écarts, décisions, risques et preuves. Stabiliser ensuite le diff dans un état reviewable (au minimum tous les fichiers intentionnels suivis ; commit/PR selon le workflow choisi) avant nouvelle soumission QA.

**Verdict :**
blocking

## Re-vérification ciblée — 2026-09-02

Corrections confirmées :

- `/coursesu/assistant-shopping/*` monte désormais `ClientNamespaceShell`. Preuve runtime : session master → sidebar présente ; cookie CoursesU seul → sidebar absente.
- Le montage Neutral utilise désormais `AssistantShoppingDemoLayout`, les assets `neutral-*` et des formulations génériques. La copie client-spécifique est corrigée, mais la divergence fonctionnelle fondée sur la brand reste ouverte ci-dessous.
- `ChatShell` expose `role="log"`, `aria-live="polite"` et `aria-relevant="additions text"`.
- `plan.md` et `implementation-notes.md` existent désormais.
- Le `PlannerBanner` de Supermarket utilise les deux chemins `/prototypes/supermarket/*` et répond 200.

### P1 — Le fond du Form Mealz Planner rend toujours 404

**Référence :**
- Spec : migration fonctionnelle des protos Neutral, `docs/superpowers/specs/2026-09-01-hub-multi-client-design.md:72-79`.
- Plan : `docs/technical/2026-09-02-hub-roadmap/plan.md:10,14,18-20`.
- Code : `packages/hub/src/features/mealz-planner/pages/Entry.tsx:14-17` ; `packages/design-system/src/components/ui/product/PlannerBanner/PlannerBanner.design.md:54-57,93-95`.

**Constat :**
La correction des chemins a été appliquée à Supermarket, mais pas à la page d’entrée du Form Mealz Planner. `Entry.tsx` laisse encore `PlannerBanner` utiliser `/img/planner-banner-bg-mobile.png` et `/img/planner-banner-bg-desktop.png`.

**Preuve / reproduction :**
1. Démarrer Hub et charger `/neutral/form-mealz-planner` dans Chrome.
2. Collecter les réponses réseau contenant `planner-banner-bg`.
3. Résultat observé : `http://localhost:3014/img/planner-banner-bg-mobile.png` → HTTP 404. Contrôle : `/neutral/supermarket` demande `/prototypes/supermarket/planner-banner-bg-mobile.png` → HTTP 200.

**Impact :**
Le Form Mealz Planner reste visuellement incomplet ; l’un des blocages de la première review n’est que partiellement corrigé.

**Action demandée :**
Passer à `PlannerBanner` les props `/prototypes/mealz-planner/planner-banner-bg-mobile.png` et `/prototypes/mealz-planner/planner-banner-bg-desktop.png`, puis vérifier les deux variantes de viewport sans 404.

**Verdict :**
blocking

### P1 — La déclinaison Assistant Shopping conserve une divergence fonctionnelle pilotée par la brand

**Référence :**
- Spec : `docs/superpowers/specs/2026-09-01-hub-multi-client-design.md:42-47` — un proto neutre décliné change uniquement de brand ; son contenu et sa logique ne sont pas spécifiques à un client.
- Plan : `docs/technical/2026-09-02-hub-roadmap/plan.md:9,12,20`.
- Code : `packages/hub/src/features/assistant-shopping/context/AssistantContext.tsx:26-29,67-70,208-224,235-252` et `packages/hub/src/features/assistant-shopping/components/chat/ChatShell/ChatShell.tsx:20,31-39`.

**Constat :**
Les noms Carrefour/CoursesU ont été retirés du montage Neutral, mais `useIsRetailerBrand()` continue de modifier le fonctionnement partagé. Une brand retailer saute la sélection de magasin et masque le bandeau magasin ; Neutral exige cette sélection avant l’ajout. La déclinaison n’est donc toujours pas limitée au thème.

**Preuve / reproduction :**
1. Ouvrir le même assistant sous `/neutral/assistant-shopping` puis `/coursesu/assistant-shopping`.
2. Sans magasin sélectionné, déclencher l’ajout d’une recette ou de produits.
3. Neutral crée une action en attente et ouvre `store-locator`; CoursesU ajoute directement. En mode embarqué, `ChatShell` masque aussi `ChatShellActionsBar` lorsque `isRetailerBrand` vaut vrai.

**Impact :**
Le contrat de partage défini par la spec reste enfreint. Une brand CSS pilote une règle métier, sans dérogation produit ou architecture documentée.

**Action demandée :**
Soit rendre le comportement identique entre les deux montages, soit obtenir une décision produit explicite et mettre à jour la spec/architecture pour introduire une configuration de montage dédiée, distincte de la brand.

**Verdict :**
blocking

### P1 — Le plan ajouté ne satisfait pas le format exécutable requis

**Référence :**
- Spec : `AGENTS.md`, section « Héphaïstos → Athéna » — chaque tâche doit préciser objectif, fichiers/zones, étapes, vérification, risques et dépendances.
- Plan : `docs/technical/2026-09-02-hub-roadmap/plan.md:6-24`.
- Code : état Git de `feat/hub-roadmap`.

**Constat :**
Le fichier ajouté est un résumé rétrospectif d’une ligne par tâche. Il ne fournit pas, pour chacune des tâches 1–7, les fichiers concernés, étapes d’implémentation, vérifications attendues, risques et dépendances. De plus, `git log dev..HEAD` reste vide et les artefacts ainsi que l’essentiel de l’implémentation restent non suivis (`??`), donc le diff de branche n’est toujours pas matérialisé.

**Preuve / reproduction :**
1. Lire `docs/technical/2026-09-02-hub-roadmap/plan.md`.
2. Comparer ses tâches aux champs obligatoires d’`AGENTS.md`.
3. Exécuter `git log dev..HEAD --oneline` et `git status --short` : aucun commit ; `docs/technical/`, `docs/qa/` et la majorité des nouveaux fichiers Hub sont non suivis.

**Impact :**
La traçabilité a progressé, mais le gate Athéna → Minos n’est pas encore démontré par un plan exécutable et un diff de branche stable.

**Action demandée :**
Compléter les sept tâches avec les champs requis et stabiliser tous les fichiers intentionnels dans le diff de branche avant la prochaine demande de verdict final.

**Verdict :**
blocking

### P2 — Les corrections shell et région live ne disposent pas de tests de régression ciblés

**Référence :**
- Spec : actions demandées dans la première review, lignes 44-45 et 116-117 du présent document.
- Plan : `docs/technical/2026-09-02-hub-roadmap/implementation-notes.md:14-20`.
- Code : `packages/hub/src/components/ClientNamespaceShell/ClientNamespaceShell.test.tsx`, tests Assistant Shopping.

**Constat :**
La suite reste à 169 tests. Le test existant de `ClientNamespaceShell` vérifie le composant isolé, pas que le layout statique CoursesU le monte. Aucun test ne vérifie `role="log"` et ses attributs live sur `ChatShell`.

**Preuve / reproduction :**
1. Rechercher `role.*log`, `aria-live`, `aria-relevant` et le layout CoursesU dans les fichiers `*.test.tsx`.
2. Relancer la suite Hub.
3. Résultat observé : aucune assertion correspondante ; 169 tests, nombre inchangé par rapport à la première review.

**Impact :**
Les corrections fonctionnent aujourd’hui mais peuvent régresser sans signal automatisé.

**Action demandée :**
Ajouter un test d’intégration du layout CoursesU ou équivalent, et un test DOM ciblé sur la région live du chat.

**Verdict :**
non-blocking

## Verdict final — re-vérification

`changes-requested`

## Deuxième re-vérification ciblée — 2026-09-02

Corrections confirmées :

- Le Form Mealz Planner consomme maintenant les fonds mobile et desktop sous `/prototypes/mealz-planner/`; les deux ressources répondent HTTP 200.
- Neutral et CoursesU rendent tous deux le bandeau de sélection de magasin. `AssistantProvider` applique la même règle de store locator aux deux montages (`isRetailerBrand` vaut toujours `false`).
- Les sept tâches du plan comportent désormais objectif, zones, étapes, vérification et risques/dépendances.
- Les 166 fichiers intentionnels sont suivis dans l’index ; aucun fichier n’est non suivi, aucun artefact `.next` n’est ajouté et les packages sources restent inchangés.

### P2 — La suppression de la divergence métier laisse une API contradictoire et du code mort

**Référence :**
- Spec : `docs/superpowers/specs/2026-09-01-hub-multi-client-design.md:42-47`.
- Plan : `docs/technical/2026-09-02-hub-roadmap/plan.md:23-37`.
- Code : `packages/hub/src/features/assistant-shopping/context/AssistantContext.tsx:25-29,67-70,209-253,278-337`, `components/chat/ChatShell/ChatShell.tsx:20,31-36`, `ChatShellHeader.tsx:11,24-28`, `ChatShellActionsBar.tsx:7-12` et `lib/brand.ts:1-25`.

**Constat :**
Le comportement courant est aligné en forçant `isRetailerBrand = false`, mais l’interface et les commentaires affirment encore qu’un retailer saute la sélection de magasin. Les branches conditionnelles correspondantes restent dans le provider et trois composants ; `useIsRetailerBrand` n’a plus aucun consommateur.

**Preuve / reproduction :**
1. Rechercher les imports de `lib/brand` : aucun consommateur n’est trouvé.
2. Rechercher `isRetailerBrand` : la valeur est constante mais continue de conditionner le store locator et le bandeau.
3. Charger les routes Neutral et CoursesU : le bandeau est présent dans les deux, confirmant que les branches retailer sont désormais mortes.

**Impact :**
Le comportement utilisateur est corrigé, mais le contrat de code est trompeur et permet de réintroduire la non-conformité à la spec par un simple changement de constante.

**Action demandée :**
Retirer `isRetailerBrand` du contexte et des consommateurs, simplifier les conditions de sélection de magasin, puis supprimer `lib/brand.ts` s’il n’a plus d’usage.

**Verdict :**
non-blocking

### P2 — Les tests de régression ciblés restent absents

**Référence :**
- Spec : actions demandées dans la première review.
- Plan : `docs/technical/2026-09-02-hub-roadmap/implementation-notes.md:14-20`.
- Code : suite de tests de `packages/hub`.

**Constat :**
La suite reste à 169 tests. Aucun test n’exerce le montage réel du layout statique CoursesU, les attributs live de `ChatShell`, ni l’égalité des règles de store locator entre Neutral et CoursesU.

**Preuve / reproduction :**
1. Rechercher `aria-live`, `aria-relevant`, `role="log"`, le montage du layout CoursesU et les actions `requestAddRecipe`/`requestAddProducts` dans les tests.
2. Relancer `pnpm --filter @mealz-product-team/hub test`.
3. Résultat : aucune assertion ciblée ; 21 fichiers et 169 tests passent.

**Impact :**
Les corrections sont démontrées aujourd’hui par inspection/runtime, mais leurs régressions ne seraient pas détectées automatiquement.

**Action demandée :**
Ajouter les tests ciblés déjà demandés, ou obtenir de Zeus une décision explicite de report avec propriétaire et suivi.

**Verdict :**
non-blocking

### P2 — Le contrôle whitespace du diff livré échoue

**Référence :**
- Spec : gate de vérification et état reviewable définis dans `AGENTS.md`.
- Plan : `docs/technical/2026-09-02-hub-roadmap/plan.md:99-113`.
- Code : `docs/technical/2026-09-02-hub-roadmap/plan.md:3-5`.

**Constat :**
Le contrôle annoncé comme réussi n’inspecte pas le diff indexé lorsque la commande est lancée sans `--cached`. Le diff livré contient trois fins de ligne avec espaces.

**Preuve / reproduction :**
1. Exécuter `git diff --check` : code 0, car il ne voit que les changements non indexés.
2. Exécuter `git diff --cached --check` sur les 166 fichiers livrés.
3. Résultat : code 2, espaces finaux aux lignes 3, 4 et 5 de `plan.md`.

**Impact :**
La preuve de propreté fournie est incomplète et le diff ne satisfait pas réellement le contrôle annoncé.

**Action demandée :**
Supprimer les espaces finaux, réindexer le plan et relancer `git diff --cached --check`.

**Verdict :**
non-blocking

## Verdict final — deuxième re-vérification

Les trois P1 précédents sont fermés. L’approbation reste suspendue jusqu’à correction des P2, ou décision explicite de report pour les tests et la dette `isRetailerBrand`; le contrôle whitespace doit être vert sur le diff indexé.

`changes-requested`

## Troisième re-vérification ciblée — 2026-09-02

Corrections confirmées :

- Le code et les commentaires `isRetailerBrand` ont été entièrement retirés ; `lib/brand.ts` n’est plus livré.
- Les règles d’ajout recette/produits utilisent toutes deux directement `if (!store)`.
- Trois tests ciblés sont présents et passent : contrat brand-only, montage CoursesU et région live du chat.
- Le contrôle `git diff --cached --check` passe.
- Tests, TypeScript et build passent ; les contrôles runtime Neutral/CoursesU et les fonds Planner sont conformes.

### P2 — `next-env.d.ts` reste dans le diff indexé malgré sa restauration annoncée

**Référence :**
- Spec : exigence de livraison propre confirmée par Raphaël lors de la demande de correction finale.
- Plan : `docs/technical/2026-09-02-hub-roadmap/plan.md:99-113`.
- Code : `packages/hub/next-env.d.ts:3`.

**Constat :**
Le worktree n’a plus de changement non indexé ou non suivi, mais `packages/hub/next-env.d.ts` reste modifié dans l’index. Le diff remplace la référence versionnée `./.next/dev/types/routes.d.ts` par la sortie de build `./.next/types/routes.d.ts`. Ce fichier généré n’appartient pas au scope de la feature et était explicitement annoncé comme restauré.

**Preuve / reproduction :**
1. Exécuter `git diff --cached -- packages/hub/next-env.d.ts`.
2. Observer le remplacement de la référence de types dev par la référence de build.
3. Exécuter `git diff --cached --name-only | grep next-env.d.ts` : le fichier reste livré dans l’index après le build.

**Impact :**
Le diff contient encore un artefact généré hors scope et contredit l’état « restauré » annoncé. La demande explicite de Raphaël était une livraison entièrement nettoyée.

**Action demandée :**
Restaurer `packages/hub/next-env.d.ts` à la version de `dev`, retirer ce fichier de l’index de feature, puis confirmer que tests/build restent verts et que le statut final ne contient ni changement indexé pour ce fichier, ni changement non indexé.

**Verdict :**
non-blocking

## Verdict final — troisième re-vérification

Les corrections fonctionnelles, la couverture ciblée et le contrôle whitespace sont validés. Il reste uniquement à retirer `next-env.d.ts` du diff, conformément à la demande de livraison totalement propre.

`changes-requested`

## Vérification finale de propreté — 2026-09-02

Le dernier constat P2 est fermé :

- `git diff --cached -- packages/hub/next-env.d.ts` : sortie vide.
- `git diff -- packages/hub/next-env.d.ts` : sortie vide.
- `git diff --cached --name-only -- packages/hub/next-env.d.ts` : sortie vide.
- `git diff --cached --check` : succès, code 0.
- État final : 168 fichiers indexés intentionnels, 0 fichier non indexé, 0 fichier non suivi.

Le build n’a pas été relancé après la restauration, conformément à la consigne QA : sa preuve précédente reste valide (71 pages) et une relance aurait régénéré artificiellement `next-env.d.ts`.

Aucun P0, P1 ou P2 ne reste ouvert. Les critères ciblés, les tests, TypeScript, le build, le runtime master/client et les assets ont été vérifiés.

## Verdict final

`approved`
