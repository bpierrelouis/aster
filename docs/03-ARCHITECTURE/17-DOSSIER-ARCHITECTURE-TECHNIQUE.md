# Dossier d’architecture technique (DAT) — ORION

**Date de référence :** 13 novembre 2026

**Périmètre :** contexte et contraintes, justification des briques, architecture réelle sur VM, versions des technologies, architecture cible et configurations de déploiement.

## 1. Objet du document

ORION est une application web destinée aux écoles de formation. Elle centralise la gestion du parc, les remontées utilisateur, la supervision des postes Windows, les demandes d’intervention à distance et le recensement mobile du matériel.

Ce dossier présente deux architectures :

- **l’architecture cible**, qui décrit le système attendu dans son environnement d’exploitation ;
- **l’architecture réelle**, qui correspond au système effectivement développé, conteneurisé et présenté par l’équipe.

L’architecture réelle décrit le déploiement du démonstrateur sur dix VM. Keycloak et OpenLDAP y tiennent lieu de MindefConnect. Un processus Node.js simule les postes Windows et **M42**, le futur agent de supervision et d’administration que l’équipe ASTER développerait si cette option était retenue : il remonte leur état, reçoit les interventions, les exécute sur l’état simulé et renvoie leurs résultats. M42 fait référence à Messier 42, la nébuleuse d’Orion ; l’agent n’est pas encore développé.

## 2. Contexte et contraintes structurantes

Les contraintes structurantes sont les suivantes :

- l’interface et les fonctions métier sont réparties entre un serveur front et un serveur back ;
- l’application, non protégée (NP), est hébergée sur le C1NP (cloud maîtrisé non protégé du ministère des Armées) ;
- les utilisateurs s’authentifient avec MindefConnect, hébergé sur le C1NP ;
- HAProxy constitue l’unique point d’entrée HTTPS ; il distribue les requêtes vers le serveur front, le serveur back et le fournisseur d’identité ;
- le système dispose d’un puits de logs et expose les points d’accès `/api/health` et `/api/infos` ;
- PostgreSQL conserve les données applicatives ;
- les PDF d’état des lieux sont produits à la demande par le serveur back et ne sont pas conservés ;
- les postes administrés utilisent Windows et le navigateur attendu est Firefox ;
- la solution d’administration des postes Windows reste à déterminer.
- les téléphones de recensement ne joignent jamais directement le réseau d’ORION : ils passent par un relais public et un connecteur sortant.

## 3. Justification des briques

| Besoin | Choix retenu | Alternative considérée | Justification |
| --- | --- | --- | --- |
| Interface interactive | React 19, React Router et TypeScript | Vue 3 | React et Vue répondent tous deux au besoin. React est retenu pour son écosystème et son vivier de compétences plus étendus : dans l’enquête Stack Overflow 2026, 41,5 % des 10 281 répondants déclarent avoir largement utilisé React au cours de l’année, contre 17,2 % pour Vue. Ce choix facilite la maintenance, le recrutement et l’accès à des bibliothèques éprouvées pour une interface riche en écrans et en interactions. |
| Règles métier et API | Node.js 22, Express 5 et TypeScript | Java avec Spring Boot | TypeScript fournit des contrats typés communs au front et au back et permet de partager les formats et référentiels. Node.js exécute directement le TypeScript du serveur ; Express suffit au back unique et figure dans la pile recommandée du CCT. Java ajouterait une seconde chaîne de développement et dupliquerait les contrats sans besoin fonctionnel ni exigence de charge qui le justifie. |
| Service des fichiers de l’interface | Apache HTTP Server | NGINX | Apache est prescrit par le CCT pour le serveur HTTP et sert uniquement les fichiers construits de React. Aucun besoin propre à ORION ne justifie NGINX. |
| Entrée HTTPS et répartition | HAProxy | Reverse proxy porté par Apache ou NGINX | HAProxy est la seule entrée, termine TLS et répartit les requêtes vers Apache, Express et Keycloak. Cette séparation garde Apache limité au service des fichiers et suit le CCT. |
| Identité | MindefConnect en cible ; Keycloak et OpenLDAP dans l’architecture réelle | Authentification développée dans ORION | OIDC sépare l’authentification des comptes et profils ORION. Le flux Authorization Code utilise PKCE, `state` et `nonce` ; le fournisseur peut changer par configuration sans déplacer les droits applicatifs. |
| Sessions | `express-session` et `connect-pg-simple` dans PostgreSQL ORION | Session en mémoire du processus | Le navigateur ne reçoit qu’un cookie HttpOnly et plusieurs instances d’Express partagent les mêmes sessions. Un redémarrage d’instance ne déconnecte pas les utilisateurs. |
| Données structurées | PostgreSQL | Stockage propre à chaque instance | Les transactions et contraintes portent les données métier et les sessions. Une base partagée permet aux deux instances d’Express de rester sans état faisant autorité. |
| Administration des postes Windows | Configuration Manager existant ou agent Windows M42 développé par ASTER, à arbitrer | — | Dans les deux options, le poste reste l’origine des processus, installations et résultats ; Express autorise les demandes et en suit l’exécution par l’API des postes. L’architecture réelle simule ce circuit complet. |
| Recensement mobile | PWA hors ligne, relais public et connecteur sortant | Exposition de l’API ORION sur Internet | Le téléphone peut travailler sans réseau et ne crée aucune entrée vers les VM. Le relais conserve seulement les échanges chiffrés ; le connecteur les relève depuis le réseau d’ORION et PostgreSQL ORION reste l’autorité. |
| Collecte des journaux | Logstash et fichiers centralisés | Journaux conservés uniquement sur chaque VM | La centralisation conserve un point de consultation commun et produit des fichiers lisibles directement sur la VM de stockage. Le mode non bloquant évite qu’une panne du collecteur arrête les services. |

L’architecture réelle se cale au maximum sur les produits autorisés pour le C1NP par le CCT 2026-2027 (version 3.7). Les exceptions propres au démonstrateur sont identifiées au § 4.5 et ne sont pas reportées dans la cible.

## 4. Architecture réelle

### 4.1. Vue d’ensemble

Dans le déploiement du démonstrateur, HAProxy constitue l’entrée unique, Apache sert l’interface React, Express porte l’API et les règles métier, PostgreSQL conserve les données et les sessions, Keycloak et OpenLDAP remplacent MindefConnect, et Logstash centralise les journaux. Le simulateur des postes Windows et de M42 utilise la même API que les futurs postes réels. Le recensement mobile est porté par le module externe RIGEL (« Reconnaissance d’identifiants graphiques et extraction par lecture ») : sa PWA et son relais public s’exécutent sur Hidora, tandis que son connecteur sortant est hébergé avec l’application.

### 4.2. Services applicatifs et persistance

Express ne conserve aucun état faisant autorité dans son processus. Les données métier, les sessions, les campagnes et constats de recensement et le journal de fusion résident dans PostgreSQL ORION. OpenLDAP conserve les identités du démonstrateur ; Keycloak réimporte son realm à la création du conteneur. Le relais RIGEL conserve dans PostgreSQL Hidora les instantanés et événements chiffrés ; le téléphone conserve dans IndexedDB l’appairage, l’instantané et les événements en attente. Ces deux copies servent au transport et au fonctionnement hors ligne : PostgreSQL ORION reste l’autorité. Les persistances et les ports du déploiement sont détaillés au § 4.5, sans répéter ici le tableau des VM.

### 4.3. Authentification

#### Rôle

Keycloak tient lieu de MindefConnect pour exercer le parcours de connexion OIDC d’ORION ; il n’est pas le fournisseur d’identité de la cible. Il authentifie l’utilisateur à partir de l’annuaire OpenLDAP et transmet le sujet (`sub`) et l’adresse électronique. ORION conserve les comptes, profils, écoles de rattachement et états actifs dans sa propre base ; le realm ne définit aucun rôle.

#### Déploiement

Sur les VM, l’image ORION de Keycloak 26.7.4 démarre en mode `start` et importe le realm `orion`, son client `orion-web` et la fédération LDAP à chaque création du conteneur. Keycloak utilise sa base embarquée H2, sans volume persistant : ses données internes et ses sessions sont perdues à la recréation du conteneur. Aucun paramètre ne le raccorde à PostgreSQL ORION. Les identités sont conservées par OpenLDAP sur les volumes NFS d’orion-10. La fédération est en écriture : une identité créée par Keycloak est enregistrée dans l’annuaire.

Le realm permet la connexion par adresse électronique, sans inscription ni réinitialisation de mot de passe.

#### Client OIDC

| Paramètre | Valeur |
| --- | --- |
| Client | `orion-web`, confidentiel |
| Flux | Authorization Code avec PKCE `S256` ; flux implicite et mot de passe direct désactivés |
| Portées | `openid`, `profile`, `email` |
| Adresse de retour | `/auth/callback` de l’interface ORION |

#### Parcours de connexion

1. Le navigateur demande `/auth/login` à Express via HAProxy.
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

### 4.4. Flux des données et des postes

- Le front appelle Express ; Express applique les droits puis écrit dans PostgreSQL ORION.
- Le simulateur des postes et de M42 publie les processus et applications installées sur `/api/agent/rapports`.
- Express renvoie dans cette réponse les interventions à exécuter.
- Le simulateur exécute les arrêts, installations, désinstallations et réinstallations sur l’état simulé, puis publie leur résultat sur `/api/agent/resultats`.
- Le téléphone charge la PWA et échange avec le relais Hidora en HTTPS. La campagne, le jeton et la clé sont portés par le fragment du QR code, qui n’est pas envoyé au relais.
- Le téléphone chiffre les instantanés et événements en AES-256-GCM et les conserve hors ligne dans IndexedDB jusqu’à leur synchronisation.
- Le connecteur interroge le relais en HTTPS par le proxy du réseau, transmet les événements à Express sur le réseau overlay, puis acquitte au relais ceux qu’ORION a intégrés.

### 4.5. Architecture réelle sur VM

Deux schémas décrivent le déploiement du démonstrateur : la [vue simplifiée](18-DIAGRAMMES-ARCHITECTURE.md#vue-simplifiée) présente les rôles et les échanges principaux ; la [vue complète](18-DIAGRAMMES-ARCHITECTURE.md#architecture-réelle-sur-vm) détaille chaque VM, ses services, conteneurs, ports, volumes et flux. Une flèche indique la destination d’un flux. Les versions et leur statut au CCT figurent au § 5.3.

**Principes retenus.**

- **Un rôle par VM.** Chaque rôle a ses propres VM : une panne ou une intervention sur l’un ne touche pas les autres. Les dix VM se répartissent ainsi : les managers (orion-1 à orion-3), dont orion-1 porte aussi l’entrée et orion-3 l’administration, l’application (orion-4 et orion-5), PostgreSQL (orion-6), l’identité (orion-7 : Keycloak et OpenLDAP, qui simulent ensemble MindefConnect), les logs (orion-8 : Logstash), une VM de secours (orion-9) et le stockage (orion-10).
- **Des rôles isolés, repris par une VM de secours.** PostgreSQL, l’identité et Logstash ont chacun leur VM. Si l’une tombe, Swarm recrée son service sur orion-9, qui retrouve ses données sur le stockage. Le déploiement vide orion-9 le temps de placer les services : chacun démarre ainsi sur sa VM, et un service repris par orion-9 rejoint la sienne au déploiement suivant.
- **Des managers à l’entrée.** Les trois managers Swarm, orion-1 à orion-3, dirigent le cluster. orion-1 porte en plus l’entrée, HAProxy ; orion-3 porte l’administration : le runner du déploiement continu. Deux managers sur trois suffisent pour que le cluster continue de fonctionner.
- **Une adresse, sans DNS.** Les utilisateurs joignent ORION directement par l’adresse d’orion-1, `https://172.16.131.188`, sur le port HTTPS par défaut, sans configurer de DNS sur leur poste : ce point d’entrée unique sert l’interface, l’API et la connexion. Les VM utilisent le DNS du réseau de formation.
- **Doublement là où il est simple.** Apache et Express, sans données, ont deux instances actives chacun, sur deux VM : la perte de l’une ne coupe pas le service. HAProxy, seule entrée, a une instance, relancée sur orion-1, dont l’adresse est celle des utilisateurs : si orion-1 tombe, ORION est inaccessible jusqu’à son retour. Les autres services ont une seule instance, relancée automatiquement s’il s’arrête ou au redémarrage de sa VM, et recréée sur une autre VM si la sienne tombe : le simulateur des postes et de M42 sur l’autre VM de l’application, PostgreSQL, l’identité et Logstash sur la VM de secours, où ils retrouvent leurs données (§ 4.6). Aucune action manuelle n’est nécessaire.
- **Un stockage pour toutes les données.** Les données de PostgreSQL et d’OpenLDAP et les logs centralisés sont sur orion-10, hors Swarm, sur deux systèmes de fichiers ext4 partagés en NFSv4 : l’un pour les données, l’autre pour les logs. Ce sont des volumes Docker du pilote `local`, de type `nfs` : la VM qui exécute le service monte son volume, et un service recréé sur une autre VM retrouve ainsi ses données. Le collecteur s’exécute sur orion-8 et les fichiers centralisés résident sur orion-10.
- **Les VM fournies, telles quelles.** Les dix VM sont sous Debian 13, avec Docker déjà installé. Les services sont des conteneurs, gérés par une seule pile Docker Swarm, `orion` ; seuls chrony (orion-1), le runner GitHub Actions (orion-3) et le serveur NFS (orion-10) sont des services de l’hôte. orion-3 sert de VM d’administration : son runner déploie chaque version publiée par l’intégration continue ; aucun outil comme Ansible n’est ajouté. L’opérateur administre depuis son poste avec le client Docker, SSH et quelques scripts.
- **Technologies du CCT.** L’architecture réelle se cale au maximum sur la cible : pour chaque fonction, elle utilise un produit de la colonne C1NP de l’annexe « pile logicielle » du CCT 2026-2027 (version 3.7). Elle fait quatre exceptions, qui simplifient le démonstrateur et sont exclues de l’architecture cible : le système des VM fournies pour la démonstration (Debian 13, avec Docker déjà installé), qui n’existera pas sur le C1NP, Docker Engine et Swarm, les substituts de MindefConnect (Keycloak et OpenLDAP) et le runner GitHub Actions du déploiement continu. Les images sont épinglées ; ORION construit les siennes à partir des images officielles `httpd:2.4` et `node:22`, tandis qu’OpenLDAP utilise l’image tierce `osixia/openldap`. OpenSSH, systemd et `systemd-timesyncd` sont traités comme des composants de Debian 13, de même que le serveur et le client NFS du noyau Linux (paquets `nfs-kernel-server` et `nfs-common`), dont le statut au CCT reste à vérifier (§ 5.3).

| Nom d’hôte | Rôle | Service | Exécution | Swarm | Ports d’écoute | Volume |
| --- | --- | --- | --- | --- | --- | --- |
| orion-1 | Manager et entrée | Manager Docker Swarm ; HAProxy ; chrony | HAProxy en conteneur, une instance, ports publiés sur l’hôte ; chrony sur l’hôte | Manager | `2377/TCP` ; HTTPS `443` ; `8444` pour l’administration ; NTP `123/UDP` | — |
| orion-2 | Manager | Manager Docker Swarm | Démon Docker | Manager | `2377/TCP` | — |
| orion-3 | Manager et administration | Manager Docker Swarm ; runner GitHub Actions | Démon Docker ; runner, service de l’hôte (systemd) | Manager | `2377/TCP` ; aucun pour le runner | — |
| orion-4, orion-5 | Application | Apache HTTP Server et build React ; Express sur Node.js ; simulateur des postes et de M42 ; connecteur RIGEL | Conteneurs : Apache et Express, une instance par VM ; simulateur et connecteur, une instance chacun | Workers | HTTP `8080` et `3001`, réseau overlay ; aucun port publié par le connecteur | — |
| orion-6 | PostgreSQL | PostgreSQL | Conteneur | Worker | TCP `5432`, réseau overlay | Volume NFS `pg-nfs`, sur orion-10 |
| orion-7 | Identité (substituts) | Keycloak et OpenLDAP | Deux conteneurs | Worker | HTTP `8080` et LDAP `389`, réseau overlay | Volumes NFS `ldap-data-nfs` et `ldap-config-nfs`, sur orion-10 |
| orion-8 | Collecte des logs | Logstash | Conteneur | Worker | TCP TLS `6514`, publié par le maillage de routage | Volume NFS `logs-nfs`, sur orion-10 |
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
10. Le téléphone charge la PWA RIGEL et synchronise ses blocs chiffrés avec le relais RIGEL sur Hidora, en HTTPS.
11. Le connecteur RIGEL joint le relais en HTTPS par le proxy du réseau et Express en HTTP `3001` sur l’overlay chiffré ; aucun flux entrant n’est ouvert vers ORION.

#### Réseau, adresses et ports

Le réseau des VM est `172.16.128.0/20` ; son DNS, `172.16.143.251` (domaine `formation`), est celui des VM. Le montage local et la cible C1NP restent distincts.

| Nom d’hôte | IPv4 | Affectation prévue |
| --- | --- | --- |
| orion-1 | 172.16.131.188 | Manager et entrée ; horloge chrony |
| orion-2 | 172.16.131.133 | Manager |
| orion-3 | 172.16.131.193 | Manager et administration : runner du déploiement continu |
| orion-4 | 172.16.131.208 | Application |
| orion-5 | 172.16.131.142 | Application |
| orion-6 | 172.16.131.131 | PostgreSQL |
| orion-7 | 172.16.131.137 | Identité : Keycloak et OpenLDAP |
| orion-8 | 172.16.131.146 | Logs : Logstash |
| orion-9 | 172.16.131.190 | Secours de PostgreSQL, de l’identité et des logs |
| orion-10 | 172.16.131.197 | Stockage NFS, hors Swarm |

**Adresse d’entrée.** ORION n’a pas de nom de domaine : les utilisateurs saisissent l’adresse d’orion-1, `https://172.16.131.188`, sans régler de DNS sur leur poste. HAProxy y sert, sur le port `443`, l’interface, l’API (`/api`, `/auth`) et la connexion Keycloak (`/realms`, `/resources`) ; la console de Keycloak, refusée sur ce port, est servie sur `8444`. Les VM résolvent les noms par le DNS du réseau de formation ; à l’intérieur du cluster, les services se joignent par la résolution interne de Docker.

| Adresse | Service | Accès |
| --- | --- | --- |
| `https://172.16.131.188` (port `443`) | ORION : interface, API et connexion (Keycloak, émetteur OIDC) | Utilisateurs et Express |
| `https://172.16.131.188:8444/admin/` | Console d’administration de Keycloak | Réseau des VM, sans filtrage dédié |
| `https://rigel.sh1.hidora.net` (port `443`) | Relais public RIGEL sur Hidora | Téléphones et connecteur RIGEL par le proxy du réseau |
| IPv4 de chaque VM du tableau ci-dessus, port `22/TCP` | Administration par SSH des dix VM | Réseau d’administration seulement |

L’émetteur OIDC est `https://172.16.131.188/realms/orion` et le retour OIDC `https://172.16.131.188/auth/callback`. Sur Hidora, le relais RIGEL joint sa base PostgreSQL sur le port `5432/TCP`. Le collecteur reçoit les logs sur le port `6514/TCP` avec TLS : le maillage de routage de Swarm publie ce port sur chaque VM du cluster, y compris sur son adresse locale, et le transmet à Logstash, quelle que soit la VM qui l’exécute ; le pilote `syslog` de chaque VM joint donc `127.0.0.1:6514`. Le certificat de HAProxy porte l’adresse d’orion-1, celui du collecteur l’adresse `127.0.0.1` ; leur autorité doit être reconnue par Firefox, par Node.js et par le pilote `syslog`. L’horloge est jointe sur `172.16.131.188:123/UDP`. Les VM qui montent le stockage le joignent sur `172.16.131.197:2049/TCP` (NFSv4). SSH utilise chacune des dix IPv4 sur `22/TCP`, depuis le réseau d’administration. Le filtrage reste à qualifier.

HAProxy termine le TLS. Il publie ses ports sur l’hôte d’orion-1 et joint les services par leur nom sur le réseau overlay de Swarm, chiffré (option `encrypted`) : `apache:8080`, `api:3001` et `keycloak:8080`. L’absence de HTTPS entre HAProxy et ces trois services est donc volontaire : le chiffrement est assuré une fois au niveau du réseau interne, sans distribuer ni renouveler un certificat dans chaque conteneur. Le navigateur utilise toujours HTTPS pour l’interface, l’API et Keycloak. Le port `443` transmet `/realms` et `/resources` à Keycloak et refuse les chemins de sa console, servie uniquement sur `8444`. Les PDF d’état des lieux passent par le port `443`, comme le reste de l’API.

La console de Keycloak est déclarée sur l’adresse d’administration `https://172.16.131.188:8444/admin/`. HAProxy y termine TLS et transmet les requêtes à Keycloak sur le réseau overlay chiffré. Le démonstrateur ne filtre pas cet accès : le port reste joignable depuis le réseau des VM. L’adresse `172.16.131.188` doit être exclue du proxy du navigateur et l’autorité du certificat reconnue. Le compte est `keycloak-admin` ; son mot de passe aléatoire se lit sur la VM qui exécute Keycloak avec `docker exec $(docker ps -qf name=orion_keycloak) cat /run/secrets/KC_BOOTSTRAP_ADMIN_PASSWORD`.

Express utilise pour Keycloak la même adresse que le navigateur : il le joint donc aussi par HAProxy, sur `443`. Il joint PostgreSQL directement par le réseau overlay (`postgres:5432`), et le simulateur joint Express par ce même réseau (`api:3001`). Keycloak lit l’annuaire par `ldap:389`. La résolution de noms interne de Docker sert à l’intérieur du cluster.

Le filtrage autorise :

- `443` vers orion-1 depuis le réseau des utilisateurs ;
- `8444` vers orion-1 depuis le réseau des VM, sans filtrage dédié ; `22` vers les dix VM depuis le réseau d’administration ;
- `53/TCP et UDP` des VM vers le DNS du réseau ;
- entre les VM du cluster (toutes sauf orion-10) : `2377/TCP` vers les managers, `7946/TCP et UDP`, `4789/UDP` et le protocole IP 50 (ESP) du réseau overlay chiffré ;
- `6514/TCP` depuis le réseau des VM, sans filtrage dédié ; chaque pilote `syslog` joint sa propre adresse locale, puis le maillage de routage transmet le flux à la VM de Logstash ;
- `2049/TCP` d’orion-6 à orion-9 vers orion-10 (NFSv4) ;
- `123/UDP` des VM orion-2 à orion-10 vers orion-1, horloge de référence ;
- `22/TCP` d’orion-3 vers orion-1 (déploiement par le runner), et `8080/TCP` d’orion-3 vers le proxy du réseau (`172.16.0.1`), par lequel le runner joint GitHub en HTTPS.
- `8080/TCP` d’orion-4 et orion-5 vers le proxy du réseau (`172.16.0.1`), par lequel le connecteur RIGEL joint le relais Hidora en HTTPS ; aucune connexion n’est initiée du relais vers les VM.

#### Docker Swarm

La pile principale `orion`, décrite dans un fichier versionné et déployée avec `docker stack deploy`, contient les conteneurs nécessaires au fonctionnement d’ORION. Le connecteur RIGEL est isolé dans la pile complémentaire `orion-rigel` : une instance sur orion-4 ou orion-5, sans port publié. Cette pile est déployée après la principale sans conditionner son succès ; elle est retirée si aucun relais n’est configuré. La composition du cluster (managers, workers, étiquettes de nœud) ne relève pas de ces fichiers : elle est réglée par les commandes `docker swarm` et `docker node` du script de préparation. Chaque service redémarre automatiquement (`restart_policy`) ; au démarrage d’une VM, Docker relance ses conteneurs. Les services sont placés d’après des étiquettes de nœud : `orion=entree` pour orion-1 (HAProxy), `orion=application` pour orion-4 et orion-5, et une étiquette par rôle isolé : `pg=true` (orion-6), `identite=true` (orion-7) et `logs=true` (orion-8). orion-9 porte ces trois dernières étiquettes : Swarm peut y recréer chacun de ces services.

Apache et Express ont deux instances chacun, une par VM de leur groupe (`max_replicas_per_node: 1`) ; HAProxy en a une, sur orion-1 ; HAProxy répartit les requêtes entre les instances d’Apache et d’Express et écarte celle qui ne répond plus. Le simulateur a une instance, pour ne pas simuler deux fois les mêmes postes. PostgreSQL, Keycloak, OpenLDAP et Logstash ont une instance chacun : leurs volumes étant sur orion-10, Swarm les recrée sur orion-9 si leur VM tombe, et ils y retrouvent leurs données. Swarm ne sait pas préférer une VM à une autre : pour que chaque rôle isolé démarre sur sa VM et non sur orion-9, le script de déploiement vide orion-9 (`drain`) pendant le déploiement, si orion-6, orion-7 et orion-8 sont prêtes, puis la remet en service. Un service repris par orion-9 rejoint ainsi sa VM au déploiement suivant ; si deux VM isolées tombent en même temps, leurs services partagent orion-9. Une mise à jour arrête l’ancienne instance avant de démarrer la nouvelle (ordre `stop-first`, par défaut) : un volume n’est jamais utilisé par deux instances à la fois. Si une VM de l’application tombe, l’instance d’Apache ou d’Express qu’elle portait attend son retour ; l’autre instance assure le service. Si orion-1 tombe, HAProxy attend son retour. Au retour d’une VM, un redéploiement répartit de nouveau les services à une instance. HAProxy, le simulateur et Express se joignent par le nom des services : la VM qui les exécute importe peu.

orion-1, orion-2 et orion-3 sont managers : ils dirigent le cluster ; orion-1 porte aussi l’entrée et orion-3 l’administration. Deux managers sur trois suffisent pour que le cluster continue de fonctionner. orion-4 à orion-9 sont workers. orion-10 n’appartient pas au cluster : elle ne fait que partager ses disques.

Les images d’ORION (Apache avec le build React, Express, simulateur, connecteur RIGEL, relais RIGEL et Keycloak) sont construites et publiées sur Docker Hub par l’intégration continue, avec le commit pour étiquette. Le runner d’orion-3 déploie les images des VM ; le relais est publié indépendamment sur Hidora, sans conditionner le déploiement d’ORION. Chaque VM télécharge ses images, comme les images tierces, par le proxy du réseau. Chaque image est épinglée sur une version exacte. Le connecteur et le relais RIGEL sont donc mis à jour en sélectionnant une image immuable déjà publiée, sans réinstaller leurs composants sur l’hôte. Swarm revient automatiquement à l’image précédente si la mise à jour du connecteur échoue ; le relais revient à une étiquette antérieure par redéploiement sur Hidora. Les contrôles de santé d’Apache et d’Express vérifient que leur processus répond ; HAProxy écarte une instance applicative qui ne répond plus.

Express ne garde aucun état qui fasse autorité : l’espace de travail et les sessions sont dans PostgreSQL. Chaque écriture verrouille la ligne de révision, relit l’état et fusionne les modifications concurrentes grâce au journal des dernières révisions, conservé en base. Les deux instances servent donc indifféremment n’importe quel utilisateur, et un redémarrage ne déconnecte personne.

#### Logs

Chaque conteneur envoie ses logs au collecteur par le pilote `syslog` de Docker, au format syslog RFC 5424 exigé par le CCT, sur TCP TLS `6514`, à l’adresse locale de sa VM (`127.0.0.1`), que le maillage de routage transmet à Logstash. Le pilote fonctionne en mode non bloquant : une panne du collecteur ne bloque jamais un service démarré, mais les logs émis pendant l’interruption ne sont pas centralisés ; un conteneur créé pendant l’interruption échoue et Swarm le relance jusqu’au retour du collecteur. Docker en garde une copie locale, consultable sur la VM avec `docker logs`. Les logs du système de chaque VM, dont ceux du runner sur orion-3, restent dans journald, consultables par SSH.

Logstash 8.19.14 s’exécute dans un conteneur de la pile, en une instance, sur orion-8 (orion-9 s’il l’a repris). Il assure la collecte dans le démonstrateur et dans la proposition cible (§ 6). Il écrit les logs reçus dans le volume NFS `logs-nfs`, c’est-à-dire sur le disque des logs d’orion-10 (`/srv/orion/logs/conteneurs`) : un répertoire par service et un fichier par jour, lisibles directement sur le système de fichiers d’orion-10. L’opérateur les lit par SSH. S’il est recréé sur orion-9, Logstash poursuit l’écriture des mêmes fichiers. Aucun port de consultation web n’est ouvert. La durée de conservation et la purge des fichiers restent à fixer.

#### Administration et horloge

L’opérateur administre depuis son poste, sur le réseau d’administration, en se connectant en SSH à chaque VM. Utiliser des comptes nominatifs, des clés SSH, la vérification des clés d’hôte et une élévation `sudo` limitée ; désactiver la connexion SSH directe de root et l’authentification par mot de passe. Prévoir aussi l’accès à la console de l’hyperviseur pour une VM injoignable.

Depuis son poste, l’opérateur pilote le cluster avec le client Docker, relié par SSH à un manager : secrets, configurations et déploiement de la pile (`docker stack deploy`, sur orion-1). Un script court, remis avec la configuration, prépare les VM : nom d’hôte, serveurs DNS, horloge, autorité du pilote `syslog`, stockage d’orion-10 (disques, partages NFS), composition du cluster et secrets. Il peut être relancé : il amène un cluster existant à la répartition prévue, en promouvant les nouveaux managers avant de rétrograder les anciens. Rien de cela n’intervient en cas de panne.

**Déploiement continu.** orion-3 est la VM d’administration : elle porte un runner GitHub Actions 2.338.2, installé sur l’hôte depuis l’archive officielle et exécuté par systemd avec le compte des VM. Le runner n’écoute aucun port : il interroge GitHub en HTTPS, par le proxy du réseau, et reçoit le job de déploiement quand les tests, le vérificateur documentaire et la publication des images ont réussi sur la branche principale. Ce job lance le script de déploiement remis avec la configuration, qui joint orion-1 en SSH avec une clé propre au runner, autorisée sur orion-1 seulement : `docker stack deploy` de la pile `orion`, puis contrôle de la version servie par `https://172.16.131.188`. Le runner est hors de la pile, pour qu’un déploiement ne le redémarre jamais. Un second script l’installe une fois, depuis le poste de l’opérateur, avec le jeton d’enregistrement fourni par GitHub.

**Horloge.** Aucun serveur de temps n’est disponible. Les VM doivent pourtant avoir la même heure, à quelques secondes près : les jetons de connexion émis par Keycloak sont contrôlés par Express sur une autre VM, les deux instances d’Express datent les enregistrements, et Swarm vérifie les certificats échangés entre les VM. orion-1 sert donc d’horloge de référence : chrony, programme de synchronisation de l’heure, y est installé sur l’hôte et répond en NTP (`123/UDP`). Les VM orion-2 à orion-10 s’y règlent avec `systemd-timesyncd`, déjà présent dans Debian 13. L’heure commune peut dériver légèrement de l’heure réelle, sans effet sur ORION. Si orion-1 est indisponible, les horloges continuent de fonctionner et ne dérivent que lentement.

Aucune sauvegarde n’est prévue : il s’agit d’une démonstration, et les données de départ sont recréées au premier démarrage.

#### Secrets

Les secrets sont des secrets Docker Swarm : chiffrés et répliqués entre les managers, ils ne sont remis qu’aux conteneurs qui en ont besoin, sous forme de fichiers dans `/run/secrets`. Le script de démarrage de chaque image construite transmet ces valeurs au service ; le code n’a pas à changer.

| Secret | Services destinataires |
| --- | --- |
| Accès PostgreSQL | Express et PostgreSQL |
| Secret du client OIDC | Express ; même valeur enregistrée dans le client Keycloak |
| Secret de session | Express |
| Secret RIGEL (`RIGEL_SECRET`) | Express et connecteur RIGEL |
| Jeton du relais RIGEL | Connecteur RIGEL ; même valeur configurée sur le relais Hidora |
| Jeton des postes | Express et simulateur des postes |
| Compte de liaison LDAP et administration de Keycloak | Keycloak et OpenLDAP |
| Clé privée et certificat TLS | HAProxy et Logstash |

Tous les secrets de la pile, y compris les clés et certificats TLS de HAProxy et de Logstash, sont des secrets Swarm, créés une fois par le script de préparation avec des valeurs aléatoires ; aucun n’est écrit dans la configuration remise, dans une image ou dans une variable d’environnement de la pile. Hors de Swarm ne restent que les clés SSH de l’opérateur et du runner, l’enregistrement du runner auprès de GitHub, conservé sur orion-3, et l’autorité de certification : sa clé privée reste sur le poste de l’opérateur ; son certificat, public, est déposé sur chaque VM pour que le pilote `syslog` de Docker vérifie le collecteur. Le script ne réalise pas la rotation : les noms de secrets externes sont fixes et Swarm ne modifie pas leur contenu. Une procédure de rotation doit donc créer de nouveaux noms, mettre à jour la pile, redéployer, vérifier, puis retirer les anciens secrets. Le verrouillage automatique des managers (`autolock`) n’est pas activé, pour qu’un redémarrage ne demande aucune action ; protéger en contrepartie l’accès aux disques des managers.

`RIGEL_SECRET` dérive les clés et jetons des campagnes : sa rotation révoque les appairages existants. `RELAIS_TOKEN` authentifie le connecteur auprès du relais ; sa rotation exige le retrait de la pile `orion-rigel` et de l’ancien secret Swarm avant redéploiement. Le jeton `HIDORA_TOKEN`, utilisé uniquement par l’intégration continue pour publier le relais, ne doit être transmis à aucun conteneur.

#### Volumes

| Volume | Stockage → montage | Contenu |
| --- | --- | --- |
| Volume NFS `pg-nfs` | orion-10 `/srv/orion/donnees/postgres` → `/var/lib/postgresql/data` du conteneur PostgreSQL | Données métier et sessions ORION |
| Volumes NFS `ldap-data-nfs` et `ldap-config-nfs` | orion-10 `/srv/orion/donnees/ldap-data` et `/srv/orion/donnees/ldap-config` → `/var/lib/ldap` et `/etc/ldap/slapd.d` du conteneur OpenLDAP | Identités et configuration de l’annuaire |
| Volume NFS `logs-nfs` | orion-10 `/srv/orion/logs/conteneurs` → `/var/log/orion` du conteneur Logstash | Logs centralisés, lisibles directement sur orion-10 |

orion-10 porte deux systèmes de fichiers ext4, l’un pour les données (`/srv/orion/donnees`), l’autre pour les logs (`/srv/orion/logs`), de sorte que les logs ne puissent pas remplir l’espace des données. Ils sont prévus sur deux disques ajoutés à la VM ; faute de ces disques, ce sont deux fichiers image de taille fixe (6 Go pour les données, 4 Go pour les logs) sur le disque système d’orion-10, montés comme des disques. Les deux sont partagés en NFSv4, en écriture synchrone (`sync`), avec les seules VM qui les montent : orion-6, orion-7, orion-8 et orion-9 (rôles isolés et secours). Les volumes de la pile sont des volumes Docker du pilote `local`, de type `nfs` : la VM qui exécute le service les monte au démarrage du conteneur, avec l’option `hard`, qui fait attendre les écritures pendant une coupure du stockage au lieu de les faire échouer. Chaque volume n’est utilisé que par une instance à la fois. Les comptes root de ces VM conservent leurs droits sur le partage (`no_root_squash`), pour que les images attribuent leurs fichiers au compte de leur service. Apache, Express, Keycloak et le simulateur n’ont pas de données propres : le build React est intégré à l’image d’Apache et le realm à celle de Keycloak, puis réimporté à chaque création du conteneur. Keycloak conserve ses sessions dans sa base H2 interne : elles sont perdues à sa recréation et les utilisateurs se reconnectent.

#### Réglages de l’application

Dans ce déploiement, Express écoute sur toutes les interfaces de son conteneur, pour être joint par HAProxy et par le simulateur. Il continue de créer les identités des comptes actifs dans le Keycloak substitut, en joignant son administration par le réseau overlay plutôt que par le port `443`, qui refuse ces chemins. Il reconnaît l’autorité des certificats de HAProxy pour joindre Keycloak. Le simulateur joint Express par `api:3001`.

### 4.6. Pannes et reprises

Aucune panne ne demande d’action manuelle : chaque service est relancé automatiquement. Les services d’un manager ou d’une VM de l’application continuent sur les autres VM de leur groupe ; ceux d’orion-6, orion-7 ou orion-8 sont recréés sur orion-9 et retrouvent leurs données sur le stockage d’orion-10 ; seules la perte d’orion-1, qui porte l’entrée, et celle d’orion-10 rendent ORION indisponible jusqu’à leur retour.

| Panne | Reprise automatique | Effet pour l’utilisateur |
| --- | --- | --- |
| Un conteneur s’arrête | Swarm le redémarre sur sa VM. | Aucun pour Apache et Express, dont l’autre instance répond ; sinon service indisponible quelques secondes. |
| Une VM redémarre | Docker relance ses conteneurs. | Service de la VM indisponible pendant le redémarrage, sauf s’il a une seconde instance. |
| orion-1 (manager et entrée) indisponible | Les deux autres managers continuent de diriger le cluster ; HAProxy attend le retour d’orion-1 ; les horloges des autres VM continuent sans référence ; le déploiement continu échoue jusqu’à son retour. | ORION inaccessible jusqu’au retour d’orion-1. |
| orion-2 ou orion-3 (manager) indisponible | Les deux autres managers continuent de diriger le cluster ; si orion-3 est concerné, les nouvelles versions attendent le retour du runner. | Aucun. |
| orion-4 ou orion-5 (application) indisponible | HAProxy envoie les requêtes aux instances d’Apache et d’Express de l’autre VM ; Swarm recrée le simulateur sur l’autre VM s’il était concerné. | Aucun, hormis les requêtes en cours ; rapports de postes interrompus pendant la relance du simulateur. |
| orion-6 (PostgreSQL) indisponible | Swarm recrée PostgreSQL sur orion-9, qui monte le même volume ; Express se reconnecte. | Lectures, écritures et PDF d’état des lieux en erreur pendant la relance. |
| orion-7 (identité) indisponible | Swarm recrée Keycloak et OpenLDAP sur orion-9, qui monte les mêmes volumes ; Keycloak réimporte son realm. | Nouvelles connexions impossibles pendant la relance ; sessions ORION ouvertes valides. |
| orion-8 (logs) indisponible | Swarm recrée Logstash sur orion-9, qui monte le même volume. | Aucun ; centralisation des logs interrompue pendant la relance, logs consultables sur chaque VM (`docker logs`). |
| orion-9 (secours) indisponible | Aucune en temps normal ; un service qu’elle avait repris est recréé sur sa VM d’origine si celle-ci est revenue. | Aucun, sauf pendant la relance d’un service qu’elle avait repris. |
| orion-10 (stockage) indisponible | Aucune ; les accès de PostgreSQL, d’OpenLDAP et de Logstash attendent son retour (montage `hard`), puis reprennent. | Lectures, écritures, PDF d’état des lieux et nouvelles connexions bloqués jusqu’au retour ; sessions ORION ouvertes conservées ; logs consultables sur chaque VM (`docker logs`). |
| Connecteur RIGEL indisponible | Swarm le relance après 30 secondes ; une mise à jour défaillante revient à la version précédente. | ORION reste disponible ; les téléphones continuent hors ligne et les événements déjà transmis attendent sur le relais. |
| Relais RIGEL, PostgreSQL Hidora ou proxy indisponible | Le connecteur réessaie toutes les 10 secondes. Le relais répond indisponible si sa base ne répond plus. | ORION reste disponible ; la synchronisation mobile est différée. |

Le relais purge toutes les dix minutes les campagnes closes ou expirées. Les événements qui n’ont pas été relevés avant cette purge sont abandonnés ; les constats déjà intégrés restent conservés dans PostgreSQL ORION.

Les opérations planifiées (déploiement, mise à jour, rotation des secrets) ne sont pas des reprises automatiques.

### 4.7. Traitement des rapports de postes

Le traitement sépare les routes HTTP, le traitement des postes, le moteur d’écriture et l’accès à PostgreSQL. Le moteur ne garde aucun état qui fasse autorité : les rapports et les écritures métier passent par le même verrou PostgreSQL sur la ligne de révision, quelle que soit l’instance d’Express qui les reçoit, et le journal des modifications est conservé en base. Plusieurs instances partagent donc la charge des requêtes, mais leurs écritures restent sérialisées par ce verrou.

Le premier essai garde le moteur actuel et mesure la mise en lots et la réduction des écritures à 1 000 postes puis au-delà. Relever l’attente du verrou, le temps de traitement et de transaction, et la latence des écritures utilisateur sous charge.

Si la préparation des rapports domine, tester un service autonome de traitement, alimenté par une file durable. Il prépare les rapports et confie leur application au moteur d’écriture, qui garde l’autorité sur les règles et l’état courant. L’essai doit vérifier la reprise, le rejeu sans effets dupliqués et le maintien du contrat de `/api/agent/rapports`, qui renvoie les interventions après traitement. Si les transactions dominent, réduire d’abord le coût des écritures. Cet essai ne fait pas partie du déploiement de départ.

### 4.8. Configurations remises avec le DAT

Les fichiers suivants constituent la configuration de l’architecture réelle remise avec le DAT. Les chemins indiqués sont relatifs au dossier de configuration du livrable :

| Fichier ou dossier | Rôle |
| --- | --- |
| `Dockerfile` | Images Apache, Express, simulateur des postes et Keycloak |
| `images/apache-orion.conf` et `images/secrets.sh` | Configuration Apache et chargement des secrets Swarm dans les processus concernés |
| `vm/vm.sh` | Adresses, réseau, DNS, VM de secours et accès SSH |
| `vm/pile.yaml` | Services Swarm, placement, instances, réseaux, secrets, configurations et volumes NFS |
| `vm/pile-rigel.yaml` | Connecteur RIGEL, placement, reprise et accès à l’overlay de la pile principale |
| `vm/haproxy.cfg` | Entrée TLS, routage de l’interface, de l’API et de Keycloak |
| `vm/logstash.conf` | Réception syslog sur TLS et écriture des journaux par service et par jour |
| `vm/installer.sh` | Préparation des VM, stockage NFS, cluster, certificats et secrets |
| `vm/deployer.sh` | Déploiement d’une version publiée et contrôle de la version servie |
| `vm/runner.sh` | Installation du runner GitHub Actions sur orion-3 |
| `ldap/orion-utilisateurs.ldif` | Données d’initialisation de l’annuaire du démonstrateur |

Les valeurs secrètes, les clés privées, les certificats générés et les données créées à l’exécution ne sont pas joints. Les fichiers du montage local de développement, les fichiers JSON de configuration, le thème de connexion et les documents du projet sont exclus de cet ensemble.

## 5. Versions des technologies

Les dépendances npm et les images Docker sont verrouillées sur des versions exactes. Les outils de construction sont séparés des composants exécutés dans l’architecture.

### 5.1. Dépendances applicatives exécutées

| Élément | Version | Rôle |
| --- | --- | --- |
| Node.js | `>= 22.22`, version exacte non verrouillée | Exécution du back, du simulateur et des scripts |
| React | 19.3.1 | Composants de l’interface |
| React DOM | 19.3.1 | Rendu React dans le navigateur |
| React Router | 8.5.1 | Routage des écrans |
| Express | 5.3.0 | Serveur HTTP et API |
| Helmet | 8.3.0 | En-têtes HTTP de sécurité |
| `openid-client` | 6.8.9 | Client OpenID Connect |
| `express-session` | 1.19.0 | Sessions serveur |
| `connect-pg-simple` | 10.0.0 | Sessions dans PostgreSQL |
| `pg` | 8.23.1 | Accès PostgreSQL depuis Node.js |
| PostgreSQL | image `postgres:17.7-alpine` | Données métier et sessions |
| Keycloak | image `quay.io/keycloak/keycloak:26.7.4` | Substitut local de MindefConnect |
| OpenLDAP | image `osixia/openldap:1.5.0` | Annuaire local des identités |
| `barcode-detector` | 3.2.3 | Lecture des codes par la PWA de recensement |
| Tesseract.js | 7.0.0 | Lecture assistée des numéros de série |
| `uqr` | 0.1.3 | Production des QR codes d’appairage et d’étiquettes |

### 5.2. Construction et vérification

| Élément | Version | Utilisation |
| --- | --- | --- |
| Playwright | 1.65.0 | Tests de l’interface et de bout en bout |
| Exécuteur de tests de Node.js | inclus dans Node.js | Tests unitaires et d’intégration du back |
| TypeScript | 7.0.2 | Vérification statique du front, du back et du code partagé |
| Vite | 8.3.6 | Construction des artefacts du front |
| Plugin React pour Vite | 6.2.1 | Transformation du JSX pendant la construction |
| Concurrently | 9.2.5 | Lancement coordonné des processus en développement |

### 5.3. Versions de référence pour les VM

Les versions du déploiement sont des références à qualifier sur les VM ; chaque image est épinglée sur une version exacte. Le statut est celui de la colonne C1NP de l’annexe « pile logicielle » du CCT 2026-2027 (version 3.7) : R pour recommandé, S pour soutenu. Les exceptions du § 4.5 sont signalées comme telles. React 19 est recommandé sur le C1NP, hors versions 19.0.0 à 19.2.0, interdites ; l’architecture réelle utilise la 19.3.1.

| Composant | Version proposée | Statut CCT C1NP | Déploiement |
| --- | --- | --- | --- |
| Debian | 13 | Exception : système des VM fournies pour la démonstration | Système des dix VM |
| Docker Engine et Swarm | version installée sur les VM | Exception : exécution des conteneurs | VM orion-1 à orion-9 ; client sur le poste de l’opérateur |
| chrony | paquet Debian 13 | R / S (NTPd/Chronyd) | Hôte d’orion-1 : horloge de référence des autres VM |
| HAProxy | 3.2, image officielle | R / S | orion-1 |
| Apache HTTP Server | 2.4, image officielle `httpd` | R / S (version 2.4) | Image d’ORION avec le build React ; orion-4 et orion-5 |
| Node.js | 22.22.3, image officielle `node:22.22.3-alpine3.24` | R / S | Images d’Express, du simulateur, du connecteur et du relais RIGEL ; orion-4 et orion-5 pour les composants internes |
| Express | 5.3.0 | R | Image d’Express |
| PostgreSQL | 17.7, image officielle | R / S | orion-6 (secours orion-9) ; données sur orion-10 |
| Logstash | 8.19.14, image officielle | R / S | orion-8 (secours orion-9) ; logs sur orion-10 |
| Keycloak | 26.7.4, image officielle | Exception : substitut de MindefConnect | orion-7 (secours orion-9) |
| OpenLDAP | 1.5.0, image `osixia/openldap` | Exception : substitut de MindefConnect | orion-7 (secours orion-9) ; données sur orion-10 |
| Runner GitHub Actions | 2.338.2, archive officielle | Hors CCT : architecture réelle seulement, exclu de la cible | Hôte d’orion-3, service systemd ; déploiement continu |
| Serveur et client NFS (NFSv4.2) | paquets Debian 13 `nfs-kernel-server` et `nfs-common` | Non vérifié : composant de Debian 13 | Serveur sur l’hôte d’orion-10 ; client sur orion-6 à orion-9 |

## 6. Architecture cible

### 6.1. Gabarit initial d’essai pour 1 000 postes

Le ministère des Armées héberge ORION sur le C1NP. Le premier palier d’essai comprend **quatre VM ORION** pour **1 000 postes Windows actifs**. La [vue simplifiée](18-DIAGRAMMES-ARCHITECTURE.md#vue-simplifiée-de-la-cible) montre les rôles et les principaux échanges. La [vue détaillée](18-DIAGRAMMES-ARCHITECTURE.md#vue-détaillée-de-la-cible) indique les versions et les ports. MindefConnect est hébergé sur le C1NP, en dehors des quatre VM dédiées à ORION. Le puits de logs est exploité par ORION, faute d’offre disponible sur le réseau visé. Les produits applicatifs sont admis dans la colonne C1NP de la pile logicielle du CCT ; le système des VM, le service de fichiers, les certificats et les modalités d’exploitation restent à confirmer avec l’offre d’hébergement. L’intégration MindefConnect utilise OIDC, selon le contrat à obtenir auprès de son exploitant.

| VM | Services | vCPU | RAM | Stockage initial d’essai |
| --- | --- | ---: | ---: | --- |
| VM 1 . Entrée | HAProxy 3.2.16 et Apache HTTP Server 2.4.69. Apache sert les fichiers React 19.3.1 sur la boucle locale. | 2 | 8 Go | 50 Go système |
| VM 2 . Application | Node.js 22.22.3, Express 5.3.0, connecteur RIGEL et composant d’administration des postes Windows à préciser. | 8 | 32 Go | 50 Go système |
| VM 3 . Base et collecte | PostgreSQL 17.7 et Logstash 8.19.14. | 4 | 16 Go | 50 Go système, dont une file de collecte locale bornée, et 100 Go SSD pour PostgreSQL |
| VM 4 . Stockage | Service de fichiers autorisé par l’offre C1NP, à qualifier. Aucun processus ORION, PostgreSQL ou Logstash. | 2 | 8 Go | 50 Go système et 100 Go pour les fichiers de logs |
| **Total** | **4 VM** | **16** | **64 Go** | **400 Go** |

VM 1 assure l’entrée HTTPS, VM 2 exécute Express et VM 3 regroupe Logstash et PostgreSQL. VM 4 porte les fichiers de logs centralisés ; « sans processus » signifie sans processus applicatif, moteur de base ni collecteur. Le système et le service de fichiers restent nécessaires. La file de collecte reste sur le disque local de VM 3. Borner la consommation CPU, mémoire et disque de Logstash pour préserver PostgreSQL, notamment lors de la reprise après une coupure.

Le contrat du service de fichiers doit préciser le produit autorisé, le protocole, le port, les droits, les quotas, la supervision et le comportement en cas de coupure. Le réseau privé C1NP limite son accès à VM 3. Un réseau de stockage séparé n’est utile que si une exigence d’isolement ou les mesures de débit et de latence le justifient.

PostgreSQL utilise d’abord le SSD local de VM 3. Ses données, journaux de transactions compris, ne passent sur VM 4 que si l’offre C1NP autorise ce stockage distant et si les essais confirment la durabilité des écritures et la latence sous charge. Une seule instance doit alors monter le volume en écriture et son démarrage doit échouer si le stockage est absent. Tester la coupure de VM 4, la reprise et la concurrence des écritures de logs et de base avant ce déplacement.

La perte de VM 4 suspend l’archivage des logs ; elle ne bloque PostgreSQL que si le stockage distant a été qualifié et retenu. La perte de VM 1 interrompt l’entrée HTTPS, celle de VM 2 l’API, et celle de VM 3 PostgreSQL et la collecte centralisée. Prévoir une sauvegarde de la base sur un stockage indépendant des quatre VM. La capacité de sauvegarde, les délais et pertes de données acceptables et les procédures de restauration restent à qualifier.

MindefConnect authentifie les utilisateurs. ORION applique les droits selon le compte, le profil et l’école dans PostgreSQL. Le back génère les PDF à la demande, après contrôle des droits, et les renvoie via HAProxy. Aucun document généré n’est conservé. La VM 2 accueille le composant d’administration Windows côté ORION et le connecteur RIGEL. Son rôle Windows et ses flux dépendent de l’option retenue (§ 6.5) : pilotage de M42 ou connecteur vers Configuration Manager. Un serveur de site Configuration Manager dédié conserve ses propres prérequis.

Le module externe RIGEL exige un point d’accès public sans exposer le réseau privé C1NP. La cible conserve donc le principe d’un relais public et d’un stockage durable autorisés, joints uniquement par un flux HTTPS sortant du connecteur. Le connecteur et le relais restent conditionnés sous forme d’images de conteneur versionnées ; leur environnement d’exécution autorisé sur le C1NP et chez l’hébergeur public reste à qualifier. Hidora décrit l’architecture réelle, pas un choix pour la cible. Avant déploiement, qualifier l’hébergement public, le passage par le proxy C1NP, les certificats, la base, les sauvegardes, la rétention, la supervision, la disponibilité et la classification des données chiffrées.

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
| 8. Logstash (VM 3) → stockage (VM 4) | Protocole et port de l’offre C1NP, réseau privé | Écriture des fichiers de logs sur le volume dédié. |
| 9. PostgreSQL (VM 3) → stockage (VM 4), si retenu | Protocole et port de l’offre C1NP, réseau privé | Accès au volume de base après qualification du stockage distant. |
| 10A. Express → service d’administration de Configuration Manager | HTTPS et contrat d’API à obtenir | Option Configuration Manager : demandes autorisées, état et résultat des interventions. |
| 11A. Clients Windows ↔ infrastructure Configuration Manager | Protocoles Microsoft à qualifier | Option Configuration Manager : inventaire, logiciels, images et opérations disponibles. |
| 10B. M42 → HAProxy puis Express | HTTPS, TCP 443 | Option M42 : rapport authentifié, résultats et récupération des interventions dans la réponse. |
| 12. Téléphone → relais public RIGEL | HTTPS, TCP 443 | Chargement de la PWA RIGEL et synchronisation de blocs chiffrés ; aucune connexion au réseau privé C1NP. |
| 13. Connecteur RIGEL (VM 2) → relais public RIGEL | HTTPS, TCP 443, par le proxy C1NP | Publication des campagnes, relève et acquittement des événements ; flux sortant uniquement. |
| 14. Connecteur RIGEL → Express (VM 2) | HTTPS ou canal local protégé, port à fixer | Intégration des événements dans PostgreSQL ORION, qui reste l’autorité. |
| Administration → VM 1 à 4 | SSH, TCP 22 | Depuis le réseau d’administration autorisé. |
| VM 1 à 4 → services de plateforme | DNS TCP/UDP 53 et NTP UDP 123, à qualifier | Résolution des noms et synchronisation de l’heure. |
| VM 3 → stockage de sauvegarde | Contrat et port à obtenir | Sauvegarde et restauration de PostgreSQL. |

Les options A et B sont exclusives. Avec Configuration Manager, ses clients communiquent avec l’infrastructure Microsoft et le composant ORION échange avec son service d’administration. Avec M42, le poste initie toujours la connexion HTTPS : son rapport récupère les interventions en attente et il renvoie ensuite leur résultat. L’identité du poste et le contrat définitif restent à qualifier avec la solution retenue.

Limiter les accès à PostgreSQL, au collecteur et aux interfaces d’exploitation aux seuls émetteurs autorisés. `/api/health` et `/api/infos` restent publics avec une réponse minimale ; le détail des instances, adresses, ports et services est réservé au super administrateur. `/api/health` vérifie notamment PostgreSQL et MindefConnect : une sonde d’instance du répartiteur doit rester distincte de ce diagnostic de dépendances. Obtenir les noms DNS, certificats, règles de filtrage et modalités de gestion des secrets auprès de l’exploitant.

Le collecteur écrit les fichiers centralisés sur VM 4, avec rotation, quotas, surveillance de l’espace libre et consultation sur place par les personnes habilitées. Les journaux propres à VM 4 restent locaux et la collecte ne rapatrie aucun fichier depuis VM 4. Lors d’une coupure du partage, sa file locale de VM 3 permet une reprise dans la limite de sa capacité. Prévoir une file locale bornée chez les émetteurs et tester la reprise après coupure. Une connexion TCP ouverte ne prouve ni la réception ni la conservation d’un événement. Le raccordement des émetteurs, le format des messages syslog sur TLS et la compatibilité du collecteur doivent être vérifiés en essai. Les logs techniques servent au diagnostic. Les actions métier à tracer, les habilitations, la durée de conservation et les exigences d’intégrité restent à définir. Le journal de fusion PostgreSQL sert à la synchronisation des modifications.

### 6.3. Vérification de la charge

Hypothèses d’essai : une remontée de **10 000 octets** par poste toutes les **5 s**, **un rapport par transaction**, 8 h d’activité et une actualisation de l’interface toutes les 4 s. Les tailles des rapports et le nombre d’utilisateurs simultanés sont des hypothèses. Les débits de la table concernent les corps des rapports en entrée. Ajouter les réponses aux postes et navigateurs, les PDF, les en-têtes et le chiffrement lors des essais.

| Palier | Postes actifs | Utilisateurs simultanés supposés | Rapports/s | Actualisations UI/s | Débit entrant | Données reçues en 8 h |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Démarrage | 1 000 | 100 | 200 | 25 | 16 Mbit/s | 57,6 Go |
| Croissance | 5 000 | 500 | 1 000 | 125 | 80 Mbit/s | 288 Go |

Calculs en unités décimales : postes ÷ 5 pour les rapports/s, utilisateurs ÷ 4 pour les actualisations/s, puis rapports/s × 10 000 × 8 pour le débit en bit/s et rapports/s × 10 000 × 28 800 pour le volume entrant en octets. PostgreSQL conserve notamment l’état courant et les historiques métier prévus. Sa croissance doit être mesurée sur les tables, index et journaux de transactions. Pour éprouver la capacité des logs, le scénario volontairement majorant d’une ligne de 300 octets par rapport représente 1,728 ou 8,64 Go par jour actif de 8 h, soit 51,84 ou 259,2 Go sur 30 jours actifs, avant compression et hors autres logs, fichiers en rotation et files. Il ne décrit pas un volume observé.

L’accès à PostgreSQL sérialise les écritures sur la même ligne de révision avec `SELECT FOR UPDATE`. Pour maintenir ce verrou sous 70 % d’occupation avec cinq autres écritures par seconde de même durée, le temps moyen disponible sous verrou est de **3,41 ms à 1 000 postes** et **0,697 ms à 5 000**. Mesurer séparément les durées des rapports et des autres écritures, ainsi que l’attente du verrou et les pointes. Le premier palier utilise un back ; les deux back du palier à 5 000 postes partagent le même verrou et n’augmentent donc pas sa capacité d’écriture.

L’ETag dépend de la révision globale. Des rapports fréquents peuvent donc faire renvoyer une vue complète à la plupart des actualisations : ajouter 25 ou 125 fois la taille mesurée d’une vue par seconde. Les 2 000 révisions conservées couvrent environ **9,8 s** ou **2,0 s** aux cadences calculées si chaque transaction produit une révision. Une modification fondée sur une révision plus ancienne peut recevoir un HTTP 409. La collecte toutes les 5 s et la lecture toutes les 4 s peuvent aussi donner près de 9 s d’ancienneté à l’écran avant traitement, au-delà des 5 s attendues.

Avant mise en production, éprouver la charge mixte avec des jeux de données réalistes, des rafales de reconnexion, des PDF concurrents, des imports, la collecte et une coupure du puits. Mesurer les tailles de vue et de rapport, la fraîcheur à l’écran, les conflits d’édition, les temps de réponse, le verrou, le CPU, la RAM, les IOPS, le débit des disques et la croissance des logs et de la base. Séparer les migrations de production du réamorçage du jeu de départ : en production, le serveur refuse une version de données incompatible tant que la réinitialisation est désactivée. La procédure de migration reste à définir. À 5 000 postes, qualifier en priorité des écritures de supervision moins sérialisées et des lectures UI plus ciblées. Les lots ne sont utiles que si l’agent les permet, si le temps par rapport sous verrou diminue et si le délai des interventions reste compatible.

### 6.4. Extension à 5 000 postes

Pour préparer le palier de **5 000 postes**, le gabarit d’essai passe à **cinq VM ORION**. VM 1 porte l’entrée (4 vCPU, 16 Go). Deux VM back (8 vCPU, 32 Go chacune) servent les appels répartis par HAProxy. Une VM exécute PostgreSQL et Logstash (20 vCPU, 80 Go). Les deux back joignent PostgreSQL sur le réseau privé, en TLS sur TCP 5432, et envoient leurs logs au collecteur. La VM de stockage (2 vCPU, 8 Go) porte 400 Go pour les fichiers de logs. PostgreSQL utilise un SSD de 500 Go attaché à sa VM ; son déplacement vers le service de fichiers reste soumis aux mêmes essais qu’au premier palier. Chaque VM reçoit 50 Go de disque système. La file du collecteur reste locale sur la VM qui exécute PostgreSQL. Total : **42 vCPU, 168 Go de RAM et 1 150 Go de disques actifs**. VM 2 devient le premier back et une cinquième VM accueille le second. Les essais détermineront si ce gabarit suffit après adaptation du traitement de la supervision.

### 6.5. Deux solutions pour administrer les postes Windows

Le choix porte sur l’administration des postes Windows. Le ministère des Armées fournit l’hébergement sur le C1NP. Les deux options doivent couvrir l’inventaire logiciel, la supervision des processus utilisateur, leur arrêt, l’installation et la désinstallation de logiciels, la réinstallation des postes et la remontée du résultat à ORION. Le coût de licence est calculé sur le parc géré, distinct de la charge de supervision mesurée en postes actifs.

#### Option A — Microsoft Configuration Manager installé sur le réseau du ministère

Configuration Manager fournit un client Windows, un serveur de site, une base SQL Server et des points de distribution pour les logiciels et les images. Microsoft documente les installations et désinstallations, le déploiement de Windows et la prise en main à distance. Pour ORION, vérifier sur un pilote les opérations réellement disponibles via le service d’administration, les droits du compte d’intégration et la remontée de l’état des interventions. [Gestion des clients](https://learn.microsoft.com/en-us/intune/configmgr/core/understand/fundamentals-of-client-management-tasks) · [Service d’administration](https://learn.microsoft.com/en-us/intune/configmgr/develop/adminservice/usage) · [Prise en main à distance](https://learn.microsoft.com/en-us/intune/configmgr/core/clients/manage/remote-control/introduction-to-remote-control).

CMPivot interroge les postes connectés à la demande. La documentation ne garantit ni une télémétrie continue de tous les processus toutes les cinq secondes, ni le délai d’arrêt automatique attendu par ORION. Le pilote doit décider si un agent de supervision complémentaire est nécessaire. Dans ce cas, conserver Configuration Manager pour les logiciels et les images, puis estimer séparément le développement de la collecte et de l’arrêt local. [Fonctionnement de CMPivot](https://learn.microsoft.com/en-us/mem/configmgr/core/servers/manage/cmpivot).

| Hypothèse de licence annuelle | Coût supplémentaire |
| --- | ---: |
| Droits Configuration Manager et service ministériel existants, si le parc est intégralement couvert | **0 €** |
| Nouvelles licences de gestion par utilisateur ou par appareil | **devis nécessaire** selon les droits existants, le marché ministériel et le mode de licence applicable aux postes partagés |

Configuration Manager est inclus dans plusieurs abonnements Microsoft et les droits existants restent applicables. Le tarif public d’Intune Plan 1 est exprimé par utilisateur, pas par poste ; il ne permet donc pas de chiffrer correctement 1 000 ou 5 000 postes partagés. Obtenir du titulaire du marché le nombre de licences nécessaires, les droits Configuration Manager, le prix par appareil le cas échéant et les éventuels coûts Windows Server, SQL Server, support et intégration. [FAQ de licences Configuration Manager](https://learn.microsoft.com/intune/configmgr/core/understand/product-and-licensing-faq) · [Tarification officielle d’Intune](https://www.microsoft.com/fr-fr/security/business/microsoft-Intune-pricing).

Réutiliser le service ministériel, s’il existe, permet de rester dans les quatre VM ORION. Une installation dédiée demande au minimum une VM Windows Server supplémentaire. Microsoft permet de placer la base SQL Server du site primaire sur le même serveur. Les points de distribution supplémentaires dépendent du réseau et de la taille des images. L’exploitant doit valider l’admission au CCT et les échanges nécessaires à la maintenance du produit, y compris la procédure de mise à jour hors ligne si elle est retenue. [Base de site](https://learn.microsoft.com/en-us/intune/configmgr/core/plan-design/hierarchy/plan-for-the-site-database) · [Maintenance hors ligne](https://learn.microsoft.com/en-us/intune/configmgr/core/servers/manage/use-the-service-connection-tool).

#### Option B — M42, agent Windows développé par l’équipe ASTER

M42 serait un service Windows réalisé par ASTER avec une technologie admise par le CCT, à sélectionner après vérification des versions de Windows et des contraintes de signature. Il envoie l’inventaire et les rapports de processus à l’API ORION. Le back autorise et suit les interventions. Le poste exécute les commandes métier prévues, telles que l’arrêt d’un processus ou l’installation d’un paquet approuvé, et renvoie le résultat associé à l’intervention. Prévoir une identité propre à chaque poste, la mise à jour signée de M42 et le traitement des commandes déjà reçues après coupure. Le serveur de gestion reste le back ORION, sur les VM déjà dimensionnées.

Pour une réinstallation complète, l’agent transmet la demande à un mécanisme de réimagerie autorisé, capable de fonctionner pendant l’effacement de Windows. Le retour de résultat doit être vérifié après réenrôlement. L’estimation suppose que le ministère fournit ce mécanisme, l’infrastructure de signature et un canal de déploiement de l’agent. Si la réimagerie est indisponible, le périmètre et l’effort d’une chaîne de réinstallation restent à estimer avant de comparer les deux offres à couverture égale.

| Lot de travail | Charge estimée |
| --- | ---: |
| Analyse et prototype Windows : versions, sessions, droits, réseau, réimagerie | 8 à 12 j-p |
| Développement de l’agent : inventaire, processus, rapports et reprise réseau | 15 à 22 j-p |
| Développement des interventions : arrêt, installation, désinstallation, résultats | 12 à 18 j-p |
| Intégration ORION et raccordement au mécanisme de réimagerie | 10 à 15 j-p |
| Empaquetage, signature, enrôlement et mise à jour de l’agent | 8 à 12 j-p |
| Recette, pilote en salle, essais de charge à 1 000 et 5 000 postes, documentation d’exploitation | 12 à 18 j-p |
| **Total de réalisation estimé** | **65 à 97 j-p** |

Les jours-personnes mesurent la charge de l’équipe. Ils excluent les délais d’accès au réseau et d’autorisation, la maintenance récurrente et une éventuelle refonte du moteur ORION pour tenir la charge (§ 6.3). La prise en main graphique et un catalogue de correctifs généraliste sont hors de ce périmètre. Le pilote vérifie la fraîcheur à l’écran, les opérations sur plusieurs sessions Windows, les reprises après coupure et le résultat de la réinstallation. Une mesure sur un parc réel est nécessaire avant d’annoncer la capacité à 1 000 ou 5 000 postes.

## 7. Trajectoire vers la cible

| Architecture réelle | Cible | Travail nécessaire |
| --- | --- | --- |
| Dix VM Debian et pile Docker Swarm | Quatre VM C1NP pour le premier palier | Qualifier le système, les services de l’hôte et les modalités de déploiement du C1NP |
| Keycloak et annuaire OpenLDAP locaux | MindefConnect | Obtenir le contrat, configurer les environnements et qualifier les attributs et parcours |
| Simulateur des postes et de M42 | Configuration Manager ou M42 | Vérifier l’existant, qualifier la réimagerie et tester les interventions et la supervision (§ 6.5) |
| Apache derrière HAProxy | HAProxy en entrée, Apache pour les fichiers de l’interface | Qualifier leur déploiement sur le C1NP |
| Express derrière HAProxy | Serveur back | Qualifier les contrôles de santé et le déploiement sur le C1NP |
| `/api/health` et `/api/infos` | Réponse minimale publique, détail réservé au super administrateur | Conserver la séparation entre contrôle externe et diagnostic détaillé |
| Logstash sur orion-8, fichiers sur orion-10 | Collecteur sur VM 3, fichiers de logs sur VM 4 | Qualifier la collecte, le partage, la rétention et l’accès |
| Secrets Swarm à noms fixes | Gestion des secrets du C1NP | Choisir le coffre, l’injection, la rotation et la révocation |
| Volumes NFS sur orion-10, sans sauvegarde | Stockage C1NP qualifié et sauvegardé | Choisir le service autorisé, puis définir sauvegardes, restaurations, RPO, RTO et essais réguliers |
| Relais RIGEL et PostgreSQL sur Hidora ; connecteur sortant sur orion-4 ou orion-5 | Relais public RIGEL et stockage durable autorisés ; connecteur RIGEL sur VM 2 | Qualifier l’hébergement, le proxy, TLS, la base, les sauvegardes, la rétention, la supervision, la disponibilité et la classification des données |

## 8. Références techniques

- Cadre de cohérence technique du ministère des Armées, CCT 2026-2027, version 3.7, édition 1 du 17 février 2026 : §§ 3.2.1.2, 3.2.2, 3.3.6, 4.8.3, 5.1.1, 5.1.3 et 5.1.6 et annexe 8.8.2 « pile logicielle », colonne C1NP ;
- [Enquête Stack Overflow 2026 — technologies web](https://survey.stackoverflow.co/2026/technology/data/web-framework) ;
- [Identité IP dans les certificats TLS](https://www.rfc-editor.org/rfc/rfc9525.html#section-6.4), [réseau overlay chiffré de Swarm](https://docs.docker.com/engine/network/drivers/overlay/#encrypt-traffic-on-an-overlay-network), [contraintes de placement](https://docs.docker.com/engine/swarm/services/#placement-constraints) et [pilote syslog de Docker](https://docs.docker.com/engine/logging/drivers/syslog/) ;
- [Manuel HAProxy 3.2](https://docs.haproxy.org/3.2/configuration.html), [routage des chemins React dans Apache](https://httpd.apache.org/docs/2.4/mod/mod_dir.html#fallbackresource) et [Logstash 8.19](https://www.elastic.co/guide/en/logstash/8.19/index.html) ;
- [runners GitHub Actions auto-hébergés](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners) et [runner en service](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/configuring-the-self-hosted-runner-application-as-a-service) ;
- [Volumes NFS de Docker](https://docs.docker.com/engine/storage/volumes/#create-a-service-which-creates-an-nfs-volume) et [PostgreSQL sur NFS](https://www.postgresql.org/docs/17/creating-cluster.html#CREATING-CLUSTER-NFS) ;
- [Contextes du client Docker](https://docs.docker.com/engine/manage-resources/contexts/) et [montages de dossiers de l’hôte](https://docs.docker.com/engine/storage/bind-mounts/) ;
- [Keycloak derrière un reverse proxy](https://www.keycloak.org/server/reverseproxy) et [adresse séparée de la console d’administration](https://www.keycloak.org/server/hostname#_admin) ;
- [Gestion des utilisateurs et fédération Keycloak](https://www.keycloak.org/docs/latest/server_admin/), [base de données Keycloak](https://www.keycloak.org/server/db) et [limites des exports de realm](https://www.keycloak.org/server/importExport) ;
- [Secrets Docker Swarm](https://docs.docker.com/engine/swarm/secrets/), [verrouillage des managers](https://docs.docker.com/engine/swarm/swarm_manager_locking/), [déploiement d’une pile Swarm](https://docs.docker.com/engine/swarm/stack-deploy/), [maillage de routage Swarm](https://docs.docker.com/engine/swarm/ingress/) ;
- [Spécification OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html) et [RFC 7636 — PKCE](https://www.rfc-editor.org/rfc/rfc7636) ;
