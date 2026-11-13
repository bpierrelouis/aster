# Archives de la documentation ORION

Compte rendu des évolutions de chaque fichier suivi : version, date et modification. La version en vigueur est le fichier lui-même ; chaque version remplacée est conservée dans le dossier du fichier. Ce document et les en-têtes de version sont générés à partir de [registre.json](registre.json) par [versions.py](../.agents/skills/orion-documentation/scripts/versions.py) ; ne pas les modifier à la main.

Numérotation : version majeure pour un changement de sens (décision, règle, périmètre, structure), version mineure pour une correction ou une précision. L’historique antérieur au 13 novembre 2026 est reconstitué depuis Git, à raison d’une version par jour de modification.

## Vue d’ensemble

| Fichier | Destination | Version | Mise à jour |
| --- | --- | --- | --- |
| [design/README.md](../design/README.md) | Ressource de préparation | [1.3](#design-readme) | 12/11/2026 |
| [design/charte-graphique-vigie/index.html](../design/charte-graphique-vigie/index.html) | Ressource de préparation | [1.1](#design-charte-graphique-vigie-index) | 12/11/2026 |
| [design/charte-graphique/charte-graphique-orion.html](../design/charte-graphique/charte-graphique-orion.html) | Ressource de préparation | [1.0](#design-charte-graphique-charte-graphique-orion) | 09/11/2026 |
| [design/charte-graphique/index.html](../design/charte-graphique/index.html) | Ressource de préparation | [1.2](#design-charte-graphique-index) | 12/11/2026 |
| [design/maquettes/gestion-materiels.html](../design/maquettes/gestion-materiels.html) | Ressource de préparation | [1.2](#design-maquettes-gestion-materiels) | 12/11/2026 |
| [design/maquettes/maquette-dashboard-orion.html](../design/maquettes/maquette-dashboard-orion.html) | Ressource de préparation | [1.0](#design-maquettes-maquette-dashboard-orion) | 09/11/2026 |
| [design/maquettes/maquette-dashboard-proposition-a-cockpit.html](../design/maquettes/maquette-dashboard-proposition-a-cockpit.html) | Ressource de préparation | [1.1](#design-maquettes-maquette-dashboard-proposition-a-cockpit) | 12/11/2026 |
| [design/maquettes/maquette-dashboard-proposition-b-a-traiter.html](../design/maquettes/maquette-dashboard-proposition-b-a-traiter.html) | Ressource de préparation | [1.1](#design-maquettes-maquette-dashboard-proposition-b-a-traiter) | 12/11/2026 |
| [design/maquettes/maquette-dashboard-proposition-c-analyse.html](../design/maquettes/maquette-dashboard-proposition-c-analyse.html) | Ressource de préparation | [1.1](#design-maquettes-maquette-dashboard-proposition-c-analyse) | 12/11/2026 |
| [docs/00-GLOSSAIRE.md](../docs/00-GLOSSAIRE.md) | Production destinée à la remise | [1.6](#00-glossaire) | 13/11/2026 |
| [docs/01-CONSIGNES.md](../docs/01-CONSIGNES.md) | Source fournie par l’encadrement | [1.3](#01-consignes) | 13/11/2026 |
| [docs/02-CADRAGE.md](../docs/02-CADRAGE.md) | Source de travail interne | [1.9](#02-cadrage) | 13/11/2026 |
| [docs/03-COMPTE-RENDU-ENTRETIENS.md](../docs/03-COMPTE-RENDU-ENTRETIENS.md) | Source de travail interne | [1.4](#03-compte-rendu-entretiens) | 12/11/2026 |
| [docs/04-REGLES-DE-GESTION.md](../docs/04-REGLES-DE-GESTION.md) | Production destinée à la remise | [1.6](#04-regles-de-gestion) | 13/11/2026 |
| [docs/05-MCD-MERISE-MOCODO.url](../docs/05-MCD-MERISE-MOCODO.url) | Production destinée à la remise | [1.3](#05-mcd-merise-mocodo) | 12/11/2026 |
| [docs/05-MCD-MERISE.svg](../docs/05-MCD-MERISE.svg) | Production destinée à la remise | [1.3](#05-mcd-merise) | 12/11/2026 |
| [docs/06-DIAGRAMME-CONTEXTE.md](../docs/06-DIAGRAMME-CONTEXTE.md) | Production destinée à la remise | [1.1](#06-diagramme-contexte) | 12/11/2026 |
| [docs/07-DIAGRAMMES-ACTIVITE.md](../docs/07-DIAGRAMMES-ACTIVITE.md) | Production destinée à la remise | [1.3](#07-diagrammes-activite) | 12/11/2026 |
| [docs/08-DCU-GESTION-PARC.md](../docs/08-DCU-GESTION-PARC.md) | Production destinée à la remise | [1.3](#08-dcu-gestion-parc) | 12/11/2026 |
| [docs/09-DCU-ADMINISTRATION-POSTES.md](../docs/09-DCU-ADMINISTRATION-POSTES.md) | Production destinée à la remise | [1.4](#09-dcu-administration-postes) | 12/11/2026 |
| [docs/10-DCU-SUPERVISION-POSTES.md](../docs/10-DCU-SUPERVISION-POSTES.md) | Production destinée à la remise | [1.4](#10-dcu-supervision-postes) | 12/11/2026 |
| [docs/11-DCU-REMONTEES-UTILISATEUR.md](../docs/11-DCU-REMONTEES-UTILISATEUR.md) | Production destinée à la remise | [1.3](#11-dcu-remontees-utilisateur) | 12/11/2026 |
| [docs/12-MATRICE-DROITS.md](../docs/12-MATRICE-DROITS.md) | Production destinée à la remise | [1.3](#12-matrice-droits) | 12/11/2026 |
| [docs/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md](../docs/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md) | Production destinée à la remise | [1.4](#13-fiche-descriptive-gestionnaire) | 12/11/2026 |
| [docs/14-FICHE-DESCRIPTIVE-FORMATEUR.md](../docs/14-FICHE-DESCRIPTIVE-FORMATEUR.md) | Production destinée à la remise | [1.4](#14-fiche-descriptive-formateur) | 12/11/2026 |
| [docs/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md](../docs/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md) | Production destinée à la remise | [1.4](#15-fiche-descriptive-administrateur) | 12/11/2026 |
| [docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md](../docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md) | Production destinée à la remise | [1.4](#16-fiche-descriptive-super-administrateur) | 12/11/2026 |
| [docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md](../docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md) | Production destinée à la remise | [1.3](#17-dossier-architecture-technique) | 13/11/2026 |
| [docs/18-DIAGRAMMES-ARCHITECTURE.md](../docs/18-DIAGRAMMES-ARCHITECTURE.md) | Production destinée à la remise | [1.3](#18-diagrammes-architecture) | 13/11/2026 |
| [docs/19-BACKLOG-ET-SUIVI-PROJET.docx](../docs/19-BACKLOG-ET-SUIVI-PROJET.docx) | Production destinée à la remise | [1.1](#19-backlog-et-suivi-projet) | 13/11/2026 |
| [docs/19-BACKLOG-ET-SUIVI-PROJET.md](../docs/19-BACKLOG-ET-SUIVI-PROJET.md) | Production destinée à la remise | [1.1](#19-backlog-et-suivi-projet) | 13/11/2026 |
| [docs/temporaire/19-SUIVI-BACKLOG-BROUILLON-V1.md](../docs/temporaire/19-SUIVI-BACKLOG-BROUILLON-V1.md) | Brouillon interne | [1.1](#19-suivi-backlog-brouillon-v1) | 13/11/2026 |
| [docs/temporaire/DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2.md](../docs/temporaire/DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2.md) | Brouillon interne | [1.1](#diagrammes-activite-cas-utilisation-brouillon-v2) | 12/11/2026 |
| [docs/temporaire/DIAGRAMMES-ETATS-BROUILLON-V1.md](../docs/temporaire/DIAGRAMMES-ETATS-BROUILLON-V1.md) | Brouillon interne | [1.0](#diagrammes-etats-brouillon-v1) | 09/11/2026 |
| [docs/temporaire/RESTE-A-FAIRE-BROUILLON-V1.md](../docs/temporaire/RESTE-A-FAIRE-BROUILLON-V1.md) | Brouillon interne | [1.0](#reste-a-faire-brouillon-v1) | 13/11/2026 |

## Fichiers en vigueur

### design-README

Fichier : [design/README.md](../design/README.md) · Ressource de préparation

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.3 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur |
| 1.2 | 10/11/2026 | Proposer trois maquettes du tableau de bord | [archive](design-README/README-v1.2-2026-11-10.md) |
| 1.1 | 06/11/2026 | Proposer l'identité VIGIE ; Ajouter les références visuelles MindefConnect ; Réduire le formulaire et centrer le bouton | [archive](design-README/README-v1.1-2026-11-06.md) |
| 1.0 | 03/11/2026 | Organiser les livrables et intégrer la maquette | [archive](design-README/README-v1.0-2026-11-03.md) |

### design-charte-graphique-vigie-index

Fichier : [design/charte-graphique-vigie/index.html](../design/charte-graphique-vigie/index.html) · Ressource de préparation

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.1 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur |
| 1.0 | 06/11/2026 | Proposer l'identité VIGIE | [archive](design-charte-graphique-vigie-index/index-v1.0-2026-11-06.html) |

### design-charte-graphique-charte-graphique-orion

Fichier : [design/charte-graphique/charte-graphique-orion.html](../design/charte-graphique/charte-graphique-orion.html) · Ressource de préparation

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.0 | 09/11/2026 | Ajouter la maquette et la charte graphique ORION | en vigueur |

### design-charte-graphique-index

Fichier : [design/charte-graphique/index.html](../design/charte-graphique/index.html) · Ressource de préparation

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.2 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur |
| 1.1 | 03/11/2026 | Organiser les livrables et intégrer la maquette | [archive](design-charte-graphique-index/index-v1.1-2026-11-03.html) |
| 1.0 | 21/10/2026 | Apercu + loader | [archive](design-charte-graphique-index/index-v1.0-2026-10-21.html) |

### design-maquettes-gestion-materiels

Fichier : [design/maquettes/gestion-materiels.html](../design/maquettes/gestion-materiels.html) · Ressource de préparation

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.2 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur |
| 1.1 | 06/11/2026 | Adapter les écrans et captures à la cible | [archive](design-maquettes-gestion-materiels/gestion-materiels-v1.1-2026-11-06.html) |
| 1.0 | 03/11/2026 | Organiser les livrables et intégrer la maquette | [archive](design-maquettes-gestion-materiels/gestion-materiels-v1.0-2026-11-03.html) |

### design-maquettes-maquette-dashboard-orion

Fichier : [design/maquettes/maquette-dashboard-orion.html](../design/maquettes/maquette-dashboard-orion.html) · Ressource de préparation

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.0 | 09/11/2026 | Ajouter la maquette et la charte graphique ORION | en vigueur |

### design-maquettes-maquette-dashboard-proposition-a-cockpit

Fichier : [design/maquettes/maquette-dashboard-proposition-a-cockpit.html](../design/maquettes/maquette-dashboard-proposition-a-cockpit.html) · Ressource de préparation

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.1 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur |
| 1.0 | 10/11/2026 | Proposer trois maquettes du tableau de bord | [archive](design-maquettes-maquette-dashboard-proposition-a-cockpit/maquette-dashboard-proposition-a-cockpit-v1.0-2026-11-10.html) |

### design-maquettes-maquette-dashboard-proposition-b-a-traiter

Fichier : [design/maquettes/maquette-dashboard-proposition-b-a-traiter.html](../design/maquettes/maquette-dashboard-proposition-b-a-traiter.html) · Ressource de préparation

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.1 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur |
| 1.0 | 10/11/2026 | Proposer trois maquettes du tableau de bord | [archive](design-maquettes-maquette-dashboard-proposition-b-a-traiter/maquette-dashboard-proposition-b-a-traiter-v1.0-2026-11-10.html) |

### design-maquettes-maquette-dashboard-proposition-c-analyse

Fichier : [design/maquettes/maquette-dashboard-proposition-c-analyse.html](../design/maquettes/maquette-dashboard-proposition-c-analyse.html) · Ressource de préparation

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.1 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur |
| 1.0 | 10/11/2026 | Proposer trois maquettes du tableau de bord | [archive](design-maquettes-maquette-dashboard-proposition-c-analyse/maquette-dashboard-proposition-c-analyse-v1.0-2026-11-10.html) |

### 00-GLOSSAIRE

Fichier : [docs/00-GLOSSAIRE.md](../docs/00-GLOSSAIRE.md) · Production destinée à la remise

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.6 | 13/11/2026 | Développer le sigle ORION et garantir RG-73 côté serveur | en vigueur |
| 1.5 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renommer le projet en ORION dans tout le dépôt | [archive](00-GLOSSAIRE/00-GLOSSAIRE-v1.5-2026-11-12.md) |
| 1.4 | 09/11/2026 | Consolider le modèle et les règles métier ; Harmoniser les diagrammes de cas d'utilisation | [archive](00-GLOSSAIRE/00-GLOSSAIRE-v1.4-2026-11-09.md) |
| 1.3 | 08/11/2026 | Intégrer le retour client du 4 novembre | [archive](00-GLOSSAIRE/00-GLOSSAIRE-v1.3-2026-11-08.md) |
| 1.2 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | [archive](00-GLOSSAIRE/00-GLOSSAIRE-v1.2-2026-11-06.md) |
| 1.1 | 03/11/2026 | Harmoniser le compte Windows dans le modèle ; Préciser l’administration Windows sans agent ; Préparer le support du point client ; Formaliser les profils et leurs autorisations ; Intégrer Keycloak, S3 et les serveurs front et back | [archive](00-GLOSSAIRE/00-GLOSSAIRE-v1.1-2026-11-03.md) |
| 1.0 | 02/11/2026 | Consolider le cadrage et les modèles ; Mcd ; Consolider le cadrage et épurer les diagrammes ; Préciser les remontées et les comptes Windows | [archive](00-GLOSSAIRE/00-GLOSSAIRE-v1.0-2026-11-02.md) |

### 01-CONSIGNES

Fichier : [docs/01-CONSIGNES.md](../docs/01-CONSIGNES.md) · Source fournie par l’encadrement

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.3 | 13/11/2026 | Fiabiliser les configurations à remettre | en vigueur |
| 1.2 | 09/11/2026 | Préciser le contenu attendu du dossier d'architecture | [archive](01-CONSIGNES/01-CONSIGNES-v1.2-2026-11-09.md) |
| 1.1 | 02/11/2026 | Consolider le cadrage et les modèles | [archive](01-CONSIGNES/01-CONSIGNES-v1.1-2026-11-02.md) |
| 1.0 | 20/10/2026 | Consignes + cadrage | [archive](01-CONSIGNES/01-CONSIGNES-v1.0-2026-10-20.md) |

### 02-CADRAGE

Fichier : [docs/02-CADRAGE.md](../docs/02-CADRAGE.md) · Source de travail interne

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.9 | 13/11/2026 | Développer le sigle ORION et garantir RG-73 côté serveur ; Inscrire les points de sécurité qui demandent une décision ; Reporter les décisions de sécurité du 13 novembre ; Décrire orion-3 en VM d'administration avec le runner ; Décrire l'entrée unique par adresse IP, sans DNS ; Documenter la cible C1NP et unifier les vues ; Fiabiliser les configurations à remettre | en vigueur |
| 1.8 | 12/11/2026 | Préparer les points du rendez-vous du 12 novembre ; Passage au nom ORION, mise à jour de l'interface utilisateur ; Renommer le projet en ORION dans tout le dépôt ; Décrire l'architecture orion sur dix VM ; Retirer les dernières mentions de l'ancien nom | [archive](02-CADRAGE/02-CADRAGE-v1.8-2026-11-12.md) |
| 1.7 | 11/11/2026 | Décrire le déploiement du démonstrateur sur huit VM | [archive](02-CADRAGE/02-CADRAGE-v1.7-2026-11-11.md) |
| 1.6 | 09/11/2026 | Consolider le modèle et les règles métier | [archive](02-CADRAGE/02-CADRAGE-v1.6-2026-11-09.md) |
| 1.5 | 08/11/2026 | Intégrer le retour client du 4 novembre | [archive](02-CADRAGE/02-CADRAGE-v1.5-2026-11-08.md) |
| 1.4 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | [archive](02-CADRAGE/02-CADRAGE-v1.4-2026-11-06.md) |
| 1.3 | 03/11/2026 | Harmoniser le compte Windows dans le modèle ; Préciser l’administration Windows sans agent ; Préparer le support du point client ; Formaliser les profils et leurs autorisations ; Intégrer Keycloak, S3 et les serveurs front et back | [archive](02-CADRAGE/02-CADRAGE-v1.3-2026-11-03.md) |
| 1.2 | 02/11/2026 | Consolider le cadrage et les modèles ; Mcd ; Consolider le cadrage et épurer les diagrammes ; Préciser les remontées et les comptes Windows | [archive](02-CADRAGE/02-CADRAGE-v1.2-2026-11-02.md) |
| 1.1 | 24/10/2026 | Aligner le cadrage, les diagrammes et les consignes Git | [archive](02-CADRAGE/02-CADRAGE-v1.1-2026-10-24.md) |
| 1.0 | 20/10/2026 | Consignes + cadrage | [archive](02-CADRAGE/02-CADRAGE-v1.0-2026-10-20.md) |

### 03-COMPTE-RENDU-ENTRETIENS

Fichier : [docs/03-COMPTE-RENDU-ENTRETIENS.md](../docs/03-COMPTE-RENDU-ENTRETIENS.md) · Source de travail interne

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.4 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur |
| 1.3 | 08/11/2026 | Intégrer le retour client du 4 novembre | [archive](03-COMPTE-RENDU-ENTRETIENS/03-COMPTE-RENDU-ENTRETIENS-v1.3-2026-11-08.md) |
| 1.2 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | [archive](03-COMPTE-RENDU-ENTRETIENS/03-COMPTE-RENDU-ENTRETIENS-v1.2-2026-11-06.md) |
| 1.1 | 02/11/2026 | Mcd | [archive](03-COMPTE-RENDU-ENTRETIENS/03-COMPTE-RENDU-ENTRETIENS-v1.1-2026-11-02.md) |
| 1.0 | 24/10/2026 | Aligner le cadrage, les diagrammes et les consignes Git | [archive](03-COMPTE-RENDU-ENTRETIENS/03-COMPTE-RENDU-ENTRETIENS-v1.0-2026-10-24.md) |

### 04-REGLES-DE-GESTION

Fichier : [docs/04-REGLES-DE-GESTION.md](../docs/04-REGLES-DE-GESTION.md) · Production destinée à la remise

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.6 | 13/11/2026 | Développer le sigle ORION et garantir RG-73 côté serveur | en vigueur |
| 1.5 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renommer le projet en ORION dans tout le dépôt | [archive](04-REGLES-DE-GESTION/04-REGLES-DE-GESTION-v1.5-2026-11-12.md) |
| 1.4 | 09/11/2026 | Consolider le modèle et les règles métier | [archive](04-REGLES-DE-GESTION/04-REGLES-DE-GESTION-v1.4-2026-11-09.md) |
| 1.3 | 08/11/2026 | Intégrer le retour client du 4 novembre | [archive](04-REGLES-DE-GESTION/04-REGLES-DE-GESTION-v1.3-2026-11-08.md) |
| 1.2 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | [archive](04-REGLES-DE-GESTION/04-REGLES-DE-GESTION-v1.2-2026-11-06.md) |
| 1.1 | 03/11/2026 | Harmoniser le compte Windows dans le modèle ; Préciser l’administration Windows sans agent ; Formaliser les profils et leurs autorisations | [archive](04-REGLES-DE-GESTION/04-REGLES-DE-GESTION-v1.1-2026-11-03.md) |
| 1.0 | 02/11/2026 | Consolider le cadrage et les modèles ; Mcd ; Consolider le cadrage et épurer les diagrammes ; Préciser les remontées et les comptes Windows | [archive](04-REGLES-DE-GESTION/04-REGLES-DE-GESTION-v1.0-2026-11-02.md) |

### 05-MCD-MERISE-MOCODO

Fichier : [docs/05-MCD-MERISE-MOCODO.url](../docs/05-MCD-MERISE-MOCODO.url) · Production destinée à la remise

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.3 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur |
| 1.2 | 09/11/2026 | Consolider le modèle et les règles métier | [archive](05-MCD-MERISE-MOCODO/05-MCD-MERISE-MOCODO-v1.2-2026-11-09.url) |
| 1.1 | 03/11/2026 | Harmoniser le compte Windows dans le modèle ; Formaliser les profils et leurs autorisations | [archive](05-MCD-MERISE-MOCODO/05-MCD-MERISE-MOCODO-v1.1-2026-11-03.url) |
| 1.0 | 02/11/2026 | Mcd ; Maj mcd | [archive](05-MCD-MERISE-MOCODO/05-MCD-MERISE-MOCODO-v1.0-2026-11-02.url) |

### 05-MCD-MERISE

Fichier : [docs/05-MCD-MERISE.svg](../docs/05-MCD-MERISE.svg) · Production destinée à la remise

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.3 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur |
| 1.2 | 09/11/2026 | Consolider le modèle et les règles métier | [archive](05-MCD-MERISE/05-MCD-MERISE-v1.2-2026-11-09.svg) |
| 1.1 | 03/11/2026 | Harmoniser le compte Windows dans le modèle ; Formaliser les profils et leurs autorisations | [archive](05-MCD-MERISE/05-MCD-MERISE-v1.1-2026-11-03.svg) |
| 1.0 | 02/11/2026 | Mcd ; Maj mcd | [archive](05-MCD-MERISE/05-MCD-MERISE-v1.0-2026-11-02.svg) |

### 06-DIAGRAMME-CONTEXTE

Fichier : [docs/06-DIAGRAMME-CONTEXTE.md](../docs/06-DIAGRAMME-CONTEXTE.md) · Production destinée à la remise

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.1 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur |
| 1.0 | 02/11/2026 | Mcd ; Consolider le cadrage et épurer les diagrammes | [archive](06-DIAGRAMME-CONTEXTE/06-DIAGRAMME-CONTEXTE-v1.0-2026-11-02.md) |

### 07-DIAGRAMMES-ACTIVITE

Fichier : [docs/07-DIAGRAMMES-ACTIVITE.md](../docs/07-DIAGRAMMES-ACTIVITE.md) · Production destinée à la remise

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.3 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur |
| 1.2 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | [archive](07-DIAGRAMMES-ACTIVITE/07-DIAGRAMMES-ACTIVITE-v1.2-2026-11-06.md) |
| 1.1 | 02/11/2026 | Consolider le cadrage et les modèles ; Mcd ; Consolider le cadrage et épurer les diagrammes | [archive](07-DIAGRAMMES-ACTIVITE/07-DIAGRAMMES-ACTIVITE-v1.1-2026-11-02.md) |
| 1.0 | 24/10/2026 | Aligner le cadrage, les diagrammes et les consignes Git | [archive](07-DIAGRAMMES-ACTIVITE/07-DIAGRAMMES-ACTIVITE-v1.0-2026-10-24.md) |

### 08-DCU-GESTION-PARC

Fichier : [docs/08-DCU-GESTION-PARC.md](../docs/08-DCU-GESTION-PARC.md) · Production destinée à la remise

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.3 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur |
| 1.2 | 09/11/2026 | Harmoniser les diagrammes de cas d'utilisation | [archive](08-DCU-GESTION-PARC/08-DCU-GESTION-PARC-v1.2-2026-11-09.md) |
| 1.1 | 03/11/2026 | Formaliser les profils et leurs autorisations | [archive](08-DCU-GESTION-PARC/08-DCU-GESTION-PARC-v1.1-2026-11-03.md) |
| 1.0 | 02/11/2026 | Sous dcu temporaires ; Consolider le cadrage et épurer les diagrammes | [archive](08-DCU-GESTION-PARC/08-DCU-GESTION-PARC-v1.0-2026-11-02.md) |

### 09-DCU-ADMINISTRATION-POSTES

Fichier : [docs/09-DCU-ADMINISTRATION-POSTES.md](../docs/09-DCU-ADMINISTRATION-POSTES.md) · Production destinée à la remise

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.4 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur |
| 1.3 | 09/11/2026 | Harmoniser les diagrammes de cas d'utilisation | [archive](09-DCU-ADMINISTRATION-POSTES/09-DCU-ADMINISTRATION-POSTES-v1.3-2026-11-09.md) |
| 1.2 | 08/11/2026 | Intégrer le retour client du 4 novembre | [archive](09-DCU-ADMINISTRATION-POSTES/09-DCU-ADMINISTRATION-POSTES-v1.2-2026-11-08.md) |
| 1.1 | 03/11/2026 | Préciser l’administration Windows sans agent ; Formaliser les profils et leurs autorisations | [archive](09-DCU-ADMINISTRATION-POSTES/09-DCU-ADMINISTRATION-POSTES-v1.1-2026-11-03.md) |
| 1.0 | 02/11/2026 | Sous dcu temporaires ; Consolider le cadrage et épurer les diagrammes | [archive](09-DCU-ADMINISTRATION-POSTES/09-DCU-ADMINISTRATION-POSTES-v1.0-2026-11-02.md) |

### 10-DCU-SUPERVISION-POSTES

Fichier : [docs/10-DCU-SUPERVISION-POSTES.md](../docs/10-DCU-SUPERVISION-POSTES.md) · Production destinée à la remise

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.4 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur |
| 1.3 | 09/11/2026 | Harmoniser les diagrammes de cas d'utilisation | [archive](10-DCU-SUPERVISION-POSTES/10-DCU-SUPERVISION-POSTES-v1.3-2026-11-09.md) |
| 1.2 | 08/11/2026 | Intégrer le retour client du 4 novembre | [archive](10-DCU-SUPERVISION-POSTES/10-DCU-SUPERVISION-POSTES-v1.2-2026-11-08.md) |
| 1.1 | 03/11/2026 | Préciser l’administration Windows sans agent ; Formaliser les profils et leurs autorisations | [archive](10-DCU-SUPERVISION-POSTES/10-DCU-SUPERVISION-POSTES-v1.1-2026-11-03.md) |
| 1.0 | 02/11/2026 | Sous dcu temporaires ; Consolider le cadrage et épurer les diagrammes | [archive](10-DCU-SUPERVISION-POSTES/10-DCU-SUPERVISION-POSTES-v1.0-2026-11-02.md) |

### 11-DCU-REMONTEES-UTILISATEUR

Fichier : [docs/11-DCU-REMONTEES-UTILISATEUR.md](../docs/11-DCU-REMONTEES-UTILISATEUR.md) · Production destinée à la remise

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.3 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur |
| 1.2 | 09/11/2026 | Harmoniser les diagrammes de cas d'utilisation | [archive](11-DCU-REMONTEES-UTILISATEUR/11-DCU-REMONTEES-UTILISATEUR-v1.2-2026-11-09.md) |
| 1.1 | 03/11/2026 | Formaliser les profils et leurs autorisations | [archive](11-DCU-REMONTEES-UTILISATEUR/11-DCU-REMONTEES-UTILISATEUR-v1.1-2026-11-03.md) |
| 1.0 | 02/11/2026 | Sous dcu temporaires ; Consolider le cadrage et épurer les diagrammes | [archive](11-DCU-REMONTEES-UTILISATEUR/11-DCU-REMONTEES-UTILISATEUR-v1.0-2026-11-02.md) |

### 12-MATRICE-DROITS

Fichier : [docs/12-MATRICE-DROITS.md](../docs/12-MATRICE-DROITS.md) · Production destinée à la remise

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.3 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renommer le projet en ORION dans tout le dépôt | en vigueur |
| 1.2 | 09/11/2026 | Synchroniser la matrice et les fiches de profils | [archive](12-MATRICE-DROITS/12-MATRICE-DROITS-v1.2-2026-11-09.md) |
| 1.1 | 08/11/2026 | Intégrer le retour client du 4 novembre | [archive](12-MATRICE-DROITS/12-MATRICE-DROITS-v1.1-2026-11-08.md) |
| 1.0 | 03/11/2026 | Formaliser les profils et leurs autorisations | [archive](12-MATRICE-DROITS/12-MATRICE-DROITS-v1.0-2026-11-03.md) |

### 13-FICHE-DESCRIPTIVE-GESTIONNAIRE

Fichier : [docs/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md](../docs/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md) · Production destinée à la remise

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.4 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur |
| 1.3 | 09/11/2026 | Synchroniser la matrice et les fiches de profils | [archive](13-FICHE-DESCRIPTIVE-GESTIONNAIRE/13-FICHE-DESCRIPTIVE-GESTIONNAIRE-v1.3-2026-11-09.md) |
| 1.2 | 08/11/2026 | Intégrer le retour client du 4 novembre | [archive](13-FICHE-DESCRIPTIVE-GESTIONNAIRE/13-FICHE-DESCRIPTIVE-GESTIONNAIRE-v1.2-2026-11-08.md) |
| 1.1 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | [archive](13-FICHE-DESCRIPTIVE-GESTIONNAIRE/13-FICHE-DESCRIPTIVE-GESTIONNAIRE-v1.1-2026-11-06.md) |
| 1.0 | 03/11/2026 | Formaliser les parcours et interfaces par profil ; Intégrer Keycloak, S3 et les serveurs front et back | [archive](13-FICHE-DESCRIPTIVE-GESTIONNAIRE/13-FICHE-DESCRIPTIVE-GESTIONNAIRE-v1.0-2026-11-03.md) |

### 14-FICHE-DESCRIPTIVE-FORMATEUR

Fichier : [docs/14-FICHE-DESCRIPTIVE-FORMATEUR.md](../docs/14-FICHE-DESCRIPTIVE-FORMATEUR.md) · Production destinée à la remise

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.4 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renommer le projet en ORION dans tout le dépôt | en vigueur |
| 1.3 | 09/11/2026 | Synchroniser la matrice et les fiches de profils | [archive](14-FICHE-DESCRIPTIVE-FORMATEUR/14-FICHE-DESCRIPTIVE-FORMATEUR-v1.3-2026-11-09.md) |
| 1.2 | 08/11/2026 | Intégrer le retour client du 4 novembre | [archive](14-FICHE-DESCRIPTIVE-FORMATEUR/14-FICHE-DESCRIPTIVE-FORMATEUR-v1.2-2026-11-08.md) |
| 1.1 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | [archive](14-FICHE-DESCRIPTIVE-FORMATEUR/14-FICHE-DESCRIPTIVE-FORMATEUR-v1.1-2026-11-06.md) |
| 1.0 | 03/11/2026 | Formaliser les parcours et interfaces par profil ; Intégrer Keycloak, S3 et les serveurs front et back | [archive](14-FICHE-DESCRIPTIVE-FORMATEUR/14-FICHE-DESCRIPTIVE-FORMATEUR-v1.0-2026-11-03.md) |

### 15-FICHE-DESCRIPTIVE-ADMINISTRATEUR

Fichier : [docs/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md](../docs/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md) · Production destinée à la remise

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.4 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renommer le projet en ORION dans tout le dépôt | en vigueur |
| 1.3 | 09/11/2026 | Synchroniser la matrice et les fiches de profils | [archive](15-FICHE-DESCRIPTIVE-ADMINISTRATEUR/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR-v1.3-2026-11-09.md) |
| 1.2 | 08/11/2026 | Intégrer le retour client du 4 novembre | [archive](15-FICHE-DESCRIPTIVE-ADMINISTRATEUR/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR-v1.2-2026-11-08.md) |
| 1.1 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | [archive](15-FICHE-DESCRIPTIVE-ADMINISTRATEUR/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR-v1.1-2026-11-06.md) |
| 1.0 | 03/11/2026 | Formaliser les parcours et interfaces par profil ; Intégrer Keycloak, S3 et les serveurs front et back | [archive](15-FICHE-DESCRIPTIVE-ADMINISTRATEUR/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR-v1.0-2026-11-03.md) |

### 16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR

Fichier : [docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md](../docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md) · Production destinée à la remise

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.4 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur |
| 1.3 | 09/11/2026 | Synchroniser la matrice et les fiches de profils | [archive](16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR-v1.3-2026-11-09.md) |
| 1.2 | 08/11/2026 | Intégrer le retour client du 4 novembre | [archive](16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR-v1.2-2026-11-08.md) |
| 1.1 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | [archive](16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR-v1.1-2026-11-06.md) |
| 1.0 | 03/11/2026 | Formaliser les parcours et interfaces par profil ; Intégrer Keycloak, S3 et les serveurs front et back | [archive](16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR-v1.0-2026-11-03.md) |

### 17-DOSSIER-ARCHITECTURE-TECHNIQUE

Fichier : [docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md](../docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md) · Production destinée à la remise

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.3 | 13/11/2026 | Décrire orion-3 en VM d'administration avec le runner ; Décrire l'entrée unique par adresse IP, sans DNS ; Documenter la cible C1NP et unifier les vues | en vigueur |
| 1.2 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renseigner les adresses des VM ; Renommer le projet en ORION dans tout le dépôt ; Décrire l'architecture orion sur dix VM ; Retirer les dernières mentions de l'ancien nom ; Mettre à jour les noms des fichiers convertis en TypeScript | [archive](17-DOSSIER-ARCHITECTURE-TECHNIQUE/17-DOSSIER-ARCHITECTURE-TECHNIQUE-v1.2-2026-11-12.md) |
| 1.1 | 11/11/2026 | Décrire le déploiement du démonstrateur sur huit VM | [archive](17-DOSSIER-ARCHITECTURE-TECHNIQUE/17-DOSSIER-ARCHITECTURE-TECHNIQUE-v1.1-2026-11-11.md) |
| 1.0 | 09/11/2026 | Ajouter le dossier d'architecture technique et ses diagrammes | [archive](17-DOSSIER-ARCHITECTURE-TECHNIQUE/17-DOSSIER-ARCHITECTURE-TECHNIQUE-v1.0-2026-11-09.md) |

### 18-DIAGRAMMES-ARCHITECTURE

Fichier : [docs/18-DIAGRAMMES-ARCHITECTURE.md](../docs/18-DIAGRAMMES-ARCHITECTURE.md) · Production destinée à la remise

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.3 | 13/11/2026 | Documenter la cible C1NP et unifier les vues | en vigueur |
| 1.2 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renseigner les adresses des VM ; Renommer le projet en ORION dans tout le dépôt ; Décrire l'architecture orion sur dix VM | [archive](18-DIAGRAMMES-ARCHITECTURE/18-DIAGRAMMES-ARCHITECTURE-v1.2-2026-11-12.md) |
| 1.1 | 11/11/2026 | Décrire le déploiement du démonstrateur sur huit VM | [archive](18-DIAGRAMMES-ARCHITECTURE/18-DIAGRAMMES-ARCHITECTURE-v1.1-2026-11-11.md) |
| 1.0 | 09/11/2026 | Ajouter le dossier d'architecture technique et ses diagrammes | [archive](18-DIAGRAMMES-ARCHITECTURE/18-DIAGRAMMES-ARCHITECTURE-v1.0-2026-11-09.md) |

### 19-BACKLOG-ET-SUIVI-PROJET

Fichier : [docs/19-BACKLOG-ET-SUIVI-PROJET.docx](../docs/19-BACKLOG-ET-SUIVI-PROJET.docx) · Production destinée à la remise

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.1 | 13/11/2026 | Remplacer l’ancien nom par ORION et corriger le lien du commit de la cible C1NP | en vigueur |
| 1.0 | 13/11/2026 | Consolider le suivi des progressions ; Structurer le suivi Agile et les cérémonies ; Styliser les graphiques en SVG dans Word | [archive](19-BACKLOG-ET-SUIVI-PROJET/19-BACKLOG-ET-SUIVI-PROJET-v1.0-2026-11-13.docx) |

### 19-BACKLOG-ET-SUIVI-PROJET

Fichier : [docs/19-BACKLOG-ET-SUIVI-PROJET.md](../docs/19-BACKLOG-ET-SUIVI-PROJET.md) · Production destinée à la remise

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.1 | 13/11/2026 | Remplacer l’ancien nom par ORION et corriger le lien du commit de la cible C1NP | en vigueur |
| 1.0 | 13/11/2026 | Consolider le suivi des progressions ; Structurer le suivi Agile et les cérémonies ; Styliser les graphiques en SVG dans Word | [archive](19-BACKLOG-ET-SUIVI-PROJET/19-BACKLOG-ET-SUIVI-PROJET-v1.0-2026-11-13.md) |

### 19-SUIVI-BACKLOG-BROUILLON-V1

Fichier : [docs/temporaire/19-SUIVI-BACKLOG-BROUILLON-V1.md](../docs/temporaire/19-SUIVI-BACKLOG-BROUILLON-V1.md) · Brouillon interne

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.1 | 13/11/2026 | Remplacer l’ancien nom par ORION et corriger le commit de la cible C1NP | en vigueur |
| 1.0 | 13/11/2026 | Consolider le suivi des progressions | [archive](19-SUIVI-BACKLOG-BROUILLON-V1/19-SUIVI-BACKLOG-BROUILLON-V1-v1.0-2026-11-13.md) |

### DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2

Fichier : [docs/temporaire/DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2.md](../docs/temporaire/DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2.md) · Brouillon interne

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.1 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur |
| 1.0 | 06/11/2026 | Ajouter les parcours détaillés en brouillon | [archive](DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2/DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2-v1.0-2026-11-06.md) |

### DIAGRAMMES-ETATS-BROUILLON-V1

Fichier : [docs/temporaire/DIAGRAMMES-ETATS-BROUILLON-V1.md](../docs/temporaire/DIAGRAMMES-ETATS-BROUILLON-V1.md) · Brouillon interne

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.0 | 09/11/2026 | Ajouter les diagrammes d'états de la remontée et des interventions | en vigueur |

### RESTE-A-FAIRE-BROUILLON-V1

Fichier : [docs/temporaire/RESTE-A-FAIRE-BROUILLON-V1.md](../docs/temporaire/RESTE-A-FAIRE-BROUILLON-V1.md) · Brouillon interne

| Version | Date | Modification | Fichier |
| --- | --- | --- | --- |
| 1.0 | 13/11/2026 | Recenser ce qui reste à faire après le contrôle du 13 novembre ; Ajouter des jetons d'accès pour la présentation au client ; Décrire l'entrée unique par adresse IP, sans DNS | en vigueur |
