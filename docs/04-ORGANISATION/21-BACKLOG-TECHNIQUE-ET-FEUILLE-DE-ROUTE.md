# Backlog technique et feuille de route

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 4.16 | 14/11/2026 | Pilotage interne | Cocher les corrections du DAT et des schémas | [26 versions](../../archive/README.md#21-backlog-technique-et-feuille-de-route) |
<!-- version:fin -->

Document de pilotage interne, tenu à chaque itération. Il complète le [backlog et suivi du projet](20-BACKLOG-ET-SUIVI-PROJET.md), qui organise les tâches de l’équipe et leurs cérémonies Scrum : il recense le travail technique restant (corrections, dette, sécurité, documentation, écarts à soumettre), classé par échéance et par domaine, puis la feuille de route des évolutions du projet. Les décisions et questions ouvertes font foi dans le [cadrage](../01-CONTEXTE/02-CADRAGE.md) ; ce document n’en suit que la réalisation. Il n’est pas remis comme livrable : il cite des éléments propres au démonstrateur.

Repères : priorité **haute**, **moyenne** ou **basse** ; **[RG]** la correction crée ou modifie une règle de gestion et exige l’accord préalable de l’utilisateur ; **[PROT]** document protégé, modifié seulement sur demande ; **[DAT]** le dossier d’architecture fait foi et n’est modifié que par le collègue qui le tient.

## 1. Échéances

### Lundi 16 novembre

- [ ] Diagrammes [06](../02-ANALYSE/01-MODELISATION-METIER/06-DIAGRAMME-CONTEXTE.md) et [07](../02-ANALYSE/01-MODELISATION-METIER/07-DIAGRAMMES-ACTIVITE.md) **[PROT]** : des collègues les ont modifiés sans publier leur travail ; faire le point avec eux, puis vérifier le super administrateur, l’authentification par MindefConnect, le téléphone de recensement (RIGEL), le PDF produit à la demande (pas à la création), le traitement des remontées par le seul gestionnaire et l’absence de filtre par salle du tableau de bord. M42 reste une option candidate tant que la solution d’administration n’est pas retenue.

### Avant le prochain déploiement sur les VM

- [x] Réinitialisation des données de démonstration : le service `api` des VM recharge le jeu de départ à chaque changement de `SEED_VERSION` (21 au 14 novembre, comptes fictifs compris).
- [ ] Vérifier après déploiement : `https://172.16.131.188/api/infos` (version servie) ; connexion des comptes (jetons « Accès de présentation » compris), leurs identités étant créées dans l’annuaire par le provisionnement au démarrage ; création d’un compte ; rapports des postes simulés ; recensement RIGEL. Les anciennes identités `@orion.demo` restent dans l’annuaire LDAP des VM (le LDIF n’est chargé qu’à la création du volume) : sans compte ORION, elles sont refusées ; les supprimer dans la console Keycloak si besoin.

### Avant le rendu de l’application (mardi 17 novembre)

- [x] **Haute** — Comptes de démonstration remplacés par des personnes fictives aux adresses `prénom.nom` de messageries courantes (Gmail, Outlook, Yahoo, Hotmail, Orange, Free, La Poste), sans adresse `@orion.demo` ni `admin@`, `gestionnaire@` (14 novembre) : même répartition qu’avant (super administrateur ; administrateur, gestionnaire et quatre formateurs à l’École du numérique ; administrateur, gestionnaire et formateur à l’École des réseaux). Jeu de départ et fichier LDIF mis à jour ; sur la page de connexion, un tableau « Comptes » en marge, au style du bloc de connexion (adresse, profil, école, flèche de connexion directe), remplaçait les jetons « Accès de présentation », rétablis ensuite (`baabbf7`).
- [ ] **Haute** — Mots de passe des comptes : mot de passe dans l’annuaire, connexion par le formulaire habituel (le flux sans mot de passe du Keycloak local est alors retiré de l’image des VM). Les mots de passe ne sont jamais versionnés : secrets Swarm ou saisie au déploiement.
- [ ] **Haute** — Créer un scénario complet de l’application : parcours de bout en bout par profil (connexion, parc, salles, recensement RIGEL, remontée de sa création à sa fin, supervision, intervention sur les postes, notifications, administration), avec données de départ adaptées et résultat attendu à chaque étape ; il sert de fil de la présentation et de test de recette.

### Avant la présentation (supports prêts le mercredi 18 novembre ; présentation le jeudi 19 novembre, horaire non fixé)

- [ ] Préparer le support et répartir les passages ; répéter la présentation le 18 novembre.

### Après la présentation

- [ ] Retirer les jetons « Accès de présentation » de la page de connexion du Keycloak local : variable `ORION_COMPTES_PRESENTATION` (Compose, pile des VM) et bloc du thème `orion-mindef` (gabarit, styles, script).

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

- [ ] **Moyenne** — Observatoire anonymisé des parcours utilisateurs : mesurer, sans identifier les personnes, le taux de réussite, la durée, les abandons et les erreurs des tâches principales (créer et traiter une remontée, déplacer ou importer du matériel, demander une intervention, recenser une salle), puis adapter la navigation à partir de ces données réelles. À cadrer avant réalisation : liste des tâches et de leurs étapes, anonymisation et durée de conservation, information des utilisateurs, stockage dans ORION, restitution (tableau de bord du super administrateur), et place dans l’architecture cible à soumettre au collègue du DAT.
- [ ] **Moyenne** — Retirer au lieu de supprimer (bonne pratique de gestion de parc, proposée le 13 novembre) :
  - matériel, poste, application du catalogue et règle : un retrait (état « retiré » avec date, auteur et motif : réformé, perdu, transféré, erreur de saisie) remplace la suppression ; l’élément reste en base, sort des listes courantes, garde son historique et peut être réactivé ;
  - suppression réelle réservée à une création erronée jamais citée ; le serveur la refuse dès qu’une référence existe (remontée, constat, poste, intervention, installation) ;
  - compte ORION : désactivation inchangée, puis anonymisation des données personnelles au-delà d’une durée de conservation à fixer avec le client (cadrage § 23) ;
  - données d’activité (processus, détections, journaux) : purge automatique selon une durée de conservation, inchangée ;
  - journal métier des opérations sensibles (retrait, réactivation, transfert d’école, changement de droits), consultable par le super administrateur ;
  - rédaction proposée pour RG-91 **[RG]**, à soumettre à l’utilisateur : « Retrait d’un matériel. Un matériel n’est pas supprimé mais retiré : son retrait enregistre la date, l’auteur et le motif (réformé, perdu, transféré ou erreur de saisie). Seul un matériel du stock peut être retiré. Un matériel retiré n’apparaît plus dans l’inventaire courant, reste consultable avec son historique et peut être réactivé. Seul un matériel créé par erreur et cité nulle part peut être supprimé définitivement. » ;
  - conséquences : MCD (`MATÉRIEL`), matrice, DCU 08, fiches 13, 15 et 16, code (`rules.ts`, inventaire) et données de départ.
- [ ] **Haute** — M42 conceptualisé et simulé, avec paquets d’installation et images Windows (décisions de l’utilisateur des 13 et 14 novembre ; l’agent n’est pas développé, il est conçu puis simulé par le simulateur des postes au travers de l’API réelle `/api/agent`) :
  - **Images Windows** : catalogue d’images fictives tenu par ORION (nom, version de Windows, liste des applications de base) ; M42 fait partie de chaque image et s’installe avec le système. Une réinitialisation applique l’image choisie par l’administrateur, au lieu de l’image unique imposée (`IMAGE_REFERENCE`). La vue des postes affiche en petit l’image installée (liste, fiche du poste, cartes de Supervision › Salles).
  - **Paquets d’installation** : chaque application du catalogue porte un paquet fictif (nom du fichier, version, commande d’installation silencieuse, empreinte SHA-256, éditeur signataire). Écran d’ajout, de modification et de retrait des applications (aujourd’hui absent : catalogue limité aux données de départ).
  - **Simulateur fidèle à l’agent** : vérification de l’empreinte avant installation, étapes d’intervention (téléchargement, installation, redémarrage, réenrôlement de l’agent après réinitialisation) avec durées réalistes, causes d’échec explicites (empreinte invalide, espace disque insuffisant).
  - **Conception de M42** : fiche interne (cycle de vie, enrôlement et identité du poste, protocole avec ORION, commandes, états, sécurité, mise à jour signée), cohérente avec l’option B du DAT (§ 6.5) ; proposition à soumettre au collègue du DAT.
  - **Conséquences documentaires** : glossaire (image, paquet, M42), règles de gestion **[RG]** (image choisie à la réinitialisation, paquet requis pour installer, agent installé avec le système), MCD (`IMAGE`, `PAQUET`), DCU 09, matrice, fiche 15, diagramme d’états des interventions.
  - **Code** : types partagés, `rules.ts` (contrôles d’image et de paquet), schéma PostgreSQL, données de départ (`SEED_VERSION`), simulateur, écrans Administration › Applications et Postes, Supervision ; tests et guide de l’application.
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
- [ ] **Haute** — Espace de production neuf : sans données de démonstration, il ne contient ni école ni compte, donc personne ne peut se connecter. Prévoir la création du premier super administrateur (commande d’amorçage ou variable dédiée) avant toute mise en production. (#159)

## 4. Sécurité

- [ ] **Haute** — Tester la sécurité de l’application, côté code et côté applicatif :
  - code : revue des contrôles d’accès de chaque route et de chaque règle serveur, analyse statique, audit des dépendances (`npm audit`) et des images ;
  - applicatif : tests d’intrusion sur l’application déployée (référentiel OWASP ASVS, outil de type OWASP ZAP), contournement des droits par profil et par école, falsification des valeurs d’autorité, jetons des postes et de RIGEL, relais public, en-têtes, TLS, sessions ;
  - consigner résultats et corrections ; signaler au collègue du DAT ce qui touche l’architecture.

| Sujet | Constat | Proposition | Portée |
| --- | --- | --- | --- |
| Limitation de débit | Aucune limite : création de sessions par `/auth/login`, `/api/health` coûteux, écritures jusqu’à 8 Mo | `stick-table` HAProxy par adresse IP (et par jeton pour l’API des postes), réponse 429 ; seuils à régler sur l’usage réel | Démonstrateur et cible |
| Rôle PostgreSQL | L’API se connecte en superutilisateur | Rôle applicatif propriétaire de la base `orion`, sans privilège de superutilisateur | Démonstrateur |
| Partage NFS | Exports en `no_root_squash`, `sec=sys`, sans chiffrement | `root_squash` après vérification des propriétaires des fichiers de chaque conteneur (PostgreSQL attribue ses fichiers au démarrage) | Démonstrateur |
| HAProxy | Filtrage de `/admin` par liste de refus, sans normalisation ; version TLS minimale implicite | Liste d’autorisation (`/realms/orion/`, `/resources/`) et `ssl-min-ver TLSv1.2` | Démonstrateur |
| En-têtes de l’interface | Seuls `frame-ancestors`, `object-src`, `base-uri`, `nosniff` et `Referrer-Policy` sont posés par Apache | Politique CSP complète (`script-src`, `style-src`) et HSTS, après essai de l’interface | Démonstrateur et cible |
| OpenLDAP | Image `osixia/openldap:1.5.0` non maintenue depuis 2021, sans TLS | Image maintenue, LDAP sur TLS | Démonstrateur |
| Image Apache | Processus maître lancé en root | Image ou configuration sans root | Démonstrateur |
| CI | Le runner auto-hébergé, sur orion-3, exécute tout push sur `main` | Protéger la branche `main` sur GitHub | Démonstrateur |
| Configuration de production | La valeur de développement de `DATABASE_URL` n’est pas explicitement refusée | Refuser `orion-local` en production, comme les autres secrets | Cible |
| Identité des postes | Jeton propre à chaque poste | Certificat client si le mécanisme d’administration des postes le permet | Cible |
| Relais RIGEL | Le relais sert le code de l’application mobile : un relais compromis pourrait lire la clé du fragment `#k=` | Décrire ce point dans le modèle de menace ; intégrité du code servi (signature ou empreinte) | Démonstrateur et cible |

Décidé de ne pas faire (utilisateur, 13 novembre) : filtrage réseau de la console Keycloak (8444) et de Logstash (6514), pare-feu des VM.

## 5. Documentation à remettre

### Priorité haute

- [ ] RIGEL dans le cadrage (§ 19 et § 23 : la ligne `02:400` « application de scan non intégrée » est fausse) ; les livrables (glossaire, RG-92 à RG-96, matrice, fiches 13, 15 et 16, DCU 08, MCD) ont été mis à jour le 14 novembre et restent à relire (#158).
- [x] Captures des fiches 13, 15 et 16 : les anciennes maquettes IHM sont supprimées ; les fiches reprennent les captures de l’application (`design/maquettes/captures/`, 14 novembre).
- [ ] Cadrage § 23 : il dit que la documentation suit le client (`02:391`, `:405`, `:406`), contrairement à la règle en vigueur (la documentation suit l’état actuel, l’écart est inscrit au § 23). En découlent RG-36 (filtre par salle du tableau de bord du parc) et RG-37 (fenêtre contextuelle des notifications) **[RG]**, la matrice (`12:48`) et la fiche 13 (`:141`), qui décrivent ce que l’application n’a pas.

### Contradictions à corriger

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
- [ ] « Liste blanche » et « liste noire » (glossaire, interface et fiches) : les RG (13 occurrences) et le DCU 10 disent encore whitelist et blacklist (renommage, sans nouvel accord s’il est demandé).
- [ ] Fiche 15 (`:94`) : « à replaquer » au lieu de « à réinitialiser ».

### Informations non répercutées

- [x] Installation physique des salles et notification « matériels à déplacer » du gestionnaire : décrites dans la fiche 13, RG-92, le glossaire et le DCU 08 (« Installer une salle », « Recenser le parc »).
- [ ] Journal applicatif (`backend/journal.ts`, événement `enregistrement` des écritures des utilisateurs) : absent du cadrage (§§ 18 et 21) et de la fiche 15 (« Journalisation éventuelle », UC-ADMIN-06).
- [ ] RG-56 : 30 jours de conservation des détections ; le code ne garde en plus que les 2 000 dernières **[RG]**.
- [ ] Cadrage § 19 : aucune décision RIGEL ni Hidora ; « déploiement proposé » (`02:340-341`) alors que le DAT le présente comme en place ; « émulateur » au lieu de « simulateur ».
- [ ] Glossaire : manquent Intervention, Compte ORION, Étape de remontée, Type de problème, C1NP et CCT ; `00:15` « aucune API d’intégration confirmée » alors que l’API des postes existe ; l’entrée LDAP ne sert que le démonstrateur.

### Modèle de données

- [ ] [MCD](../02-ANALYSE/02-CAPTURE-DES-BESOINS/05-MCD-MERISE.drawio) : relier `REMONTÉE` à `ÉCOLE` (le code l’impose, RG-79 en dépend) ; représenter l’installation physique (déplacement et installation, avec auteur et date) si elle est retenue ; ajouter les entités RIGEL.

### DCU à compléter

- [ ] [DCU 08 — Gestion du parc](../02-ANALYSE/02-CAPTURE-DES-BESOINS/08-DCU-GESTION-PARC.md) : import JSON avec rapprochement des numéros de série (lignes ignorées, transfert d’un matériel d’une autre école) ; changement d’école d’un matériel (installation et recensement ajoutés le 14 novembre).
- [ ] [DCU 09 — Administration des postes](../02-ANALYSE/02-CAPTURE-DES-BESOINS/09-DCU-ADMINISTRATION-POSTES.md) : « Gérer les postes supervisés et le catalogue des applications » (RG-77) ; suivre les interventions lancées et en être notifié à leur fin (RG-39).
- [ ] [DCU 10 — Supervision des postes](../02-ANALYSE/02-CAPTURE-DES-BESOINS/10-DCU-SUPERVISION-POSTES.md) : notification du lancement d’une application interdite à l’administrateur ; adresse IP du poste dans la liste des processus.
- [ ] Nouveau DCU « Administrer ORION » (ou extension du DCU 09) : comptes ORION (création, modification, désactivation, réactivation ; RG-70) et écoles (création, renommage ; RG-76), réservés aux administrateurs et au super administrateur.
- [ ] Préférences personnelles (ambiance d’affichage, tableaux de bord ajoutés par l’utilisateur) : décider si elles relèvent d’un DCU ou restent un détail d’interface.

### Cadrage : questions déjà résolues encore ouvertes

- [ ] Reporter en « Application : … », sans fermer la question côté client : identifiants (`02:76`, MCD), détection des applications par les postes (`02:128`), référentiel modifié par les administrateurs (`02:137`, RG-77), sous-ensemble de postes d’une salle, suivi par poste et échec partiel (`02:156-158`, RG-22 et RG-81), conservation de 30 jours (`02:178`, `02:201`, RG-56), remontée authentifiée (`02:227`, RG-62 et RG-85), tableaux de bord personnalisables (`02:255`, RG-84), refus de compléter un signalement par le formateur (§ 13), nom du projet ORION (`02:385`), rendez-vous du 12 novembre passé (`02:386`).

### Brouillons

- [x] Versions Word des fiches et du backlog retirées le 15 novembre : le Markdown fait foi (#144).

## 6. Dossier d’architecture : écarts à soumettre au collègue [DAT]

Le DAT validé fait foi ; ces écarts entre lui, la configuration réelle et ses schémas sont à lui soumettre. Le 14 novembre, l’utilisateur a fait corriger directement le DAT et les schémas pour les points cochés ci-dessous.

### DAT et configuration réelle

- [x] **Moyenne** — Secrets : « tous créés par le script de préparation », alors que `RIGEL_SECRET` et `RELAIS_TOKEN` sont créés par `deployer.sh` (le second peut venir du secret de la CI).
- [x] **Moyenne** — Données : « recréées au premier démarrage », alors que le service `api` des VM lance `outils/donnees-demonstration/charger.ts --reinitialiser` avant le serveur : les données sont remplacées à chaque déploiement qui change `SEED_VERSION` (`SEED_RESET` n’existe plus).
- [x] **Moyenne** — Migrations (`DAT:437`, « la procédure de migration reste à définir ») : le schéma évolue désormais par migrations versionnées appliquées au démarrage sous verrou consultatif (table `orion_migration`), sans réinitialisation ; le serveur n’embarque plus de données de démonstration. Configurations remises modifiées : `Dockerfile` (dossier `outils/` dans les images Node.js, simulateur lancé depuis `outils/simulateur-postes/agents.ts`) et `vm/pile.yaml` (commande du service `api`).
- Décidé de ne pas faire (utilisateur, 14 novembre) — SSH : le compte partagé `user`, `StrictHostKeyChecking=accept-new` et `sudo` par mot de passe sont la configuration des VM fournies, que l’équipe n’a pas le droit de modifier.
- [x] **Moyenne** — Filtrage : manquent `8080/TCP` vers le proxy depuis toutes les VM (images, paquets) et `443` d’orion-4 et orion-5 vers orion-1 (Express joint Keycloak par HAProxy).
- [ ] **Moyenne** — Données de démonstration dans les livrables : compte `keycloak-admin` et commande de lecture de son mot de passe (§ 4.5) ; `ldap/orion-utilisateurs.ldif` remis avec les comptes `@orion.demo` (§ 4.8) ; flux de connexion sans mot de passe intégré à l’image Keycloak des VM, qui rend optimiste « authentifie l’utilisateur à partir de l’annuaire » (`17:64`) ; voir aussi § 1, comptes réels pour la présentation.
- [x] **Basse** — Provisionnement des identités « hors production uniquement » (`17:94`) alors que les VM tournent en `NODE_ENV=production` avec `IDENTITY_PROVISIONING=true` (le DAT le dit lui-même en `17:257`).
- [x] **Basse** — Absents : client Keycloak `orion-provisionnement`, secrets `PROVISIONING_CLIENT_SECRET` et `ca`, images `connecteur` et `relais` du `Dockerfile`, dépendance `swagger-ui-express` 5.0.1.
- [ ] **Basse** — Versions : « HAProxy 3.2 » et « Apache 2.4 » au lieu des versions épinglées (§ 5.3). L’image Keycloak, image officielle avec une légère surcouche ORION, est voulue (utilisateur, 14 novembre).
- [ ] **Basse** — Logstash n’envoie pas ses propres logs au collecteur (« chaque conteneur… »).
- [ ] **Basse** — Chemins `/srv/orion/…`, `/var/lib/…`, `/run/secrets/…` cités hors de l’inventaire des configurations : à confirmer qu’ils sont admis (chemins sur les VM).

### Schémas d’architecture (générateur)

- [x] Les quatre vues sont redessinées le 14 novembre : rapports des postes par HAProxy (vue cible simplifiée) ; flux ajoutés (Express → Keycloak, Apache, OpenLDAP et Logstash, runner et connecteur par le proxy, proxy → GitHub) ; « Swarm · TCP 2377 » dans le groupe des managers ; images d’Express, du simulateur et du connecteur ; aucun croisement ni libellé sur une boîte ; « simulateur » au lieu d’« émulateur » ; titre et textes alternatifs du [document des diagrammes](../03-ARCHITECTURE/19-DIAGRAMMES-ARCHITECTURE.md). Le générateur se relance (`lucide-react` est resté une dépendance de l’application).
- [ ] **Basse** — Vue complète : les flux d’hôte (horloge exceptée), syslog vers Logstash et téléchargement des images par le proxy, sont indiqués en texte dans « Sur chaque VM » plutôt que par des flèches, faute de tracé sans croisement.

## 7. Feuille de route : évolutions du projet

Évolutions envisagées au-delà du périmètre en cours ; elles ne sont pas planifiées tant que l’utilisateur ne les ouvre pas.

- [ ] **Postes Linux** (idée de l’utilisateur du 13 novembre, reportée) :
  - chaque salle a un système, Windows ou Linux, commun à tous ses postes ; le parc compte davantage de salles sous Windows ;
  - images Linux fictives et déclinaison Linux de M42 installée avec le système ; une réinitialisation applique une image du même système que la salle ;
  - un paquet par système pris en charge ; une application ne s’installe que sur une salle dont le système a un paquet ;
  - la vue des postes affiche le système en petit (liste, fiche du poste, cartes de Supervision › Salles) ;
  - écart à signaler avant ouverture : le sujet, le client et le DAT ne parlent que de postes Windows (cadrage § 23, collègue du DAT) ;
  - conséquences : glossaire, règles de gestion **[RG]** (système commun à la salle, image du même système, paquet requis), MCD (`SYSTÈME` ou attribut de `SALLE`), DCU 09, matrice, code et données de départ.

## 8. Historique conservé tel quel

- Le commit `3ad50a6` (dépendances npm) contient aussi les renommages de `schemas-architecture` et `serve` ; leur contenu est dans `b9151ee`.
- Le registre des archives et les copies de l’ancien design conservent l’ancien nom du projet dans les versions antérieures au renommage.

## 9. Fait récemment

- [x] Règles de gestion mises à jour avec l’accord de l’utilisateur (13 novembre) : RG-13, RG-15, RG-21, RG-39, RG-40, RG-64, RG-66 et RG-72 réécrites, RG-87 à RG-91 ajoutées ; glossaire, matrice, fiches, DCU 11, cadrage et diagramme d’états alignés ; application conforme (traitement par le seul gestionnaire, prise en charge obligatoire, suppression depuis le stock).
- [x] [MCD](../02-ANALYSE/02-CAPTURE-DES-BESOINS/05-MCD-MERISE.svg) refait avec draw.io : étapes de la remontée, poste constitué de son unité centrale, adresse IP du poste, adresse MAC du matériel, dates du compte, `COMPTE_ORION` et `DÉMÉNAGER`.
- [x] Secret Swarm `PROVISIONING_CLIENT_SECRET` créé par `installer.sh` sur les VM déjà installées.
- [x] Fusion de `main` : DAT de référence et module RIGEL.
