# Développement ASTER

Document interne de réalisation et d’exploitation, exclu des productions remises aux cadres évaluateurs. Les comptes, facilités et limites décrits ici concernent uniquement le démonstrateur ; ils ne constituent pas des règles de production et ne doivent pas être affichés dans l’interface ni recopiés dans les livrables.

## Périmètre initial

Cette première version fournit le parcours de connexion et de déconnexion, quatre comptes de démonstration et un accueil affichant le profil reconnu par le serveur. Elle ne réalise pas encore les fonctions métier, le rattachement effectif aux écoles, LDAP, S3 ou les échanges Windows.

PostgreSQL et JavaScript répondent à la demande de l’utilisateur du 6 novembre 2026. React, Vite, Express et OpenID Connect sont les choix d’implémentation de cette initialisation. Les icônes de l’accueil proviennent de Lucide. Le thème Keycloak reprend les deux captures fournies dans [design/MinDefConnect/](../design/MinDefConnect/) ; le symbole du bouton a été redessiné en SVG.

La connexion est réellement effectuée par Keycloak : le serveur échange le code OpenID Connect, vérifie le jeton signé, le state, le nonce et PKCE, puis conserve la session dans PostgreSQL. Le navigateur ne reçoit qu’un cookie de session HttpOnly. Le serveur accepte exactement un des quatre rôles ASTER transmis par le fournisseur ; aucun rôle n’est choisi dans le navigateur.

## Démarrage local

Prérequis : Node.js 22.12 ou supérieur, npm, Docker avec Docker Compose. Depuis la racine du dépôt :

```sh
cd application
npm ci
npm run infra:up
npm run dev
```

| Service | Adresse | Usage |
| --- | --- | --- |
| Interface ASTER | http://localhost:5173 | Point d’entrée du démonstrateur |
| Serveur Express | http://localhost:3001 | API et parcours OIDC ; accessible par le proxy Vite |
| Keycloak | http://localhost:8081 | Fournisseur d’identité local et thème de connexion |
| Console Keycloak | http://localhost:8081/admin | Administration technique du fournisseur |
| PostgreSQL | localhost:5432 | Bases `aster` (sessions) et `keycloak` (identités) |

Utiliser le nom d’hôte `localhost`, qui correspond aux redirections OIDC déclarées. Le port 8081 évite le port 8080 déjà utilisé sur la machine. Les conteneurs exposent leurs ports uniquement sur la boucle locale.

Toutes les commandes npm s’exécutent depuis `application/`. Un seul manifeste et un seul fichier de dépendances verrouillées sont partagés par le front, le back et les tests. `npm run dev:frontend` et `npm run dev:backend` permettent de lancer les deux composants séparément.

Les valeurs de développement sont fournies par défaut. Pour les modifier, copier `.env.example` vers `.env` dans `application/` et adapter la configuration. Si les adresses ou le client OIDC changent, adapter également `infra/compose.yaml` et les redirections du client dans le realm Keycloak. Les secrets de démonstration sont publics et destinés exclusivement au démarrage local.

## Comptes du démonstrateur

| Email | Identifiant court également accepté | Profil ASTER |
| --- | --- | --- |
| superadmin@aster.demo | superadmin | Super administrateur |
| admin@aster.demo | admin | Administrateur |
| gestionnaire@aster.demo | gestionnaire | Gestionnaire |
| formateur@aster.demo | formateur | Formateur |

Laisser le mot de passe vide. Le realm `aster-demo` utilise délibérément un flux qui identifie un utilisateur local existant sans lui demander de secret. Le champ mot de passe du thème est en lecture seule et n’est pas transmis. Ce mécanisme est limité au démonstrateur. L’inscription et la récupération du mot de passe ne sont pas implémentées ; les boutons correspondants renvoient vers l’administrateur, sans annoncer de création de compte ou d’envoi de courriel.

La consigne de présentation du 6 novembre impose de conserver ces modalités dans ce guide interne : aucune liste de comptes, indication de mot de passe vide, étiquette de démonstration ou aide technique de démarrage ne doit apparaître dans l’interface ou dans les productions remises aux cadres. Les captures des fiches sont des illustrations de la cible en production. Les comptes du realm conservent leurs identifiants techniques ; leur nom affiché ne mentionne pas la démonstration.

Le compte technique de la console Keycloak est `keycloak-admin` avec le mot de passe local `keycloak-admin-demo-local`. Il est distinct du super administrateur ASTER.

Les sessions ASTER expirent au plus tard à l’expiration du jeton d’identité, ou après une heure. Il n’y a pas encore de renouvellement automatique ni de synchronisation immédiate des changements de rôles en cours de session. Une déconnexion détruit la session ASTER puis termine la session Keycloak.

## Structure

```text
application/
├── frontend/             # Interface React, styles, entrée HTML et configuration Vite
│   └── src/
├── backend/              # Serveur Express, configuration, profils et tests unitaires
├── infra/
│   ├── compose.yaml      # Services PostgreSQL et Keycloak
│   ├── keycloak/         # Realm, comptes, rôles et thème de connexion
│   └── postgres/         # Initialisation de la base Keycloak
├── tests/               # Tests d’interface et d’intégration
├── .env.example         # Configuration locale du serveur
├── package.json         # Commandes et dépendances partagées
└── playwright.config.js
```

PostgreSQL conserve les données dans le volume Docker nommé par le projet Compose `aster-demo`. `npm run infra:down` arrête les services sans supprimer les données. L’import Keycloak n’écrase pas un realm déjà existant : après une modification du fichier d’import, répercuter les changements dans la console ou réimporter explicitement le realm concerné. Ne pas supprimer un volume pour contourner un problème sans vérifier les données qu’il contient.

## Vérifications

```sh
npm test
npm run build
npm run test:ui
```

Les tests d’interface utilisent Chrome installé sur la machine et vérifient la page publique sur ordinateur et mobile, avec une réponse anonyme simulée. Ils ne valident pas l’authentification.

Après le démarrage de PostgreSQL, Keycloak et du serveur Express (`npm run dev` dans un autre terminal) :

```sh
npm run test:e2e
```

Ces tests passent réellement par Keycloak pour chaque profil, rechargent la session et se déconnectent. Ils vérifient aussi le refus d’un utilisateur inconnu, d’un retour de connexion sans demande préalable, d’un state incorrect et d’une déconnexion d’origine externe. `GET /api/health` contrôle activement PostgreSQL et la disponibilité des métadonnées du fournisseur OIDC.

## Production

La cible demandée est le véritable MindefConnect. Son contrat d’intégration, ses accès, ses claims de profil et les redirections doivent être obtenus avant de finaliser cette connexion. La présence d’un adaptateur OIDC configurable dans le code ne constitue pas une intégration MindefConnect validée. Aucun déploiement de production n’est effectué ici.

`npm run build` produit l’interface dans `frontend/dist/`. `npm start` démarre le serveur en mode production et sert cette interface ; il exige `APP_URL`, `DATABASE_URL`, `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET` et un `SESSION_SECRET` d’au moins 32 caractères. HTTPS est obligatoire et le realm de démonstration ainsi que le secret client local sont refusés. Le serveur écoute sur la boucle locale et attend un proxy HTTPS de confiance devant lui.

Ne pas utiliser `infra/compose.yaml` en production : il contient le flux sans mot de passe, les comptes locaux et leurs secrets publics. Les paramètres d’hébergement et les exigences complémentaires restent à définir dans le cadrage.
