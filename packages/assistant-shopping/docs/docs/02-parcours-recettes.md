# Parcours utilisateur — Recettes

> **Assistant Shopping Carrefour Belgique — ChatGPT**
> Surfaces : Web, WebMobile, App Mobile | Version : MVP

---

## Vue d'ensemble du parcours

Le shopper formule une demande de recettes en langage naturel → l'assistant affiche un carrousel visuel → le shopper consulte le détail d'une recette → il l'ajoute à son panier (ou la retire).

```
[Demande texte]
      ↓
[Sélection magasin ?] ──(déjà fait)──→ [Carrousel recettes]
      ↓ (si absent)                            ↓
[Store Locator]                    [Détail recette] (optionnel)
      ↓                                         ↓
[Confirmation magasin]              [Ajout au panier]
                                                ↓
                                       [Vue Panier]
```

---

## Étape 1 — Sélection du magasin

**Déclencheur** : le shopper veut agir sur le panier (ajout/retrait) sans magasin sélectionné dans la session.

**Comportement de l'assistant** :
- Il NE génère PAS de recettes immédiatement
- Il demande ville, code postal ou adresse
- Il affiche le **Store Locator** : liste de magasins Carrefour proches avec nom et adresse (aucun identifiant technique visible)
- Le shopper sélectionne un magasin (clic ou saisie du nom/numéro dans la liste)
- L'assistant confirme le choix et enchaîne avec les recettes demandées

**Persistance** : mémorisé pour toute la session, non redemandé ensuite. Non persisté entre sessions.

> ℹ️ La recherche et la consultation de recettes fonctionnent **sans magasin sélectionné**. Le magasin est uniquement requis pour l'ajout/retrait panier.

---

## Étape 2 — Recherche et affichage des recettes

**Déclencheur** : message texte du shopper (voir variantes ci-dessous).

**Comportement de l'assistant** :
1. Interprète la demande (ingrédients, type de repas, régime, contexte)
2. Recherche dans le catalogue Mealz

> ⚠️ **Nuance i18n :** La recherche de recettes (`recipe.search`) est **toujours effectuée en français**, quelle que soit la langue active du shopper (fr ou nl). Un shopper néerlandophone peut donc obtenir des résultats moins précis si sa demande contient des termes spécifiques au nl. Limitation connue à documenter dans les AC multilingues.

3. Affiche **un seul carrousel** de recettes (pas de doublons même si plusieurs recherches internes)
4. Accompagne le carrousel d'une **courte phrase de contexte** (ex : "Voici quelques idées de recettes végétariennes.")

### Composant Carrousel

Chaque carte recette contient :
- Photo de la recette
- Titre
- Bouton **"Ajouter au panier"**

### Variantes de demandes interprétées

| Type de demande | Exemple | Comportement attendu |
|---|---|---|
| Ingrédient | "Recettes avec du poulet" | Recettes contenant du poulet |
| Régime | "Recettes végétariennes" | Recettes sans viande ni poisson |
| Type de repas | "Une entrée légère" / "Un dessert au chocolat" | Filtrage par catégorie de repas |
| Restriction | "Sans gluten" / "Sans gluten et sans lactose" | Recettes compatibles |
| Ingrédients disponibles | "J'ai du riz, des tomates et des œufs" | Recettes utilisant ces ingrédients |
| Contexte temporel | "Une recette rapide pour ce soir" | Recettes simples / rapides |
| Nombre de convives | "Pour 2 personnes" | Recettes pour 2 convives |
| Demande vague | "J'ai faim" / "Montre-moi des recettes" | Plats principaux par défaut, sans blocage |

**Hors sujet** : l'assistant décline poliment et redirige vers recettes/courses.

---

## Étape 3 — Consultation du détail d'une recette (optionnel)

**Déclencheur** : clic sur la photo ou le titre d'une carte du carrousel, ou question texte ("Quels sont les ingrédients ?", "Comment préparer le Quinoa bowl ?").

**Composant Panneau de détail** :

| Section | Contenu |
|---|---|
| Visuel | Photo agrandie + titre |
| Infos clés | Nombre de convives · Type de repas · Niveau de difficulté · Niveau de prix (€€€) |
| Ingrédients | Liste avec quantités (ex : quinoa 100 g, avocat 0,5 pièce) |
| Préparation | Étapes numérotées (Étape 1, Étape 2…) |

**Fermeture** :
- Croix ✕ haut droite → ferme le détail (retour au carrousel visible)
- Croix ✕ haut gauche → ferme la vue entière

**Via texte** : l'assistant fournit l'information demandée dans sa réponse textuelle ET ouvre le panneau de détail.

---

## Étape 4 — Ajout d'une recette au panier

**Déclencheurs possibles** :
- Clic sur "Ajouter au panier" sur une carte du carrousel
- Message texte explicite : "Ajoute cette recette pour 6 personnes", "Ajoute-moi une recette végétarienne au panier"

**Comportement** :
1. Les ingrédients de la recette sont ajoutés au panier Carrefour

> ℹ️ **Sélection des produits :** Pour chaque ingrédient, Mealz applique la **règle de renvoi** : priorité aux produits frais > surgelés > boîte/sec, puis MDD en priorité, prix <130% du minimum, grammage <175% du requis. Voir `ressources/regle-renvoi-produits.md`.

2. La carte recette se met à jour : bouton "Ajouter au panier" → **badge vert "✓ Ajoutée"** + **icône corbeille 🗑️**
3. L'assistant confirme l'ajout dans sa réponse textuelle (⚠️ uniquement si ajout via texte — pas de confirmation textuelle systématique lors d'un clic bouton)

**Avec nombre de convives** : si le shopper précise "pour 6 personnes", les quantités sont ajustées en conséquence.

**Sans carrousel préalable** : si la demande est directe ("Ajoute une recette végétarienne"), l'assistant recherche d'abord puis ajoute.

### États de la carte recette

| État | Affichage |
|---|---|
| Non ajoutée | Bouton "Ajouter au panier" |
| Ajoutée | Badge vert "✓ Ajoutée" + icône 🗑️ |

---

## Étape 5 — Vue Panier

**Accès** : bouton/lien vers le panier visible après ajout.

> ⚠️ **Mise à jour (2026-07-20, aligné sur le comportement réel du code) :** le panier n'a **pas** de ligne "recette" séparée. Ajouter une recette ajoute directement ses ingrédients comme des lignes produit normales, chacune **taguée avec le nom de la recette** (tag neutre, non cliquable, affiché sous le prix de la ligne). Un produit déjà présent au panier avant l'ajout de la recette voit son tag mis à jour avec le nom de cette recette. Retirer une recette retire toutes les lignes produit portant son tag.

**Contenu affiché par ligne produit** :
- Nom du produit
- Prix
- Tag "nom de la recette", si le produit provient d'une recette
- Boutons − et + pour modifier les quantités

---

## Étape 6 — Retrait d'une recette du panier

**Déclencheurs** :
- Clic sur l'icône corbeille 🗑️ sur la carte recette (badge "✓ Ajoutée")
- Message texte : "Retire la recette Curry de légumes de mon panier"

**Comportement** :
1. La recette est retirée du panier
2. La carte revient à son état initial ("Ajouter au panier")
3. ⚠️ Pas de confirmation textuelle systématique lors d'un retrait via bouton

**Via vue Panier** : la recette n'apparaît plus dans la liste.

---

## Comportements conversationnels à connaître

- **"Ça a l'air bon !"** → l'assistant NE procède PAS à un ajout automatique. Il répond de façon conversationnelle et demande confirmation.
- **"Même liste mais en bio"** (après un carrousel) → l'assistant régénère une liste similaire en priorisant le bio.
- L'assistant peut légèrement paraphraser la demande — comportement normal.

---

## Limitations connues (MVP)

| Limitation | Détail |
|---|---|
| Pas de modification de convives via UI | Uniquement via message texte |
| Recherche par mots-clés | Peut donner des résultats approximatifs sur des demandes vagues ou contextuelles |
| Recherche recettes forcée en français | Pour un shopper nl, les termes de recherche sont traduits en fr avant l'appel — résultats potentiellement moins précis |
| Pas de confirmation textuelle systématique | Actions via boutons (ajout/retrait) ne génèrent pas toujours un message assistant |
| Prix ou image absents possibles | Si la donnée n'existe pas en base, elle n'est pas affichée |
| Magasin non persisté | Redemandé à chaque nouvelle session |
