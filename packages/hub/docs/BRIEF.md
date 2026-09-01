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

## Statut

Squelette seul pour l'instant (pas de vrai prototype migré) — les pages
`/neutral` et `/<client>` affichent un état vide. La migration de
`marmiton-prototype`, puis des protos neutres, fait l'objet de plans
séparés (voir la section "Migration progressive" de la spec).

## Limites connues (squelette, décisions assumées pour l'instant)

- **Pas de protection anti brute-force sur les gates** : un mot de passe
  partagé sans limite de tentatives HTTP est toute la barrière de sécurité
  d'un espace client. Acceptable pour un squelette à mots de passe distribués
  manuellement à une poignée de personnes, mais à revisiter avant d'exposer
  un vrai client externe en continu.
- **Pas de déconnexion, pas de redirection si déjà authentifié sur `/gate`** :
  les cookies durent un an sans moyen de les effacer depuis l'UI ; visiter
  `/gate` déjà authentifié réaffiche le formulaire plutôt que de rediriger.
