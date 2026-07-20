# Démarrage de travail dans un package (packages/<nom>)

Quand je commence à travailler dans un dossier `packages/<nom>` (ou équivalent : premier message de la session qui touche ce package), avant toute construction ou réflexion :

1. **Vérifier `docs/`** : chercher dans le package un dossier `docs/` contenant un brief, des règles, ou un `.md` de cadrage. Le lire entièrement s'il existe, avant de commencer.
2. **Si aucun doc n'existe** : le signaler explicitement à l'utilisateur, puis poser les questions de cadrage nécessaires (intention, but, contraintes, utilisateurs cibles, UX attendue). Une fois les réponses obtenues, rédiger un `docs/BRIEF.md` qui les capture, pour que la prochaine session (ou un autre agent) n'ait pas à repartir de zéro.
3. **Poser des questions de cadrage même hors skill gstack** dès qu'il s'agit d'une nouvelle feature ou d'un nouveau flow UX — pas besoin que l'utilisateur invoque `/office-hours`, `/spec` ou un skill design pour déclencher cette réflexion. Confirmer l'intention et le but, et pousser la réflexion UX de base de l'utilisateur (alternatives, cas limites, cohérence avec l'existant) plutôt que d'exécuter tel quel ce qui a été demandé au premier degré.
4. Ce cadrage est **par package et par session** : une fois fait pour un package donné, ne pas reposer les mêmes questions à chaque message suivant dans la même session — seulement le refaire si on entre dans un nouveau package non encore exploré, ou si le contexte change fondamentalement.
5. Ce cadrage ne s'applique pas aux tâches triviales ou déjà précises (fix de bug ciblé, typo, tâche entièrement spécifiée par l'utilisateur) — seulement quand une nouvelle feature ou un nouveau flow UX est en jeu.

# Fin de journée — commit, push, merge dev → main

Quand l'utilisateur dit **"fin de journée"** (ou variante proche : "c'est la fin de journée", "on clôture la journée"), exécuter automatiquement ce workflow sans redemander confirmation :

1. Analyser l'état Git : `git status`, `git diff`, `git diff --staged`, `git log --oneline -10`
2. **Commit** : ajouter et committer les changements pertinents (exclure secrets, `.env`, artefacts inutiles) avec un message concis en français, style du repo (`feat`/`fix`/`chore` + pourquoi)
3. **Push** : pousser la branche de travail courante (typiquement `dev`) — `git push -u origin <branche>`
4. **Merge** : `git checkout main` → `git pull origin main` → `git merge dev` → `git push origin main`
5. Revenir sur `dev` et confirmer working tree propre

Respecter le Git Safety Protocol (pas de force push, pas de `--no-verify`, pas d'amend sauf conditions). Si rien à committer, faire quand même push/merge si nécessaire.

Résumer brièvement en français ce qui a été fait.

# Artefacts gstack (design docs, plans de test, reviews)

Les skills gstack (`/office-hours`, `/plan-eng-review`, `/plan-design-review`, etc.) écrivent leurs artefacts dans `~/.gstack/projects/<slug>/` (hors du repo, par design de gstack — ne pas déplacer, les autres skills les retrouvent via ce chemin fixe).

**Systématiquement, après qu'un skill gstack écrit un `.md` dans `~/.gstack/projects/`, en copier une copie dans `.gstack-artifacts/` à la racine de ce repo** (créer le dossier s'il n'existe pas), pour que l'utilisateur les retrouve facilement dans le projet. L'original dans `~/.gstack` reste la source de vérité pour l'auto-découverte inter-skills — la copie dans le repo est juste pour la consultation humaine.
