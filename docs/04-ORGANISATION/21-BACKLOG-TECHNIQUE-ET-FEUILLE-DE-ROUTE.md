# Backlog technique et feuille de route

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 4.4 | 14/11/2026 | Pilotage interne | RIGEL : installation d’une salle, recensement, appairage et traitement des écarts (RG-92 à RG-95) | [14 versions](../../archive/README.md#21-backlog-technique-et-feuille-de-route) |
<!-- version:fin -->

Document de pilotage interne, tenu à chaque itération. Il complète le [backlog et suivi du projet](20-BACKLOG-ET-SUIVI-PROJET.md), qui organise les tâches de l’équipe et leurs cérémonies Scrum : il recense le travail technique restant (corrections, dette, sécurité, documentation, écarts à soumettre), classé par échéance et par domaine, puis la feuille de route des évolutions du projet. Les décisions et questions ouvertes font foi dans le [cadrage](../01-CONTEXTE/02-CADRAGE.md) ; ce document n’en suit que la réalisation. Il n’est pas remis comme livrable : il cite des éléments propres au démonstrateur.

Repères : priorité **haute**, **moyenne** ou **basse** ; **[RG]** la correction crée ou modifie une règle de gestion et exige l’accord préalable de l’utilisateur ; **[PROT]** document protégé, modifié seulement sur demande ; **[DAT]** le dossier d’architecture fait foi et n’est modifié que par le collègue qui le tient.

## 1. Échéances

### Lundi 16 novembre

- [ ] Diagrammes [06](../02-ANALYSE/01-MODELISATION-METIER/06-DIAGRAMME-CONTEXTE.md) et [07](../02-ANALYSE/01-MODELISATION-METIER/07-DIAGRAMMES-ACTIVITE.md) **[PROT]** : des collègues les ont modifiés sans publier leur travail ; faire le point avec eux, puis vérifier le super administrateur, l’authentification par MindefConnect, le téléphone de recensement (RIGEL), le PDF produit à la demande (pas à la création), le traitement des remontées par le seul gestionnaire et l’absence de filtre par salle du tableau de bord. M42 reste une option candidate tant que la solution d’administration n’est pas retenue.

### Avant le prochain déploiement sur les VM

- [ ] Prévoir la réinitialisation des données de démonstration : `SEED_VERSION` vaut 17 et `SEED_RESET=true` sur les VM ; les données sont recréées à ce déploiement.
- [ ] Vérifier après déploiement : connexion des quatre profils, création d’un compte, rapports des postes simulés, recensement RIGEL, `https://172.16.131.188/api/infos` (version servie).

### Avant le rendu de l’application (mardi 17 novembre)

- [ ] **Haute** — Remplacer les utilisateurs de test des jetons « Accès de présentation » par de vrais comptes : adresse électronique d’identification et mot de passe dans l’annuaire, connexion par le formulaire habituel (le flux sans mot de passe du Keycloak local est alors retiré de l’image des VM). Les mots de passe ne sont jamais versionnés : secrets Swarm ou saisie au déploiement ; les adresses `@orion.demo` disparaissent du fichier LDIF remis avec le DAT.
- [ ] **Haute** — Créer un scénario complet de l’application : parcours de bout en bout par profil (connexion, parc, salles, recensement RIGEL, remontée de sa création à sa fin, supervision, intervention sur les postes, notifications, administration), avec données de départ adaptées et résultat attendu à chaque étape ; il sert de fil de la présentation et de test de recette.

### Avant la présentation (supports prêts le mercredi 18 novembre ; présentation le jeudi 19 novembre, horaire non fixé)

- [ ] Préparer le support et répartir les passages ; répéter la présentation le 18 novembre.

### Après la présentation

- [ ] Retirer les jetons « Accès de présentation » de la page de connexion du Keycloak local : variable `ORION_COMPTES_PRESENTATION` (Compose, pile des VM) et bloc du thème `orion-mindef` (gabarit, styles, script).

## 2. Pilotage du projet

- [x] **Haute** — Traiter le backlog GitHub (14 novembre : projet « ORION development », 152 tickets sur deux sprints) : trier, mettre à jour et clore les éléments au regard de l’état actuel, puis reporter le résultat dans le [backlog](20-BACKLOG-ET-SUIVI-PROJET.md). Les noms GitHub gardent l’ancien nom (dépôt `bpierrelouis/aster`, projet « aster development ») ; les commits `09ac7b0` et `cecf0d7` et la référence `0762961…` du brouillon de suivi n’existent plus dans l’historique.
- [ ] Cadrage § 22 : dater le prochain rendez-vous ; consigner le sort des propositions préparées pour le 12 novembre (application de scan, devenue RIGEL, et livraisons) quand un retour existera.

## 3. Application

### Corrections relevées par l’audit du 13 novembre

- [ ] **Moyenne** — Une remontée peut viser une salle d’une autre école : le serveur ne contrôle pas `salleId` (`backend/workspace/rules.ts`, création des remontées) ; le PDF affiche alors la salle de l’autre école.
- [ ] **Moyenne** — Le formateur trouve par la recherche globale tous les matériels de son école, stock compris (`shell-menus.tsx`, `can('materiel.view')`), contrairement à la matrice (consultation depuis la salle seulement).
- [ ] **Moyenne** — Test instable `workspace-ui.spec.ts` « deux ambiances… » : il ne rétablit pas les préférences (ambiance Minarm) et fait alors échouer « la palette Orion… » ; rétablir dans un `finally` ou un `beforeEach`.
- [ ] **Moyenne** — Relais RIGEL : aucun plafond du nombre d’événements non acquittés par campagne ; un téléphone appairé ou un jeton divulgué peut remplir la base jusqu’à l’expiration.
- [ ] **Basse** — `GET /api/workspace/postes/:id/jeton` absent de l’OpenAPI (`backend/openapi.ts`).
- [ ] **Basse** — Postes : normaliser `nomReseau` en majuscules côté serveur (un poste en minuscules ne serait pas reconnu par ses rapports) et contrôler `materielId` (unité centrale de la même école).
- [ ] **Basse** — Catalogue des applications : refuser la suppression d’une application encore référencée par des installations ou des interventions.
- [ ] **Basse** — Factoriser la comparaison à temps constant (`routes.ts` et `relais.ts`) et le contrôle « seul ce champ est modifiable » (`rules.ts`, `recensement.ts`).
- [ ] **Basse** — Guide de l’application : `Dockerfile` construit six images (ajouter relais et connecteur) ; arborescence sans `frontend/rigel/` ni `vite.rigel.config.ts` ; scripts `start:relais` et `dev:backend` absents ; la ligne « tous les secrets créés par `installer.sh` » contredit la section RIGEL (secrets créés au déploiement) et attribue le runner à `installer.sh` au lieu de `runner.sh` ; la section Keycloak réserve à tort le flux sans mot de passe à Compose ; périmètre des configurations remises avec le DAT plus large que le tableau « Déploiement sur les VM » (`Dockerfile`, `images/`, `rigel/`, `ldap/`).
- [ ] **Basse** — Configuration Keycloak : le mapper `orion-roles` subsiste alors que les rôles Keycloak ne sont pas lus.

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
- [ ] **Haute** — Aligner RIGEL sur RG-92 à RG-95 (décision de l’utilisateur du 14 novembre) ; l’application a aujourd’hui une seule « campagne » ouverte dans ORION :
  - séparer l’installation d’une salle (réalise les déplacements prévus dans ORION, relocalise) et le recensement (lancé depuis RIGEL, vérifie sans déplacer) ;
  - réserver la réalisation avec RIGEL et le traitement des constats au gestionnaire (l’administrateur et le super administrateur prévoient seulement les déplacements) ;
  - traiter un écart dans ORION en guidant l’action : remettre au stock, ramener dans la salle d’affectation ou réaffecter à la salle constatée ;
  - mettre à jour les fiches descriptives, les DCU et le MCD (installation, recensement, constat).
- [ ] Jeton d’un poste : seule l’API `GET /api/workspace/postes/:id/jeton` permet de l’obtenir ; prévoir l’action dans Administration › Postes. Renouveler `AGENT_TOKEN` révoque tous les jetons à la fois : prévoir une révocation poste par poste si le besoin apparaît.
- [ ] Adresse MAC du matériel : présente dans le MCD, absente du code ; à reprendre avec le collègue qui l’ajoute (scanner de matrice).
- [ ] Import JSON : le transfert d’un matériel hors service vers une salle d’une autre école est bloqué (conséquence de RG-87) ; à confirmer par l’utilisateur.
- [ ] Tests : ajouter un test du détail de `/api/health` et `/api/infos` réservé au super administrateur.
- [ ] Mode développement : un gros corps refusé tôt par le serveur fait parfois échouer le proxy de Vite (502) ; sans effet derrière HAProxy.

### Organisation du code : démonstrateur et espace de travail

Reportée après l’intégration de RIGEL (décision de l’utilisateur du 13 novembre). `workspace` (`backend/workspace/`, `frontend/src/workspace/`) désigne l’espace de travail, c’est-à-dire toute l’application après connexion, et non la production. `backend/demonstrateur/` regroupe l’outillage propre à la démonstration : simulateur des postes, création des identités dans le Keycloak local. Production et recette se distinguent par la configuration (`NODE_ENV`, `IDENTITY_PROVISIONING`, `SEED_RESET`). Trois couplages font entrer la démonstration dans le code de production :

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

- [ ] 1. Déplacer `backend/demonstrateur/` vers `outils/` sans changer le code ; mettre à jour imports, scripts npm, cible `postes` du `Dockerfile` et guide de l’application.
- [ ] 2. Sortir le jeu de départ : `initialState` ne crée que les référentiels ; `outils/donnees-demonstration` charge les données par une commande (`npm run donnees:demo`) appelée par le mode interface seule et par le déploiement du démonstrateur. `SEED_VERSION` et `SEED_RESET` deviennent des options de cette commande.
- [ ] 3. Charger la création des identités seulement quand `IDENTITY_PROVISIONING=true` (import dynamique), pour qu’elle soit absente du serveur de production.
- [ ] 4. Remplacer la création du schéma au démarrage par des migrations versionnées (`backend/persistance/migrations/`), pour faire évoluer une base de production sans réinitialisation.
- [ ] 5. Découper `rules.ts` par domaine dans `backend/domaine/` et renommer `workspace` en `espace` (back et front), en dernier : changement le plus large, purement structurel.
- [ ] 6. Mettre à jour `AGENTS.md` (chemins cités) et le guide de l’application ; signaler au collègue du DAT les chemins de l’inventaire des configurations remises.

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

- [ ] RIGEL absent de tous les livrables : glossaire (campagne, constat, appairage, relais, connecteur), règles de gestion **[RG]** (gestionnaire, administrateur et super administrateur ouvrent, clôturent, appairent et traitent les constats ; formateur exclu ; campagne de 14 jours, close sans être supprimée ; constat conservé), DCU (recensement mobile, rattaché au DCU 08 ou nouveau), matrice, fiches 13, 15 et 16, MCD (`RECENSEMENT`, `CONSTAT`), backlog et cadrage (§ 19 et § 23 : la ligne `02:400` « application de scan non intégrée » est fausse).
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
- [ ] Dates de dernière connexion et de désactivation du compte : absentes de la fiche 15 (UC-ADMIN-06) et du cadrage § 18.
- [ ] « Liste blanche » et « liste noire » (glossaire et interface) : les RG (13 occurrences), le DCU 10 et les fiches disent encore whitelist et blacklist (renommage, sans nouvel accord s’il est demandé).
- [ ] Fiche 15 (`:94`) : « à replaquer » au lieu de « à réinitialiser ».

### Informations non répercutées

- [ ] Installation physique des salles et notification « matériels à déplacer » du gestionnaire : absentes du glossaire, des RG **[RG]**, de la matrice, de la fiche 13 et du DCU 08 (ouvertes avec le client au § 23, mais la documentation doit suivre l’état actuel).
- [ ] Journal applicatif (`backend/journal.ts`, événement `enregistrement` des écritures des utilisateurs) : absent du cadrage (§§ 18 et 21) et de la fiche 15 (« Journalisation éventuelle », UC-ADMIN-06).
- [ ] RG-56 : 30 jours de conservation des détections ; le code ne garde en plus que les 2 000 dernières **[RG]**.
- [ ] Cadrage § 19 : aucune décision RIGEL ni Hidora ; « déploiement proposé » (`02:340-341`) alors que le DAT le présente comme en place ; « émulateur » au lieu de « simulateur ».
- [ ] Glossaire : manquent Intervention, Compte ORION, Étape de remontée, Type de problème, C1NP et CCT ; `00:15` « aucune API d’intégration confirmée » alors que l’API des postes existe ; l’entrée LDAP ne sert que le démonstrateur.

### Modèle de données

- [ ] [MCD](../02-ANALYSE/02-CAPTURE-DES-BESOINS/05-MCD-MERISE.drawio) : relier `REMONTÉE` à `ÉCOLE` (le code l’impose, RG-79 en dépend) ; représenter l’installation physique (déplacement et installation, avec auteur et date) si elle est retenue ; ajouter les entités RIGEL.

### DCU à compléter

- [ ] [DCU 08 — Gestion du parc](../02-ANALYSE/02-CAPTURE-DES-BESOINS/08-DCU-GESTION-PARC.md) : import JSON avec rapprochement des numéros de série (lignes ignorées, transfert d’un matériel d’une autre école) ; changement d’école d’un matériel ; installation physique des salles si elle est retenue ; recensement RIGEL.
- [ ] [DCU 09 — Administration des postes](../02-ANALYSE/02-CAPTURE-DES-BESOINS/09-DCU-ADMINISTRATION-POSTES.md) : « Gérer les postes supervisés et le catalogue des applications » (RG-77) ; suivre les interventions lancées et en être notifié à leur fin (RG-39).
- [ ] [DCU 10 — Supervision des postes](../02-ANALYSE/02-CAPTURE-DES-BESOINS/10-DCU-SUPERVISION-POSTES.md) : notification du lancement d’une application interdite à l’administrateur ; adresse IP du poste dans la liste des processus.
- [ ] Nouveau DCU « Administrer ORION » (ou extension du DCU 09) : comptes ORION (création, modification, désactivation, réactivation ; RG-70) et écoles (création, renommage ; RG-76), réservés aux administrateurs et au super administrateur.
- [ ] Préférences personnelles (ambiance d’affichage, tableaux de bord ajoutés par l’utilisateur) : décider si elles relèvent d’un DCU ou restent un détail d’interface.

### Cadrage : questions déjà résolues encore ouvertes

- [ ] Reporter en « Application : … », sans fermer la question côté client : identifiants (`02:76`, MCD), détection des applications par les postes (`02:128`), référentiel modifié par les administrateurs (`02:137`, RG-77), sous-ensemble de postes d’une salle, suivi par poste et échec partiel (`02:156-158`, RG-22 et RG-81), conservation de 30 jours (`02:178`, `02:201`, RG-56), remontée authentifiée (`02:227`, RG-62 et RG-85), tableaux de bord personnalisables (`02:255`, RG-84), refus de compléter un signalement par le formateur (§ 13), nom du projet ORION (`02:385`), rendez-vous du 12 novembre passé (`02:386`).

### Brouillons

- [ ] `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/FICHE-DESCRIPTIVE-*-BROUILLON-V2.docx` : 24 à 50 occurrences d’ASTER ; ils ne sont pas suivis dans le registre, comme les images de brouillon de `02-CAPTURE-DES-BESOINS/assets/` ; les mettre à jour ou les retirer.

## 6. Dossier d’architecture : écarts à soumettre au collègue [DAT]

Le DAT validé fait foi ; ces écarts entre lui, la configuration réelle et ses schémas sont à lui soumettre, sans modifier le DAT.

### DAT et configuration réelle

- [ ] **Moyenne** — Secrets : « tous créés par le script de préparation », alors que `RIGEL_SECRET` et `RELAIS_TOKEN` sont créés par `deployer.sh` (le second peut venir du secret de la CI).
- [ ] **Moyenne** — Données : « recréées au premier démarrage », alors que `SEED_RESET=true` efface les données à chaque déploiement qui change `SEED_VERSION`.
- [ ] **Moyenne** — SSH : comptes nominatifs et vérification des clés d’hôte prescrits ; la configuration utilise le compte partagé `user`, `StrictHostKeyChecking=accept-new` et `sudo` par mot de passe ; recommandation non appliquée ou configuration à changer.
- [ ] **Moyenne** — Filtrage : manquent `8080/TCP` vers le proxy depuis toutes les VM (images, paquets) et `443` d’orion-4 et orion-5 vers orion-1 (Express joint Keycloak par HAProxy).
- [ ] **Moyenne** — Données de démonstration dans les livrables : compte `keycloak-admin` et commande de lecture de son mot de passe (§ 4.5) ; `ldap/orion-utilisateurs.ldif` remis avec les comptes `@orion.demo` (§ 4.8) ; flux de connexion sans mot de passe intégré à l’image Keycloak des VM, qui rend optimiste « authentifie l’utilisateur à partir de l’annuaire » (`17:64`) ; voir aussi § 1, comptes réels pour la présentation.
- [ ] **Basse** — Provisionnement des identités « hors production uniquement » (`17:94`) alors que les VM tournent en `NODE_ENV=production` avec `IDENTITY_PROVISIONING=true` (le DAT le dit lui-même en `17:257`).
- [ ] **Basse** — Absents : client Keycloak `orion-provisionnement`, secrets `PROVISIONING_CLIENT_SECRET` et `ca`, images `connecteur` et `relais` du `Dockerfile`, dépendance `swagger-ui-express` 5.0.1.
- [ ] **Basse** — Versions et images : « HAProxy 3.2 » et « Apache 2.4 » au lieu des versions épinglées ; Keycloak présenté comme image officielle alors que c’est une image ORION construite sur `quay.io/keycloak/keycloak:26.7.4`.
- [ ] **Basse** — Logstash n’envoie pas ses propres logs au collecteur (« chaque conteneur… »).
- [ ] **Basse** — Chemins `/srv/orion/…`, `/var/lib/…`, `/run/secrets/…` cités hors de l’inventaire des configurations : à confirmer qu’ils sont admis (chemins sur les VM).

### Schémas d’architecture (générateur)

- [ ] **Moyenne** — Vue cible simplifiée : les rapports des postes Windows vont directement à Express, contrairement au flux 10B (par HAProxy) du DAT.
- [ ] **Moyenne** — Vue complète : flux réels absents (Express → Keycloak pour le provisionnement, sondes de `/api/health` vers Apache, LDAP et Logstash, téléchargement des images par le proxy) ; le runner contourne la boîte du proxy ; flèche Connecteur → Express sans libellé « HTTP 3001 » ; « Swarm 2377/TCP » placé dans la boîte HAProxy.
- [ ] **Moyenne** — Tracé : croisements et libellés sur des boîtes dans les quatre vues (Connecteur → Express, flèche 5 sur un titre de zone, libellés 7, 10A et 14 de la vue cible détaillée, flèche de 16 px dans la vue cible simplifiée, textes qui débordent).
- [ ] **Basse** — Termes « émulateur » et « émulation » au lieu de « simulateur des postes et de leur agent d’administration » ; images d’Express, du simulateur et du connecteur non indiquées.
- [ ] **Basse** — [Diagrammes d’architecture](../03-ARCHITECTURE/19-DIAGRAMMES-ARCHITECTURE.md) : titre « Architecture réelle du démonstrateur » alors qu’il contient la cible ; textes alternatifs « déploiement proposé ».
- [ ] **Basse** — Le générateur ne se relance plus : il utilise `lucide-react`, retiré de l’application le 13 novembre (inutilisé par l’interface) ; le réinstaller en dépendance de développement ou copier les icônes nécessaires.

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
