# Dossier d’architecture technique (DAT) — ORION

**Date de référence :** 12 novembre 2026

**Périmètre :** contexte et contraintes, justification des briques, démonstrateur local et architecture de son déploiement sur VM, versions des technologies, architecture cible.

## 1. Objet du document

ORION est une application web destinée aux écoles de formation. Elle centralise la gestion du parc, les remontées utilisateur, la supervision des postes Windows et les demandes d’intervention à distance.

Le client a demandé un dossier d’architecture technique (entretien du 23 octobre, § 1.6). Ce dossier présente deux architectures :

- **l’architecture cible**, qui décrit le système attendu dans son environnement d’exploitation ;
- **l’architecture réelle**, qui correspond au système effectivement développé, conteneurisé et présenté par l’équipe.

L’architecture réelle décrit le montage local exécuté aujourd’hui et son déploiement proposé sur sept VM. Keycloak tient lieu de MindefConnect et un processus Node.js émule les postes Windows. Le montage local actuel fédère les identités dans OpenLDAP.

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
| Points d’accès techniques | `/api/health` et `/api/info` | `/api/health` | Ajouter `/api/info` |
| Journaux | Puits de logs | Sortie standard des processus | Raccorder les journaux au puits de logs |
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

Pour le déploiement sur VM, le démonstrateur n’utilise que des produits présents dans la colonne C1NP du cadre de cohérence technique (CCT 2026-2027, version 3.7), hormis Docker et les substituts des services du réseau cible (§ 4.5). Le CCT recommande HAProxy pour le reverse proxy et la répartition de charge, et Apache HTTP Server pour servir les fichiers ; NGINX doit être justifié par rapport à Apache. Apache sert le build React et renvoie `index.html` pour les routes de l’interface. Express, recommandé par le CCT pour les back-ends Node.js, reste le serveur de l’API métier.

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

Le montage local conserve les données dans des volumes Docker. Les reprises automatiques et la collecte des journaux techniques relèvent de la proposition de déploiement des §§ 4.5 et 4.6 ; aucune sauvegarde n’est prévue pour la démonstration.

### 4.4. Flux des données et des postes en local

- Le front appelle Express ; Express applique les droits puis écrit dans PostgreSQL ORION.
- À la demande d’un état des lieux, Express vérifie les droits, produit le PDF à partir des données actuelles et le renvoie au navigateur, sans le conserver.
- L’émulateur publie les processus et applications installées sur `/api/agent/rapports`.
- Express renvoie dans cette réponse les interventions à exécuter.
- L’émulateur publie ensuite leur résultat sur `/api/agent/resultats`.

### 4.5. Architecture réelle sur VM

Deux schémas décrivent le déploiement du démonstrateur : la [vue simplifiée](18-DIAGRAMMES-ARCHITECTURE.md#vue-simplifiée) présente les rôles et les échanges principaux ; la [vue complète](18-DIAGRAMMES-ARCHITECTURE.md#architecture-réelle-sur-vm) détaille chaque VM, ses services, conteneurs, ports, volumes et flux. Une flèche indique la destination d’un flux. Les versions et leur statut au CCT figurent au § 5.3.

**Principes retenus.**

- **Un rôle par VM.** Chaque rôle a sa propre VM : une panne ou une intervention sur l’un ne touche pas les autres. Keycloak et OpenLDAP, qui simulent ensemble MindefConnect, partagent la VM 05.
- **Doublement là où il est simple.** Apache et Express, sans données, ont deux instances actives : la perte de l’une ne coupe pas le service. Les autres services ont une seule instance, relancée automatiquement s’il s’arrête ou au redémarrage de sa VM ; l’émulateur est en plus relancé sur une autre VM si la sienne tombe, les services à volume attendent le retour de leur VM (§ 4.6). Aucune action manuelle n’est nécessaire.
- **Les VM fournies, telles quelles.** Les sept VM sont sous Debian 13, avec Docker déjà installé. Tous les services sont des conteneurs, gérés par une seule pile Docker Swarm. Aucune VM d’administration ni outil d’automatisation n’est ajouté : l’opérateur administre depuis son poste avec le client Docker, SSH et quelques scripts.
- **Technologies du CCT.** Seuls des produits présents dans la colonne C1NP de l’annexe « pile logicielle » du CCT 2026-2027 (version 3.7) sont utilisés, à trois exceptions près : le système des VM fournies pour la démonstration (Debian 13, avec Docker déjà installé), qui n’existera pas sur le C1NP, Docker Engine et Swarm, et les substituts des services du réseau cible (Keycloak et OpenLDAP pour MindefConnect, Logstash de la VM 07 pour le service d’observabilité). Les images utilisées sont les images officielles de ces produits ; ORION construit les siennes à partir des images officielles `httpd:2.4` et `node:22`. OpenSSH, systemd et `systemd-timesyncd` sont traités comme des composants de Debian 13.

| VM | Rôle | Service | Exécution | Swarm | Ports d’écoute | Volume |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | Entrée et horloge | HAProxy 3.2 ; chrony | Conteneur, réseau de l’hôte ; chrony sur l’hôte | Manager | HTTPS `443`, `8443` ; `8444` pour l’administration ; NTP `123/UDP` | — |
| 02 | Interface | Apache HTTP Server 2.4 et build React | Conteneur | Worker, groupe sans données | HTTP `8080`, réseau overlay | — |
| 03 | API | Express 5 sur Node.js 22 | Conteneur | Worker, groupe sans données | HTTP `3001`, réseau overlay | — |
| 04 | Base de données | PostgreSQL 17.7 | Conteneur | Manager | TCP `5432`, réseau overlay | Volume Docker `pg-data` |
| 05 | Identité (substituts) | Keycloak 26.7.4 et OpenLDAP 1.5.0 | Deux conteneurs | Manager | HTTP `8080` et LDAP `389`, réseau overlay | Volumes Docker `ldap-data`, `ldap-config` |
| 06 | Postes simulés | Émulateur des postes, Node.js 22 | Conteneur | Worker, groupe sans données | Aucun | — |
| 07 | Journaux (substitut) | Logstash 8.19 | Conteneur | Worker | TCP TLS `6514`, publié sur l’IP de la VM | Dossier de la VM `/var/log/orion`, monté dans le conteneur |

**Échanges numérotés de la vue simplifiée.**

1. Le navigateur joint HAProxy, seule porte d’entrée, par l’adresse IP de la VM 01.
2. HAProxy sert l’interface (Apache) et transmet les appels `/api` et `/auth` à Express, qui produit aussi les états des lieux PDF à la demande.
3. Express lit et écrit les données dans PostgreSQL.
4. Pour se connecter, le navigateur passe par HAProxy vers Keycloak, qui vérifie l’identité dans OpenLDAP.
5. Les postes simulés envoient leurs rapports à Express et reçoivent les interventions à exécuter.
6. Les conteneurs envoient leurs journaux au collecteur Logstash.
7. L’opérateur administre les VM par SSH depuis son poste.

#### Réseau, adresses et ports

Aucun DNS ne permet de joindre les services depuis l’extérieur : seule l’adresse IP fixe de la VM 01 est utilisée, avec un port par service public.

| Adresse | Service | Accès |
| --- | --- | --- |
| `https://<IP VM 01>` (port `443`) | ORION : interface et API | Utilisateurs |
| `https://<IP VM 01>:8443` | Keycloak : connexion, émetteur OIDC | Utilisateurs et Express |
| `https://<IP VM 01>:8444` | Console d’administration de Keycloak | Réseau d’administration seulement |
| `<IP de chaque VM>`, port `22` | Administration par SSH des sept VM | Réseau d’administration seulement |

HAProxy termine le TLS. Son certificat porte l’IP de la VM 01 dans ses noms alternatifs ; son autorité doit être reconnue par Firefox et par Node.js. HAProxy joint les services par leur nom sur le réseau overlay de Swarm, chiffré (option `encrypted`) : `apache:8080`, `api:3001` et `keycloak:8080`. Le port `443` refuse les chemins de la console Keycloak, servie uniquement sur `8444`. Les PDF d’état des lieux passent par le port `443`, comme le reste de l’API.

Express utilise pour Keycloak la même adresse que le navigateur : il le joint donc aussi par HAProxy, sur `8443`. Il joint PostgreSQL directement par le réseau overlay (`postgres:5432`), et l’émulateur joint Express par ce même réseau (`api:3001`). Keycloak lit l’annuaire par `ldap:389`. La résolution de noms interne de Docker n’est utilisée qu’à l’intérieur du cluster.

Le filtrage autorise :

- `443` et `8443` vers la VM 01 depuis le réseau des utilisateurs ;
- `8444` vers la VM 01 et `22` vers les VM 01 à 07 depuis le réseau d’administration ;
- entre les VM du cluster (01 à 07) : `2377/TCP` vers les managers, `7946/TCP et UDP`, `4789/UDP` et le protocole IP 50 (ESP) du réseau overlay chiffré ;
- `6514/TCP` des VM du cluster vers la VM 07 ;
- `123/UDP` des VM 02 à 07 vers la VM 01, horloge de référence.

#### Docker Swarm

Une seule pile, décrite dans un fichier versionné et déployée avec `docker stack deploy`, contient tous les conteneurs. Chaque service redémarre automatiquement (`restart_policy`) ; au démarrage d’une VM, Docker relance ses conteneurs. Les services liés à une VM y sont fixés par une contrainte de placement : HAProxy à la VM 01, dont l’IP est publiée, PostgreSQL, Keycloak et OpenLDAP à la VM de leurs volumes. Apache, Express et l’émulateur n’ont pas de données : ils s’exécutent sur les VM 02, 03 et 06, repérées par une étiquette de nœud Swarm. Apache et Express ont chacun deux instances, que Swarm place sur deux VM différentes du groupe ; l’émulateur en a une, pour ne pas simuler deux fois les mêmes postes. HAProxy répartit les requêtes entre les instances et écarte celle qui ne répond plus. Si une VM du groupe tombe, Swarm recrée ses conteneurs sur les autres ; au retour de la VM, un redéploiement les répartit de nouveau. HAProxy, l’émulateur et Express se joignent par le nom des services : la VM qui les exécute importe peu. Logstash est fixé à la VM 07 : son port est publié sur l’IP de cette VM et il écrit dans un dossier de celle-ci. Les VM 01, 04 et 05 sont managers : elles dirigent le cluster et exécutent aussi leur service. Deux managers sur trois suffisent pour que le cluster continue de fonctionner : la perte de n’importe quelle VM ne l’arrête pas. Les VM 02, 03, 06 et 07 sont workers.

Les images d’ORION (Apache avec le build React, Express, émulateur) sont construites sur le poste de l’opérateur et chargées par SSH sur les VM 02, 03 et 06, qui peuvent les exécuter (`docker save` puis `docker load`) : aucun registre d’images n’est nécessaire. Les images officielles sont téléchargées par chaque VM si elle a accès à Internet, sinon chargées de la même façon. Chaque image est épinglée sur une version exacte et des contrôles de santé (`HEALTHCHECK`) signalent un conteneur défaillant, que Swarm remplace.

Express ne garde aucun état qui fasse autorité : l’espace de travail et les sessions sont dans PostgreSQL. Chaque écriture verrouille la ligne de révision, relit l’état et fusionne les modifications concurrentes grâce au journal des dernières révisions, conservé en base. Les deux instances servent donc indifféremment n’importe quel utilisateur, et un redémarrage ne déconnecte personne.

#### Journaux

Chaque conteneur envoie ses journaux au collecteur par le pilote `syslog` de Docker, au format syslog RFC 5424 exigé par le CCT, sur TCP TLS `6514`. Le pilote fonctionne en mode non bloquant : une panne du collecteur ne bloque jamais un service, mais les journaux émis pendant l’interruption ne sont pas centralisés. Docker en garde une copie locale, consultable sur la VM avec `docker logs`. Les journaux du système de chaque VM restent dans journald, consultables par SSH.

Sur la VM 07, Logstash 8.19 s’exécute dans un conteneur de la pile. Il tient lieu du service d’observabilité du C1NP, fondé sur Elastic. Il écrit les journaux reçus dans le dossier `/var/log/orion` de la VM, monté dans le conteneur, et non dans un volume Docker : un répertoire par service et un fichier par jour, lisibles directement sur le système de fichiers. L’opérateur les lit par SSH. Aucun port de consultation web n’est ouvert. La durée de conservation et la purge des fichiers restent à fixer.

#### Administration et horloge

L’opérateur administre depuis son poste, sur le réseau d’administration, en se connectant en SSH à chaque VM. Utiliser des comptes nominatifs, des clés SSH, la vérification des clés d’hôte et une élévation `sudo` limitée ; désactiver la connexion SSH directe de root et l’authentification par mot de passe. Prévoir aussi l’accès à la console de l’hyperviseur pour une VM injoignable.

Depuis son poste, l’opérateur pilote le cluster avec le client Docker, relié par SSH à un manager (`docker context`) : création du cluster, secrets et configurations, déploiement de la pile (`docker stack deploy`). Un script court, conservé dans le dépôt avec le fichier de pile, prépare chaque VM une fois : réglage de l’horloge, dépôt des certificats du pilote `syslog` et création des dossiers. Rien de cela n’intervient en cas de panne.

**Horloge.** Aucun serveur de temps n’est disponible. Les VM doivent pourtant avoir la même heure, à quelques secondes près : les jetons de connexion émis par Keycloak sont contrôlés par Express sur une autre VM, et les deux instances d’Express, sur deux VM différentes, datent les enregistrements. La VM 01 sert donc d’horloge de référence : chrony, programme de synchronisation de l’heure, y est installé sur l’hôte et répond en NTP (`123/UDP`). Les VM 02 à 07 s’y règlent avec `systemd-timesyncd`, déjà présent dans Debian 13. L’heure commune peut dériver légèrement de l’heure réelle, sans effet sur ORION. Si la VM 01 est indisponible, les horloges continuent de fonctionner et ne dérivent que lentement.

Aucune sauvegarde n’est prévue : il s’agit d’une démonstration, et les données de départ sont recréées au premier démarrage.

#### Secrets

Les secrets sont des secrets Docker Swarm : chiffrés et répliqués entre les managers, ils ne sont remis qu’aux conteneurs qui en ont besoin, sous forme de fichiers dans `/run/secrets`. Le script de démarrage de chaque image construite transmet ces valeurs au service ; le code n’a pas à changer.

| Secret | Services destinataires |
| --- | --- |
| Accès PostgreSQL ORION | Express et PostgreSQL |
| Secret du client OIDC | Express ; même valeur enregistrée dans le client Keycloak |
| Secret de session | Express |
| Jeton des postes | Express et émulateur |
| Compte de liaison LDAP et administration de Keycloak | Keycloak et OpenLDAP |
| Clé privée et certificat TLS | HAProxy et Logstash |

Les secrets propres aux hôtes (clés SSH, certificat client du pilote `syslog` sur chaque VM) sont déposés par SSH depuis le poste de l’opérateur, lisibles par le seul administrateur ; le certificat de Logstash est un secret Swarm. La rotation est une opération planifiée : nouvelle valeur, mise à jour du service qui l’authentifie, redéploiement, vérification, puis retrait de l’ancienne. Le verrouillage automatique des managers (`autolock`) n’est pas activé, pour qu’un redémarrage ne demande aucune action ; protéger en contrepartie l’accès aux disques des managers.

#### Volumes

| Volume | VM et montage | Contenu |
| --- | --- | --- |
| Volume Docker `pg-data` | VM 04 → `/var/lib/pgsql/data` | Données métier et sessions ORION |
| Volumes Docker `ldap-data` et `ldap-config` | VM 05 → `/var/lib/ldap` et `/etc/ldap/slapd.d` | Identités et configuration de l’annuaire |
| Dossier `/var/log/orion` | VM 07, monté dans le conteneur Logstash | Journaux centralisés, lisibles directement sur la VM |

Aucun volume n’est partagé entre VM. Apache, Express, Keycloak et l’émulateur n’ont pas de données propres : le build React est intégré à l’image d’Apache, le realm et le thème à celle de Keycloak, réimportés à chaque création du conteneur. Keycloak conserve ses sessions dans sa base H2 interne : elles sont perdues à sa recréation et les utilisateurs se reconnectent.

#### Réglages de l’application

Dans ce déploiement, Express écoute sur toutes les interfaces de son conteneur, pour être joint par HAProxy et par l’émulateur. Il continue de créer les identités des comptes actifs dans le Keycloak substitut, en joignant son administration par le réseau overlay plutôt que par le port `8443`, qui refuse ces chemins. Il reconnaît l’autorité des certificats de HAProxy pour joindre Keycloak. L’émulateur joint Express par `api:3001`. Ces réglages sont décrits dans le [guide de l’application](../application/README.md#production).

#### Points à qualifier

- Version de Docker installée sur les VM, accès des VM à Internet pour télécharger les images officielles.
- Réseau : adresses des VM, filtrage, protocole ESP du réseau overlay chiffré, accès SSH et console de l’hyperviseur.
- Capacité CPU, mémoire et disque de chaque VM, dont la machine Java de Logstash.
- Taille des volumes et durée de conservation des journaux.
- Accès de l’API d’administration de Keycloak par son adresse interne : réglage du nom d’hôte de Keycloak à vérifier.
- Délai de détection d’une VM perdue et de recréation des conteneurs ailleurs ; temps d’écriture sous verrou avec deux instances d’Express et l’activité des postes.
- Écriture du fichier de pile et du script de préparation des VM, puis essai de chaque panne du § 4.6.

### 4.6. Pannes et reprises

Aucune panne ne demande d’action manuelle : chaque service est relancé automatiquement. Les services sans données changent de VM ; pour les autres, la perte durable d’une VM rend son service indisponible jusqu’à son retour.

| Panne | Reprise automatique | Effet pour l’utilisateur |
| --- | --- | --- |
| Un conteneur s’arrête | Swarm le redémarre sur sa VM. | Aucun pour Apache et Express, dont l’autre instance répond ; sinon service indisponible quelques secondes. |
| Une VM redémarre | Docker relance ses conteneurs. | Service de la VM indisponible pendant le redémarrage. |
| VM 01 (entrée) indisponible | Aucune : HAProxy est la seule entrée ; les horloges des autres VM continuent sans référence. | ORION et la connexion inaccessibles jusqu’au retour. |
| VM 02 ou 03 indisponible | HAProxy envoie les requêtes aux instances restantes d’Apache et d’Express ; Swarm recrée les instances perdues sur les autres VM du groupe. | Aucun, hormis les requêtes en cours. |
| VM 04 (base) indisponible | Aucune ; Express se reconnecte au retour. | Lectures, écritures et PDF d’état des lieux en erreur jusqu’au retour. |
| VM 05 (identité) indisponible | Aucune ; Keycloak réimporte son realm. | Nouvelles connexions impossibles ; sessions ORION ouvertes valides. |
| VM 06 (postes simulés) indisponible | Swarm relance l’émulateur sur la VM 02 ou 03. | Rapports de postes interrompus pendant la relance. |
| VM 07 (journaux) indisponible | Aucune ; les journaux restent consultables sur chaque VM (`docker logs`). | Aucun ; centralisation interrompue. |
| Un manager Swarm indisponible | Les deux autres managers continuent de diriger le cluster. | Celui de son service (VM 01, 04 ou 05). |

Les opérations planifiées (déploiement, mise à jour, rotation des secrets) ne sont pas des reprises automatiques.

### 4.7. Traitement des rapports de postes

Le code sépare les routes HTTP, le traitement des postes (`postes.js`), le moteur d’écriture (`engine.js`) et le dépôt (`postgres.js`). Le moteur ne garde aucun état qui fasse autorité : les rapports et les écritures métier passent par le même verrou PostgreSQL sur la ligne de révision, quelle que soit l’instance d’Express qui les reçoit, et le journal des modifications est conservé en base. Plusieurs instances partagent donc la charge des requêtes, mais leurs écritures restent sérialisées par ce verrou.

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
| Debian | 13 | Exception : système des VM fournies pour la démonstration | Système des sept VM |
| Docker Engine et Swarm | version installée sur les VM | Exception : exécution des conteneurs | VM 01 à 07 ; client sur le poste de l’opérateur |
| chrony | paquet Debian 13 | R / S (NTPd/Chronyd) | Hôte de la VM 01 : horloge de référence des autres VM |
| HAProxy | 3.2, image officielle | R / S | VM 01 |
| Apache HTTP Server | 2.4, image officielle `httpd` | R / S (version 2.4) | Image d’ORION avec le build React ; VM 02, 03 ou 06 |
| Node.js | 22 LTS, image officielle `node` | R / S | Images d’Express et de l’émulateur ; VM 02, 03 ou 06 |
| Express | 5.3.0 | R | Image d’Express |
| PostgreSQL | 17.7, image officielle | R / S | VM 04 |
| Logstash | 8.19, image officielle | R / S | VM 07 ; substitut du service d’observabilité |
| Keycloak | 26.7.4, image officielle | Exception : substitut de MindefConnect | VM 05 |
| OpenLDAP | 1.5.0, image `osixia/openldap` | Exception : substitut de MindefConnect | VM 05 |

## 6. Architecture cible

### 6.1. Vue logique

La cible est décrite dans cette section ; le [schéma unique](18-DIAGRAMMES-ARCHITECTURE.md#architecture-réelle-sur-vm) représente uniquement le déploiement proposé du démonstrateur sur VM.

Cette vue fixe les responsabilités et les contraintes d’hébergement, pas les produits ni le nombre d’instances. Le serveur front est le point d’entrée HTTPS : il sert l’interface et transmet `/api` et `/auth` au serveur back. Le serveur back produit le PDF d’état des lieux à chaque demande, après contrôle des droits, à partir des données de PostgreSQL ; aucun document n’est stocké. Le navigateur n’a aucun accès à PostgreSQL. MindefConnect, hébergé sur le C1NP, authentifie ; ORION conserve et applique les profils, rattachements et droits.

### 6.2. Éléments confirmés et éléments à déterminer

| Domaine | Confirmé | À déterminer ou obtenir |
| --- | --- | --- |
| Hébergement | C1NP | Services du C1NP utilisés, conteneurs, environnements et nombre d’instances |
| Front et back | Deux responsabilités distinctes ; le serveur front est le reverse proxy HTTPS du back | Produits d’hébergement et nombre d’instances |
| Identité | MindefConnect sur le C1NP ; aucun mot de passe ORION | Issuer, client, attributs, redirections, environnements et support |
| Données | PostgreSQL | Offre, version, chiffrement, réplication et maintenance |
| Documents | PDF d’état des lieux produits à la demande par le serveur back, sans stockage | Modèle officiel, signature et numérotation |
| Postes | Windows ; supervision et interventions pilotées par ORION | Outil ou agent, API, protocoles, enrôlement, authentification et coûts |
| Navigateur | Firefox | Versions supportées |
| Réseau | Réseau interne NP avec accès Internet | Zones, flux, DNS, pare-feu et certificats |
| Exploitation | Puits de logs ; points d’accès `/api/health` et `/api/info` | Contenu de `/api/info`, journaux collectés, volumétrie, disponibilité, RPO, RTO et astreinte |
| Sécurité | Authentification obligatoire et valeurs d’autorité fixées par le serveur | Gestion et rotation des secrets, audit, durées de conservation et homologation |

## 7. Trajectoire vers la cible

| Architecture réelle | Cible | Travail nécessaire |
| --- | --- | --- |
| Poste de présentation et Docker Compose | C1NP | Choisir le mode de déploiement et décrire les environnements |
| Keycloak et annuaire OpenLDAP locaux | MindefConnect | Obtenir le contrat, configurer les environnements et qualifier les attributs et parcours |
| Émulateur de postes | Solution d’administration Windows | Étudier l’existant, comparer agent et outils, puis intégrer et tester le contrat réel |
| Vite et son proxy de développement en local ; Apache et HAProxy prévus sur VM | Serveur front et reverse proxy HTTPS | Confirmer les versions et les modalités de déploiement sur le C1NP |
| Express sur la boucle locale | Serveur back derrière le reverse proxy | Configurer les contrôles de santé et le déploiement |
| `/api/health` seul | `/api/health` et `/api/info` | Définir et implémenter `/api/info` |
| Sortie standard des processus | Puits de logs | Choisir le format, la collecte, la rétention et l’accès |
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
