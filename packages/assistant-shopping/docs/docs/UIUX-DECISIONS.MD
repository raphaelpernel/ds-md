# Décisions UI/UX — Assistant Shopping (prototype)

Journal des décisions de cadrage prises en session, pour éviter de reposer les mêmes questions.

---

## 2026-07-21 — Retrait du FAB, mode enseigne, retrait du CTA panier du bandeau

### 1. Lien nav au lieu du FAB
Le FAB flottant (`AssistantLauncher`) est remplacé par un lien inséré dans la nav de démo (`app/(demo)/layout.tsx`), entre "Catégorie" et "Panier". Il ouvre le même `Drawer` qu'avant.

**Style retenu** : pill pleine couleur brand (`Button variant="primary"`), pour contraster avec les liens de nav neutres — pas de CSS custom, le composant `Button` du DS donne déjà ce rendu (`--color-interactive-bg`, forme pill via `--shape-button`).

### 2. Mode enseigne — flag dédié sur le brand
Plutôt que de coupler ce comportement au theming visuel (`data-brand`), un flag métier explicite `isRetailer?: boolean` a été ajouté à `BrandOption` dans `packages/design-system/src/styles/tokens/brands/brands.ts`. Décision utilisateur : *"quand on crée un nouveau client, on demande si c'est une enseigne, comme ça ce flag est digéré par le theming sans avoir un toggle à actionner"*.

- `coursesu` → `isRetailer: true`
- `marmiton`, `neutral` → pas enseigne

**Note** : ceci déroge à la règle générale du repo qui interdit de toucher `brands.ts` en dehors de l'ajout d'un nouveau brand — dérogation explicitement voulue par l'utilisateur pour cette feature, car le flag doit vivre dans le theming.

Lecture côté app : hook `useIsRetailerBrand()` dans `src/lib/brand.ts` (assistant-shopping), qui lit `data-brand` sur `<html>` via `MutationObserver` (pas d'event custom émis par `BrandThemeSwitcher`) et regarde `BRANDS`. Exposé dans `AssistantContext` sous `isRetailerBrand`.

**Effets en mode enseigne** :
- Le bandeau de sélection magasin (`ChatShellActionsBar` / bouton "Choisir un magasin") est masqué — le site retailer a déjà son propre sélecteur.
- `requestAddRecipe` / `requestAddProducts` n'exigent plus de magasin sélectionné avant d'ajouter au panier — ajout direct, sans ouverture automatique du panier (comportement déjà comme ça par défaut, pas de régression à surveiller si un futur flow ajoute un `openCart()` explicite après ajout).

### 3. Retrait du CTA panier du bandeau
Le bouton "Voir mon panier" (icône + badge) dans `ChatShellActionsBar` est supprimé partout (bandeau embarqué du drawer ET page `/chat` standalone) — un autre mécanisme d'affichage du panier doit être conçu séparément (pas encore spécifié à cette date).

`useAssistant().openCart` reste dans le contexte (fonction toujours fonctionnelle, juste plus câblée à un bouton) en attendant ce nouveau mécanisme — à ne pas supprimer tant qu'un remplaçant n'est pas branché.
