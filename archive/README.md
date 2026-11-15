# Archives de la documentation ORION

Compte rendu des évolutions de chaque fichier suivi : version, date et modification. La version en vigueur est le fichier lui-même ; chaque version remplacée est retrouvée dans l’historique Git par son commit (`git show <commit>:<chemin>`). Seules les versions de `design/`, qui font partie de la capture du besoin, sont copiées, dans [design/](design/index.html) : chartes, maquettes et présentation du dossier, avec leurs logos et icônes d’époque. Ce document et les en-têtes de version sont générés à partir de [registre.json](registre.json) par [versions.py](../.agents/skills/orion-documentation/scripts/versions.py) ; ne pas les modifier à la main.

Numérotation : version majeure pour un changement de sens (décision, règle, périmètre, structure), version mineure pour une correction ou une précision. L’historique antérieur au 13 novembre 2026 est reconstitué depuis Git, à raison d’une version par jour de modification.

## Vue d’ensemble

| Fichier | Destination | Version | Mise à jour |
| --- | --- | --- | --- |
| [design/README.md](../design/README.md) | Ressource de préparation | [2.5](#design-readme) | 14/11/2026 |
| [design/charte-graphique/index.html](../design/charte-graphique/index.html) | Ressource de préparation | [2.2](#design-charte-graphique-index) | 14/11/2026 |
| [design/maquettes/index.html](../design/maquettes/index.html) | Ressource de préparation | [3.0](#design-maquettes-index) | 15/11/2026 |
| [docs/01-CONTEXTE/00-GLOSSAIRE.md](../docs/01-CONTEXTE/00-GLOSSAIRE.md) | Production destinée à la remise | [5.3](#00-glossaire) | 15/11/2026 |
| [docs/01-CONTEXTE/01-CONSIGNES.md](../docs/01-CONTEXTE/01-CONSIGNES.md) | Source fournie par l’encadrement | [1.4](#01-consignes) | 14/11/2026 |
| [docs/01-CONTEXTE/02-CADRAGE.md](../docs/01-CONTEXTE/02-CADRAGE.md) | Source de travail interne | [6.6](#02-cadrage) | 15/11/2026 |
| [docs/01-CONTEXTE/03-COMPTE-RENDU-ENTRETIENS.md](../docs/01-CONTEXTE/03-COMPTE-RENDU-ENTRETIENS.md) | Source de travail interne | [2.1](#03-compte-rendu-entretiens) | 14/11/2026 |
| [docs/02-ANALYSE/01-MODELISATION-METIER/06-DIAGRAMME-CONTEXTE.md](../docs/02-ANALYSE/01-MODELISATION-METIER/06-DIAGRAMME-CONTEXTE.md) | Production destinée à la remise | [4.0](#06-diagramme-contexte) | 15/11/2026 |
| [docs/02-ANALYSE/01-MODELISATION-METIER/07-DIAGRAMMES-ACTIVITE.md](../docs/02-ANALYSE/01-MODELISATION-METIER/07-DIAGRAMMES-ACTIVITE.md) | Production destinée à la remise | [2.2](#07-diagrammes-activite) | 15/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/04-REGLES-DE-GESTION.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/04-REGLES-DE-GESTION.md) | Production destinée à la remise | [11.0](#04-regles-de-gestion) | 15/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/05-MCD-MERISE.drawio](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/05-MCD-MERISE.drawio) | Production destinée à la remise | [3.0](#05-mcd-merise) | 15/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/05-MCD-MERISE.svg](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/05-MCD-MERISE.svg) | Production destinée à la remise | [4.0](#05-mcd-merise) | 15/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/08-DCU-GESTION-PARC.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/08-DCU-GESTION-PARC.md) | Production destinée à la remise | [1.5](#08-dcu-gestion-parc) | 14/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/09-DCU-ADMINISTRATION-POSTES.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/09-DCU-ADMINISTRATION-POSTES.md) | Production destinée à la remise | [3.0](#09-dcu-administration-postes) | 15/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/10-DCU-SUPERVISION-POSTES.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/10-DCU-SUPERVISION-POSTES.md) | Production destinée à la remise | [2.0](#10-dcu-supervision-postes) | 15/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/11-DCU-REMONTEES-UTILISATEUR.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/11-DCU-REMONTEES-UTILISATEUR.md) | Production destinée à la remise | [3.1](#11-dcu-remontees-utilisateur) | 14/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md) | Production destinée à la remise | [8.0](#12-matrice-droits) | 15/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md) | Production destinée à la remise | [4.3](#13-fiche-descriptive-gestionnaire) | 14/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md) | Production destinée à la remise | [3.2](#14-fiche-descriptive-formateur) | 15/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md) | Production destinée à la remise | [4.4](#15-fiche-descriptive-administrateur) | 15/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md) | Production destinée à la remise | [4.2](#16-fiche-descriptive-super-administrateur) | 14/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/22-DCU-ADMINISTRER-ORION.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/22-DCU-ADMINISTRER-ORION.md) | Production destinée à la remise | [2.0](#22-dcu-administrer-orion) | 15/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/23-DIAGRAMMES-ACTIVITE-CAS-UTILISATION.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/23-DIAGRAMMES-ACTIVITE-CAS-UTILISATION.md) | Production destinée à la remise | [1.0](#23-diagrammes-activite-cas-utilisation) | 15/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/24-DIAGRAMME-CLASSES-METIER.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/24-DIAGRAMME-CLASSES-METIER.md) | Production destinée à la remise | [2.0](#24-diagramme-classes-metier) | 15/11/2026 |
| [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/25-DIAGRAMMES-SEQUENCE-SYSTEME.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/25-DIAGRAMMES-SEQUENCE-SYSTEME.md) | Production destinée à la remise | [1.0](#25-diagrammes-sequence-systeme) | 15/11/2026 |
| [docs/02-ANALYSE/03-ANALYSE/17-DIAGRAMMES-ETATS.md](../docs/02-ANALYSE/03-ANALYSE/17-DIAGRAMMES-ETATS.md) | Production destinée à la remise | [4.2](#17-diagrammes-etats) | 15/11/2026 |
| [docs/02-ANALYSE/03-ANALYSE/26-DIAGRAMME-CLASSES-ANALYSE.md](../docs/02-ANALYSE/03-ANALYSE/26-DIAGRAMME-CLASSES-ANALYSE.md) | Production destinée à la remise | [2.0](#26-diagramme-classes-analyse) | 15/11/2026 |
| [docs/02-ANALYSE/04-CONCEPTION/27-DIAGRAMME-CLASSES-CONCEPTION.md](../docs/02-ANALYSE/04-CONCEPTION/27-DIAGRAMME-CLASSES-CONCEPTION.md) | Production destinée à la remise | [2.1](#27-diagramme-classes-conception) | 15/11/2026 |
| [docs/02-ANALYSE/04-CONCEPTION/28-DIAGRAMMES-SEQUENCE-DETAILLES.md](../docs/02-ANALYSE/04-CONCEPTION/28-DIAGRAMMES-SEQUENCE-DETAILLES.md) | Production destinée à la remise | [2.1](#28-diagrammes-sequence-detailles) | 15/11/2026 |
| [docs/02-ANALYSE/04-CONCEPTION/29-MODELE-PHYSIQUE-DONNEES.md](../docs/02-ANALYSE/04-CONCEPTION/29-MODELE-PHYSIQUE-DONNEES.md) | Production destinée à la remise | [3.0](#29-modele-physique-donnees) | 15/11/2026 |
| [docs/03-ARCHITECTURE/18-DOSSIER-ARCHITECTURE-TECHNIQUE.md](../docs/03-ARCHITECTURE/18-DOSSIER-ARCHITECTURE-TECHNIQUE.md) | Production destinée à la remise | [5.1](#18-dossier-architecture-technique) | 15/11/2026 |
| [docs/03-ARCHITECTURE/19-DIAGRAMMES-ARCHITECTURE.md](../docs/03-ARCHITECTURE/19-DIAGRAMMES-ARCHITECTURE.md) | Production destinée à la remise | [2.3](#19-diagrammes-architecture) | 15/11/2026 |
| [docs/04-ORGANISATION/20-BACKLOG-ET-SUIVI-PROJET.md](../docs/04-ORGANISATION/20-BACKLOG-ET-SUIVI-PROJET.md) | Production destinée à la remise | [5.0](#20-backlog-et-suivi-projet) | 15/11/2026 |
| [docs/04-ORGANISATION/21-BACKLOG-TECHNIQUE-ET-FEUILLE-DE-ROUTE.md](../docs/04-ORGANISATION/21-BACKLOG-TECHNIQUE-ET-FEUILLE-DE-ROUTE.md) | Pilotage interne | [7.0](#21-backlog-technique-et-feuille-de-route) | 15/11/2026 |
| [docs/04-ORGANISATION/30-POINTS-DAILY-SCRUM-16-NOVEMBRE.md](../docs/04-ORGANISATION/30-POINTS-DAILY-SCRUM-16-NOVEMBRE.md) | Pilotage interne | [3.0](#30-points-daily-scrum-16-novembre) | 15/11/2026 |
| [docs/04-ORGANISATION/31-AUDIT-AVANT-RENDU-16-NOVEMBRE.md](../docs/04-ORGANISATION/31-AUDIT-AVANT-RENDU-16-NOVEMBRE.md) | Pilotage interne | [2.0](#31-audit-avant-rendu-16-novembre) | 15/11/2026 |

## Fichiers en vigueur

### design-README

Fichier : [design/README.md](../design/README.md) · Ressource de préparation

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.5 | 14/11/2026 | Lien vers les ressources archivées du design ; 48 écrans, dont RIGEL | en vigueur | — |
| 2.4 | 14/11/2026 | Chemins de l'interface renommés (espace) | `fa8e2ad` | [archive](design/readme/README-v2.4-2026-11-14.md) |
| 2.3 | 14/11/2026 | Documenter la commande de régénération des captures | `ad9efd5` | [archive](design/readme/README-v2.3-2026-11-14.md) |
| 2.2 | 13/11/2026 | Icônes métier en Bleu Orion, captures compressées | `e0421f0` | [archive](design/readme/README-v2.2-2026-11-13.md) |
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
| 2.2 | 14/11/2026 | Chemins de l'interface renommés (espace) | en vigueur | — |
| 2.1 | 13/11/2026 | Centrer ORION sur sa signature, logos à l’étoile | `bf823e8` | [archive](design/chartes/charte-graphique-v2.1-2026-11-13.html) |
| 2.0 | 13/11/2026 | Refondre la charte sur l'application : étoile ORION, palette, ambiances Orion et Minarm, composants | `e594af2` | [archive](design/chartes/charte-graphique-v2.0-2026-11-13.html) |
| 1.2 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `0078180` | [archive](design/chartes/charte-graphique-v1.2-2026-11-12.html) |
| 1.1 | 03/11/2026 | Organiser les livrables et intégrer la maquette | `03728b6` | [archive](design/chartes/charte-graphique-v1.1-2026-11-03.html) |
| 1.0 | 21/10/2026 | Apercu + loader | `a4ba64a` (`da/apercu.html`) | [archive](design/chartes/charte-graphique-v1.0-2026-10-21.html) |

### design-maquettes-index

Fichier : [design/maquettes/index.html](../design/maquettes/index.html) · Ressource de préparation

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 3.0 | 15/11/2026 | Section RIGEL (application mobile) et bilan d’un recensement | en vigueur | — |
| 2.0 | 13/11/2026 | Ajouter les maquettes simplifiées à côté des captures | `bf823e8` | [archive](design/maquettes/maquettes-v2.0-2026-11-13.html) |
| 1.0 | 13/11/2026 | Présenter les écrans de l'application par module et par profil | `e594af2` | [archive](design/maquettes/maquettes-v1.0-2026-11-13.html) |

### 00-GLOSSAIRE

Fichier : [docs/01-CONTEXTE/00-GLOSSAIRE.md](../docs/01-CONTEXTE/00-GLOSSAIRE.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 5.3 | 15/11/2026 | Termes ajoutés : intervention, compte ORION, étape de remontée, type de problème, C1NP, CCT ; API précisée | en vigueur | — |
| 5.2 | 15/11/2026 | Identifiant Id_compte_Windows | `1237188` | — |
| 5.1 | 15/11/2026 | Acteur de supervision aligné sur RG-55 | `0f1761c` | — |
| 5.0 | 15/11/2026 | RIGEL défini selon l’architecture cible | `04c54ca` | — |
| 4.0 | 15/11/2026 | Déplacement, opération et paquet ; recensement et installation, types d’opération | `26885dc` | — |
| 3.5 | 14/11/2026 | RIGEL : installation et recensement consolidés, notion de campagne retirée ; Termes whitelist et blacklist | `70bd202` | — |
| 3.4 | 14/11/2026 | Système d’exploitation ; recensement, installation, écart et constat | `186f904` | — |
| 3.3 | 14/11/2026 | RIGEL : accepter sur place ou ramener (RG-96) | `07a0096` | — |
| 3.2 | 14/11/2026 | Recensement lancé depuis ORION par le gestionnaire, téléphone lié à l’opération | `6219944` | — |
| 3.1 | 14/11/2026 | RIGEL : installation d’une salle, recensement, appairage et traitement des écarts (RG-92 à RG-95) | `1162c04` | — |
| 3.0 | 14/11/2026 | Définir RIGEL et M42 | `21c57cf` | — |
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
| 6.6 | 15/11/2026 | Limitation de débit en place | en vigueur | — |
| 6.5 | 15/11/2026 | Version publique de /api/infos, attendue sur le C1NP | `3017d43` | — |
| 6.4 | 15/11/2026 | Réponses de l’application reportées aux questions déjà résolues ; prochain rendez-vous à fixer | `4268db6` | — |
| 6.3 | 15/11/2026 | Journal applicatif reporté aux §§ 18 et 21 | `60a0e11` | — |
| 6.2 | 15/11/2026 | Décisions du 13 novembre reportées : identifiants, adresse MAC, dates du compte | `1237188` | — |
| 6.1 | 15/11/2026 | Réponses de l’application sur l’alerte de processus blacklisté, la portée bâtiment et les listes | `0f1761c` | — |
| 6.0 | 15/11/2026 | RIGEL reporté aux §§ 19 et 23 ; simulateur et éléments en place | `04c54ca` | — |
| 5.3 | 15/11/2026 | Création du premier compte d’un espace neuf, d’après l’application | `24f0e4e` | — |
| 5.2 | 15/11/2026 | Consigne l’autorisation du stockage NFSv4 pour la cible ; Consigne le stockage NFSv4 et RIGEL sans relais dans la cible | `e6b9ffd` | — |
| 5.1 | 14/11/2026 | Notifications et tableau de bord du parc selon RG-36 et RG-37 | `2ce55f7` | — |
| 5.0 | 14/11/2026 | Nommer M42 comme option d’agent ASTER | `e99107c` | — |
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
| 4.0 | 15/11/2026 | RIGEL présenté selon l’architecture cible, sans relais | en vigueur | — |
| 3.0 | 14/11/2026 | Mise à jour d’après l’état actuel : super administrateur, MindefConnect, RIGEL, solution d’administration des postes, PDF à la demande, traitement par le gestionnaire | `6a42b9f` | — |
| 2.0 | 14/11/2026 | Nommer M42 comme agent candidat | `21c57cf` | — |
| 1.3 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/01-MODELISATION-METIER/ | `69eaf4e` | — |
| 1.2 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | `ddc3262` (`docs/06-DIAGRAMME-CONTEXTE.md`) | — |
| 1.1 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` (`docs/06-DIAGRAMME-CONTEXTE.md`) | — |
| 1.0 | 02/11/2026 | Mcd ; Consolider le cadrage et épurer les diagrammes | `874689d` (`docs/06-DIAGRAMME-CONTEXTE.md`) | — |

### 07-DIAGRAMMES-ACTIVITE

Fichier : [docs/02-ANALYSE/01-MODELISATION-METIER/07-DIAGRAMMES-ACTIVITE.md](../docs/02-ANALYSE/01-MODELISATION-METIER/07-DIAGRAMMES-ACTIVITE.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.2 | 15/11/2026 | Constats RIGEL transmis directement à ORION | en vigueur | — |
| 2.1 | 15/11/2026 | Termes whitelist et blacklist | `70bd202` | — |
| 2.0 | 14/11/2026 | Mise à jour d’après l’état actuel : super administrateur, MindefConnect, RIGEL, solution d’administration des postes, PDF à la demande, traitement par le gestionnaire | `6a42b9f` | — |
| 1.5 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/01-MODELISATION-METIER/ | `69eaf4e` | — |
| 1.4 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | `ddc3262` (`docs/07-DIAGRAMMES-ACTIVITE.md`) | — |
| 1.3 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` (`docs/07-DIAGRAMMES-ACTIVITE.md`) | — |
| 1.2 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | `6212b60` (`docs/07-DIAGRAMMES-ACTIVITE.md`) | — |
| 1.1 | 02/11/2026 | Consolider le cadrage et les modèles ; Mcd ; Consolider le cadrage et épurer les diagrammes | `874689d` (`docs/07-DIAGRAMMES-ACTIVITE.md`) | — |
| 1.0 | 24/10/2026 | Aligner le cadrage, les diagrammes et les consignes Git | `12080db` (`docs/06-DIAGRAMMES-ACTIVITE.md`) | — |

### 04-REGLES-DE-GESTION

Fichier : [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/04-REGLES-DE-GESTION.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/04-REGLES-DE-GESTION.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 11.0 | 15/11/2026 | RG-79 : la remontée reste rattachée à l’école de sa création | en vigueur | — |
| 10.0 | 15/11/2026 | RG-44 cite l’adresse IP du poste ; RG-43 renomme Id_compte_Windows | `1237188` | — |
| 9.0 | 15/11/2026 | RG-22 et RG-81 sur une seule salle ; étage obligatoire (RG-61) | `0f1761c` | — |
| 8.0 | 15/11/2026 | RG-77 réduite à la vue et à la réinitialisation des postes ; RG-97 à RG-100 | `70bd202` | — |
| 7.0 | 14/11/2026 | RG-36 et RG-37 alignées sur l’application, RG-39 étendue au super administrateur | `2ce55f7` | — |
| 6.1 | 14/11/2026 | RIGEL : installation et recensement consolidés, notion de campagne retirée ; RG-21 : le formateur ne signale que des matériels d’une salle | `bf1cfba` | — |
| 6.0 | 14/11/2026 | RG-92 à RG-96 simplifiées : installation distincte du recensement, téléphone lié, code inconnu ajouté, matériel mal placé | `186f904` | — |
| 5.0 | 14/11/2026 | RG-96 : lieu ouvert dans RIGEL ; matériel trouvé ailleurs accepté sur place ou ramené ; RG-93 et RG-95 ajustées | `07a0096` | — |
| 4.0 | 14/11/2026 | Installation confirmée par le gestionnaire seul (clic ou RIGEL) ; super administrateur : autres super administrateurs et école d’un administrateur ; un administrateur par école ; Recensement lancé depuis ORION par le gestionnaire, téléphone lié à l’opération | `6219944` | — |
| 3.0 | 14/11/2026 | RIGEL : installation d’une salle, recensement, appairage et traitement des écarts (RG-92 à RG-95) | `1162c04` | — |
| 2.1 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ | `69eaf4e` | — |
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
| 3.0 | 15/11/2026 | Déplacement, opération, système d’exploitation et paquet ; listes de valeurs en attributs ; contraintes d’exclusion | en vigueur | — |
| 2.0 | 14/11/2026 | Système d’exploitation du poste, remontée liée à l’école, recensement et constat | `7aa82ae` | — |
| 1.2 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ | `69eaf4e` | — |
| 1.1 | 13/11/2026 | COMPTE_ORION et DÉMÉNAGER, identifiants des comptes distincts | `9c23199` (`docs/05-MCD-MERISE.drawio`) | — |
| 1.0 | 13/11/2026 | Source draw.io du MCD | `19f0488` (`docs/05-MCD-MERISE.drawio`) | — |

### 05-MCD-MERISE

Fichier : [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/05-MCD-MERISE.svg](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/05-MCD-MERISE.svg) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 4.0 | 15/11/2026 | Déplacement, opération, système d’exploitation et paquet ; listes de valeurs en attributs ; contraintes d’exclusion | en vigueur | — |
| 3.0 | 14/11/2026 | Système d’exploitation du poste, remontée liée à l’école, recensement et constat | `7aa82ae` | — |
| 2.2 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ | `69eaf4e` | — |
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
| 1.5 | 14/11/2026 | RIGEL : installation et recensement consolidés, notion de campagne retirée ; DCU complété d’après l’application | en vigueur | — |
| 1.4 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ | `186f904` | — |
| 1.3 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` (`docs/08-DCU-GESTION-PARC.md`) | — |
| 1.2 | 09/11/2026 | Harmoniser les diagrammes de cas d'utilisation | `af0e24e` (`docs/08-DCU-GESTION-PARC.md`) | — |
| 1.1 | 03/11/2026 | Formaliser les profils et leurs autorisations | `f7310c1` (`docs/08-DCU-GESTION-PARC.md`) | — |
| 1.0 | 02/11/2026 | Sous dcu temporaires ; Consolider le cadrage et épurer les diagrammes | `874689d` (`docs/08-DCU-GESTION-PARC.md`) | — |

### 09-DCU-ADMINISTRATION-POSTES

Fichier : [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/09-DCU-ADMINISTRATION-POSTES.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/09-DCU-ADMINISTRATION-POSTES.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 3.0 | 15/11/2026 | Vue des postes ; catalogue des applications en V2 | en vigueur | — |
| 2.0 | 15/11/2026 | DCU complété d’après l’application | `36f4195` | — |
| 1.6 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ | `69eaf4e` | — |
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
| 2.0 | 15/11/2026 | DCU complété d’après l’application | en vigueur | — |
| 1.5 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ | `69eaf4e` | — |
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
| 8.0 | 15/11/2026 | Alerte de processus blacklisté non notifiée au formateur ; import renvoyé à RG-29 | en vigueur | — |
| 7.0 | 15/11/2026 | Section import JSON et RIGEL ; espace personnel ; vue des postes | `70bd202` | — |
| 6.5 | 14/11/2026 | Notifications et tableau de bord du parc selon RG-36 et RG-37 | `2ce55f7` | — |
| 6.4 | 14/11/2026 | Formateur : remontées sur les matériels d’une salle seulement | `2f50ac0` | — |
| 6.3 | 14/11/2026 | RIGEL : installation et recensement consolidés, notion de campagne retirée | `fa8e2ad` | — |
| 6.2 | 14/11/2026 | Recensement, installation et anciens constats | `186f904` | — |
| 6.1 | 14/11/2026 | RIGEL : accepter sur place ou ramener (RG-96) | `07a0096` | — |
| 6.0 | 14/11/2026 | Installation confirmée par le gestionnaire seul (clic ou RIGEL) ; super administrateur : autres super administrateurs et école d’un administrateur ; un administrateur par école ; Recensement lancé depuis ORION par le gestionnaire, téléphone lié à l’opération | `6219944` | — |
| 5.0 | 14/11/2026 | RIGEL : installation d’une salle, recensement, appairage et traitement des écarts (RG-92 à RG-95) | `1162c04` | — |
| 4.2 | 14/11/2026 | Recherche du formateur limitée aux matériels de salle, menant à la salle (#118) | `009cfd5` | — |
| 4.1 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ | `69eaf4e` | — |
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
| 4.3 | 14/11/2026 | RIGEL : installation et recensement consolidés, notion de campagne retirée ; Notifications et tableau de bord du parc selon RG-36 et RG-37 ; Toutes les actions du gestionnaire : import JSON, RIGEL détaillé, activité ; écrans RIGEL | en vigueur | — |
| 4.2 | 14/11/2026 | RIGEL : accepter sur place ou ramener (RG-96) | `186f904` | — |
| 4.1 | 14/11/2026 | Installation confirmée par le gestionnaire seul (clic ou RIGEL) ; super administrateur : autres super administrateurs et école d’un administrateur ; un administrateur par école ; Recensement lancé depuis ORION par le gestionnaire, téléphone lié à l’opération | `6219944` | — |
| 4.0 | 14/11/2026 | Refaire d’après l’application : parcours écran par écran, RIGEL, noms actuels, captures de l’application | `5383a9f` | — |
| 3.1 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ ; Captures de l’application à la place des anciennes maquettes IHM | `69eaf4e` | — |
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
| 3.2 | 15/11/2026 | Termes whitelist et blacklist | en vigueur | — |
| 3.1 | 14/11/2026 | Formateur : remontées sur les matériels d’une salle seulement ; Notifications et tableau de bord du parc selon RG-36 et RG-37 ; Actions complétées : recherche, préférences, déconnexion, tableaux, détails des écrans | `2ce55f7` | — |
| 3.0 | 14/11/2026 | Refaire d’après l’application : parcours écran par écran, RIGEL, noms actuels, captures de l’application | `fa8e2ad` | — |
| 2.1 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ | `69eaf4e` | — |
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
| 4.4 | 15/11/2026 | Question ouverte sur le journal applicatif précisée | en vigueur | — |
| 4.3 | 15/11/2026 | Termes whitelist et blacklist ; catalogue, M42 et Linux en V2 | `70bd202` | — |
| 4.2 | 14/11/2026 | RIGEL : installation et recensement consolidés, notion de campagne retirée ; Notifications et tableau de bord du parc selon RG-36 et RG-37 ; Actions complétées : recherche, préférences, déconnexion, tableaux, détails des écrans | `2ce55f7` | — |
| 4.1 | 14/11/2026 | Installation confirmée par le gestionnaire seul (clic ou RIGEL) ; super administrateur : autres super administrateurs et école d’un administrateur ; un administrateur par école | `186f904` | — |
| 4.0 | 14/11/2026 | Refaire d’après l’application : parcours écran par écran, RIGEL, noms actuels, captures de l’application | `5383a9f` | — |
| 3.1 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ ; Captures de l’application à la place des anciennes maquettes IHM | `69eaf4e` | — |
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
| 4.2 | 14/11/2026 | RIGEL : installation et recensement consolidés, notion de campagne retirée ; Actions complétées : recherche, préférences, déconnexion, tableaux, détails des écrans | en vigueur | — |
| 4.1 | 14/11/2026 | Installation confirmée par le gestionnaire seul (clic ou RIGEL) ; super administrateur : autres super administrateurs et école d’un administrateur ; un administrateur par école | `186f904` | — |
| 4.0 | 14/11/2026 | Refaire d’après l’application : parcours écran par écran, RIGEL, noms actuels, captures de l’application | `5383a9f` | — |
| 3.1 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ ; Captures de l’application à la place des anciennes maquettes IHM | `69eaf4e` | — |
| 3.0 | 13/11/2026 | Traitement des remontées réservé au gestionnaire, prise en charge obligatoire ; règles RG-13, 15, 21, 39, 40, 64, 66, 72 mises à jour et RG-87 à RG-91 ajoutées | `d3c3785` (`docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md`) | — |
| 2.1 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | `ddc3262` (`docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md`) | — |
| 2.0 | 13/11/2026 | Prise en charge « en cours » puis « remplacé » ou « corrigé » par le gestionnaire ; remontées et notifications des administrateurs ; type de problème obligatoire | `38c405d` (`docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md`) | — |
| 1.4 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` (`docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md`) | — |
| 1.3 | 09/11/2026 | Synchroniser la matrice et les fiches de profils | `d78a5a7` (`docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md`) | — |
| 1.2 | 08/11/2026 | Intégrer le retour client du 4 novembre | `a592d58` (`docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md`) | — |
| 1.1 | 06/11/2026 | Distinguer la cible MindefConnect du démonstrateur | `6212b60` (`docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md`) | — |
| 1.0 | 03/11/2026 | Formaliser les parcours et interfaces par profil ; Intégrer Keycloak, S3 et les serveurs front et back | `c6eed95` (`docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md`) | — |

### 22-DCU-ADMINISTRER-ORION

Fichier : [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/22-DCU-ADMINISTRER-ORION.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/22-DCU-ADMINISTRER-ORION.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.0 | 15/11/2026 | Désignation du premier super administrateur par l’exploitant | en vigueur | — |
| 1.0 | 15/11/2026 | Administrer ORION et personnaliser son espace | `36f4195` | — |

### 23-DIAGRAMMES-ACTIVITE-CAS-UTILISATION

Fichier : [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/23-DIAGRAMMES-ACTIVITE-CAS-UTILISATION.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/23-DIAGRAMMES-ACTIVITE-CAS-UTILISATION.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.0 | 15/11/2026 | Diagrammes d’activité des cas d’utilisation, d’après l’application | en vigueur | — |

### 24-DIAGRAMME-CLASSES-METIER

Fichier : [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/24-DIAGRAMME-CLASSES-METIER.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/24-DIAGRAMME-CLASSES-METIER.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.0 | 15/11/2026 | Déplacement, opération, système d’exploitation et paquet, comme le MCD | en vigueur | — |
| 1.0 | 15/11/2026 | Diagramme de classes métier en cinq vues | `36f4195` | — |

### 25-DIAGRAMMES-SEQUENCE-SYSTEME

Fichier : [docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/25-DIAGRAMMES-SEQUENCE-SYSTEME.md](../docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/25-DIAGRAMMES-SEQUENCE-SYSTEME.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.0 | 15/11/2026 | Diagrammes de séquence système | en vigueur | — |

### 17-DIAGRAMMES-ETATS

Fichier : [docs/02-ANALYSE/03-ANALYSE/17-DIAGRAMMES-ETATS.md](../docs/02-ANALYSE/03-ANALYSE/17-DIAGRAMMES-ETATS.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 4.2 | 15/11/2026 | Termes whitelist et blacklist | en vigueur | — |
| 4.1 | 14/11/2026 | Intervention : état « En cours » de la demande et des postes ; Machines à états du matériel et du processus | `36f4195` | — |
| 4.0 | 14/11/2026 | Promouvoir en livrable de la phase Analyse ; intervention complétée (gardes, effets, fin) | `fa8e2ad` | — |
| 3.1 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/03-ANALYSE/ | `69eaf4e` (`docs/02-ANALYSE/03-ANALYSE/DIAGRAMMES-ETATS-BROUILLON-V1.md`) | — |
| 3.0 | 13/11/2026 | Traitement des remontées réservé au gestionnaire, prise en charge obligatoire ; règles RG-13, 15, 21, 39, 40, 64, 66, 72 mises à jour et RG-87 à RG-91 ajoutées | `d3c3785` (`docs/temporaire/DIAGRAMMES-ETATS-BROUILLON-V1.md`) | — |
| 2.0 | 13/11/2026 | Aligner sur l’application : état « en cours », traitement direct possible, PDF à la demande, type obligatoire, interventions sur une seule salle | `28bc990` (`docs/temporaire/DIAGRAMMES-ETATS-BROUILLON-V1.md`) | — |
| 1.0 | 09/11/2026 | Ajouter les diagrammes d'états de la remontée et des interventions | `83658a3` (`docs/temporaire/DIAGRAMMES-ETATS-BROUILLON-V1.md`) | — |

### 26-DIAGRAMME-CLASSES-ANALYSE

Fichier : [docs/02-ANALYSE/03-ANALYSE/26-DIAGRAMME-CLASSES-ANALYSE.md](../docs/02-ANALYSE/03-ANALYSE/26-DIAGRAMME-CLASSES-ANALYSE.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.0 | 15/11/2026 | API de RIGEL à la place du connecteur | en vigueur | — |
| 1.1 | 15/11/2026 | Déplacement et opération, comme le MCD | `26885dc` | — |
| 1.0 | 15/11/2026 | Classes d’analyse boundary, control, entity | `36f4195` | — |

### 27-DIAGRAMME-CLASSES-CONCEPTION

Fichier : [docs/02-ANALYSE/04-CONCEPTION/27-DIAGRAMME-CLASSES-CONCEPTION.md](../docs/02-ANALYSE/04-CONCEPTION/27-DIAGRAMME-CLASSES-CONCEPTION.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.1 | 15/11/2026 | Routes et règle des opérations RIGEL renommées | en vigueur | — |
| 2.0 | 15/11/2026 | RIGEL selon la cible : API d’Express, sans relais ni connecteur ; RIGEL selon la cible : API d’Express, sans relais ni connecteur | `04c54ca` | — |
| 1.0 | 15/11/2026 | Classes de conception du serveur et du navigateur | `36f4195` | — |

### 28-DIAGRAMMES-SEQUENCE-DETAILLES

Fichier : [docs/02-ANALYSE/04-CONCEPTION/28-DIAGRAMMES-SEQUENCE-DETAILLES.md](../docs/02-ANALYSE/04-CONCEPTION/28-DIAGRAMMES-SEQUENCE-DETAILLES.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.1 | 15/11/2026 | Tables sans préfixe ; collections interventions et operations | en vigueur | — |
| 2.0 | 15/11/2026 | Constat RIGEL transmis directement à Express ; Constat RIGEL transmis directement à Express | `04c54ca` | — |
| 1.0 | 15/11/2026 | Séquences détaillées sur les objets réels | `36f4195` | — |

### 29-MODELE-PHYSIQUE-DONNEES

Fichier : [docs/02-ANALYSE/04-CONCEPTION/29-MODELE-PHYSIQUE-DONNEES.md](../docs/02-ANALYSE/04-CONCEPTION/29-MODELE-PHYSIQUE-DONNEES.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 3.0 | 15/11/2026 | Tables sans préfixe orion_ ; Intervention, Operation et Deplacement | en vigueur | — |
| 2.0 | 15/11/2026 | Base du relais RIGEL retirée de la cible | `04c54ca` | — |
| 1.0 | 15/11/2026 | Modèle physique des données en UML (profil d’Ambler) | `36f4195` | — |

### 18-DOSSIER-ARCHITECTURE-TECHNIQUE

Fichier : [docs/03-ARCHITECTURE/18-DOSSIER-ARCHITECTURE-TECHNIQUE.md](../docs/03-ARCHITECTURE/18-DOSSIER-ARCHITECTURE-TECHNIQUE.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 5.1 | 15/11/2026 | Jeton du relais fourni par l’intégration continue à chaque déploiement | en vigueur | — |
| 5.0 | 15/11/2026 | Durcissement du 15 novembre : entrée, Keycloak, collecteur, NFS, PostgreSQL, conteneurs, déploiement | `75615df` | — |
| 4.0 | 15/11/2026 | Retient NFSv4.2 pour le stockage de l’architecture cible ; Retient NFSv4.2 pour le stockage cible et sert RIGEL par l’entrée et le back d’ORION | `e6b9ffd` | — |
| 3.6 | 15/11/2026 | Retire les identités de démonstration de l’annuaire remis et signale l’accès de présentation | `c0ace77` | — |
| 3.5 | 15/11/2026 | Décrit la création du premier super administrateur d’une base neuve | `8866971` | — |
| 3.4 | 14/11/2026 | Préciser que Logstash garde ses propres logs sur sa VM | `28ed8d4` | — |
| 3.3 | 14/11/2026 | Donner les versions épinglées de HAProxy et Apache | `8337387` | — |
| 3.2 | 14/11/2026 | Corriger secrets, données, migrations, provisionnement, filtrage et éléments manquants | `e1c2f59` | — |
| 3.1 | 14/11/2026 | Renuméroter après l’ajout des diagrammes d’états (17) | `ca0187c` | — |
| 3.0 | 14/11/2026 | Nommer M42 et préciser les accès RIGEL réels | `21c57cf` (`docs/03-ARCHITECTURE/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md`) | — |
| 2.1 | 14/11/2026 | Déplacer dans docs/03-ARCHITECTURE/ | `69eaf4e` (`docs/03-ARCHITECTURE/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md`) | — |
| 2.0 | 13/11/2026 | DAT de référence du collègue repris de main (recensement RECON, cible C1NP fiabilisée) ; fichier sans en-tête de version, à ne pas modifier | `0b83eb6` (`docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md`) | — |
| 1.5 | 13/11/2026 | Aligner l’architecture réelle sur la configuration versionnée : création des identités, image Keycloak, flux d’Express, absence de filtrage, secrets et versions | `c563b5a` (`docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md`) | — |
| 1.4 | 13/11/2026 | Remplacer « masterisation » et « réinstallation » par « réinitialisation » (réinstallation du système par réapplication d’une image) | `ddc3262` (`docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md`) | — |
| 1.3 | 13/11/2026 | Décrire orion-3 en VM d'administration avec le runner ; Décrire l'entrée unique par adresse IP, sans DNS ; Documenter la cible C1NP et unifier les vues | `83658a3` (`docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md`) | — |
| 1.2 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renseigner les adresses des VM ; Renommer le projet en ORION dans tout le dépôt ; Décrire l'architecture orion sur dix VM ; Retirer les dernières mentions de l'ancien nom ; Mettre à jour les noms des fichiers convertis en TypeScript | `335b44d` (`docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md`) | — |
| 1.1 | 11/11/2026 | Décrire le déploiement du démonstrateur sur huit VM | `3396072` (`docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md`) | — |
| 1.0 | 09/11/2026 | Ajouter le dossier d'architecture technique et ses diagrammes | `51bd591` (`docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md`) | — |

### 19-DIAGRAMMES-ARCHITECTURE

Fichier : [docs/03-ARCHITECTURE/19-DIAGRAMMES-ARCHITECTURE.md](../docs/03-ARCHITECTURE/19-DIAGRAMMES-ARCHITECTURE.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.3 | 15/11/2026 | Trace tous les flux réels de la vue complète du démonstrateur ; Trace tous les flux réels de la vue complète et nomme le stockage NFS de la cible ; Trace tous les flux de la vue complète ; cible avec stockage NFS et RIGEL servi par l’entrée d’ORION | en vigueur | — |
| 2.2 | 14/11/2026 | Redessiner les quatre vues sans croisement et compléter les flux réels | `e1c2f59` | — |
| 2.1 | 14/11/2026 | Renuméroter après l’ajout des diagrammes d’états (17) | `e99107c` | — |
| 2.0 | 14/11/2026 | Intégrer RIGEL et M42 dans les vues d’architecture | `21c57cf` (`docs/03-ARCHITECTURE/18-DIAGRAMMES-ARCHITECTURE.md`) | — |
| 1.4 | 14/11/2026 | Déplacer dans docs/03-ARCHITECTURE/ | `69eaf4e` (`docs/03-ARCHITECTURE/18-DIAGRAMMES-ARCHITECTURE.md`) | — |
| 1.3 | 13/11/2026 | Documenter la cible C1NP et unifier les vues | `83658a3` (`docs/18-DIAGRAMMES-ARCHITECTURE.md`) | — |
| 1.2 | 12/11/2026 | Passage au nom ORION, mise à jour de l'interface utilisateur ; Renseigner les adresses des VM ; Renommer le projet en ORION dans tout le dépôt ; Décrire l'architecture orion sur dix VM | `3e437e0` (`docs/18-DIAGRAMMES-ARCHITECTURE.md`) | — |
| 1.1 | 11/11/2026 | Décrire le déploiement du démonstrateur sur huit VM | `3396072` (`docs/18-DIAGRAMMES-ARCHITECTURE.md`) | — |
| 1.0 | 09/11/2026 | Ajouter le dossier d'architecture technique et ses diagrammes | `51bd591` (`docs/18-DIAGRAMMES-ARCHITECTURE.md`) | — |

### 20-BACKLOG-ET-SUIVI-PROJET

Fichier : [docs/04-ORGANISATION/20-BACKLOG-ET-SUIVI-PROJET.md](../docs/04-ORGANISATION/20-BACKLOG-ET-SUIVI-PROJET.md) · Production destinée à la remise

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 5.0 | 15/11/2026 | Actualise les clôtures après confirmation de la recette | en vigueur | — |
| 4.0 | 15/11/2026 | Inclut RIGEL dans la clôture et actualise le suivi après audit | `067e0b5` | — |
| 3.5 | 15/11/2026 | Référence le tracé des flux et la cible NFS et RIGEL | `122f91b` | — |
| 3.4 | 14/11/2026 | Plus de version Word : le Markdown fait foi | `5da7ebd` | — |
| 3.3 | 14/11/2026 | Reprendre les références de commits du brouillon de suivi | `6a9d33c` | — |
| 3.2 | 14/11/2026 | Actualiser les graphiques depuis le projet GitHub | `b5f9cf9` | — |
| 3.1 | 14/11/2026 | Renuméroter après l’ajout des diagrammes d’états (17) | `e99107c` | — |
| 3.0 | 14/11/2026 | Déplacer dans docs/04-ORGANISATION/ ; Rendu de l’application le 17 novembre, supports le 18, présentation le 19 ; graphiques régénérés | `69eaf4e` (`docs/04-ORGANISATION/19-BACKLOG-ET-SUIVI-PROJET.md`) | — |
| 2.0 | 14/11/2026 | Deux sprints (19/10–08/11, 09/11–19/11), suivi dans le projet GitHub ORION et graphiques produits depuis GitHub | `ab5fb7d` (`docs/19-BACKLOG-ET-SUIVI-PROJET.md`) | — |
| 1.1 | 13/11/2026 | Remplacer l’ancien nom par ORION et corriger le lien du commit de la cible C1NP | `61abf4a` (`docs/19-BACKLOG-ET-SUIVI-PROJET.md`) | — |
| 1.0 | 13/11/2026 | Consolider le suivi des progressions ; Structurer le suivi Agile et les cérémonies ; Styliser les graphiques en SVG dans Word | `83658a3` (`docs/19-BACKLOG-ET-SUIVI-PROJET.md`) | — |

### 21-BACKLOG-TECHNIQUE-ET-FEUILLE-DE-ROUTE

Fichier : [docs/04-ORGANISATION/21-BACKLOG-TECHNIQUE-ET-FEUILLE-DE-ROUTE.md](../docs/04-ORGANISATION/21-BACKLOG-TECHNIQUE-ET-FEUILLE-DE-ROUTE.md) · Pilotage interne

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 7.0 | 15/11/2026 | Distingue la recette VM validée du risque local de volume | en vigueur | — |
| 6.0 | 15/11/2026 | Suit les anomalies confirmées et les réserves de recette ; Ajoute le défaut mineur de versionnement corrigé | `e4c7b0f` | — |
| 5.18 | 15/11/2026 | Jeton du relais fiabilisé ; RIGEL vérifié sur iOS | `3fbaa9a` | — |
| 5.17 | 15/11/2026 | Recette sur les VM consignée ; jeton du relais à fiabiliser | `97191e8` | — |
| 5.16 | 15/11/2026 | Durcissement reporté au DAT | `75615df` | — |
| 5.15 | 15/11/2026 | Tests des points d’état faits ; version publique conservée | `3017d43` | — |
| 5.14 | 15/11/2026 | Noms de la base et du code alignés (#162) | `0867182` | — |
| 5.13 | 15/11/2026 | Lien remontée → école justifié ; préférences couvertes par le DCU 22 | `8be49e9` | — |
| 5.12 | 15/11/2026 | Questions du cadrage déjà résolues reportées | `4268db6` | — |
| 5.11 | 15/11/2026 | Étage obligatoire et détections corrigés dans le code ; documentation du 15 novembre consignée | `e3b635b` | — |
| 5.10 | 15/11/2026 | Informations non répercutées traitées ; limite des détections inscrite | `60a0e11` | — |
| 5.9 | 15/11/2026 | Décisions du 13 novembre reportées | `1237188` | — |
| 5.8 | 15/11/2026 | Contradictions entre livrables traitées ; étage obligatoire côté serveur inscrit | `0f1761c` | — |
| 5.7 | 15/11/2026 | RIGEL dans le cadrage et la cible traité ; écart avec le code inscrit ; RIGEL dans le cadrage et la cible traité ; écart avec le code inscrit | `04c54ca` | — |
| 5.6 | 15/11/2026 | Consigne les tests d'intrusion du 15 novembre et leurs corrections | `fe48601` | — |
| 5.5 | 15/11/2026 | Consigne la CI réussie et les vérifications après déploiement | `6a462c0` | — |
| 5.4 | 15/11/2026 | Consigne le déploiement des corrections de sécurité et l'épinglage des images | `a94ec62` | — |
| 5.3 | 15/11/2026 | Consigne l’audit de sécurité du 15 novembre et ses corrections ; Consigne l’audit de sécurité du 15 novembre et ses corrections | `998171d` | — |
| 5.2 | 15/11/2026 | MCD refait le 15 novembre ; renommage de la base et du code (#162) | `1a774ec` | — |
| 5.1 | 15/11/2026 | MCD refait le 15 novembre ; renommage de la base et du code (#162) | `d9bfc0c` | — |
| 5.0 | 15/11/2026 | M42, catalogue et postes Linux en V2 ; DCU et termes traités | `70bd202` | — |
| 4.24 | 15/11/2026 | Consigne la clôture des écarts du dossier d’architecture | `122f91b` | — |
| 4.23 | 15/11/2026 | Clôt le tracé des flux de la vue complète ; Clôt le tracé des flux de la vue complète et inscrit l’alignement de RIGEL dans la cible | `e6b9ffd` | — |
| 4.22 | 15/11/2026 | Clôt le retrait des données de démonstration des livrables | `c0ace77` | — |
| 4.21 | 15/11/2026 | Consigne la création du premier super administrateur et l’écart au DAT ; Consigne la création du premier super administrateur et l’écart au DAT ; Consigne la création du premier super administrateur et l’écart au DAT | `8866971` | — |
| 4.20 | 15/11/2026 | Cocher les mots de passe des comptes ; Cocher les mots de passe des comptes | `8ad0b2a` | — |
| 4.19 | 14/11/2026 | Admettre les chemins sur les VM dans le DAT | `d1239fb` | — |
| 4.18 | 14/11/2026 | Cocher l'exception des logs de Logstash | `28ed8d4` | — |
| 4.17 | 14/11/2026 | Cocher les versions de HAProxy et Apache | `8337387` | — |
| 4.16 | 14/11/2026 | Cocher les corrections du DAT et des schémas | `e1c2f59` | — |
| 4.15 | 14/11/2026 | Versions Word retirées | `5da7ebd` | — |
| 4.14 | 14/11/2026 | Actualiser déploiement, CI, adresse MAC et proxy de développement ; Actualiser adresse MAC, proxy de développement et suivi GitHub | `6a9d33c` | — |
| 4.13 | 14/11/2026 | Jetons « Accès de présentation » rétablis à la place du tableau des comptes | `2a88faf` | — |
| 4.12 | 14/11/2026 | Consigner la mise à jour des statuts GitHub | `baabbf7` | — |
| 4.11 | 14/11/2026 | RIGEL : installation et recensement consolidés, notion de campagne retirée | `80413fc` | — |
| 4.10 | 14/11/2026 | Organisation du code et migrations réalisées ; amorçage de production et écarts du DAT ajoutés | `186f904` | — |
| 4.9 | 14/11/2026 | Comptes fictifs, tableau des comptes et changement de compte à la connexion ; réinitialisation des données préparée | `b5ee002` | — |
| 4.8 | 14/11/2026 | Corrections de l’audit du 13 novembre réalisées | `d092d37` | — |
| 4.7 | 14/11/2026 | RIGEL : accepter sur place ou ramener (RG-96) | `07a0096` | — |
| 4.6 | 14/11/2026 | Recensement lancé depuis ORION par le gestionnaire, téléphone lié à l’opération | `6219944` | — |
| 4.5 | 14/11/2026 | Fiches descriptives à jour, brouillons Word retirés | `5383a9f` | — |
| 4.4 | 14/11/2026 | RIGEL : installation d’une salle, recensement, appairage et traitement des écarts (RG-92 à RG-95) | `1162c04` | — |
| 4.3 | 14/11/2026 | Renuméroter après l’ajout des diagrammes d’états (17) | `e99107c` | — |
| 4.2 | 14/11/2026 | Renommer RIGEL et planifier M42 | `21c57cf` (`docs/04-ORGANISATION/20-BACKLOG-TECHNIQUE-ET-FEUILLE-DE-ROUTE.md`) | — |
| 4.1 | 14/11/2026 | Déplacer dans docs/04-ORGANISATION/ ; Échéances du rendu (17/11) et de la présentation (19/11) ; backlog GitHub et captures des fiches faits | `69eaf4e` (`docs/04-ORGANISATION/20-BACKLOG-TECHNIQUE-ET-FEUILLE-DE-ROUTE.md`) | — |
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

### 30-POINTS-DAILY-SCRUM-16-NOVEMBRE

Fichier : [docs/04-ORGANISATION/30-POINTS-DAILY-SCRUM-16-NOVEMBRE.md](../docs/04-ORGANISATION/30-POINTS-DAILY-SCRUM-16-NOVEMBRE.md) · Pilotage interne

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 3.0 | 15/11/2026 | Valide les vérifications VM confirmées par l’équipe | en vigueur | — |
| 2.0 | 15/11/2026 | Actualise chaque point avec les résultats de l’audit ; Actualise le total après les contrôles finaux | `e4c7b0f` | — |
| 1.4 | 15/11/2026 | Points 1, 3, 4 et 6 tranchés | `0867182` | — |
| 1.3 | 15/11/2026 | Lien d’une remontée à son école tranché | `8be49e9` | — |
| 1.2 | 15/11/2026 | Présentation de RIGEL selon la cible tranchée | `04c54ca` | — |
| 1.1 | 15/11/2026 | Classement en pilotage interne | `1640070` | — |
| 1.0 | 15/11/2026 | Points du daily scrum du 16 novembre | `36a3477` | — |

### 31-AUDIT-AVANT-RENDU-16-NOVEMBRE

Fichier : [docs/04-ORGANISATION/31-AUDIT-AVANT-RENDU-16-NOVEMBRE.md](../docs/04-ORGANISATION/31-AUDIT-AVANT-RENDU-16-NOVEMBRE.md) · Pilotage interne

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 2.0 | 15/11/2026 | Retient la recette VM confirmée et rectifie les verdicts | en vigueur | — |
| 1.0 | 15/11/2026 | Consigne les preuves, écarts et verdicts avant rendu ; Complète les contrôles finaux et la correction du versionnement ; Harmonise la présentation des écarts | `e4c7b0f` | — |

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

### 13-FICHE-DESCRIPTIVE-GESTIONNAIRE

Ancien emplacement : `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.docx`. Retiré le 14/11/2026 : Version Word retirée : le Markdown fait foi

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.1 | 14/11/2026 | RIGEL : installation et recensement consolidés, notion de campagne retirée | `80413fc` | — |
| 1.0 | 14/11/2026 | Version Word générée depuis la fiche Markdown | `186f904` | — |

### 14-FICHE-DESCRIPTIVE-FORMATEUR

Ancien emplacement : `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.docx`. Retiré le 14/11/2026 : Version Word retirée : le Markdown fait foi

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.2 | 14/11/2026 | Régénérée depuis la fiche | `fa8e2ad` | — |
| 1.1 | 14/11/2026 | RIGEL : installation et recensement consolidés, notion de campagne retirée | `fa8e2ad` | — |
| 1.0 | 14/11/2026 | Version Word générée depuis la fiche Markdown | `186f904` | — |

### 15-FICHE-DESCRIPTIVE-ADMINISTRATEUR

Ancien emplacement : `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.docx`. Retiré le 14/11/2026 : Version Word retirée : le Markdown fait foi

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.1 | 14/11/2026 | RIGEL : installation et recensement consolidés, notion de campagne retirée | `80413fc` | — |
| 1.0 | 14/11/2026 | Version Word générée depuis la fiche Markdown | `186f904` | — |

### 16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR

Ancien emplacement : `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.docx`. Retiré le 14/11/2026 : Version Word retirée : le Markdown fait foi

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.1 | 14/11/2026 | RIGEL : installation et recensement consolidés, notion de campagne retirée | `80413fc` | — |
| 1.0 | 14/11/2026 | Version Word générée depuis la fiche Markdown | `186f904` | — |

### DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2

Ancien emplacement : `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2.md`. Retiré le 15/11/2026 : Remplacé par le livrable 23-DIAGRAMMES-ACTIVITE-CAS-UTILISATION

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.3 | 14/11/2026 | PDF à la demande et type de problème obligatoire | `fa8e2ad` | — |
| 1.2 | 14/11/2026 | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ | `fa8e2ad` | — |
| 1.1 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `e072d65` (`docs/temporaire/DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2.md`) | — |
| 1.0 | 06/11/2026 | Ajouter les parcours détaillés en brouillon | `d626315` (`docs/temporaire/DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2.md`) | — |

### README

Ancien emplacement : `docs/02-ANALYSE/04-CONCEPTION/README.md`. Retiré le 15/11/2026 : Remplacé par les livrables de conception 27 à 29

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.1 | 14/11/2026 | Nommer la conception de l’agent M42 | `e99107c` | — |
| 1.0 | 14/11/2026 | Créer la partie Conception | `69eaf4e` | — |

### 20-BACKLOG-ET-SUIVI-PROJET

Ancien emplacement : `docs/04-ORGANISATION/20-BACKLOG-ET-SUIVI-PROJET.docx`. Retiré le 14/11/2026 : Version Word retirée : le Markdown fait foi

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.4 | 14/11/2026 | Version Word régénérée (graphiques à jour) | `fa8e2ad` | — |
| 1.3 | 14/11/2026 | Renuméroter après l’ajout des diagrammes d’états (17) | `fa8e2ad` | — |
| 1.2 | 14/11/2026 | Déplacer dans docs/04-ORGANISATION/ | `69eaf4e` (`docs/04-ORGANISATION/19-BACKLOG-ET-SUIVI-PROJET.docx`) | — |
| 1.1 | 13/11/2026 | Remplacer l’ancien nom par ORION et corriger le lien du commit de la cible C1NP | `61abf4a` (`docs/19-BACKLOG-ET-SUIVI-PROJET.docx`) | — |
| 1.0 | 13/11/2026 | Consolider le suivi des progressions ; Structurer le suivi Agile et les cérémonies ; Styliser les graphiques en SVG dans Word | `b2a5a17` (`docs/19-BACKLOG-ET-SUIVI-PROJET.docx`) | — |

### 20-SUIVI-BACKLOG-BROUILLON-V1

Ancien emplacement : `docs/04-ORGANISATION/20-SUIVI-BACKLOG-BROUILLON-V1.md`. Retiré le 14/11/2026 : Remplacé par le backlog et suivi du projet, qui reprend ses références

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.3 | 14/11/2026 | Renuméroter après l’ajout des diagrammes d’états (17) | `e99107c` | — |
| 1.2 | 14/11/2026 | Déplacer dans docs/04-ORGANISATION/ | `69eaf4e` (`docs/04-ORGANISATION/19-SUIVI-BACKLOG-BROUILLON-V1.md`) | — |
| 1.1 | 13/11/2026 | Remplacer l’ancien nom par ORION et corriger le commit de la cible C1NP | `61abf4a` (`docs/temporaire/19-SUIVI-BACKLOG-BROUILLON-V1.md`) | — |
| 1.0 | 13/11/2026 | Consolider le suivi des progressions | `83658a3` (`docs/temporaire/19-SUIVI-BACKLOG-BROUILLON-V1.md`) | — |

### 05-MCD-MERISE-MOCODO

Ancien emplacement : `docs/05-MCD-MERISE-MOCODO.url`. Retiré le 13/11/2026 : Remplacé par la source draw.io

| Version | Date | Modification | Commit | Copie |
| --- | --- | --- | --- | --- |
| 1.3 | 12/11/2026 | Renommer le projet en ORION dans tout le dépôt | `0078180` | — |
| 1.2 | 09/11/2026 | Consolider le modèle et les règles métier | `a8fc937` | — |
| 1.1 | 03/11/2026 | Harmoniser le compte Windows dans le modèle ; Formaliser les profils et leurs autorisations | `f7310c1` | — |
| 1.0 | 02/11/2026 | Mcd ; Maj mcd | `e0cf540` | — |
