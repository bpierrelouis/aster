# Dossier d’architecture technique (DAT) — ASTER

**Date de référence :** 12 novembre 2026

**Périmètre :** contexte et contraintes, justification des briques, démonstrateur local et architecture de son déploiement sur VM, versions des technologies, architecture cible.

## 1. Objet du document

ASTER est une application web destinée aux écoles de formation. Elle centralise la gestion du parc, les remontées utilisateur, la supervision des postes Windows et les demandes d’intervention à distance.

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
| Profils et droits | Comptes ASTER dans PostgreSQL | Même principe dans la base ASTER | Le fournisseur d’identité authentifie uniquement ; il ne fournit pas les profils applicatifs |
| Données métier et sessions | PostgreSQL | Conteneur PostgreSQL ASTER | Définir l’offre, les sauvegardes et la disponibilité sur le C1NP |
| PDF d’état des lieux | Produit par le serveur back à chaque demande, après contrôle des droits, sans stockage | Express produit le PDF à chaque demande, avec les informations actuelles de la remontée | Aucun |
| Administration Windows | Outil ou agent autorisé à déterminer | Émulateur de postes utilisant l’API réelle | Sélectionner puis intégrer la solution d’administration |
| Points d’accès techniques | `/api/health` et `/api/info` | `/api/health` | Ajouter `/api/info` |
| Logs | Puits de logs | Sortie standard des processus | Raccorder les logs au puits de logs |
| Exposition réseau | HTTPS, DNS et filtrage du C1NP | Services HTTP limités à la boucle locale | Définir DNS, certificats, zones et filtrage |

## 3. Justification des briques

| Besoin | Brique cible | Brique réelle | Justification | Limite actuelle |
| --- | --- | --- | --- | --- |
| Interface interactive | Serveur front compatible Firefox | React, React DOM, React Router et Vite | Une application web évite toute installation sur les postes utilisateurs ; React structure les écrans et React Router donne une adresse à chaque vue | Vite est le serveur de développement, pas une décision d’hébergement |
| Règles et API | Serveur back JavaScript | Node.js et Express | Centralise droits, règles métier, identifiants, dates, historique et accès aux services ; le navigateur n’est jamais une autorité | Dimensionnement non défini |
| Identité | MindefConnect | Keycloak et `openid-client` en OIDC | Sépare l’authentification des comptes et profils ASTER ; le flux Authorization Code utilise PKCE, `state` et `nonce` ; changer de fournisseur ne demande qu’un changement de configuration | Contrat MindefConnect non disponible |
| Annuaire des identités | Interne à MindefConnect | OpenLDAP fédéré par Keycloak | Porte uniquement l’identité (identifiant, nom, adresse) ; aucun profil ni école n’y est stocké | Composant strictement local |
| Sessions | Stockage serveur partagé | `express-session` et `connect-pg-simple` dans PostgreSQL ASTER | Le navigateur ne reçoit qu’un cookie HttpOnly ; la session peut être invalidée côté serveur | Durée et purge cibles à fixer |
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
| PostgreSQL ASTER | `localhost:5432` | volume `postgres-data` | Base `aster` : données métier et sessions |
| Émulateur de postes | processus Node.js local | aucune | Rapports, réception des interventions et retour des résultats |

Les ports publiés le sont uniquement sur `127.0.0.1`. L’annuaire OpenLDAP ne publie aucun port sur l’hôte.

### 4.3. Authentification

Le fonctionnement général de Keycloak est présenté en [annexe A](#annexe-a--fonctionnement-de-keycloak). Cette section décrit son utilisation dans ASTER.

#### Rôle

Keycloak tient lieu de MindefConnect pour exercer le parcours de connexion OIDC d’ASTER ; il n’est pas le fournisseur d’identité de la cible. Il authentifie l’utilisateur à partir de l’annuaire OpenLDAP et transmet le sujet (`sub`) et l’adresse électronique. ASTER conserve les comptes, profils, écoles de rattachement et états actifs dans sa propre base ; le realm ne définit aucun rôle.

#### Déploiement

Docker Compose démarre Keycloak 26.7.4 en mode `start-dev` et importe le realm `aster`, son client `aster-web` et la fédération LDAP à chaque création du conteneur. Keycloak utilise sa base embarquée H2 (`dev-file`), sans volume persistant pour celle-ci : ses données internes et sessions sont perdues à la recréation du conteneur. Aucun paramètre ne le raccorde à PostgreSQL ASTER. Seuls le realm et le thème sont montés en lecture seule depuis le dépôt. Les identités sont conservées dans l’annuaire OpenLDAP, initialisé au premier démarrage, non publié sur l’hôte. La fédération est en écriture : une identité créée par Keycloak est enregistrée dans l’annuaire.

Le realm permet la connexion par adresse électronique, sans inscription ni réinitialisation de mot de passe.

#### Client OIDC

| Paramètre | Valeur |
| --- | --- |
| Client | `aster-web`, confidentiel |
| Flux | Authorization Code avec PKCE `S256` ; flux implicite et mot de passe direct désactivés |
| Portées | `openid`, `profile`, `email` |
| Adresse de retour | `/auth/callback` de l’interface ASTER |

#### Parcours de connexion

1. Le navigateur demande `/auth/login` à Express via le proxy Vite.
2. Express découvre les métadonnées OIDC du fournisseur, crée un `state`, un `nonce` et un vérificateur PKCE, les conserve dans la session serveur et redirige le navigateur vers le fournisseur.
3. Le fournisseur authentifie l’utilisateur et redirige le navigateur vers le callback ASTER avec un code d’autorisation.
4. Express échange le code et vérifie le `state`, le `nonce`, PKCE et le jeton d’identité.
5. ASTER rapproche l’identité d’un compte ASTER par son sujet, sinon par son adresse, exige que ce compte soit actif et enregistre le sujet si nécessaire. Une identité sans compte ASTER actif n’accède pas à l’application.
6. Express renouvelle l’identifiant de session, conserve la session dans PostgreSQL ASTER et remet au navigateur un cookie de session `HttpOnly`. Chaque requête relit le compte ASTER pour déterminer le profil et les droits.

La session ASTER expire au plus tard à l’expiration du jeton d’identité ou après une heure. À la déconnexion, Express détruit la session ASTER, puis redirige le navigateur vers la fin de session OIDC du fournisseur.

#### Cycle de vie des identités

Hors production uniquement, le serveur ASTER crée dans Keycloak, au démarrage et après chaque modification des comptes, l’identité des comptes ASTER actifs qui n’en ont pas ; Keycloak l’enregistre dans l’annuaire. Ce provisionnement est désactivé en production, où les identités existent chez MindefConnect. Il ne crée ni compte ASTER ni droit. Les changements de profil, d’école ou d’état actif sont portés par le compte ASTER ; une désactivation ferme les sessions ASTER en cours.

#### Disponibilité et limites

Le point d’accès `/api/health` vérifie la base ASTER et les métadonnées du fournisseur d’identité ; si l’un ne répond pas, il renvoie un état indisponible. Une panne du fournisseur empêche les nouvelles connexions, même si les données métier restent disponibles.

Le montage local conserve les données dans des volumes Docker. Les reprises automatiques et la collecte des logs techniques relèvent de la proposition de déploiement des §§ 4.5 et 4.6 ; aucune sauvegarde n’est prévue pour la démonstration.

### 4.4. Flux des données et des postes en local

- Le front appelle Express ; Express applique les droits puis écrit dans PostgreSQL ASTER.
- À la demande d’un état des lieux, Express vérifie les droits, produit le PDF à partir des données actuelles et le renvoie au navigateur, sans le conserver.
- L’émulateur publie les processus et applications installées sur `/api/agent/rapports`.
- Express renvoie dans cette réponse les interventions à exécuter.
- L’émulateur publie ensuite leur résultat sur `/api/agent/resultats`.

### 4.5. Architecture réelle sur VM

Deux schémas décrivent le déploiement du démonstrateur : la [vue simplifiée](18-DIAGRAMMES-ARCHITECTURE.md#vue-simplifiée) présente les rôles et les échanges principaux ; la [vue complète](18-DIAGRAMMES-ARCHITECTURE.md#architecture-réelle-sur-vm) détaille chaque VM, ses services, conteneurs, ports, volumes et flux. Une flèche indique la destination d’un flux. Les versions et leur statut au CCT figurent au § 5.3.

**Principes retenus.**

- **Un rôle par VM.** Chaque rôle a ses propres VM : une panne ou une intervention sur l’un ne touche pas les autres. Les dix VM se répartissent ainsi : les managers, qui portent aussi l’entrée et le DNS (orion-1 à orion-3), l’application (orion-4 et orion-5), PostgreSQL (orion-6), l’identité (orion-7 : Keycloak et OpenLDAP, qui simulent ensemble MindefConnect), les logs (orion-8 : Logstash), une VM de secours (orion-9) et le stockage (orion-10).
- **Des rôles isolés, repris par une VM de secours.** PostgreSQL, l’identité et Logstash ont chacun leur VM. Si l’une tombe, Swarm recrée son service sur orion-9, qui retrouve ses données sur le stockage. Le déploiement vide orion-9 le temps de placer les services : chacun démarre ainsi sur sa VM, et un service repris par orion-9 rejoint la sienne au déploiement suivant.
- **Des managers à l’entrée.** Les trois managers Swarm, orion-1 à orion-3, dirigent le cluster. orion-1 et orion-2 portent en plus l’entrée : une instance de HAProxy et un serveur DNS chacun ; orion-3 ne fait que diriger. Deux managers sur trois suffisent pour que le cluster continue de fonctionner.
- **Un nom plutôt qu’une adresse.** ORION se joint par `https://orion.internal`. Deux serveurs DNS BIND, sur le modèle de la configuration fournie par le formateur, répondent pour ce domaine, sur orion-1 et orion-2 ; chaque poste les déclare tous deux et interroge le second si le premier ne répond pas. `orion.internal` désigne orion-1 et orion-2, qui portent chacun un HAProxy : si l’un tombe, le navigateur se tourne vers l’autre adresse.
- **Doublement là où il est simple.** HAProxy, Apache et Express, sans données, ont deux instances actives chacun, sur deux VM : la perte de l’une ne coupe pas le service. Les autres services ont une seule instance, relancée automatiquement s’il s’arrête ou au redémarrage de sa VM, et recréée sur une autre VM si la sienne tombe : l’émulateur sur l’autre VM de l’application, PostgreSQL, l’identité et Logstash sur la VM de secours, où ils retrouvent leurs données (§ 4.6). Chacun des deux serveurs DNS reste sur sa VM : les postes se tournent vers l’autre. Aucune action manuelle n’est nécessaire.
- **Un stockage pour toutes les données.** Les données de PostgreSQL, d’OpenLDAP et de BIND et les logs centralisés sont sur orion-10, hors Swarm, sur deux disques ext4 partagés en NFSv4 : l’un pour les données, l’autre pour les logs. Ce sont des volumes Docker du pilote `local`, de type `nfs` : la VM qui exécute le service monte son volume, et un service recréé sur une autre VM retrouve ainsi ses données. Aucune VM n’est dédiée aux logs.
- **Les VM fournies, telles quelles.** Les dix VM sont sous Debian 13, avec Docker déjà installé. Les services sont des conteneurs, gérés par une seule pile Docker Swarm, `orion` ; seuls chrony (orion-1) et le serveur NFS (orion-10) sont des services de l’hôte. Aucune VM d’administration ni outil d’automatisation n’est ajouté : l’opérateur administre depuis son poste avec le client Docker, SSH et quelques scripts.
- **Technologies du CCT.** Seuls des produits présents dans la colonne C1NP de l’annexe « pile logicielle » du CCT 2026-2027 (version 3.7) sont utilisés, à trois exceptions près : le système des VM fournies pour la démonstration (Debian 13, avec Docker déjà installé), qui n’existera pas sur le C1NP, Docker Engine et Swarm, et les substituts des services du réseau cible (Keycloak et OpenLDAP pour MindefConnect, Logstash pour le service d’observabilité). BIND reprend la configuration fournie par le formateur ; son statut au CCT reste à vérifier (§ 5.3). Les images utilisées sont les images officielles de ces produits ; ORION construit les siennes à partir des images officielles `httpd:2.4` et `node:22`. OpenSSH, systemd et `systemd-timesyncd` sont traités comme des composants de Debian 13, de même que le serveur et le client NFS du noyau Linux (paquets `nfs-kernel-server` et `nfs-common`), dont le statut au CCT reste à vérifier (§ 5.3).

| Nom d’hôte | Rôle | Service | Exécution | Swarm | Ports d’écoute | Volume |
| --- | --- | --- | --- | --- | --- | --- |
| orion-1, orion-2 | Managers, entrée et DNS | Managers Docker Swarm ; HAProxy 3.2 ; BIND 9.20 ; chrony (orion-1) | HAProxy et BIND, une instance de chacun par VM, en conteneurs, ports publiés sur l’hôte ; chrony sur l’hôte | Managers | `2377/TCP` ; HTTPS `443`, `8443` ; `8444` pour l’administration ; DNS `53/TCP et UDP` ; NTP `123/UDP` (orion-1) | Volumes NFS `bind-1-*` et `bind-2-*` (cache, données, journal), sur orion-10 |
| orion-3 | Manager | Manager Docker Swarm | Démon Docker | Manager | `2377/TCP` | — |
| orion-4, orion-5 | Application | Apache HTTP Server 2.4 et build React ; Express 5 sur Node.js 22 ; émulateur des postes | Conteneurs : Apache et Express, une instance par VM ; émulateur, une instance | Workers | HTTP `8080` et `3001`, réseau overlay | — |
| orion-6 | PostgreSQL | PostgreSQL 17.7 | Conteneur | Worker | TCP `5432`, réseau overlay | Volume NFS `pg-nfs`, sur orion-10 |
| orion-7 | Identité (substituts) | Keycloak 26.7.4 et OpenLDAP 1.5.0 | Deux conteneurs | Worker | HTTP `8080` et LDAP `389`, réseau overlay | Volumes NFS `ldap-data-nfs` et `ldap-config-nfs`, sur orion-10 |
| orion-8 | Logs (substitut) | Logstash 8.19 | Conteneur | Worker | TCP TLS `6514`, publié par le maillage de routage | Volume NFS `logs-nfs`, sur orion-10 |
| orion-9 | Secours | Aucun en temps normal ; reprend PostgreSQL, l’identité ou Logstash | Conteneurs du rôle repris | Worker | Ceux du rôle repris | Volumes du rôle repris |
| orion-10 | Stockage | Serveur NFS du noyau Linux | Service de l’hôte | Hors Swarm | NFSv4 `2049/TCP` | Disque des données en ext4 (`/srv/orion/donnees`) et disque des logs en ext4 (`/srv/orion/logs`) |

**Échanges numérotés de la vue simplifiée.**

1. Le navigateur trouve l’adresse d’`orion.internal` auprès du DNS, puis joint HAProxy, seule porte d’entrée.
2. HAProxy sert l’interface (Apache) et transmet les appels `/api` et `/auth` à Express, qui produit aussi les états des lieux PDF à la demande.
3. Express lit et écrit les données dans PostgreSQL.
4. PostgreSQL et OpenLDAP enregistrent leurs données, et Logstash les logs, sur le stockage d’orion-10, monté en NFS ; la vue complète montre aussi celles de BIND.
5. Pour se connecter, le navigateur passe par HAProxy vers Keycloak, qui vérifie l’identité dans OpenLDAP.
6. Les postes simulés envoient leurs rapports à Express et reçoivent les interventions à exécuter.
7. Les conteneurs envoient leurs logs au collecteur Logstash.
8. L’opérateur administre les VM par SSH et pilote le cluster par un manager, depuis son poste.

#### Réseau, adresses et ports

**Correspondance des machines.** Source : `Copie de liste_machine_wd12.xlsx`, feuille `Feuil1`, correspondances transmises par l’utilisateur le 12 novembre 2026. Le classeur n’a pas été retrouvé dans les emplacements consultés ; ces données reprennent la transmission, avec les virgules des IPv4 normalisées en points. Le 12 novembre, l’utilisateur a renommé les machines `orion-1` à `orion-8` (anciennement `aster-1` à `aster-8`) et ajouté `orion-9` et `orion-10` ; le nom d’hôte de chaque VM est son nom `orion-N`, indépendamment du suffixe du nom technique. Ces affectations concernent le déploiement proposé et ne prouvent aucun déploiement effectif. Le réseau des VM est `172.16.128.0/20` ; son DNS, `172.16.143.251` (domaine `formation`), répond pour les noms extérieurs à ORION. Le montage local et la cible C1NP restent distincts.

| Nom d’hôte | Nom technique dans le tableau | IPv4 | Affectation prévue |
| --- | --- | --- | --- |
| orion-1 | debian-pdi-cont-wd12--294-6 | 172.16.131.188 | Manager, entrée et DNS ; horloge chrony |
| orion-2 | TPL-DEBIAN-13-PDI-CONTAINER-294-7 | 172.16.131.133 | Manager, entrée et DNS |
| orion-3 | debian-pdi-cont-wd12--294-9 | 172.16.131.193 | Manager, entrée et DNS |
| orion-4 | debian-pdi-cont-wd12--294-16 | 172.16.131.208 | Application |
| orion-5 | TPL-DEBIAN-13-PDI-CONTAINER-294-10 | 172.16.131.142 | Application |
| orion-6 | TPL-DEBIAN-13-PDI-CONTAINER-294-8 | 172.16.131.131 | PostgreSQL |
| orion-7 | TPL-DEBIAN-13-PDI-CONTAINER-294-18 | 172.16.131.137 | Identité : Keycloak et OpenLDAP |
| orion-8 | TPL-DEBIAN-13-PDI-CONTAINER-294-19 | 172.16.131.146 | Logs : Logstash |
| orion-9 | non transmis | 172.16.131.190 | Secours de PostgreSQL, de l’identité et des logs |
| orion-10 | non transmis | 172.16.131.197 | Stockage NFS, hors Swarm |

**DNS.** Deux serveurs BIND 9.20, `bind-1` et `bind-2`, s’exécutent dans des conteneurs de la pile, fixés l’un à orion-1, l’autre à orion-2, et écoutent le port `53` de l’hôte, en TCP et UDP. Ils servent la même zone, versionnée dans le dépôt ; chacun a ses volumes. Sa configuration et la zone `orion.internal` sont des configurations Swarm versionnées dans le dépôt ; son cache, ses données et ses logs sont sur le stockage d’orion-10. Il répond pour `orion.internal`, qui désigne orion-1 et orion-2, et pour le nom de chaque VM (`orion-N.orion.internal`) ; il transmet les autres questions au DNS du réseau. Les VM et les postes des utilisateurs déclarent orion-1 et orion-2 comme serveurs DNS ; les VM gardent le DNS du réseau en dernier recours. Si l’un tombe, les postes interrogent l’autre ; Swarm relance chaque serveur sur sa VM, dont l’adresse est celle que connaissent les postes.

| Adresse | Service | Accès |
| --- | --- | --- |
| `https://orion.internal` (port `443`) | ORION : interface et API | Utilisateurs |
| `https://orion.internal:8443` | Keycloak : connexion, émetteur OIDC | Utilisateurs et Express |
| `https://orion.internal:8444` | Console d’administration de Keycloak | Réseau d’administration seulement |
| `172.16.131.188` et `172.16.131.133`, port `53` | DNS de la zone `orion.internal` | Utilisateurs et VM |
| IPv4 de chaque VM du tableau ci-dessus, port `22/TCP` | Administration par SSH des dix VM | Réseau d’administration seulement |

L’émetteur OIDC prévu est `https://orion.internal:8443/realms/aster` et le retour OIDC est `https://orion.internal/auth/callback`. Le collecteur reçoit les logs sur `orion.internal:6514/TCP` avec TLS : le maillage de routage de Swarm publie ce port sur chaque VM du cluster et le transmet à Logstash, quelle que soit la VM qui l’exécute. Les certificats de HAProxy et du collecteur portent le nom `orion.internal` et les adresses d’orion-1 et d’orion-2 ; leur autorité doit être reconnue par Firefox, par Node.js et par le pilote `syslog`. L’horloge est jointe sur `172.16.131.188:123/UDP`. Les VM qui montent le stockage le joignent sur `172.16.131.197:2049/TCP` (NFSv4). SSH utilise chacune des dix IPv4 sur `22/TCP`, depuis le réseau d’administration. Les certificats et le filtrage restent à qualifier pour ce déploiement proposé.

HAProxy termine le TLS. Il publie ses ports sur l’hôte d’orion-1 et d’orion-2 et joint les services par leur nom sur le réseau overlay de Swarm, chiffré (option `encrypted`) : `apache:8080`, `api:3001` et `keycloak:8080`. Le port `443` refuse les chemins de la console Keycloak, servie uniquement sur `8444`. Les PDF d’état des lieux passent par le port `443`, comme le reste de l’API.

Express utilise pour Keycloak la même adresse que le navigateur : il le joint donc aussi par HAProxy, sur `8443`. Il joint PostgreSQL directement par le réseau overlay (`postgres:5432`), et l’émulateur joint Express par ce même réseau (`api:3001`). Keycloak lit l’annuaire par `ldap:389`. La résolution de noms interne de Docker sert à l’intérieur du cluster ; les autres noms sont transmis aux serveurs DNS de la VM.

Le filtrage autorise :

- `443`, `8443` et `53/TCP et UDP` vers orion-1 et orion-2 depuis le réseau des utilisateurs ;
- `8444` vers orion-1 et orion-2 et `22` vers les dix VM depuis le réseau d’administration ;
- `53/TCP et UDP` des VM vers orion-1, orion-2 et le DNS du réseau, et d’orion-1 et orion-2 vers celui-ci ;
- entre les VM du cluster (toutes sauf orion-10) : `2377/TCP` vers les managers, `7946/TCP et UDP`, `4789/UDP` et le protocole IP 50 (ESP) du réseau overlay chiffré ;
- `6514/TCP` des VM du cluster vers orion-1 et orion-2 (maillage de routage), puis par le réseau `ingress` de Swarm vers la VM de Logstash ;
- `2049/TCP` d’orion-1 à orion-3 et d’orion-6 à orion-9 vers orion-10 (NFSv4) ;
- `123/UDP` des VM orion-2 à orion-10 vers orion-1, horloge de référence.

#### Docker Swarm

Une seule pile, `orion`, décrite dans un fichier versionné et déployée avec `docker stack deploy`, contient tous les conteneurs. La composition du cluster (managers, workers, étiquettes de nœud) ne relève pas de ce fichier : elle est réglée par les commandes `docker swarm` et `docker node` du script de préparation. Chaque service redémarre automatiquement (`restart_policy`) ; au démarrage d’une VM, Docker relance ses conteneurs. Les services sont placés d’après des étiquettes de nœud : `orion=entree` pour orion-1 et orion-2 (HAProxy), le nom d’hôte pour chaque serveur DNS (orion-1, orion-2), `orion=application` pour orion-4 et orion-5, et une étiquette par rôle isolé : `pg=true` (orion-6), `identite=true` (orion-7) et `logs=true` (orion-8). orion-9 porte ces trois dernières étiquettes : Swarm peut y recréer chacun de ces services.

HAProxy, Apache et Express ont deux instances chacun, une par VM de leur groupe (`max_replicas_per_node: 1`) ; HAProxy répartit les requêtes entre les instances d’Apache et d’Express et écarte celle qui ne répond plus. L’émulateur a une instance, pour ne pas simuler deux fois les mêmes postes. PostgreSQL, Keycloak, OpenLDAP et Logstash ont une instance chacun : leurs volumes étant sur orion-10, Swarm les recrée sur orion-9 si leur VM tombe, et ils y retrouvent leurs données. Chaque serveur DNS a une instance, relancée sur sa VM. Swarm ne sait pas préférer une VM à une autre : pour que chaque rôle isolé démarre sur sa VM et non sur orion-9, le script de déploiement vide orion-9 (`drain`) pendant le déploiement, si orion-6, orion-7 et orion-8 sont prêtes, puis la remet en service. Un service repris par orion-9 rejoint ainsi sa VM au déploiement suivant ; si deux VM isolées tombent en même temps, leurs services partagent orion-9. Une mise à jour arrête l’ancienne instance avant de démarrer la nouvelle (ordre `stop-first`, par défaut) : un volume n’est jamais utilisé par deux instances à la fois. Si un manager ou une VM de l’application tombe, l’instance de HAProxy, d’Apache ou d’Express qu’elle portait attend son retour ; les autres instances assurent le service. Au retour d’une VM, un redéploiement répartit de nouveau les services à une instance. HAProxy, l’émulateur et Express se joignent par le nom des services : la VM qui les exécute importe peu.

orion-1, orion-2 et orion-3 sont managers : ils dirigent le cluster ; orion-1 et orion-2 portent aussi l’entrée et le DNS. Deux managers sur trois suffisent pour que le cluster continue de fonctionner. orion-4 à orion-9 sont workers. orion-10 n’appartient pas au cluster : elle ne fait que partager ses disques.

Les images d’ORION (Apache avec le build React, Express, émulateur, Keycloak avec le realm et le thème) sont construites et publiées sur Docker Hub par l’intégration continue, avec le commit pour étiquette ; chaque VM les télécharge au déploiement, comme les images officielles. Chaque image est épinglée sur une version exacte, l’image de BIND par son empreinte, et des contrôles de santé (`HEALTHCHECK`) signalent un conteneur défaillant, que Swarm remplace.

Express ne garde aucun état qui fasse autorité : l’espace de travail et les sessions sont dans PostgreSQL. Chaque écriture verrouille la ligne de révision, relit l’état et fusionne les modifications concurrentes grâce au journal des dernières révisions, conservé en base. Les deux instances servent donc indifféremment n’importe quel utilisateur, et un redémarrage ne déconnecte personne.

#### Logs

Chaque conteneur envoie ses logs au collecteur par le pilote `syslog` de Docker, au format syslog RFC 5424 exigé par le CCT, sur TCP TLS `6514`, à `orion.internal`. Le pilote fonctionne en mode non bloquant : une panne du collecteur ne bloque jamais un service démarré, mais les logs émis pendant l’interruption ne sont pas centralisés ; un conteneur créé pendant l’interruption échoue et Swarm le relance jusqu’au retour du collecteur. Docker en garde une copie locale, consultable sur la VM avec `docker logs`. Les logs du système de chaque VM restent dans journald, consultables par SSH.

Logstash 8.19 s’exécute dans un conteneur de la pile, en une instance, sur orion-8 (orion-9 s’il l’a repris). Il tient lieu du service d’observabilité du C1NP, fondé sur Elastic. Il écrit les logs reçus dans le volume NFS `logs-nfs`, c’est-à-dire sur le disque des logs d’orion-10 (`/srv/orion/logs/conteneurs`) : un répertoire par service et un fichier par jour, lisibles directement sur le système de fichiers d’orion-10. Chaque serveur DNS écrit en plus son propre journal dans `/srv/orion/logs/bind/1` ou `/srv/orion/logs/bind/2`. L’opérateur les lit par SSH. S’il est recréé sur orion-9, Logstash poursuit l’écriture des mêmes fichiers. Aucun port de consultation web n’est ouvert. La durée de conservation et la purge des fichiers restent à fixer.

#### Administration et horloge

L’opérateur administre depuis son poste, sur le réseau d’administration, en se connectant en SSH à chaque VM. Utiliser des comptes nominatifs, des clés SSH, la vérification des clés d’hôte et une élévation `sudo` limitée ; désactiver la connexion SSH directe de root et l’authentification par mot de passe. Prévoir aussi l’accès à la console de l’hyperviseur pour une VM injoignable.

Depuis son poste, l’opérateur pilote le cluster avec le client Docker, relié par SSH à un manager : secrets, configurations et déploiement de la pile (`docker stack deploy`, sur orion-1). Un script court, conservé dans le dépôt avec le fichier de pile, prépare les VM : nom d’hôte, serveurs DNS, horloge, autorité du pilote `syslog`, stockage d’orion-10 (disques, partages NFS), composition du cluster et secrets. Il peut être relancé : il amène un cluster existant à la répartition prévue, en promouvant les nouveaux managers avant de rétrograder les anciens. Rien de cela n’intervient en cas de panne.

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

Tous les secrets de la pile, y compris les clés et certificats TLS de HAProxy et de Logstash, sont des secrets Swarm, créés une fois par le script de préparation avec des valeurs aléatoires ; aucun n’est écrit dans le dépôt, dans une image ou dans une variable d’environnement de la pile. Hors de Swarm ne restent que les clés SSH de l’opérateur et l’autorité de certification : sa clé privée reste sur le poste de l’opérateur ; son certificat, public, est déposé sur chaque VM pour que le pilote `syslog` de Docker vérifie le collecteur. La rotation est une opération planifiée : nouvelle valeur, mise à jour du service qui l’authentifie, redéploiement, vérification, puis retrait de l’ancienne. Le verrouillage automatique des managers (`autolock`) n’est pas activé, pour qu’un redémarrage ne demande aucune action ; protéger en contrepartie l’accès aux disques des managers.

#### Volumes

| Volume | Stockage → montage | Contenu |
| --- | --- | --- |
| Volume NFS `pg-nfs` | orion-10 `/srv/orion/donnees/postgres` → `/var/lib/postgresql/data` du conteneur PostgreSQL | Données métier et sessions ORION |
| Volumes NFS `ldap-data-nfs` et `ldap-config-nfs` | orion-10 `/srv/orion/donnees/ldap-data` et `/srv/orion/donnees/ldap-config` → `/var/lib/ldap` et `/etc/ldap/slapd.d` du conteneur OpenLDAP | Identités et configuration de l’annuaire |
| Volumes NFS `bind-N-cache-nfs` et `bind-N-lib-nfs` (N = 1, 2) | orion-10 `/srv/orion/donnees/bind/N/cache` et `/srv/orion/donnees/bind/N/lib` → `/var/cache/bind` et `/var/lib/bind` du serveur DNS N | Cache et données de chaque serveur DNS |
| Volume NFS `logs-nfs` | orion-10 `/srv/orion/logs/conteneurs` → `/var/log/orion` du conteneur Logstash | Logs centralisés, lisibles directement sur orion-10 |
| Volumes NFS `bind-N-logs-nfs` (N = 1, 2) | orion-10 `/srv/orion/logs/bind/N` → `/var/log/bind` du serveur DNS N | Journal de chaque serveur DNS |

orion-10 a trois disques : le premier porte Debian 13 ; les deux autres, ajoutés pour le stockage et formatés en ext4, portent l’un les données (`/srv/orion/donnees`), l’autre les logs (`/srv/orion/logs`), de sorte que les logs ne puissent pas remplir le disque des données. Les deux sont partagés en NFSv4, en écriture synchrone (`sync`), avec les seules VM qui les montent : orion-1 et orion-2 (DNS), orion-6, orion-7, orion-8 et orion-9 (rôles isolés et secours). Les volumes de la pile sont des volumes Docker du pilote `local`, de type `nfs`, comme dans la configuration du formateur : la VM qui exécute le service les monte au démarrage du conteneur, avec l’option `hard`, qui fait attendre les écritures pendant une coupure du stockage au lieu de les faire échouer. Chaque volume n’est utilisé que par une instance à la fois. Les comptes root de ces VM conservent leurs droits sur le partage (`no_root_squash`), pour que les images officielles attribuent leurs fichiers au compte de leur service. Apache, Express, Keycloak et l’émulateur n’ont pas de données propres : le build React est intégré à l’image d’Apache, le realm et le thème à celle de Keycloak, réimportés à chaque création du conteneur. Keycloak conserve ses sessions dans sa base H2 interne : elles sont perdues à sa recréation et les utilisateurs se reconnectent.

#### Réglages de l’application

Dans ce déploiement, Express écoute sur toutes les interfaces de son conteneur, pour être joint par HAProxy et par l’émulateur. Il continue de créer les identités des comptes actifs dans le Keycloak substitut, en joignant son administration par le réseau overlay plutôt que par le port `8443`, qui refuse ces chemins. Il reconnaît l’autorité des certificats de HAProxy pour joindre Keycloak. L’émulateur joint Express par `api:3001`. Ces réglages sont décrits dans le [guide de l’application](../application/README.md#production).

#### Points à qualifier

- Configuration DNS des postes des utilisateurs (orion-1 et orion-2), ou délégation de la zone `orion.internal` par le DNS du réseau ; délai de bascule du navigateur d’une adresse à l’autre.
- Fichier `/etc/resolv.conf` des VM, écrit par le script de préparation : vérifier qu’aucun service du système ne le réécrit.
- Version de Docker installée sur les VM, accès des VM à Internet pour télécharger les images.
- Réseau : confirmation des affectations IP fournies, filtrage, protocole ESP du réseau overlay chiffré, accès SSH et console de l’hyperviseur.
- Capacité CPU, mémoire et disque de chaque VM, dont la machine Java de Logstash ; ajout des deux disques d’orion-10.
- Taille des disques de données et de logs d’orion-10 et durée de conservation des logs.
- Tenue de PostgreSQL et d’OpenLDAP, dont la base LMDB est déconseillée sur un système de fichiers réseau, sur le stockage NFS : performances, verrous et intégrité après une coupure, à éprouver par les essais de panne.
- Double écriture : si orion-6 ou orion-7 est isolée du cluster sans perdre l’accès au stockage, Swarm peut démarrer une seconde instance de PostgreSQL ou d’OpenLDAP sur orion-9 pendant que la première écrit encore.
- Capacité d’orion-9 à porter un rôle isolé, voire deux si deux VM isolées tombent ensemble.
- Statut au CCT de BIND et du serveur et du client NFS (§ 5.3).
- Accès de l’API d’administration de Keycloak par son adresse interne : réglage du nom d’hôte de Keycloak à vérifier.
- Délai de détection d’une VM perdue et de recréation des conteneurs ailleurs ; temps d’écriture sous verrou avec deux instances d’Express et l’activité des postes.
- Essai de chaque panne du § 4.6.

### 4.6. Pannes et reprises

Aucune panne ne demande d’action manuelle : chaque service est relancé automatiquement. Les services d’un manager ou d’une VM de l’application continuent sur les autres VM de leur groupe ; ceux d’orion-6, orion-7 ou orion-8 sont recréés sur orion-9 et retrouvent leurs données sur le stockage d’orion-10 ; les postes se tournent vers le DNS restant. Seule la perte durable d’orion-10 rend un service indisponible jusqu’à son retour.

| Panne | Reprise automatique | Effet pour l’utilisateur |
| --- | --- | --- |
| Un conteneur s’arrête | Swarm le redémarre sur sa VM. | Aucun pour HAProxy, Apache et Express, dont l’autre instance répond ; sinon service indisponible quelques secondes. |
| Une VM redémarre | Docker relance ses conteneurs. | Service de la VM indisponible pendant le redémarrage, sauf s’il a une seconde instance. |
| Un manager (orion-1, orion-2 ou orion-3) indisponible | Les deux autres managers continuent de diriger le cluster ; si orion-1 ou orion-2 est concerné, le navigateur se tourne vers l’autre adresse d’`orion.internal` et le poste vers l’autre DNS ; si orion-1 est concerné, les horloges des autres VM continuent sans référence. | Requêtes en cours interrompues ; ORION et la connexion de nouveau accessibles après le délai de bascule du navigateur. |
| orion-4 ou orion-5 (application) indisponible | HAProxy envoie les requêtes aux instances d’Apache et d’Express de l’autre VM ; Swarm recrée l’émulateur sur l’autre VM s’il était concerné. | Aucun, hormis les requêtes en cours ; rapports de postes interrompus pendant la relance de l’émulateur. |
| orion-6 (PostgreSQL) indisponible | Swarm recrée PostgreSQL sur orion-9, qui monte le même volume ; Express se reconnecte. | Lectures, écritures et PDF d’état des lieux en erreur pendant la relance. |
| orion-7 (identité) indisponible | Swarm recrée Keycloak et OpenLDAP sur orion-9, qui monte les mêmes volumes ; Keycloak réimporte son realm. | Nouvelles connexions impossibles pendant la relance ; sessions ORION ouvertes valides. |
| orion-8 (logs) indisponible | Swarm recrée Logstash sur orion-9, qui monte le même volume. | Aucun ; centralisation des logs interrompue pendant la relance, logs consultables sur chaque VM (`docker logs`). |
| orion-9 (secours) indisponible | Aucune en temps normal ; un service qu’elle avait repris est recréé sur sa VM d’origine si celle-ci est revenue. | Aucun, sauf pendant la relance d’un service qu’elle avait repris. |
| orion-10 (stockage) indisponible | Aucune ; les accès des DNS, de PostgreSQL, d’OpenLDAP et de Logstash attendent son retour (montage `hard`), puis reprennent. | Lectures, écritures, PDF d’état des lieux et nouvelles connexions bloqués jusqu’au retour ; sessions ORION ouvertes conservées ; logs consultables sur chaque VM (`docker logs`). |

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
| Debian | 13 | Exception : système des VM fournies pour la démonstration | Système des dix VM |
| Docker Engine et Swarm | version installée sur les VM | Exception : exécution des conteneurs | VM orion-1 à orion-9 ; client sur le poste de l’opérateur |
| chrony | paquet Debian 13 | R / S (NTPd/Chronyd) | Hôte d’orion-1 : horloge de référence des autres VM |
| HAProxy | 3.2, image officielle | R / S | orion-1 et orion-2 |
| BIND | 9.20.30, image officielle `internetsystemsconsortium/bind9`, épinglée par empreinte | Non vérifié ; configuration fournie par le formateur | orion-1 et orion-2, une instance chacun ; DNS de la zone `orion.internal` |
| Apache HTTP Server | 2.4, image officielle `httpd` | R / S (version 2.4) | Image d’ORION avec le build React ; orion-4 et orion-5 |
| Node.js | 22 LTS, image officielle `node` | R / S | Images d’Express et de l’émulateur ; orion-4 et orion-5 |
| Express | 5.3.0 | R | Image d’Express |
| PostgreSQL | 17.7, image officielle | R / S | orion-6 (secours orion-9) ; données sur orion-10 |
| Logstash | 8.19, image officielle | R / S | orion-8 (secours orion-9) ; logs sur orion-10 ; substitut du service d’observabilité |
| Keycloak | 26.7.4, image officielle | Exception : substitut de MindefConnect | orion-7 (secours orion-9) |
| OpenLDAP | 1.5.0, image `osixia/openldap` | Exception : substitut de MindefConnect | orion-7 (secours orion-9) ; données sur orion-10 |
| Serveur et client NFS (NFSv4.2) | paquets Debian 13 `nfs-kernel-server` et `nfs-common` | Non vérifié : composant de Debian 13 | Serveur sur l’hôte d’orion-10 ; client sur orion-1 à orion-3 et orion-6 à orion-9 |

## 6. Architecture cible

### 6.1. Vue logique

La cible est décrite dans cette section ; le [schéma unique](18-DIAGRAMMES-ARCHITECTURE.md#architecture-réelle-sur-vm) représente uniquement le déploiement proposé du démonstrateur sur VM.

Cette vue fixe les responsabilités et les contraintes d’hébergement, pas les produits ni le nombre d’instances. Le serveur front est le point d’entrée HTTPS : il sert l’interface et transmet `/api` et `/auth` au serveur back. Le serveur back produit le PDF d’état des lieux à chaque demande, après contrôle des droits, à partir des données de PostgreSQL ; aucun document n’est stocké. Le navigateur n’a aucun accès à PostgreSQL. MindefConnect, hébergé sur le C1NP, authentifie ; ASTER conserve et applique les profils, rattachements et droits.

### 6.2. Éléments confirmés et éléments à déterminer

| Domaine | Confirmé | À déterminer ou obtenir |
| --- | --- | --- |
| Hébergement | C1NP | Services du C1NP utilisés, conteneurs, environnements et nombre d’instances |
| Front et back | Deux responsabilités distinctes ; le serveur front est le reverse proxy HTTPS du back | Produits d’hébergement et nombre d’instances |
| Identité | MindefConnect sur le C1NP ; aucun mot de passe ASTER | Issuer, client, attributs, redirections, environnements et support |
| Données | PostgreSQL | Offre, version, chiffrement, réplication et maintenance |
| Documents | PDF d’état des lieux produits à la demande par le serveur back, sans stockage | Modèle officiel, signature et numérotation |
| Postes | Windows ; supervision et interventions pilotées par ASTER | Outil ou agent, API, protocoles, enrôlement, authentification et coûts |
| Navigateur | Firefox | Versions supportées |
| Réseau | Réseau interne NP avec accès Internet | Zones, flux, DNS, pare-feu et certificats |
| Exploitation | Puits de logs ; points d’accès `/api/health` et `/api/info` | Contenu de `/api/info`, logs collectés, volumétrie, disponibilité, RPO, RTO et astreinte |
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
- répartition des VM, orientation de l’utilisateur du 10 novembre 2026, révisée le 11 novembre 2026 : bascules automatiques sans action manuelle, HAProxy séparé des serveurs web, journaux centralisés sur le système de fichiers de la VM 10 et absence de DNS limitée à l’accès externe ; technologies conformes au CCT, consigne et document transmis le 11 novembre 2026. Absence de DNS sur les VM à la demande de l’utilisateur ; produits de la colonne C1NP du CCT, hormis Docker et les substituts des services du réseau cible, puis architecture simplifiée sans haute disponibilité, un rôle par VM, Keycloak et OpenLDAP regroupés, sans copie hors site, s’agissant d’une démonstration, relance ailleurs des services sans données, VM Debian 13 fournies avec Docker et sans Ansible, précisés le 11 novembre 2026 ; séparation stricte des persistances ASTER et Keycloak, représentation des volumes et accès interne aux journaux précisés le 11 novembre 2026 ;
- retours du client du 12 novembre 2026, transmis par l’utilisateur : PDF d’état des lieux générés à la demande par le serveur back, sans stockage S3 ;
- Cadre de cohérence technique du ministère des Armées, CCT 2026-2027, version 3.7, édition 1 du 17 février 2026 (document NP transmis par l’utilisateur) : §§ 3.2.1.2, 3.2.2, 3.3.6, 4.8.3, 5.1.1, 5.1.3 et 5.1.6 et annexe 8.8.2 « pile logicielle », colonne C1NP ;
- [Identité IP dans les certificats TLS](https://www.rfc-editor.org/rfc/rfc9525.html#section-6.4), [réseau overlay chiffré de Swarm](https://docs.docker.com/engine/network/drivers/overlay/#encrypt-traffic-on-an-overlay-network), [contraintes de placement](https://docs.docker.com/engine/swarm/services/#placement-constraints) et [pilote syslog de Docker](https://docs.docker.com/engine/logging/drivers/syslog/) ;
- [Manuel HAProxy 3.2](https://docs.haproxy.org/3.2/configuration.html), [routage des chemins React dans Apache](https://httpd.apache.org/docs/2.4/mod/mod_dir.html#fallbackresource) et [Logstash 8.19](https://www.elastic.co/guide/en/logstash/8.19/index.html) ;
- stockage des données sur une VM dédiée, hors Swarm, à deux disques, partagée en NFSv4 pour que Swarm relance la base sur une autre VM avec ses données : orientation de l’utilisateur du 12 novembre 2026, sur conseil d’un formateur ; le même jour, l’utilisateur demande des secrets gérés par Docker Swarm, des volumes du pilote `local` de type `nfs` et des logs sur ce stockage, sans VM dédiée à Logstash ;
- managers Swarm sans processus applicatif, répartition des dix VM orion-1 à orion-10 et deux disques de stockage, données et logs : décisions de l’utilisateur du 12 novembre 2026 ; le même jour, l’utilisateur transmet la configuration DNS de son formateur (BIND dans Swarm, volumes NFS), retient le domaine `orion.internal`, ORION remplaçant le nom ASTER, et demande de réarranger les VM avec le DNS sur orion-1 et orion-2 ; puis il place le DNS et les reverse proxies sur les managers et isole PostgreSQL, Logstash et l’identité, chacun relancé par Swarm si sa VM tombe ;
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
