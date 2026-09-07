# CoursesU Planner — placement des préférences

Statut : prototype UX exploratoire, non validé par des utilisateurs et non destiné à la production.

## Résultat du prototype

**Hypothèse :** le profil permanent reste la source de vérité dans Compte, mais doit être accessible depuis le Planner dans un bottom sheet ; l’envie hebdomadaire reste un objet distinct et optionnel.

**Prototype exploré :**
- Variante A — Desktop : conservation du bouton existant « Préférences » dans le header ; ouverture d’un bottom sheet.
- Variante B — Mobile : accès via le menu kebab, avec deux entrées séparées : « Mon profil alimentaire » et « Envie de la semaine ».
- Variante C — Signal contextuel : rappel discret après une action pertinente, sans ouverture automatique ni remplacement du flux catalogue.
- Simulateur Desktop/Mobile : bouton « Nos suggestions / Mon menu » inchangé, cartes swipe visibles, bottom sheet refermable, aucun troisième onglet.

## Comparatif UX

| Critère | A — bouton desktop | B — kebab mobile | C — signal contextuel |
|---|---|---|---|
| Découverte | ✅ Forte sur desktop, cohérente avec l’existant | ⚠️ Moyenne : dépend de la découverte du kebab | ⚠️ Bonne au bon moment, faible sinon |
| Non-interruption du swipe | ✅ Ouverture volontaire hors carte | ✅ Ouverture volontaire hors carte | ✅ Préserve le swipe si non modal/intrusif |
| Permanent / temporaire | ✅ Le sheet peut expliciter les deux | ✅ Distinction explicite dans le menu | ✅ Rappel contextuel très explicite |
| Densité mobile | N/A / à éviter sur petit écran | ✅ Très compacte | ✅ Faible si limité à un rappel |
| Cohérence avec l’existant | ✅ Réutilise le bouton desktop | ✅ Réutilise le kebab mobile | ⚠️ Nouveau pattern à cadrer |

## Constats

- ✅ Le bottom sheet permet de consulter le profil sans navigation sortante et sans ajouter de troisième tab au segmented existant.
- ✅ Le menu mobile peut accueillir les deux objets, à condition d’afficher leur portée : permanent pour le profil, temporaire pour l’envie.
- ✅ L’envie hebdomadaire est mieux présentée comme une action facultative (« Ajouter »), jamais comme un formulaire imposé à l’ouverture du Planner.
- ✅ Le bouton desktop « Préférences » doit être conservé : il est déjà visible et constitue le point d’ancrage le plus découvrable.
- ⚠️ Le kebab mobile seul risque de cacher une fonction importante ; le libellé du menu doit expliciter « Préférences et envie » ou afficher un badge discret si un profil est incomplet.
- ⚠️ Un signal contextuel peut interrompre la lecture si son timing est lié au swipe ; il doit être non bloquant, dismissible et limité en fréquence.
- ⚠️ La densité du sheet mobile doit rester courte au premier niveau : deux entrées, puis édition détaillée dans une vue secondaire.
- ⚠️ La terminologie « restrictions » / « allergènes » reste prudente et ne doit suggérer aucune garantie de sécurité.
- ❌ Le prototype ne permet pas de conclure quelle formulation ou quel timing sera compris par des utilisateurs réels.

## Recommandation

1. Garder le bouton existant « Préférences » sur desktop et l’ouvrir en bottom sheet.
2. Sur mobile, conserver le menu kebab mais regrouper clairement :
   - « Mon profil alimentaire » — réglages permanents ;
   - « Envie de la semaine » — contexte temporaire et optionnel.
3. Ne pas ouvrir automatiquement le prompt hebdomadaire.
4. Tester un signal contextuel C uniquement comme rappel non bloquant, après une action explicite (par exemple ajout d’une recette), jamais au milieu du swipe.

## Questions ouvertes à tester

- Les utilisateurs trouvent-ils le profil depuis le bouton desktop puis le kebab mobile ?
- Comprennent-ils immédiatement la différence entre profil permanent et envie temporaire ?
- Le bottom sheet est-il perçu comme une consultation rapide ou comme une sortie du Planner ?
- Quel wording mobile maximise la découverte sans augmenter la densité ?
- Un rappel après ajout d’une recette est-il utile ou perçu comme une interruption ?
- Quelle règle de fréquence/dismissal faut-il appliquer au signal contextuel ?

## Limites

Contenu, recettes et comportements simulés ; pas de persistance, analytics, tracking ni test utilisateur réel. Le prototype n’établit aucune décision juridique sur les allergènes et ne couvre ni budget, ni catalogue, ni envies récurrentes.

## Impact sur la spec

À intégrer uniquement après décision Zeus : accès Planner → bottom sheet, séparation des deux objets, maintien des tabs existants, règles de non-ouverture automatique et éventuelles limites du signal contextuel.
