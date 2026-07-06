# Fin de journée — commit, push, merge dev → main

Quand l'utilisateur dit **"fin de journée"** (ou variante proche : "c'est la fin de journée", "on clôture la journée"), exécuter automatiquement ce workflow sans redemander confirmation :

1. Analyser l'état Git : `git status`, `git diff`, `git diff --staged`, `git log --oneline -10`
2. **Commit** : ajouter et committer les changements pertinents (exclure secrets, `.env`, artefacts inutiles) avec un message concis en français, style du repo (`feat`/`fix`/`chore` + pourquoi)
3. **Push** : pousser la branche de travail courante (typiquement `dev`) — `git push -u origin <branche>`
4. **Merge** : `git checkout main` → `git pull origin main` → `git merge dev` → `git push origin main`
5. Revenir sur `dev` et confirmer working tree propre

Respecter le Git Safety Protocol (pas de force push, pas de `--no-verify`, pas d'amend sauf conditions). Si rien à committer, faire quand même push/merge si nécessaire.

Résumer brièvement en français ce qui a été fait.
