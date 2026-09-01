# Hub multi-client — design

Date : 2026-09-01

## Contexte

Aujourd'hui le monorepo a 5 apps Next.js déployées indépendamment sur Netlify (`marmiton-prototype`, `assistant-shopping`, `form-mealz-planner`, `supermarket`, `home`), en plus de `design-system`. Ce découpage a été choisi délibérément pour isoler les pannes de build ([packages/home/docs/BRIEF.md](../../../packages/home/docs/BRIEF.md)) : `home` ne fait que lister des liens externes vers les autres sites.

Ce découpage empêche le partage de composants/logique entre protos (chacun a ses propres composants métier dupliqués) et ne permet pas de présenter les protos de façon contrôlée à un client externe (pas d'accès restreint, pas de verrouillage de marque).

## Objectif

Remplacer les 5 apps consommatrices par **un seul package hub**, pour :
- Partager trivialement composants/logique entre protos (même package).
- N'avoir que 2 packages réels à maintenir : `design-system` + `hub`.
- Distribuer un lien permanent par client externe, protégé par mot de passe, verrouillé sur la brand du client (impossible de switcher vers une autre brand).
- Donner à l'équipe une vue interne unifiée pour naviguer entre tous les protos et la doc du design system, inspirée de l'outil "Design Studio" de Sublime Security (vu dans [cette vidéo Dive Club](https://www.youtube.com/watch?v=628c4YuxAEM)).

## Décision : risque de déploiement assumé

Fusionner tous les protos dans une seule app Next.js réintroduit le risque qui avait motivé le découpage en 5 sites (un proto cassé bloque tout le déploiement). Décision assumée : le site Netlify du hub n'est mis à jour que par un push volontaire — si quelque chose casse en local, on ne push pas, et le site visible par les clients reste intact sur son dernier état stable. Pas de solution hybride (packages séparés + lib partagée) : jugée plus contraignante à maintenir qu'un seul package.

## Packages

- `design-system` : inchangé, reste la source de vérité des tokens/composants, indépendant.
- `packages/home` est repensé en **hub** complet (renommé `packages/hub` — son rôle change fondamentalement, il ne fait plus que lister des liens externes).
- Les anciens packages protos (`marmiton-prototype`, `assistant-shopping`, `form-mealz-planner`, `supermarket`) sont supprimés un par un, uniquement après que leur équivalent dans le hub est en prod et validé (migration progressive, voir plus bas).

## Modèle d'accès

Deux niveaux de mot de passe, jamais stockés en clair dans le repo (variables d'env Netlify) :

- **Mot de passe master** — protège la racine du hub (`/`). C'est le lien envoyé en interne à l'équipe. Une fois débloqué, il pose un cookie **master** qui donne accès à **tout** : tous les clients, Neutral, References — sans avoir à ressaisir de mot de passe par client.
- **Mot de passe par client externe** (Marmiton, CoursesU, ...) — protège uniquement `/<client>/*`. Pose un cookie scopé à ce client uniquement. Un client externe qui tente `/`  ou un autre `/<autre-client>/*` est bloqué par un message générique : "Vous ne pouvez pas accéder à cette section."

Mécanisme technique : `proxy.ts` Next.js (convention Next 16, ex-`middleware.ts`) vérifie un cookie httpOnly signé (HMAC, secret serveur) avant de laisser passer une requête. Absent/invalide → redirection vers une page de gate (`/gate` pour la racine, `/gate/<client>` pour un client), qui vérifie le mot de passe via une Server Action (comparaison côté serveur, jamais exposée au bundle client) et pose le cookie signé (longue durée — le lien reste débloqué une fois entré). Pour les routes `/<client>/*`, le middleware accepte le cookie master OU le cookie de ce client spécifique.

Netlify password-protection natif écarté : s'applique au site entier, pas de mot de passe différencié par chemin sur un même site.

## Modèle de routing et de contenu

- `/<client>/<proto>` pour chaque client externe (ex. `/marmiton/marmiton-prototype`).
- `/neutral/<proto>` pour les protos non liés à un client précis (`assistant-shopping`, `supermarket`, `form-mealz-planner`).
- Un proto neutre peut être **décliné** : monté à la fois sous `/neutral/<proto>` et sous `/<client>/<proto>` pour un ou plusieurs clients, avec uniquement la brand du layout qui change (le contenu du proto ne doit donc pas contenir de copie/logique spécifique à un client — ce qui est déjà le cas par définition d'un proto "neutre").
- Un proto client-spécifique (ex. `marmiton-prototype`) ne vit que sous son client.

Implémentation : le code de chaque proto vit une fois dans `src/features/<proto>/` (composants + data, migrés depuis l'ancien package). Les routes sous `app/<namespace>/<proto>/` sont de fins wrappers qui importent depuis `src/features/` — c'est ce qui permet la déclinaison multi-client sans dupliquer le code.

## Brand lock

Chaque `layout.tsx` de namespace fixe `data-brand` en dur via le script anti-FOUC existant (voir règle `CLAUDE.md` racine sur `BrandThemeSwitcher`) :
- `/neutral` et la racine (`/`) : brand neutre, `BrandThemeSwitcher` affiché (comme aujourd'hui).
- `/<client>/*` : brand du client verrouillée, `BrandThemeSwitcher` jamais rendu — impossible de switcher vers une autre brand depuis l'espace d'un client.

## Shell interne (session master) — inspiré de Design Studio

Visible uniquement en session master, jamais montré à un client externe. Sidebar façon Design Studio (Sublime Security), adaptée : "By Contributor" devient un groupe **Mealz** (contenu interne, pas lié à un client externe nommé) plutôt qu'un groupe par personne, et chaque client externe nommé (Marmiton, CoursesU, ...) a son propre groupe au même niveau que Mealz — pas de catégorie "Client" qui engloberait tout, puisque les clients externes ne voient jamais cette sidebar de toute façon.

- **Mealz** :
  - **Neutral** — liste des protos neutres.
  - **Guide** — avec de la place pour d'autres entrées plus tard type Design Principles/Blueprints (pas construites maintenant) — rendu stylé de `packages/design-system/docs/DESIGN.md` et de chaque `<Component>.design.md`, avec un lien "voir en interactif" vers la story Storybook correspondante. Storybook n'est pas remplacé : il reste le bac à sable interactif (props live, addon a11y) ; le Guide devient la vitrine de lecture, dans le même outil que les prototypes, sans changer de contexte.
- **Marmiton**, **CoursesU**, ... : un groupe par client externe nommé, listant ses protos (les siens + tout proto neutre qui lui est décliné).

Chaque groupe de proto est affiché en grille de cards (titre, description courte, date de mise à jour) plutôt qu'une simple liste de liens — remplace le modèle actuel de `home` (liens externes vers domaines Netlify).

Explicitement écarté pour l'instant (YAGNI, à reconsidérer si le nombre de protos grossit beaucoup) : filtrage par catégorie/contributeur comme dans Design Studio (69 protos, plusieurs designers) — pas le problème actuel (4-5 protos, petite équipe).

## Vue client externe

Pas de sidebar, pas de shell. Juste la grille de cards des protos de ce client (les siens + déclinaisons neutres), sous la brand verrouillée. Aucune visibilité sur les autres clients, sur Neutral, ou sur References.

## Migration progressive

1. Construire le squelette du hub (middleware, gate racine + gate par client, cookies master/client, layouts par namespace, sidebar shell) avec du contenu factice pour Marmiton et Neutral.
2. Pilote : migrer `marmiton-prototype` en entier vers `/marmiton/*`. Décommissionner son site Netlify une fois validé.
3. Migrer les protos neutres un par un vers `/neutral/*` (`assistant-shopping`, `supermarket`, `form-mealz-planner`), décommissionnant leurs sites au fur et à mesure.
4. Construire la page Guide/References (rendu de `DESIGN.md`).
5. Valider la déclinaison cross-client en montant un proto neutre déjà migré aussi sous un client existant (ex. CoursesU si pertinent à ce moment-là).
6. Ne jamais supprimer un package existant avant que sa route hub équivalente soit en prod et confirmée.

## Hors scope (pour plus tard, explicitement non traité ici)

- Filtrage par catégorie ou par contributeur dans la sidebar.
- Entrées "Design Principles" / "Blueprints" dans References — seul "Guide" est construit maintenant.
- Vraie authentification par compte utilisateur (le modèle reste mot de passe partagé par espace, pas de comptes individuels).
- Liste définitive des futurs clients au-delà de Marmiton et CoursesU (les seules brands existantes dans le design-system aujourd'hui).
