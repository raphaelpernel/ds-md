# Brief — packages/hub

## Intention

Hub multi-client des prototypes et du design system Mealz. Anciennement
`packages/home` (liste de liens vers des sites Netlify indépendants) —
repensé en app unique hébergeant directement le contenu, pour permettre le
partage de composants entre prototypes et une distribution contrôlée par
client externe.

Voir le design complet : [`docs/superpowers/specs/2026-09-01-hub-multi-client-design.md`](../../../docs/superpowers/specs/2026-09-01-hub-multi-client-design.md)
et le plan d'implémentation du squelette : [`docs/superpowers/plans/2026-09-01-hub-skeleton.md`](../../../docs/superpowers/plans/2026-09-01-hub-skeleton.md).

## Décisions clés (squelette)

- **Un seul package Next.js**, pas de packages séparés + lib partagée : le
  partage de code entre prototypes prime sur l'isolation de déploiement.
  Le risque est assumé au niveau du process (on ne push pas de code cassé).
- **Deux niveaux de mot de passe** : un mot de passe "master" protège la
  racine `/` et débloque tout (session équipe) ; un mot de passe par client
  externe (`marmiton`, `coursesu`) protège uniquement `/<client>/*`.
  Cookies httpOnly signés (HMAC via Web Crypto), jamais de secret en clair
  dans le code — voir `.env.example`.
- **Brand verrouillée par client** : `/<client>/*` fixe `data-brand` côté
  serveur (via des headers posés par `proxy.ts`, lus par
  `app/layout.tsx`) et n'affiche jamais `BrandThemeSwitcher`.
- **Sidebar façon "Design Studio"** (visible uniquement en session master) :
  groupe **Mealz** (Neutral + Guide, extensible plus tard), un groupe par
  client externe.
- **`src/config/namespaces.ts`** dérive la liste des clients directement du
  registre `BRANDS` du design-system (`neutral` exclu) — ajouter un client
  revient à ajouter une brand côté design-system + son mot de passe en env
  var, pas à modifier ce fichier à la main.
- **`marmiton-prototype` monte directement sur `/marmiton`, pas
  `/marmiton/marmiton-prototype`** : le modèle `/<client>/<proto>` de la
  spec sert à désambiguïser plusieurs protos neutres déclinés sous un même
  client — un proto client-spécifique qui est la seule expérience de son
  client n'a pas cette ambiguïté.
- **`/marmiton` est une galerie de prototypes façon "Design Studio"
  (Sublime Security), pas le site Marmiton réel** : `app/(client)/marmiton/
  layout.tsx` ne monte ni `Header`, ni `Footer`, ni `CartProvider` — juste
  `ClientNamespaceShell`. Les vraies pages du parcours (recette → panier →
  ... → confirmation) vivent dans un route group séparé,
  `(funnel)/layout.tsx`, qui lui monte le chrome Marmiton complet ; ce
  découpage garantit que l'index galerie n'hérite jamais du chrome, même si
  d'autres routes non-funnel sont ajoutées plus tard sous `/marmiton`. Les
  cards de la galerie (`NamespaceCardGrid` avec `href`) ouvrent leur proto
  dans un nouvel onglet (`target="_blank" rel="noreferrer"`) — l'idée d'un
  canevas d'ouverture inline (vue chez Design Studio) est explicitement
  différée, jugée complexe pour peu de valeur immédiate.

## Statut

Le squelette (auth deux niveaux, sidebar, brand verrouillée) est en place.
Sous `/marmiton` :
- La galerie d'index (`/marmiton`) est en place, avec les cards Recipe et
  Agent.
- **Le parcours d'achat complet est migré et vérifié bout-en-bout** (plan
  [`2026-09-01-hub-marmiton-recipe-funnel.md`](../../../docs/superpowers/plans/2026-09-01-hub-marmiton-recipe-funnel.md),
  13 tâches) : `/marmiton/recipe` → `/marmiton/cart` → `/marmiton/login` →
  `/marmiton/store` → `/marmiton/slot` → `/marmiton/payment` →
  `/marmiton/confirmation`, avec `CartContext`, `RecipeAskBar` +
  `RecipeAgentDrawer` (agentScript/recipeAskScript) fonctionnels en
  navigation client-side. Vérification manuelle complète en navigateur
  (pas seulement `tsc`/tests) — voir le rapport de la tâche 13 du plan.
- **Le parcours agent conversationnel est migré et vérifié bout-en-bout**
  (plan [`2026-09-01-hub-marmiton-agent-flow.md`](../../../docs/superpowers/plans/2026-09-01-hub-marmiton-agent-flow.md),
  3 tâches) : `/marmiton/agent` (hero + grille éditoriale + `AgentConversation`
  scriptée avec carousel de recommandations, clarification par chips,
  ajout au panier, navigation vers `/marmiton/recipe`) — même route group
  `(funnel)` que le parcours d'achat, réutilise `agentScript.ts` et
  `CartContext` déjà migrés par le plan précédent. Vérification manuelle
  complète en navigateur — voir le rapport de la tâche 3 du plan.

Les deux parcours Marmiton (achat et agent) sont maintenant entièrement
migrés — les deux cards de la galerie `/marmiton` résolvent. La page
`/<client>` générique (`NamespaceCardGrid`) reste affichée en état vide
pour les clients pas encore migrés (CoursesU). La migration des protos
neutres fait l'objet de plans séparés (voir la section "Migration
progressive" de la spec).

## Limites connues (squelette, décisions assumées pour l'instant)

- **Pas de protection anti brute-force sur les gates** : un mot de passe
  partagé sans limite de tentatives HTTP est toute la barrière de sécurité
  d'un espace client. Acceptable pour un squelette à mots de passe distribués
  manuellement à une poignée de personnes, mais à revisiter avant d'exposer
  un vrai client externe en continu.
- **Pas de déconnexion, pas de redirection si déjà authentifié sur `/gate`** :
  les cookies durent un an sans moyen de les effacer depuis l'UI ; visiter
  `/gate` déjà authentifié réaffiche le formulaire plutôt que de rediriger.
- **Reset CSS non scopé dans certaines pages du funnel** (`cart`, `recipe`,
  `slot`) : un `<style>` inline injecte `* { box-sizing: border-box; margin:
  0; padding: 0; }` sans portée — hérité tel quel de `marmiton-prototype`,
  où l'app entière pouvait se le permettre. Dans le hub, ces pages
  s'affichent à l'intérieur de `MasterShell` pour une session master, donc
  ce reset touche aussi la sidebar du hub. Pas d'effet visuel constaté à ce
  jour (vérifié en session master lors de la vérification manuelle du plan
  recette), mais à surveiller si une future page du shell développe un
  style qui dépend de `margin`/`padding`/`box-sizing` par défaut du
  navigateur.
