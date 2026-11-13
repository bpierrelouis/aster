# Reste à faire — brouillon V1

Document de travail interne, établi le 13 novembre 2026 à l’issue du contrôle du renommage, de la conversion en TypeScript, de la revue de qualité et de l’analyse de sécurité. Il recense ce qui n’a pas été traité. Les décisions et questions ouvertes font foi dans le [cadrage](../02-CADRAGE.md) (§ 19) ; ce document n’en est qu’un aide-mémoire.

## Avant le prochain déploiement sur les VM

- [ ] Lancer `application/infra/vm/installer.sh` pour créer le secret Swarm `PROVISIONING_CLIENT_SECRET` (compte de service de création des identités), absent des VM déjà installées.
- [ ] Prévoir la réinitialisation des données de démonstration : `SEED_VERSION` passe à 15 et `SEED_RESET=true` sur les VM ; les comptes ORION se relient aux nouveaux identifiants stables des utilisateurs de l’annuaire.
- [ ] Vérifier après déploiement : connexion des quatre profils, création d’un compte, réception des rapports des postes émulés, `https://orion.internal/api/infos` (version servie).

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
| BIND | `dnssec-validation no` | Validation DNSSEC si le DNS du réseau de formation le permet | Démonstrateur |
| CI | Le runner auto-hébergé, sur le poste de l’opérateur, exécute tout push sur `main` | Protéger la branche `main` sur GitHub | Démonstrateur |
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
