# Insights code — MCP Server (`mealz-mcp-server`)

> Source : exploration du repo GitHub `miamtech/mealz-mcp-server` (juin 2026).  
> Ce fichier complète `04-architecture-technique.md` avec des éléments tirés directement du code.

---

## 1. Le MCP Server n'est pas exclusif à Carrefour Belgique

Le système de thèmes révèle un **registre multi-supplier déjà en place** :

| Supplier | IDs | Clé thème |
|---|---|---|
| Courses U | `7` | `coursesu` |
| Carrefour Belgique | `25`, `27` (UAT / prod) | `carrefour-belgique` |

→ **Impact PM :** Le MCP Server est une brique produit réutilisable, pas un one-shot Carrefour. Tout nouveau retailer = ajout d'un thème + IDs dans le registre. À mentionner dans la roadmap multi-retailer.

---

## 2. Noms d'événements analytiques réels (utiles pour les AC)

Les événements émis par chaque tool (à utiliser dans les AC si on spécifie des analytics) :

| Tool | Événement émis |
|---|---|
| `recipe.search` | `recipe.search` |
| `render.recipe.carousel` | `recipe.rendered` |
| `recipe.get_details` | `recipe.details` |
| `product.search` | `product.search` |
| `shopping_list.search` | `shopping-list.search` |
| `render.product.list` | `product.rendered` |
| `basket.get` | `basket.get` |
| `basket.initialize` | `basket.initialized` |
| `basket.set_store` | `basket.store.set` |
| `basket.add_product` | `basket.product.added` |
| `basket.add_recipe` | `basket.recipe.added` |
| `basket.remove_recipe` | `basket.recipe.deleted` |
| `basket.update_guest_count` | `basket.guest_count.updated` |
| `render.checkout_button` | `basket.checkout.button.rendered` |
| `point_of_sale.get` | `pos.get` |
| `point_of_sale.search` | `pos.search` |

---

## 3. Workflow obligatoire avant toute action panier

Le code de `basket.initialize` impose un ordre strict que les specs doivent refléter :

```
1. basket.get ou basket.add_* → retourne "No basket found in client"
2. → appel point_of_sale.search (jamais basket.initialize sans POS confirmé par l'user)
3. → user sélectionne un magasin
4. → basket.initialize avec le pointOfSaleId
5. → reprise de l'action initiale
```

→ **À spécifier dans tout AC impliquant le panier :** prévoir le cas "panier non initialisé" comme chemin alternatif, pas juste comme cas d'erreur.

---

## 4. Nuance i18n : recettes en français, liste de courses en langue active

- `recipe.search` : instruction explicite `SEARCH_TERMS_IN_FRENCH_INSTRUCTION` → les termes de recherche sont **toujours traduits en français** avant l'appel, quelle que soit la langue du shopper.
- `shopping_list.search` : instruction `SEARCH_TERMS_IN_ACTIVE_LOCALE_INSTRUCTION` → les termes de recherche suivent la **langue active** (fr ou nl).

→ **Impact specs :** Pour un shopper nl, les recettes peuvent être moins bien matchées (recherche forcée en fr). À surveiller comme limitation connue à documenter.

---

## 5. Liste de courses : règle critique pour l'ajout au panier

Le code interdit explicitement d'enchaîner `shopping_list.search` → `basket.add_product` automatiquement :

> *"NEVER call basket.add_product from search results — call render.product.list and wait for user validation first."*

→ **L'étape de validation utilisateur (coche/décoche dans le widget) est une contrainte technique**, pas seulement UX. À maintenir dans les AC.

---

## 6. Liste de courses : limite de 50 articles par recherche

`shopping_list.search` accepte **1 à 50 termes** par appel.  
→ Une demande de liste très longue (>50 articles) nécessiterait plusieurs appels — cas edge à mentionner si on spécifie des listes de menus hebdomadaires.

---

## 7. Widget Panier — états et fonctionnalités non documentés

Le code du composant `basket.tsx` révèle des états et comportements supplémentaires :

| État / Fonctionnalité | Description |
|---|---|
| `BasketLoadingContent` | État de chargement pendant le fetch |
| `BasketEmptyContent` | État panier vide (affiché si 0 produit) |
| `BasketStaleOverlay` | Overlay affiché quand les données du panier sont périmées → bouton "Rafraîchir" |
| `isRefreshing` | Indicateur pendant le rafraîchissement |
| Mode `inline` / `fullscreen` | Le panier peut s'afficher en mode intégré ou plein écran (toggle) |
| Mode PiP (picture-in-picture) | Fonctionnalité envisagée (`handleRequestPip`) — non finalisée |
| Remplacement produit | Depuis le panier, on peut remplacer un produit → ouvre `ProductDetailWrapper` en plein écran |
| `totalItemCount` | Compteur d'articles total affiché dans le panier |

→ **Pour les specs panier :** ajouter l'état "données périmées" (stale) comme cas à couvrir dans les AC (ex : si l'utilisateur modifie le panier depuis le site Carrefour en parallèle).

---

## 8. Architecture d'ajout à consulter lors de la rédaction de tickets

Pour chaque nouveau tool ou widget, la structure du code est :

```
src/tools/<catégorie>/<action>/
  ├── <nom>_tool.ts      → définition du tool (name, description, inputSchema, outputSchema)
  ├── handler.ts         → logique métier (appel API)
  └── schemas/           → types Zod partagés

src/widgets/<widget-name>/
  ├── <widget>.tsx       → composant React principal
  ├── widget-entry.tsx   → point d'entrée (mount React)
  ├── handler.ts         → resource MCP (retourne le HTML)
  ├── index.ts           → export McpResource
  └── _components/       → sous-composants
```

→ Lors de la rédaction d'un ticket "nouveau tool" ou "nouveau widget", référencer cette structure dans les specs techniques pour guider les devs.
