# Dossier d’architecture technique (DAT) — ASTER

**Date de référence :** 9 novembre 2026

**Périmètre :** contexte et contraintes, justification des briques, architecture réelle de démonstration, versions des technologies, architecture cible.

## 1. Objet du document

ASTER est une application web destinée aux écoles de formation. Elle centralise la gestion du parc, les remontées utilisateur, la supervision des postes Windows et les demandes d’intervention à distance.

Le client a demandé un dossier d’architecture technique (entretien du 23 octobre, § 1.6). Ce dossier présente deux architectures :

- **l’architecture cible**, qui décrit le système attendu dans son environnement d’exploitation ;
- **l’architecture réelle**, qui correspond au système effectivement développé, conteneurisé et présenté par l’équipe.

L’architecture réelle respecte les contrats techniques de la cible au moyen de substitutions locales : Keycloak, adossé à un annuaire OpenLDAP, tient lieu de MindefConnect ; SeaweedFS fournit l’API S3 ; un processus Node.js émule les postes Windows. Ces substitutions ne sont pas des composants de production.

## 2. Contexte et contraintes structurantes

Les décisions en vigueur imposent ou orientent les éléments suivants :

- l’interface et les fonctions métier sont réparties entre un serveur front et un serveur back ;
- l’application, non protégée (NP), est hébergée sur le C1NP (cloud maîtrisé non protégé du ministère des Armées) ;
- les utilisateurs s’authentifient avec MindefConnect, hébergé sur le C1NP ;
- le serveur front expose l’interface en HTTPS et transmet, comme reverse proxy, les requêtes `/api` et `/auth` au serveur back ;
- le système dispose d’un puits de logs et expose les points d’accès `/api/health` et `/api/info` ;
- PostgreSQL conserve les données applicatives ;
- les PDF d’état des lieux sont stockés dans un service compatible S3 ;
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
| PDF d’état des lieux | Stockage S3, téléchargement direct par l’utilisateur au moyen d’un lien signé | SeaweedFS compatible S3 et liens présignés | Remplacer l’endpoint local par le service retenu, joignable par les navigateurs |
| Administration Windows | Outil ou agent autorisé à déterminer | Émulateur de postes utilisant l’API réelle | Sélectionner puis intégrer la solution d’administration |
| Points d’accès techniques | `/api/health` et `/api/info` | `/api/health` | Ajouter `/api/info` |
| Journaux | Puits de logs | Sortie standard des processus | Raccorder les journaux au puits de logs |
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
| Documents PDF | API S3 et liens signés | SeaweedFS, AWS SDK S3 et signature des URL | Découple les fichiers binaires de la base relationnelle ; le lien signé, de courte durée et propre à un objet, évite le transit du document par le back sans ouvrir le compartiment | Produit, rétention et chiffrement cibles à déterminer |
| Postes Windows | Solution d’administration ou agent autorisé | Émulateur de postes | Le poste reste l’origine des processus, installations et résultats ; toutes les opérations passent par l’API du back | Ne prouve ni l’exécution, ni l’enrôlement, ni la mise à jour sur Windows |
| Conteneurisation | Mode de déploiement sur le C1NP à déterminer | Docker Compose : quatre conteneurs et quatre volumes | Services reproductibles, persistances séparées, aucune installation manuelle | Conteneurs non confirmés pour la cible |
| Sécurité HTTP | HTTPS terminé par le reverse proxy du serveur front, filtrage | Helmet, écoute sur la boucle locale ; en mode production, HTTPS, cookies sécurisés et secrets dédiés exigés au démarrage | Réduit l’exposition et refuse une configuration de production incomplète | Aucun reverse proxy HTTPS déployé |

## 4. Architecture réelle

### 4.1. Vue d’ensemble

Le schéma est présenté dans les [diagrammes d’architecture](18-DIAGRAMMES-ARCHITECTURE.md#architecture-réelle).

Le navigateur ne contacte jamais PostgreSQL. Pour télécharger un PDF, il appelle une route authentifiée d’Express ; le back contrôle la session et le périmètre du compte, puis le redirige vers une URL S3 présignée, valable 60 secondes et propre à ce document. Le navigateur télécharge le PDF directement dans SeaweedFS : le document ne transite pas par le back.

### 4.2. Services, accès et persistance

| Service | Adresse ou réseau | Persistance | Responsabilité |
| --- | --- | --- | --- |
| Vite | `http://localhost:5173` | aucune | Interface et proxy `/api` et `/auth` |
| Express | `http://localhost:3001` | aucune dans le processus | OIDC, API métier, règles, API des postes, accès aux données et signature des liens de téléchargement |
| Keycloak | `http://localhost:8081` | aucune : configuration réimportée au démarrage | Fournisseur d’identité local |
| OpenLDAP | réseau Compose uniquement | volumes `ldap-data` et `ldap-config` | Identités : identifiant, nom et adresse électronique |
| PostgreSQL ASTER | `localhost:5432` | volume `postgres-data` | Base `aster` : données métier et sessions |
| SeaweedFS | `http://localhost:8333` | volume `s3-data` | Compartiment des PDF d’état des lieux, lu par le navigateur au moyen de liens signés |
| Émulateur de postes | processus Node.js local | aucune | Rapports, réception des interventions et retour des résultats |

Les ports publiés le sont uniquement sur `127.0.0.1`. L’annuaire OpenLDAP ne publie aucun port sur l’hôte.

### 4.3. Authentification

Le fonctionnement général de Keycloak est présenté en [annexe A](#annexe-a--fonctionnement-de-keycloak). Cette section décrit son utilisation dans ASTER.

#### Rôle

Keycloak tient lieu de MindefConnect pour exercer le parcours de connexion OIDC d’ASTER ; il n’est pas le fournisseur d’identité de la cible. Il authentifie l’utilisateur à partir de l’annuaire OpenLDAP et transmet le sujet (`sub`) et l’adresse électronique. ASTER conserve les comptes, profils, écoles de rattachement et états actifs dans sa propre base ; le realm ne définit aucun rôle.

#### Déploiement

Docker Compose démarre Keycloak 26.7.4 en mode `start-dev` et importe le realm `aster`, son client `aster-web` et la fédération LDAP à chaque création du conteneur. Keycloak n’a pas de base de données propre : ses données internes, sans valeur métier, sont perdues à la recréation du conteneur. Les identités sont conservées dans l’annuaire OpenLDAP, initialisé au premier démarrage, non publié sur l’hôte. La fédération est en écriture : une identité créée par Keycloak est enregistrée dans l’annuaire.

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

L’architecture réelle ne définit ni haute disponibilité, ni sauvegarde, ni gestion institutionnelle des secrets, ni journaux d’audit du fournisseur d’identité. Les modalités d’intégration de MindefConnect, ses attributs et ses exigences d’exploitation restent à obtenir.

### 4.4. Flux des données et des postes

- Le front appelle Express ; Express applique les droits puis écrit dans PostgreSQL ASTER.
- À la transmission d’une remontée, Express produit le PDF et le dépose dans SeaweedFS via l’API S3.
- Au téléchargement, Express vérifie les droits et redirige le navigateur vers un lien signé ; le navigateur lit le PDF dans SeaweedFS.
- L’émulateur publie les processus et applications installées sur `/api/agent/rapports`.
- Express renvoie dans cette réponse les interventions à exécuter.
- L’émulateur publie ensuite leur résultat sur `/api/agent/resultats`.

## 5. Versions des technologies

Les versions npm sont celles verrouillées par `package-lock.json` ; les images Docker sont épinglées sur une version exacte.

### 5.1. Composants exécutés

| Élément | Version | Rôle |
| --- | --- | --- |
| Node.js | `>= 22.12`, version exacte non verrouillée | Exécution du back, de l’émulateur et des scripts |
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
| AWS SDK `client-s3` | 3.1164.0 | Accès au stockage objet |
| AWS SDK `s3-request-presigner` | 3.1164.0 | Signature des liens de téléchargement |
| Concurrently | 9.2.5 | Lancement coordonné de Vite, Express et de l’émulateur |
| PostgreSQL | image `postgres:17.7-alpine` | Données métier et sessions |
| Keycloak | image `quay.io/keycloak/keycloak:26.7.4` | Substitut local de MindefConnect |
| OpenLDAP | image `osixia/openldap:1.5.0` | Annuaire local des identités |
| SeaweedFS | image `chrislusf/seaweedfs:4.50` | Stockage objet compatible S3 |
| Docker et Docker Compose | version installée, non verrouillée | Exécution des quatre conteneurs |
| Firefox | version installée, non verrouillée | Navigateur |

### 5.2. Construction et vérification

| Élément | Version | Utilisation |
| --- | --- | --- |
| Playwright | 1.65.0 | Tests de l’interface et de bout en bout |
| Exécuteur de tests de Node.js | inclus dans Node.js | Tests unitaires et d’intégration du back |
| Vite | 8.3.6 | Construction des artefacts du front |

## 6. Architecture cible

### 6.1. Vue logique

Le schéma est présenté dans les [diagrammes d’architecture](18-DIAGRAMMES-ARCHITECTURE.md#architecture-cible).

Cette vue fixe les responsabilités et les contraintes d’hébergement, pas les produits ni le nombre d’instances. Le serveur front est le point d’entrée HTTPS : il sert l’interface et transmet `/api` et `/auth` au serveur back. Le navigateur télécharge les PDF d’état des lieux directement dans le stockage S3, par un lien signé de courte durée que le serveur back délivre après contrôle des droits. Le navigateur n’a aucun accès à PostgreSQL. MindefConnect, hébergé sur le C1NP, authentifie ; ASTER conserve et applique les profils, rattachements et droits.

### 6.2. Éléments confirmés et éléments à déterminer

| Domaine | Confirmé | À déterminer ou obtenir |
| --- | --- | --- |
| Hébergement | C1NP | Services du C1NP utilisés, conteneurs, environnements et nombre d’instances |
| Front et back | Deux responsabilités distinctes ; le serveur front est le reverse proxy HTTPS du back | Produits d’hébergement et nombre d’instances |
| Identité | MindefConnect sur le C1NP ; aucun mot de passe ASTER | Issuer, client, attributs, redirections, environnements et support |
| Données | PostgreSQL | Offre, version, chiffrement, réplication et maintenance |
| Documents | Contrat S3 pour les PDF ; téléchargement direct par lien signé | Fournisseur, endpoint, rétention, versionnage et sauvegarde |
| Postes | Windows ; supervision et interventions pilotées par ASTER | Outil ou agent, API, protocoles, enrôlement, authentification et coûts |
| Navigateur | Firefox | Versions supportées |
| Réseau | Réseau interne NP avec accès Internet | Zones, flux, DNS, pare-feu et certificats |
| Exploitation | Puits de logs ; points d’accès `/api/health` et `/api/info` | Contenu de `/api/info`, journaux collectés, volumétrie, disponibilité, RPO, RTO et astreinte |
| Sécurité | Authentification obligatoire et valeurs d’autorité fixées par le serveur | Gestion et rotation des secrets, audit, durées de conservation et homologation |

## 7. Trajectoire vers la cible

| Architecture réelle | Cible | Travail nécessaire |
| --- | --- | --- |
| Poste de présentation et Docker Compose | C1NP | Choisir le mode de déploiement et décrire les environnements |
| Keycloak et annuaire OpenLDAP locaux | MindefConnect | Obtenir le contrat, configurer les environnements et qualifier les attributs et parcours |
| SeaweedFS local | Service S3 retenu | Configurer endpoint, certificats, identifiants, droits et conservation |
| Émulateur de postes | Solution d’administration Windows | Étudier l’existant, comparer agent et outils, puis intégrer et tester le contrat réel |
| Vite et son proxy de développement, ou Express servant les artefacts construits | Serveur front et reverse proxy HTTPS | Choisir le produit, déployer les artefacts construits et configurer le reverse proxy vers le back |
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
- application : dépendances (`package.json`, `package-lock.json`), infrastructure (`infra/compose.yaml`, realm Keycloak, annuaire LDAP) et serveur (`backend/`).

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
