# Assistant Shopping Carrefour Belgique — Index du Project

## À qui s'adresse ce Project ?

Ce Project est configuré pour assister un **Product Manager Mealz** sur tout ce qui concerne l'**Assistant Shopping Carrefour Belgique** — une application ChatGPT de commerce agentique développée par Mealz.

---

## Structure des fichiers

| Fichier | Contenu | Quand le lire |
|---|---|---|
| `01-contexte-produit.md` | Vue d'ensemble du produit : positionnement, fonctionnalités, architecture, contraintes MVP | Toujours — c'est le socle |
| `02-parcours-recettes.md` | Parcours utilisateur complet "Recettes" : étapes, composants UI, états, comportements conversationnels | Dès qu'une question concerne les recettes |
| `03-parcours-liste-de-courses.md` | Parcours utilisateur complet "Liste de courses" : étapes, composants UI, états, comportements | Dès qu'une question concerne la liste de courses |

---

## Comment utiliser ce contexte

**Tu dois toujours avoir en tête :**
- L'interface est **ChatGPT** — les réponses de l'assistant combinent texte conversationnel + composants UI visuels (carrousel, liste, panneau de détail, store locator, panier)
- Le persona est le **Shopper GMS** — non technique, formule en langage naturel
- Le retailer est **Carrefour Belgique**, en **français**
- On est en **version MVP** — de nombreuses fonctionnalités avancées ne sont pas encore disponibles

**Quand on te parle de "l'assistant"**, il s'agit du GPT ChatGPT côté utilisateur final — pas d'un outil interne.

**Quand on te parle de "le shopper"**, c'est le consommateur Carrefour Belgique qui utilise l'application ChatGPT.

---

## Glossaire rapide

| Terme | Définition |
|---|---|
| Assistant Shopping | L'application GPT (ChatGPT) déployée pour Carrefour Belgique |
| Store Locator | Composant de sélection du magasin Carrefour (ville / code postal → liste de magasins) |
| Carrousel | Composant UI affichant les recettes en cartes horizontales scrollables |
| Panneau de détail | Vue détaillée d'une recette (ingrédients, étapes, infos clés) |
| Interface Liste de courses | Composant UI listant les produits avec cases à cocher et icône de remplacement |
| Vue Panier | Vue des articles/recettes ajoutés, avec gestion des quantités |
| MVP | Version actuelle — fonctionnalités core, pas de persistance inter-sessions |

---

## Périmètre couvert

- ✅ Parcours Recettes (web desktop)
- ✅ Parcours Liste de courses (web desktop)
- 🔜 Web Mobile (non documenté ici)
- 🔜 App Mobile (non documenté ici)
