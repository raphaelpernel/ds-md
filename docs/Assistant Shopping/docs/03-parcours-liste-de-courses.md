# Parcours utilisateur — Liste de courses

> **Assistant Shopping Carrefour Belgique — ChatGPT**
> Surfaces : Web, WebMobile, App Mobile | Version : MVP

---

## Vue d'ensemble du parcours

Le shopper demande en langage naturel une liste de produits → l'assistant génère une liste visuelle → le shopper sélectionne les articles → il les ajoute au panier en un clic.

```
[Demande texte]
      ↓
[Sélection magasin ?] ──(déjà fait)──→ [Liste de courses générée]
      ↓ (si absent)                            ↓
[Store Locator]                    [Coche / décoche articles]
      ↓                                [Remplacement article] (opt.)
[Confirmation magasin]                          ↓
                                  [Ajouter la sélection au panier]
                                                ↓
                                       [Vue Panier]
```

---

## Étape 1 — Sélection du magasin

**Déclencheur** : le shopper envoie une demande de liste de courses sans magasin sélectionné dans la session.

**Comportement de l'assistant** :
- Il NE génère PAS la liste immédiatement
- Il demande ville, code postal ou adresse
- Il affiche le **Store Locator** : liste de magasins Carrefour proches (nom + adresse, aucun code technique visible)
- Le shopper sélectionne un magasin (clic ou saisie nom/numéro)
- L'assistant confirme le choix et génère ensuite la liste

**Persistance** : mémorisé pour toute la session. Non persisté entre sessions.

---

## Étape 2 — Génération de la liste de courses

**Déclencheur** : message texte du shopper (voir variantes ci-dessous).

**Comportement de l'assistant** :
1. Interprète la demande et identifie les produits recherchés
2. Recherche les produits disponibles dans le magasin sélectionné
3. Affiche l'**interface Liste de courses**
4. Accompagne la liste d'une **courte phrase de contexte**

### Composant Interface Liste de courses

Chaque article de la liste contient :
- Image du produit
- Nom du produit
- Marque
- Prix (en €)
- Case à cocher (cochée par défaut)
- Icône de remplacement 🔄

**État initial** : tous les articles sont **pré-cochés** à l'affichage.

**Bouton principal** : "Ajouter la sélection au panier" — visible en bas de la liste.

### Variantes de demandes interprétées

| Type de demande | Exemple | Comportement attendu |
|---|---|---|
| Liste d'articles explicite | "Fais-moi une liste avec du lait, des œufs et du pain" | Produits correspondant à chaque article demandé |
| Contrainte prix | "Une liste pas chère avec du riz, des tomates et des bananes" | Produits économiques prioritaires (marques simples, prix bas) |
| Contrainte bio | "Une liste bio" + produits | Produits biologiques prioritaires |
| Repas / occasion | "J'ai besoin de quoi pour faire une raclette ?" | Ingrédients typiques du repas (fromage, pommes de terre, charcuterie…) |
| Type de repas | "Une liste pour un petit déjeuner" | Produits adaptés (café, lait, pain, beurre, confiture, jus…) |
| Catégorie produit | "Je veux des légumes surgelés" | Légumes surgelés (pas des frais) |
| Liste longue | 8 à 10 produits différents | Liste complète sans produits manquants évidents |
| Reformulation après liste | "Même liste mais en bio" | Régénération en priorisant les produits biologiques |

> ⚠️ **Limite technique :** `shopping_list.search` accepte **1 à 50 termes** par appel. Une liste de plus de 50 articles nécessiterait plusieurs appels successifs — cas à spécifier dans les AC si on couvre des listes hebdomadaires longues.

**Hors sujet** : l'assistant décline poliment et redirige vers recettes/courses.

---

## Étape 3 — Interaction avec la liste

### Sélection des articles

- **Décocher un article** : clic sur la case → produit désélectionné (ne sera pas ajouté au panier)
- **Recocher un article** : clic → produit de nouveau sélectionné
- Seuls les articles **cochés** sont ajoutés au panier

### Remplacement d'un article

**Déclencheur** : clic sur l'icône 🔄 à côté d'un article.

**Comportement** :
1. L'assistant propose un ou plusieurs **produits alternatifs**
2. Le shopper choisit un alternatif
3. Le produit remplacé est mis à jour dans la liste

> ℹ️ Les quantités ne sont pas gérables dans la liste de courses — uniquement dans la vue Panier.

---

## Étape 4 — Ajout au panier

**Déclencheur** : clic sur "Ajouter la sélection au panier".

**Comportement** :
1. Seuls les articles **cochés** sont ajoutés — la validation par le shopper est une **contrainte technique** (le code interdit explicitement d'enchaîner `shopping_list.search` → `basket.add_product` sans action utilisateur intermédiaire), pas seulement un choix UX
2. Le bouton passe à l'état **grisé** avec le texte "Produits déjà ajoutés au panier"
3. Chaque article de la liste affiche un **badge vert "✓ Ajouté"**
4. Un bouton/lien vers la vue Panier devient accessible

**Après ajout** : un nouveau clic sur le bouton grisé ne produit aucun effet (ou affiche un message de confirmation).

### États du bouton principal

| État | Affichage |
|---|---|
| Avant ajout | Bouton bleu "Ajouter la sélection au panier" |
| Après ajout | Bouton grisé "Produits déjà ajoutés au panier" |

### États des articles

| État | Affichage |
|---|---|
| Coché (défaut) | Case activée |
| Décoché | Case vide ou grisée |
| Ajouté au panier | Badge vert "✓ Ajouté" |

> ℹ️ **Sélection des produits :** Pour chaque article coché, Mealz applique la **règle de renvoi** : priorité aux produits frais > surgelés > boîte/sec, puis MDD en priorité, prix <130% du minimum, grammage <175% du requis. Voir `ressources/regle-renvoi-produits.md`.

---

## Étape 5 — Vue Panier

**Accès** : bouton/lien visible après ajout.

**Contenu affiché** :
- Nom du produit
- Prix
- Boutons **−** et **+** pour modifier les quantités
  - Augmentation : quantité passe à 2 ou plus, total mis à jour
  - Diminution : quantité réduite ; si elle atteint 0, le produit est retiré ou une confirmation est demandée

---

## Comportements conversationnels à connaître

- L'assistant peut légèrement paraphraser la demande — comportement normal.
- Si un produit n'est pas disponible dans le magasin, l'assistant peut le signaler en texte (attendu en MVP).
- Une demande très vague ("Fais-moi à manger") peut produire des résultats aléatoires — préférer des demandes avec des produits ou un contexte de repas.

---

## Limitations connues (MVP)

| Limitation | Détail |
|---|---|
| Pas de quantités dans la liste | Géré uniquement dans la vue Panier |
| Recherche par mots-clés | "Lait entier" peut retourner du lait demi-écrémé si non disponible |
| Limite de 50 articles par appel | Une liste >50 produits nécessite plusieurs appels successifs |
| Validation utilisateur obligatoire | L'ajout au panier ne peut jamais être automatique après une recherche — contrainte technique |
| Produit absent possible | Tous les produits ne sont pas disponibles dans tous les magasins |
| Magasin non persisté | Redemandé à chaque nouvelle session |
| Temps de réponse variable | Recherche en temps réel dans le catalogue |
