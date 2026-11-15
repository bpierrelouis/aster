# Backlog technique et feuille de route

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 5.6 | 15/11/2026 | Pilotage interne | Consigne les tests d'intrusion du 15 novembre et leurs corrections | [41 versions](../../archive/README.md#21-backlog-technique-et-feuille-de-route) |
<!-- version:fin -->

Document de pilotage interne, tenu à chaque itération. Il complète le [backlog et suivi du projet](20-BACKLOG-ET-SUIVI-PROJET.md), qui organise les tâches de l’équipe et leurs cérémonies Scrum : il recense le travail technique restant (corrections, dette, sécurité, documentation, écarts à soumettre), classé par échéance et par domaine, puis la feuille de route des évolutions du projet. Les décisions et questions ouvertes font foi dans le [cadrage](../01-CONTEXTE/02-CADRAGE.md) ; ce document n’en suit que la réalisation. Il n’est pas remis comme livrable : il cite des éléments propres au démonstrateur.

Repères : priorité **haute**, **moyenne** ou **basse** ; **[RG]** la correction crée ou modifie une règle de gestion et exige l’accord préalable de l’utilisateur ; **[PROT]** document protégé, modifié seulement sur demande ; **[DAT]** le dossier d’architecture fait foi et n’est modifié que par le collègue qui le tient.

## 1. Échéances

### Lundi 16 novembre

- [ ] Diagrammes [06](../02-ANALYSE/01-MODELISATION-METIER/06-DIAGRAMME-CONTEXTE.md) et [07](../02-ANALYSE/01-MODELISATION-METIER/07-DIAGRAMMES-ACTIVITE.md) **[PROT]** : des collègues les ont modifiés sans publier leur travail ; faire le point avec eux, puis vérifier le super administrateur, l’authentification par MindefConnect, le téléphone de recensement (RIGEL), le PDF produit à la demande (pas à la création), le traitement des remontées par le seul gestionnaire et l’absence de filtre par salle du tableau de bord. M42 reste une option candidate tant que la solution d’administration n’est pas retenue.

### Avant le prochain déploiement sur les VM

- [x] Réinitialisation des données de démonstration : le service `api` des VM recharge le jeu de départ à chaque changement de `SEED_VERSION` (21 au 14 novembre, comptes fictifs compris).
- [ ] Vérifier après déploiement : `https://172.16.131.188/api/infos` (version servie) ; connexion des comptes (jetons « Accès de présentation » compris), leurs identités étant créées dans l’annuaire par le provisionnement au démarrage ; création d’un compte ; rapports des postes simulés ; recensement RIGEL. Les anciennes identités `@orion.demo` restent dans l’annuaire LDAP des VM (le LDIF n’est chargé qu’à la création du volume) : sans compte ORION, elles sont refusées ; les supprimer dans la console Keycloak si besoin. Le 15 novembre (version `a94ec62`) : version servie, connexion d’un compte et réponse du relais RIGEL vérifiées ; restent les autres points.

### Avant le rendu de l’application (mardi 17 novembre)

- [x] **Haute** — Comptes de démonstration remplacés par des personnes fictives aux adresses `prénom.nom` de messageries courantes (Gmail, Outlook, Yahoo, Hotmail, Orange, Free, La Poste), sans adresse `@orion.demo` ni `admin@`, `gestionnaire@` (14 novembre) : même répartition qu’avant (super administrateur ; administrateur, gestionnaire et quatre formateurs à l’École du numérique ; administrateur, gestionnaire et formateur à l’École des réseaux). Jeu de départ et fichier LDIF mis à jour ; sur la page de connexion, un tableau « Comptes » en marge, au style du bloc de connexion (adresse, profil, école, flèche de connexion directe), remplaçait les jetons « Accès de présentation », rétablis ensuite (`baabbf7`).
- [x] **Haute** — Mots de passe des comptes (15 novembre) : un mot de passe par compte, dérivé du secret `PROVISIONING_PASSWORD_SECRET` (secret Swarm créé au premier déploiement, jamais versionné ; tableau affiché par `outils/identites-keycloak/mots-de-passe.ts`), posé par la création des identités ; l’annuaire n’en garde qu’une empreinte salée ; Keycloak demande l’adresse puis le mot de passe, repris de la page de connexion. Les jetons « Accès de présentation » connectent toujours sans mot de passe : le realm saute le mot de passe pour leurs trois adresses seulement, tant que `ORION_COMPTES_PRESENTATION=true`.
- [ ] **Haute** — Créer un scénario complet de l’application : parcours de bout en bout par profil (connexion, parc, salles, recensement RIGEL, remontée de sa création à sa fin, supervision, intervention sur les postes, notifications, administration), avec données de départ adaptées et résultat attendu à chaque étape ; il sert de fil de la présentation et de test de recette.

### Avant la présentation (supports prêts le mercredi 18 novembre ; présentation le jeudi 19 novembre, horaire non fixé)

- [ ] Préparer le support et répartir les passages ; répéter la présentation le 18 novembre.

### Après la présentation

- [ ] Retirer les jetons « Accès de présentation » de la page de connexion du Keycloak local : variable `ORION_COMPTES_PRESENTATION` (Compose, pile des VM ; elle choisit aussi le flux du realm, `orion-connexion-true` ou `-false`), flux `orion-connexion-true` et condition `orion-comptes-presentation` du realm et bloc du thème `orion-mindef` (gabarit, styles, script).

## 2. Pilotage du projet

- [x] **Haute** — Traiter le backlog GitHub (14 novembre : projet « ORION development », 156 tickets, dont 142 rattachés aux deux sprints) : trier, mettre à jour et clore les éléments au regard de l’état actuel, puis reporter le résultat dans le [backlog](20-BACKLOG-ET-SUIVI-PROJET.md). Seize tickets réalisés ont été clôturés et passés en « Done » le 14 novembre. Le dépôt GitHub garde l’ancien nom (`bpierrelouis/aster`). Le brouillon de suivi du 13 novembre est retiré le 14 novembre : le [backlog](20-BACKLOG-ET-SUIVI-PROJET.md) le remplace et reprend ses références de commits (§ 9).
- [ ] Cadrage § 22 : dater le prochain rendez-vous ; consigner le sort des propositions préparées pour le 12 novembre (application de scan, devenue RIGEL, et livraisons) quand un retour existera.

## 3. Application

### Corrections signalées par l’utilisateur

- [x] **Haute** — Connexion : « Vous êtes déjà authentifié avec un autre utilisateur » (local et VM) après un retour arrière vers la page de connexion ou avec deux onglets. La page d’erreur du thème ferme la session Keycloak et la connexion reprend avec le compte choisi ; ORION garde une tentative de connexion par onglet (14 novembre).

### Corrections relevées par l’audit du 13 novembre

- [x] **Moyenne** — Remontée : le serveur ne garde à la création que les champs saisis (école, matériels, type de problème, description) ; une salle ou toute autre valeur envoyée est ignorée (`rules.ts`, 14 novembre).
- [x] **Moyenne** — Recherche globale du formateur limitée aux matériels de salle (`009cfd5`).
- [x] **Moyenne** — Test « une synchronisation lue pendant un enregistrement… » instable : une synchronisation périodique, normale avant le choix de Minarm (le simulateur des postes fait avancer la révision), était comptée ; le test ne vérifie plus que les états qui suivent le choix. L’apparence est rétablie avant chaque test (`beforeEach`, `2ac9f50`).
- [x] **Moyenne** — Relais RIGEL : au plus 5 000 événements non acquittés par opération (`MAX_EN_ATTENTE`), refus 429 au-delà ; le téléphone garde ses constats et les renvoie.
- [x] **Basse** — `GET /api/workspace/postes/:id/jeton` décrit dans l’OpenAPI.
- [x] **Basse** — Postes : `nomReseau` enregistré en capitales par le serveur ; `materielId` contrôlé (unité centrale de l’école de la salle du poste).
- [x] **Basse** — Catalogue des applications : suppression refusée pour une application installée sur un poste ou citée par une intervention.
- [x] **Basse** — Comparaison à temps constant factorisée (`backend/securite.ts`) ; contrôle « seuls ces champs sont modifiables » factorisé (`seulsModifies`, `rules.ts`).
- [x] **Basse** — Guide de l’application : six images, arborescence RIGEL, scripts `dev:backend` et `start:relais`, secrets RIGEL créés par `deployer.sh`, runner installé par `runner.sh`, flux sans mot de passe aussi dans l’image Keycloak des VM, configurations remises avec le DAT (`Dockerfile`, `images/`, `keycloak/`, `ldap/`, `rigel/`).
- [x] **Basse** — Configuration Keycloak : mapper `orion-roles` retiré du realm (les rôles Keycloak ne sont pas lus).

### Évolutions

- [ ] **Haute** — Noms de la base et du code alignés sur la documentation, après la réunion d’équipe ([#162](https://github.com/bpierrelouis/aster/issues/162)) : tables ORION sans préfixe `orion_` (migration `0002`), relais RIGEL `operation` et `evenement`, « campagne » remplacée par « opération » dans le code ; modèle physique (29), séquences détaillées (28) et `application/README.md` à jour.
- [ ] **Moyenne** — Observatoire anonymisé des parcours utilisateurs : mesurer, sans identifier les personnes, le taux de réussite, la durée, les abandons et les erreurs des tâches principales (créer et traiter une remontée, déplacer ou importer du matériel, demander une intervention, recenser une salle), puis adapter la navigation à partir de ces données réelles. À cadrer avant réalisation : liste des tâches et de leurs étapes, anonymisation et durée de conservation, information des utilisateurs, stockage dans ORION, restitution (tableau de bord du super administrateur), et place dans l’architecture cible à soumettre au collègue du DAT.
- [ ] **Moyenne** — Retirer au lieu de supprimer (bonne pratique de gestion de parc, proposée le 13 novembre) :
  - matériel, poste, application du catalogue et règle : un retrait (état « retiré » avec date, auteur et motif : réformé, perdu, transféré, erreur de saisie) remplace la suppression ; l’élément reste en base, sort des listes courantes, garde son historique et peut être réactivé ;
  - suppression réelle réservée à une création erronée jamais citée ; le serveur la refuse dès qu’une référence existe (remontée, constat, poste, intervention, installation) ;
  - compte ORION : désactivation inchangée, puis anonymisation des données personnelles au-delà d’une durée de conservation à fixer avec le client (cadrage § 23) ;
  - données d’activité (processus, détections, journaux) : purge automatique selon une durée de conservation, inchangée ;
  - journal métier des opérations sensibles (retrait, réactivation, transfert d’école, changement de droits), consultable par le super administrateur ;
  - rédaction proposée pour RG-91 **[RG]**, à soumettre à l’utilisateur : « Retrait d’un matériel. Un matériel n’est pas supprimé mais retiré : son retrait enregistre la date, l’auteur et le motif (réformé, perdu, transféré ou erreur de saisie). Seul un matériel du stock peut être retiré. Un matériel retiré n’apparaît plus dans l’inventaire courant, reste consultable avec son historique et peut être réactivé. Seul un matériel créé par erreur et cité nulle part peut être supprimé définitivement. » ;
  - conséquences : MCD (`MATÉRIEL`), matrice, DCU 08, fiches 13, 15 et 16, code (`rules.ts`, inventaire) et données de départ.
- [x] **Haute** — RIGEL aligné sur RG-92 à RG-96 (décisions de l’utilisateur du 14 novembre) : installation d’une salle (lancée depuis Salles › Déplacements, close d’elle-même au nom du gestionnaire qui la termine) distincte du recensement (« Nouveau recensement », présence seule) ; RIGEL, confirmation des installations et traitement des constats réservés au gestionnaire, suivi en lecture seule par l’administrateur et le super administrateur ; lieu ouvert = présence physique ; anciens écarts guidés dans ORION ; plus de « campagne » dans l’interface ; fiches 13, 15, 16, matrice, glossaire, DCU 08 et MCD à jour.
- [ ] Jeton d’un poste : seule l’API `GET /api/workspace/postes/:id/jeton` permet de l’obtenir ; prévoir l’action dans Administration › Postes. Renouveler `AGENT_TOKEN` révoque tous les jetons à la fois : prévoir une révocation poste par poste si le besoin apparaît.
- [x] Adresse MAC du matériel : saisie, import JSON et étiquettes du parc (`0505b22`, #128).
- [ ] Import JSON : le transfert d’un matériel hors service vers une salle d’une autre école est bloqué (conséquence de RG-87) ; à confirmer par l’utilisateur.
- [ ] Tests : ajouter un test du détail de `/api/health` et `/api/infos` réservé au super administrateur.
- [x] Mode développement : un gros corps refusé tôt ne coupe plus la connexion du proxy de Vite (le serveur lit le corps avant de refuser, `47544cf`, #131).

### Organisation du code : démonstrateur et espace de travail

Réalisée le 14 novembre, après l’intégration de RIGEL (décision de l’utilisateur du 13 novembre). `workspace` (`backend/workspace/`, `frontend/src/workspace/`) désigne l’espace de travail, c’est-à-dire toute l’application après connexion, et non la production. `backend/demonstrateur/` regroupe l’outillage propre à la démonstration : simulateur des postes, création des identités dans le Keycloak local. Production et recette se distinguent par la configuration (`NODE_ENV`, `IDENTITY_PROVISIONING`, `SEED_RESET`). Trois couplages font entrer la démonstration dans le code de production :

- `backend/workspace/rules.ts` (`initialState`) importe le jeu de départ `shared/seed.ts` : les données de démonstration sont embarquées dans le serveur ;
- `backend/index.ts` importe toujours `demonstrateur/identity-provisioning.ts`, même lorsqu’il est désactivé ;
- `frontend/ui-development.ts` (mode interface seule) importe le simulateur depuis le back.

Organisation proposée : un seul artefact promu sans changement de la recette à la production, l’outillage de démonstration hors du code exécuté en production.

```text
application/
  backend/
    api/            routes HTTP de l’espace et des postes, session
    domaine/        règles métier par domaine : parc, remontees, postes, comptes, regles, recensement
    persistance/    PostgreSQL, moteur d’écriture, fusion des écritures concurrentes
    documents/      état des lieux PDF
    recon/          relais et connecteur
  frontend/src/
    connexion/
    espace/         écrans, widgets, ui (inchangés)
    recon/          application mobile de recensement
  shared/           types, catalogue, formats (sans jeu de démonstration)
  outils/           jamais importé par le serveur de production
    simulateur-postes/       client de l’API /api/agent (cible Docker « postes »)
    donnees-demonstration/   jeu de départ, chargé par une commande dédiée
    identites-keycloak/      création des identités du Keycloak local
    interface-seule/         serveur du mode sans Docker
  infra/            compose, VM, Keycloak, LDAP : seule différence entre environnements
```

Plan, une étape par commit, chacune vérifiée par `npm test`, `npm run build`, `npm run test:ui`, `npm run test:workspace` et, avec l’infrastructure, `npm run test:e2e` :

- [x] 1. Déplacer `backend/demonstrateur/` vers `outils/` sans changer le code ; mettre à jour imports, scripts npm, cible `postes` du `Dockerfile` et guide de l’application.
- [x] 2. Sortir le jeu de départ : `initialState` ne crée que les référentiels ; `outils/donnees-demonstration` charge les données par une commande (`npm run donnees:demo`) appelée par le mode interface seule et par le déploiement du démonstrateur. `SEED_VERSION` et `SEED_RESET` deviennent des options de cette commande. Réalisé : `SEED_VERSION` dans `outils/donnees-demonstration/jeu.ts`, option `--reinitialiser` ; sur les VM, le service `api` lance la commande avant le serveur (`pile.yaml`).
- [x] 3. Charger la création des identités seulement quand `IDENTITY_PROVISIONING=true` (import dynamique), pour qu’elle soit absente du serveur de production.
- [x] 4. Remplacer la création du schéma au démarrage par des migrations versionnées (`backend/persistance/migrations/`), pour faire évoluer une base de production sans réinitialisation. La migration `0001` reprend le schéma existant et s’applique aussi aux bases déjà créées.
- [x] 5. Découper `rules.ts` par domaine dans `backend/domaine/` et renommer `workspace` en `espace` (back et front), en dernier : changement le plus large, purement structurel. Écarts au plan : `backend/rigel/` et `frontend/src/rigel/` gardent leur nom (au lieu de `recon/`) ; l’adresse `/api/workspace`, les types `Workspace…` et le script `test:workspace` sont conservés (contrat d’API et noms de code inchangés).
- [x] 6. Mettre à jour `AGENTS.md` (chemins cités) et le guide de l’application ; signaler au collègue du DAT les chemins de l’inventaire des configurations remises (chemins inchangés ; contenus de `Dockerfile` et `pile.yaml` modifiés : § 6).
- [x] **Haute** — Espace de production neuf : sans données de démonstration, il ne contient ni école ni compte, donc personne ne peut se connecter. Le serveur crée au démarrage le premier super administrateur d’un espace sans aucun compte, à l’adresse donnée par `INITIAL_SUPERADMIN_EMAIL` (15 novembre) ; ORION ne garde aucun mot de passe : l’identité est celle de MindefConnect, rapprochée par l’adresse à la première connexion ; DAT complété (§ 6.2). (#159)

## 4. Sécurité

Audit du 15 novembre : revue du code (droits de chaque route et de chaque règle serveur, valeurs d’autorité, RIGEL, import, PDF, persistance), `npm audit` (aucune vulnérabilité), revue de la configuration des VM, de Keycloak et de la CI. Aucun contournement des droits ni du cloisonnement des écoles ; sessions OIDC (PKCE, nonce, régénération), contrôle d’origine, cryptographie RIGEL, requêtes SQL paramétrées, PDF et journaux sans défaut.

- [x] **Haute** — Tests d’intrusion sur l’application déployée (15 novembre) : droits par profil et par école, sessions, contrôle d’origine, jetons des postes et de RIGEL, chemins, redirections, en-têtes, TLS, ports, limites de débit. Constats corrigés ou restés ouverts dans les tableaux ci-dessous. Les écritures qui devaient réussir n’ont pas été rejouées en direct (données réelles) : valeurs d’autorité vérifiées dans le code.
- [x] **Haute** — Déployer les corrections sur les VM (15 novembre) : exports NFS en `root_squash`, données PostgreSQL à l’uid 70, API connectée en `orion_app`, certificats clients du collecteur, OpenLDAP sur ses exports, en-têtes, filtrage de HAProxy et TLS vérifiés ; secret `orion_database_url` supprimé. Le premier déploiement a été bloqué par le pilote de logs, Logstash étant arrêté puis redémarré : `deploiement.sh` relance désormais Logstash avant PostgreSQL et reprend une mise à jour suspendue.
- [x] Job complet du runner avec sa clé restreinte : CI entièrement réussie le 15 novembre (VM et Hidora). Le correctif de `deploiement.sh` ne s’applique sur orion-1 qu’au prochain `installer.sh`.
- [x] Seuils de débit mesurés (15 novembre) : 429 dès la 61e connexion de la minute sur 443 et sur la console ; `limite_ip` et `limite_agent` non mesurées (plusieurs centaines de requêtes nécessaires).

| Sujet | Constat | Correction | Portée |
| --- | --- | --- | --- |
| CI | Dépôt public et runner auto-hébergé sur orion-3 (manager Swarm) : une contribution externe pouvait exécuter un workflow sur le runner | Approbation obligatoire de tous les contributeurs externes (GitHub) ; clé SSH du runner limitée à la commande `orion-deploiement` d’orion-1 ; archive du runner vérifiée. Reste : le compte du runner est dans le groupe `docker` d’un manager | Démonstrateur |
| Keycloak | Console de compte : adresse et mot de passe modifiables, prise d’un compte ORION non encore rapproché par son adresse ; pas de protection contre la force brute ; `sslRequired: none` | Console de compte fermée, adresse modifiable par l’administrateur seul, force brute sur les realms `orion` et `master`, `sslRequired: external` | Démonstrateur et cible |
| Jetons « Accès de présentation » | Connexion sans mot de passe, dont un administrateur d’école | Conservés pour la présentation ; `ORION_COMPTES_PRESENTATION=false` hors des séances | Démonstrateur |
| Limitation de débit | Aucune | `stick-table` HAProxy par adresse IP, par connexion et par jeton des postes, réponse 429 | Démonstrateur et cible |
| HAProxy | Liste de refus de `/admin` contournable par `..` ; TLS minimal implicite ; `X-Forwarded-For` falsifiable ; pas de HSTS | Liste d’autorisation (`/realms/orion/`, `/resources/`), chemins à `..` encodés refusés, `ssl-min-ver TLSv1.2`, en-têtes du client retirés, HSTS | Démonstrateur et cible |
| Apache | CSP partielle, liste des dossiers, version annoncée, maître en root | CSP complète, `-Indexes`, `ServerTokens Prod`, `www-data`, lecture seule | Démonstrateur et cible |
| PostgreSQL | API en superutilisateur | Rôle `orion_app` propriétaire de la base, sans superutilisateur | Démonstrateur |
| NFS | `no_root_squash`, chaque partage ouvert à quatre VM | Un export par dossier, VM du service et orion-9 ; `root_squash` sauf OpenLDAP | Démonstrateur |
| Logstash | `6514` sans authentification des émetteurs, nom de service libre | TLS mutuel, certificat client par VM ; service limité à `[a-z0-9_-]` | Démonstrateur |
| Autorité de certification | Clé en clair, sans restriction de noms | Autorité neuve : `nameConstraints` et clé chiffrée ; l’autorité existante est conservée | Démonstrateur |
| Conteneurs | Capacités Linux par défaut | `cap_drop: ALL` (sauf OpenLDAP), `read_only` pour HAProxy et Apache | Démonstrateur et cible |
| PDF | Découpe des longs mots en temps cubique : un formateur pouvait figer une instance d’Express environ 20 s par demande | Découpe en un passage | Démonstrateur et cible |
| RIGEL | Un téléphone appairé pouvait bloquer l’intégration de toutes les opérations (blocs trop gros) ; existence d’une opération révélée par le relais | Blocs d’événement en base64url limités à 16 Ko, opérations traitées séparément par le connecteur, même refus 401 ; une adresse ou un jeton du relais invalide désactive RIGEL sans bloquer le déploiement d’ORION | Démonstrateur |
| Configuration de production | Mot de passe PostgreSQL de développement non refusé | Refusé au démarrage | Cible |
| Images | Images de base épinglées par étiquette, réécrivable sur Docker Hub | Épinglage par empreinte (`@sha256:`) dans le `Dockerfile`, la pile et Compose ; images ORION étiquetées par le SHA du commit et figées par Swarm au déploiement | Démonstrateur et cible |
| Secrets | `secrets.sh` exportait chaque secret en variable d’environnement | API, simulateur des postes et connecteur lisent `/run/secrets` dans leur configuration ; seul Keycloak garde `secrets.sh` | Démonstrateur et cible |
| Limitation des connexions | Contournable par `/realms/orion/login-actions/` sur 8444 et par l’octroi par mot de passe du client public `admin-cli` (devinette des mots de passe, verrouillage des comptes) | Port 8444 limité au realm `master`, demandes de jeton de la console comptées, `admin-cli` du realm `orion` désactivé | Démonstrateur et cible |
| TLS et méthodes | Suites TLS 1.2 sans confidentialité persistante ou en CBC-SHA1 ; `TRACE` actif sur Apache | Suites ECDHE en AES-GCM ou ChaCha20 ; `TRACE` refusé par HAProxy et Apache | Démonstrateur et cible |

Restent ouverts :

| Sujet | Constat | Proposition | Portée |
| --- | --- | --- | --- |
| OpenLDAP | Image `osixia/openldap:1.5.0` non maintenue, sans TLS ; Keycloak lié en `cn=admin` ; export NFS en `no_root_squash` | Image maintenue, LDAP sur TLS, compte de liaison limité à `ou=people` | Démonstrateur |
| Administrateur de Keycloak | `keycloak-admin` d’amorçage permanent, console sur `8444` | Administrateur nominatif avec OTP, puis suppression de `keycloak-admin` | Démonstrateur |
| Keycloak derrière HAProxy | `KC_PROXY_TRUSTED_ADDRESSES` non posé : plage de l’overlay non fixée | Fixer la plage de l’overlay `orion`, puis la déclarer | Démonstrateur |
| QR d’appairage RIGEL | Accès porteur valable pendant toute l’opération (14 jours au plus), révocable seulement en la clôturant | Plafond des ajouts de matériels par opération ; régénération du QR | Démonstrateur et cible |
| Identité des postes | Jeton propre à chaque poste | Certificat client si le mécanisme d’administration des postes le permet | Cible |
| Relais RIGEL | Le relais sert le code de l’application mobile : un relais compromis pourrait lire la clé du fragment `#k=` | Modèle de menace ; intégrité du code servi | Démonstrateur |
| Import | L’analyse de l’import révèle les matériels des autres écoles par leur numéro de série, et l’import les transfère sans accord de l’école d’origine (orientation du 11 novembre) | Transfert soumis à l’école d’origine ou au super administrateur ; analyse réduite à « connu dans une autre école » | Démonstrateur et cible |
| Énumération des comptes | La connexion en deux étapes distingue une adresse inconnue d’une adresse existante | Formulaire unique adresse et mot de passe, ou page du mot de passe pour toute adresse | Démonstrateur et cible |
| Divulgation | Message distinct pour un identifiant ou une adresse existant dans une autre école ; `/api/infos` publie le SHA du commit sans connexion | Réponse générique hors périmètre ; version réservée au super administrateur, sans casser la vérification du déploiement | Démonstrateur et cible |

Décidé de ne pas faire (utilisateur, 13 novembre) : filtrage réseau de la console Keycloak (8444) et de Logstash (6514), pare-feu des VM. Dépôt laissé public (utilisateur, 15 novembre) pour ne pas limiter les minutes de la CI.

## 5. Documentation à remettre

### Priorité haute

- [ ] RIGEL dans le cadrage (§ 19 et § 23 : la ligne `02:400` « application de scan non intégrée » est fausse) ; les livrables (glossaire, RG-92 à RG-96, matrice, fiches 13, 15 et 16, DCU 08, MCD) ont été mis à jour le 14 novembre et restent à relire (#158).
- [x] Captures des fiches 13, 15 et 16 : les anciennes maquettes IHM sont supprimées ; les fiches reprennent les captures de l’application (`design/maquettes/captures/`, 14 novembre).
- [ ] Cadrage § 23 : il dit que la documentation suit le client (`02:391`, `:405`, `:406`), contrairement à la règle en vigueur (la documentation suit l’état actuel, l’écart est inscrit au § 23). En découlent RG-36 (filtre par salle du tableau de bord du parc) et RG-37 (fenêtre contextuelle des notifications) **[RG]**, la matrice (`12:48`) et la fiche 13 (`:141`), qui décrivent ce que l’application n’a pas.

### Contradictions à corriger

- [ ] RIGEL dans la cible (orientation du 15 novembre : second Apache derrière le même HAProxy et le même back, nom public, ni relais ni connecteur ; DAT et schémas cible à jour) : le glossaire, les diagrammes 06 et 07 **[PROT]**, 26, 27, 28 et le modèle physique 29 décrivent encore le relais et le connecteur ; décider s’ils présentent la cible ou l’application actuelle, puis les aligner.
- [ ] Notification de processus interdit attribuée au formateur : matrice (`12:73`), glossaire (`00:84`) et cadrage (`02:208`) ; le code, la fiche 14, le DCU 10 et RG-55 ne lui en envoient pas.
- [ ] RG-81 et RG-22 : « postes d’une seule école » alors que le serveur impose une seule salle **[RG]**.
- [ ] Matrice (`12:46`, import JSON) : « seuls la lisibilité et les données obligatoires sont contrôlés » contredit RG-29 et l’application ; renvoyer à RG-29.
- [ ] Cadrage `02:134` et `02:191` : « sans entité `BATIMENT` autonome » contredit l’arbitrage du 9 novembre, le MCD et RG-02.
- [ ] Cadrage `02:194` : « seul l’administrateur gère les listes » ; RG-50 inclut le super administrateur.
- [ ] RG-02 et MCD imposent l’étage d’une salle ; RG-61 et le serveur ne l’exigent pas (l’interface si) **[RG]**.
- [ ] DCU 08 : l’`include` « consulter → rechercher » donne au formateur une recherche que la matrice lui refuse.
- [ ] Brouillon d’activité V2 (section 3) : PDF généré à la création, type de problème non exigé ; il déclare encore ouverts des points tranchés (RG-29, RG-74, RG-76, RG-79, RG-82), repris dans le README (`README.md:75-79`).

### Décisions du 13 novembre non reportées

- [ ] Renommage `Id_compte` → `Id_compte_Windows` (MCD) : glossaire (`00:47`), RG-43 (renommage, sans nouvel accord), cadrage (`02:168` ; `02:76` cite encore `UTILISATEUR` et `REGLE_PROCESSUS`).
- [ ] Cadrage `02:168` : l’adresse MAC est encore attribuée au poste ; elle est passée au matériel.
- [ ] Adresse IP du poste : absente de RG-44 **[RG]** et du DCU 10.
- [ ] Dates de dernière connexion et de désactivation du compte : absentes du cadrage § 18 (fiche 15 à jour le 14 novembre).
- [x] Termes « whitelist » et « blacklist » retenus partout (glossaire, interface, fiches, diagrammes) : décision de l’utilisateur du 15 novembre.
- [ ] Fiche 15 (`:94`) : « à replaquer » au lieu de « à réinitialiser ».

### Informations non répercutées

- [x] Installation physique des salles et notification « matériels à déplacer » du gestionnaire : décrites dans la fiche 13, RG-92, le glossaire et le DCU 08 (« Installer une salle », « Recenser le parc »).
- [ ] Journal applicatif (`backend/journal.ts`, événement `enregistrement` des écritures des utilisateurs) : absent du cadrage (§§ 18 et 21) et de la fiche 15 (« Journalisation éventuelle », UC-ADMIN-06).
- [ ] RG-56 : 30 jours de conservation des détections ; le code ne garde en plus que les 2 000 dernières **[RG]**.
- [ ] Cadrage § 19 : aucune décision RIGEL ni Hidora ; « déploiement proposé » (`02:340-341`) alors que le DAT le présente comme en place ; « émulateur » au lieu de « simulateur ».
- [ ] Glossaire : manquent Intervention, Compte ORION, Étape de remontée, Type de problème, C1NP et CCT ; `00:15` « aucune API d’intégration confirmée » alors que l’API des postes existe ; l’entrée LDAP ne sert que le démonstrateur.

### Modèle de données

- [x] [MCD](../02-ANALYSE/02-CAPTURE-DES-BESOINS/05-MCD-MERISE.svg) (15 novembre) : `DÉPLACEMENT` (origine, destination, auteurs et dates de demande et de confirmation), `OPÉRATION` (anciennement `RECENSEMENT`), de type recensement ou installation, listes de valeurs fixes en attributs (profil, statut, type de problème, type de matériel), `SYSTÈME_EXPLOITATION` et `PAQUET` pour le catalogue de la V2, contraintes d’exclusion sur la portée d’une règle et sur le propriétaire d’un paquet ; `REMONTÉE` déjà reliée à `ÉCOLE` (`RELEVER`) et entités RIGEL présentes.
- [ ] Justifier dans RG-79 ou RG-21 le lien direct remontée → école (`RELEVER`), conservé si un matériel change d’école **[RG]**.

### DCU à compléter

- [x] [DCU 08 — Gestion du parc](../02-ANALYSE/02-CAPTURE-DES-BESOINS/08-DCU-GESTION-PARC.md) : import JSON avec rapprochement des numéros de série (lignes ignorées, transfert d’un matériel d’une autre école) ; changement d’école d’un matériel (installation et recensement ajoutés le 14 novembre).
- [x] [DCU 09 — Administration des postes](../02-ANALYSE/02-CAPTURE-DES-BESOINS/09-DCU-ADMINISTRATION-POSTES.md) : « Consulter la vue des postes » et réinitialisation (RG-77) ; le catalogue des applications, les postes Linux et l’agent M42 relèvent de la V2 (décision du 15 novembre) ; suivre les interventions lancées et en être notifié à leur fin (RG-39).
- [x] [DCU 10 — Supervision des postes](../02-ANALYSE/02-CAPTURE-DES-BESOINS/10-DCU-SUPERVISION-POSTES.md) : notification du lancement d’une application interdite à l’administrateur ; adresse IP du poste dans la liste des processus.
- [x] Nouveau DCU « Administrer ORION » (ou extension du DCU 09) : comptes ORION (création, modification, désactivation, réactivation ; RG-70) et écoles (création, renommage ; RG-76), réservés aux administrateurs et au super administrateur.
- [ ] Préférences personnelles (ambiance d’affichage, tableaux de bord ajoutés par l’utilisateur) : décider si elles relèvent d’un DCU ou restent un détail d’interface.

### Cadrage : questions déjà résolues encore ouvertes

- [ ] Reporter en « Application : … », sans fermer la question côté client : identifiants (`02:76`, MCD), détection des applications par les postes (`02:128`), référentiel modifié par les administrateurs (`02:137`, RG-77), sous-ensemble de postes d’une salle, suivi par poste et échec partiel (`02:156-158`, RG-22 et RG-81), conservation de 30 jours (`02:178`, `02:201`, RG-56), remontée authentifiée (`02:227`, RG-62 et RG-85), tableaux de bord personnalisables (`02:255`, RG-84), refus de compléter un signalement par le formateur (§ 13), nom du projet ORION (`02:385`), rendez-vous du 12 novembre passé (`02:386`).

### Brouillons

- [x] Versions Word des fiches et du backlog retirées le 15 novembre : le Markdown fait foi (#144).

## 6. Dossier d’architecture : écarts à traiter [DAT]

Le DAT, tenu par l’utilisateur, fait foi ; ces écarts entre lui, la configuration réelle et ses schémas sont à lui soumettre. Le 14 novembre, l’utilisateur a fait corriger directement le DAT et les schémas pour les points cochés ci-dessous.

### DAT et configuration réelle

- [x] **Moyenne** — Secrets : « tous créés par le script de préparation », alors que `RIGEL_SECRET` et `RELAIS_TOKEN` sont créés par `deployer.sh` (le second peut venir du secret de la CI).
- [x] **Moyenne** — Données : « recréées au premier démarrage », alors que le service `api` des VM lance `outils/donnees-demonstration/charger.ts --reinitialiser` avant le serveur : les données sont remplacées à chaque déploiement qui change `SEED_VERSION` (`SEED_RESET` n’existe plus).
- [x] **Moyenne** — Migrations (`DAT:437`, « la procédure de migration reste à définir ») : le schéma évolue désormais par migrations versionnées appliquées au démarrage sous verrou consultatif (table `orion_migration`), sans réinitialisation ; le serveur n’embarque plus de données de démonstration. Configurations remises modifiées : `Dockerfile` (dossier `outils/` dans les images Node.js, simulateur lancé depuis `outils/simulateur-postes/agents.ts`) et `vm/pile.yaml` (commande du service `api`).
- Décidé de ne pas faire (utilisateur, 14 novembre) — SSH : le compte partagé `user`, `StrictHostKeyChecking=accept-new` et `sudo` par mot de passe sont la configuration des VM fournies, que l’équipe n’a pas le droit de modifier.
- [x] **Moyenne** — Filtrage : manquent `8080/TCP` vers le proxy depuis toutes les VM (images, paquets) et `443` d’orion-4 et orion-5 vers orion-1 (Express joint Keycloak par HAProxy).
- [x] **Moyenne** — Données de démonstration dans les livrables (15 novembre) : le compte `keycloak-admin` n’apparaît plus dans le DAT ; `ldap/orion-utilisateurs.ldif` ne crée plus que la branche `ou=people`, les identités étant créées par le provisionnement ; le § 4.3 précise que l’annuaire vérifie le mot de passe, sauf pour les trois comptes de présentation (`ORION_COMPTES_PRESENTATION`), retirés après la présentation.
- [x] **Basse** — Provisionnement des identités « hors production uniquement » (`17:94`) alors que les VM tournent en `NODE_ENV=production` avec `IDENTITY_PROVISIONING=true` (le DAT le dit lui-même en `17:257`).
- [x] **Basse** — Absents : client Keycloak `orion-provisionnement`, secrets `PROVISIONING_CLIENT_SECRET` et `ca`, images `connecteur` et `relais` du `Dockerfile`, dépendance `swagger-ui-express` 5.0.1.
- [x] **Basse** — Versions : « HAProxy 3.2 » et « Apache 2.4 » remplacés par les versions épinglées 3.2.16 et 2.4.69 (§ 5.3). L’image Keycloak, image officielle avec une légère surcouche ORION, est voulue (utilisateur, 14 novembre).
- [x] **Basse** — Logstash n’envoie pas ses propres logs au collecteur, ce qui est voulu : le DAT le précise (« chaque conteneur, sauf Logstash… »).
- [x] **Basse** — Chemins `/srv/orion/…`, `/var/lib/…`, `/run/secrets/…` cités hors de l’inventaire des configurations : admis, car ils décrivent le déploiement sur les VM et dans les conteneurs (utilisateur, 14 novembre ; règle précisée dans `AGENTS.md`).

- [ ] **Moyenne** — Durcissement du 15 novembre (§ 4), absent du DAT : HAProxy (liste d’autorisation vers Keycloak, chemins à `..` refusés, limitation de débit, HSTS, TLS 1.2 minimum, en-têtes de relais retirés) ; stockage (un export NFS par dossier de service, `root_squash` sauf OpenLDAP, PostgreSQL en uid 70) ; PostgreSQL (rôle `orion_app`, tâche ponctuelle `orion-roles` au déploiement) ; Logstash (TLS mutuel sur `6514`, certificats clients des VM) ; autorité de certification (`nameConstraints`, clé chiffrée) ; déploiement (logique exécutée sur orion-1 par `orion-deploiement`, seule commande permise à la clé du runner ; nouveaux fichiers `deploiement.sh` et `postgres-roles.sh` dans les configurations remises) ; services (Apache en `www-data` sur système de fichiers en lecture seule, `cap_drop: ALL`) ; Keycloak (realm `master` importé, console de compte fermée, adresse modifiable par l’administrateur seul).

### Schémas d’architecture (générateur)

- [x] Les quatre vues sont redessinées le 14 novembre : rapports des postes par HAProxy (vue cible simplifiée) ; flux ajoutés (Express → Keycloak, Apache, OpenLDAP et Logstash, runner et connecteur par le proxy, proxy → GitHub) ; « Swarm · TCP 2377 » dans le groupe des managers ; images d’Express, du simulateur et du connecteur ; aucun croisement ni libellé sur une boîte ; « simulateur » au lieu d’« émulateur » ; titre et textes alternatifs du [document des diagrammes](../03-ARCHITECTURE/19-DIAGRAMMES-ARCHITECTURE.md). Le générateur se relance (`lucide-react` est resté une dépendance de l’application).
- [x] **Basse** — Vue complète (15 novembre) : tous les flux réels sont tracés sans croisement : bandeau « Sur chaque VM » relié aux managers (Swarm 2377, 7946), à chrony (NTP), à Logstash (syslog TLS 6514), au proxy (images, paquets) et au DNS du réseau ; registres et dépôts (Docker Hub, docker.elastic.co, Debian) joints par le proxy, GitHub et Hidora ; publication de la CI vers Docker Hub et Hidora ; console Keycloak (8444) depuis le navigateur ; overlay (4789, ESP) dans le titre du cluster.

## 7. Feuille de route : évolutions du projet

Évolutions envisagées au-delà du périmètre en cours, reportées en V2 (décision de l’utilisateur du 15 novembre) : l’agent M42, la gestion du catalogue des applications et les postes Linux.

- [ ] **V2** — M42 conceptualisé et simulé, avec paquets d’installation et images Windows (décisions de l’utilisateur des 13 et 14 novembre ; l’agent n’est pas développé, il est conçu puis simulé par le simulateur des postes au travers de l’API réelle `/api/agent`) :
  - **Images Windows** : catalogue d’images fictives tenu par ORION (nom, version de Windows, liste des applications de base) ; M42 fait partie de chaque image et s’installe avec le système. Une réinitialisation applique l’image choisie par l’administrateur, au lieu de l’image unique imposée (`IMAGE_REFERENCE`). La vue des postes affiche en petit l’image installée (liste, fiche du poste, cartes de Supervision › Salles).
  - **Paquets d’installation** : chaque application du catalogue porte un paquet fictif (nom du fichier, version, commande d’installation silencieuse, empreinte SHA-256, éditeur signataire). Écran d’ajout, de modification et de retrait des applications (aujourd’hui absent : catalogue limité aux données de départ).
  - **Simulateur fidèle à l’agent** : vérification de l’empreinte avant installation, étapes d’intervention (téléchargement, installation, redémarrage, réenrôlement de l’agent après réinitialisation) avec durées réalistes, causes d’échec explicites (empreinte invalide, espace disque insuffisant).
  - **Conception de M42** : fiche interne (cycle de vie, enrôlement et identité du poste, protocole avec ORION, commandes, états, sécurité, mise à jour signée), cohérente avec l’option B du DAT (§ 6.5) ; proposition à soumettre au collègue du DAT.
  - **Conséquences documentaires** : glossaire (image, paquet, M42), règles de gestion **[RG]** (image choisie à la réinitialisation, paquet requis pour installer, agent installé avec le système), MCD (`SYSTÈME_EXPLOITATION` et `PAQUET` déjà modélisés le 15 novembre), DCU 09, matrice, fiche 15, diagramme d’états des interventions.
  - **Code** : types partagés, `rules.ts` (contrôles d’image et de paquet), schéma PostgreSQL, données de départ (`SEED_VERSION`), simulateur, écrans Administration › Applications et Postes, Supervision ; tests et guide de l’application.
- [ ] **V2** — Gestion du catalogue des applications (ajout, modification, retrait des applications et de leurs paquets) ; en V1, le catalogue est un référentiel commun (RG-77).
- [ ] **V2** — **Postes Linux** (idée de l’utilisateur du 13 novembre) :
  - chaque salle a un système, Windows ou Linux, commun à tous ses postes ; le parc compte davantage de salles sous Windows ;
  - images Linux fictives et déclinaison Linux de M42 installée avec le système ; une réinitialisation applique une image du même système que la salle ;
  - un paquet par système pris en charge ; une application ne s’installe que sur une salle dont le système a un paquet ;
  - la vue des postes affiche le système en petit (liste, fiche du poste, cartes de Supervision › Salles) ;
  - écart à signaler avant ouverture : le sujet, le client et le DAT ne parlent que de postes Windows (cadrage § 23, DAT) ;
  - conséquences : glossaire, règles de gestion **[RG]** (système commun à la salle, image du même système, paquet requis), MCD (association entre `SALLE` et `SYSTÈME_EXPLOITATION`), DCU 09, matrice, code et données de départ.

## 8. Historique conservé tel quel

- Le commit `3ad50a6` (dépendances npm) contient aussi les renommages de `schemas-architecture` et `serve` ; leur contenu est dans `b9151ee`.
- Le registre des archives et les copies de l’ancien design conservent l’ancien nom du projet dans les versions antérieures au renommage.

## 9. Fait récemment

- [x] Dossier d’architecture (15 novembre) : identités fictives retirées de l’annuaire remis ([c0ace77](https://github.com/bpierrelouis/aster/commit/c0ace77)) ; tous les flux réels tracés dans la vue complète, stockage NFSv4.2 et RIGEL servi par l’entrée d’ORION dans la cible ([e6b9ffd](https://github.com/bpierrelouis/aster/commit/e6b9ffd)). Tickets #71, #150 et #151 clos.
- [x] Règles de gestion mises à jour avec l’accord de l’utilisateur (13 novembre) : RG-13, RG-15, RG-21, RG-39, RG-40, RG-64, RG-66 et RG-72 réécrites, RG-87 à RG-91 ajoutées ; glossaire, matrice, fiches, DCU 11, cadrage et diagramme d’états alignés ; application conforme (traitement par le seul gestionnaire, prise en charge obligatoire, suppression depuis le stock).
- [x] [MCD](../02-ANALYSE/02-CAPTURE-DES-BESOINS/05-MCD-MERISE.svg) refait avec draw.io : étapes de la remontée, poste constitué de son unité centrale, adresse IP du poste, adresse MAC du matériel, dates du compte, `COMPTE_ORION` et `DÉMÉNAGER`.
- [x] Secret Swarm `PROVISIONING_CLIENT_SECRET` créé par `installer.sh` sur les VM déjà installées.
- [x] Fusion de `main` : DAT de référence et module RIGEL.
