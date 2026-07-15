# Mealz Planner — Index du Project

## À qui s'adresse ce dossier ?

Ce dossier est configuré pour assister un **Product Manager Mealz** sur tout ce qui concerne le **Mealz Planner** — la fonctionnalité de construction de menu multi-recettes intégrée en marque blanche chez les retailers GMS (via `mealz-ssr-api` + `mealz-components`, nouvelle stack SSR/Web Components).

---

## Structure des fichiers

| Fichier | Contenu | Quand le lire |
|---|---|---|
| `01-contexte-produit.md` | Positionnement, objectif business, retailer(s) actif(s), périmètre device, MVP vs roadmap, métriques suivies, persona prioritaire | Toujours — c'est le socle. Entièrement complété. |
| `04-architecture-technique.md` | Routes SSR, services métier, composants UI, contraintes techniques — extrait du code réel GitLab | Dès qu'une US ou un ticket technique touche au Planner |
| `regle-suggestion-recettes-planner.md` | Règle de suggestion de recettes dans la section "Suggestions" (filtres, scoring, exclusions) | Dès qu'une US touche à l'algorithme de suggestion du Planner |
| `02-parcours-current-menu.md` | Parcours de l'écran "Mon menu" (desktop + mobile) : entrée, Suggestions, Menu en cours, budget. Complété (hors post-panier retailer et comportement mobile du CTA "?"/onboarding, cf. section "Non couvert") | Dès qu'une US touche à l'écran current-menu |
| `03-parcours-detail-recette-planner.md` | Fiche recette du Planner : convives, segmented control, coche/décoche produits, remplacement, comparaison avec "Idées repas en 1 clic" | Dès qu'une US touche à la fiche recette du Planner |
| `05-aide-comment-faire-un-menu.md` | Contenu de la modale d'aide (CTA "?") — ⚠️ contenu partiellement obsolète (étape 1), distinct de l'onboarding première visite | Dès qu'une US touche à l'aide en ligne du Planner |
| `06-preferences-planner.md` | CTA "Préférences" : donnée partagée avec "Idées repas en 1 clic", contenu du Drawer, filtres stricts (régime, "Je n'aime pas", équipements) | Dès qu'une US touche aux Préférences ou à leur impact sur les recommandations |
| `07-onboarding-premiere-visite-planner.md` | Onboarding automatique première visite : modale de bienvenue, tour guidé 4 étapes, onboarding "Personnalisation de recette" — distinct de la modale d'aide CTA "?" | Dès qu'une US touche à l'onboarding du Planner |
| `08-parcours-sans-connexion-sans-magasin.md` | Utilisation du Planner sans connexion / sans magasin (confirmé Courses U, ne pas généraliser sans vérification) | Dès qu'une US touche au gating connexion/magasin du Planner |

D'autres fichiers seront ajoutés au fur et à mesure, sur le modèle du dossier `carrefour-assistant-shopping/`.

---

## Comment utiliser ce contexte

**Tu dois toujours avoir en tête :**
- Le Planner est un mode d'usage **multi-recettes avec budget**, distinct de l'ajout 1 clic d'une recette isolée (catalog / fiche recette)
- Il fonctionne à la fois pour les utilisateurs connectés et anonymes ("authless"), avec fusion du menu à la connexion
- La nouvelle stack (`mealz-ssr-api` + `mealz-components`) est la cible pour toute nouvelle feature — cf. `ressources/mealz-workspace-rules.md`

**Quand on te parle du "menu"**, il s'agit de la ressource métier `Menu` (titre, budget, magasin, recettes associées) — pas d'un menu de navigation.

**Quand on te parle de "l'entry" ou "planner-entry"**, il s'agit du composant teaser (3 variantes) qui amène le shopper vers le Planner depuis une autre page.

---

## Glossaire rapide

| Terme | Définition |
|---|---|
| Menu | Ressource métier : liste de recettes + convives par recette, budget cible, magasin associé |
| Menu courant (current menu) | Le menu actif de l'utilisateur — créé automatiquement s'il n'existe pas |
| Menu authless | Menu construit par un utilisateur non connecté ; fusionné au compte à la connexion |
| Jauge budget | Composant comparant le coût courant du menu au budget cible |
| Planner Entry | Composant teaser (variantes 1/2/3) redirigeant vers le Planner |
| Sélection du moment | Recettes suggérées/vedettes (indépendantes du menu personnalisé de l'utilisateur) |

---

## Périmètre couvert

- ✅ Architecture technique (routes, services, composants, events analytics) — Web/SSR
- ✅ Positionnement produit complet : objectif business, retailer actif, périmètre device, MVP vs roadmap, métriques suivies, persona prioritaire
- ✅ Parcours "Mon menu" (desktop + mobile) : entrée, Suggestions, Menu en cours, budget, Catalogue, Menu unique, "Mettre le menu au panier" de bout en bout
- ✅ Fiche recette (Drawer, segmented control, coche/décoche, remplacement)
- ✅ Aide en ligne (CTA "?") et onboarding automatique de première visite
- ✅ Préférences (CTA dédié, filtres stricts sur les recommandations)
- ✅ Usage sans connexion / sans magasin (confirmé Courses U)
- 🔜 Parcours "Idées repas en 1 clic" (hors périmètre Planner — ex. "Mon Carnet") : à documenter séparément, hors de ce dossier
