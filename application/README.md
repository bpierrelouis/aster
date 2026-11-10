# Développement ASTER

Document interne de réalisation et d’exploitation, exclu des productions remises aux cadres évaluateurs. Les comptes, facilités et limites décrits ici concernent uniquement le démonstrateur ; ils ne constituent pas des règles de production et ne doivent pas être affichés dans l’interface ni recopiés dans les livrables.

## Périmètre

L’application couvre l’ensemble des écrans : tableaux de bord personnalisables (dont des tableaux que chaque compte ajoute au sous-menu de l’accueil), salles par bâtiment avec tous leurs étages (vue éclatée), stock, inventaire et import JSON des matériels, remontées et états des lieux, supervision des postes (processus, détections, règles, statistiques) et administration (postes, applications, bâtiments, comptes).

Repères d’interface : le menu indique l’écran affiché, le titre de chaque écran est réservé aux lecteurs d’écran. Les actions d’un écran (Personnaliser, Nouvelle salle…) sont placées dans la barre haute et restent visibles. Le contenu repose sur le fond de l’ambiance (voir ci-dessous) ; ses cartes entrent en glissant de gauche à droite et, au défilement, se replient sous la barre haute (animations pilotées par le défilement, ignorées par les navigateurs qui ne les gèrent pas). Aucune barre de défilement n’est affichée : une zone qui déborde s’arrête sur l’élément suivant coupé à 40 % (entre le tiers et la moitié), qu’il s’agisse d’une ligne de tableau, d’une liste ou d’une rangée de cartes ([frontend/src/workspace/ui/peek.js](frontend/src/workspace/ui/peek.js)) ; les tableaux défilent dans leur cadre, en-tête toujours visible. La légende de la vue des salles est collée en haut de la scène. Les étages d’un bâtiment sont ceux de ses salles, rangées en grille la plus proche d’un carré ; un étage ou une salle choisi est mis en évidence parmi tous les étages. L’écran Stock ne montre que le stock. Le crayon de la vue d’un bâtiment, ou Administration › Bâtiments, renomme un bâtiment d’une école : le bâtiment étant une information des salles, ses salles, ses étages et ses règles de processus prennent le nouveau nom, et la vue du bâtiment suit ce nom ; un nom déjà utilisé dans l’école est refusé ([shared/buildings.js](shared/buildings.js)).

Équiper une salle : le bouton « + » de la fiche de la salle (profils autorisés à affecter du matériel) ouvre la fenêtre d’équipement ; c’est le seul ajout de matériel depuis une salle (la création d’une fiche se fait dans Matériels ou depuis le stock). La fenêtre demande un nombre de postes et un ou deux écrans par poste, puis prend, dans le stock en service de l’école et dans l’ordre des identifiants ASTER, autant d’unités centrales, d’écrans et de chaque périphérique (clavier, souris…) ; chaque composant peut être retiré de la composition et le nombre de postes est borné par le stock. Un second bloc propose les matériels secondaires du stock par modèle (vidéoprojecteur, réseau, audio, impression, autres), avec une quantité chacun. L’affectation passe par la même écriture que le glisser-déposer, validée par le serveur ([views/salles/salles-affectation.jsx](frontend/src/workspace/views/salles/salles-affectation.jsx)).

Tableaux de bord : les indicateurs affichent leur libellé en haut et leur valeur en bas, sans icône ; le libellé d’un indicateur d’état est précédé d’un point de couleur (hors service, remontées en attente, traitées, stock, garanties). Les diagrammes n’ont que leur titre. Diagrammes du catalogue ([frontend/src/workspace/widgets/diagrams.jsx](frontend/src/workspace/widgets/diagrams.jsx), formes dans [ui/charts-shapes.jsx](frontend/src/workspace/ui/charts-shapes.jsx)) : types de problème (anneau), matériels en salle et en stock (camembert), remontées par type et par semaine (aires empilées), matériels par bâtiment (colonnes en relief), postes connectés par bâtiment (arcs concentriques), réceptions de matériel par trimestre avec moyenne sur quatre trimestres, garanties du parc (pyramide), taux de disponibilité (jauge) et matériels par marque. Ils figurent dans les dispositions par défaut ; un compte qui a déjà enregistré sa disposition les obtient par « Disposition par défaut » ou par la galerie.

Préférences d’affichage, par compte ([shared/ambiance.js](shared/ambiance.js), appliquées au document par [core/theme.js](frontend/src/workspace/core/theme.js)), validées par le serveur (une valeur inconnue, comme les anciennes `brume` ou `frost`, revient au défaut) :

| Ambiance (identifiant) | Couleurs | Fond | Marque du menu |
| --- | --- | --- | --- |
| Aube (`aube`, défaut) | Blanc, encre, iris | « Flux », à la manière du menu de la PlayStation 4 : halos blanc et lilas, vagues lumineuses blanches et iris | Fleur ASTER iris |
| Encre (`encre`) | Noir, blanc, or ; attente en orangé pour la distinguer de l’or | Le même, transposé : halos et vagues lumineuses dorés sur le noir | Fleur ASTER dorée |
| Orion (`orion`) | Nuit, panneaux et bleus de la [charte ORION](../design/charte-graphique/charte-graphique-orion.html), lueur des cadres | Celui de la [maquette ORION](../design/maquettes/maquette-dashboard-orion.html) : ciel radial, lueur bleue sur tout le tour de l’écran | Étoile ORION |
| Vigie (`vigie`) | Brume, bleu pétrole, signal et corail de la [charte VIGIE](../design/charte-graphique-vigie/index.html) | Celui de la charte VIGIE : quadrillage de 32 px sur la brume | Repère VIGIE |

Les couleurs et les fonds sont des jetons ([styles/tokens.css](frontend/src/workspace/styles/tokens.css) : `--backdrop`, `--backdrop-waves`, `--backdrop-edge`) : les composants utilisent `--accent` et ne codent aucune couleur d’ambiance. `data-tone` (clair ou sombre) regroupe les réglages communs aux ambiances sombres, où aucune lumière ne suit le pointeur. Le verre a deux niveaux : Liquide (clair, presque transparent, liseré lumineux ; réfraction des bords des barres fixes dans Chrome et Edge) et Opaque (surfaces pleines, filet net).

PostgreSQL et JavaScript répondent à la demande de l’utilisateur du 6 novembre 2026. React, React Router, Vite, Express et OpenID Connect sont des choix d’implémentation. L’interface est une seule application React : la page de connexion, puis l’espace de travail, chargé seulement après la connexion, avec une adresse par écran (`/accueil`, `/salles/batiment/A`, `/remontees/attente`…). Le thème Keycloak reprend les captures de référence du [bouton d’accès](../design/MinDefConnect/reference-bouton-acces-mindefconnect.png) et du [formulaire de connexion](../design/MinDefConnect/reference-formulaire-connexion-mindefconnect.png).

## Deux modes de lancement

| Mode | Commande | Ce qui est réel |
| --- | --- | --- |
| Application connectée | `npm run infra:up` puis `npm run dev` | Connexion OIDC, comptes ASTER, données dans PostgreSQL, états des lieux dans S3, API des postes |
| Interface seule | `npm run dev:ui` | Mêmes règles et même API, sans Docker : données dans un fichier temporaire, utilisateur fixé par `ASTER_UI_ROLE` |

Les deux modes ne peuvent pas tourner en même temps : ils utilisent le port 5173.

### Application connectée

Prérequis : Node.js 22.12 ou supérieur, npm, Docker avec Docker Compose. Depuis la racine du dépôt :

```sh
cd application
npm ci
npm run infra:up
npm run dev
```

`npm run dev` lance le serveur Express, l’interface Vite et l’émulateur de postes (`npm run dev:postes`).

| Service | Adresse | Usage |
| --- | --- | --- |
| Interface ASTER | http://localhost:5173 | Point d’entrée |
| Serveur Express | http://localhost:3001 | API, parcours OIDC, API des postes ; accessible par le proxy Vite |
| Keycloak | http://localhost:8081 | Fournisseur d’identité local, substitut de MindefConnect |
| Console Keycloak | http://localhost:8081/admin | Administration technique du fournisseur |
| PostgreSQL ASTER | localhost:5432 | Base `aster` : données métier et sessions |
| Annuaire LDAP (OpenLDAP, `osixia/openldap` 1.5.0) | réseau Docker uniquement | Identités des utilisateurs (`ou=people,dc=aster,dc=demo`), fédérées par Keycloak |
| Stockage S3 (SeaweedFS 4.50) | http://localhost:8333 | Compartiment `aster-etats-des-lieux` |

Utiliser le nom d’hôte `localhost`, qui correspond aux redirections OIDC déclarées. Le port 8081 évite le port 8080 déjà utilisé sur la machine. Les conteneurs exposent leurs ports uniquement sur la boucle locale. Les images MinIO n’étant plus distribuées publiquement, le stockage compatible S3 local est SeaweedFS (licence Apache 2.0), avec authentification par clés ([infra/seaweedfs/s3.json](infra/seaweedfs/s3.json)).

Les valeurs de développement sont fournies par défaut. Pour les modifier, copier `.env.example` vers `.env` dans `application/` et adapter la configuration. Les secrets de démonstration sont publics et destinés exclusivement au démarrage local.

### Interface seule

```sh
cd application
npm ci
npm run dev:ui
```

L’utilisateur est le premier compte actif du profil `ASTER_UI_ROLE` (`admin` par défaut ; `superadmin`, `gestionnaire`, `formateur`), par exemple `ASTER_UI_ROLE=formateur npm run dev:ui`. Les postes sont émulés en mémoire (désactivables avec `ASTER_UI_AGENTS=0`). Les données sont conservées dans un fichier du dossier temporaire et régénérées quand la version du jeu de données change. Ce mode se limite à la boucle locale et n’est pas inclus dans le build de production.

## Identité et comptes

Le 6 novembre, l’utilisateur a retenu MindefConnect pour la production. Dans le démonstrateur, Keycloak tient lieu de MindefConnect ; depuis le 9 novembre, à la demande de l’utilisateur, il fédère un annuaire LDAP local qui contient les identités des utilisateurs ([infra/ldap/aster-utilisateurs.ldif](infra/ldap/aster-utilisateurs.ldif), chargé au premier démarrage). Keycloak n’a plus de base PostgreSQL : sa configuration est réimportée depuis [le realm](infra/keycloak/aster-realm.json) et ses données internes, sans valeur propre, sont perdues à la recréation du conteneur.

- L’annuaire ne porte que l’identité : identifiant (`uid`), nom (`cn`, `givenName`, `sn`) et adresse (`mail`). Les profils ne sont pas stockés dans l’annuaire : MindefConnect, en cible, ne transmettra pas les profils ASTER, et le profil comme l’école sont gérés dans ASTER.

- Le fournisseur authentifie et transmet une identité (sujet OIDC, adresse électronique). Le serveur échange le code, vérifie le jeton signé, le state, le nonce et PKCE, puis conserve la session dans PostgreSQL. Le navigateur ne reçoit qu’un cookie HttpOnly.
- Le profil, l’école de rattachement et l’état actif sont portés par le compte ASTER (table `aster_compte`), géré dans Administration › Comptes par l’administrateur de l’école ou le super administrateur. Le realm ne définit aucun rôle.
- À la connexion, l’identité est rapprochée du compte par son sujet, sinon par son adresse ; le sujet est alors enregistré. Une identité sans compte actif est refusée avec un message explicite.
- Le compte est relu à chaque requête : une désactivation ferme les sessions en cours et un changement de profil s’applique immédiatement.
- Le nom, l’auteur et la date des remontées, l’auteur des interventions et les numéros (remontées, identifiants ASTER) sont fixés par le serveur à partir du compte connecté.
- Préférences d’affichage, dispositions des tableaux de bord (tableaux personnalisés compris : liste `tableaux` et widgets de chacun), dernière consultation des notifications et école affichée par le super administrateur sont enregistrées par compte (table `aster_preference`).

**Démonstrateur uniquement :** comme le Keycloak local remplace MindefConnect, le serveur crée l’identité de chaque compte ASTER actif qui n’en a pas (au démarrage et après chaque modification des comptes), avec le compte technique `keycloak-admin`. La fédération étant en écriture, Keycloak l’enregistre dans l’annuaire LDAP (`uid` = partie de l’adresse avant `@`). Un compte créé dans ASTER permet donc de se connecter aussitôt. En production, ce provisionnement est désactivé : les identités existent chez le fournisseur.

### Comptes du démonstrateur

| Adresse | Nom ASTER | Profil | École |
| --- | --- | --- | --- |
| superadmin@aster.demo | S. Lefèvre | Super administrateur | Toutes |
| admin@aster.demo | C. Durand | Administrateur | École du numérique |
| gestionnaire@aster.demo | G. Bernard | Gestionnaire | École du numérique |
| formateur@aster.demo | L. Martin | Formateur | École du numérique |
| n.petit@aster.demo, r.garcia@aster.demo, m.robert@aster.demo | N. Petit, R. Garcia, M. Robert | Formateur | École du numérique |
| a.moreau@aster.demo | A. Moreau | Administrateur | École des réseaux |
| e.dubois@aster.demo | E. Dubois | Gestionnaire | École des réseaux |
| j.lambert@aster.demo | J. Lambert | Formateur | École des réseaux |

Les quatre premiers acceptent aussi l’identifiant court (`superadmin`, `admin`, `gestionnaire`, `formateur`). Laisser le mot de passe vide : le realm `aster` utilise délibérément un flux qui identifie un utilisateur existant sans secret ; le champ mot de passe du thème est en lecture seule et n’est pas transmis. L’inscription et la récupération du mot de passe renvoient vers l’administrateur.

Les tests de bout en bout utilisent aussi `nouveau.formateur@aster.demo` (créé puis désactivé par le test) et `sans.compte@aster.demo` (identité sans compte ASTER).

La consigne de présentation du 6 novembre impose de conserver ces modalités dans ce guide interne : aucune liste de comptes, indication de mot de passe vide, étiquette de démonstration ou aide technique de démarrage ne doit apparaître dans l’interface ou dans les productions remises aux cadres.

Le compte technique de la console Keycloak est `keycloak-admin` avec le mot de passe local `keycloak-admin-local`. Il est distinct du super administrateur ASTER. Les sessions ASTER expirent au plus tard à l’expiration du jeton d’identité, ou après une heure ; une déconnexion détruit la session ASTER puis termine la session Keycloak.

## Données

Le serveur applique les droits à chaque écriture ([backend/workspace/rules.js](backend/workspace/rules.js)), puis l’enregistre en une transaction ([backend/workspace/postgres.js](backend/workspace/postgres.js)) :

| Table | Contenu |
| --- | --- |
| `aster_ecole`, `aster_etage`, `aster_salle` | Écoles, étages par bâtiment, salles |
| `aster_materiel` | Matériels ; identifiant ASTER unique, salle facultative (stock) |
| `aster_remontee`, `aster_remontee_materiel` | Remontées, auteur, historique, clé de l’état des lieux S3 ; matériels concernés |
| `aster_compte`, `aster_preference` | Comptes ASTER (profil, école, actif, sujet OIDC) ; préférences par compte |
| `aster_donnee` | Postes, processus, détections, applications, installations, règles, interventions (JSONB) |
| `aster_espace` | Version du jeu de données et numéro de révision |

Au premier démarrage, ou quand la version du jeu de données change, les tables sont initialisées avec une école de quatre bâtiments (1 à 5 niveaux, jusqu’à 8 salles par étage), une seconde école, l’inventaire, les remontées passées et les comptes ci-dessus. Le stock de l’École du numérique contient de quoi équiper une nouvelle salle : 20 unités centrales, 40 écrans, 20 claviers, 20 souris et des matériels secondaires (vidéoprojecteurs, commutateurs, bornes Wi-Fi, câbles, audio, imprimantes, onduleurs ou stations d’accueil). Le même lot, sous forme d’import JSON, est dans [tests/fixtures/import-stock-salle.json](tests/fixtures/import-stock-salle.json) (141 matériels, sans salle : ils entrent en stock) pour essayer Matériels › Import JSON. L’activité des postes (processus, détections, installations) part de zéro et n’est alimentée que par les postes.

L’état des lieux PDF d’une remontée est produit à la transmission, avec les informations de cet instant, puis déposé dans S3 (`etats-des-lieux/<école>/<remontée>.pdf`). Le document A4 ([backend/workspace/pdf.js](backend/workspace/pdf.js), sans dépendance) comprend un bandeau ASTER (référence, statut, type de problème), l’école et le déclarant, la localisation, la description, le tableau des matériels concernés (type, identifiant ASTER, numéro de série, salle, état), le suivi et un pied de page numéroté ; il passe sur plusieurs pages si nécessaire. Le document ne transite pas par le serveur : `GET /api/workspace/reports/:id/pdf` contrôle la session et le périmètre du compte, puis répond par une redirection 303 vers une URL S3 présignée, valable 60 secondes et propre à cet objet ([backend/storage.js](backend/storage.js)) ; le navigateur télécharge le PDF directement dans S3. Une remontée sans document déposé voit le sien produit puis déposé avant la signature ; si S3 est indisponible, l’API répond 503. `S3_ENDPOINT` doit donc être joignable par les navigateurs comme par le serveur. En mode interface seule, sans stockage, le serveur produit le document à la demande. Le contrat d’intégration avec le S3 cible reste à établir : seules les opérations de dépôt, de lecture et de lecture signée sont utilisées.

Les écritures concurrentes sont fusionnées élément par élément à partir d’un journal des dernières révisions : une écriture préparée sur une révision antérieure n’échoue que si le même élément a été modifié entre-temps. Le navigateur reprend toutes les quatre secondes les modifications des autres utilisateurs et des postes (requête conditionnelle par ETag).

## Postes

Les postes communiquent par l’API `/api/agent` du serveur, authentifiée par un jeton porteur (`AGENT_TOKEN`) :

| Route | Rôle |
| --- | --- |
| `GET /api/agent/postes` | Postes connus d’ASTER |
| `POST /api/agent/rapports` | Processus utilisateur en cours et applications installées ; réponse : interventions à exécuter |
| `POST /api/agent/resultats` | Résultat de chaque intervention (`reussie` ou `echec`) |

À chaque rapport, ASTER met à jour l’état des postes, ouvre ou clôt les processus, classe les nouveaux processus selon les règles (globales, école, bâtiment, salle) et enregistre une détection pour un processus non référencé ou interdit. Un processus interdit déclenche automatiquement une demande d’arrêt. Un poste sans rapport depuis 30 secondes est considéré déconnecté. Les arrêts demandés par un formateur, les installations, désinstallations et réinstallations demandées par un administrateur suivent le même circuit : demande enregistrée, exécution par le poste, résultat par poste, puis statut « Terminée » ou « Échec ».

**Démonstrateur uniquement :** les postes Windows sont émulés par [backend/demonstrateur/agents.js](backend/demonstrateur/agents.js), qui utilise l’API réelle (programmes utilisateur, déconnexions, programmes interdits occasionnels, exécution des interventions avec un faible taux d’échec). Le protocole, l’authentification par poste et le déploiement d’un agent réel sur Windows restent à définir.

## Structure

Le frontend suit l’organisation habituelle d’un projet React : tout le code de l’interface est sous `src/`, rangé par rôle (données, crochets, composants génériques, widgets, un dossier par écran) ; les fichiers sont nommés en minuscules avec des tirets. Le code commun au navigateur et au serveur (référentiels, formats, données de départ, règle de renommage des bâtiments, préférences d’affichage) est dans `shared/`, importé par l’alias `#shared/…` (champ `imports` de `package.json`, compris par Node et par Vite). Le serveur sépare règles métier, moteur d’écriture, routes HTTP et stockage ; les facilités propres au démonstrateur sont isolées dans `backend/demonstrateur/`.

```text
application/
├── shared/                      # Commun au navigateur et au serveur, sans DOM
│   ├── catalog.js               # Référentiels : types de matériel, états, statuts, profils
│   ├── format.js                # Dates et nombres en français
│   ├── seed.js                  # Données de départ (SEED_VERSION)
│   ├── ambiance.js              # Préférences d'affichage valides
│   ├── buildings.js             # Renommage d'un bâtiment
│   └── operations-data.js       # Applications et règles de processus de départ
├── frontend/
│   ├── index.html               # Point d'entrée unique
│   ├── vite.config.js
│   ├── ui-development.js        # Mode interface seule (greffon Vite)
│   └── src/
│       ├── main.jsx             # Montage React et routeur
│       ├── app.jsx              # Session : connexion ou espace de travail
│       ├── connexion/           # Pages publiques : connexion, chargement, marques, styles
│       └── workspace/           # Espace de travail, chargé après la connexion
│           ├── workspace.jsx    # Routes des écrans
│           ├── core/            # Données et règles d'affichage : store, sélecteurs, droits, verre, thème
│           ├── hooks/           # useStore, useTitle
│           ├── ui/              # Composants génériques : fenêtres, formulaires, icônes, graphiques
│           ├── widgets/         # Widgets des tableaux de bord et éléments d'affichage partagés
│           ├── views/           # Un dossier par écran (shell, dashboard, salles, remontees…)
│           └── styles/          # Feuilles de style, importées dans un ordre fixe par workspace.jsx
├── backend/
│   ├── index.js                 # Serveur Express, OIDC, sessions
│   ├── start-production.js
│   ├── config.js
│   ├── profiles.js              # Profils ASTER et utilisateur présenté au navigateur
│   ├── storage.js               # Stockage S3
│   ├── workspace/
│   │   ├── rules.js             # Droits, visibilité, fusion des écritures concurrentes
│   │   ├── postes.js            # Rapports et résultats des postes
│   │   ├── engine.js            # File d'écriture, révisions ; dépôt du mode interface seule
│   │   ├── postgres.js          # Dépôt PostgreSQL
│   │   ├── routes.js            # API de l'espace et des postes
│   │   └── pdf.js               # État des lieux PDF
│   └── demonstrateur/
│       ├── identity-provisioning.js  # Identités dans l’annuaire via Keycloak
│       └── agents.js            # Postes émulés
├── infra/
│   ├── compose.yaml             # PostgreSQL ASTER, annuaire LDAP, Keycloak, stockage S3
│   ├── keycloak/                # Realm (fédération LDAP) et thème de connexion
│   ├── ldap/                    # Identités de départ de l’annuaire (LDIF)
│   └── seaweedfs/               # Clés d'accès S3 locales
├── tests/                       # Tests d’interface et de bout en bout
└── .env.example
```

Les classes CSS étant partagées entre écrans (tableaux `ops-`, contenus de widgets `w-`), les feuilles de style restent regroupées dans `styles/` et chargées dans un ordre fixe, qui détermine la cascade. Les tests du serveur (`*.test.js`) sont placés à côté des modules qu’ils vérifient.

Les volumes Docker du projet Compose `aster` séparent et conservent les données PostgreSQL d’ASTER, l’annuaire LDAP (`ldap-data`, `ldap-config`) et les objets S3. Le fichier LDIF n’est chargé que si l’annuaire est vide : pour le recharger, supprimer les deux volumes LDAP. `npm run infra:down` arrête les services sans supprimer les données. Keycloak réimporte son realm à chaque recréation de son conteneur ; les identités manquantes sont créées dans l’annuaire par le serveur au démarrage. Ne pas supprimer un volume sans vérifier les données qu’il contient.

## Vérifications

```sh
npm test               # Règles, API, identité ; intégration PostgreSQL et S3 si l'infrastructure est démarrée
npm run build
npm run test:ui        # Page de connexion
npm run test:workspace # Écrans de l'espace de travail en mode interface seule (port 5174)
```

Les tests d’intégration utilisent un schéma PostgreSQL temporaire, supprimé à la fin, et le compartiment S3 `aster-tests` ; ils sont ignorés si l’infrastructure est absente.

Avec l’infrastructure et `npm run dev` démarrés :

```sh
npm run test:e2e
```

Ces tests passent réellement par Keycloak pour chaque profil et vérifient : l’identité et les modules par profil, la session persistante et la déconnexion ; la création d’un compte puis la connexion de ce nouvel utilisateur, la coupure de session à sa désactivation ; le refus d’une identité sans compte ASTER ; l’enregistrement d’un matériel en base ; une remontée transmise avec son PDF dans S3, téléchargé par un lien signé sans transit par le serveur ; un arrêt de processus exécuté par un poste ; le refus des écritures d’une autre origine, d’un state incorrect et d’un retour sans demande préalable.

## Production

La cible est le véritable MindefConnect. Son contrat d’intégration, ses accès, les attributs d’identité transmis et les redirections doivent être obtenus. L’adaptateur OIDC configurable ne constitue pas une intégration MindefConnect validée. Aucun déploiement de production n’est effectué ici.

`npm run build` produit l’interface dans `frontend/dist/`. `npm start` démarre le serveur en mode production et sert cette interface ; il exige `APP_URL`, `DATABASE_URL`, `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, un `SESSION_SECRET` d’au moins 32 caractères, la configuration S3 (`S3_ENDPOINT` en HTTPS, joignable par les navigateurs, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`) et un `AGENT_TOKEN` d’au moins 32 caractères. Les valeurs de démonstration sont refusées et le provisionnement des identités est désactivé. Le serveur écoute sur la boucle locale et attend un proxy HTTPS de confiance devant lui.

Ne pas utiliser `infra/compose.yaml` en production : il contient le flux sans mot de passe, les comptes locaux, l’émulateur de postes et des secrets publics. Les paramètres d’hébergement et les exigences complémentaires restent à définir dans le cadrage.
