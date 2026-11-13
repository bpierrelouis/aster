# Reste à faire — brouillon V1

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 2.1 | 13/11/2026 | Brouillon interne | Diagrammes 06 et 07 à reprendre avec les collègues | [3 versions](../../archive/README.md#reste-a-faire-brouillon-v1) |
<!-- version:fin -->

Document de travail interne, établi le 13 novembre 2026 à l’issue du contrôle du renommage, de la conversion en TypeScript, de la revue de qualité et de l’analyse de sécurité. Il recense ce qui n’a pas été traité. Les décisions et questions ouvertes font foi dans le [cadrage](../02-CADRAGE.md) (§ 19) ; ce document n’en est qu’un aide-mémoire.

## Avant le prochain déploiement sur les VM

- [x] Lancer `application/infra/vm/installer.sh` pour créer le secret Swarm `PROVISIONING_CLIENT_SECRET` (compte de service de création des identités), absent des VM déjà installées.
- [ ] Prévoir la réinitialisation des données de démonstration : `SEED_VERSION` passe à 15 et `SEED_RESET=true` sur les VM ; les comptes ORION se relient aux nouveaux identifiants stables des utilisateurs de l’annuaire.
- [ ] Vérifier après déploiement : connexion des quatre profils, création d’un compte, réception des rapports des postes émulés, `https://172.16.131.188/api/infos` (version servie).

## Après la présentation finale au client

- [ ] Retirer les jetons « Accès de présentation » de la page de connexion du Keycloak local : variable `ORION_COMPTES_PRESENTATION` (Compose, pile des VM) et bloc du thème `orion-mindef` (gabarit, styles, script).

## Sécurité — à décider ou à réaliser

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
| Identité des postes (cible) | Jeton propre à chaque poste en place | Certificat client si le mécanisme d’administration des postes le permet | Cible |

Décidé de ne pas faire (utilisateur, 13 novembre) : filtrage réseau de la console Keycloak (8444) et de Logstash (6514), pare-feu des VM.

## Application

- [ ] Jeton d’un poste : seule l’API `GET /api/workspace/postes/:id/jeton` permet de l’obtenir ; prévoir l’action dans Administration › Postes. Renouveler `AGENT_TOKEN` révoque tous les jetons à la fois : prévoir une révocation poste par poste si le besoin apparaît.
- [ ] Tests : ajouter un test du détail de `/api/health` et `/api/infos` réservé au super administrateur (vérifié manuellement seulement pour les appels anonymes).
- [ ] Un échec isolé de `npm run test:workspace` au premier passage du 13 novembre, non reproduit en trois passages : identifier le test s’il se reproduit.
- [ ] Mode développement : un gros corps refusé tôt par le serveur fait parfois échouer le proxy de Vite (502) ; sans effet derrière HAProxy.

## Documentation

- [ ] Vérifier que le [dossier d’architecture](../17-DOSSIER-ARCHITECTURE-TECHNIQUE.md) et ses schémas reflètent les changements du 13 novembre : secret `PROVISIONING_CLIENT_SECRET` et compte de service Keycloak, `SEED_RESET`, jeton propre à chaque poste, points d’état réservés, en-têtes posés par Apache.
- [ ] Le commit `3ad50a6` (dépendances npm) contient aussi les renommages de `schemas-architecture` et `serve` ; leur contenu est dans `b9151ee`. Historique conservé tel quel, faute de demande de réécriture.
- [ ] [Diagrammes d’architecture](../18-DIAGRAMMES-ARCHITECTURE.md) : ils présentent un « déploiement proposé » alors que la CI déploie sur les VM (job `deploiement`) ; à reformuler selon l’état effectif du déploiement.
- [ ] Cadrage § 22 : dater le prochain rendez-vous ; consigner le sort des propositions préparées pour le 12 novembre (application de scan, livraisons) quand un retour existera.
- [ ] Cadrage : reporter en « Application : … », sans fermer la question côté client, les réponses que l’application apporte déjà : détection des applications par les postes (§ 8), intervention immédiate sur un sous-ensemble des postes d’une seule salle et image de référence fixée par le serveur (§ 9), suivi par poste et échec partiel signalé (§ 9), refus de compléter un signalement par le formateur (§ 13).
- [ ] Backlog (suivi par l’utilisateur) : les noms GitHub conservent l’ancien nom (dépôt `bpierrelouis/aster`, projet « aster development ») ; les commits `09ac7b0` et `cecf0d7` et la référence locale `0762961…` du brouillon de suivi n’existent plus dans l’historique.
- [ ] Le registre des archives et les copies de l’ancien design conservent l’ancien nom du projet dans les versions antérieures au renommage : historique à conserver tel quel.

## DCU à compléter

Ajouts identifiés le 13 novembre en comparant les DCU à l’application ; à réaliser après les réponses de l’utilisateur sur les règles de gestion concernées.

- [ ] [DCU 08 — Gestion du parc](../08-DCU-GESTION-PARC.md) : import JSON avec rapprochement des numéros de série (lignes ignorées, transfert d’un matériel d’une autre école) ; changement d’école d’un matériel ; installation physique des salles (confirmer un déplacement, rapatrier au stock, avancement d’une salle) si elle est retenue dans les livrables.
- [ ] [DCU 09 — Administration des postes](../09-DCU-ADMINISTRATION-POSTES.md) : « Gérer les postes supervisés et le catalogue des applications » (RG-77) ; suivre les interventions qu’il a lancées et en être notifié à leur fin.
- [ ] [DCU 10 — Supervision des postes](../10-DCU-SUPERVISION-POSTES.md) : notification du lancement d’une application interdite à l’administrateur ; adresse IP du poste dans la liste des processus.
- [ ] Nouveau DCU « Administrer ORION » (ou extension du DCU 09) : gérer les comptes ORION (création, modification, désactivation, réactivation ; RG-70) et les écoles (création, renommage ; RG-76), réservés aux administrateurs et au super administrateur.
- [ ] Préférences personnelles (ambiance d’affichage, tableaux de bord ajoutés par l’utilisateur) : décider si elles relèvent d’un DCU ou restent un détail d’interface.
- [ ] Diagrammes protégés [06](../06-DIAGRAMME-CONTEXTE.md) et [07](../07-DIAGRAMMES-ACTIVITE.md) : des collègues les ont modifiés sans publier leur travail ; faire le point avec eux le lundi 16 novembre, puis intégrer le super administrateur, l’authentification par MindefConnect et le PDF produit à la demande s’ils manquent.

## Modèle de données

- [ ] [MCD](../05-MCD-MERISE.svg) : historique des statuts d’une remontée (date, statut, auteur) ; lien entre le poste et le matériel de son unité centrale ; adresse IP du poste (simulée par l’émulateur des postes) ; adresse MAC du matériel, en cours d’ajout par un collègue avec le scanner de matrice ; type de problème obligatoire (cardinalité 1,1 conservée). À réaliser après accord de l’utilisateur.

## Organisation du code : démonstrateur et espace de travail

Constat du 13 novembre. `workspace` (`backend/workspace/`, `frontend/src/workspace/`) désigne l’espace de travail, c’est-à-dire toute l’application après connexion, et non la production. `backend/demonstrateur/` regroupe l’outillage propre à la démonstration : émulateur des postes, création des identités dans le Keycloak local, identifiant de connexion. Production et recette ne se distinguent pas par des dossiers mais par la configuration (`NODE_ENV`, `IDENTITY_PROVISIONING`, `SEED_RESET`). Trois couplages font entrer la démonstration dans le code de production :

- `backend/workspace/rules.ts` (`initialState`) importe le jeu de départ `shared/seed.ts` : les données de démonstration sont embarquées dans le serveur ;
- `backend/index.ts` importe toujours `demonstrateur/identity-provisioning.ts`, même lorsqu’il est désactivé ;
- `frontend/ui-development.ts` (mode interface seule) importe l’émulateur depuis le back.

Organisation proposée : un seul artefact promu sans changement de la recette à la production, l’outillage de démonstration hors du code exécuté en production.

```text
application/
  backend/
    api/            routes HTTP de l’espace et des postes, session
    domaine/        règles métier par domaine : parc, remontees, postes, comptes, regles
    persistance/    PostgreSQL, moteur d’écriture, fusion des écritures concurrentes
    documents/      état des lieux PDF
  frontend/src/
    connexion/
    espace/         écrans, widgets, ui (inchangés)
  shared/           types, catalogue, formats (sans jeu de démonstration)
  outils/           jamais importé par le serveur de production
    emulateur-postes/        client de l’API /api/agent (cible Docker « postes »)
    donnees-demonstration/   jeu de départ, chargé par une commande dédiée
    identites-keycloak/      création des identités du Keycloak local
    interface-seule/         serveur du mode sans Docker
  infra/            compose, VM, Keycloak, LDAP : seule différence entre environnements
```

Plan de modification, une étape par commit, chacune vérifiée par `npm test`, `npm run build`, `npm run test:ui`, `npm run test:workspace` et, avec l’infrastructure, `npm run test:e2e` :

- [ ] 1. Déplacer `backend/demonstrateur/` vers `outils/` sans changer le code ; mettre à jour imports, scripts npm, cible `postes` du `Dockerfile` et guide de l’application.
- [ ] 2. Sortir le jeu de départ : `initialState` ne crée que les référentiels ; `outils/donnees-demonstration` charge les données par une commande (`npm run donnees:demo`) appelée par le mode interface seule et par le déploiement du démonstrateur. `SEED_VERSION` et `SEED_RESET` deviennent des options de cette commande.
- [ ] 3. Charger la création des identités seulement quand `IDENTITY_PROVISIONING=true` (import dynamique), pour qu’elle soit absente du serveur de production.
- [ ] 4. Remplacer la création du schéma au démarrage par des migrations versionnées (`backend/persistance/migrations/`), pour faire évoluer une base de production sans réinitialisation.
- [ ] 5. Découper `rules.ts` par domaine dans `backend/domaine/` et renommer `workspace` en `espace` (back et front), en dernier : changement le plus large, purement structurel.
- [ ] 6. Mettre à jour `AGENTS.md` (chemins cités), le guide de l’application et le dossier d’architecture.
