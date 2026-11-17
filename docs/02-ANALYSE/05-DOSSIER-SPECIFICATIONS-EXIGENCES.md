# Dossier de spécifications des exigences

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 3.0 | 17/11/2026 | Production destinée à la remise | Déclarer les écarts avec le client, les interfaces externes et les priorités | [3 versions](../../archive/README.md#05-dossier-specifications-exigences) |
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
| IE | Interface externe, identifiée IE-nn (chapitre 9). |
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
- Chaque exigence porte un identifiant unique et stable : UC-PROFIL-nn pour les cas d’utilisation (GEST, FORM, ADMIN, SADMIN), RG-nn pour les règles de gestion, ENF-nn pour les exigences non fonctionnelles, IE-nn pour les interfaces externes.
- Les cas d’utilisation, les exigences non fonctionnelles et les interfaces externes portent une priorité : **essentielle** pour une capacité attendue par le sujet ou une contrainte imposée, **importante** pour une demande du client qui la complète, **complémentaire** pour une capacité du produit final au-delà de la première version demandée (§ 2.9).
- Les diagrammes suivent UML 2.5 ; le modèle conceptuel de données suit Merise. Les acteurs abstraits des DCU regroupent des participations communes et ne constituent pas des profils supplémentaires (annexe A, conventions de lecture).
- Les termes de l’interface sont écrits en gras dans les fiches descriptives (par exemple **Signaler un problème**).

### 1.6 Organisation du document

*Tableau – Organisation du document*

| Partie | Contenu |
| --- | --- |
| 2 | Description générale : contexte, objectifs, périmètre, acteurs, contraintes, hypothèses et écarts avec la demande du client. |
| 3 | Modélisation métier : processus de l’organisation. |
| 4 | Exigences fonctionnelles : domaines, cas d’utilisation, diagrammes d’activité et de séquence système. |
| 5 | Exigences sur les données : MCD et diagramme de classes métier. |
| 6 et 7 | Règles de gestion et droits d’accès (détail en annexes B et C). |
| 8 | Exigences non fonctionnelles. |
| 9 | Interfaces externes. |
| 10 et 11 | Modèles d’analyse et de conception, dont le modèle logique et le modèle physique de données. |
| 12 | Traçabilité du besoin vers les cas d’utilisation et les règles de gestion. |
| 13 | Points ouverts. |
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
| Gestion du parc : matériels, stock, affectations, déplacements, garanties, import JSON. | Gestion des formations, paramétrage des formations induites et suivi des personnes formées. |
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
- L’authentification est confiée à MindefConnect, joint sur Internet ; ORION ne gère aucun mot de passe (RG-62, RG-85).
- ORION est hébergé sur le C1NP ; ses produits figurent dans la pile logicielle autorisée du CCT (R3).
- Aucun stockage de fichiers : les états des lieux PDF sont produits par le serveur à chaque demande et ne sont pas conservés (RG-35).
- Les notifications sont présentées dans ORION ; aucun courriel n’est envoyé (RG-38).
- Les postes supervisés sont des postes Windows ; seuls les postes alimentent processus, détections et applications installées.

### 2.8 Hypothèses et dépendances

- La solution d’administration des postes Windows reste à choisir (chapitre 13). ORION en est indépendant : il émet des demandes d’intervention et reçoit l’état des postes et le résultat des interventions.
- Les modalités d’intégration de MindefConnect (accès, attributs d’identité) sont fournies par le ministère.
- Le premier palier de production vise 1 000 postes actifs ; la charge sera confirmée par des essais.

### 2.9 Écarts avec la demande du client

Ce dossier décrit le produit final, au-delà de la première version demandée par le client lors des entretiens (R2). Les écarts ci-dessous sont présentés au client (PO-05).

*Tableau – Écarts avec la demande du client*

| Sujet | Demande du client | Choix retenu | Justification |
| --- | --- | --- | --- |
| Profils et écoles | Administrateur, gestionnaire et formateur ; une seule école, extensible ; gestionnaires à l’échelle globale. | Un profil super administrateur en plus ; plusieurs écoles, chaque utilisateur étant rattaché à la sienne (RG-15, RG-60, RG-69). | Le produit final sert plusieurs écoles : un profil transverse gère les écoles et les règles globales, chaque école reste cloisonnée. |
| Changement d’école d’un matériel | Une seule école. | Transfert d’un matériel connu par un import JSON validé par l’importeur (RG-72). | Les écoles échangent du matériel. |
| Identifiant du matériel | Le numéro de série. | Identifiant ORION attribué automatiquement ; numéro de série facultatif (RG-03, RG-04). | Certains matériels, comme les câbles, n’ont pas de numéro de série. |
| Statuts du matériel | Utilisé, en stock ou hors service. | Indication « hors service » distincte ; stock défini par l’absence de salle ; suivi de l’installation physique (RG-08, RG-09, RG-92). | Un matériel hors service peut rester dans une salle ; savoir si un matériel affecté est réellement installé. |
| Création d’une remontée | Seul le formateur crée des remontées. | Le formateur, l’administrateur et le super administrateur ; type de problème obligatoire (RG-21). | L’administrateur peut réaliser toutes les actions de son école, signalement compris. |
| Statuts d’une remontée | « En attente » et « remplacé ». | « En attente », « en cours », puis « remplacé » ou « corrigé » ; toute la vie de la remontée est conservée (RG-13, RG-64). | Suivre la prise en charge et terminer une remontée résolue sans remplacement. |
| Alertes de l’administrateur | L’administrateur ne reçoit pas d’alerte sur les remontées. | Il n’est pas notifié des remontées des autres ; il l’est de ses propres remontées, des interventions qu’il a lancées, des applications interdites, des matériels à déplacer et des garanties (RG-39, RG-86). | Être informé des suites de ses propres actions et des alertes de son école. |
| Affichage des notifications | Fenêtre contextuelle à la connexion. | Compteur dans la barre supérieure, résumé et page Notifications (RG-37). | Les notifications restent consultables à tout moment sans interrompre l’arrivée dans l’application. |
| Tableau de bord du parc | Filtré par salle. | Part hors service par bâtiment et salles à surveiller ; détail par salle dans la vue des salles (RG-36). | Une vue d’ensemble de l’école, le détail restant accessible salle par salle. |
| Import JSON | Mise à jour immédiate, sans vérification. | Fichier invalide refusé en entier ; aperçu des incohérences ; matériels déjà présents ignorés (RG-29). | Éviter les doublons et les données incomplètes dans l’inventaire. |
| Inventaire | Aucune campagne d’inventaire. | Recensement à la demande avec RIGEL, sur tout ou partie d’une école, pendant 14 jours au plus (RG-93 à RG-96). | Vérifier sur place la présence des matériels sans saisie manuelle. |
| Historique des mouvements | Aucun historique des mouvements de matériels. | Pas d’historique des mouvements ; ORION conserve le déplacement en cours et les constats datés des recensements (RG-92, RG-95). | Les constats établissent la présence vérifiée d’un matériel. |
| Rôle d’un matériel | Sa destination, par exemple pour une formation. | Non géré : seul le type de matériel est renseigné. | Aucune règle d’usage de cette information n’a été exprimée ; à préciser avec le client. |

## 3. Modélisation métier

Les [diagrammes d’activité métier](01-MODELISATION-METIER/02-DIAGRAMMES-ACTIVITE.md) décrivent les processus de l’organisation que l’application doit outiller, indépendamment des écrans.

## 4. Exigences fonctionnelles

Les exigences fonctionnelles sont exprimées par des cas d’utilisation, regroupés par domaine dans des DCU. Chaque cas d’utilisation est détaillé dans la fiche descriptive de son profil (annexes D à G) : récit utilisateur, critères d’acceptation, règles de gestion, besoins non fonctionnels, interface, préconditions, scénario nominal, scénarios alternatifs et d’exception, maquettes et diagrammes d’activité.

### 4.1 Gestion du parc

Inventaire, recherche, localisation et affectation des matériels, stock, import JSON, installation des salles et recensement avec RIGEL ([DCU — Gérer le parc](02-CAPTURE-DES-BESOINS/03-DCU-GESTION-PARC.md)).

*Tableau – Cas d’utilisation – Gestion du parc*

<!-- dse:cas UC-GEST-01=1 UC-GEST-02=1 UC-GEST-04=3 UC-GEST-05=3 UC-GEST-06=3 UC-ADMIN-01=1 UC-ADMIN-07=2 UC-ADMIN-08=3 UC-FORM-04=1 -->

### 4.2 Administration des postes

Consultation des applications d’un poste, installation et désinstallation d’applications, réinitialisation d’un poste ou d’une salle, suivi des interventions ([DCU — Administrer les postes](02-CAPTURE-DES-BESOINS/04-DCU-ADMINISTRATION-POSTES.md)).

*Tableau – Cas d’utilisation – Administration des postes*

<!-- dse:cas UC-ADMIN-02=1 UC-ADMIN-03=1 -->

### 4.3 Supervision des postes

État des postes d’une salle, processus utilisateur, arrêt d’un processus, listes autorisées et interdites, détections et statistiques ([DCU — Superviser les postes](02-CAPTURE-DES-BESOINS/05-DCU-SUPERVISION-POSTES.md)).

*Tableau – Cas d’utilisation – Supervision des postes*

<!-- dse:cas UC-FORM-01=1 UC-FORM-02=1 UC-ADMIN-04=1 UC-SADMIN-03=3 -->

### 4.4 Remontées utilisateur

Signalement d’un problème sur des matériels, traitement par le gestionnaire ou un administrateur, suivi des statuts et état des lieux PDF ([DCU — Créer une remontée et consulter son état des lieux](02-CAPTURE-DES-BESOINS/06-DCU-REMONTEES-UTILISATEUR.md)).

*Tableau – Cas d’utilisation – Remontées utilisateur*

<!-- dse:cas UC-FORM-03=1 UC-GEST-03=1 UC-ADMIN-05=1 -->

### 4.5 Administration d’ORION et espace personnel

Écoles, comptes ORION, école affichée, tableaux de bord personnalisables et notifications ([DCU — Administrer ORION et personnaliser son espace](02-CAPTURE-DES-BESOINS/07-DCU-ADMINISTRER-ORION.md)).

*Tableau – Cas d’utilisation – Administration d’ORION et espace personnel*

<!-- dse:cas UC-ADMIN-06=2 UC-ADMIN-09=1 UC-GEST-07=1 UC-SADMIN-01=3 UC-SADMIN-02=3 UC-SADMIN-04=3 UC-SADMIN-05=3 -->

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

| N° | Catégorie | Exigence | Priorité | Source |
| --- | --- | --- | --- | --- |
| ENF-01 | Accès | ORION est une application web utilisable avec Firefox depuis les postes des écoles, sans installation sur le poste. | Essentielle | Sujet, fiches |
| ENF-02 | Authentification | Chaque utilisateur s’authentifie par MindefConnect ; l’accès exige ensuite un compte ORION actif. Une désactivation prend effet immédiatement. | Essentielle | RG-62, RG-85 |
| ENF-03 | Authentification | La déconnexion met fin à la session ORION puis à celle de MindefConnect. | Importante | RG-99 |
| ENF-04 | Sécurité | Les droits, le périmètre par école et les valeurs d’autorité sont contrôlés par le serveur ; un navigateur ne reçoit que les données de son périmètre. | Essentielle | RG-69, RG-79 |
| ENF-05 | Sécurité | Les processus du système d’exploitation ne sont ni présentés ni proposés à l’arrêt. | Essentielle | RG-20, RG-32 |
| ENF-06 | Intégrité | Un compte ORION, une remontée et un constat RIGEL ne sont jamais supprimés ; un matériel cité par une remontée est conservé. | Importante | RG-73, RG-79, RG-82, RG-95 |
| ENF-07 | Traçabilité | Le suivi d’une remontée conserve chaque changement de statut, daté. | Importante | RG-64 |
| ENF-08 | Fraîcheur | Les données de supervision d’un poste sont actualisées toutes les cinq secondes. | Importante | RG-57 |
| ENF-09 | Disponibilité des postes | Un poste sans remontée depuis trente secondes est présenté comme déconnecté. | Importante | RG-58 |
| ENF-10 | Conservation | Les détections de processus blacklistés ou non référencés sont conservées trente jours. | Importante | RG-56 |
| ENF-11 | Documents | Le PDF d’état des lieux est produit par le serveur à chaque demande, avec les informations du moment, et n’est pas conservé. | Essentielle | RG-35, RG-89 |
| ENF-12 | Notifications | Les notifications sont présentées dans ORION ; aucun courriel n’est envoyé. | Importante | RG-37, RG-38 |
| ENF-13 | Mobilité | RIGEL fonctionne hors connexion et transmet ses constats au retour du réseau ; un scan plus ancien que la dernière information connue est refusé. | Complémentaire | RG-94 |
| ENF-14 | Concurrence | Plusieurs utilisateurs travaillent simultanément sans se bloquer ; les écritures concurrentes sont fusionnées élément par élément. | Importante | Conception (chapitre 11) |
| ENF-15 | Ergonomie | Chaque utilisateur retrouve à chaque connexion son ambiance d’affichage et ses tableaux de bord personnalisés. | Complémentaire | RG-84, RG-97 |
| ENF-16 | Ergonomie | La recherche globale porte sur les salles, matériels et remontées accessibles, sans tenir compte de la casse. | Complémentaire | RG-98 |
| ENF-17 | Import | Un import JSON accepte au plus 2 000 matériels et 2 Mo ; un fichier illisible, vide, trop volumineux ou invalide est refusé. | Importante | RG-29 |
| ENF-18 | Capacité | Le premier palier de production vise 1 000 postes actifs, avec une extension envisagée à 5 000. | Essentielle | Hypothèse (§ 2.8) |
| ENF-19 | Hébergement | ORION est hébergé sur le C1NP avec des produits de la pile logicielle autorisée du CCT ; il accède à MindefConnect sur Internet (IE-01). | Essentielle | Sujet, R3 |
| ENF-20 | Journalisation | Chaque requête à l’API, chaque connexion, refus de connexion et déconnexion, chaque écriture d’un utilisateur, chaque refus d’un droit ou d’une règle et chaque résultat d’intervention est journalisé avec le compte concerné et, pour une requête, l’adresse IP du client, le statut et la durée. Les journaux ne contiennent ni secret, ni jeton, ni contenu de requête et sont transmis au puits de logs (IE-02). | Essentielle | Sujet, RG-99 |
| ENF-21 | Données personnelles | ORION ne conserve sur un utilisateur que son nom, son adresse électronique, son profil, son école et l’état de son compte, et sur les postes que le compte Windows associé à une détection, pendant trente jours. Ces données ne sont accessibles que dans le périmètre de l’école (RG-69) ; aucun mot de passe n’est conservé. | Essentielle | RG-56, RG-62, RG-69 |

## 9. Interfaces externes

ORION échange avec les systèmes suivants. Chaque interface est sécurisée par HTTPS ou TLS ; les protocoles, ports et flux sont décrits dans le dossier d’architecture technique (R6).

*Tableau – Interfaces externes*

| N° | Interface | Échanges | Exigence | Priorité | Source |
| --- | --- | --- | --- | --- | --- |
| IE-01 | MindefConnect, sur Internet | ORION redirige le navigateur vers MindefConnect pour l’authentification (OpenID Connect), reçoit l’identité de l’utilisateur, puis met fin à sa session à la déconnexion. | ORION accède à MindefConnect sur Internet ; il n’ouvre une session qu’à une identité qui correspond à un compte ORION actif. | Essentielle | Sujet, RG-62, RG-85, RG-99 |
| IE-02 | Puits de logs | ORION transmet ses journaux techniques (ENF-20) au puits de logs, en syslog (RFC 5424) sur TLS. | Les journaux de chaque composant d’ORION sont centralisés dans le puits de logs et consultables par les personnes habilitées. | Essentielle | Sujet |
| IE-03 | Agent d’administration des postes Windows | Le poste transmet son état, ses processus utilisateur et ses applications installées, reçoit en réponse les interventions à exécuter, puis renvoie leur résultat. | ORION reçoit ces échanges sur son API des postes (`/api/agent`), authentifiée ; il fixe seul le suivi des interventions. Le contrat définitif dépend de la solution retenue (PO-01). | Essentielle | Sujet, RG-57, RG-58, RG-81 |
| IE-04 | `/api/health` | État de fonctionnement d’ORION et de ses dépendances. | Le point d’accès est public et ne renvoie qu’un état global ; le détail des services est réservé au super administrateur connecté. | Essentielle | Sujet |
| IE-05 | `/api/infos` | Description de l’application : version publiée et démarrage. | Le point d’accès est public et ne renvoie que la description de l’application ; le détail technique est réservé au super administrateur connecté. | Essentielle | Sujet |

## 10. Modèles d’analyse

### 10.1 Diagrammes d’états

Les [diagrammes d’états](03-ANALYSE/01-DIAGRAMMES-ETATS.md) décrivent le cycle de vie des objets dont le statut conditionne les actions possibles.

### 10.2 Diagramme de classes d’analyse

Le [diagramme de classes d’analyse](03-ANALYSE/02-DIAGRAMME-CLASSES-ANALYSE.md) distingue les classes d’interface (dialogue), de contrôle et d’entité pour chaque domaine.

## 11. Modèles de conception

### 11.1 Diagramme de classes de conception

Le [diagramme de classes de conception](04-CONCEPTION/01-DIAGRAMME-CLASSES-CONCEPTION.md) présente les classes majeures d’ORION avec leurs attributs, leurs méthodes et leurs associations, ainsi que les énumérations des statuts et des profils.

### 11.2 Diagrammes de séquence détaillés

Les [diagrammes de séquence détaillés](04-CONCEPTION/02-DIAGRAMMES-SEQUENCE-DETAILLES.md) décrivent les échanges entre les composants d’ORION pour les parcours les plus structurants.

### 11.3 Modèle logique de données

Le [modèle logique de données](04-CONCEPTION/03-MODELE-LOGIQUE-DONNEES.md) traduit le MCD en relations selon les règles de passage Merise : une entité devient une relation portant sa clé ; une association 1,1 – 0,N ou 1,1 – 1,N devient une clé étrangère du côté 1,1 ; une association 0,1 – 0,N devient une clé étrangère facultative ; une association N – N, ou porteuse d’attributs, devient une relation à clé composée. Chaque clé étrangère porte le nom de l’association d’origine ; les contraintes d’exclusion X (portée d’une règle) et XT (paquet) sont rappelées sur les relations concernées.

Le modèle physique conserve en tables relationnelles les données de référence et les remontées, et range en documents JSONB (table `donnee`, une collection par type) les données alimentées par les postes et par RIGEL : elles sont volumineuses, évoluent avec les rapports des postes et sont fusionnées élément par élément lors des écritures concurrentes, ce qu’un document par élément rend simple. Les relations sont celles du schéma relationnel ci-dessus.

*Tableau – Relations du MLD et implantation physique*

| Relation du MLD | Implantation physique | Écart et justification |
| --- | --- | --- |
| ÉCOLE | Table `ecole` (`id`, `nom`, `extra`). | Identique. |
| BÂTIMENT | Colonne `batiment` (texte) de `salle` et d’`etage`. | Pas de table : un bâtiment n’a pas d’attribut propre ; son nom suffit, unique par école. |
| ÉTAGE | Table `etage` (`ecole_id`, `batiment`, `niveau`, clé alternative sur les trois). | La clé étrangère vers le bâtiment devient le couple école + bâtiment. |
| SALLE | Table `salle` (`ecole_id`, `batiment`, `nom`, `etage`). | L’étage est porté par un numéro de niveau, pas par une clé vers `etage`. |
| COMPTE_ORION | Table `compte` (`email`, `role`, `ecole_id` nul si et seulement si super administrateur, `sujet`, `actif`, dates). | Identique ; `date_consultation_notifications` est dans `preference.consultation`. |
| MATÉRIEL | Table `materiel` (`id_orion`, `ecole_id`, `salle_id` nul en stock, `serie`, `mac`, garantie, hors service). | Identique. |
| DÉPLACEMENT | Documents `extra.deplacement` (en cours) et `extra.installation` (dernière installation) de `materiel`, avec origine `de`, date et auteur. | Seuls le déplacement en cours et la dernière installation sont conservés, sans historique ; la destination est la salle courante du matériel, et la confirmation remplace la demande. |
| REMONTÉE | Table `remontee` (`ecole_id`, `auteur_id`, `probleme`, `description`, `statut`). | Identique ; l’identifiant est le numéro de remontée. |
| ÉTAPE_REMONTÉE | Colonne `historique` (JSONB) de `remontee` : statut, date, auteur. | Document imbriqué : les étapes ne sont lues qu’avec leur remontée. |
| CONCERNER | Table `remontee_materiel` (`remontee_id`, `rang`, `materiel_id`). | Identique, avec l’ordre des matériels. |
| SYSTÈME_EXPLOITATION | Champ `os` (texte) du document `Poste`. | Pas de référentiel : le système est remonté tel quel par le poste. |
| APPLICATION | Documents de la collection `applications` (`nom`, `version`, `editeur`). | Identique, en JSONB. |
| PAQUET | Non implanté. | Déploiement des paquets prévu en V2 ; la contrainte XT n’a donc pas d’équivalent. |
| POSTE | Documents `postes` (`nomReseau`, `adresseIp`, `salleId`, `materielId`, `os`). | Identique ; l’unicité de l’unité centrale est contrôlée par le serveur. |
| ÉQUIPER | Documents `installations` (`posteId`, `applicationId`), identifiant `posteId-applicationId`. | Identique. |
| COMPTE_WINDOWS | Champ `compte` (texte) des documents `Processus` et `Detection`. | Pas de référentiel : le compte Windows est un nom remonté par le poste. |
| PROCESSUS (programme) | Champ `nom` des documents `Processus`, `Detection` et `Regle`. | Pas de référentiel : le document `Processus` du MPD est une exécution (poste, compte, début, fin) ; le programme n’est connu que par son nom. |
| RÈGLE | Documents `regles` (`nom`, `classement`, `portee`, `ecoleId`, `batiment`, `salleId`). | La contrainte X est portée par le champ `portee` (global, école, bâtiment, salle) ; `classement` exclut « non référencé ». |
| DÉTECTION | Documents `detections` (`posteId`, `compte`, `processus`, `classement`, `arret`). | Identique, avec les références textuelles ci-dessus. |
| INTERVENTION | Documents `interventions` (`type`, `par`, `parId`, `applicationId`, `image`, `processusId`, `detectionId`, `at`, `termineLe`, `statut`). | Identique ; le système d’exploitation à restaurer est le champ `image` (texte). |
| CIBLER | Champs `cibles` (liste de postes) et `resultats` (résultat par poste) du document `Intervention`. | La relation porteuse d’attribut devient un dictionnaire poste → résultat dans l’intervention. |
| OPÉRATION | Documents `operations` (`nom`, `mode`, `ecoleId`, `par`, `parId`, `at`, `expireLe`, `close`). | Identique. |
| INCLURE | Champ `salleIds` (liste) du document `Operation` ; liste vide : toute l’école. | Identique. |
| CONSTAT | Documents `constats` (`operationId`, `type`, `code`, `salleId`, `materielId`, `resultat`, `saisie`, `traite`). | Identique ; la saisie d’un code inconnu est un sous-document `saisie`. |

Les tables techniques du modèle physique (`espace`, `journal`, `migration`, `session`, `preference`) n’ont pas d’entité conceptuelle : elles portent la révision de l’espace de travail, le journal de fusion, les migrations appliquées, les sessions et les préférences d’affichage.

### 11.4 Modèle physique de données

Le [modèle physique des données](04-CONCEPTION/04-MODELE-PHYSIQUE-DONNEES.md) décrit les tables PostgreSQL d’ORION, leurs clés, contraintes et index, ainsi que les documents JSONB.

## 12. Traçabilité

### 12.1 Du besoin aux cas d’utilisation

Chaque capacité attendue par le sujet est couverte par au moins un cas d’utilisation, à l’exception du paramétrage des formations induites, annulé par le client.

*Tableau – Couverture du besoin*

| Capacité attendue (sujet) | Cas d’utilisation |
| --- | --- |
| Inventaire du matériel | UC-GEST-01, UC-ADMIN-01, UC-GEST-05 |
| Recherche du matériel | UC-GEST-01, UC-ADMIN-01, UC-FORM-04 |
| Localisation du matériel | UC-GEST-01, UC-GEST-05, UC-FORM-04 |
| Affectation du matériel aux salles | UC-GEST-01, UC-ADMIN-01, UC-ADMIN-08 |
| Déplacement des équipements | UC-GEST-01, UC-GEST-04, UC-ADMIN-08 |
| Paramétrage des aptitudes (garantie du matériel) | UC-GEST-01, UC-ADMIN-01 |
| Paramétrage des formations induites | Aucun : annulé par le client, hors du périmètre (§ 2.3). |
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

### 12.2 Des cas d’utilisation aux règles de gestion

<!-- dse:matrice -->

## 13. Points ouverts

Les points suivants restent à arbitrer. Ils ne remettent pas en cause les exigences du présent dossier, qui décrivent le fonctionnement retenu.

*Tableau – Points ouverts*

| N° | Sujet | État |
| --- | --- | --- |
| PO-01 | Solution d’administration des postes Windows | Deux options étudiées : Microsoft Configuration Manager, déjà présent au ministère, ou un agent dédié développé par l’équipe. Dans les deux cas, le poste reste la source de vérité et ORION pilote les demandes. |
| PO-02 | Intégration de MindefConnect | Le service est retenu ; les accès, le contrat d’intégration et les attributs transmis restent à obtenir. |
| PO-03 | Indicateurs des statistiques d’utilisation | L’administrateur consulte des statistiques d’utilisation des postes et des processus ; les indicateurs proposés (postes allumés, processus utilisateur actifs, détections conservées et détections par processus) restent à valider (RG-68). |
| PO-04 | Volumétrie et performances | Nombre d’utilisateurs simultanés, temps de réponse et disponibilité attendus à confirmer par des essais de charge. |
| PO-05 | Écarts avec la première version demandée | Le dossier vise le produit final ; les écarts avec la demande du client (§ 2.9) lui sont présentés. |

## Annexes

- [Glossaire](../01-CONTEXTE/01-GLOSSAIRE.md) : abréviations, termes métier et conventions de lecture des diagrammes.
- [Règles de gestion](02-CAPTURE-DES-BESOINS/01-REGLES-DE-GESTION.md) : les règles de gestion RG-01 à RG-100, classées par thème, avec leur origine.
- [Matrice des droits](02-CAPTURE-DES-BESOINS/11-MATRICE-DROITS.md) : droits des quatre profils, action par action, avec les règles qui les fondent.
- [Fiches descriptives – Gestionnaire](02-CAPTURE-DES-BESOINS/12-FICHE-DESCRIPTIVE-GESTIONNAIRE.md) : UC-GEST-01 à UC-GEST-07 : scénarios, maquettes et diagrammes d’activité.
- [Fiches descriptives – Formateur](02-CAPTURE-DES-BESOINS/13-FICHE-DESCRIPTIVE-FORMATEUR.md) : UC-FORM-01 à UC-FORM-04 : scénarios, maquettes et diagrammes d’activité.
- [Fiches descriptives – Administrateur](02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md) : UC-ADMIN-01 à UC-ADMIN-09 : scénarios, maquettes et diagrammes d’activité.
- [Fiches descriptives – Super administrateur](02-CAPTURE-DES-BESOINS/15-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md) : UC-SADMIN-01 à UC-SADMIN-05 : scénarios, maquettes et diagrammes d’activité.
