# Review QA — Profil alimentaire permanent Neutral-first

Date : 2026-09-07
Package principal : `packages/hub/`
Workspace : `F:/Workspace/Mealz/CLAUDE/Projects/DS.MD`
Branche observée : `dev` à `1dc092d`
État Git : travail non commité et non indexé, mêlé à des changements préexistants

## Résumé

La nouvelle `PreferencesCard` respecte le contrat demandé : régimes et équipements l’utilisent sans `ChipTag`, allergies et temps restent en `ChipTag`, les tags du récapitulatif restent en `ChipTag`, et `CuisineFlagSelector` demeure distinct. Les états `default`, `hover` et `selected`, `aria-pressed`, les SVG locaux et les mappings ont été inspectés. Les suites automatisées, TypeScript et le build sont verts.

Trois écarts importants empêchent néanmoins l’approbation : une copy CoursesU dans le montage Neutral-first, la restitution/prise de focus prévue mais non implémentée, et un handoff Git non reproductible. Deux corrections de propreté sont également demandées.

### P1 — La copy allergies Neutral-first contient encore la marque CoursesU

**Référence :**
- Spec : `packages/hub/docs/product/2026-09-03-preferences-alimentaires/spec.md:11`, `:55`
- Plan : `packages/hub/docs/technical/2026-09-03-preferences-alimentaires/plan.md:128`
- Code : `packages/hub/src/features/food-preferences/components/RestrictionsEditor.tsx:37`

**Constat :**
Le seul montage livré est Neutral-first, mais l’alerte affiche « CoursesU ne garantit pas l’absence d’allergènes ». La décision produit retient au contraire une copy générique précise dans `decisions.md:21`, et CoursesU reste une déclinaison ultérieure.

**Preuve / reproduction :**
1. Ouvrir l’éditeur « Régimes et allergies » du profil Neutral.
2. Lire l’alerte affichée sous les options.
3. Résultat observé dans le rendu source : la marque CoursesU est exposée dans `/neutral/supermarket` et `/neutral/supermarket/profile`.

**Impact :**
Incohérence de marque visible, confusion utilisateur et non-conformité directe au scope Neutral-first.

**Action demandée :**
Remplacer la copy par le texte neutre validé dans `decisions.md:21` et ajouter une assertion empêchant toute mention CoursesU/Carrefour dans le sous-arbre food-preferences Neutral.

**Verdict :**
blocking

### P1 — Le focus du Drawer n’est ni pris ni restitué

**Référence :**
- Spec : `packages/hub/docs/product/2026-09-03-preferences-alimentaires/spec.md:89-91`
- Plan : `packages/hub/docs/technical/2026-09-03-preferences-alimentaires/plan.md:143-157`
- Code : `packages/hub/src/features/food-preferences/context/FoodPreferencesContext.tsx:18-19,33,42-46`
- Code : `packages/hub/src/features/food-preferences/components/SupermarketFoodPreferencesShell.tsx:40-44,57`
- Code : `packages/design-system/src/components/ui/layout/Drawer/Drawer.tsx:45-50`

**Constat :**
`openDrawer` mémorise `drawerTrigger`, mais aucun consommateur ne l’utilise. Le Drawer ferme sur Escape sans déplacer le focus à l’ouverture ni le rendre au déclencheur à la fermeture. Le plan exige explicitement focus initial exploitable et restitution, ainsi que leurs tests.

**Preuve / reproduction :**
1. Déclencher `openDrawer(document.activeElement)` depuis le CTA Préférences.
2. Observer que `drawerTrigger` est seulement stocké dans le provider.
3. Fermer via Escape, overlay ou bouton Fermer : `closeDrawer` ne fait que basculer l’état ; aucun appel de focus n’existe et aucun test shell ne couvre cette restitution.

**Impact :**
Les utilisateurs clavier et technologies d’assistance peuvent perdre leur position après fermeture et rester derrière un dialogue modal sans cible de focus explicite.

**Action demandée :**
À l’ouverture, déplacer le focus vers une cible utile du Drawer ; à la fermeture, restaurer le focus vers `drawerTrigger` ou, pour l’invitation automatique, vers le CTA Préférences. Ajouter des tests shell pour ouverture, Escape, fermeture, restitution, Retour avec abandon du brouillon et sauvegarde avec Toast.

**Verdict :**
blocking

### P1 — Le handoff ne correspond pas à un diff de feature reproductible

**Référence :**
- Spec : gate de livraison défini par `AGENTS.md` — handoff Athéna → Minos
- Plan : `packages/hub/docs/technical/2026-09-03-preferences-alimentaires/implementation-notes.md:5-7`
- Code : état Git global du workspace `DS.MD`

**Constat :**
Le handoff annonce `dev`, alors que les notes déclarent une implémentation sur `main`. Le workspace contient de nombreux fichiers non suivis de la feature, des modifications préexistantes non revendiquées et des déplacements de documents d’une autre feature. Sans index, commit, worktree ou liste intentionnelle stabilisée, le contenu exact vérifié ne peut pas être rattaché à un livrable Git déterministe.

**Preuve / reproduction :**
1. Exécuter `git status --short --branch --untracked-files=all` sur `dev`.
2. Observer les sources food-preferences non suivies, des modifications Hub suivies et des changements hors feature (`AGENTS.md`, `skills-lock.json`, relocalisation Hub Roadmap, documentation Planner).
3. Comparer avec `implementation-notes.md:5` : la branche documentée est `main`, contrairement au handoff et à Git.

**Impact :**
Risque d’omission, d’inclusion de changements étrangers ou d’impossibilité de reproduire exactement la version approuvée.

**Action demandée :**
Stabiliser les fichiers intentionnels dans un worktree/une branche dédiée ou dans l’index Git, fournir la base et le diff exacts, exclure les changements étrangers, puis corriger les notes d’implémentation avec la branche et l’état Git réels.

**Verdict :**
blocking

### P2 — `next-env.d.ts` pollue le diff après le build

**Référence :**
- Spec : hors scope fonctionnel
- Plan : vérification finale et propreté du diff
- Code : `packages/hub/next-env.d.ts:3`

**Constat :**
Le build remplace la référence `./.next/dev/types/routes.d.ts` par `./.next/types/routes.d.ts`. Ce changement généré n’apporte aucune valeur fonctionnelle à la feature.

**Preuve / reproduction :**
1. Exécuter le build Hub.
2. Exécuter `git diff -- packages/hub/next-env.d.ts`.
3. Résultat observé : une modification générée d’une ligne demeure.

**Impact :**
Bruit de diff et risque de conflit inutile.

**Action demandée :**
Restaurer `packages/hub/next-env.d.ts` depuis `HEAD` après les vérifications et ne pas relancer le build ensuite.

**Verdict :**
non-blocking

### P2 — Les SVG existent en doubles exemplaires non consommés

**Référence :**
- Spec : assets locaux, scope Hub uniquement
- Plan : `PreferencesCard` et assets de la feature
- Code : `packages/hub/src/features/food-preferences/assets/img/`
- Code : `packages/hub/public/food-preferences/`
- Code : `packages/hub/src/features/food-preferences/data/iconSources.ts:1-15`

**Constat :**
Les composants consomment uniquement les chemins `/food-preferences/...` du dossier `public`, tandis qu’un second jeu d’icônes et de drapeaux subsiste sous `src/features/food-preferences/assets/img/`. `air-fryer.svg` et `pesco-vegetarien.svg` ne sont pas mappés dans les options actuelles.

**Preuve / reproduction :**
1. Rechercher les références `assets/img` dans les sources food-preferences.
2. Observer qu’aucun import ne consomme ces copies.
3. Comparer avec `iconSources.ts` et `KitchenPreferencesEditor.tsx` : seuls les chemins publics sont utilisés.

**Impact :**
Duplication d’assets et ambiguïté sur la source de vérité.

**Action demandée :**
Conserver un seul jeu d’assets intentionnel ; supprimer les copies et fichiers inutilisés ou documenter explicitement leur futur usage.

**Verdict :**
non-blocking

## Verdict final

`changes-requested`

## Re-vérification du 2026-09-07 — passe corrective 2

### Constats fermés

- Copy Neutral-first : fermée. `RestrictionsEditor.tsx:37` reprend désormais la copy générique et `FoodPreferencesViews.test.tsx:54-58` interdit CoursesU/Carrefour.
- `next-env.d.ts` : fermé. La preuve Git est vide après restauration post-build.
- Assets inutilisés : les fichiers non mappés et les copies sous `features/supermarket/assets` ont été supprimés. La qualification des 14 fichiers sous `src/features/food-preferences/assets/img/` comme « sources canoniques » a ensuite été réexaminée en passe 4.
- Branche documentée : corrigée de `main` vers `dev`.

### P1 — L’édition interne écrase le déclencheur externe du Drawer

**Référence :**
- Spec : `packages/hub/docs/product/2026-09-03-preferences-alimentaires/spec.md:89-91`
- Plan : `packages/hub/docs/technical/2026-09-03-preferences-alimentaires/plan.md:143-157`
- Code : `packages/hub/src/features/food-preferences/components/SupermarketFoodPreferencesShell.tsx:31-47`
- Code : `packages/hub/src/features/food-preferences/components/FoodPreferencesSummary.tsx:41,50,58`

**Constat :**
Le focus direct et le fallback de l’invitation sont ajoutés, mais chaque clic `Modifier` appelle à nouveau `openDrawer(trigger)` alors que le Drawer est déjà ouvert. Cela remplace le déclencheur catalogue par le lien `Modifier` interne. À la fermeture depuis une section ou après Retour, l’effet restitue donc le focus à un lien situé dans le Drawer désormais masqué.

**Preuve / reproduction :**
1. Ouvrir le Drawer depuis le CTA catalogue `Préférences`.
2. Cliquer sur un lien `Modifier`; `FoodPreferencesSummary` transmet `event.currentTarget`.
3. `edit()` appelle `preferences.openDrawer(trigger)` et écrase `drawerTrigger`.
4. Fermer le Drawer : l’effet de `SupermarketFoodPreferencesShell.tsx:39-40` focalise ce lien interne, et non le CTA catalogue.

**Impact :**
Le contexte clavier est perdu après le parcours réel d’édition, qui est le chemin principal de la feature. Le test ajouté ne ferme le Drawer qu’immédiatement après son ouverture et ne couvre pas cette séquence.

**Action demandée :**
Ne pas remplacer le déclencheur externe lors d’une navigation niveau 0 → niveau 1 dans un Drawer déjà ouvert. `edit()` doit seulement changer le brouillon et la section dans ce cas. Ajouter un test : CTA externe → Modifier → Fermer/Escape → focus revenu au CTA externe.

**Verdict :**
blocking

### P1 — Le manifeste ne produit toujours pas un livrable reproductible

**Référence :**
- Spec : gate Athéna → Minos défini par `AGENTS.md:153-165`
- Plan : `packages/hub/docs/technical/2026-09-03-preferences-alimentaires/scope-manifest.md:62-92`
- Code : état Git du workspace `dev`

**Constat :**
Le manifeste distingue utilement les chemins intentionnels, mais sa première commande échoue sous le shell Git Bash du workspace parce que `packages/hub/app/(master)/...` n’est pas quoté. De plus, `git ls-files --others` inventorie seulement les noms des fichiers non suivis : il ne capture pas leur contenu et ne constitue pas un diff stable.

**Preuve / reproduction :**
1. Copier la commande `git diff --binary` de `scope-manifest.md:67-72` dans le shell du projet.
2. Résultat observé : `syntax error near unexpected token '('`, code de sortie 2.
3. Exécuter la seconde commande : elle liste les fichiers non suivis sans produire de patch de leur contenu.

**Impact :**
Le contenu exact vérifié reste mutable et ne peut pas être reconstitué depuis la base annoncée. Le risque d’omission ou de mélange avec les changements concurrents demeure.

**Action demandée :**
Corriger le quoting, puis matérialiser le scope dans un index/worktree dédié ou produire un patch complet incluant les fichiers non suivis. Fournir une commande qui reconstitue réellement le contenu vérifié, pas seulement sa liste.

**Verdict :**
blocking

## Verdict après re-vérification

`changes-requested`

## Re-vérification finale du 2026-09-07 — passe corrective 3

### P1 focus — fermé

`SupermarketFoodPreferencesShell.edit()` ne rappelle plus `openDrawer()` lorsque le Drawer est déjà ouvert. Le déclencheur externe est donc conservé pendant la navigation niveau 0 → niveau 1. Le test `keeps the external trigger when opening a section from the summary` couvre le parcours CTA externe → Modifier → Fermer → restitution au CTA externe.

### P1 livrable — fermé

Les chemins contenant `(master)` sont désormais quotés. Le patch complet `scope.patch` est généré depuis un index temporaire sans modifier l’index réel. Contrôles indépendants :

- le hash du patch déclaré est identique au patch régénéré depuis le scope courant ;
- `git apply --cached --check` réussit depuis un index propre chargé sur `HEAD` ;
- le patch inclut donc le contenu suivi et non suivi de la feature depuis la base `1dc092d71c694f29fce07e4d94d1cd4a76d1f2e4`.

### P2 — Le worktree QA auxiliaire doit être resynchronisé avant réutilisation

**Référence :**
- Spec : reproductibilité du handoff
- Plan : `packages/hub/docs/technical/2026-09-03-preferences-alimentaires/implementation-notes.md:65`
- Code : `F:/Workspace/Mealz/CLAUDE/Projects/DS.MD-QA`

**Constat :**
Le worktree QA contient bien le code corrigé, mais ses copies de `scope-manifest.md` et `implementation-notes.md` précèdent les dernières mises à jour documentaires. Le contrôle inverse du patch courant y échoue uniquement sur ces documents. Le patch canonique lui-même est valide et reproductible depuis un index propre.

**Preuve / reproduction :**
1. Exécuter `git apply --check --reverse <scope.patch>` dans `DS.MD-QA`.
2. Observer l’échec sur `scope-manifest.md` et `implementation-notes.md`.
3. Régénérer le patch depuis le scope principal puis comparer son hash au patch déclaré : identité confirmée.
4. Vérifier l’application depuis un index propre : succès.

**Impact :**
Aucun impact sur le livrable canonique `scope.patch`, mais le worktree auxiliaire ne doit pas être présenté comme une copie exacte après les dernières mises à jour documentaires.

**Action demandée :**
Avant une future utilisation de `DS.MD-QA`, le recréer ou réappliquer le patch canonique courant. Ce point est accepté comme non bloquant pour la validation du patch lui-même.

**Verdict :**
non-blocking

### Verdict final de la passe 3

Aucun P0 ou P1 ne reste ouvert. Le P2 du worktree auxiliaire est documenté et n’affecte ni le code ni le patch canonique vérifié.

`approved`

## Réexamen du 2026-09-07 — passe corrective 4

### P2 — Le patch canonique embarque encore 14 copies d’assets non consommées

**Référence :**
- Spec : assets locaux et scope Hub uniquement
- Plan : `packages/hub/docs/technical/2026-09-03-preferences-alimentaires/plan.md:19`
- Plan : `packages/hub/docs/technical/2026-09-03-preferences-alimentaires/implementation-notes.md:49`
- Code : `packages/hub/src/features/food-preferences/assets/img/`
- Code : `packages/hub/public/food-preferences/`
- Code : `packages/hub/src/features/food-preferences/data/iconSources.ts:1-15`
- Code : `packages/hub/src/features/food-preferences/components/KitchenPreferencesEditor.tsx:16-20`

**Constat :**
Le signalement de Zeus est confirmé. `scope.patch` ajoute 14 SVG sous `public/food-preferences/`, seuls chemins consommés par l’application, et 14 copies octet pour octet identiques sous `src/features/food-preferences/assets/img/`. Aucun import ni aucune URL ne référence `assets/img`. La note qui qualifie ces copies de « sources canoniques » ne correspond donc pas au graphe de consommation livré et maintient deux sources de vérité.

**Preuve / reproduction :**
1. Exécuter `git apply --numstat -- scope.patch` et filtrer les SVG : 14 entrées publiques et 14 entrées sous `assets/img` sont présentes.
2. Rechercher `assets/img` dans `packages/hub/src/features/food-preferences` : aucune référence consommatrice n’est trouvée.
3. Inspecter `iconSources.ts` et `KitchenPreferencesEditor.tsx` : les 14 URLs pointent exclusivement vers `/food-preferences/...`.
4. Comparer chaque paire avec `cmp -s`, en tenant compte de `south korea.svg` / `south-korea.svg` : les 14 paires sont identiques.
5. Appliquer le patch dans `feat/preferences-alimentaires` : les 28 fichiers sont bien indexés, ce qui reproduit le contenu réellement livrable signalé par Zeus.

**Impact :**
Le runtime n’est pas cassé, mais le patch de livraison conserve des fichiers morts, double la maintenance des mêmes ressources et contredit la preuve QA qui avait considéré le nettoyage terminé. Zeus n’accepte pas ce P2 pour la matérialisation Git ; l’approbation ne peut donc pas être maintenue.

**Action demandée :**
Supprimer du scope les 14 SVG non consommés sous `packages/hub/src/features/food-preferences/assets/img/`, corriger `implementation-notes.md:49`, régénérer `scope.patch`, puis vérifier depuis la base propre que le patch n’ajoute plus que les 14 assets publics. Rejouer au minimum `git apply --cached --check`, `git diff --check`, les tests ciblés et TypeScript ; le build n’est requis que si le code ou les chemins consommés changent.

**Verdict :**
blocking

### Verdict révisé de la passe 4

L’approbation de la passe 3 est retirée tant que le patch canonique embarque ces copies inutilisées et que sa documentation les présente comme sources canoniques.

`changes-requested`

## Re-vérification du 2026-09-07 — passe corrective 5

### P2 assets dupliqués — fermé

**Référence :**
- Spec : assets locaux et scope Hub uniquement
- Plan : `packages/hub/docs/technical/2026-09-03-preferences-alimentaires/plan.md:19`
- Plan : `packages/hub/docs/technical/2026-09-03-preferences-alimentaires/implementation-notes.md:49`
- Code : `packages/hub/public/food-preferences/`
- Code : `packages/hub/src/features/food-preferences/data/iconSources.ts:1-15`
- Code : `packages/hub/src/features/food-preferences/components/KitchenPreferencesEditor.tsx:16-20`

**Constat :**
Le patch corrigé n’ajoute plus `packages/hub/src/features/food-preferences/assets/img/**`. Les 14 SVG publics restent présents et correspondent exactement aux URLs consommées. `implementation-notes.md:49` décrit maintenant sans ambiguïté cette source unique et la suppression des copies.

**Preuve / reproduction :**
1. Vérifier l’identité du patch Athéna avant mise à jour QA : 290496 octets, SHA-256 `0ffc2eda89f846b31e7a61d574369b0a8a235816929f891623495adcad2a3415`.
2. Exécuter `git apply --numstat -- scope.patch` : exactement 14 SVG sous `packages/hub/public/food-preferences/`, aucun sous `assets/img`.
3. Rechercher `assets/img` dans le code et dans le patch : aucune copie ni référence consommatrice.
4. Régénérer le patch depuis le scope courant via un index temporaire : contenu identique au patch Athéna avant ajout de cette conclusion QA.
5. Exécuter `GIT_INDEX_FILE=<index propre> git apply --cached --check scope.patch` : succès.
6. Exécuter les tests shell/vues : 2 fichiers et 13 tests passants ; TypeScript : succès.

**Impact :**
La duplication et l’ambiguïté de maintenance sont supprimées sans modifier les URLs ni le comportement runtime.

**Action demandée :**
Aucune correction supplémentaire. La version finale du patch doit simplement inclure cette conclusion QA et rester applicable depuis la base fixée.

**Verdict :**
non-blocking — fermé

### Verdict final de la passe 5

Le correctif d’intégrité est démontré. Aucun P0 ou P1 n’est ouvert et les P2 de livraison sont fermés ou explicitement documentés.

`approved`
