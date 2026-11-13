# Dossier d’architecture technique (DAT) — ORION


**Date de référence :** 13 novembre 2026

**Périmètre :** contexte et contraintes, justification des briques, démonstrateur local et architecture de son déploiement sur VM, versions des technologies, architecture cible.

## 1. Objet du document

ORION est une application web destinée aux écoles de formation. Elle centralise la gestion du parc, les remontées utilisateur, la supervision des postes Windows et les demandes d’intervention à distance.

Le client a demandé un dossier d’architecture technique (entretien du 23 octobre, § 1.6). Ce dossier présente deux architectures :

- **l’architecture cible**, qui décrit le système attendu dans son environnement d’exploitation ;
- **l’architecture réelle**, qui correspond au système effectivement développé, conteneurisé et présenté par l’équipe.

L’architecture réelle décrit le montage local exécuté aujourd’hui et son déploiement proposé sur dix VM. Keycloak tient lieu de MindefConnect et un processus Node.js émule les postes Windows. Le montage local actuel fédère les identités dans OpenLDAP.

## 2. Contexte et contraintes structurantes

Les décisions en vigueur imposent ou orientent les éléments suivants :

- l’interface et les fonctions métier sont réparties entre un serveur front et un serveur back ;
- l’application, non protégée (NP), est hébergée sur le C1NP (cloud maîtrisé non protégé du ministère des Armées) ;
- les utilisateurs s’authentifient avec MindefConnect, hébergé sur le C1NP ;
- le serveur front expose l’interface en HTTPS et transmet, comme reverse proxy, les requêtes `/api` et `/auth` au serveur back ;
- le système dispose d’un puits de logs et expose les points d’accès `/api/health` et `/api/info` ;
- PostgreSQL conserve les données applicatives ;
- les PDF d’état des lieux sont produits à la demande par le serveur back et ne sont pas conservés ;
- les postes administrés utilisent Windows et le navigateur attendu est Firefox ;
- JavaScript est le langage préféré pour la réalisation ;
- l’environnement est un réseau interne NP disposant d’un accès à Internet ;
- la solution d’administration des postes Windows reste à déterminer.

| Besoin ou contrainte | Architecture cible | Architecture réelle | Écart ou transition |
| --- | --- | --- | --- |
| Hébergement | C1NP | Poste de présentation : processus Node.js et Docker Compose | Définir le déploiement sur le C1NP |
| Interface web et point d’entrée | Serveur front distinct, reverse proxy HTTPS vers le back | React servi par Vite, dont le proxy transmet `/api` et `/auth` à Express | En mode production, le serveur Express sert lui-même les artefacts construits ; le serveur front et son reverse proxy HTTPS restent à mettre en place |
| Fonctions métier et autorité | Serveur back distinct | Node.js et Express | Le back applique déjà les règles et fixe les valeurs d’autorité |
| Authentification | MindefConnect | Keycloak local et annuaire OpenLDAP, en OIDC | Obtenir et qualifier le contrat MindefConnect |
| Profils et droits | Comptes ORION dans PostgreSQL | Même principe dans la base ORION | Le fournisseur d’identité authentifie uniquement ; il ne fournit pas les profils applicatifs |
| Données métier et sessions | PostgreSQL | Conteneur PostgreSQL ORION | Définir l’offre, les sauvegardes et la disponibilité sur le C1NP |
| PDF d’état des lieux | Produit par le serveur back à chaque demande, après contrôle des droits, sans stockage | Express produit le PDF à chaque demande, avec les informations actuelles de la remontée | Aucun |
| Administration Windows | Outil ou agent autorisé à déterminer | Émulateur de postes utilisant l’API réelle | Sélectionner puis intégrer la solution d’administration |
| Points d’accès techniques | Santé et informations techniques, réservées à l’exploitation | `/api/health` et `/api/infos` | Harmoniser le nom retenu pour les informations et filtrer les accès |
| Logs | Puits de logs | Sortie standard des processus | Raccorder les logs au puits de logs |
| Exposition réseau | HTTPS, DNS et filtrage du C1NP | Services HTTP limités à la boucle locale | Définir DNS, certificats, zones et filtrage |

## 3. Justification des briques

| Besoin | Brique cible | Brique réelle | Justification | Limite actuelle |
| --- | --- | --- | --- | --- |
| Interface interactive | Serveur front compatible Firefox | React, React DOM, React Router et Vite | Une application web évite toute installation sur les postes utilisateurs ; React structure les écrans et React Router donne une adresse à chaque vue | Vite est le serveur de développement, pas une décision d’hébergement |
| Règles et API | Serveur back JavaScript | Node.js et Express | Centralise droits, règles métier, identifiants, dates, historique et accès aux services ; le navigateur n’est jamais une autorité | Dimensionnement non défini |
| Identité | MindefConnect | Keycloak et `openid-client` en OIDC | Sépare l’authentification des comptes et profils ORION ; le flux Authorization Code utilise PKCE, `state` et `nonce` ; changer de fournisseur ne demande qu’un changement de configuration | Contrat MindefConnect non disponible |
| Annuaire des identités | Interne à MindefConnect | OpenLDAP fédéré par Keycloak | Porte uniquement l’identité (identifiant, nom, adresse) ; aucun profil ni école n’y est stocké | Composant strictement local |
| Sessions | Stockage serveur partagé | `express-session` et `connect-pg-simple` dans PostgreSQL ORION | Le navigateur ne reçoit qu’un cookie HttpOnly ; la session peut être invalidée côté serveur | Durée et purge cibles à fixer |
| Données structurées | PostgreSQL | PostgreSQL dans un conteneur dédié | Choix du projet ; transactions, contraintes et persistance centralisée | Sauvegarde, réplication et dimensionnement non définis |
| Documents PDF | Production à la demande par le serveur back | Module d’Express, sans dépendance externe | Le document reprend toujours les informations actuelles de la remontée ; aucun fichier n’est conservé ni exposé, et le back contrôle la session et le périmètre du compte avant de le produire | Modèle officiel, signature et numérotation non définis |
| Postes Windows | Solution d’administration ou agent autorisé | Émulateur de postes | Le poste reste l’origine des processus, installations et résultats ; toutes les opérations passent par l’API du back | Ne prouve ni l’exécution, ni l’enrôlement, ni la mise à jour sur Windows |
| Conteneurisation | Mode de déploiement sur le C1NP à déterminer | Docker Compose : trois conteneurs et trois volumes | Services reproductibles, persistances séparées, aucune installation manuelle | Conteneurs non confirmés pour la cible |
| Sécurité HTTP | HTTPS terminé par le reverse proxy du serveur front, filtrage | Helmet, écoute sur la boucle locale ; en mode production, HTTPS, cookies sécurisés et secrets dédiés exigés au démarrage | Réduit l’exposition et refuse une configuration de production incomplète | Aucun reverse proxy HTTPS déployé |

Pour le déploiement sur VM, le démonstrateur n’utilise que des produits présents dans la colonne C1NP du cadre de cohérence technique (CCT 2026-2027, version 3.7), avec les exceptions de réalisation détaillées au § 4.5. Le CCT recommande HAProxy pour le reverse proxy et la répartition de charge, et Apache HTTP Server pour servir les fichiers ; NGINX doit être justifié par rapport à Apache. Apache sert le build React et renvoie `index.html` pour les routes de l’interface. Express, recommandé par le CCT pour les back-ends Node.js, reste le serveur de l’API métier.

## 4. Architecture réelle

### 4.1. Vue d’ensemble

Le [schéma de l’architecture réelle sur VM](18-DIAGRAMMES-ARCHITECTURE.md#architecture-réelle-sur-vm) présente le déploiement à mettre en place pour le démonstrateur. Le [montage local actuel](../application/README.md) tourne sur un poste de développement. Docker Engine et Docker Compose exécutent PostgreSQL, Keycloak et OpenLDAP sur cet hôte. Concurrently lance Vite, Express et l’émulateur dans trois processus distincts.

Le navigateur ne contacte jamais PostgreSQL. Pour obtenir un PDF d’état des lieux, il appelle une route authentifiée d’Express (`GET /api/workspace/reports/{id}/pdf`). Le back contrôle la session et le périmètre du compte, produit le document avec les informations actuelles de la remontée et le renvoie dans sa réponse. Aucun exemplaire n’est conservé : chaque demande produit un nouveau document.

### 4.2. Services, accès et persistance

| Service | Adresse ou réseau | Persistance | Responsabilité |
| --- | --- | --- | --- |
| Vite | `http://localhost:5173` | aucune | Interface et proxy `/api` et `/auth` |
| Express | `http://localhost:3001` | aucune dans le processus | OIDC, API métier, règles, API des postes, accès aux données et production des PDF d’état des lieux |
| Keycloak | `http://localhost:8081` | aucune : configuration réimportée au démarrage | Fournisseur d’identité local |
| OpenLDAP | réseau Compose uniquement | volumes `ldap-data` et `ldap-config` | Identités : identifiant, nom et adresse électronique |
| PostgreSQL ORION | `localhost:5432` | volume `postgres-data` | Base `orion` : données métier et sessions |
| Émulateur de postes | processus Node.js local | aucune | Rapports, réception des interventions et retour des résultats |

Les ports publiés le sont uniquement sur `127.0.0.1`. L’annuaire OpenLDAP ne publie aucun port sur l’hôte.

### 4.3. Authentification

Le fonctionnement général de Keycloak est présenté en [annexe A](#annexe-a--fonctionnement-de-keycloak). Cette section décrit son utilisation dans ORION.

#### Rôle

Keycloak tient lieu de MindefConnect pour exercer le parcours de connexion OIDC d’ORION ; il n’est pas le fournisseur d’identité de la cible. Il authentifie l’utilisateur à partir de l’annuaire OpenLDAP et transmet le sujet (`sub`) et l’adresse électronique. ORION conserve les comptes, profils, écoles de rattachement et états actifs dans sa propre base ; le realm ne définit aucun rôle.

#### Déploiement

Docker Compose démarre Keycloak 26.7.4 en mode `start-dev` et importe le realm `orion`, son client `orion-web` et la fédération LDAP à chaque création du conteneur. Keycloak utilise sa base embarquée H2 (`dev-file`), sans volume persistant pour celle-ci : ses données internes et sessions sont perdues à la recréation du conteneur. Aucun paramètre ne le raccorde à PostgreSQL ORION. Seuls le realm et le thème sont montés en lecture seule depuis le dépôt. Les identités sont conservées dans l’annuaire OpenLDAP, initialisé au premier démarrage, non publié sur l’hôte. La fédération est en écriture : une identité créée par Keycloak est enregistrée dans l’annuaire.

Le realm permet la connexion par adresse électronique, sans inscription ni réinitialisation de mot de passe.

#### Client OIDC

| Paramètre | Valeur |
| --- | --- |
| Client | `orion-web`, confidentiel |
| Flux | Authorization Code avec PKCE `S256` ; flux implicite et mot de passe direct désactivés |
| Portées | `openid`, `profile`, `email` |
| Adresse de retour | `/auth/callback` de l’interface ORION |

#### Parcours de connexion

1. Le navigateur demande `/auth/login` à Express via le proxy Vite.
2. Express découvre les métadonnées OIDC du fournisseur, crée un `state`, un `nonce` et un vérificateur PKCE, les conserve dans la session serveur et redirige le navigateur vers le fournisseur.
3. Le fournisseur authentifie l’utilisateur et redirige le navigateur vers le callback ORION avec un code d’autorisation.
4. Express échange le code et vérifie le `state`, le `nonce`, PKCE et le jeton d’identité.
5. ORION rapproche l’identité d’un compte ORION par son sujet, sinon par son adresse, exige que ce compte soit actif et enregistre le sujet si nécessaire. Une identité sans compte ORION actif n’accède pas à l’application.
6. Express renouvelle l’identifiant de session, conserve la session dans PostgreSQL ORION et remet au navigateur un cookie de session `HttpOnly`. Chaque requête relit le compte ORION pour déterminer le profil et les droits.

La session ORION expire au plus tard à l’expiration du jeton d’identité ou après une heure. À la déconnexion, Express détruit la session ORION, puis redirige le navigateur vers la fin de session OIDC du fournisseur.

#### Cycle de vie des identités

Hors production uniquement, le serveur ORION crée dans Keycloak, au démarrage et après chaque modification des comptes, l’identité des comptes ORION actifs qui n’en ont pas ; Keycloak l’enregistre dans l’annuaire. Ce provisionnement est désactivé en production, où les identités existent chez MindefConnect. Il ne crée ni compte ORION ni droit. Les changements de profil, d’école ou d’état actif sont portés par le compte ORION ; une désactivation ferme les sessions ORION en cours.

#### Disponibilité et limites

Le point d’accès `/api/health` vérifie la base ORION et les métadonnées du fournisseur d’identité ; si l’un ne répond pas, il renvoie un état indisponible. Une panne du fournisseur empêche les nouvelles connexions, même si les données métier restent disponibles.

Le montage local conserve les données dans des volumes Docker. Les reprises automatiques et la collecte des logs techniques relèvent de la proposition de déploiement des §§ 4.5 et 4.6 ; aucune sauvegarde n’est prévue pour la démonstration.

### 4.4. Flux des données et des postes en local

- Le front appelle Express ; Express applique les droits puis écrit dans PostgreSQL ORION.
- À la demande d’un état des lieux, Express vérifie les droits, produit le PDF à partir des données actuelles et le renvoie au navigateur, sans le conserver.
- L’émulateur publie les processus et applications installées sur `/api/agent/rapports`.
- Express renvoie dans cette réponse les interventions à exécuter.
- L’émulateur publie ensuite leur résultat sur `/api/agent/resultats`.

### 4.5. Architecture réelle sur VM

Deux schémas décrivent le déploiement du démonstrateur : la [vue simplifiée](18-DIAGRAMMES-ARCHITECTURE.md#vue-simplifiée) présente les rôles et les échanges principaux ; la [vue complète](18-DIAGRAMMES-ARCHITECTURE.md#architecture-réelle-sur-vm) détaille chaque VM, ses services, conteneurs, ports, volumes et flux. Une flèche indique la destination d’un flux. Les versions et leur statut au CCT figurent au § 5.3.

**Principes retenus.**

- **Un rôle par VM.** Chaque rôle a ses propres VM : une panne ou une intervention sur l’un ne touche pas les autres. Les dix VM se répartissent ainsi : les managers (orion-1 à orion-3), dont orion-1 porte aussi l’entrée et orion-3 l’administration, l’application (orion-4 et orion-5), PostgreSQL (orion-6), l’identité (orion-7 : Keycloak et OpenLDAP, qui simulent ensemble MindefConnect), les logs (orion-8 : Logstash), une VM de secours (orion-9) et le stockage (orion-10).
- **Des rôles isolés, repris par une VM de secours.** PostgreSQL, l’identité et Logstash ont chacun leur VM. Si l’une tombe, Swarm recrée son service sur orion-9, qui retrouve ses données sur le stockage. Le déploiement vide orion-9 le temps de placer les services : chacun démarre ainsi sur sa VM, et un service repris par orion-9 rejoint la sienne au déploiement suivant.
- **Des managers à l’entrée.** Les trois managers Swarm, orion-1 à orion-3, dirigent le cluster. orion-1 porte en plus l’entrée, HAProxy ; orion-3 porte l’administration : le runner du déploiement continu. Deux managers sur trois suffisent pour que le cluster continue de fonctionner.
- **Une adresse, sans DNS.** Les utilisateurs joignent ORION directement par l’adresse d’orion-1, `https://172.16.131.188`, sur le port HTTPS par défaut, sans configurer de DNS sur leur poste : ce point d’entrée unique sert l’interface, l’API et la connexion. Les VM utilisent le DNS du réseau de formation.
- **Doublement là où il est simple.** Apache et Express, sans données, ont deux instances actives chacun, sur deux VM : la perte de l’une ne coupe pas le service. HAProxy, seule entrée, a une instance, relancée sur orion-1, dont l’adresse est celle des utilisateurs : si orion-1 tombe, ORION est inaccessible jusqu’à son retour. Les autres services ont une seule instance, relancée automatiquement s’il s’arrête ou au redémarrage de sa VM, et recréée sur une autre VM si la sienne tombe : l’émulateur sur l’autre VM de l’application, PostgreSQL, l’identité et Logstash sur la VM de secours, où ils retrouvent leurs données (§ 4.6). Aucune action manuelle n’est nécessaire.
- **Un stockage pour toutes les données.** Les données de PostgreSQL et d’OpenLDAP et les logs centralisés sont sur orion-10, hors Swarm, sur deux systèmes de fichiers ext4 partagés en NFSv4 : l’un pour les données, l’autre pour les logs. Ce sont des volumes Docker du pilote `local`, de type `nfs` : la VM qui exécute le service monte son volume, et un service recréé sur une autre VM retrouve ainsi ses données. Le collecteur s’exécute sur orion-8 et les fichiers centralisés résident sur orion-10.
- **Les VM fournies, telles quelles.** Les dix VM sont sous Debian 13, avec Docker déjà installé. Les services sont des conteneurs, gérés par une seule pile Docker Swarm, `orion` ; seuls chrony (orion-1), le runner GitHub Actions (orion-3) et le serveur NFS (orion-10) sont des services de l’hôte. orion-3 sert de VM d’administration : son runner déploie chaque version publiée par l’intégration continue ; aucun outil comme Ansible n’est ajouté. L’opérateur administre depuis son poste avec le client Docker, SSH et quelques scripts.
- **Technologies du CCT.** L’architecture réelle se cale au maximum sur la cible : pour chaque fonction, elle utilise un produit de la colonne C1NP de l’annexe « pile logicielle » du CCT 2026-2027 (version 3.7). Elle fait quatre exceptions, qui simplifient le démonstrateur et sont exclues de l’architecture cible : le système des VM fournies pour la démonstration (Debian 13, avec Docker déjà installé), qui n’existera pas sur le C1NP, Docker Engine et Swarm, les substituts de MindefConnect (Keycloak et OpenLDAP) et le runner GitHub Actions du déploiement continu. Les images utilisées sont les images officielles de ces produits ; ORION construit les siennes à partir des images officielles `httpd:2.4` et `node:22`. OpenSSH, systemd et `systemd-timesyncd` sont traités comme des composants de Debian 13, de même que le serveur et le client NFS du noyau Linux (paquets `nfs-kernel-server` et `nfs-common`), dont le statut au CCT reste à vérifier (§ 5.3).

| Nom d’hôte | Rôle | Service | Exécution | Swarm | Ports d’écoute | Volume |
| --- | --- | --- | --- | --- | --- | --- |
| orion-1 | Manager et entrée | Manager Docker Swarm ; HAProxy 3.2 ; chrony | HAProxy en conteneur, une instance, ports publiés sur l’hôte ; chrony sur l’hôte | Manager | `2377/TCP` ; HTTPS `443` ; `8444` pour l’administration ; NTP `123/UDP` | — |
| orion-2 | Manager | Manager Docker Swarm | Démon Docker | Manager | `2377/TCP` | — |
| orion-3 | Manager et administration | Manager Docker Swarm ; runner GitHub Actions 2.338.2 | Démon Docker ; runner, service de l’hôte (systemd) | Manager | `2377/TCP` ; aucun pour le runner | — |
| orion-4, orion-5 | Application | Apache HTTP Server 2.4 et build React ; Express 5 sur Node.js 22 ; émulateur des postes | Conteneurs : Apache et Express, une instance par VM ; émulateur, une instance | Workers | HTTP `8080` et `3001`, réseau overlay | — |
| orion-6 | PostgreSQL | PostgreSQL 17.7 | Conteneur | Worker | TCP `5432`, réseau overlay | Volume NFS `pg-nfs`, sur orion-10 |
| orion-7 | Identité (substituts) | Keycloak 26.7.4 et OpenLDAP 1.5.0 | Deux conteneurs | Worker | HTTP `8080` et LDAP `389`, réseau overlay | Volumes NFS `ldap-data-nfs` et `ldap-config-nfs`, sur orion-10 |
| orion-8 | Collecte des logs | Logstash 8.19.14 | Conteneur | Worker | TCP TLS `6514`, publié par le maillage de routage | Volume NFS `logs-nfs`, sur orion-10 |
| orion-9 | Secours | Aucun en temps normal ; reprend PostgreSQL, l’identité ou Logstash | Conteneurs du rôle repris | Worker | Ceux du rôle repris | Volumes du rôle repris |
| orion-10 | Stockage | Serveur NFS du noyau Linux | Service de l’hôte | Hors Swarm | NFSv4 `2049/TCP` | Données (`/srv/orion/donnees`) et logs (`/srv/orion/logs`), chacun sur son système de fichiers ext4 |

**Échanges numérotés de la vue simplifiée.**

1. Le navigateur joint HAProxy sur l’adresse d’orion-1, seule porte d’entrée.
2. HAProxy sert l’interface (Apache) et transmet les appels `/api` et `/auth` à Express, qui produit aussi les états des lieux PDF à la demande.
3. Express lit et écrit les données dans PostgreSQL.
4. PostgreSQL et OpenLDAP enregistrent leurs données, et Logstash les logs, sur le stockage d’orion-10, monté en NFS.
5. Pour se connecter, le navigateur passe par la même adresse, vers Keycloak, qui vérifie l’identité dans OpenLDAP.
6. Les postes simulés envoient leurs rapports à Express et reçoivent les interventions à exécuter.
7. Les conteneurs envoient leurs logs au collecteur Logstash.
8. L’opérateur administre les VM par SSH et pilote le cluster par un manager, depuis son poste.
9. Le runner d’orion-3 reçoit de GitHub chaque version publiée par l’intégration continue et la déploie sur la pile par le manager orion-1.

#### Réseau, adresses et ports

**Correspondance des machines.** Source : `Copie de liste_machine_wd12.xlsx`, feuille `Feuil1`, correspondances transmises par l’utilisateur le 12 novembre 2026. Le classeur n’a pas été retrouvé dans les emplacements consultés ; ces données reprennent la transmission, avec les virgules des IPv4 normalisées en points. Le 12 novembre, l’utilisateur a nommé les machines `orion-1` à `orion-8` et ajouté `orion-9` et `orion-10` ; le nom d’hôte de chaque VM est son nom `orion-N`, indépendamment du suffixe du nom technique. Ces affectations concernent le déploiement proposé et ne prouvent aucun déploiement effectif. Le réseau des VM est `172.16.128.0/20` ; son DNS, `172.16.143.251` (domaine `formation`), est celui des VM. Le montage local et la cible C1NP restent distincts.

| Nom d’hôte | Nom technique dans le tableau | IPv4 | Affectation prévue |
| --- | --- | --- | --- |
| orion-1 | debian-pdi-cont-wd12--294-6 | 172.16.131.188 | Manager et entrée ; horloge chrony |
| orion-2 | TPL-DEBIAN-13-PDI-CONTAINER-294-7 | 172.16.131.133 | Manager |
| orion-3 | debian-pdi-cont-wd12--294-9 | 172.16.131.193 | Manager et administration : runner du déploiement continu |
| orion-4 | debian-pdi-cont-wd12--294-16 | 172.16.131.208 | Application |
| orion-5 | TPL-DEBIAN-13-PDI-CONTAINER-294-10 | 172.16.131.142 | Application |
| orion-6 | TPL-DEBIAN-13-PDI-CONTAINER-294-8 | 172.16.131.131 | PostgreSQL |
| orion-7 | TPL-DEBIAN-13-PDI-CONTAINER-294-18 | 172.16.131.137 | Identité : Keycloak et OpenLDAP |
| orion-8 | TPL-DEBIAN-13-PDI-CONTAINER-294-19 | 172.16.131.146 | Logs : Logstash |
| orion-9 | non transmis | 172.16.131.190 | Secours de PostgreSQL, de l’identité et des logs |
| orion-10 | non transmis | 172.16.131.197 | Stockage NFS, hors Swarm |

**Adresse d’entrée.** ORION n’a pas de nom de domaine : les utilisateurs saisissent l’adresse d’orion-1, `https://172.16.131.188`, sans régler de DNS sur leur poste. HAProxy y sert, sur le port `443`, l’interface, l’API (`/api`, `/auth`) et la connexion Keycloak (`/realms`, `/resources`) ; la console de Keycloak, refusée sur ce port, est servie sur `8444`. Les VM résolvent les noms par le DNS du réseau de formation ; à l’intérieur du cluster, les services se joignent par la résolution interne de Docker.

| Adresse | Service | Accès |
| --- | --- | --- |
| `https://172.16.131.188` (port `443`) | ORION : interface, API et connexion (Keycloak, émetteur OIDC) | Utilisateurs et Express |
| `https://172.16.131.188:8444` | Console d’administration de Keycloak | Réseau d’administration seulement |
| IPv4 de chaque VM du tableau ci-dessus, port `22/TCP` | Administration par SSH des dix VM | Réseau d’administration seulement |

L’émetteur OIDC est `https://172.16.131.188/realms/orion` et le retour OIDC `https://172.16.131.188/auth/callback`. Le collecteur reçoit les logs sur le port `6514/TCP` avec TLS : le maillage de routage de Swarm publie ce port sur chaque VM du cluster, y compris sur son adresse locale, et le transmet à Logstash, quelle que soit la VM qui l’exécute ; le pilote `syslog` de chaque VM joint donc `127.0.0.1:6514`. Le certificat de HAProxy porte l’adresse d’orion-1, celui du collecteur l’adresse `127.0.0.1` ; leur autorité doit être reconnue par Firefox, par Node.js et par le pilote `syslog`. L’horloge est jointe sur `172.16.131.188:123/UDP`. Les VM qui montent le stockage le joignent sur `172.16.131.197:2049/TCP` (NFSv4). SSH utilise chacune des dix IPv4 sur `22/TCP`, depuis le réseau d’administration. Le filtrage reste à qualifier.

HAProxy termine le TLS. Il publie ses ports sur l’hôte d’orion-1 et joint les services par leur nom sur le réseau overlay de Swarm, chiffré (option `encrypted`) : `apache:8080`, `api:3001` et `keycloak:8080`. Le port `443` transmet `/realms` et `/resources` à Keycloak et refuse les chemins de sa console, servie uniquement sur `8444`. Les PDF d’état des lieux passent par le port `443`, comme le reste de l’API.

Express utilise pour Keycloak la même adresse que le navigateur : il le joint donc aussi par HAProxy, sur `443`. Il joint PostgreSQL directement par le réseau overlay (`postgres:5432`), et l’émulateur joint Express par ce même réseau (`api:3001`). Keycloak lit l’annuaire par `ldap:389`. La résolution de noms interne de Docker sert à l’intérieur du cluster.

Le filtrage autorise :

- `443` vers orion-1 depuis le réseau des utilisateurs ;
- `8444` vers orion-1 et `22` vers les dix VM depuis le réseau d’administration ;
- `53/TCP et UDP` des VM vers le DNS du réseau ;
- entre les VM du cluster (toutes sauf orion-10) : `2377/TCP` vers les managers, `7946/TCP et UDP`, `4789/UDP` et le protocole IP 50 (ESP) du réseau overlay chiffré ;
- `6514/TCP` de chaque VM du cluster vers elle-même (maillage de routage), puis par le réseau `ingress` de Swarm vers la VM de Logstash ;
- `2049/TCP` d’orion-6 à orion-9 vers orion-10 (NFSv4) ;
- `123/UDP` des VM orion-2 à orion-10 vers orion-1, horloge de référence ;
- `22/TCP` d’orion-3 vers orion-1 (déploiement par le runner), et `8080/TCP` d’orion-3 vers le proxy du réseau (`172.16.0.1`), par lequel le runner joint GitHub en HTTPS.

#### Docker Swarm

Une seule pile, `orion`, décrite dans un fichier versionné et déployée avec `docker stack deploy`, contient tous les conteneurs. La composition du cluster (managers, workers, étiquettes de nœud) ne relève pas de ce fichier : elle est réglée par les commandes `docker swarm` et `docker node` du script de préparation. Chaque service redémarre automatiquement (`restart_policy`) ; au démarrage d’une VM, Docker relance ses conteneurs. Les services sont placés d’après des étiquettes de nœud : `orion=entree` pour orion-1 (HAProxy), `orion=application` pour orion-4 et orion-5, et une étiquette par rôle isolé : `pg=true` (orion-6), `identite=true` (orion-7) et `logs=true` (orion-8). orion-9 porte ces trois dernières étiquettes : Swarm peut y recréer chacun de ces services.

Apache et Express ont deux instances chacun, une par VM de leur groupe (`max_replicas_per_node: 1`) ; HAProxy en a une, sur orion-1 ; HAProxy répartit les requêtes entre les instances d’Apache et d’Express et écarte celle qui ne répond plus. L’émulateur a une instance, pour ne pas simuler deux fois les mêmes postes. PostgreSQL, Keycloak, OpenLDAP et Logstash ont une instance chacun : leurs volumes étant sur orion-10, Swarm les recrée sur orion-9 si leur VM tombe, et ils y retrouvent leurs données. Swarm ne sait pas préférer une VM à une autre : pour que chaque rôle isolé démarre sur sa VM et non sur orion-9, le script de déploiement vide orion-9 (`drain`) pendant le déploiement, si orion-6, orion-7 et orion-8 sont prêtes, puis la remet en service. Un service repris par orion-9 rejoint ainsi sa VM au déploiement suivant ; si deux VM isolées tombent en même temps, leurs services partagent orion-9. Une mise à jour arrête l’ancienne instance avant de démarrer la nouvelle (ordre `stop-first`, par défaut) : un volume n’est jamais utilisé par deux instances à la fois. Si une VM de l’application tombe, l’instance d’Apache ou d’Express qu’elle portait attend son retour ; l’autre instance assure le service. Si orion-1 tombe, HAProxy attend son retour. Au retour d’une VM, un redéploiement répartit de nouveau les services à une instance. HAProxy, l’émulateur et Express se joignent par le nom des services : la VM qui les exécute importe peu.

orion-1, orion-2 et orion-3 sont managers : ils dirigent le cluster ; orion-1 porte aussi l’entrée et orion-3 l’administration. Deux managers sur trois suffisent pour que le cluster continue de fonctionner. orion-4 à orion-9 sont workers. orion-10 n’appartient pas au cluster : elle ne fait que partager ses disques.

Les images d’ORION (Apache avec le build React, Express, émulateur, Keycloak avec le realm et le thème) sont construites et publiées sur Docker Hub par l’intégration continue, avec le commit pour étiquette, puis déployées par le runner d’orion-3 ; chaque VM les télécharge au déploiement, comme les images officielles, par le proxy du réseau. Chaque image est épinglée sur une version exacte, et des contrôles de santé (`HEALTHCHECK`) signalent un conteneur défaillant, que Swarm remplace.

Express ne garde aucun état qui fasse autorité : l’espace de travail et les sessions sont dans PostgreSQL. Chaque écriture verrouille la ligne de révision, relit l’état et fusionne les modifications concurrentes grâce au journal des dernières révisions, conservé en base. Les deux instances servent donc indifféremment n’importe quel utilisateur, et un redémarrage ne déconnecte personne.

#### Logs

Chaque conteneur envoie ses logs au collecteur par le pilote `syslog` de Docker, au format syslog RFC 5424 exigé par le CCT, sur TCP TLS `6514`, à l’adresse locale de sa VM (`127.0.0.1`), que le maillage de routage transmet à Logstash. Le pilote fonctionne en mode non bloquant : une panne du collecteur ne bloque jamais un service démarré, mais les logs émis pendant l’interruption ne sont pas centralisés ; un conteneur créé pendant l’interruption échoue et Swarm le relance jusqu’au retour du collecteur. Docker en garde une copie locale, consultable sur la VM avec `docker logs`. Les logs du système de chaque VM, dont ceux du runner sur orion-3, restent dans journald, consultables par SSH.

Logstash 8.19.14 s’exécute dans un conteneur de la pile, en une instance, sur orion-8 (orion-9 s’il l’a repris). Il assure la collecte dans le démonstrateur et dans la proposition cible (§ 6). Il écrit les logs reçus dans le volume NFS `logs-nfs`, c’est-à-dire sur le disque des logs d’orion-10 (`/srv/orion/logs/conteneurs`) : un répertoire par service et un fichier par jour, lisibles directement sur le système de fichiers d’orion-10. L’opérateur les lit par SSH. S’il est recréé sur orion-9, Logstash poursuit l’écriture des mêmes fichiers. Aucun port de consultation web n’est ouvert. La durée de conservation et la purge des fichiers restent à fixer.

#### Administration et horloge

L’opérateur administre depuis son poste, sur le réseau d’administration, en se connectant en SSH à chaque VM. Utiliser des comptes nominatifs, des clés SSH, la vérification des clés d’hôte et une élévation `sudo` limitée ; désactiver la connexion SSH directe de root et l’authentification par mot de passe. Prévoir aussi l’accès à la console de l’hyperviseur pour une VM injoignable.

Depuis son poste, l’opérateur pilote le cluster avec le client Docker, relié par SSH à un manager : secrets, configurations et déploiement de la pile (`docker stack deploy`, sur orion-1). Un script court, conservé dans le dépôt avec le fichier de pile, prépare les VM : nom d’hôte, serveurs DNS, horloge, autorité du pilote `syslog`, stockage d’orion-10 (disques, partages NFS), composition du cluster et secrets. Il peut être relancé : il amène un cluster existant à la répartition prévue, en promouvant les nouveaux managers avant de rétrograder les anciens. Rien de cela n’intervient en cas de panne.

**Déploiement continu.** orion-3 est la VM d’administration : elle porte un runner GitHub Actions 2.338.2, installé sur l’hôte depuis l’archive officielle et exécuté par systemd avec le compte des VM. Le runner n’écoute aucun port : il interroge GitHub en HTTPS, par le proxy du réseau, et reçoit le job de déploiement quand les tests, le vérificateur documentaire et la publication des images ont réussi sur la branche principale. Ce job lance le script de déploiement du dépôt, qui joint orion-1 en SSH avec une clé propre au runner, autorisée sur orion-1 seulement : `docker stack deploy` de la pile `orion`, puis contrôle de la version servie par `https://172.16.131.188`. Le runner est hors de la pile, pour qu’un déploiement ne le redémarre jamais. Un script du dépôt l’installe une fois, depuis le poste de l’opérateur, avec le jeton d’enregistrement fourni par GitHub.

**Horloge.** Aucun serveur de temps n’est disponible. Les VM doivent pourtant avoir la même heure, à quelques secondes près : les jetons de connexion émis par Keycloak sont contrôlés par Express sur une autre VM, les deux instances d’Express datent les enregistrements, et Swarm vérifie les certificats échangés entre les VM. orion-1 sert donc d’horloge de référence : chrony, programme de synchronisation de l’heure, y est installé sur l’hôte et répond en NTP (`123/UDP`). Les VM orion-2 à orion-10 s’y règlent avec `systemd-timesyncd`, déjà présent dans Debian 13. L’heure commune peut dériver légèrement de l’heure réelle, sans effet sur ORION. Si orion-1 est indisponible, les horloges continuent de fonctionner et ne dérivent que lentement.

Aucune sauvegarde n’est prévue : il s’agit d’une démonstration, et les données de départ sont recréées au premier démarrage.

#### Secrets

Les secrets sont des secrets Docker Swarm : chiffrés et répliqués entre les managers, ils ne sont remis qu’aux conteneurs qui en ont besoin, sous forme de fichiers dans `/run/secrets`. Le script de démarrage de chaque image construite transmet ces valeurs au service ; le code n’a pas à changer.

| Secret | Services destinataires |
| --- | --- |
| Accès PostgreSQL | Express et PostgreSQL |
| Secret du client OIDC | Express ; même valeur enregistrée dans le client Keycloak |
| Secret de session | Express |
| Jeton des postes | Express et émulateur |
| Compte de liaison LDAP et administration de Keycloak | Keycloak et OpenLDAP |
| Clé privée et certificat TLS | HAProxy et Logstash |

Tous les secrets de la pile, y compris les clés et certificats TLS de HAProxy et de Logstash, sont des secrets Swarm, créés une fois par le script de préparation avec des valeurs aléatoires ; aucun n’est écrit dans le dépôt, dans une image ou dans une variable d’environnement de la pile. Hors de Swarm ne restent que les clés SSH de l’opérateur et du runner, l’enregistrement du runner auprès de GitHub, conservé sur orion-3, et l’autorité de certification : sa clé privée reste sur le poste de l’opérateur ; son certificat, public, est déposé sur chaque VM pour que le pilote `syslog` de Docker vérifie le collecteur. La rotation est une opération planifiée : nouvelle valeur, mise à jour du service qui l’authentifie, redéploiement, vérification, puis retrait de l’ancienne. Le verrouillage automatique des managers (`autolock`) n’est pas activé, pour qu’un redémarrage ne demande aucune action ; protéger en contrepartie l’accès aux disques des managers.

#### Volumes

| Volume | Stockage → montage | Contenu |
| --- | --- | --- |
| Volume NFS `pg-nfs` | orion-10 `/srv/orion/donnees/postgres` → `/var/lib/postgresql/data` du conteneur PostgreSQL | Données métier et sessions ORION |
| Volumes NFS `ldap-data-nfs` et `ldap-config-nfs` | orion-10 `/srv/orion/donnees/ldap-data` et `/srv/orion/donnees/ldap-config` → `/var/lib/ldap` et `/etc/ldap/slapd.d` du conteneur OpenLDAP | Identités et configuration de l’annuaire |
| Volume NFS `logs-nfs` | orion-10 `/srv/orion/logs/conteneurs` → `/var/log/orion` du conteneur Logstash | Logs centralisés, lisibles directement sur orion-10 |

orion-10 porte deux systèmes de fichiers ext4, l’un pour les données (`/srv/orion/donnees`), l’autre pour les logs (`/srv/orion/logs`), de sorte que les logs ne puissent pas remplir l’espace des données. Ils sont prévus sur deux disques ajoutés à la VM ; faute de ces disques, ce sont deux fichiers image de taille fixe (6 Go pour les données, 4 Go pour les logs) sur le disque système d’orion-10, montés comme des disques. Les deux sont partagés en NFSv4, en écriture synchrone (`sync`), avec les seules VM qui les montent : orion-6, orion-7, orion-8 et orion-9 (rôles isolés et secours). Les volumes de la pile sont des volumes Docker du pilote `local`, de type `nfs`, comme dans la configuration du formateur : la VM qui exécute le service les monte au démarrage du conteneur, avec l’option `hard`, qui fait attendre les écritures pendant une coupure du stockage au lieu de les faire échouer. Chaque volume n’est utilisé que par une instance à la fois. Les comptes root de ces VM conservent leurs droits sur le partage (`no_root_squash`), pour que les images officielles attribuent leurs fichiers au compte de leur service. Apache, Express, Keycloak et l’émulateur n’ont pas de données propres : le build React est intégré à l’image d’Apache, le realm et le thème à celle de Keycloak, réimportés à chaque création du conteneur. Keycloak conserve ses sessions dans sa base H2 interne : elles sont perdues à sa recréation et les utilisateurs se reconnectent.

#### Réglages de l’application

Dans ce déploiement, Express écoute sur toutes les interfaces de son conteneur, pour être joint par HAProxy et par l’émulateur. Il continue de créer les identités des comptes actifs dans le Keycloak substitut, en joignant son administration par le réseau overlay plutôt que par le port `443`, qui refuse ces chemins. Il reconnaît l’autorité des certificats de HAProxy pour joindre Keycloak. L’émulateur joint Express par `api:3001`. Ces réglages sont décrits dans le [guide de l’application](../application/README.md#production).

#### Points à qualifier

- Adresse d’entrée : une IP flottante (keepalived) rendrait l’entrée indépendante d’orion-1, si le réseau en attribue une.
- Version de Docker installée sur les VM, accès des VM à Internet pour télécharger les images.
- Réseau : confirmation des affectations IP fournies, filtrage, protocole ESP du réseau overlay chiffré, accès SSH et console de l’hyperviseur.
- Capacité CPU, mémoire et disque de chaque VM, dont la machine Java de Logstash ; ajout des deux disques d’orion-10, qui remplaceraient les fichiers image.
- Taille des disques de données et de logs d’orion-10 et durée de conservation des logs.
- Tenue de PostgreSQL et d’OpenLDAP, dont la base LMDB est déconseillée sur un système de fichiers réseau, sur le stockage NFS : performances, verrous et intégrité après une coupure, à éprouver par les essais de panne.
- Double écriture : si orion-6 ou orion-7 est isolée du cluster sans perdre l’accès au stockage, Swarm peut démarrer une seconde instance de PostgreSQL ou d’OpenLDAP sur orion-9 pendant que la première écrit encore.
- Capacité d’orion-9 à porter un rôle isolé, voire deux si deux VM isolées tombent ensemble.
- Statut au CCT du serveur et du client NFS (§ 5.3).
- Accès de l’API d’administration de Keycloak par son adresse interne : réglage du nom d’hôte de Keycloak à vérifier.
- Délai de détection d’une VM perdue et de recréation des conteneurs ailleurs ; temps d’écriture sous verrou avec deux instances d’Express et l’activité des postes.
- Essai de chaque panne du § 4.6.

### 4.6. Pannes et reprises

Aucune panne ne demande d’action manuelle : chaque service est relancé automatiquement. Les services d’un manager ou d’une VM de l’application continuent sur les autres VM de leur groupe ; ceux d’orion-6, orion-7 ou orion-8 sont recréés sur orion-9 et retrouvent leurs données sur le stockage d’orion-10 ; seules la perte d’orion-1, qui porte l’entrée, et celle d’orion-10 rendent ORION indisponible jusqu’à leur retour.

| Panne | Reprise automatique | Effet pour l’utilisateur |
| --- | --- | --- |
| Un conteneur s’arrête | Swarm le redémarre sur sa VM. | Aucun pour Apache et Express, dont l’autre instance répond ; sinon service indisponible quelques secondes. |
| Une VM redémarre | Docker relance ses conteneurs. | Service de la VM indisponible pendant le redémarrage, sauf s’il a une seconde instance. |
| orion-1 (manager et entrée) indisponible | Les deux autres managers continuent de diriger le cluster ; HAProxy attend le retour d’orion-1 ; les horloges des autres VM continuent sans référence ; le déploiement continu échoue jusqu’à son retour. | ORION inaccessible jusqu’au retour d’orion-1. |
| orion-2 ou orion-3 (manager) indisponible | Les deux autres managers continuent de diriger le cluster ; si orion-3 est concerné, les nouvelles versions attendent le retour du runner. | Aucun. |
| orion-4 ou orion-5 (application) indisponible | HAProxy envoie les requêtes aux instances d’Apache et d’Express de l’autre VM ; Swarm recrée l’émulateur sur l’autre VM s’il était concerné. | Aucun, hormis les requêtes en cours ; rapports de postes interrompus pendant la relance de l’émulateur. |
| orion-6 (PostgreSQL) indisponible | Swarm recrée PostgreSQL sur orion-9, qui monte le même volume ; Express se reconnecte. | Lectures, écritures et PDF d’état des lieux en erreur pendant la relance. |
| orion-7 (identité) indisponible | Swarm recrée Keycloak et OpenLDAP sur orion-9, qui monte les mêmes volumes ; Keycloak réimporte son realm. | Nouvelles connexions impossibles pendant la relance ; sessions ORION ouvertes valides. |
| orion-8 (logs) indisponible | Swarm recrée Logstash sur orion-9, qui monte le même volume. | Aucun ; centralisation des logs interrompue pendant la relance, logs consultables sur chaque VM (`docker logs`). |
| orion-9 (secours) indisponible | Aucune en temps normal ; un service qu’elle avait repris est recréé sur sa VM d’origine si celle-ci est revenue. | Aucun, sauf pendant la relance d’un service qu’elle avait repris. |
| orion-10 (stockage) indisponible | Aucune ; les accès de PostgreSQL, d’OpenLDAP et de Logstash attendent son retour (montage `hard`), puis reprennent. | Lectures, écritures, PDF d’état des lieux et nouvelles connexions bloqués jusqu’au retour ; sessions ORION ouvertes conservées ; logs consultables sur chaque VM (`docker logs`). |

Les opérations planifiées (déploiement, mise à jour, rotation des secrets) ne sont pas des reprises automatiques.

### 4.7. Traitement des rapports de postes

Le code sépare les routes HTTP, le traitement des postes (`postes.ts`), le moteur d’écriture (`engine.ts`) et le dépôt (`postgres.ts`). Le moteur ne garde aucun état qui fasse autorité : les rapports et les écritures métier passent par le même verrou PostgreSQL sur la ligne de révision, quelle que soit l’instance d’Express qui les reçoit, et le journal des modifications est conservé en base. Plusieurs instances partagent donc la charge des requêtes, mais leurs écritures restent sérialisées par ce verrou.

Le premier essai garde le moteur actuel et mesure la mise en lots et la réduction des écritures à 1 000 postes puis au-delà. Relever l’attente du verrou, le temps de traitement et de transaction, et la latence des écritures utilisateur sous charge.

Si la préparation des rapports domine, tester un service autonome de traitement, alimenté par une file durable. Il prépare les rapports et confie leur application au moteur d’écriture, qui garde l’autorité sur les règles et l’état courant. L’essai doit vérifier la reprise, le rejeu sans effets dupliqués et le maintien du contrat de `/api/agent/rapports`, qui renvoie les interventions après traitement. Si les transactions dominent, réduire d’abord le coût des écritures. Cet essai ne fait pas partie du déploiement de départ.

## 5. Versions des technologies

Les §§ 5.1 et 5.2 décrivent le montage local. Les versions npm sont celles verrouillées par `package-lock.json` et les images Docker sont épinglées sur une version exacte.

### 5.1. Composants exécutés

| Élément | Version | Rôle |
| --- | --- | --- |
| Node.js | `>= 22.22`, version exacte non verrouillée | Exécution du back, de l’émulateur et des scripts |
| React | 19.3.1 | Composants de l’interface |
| React DOM | 19.3.1 | Rendu React dans le navigateur |
| React Router | 8.5.1 | Routage des écrans |
| Vite | 8.3.6 | Serveur front de développement et construction |
| Plugin React pour Vite | 6.2.1 | Transformation du JSX |
| Express | 5.3.0 | Serveur HTTP et API |
| Helmet | 8.3.0 | En-têtes HTTP de sécurité |
| `openid-client` | 6.8.9 | Client OpenID Connect |
| `express-session` | 1.19.0 | Sessions serveur |
| `connect-pg-simple` | 10.0.0 | Sessions dans PostgreSQL |
| `pg` | 8.23.1 | Accès PostgreSQL depuis Node.js |
| Concurrently | 9.2.5 | Lancement coordonné de Vite, Express et de l’émulateur |
| PostgreSQL | image `postgres:17.7-alpine` | Données métier et sessions |
| Keycloak | image `quay.io/keycloak/keycloak:26.7.4` | Substitut local de MindefConnect |
| OpenLDAP | image `osixia/openldap:1.5.0` | Annuaire local des identités |
| Docker et Docker Compose | version installée, non verrouillée | Exécution des trois conteneurs |
| Firefox | version installée, non verrouillée | Navigateur |

### 5.2. Construction et vérification

| Élément | Version | Utilisation |
| --- | --- | --- |
| Playwright | 1.65.0 | Tests de l’interface et de bout en bout |
| Exécuteur de tests de Node.js | inclus dans Node.js | Tests unitaires et d’intégration du back |
| Vite | 8.3.6 | Construction des artefacts du front |

### 5.3. Versions de référence pour les VM

Les versions des [schémas de déploiement](18-DIAGRAMMES-ARCHITECTURE.md#architecture-réelle-sur-vm) sont des références à qualifier sur les VM ; chaque image est épinglée sur une version exacte. Le statut est celui de la colonne C1NP de l’annexe « pile logicielle » du CCT 2026-2027 (version 3.7) : R pour recommandé, S pour soutenu. Les exceptions du § 4.5 sont signalées comme telles. React 19 est recommandé sur le C1NP, hors versions 19.0.0 à 19.2.0, interdites ; le dépôt utilise la 19.3.1.

| Composant | Version proposée | Statut CCT C1NP | Déploiement |
| --- | --- | --- | --- |
| Debian | 13 | Exception : système des VM fournies pour la démonstration | Système des dix VM |
| Docker Engine et Swarm | version installée sur les VM | Exception : exécution des conteneurs | VM orion-1 à orion-9 ; client sur le poste de l’opérateur |
| chrony | paquet Debian 13 | R / S (NTPd/Chronyd) | Hôte d’orion-1 : horloge de référence des autres VM |
| HAProxy | 3.2, image officielle | R / S | orion-1 |
| Apache HTTP Server | 2.4, image officielle `httpd` | R / S (version 2.4) | Image d’ORION avec le build React ; orion-4 et orion-5 |
| Node.js | 22 LTS, image officielle `node` | R / S | Images d’Express et de l’émulateur ; orion-4 et orion-5 |
| Express | 5.3.0 | R | Image d’Express |
| PostgreSQL | 17.7, image officielle | R / S | orion-6 (secours orion-9) ; données sur orion-10 |
| Logstash | 8.19.14, image officielle | R / S | orion-8 (secours orion-9) ; logs sur orion-10 |
| Keycloak | 26.7.4, image officielle | Exception : substitut de MindefConnect | orion-7 (secours orion-9) |
| OpenLDAP | 1.5.0, image `osixia/openldap` | Exception : substitut de MindefConnect | orion-7 (secours orion-9) ; données sur orion-10 |
| Runner GitHub Actions | 2.338.2, archive officielle | Hors CCT : architecture réelle seulement, exclu de la cible | Hôte d’orion-3, service systemd ; déploiement continu |
| Serveur et client NFS (NFSv4.2) | paquets Debian 13 `nfs-kernel-server` et `nfs-common` | Non vérifié : composant de Debian 13 | Serveur sur l’hôte d’orion-10 ; client sur orion-6 à orion-9 |

## 6. Architecture cible

### 6.1. Implantation C1NP pour 1 000 postes

Le ministère des Armées héberge ORION sur le C1NP. La cible de production comprend **quatre VM ORION**, sans Swarm, pour un premier palier d’essai de **1 000 postes Windows actifs**. La [vue simplifiée](18-DIAGRAMMES-ARCHITECTURE.md#vue-simplifiée-de-la-cible) montre les rôles et les principaux échanges. La [vue détaillée](18-DIAGRAMMES-ARCHITECTURE.md#vue-détaillée-de-la-cible) indique les versions et les ports. MindefConnect est hébergé sur le C1NP, en dehors des quatre VM dédiées à ORION. Le puits de logs est exploité par ORION, faute d’offre sur le réseau visé (cadrage du 13 novembre 2026). Les versions du tableau sont des références issues du dépôt. Le système Linux, les versions autorisées et les correctifs à appliquer en production restent à qualifier avec le CCT et l’exploitant. Les versions de Windows restent à préciser. L’intégration MindefConnect utilise OIDC, selon le contrat à obtenir auprès de son exploitant. Le CCT complet et l’offre d’hébergement n’ont pas été vérifiés pour cette proposition.

| VM | Services de l’hôte | vCPU | RAM | Disques d’essai |
| --- | --- | ---: | ---: | --- |
| VM 1 . Entrée | HAProxy 3.2.16 et Apache HTTP Server 2.4.69. Apache sert les fichiers React 19.3.1 sur la boucle locale. | 2 | 8 Go | 50 Go système |
| VM 2 . Application | Node.js 22.22.3, Express 5.3.0 et composant d’administration des postes Windows à préciser. | 8 | 32 Go | 50 Go système |
| VM 3 . Base et collecte | PostgreSQL 17.7 et Logstash 8.19.14. | 4 | 16 Go | 50 Go système, dont une file de collecte locale bornée. Données PostgreSQL sur VM 4 après qualification du stockage. |
| VM 4 . Stockage | Service de fichiers NFSv4.2. Aucun processus ORION, PostgreSQL ou Logstash. | 2 | 8 Go | 50 Go système + 100 Go logs + 100 Go SSD PostgreSQL, sur deux volumes dédiés |
| **Total** | **4 VM** | **16** | **64 Go** | **400 Go** |

VM 4 porte les fichiers de logs centralisés. « Sans processus » signifie ici sans processus applicatif, moteur de base ni collecteur. Le système et le service de partage de fichiers restent nécessaires. VM 3 accède aux volumes de VM 4 avec des droits propres à chaque service. VM 1 assure l’entrée HTTPS, VM 2 exécute Express, et VM 3 regroupe Logstash et PostgreSQL. La file de collecte reste sur le disque local de VM 3. Borner la consommation CPU, mémoire et disque de Logstash pour préserver PostgreSQL, notamment lors de la reprise après une coupure.

Le partage NFSv4.2 utilise le réseau privé C1NP existant. Le filtrage autorise uniquement la VM 3 à joindre la VM 4 sur TCP 2049. Un réseau de stockage séparé serait justifié par une exigence d’isolement ou par les mesures de débit et de latence. [NFSv4 sur TCP](https://docs.oracle.com/en/operating-systems/oracle-linux/8/nfs/nfs-versions_concept.html).

Le répertoire PostgreSQL, journaux de transactions compris, peut aussi résider sur VM 4 si le C1NP autorise ce stockage et si les essais confirment la durabilité des écritures et la latence sous charge. La proposition utilise un montage NFS `hard`, un export serveur `sync` et une seule instance PostgreSQL autorisée à monter le volume en écriture. Le démarrage de PostgreSQL dépend du montage et doit échouer si le volume est absent. Tester la coupure de VM 4, la reprise et la concurrence des écritures de logs et de base. Si les essais échouent, attacher le SSD PostgreSQL à VM 3 et conserver VM 4 dédiée aux logs. [PostgreSQL 17 et stockage NFS](https://www.postgresql.org/docs/17/creating-cluster.html#CREATING-CLUSTER-NFS).

La perte de VM 4 suspend l’archivage des logs et peut bloquer PostgreSQL si ses données y résident. La perte de VM 1 interrompt l’entrée HTTPS. La perte de VM 3 interrompt PostgreSQL et la collecte centralisée. La perte de VM 2 interrompt l’API. Prévoir une sauvegarde de la base sur un stockage indépendant des quatre VM. La disponibilité de cette capacité, les délais et pertes de données acceptables et les procédures de restauration restent à qualifier.

MindefConnect authentifie les utilisateurs. ORION applique les droits selon le compte, le profil et l’école dans PostgreSQL. Le back génère les PDF à la demande, après contrôle des droits, et les renvoie via HAProxy. Aucun document généré n’est conservé. La VM 2 accueille le composant d’administration Windows côté ORION. Son rôle et ses flux dépendent de l’option retenue (§ 6.5) : pilotage de l’agent ORION ou connecteur vers Configuration Manager. Un serveur de site Configuration Manager dédié conserve ses propres prérequis.

### 6.2. Flux et exploitation

| Flux | Protocole et port proposés | Usage |
| --- | --- | --- |
| 1. Firefox → HAProxy (VM 1) | HTTPS, TCP 443 | Interface, API et parcours de connexion. |
| 2. HAProxy → Apache (VM 1) | HTTP, TCP 8080, boucle locale | Fichiers de l’interface. |
| 3. HAProxy (VM 1) → Express (VM 2) | HTTPS, TCP 3001 | API et routes `/auth`. Prévoir la terminaison TLS côté VM 2 : Express écoute actuellement en HTTP. |
| 4. Express (VM 2) → PostgreSQL (VM 3) | PostgreSQL sur TLS, TCP 5432, réseau privé | Données et sessions. |
| 5. Firefox → MindefConnect | HTTPS, TCP 443 | Authentification et retour du navigateur vers ORION. |
| 6. Express (VM 2) → MindefConnect | HTTPS, TCP 443 | Découverte, clés et échanges OIDC, selon le contrat d’intégration. |
| 7. Émetteurs VM 1 et VM 2 → Logstash (VM 3) | Syslog RFC 5424 sur TLS, TCP 6514 | Logs techniques de l’entrée et du back. Les logs PostgreSQL sont collectés localement sur VM 3. |
| 8. Logstash (VM 3) → stockage (VM 4) | NFSv4.2, TCP 2049, réseau privé C1NP | Écriture des fichiers de logs sur le volume dédié. |
| 9. PostgreSQL (VM 3) → stockage (VM 4) | NFSv4.2, TCP 2049, réseau privé C1NP | Accès au volume de base, sous réserve de qualification. |
| 10. Express → administration des postes (VM 2) | À préciser | Transmet les demandes autorisées et consulte leur état et leur résultat. |
| 11. Postes Windows → administration des postes (flux fonctionnel) | À préciser | Authentification propre à chaque poste, inventaire, rapports de processus et résultats des interventions. |
| 12. Administration des postes → postes Windows (flux fonctionnel) | À préciser | Remise des interventions autorisées au poste concerné. Avec l’agent ORION, les commandes sont renvoyées dans la réponse au rapport du poste. |
| Administration → VM 1 à 4 | SSH, TCP 22 | Depuis le réseau d’administration autorisé. |
| VM 1 à 4 → services de plateforme | DNS TCP/UDP 53 et NTP UDP 123, à qualifier | Résolution des noms et synchronisation de l’heure. |
| VM 3 → stockage de sauvegarde | Contrat et port à obtenir | Sauvegarde et restauration de PostgreSQL. |

Les flux 11 et 12 montrent les deux sens du parcours fonctionnel. Avec l’agent ORION, le client Windows initie la connexion. Le code actuel authentifie chaque poste avec un jeton propre à son nom réseau. Les postes passent alors par HAProxy et l’API Express : le rapport récupère les interventions en attente et le poste renvoie leur résultat. Avec Configuration Manager, les clients communiquent avec le gestionnaire Microsoft et le composant ORION échange avec son service d’administration. Les points de terminaison, ports et protocoles du gestionnaire restent à préciser selon l’option retenue.

Limiter les accès à PostgreSQL, au collecteur et aux interfaces d’exploitation aux seuls émetteurs autorisés. L’application expose actuellement `/api/health` et `/api/infos` ; filtrer leur accès depuis le réseau d’exploitation et harmoniser le nom avec le contrat cible. `/api/health` vérifie notamment PostgreSQL et MindefConnect : une sonde d’instance du répartiteur doit être distincte de ce diagnostic de dépendances. Obtenir les noms DNS, certificats, règles de filtrage et modalités de gestion des secrets auprès de l’exploitant.

Le collecteur écrit les fichiers centralisés sur VM 4, avec rotation, quotas, surveillance de l’espace libre et consultation sur place par les personnes habilitées. Les journaux propres à VM 4 restent locaux et la collecte ne rapatrie aucun fichier depuis VM 4. Lors d’une coupure du partage, sa file locale de VM 3 permet une reprise dans la limite de sa capacité. Prévoir une file locale bornée chez les émetteurs et tester la reprise après coupure. Une connexion TCP ouverte ne prouve ni la réception ni la conservation d’un événement. Le raccordement des émetteurs, le cadrage des messages syslog sur TLS et la compatibilité du collecteur doivent être vérifiés en essai. Les logs techniques servent au diagnostic. Le périmètre de l’audit métier, les actions à tracer, les habilitations, la durée de conservation et les exigences d’intégrité restent au [cadrage § 18](02-CADRAGE.md#18-authentification-et-sécurité). Le journal de fusion PostgreSQL sert à la synchronisation des modifications.

### 6.3. Vérification de la charge

Hypothèses d’essai : une remontée de **10 000 octets** par poste toutes les **5 s** (§ 10 du cadrage), **un rapport par transaction**, 8 h d’activité et une actualisation de l’interface toutes les 4 s. Les tailles des rapports et le nombre d’utilisateurs simultanés sont des hypothèses. Les débits de la table concernent les corps des rapports en entrée. Ajouter les réponses aux postes et navigateurs, les PDF, les en-têtes et le chiffrement lors des essais.

| Palier | Postes actifs | Utilisateurs simultanés supposés | Rapports/s | Actualisations UI/s | Débit entrant | Données reçues en 8 h |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Démarrage | 1 000 | 100 | 200 | 25 | 16 Mbit/s | 57,6 Go |
| Croissance | 5 000 | 500 | 1 000 | 125 | 80 Mbit/s | 288 Go |

Calculs en unités décimales : postes ÷ 5 pour les rapports/s, utilisateurs ÷ 4 pour les actualisations/s, puis rapports/s × 10 000 × 8 pour le débit en bit/s et rapports/s × 10 000 × 28 800 pour le volume entrant en octets. PostgreSQL conserve notamment l’état courant et les historiques métier prévus. Sa croissance doit être mesurée sur les tables, index et journaux de transactions. À titre d’essai pour les logs, une ligne de 300 octets par rapport représente 1,728 ou 8,64 Go par jour actif de 8 h, soit 51,84 ou 259,2 Go sur 30 jours actifs, avant compression et hors autres logs, fichiers en rotation et files. Les disques proposés laissent de la place à ces postes de consommation, dont la taille reste à mesurer.

Le [dépôt PostgreSQL](../application/backend/workspace/postgres.ts) sérialise les écritures sur la même ligne de révision avec `SELECT FOR UPDATE`. À 70 % d’occupation de ce verrou et cinq autres écritures/s supposées de même durée, la durée moyenne disponible sous verrou vaut 0,70 ÷ (rapports/s + 5) : **3,41 ms à 1 000 postes** et **0,697 ms à 5 000**. Les 675 postes calculés sur la branche cible correspondent à l’hypothèse de 5 ms sous verrou. Mesurer séparément les durées des rapports et des autres écritures, ainsi que l’attente du verrou et les pointes. Deux back partagent le même verrou.

Dans le [code des routes](../application/backend/workspace/routes.ts), l’ETag dépend de la révision globale. Des rapports fréquents peuvent donc faire renvoyer une vue complète à la plupart des actualisations : ajouter 25 ou 125 fois la taille mesurée d’une vue par seconde. Les 2 000 révisions conservées par le [moteur](../application/backend/workspace/engine.ts) couvrent environ **9,8 s** ou **2,0 s** aux cadences calculées si chaque transaction produit une révision. Une modification fondée sur une révision plus ancienne peut recevoir un HTTP 409. La collecte toutes les 5 s et la lecture toutes les 4 s peuvent aussi donner près de 9 s d’ancienneté à l’écran avant traitement, au-delà des 5 s attendues au cadrage.

Avant mise en production, éprouver la charge mixte avec des jeux de données réalistes, des rafales de reconnexion, des PDF concurrents, des imports, la collecte et une coupure du puits. Mesurer les tailles de vue et de rapport, la fraîcheur à l’écran, les conflits d’édition, les temps de réponse, le verrou, le CPU, la RAM, les IOPS, le débit des disques et la croissance des logs et de la base. Séparer les migrations de production du réamorçage du jeu de départ : en production, le serveur refuse une version de données incompatible tant que la réinitialisation est désactivée. La procédure de migration reste à définir. À 5 000 postes, qualifier en priorité des écritures de supervision moins sérialisées et des lectures UI plus ciblées. Les lots ne sont utiles que si l’agent les permet, si le temps par rapport sous verrou diminue et si le délai des interventions reste compatible.

### 6.4. Extension à 5 000 postes

Pour préparer le palier de **5 000 postes**, prévoir **cinq VM ORION**. VM 1 porte l’entrée (4 vCPU, 16 Go). Deux VM back (8 vCPU, 32 Go chacune) servent les appels répartis par HAProxy. Une VM exécute PostgreSQL et Logstash (20 vCPU, 80 Go). Les deux back joignent PostgreSQL sur le réseau privé, en TLS sur TCP 5432, et envoient leurs logs au collecteur. La VM de stockage (2 vCPU, 8 Go) porte 400 Go pour les fichiers de logs et, sous les mêmes conditions de qualification qu’au premier palier, 500 Go SSD pour les données PostgreSQL. Chaque VM reçoit 50 Go de disque système. La file du collecteur reste locale sur la VM qui exécute PostgreSQL. En cas de repli, le SSD PostgreSQL est attaché à la VM qui exécute la base. Total : **42 vCPU, 168 Go de RAM et 1 150 Go de disques actifs**. VM 2 devient le premier back et une cinquième VM accueille le second. Les essais détermineront si le gabarit de VM 1 et les deux back suffisent après adaptation du traitement de la supervision.

### 6.5. Deux solutions pour administrer les postes Windows

Le choix porte sur l’administration des postes Windows. Le ministère des Armées fournit l’hébergement sur le C1NP. Les deux options doivent couvrir l’inventaire logiciel, la supervision des processus utilisateur, leur arrêt, l’installation et la désinstallation de logiciels, la réinitialisation des postes et la remontée du résultat à ORION. Le coût de licence est calculé sur le parc géré, distinct de la charge de supervision mesurée en postes actifs.

#### Option A — Microsoft Configuration Manager installé sur le réseau du ministère

Configuration Manager fournit un client Windows, un serveur de site, une base SQL Server et des points de distribution pour les logiciels et les images. Microsoft documente les installations et désinstallations, le déploiement de Windows et la prise en main à distance. Pour ORION, vérifier sur un pilote les opérations réellement disponibles via le service d’administration, les droits du compte d’intégration et la remontée de l’état des interventions. [Gestion des clients](https://learn.microsoft.com/en-us/intune/configmgr/core/understand/fundamentals-of-client-management-tasks) · [Service d’administration](https://learn.microsoft.com/en-us/intune/configmgr/develop/adminservice/usage) · [Prise en main à distance](https://learn.microsoft.com/en-us/intune/configmgr/core/clients/manage/remote-control/introduction-to-remote-control).

CMPivot interroge les postes connectés à la demande. La documentation ne garantit ni une télémétrie continue de tous les processus toutes les cinq secondes, ni le délai d’arrêt automatique attendu par ORION. Le pilote doit décider si un agent de supervision complémentaire est nécessaire. Dans ce cas, conserver Configuration Manager pour les logiciels et les images, puis estimer séparément le développement de la collecte et de l’arrêt local. [Fonctionnement de CMPivot](https://learn.microsoft.com/en-us/mem/configmgr/core/servers/manage/cmpivot).

| Hypothèse de licence annuelle | 1 000 postes gérés | 5 000 postes gérés |
| --- | ---: | ---: |
| Droits Configuration Manager et service ministériel existants, si le parc est intégralement couvert | 0 € d’achat de licences supplémentaires | 0 € d’achat de licences supplémentaires |
| Achat d’un abonnement Microsoft Intune Plan 1 Device par poste, si le marché permet d’utiliser ce droit pour Configuration Manager | **24 290 € HT/an** | **121 450 € HT/an** |

Les conditions de produit Microsoft listent Intune P1 for Devices parmi les licences d’accès à Configuration Manager. Le calcul prend le tarif public français de **24,29 € HT par poste et par an** pour la référence annuelle, sans remise de volume, au 13 novembre 2026. Faire confirmer le droit d’usage sur les postes partagés, l’éligibilité du marché ministériel et le prix en volume par le titulaire du marché. Cette estimation couvre la licence client. Les éventuelles licences Windows Server, le support et l’intégration sont à confirmer séparément. Vérifier aussi les droits SQL Server réservés à l’usage du produit. [Conditions Microsoft](https://www.microsoft.com/licensing/terms/en-US/productoffering/SystemCenterConfigurationManager/allprograms) · [Tarif revendeur](https://www.senetic.fr/product/CFQ7TTC0LCH4-0004_P1YP1Y).

Réutiliser le service ministériel, s’il existe, permet de rester dans les quatre VM ORION. Une installation dédiée demande au minimum une VM Windows Server supplémentaire. Microsoft permet de placer la base SQL Server du site primaire sur le même serveur. Les points de distribution supplémentaires dépendent du réseau et de la taille des images. L’exploitant doit valider l’admission au CCT et les échanges nécessaires à la maintenance du produit, y compris la procédure de mise à jour hors ligne si elle est retenue. [Base de site](https://learn.microsoft.com/en-us/intune/configmgr/core/plan-design/hierarchy/plan-for-the-site-database) · [Maintenance hors ligne](https://learn.microsoft.com/en-us/intune/configmgr/core/servers/manage/use-the-service-connection-tool).

#### Option B — Agent Windows développé par l’équipe ORION

Créer un service Windows en C#/.NET qui envoie l’inventaire et les rapports de processus à l’API ORION. Le back autorise et suit les interventions. Le poste exécute les commandes métier prévues, telles que l’arrêt d’un processus ou l’installation d’un paquet approuvé, et renvoie le résultat associé à l’intervention. Prévoir une identité propre à chaque poste, la mise à jour signée de l’agent et le traitement des commandes déjà reçues après coupure. Le serveur de gestion reste le back ORION, sur les VM déjà dimensionnées.

Pour une réinitialisation complète, l’agent transmet la demande à un mécanisme de réimagerie autorisé, capable de fonctionner pendant l’effacement de Windows. Le retour de résultat doit être vérifié après réenrôlement. L’estimation suppose que le ministère fournit ce mécanisme, l’infrastructure de signature et un canal de déploiement de l’agent. Si la réimagerie est indisponible, le périmètre et l’effort d’une chaîne de réinitialisation restent à estimer avant de comparer les deux offres à couverture égale.

| Lot de travail | Charge estimée |
| --- | ---: |
| Analyse et prototype Windows : versions, sessions, droits, réseau, réimagerie | 8 à 12 j-p |
| Développement de l’agent : inventaire, processus, rapports et reprise réseau | 15 à 22 j-p |
| Développement des interventions : arrêt, installation, désinstallation, résultats | 12 à 18 j-p |
| Intégration ORION et raccordement au mécanisme de réimagerie | 10 à 15 j-p |
| Empaquetage, signature, enrôlement et mise à jour de l’agent | 8 à 12 j-p |
| Recette, pilote en salle, essais de charge à 1 000 et 5 000 postes, documentation d’exploitation | 12 à 18 j-p |
| **Total de réalisation estimé** | **65 à 97 j-p** |

Les jours-personnes mesurent la charge de l’équipe. Ils excluent les délais d’accès au réseau et d’autorisation, la maintenance récurrente et une éventuelle refonte du moteur ORION pour tenir la charge (§ 6.3). La prise en main graphique et un catalogue de correctifs généraliste sont hors de ce périmètre. Le pilote vérifie la fraîcheur à l’écran, les opérations sur plusieurs sessions Windows, les reprises après coupure et le résultat de la réinitialisation. Une mesure sur un parc réel est nécessaire avant d’annoncer la capacité à 1 000 ou 5 000 postes.

## 7. Trajectoire vers la cible

| Architecture réelle | Cible | Travail nécessaire |
| --- | --- | --- |
| Poste de présentation et Docker Compose | Quatre VM C1NP pour le premier palier | Qualifier le système, les services de l’hôte et les environnements |
| Keycloak et annuaire OpenLDAP locaux | MindefConnect | Obtenir le contrat, configurer les environnements et qualifier les attributs et parcours |
| Émulateur de postes | Configuration Manager ou agent Windows ORION | Vérifier l’existant, qualifier la réimagerie et tester les interventions et la supervision (§ 6.5) |
| Vite et son proxy de développement en local ; Apache et HAProxy prévus sur VM | Serveur front et reverse proxy HTTPS | Confirmer les versions et les modalités de déploiement sur le C1NP |
| Express sur la boucle locale | Serveur back derrière le reverse proxy | Configurer les contrôles de santé et le déploiement |
| `/api/health` et `/api/infos` | Points techniques restreints à l’exploitation | Aligner le contrat cible et filtrer les accès |
| Collecte du démonstrateur | Collecteur sur VM 3, fichiers de logs sur VM 4 | Qualifier la collecte, le partage, la rétention et l’accès |
| Secrets de configuration locale | Gestion des secrets | Choisir le coffre, l’injection, la rotation et la révocation |
| Volumes Docker locaux | Persistance exploitée et sauvegardée | Définir sauvegardes, restaurations, RPO, RTO et essais réguliers |

## 8. Sources

- [Consignes du projet](01-CONSIGNES.md), dossier d’architecture technique ;
- [Questions de cadrage](02-CADRAGE.md), §§ 18 à 21 ;
- [Compte rendu des entretiens](03-COMPTE-RENDU-ENTRETIENS.md), §§ 1.6 et 3.3 ;
- [Règles de gestion](04-REGLES-DE-GESTION.md) ;
- application : dépendances (`package.json`, `package-lock.json`), infrastructure (`infra/compose.yaml`, realm Keycloak, annuaire LDAP) et serveur (`backend/`) ;
- répartition des VM, orientation de l’utilisateur du 10 novembre 2026, révisée le 11 novembre 2026 : bascules automatiques sans action manuelle, HAProxy séparé des serveurs web, journaux centralisés sur le système de fichiers de la VM 10 et absence de DNS limitée à l’accès externe ; technologies conformes au CCT, consigne et document transmis le 11 novembre 2026. Absence de DNS sur les VM à la demande de l’utilisateur ; produits de la colonne C1NP du CCT, hormis Docker et les substituts des services du réseau cible, puis architecture simplifiée sans haute disponibilité, un rôle par VM, Keycloak et OpenLDAP regroupés, sans copie hors site, s’agissant d’une démonstration, relance ailleurs des services sans données, VM Debian 13 fournies avec Docker et sans Ansible, précisés le 11 novembre 2026 ; séparation stricte des persistances ORION et Keycloak, représentation des volumes et accès interne aux journaux précisés le 11 novembre 2026 ;
- retours du client du 12 novembre 2026, transmis par l’utilisateur : PDF d’état des lieux générés à la demande par le serveur back, sans stockage S3 ;
- Cadre de cohérence technique du ministère des Armées, CCT 2026-2027, version 3.7, édition 1 du 17 février 2026 (document NP transmis par l’utilisateur) : §§ 3.2.1.2, 3.2.2, 3.3.6, 4.8.3, 5.1.1, 5.1.3 et 5.1.6 et annexe 8.8.2 « pile logicielle », colonne C1NP ;
- [Identité IP dans les certificats TLS](https://www.rfc-editor.org/rfc/rfc9525.html#section-6.4), [réseau overlay chiffré de Swarm](https://docs.docker.com/engine/network/drivers/overlay/#encrypt-traffic-on-an-overlay-network), [contraintes de placement](https://docs.docker.com/engine/swarm/services/#placement-constraints) et [pilote syslog de Docker](https://docs.docker.com/engine/logging/drivers/syslog/) ;
- [Manuel HAProxy 3.2](https://docs.haproxy.org/3.2/configuration.html), [routage des chemins React dans Apache](https://httpd.apache.org/docs/2.4/mod/mod_dir.html#fallbackresource) et [Logstash 8.19](https://www.elastic.co/guide/en/logstash/8.19/index.html) ;
- stockage des données sur une VM dédiée, hors Swarm, à deux disques, partagée en NFSv4 pour que Swarm relance la base sur une autre VM avec ses données : orientation de l’utilisateur du 12 novembre 2026, sur conseil d’un formateur ; le même jour, l’utilisateur demande des secrets gérés par Docker Swarm, des volumes du pilote `local` de type `nfs` et des logs sur ce stockage, sans VM dédiée à Logstash ;
- managers Swarm sans processus applicatif, répartition des dix VM orion-1 à orion-10 et deux disques de stockage, données et logs : décisions de l’utilisateur du 12 novembre 2026 ; le même jour, l’utilisateur transmet la configuration DNS de son formateur (BIND dans Swarm, volumes NFS), retient le domaine `orion.internal`, au nom de l’application, ORION, et demande de réarranger les VM avec le DNS sur orion-1 et orion-2 ; puis il place le DNS et les reverse proxies sur les managers et isole PostgreSQL, Logstash et l’identité, chacun relancé par Swarm si sa VM tombe ;
- architecture réelle calée au maximum sur le CCT, avec une VM d’administration et des technologies hors CCT qui la simplifient, exclues de la cible, et déploiement continu par un runner installé sur une VM : orientations de l’utilisateur du 13 novembre 2026 ; [runners GitHub Actions auto-hébergés](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners) et [runner en service](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/configuring-the-self-hosted-runner-application-as-a-service) ;
- accès direct par une adresse IP, point d’entrée unique en HTTPS sur le port par défaut, sans DNS ni second reverse proxy : décision de l’utilisateur du 13 novembre 2026 ;
- [Volumes NFS de Docker](https://docs.docker.com/engine/storage/volumes/#create-a-service-which-creates-an-nfs-volume) et [PostgreSQL sur NFS](https://www.postgresql.org/docs/17/creating-cluster.html#CREATING-CLUSTER-NFS) ;
- [Contextes du client Docker](https://docs.docker.com/engine/manage-resources/contexts/) et [montages de dossiers de l’hôte](https://docs.docker.com/engine/storage/bind-mounts/) ;
- [Keycloak derrière un reverse proxy](https://www.keycloak.org/server/reverseproxy) ;
- [Gestion des utilisateurs et fédération Keycloak](https://www.keycloak.org/docs/latest/server_admin/), [base de données Keycloak](https://www.keycloak.org/server/db) et [limites des exports de realm](https://www.keycloak.org/server/importExport) ;
- [Secrets Docker Swarm](https://docs.docker.com/engine/swarm/secrets/), [verrouillage des managers](https://docs.docker.com/engine/swarm/swarm_manager_locking/), [déploiement d’une pile Swarm](https://docs.docker.com/engine/swarm/stack-deploy/), [maillage de routage Swarm](https://docs.docker.com/engine/swarm/ingress/) ;

## Annexe A — Fonctionnement de Keycloak

### A.1. Rôle

Keycloak est un serveur de gestion des identités et des accès, distribué en logiciel libre. Il centralise l’authentification des utilisateurs pour plusieurs applications : une application ne manipule pas les mots de passe et délègue la connexion à Keycloak, qui lui renvoie une identité vérifiée sous forme de jetons signés. Une même session Keycloak permet l’authentification unique (SSO) sur toutes les applications qui lui font confiance.

Keycloak implémente les protocoles standard OpenID Connect (OIDC), construit sur OAuth 2.0, et SAML 2.0. Une application compatible OIDC peut donc changer de fournisseur d’identité sans modifier son code, en changeant seulement l’adresse du fournisseur et les paramètres de son client.

### A.2. Concepts

| Concept | Définition |
| --- | --- |
| Realm | Espace isolé regroupant utilisateurs, clients, rôles, paramètres de connexion et thèmes. Un realm ne voit pas les données d’un autre. |
| Client | Application enregistrée dans un realm et autorisée à demander l’authentification d’un utilisateur. Il est public (navigateur, mobile) ou confidentiel (serveur capable de garder un secret). |
| Utilisateur | Identité authentifiable : identifiant, adresse électronique, attributs et moyens d’authentification. |
| Rôle et groupe | Droits attribués aux utilisateurs, au niveau du realm ou d’un client, et transmis dans les jetons si l’application les exploite. |
| Portée (scope) | Ensemble d’informations demandées par le client, par exemple `openid`, `profile` ou `email`. |
| Flux d’authentification | Enchaînement configurable des étapes de connexion : formulaire, second facteur, conditions. |
| Fédération et courtage | Raccordement à un annuaire existant (LDAP, Active Directory) ou délégation à un autre fournisseur d’identité (OIDC, SAML). |
| Thème | Apparence des pages de connexion, de compte et d’administration. |

### A.3. Connexion par OpenID Connect

Le flux recommandé pour une application web est **Authorization Code**, complété par **PKCE** :

1. L’application redirige le navigateur vers le point d’autorisation de Keycloak, en indiquant son client, l’adresse de retour, les portées, un `state` contre la falsification de requête, un `nonce` contre le rejeu et un défi PKCE.
2. Keycloak authentifie l’utilisateur, ou reconnaît sa session SSO existante.
3. Keycloak redirige le navigateur vers l’adresse de retour enregistrée, avec un code d’autorisation à usage unique et de courte durée.
4. Le serveur de l’application échange ce code auprès du point de jeton de Keycloak, en présentant le vérificateur PKCE et, pour un client confidentiel, son secret.
5. Keycloak renvoie un jeton d’identité, un jeton d’accès et éventuellement un jeton de rafraîchissement.
6. L’application vérifie la signature et l’expiration des jetons, ainsi que le `state` et le `nonce`, puis ouvre sa propre session.

Les jetons sont des JWT signés par les clés du realm. Leur vérification ne demande pas d’appel à Keycloak : l’application lit les clés publiques publiées par le realm.

| Jeton | Usage |
| --- | --- |
| Jeton d’identité | Prouve à l’application qui s’est authentifié (`sub`, adresse, nom). |
| Jeton d’accès | Autorise des appels à une API au nom de l’utilisateur. |
| Jeton de rafraîchissement | Obtient de nouveaux jetons sans nouvelle saisie, tant que la session Keycloak est valide. |

Les flux implicite et par mot de passe direct (« Resource Owner Password Credentials ») sont déconseillés : ils exposent les jetons ou les mots de passe à l’application.

### A.4. Découverte, sessions et déconnexion

Chaque realm publie ses métadonnées à l’adresse `/.well-known/openid-configuration` : émetteur (`issuer`), points d’autorisation, de jeton et de fin de session, clés publiques. Une application configurée avec l’émetteur découvre automatiquement le reste.

Keycloak conserve sa propre session SSO, distincte de celle de l’application. Une déconnexion complète ferme les deux : l’application détruit sa session, puis redirige le navigateur vers le point de fin de session de Keycloak.

### A.5. Administration, persistance et fédération

Keycloak s’administre par une console web et par une API REST d’administration, qui permet d’automatiser la création des realms, clients et utilisateurs. Un realm peut être exporté et importé au format JSON.

En exploitation, Keycloak conserve sa configuration, ses utilisateurs et ses sessions persistantes dans une base de données relationnelle ; plusieurs instances partageant la même base forment un cluster. Les identités peuvent aussi rester dans un annuaire LDAP fédéré, en lecture seule ou en écriture : Keycloak y vérifie les mots de passe et en lit les attributs.

### A.6. Modes d’exécution

| Mode | Commande | Usage |
| --- | --- | --- |
| Développement | `start-dev` | HTTP autorisé, base embarquée, configuration permissive ; réservé aux postes de développement. |
| Production | `start` | HTTPS et nom d’hôte obligatoires, base de données externe, configuration optimisée au démarrage. |

En production, Keycloak est généralement placé derrière un proxy inverse HTTPS ; ses secrets, ses clés de signature et sa base sont sauvegardés et protégés comme des éléments critiques.

### A.7. Références

- [Documentation officielle de Keycloak](https://www.keycloak.org/documentation).
- [Spécification OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html).
- [RFC 7636 — PKCE](https://www.rfc-editor.org/rfc/rfc7636).
