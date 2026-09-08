# Brief — Reconstruction stable et multi-brand de DS.MD

**Statut :** approuvé par Raphaël, prêt pour handoff technique

**Date :** 2026-09-08

**Propriétaire produit :** Zeus

**Décideur humain :** Raphaël

## Intention

Reconstruire progressivement DS.MD sur des fondations cohérentes, testables et adaptées à plusieurs marques, sans détruire le système actuel ni prolonger ses couplages historiques.

La reconstruction doit rendre explicites les responsabilités des tokens, des primitives UI, des composants métier, de l’application interactive de référence et du portail documentaire. Elle doit également permettre à un Staff Engineer permanent de conduire architecture et implémentation dans un environnement isolé, sous contrôle produit, design et QA.

## Problème

Le repository actuel mélange design system, prototypes, documentation et expériences produit. Les tokens et composants existants constituent une référence utile, mais ne fournissent pas une base suffisamment nette pour la cible multi-brand. Une migration mécanique conserverait des décisions devenues difficiles à comprendre ou à faire évoluer.

Raphaël doit pouvoir examiner chaque token avant sa création, changer de bibliothèque Figma selon le client tout en conservant le même contrat public, et valider les composants en contexte dans des parcours continus.

## Résultat attendu

- Une source canonique unique pour les tokens, avec sorties résolues pour le code, Figma et la documentation.
- Un contrat sémantique identique pour Mealz et chaque client.
- Un `ui-kit` générique distinct de `mealz-ui`.
- Une application Supermarket servant d’environnement interactif de référence multi-shell.
- Un portail documentaire orienté ressources et une documentation de composants inspirée d’Appica.
- Une reconstruction par tranches verticales après inventaire de l’existant.
- Un Staff Engineer permanent, Atlas, configuré après création d’un worktree V2 propre.

## Contraintes structurantes

- Même repository, branche et worktree de reconstruction isolés.
- Aucun nettoyage destructif du worktree principal.
- Aucun token concret autorisé par cette spec directrice.
- Chaque future spec de tokens doit inventorier exhaustivement tous les tokens proposés et recevoir l’approbation explicite de Raphaël avant leur création.
- Mealz et Neutral désignent le même thème canonique.
- Les composants ne contiennent pas de conditions nommées par client.
- Les vérifications web utilisent le navigateur Hermes Desktop.
- Les communications inter-agents utilisent exclusivement `message_agent`.

## Signal de réussite

Une tranche peut être promue lorsque son inventaire de tokens a été approuvé, que les sorties générées respectent le contrat public, et que la matrice contractuelle intégrée démontre le fonctionnement des composants et scénarios représentatifs avec Mealz et chaque marque validée.

## Documents associés

- `decisions.md` — décisions, risques et points ouverts.
- `spec.md` — spec directrice publiable dans le tracker.
