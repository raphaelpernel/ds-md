# Architecture technique — MCP Server Mealz

> **À qui s'adresse ce fichier ?** Au PM pour rédiger des user stories avec des critères d'acceptance précis, comprendre ce que l'agent peut ou ne peut pas faire, et aligner les specs avec les contraintes réelles de l'implémentation.
>
> Pour la documentation technique complète (code, patterns, guide contribution), voir `ressources/mcp-presentation.html`.

---

## Vue d'ensemble en 1 phrase

L'assistant fonctionne via un **MCP Server** (hébergé sur Cloud Run) qui reçoit les demandes de ChatGPT, les traite via des **tools** et renvoie des données + des **widgets HTML** qui s'affichent dans l'interface ChatGPT.

```
ChatGPT  →  MCP Server (Mealz)  →  mealz-hub  →  miam API (catalogue Carrefour)
              ↓
         Widgets HTML (composants UI dans le chat)
```

---

## Les 22 tools — ce que l'agent peut faire

### 🍽️ Recettes
| Tool | Ce que ça fait |
|---|---|
| `recipe.search` | Recherche des recettes par mots-clés |
| `recipe.get_details` | Récupère ingrédients, étapes et infos nutritionnelles |
| `render.recipe.carousel` | Affiche un carrousel visuel de recettes dans le chat |

### 🛒 Produits
| Tool | Ce que ça fait |
|---|---|
| `product.search` | Recherche des produits dans le catalogue |
| `product.get_details` | Récupère prix, disponibilité, infos produit |
| `shopping_list.search` | Trouve les produits correspondant à une liste de courses |
| `render.product.carousel` | Affiche un carrousel de produits cliquables |
| `render.product.list` | Affiche une liste de produits avec ajout au panier |
| `render.product.detail` | Affiche la fiche détaillée d'un produit |

### 🧺 Panier
| Tool | Ce que ça fait |
|---|---|
| `basket.get` | Récupère le panier actuel de l'utilisateur |
| `basket.initialize` | Crée un panier pour un point de vente donné |
| `basket.set_store` | Change le magasin associé au panier |
| `basket.reset` | Vide entièrement le panier |
| `basket.add_product` | Ajoute un ou plusieurs produits au panier |
| `basket.remove_product` | Supprime un produit du panier |
| `basket.update_product` | Met à jour la quantité d'un produit |
| `basket.add_recipe` | Ajoute les ingrédients d'une recette au panier |
| `basket.remove_recipe` | Retire une recette et ses ingrédients du panier |
| `basket.update_guest_count` | Ajuste les quantités pour le nombre de convives |
| `render.checkout_button` | Affiche le bouton de commande vers le site Carrefour |

### 🏪 Point de vente
| Tool | Ce que ça fait |
|---|---|
| `point_of_sale.get` | Récupère les infos d'un magasin par son ID |
| `point_of_sale.search` | Recherche des magasins par nom ou géolocalisation |

---

## Les widgets — composants UI dans le chat

Les widgets sont des composants React servis comme fichiers HTML autonomes et affichés directement dans l'interface ChatGPT. Chaque widget est déclenché par un ou plusieurs tools.

| Widget | Déclenché par | Ce qu'il affiche |
|---|---|---|
| `basket` | `basket.get` | Vue complète du panier (articles, recettes, quantités) |
| `basket-action-feedback` | `basket.add_product` et autres actions panier | Confirmation visuelle d'une action sur le panier |
| `checkout-button` | `render.checkout_button` | Bouton de redirection vers le site Carrefour |
| `recipe-carousel` | `render.recipe.carousel` | Carrousel de cartes recettes scrollable |
| `product-carousel` | `render.product.carousel` | Carrousel de produits cliquables |
| `product-list` | `render.product.list` | Liste de produits avec ajout au panier |
| `product-detail` | `render.product.detail` | Fiche détaillée d'un produit |
| `recipe-detail-inline` | (détail recette) | Vue détaillée d'une recette dans le chat |

### Ce que les widgets peuvent faire
Depuis un widget, il est possible de :
- **Appeler un tool** directement (ex : le widget panier peut appeler `basket.remove_product` via un bouton)
- **Envoyer un message dans le chat** (ex : "J'ai modifié mon panier" → relance la conversation)
- **Se synchroniser entre eux** : si plusieurs widgets sont ouverts en même temps, ils se mettent à jour automatiquement quand le panier change (sans rappeler le serveur)

---

## Distinction importante pour les specs : tools data vs tools render

**Tools "data"** (`basket.*`, `recipe.search`, `product.search`, etc.) :
- Font un vrai appel à l'API catalogue Carrefour
- Peuvent échouer (produit indisponible, magasin non sélectionné, erreur réseau)
- Nécessitent un token d'authentification valide
- → Les user stories doivent avoir des **cas d'erreur explicites** dans les AC

**Tools "render.*"** (`render.recipe.carousel`, `render.product.list`, etc.) :
- Ne font **aucun appel API** — ils retournent uniquement le pointeur vers le widget à afficher
- Ne peuvent pas échouer par eux-mêmes
- → Les user stories les concernant portent sur le **comportement UI**, pas sur la donnée

---

## Contraintes techniques — traduction PM

| Contrainte technique | Impact sur les specs |
|---|---|
| **Serveur stateless** : pas de session persistante entre deux requêtes | Le magasin sélectionné n'est pas mémorisé entre deux conversations → à mentionner dans les AC |
| **Authentification par token JWT** : requis à chaque action panier | Sans compte connecté, les actions panier sont impossibles → cas "non connecté" à spécifier |
| **Recherche par mots-clés** (pas sémantique) | Une demande vague peut retourner des résultats non pertinents ou vides → prévoir l'état "aucun résultat" |
| **Catalogue en temps réel** du magasin sélectionné | Un produit peut être disponible dans un magasin et absent dans un autre → le magasin doit être sélectionné avant toute recherche produit |
| **Pas de modification de quantité convives dans l'UI** | Le shopper ne peut ajuster le nombre de convives que par message texte (MVP) |
| **Synchro inter-widgets via BroadcastChannel** | Si le shopper a plusieurs widgets ouverts, ils se synchronisent automatiquement — pas besoin de spécifier un "refresh manuel" |
| **Analytics fire-and-forget** | Les événements analytics n'impactent pas la réponse de l'assistant — pas de cas de gestion d'erreur à prévoir côté UX |
| **i18n fr / nl** | Toutes les chaînes texte de l'assistant sont gérées dans un catalogue de traduction → les user stories multilingues sont techniquement faisables (fr + nl) |

---

## Architecture d'authentification — ce que le PM doit savoir

- L'utilisateur s'authentifie via son **compte Carrefour** (Identity Provider Carrefour)
- Le token JWT est transmis à chaque interaction avec le panier
- **OpenAI ne reçoit jamais** les données personnelles de l'utilisateur ni le catalogue Carrefour
- Tout le matching produit et la personnalisation restent dans l'infrastructure Mealz

---

## Roadmap technique identifiée dans le code

Ces éléments sont mentionnés comme "direction future" dans l'implémentation — utile pour la roadmap PM :

| Sujet | État | Description |
|---|---|---|
| **Transport SSE** | Envisagé | Permettrait au serveur de pousser des mises à jour proactives vers ChatGPT (ex : notifier quand le panier est modifié depuis un autre canal) |
| **Widgets portables** | Envisagé | S'affranchir de la dépendance au SDK OpenAI pour que les widgets fonctionnent sur n'importe quel client MCP (pas seulement ChatGPT) |

---

## Référence technique complète

→ `ressources/mcp-presentation.html` — présentation 13 slides interactive (architecture, code, guide de contribution pour les devs)
