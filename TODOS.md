# TODOS

## Appliquer les tokens de marque CoursesU au chrome de l'assistant

**What:** Créer `packages/design-system/src/styles/tokens/brands/coursesu.css` (sur le modèle de `neutral.css`, `client-a.css`, `client-b.css` déjà existants) pour appliquer les couleurs de marque CoursesU au chrome du FAB/Drawer (header, accent, bouton) — pas aux cartes produit ni au contenu de l'assistant.

**Why:** L'architecture `data-brand` existe déjà dans le design-system (mécanisme multi-tenant déjà en place). Répondre à l'inquiétude de fidélité visuelle/objection marque-merchandising (soulevée en office-hours et confirmée par la voix extérieure en /plan-eng-review) coûte donc un fichier de tokens, pas une refonte de composants.

**Pros:** Chantier V2 très peu coûteux grâce à l'infra existante ; répond directement à l'objection marque anticipée sans toucher aux composants partagés.

**Cons:** Nécessite les vraies couleurs de marque CoursesU (charte graphique), non disponibles au moment de ce plan.

**Context:** Découvert en /plan-design-review (2026-07-15) lors de la Pass 5 (Design System Alignment) du POC drawer CoursesU. Voir `packages/design-system/src/styles/tokens/brands/neutral.css` pour le modèle de fichier à suivre.

**Depends on:** Accord du sponsor CoursesU + obtention de leur charte graphique (couleurs, éventuellement logo).

---

## Couvrir de tests la logique existante d'AssistantContext

**What:** Ajouter des tests unitaires pour le classificateur d'intent (`sendMessage`, 5 branches : recette/liste/panier/hors-sujet/inconnu) et le pattern `pendingActionRef` (consommation atomique d'une action différée quand un magasin doit être sélectionné avant ajout panier) dans `packages/assistant-shopping/src/context/AssistantContext.tsx`.

**Why:** C'est la logique la plus subtile du package — le code contient déjà un commentaire du développeur signalant explicitement un risque de double-appel (StrictMode) sur `pendingActionRef` si elle était convertie en state. Cette logique reste à 0% de couverture même après le plan POC drawer CoursesU (2026-07-15), qui a volontairement laissé cette dette hors scope.

**Pros:** Comble la dette la plus risquée du package ; réutilise le setup Vitest déjà mis en place par le plan POC (coût marginal faible, pas de nouvelle infra à créer).

**Cons:** Pas bloquant pour le POC en cours ; peut glisser si personne ne le reprend après la démo.

**Context:** Repris dans /plan-eng-review du 2026-07-15 (POC drawer CoursesU). Voir le diagramme de couverture de cette revue pour le détail des branches non testées.

**Depends on:** Le setup Vitest introduit par le plan POC drawer CoursesU (scope dans `packages/assistant-shopping` + `packages/design-system`).

---

## Adapter de données réelles CoursesU (catalogue, panier)

**What:** Construire une couche d'abstraction entre `AssistantContext` et une vraie source de données CoursesU (catalogue produits, écriture panier), pour remplacer `MOCK_PRODUCTS`/`interpretMessage` sans réécrire le contexte.

**Why:** Le design doc "Assistant Shopping in-site — POC drawer CoursesU" (2026-07-15) a explicitement reporté ce travail : le contrat de l'API CoursesU n'est pas connu ni confirmé avec le sponsor. Construire l'abstraction maintenant reviendrait à deviner un contrat inconnu.

**Pros:** Capture le chantier logique suivant si le POC convainc le comité CoursesU, évite de le redécouvrir de zéro plus tard.

**Cons:** Reste spéculatif tant que le contrat API n'est pas connu — la description ne pourra être précisée qu'après la réponse du sponsor (voir "The Assignment" du design doc).

**Context:** Design doc source : `~/.gstack/projects/raphaelpernel-ds-md/rapha-dev-design-20260715-164409.md`.

**Depends on:** Réponse du sponsor CoursesU sur l'accès technique (API panier réelle vs script d'injection vs rien).

---

## Injection live (script + Shadow DOM) sur de vraies pages CoursesU

**What:** Construire le mécanisme d'injection production — bundle embarquable via `<script>` unique avec isolation Shadow DOM — pour afficher le drawer assistant sur les vraies pages du site CoursesU (pas un environnement miroir Mealz).

**Why:** C'est le chantier V2 si le POC obtient un go du comité CoursesU. La recherche menée dans /plan-eng-review (2026-07-15) a déjà identifié le pattern de production standard pour ce cas (widget tiers façon Intercom/Drift/Rufus) : script tag + Shadow DOM pour l'isolation CSS — pas de Module Federation (trop lourd), pas d'iframe (perte d'accès au DOM hôte pour lire le panier réel).

**Pros:** Capture déjà la recherche technique faite (pattern identifié), évite de la refaire depuis zéro.

**Cons:** Conditionnel à un succès du POC qui n'est pas garanti — reste hypothétique tant que le comité CoursesU n'a pas statué.

**Context:** Voir Section 1 (Architecture Review) de /plan-eng-review du 2026-07-15 pour le détail de la recherche (sources : makerkit.dev, web.dev/articles/embed-best-practices, dev.to micro-frontends guide).

**Depends on:** Décision positive du comité CoursesU suite à la démo POC.
