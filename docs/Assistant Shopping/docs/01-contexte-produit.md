# Contexte produit — Assistant Shopping Carrefour Belgique

## Qu'est-ce que c'est ?

L'Assistant Shopping est une application ChatGPT développée par Mealz pour Carrefour Belgique. C'est un canal de commerce agentique : le consommateur dialogue en langage naturel dans l'interface ChatGPT pour se faire suggérer des recettes ou générer une liste de courses, puis ajoute les produits à son panier Carrefour directement depuis la conversation.

## Positionnement

- **Retailer** : Carrefour Belgique
- **Canal** : Application ChatGPT (GPT personnalisé / GPT Store)
- **Surface** : Web Desktop (MVP v1)
- **Langue** : Français (belgique)
- **Version actuelle** : MVP — fonctionnalités core, sans personnalisation avancée ni mémorisation inter-sessions

## Deux fonctionnalités principales

| Fonctionnalité | Description courte |
|---|---|
| **Recettes** | L'assistant suggère des recettes via un carrousel visuel. Le shopper consulte le détail et ajoute une recette au panier (ingrédients ajoutés automatiquement). |
| **Liste de courses** | L'assistant génère une liste de produits à partir d'une demande en langage naturel. Le shopper coche/décoche les articles et les ajoute au panier en un clic. |

## Persona cible

**Shopper GMS** — Consommateur final sur l'interface ChatGPT liée à Carrefour Belgique. Il n'a pas de compétences techniques particulières. Il formule ses demandes en langage naturel, attend des réponses claires et des actions simples (voir → choisir → ajouter au panier).

## Architecture fonctionnelle clé

### Sélection du magasin
- **Obligatoire** avant toute action panier (ajout, retrait)
- Optionnelle pour la consultation de recettes seule
- Déclenchée automatiquement par l'assistant si aucun magasin n'est sélectionné et que le shopper veut agir sur le panier
- Mémorisée **dans la session uniquement** (non persistée entre deux conversations)
- Interface : Store Locator — le shopper saisit ville, code postal ou adresse → liste de magasins Carrefour proches → sélection

### Moteur de recherche
- Recherche par **mots-clés** (pas de compréhension sémantique fine)
- Catalogue en temps réel du magasin sélectionné
- Résultats non garantis pour toutes les références (produits non disponibles possibles)

### Composants UI intégrés dans le chat
Les réponses de l'assistant combinent du **texte conversationnel** + des **composants UI visuels** rendus dans l'interface ChatGPT :
- Carrousel de recettes
- Panneau de détail recette
- Interface Liste de courses
- Vue Panier
- Store Locator

## Contraintes et limitations MVP connues

| Contrainte | Comportement attendu |
|---|---|
| Magasin non mémorisé inter-sessions | Le shopper doit re-sélectionner son magasin à chaque nouvelle conversation |
| Quantité convives non modifiable via UI | Ajustement uniquement via message texte |
| Pas de quantités dans la liste de courses | Les quantités se gèrent dans la vue Panier (boutons − / +) |
| Recherche approximative | Une demande vague peut produire des résultats non pertinents |
| Temps de réponse variable | Recherche en temps réel dans le catalogue magasin |
| Pas de confirmation textuelle systématique | Certaines actions (ajout/retrait via boutons) ne génèrent pas de message de confirmation de l'assistant |

## Ce que l'assistant NE fait PAS

- Il ne répond pas aux questions hors sujet (météo, actualité, etc.) → il redirige poliment
- Il n'ajoute pas au panier sans action explicite du shopper (un "ça a l'air bon !" ne déclenche pas d'ajout)
- Il n'invente pas de données (prix, images) : si une information est absente, elle n'est pas affichée
