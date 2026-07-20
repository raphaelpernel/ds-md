# Brief — packages/marmiton-prototype

## Intention

`marmiton-prototype` devient le package unique pour tout ce qui se déploie sous marmiton.fr côté prototypes. Il regroupe deux parcours distincts, accessibles depuis une page d'accueil de type hub (cards → routes internes) :

- **Recipe** (`/recipe`) : parcours d'achat "recette → panier → magasin → créneau → paiement → confirmation", le contenu historique du package.
- **Agent** (`/agent`) : futur parcours conversationnel agent. Le package `packages/marmiton-agent` existant sera probablement déprécié à terme au profit de ce chemin — pour l'instant `/agent` est un simple placeholder "à venir", sans dépendance au package `marmiton-agent`.

## Décisions

- **Cards internes, pas des liens Netlify externes** : contrairement à `packages/home` (qui pointe vers d'autres domaines Netlify), ici les cards pointent vers des routes internes au même site (`/recipe`, `/agent`) — pattern CSS repris de `packages/home/app/page.css` (`home__grid`, `home__card`, tokens DS).
- **`/agent` = placeholder pour l'instant** : pas de redirection vers l'ancien site marmiton-agent, pas de migration de contenu. Juste une page "à venir" en attendant la refonte propre du parcours agent.
- **URLs en anglais** : toutes les routes du flow recipe ont été renommées FR→EN (le français dans les URLs est évité dans tout le monorepo, sauf `packages/marmiton-agent` qui n'a pas été touché car probablement voué à être déprécié) :

  | Ancien (FR) | Nouveau (EN) |
  |---|---|
  | `/recette` | `/recipe` |
  | `/panier` | `/cart` |
  | `/magasin` | `/store` |
  | `/creneau` | `/slot` |
  | `/paiement` | `/payment` |
  | `/connexion` | `/login` |
  | `/confirmation` | `/confirmation` (déjà EN) |

  Seuls les segments d'URL ont changé — les libellés UI visibles (ex. "Retour recette", "Modifier le créneau") restent en français, ce n'était pas dans le périmètre de cette passe.

- **Même passe appliquée à `assistant-shopping`** (`/categorie` → `/category`, `/panier` → `/cart`) et **`form-mealz-planner`** (`/equipement` → `/equipment`, `/personnes` → `/people`, `/regime` → `/diet`, `/repas` → `/meals`, `/resultats` → `/results`), pour rester cohérent à travers le monorepo.
- **Titre de page corrigé** : `app/layout.tsx` avait un `<title>` resté sur "DS.MD — Mealz Design System" (copié-collé depuis le template racine) → corrigé en "Marmiton Prototype".

## Non fait (hors périmètre de cette session)

- Pas de renommage des libellés UI (texte visible en français) — seulement les segments d'URL.
- Pas de retrait/dépréciation effective de `packages/marmiton-agent` — décision à prendre plus tard.
- Pas de connexion réelle du parcours `/agent` à une logique conversationnelle — pure placeholder.
