# TODOS

## ~~Appliquer les tokens de marque CoursesU au chrome de l'assistant~~ — Résolu (2026-07-20)

**Résolu le 2026-07-20** : `packages/design-system/src/styles/tokens/brands/coursesu.css` a été peuplé avec une palette CoursesU réelle (teal `#007D8F`/`#005562`, rouge promo `#E22019`, jaune `#FFC700`, turquoise `#6BBDAE`, typographie Mulish/Open Sans), extraite par analyse live de coursesu.com (même méthode que Marmiton sur `marmiton.css` : scraping du site public, pas de charte officielle sponsor). Le commentaire TODO dans `brands.ts` a été retiré. Les fichiers `client-a.css`/`client-b.css` ont ensuite été renommés en `marmiton.css`/`coursesu.css` (valeur `data-brand` alignée) pour rester lisibles en cas de partage du repo.

**Limite connue** : ces valeurs viennent du site public, pas d'une charte graphique officielle transmise par un sponsor CoursesU. Si le sponsor fournit une vraie charte (logo, nuancier officiel), remplacer les valeurs dans `coursesu.css` en conséquence — la structure du fichier n'aura pas à changer.

<details>
<summary>Contexte original</summary>

**What:** Créer `packages/design-system/src/styles/tokens/brands/coursesu.css` (sur le modèle de `neutral.css` déjà existant) pour appliquer les couleurs de marque CoursesU au chrome du FAB/Drawer (header, accent, bouton) — pas aux cartes produit ni au contenu de l'assistant.

**Why:** L'architecture `data-brand` existe déjà dans le design-system (mécanisme multi-tenant déjà en place). Répondre à l'inquiétude de fidélité visuelle/objection marque-merchandising (soulevée en office-hours et confirmée par la voix extérieure en /plan-eng-review) coûte donc un fichier de tokens, pas une refonte de composants.

**Pros:** Chantier V2 très peu coûteux grâce à l'infra existante ; répond directement à l'objection marque anticipée sans toucher aux composants partagés.

**Cons:** Nécessite les vraies couleurs de marque CoursesU (charte graphique), non disponibles au moment de ce plan.

**Context:** Découvert en /plan-design-review (2026-07-15) lors de la Pass 5 (Design System Alignment) du POC drawer CoursesU. Voir `packages/design-system/src/styles/tokens/brands/neutral.css` pour le modèle de fichier à suivre.

**Depends on:** Accord du sponsor CoursesU + obtention de leur charte graphique (couleurs, éventuellement logo).

</details>

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

---

## Vrai algorithme de substitution produit (marmiton-agent)

**What:** Remplacer le stub visuel `SUBSTITUTE_ITEM` (un simple flag « remplacé » sur la ligne panier, décidé en `/plan-eng-review` du 2026-07-20) par une vraie logique de matching produit équivalent (même famille, prix comparable, disponibilité) dans `packages/marmiton-agent`.

**Why:** Le POC n'a besoin que de démontrer l'écran panier avec substitution, pas de résoudre le matching réel — même report déjà fait sur le TODO CoursesU ci-dessus (« Adapter de données réelles CoursesU »). Construire l'algorithme maintenant reviendrait à deviner un contrat produit/distributeur inconnu.

**Pros:** Coûte un flag et une valeur `originalProductId` sur `CartItem` pour le POC ; l'algorithme réel ne bloque rien avant qu'un vrai accès catalogue existe.

**Cons:** Reste spéculatif tant que l'accès aux données produit réelles (Marmiton/Carrefour ou autre enseigne) n'est pas confirmé.

**Context:** Décision Code Quality #1 de `/plan-eng-review` du 2026-07-20 sur `rapha-dev-design-20260720-114501.md` — `CartContext` copié de `marmiton-prototype`, étendu d'une action `SUBSTITUTE_ITEM` minimale.

**Depends on:** Réponse du PO Marmiton sur l'accès technique (catalogue produit réel), et décision distributeur (brief §11 Q4 — Marmiton doit rester agnostique, pas mono-Carrefour).

---

## Adapter marmiton-agent aux vraies données Marmiton/Carrefour

**What:** Remplacer le dataset mock dédié de `packages/marmiton-agent` (recettes homonymes, signaux communautaires pré-extraits, `steps`) par une vraie source de données Marmiton (catalogue recettes, avis, contenu communautaire) si le PO obtient un go en interne.

**Why:** Miroir exact du TODO CoursesU « Adapter de données réelles CoursesU » ci-dessus — le contrat API Marmiton n'est pas connu, deviner maintenant serait prématuré et le dataset mock actuel (créé pour démontrer désambiguïsation homonymes + détection d'incohérence + extraction de signal) suffit pour l'objet de conviction du POC.

**Pros:** Capture déjà la recherche/le scope produit fait (quelles données comptent : `steps`, homonymes, signaux communautaires) — évite de le redécouvrir de zéro si le go arrive.

**Cons:** Reste hypothétique tant que le PO Marmiton n'a pas statué ; peut glisser si personne ne le reprend après la démo.

**Context:** Design doc source : `~/.gstack/projects/raphaelpernel-ds-md/rapha-dev-design-20260720-114501.md` (mode Startup, adapté intrapreneuriat).

**Depends on:** Réponse du PO Marmiton sur l'accès technique et le go budgétaire, dans la fenêtre Q3 2026 (pas de deadline contractuelle).

---

## Intégrer les réponses d'ingrédient mémorisées au matching de recherche (marmiton-agent)

**What:** Faire influencer les résultats de `/recherche` par les réponses d'ingrédient déjà données sur une fiche recette (ex. « pas de crème » mémorisé devrait pondérer ou filtrer les futures recommandations), au lieu de garder les deux mémoires (tags de contrainte de recherche et réponses d'ingrédient) complètement séparées comme c'est le cas aujourd'hui.

**Why:** La mémoire de session (`SessionMemoryContext`, ajoutée en revue `/plan-design-review` du 2026-07-20) couvre déjà le cas « contrainte apprise en recherche → appliquée à une nouvelle recherche » (`nlu.applyMemory`). Le sens inverse — une réponse d'ingrédient sur une fiche recette qui influence une recherche future — demanderait de mapper du texte libre (« pas de crème ») vers le vocabulaire de tags fermé de `TAG_KEYWORDS` dans `nlu.ts`, ce qui n'est pas trivial et sortait du périmètre de cette revue de design.

**Pros:** Complèterait la promesse du brief (« ce que la conversation collecte sans le demander ») dans les deux sens plutôt qu'un seul.

**Cons:** Nécessite soit un vocabulaire de tags étendu, soit une heuristique de mapping texte-libre → tag — travail non trivial, à ne pas deviner sans données d'usage réelles sur ce que les utilisateurs demandent effectivement.

**Context:** Découvert en `/plan-design-review` du 2026-07-20 en construisant `SessionMemoryContext` (`packages/marmiton-agent/src/context/SessionMemoryContext.tsx`) et `nlu.applyMemory` (`packages/marmiton-agent/src/lib/nlu.ts`).

**Depends on:** Aucune dépendance externe — travail purement produit/algorithme, peut être repris à tout moment.
