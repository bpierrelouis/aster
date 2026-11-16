# Dossier de spécifications des exigences

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 1.0 | 16/11/2026 | Production destinée à la remise | Créer la source du DSE remis en PDF ; Créer la source du DSE remis en PDF | [1 version](../../archive/README.md#05-dossier-specifications-exigences) |
<!-- version:fin -->

Ce document est la source du livrable PDF du DSE. Les schémas sont repris des diagrammes cités, les tableaux de cas d’utilisation et de règles sont établis à partir des fiches descriptives et des règles de gestion, et les annexes reprennent les documents listés au dernier chapitre.

## 1. Introduction

### 1.1 Objet du document

Ce dossier de spécifications des exigences (DSE) décrit ce que doit faire l’application ORION et les contraintes qu’elle doit respecter. Il rassemble la capture du besoin, les exigences fonctionnelles et non fonctionnelles, les règles de gestion, les droits des profils, les modèles d’analyse et de conception, ainsi que la traçabilité entre le besoin exprimé et les cas d’utilisation.

Il sert de référence commune au client, à l’équipe de réalisation et aux évaluateurs. Il décrit le fonctionnement cible d’ORION en production.

### 1.2 Portée du produit

ORION (Outil de Recensement, d’Intervention et d’Observation Numérique) est une application web destinée aux écoles de formation. Elle remplace le suivi du parc informatique réalisé dans des fichiers Excel par un outil centralisé qui permet de gérer les matériels et leur affectation aux salles, d’administrer les postes Windows à distance, de superviser leur utilisation et de recueillir les problèmes signalés par les utilisateurs. RIGEL, son module mobile, permet de scanner les salles et les matériels pour installer une salle ou recenser le parc.

### 1.3 Définitions et abréviations

Les termes et abréviations sont définis dans le glossaire (annexe A). Les plus utilisés dans ce dossier sont rappelés ci-dessous.

*Tableau – Principales définitions*

| Terme | Définition |
| --- | --- |
| DSE | Dossier de spécifications des exigences. |
| UC | Cas d’utilisation (use case), identifié UC-PROFIL-nn. |
| RG | Règle de gestion, identifiée RG-nn (annexe B). |
| ENF | Exigence non fonctionnelle, identifiée ENF-nn (chapitre 8). |
| DCU | Diagramme de cas d’utilisation. |
| MCD / MPD | Modèle conceptuel / physique de données. |
| Remontée | Problème signalé par un utilisateur sur un ou plusieurs matériels. |
| État des lieux | Document PDF d’une remontée, produit à la demande. |
| Intervention | Installation, désinstallation, réinitialisation ou arrêt de processus demandé à des postes. |
| Recensement | Vérification sur place de la présence des matériels avec RIGEL. |
| MindefConnect | Service d’authentification du ministère des Armées auquel ORION confie l’authentification. |
| C1NP | Environnement d’hébergement du ministère des Armées retenu pour ORION. |

### 1.4 Documents de référence

*Tableau – Documents de référence*

| Réf. | Document |
| --- | --- |
| R1 | Sujet du projet de fin de stage ORION : présentation du besoin, périmètre fonctionnel et attendus (DRHAT / PFORM). |
| R2 | Comptes rendus des entretiens de recueil du besoin avec le client (22 et 23 octobre, 4 et 12 novembre 2026). |
| R3 | Cadre de cohérence technique (CCT) 2026-2027, version 3.7 – annexe « pile logicielle ». |
| R4 | ISO/IEC/IEEE 29148:2018 – Ingénierie des exigences (structure de la spécification des exigences logicielles). |
| R5 | UML 2.5 (OMG) pour les diagrammes de cas d’utilisation, d’activité, de séquence, d’états et de classes ; méthode Merise pour le MCD. |
| R6 | Dossier d’architecture technique d’ORION, remis séparément. |

### 1.5 Conventions

- Les exigences sont formulées au présent de l’indicatif : « ORION refuse… », « le gestionnaire peut… ». Une exigence est obligatoire sauf mention contraire.
- Chaque exigence porte un identifiant unique et stable : UC-PROFIL-nn pour les cas d’utilisation (GEST, FORM, ADMIN, SADMIN), RG-nn pour les règles de gestion, ENF-nn pour les exigences non fonctionnelles.
- Les diagrammes suivent UML 2.5 ; le modèle conceptuel de données suit Merise. Les acteurs abstraits des DCU regroupent des participations communes et ne constituent pas des profils supplémentaires (annexe A, conventions de lecture).
- Les termes de l’interface sont écrits en gras dans les fiches descriptives (par exemple **Signaler un problème**).

### 1.6 Organisation du document

*Tableau – Organisation du document*

| Partie | Contenu |
| --- | --- |
| 2 | Description générale : contexte, objectifs, périmètre, acteurs, contraintes et hypothèses. |
| 3 | Modélisation métier : processus de l’organisation. |
| 4 | Exigences fonctionnelles : domaines, cas d’utilisation, diagrammes d’activité et de séquence système. |
| 5 | Exigences sur les données : MCD et diagramme de classes métier. |
| 6 et 7 | Règles de gestion et droits d’accès (détail en annexes B et C). |
| 8 | Exigences non fonctionnelles. |
| 9 et 10 | Modèles d’analyse et de conception. |
| 11 | Traçabilité du besoin vers les cas d’utilisation et les règles de gestion. |
| 12 | Points ouverts. |
| A à G | Annexes : glossaire, règles de gestion, matrice des droits et fiches descriptives des quatre profils. |

## 2. Description générale

### 2.1 Contexte et problématique

Les écoles de formation suivent aujourd’hui leur parc informatique dans des fichiers Excel. Cette gestion ne permet pas de savoir de façon fiable quel matériel se trouve dans quelle salle, rend longue et manuelle la réinstallation des postes, n’offre aucune vue centralisée de ce qui s’exécute sur les postes pendant les cours et laisse les problèmes matériels être signalés de façon informelle.

### 2.2 Objectifs

ORION doit permettre :

- de connaître à tout moment la localisation et l’état du matériel informatique ;
- d’enregistrer simplement le matériel reçu, notamment par import ;
- de faciliter les remontées provenant des salles et leur traitement ;
- de simplifier la réinstallation complète d’un poste ou d’une salle ;
- de générer des alertes liées à l’utilisation des machines ;
- de fournir aux formateurs un outil simple de supervision des postes de leur salle.

Le sujet attend trois livrables fonctionnels : une application web de gestion du parc, un tableau de bord des remontées utilisateur et des documents d’état des lieux.

### 2.3 Périmètre

*Tableau – Périmètre fonctionnel*

| Inclus dans ORION | Exclu du périmètre |
| --- | --- |
| Gestion du parc : matériels, stock, affectations, déplacements, garanties, import JSON. | Gestion des formations et suivi des personnes formées. |
| Organisation des écoles : bâtiments, étages, salles. | Gestion des aptitudes au-delà de la date de fin de garantie du matériel. |
| Installation des salles et recensement avec RIGEL. | Reprise des fichiers Excel existants (aucun fichier fourni). |
| Administration des postes Windows : applications, réinitialisation. | Connexion au système d’information du CND. |
| Supervision des postes et des processus utilisateur, listes autorisées et interdites, statistiques. | Demandes de nouveau matériel et suivi des livraisons. |
| Remontées utilisateur et états des lieux PDF. | Stockage de fichiers : les PDF sont produits à la demande. |
| Comptes ORION, tableaux de bord et notifications. | Envoi de courriels. |

### 2.4 Diagramme de contexte

Le [diagramme de contexte](01-MODELISATION-METIER/01-DIAGRAMME-CONTEXTE.md) présente ORION comme une boîte noire, ses acteurs et les flux échangés.

### 2.5 Acteurs et profils

Un utilisateur possède un seul profil (RG-01, RG-71). Il est rattaché à une école, sauf le super administrateur qui intervient sur toutes les écoles (RG-60, RG-69).

*Tableau – Acteurs d’ORION*

| Acteur | Type | Rôle dans ORION |
| --- | --- | --- |
| Formateur | Utilisateur | Supervise la salle où il enseigne, consulte ses détections, crée des remontées et suit les siennes ; consulte les salles sans les modifier. |
| Gestionnaire | Utilisateur | Tient l’inventaire de son école, affecte et déplace les matériels, importe des matériels, traite les remontées, installe les salles et recense le parc avec RIGEL. |
| Administrateur | Utilisateur | Dispose de tous les droits du gestionnaire dans son école ; supprime des matériels, gère salles et étages, administre les postes, les règles de processus et les comptes de son école. |
| Super administrateur | Utilisateur | Exerce les droits de l’administrateur sur toutes les écoles, sauf RIGEL ; gère les écoles, les règles globales de processus et les comptes de super administrateur. |
| MindefConnect | Système externe | Authentifie les utilisateurs et transmet leur identité à ORION. |
| Solution d’administration des postes Windows | Système externe | Remonte l’état des postes, leurs processus et applications ; exécute les interventions demandées et renvoie leur résultat. |
| RIGEL | Module mobile | Application du téléphone du gestionnaire ou de l’administrateur : scan des salles et des matériels, fonctionnement hors connexion, transmission des constats. |

### 2.6 Fonctions principales

*Tableau – Domaines fonctionnels*

| Domaine | Fonctions | Cas d’utilisation |
| --- | --- | --- |
| Gestion du parc | Inventaire, recherche, localisation et affectation des matériels, stock, import JSON, installation des salles et recensement avec RIGEL. | UC-GEST-01, UC-GEST-02, UC-GEST-04, UC-GEST-05, UC-GEST-06, UC-ADMIN-01, UC-ADMIN-07, UC-ADMIN-08, UC-FORM-04 |
| Administration des postes | Consultation des applications d’un poste, installation et désinstallation d’applications, réinitialisation d’un poste ou d’une salle, suivi des interventions. | UC-ADMIN-02, UC-ADMIN-03 |
| Supervision des postes | État des postes d’une salle, processus utilisateur, arrêt d’un processus, listes autorisées et interdites, détections et statistiques. | UC-FORM-01, UC-FORM-02, UC-ADMIN-04, UC-SADMIN-03 |
| Remontées utilisateur | Signalement d’un problème sur des matériels, traitement par le gestionnaire ou un administrateur, suivi des statuts et état des lieux PDF. | UC-FORM-03, UC-GEST-03, UC-ADMIN-05 |
| Administration d’ORION et espace personnel | Écoles, comptes ORION, école affichée, tableaux de bord personnalisables et notifications. | UC-ADMIN-06, UC-ADMIN-09, UC-GEST-07, UC-SADMIN-01, UC-SADMIN-02, UC-SADMIN-04, UC-SADMIN-05 |

### 2.7 Contraintes générales

- ORION est une application web utilisée avec Firefox depuis les postes existants ; l’interface exige une connexion au réseau.
- L’authentification est confiée à MindefConnect ; ORION ne gère aucun mot de passe (RG-62, RG-85).
- ORION est hébergé sur le C1NP ; ses produits figurent dans la pile logicielle autorisée du CCT (R3).
- Aucun stockage de fichiers : les états des lieux PDF sont produits par le serveur à chaque demande et ne sont pas conservés (RG-35).
- Les notifications sont présentées dans ORION ; aucun courriel n’est envoyé (RG-38).
- Les postes supervisés sont des postes Windows ; seuls les postes alimentent processus, détections et applications installées.

### 2.8 Hypothèses et dépendances

- La solution d’administration des postes Windows reste à choisir (chapitre 12). ORION en est indépendant : il émet des demandes d’intervention et reçoit l’état des postes et le résultat des interventions.
- Les modalités d’intégration de MindefConnect (accès, attributs d’identité) sont fournies par le ministère.
- Le premier palier de production vise 1 000 postes actifs ; la charge sera confirmée par des essais.

## 3. Modélisation métier

Les [diagrammes d’activité métier](01-MODELISATION-METIER/02-DIAGRAMMES-ACTIVITE.md) décrivent les processus de l’organisation que l’application doit outiller, indépendamment des écrans.

## 4. Exigences fonctionnelles

Les exigences fonctionnelles sont exprimées par des cas d’utilisation, regroupés par domaine dans des DCU. Chaque cas d’utilisation est détaillé dans la fiche descriptive de son profil (annexes D à G) : récit utilisateur, critères d’acceptation, règles de gestion, besoins non fonctionnels, interface, préconditions, scénario nominal, scénarios alternatifs et d’exception, maquettes et diagrammes d’activité.

### 4.1 Gestion du parc

Inventaire, recherche, localisation et affectation des matériels, stock, import JSON, installation des salles et recensement avec RIGEL ([DCU — Gérer le parc](02-CAPTURE-DES-BESOINS/03-DCU-GESTION-PARC.md)).

*Tableau – Cas d’utilisation – Gestion du parc*

<!-- dse:cas UC-GEST-01 UC-GEST-02 UC-GEST-04 UC-GEST-05 UC-GEST-06 UC-ADMIN-01 UC-ADMIN-07 UC-ADMIN-08 UC-FORM-04 -->

### 4.2 Administration des postes

Consultation des applications d’un poste, installation et désinstallation d’applications, réinitialisation d’un poste ou d’une salle, suivi des interventions ([DCU — Administrer les postes](02-CAPTURE-DES-BESOINS/04-DCU-ADMINISTRATION-POSTES.md)).

*Tableau – Cas d’utilisation – Administration des postes*

<!-- dse:cas UC-ADMIN-02 UC-ADMIN-03 -->

### 4.3 Supervision des postes

État des postes d’une salle, processus utilisateur, arrêt d’un processus, listes autorisées et interdites, détections et statistiques ([DCU — Superviser les postes](02-CAPTURE-DES-BESOINS/05-DCU-SUPERVISION-POSTES.md)).

*Tableau – Cas d’utilisation – Supervision des postes*

<!-- dse:cas UC-FORM-01 UC-FORM-02 UC-ADMIN-04 UC-SADMIN-03 -->

### 4.4 Remontées utilisateur

Signalement d’un problème sur des matériels, traitement par le gestionnaire ou un administrateur, suivi des statuts et état des lieux PDF ([DCU — Créer une remontée et consulter son état des lieux](02-CAPTURE-DES-BESOINS/06-DCU-REMONTEES-UTILISATEUR.md)).

*Tableau – Cas d’utilisation – Remontées utilisateur*

<!-- dse:cas UC-FORM-03 UC-GEST-03 UC-ADMIN-05 -->

### 4.5 Administration d’ORION et espace personnel

Écoles, comptes ORION, école affichée, tableaux de bord personnalisables et notifications ([DCU — Administrer ORION et personnaliser son espace](02-CAPTURE-DES-BESOINS/07-DCU-ADMINISTRER-ORION.md)).

*Tableau – Cas d’utilisation – Administration d’ORION et espace personnel*

<!-- dse:cas UC-ADMIN-06 UC-ADMIN-09 UC-GEST-07 UC-SADMIN-01 UC-SADMIN-02 UC-SADMIN-04 UC-SADMIN-05 -->

### 4.6 Catalogue des cas d’utilisation par profil

Le catalogue reprend, pour chaque profil, les cas d’utilisation de sa fiche descriptive et les règles de gestion qu’ils appliquent.

<!-- dse:catalogue -->

### 4.7 Diagrammes d’activité des cas d’utilisation

Les [diagrammes d’activité des cas d’utilisation](02-CAPTURE-DES-BESOINS/08-DIAGRAMMES-ACTIVITE-CAS-UTILISATION.md) décrivent, en couloirs « acteur » et « ORION », le déroulement d’un cas d’utilisation principal avec ses alternatives et ses refus.

### 4.8 Diagrammes de séquence système

Les [diagrammes de séquence système](02-CAPTURE-DES-BESOINS/10-DIAGRAMMES-SEQUENCE-SYSTEME.md) présentent ORION comme une boîte noire et ordonnent les échanges avec les acteurs pour les parcours principaux.

## 5. Exigences sur les données

### 5.1 Modèle conceptuel de données

Le [MCD](02-CAPTURE-DES-BESOINS/02-MCD-MERISE.svg) (Merise) recense les entités conservées par ORION, leurs propriétés et leurs associations. Les règles de gestion relatives aux données (RG-01 à RG-14, RG-60 à RG-63, RG-72 et suivantes) en fixent les contraintes (annexe B).

### 5.2 Diagramme de classes métier

Le [diagramme de classes métier](02-CAPTURE-DES-BESOINS/09-DIAGRAMME-CLASSES-METIER.md) reprend les concepts du domaine, découpés en cinq vues.

## 6. Règles de gestion

Les règles de gestion d’ORION sont détaillées dans l’annexe B. Elles sont contrôlées par le serveur : aucune valeur d’autorité (identifiant ORION, numéro de remontée, auteur, dates, historique) n’est fixée par le navigateur.

*Tableau – Répartition des règles de gestion*

<!-- dse:repartition-regles -->

Règles structurantes à retenir :

<!-- dse:regles RG-09 RG-13 RG-15 RG-35 RG-53 RG-69 RG-79 RG-82 RG-85 RG-91 -->

## 7. Droits d’accès

Les droits dépendent du profil et de l’école de rattachement ; ils sont vérifiés par le serveur. La matrice complète figure en annexe C.

*Tableau – Périmètre des profils*

| Profil | Rattachement | Données accessibles |
| --- | --- | --- |
| Gestionnaire | Une école | Son école de rattachement |
| Formateur | Une école | Son école de rattachement |
| Administrateur | Une école | Son école de rattachement |
| Super administrateur | Aucune | Toutes les écoles ; choix de l’école affichée |

*Tableau – Synthèse des droits par profil*

| Action | Gest. | Form. | Admin. | Super adm. |
| --- | --- | --- | --- | --- |
| Consulter les salles et leurs matériels | Oui | Oui | Oui | Oui |
| Créer, modifier, affecter, importer des matériels | Oui | Non | Oui | Oui |
| Supprimer un matériel (stock, non cité par une remontée) | Non | Non | Oui | Oui |
| Gérer salles et étages | Non | Non | Oui | Oui |
| Utiliser RIGEL (installation, recensement) | Oui | Non | Oui | Non |
| Créer une remontée | Non | Oui | Oui | Oui |
| Traiter une remontée | Oui | Non | Oui | Oui |
| Superviser une salle, arrêter un processus utilisateur | Non | Oui | Oui | Oui |
| Gérer la whitelist et la blacklist | Non | Non | Oui | Oui |
| Règles de processus de portée globale | Non | Non | Non | Oui |
| Interventions sur les postes | Non | Non | Oui | Oui |
| Gérer les comptes ORION de l’école | Non | Non | Oui | Oui |
| Gérer les écoles | Non | Non | Non | Oui |

## 8. Exigences non fonctionnelles

*Tableau – Exigences non fonctionnelles*

| N° | Catégorie | Exigence | Source |
| --- | --- | --- | --- |
| ENF-01 | Accès | ORION est une application web utilisable avec Firefox depuis les postes de l’équipe, sans installation sur le poste. | Sujet, fiches |
| ENF-02 | Authentification | Chaque utilisateur s’authentifie par MindefConnect ; l’accès exige ensuite un compte ORION actif. Une désactivation prend effet immédiatement. | RG-62, RG-85 |
| ENF-03 | Authentification | La déconnexion met fin à la session ORION puis à celle de MindefConnect. | RG-99 |
| ENF-04 | Sécurité | Les droits, le périmètre par école et les valeurs d’autorité sont contrôlés par le serveur ; un navigateur ne reçoit que les données de son périmètre. | RG-69, RG-79 |
| ENF-05 | Sécurité | Les processus du système d’exploitation ne sont ni présentés ni proposés à l’arrêt. | RG-20, RG-32 |
| ENF-06 | Intégrité | Un compte ORION, une remontée et un constat RIGEL ne sont jamais supprimés ; un matériel cité par une remontée est conservé. | RG-73, RG-79, RG-82, RG-95 |
| ENF-07 | Traçabilité | La déconnexion est journalisée ; le suivi d’une remontée conserve chaque changement de statut, daté. | RG-64, RG-99 |
| ENF-08 | Fraîcheur | Les données de supervision d’un poste sont actualisées toutes les cinq secondes. | RG-57 |
| ENF-09 | Disponibilité des postes | Un poste sans remontée depuis trente secondes est présenté comme déconnecté. | RG-58 |
| ENF-10 | Conservation | Les détections de processus blacklistés ou non référencés sont conservées trente jours. | RG-56 |
| ENF-11 | Documents | Le PDF d’état des lieux est produit par le serveur à chaque demande, avec les informations du moment, et n’est pas conservé. | RG-35, RG-89 |
| ENF-12 | Notifications | Les notifications sont présentées dans ORION ; aucun courriel n’est envoyé. | RG-37, RG-38 |
| ENF-13 | Mobilité | RIGEL fonctionne hors connexion et transmet ses constats au retour du réseau ; un scan plus ancien que la dernière information connue est refusé. | RG-94 |
| ENF-14 | Concurrence | Plusieurs utilisateurs travaillent simultanément sans se bloquer ; les écritures concurrentes sont fusionnées élément par élément. | Conception (chapitre 10) |
| ENF-15 | Ergonomie | Chaque utilisateur retrouve à chaque connexion son ambiance d’affichage et ses tableaux de bord personnalisés. | RG-84, RG-97 |
| ENF-16 | Ergonomie | La recherche globale porte sur les salles, matériels et remontées accessibles, sans tenir compte de la casse. | RG-98 |
| ENF-17 | Import | Un import JSON accepte au plus 2 000 matériels et 2 Mo ; un fichier illisible, vide, trop volumineux ou invalide est refusé. | RG-29 |
| ENF-18 | Capacité | Le premier palier de production vise 1 000 postes actifs, avec une extension envisagée à 5 000. | Hypothèse (§ 2.8) |
| ENF-19 | Hébergement | ORION est hébergé sur le C1NP avec des produits de la pile logicielle autorisée du CCT. | R3 |

## 9. Modèles d’analyse

### 9.1 Diagrammes d’états

Les [diagrammes d’états](03-ANALYSE/01-DIAGRAMMES-ETATS.md) décrivent le cycle de vie des objets dont le statut conditionne les actions possibles.

### 9.2 Diagramme de classes d’analyse

Le [diagramme de classes d’analyse](03-ANALYSE/02-DIAGRAMME-CLASSES-ANALYSE.md) distingue les classes d’interface (dialogue), de contrôle et d’entité pour chaque domaine.

## 10. Modèles de conception

### 10.1 Diagramme de classes de conception

Le [diagramme de classes de conception](04-CONCEPTION/01-DIAGRAMME-CLASSES-CONCEPTION.md) présente les modules du serveur et du navigateur, leurs opérations clés et leurs dépendances.

### 10.2 Diagrammes de séquence détaillés

Les [diagrammes de séquence détaillés](04-CONCEPTION/02-DIAGRAMMES-SEQUENCE-DETAILLES.md) décrivent les échanges entre les composants d’ORION pour les parcours les plus structurants.

### 10.3 Modèle physique de données

Le [modèle physique des données](04-CONCEPTION/03-MODELE-PHYSIQUE-DONNEES.md) décrit les tables PostgreSQL d’ORION, leurs clés, contraintes et index, ainsi que les documents JSONB.

## 11. Traçabilité

### 11.1 Du besoin aux cas d’utilisation

Chaque capacité attendue par le sujet est couverte par au moins un cas d’utilisation.

*Tableau – Couverture du besoin*

| Capacité attendue (sujet) | Cas d’utilisation |
| --- | --- |
| Inventaire du matériel | UC-GEST-01, UC-ADMIN-01, UC-GEST-05 |
| Recherche du matériel | UC-GEST-01, UC-ADMIN-01, UC-FORM-04 |
| Localisation du matériel | UC-GEST-01, UC-GEST-05, UC-FORM-04 |
| Affectation du matériel aux salles | UC-GEST-01, UC-ADMIN-01, UC-ADMIN-08 |
| Déplacement des équipements | UC-GEST-01, UC-GEST-04, UC-ADMIN-08 |
| Paramétrage des aptitudes (garantie du matériel) | UC-GEST-01, UC-ADMIN-01 |
| Consultation des applications installées | UC-ADMIN-02 |
| Réinstallation d’un poste | UC-ADMIN-03 |
| Réinstallation d’une salle | UC-ADMIN-03 |
| Remontées utilisateur | UC-FORM-03, UC-GEST-03, UC-ADMIN-05 |
| Supervision des processus métier | UC-FORM-01, UC-ADMIN-04 |
| Contrôle des processus autorisés ou interdits | UC-ADMIN-04, UC-SADMIN-03 |
| Arrêt d’un processus | UC-FORM-01, UC-ADMIN-04 |
| Statistiques d’utilisation | UC-ADMIN-04 |
| Tableau de bord | UC-GEST-07, UC-ADMIN-09, UC-FORM-04 |
| Production de documents d’état des lieux | UC-FORM-03, UC-GEST-03, UC-ADMIN-05 |

### 11.2 Des cas d’utilisation aux règles de gestion

<!-- dse:matrice -->

## 12. Points ouverts

Les points suivants restent à arbitrer. Ils ne remettent pas en cause les exigences du présent dossier, qui décrivent le fonctionnement retenu.

*Tableau – Points ouverts*

| N° | Sujet | État |
| --- | --- | --- |
| PO-01 | Solution d’administration des postes Windows | Deux options étudiées : Microsoft Configuration Manager, déjà présent au ministère, ou un agent dédié développé par l’équipe. Dans les deux cas, le poste reste la source de vérité et ORION pilote les demandes. |
| PO-02 | Intégration de MindefConnect | Le service est retenu ; les accès, le contrat d’intégration et les attributs transmis restent à obtenir. |
| PO-03 | Indicateurs des statistiques d’utilisation | L’administrateur consulte les statistiques ; les indicateurs et leurs règles de calcul restent à préciser (RG-68). |
| PO-04 | Volumétrie et performances | Nombre d’utilisateurs simultanés, temps de réponse et disponibilité attendus à confirmer par des essais de charge. |
| PO-05 | Écarts avec la première version demandée | Le dossier vise le produit final : super administrateur et plusieurs écoles, statuts « en cours » et « corrigé », identifiant ORION distinct du numéro de série, affichage des notifications. Ces choix sont présentés au client. |

## Annexes

- [Glossaire](../01-CONTEXTE/01-GLOSSAIRE.md) : abréviations, termes métier et conventions de lecture des diagrammes.
- [Règles de gestion](02-CAPTURE-DES-BESOINS/01-REGLES-DE-GESTION.md) : les règles de gestion RG-01 à RG-100, classées par thème, avec leur origine.
- [Matrice des droits](02-CAPTURE-DES-BESOINS/11-MATRICE-DROITS.md) : droits des quatre profils, action par action, avec les règles qui les fondent.
- [Fiches descriptives – Gestionnaire](02-CAPTURE-DES-BESOINS/12-FICHE-DESCRIPTIVE-GESTIONNAIRE.md) : UC-GEST-01 à UC-GEST-07 : scénarios, maquettes et diagrammes d’activité.
- [Fiches descriptives – Formateur](02-CAPTURE-DES-BESOINS/13-FICHE-DESCRIPTIVE-FORMATEUR.md) : UC-FORM-01 à UC-FORM-04 : scénarios, maquettes et diagrammes d’activité.
- [Fiches descriptives – Administrateur](02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md) : UC-ADMIN-01 à UC-ADMIN-09 : scénarios, maquettes et diagrammes d’activité.
- [Fiches descriptives – Super administrateur](02-CAPTURE-DES-BESOINS/15-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md) : UC-SADMIN-01 à UC-SADMIN-05 : scénarios, maquettes et diagrammes d’activité.
