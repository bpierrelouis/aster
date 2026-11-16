# Backlog technique et feuille de route

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 9.0 | 16/11/2026 | Pilotage interne | Retirer la synthèse de l’audit du 16 novembre ; Adopter la numérotation locale du dossier ; Actualiser les liens après la renumérotation | [63 versions](../../archive/README.md#02-backlog-technique-et-feuille-de-route) |
<!-- version:fin -->

Document de pilotage interne, tenu à chaque itération. Il complète le [backlog et suivi du projet](01-BACKLOG-ET-SUIVI-PROJET.md), qui organise les tâches de l’équipe et leurs cérémonies Scrum : il recense le travail technique restant (corrections, dette, sécurité, documentation, écarts à soumettre), classé par échéance et par domaine, puis la feuille de route des évolutions du projet. Les décisions et questions ouvertes font foi dans le [cadrage](../01-CONTEXTE/03-CADRAGE.md) ; ce document n’en suit que la réalisation. Il n’est pas remis comme livrable : il cite des éléments propres au démonstrateur.

Repères : priorité **haute**, **moyenne** ou **basse** ; **[RG]** la correction crée ou modifie une règle de gestion et exige l’accord préalable de l’utilisateur ; **[PROT]** document protégé, modifié seulement sur demande ; **[DAT]** le dossier d’architecture fait foi et n’est modifié que par le collègue qui le tient.

## 1. Échéances

### Lundi 16 novembre

- [ ] Diagrammes [de contexte](../02-ANALYSE/01-MODELISATION-METIER/01-DIAGRAMME-CONTEXTE.md) et [d’activité](../02-ANALYSE/01-MODELISATION-METIER/02-DIAGRAMMES-ACTIVITE.md) **[PROT]** : des collègues les ont modifiés sans publier leur travail ; faire le point avec eux, puis vérifier le super administrateur, l’authentification par MindefConnect, le téléphone de recensement (RIGEL), le PDF produit à la demande (pas à la création), le traitement des remontées par le seul gestionnaire et l’absence de filtre par salle du tableau de bord. M42 reste une option candidate tant que la solution d’administration n’est pas retenue.

### Avant le prochain déploiement sur les VM

- [x] Réinitialisation des données de démonstration : le service `api` des VM recharge le jeu de départ à chaque changement de `SEED_VERSION` (21 au 14 novembre, comptes fictifs compris).
- [x] Vérifier après déploiement (#116 validé après rectification) : bon fonctionnement de l’application déployée vérifié par le collègue de l’utilisateur et confirmé par celui-ci le 15 novembre. Les VM sont sur un réseau fermé : leur non-accès depuis le poste d’audit n’est pas une anomalie. Preuve de recette conservée : recette automatisée sur les VM le 15 novembre (version `75615df`, `npm run test:recette`, 15 parcours réussis) : version servie et état public limité, connexion par mot de passe de chaque profil et par les trois jetons, super administrateur, postes simulés, cloisonnement et droits, matériel affecté puis installé, arrêt et installation exécutés par les postes, remontée jusqu’à sa correction avec PDF, recensement RIGEL de bout en bout (téléphone émulé). Anomalie trouvée et corrigée : connecteur RIGEL refusé par le relais (401), le secret GitHub `RELAIS_TOKEN` ayant été changé le 14 novembre après la création du secret Swarm ; secret GitHub réaligné et relais redéployé. Caméra et installation de l’application mobile vérifiées par l’utilisateur sur iOS le 15 novembre. La confirmation de recette globale provient de l’utilisateur ; aucun nouveau scénario distant n’est revendiqué par cet audit. Les anciennes identités `@orion.demo` restent dans l’annuaire LDAP des VM : sans compte ORION, elles sont refusées.

### Avant le rendu de l’application (mardi 17 novembre)

- [x] **Haute** — Comptes de démonstration remplacés par des personnes fictives aux adresses `prénom.nom` de messageries courantes (Gmail, Outlook, Yahoo, Hotmail, Orange, Free, La Poste), sans adresse `@orion.demo` ni `admin@`, `gestionnaire@` (14 novembre) : même répartition qu’avant (super administrateur ; administrateur, gestionnaire et quatre formateurs à l’École du numérique ; administrateur, gestionnaire et formateur à l’École des réseaux). Jeu de départ et fichier LDIF mis à jour ; sur la page de connexion, un tableau « Comptes » en marge, au style du bloc de connexion (adresse, profil, école, flèche de connexion directe), remplaçait les jetons « Accès de présentation », rétablis ensuite (`baabbf7`).
- [x] **Haute** — Mots de passe des comptes (15 novembre) : un mot de passe par compte, dérivé du secret `PROVISIONING_PASSWORD_SECRET` (secret Swarm créé au premier déploiement, jamais versionné ; tableau affiché par `outils/identites-keycloak/mots-de-passe.ts`), posé par la création des identités ; l’annuaire n’en garde qu’une empreinte salée ; Keycloak demande l’adresse puis le mot de passe, repris de la page de connexion. Les jetons « Accès de présentation » connectent toujours sans mot de passe : le realm saute le mot de passe pour leurs trois adresses seulement, tant que `ORION_COMPTES_PRESENTATION=true`.
- [ ] **Haute** — Créer un scénario complet de l’application : parcours de bout en bout par profil (connexion, parc, salles, recensement RIGEL, remontée de sa création à sa fin, supervision, intervention sur les postes, notifications, administration), avec données de départ adaptées et résultat attendu à chaque étape ; il sert de fil de la présentation et de test de recette.

### Avant la présentation (supports prêts le mercredi 18 novembre ; présentation le jeudi 19 novembre, horaire non fixé)

- [ ] Préparer le support et répartir les passages ; répéter la présentation le 18 novembre.

### Après la présentation

- [ ] Retirer les jetons « Accès de présentation » de la page de connexion du Keycloak local : variable `ORION_COMPTES_PRESENTATION` (Compose, pile des VM ; elle choisit aussi le flux du realm, `orion-connexion-true` ou `-false`), flux `orion-connexion-true` et condition `orion-comptes-presentation` du realm et bloc du thème `orion-mindef` (gabarit, styles, script).

## 2. Pilotage du projet

- [x] **Haute** — Traiter le backlog GitHub (14 novembre : projet « ORION development », 156 tickets, dont 142 rattachés aux deux sprints) : trier, mettre à jour et clore les éléments au regard de l’état actuel, puis reporter le résultat dans le [backlog](01-BACKLOG-ET-SUIVI-PROJET.md). Seize tickets réalisés ont été clôturés et passés en « Done » le 14 novembre. Le dépôt GitHub garde l’ancien nom (`bpierrelouis/aster`). Le brouillon de suivi du 13 novembre est retiré le 14 novembre : le [backlog](01-BACKLOG-ET-SUIVI-PROJET.md) le remplace et reprend ses références de commits (§ 9).
- [ ] Cadrage § 22 : dater le prochain rendez-vous ; consigner le sort des propositions préparées pour le 12 novembre (application de scan, devenue RIGEL, et livraisons) quand un retour existera.

## 3. Application

### Corrections signalées par l’utilisateur

- [x] **Haute** — Connexion : « Vous êtes déjà authentifié avec un autre utilisateur » (local et VM) après un retour arrière vers la page de connexion ou avec deux onglets. La page d’erreur du thème ferme la session Keycloak et la connexion reprend avec le compte choisi ; ORION garde une tentative de connexion par onglet (14 novembre).

### Corrections relevées par l’audit du 13 novembre

- [x] **Haute** — CODE-04 (#167, 16 novembre) : une collection absente d’une écriture n’est plus contrôlée ; le navigateur ne renvoie plus `processus`, `detections` ni `installations` ; 50 processus arrêtés au plus par poste (`ARRETES_PAR_POSTE`) ; un seul simulateur par espace (guide de l’application).
- [x] **Moyenne** — Supervision › Listes sur `DataPanel` (recherche, filtre par classement, ordre alphabétique, 25 par page ; décision de l’utilisateur du 16 novembre : V1) ; fiche 15 et capture `42-supervision-listes` à jour.
- [x] **Haute** — Jeton du relais RIGEL : une seule source, le secret `RELAIS_TOKEN` du dépôt, transmis à chaque déploiement ; secret Swarm nommé par son empreinte, connecteur redéployé si le jeton change, anciens secrets retirés ; le job Hidora échoue si le relais refuse le jeton (constat du 15 novembre). `installer.sh --commande` réinstalle la commande `orion-deploiement` d’orion-1, à lancer avant le prochain déploiement.
- [x] **Moyenne** — Détections : conservées trente jours sans la limite des 2 000 plus récentes (RG-56) ([52c3add](https://github.com/bpierrelouis/aster/commit/52c3add)).
- [x] **Moyenne** — Étage d’une salle obligatoire côté serveur (RG-61) ([52c3add](https://github.com/bpierrelouis/aster/commit/52c3add)).
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

### Écarts confirmés par l’audit avant rendu du 16 novembre

- [x] **Haute** — #167 : corrigé (voir CODE-04 ci-dessus) ; test serveur à 20 001 processus.
- [x] **Haute** — #163 : nom, classement, portée et rattachements des règles contrôlés par le serveur (`backend/domaine/regles.ts`) ; seuls les rattachements de la portée sont conservés.
- [x] **Haute** — #164 : identifiants du serveur en UUID complet.
- [x] **Basse** — #162 : résidus « campagne » retirés (16 novembre) ; le sélecteur `.campagne .synchro`, mort, devient `.operation .synchro` (lien de synchronisation de RIGEL de nouveau mis en forme) ; anciens noms gardés pour la reprise du relais et d’IndexedDB.

### Évolutions

- [x] **Haute** — Noms de la base et du code alignés sur la documentation ([#162](https://github.com/bpierrelouis/aster/issues/162), décision de l’utilisateur du 15 novembre : avant le gel, vocabulaire complet) : migration `0002` (tables, index et contraintes sans préfixe `orion_`, collections `operations` → `interventions` et `recensements` → `operations`, `operationId` des constats, journal de fusion repris), table de suivi `migration`, tables du relais `operation` et `evenement` (reprise des anciennes) ; code : `Intervention`, `Operation` (RIGEL), `Deplacement`, « campagne » → « opération », routes `/operations`, champ `intervention` des résultats des postes ; appairages enregistrés sur les téléphones repris ; `SEED_VERSION` 22. Audit rectifié : migration neuve/reprise 0001 et relais validés localement sans perte ; bon fonctionnement du déploiement confirmé par l’utilisateur après vérification de son collègue. #162 reste ouvert uniquement pour les résidus de vocabulaire CODE-03 ; aucun défaut de migration VM n’est établi.
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
- [x] Tests : détail de `/api/health` et `/api/infos` réservé au super administrateur ; état global, description et version publics (#130).
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

Audit du 15 novembre, #109 refusé :

- [x] **Haute** — #165 : une opération dont le lanceur n’est plus gestionnaire actif de l’école n’est plus publiée et ses constats sont refusés (RG-85) ; un autre gestionnaire clôt le recensement ou relance l’installation, qui clôt l’ancienne. Refusé par le relais après une première synchronisation (opération close, expirée ou retirée), le téléphone efface toutes ses données (décision de l’utilisateur du 16 novembre).
- [x] **Basse** — Quota du relais atomique : contrôle et ajout dans une transaction, sous verrou de l’opération (#120, #109).
- [x] **Basse** — JSON invalide : « JSON invalide. », sans extrait du corps, dans la réponse et le journal (API et relais).
- [x] **Basse** — Mot de passe du thème Keycloak jamais conservé par le navigateur (16 novembre) : adresse sur la première page (« Continuer »), mot de passe sur la seconde. Après un retour arrière sur une page déjà utilisée, le mot de passe est redemandé une fois la session précédente fermée.

Restent ouverts (vérifiés le 16 novembre dans la configuration et le code : aucun n’est corrigé) :

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
| Divulgation | Message distinct pour un identifiant ou une adresse existant dans une autre école | Réponse générique hors périmètre | Démonstrateur et cible |

Décisions de l’utilisateur du 16 novembre : OpenLDAP, administrateur de Keycloak, plage de confiance du proxy et énumération à la connexion acceptés (démonstrateur) ; QR d’appairage reporté en V2 ; import accepté, l’analyse ne renvoyant que les matériels dont le numéro de série figure dans le fichier ; message « adresse déjà utilisée » accepté.

Version publiée sans connexion par `/api/infos` : conservée, attendue pour les applications déployées sur le C1NP (décision de l’utilisateur du 15 novembre) ; testée avec le détail réservé au super administrateur (#130).

Décidé de ne pas faire (utilisateur, 13 novembre) : filtrage réseau de la console Keycloak (8444) et de Logstash (6514), pare-feu des VM. Dépôt laissé public (utilisateur, 15 novembre) pour ne pas limiter les minutes de la CI.

## 5. Documentation à remettre

### Priorité haute

- [x] RIGEL dans le cadrage : § 23 (application de scan réalisée par RIGEL, RG-92 à RG-96) et § 19 (décision du 15 novembre, fonctionnement hors connexion) mis à jour le 15 novembre ; livrables relus (#158).
- [x] Captures des fiches Gestionnaire, Administrateur et Super administrateur : les anciennes maquettes IHM sont supprimées ; les fiches reprennent les captures de l’application (`design/maquettes/captures/`, 14 novembre).
- [x] Cadrage § 23 (#60, phrase introductive remplacée le 16 novembre avec l’accord de l’utilisateur) : sa phrase introductive affirme encore que les productions cible suivent la décision du client (`03:391`, `:405`, `:406`), contrairement à la règle en vigueur (la documentation suit l’état actuel, l’écart est inscrit au § 23). RG-36, RG-37, matrice et fiche Gestionnaire ont été alignées ; seule la contradiction introductive reste à corriger, sans nouvelle modification des règles.

### Suites de l’audit du 16 novembre

- [x] **Haute** — RG-15 et définition « Administrateur » du glossaire : confirmation des installations et actions RIGEL réservées au gestionnaire (accord de l’utilisateur du 16 novembre) ; remplacé par la décision suivante.
- [x] **Haute** — Décision de l’utilisateur du 16 novembre : l’administrateur hérite de tous les droits du gestionnaire dans son école (traitement des remontées, confirmation des installations, RIGEL, alerte de garantie) ; le super administrateur les a sur toutes les écoles, sauf RIGEL, qu’il suit en lecture seule. RG-15, RG-64, RG-86 et RG-92 à RG-94 réécrites, code aligné ; glossaire, cadrage, matrice, quatre fiches des profils, DCU Gestion du parc et Remontées utilisateur, diagrammes de contexte, d’activité, d’états, d’activité des cas d’utilisation, de séquence système, de classes d’analyse et de séquence détaillés, ainsi que guide de l’application alignés. Le DCU Gestion du parc fait désormais de la liaison du téléphone une extension de l’installation, ce qui lève DOC-03.
- [x] DOC-06 (#166) abandonné (décision de l’utilisateur du 16 novembre) : un poste est toujours dans une salle, le lieu historique d’une détection n’est pas ajouté au MCD ni aux classes métier. Le code et le MPD gardent la salle de la détection.
- Réserves de la V1 (décision de l’utilisateur du 16 novembre), non corrigées : DOC-03 (appairage RIGEL en inclusion dans le DCU Gestion du parc, levé par l’alignement des droits du 16 novembre), DOC-04 (points d’extension non nommés), DOC-05 (propriétaire du paquet).

### Contradictions à corriger

- [x] RIGEL dans la cible : les livrables présentent l’architecture cible (décision de l’utilisateur du 15 novembre) ; glossaire, diagrammes de contexte et d’activité (mise à jour autorisée), classes d’analyse et de conception, séquences détaillées et modèle physique alignés : téléphone joint directement l’API RIGEL d’Express, sans relais ni connecteur (#161).
- [x] Notification de processus interdit attribuée au formateur : matrice, glossaire (acteur de supervision) et cadrage § 12 alignés sur RG-55 (#140).
- [x] RG-81 et RG-22 : une intervention porte sur des postes d’une seule salle (accord de l’utilisateur du 15 novembre, #140).
- [x] Matrice (import JSON) : contrôles du fichier renvoyés à RG-29 (#140).
- [x] Cadrage : l’arbitrage du 9 novembre (bâtiment représenté) figure au § 2 et est reporté au § 11 (portée bâtiment) (#140).
- [x] Cadrage § 11 : gestion des listes par l’administrateur et le super administrateur reportée en « Application » (RG-50, #140).
- [x] Étage d’une salle obligatoire : RG-61 alignée sur RG-02, le MCD et l’interface (accord de l’utilisateur du 15 novembre, #140) ; contrôle du serveur à ajouter (§ 3).
- [x] DCU 08 : l’`include` « consulter → rechercher » n’existe plus ; « Rechercher un matériel » est réservé à l’acteur de gestion (vérifié le 15 novembre).
- [x] Brouillon d’activité V2 : retiré ; le README ne le cite plus (vérifié le 15 novembre).

### Décisions du 13 novembre non reportées

- [x] Renommage `Id_compte` → `Id_compte_Windows` : glossaire, RG-43 et cadrage (§§ 4 et 10, noms des entités du MCD) (#141).
- [x] Cadrage § 10 : adresse MAC reportée au matériel (#141).
- [x] Adresse IP du poste : RG-44 (accord de l’utilisateur du 15 novembre) et DCU 10 (#141).
- [x] Dates de dernière connexion et de désactivation du compte : reportées au cadrage § 18 (#141).
- [x] Termes « whitelist » et « blacklist » retenus partout (glossaire, interface, fiches, diagrammes) : décision de l’utilisateur du 15 novembre.
- [x] Fiche 15 : « à replaquer » remplacé (vérifié le 15 novembre).

### Informations non répercutées

- [x] Installation physique des salles et notification « matériels à déplacer » du gestionnaire : décrites dans la fiche 13, RG-92, le glossaire et le DCU 08 (« Installer une salle », « Recenser le parc »).
- [x] Journal applicatif : reporté au cadrage (§§ 18 et 21) et à la fiche 15 (#142).
- [x] RG-56 : conservation de 30 jours maintenue (décision de l’utilisateur du 15 novembre) ; la limite de 2 000 détections du code est à retirer (§ 3) (#142).
- [x] Cadrage § 19 : décision RIGEL du 15 novembre reportée ; runner et point d’entrée présentés en « Application » ; « simulateur » au lieu de « émulateur ».
- [x] Glossaire : Intervention, Compte ORION, Étape de remontée, Type de problème, C1NP et CCT ajoutés ; API décrite d’après l’API des postes ; entrée LDAP conservée (décision de l’utilisateur du 15 novembre) (#142).

### Écarts documentaires de l’audit

- [x] **Basse** — Script de versions : un nouveau document peut être republié avant son premier commit sans échec ni changement de version (DOC-11, `fd6fa8b`) ; branche nouveau et branche existant vérifiées.

- [ ] **Haute** — #166 : représenter la salle historique d’une détection dans le MCD/classes métier ; RG-56 et le code la conservent, contrairement à une jointure par la salle actuelle du poste.
- [ ] **Basse** — #63 : retirer l’appairage obligatoire de toute installation (DCU Gestion du parc), préciser les conditions et points des extensions des DCU Gestion du parc, Supervision des postes et Administrer ORION, ainsi que la totalité du propriétaire de PAQUET (XT).
- [x] ~~**Basse [RG]** — Préciser RG-15 et l’entrée Administrateur du glossaire : exceptions supplémentaires pour les installations et RIGEL, déjà appliquées par RG-92 à RG-96.~~ Sans objet : l’administrateur hérite des droits du gestionnaire (décision de l’utilisateur du 16 novembre).

### Modèle de données

- [x] [MCD](../02-ANALYSE/02-CAPTURE-DES-BESOINS/02-MCD-MERISE.svg) (15 novembre) : `DÉPLACEMENT` (origine, destination, auteurs et dates de demande et de confirmation), `OPÉRATION` (anciennement `RECENSEMENT`), de type recensement ou installation, listes de valeurs fixes en attributs (profil, statut, type de problème, type de matériel), `SYSTÈME_EXPLOITATION` et `PAQUET` pour le catalogue de la V2, contraintes d’exclusion sur la portée d’une règle et sur le propriétaire d’un paquet ; `REMONTÉE` déjà reliée à `ÉCOLE` (`RELEVER`) et entités RIGEL présentes.
- [x] Lien direct remontée → école (`RELEVER`) justifié dans RG-79 : la remontée reste rattachée à l’école de sa création (accord de l’utilisateur du 15 novembre).

### DCU à compléter

- [x] [DCU 03 — Gestion du parc](../02-ANALYSE/02-CAPTURE-DES-BESOINS/03-DCU-GESTION-PARC.md) : import JSON avec rapprochement des numéros de série (lignes ignorées, transfert d’un matériel d’une autre école) ; changement d’école d’un matériel (installation et recensement ajoutés le 14 novembre).
- [x] [DCU 04 — Administration des postes](../02-ANALYSE/02-CAPTURE-DES-BESOINS/04-DCU-ADMINISTRATION-POSTES.md) : « Consulter la vue des postes » et réinitialisation (RG-77) ; le catalogue des applications, les postes Linux et l’agent M42 relèvent de la V2 (décision du 15 novembre) ; suivre les interventions lancées et en être notifié à leur fin (RG-39).
- [x] [DCU 05 — Supervision des postes](../02-ANALYSE/02-CAPTURE-DES-BESOINS/05-DCU-SUPERVISION-POSTES.md) : notification du lancement d’une application interdite à l’administrateur ; adresse IP du poste dans la liste des processus.
- [x] Nouveau DCU « Administrer ORION » (ou extension du DCU 04) : comptes ORION (création, modification, désactivation, réactivation ; RG-70) et écoles (création, renommage ; RG-76), réservés aux administrateurs et au super administrateur.
- [x] Préférences personnelles (ambiance d’affichage, tableaux de bord) : couvertes par le DCU 07 « Administrer ORION » (vérifié le 15 novembre).

### Cadrage : questions déjà résolues encore ouvertes

- [x] Reporté en « Application : … », sans fermer la question côté client (#143 ; lien poste/unité centrale et filtre salle du tableau de bord reportés le 16 novembre) : identifiants, détection et référentiel des applications (RG-77), réinitialisation partielle, suivi par poste et échec (RG-22, RG-81), conservation de 30 jours (RG-56), remontée anonyme refusée (RG-85), formateur sans complément (RG-13), tableau de bord personnalisable (RG-84), nom ORION ; rendez-vous du 12 novembre passé, suivant à fixer.

### Brouillons

- [x] Versions Word des fiches et du backlog retirées le 15 novembre : le Markdown fait foi (#144).

## 6. Dossier d’architecture : écarts à traiter [DAT]

Le DAT, tenu par l’utilisateur, fait foi ; ces écarts entre lui, la configuration réelle et ses schémas sont à lui soumettre. Le 14 novembre, l’utilisateur a fait corriger directement le DAT et les schémas pour les points cochés ci-dessous.

### Propositions de l’audit à soumettre au détenteur

- [x] **Haute [DAT]** — #70 : contrainte réseau distinguée entre architecture réelle (relais et connecteur) et cible (entrée publique de RIGEL) (accord de l’utilisateur du 16 novembre).
- [x] **Basse [DAT]** — #70 : stockage hors ligne dans IndexedDB distingué du chiffrement des échanges avec le relais (16 novembre).

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

- [x] **Moyenne** — Durcissement du 15 novembre reporté au DAT (§ 4.5 et § 4.8) : protections de l’entrée et limitation de débit, Keycloak, TLS mutuel du collecteur, autorité restreinte, exports NFS par service en `root_squash`, rôle `orion_app`, conteneurs sans capacité, commande `orion-deploiement` et nouveaux fichiers remis (modification autorisée par l’utilisateur le 15 novembre, qui en vérifie le contenu).

### Schémas d’architecture (générateur)

- [x] Les quatre vues sont redessinées le 14 novembre : rapports des postes par HAProxy (vue cible simplifiée) ; flux ajoutés (Express → Keycloak, Apache, OpenLDAP et Logstash, runner et connecteur par le proxy, proxy → GitHub) ; « Swarm · TCP 2377 » dans le groupe des managers ; images d’Express, du simulateur et du connecteur ; aucun croisement ni libellé sur une boîte ; « simulateur » au lieu d’« émulateur » ; titre et textes alternatifs du [document des diagrammes](../03-ARCHITECTURE/02-DIAGRAMMES-ARCHITECTURE.md). Le générateur se relance (`lucide-react` est resté une dépendance de l’application).
- [x] **Basse** — Vue complète (15 novembre) : tous les flux réels sont tracés sans croisement : bandeau « Sur chaque VM » relié aux managers (Swarm 2377, 7946), à chrony (NTP), à Logstash (syslog TLS 6514), au proxy (images, paquets) et au DNS du réseau ; registres et dépôts (Docker Hub, docker.elastic.co, Debian) joints par le proxy, GitHub et Hidora ; publication de la CI vers Docker Hub et Hidora ; console Keycloak (8444) depuis le navigateur ; overlay (4789, ESP) dans le titre du cluster.

## 7. Feuille de route : évolutions du projet

- [ ] **RIGEL selon la cible** — La conception (classes, séquences détaillées et modèle physique) présente la cible : le téléphone joint l’API RIGEL d’Express (`GET /api/rigel/operations/:id/instantane`, `POST /api/rigel/operations/:id/evenements`) avec le jeton de son appairage, sans chiffrement de bout en bout ni base du relais. Les noms sont repris dans le code (#162) ; le code garde le relais Hidora, le connecteur et les blocs chiffrés de l’architecture réelle, écart voulu tant que le démonstrateur n’a pas d’entrée depuis Internet.

Évolutions envisagées au-delà du périmètre en cours, reportées en V2 (décision de l’utilisateur du 15 novembre) : l’agent M42, la gestion du catalogue des applications et les postes Linux.

- [ ] **V2** — M42 conceptualisé et simulé, avec paquets d’installation et images Windows (décisions de l’utilisateur des 13 et 14 novembre ; l’agent n’est pas développé, il est conçu puis simulé par le simulateur des postes au travers de l’API réelle `/api/agent`) :
  - **Images Windows** : catalogue d’images fictives tenu par ORION (nom, version de Windows, liste des applications de base) ; M42 fait partie de chaque image et s’installe avec le système. Une réinitialisation applique l’image choisie par l’administrateur, au lieu de l’image unique imposée (`IMAGE_REFERENCE`). La vue des postes affiche en petit l’image installée (liste, fiche du poste, cartes de Supervision › Salles).
  - **Paquets d’installation** : chaque application du catalogue porte un paquet fictif (nom du fichier, version, commande d’installation silencieuse, empreinte SHA-256, éditeur signataire). Écran d’ajout, de modification et de retrait des applications (aujourd’hui absent : catalogue limité aux données de départ).
  - **Simulateur fidèle à l’agent** : vérification de l’empreinte avant installation, étapes d’intervention (téléchargement, installation, redémarrage, réenrôlement de l’agent après réinitialisation) avec durées réalistes, causes d’échec explicites (empreinte invalide, espace disque insuffisant).
  - **Conception de M42** : fiche interne (cycle de vie, enrôlement et identité du poste, protocole avec ORION, commandes, états, sécurité, mise à jour signée), cohérente avec l’option B du DAT (§ 6.5) ; proposition à soumettre au collègue du DAT.
  - **Conséquences documentaires** : glossaire (image, paquet, M42), règles de gestion **[RG]** (image choisie à la réinitialisation, paquet requis pour installer, agent installé avec le système), MCD (`SYSTÈME_EXPLOITATION` et `PAQUET` déjà modélisés le 15 novembre), DCU 04, matrice, fiche Administrateur, diagramme d’états des interventions.
  - **Code** : types partagés, `rules.ts` (contrôles d’image et de paquet), schéma PostgreSQL, données de départ (`SEED_VERSION`), simulateur, écrans Administration › Applications et Postes, Supervision ; tests et guide de l’application.
- [ ] **V2** — Gestion du catalogue des applications (ajout, modification, retrait des applications et de leurs paquets) ; en V1, le catalogue est un référentiel commun (RG-77).
- [ ] **V2** — **Postes Linux** (idée de l’utilisateur du 13 novembre) :
  - chaque salle a un système, Windows ou Linux, commun à tous ses postes ; le parc compte davantage de salles sous Windows ;
  - images Linux fictives et déclinaison Linux de M42 installée avec le système ; une réinitialisation applique une image du même système que la salle ;
  - un paquet par système pris en charge ; une application ne s’installe que sur une salle dont le système a un paquet ;
  - la vue des postes affiche le système en petit (liste, fiche du poste, cartes de Supervision › Salles) ;
  - écart à signaler avant ouverture : le sujet, le client et le DAT ne parlent que de postes Windows (cadrage § 23, DAT) ;
  - conséquences : glossaire, règles de gestion **[RG]** (système commun à la salle, image du même système, paquet requis), MCD (association entre `SALLE` et `SYSTÈME_EXPLOITATION`), DCU 04, matrice, code et données de départ.

## 8. Historique conservé tel quel

- Le commit `3ad50a6` (dépendances npm) contient aussi les renommages de `schemas-architecture` et `serve` ; leur contenu est dans `b9151ee`.
- Le registre des archives et les copies de l’ancien design conservent l’ancien nom du projet dans les versions antérieures au renommage.

## 9. Fait récemment

- [x] Documentation alignée (15 novembre, #140, #141, #142, #161) : RIGEL présenté selon l’architecture cible ; contradictions entre livrables corrigées (RG-22, RG-81, RG-61 avec l’accord de l’utilisateur) ; décisions du 13 novembre reportées (RG-43, RG-44) ; journal applicatif et glossaire complétés. Code aligné sur RG-56 et RG-61.
- [x] Dossier d’architecture (15 novembre) : identités fictives retirées de l’annuaire remis ([c0ace77](https://github.com/bpierrelouis/aster/commit/c0ace77)) ; tous les flux réels tracés dans la vue complète, stockage NFSv4.2 et RIGEL servi par l’entrée d’ORION dans la cible ([e6b9ffd](https://github.com/bpierrelouis/aster/commit/e6b9ffd)). Tickets #71, #150 et #151 clos.
- [x] Règles de gestion mises à jour avec l’accord de l’utilisateur (13 novembre) : RG-13, RG-15, RG-21, RG-39, RG-40, RG-64, RG-66 et RG-72 réécrites, RG-87 à RG-91 ajoutées ; glossaire, matrice, fiches, DCU 11, cadrage et diagramme d’états alignés ; application conforme (traitement par le seul gestionnaire, prise en charge obligatoire, suppression depuis le stock).
- [x] [MCD](../02-ANALYSE/02-CAPTURE-DES-BESOINS/02-MCD-MERISE.svg) refait avec draw.io : étapes de la remontée, poste constitué de son unité centrale, adresse IP du poste, adresse MAC du matériel, dates du compte, `COMPTE_ORION` et `DÉMÉNAGER`.
- [x] Secret Swarm `PROVISIONING_CLIENT_SECRET` créé par `installer.sh` sur les VM déjà installées.
- [x] Fusion de `main` : DAT de référence et module RIGEL.
