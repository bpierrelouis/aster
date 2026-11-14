# Archives de la documentation ORION

Compte rendu des évolutions de chaque fichier suivi : version, date et modification. La version en vigueur est le fichier lui-même ; chaque version remplacée est retrouvée dans l’historique Git par son commit (`git show <commit>:<chemin>`). Seules les versions de `design/`, qui font partie de la capture du besoin, sont copiées, dans [design/](design/index.html) : chartes, maquettes et présentation du dossier, avec leurs logos et icônes d’époque. Ce document et les en-têtes de version sont générés à partir de [registre.json](registre.json) par [versions.py](../.agents/skills/orion-documentation/scripts/versions.py) ; ne pas les modifier à la main.

Numérotation : version majeure pour un changement de sens (décision, règle, périmètre, structure), version mineure pour une correction ou une précision. L’historique antérieur au 13 novembre 2026 est reconstitué depuis Git, à raison d’une version par jour de modification.

## Vue d’ensemble

| Fichier | Destination | Version | Mise à jour |
| --- | --- | --- | --- |
| [design/README.md](../design/README.md) | Ressource de préparation | [2.2](#design-readme) | 13/11/2026 |
| [design/charte-graphique/index.html](../design/charte-graphique/index.html) | Ressource de préparation | [2.1](#design-charte-graphique-index) | 13/11/2026 |
| [design/maquettes/index.html](../design/maquettes/index.html) | Ressource de préparation | [2.0](#design-maquettes-index) | 13/11/2026 |
| [docs/01-CONTEXTE/00-GLOSSAIRE.md](../docs/01-CONTEXTE/00-GLOSSAIRE.md) | Production destinée à la remise | [3.0](#00-glossaire) | 14/11/2026 |
| [docs/01-CONTEXTE/01-CONSIGNES.md](../docs/01-CONTEXTE/01-CONSIGNES.md) | Source fournie par l’encadrement | [1.4](#01-consignes) | 14/11/2026 |
| [docs/01-CONTEXTE/02-CADRAGE.md](../docs/01-CONTEXTE/02-CADRAGE.md) | Source de travail interne | [5.0](#02-cadrage) | 14/11/2026 |
| [docs/01-CONTEXTE/03-COMPTE-RENDU-ENTRETIENS.md](../docs/01-CONTEXTE/03-COMPTE-RENDU-ENTRETIENS.md) | Source de travail interne | [2.1](#03-compte-rendu-entretiens) | 14/11/2026 |
| [docs/02-ANALYSE/01-MODELISATION-METIER/06-DIAGRAMME-CONTEXTE.md](../docs/02-ANALYSE/01-MODELISATION-METIER/06-DIAGRAMME-CONTEXTE.md) | Production destinée à la remise | [2.0](#06-diagramme-contexte) | 14/11/2026 |
| [docs/02-ANALYSE/01-MODELISATION-METIER/07-DIAGRAMMES-ACTIVITE.md](../docs/02-ANALYSE/01-MODELISATION-METIER/07-DIAGRAMMES-ACTIVITE.md) | Production destinée à la remise | [1.5](#07-diagrammes-activite) | 14/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/04-REGLES-DE-GESTION.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/04-REGLES-DE-GESTION.md) | Production destinée à la remise | [2.1](#04-regles-de-gestion) | 14/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/05-MCD-MERISE.drawio](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/05-MCD-MERISE.drawio) | Production destinée à la remise | [1.2](#05-mcd-merise) | 14/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/05-MCD-MERISE.svg](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/05-MCD-MERISE.svg) | Production destinée à la remise | [2.2](#05-mcd-merise) | 14/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/08-DCU-GESTION-PARC.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/08-DCU-GESTION-PARC.md) | Production destinée à la remise | [1.4](#08-dcu-gestion-parc) | 14/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/09-DCU-ADMINISTRATION-POSTES.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/09-DCU-ADMINISTRATION-POSTES.md) | Production destinée à la remise | [1.6](#09-dcu-administration-postes) | 14/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/10-DCU-SUPERVISION-POSTES.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/10-DCU-SUPERVISION-POSTES.md) | Production destinée à la remise | [1.5](#10-dcu-supervision-postes) | 14/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/11-DCU-REMONTEES-UTILISATEUR.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/11-DCU-REMONTEES-UTILISATEUR.md) | Production destinée à la remise | [3.1](#11-dcu-remontees-utilisateur) | 14/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md) | Production destinée à la remise | [4.1](#12-matrice-droits) | 14/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md) | Production destinée à la remise | [3.1](#13-fiche-descriptive-gestionnaire) | 14/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md) | Production destinée à la remise | [2.1](#14-fiche-descriptive-formateur) | 14/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md) | Production destinée à la remise | [3.1](#15-fiche-descriptive-administrateur) | 14/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md) | Production destinée à la remise | [3.1](#16-fiche-descriptive-super-administrateur) | 14/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2.md) | Production destinée à la remise | [1.2](#diagrammes-activite-cas-utilisation-brouillon-v2) | 14/11/2026 |
| [docs/02-ANALYSE/03-ANALYSE/DIAGRAMMES-ETATS-BROUILLON-V1.md](../docs/02-ANALYSE/03-ANALYSE/DIAGRAMMES-ETATS-BROUILLON-V1.md) | Production destinée à la remise | [3.1](#diagrammes-etats-brouillon-v1) | 14/11/2026 |
| [docs/02-ANALYSE/04-CONCEPTION/README.md](../docs/02-ANALYSE/04-CONCEPTION/README.md) | Production destinée à la remise | [1.1](#readme) | 14/11/2026 |
| [docs/03-ARCHITECTURE/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md](../docs/03-ARCHITECTURE/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md) | Production destinée à la remise | [3.0](#17-dossier-architecture-technique) | 14/11/2026 |
| [docs/03-ARCHITECTURE/18-DIAGRAMMES-ARCHITECTURE.md](../docs/03-ARCHITECTURE/18-DIAGRAMMES-ARCHITECTURE.md) | Production destinée à la remise | [2.0](#18-diagrammes-architecture) | 14/11/2026 |
| [docs/04-ORGANISATION/19-BACKLOG-ET-SUIVI-PROJET.docx](../docs/04-ORGANISATION/19-BACKLOG-ET-SUIVI-PROJET.docx) | Production destinée à la remise | [1.2](#19-backlog-et-suivi-projet) | 14/11/2026 |
| [docs/04-ORGANISATION/19-BACKLOG-ET-SUIVI-PROJET.md](../docs/04-ORGANISATION/19-BACKLOG-ET-SUIVI-PROJET.md) | Production destinée à la remise | [3.0](#19-backlog-et-suivi-projet) | 14/11/2026 |
| [docs/04-ORGANISATION/19-SUIVI-BACKLOG-BROUILLON-V1.md](../docs/04-ORGANISATION/19-SUIVI-BACKLOG-BROUILLON-V1.md) | Production destinée à la remise | [1.2](#19-suivi-backlog-brouillon-v1) | 14/11/2026 |
| [docs/04-ORGANISATION/20-BACKLOG-TECHNIQUE-ET-FEUILLE-DE-ROUTE.md](../docs/04-ORGANISATION/20-BACKLOG-TECHNIQUE-ET-FEUILLE-DE-ROUTE.md) | Pilotage interne | [4.2](#20-backlog-technique-et-feuille-de-route) | 14/11/2026 |

## Fichiers en vigueur

### design-README

Fichier : [design/README.md](../design/README.md) · Ressource de préparation

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.2 | 13/11/2026 | Icônes métier en Bleu Orion, captures compressées | en vigueur | — |
| 2.1 | 13/11/2026 | Décrire les maquettes simplifiées et les logos à l’étoile | `bf823e8` | [archive](design/readme/README-v2.1-2026-11-13.md) |
| 2.0 | 13/11/2026 | Présenter l'identité ORION conforme à l'application et archiver les anciennes directions | `e594af2` | [archive](design/readme/README-v2.0-2026-11-13.md) |
| 1.3 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` | [archive](design/readme/README-v1.3-2026-11-12.md) |
| 1.2 | 10/11/2026 | Proposer trois maquettes du tableau de bord | `284cbc0` | [archive](design/readme/README-v1.2-2026-11-10.md) |
| 1.1 | 06/11/2026 | Proposer l'identité VIGIE ; Ajouter les références visuelles MindefConnect ; Réduire le formulaire et centrer le bouton | `7e9e76b` | [archive](design/readme/README-v1.1-2026-11-06.md) |
| 1.0 | 03/11/2026 | Organiser les livrables et intégrer la maquette | `03728b6` | [archive](design/readme/README-v1.0-2026-11-03.md) |

### design-charte-graphique-index

Fichier : [design/charte-graphique/index.html](../design/charte-graphique/index.html) · Ressource de préparation

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.1 | 13/11/2026 | Centrer ORION sur sa signature, logos à l’étoile | en vigueur | — |
| 2.0 | 13/11/2026 | Refondre la charte sur l'application : étoile ORION, palette, ambiances Orion et Minarm, composants | `e594af2` | [archive](design/chartes/charte-graphique-v2.0-2026-11-13.html) |
| 1.2 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `0078180` | [archive](design/chartes/charte-graphique-v1.2-2026-11-12.html) |
| 1.1 | 03/11/2026 | Organiser les livrables et intégrer la maquette | `03728b6` | [archive](design/chartes/charte-graphique-v1.1-2026-11-03.html) |
| 1.0 | 21/10/2026 | Apercu + loader | `a4ba64a` (`da/apercu.html`) | [archive](design/chartes/charte-graphique-v1.0-2026-10-21.html) |

### design-maquettes-index

Fichier : [design/maquettes/index.html](../design/maquettes/index.html) · Ressource de préparation

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.0 | 13/11/2026 | Ajouter les maquettes simplifiées à côté des captures | en vigueur | — |
| 1.0 | 13/11/2026 | Présenter les écrans de l'application par module et par profil | `e594af2` | [archive](design/maquettes/maquettes-v1.0-2026-11-13.html) |

### 00-GLOSSAIRE

Fichier : [docs/01-CONTEXTE/00-GLOSSAIRE.md](../docs/01-CONTEXTE/00-GLOSSAIRE.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 3.0 | 14/11/2026 | Définir RIGEL et M42 | en vigueur | — |
| 2.1 | 14/11/2026 | Déplacer dans docs/01-CONTEXTE/ | `69eaf4e` | — |
| 2.0 | 13/11/2026 | Traitement des remontées réservé au gestionnaire, prise en charge obligatoire ; règles RG-13, 15, 21, 39, 40, 64, 66, 72 mises à jour et RG-87 à RG-91 ajoutées | `d3c3785` (`docs/00-GLOSSAIRE.md`) | — |
| 1.8 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | `ddc3262` (`docs/00-GLOSSAIRE.md`) | — |
| 1.7 | 13/11/2026 | Préciser l’acteur de traitement : prise en charge puis fin du traitement | `38c405d` (`docs/00-GLOSSAIRE.md`) | — |
| 1.6 | 13/11/2026 | Développer le sigle ORION et garantir RG-73 côté serveur | `83658a3` (`docs/00-GLOSSAIRE.md`) | — |
| 1.5 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renommer le projet en ORION dans tout le dépôt | `0078180` (`docs/00-GLOSSAIRE.md`) | — |
| 1.4 | 09/11/2026 | Consolider le modèle et les règles métier ; Harmoniser les diagrammes de cas d'utilisation | `af0e24e` (`docs/00-GLOSSAIRE.md`) | — |
| 1.3 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` (`docs/00-GLOSSAIRE.md`) | — |
| 1.2 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | `6212b60` (`docs/00-GLOSSAIRE.md`) | — |
| 1.1 | 03/11/2026 | Harmoniser le compte Windows dans le modèle ; Préciser l’administration Windows sans agent ; Préparer le support du point client ; Formaliser les profils et leurs autorisations ; Intégrer Keycloak, S3 et les serveurs front et back | `c6eed95` (`docs/00-GLOSSAIRE.md`) | — |
| 1.0 | 02/11/2026 | Consolider le cadrage et les modèles ; Mcd ; Consolider le cadrage et épurer les diagrammes ; Préciser les remontées et les comptes Windows | `a9aa9cd` (`docs/00-GLOSSAIRE.md`) | — |

### 01-CONSIGNES

Fichier : [docs/01-CONTEXTE/01-CONSIGNES.md](../docs/01-CONTEXTE/01-CONSIGNES.md) · Source fournie par l’encadrement

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.4 | 14/11/2026 | Déplacer dans docs/01-CONTEXTE/ | en vigueur | — |
| 1.3 | 13/11/2026 | Fiabiliser les configurations à remettre | `83658a3` (`docs/01-CONSIGNES.md`) | — |
| 1.2 | 09/11/2026 | Préciser le contenu attendu du dossier d'architecture | `44127a1` (`docs/01-CONSIGNES.md`) | — |
| 1.1 | 02/11/2026 | Consolider le cadrage et les modèles | `12080db` (`docs/01-CONSIGNES.md`) | — |
| 1.0 | 20/10/2026 | Consignes + cadrage | `288c524` (`docs/01-CONSIGNES.md`) | — |

### 02-CADRAGE

Fichier : [docs/01-CONTEXTE/02-CADRAGE.md](../docs/01-CONTEXTE/02-CADRAGE.md) · Source de travail interne

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 5.0 | 14/11/2026 | Nommer M42 comme option d’agent ASTER | en vigueur | — |
| 4.1 | 14/11/2026 | Déplacer dans docs/01-CONTEXTE/ | `69eaf4e` | — |
| 4.0 | 13/11/2026 | Traitement des remontées réservé au gestionnaire, prise en charge obligatoire ; règles RG-13, 15, 21, 39, 40, 64, 66, 72 mises à jour et RG-87 à RG-91 ajoutées | `d3c3785` (`docs/02-CADRAGE.md`) | — |
| 3.0 | 13/11/2026 | Faire de l’état actuel la référence ; entrée unique et absence de filtrage (13 novembre) ; retours du 12 novembre cités | `3caca82` (`docs/02-CADRAGE.md`) | — |
| 2.1 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | `ddc3262` (`docs/02-CADRAGE.md`) | — |
| 2.0 | 13/11/2026 | Inscrire les décisions de l’utilisateur du 13 novembre sur les remontées, les notifications et le changement d’école | `38c405d` (`docs/02-CADRAGE.md`) | — |
| 1.9 | 13/11/2026 | Développer le sigle ORION et garantir RG-73 côté serveur ; Inscrire les points de sécurité qui demandent une décision ; Reporter les décisions de sécurité du 13 novembre ; Décrire orion-3 en VM d'administration avec le runner ; Décrire l'entrée unique par adresse IP, sans DNS ; Documenter la cible C1NP et unifier les vues ; Fiabiliser les configurations à remettre | `83658a3` (`docs/02-CADRAGE.md`) | — |
| 1.8 | 12/11/2026 | Préparer les points du rendez-vous du 12 novembre ; Passage au nom ORION, mise à jour de l'interface utilisateur ; Renommer le projet en ORION dans tout le dépôt ; Décrire l'architecture orion sur dix VM ; Retirer les dernières mentions de l'ancien nom | `b83aaca` (`docs/02-CADRAGE.md`) | — |
| 1.7 | 11/11/2026 | Décrire le déploiement du démonstrateur sur huit VM | `3396072` (`docs/02-CADRAGE.md`) | — |
| 1.6 | 09/11/2026 | Consolider le modèle et les règles métier | `a8fc937` (`docs/02-CADRAGE.md`) | — |
| 1.5 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` (`docs/02-CADRAGE.md`) | — |
| 1.4 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | `6212b60` (`docs/02-CADRAGE.md`) | — |
| 1.3 | 03/11/2026 | Harmoniser le compte Windows dans le modèle ; Préciser l’administration Windows sans agent ; Préparer le support du point client ; Formaliser les profils et leurs autorisations ; Intégrer Keycloak, S3 et les serveurs front et back | `c6eed95` (`docs/02-CADRAGE.md`) | — |
| 1.2 | 02/11/2026 | Consolider le cadrage et les modèles ; Mcd ; Consolider le cadrage et épurer les diagrammes ; Préciser les remontées et les comptes Windows | `a9aa9cd` (`docs/02-CADRAGE.md`) | — |
| 1.1 | 24/10/2026 | Aligner le cadrage, les diagrammes et les consignes Git | `cc22229` (`docs/02-CADRAGE.md`) | — |
| 1.0 | 20/10/2026 | Consignes + cadrage | `288c524` (`docs/02-CADRAGE.md`) | — |

### 03-COMPTE-RENDU-ENTRETIENS

Fichier : [docs/01-CONTEXTE/03-COMPTE-RENDU-ENTRETIENS.md](../docs/01-CONTEXTE/03-COMPTE-RENDU-ENTRETIENS.md) · Source de travail interne

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.1 | 14/11/2026 | Déplacer dans docs/01-CONTEXTE/ | en vigueur | — |
| 2.0 | 13/11/2026 | Ajouter les retours du client du 12 novembre (PDF à la demande, validation des remontées) | `655fc90` (`docs/03-COMPTE-RENDU-ENTRETIENS.md`) | — |
| 1.4 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` (`docs/03-COMPTE-RENDU-ENTRETIENS.md`) | — |
| 1.3 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` (`docs/03-COMPTE-RENDU-ENTRETIENS.md`) | — |
| 1.2 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | `6212b60` (`docs/03-COMPTE-RENDU-ENTRETIENS.md`) | — |
| 1.1 | 02/11/2026 | Mcd | `23cb750` (`docs/03-COMPTE-RENDU-ENTRETIENS.md`) | — |
| 1.0 | 24/10/2026 | Aligner le cadrage, les diagrammes et les consignes Git | `cc22229` (`docs/03-COMPTE-RENDU-ENTRETIENS.md`) | — |

### 06-DIAGRAMME-CONTEXTE

Fichier : [docs/02-ANALYSE/01-MODELISATION-METIER/06-DIAGRAMME-CONTEXTE.md](../docs/02-ANALYSE/01-MODELISATION-METIER/06-DIAGRAMME-CONTEXTE.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.0 | 14/11/2026 | Nommer M42 comme agent candidat | en vigueur | — |
| 1.3 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/01-MODELISATION-METIER/ | `69eaf4e` | — |
| 1.2 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | `ddc3262` (`docs/06-DIAGRAMME-CONTEXTE.md`) | — |
| 1.1 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` (`docs/06-DIAGRAMME-CONTEXTE.md`) | — |
| 1.0 | 02/11/2026 | Mcd ; Consolider le cadrage et épurer les diagrammes | `874689d` (`docs/06-DIAGRAMME-CONTEXTE.md`) | — |

### 07-DIAGRAMMES-ACTIVITE

Fichier : [docs/02-ANALYSE/01-MODELISATION-METIER/07-DIAGRAMMES-ACTIVITE.md](../docs/02-ANALYSE/01-MODELISATION-METIER/07-DIAGRAMMES-ACTIVITE.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.5 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/01-MODELISATION-METIER/ | en vigueur | — |
| 1.4 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | `ddc3262` (`docs/07-DIAGRAMMES-ACTIVITE.md`) | — |
| 1.3 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` (`docs/07-DIAGRAMMES-ACTIVITE.md`) | — |
| 1.2 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | `6212b60` (`docs/07-DIAGRAMMES-ACTIVITE.md`) | — |
| 1.1 | 02/11/2026 | Consolider le cadrage et les modèles ; Mcd ; Consolider le cadrage et épurer les diagrammes | `874689d` (`docs/07-DIAGRAMMES-ACTIVITE.md`) | — |
| 1.0 | 24/10/2026 | Aligner le cadrage, les diagrammes et les consignes Git | `12080db` (`docs/06-DIAGRAMMES-ACTIVITE.md`) | — |

### 04-REGLES-DE-GESTION

Fichier : [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/04-REGLES-DE-GESTION.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/04-REGLES-DE-GESTION.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.1 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ | en vigueur | — |
| 2.0 | 13/11/2026 | Traitement des remontées réservé au gestionnaire, prise en charge obligatoire ; règles RG-13, 15, 21, 39, 40, 64, 66, 72 mises à jour et RG-87 à RG-91 ajoutées | `d3c3785` (`docs/04-REGLES-DE-GESTION.md`) | — |
| 1.7 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | `ddc3262` (`docs/04-REGLES-DE-GESTION.md`) | — |
| 1.6 | 13/11/2026 | Développer le sigle ORION et garantir RG-73 côté serveur | `83658a3` (`docs/04-REGLES-DE-GESTION.md`) | — |
| 1.5 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renommer le projet en ORION dans tout le dépôt | `0078180` (`docs/04-REGLES-DE-GESTION.md`) | — |
| 1.4 | 09/11/2026 | Consolider le modèle et les règles métier | `a8fc937` (`docs/04-REGLES-DE-GESTION.md`) | — |
| 1.3 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` (`docs/04-REGLES-DE-GESTION.md`) | — |
| 1.2 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | `6212b60` (`docs/04-REGLES-DE-GESTION.md`) | — |
| 1.1 | 03/11/2026 | Harmoniser le compte Windows dans le modèle ; Préciser l’administration Windows sans agent ; Formaliser les profils et leurs autorisations | `f7310c1` (`docs/04-REGLES-DE-GESTION.md`) | — |
| 1.0 | 02/11/2026 | Consolider le cadrage et les modèles ; Mcd ; Consolider le cadrage et épurer les diagrammes ; Préciser les remontées et les comptes Windows | `a9aa9cd` (`docs/04-REGLES-DE-GESTION.md`) | — |

### 05-MCD-MERISE

Fichier : [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/05-MCD-MERISE.drawio](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/05-MCD-MERISE.drawio) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.2 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ | en vigueur | — |
| 1.1 | 13/11/2026 | COMPTE_ORION et DÉMÉNAGER, identifiants des comptes distincts | `9c23199` (`docs/05-MCD-MERISE.drawio`) | — |
| 1.0 | 13/11/2026 | Source draw.io du MCD | `19f0488` (`docs/05-MCD-MERISE.drawio`) | — |

### 05-MCD-MERISE

Fichier : [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/05-MCD-MERISE.svg](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/05-MCD-MERISE.svg) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.2 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ | en vigueur | — |
| 2.1 | 13/11/2026 | COMPTE_ORION et DÉMÉNAGER, identifiants des comptes distincts | `9c23199` (`docs/05-MCD-MERISE.svg`) | — |
| 2.0 | 13/11/2026 | Refaire le MCD avec draw.io : historique des statuts, poste et unité centrale, IP, MAC, dates du compte, verbes d’un mot | `19f0488` (`docs/05-MCD-MERISE.svg`) | — |
| 1.3 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `0078180` (`docs/05-MCD-MERISE.svg`) | — |
| 1.2 | 09/11/2026 | Consolider le modèle et les règles métier | `a8fc937` (`docs/05-MCD-MERISE.svg`) | — |
| 1.1 | 03/11/2026 | Harmoniser le compte Windows dans le modèle ; Formaliser les profils et leurs autorisations | `f7310c1` (`docs/05-MCD-MERISE.svg`) | — |
| 1.0 | 02/11/2026 | Mcd ; Maj mcd | `e0cf540` (`docs/05-MCD-MERISE.svg`) | — |

### 08-DCU-GESTION-PARC

Fichier : [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/08-DCU-GESTION-PARC.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/08-DCU-GESTION-PARC.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.4 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ | en vigueur | — |
| 1.3 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` (`docs/08-DCU-GESTION-PARC.md`) | — |
| 1.2 | 09/11/2026 | Harmoniser les diagrammes de cas d'utilisation | `af0e24e` (`docs/08-DCU-GESTION-PARC.md`) | — |
| 1.1 | 03/11/2026 | Formaliser les profils et leurs autorisations | `f7310c1` (`docs/08-DCU-GESTION-PARC.md`) | — |
| 1.0 | 02/11/2026 | Sous dcu temporaires ; Consolider le cadrage et épurer les diagrammes | `874689d` (`docs/08-DCU-GESTION-PARC.md`) | — |

### 09-DCU-ADMINISTRATION-POSTES

Fichier : [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/09-DCU-ADMINISTRATION-POSTES.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/09-DCU-ADMINISTRATION-POSTES.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.6 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ | en vigueur | — |
| 1.5 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | `ddc3262` (`docs/09-DCU-ADMINISTRATION-POSTES.md`) | — |
| 1.4 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` (`docs/09-DCU-ADMINISTRATION-POSTES.md`) | — |
| 1.3 | 09/11/2026 | Harmoniser les diagrammes de cas d'utilisation | `af0e24e` (`docs/09-DCU-ADMINISTRATION-POSTES.md`) | — |
| 1.2 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` (`docs/09-DCU-ADMINISTRATION-POSTES.md`) | — |
| 1.1 | 03/11/2026 | Préciser l’administration Windows sans agent ; Formaliser les profils et leurs autorisations | `f7310c1` (`docs/09-DCU-ADMINISTRATION-POSTES.md`) | — |
| 1.0 | 02/11/2026 | Sous dcu temporaires ; Consolider le cadrage et épurer les diagrammes | `874689d` (`docs/09-DCU-ADMINISTRATION-POSTES.md`) | — |

### 10-DCU-SUPERVISION-POSTES

Fichier : [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/10-DCU-SUPERVISION-POSTES.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/10-DCU-SUPERVISION-POSTES.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.5 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ | en vigueur | — |
| 1.4 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` (`docs/10-DCU-SUPERVISION-POSTES.md`) | — |
| 1.3 | 09/11/2026 | Harmoniser les diagrammes de cas d'utilisation | `af0e24e` (`docs/10-DCU-SUPERVISION-POSTES.md`) | — |
| 1.2 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` (`docs/10-DCU-SUPERVISION-POSTES.md`) | — |
| 1.1 | 03/11/2026 | Préciser l’administration Windows sans agent ; Formaliser les profils et leurs autorisations | `f7310c1` (`docs/10-DCU-SUPERVISION-POSTES.md`) | — |
| 1.0 | 02/11/2026 | Sous dcu temporaires ; Consolider le cadrage et épurer les diagrammes | `874689d` (`docs/10-DCU-SUPERVISION-POSTES.md`) | — |

### 11-DCU-REMONTEES-UTILISATEUR

Fichier : [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/11-DCU-REMONTEES-UTILISATEUR.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/11-DCU-REMONTEES-UTILISATEUR.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 3.1 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ | en vigueur | — |
| 3.0 | 13/11/2026 | Traitement des remontées réservé au gestionnaire, prise en charge obligatoire ; règles RG-13, 15, 21, 39, 40, 64, 66, 72 mises à jour et RG-87 à RG-91 ajoutées | `d3c3785` (`docs/11-DCU-REMONTEES-UTILISATEUR.md`) | — |
| 2.0 | 13/11/2026 | Prise en charge « en cours » puis « remplacé » ou « corrigé » par le gestionnaire ; remontées et notifications des administrateurs ; type de problème obligatoire | `38c405d` (`docs/11-DCU-REMONTEES-UTILISATEUR.md`) | — |
| 1.3 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` (`docs/11-DCU-REMONTEES-UTILISATEUR.md`) | — |
| 1.2 | 09/11/2026 | Harmoniser les diagrammes de cas d'utilisation | `af0e24e` (`docs/11-DCU-REMONTEES-UTILISATEUR.md`) | — |
| 1.1 | 03/11/2026 | Formaliser les profils et leurs autorisations | `f7310c1` (`docs/11-DCU-REMONTEES-UTILISATEUR.md`) | — |
| 1.0 | 02/11/2026 | Sous dcu temporaires ; Consolider le cadrage et épurer les diagrammes | `874689d` (`docs/11-DCU-REMONTEES-UTILISATEUR.md`) | — |

### 12-MATRICE-DROITS

Fichier : [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 4.1 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ | en vigueur | — |
| 4.0 | 13/11/2026 | Traitement des remontées réservé au gestionnaire, prise en charge obligatoire ; règles RG-13, 15, 21, 39, 40, 64, 66, 72 mises à jour et RG-87 à RG-91 ajoutées | `d3c3785` (`docs/12-MATRICE-DROITS.md`) | — |
| 3.0 | 13/11/2026 | Formateur : consultation des matériels d’une salle, sans recherche dans le parc | `6d33a1f` (`docs/12-MATRICE-DROITS.md`) | — |
| 2.1 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | `ddc3262` (`docs/12-MATRICE-DROITS.md`) | — |
| 2.0 | 13/11/2026 | Prise en charge « en cours » puis « remplacé » ou « corrigé » par le gestionnaire ; remontées et notifications des administrateurs ; type de problème obligatoire | `38c405d` (`docs/12-MATRICE-DROITS.md`) | — |
| 1.3 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renommer le projet en ORION dans tout le dépôt | `e072d65` (`docs/12-MATRICE-DROITS.md`) | — |
| 1.2 | 09/11/2026 | Synchroniser la matrice et les fiches de profils | `d78a5a7` (`docs/12-MATRICE-DROITS.md`) | — |
| 1.1 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` (`docs/12-MATRICE-DROITS.md`) | — |
| 1.0 | 03/11/2026 | Formaliser les profils et leurs autorisations | `f7310c1` (`docs/12-MATRICE-DROITS.md`) | — |

### 13-FICHE-DESCRIPTIVE-GESTIONNAIRE

Fichier : [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 3.1 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ ; Captures de l’application à la place des anciennes maquettes IHM | en vigueur | — |
| 3.0 | 13/11/2026 | Traitement des remontées réservé au gestionnaire, prise en charge obligatoire ; règles RG-13, 15, 21, 39, 40, 64, 66, 72 mises à jour et RG-87 à RG-91 ajoutées | `d3c3785` (`docs/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md`) | — |
| 2.0 | 13/11/2026 | Prise en charge « en cours » puis « remplacé » ou « corrigé » par le gestionnaire ; remontées et notifications des administrateurs ; type de problème obligatoire | `38c405d` (`docs/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md`) | — |
| 1.4 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` (`docs/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md`) | — |
| 1.3 | 09/11/2026 | Synchroniser la matrice et les fiches de profils | `d78a5a7` (`docs/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md`) | — |
| 1.2 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` (`docs/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md`) | — |
| 1.1 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | `6212b60` (`docs/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md`) | — |
| 1.0 | 03/11/2026 | Formaliser les parcours et interfaces par profil ; Intégrer Keycloak, S3 et les serveurs front et back | `c6eed95` (`docs/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md`) | — |

### 14-FICHE-DESCRIPTIVE-FORMATEUR

Fichier : [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.1 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ | en vigueur | — |
| 2.0 | 13/11/2026 | Prise en charge « en cours » puis « remplacé » ou « corrigé » par le gestionnaire ; remontées et notifications des administrateurs ; type de problème obligatoire | `38c405d` (`docs/14-FICHE-DESCRIPTIVE-FORMATEUR.md`) | — |
| 1.4 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renommer le projet en ORION dans tout le dépôt | `e072d65` (`docs/14-FICHE-DESCRIPTIVE-FORMATEUR.md`) | — |
| 1.3 | 09/11/2026 | Synchroniser la matrice et les fiches de profils | `d78a5a7` (`docs/14-FICHE-DESCRIPTIVE-FORMATEUR.md`) | — |
| 1.2 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` (`docs/14-FICHE-DESCRIPTIVE-FORMATEUR.md`) | — |
| 1.1 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | `6212b60` (`docs/14-FICHE-DESCRIPTIVE-FORMATEUR.md`) | — |
| 1.0 | 03/11/2026 | Formaliser les parcours et interfaces par profil ; Intégrer Keycloak, S3 et les serveurs front et back | `c6eed95` (`docs/14-FICHE-DESCRIPTIVE-FORMATEUR.md`) | — |

### 15-FICHE-DESCRIPTIVE-ADMINISTRATEUR

Fichier : [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 3.1 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ ; Captures de l’application à la place des anciennes maquettes IHM | en vigueur | — |
| 3.0 | 13/11/2026 | Traitement des remontées réservé au gestionnaire, prise en charge obligatoire ; règles RG-13, 15, 21, 39, 40, 64, 66, 72 mises à jour et RG-87 à RG-91 ajoutées | `d3c3785` (`docs/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md`) | — |
| 2.1 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | `ddc3262` (`docs/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md`) | — |
| 2.0 | 13/11/2026 | Prise en charge « en cours » puis « remplacé » ou « corrigé » par le gestionnaire ; remontées et notifications des administrateurs ; type de problème obligatoire | `38c405d` (`docs/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md`) | — |
| 1.4 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renommer le projet en ORION dans tout le dépôt | `e072d65` (`docs/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md`) | — |
| 1.3 | 09/11/2026 | Synchroniser la matrice et les fiches de profils | `d78a5a7` (`docs/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md`) | — |
| 1.2 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` (`docs/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md`) | — |
| 1.1 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | `6212b60` (`docs/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md`) | — |
| 1.0 | 03/11/2026 | Formaliser les parcours et interfaces par profil ; Intégrer Keycloak, S3 et les serveurs front et back | `c6eed95` (`docs/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md`) | — |

### 16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR

Fichier : [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 3.1 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ ; Captures de l’application à la place des anciennes maquettes IHM | en vigueur | — |
| 3.0 | 13/11/2026 | Traitement des remontées réservé au gestionnaire, prise en charge obligatoire ; règles RG-13, 15, 21, 39, 40, 64, 66, 72 mises à jour et RG-87 à RG-91 ajoutées | `d3c3785` (`docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md`) | — |
| 2.1 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | `ddc3262` (`docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md`) | — |
| 2.0 | 13/11/2026 | Prise en charge « en cours » puis « remplacé » ou « corrigé » par le gestionnaire ; remontées et notifications des administrateurs ; type de problème obligatoire | `38c405d` (`docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md`) | — |
| 1.4 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` (`docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md`) | — |
| 1.3 | 09/11/2026 | Synchroniser la matrice et les fiches de profils | `d78a5a7` (`docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md`) | — |
| 1.2 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` (`docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md`) | — |
| 1.1 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | `6212b60` (`docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md`) | — |
| 1.0 | 03/11/2026 | Formaliser les parcours et interfaces par profil ; Intégrer Keycloak, S3 et les serveurs front et back | `c6eed95` (`docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md`) | — |

### DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2

Fichier : [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.2 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ | en vigueur | — |
| 1.1 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` (`docs/temporaire/DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2.md`) | — |
| 1.0 | 06/11/2026 | Ajouter les parcours détaillés en brouillon | `d626315` (`docs/temporaire/DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2.md`) | — |

### DIAGRAMMES-ETATS-BROUILLON-V1

Fichier : [docs/02-ANALYSE/03-ANALYSE/DIAGRAMMES-ETATS-BROUILLON-V1.md](../docs/02-ANALYSE/03-ANALYSE/DIAGRAMMES-ETATS-BROUILLON-V1.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 3.1 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/03-ANALYSE/ | en vigueur | — |
| 3.0 | 13/11/2026 | Traitement des remontées réservé au gestionnaire, prise en charge obligatoire ; règles RG-13, 15, 21, 39, 40, 64, 66, 72 mises à jour et RG-87 à RG-91 ajoutées | `d3c3785` (`docs/temporaire/DIAGRAMMES-ETATS-BROUILLON-V1.md`) | — |
| 2.0 | 13/11/2026 | Aligner sur l’application : état « en cours », traitement direct possible, PDF à la demande, type obligatoire, interventions sur une seule salle | `28bc990` (`docs/temporaire/DIAGRAMMES-ETATS-BROUILLON-V1.md`) | — |
| 1.0 | 09/11/2026 | Ajouter les diagrammes d'états de la remontée et des interventions | `83658a3` (`docs/temporaire/DIAGRAMMES-ETATS-BROUILLON-V1.md`) | — |

### README

Fichier : [docs/02-ANALYSE/04-CONCEPTION/README.md](../docs/02-ANALYSE/04-CONCEPTION/README.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.1 | 14/11/2026 | Nommer la conception de l’agent M42 | en vigueur | — |
| 1.0 | 14/11/2026 | Créer la partie Conception | `69eaf4e` | — |

### 17-DOSSIER-ARCHITECTURE-TECHNIQUE

Fichier : [docs/03-ARCHITECTURE/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md](../docs/03-ARCHITECTURE/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 3.0 | 14/11/2026 | Nommer M42 et préciser les accès RIGEL réels | en vigueur | — |
| 2.1 | 14/11/2026 | Déplacer dans docs/03-ARCHITECTURE/ | `69eaf4e` | — |
| 2.0 | 13/11/2026 | DAT de référence du collègue repris de main (recensement RECON, cible C1NP fiabilisée) ; fichier sans en-tête de version, à ne pas modifier | `0b83eb6` (`docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md`) | — |
| 1.5 | 13/11/2026 | Aligner l’architecture réelle sur la configuration versionnée : création des identités, image Keycloak, flux d’Express, absence de filtrage, secrets et versions | `c563b5a` (`docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md`) | — |
| 1.4 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | `ddc3262` (`docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md`) | — |
| 1.3 | 13/11/2026 | Décrire orion-3 en VM d'administration avec le runner ; Décrire l'entrée unique par adresse IP, sans DNS ; Documenter la cible C1NP et unifier les vues | `83658a3` (`docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md`) | — |
| 1.2 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renseigner les adresses des VM ; Renommer le projet en ORION dans tout le dépôt ; Décrire l'architecture orion sur dix VM ; Retirer les dernières mentions de l'ancien nom ; Mettre à jour les noms des fichiers convertis en TypeScript | `335b44d` (`docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md`) | — |
| 1.1 | 11/11/2026 | Décrire le déploiement du démonstrateur sur huit VM | `3396072` (`docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md`) | — |
| 1.0 | 09/11/2026 | Ajouter le dossier d'architecture technique et ses diagrammes | `51bd591` (`docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md`) | — |

### 18-DIAGRAMMES-ARCHITECTURE

Fichier : [docs/03-ARCHITECTURE/18-DIAGRAMMES-ARCHITECTURE.md](../docs/03-ARCHITECTURE/18-DIAGRAMMES-ARCHITECTURE.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.0 | 14/11/2026 | Intégrer RIGEL et M42 dans les vues d’architecture | en vigueur | — |
| 1.4 | 14/11/2026 | Déplacer dans docs/03-ARCHITECTURE/ | `69eaf4e` | — |
| 1.3 | 13/11/2026 | Documenter la cible C1NP et unifier les vues | `83658a3` (`docs/18-DIAGRAMMES-ARCHITECTURE.md`) | — |
| 1.2 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renseigner les adresses des VM ; Renommer le projet en ORION dans tout le dépôt ; Décrire l'architecture orion sur dix VM | `3e437e0` (`docs/18-DIAGRAMMES-ARCHITECTURE.md`) | — |
| 1.1 | 11/11/2026 | Décrire le déploiement du démonstrateur sur huit VM | `3396072` (`docs/18-DIAGRAMMES-ARCHITECTURE.md`) | — |
| 1.0 | 09/11/2026 | Ajouter le dossier d'architecture technique et ses diagrammes | `51bd591` (`docs/18-DIAGRAMMES-ARCHITECTURE.md`) | — |

### 19-BACKLOG-ET-SUIVI-PROJET

Fichier : [docs/04-ORGANISATION/19-BACKLOG-ET-SUIVI-PROJET.docx](../docs/04-ORGANISATION/19-BACKLOG-ET-SUIVI-PROJET.docx) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.2 | 14/11/2026 | Déplacer dans docs/04-ORGANISATION/ | en vigueur | — |
| 1.1 | 13/11/2026 | Remplacer l’ancien nom par ORION et corriger le lien du commit de la cible C1NP | `61abf4a` (`docs/19-BACKLOG-ET-SUIVI-PROJET.docx`) | — |
| 1.0 | 13/11/2026 | Consolider le suivi des progressions ; Structurer le suivi Agile et les cérémonies ; Styliser les graphiques en SVG dans Word | `b2a5a17` (`docs/19-BACKLOG-ET-SUIVI-PROJET.docx`) | — |

### 19-BACKLOG-ET-SUIVI-PROJET

Fichier : [docs/04-ORGANISATION/19-BACKLOG-ET-SUIVI-PROJET.md](../docs/04-ORGANISATION/19-BACKLOG-ET-SUIVI-PROJET.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 3.0 | 14/11/2026 | Déplacer dans docs/04-ORGANISATION/ ; Rendu de l’application le 17 novembre, supports le 18, présentation le 19 ; graphiques régénérés | en vigueur | — |
| 2.0 | 14/11/2026 | Deux sprints (19/10–08/11, 09/11–19/11), suivi dans le projet GitHub ORION et graphiques produits depuis GitHub | `ab5fb7d` (`docs/19-BACKLOG-ET-SUIVI-PROJET.md`) | — |
| 1.1 | 13/11/2026 | Remplacer l’ancien nom par ORION et corriger le lien du commit de la cible C1NP | `61abf4a` (`docs/19-BACKLOG-ET-SUIVI-PROJET.md`) | — |
| 1.0 | 13/11/2026 | Consolider le suivi des progressions ; Structurer le suivi Agile et les cérémonies ; Styliser les graphiques en SVG dans Word | `83658a3` (`docs/19-BACKLOG-ET-SUIVI-PROJET.md`) | — |

### 19-SUIVI-BACKLOG-BROUILLON-V1

Fichier : [docs/04-ORGANISATION/19-SUIVI-BACKLOG-BROUILLON-V1.md](../docs/04-ORGANISATION/19-SUIVI-BACKLOG-BROUILLON-V1.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.2 | 14/11/2026 | Déplacer dans docs/04-ORGANISATION/ | en vigueur | — |
| 1.1 | 13/11/2026 | Remplacer l’ancien nom par ORION et corriger le commit de la cible C1NP | `61abf4a` (`docs/temporaire/19-SUIVI-BACKLOG-BROUILLON-V1.md`) | — |
| 1.0 | 13/11/2026 | Consolider le suivi des progressions | `83658a3` (`docs/temporaire/19-SUIVI-BACKLOG-BROUILLON-V1.md`) | — |

### 20-BACKLOG-TECHNIQUE-ET-FEUILLE-DE-ROUTE

Fichier : [docs/04-ORGANISATION/20-BACKLOG-TECHNIQUE-ET-FEUILLE-DE-ROUTE.md](../docs/04-ORGANISATION/20-BACKLOG-TECHNIQUE-ET-FEUILLE-DE-ROUTE.md) · Pilotage interne

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 4.2 | 14/11/2026 | Renommer RIGEL et planifier M42 | en vigueur | — |
| 4.1 | 14/11/2026 | Déplacer dans docs/04-ORGANISATION/ ; Échéances du rendu (17/11) et de la présentation (19/11) ; backlog GitHub et captures des fiches faits | `69eaf4e` | — |
| 4.0 | 13/11/2026 | Officialiser le reste à faire en backlog technique et feuille de route ; option Linux reportée en évolution du projet | `f23bbce` (`docs/20-BACKLOG-TECHNIQUE-ET-FEUILLE-DE-ROUTE.md`) | — |
| 3.2 | 13/11/2026 | Agent ORION simulé, paquets, images et système Windows ou Linux des salles | `47116b1` (`docs/temporaire/RESTE-A-FAIRE-BROUILLON-V1.md`) | — |
| 3.1 | 13/11/2026 | Retrait au lieu de suppression, proposition de RG-91 | `8d426fd` (`docs/temporaire/RESTE-A-FAIRE-BROUILLON-V1.md`) | — |
| 3.0 | 13/11/2026 | Restructurer par échéance et domaine ; intégrer l’audit de cohérence avec le DAT validé, le backlog GitHub, le scénario complet, les tests de sécurité, l’observatoire des parcours et les comptes réels de présentation | `95e38d4` (`docs/temporaire/RESTE-A-FAIRE-BROUILLON-V1.md`) | — |
| 2.4 | 13/11/2026 | Données de départ 17, import hors service et RECON à suivre | `1c5abdf` (`docs/temporaire/RESTE-A-FAIRE-BROUILLON-V1.md`) | — |
| 2.3 | 13/11/2026 | Règles de gestion mises à jour | `d3c3785` (`docs/temporaire/RESTE-A-FAIRE-BROUILLON-V1.md`) | — |
| 2.2 | 13/11/2026 | MCD refait ; MAC et RG-40 à suivre | `19f0488` (`docs/temporaire/RESTE-A-FAIRE-BROUILLON-V1.md`) | — |
| 2.1 | 13/11/2026 | Diagrammes 06 et 07 à reprendre avec les collègues | `6d33a1f` (`docs/temporaire/RESTE-A-FAIRE-BROUILLON-V1.md`) | — |
| 2.0 | 13/11/2026 | Ajouter DCU à compléter, modèle de données, points documentaires oubliés et plan d’organisation du code | `6768d09` (`docs/temporaire/RESTE-A-FAIRE-BROUILLON-V1.md`) | — |
| 1.0 | 13/11/2026 | Recenser ce qui reste à faire après le contrôle du 13 novembre ; Ajouter des jetons d'accès pour la présentation au client ; Décrire l'entrée unique par adresse IP, sans DNS | `83658a3` (`docs/temporaire/RESTE-A-FAIRE-BROUILLON-V1.md`) | — |

## Fichiers retirés

### design-charte-graphique-vigie-index

Ancien emplacement : `design/charte-graphique-vigie/index.html`. Retiré le 13/11/2026 : Direction artistique VIGIE non retenue ; identité ORION conforme à l'application

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.1 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `0078180` | [archive](design/chartes/charte-graphique-vigie-v1.1-2026-11-12.html) |
| 1.0 | 06/11/2026 | Proposer l'identité VIGIE | `9177f93` | [archive](design/chartes/charte-graphique-vigie-v1.0-2026-11-06.html) |

### design-charte-graphique-charte-graphique-orion

Ancien emplacement : `design/charte-graphique/charte-graphique-orion.html`. Retiré le 13/11/2026 : Direction florale ORION remplacée par la charte 2.0 conforme à l'application

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.0 | 09/11/2026 | Ajouter la maquette et la charte graphique ORION | `a6cf32e` | [archive](design/chartes/charte-graphique-orion-v1.0-2026-11-09.html) |

### design-maquettes-gestion-materiels

Ancien emplacement : `design/maquettes/gestion-materiels.html`. Retiré le 13/11/2026 : Maquette remplacée par les captures de l'application (design/maquettes/index.html)

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.2 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `0078180` | [archive](design/maquettes/gestion-materiels-v1.2-2026-11-12.html) |
| 1.1 | 06/11/2026 | Adapter les écrans et captures à la cible | `4a3e92b` | [archive](design/maquettes/gestion-materiels-v1.1-2026-11-06.html) |
| 1.0 | 03/11/2026 | Organiser les livrables et intégrer la maquette | `03728b6` | [archive](design/maquettes/gestion-materiels-v1.0-2026-11-03.html) |

### design-maquettes-maquette-dashboard-orion

Ancien emplacement : `design/maquettes/maquette-dashboard-orion.html`. Retiré le 13/11/2026 : Maquette remplacée par les captures de l'application (design/maquettes/index.html)

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.0 | 09/11/2026 | Ajouter la maquette et la charte graphique ORION | `a6cf32e` | [archive](design/maquettes/maquette-dashboard-orion-v1.0-2026-11-09.html) |

### design-maquettes-maquette-dashboard-proposition-a-cockpit

Ancien emplacement : `design/maquettes/maquette-dashboard-proposition-a-cockpit.html`. Retiré le 13/11/2026 : Proposition de tableau de bord remplacée par les captures de l'application

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.1 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `0078180` | [archive](design/maquettes/maquette-dashboard-proposition-a-cockpit-v1.1-2026-11-12.html) |
| 1.0 | 10/11/2026 | Proposer trois maquettes du tableau de bord | `284cbc0` | [archive](design/maquettes/maquette-dashboard-proposition-a-cockpit-v1.0-2026-11-10.html) |

### design-maquettes-maquette-dashboard-proposition-b-a-traiter

Ancien emplacement : `design/maquettes/maquette-dashboard-proposition-b-a-traiter.html`. Retiré le 13/11/2026 : Proposition de tableau de bord remplacée par les captures de l'application

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.1 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `0078180` | [archive](design/maquettes/maquette-dashboard-proposition-b-a-traiter-v1.1-2026-11-12.html) |
| 1.0 | 10/11/2026 | Proposer trois maquettes du tableau de bord | `284cbc0` | [archive](design/maquettes/maquette-dashboard-proposition-b-a-traiter-v1.0-2026-11-10.html) |

### design-maquettes-maquette-dashboard-proposition-c-analyse

Ancien emplacement : `design/maquettes/maquette-dashboard-proposition-c-analyse.html`. Retiré le 13/11/2026 : Proposition de tableau de bord remplacée par les captures de l'application

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.1 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `0078180` | [archive](design/maquettes/maquette-dashboard-proposition-c-analyse-v1.1-2026-11-12.html) |
| 1.0 | 10/11/2026 | Proposer trois maquettes du tableau de bord | `284cbc0` | [archive](design/maquettes/maquette-dashboard-proposition-c-analyse-v1.0-2026-11-10.html) |

### 05-MCD-MERISE-MOCODO

Ancien emplacement : `docs/05-MCD-MERISE-MOCODO.url`. Retiré le 13/11/2026 : Remplacé par la source draw.io

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.3 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `0078180` | — |
| 1.2 | 09/11/2026 | Consolider le modèle et les règles métier | `a8fc937` | — |
| 1.1 | 03/11/2026 | Harmoniser le compte Windows dans le modèle ; Formaliser les profils et leurs autorisations | `f7310c1` | — |
| 1.0 | 02/11/2026 | Mcd ; Maj mcd | `e0cf540` | — |
