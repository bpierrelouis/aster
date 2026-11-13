# Archives de la documentation ORION

Compte rendu des évolutions de chaque fichier suivi : version, date et modification. La version en vigueur est le fichier lui-même ; chaque version remplacée est retrouvée dans l’historique Git par son commit (`git show <commit>:<chemin>`). Seules les versions de `design/`, qui font partie de la capture du besoin, sont copiées dans les archives. Ce document et les en-têtes de version sont générés à partir de [registre.json](registre.json) par [versions.py](../.agents/skills/orion-documentation/scripts/versions.py) ; ne pas les modifier à la main.

Numérotation : version majeure pour un changement de sens (décision, règle, périmètre, structure), version mineure pour une correction ou une précision. L’historique antérieur au 13 novembre 2026 est reconstitué depuis Git, à raison d’une version par jour de modification.

## Vue d’ensemble

| Fichier | Destination | Version | Mise à jour |
| --- | --- | --- | --- |
| [design/README.md](../design/README.md) | Ressource de préparation | [2.0](#design-readme) | 13/11/2026 |
| [design/charte-graphique/index.html](../design/charte-graphique/index.html) | Ressource de préparation | [2.0](#design-charte-graphique-index) | 13/11/2026 |
| [design/maquettes/index.html](../design/maquettes/index.html) | Ressource de préparation | [1.0](#design-maquettes-index) | 13/11/2026 |
| [docs/00-GLOSSAIRE.md](../docs/00-GLOSSAIRE.md) | Production destinée à la remise | [1.8](#00-glossaire) | 13/11/2026 |
| [docs/01-CONSIGNES.md](../docs/01-CONSIGNES.md) | Source fournie par l’encadrement | [1.3](#01-consignes) | 13/11/2026 |
| [docs/02-CADRAGE.md](../docs/02-CADRAGE.md) | Source de travail interne | [3.0](#02-cadrage) | 13/11/2026 |
| [docs/03-COMPTE-RENDU-ENTRETIENS.md](../docs/03-COMPTE-RENDU-ENTRETIENS.md) | Source de travail interne | [2.0](#03-compte-rendu-entretiens) | 13/11/2026 |
| [docs/04-REGLES-DE-GESTION.md](../docs/04-REGLES-DE-GESTION.md) | Production destinée à la remise | [1.7](#04-regles-de-gestion) | 13/11/2026 |
| [docs/05-MCD-MERISE-MOCODO.url](../docs/05-MCD-MERISE-MOCODO.url) | Production destinée à la remise | [1.3](#05-mcd-merise-mocodo) | 12/11/2026 |
| [docs/05-MCD-MERISE.svg](../docs/05-MCD-MERISE.svg) | Production destinée à la remise | [1.3](#05-mcd-merise) | 12/11/2026 |
| [docs/06-DIAGRAMME-CONTEXTE.md](../docs/06-DIAGRAMME-CONTEXTE.md) | Production destinée à la remise | [1.2](#06-diagramme-contexte) | 13/11/2026 |
| [docs/07-DIAGRAMMES-ACTIVITE.md](../docs/07-DIAGRAMMES-ACTIVITE.md) | Production destinée à la remise | [1.4](#07-diagrammes-activite) | 13/11/2026 |
| [docs/08-DCU-GESTION-PARC.md](../docs/08-DCU-GESTION-PARC.md) | Production destinée à la remise | [1.3](#08-dcu-gestion-parc) | 12/11/2026 |
| [docs/09-DCU-ADMINISTRATION-POSTES.md](../docs/09-DCU-ADMINISTRATION-POSTES.md) | Production destinée à la remise | [1.5](#09-dcu-administration-postes) | 13/11/2026 |
| [docs/10-DCU-SUPERVISION-POSTES.md](../docs/10-DCU-SUPERVISION-POSTES.md) | Production destinée à la remise | [1.4](#10-dcu-supervision-postes) | 12/11/2026 |
| [docs/11-DCU-REMONTEES-UTILISATEUR.md](../docs/11-DCU-REMONTEES-UTILISATEUR.md) | Production destinée à la remise | [2.0](#11-dcu-remontees-utilisateur) | 13/11/2026 |
| [docs/12-MATRICE-DROITS.md](../docs/12-MATRICE-DROITS.md) | Production destinée à la remise | [3.0](#12-matrice-droits) | 13/11/2026 |
| [docs/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md](../docs/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md) | Production destinée à la remise | [2.0](#13-fiche-descriptive-gestionnaire) | 13/11/2026 |
| [docs/14-FICHE-DESCRIPTIVE-FORMATEUR.md](../docs/14-FICHE-DESCRIPTIVE-FORMATEUR.md) | Production destinée à la remise | [2.0](#14-fiche-descriptive-formateur) | 13/11/2026 |
| [docs/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md](../docs/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md) | Production destinée à la remise | [2.1](#15-fiche-descriptive-administrateur) | 13/11/2026 |
| [docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md](../docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md) | Production destinée à la remise | [2.1](#16-fiche-descriptive-super-administrateur) | 13/11/2026 |
| [docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md](../docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md) | Production destinée à la remise | [1.5](#17-dossier-architecture-technique) | 13/11/2026 |
| [docs/18-DIAGRAMMES-ARCHITECTURE.md](../docs/18-DIAGRAMMES-ARCHITECTURE.md) | Production destinée à la remise | [1.3](#18-diagrammes-architecture) | 13/11/2026 |
| [docs/19-BACKLOG-ET-SUIVI-PROJET.docx](../docs/19-BACKLOG-ET-SUIVI-PROJET.docx) | Production destinée à la remise | [1.1](#19-backlog-et-suivi-projet) | 13/11/2026 |
| [docs/19-BACKLOG-ET-SUIVI-PROJET.md](../docs/19-BACKLOG-ET-SUIVI-PROJET.md) | Production destinée à la remise | [1.1](#19-backlog-et-suivi-projet) | 13/11/2026 |
| [docs/temporaire/19-SUIVI-BACKLOG-BROUILLON-V1.md](../docs/temporaire/19-SUIVI-BACKLOG-BROUILLON-V1.md) | Brouillon interne | [1.1](#19-suivi-backlog-brouillon-v1) | 13/11/2026 |
| [docs/temporaire/DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2.md](../docs/temporaire/DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2.md) | Brouillon interne | [1.1](#diagrammes-activite-cas-utilisation-brouillon-v2) | 12/11/2026 |
| [docs/temporaire/DIAGRAMMES-ETATS-BROUILLON-V1.md](../docs/temporaire/DIAGRAMMES-ETATS-BROUILLON-V1.md) | Brouillon interne | [2.0](#diagrammes-etats-brouillon-v1) | 13/11/2026 |
| [docs/temporaire/RESTE-A-FAIRE-BROUILLON-V1.md](../docs/temporaire/RESTE-A-FAIRE-BROUILLON-V1.md) | Brouillon interne | [2.1](#reste-a-faire-brouillon-v1) | 13/11/2026 |

## Fichiers en vigueur

### design-README

Fichier : [design/README.md](../design/README.md) · Ressource de préparation

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.0 | 13/11/2026 | Présenter l'identité ORION conforme à l'application et archiver les anciennes directions | en vigueur | — |
| 1.3 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` | [archive](design-README/README-v1.3-2026-11-12.md) |
| 1.2 | 10/11/2026 | Proposer trois maquettes du tableau de bord | `284cbc0` | [archive](design-README/README-v1.2-2026-11-10.md) |
| 1.1 | 06/11/2026 | Proposer l'identité VIGIE ; Ajouter les références visuelles MindefConnect ; Réduire le formulaire et centrer le bouton | `7e9e76b` | [archive](design-README/README-v1.1-2026-11-06.md) |
| 1.0 | 03/11/2026 | Organiser les livrables et intégrer la maquette | `03728b6` | [archive](design-README/README-v1.0-2026-11-03.md) |

### design-charte-graphique-index

Fichier : [design/charte-graphique/index.html](../design/charte-graphique/index.html) · Ressource de préparation

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.0 | 13/11/2026 | Refondre la charte sur l'application : étoile ORION, palette, ambiances Orion et Minarm, composants | en vigueur | — |
| 1.2 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `0078180` | [archive](design-charte-graphique-index/index-v1.2-2026-11-12.html) |
| 1.1 | 03/11/2026 | Organiser les livrables et intégrer la maquette | `03728b6` | [archive](design-charte-graphique-index/index-v1.1-2026-11-03.html) |
| 1.0 | 21/10/2026 | Apercu + loader | `a4ba64a` (`da/apercu.html`) | [archive](design-charte-graphique-index/index-v1.0-2026-10-21.html) |

### design-maquettes-index

Fichier : [design/maquettes/index.html](../design/maquettes/index.html) · Ressource de préparation

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.0 | 13/11/2026 | Présenter les écrans de l'application par module et par profil | en vigueur | — |

### 00-GLOSSAIRE

Fichier : [docs/00-GLOSSAIRE.md](../docs/00-GLOSSAIRE.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.8 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | en vigueur | — |
| 1.7 | 13/11/2026 | Préciser l’acteur de traitement : prise en charge puis fin du traitement | `38c405d` | — |
| 1.6 | 13/11/2026 | Développer le sigle ORION et garantir RG-73 côté serveur | `83658a3` | — |
| 1.5 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renommer le projet en ORION dans tout le dépôt | `0078180` | — |
| 1.4 | 09/11/2026 | Consolider le modèle et les règles métier ; Harmoniser les diagrammes de cas d'utilisation | `af0e24e` | — |
| 1.3 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` | — |
| 1.2 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | `6212b60` | — |
| 1.1 | 03/11/2026 | Harmoniser le compte Windows dans le modèle ; Préciser l’administration Windows sans agent ; Préparer le support du point client ; Formaliser les profils et leurs autorisations ; Intégrer Keycloak, S3 et les serveurs front et back | `c6eed95` | — |
| 1.0 | 02/11/2026 | Consolider le cadrage et les modèles ; Mcd ; Consolider le cadrage et épurer les diagrammes ; Préciser les remontées et les comptes Windows | `a9aa9cd` | — |

### 01-CONSIGNES

Fichier : [docs/01-CONSIGNES.md](../docs/01-CONSIGNES.md) · Source fournie par l’encadrement

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.3 | 13/11/2026 | Fiabiliser les configurations à remettre | en vigueur | — |
| 1.2 | 09/11/2026 | Préciser le contenu attendu du dossier d'architecture | `44127a1` | — |
| 1.1 | 02/11/2026 | Consolider le cadrage et les modèles | `12080db` | — |
| 1.0 | 20/10/2026 | Consignes + cadrage | `288c524` | — |

### 02-CADRAGE

Fichier : [docs/02-CADRAGE.md](../docs/02-CADRAGE.md) · Source de travail interne

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 3.0 | 13/11/2026 | Faire de l’état actuel la référence ; entrée unique et absence de filtrage (13 novembre) ; retours du 12 novembre cités | en vigueur | — |
| 2.1 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | `ddc3262` | — |
| 2.0 | 13/11/2026 | Inscrire les décisions de l’utilisateur du 13 novembre sur les remontées, les notifications et le changement d’école | `38c405d` | — |
| 1.9 | 13/11/2026 | Développer le sigle ORION et garantir RG-73 côté serveur ; Inscrire les points de sécurité qui demandent une décision ; Reporter les décisions de sécurité du 13 novembre ; Décrire orion-3 en VM d'administration avec le runner ; Décrire l'entrée unique par adresse IP, sans DNS ; Documenter la cible C1NP et unifier les vues ; Fiabiliser les configurations à remettre | `83658a3` | — |
| 1.8 | 12/11/2026 | Préparer les points du rendez-vous du 12 novembre ; Passage au nom ORION, mise à jour de l'interface utilisateur ; Renommer le projet en ORION dans tout le dépôt ; Décrire l'architecture orion sur dix VM ; Retirer les dernières mentions de l'ancien nom | `b83aaca` | — |
| 1.7 | 11/11/2026 | Décrire le déploiement du démonstrateur sur huit VM | `3396072` | — |
| 1.6 | 09/11/2026 | Consolider le modèle et les règles métier | `a8fc937` | — |
| 1.5 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` | — |
| 1.4 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | `6212b60` | — |
| 1.3 | 03/11/2026 | Harmoniser le compte Windows dans le modèle ; Préciser l’administration Windows sans agent ; Préparer le support du point client ; Formaliser les profils et leurs autorisations ; Intégrer Keycloak, S3 et les serveurs front et back | `c6eed95` | — |
| 1.2 | 02/11/2026 | Consolider le cadrage et les modèles ; Mcd ; Consolider le cadrage et épurer les diagrammes ; Préciser les remontées et les comptes Windows | `a9aa9cd` | — |
| 1.1 | 24/10/2026 | Aligner le cadrage, les diagrammes et les consignes Git | `cc22229` | — |
| 1.0 | 20/10/2026 | Consignes + cadrage | `288c524` | — |

### 03-COMPTE-RENDU-ENTRETIENS

Fichier : [docs/03-COMPTE-RENDU-ENTRETIENS.md](../docs/03-COMPTE-RENDU-ENTRETIENS.md) · Source de travail interne

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.0 | 13/11/2026 | Ajouter les retours du client du 12 novembre (PDF à la demande, validation des remontées) | en vigueur | — |
| 1.4 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` | — |
| 1.3 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` | — |
| 1.2 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | `6212b60` | — |
| 1.1 | 02/11/2026 | Mcd | `23cb750` | — |
| 1.0 | 24/10/2026 | Aligner le cadrage, les diagrammes et les consignes Git | `cc22229` | — |

### 04-REGLES-DE-GESTION

Fichier : [docs/04-REGLES-DE-GESTION.md](../docs/04-REGLES-DE-GESTION.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.7 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | en vigueur | — |
| 1.6 | 13/11/2026 | Développer le sigle ORION et garantir RG-73 côté serveur | `83658a3` | — |
| 1.5 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renommer le projet en ORION dans tout le dépôt | `0078180` | — |
| 1.4 | 09/11/2026 | Consolider le modèle et les règles métier | `a8fc937` | — |
| 1.3 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` | — |
| 1.2 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | `6212b60` | — |
| 1.1 | 03/11/2026 | Harmoniser le compte Windows dans le modèle ; Préciser l’administration Windows sans agent ; Formaliser les profils et leurs autorisations | `f7310c1` | — |
| 1.0 | 02/11/2026 | Consolider le cadrage et les modèles ; Mcd ; Consolider le cadrage et épurer les diagrammes ; Préciser les remontées et les comptes Windows | `a9aa9cd` | — |

### 05-MCD-MERISE-MOCODO

Fichier : [docs/05-MCD-MERISE-MOCODO.url](../docs/05-MCD-MERISE-MOCODO.url) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.3 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur | — |
| 1.2 | 09/11/2026 | Consolider le modèle et les règles métier | `a8fc937` | — |
| 1.1 | 03/11/2026 | Harmoniser le compte Windows dans le modèle ; Formaliser les profils et leurs autorisations | `f7310c1` | — |
| 1.0 | 02/11/2026 | Mcd ; Maj mcd | `e0cf540` | — |

### 05-MCD-MERISE

Fichier : [docs/05-MCD-MERISE.svg](../docs/05-MCD-MERISE.svg) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.3 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur | — |
| 1.2 | 09/11/2026 | Consolider le modèle et les règles métier | `a8fc937` | — |
| 1.1 | 03/11/2026 | Harmoniser le compte Windows dans le modèle ; Formaliser les profils et leurs autorisations | `f7310c1` | — |
| 1.0 | 02/11/2026 | Mcd ; Maj mcd | `e0cf540` | — |

### 06-DIAGRAMME-CONTEXTE

Fichier : [docs/06-DIAGRAMME-CONTEXTE.md](../docs/06-DIAGRAMME-CONTEXTE.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.2 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | en vigueur | — |
| 1.1 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` | — |
| 1.0 | 02/11/2026 | Mcd ; Consolider le cadrage et épurer les diagrammes | `874689d` | — |

### 07-DIAGRAMMES-ACTIVITE

Fichier : [docs/07-DIAGRAMMES-ACTIVITE.md](../docs/07-DIAGRAMMES-ACTIVITE.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.4 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | en vigueur | — |
| 1.3 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` | — |
| 1.2 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | `6212b60` | — |
| 1.1 | 02/11/2026 | Consolider le cadrage et les modèles ; Mcd ; Consolider le cadrage et épurer les diagrammes | `874689d` | — |
| 1.0 | 24/10/2026 | Aligner le cadrage, les diagrammes et les consignes Git | `12080db` (`docs/06-DIAGRAMMES-ACTIVITE.md`) | — |

### 08-DCU-GESTION-PARC

Fichier : [docs/08-DCU-GESTION-PARC.md](../docs/08-DCU-GESTION-PARC.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.3 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur | — |
| 1.2 | 09/11/2026 | Harmoniser les diagrammes de cas d'utilisation | `af0e24e` | — |
| 1.1 | 03/11/2026 | Formaliser les profils et leurs autorisations | `f7310c1` | — |
| 1.0 | 02/11/2026 | Sous dcu temporaires ; Consolider le cadrage et épurer les diagrammes | `874689d` | — |

### 09-DCU-ADMINISTRATION-POSTES

Fichier : [docs/09-DCU-ADMINISTRATION-POSTES.md](../docs/09-DCU-ADMINISTRATION-POSTES.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.5 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | en vigueur | — |
| 1.4 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` | — |
| 1.3 | 09/11/2026 | Harmoniser les diagrammes de cas d'utilisation | `af0e24e` | — |
| 1.2 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` | — |
| 1.1 | 03/11/2026 | Préciser l’administration Windows sans agent ; Formaliser les profils et leurs autorisations | `f7310c1` | — |
| 1.0 | 02/11/2026 | Sous dcu temporaires ; Consolider le cadrage et épurer les diagrammes | `874689d` | — |

### 10-DCU-SUPERVISION-POSTES

Fichier : [docs/10-DCU-SUPERVISION-POSTES.md](../docs/10-DCU-SUPERVISION-POSTES.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.4 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur | — |
| 1.3 | 09/11/2026 | Harmoniser les diagrammes de cas d'utilisation | `af0e24e` | — |
| 1.2 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` | — |
| 1.1 | 03/11/2026 | Préciser l’administration Windows sans agent ; Formaliser les profils et leurs autorisations | `f7310c1` | — |
| 1.0 | 02/11/2026 | Sous dcu temporaires ; Consolider le cadrage et épurer les diagrammes | `874689d` | — |

### 11-DCU-REMONTEES-UTILISATEUR

Fichier : [docs/11-DCU-REMONTEES-UTILISATEUR.md](../docs/11-DCU-REMONTEES-UTILISATEUR.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.0 | 13/11/2026 | Prise en charge « en cours » puis « remplacé » ou « corrigé » par le gestionnaire ; remontées et notifications des administrateurs ; type de problème obligatoire | en vigueur | — |
| 1.3 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` | — |
| 1.2 | 09/11/2026 | Harmoniser les diagrammes de cas d'utilisation | `af0e24e` | — |
| 1.1 | 03/11/2026 | Formaliser les profils et leurs autorisations | `f7310c1` | — |
| 1.0 | 02/11/2026 | Sous dcu temporaires ; Consolider le cadrage et épurer les diagrammes | `874689d` | — |

### 12-MATRICE-DROITS

Fichier : [docs/12-MATRICE-DROITS.md](../docs/12-MATRICE-DROITS.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 3.0 | 13/11/2026 | Formateur : consultation des matériels d’une salle, sans recherche dans le parc | en vigueur | — |
| 2.1 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | `ddc3262` | — |
| 2.0 | 13/11/2026 | Prise en charge « en cours » puis « remplacé » ou « corrigé » par le gestionnaire ; remontées et notifications des administrateurs ; type de problème obligatoire | `38c405d` | — |
| 1.3 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renommer le projet en ORION dans tout le dépôt | `e072d65` | — |
| 1.2 | 09/11/2026 | Synchroniser la matrice et les fiches de profils | `d78a5a7` | — |
| 1.1 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` | — |
| 1.0 | 03/11/2026 | Formaliser les profils et leurs autorisations | `f7310c1` | — |

### 13-FICHE-DESCRIPTIVE-GESTIONNAIRE

Fichier : [docs/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md](../docs/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.0 | 13/11/2026 | Prise en charge « en cours » puis « remplacé » ou « corrigé » par le gestionnaire ; remontées et notifications des administrateurs ; type de problème obligatoire | en vigueur | — |
| 1.4 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` | — |
| 1.3 | 09/11/2026 | Synchroniser la matrice et les fiches de profils | `d78a5a7` | — |
| 1.2 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` | — |
| 1.1 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | `6212b60` | — |
| 1.0 | 03/11/2026 | Formaliser les parcours et interfaces par profil ; Intégrer Keycloak, S3 et les serveurs front et back | `c6eed95` | — |

### 14-FICHE-DESCRIPTIVE-FORMATEUR

Fichier : [docs/14-FICHE-DESCRIPTIVE-FORMATEUR.md](../docs/14-FICHE-DESCRIPTIVE-FORMATEUR.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.0 | 13/11/2026 | Prise en charge « en cours » puis « remplacé » ou « corrigé » par le gestionnaire ; remontées et notifications des administrateurs ; type de problème obligatoire | en vigueur | — |
| 1.4 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renommer le projet en ORION dans tout le dépôt | `e072d65` | — |
| 1.3 | 09/11/2026 | Synchroniser la matrice et les fiches de profils | `d78a5a7` | — |
| 1.2 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` | — |
| 1.1 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | `6212b60` | — |
| 1.0 | 03/11/2026 | Formaliser les parcours et interfaces par profil ; Intégrer Keycloak, S3 et les serveurs front et back | `c6eed95` | — |

### 15-FICHE-DESCRIPTIVE-ADMINISTRATEUR

Fichier : [docs/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md](../docs/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.1 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | en vigueur | — |
| 2.0 | 13/11/2026 | Prise en charge « en cours » puis « remplacé » ou « corrigé » par le gestionnaire ; remontées et notifications des administrateurs ; type de problème obligatoire | `38c405d` | — |
| 1.4 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renommer le projet en ORION dans tout le dépôt | `e072d65` | — |
| 1.3 | 09/11/2026 | Synchroniser la matrice et les fiches de profils | `d78a5a7` | — |
| 1.2 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` | — |
| 1.1 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | `6212b60` | — |
| 1.0 | 03/11/2026 | Formaliser les parcours et interfaces par profil ; Intégrer Keycloak, S3 et les serveurs front et back | `c6eed95` | — |

### 16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR

Fichier : [docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md](../docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.1 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | en vigueur | — |
| 2.0 | 13/11/2026 | Prise en charge « en cours » puis « remplacé » ou « corrigé » par le gestionnaire ; remontées et notifications des administrateurs ; type de problème obligatoire | `38c405d` | — |
| 1.4 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` | — |
| 1.3 | 09/11/2026 | Synchroniser la matrice et les fiches de profils | `d78a5a7` | — |
| 1.2 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` | — |
| 1.1 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | `6212b60` | — |
| 1.0 | 03/11/2026 | Formaliser les parcours et interfaces par profil ; Intégrer Keycloak, S3 et les serveurs front et back | `c6eed95` | — |

### 17-DOSSIER-ARCHITECTURE-TECHNIQUE

Fichier : [docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md](../docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.5 | 13/11/2026 | Aligner l’architecture réelle sur la configuration versionnée : création des identités, image Keycloak, flux d’Express, absence de filtrage, secrets et versions | en vigueur | — |
| 1.4 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | `ddc3262` | — |
| 1.3 | 13/11/2026 | Décrire orion-3 en VM d'administration avec le runner ; Décrire l'entrée unique par adresse IP, sans DNS ; Documenter la cible C1NP et unifier les vues | `83658a3` | — |
| 1.2 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renseigner les adresses des VM ; Renommer le projet en ORION dans tout le dépôt ; Décrire l'architecture orion sur dix VM ; Retirer les dernières mentions de l'ancien nom ; Mettre à jour les noms des fichiers convertis en TypeScript | `335b44d` | — |
| 1.1 | 11/11/2026 | Décrire le déploiement du démonstrateur sur huit VM | `3396072` | — |
| 1.0 | 09/11/2026 | Ajouter le dossier d'architecture technique et ses diagrammes | `51bd591` | — |

### 18-DIAGRAMMES-ARCHITECTURE

Fichier : [docs/18-DIAGRAMMES-ARCHITECTURE.md](../docs/18-DIAGRAMMES-ARCHITECTURE.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.3 | 13/11/2026 | Documenter la cible C1NP et unifier les vues | en vigueur | — |
| 1.2 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renseigner les adresses des VM ; Renommer le projet en ORION dans tout le dépôt ; Décrire l'architecture orion sur dix VM | `3e437e0` | — |
| 1.1 | 11/11/2026 | Décrire le déploiement du démonstrateur sur huit VM | `3396072` | — |
| 1.0 | 09/11/2026 | Ajouter le dossier d'architecture technique et ses diagrammes | `51bd591` | — |

### 19-BACKLOG-ET-SUIVI-PROJET

Fichier : [docs/19-BACKLOG-ET-SUIVI-PROJET.docx](../docs/19-BACKLOG-ET-SUIVI-PROJET.docx) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.1 | 13/11/2026 | Remplacer l’ancien nom par ORION et corriger le lien du commit de la cible C1NP | en vigueur | — |
| 1.0 | 13/11/2026 | Consolider le suivi des progressions ; Structurer le suivi Agile et les cérémonies ; Styliser les graphiques en SVG dans Word | `b2a5a17` | — |

### 19-BACKLOG-ET-SUIVI-PROJET

Fichier : [docs/19-BACKLOG-ET-SUIVI-PROJET.md](../docs/19-BACKLOG-ET-SUIVI-PROJET.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.1 | 13/11/2026 | Remplacer l’ancien nom par ORION et corriger le lien du commit de la cible C1NP | en vigueur | — |
| 1.0 | 13/11/2026 | Consolider le suivi des progressions ; Structurer le suivi Agile et les cérémonies ; Styliser les graphiques en SVG dans Word | `83658a3` | — |

### 19-SUIVI-BACKLOG-BROUILLON-V1

Fichier : [docs/temporaire/19-SUIVI-BACKLOG-BROUILLON-V1.md](../docs/temporaire/19-SUIVI-BACKLOG-BROUILLON-V1.md) · Brouillon interne

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.1 | 13/11/2026 | Remplacer l’ancien nom par ORION et corriger le commit de la cible C1NP | en vigueur | — |
| 1.0 | 13/11/2026 | Consolider le suivi des progressions | `83658a3` | — |

### DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2

Fichier : [docs/temporaire/DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2.md](../docs/temporaire/DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2.md) · Brouillon interne

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.1 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | en vigueur | — |
| 1.0 | 06/11/2026 | Ajouter les parcours détaillés en brouillon | `d626315` | — |

### DIAGRAMMES-ETATS-BROUILLON-V1

Fichier : [docs/temporaire/DIAGRAMMES-ETATS-BROUILLON-V1.md](../docs/temporaire/DIAGRAMMES-ETATS-BROUILLON-V1.md) · Brouillon interne

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.0 | 13/11/2026 | Aligner sur l’application : état « en cours », traitement direct possible, PDF à la demande, type obligatoire, interventions sur une seule salle | en vigueur | — |
| 1.0 | 09/11/2026 | Ajouter les diagrammes d'états de la remontée et des interventions | `83658a3` | — |

### RESTE-A-FAIRE-BROUILLON-V1

Fichier : [docs/temporaire/RESTE-A-FAIRE-BROUILLON-V1.md](../docs/temporaire/RESTE-A-FAIRE-BROUILLON-V1.md) · Brouillon interne

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.1 | 13/11/2026 | Diagrammes 06 et 07 à reprendre avec les collègues | en vigueur | — |
| 2.0 | 13/11/2026 | Ajouter DCU à compléter, modèle de données, points documentaires oubliés et plan d’organisation du code | `6768d09` | — |
| 1.0 | 13/11/2026 | Recenser ce qui reste à faire après le contrôle du 13 novembre ; Ajouter des jetons d'accès pour la présentation au client ; Décrire l'entrée unique par adresse IP, sans DNS | `83658a3` | — |

## Fichiers retirés

### design-charte-graphique-vigie-index

Ancien emplacement : `design/charte-graphique-vigie/index.html`. Retiré le 13/11/2026 : Direction artistique VIGIE non retenue ; identité ORION conforme à l'application

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.1 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `0078180` | [archive](design-charte-graphique-vigie-index/index-v1.1-2026-11-12.html) |
| 1.0 | 06/11/2026 | Proposer l'identité VIGIE | `9177f93` | [archive](design-charte-graphique-vigie-index/index-v1.0-2026-11-06.html) |

### design-charte-graphique-charte-graphique-orion

Ancien emplacement : `design/charte-graphique/charte-graphique-orion.html`. Retiré le 13/11/2026 : Direction florale ORION remplacée par la charte 2.0 conforme à l'application

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.0 | 09/11/2026 | Ajouter la maquette et la charte graphique ORION | `a6cf32e` | [archive](design-charte-graphique-charte-graphique-orion/charte-graphique-orion-v1.0-2026-11-09.html) |

### design-maquettes-gestion-materiels

Ancien emplacement : `design/maquettes/gestion-materiels.html`. Retiré le 13/11/2026 : Maquette remplacée par les captures de l'application (design/maquettes/index.html)

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.2 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `0078180` | [archive](design-maquettes-gestion-materiels/gestion-materiels-v1.2-2026-11-12.html) |
| 1.1 | 06/11/2026 | Adapter les écrans et captures à la cible | `4a3e92b` | [archive](design-maquettes-gestion-materiels/gestion-materiels-v1.1-2026-11-06.html) |
| 1.0 | 03/11/2026 | Organiser les livrables et intégrer la maquette | `03728b6` | [archive](design-maquettes-gestion-materiels/gestion-materiels-v1.0-2026-11-03.html) |

### design-maquettes-maquette-dashboard-orion

Ancien emplacement : `design/maquettes/maquette-dashboard-orion.html`. Retiré le 13/11/2026 : Maquette remplacée par les captures de l'application (design/maquettes/index.html)

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.0 | 09/11/2026 | Ajouter la maquette et la charte graphique ORION | `a6cf32e` | [archive](design-maquettes-maquette-dashboard-orion/maquette-dashboard-orion-v1.0-2026-11-09.html) |

### design-maquettes-maquette-dashboard-proposition-a-cockpit

Ancien emplacement : `design/maquettes/maquette-dashboard-proposition-a-cockpit.html`. Retiré le 13/11/2026 : Proposition de tableau de bord remplacée par les captures de l'application

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.1 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `0078180` | [archive](design-maquettes-maquette-dashboard-proposition-a-cockpit/maquette-dashboard-proposition-a-cockpit-v1.1-2026-11-12.html) |
| 1.0 | 10/11/2026 | Proposer trois maquettes du tableau de bord | `284cbc0` | [archive](design-maquettes-maquette-dashboard-proposition-a-cockpit/maquette-dashboard-proposition-a-cockpit-v1.0-2026-11-10.html) |

### design-maquettes-maquette-dashboard-proposition-b-a-traiter

Ancien emplacement : `design/maquettes/maquette-dashboard-proposition-b-a-traiter.html`. Retiré le 13/11/2026 : Proposition de tableau de bord remplacée par les captures de l'application

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.1 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `0078180` | [archive](design-maquettes-maquette-dashboard-proposition-b-a-traiter/maquette-dashboard-proposition-b-a-traiter-v1.1-2026-11-12.html) |
| 1.0 | 10/11/2026 | Proposer trois maquettes du tableau de bord | `284cbc0` | [archive](design-maquettes-maquette-dashboard-proposition-b-a-traiter/maquette-dashboard-proposition-b-a-traiter-v1.0-2026-11-10.html) |

### design-maquettes-maquette-dashboard-proposition-c-analyse

Ancien emplacement : `design/maquettes/maquette-dashboard-proposition-c-analyse.html`. Retiré le 13/11/2026 : Proposition de tableau de bord remplacée par les captures de l'application

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.1 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `0078180` | [archive](design-maquettes-maquette-dashboard-proposition-c-analyse/maquette-dashboard-proposition-c-analyse-v1.1-2026-11-12.html) |
| 1.0 | 10/11/2026 | Proposer trois maquettes du tableau de bord | `284cbc0` | [archive](design-maquettes-maquette-dashboard-proposition-c-analyse/maquette-dashboard-proposition-c-analyse-v1.0-2026-11-10.html) |
