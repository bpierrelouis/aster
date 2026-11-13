# Règles de gestion de l'application ORION

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 1.6 | 13/11/2026 | Production destinée à la remise | Développer le sigle ORION et garantir RG-73 côté serveur | [7 versions](../archive/README.md#04-regles-de-gestion) |
<!-- version:fin -->

Ce document formalise uniquement les règles confirmées qui imposent une contrainte sur les données, les droits des utilisateurs ou les traitements réalisés par ORION. Il s'appuie sur les [consignes du projet](01-CONSIGNES.md), les [entretiens des 22 et 23 octobre et du 4 novembre](03-COMPTE-RENDU-ENTRETIENS.md), le fonctionnement de l'application ORION et le [cadrage consolidé](02-CADRAGE.md).

Les limites du périmètre, les questions ouvertes et les réponses historiques remplacées restent documentées dans le cadrage et les comptes rendus, mais ne sont pas considérées ici comme des règles de gestion.

## 1. Règles relatives aux données

- **RG-01 — Profils utilisateurs.** Le profil d'un utilisateur est obligatoirement l'une des quatre valeurs suivantes : administrateur, gestionnaire, formateur ou super administrateur (décision de l’utilisateur du 3 novembre).
- **RG-02 — Organisation géographique.** Une école comprend des bâtiments ; un bâtiment comprend des étages ; une salle est située à un étage d'un bâtiment. Un étage peut exister sans salle. Le numéro d'étage est compris entre -5 et 30 (application, 9 novembre).
- **RG-03 — Identifiant du matériel.** Chaque matériel possède un identifiant interne unique, attribué et géré automatiquement par ORION, consultable mais non saisi par l'utilisateur.
- **RG-04 — Numéro de série.** Le numéro de série est distinct de l'identifiant interne. Il est facultatif lorsqu'un matériel n'en possède pas.
- **RG-05 — Données obligatoires du matériel.** Le modèle, la date de réception et l'indication « hors service : oui/non » sont obligatoires.
- **RG-06 — Désignation du modèle.** Le modèle peut être une simple désignation du matériel lorsqu'aucune référence constructeur n'est disponible.
- **RG-07 — Marque du matériel.** La marque est facultative.
- **RG-08 — État du matériel.** L'état est une valeur binaire « hors service : oui/non ». Sa valeur par défaut à la création est « non ».
- **RG-09 — Localisation du matériel.** Un matériel est affecté au maximum à une salle. L'école et le bâtiment sont connus par cette salle ; ils ne constituent pas des destinations d'affectation directes du matériel. Un matériel en stock reste sans localisation.
- **RG-10 — Destination de l'affectation.** Un matériel ne peut pas être affecté à une personne.
- **RG-11 — Contenu d'une remontée.** Une remontée concerne un ou plusieurs matériels et comporte obligatoirement une description du problème.
- **RG-12 — Localisation d'une remontée.** La localisation présentée pour une remontée provient du ou des matériels concernés.
- **RG-13 — Statut de la remontée.** Le statut d'une remontée est « en attente », « remplacé » ou « corrigé ». Il est commun à la remontée entière, quel que soit le nombre de matériels concernés ; aucun statut de traitement distinct n’est porté par chaque matériel de cette remontée.
- **RG-14 — Contenu de l'état des lieux.** Le PDF d'état des lieux contient le matériel ou son type, le type de problème, sa description et la localisation du ou des matériels lorsqu'elle est renseignée. Il indique également le numéro de la remontée, son auteur et sa date de création (application, 9 novembre). Il reprend les informations du moment où il est produit, selon RG-35 (application, 12 novembre).

## 2. Règles relatives aux droits

- **RG-15 — Droits des administrateurs.** L'administrateur peut réaliser toutes les actions proposées par ORION dans son école de rattachement. Le super administrateur dispose des mêmes droits sur l'ensemble des écoles ; il est seul à gérer les écoles, les entrées de whitelist et de blacklist de portée globale et les comptes de super administrateur (application, 9 novembre).
- **RG-16 — Périmètre du gestionnaire.** Le gestionnaire intervient sur l'ensemble du parc de son école de rattachement, sans restriction à un bâtiment (décision de l’utilisateur du 3 novembre).
- **RG-17 — Gestion des matériels.** Le gestionnaire peut créer, consulter et modifier les matériels, mais ne peut pas les supprimer.
- **RG-18 — Stocks et affectations.** Le gestionnaire peut gérer les stocks, affecter les matériels et les déplacer.
- **RG-19 — Supervision par le formateur.** Le formateur peut accéder à une salle, consulter les processus utilisateur qui y sont remontés et arrêter ces processus.
- **RG-20 — Protection des processus système.** Le formateur ne peut ni consulter ni arrêter les processus du système d'exploitation.
- **RG-21 — Création d'une remontée.** Le formateur et l'administrateur peuvent créer une remontée concernant un ou plusieurs matériels.
- **RG-22 — Masterisation.** L’administrateur déclenche depuis ORION la masterisation d’un ou de plusieurs postes de son école, notamment de l’ensemble des postes d’une salle (application, 9 novembre).
- **RG-23 — Consultation des états des lieux.** Le gestionnaire et l'administrateur peuvent consulter et télécharger tous les PDF d'état des lieux. Le formateur peut consulter et télécharger uniquement le PDF d’une remontée qu’il a lui-même créée (décision de l’utilisateur du 3 novembre).
- **RG-24 — Accès aux tableaux de bord.** Le gestionnaire et l'administrateur peuvent consulter les tableaux de bord spécialisés du parc et des remontées.

## 3. Règles relatives aux traitements

- **RG-25 — Exécution d'une action autorisée.** Une action autorisée est exécutée sans validation préalable d'une seconde personne.
- **RG-26 — Prise d'effet d'une affectation.** Une affectation ou un déplacement de matériel prend effet immédiatement.
- **RG-27 — Affectation groupée.** Une même opération d'affectation peut concerner plusieurs matériels.
- **RG-28 — Enregistrement d'un matériel.** Chaque matériel est enregistré individuellement par saisie manuelle ou par import JSON. L'import JSON est accessible au gestionnaire et à l'administrateur.
- **RG-29 — Traitement d'un import JSON.** Les données d'un import JSON sont appliquées immédiatement, sans étape de validation métier préalable. L’application refuse toutefois un fichier illisible, vide, trop volumineux ou contenant un matériel incomplet ou techniquement invalide ; elle contrôle notamment les formats, les longueurs, le type de matériel et l’appartenance de la salle à l’école sélectionnée (application, 9 novembre).
- **RG-30 — Masterisation d'un poste.** La masterisation réapplique une image système sur le poste concerné au moyen du mécanisme de déploiement retenu.
- **RG-31 — Données de supervision.** ORION obtient à distance les processus utilisateur lancés sur le poste et l’utilisateur associé à chacun d’eux.
- **RG-32 — Filtrage des processus.** Les processus internes du système d'exploitation sont exclus des données de supervision présentées au formateur.
- **RG-33 — Arrêt d'un processus.** L'arrêt demandé depuis l'application web par un utilisateur autorisé porte uniquement sur un processus utilisateur présenté par ORION et est exécuté à distance sur le poste concerné. Seul un processus en cours peut être arrêté, et un seul arrêt peut être en attente pour un même processus. Le poste renvoie le résultat de l'arrêt, réussi ou en échec, qui est affiché dans ORION (application, 9 novembre).
- **RG-34 — Détermination de la localisation de la remontée.** ORION présente la localisation de chaque matériel concerné lorsqu'elle est renseignée.
- **RG-35 — Génération de l'état des lieux.** Le document d'état des lieux d'une remontée est généré au format PDF par le serveur ORION, à chaque demande d'un utilisateur autorisé à le consulter (RG-23). Il n'est pas conservé (client, 12 novembre).
- **RG-36 — Tableaux de bord spécialisés.** ORION propose plusieurs tableaux de bord spécialisés, dont un tableau de bord du parc et un tableau de bord des remontées. Le tableau de bord du parc présente l'état des stocks et permet un filtrage par salle (client, 22 octobre).
- **RG-37 — Affichage des notifications.** Une notification est affichée dans ORION sous la forme d'une fenêtre contextuelle lors de la connexion de son destinataire (client, 23 octobre).
- **RG-38 — Canal de notification.** ORION n'envoie pas les notifications par courriel.
- **RG-39 — Alertes de remontée.** Aucune alerte relative à une remontée n'est envoyée à l'administrateur.

## 4. Règles spécifiques à la supervision des processus

- **RG-40 — Séparation des domaines.** Les postes de supervision des processus et les matériels d'inventaire constituent deux ensembles de données indépendants. Un poste est géré dans le domaine de la supervision et un matériel dans celui du parc.
- **RG-41 — Identification d'un processus.** Un processus désigne un programme identifiable, distinct d'une exécution particulière. Il possède un identifiant et un nom ; un programme est reconnu par son nom, sans distinction de casse (application, 9 novembre).
- **RG-42 — Contexte d'exécution.** Une exécution associe un programme identifiable, un compte Windows et un poste. Sa date de démarrage est celle de sa première remontée par le poste. ORION présente les exécutions en cours sans historiser l'exécution en temps réel ; seules les détections sont conservées (RG-56) (application, 9 novembre).
- **RG-43 — Compte Windows supervisé.** Le compte Windows associé à l'exécution d'un programme est représenté par l'entité `COMPTE_WINDOWS`, qui possède l'identifiant interne `Id_compte` et le champ `nom_utilisateur`. Cette entité est distincte de l'utilisateur authentifié dans ORION. Le champ `nom_utilisateur` correspond au nom du compte Windows utilisé sur le poste. Un même nom de compte Windows utilisé sur plusieurs postes représente une seule et même entité, et non une connexion particulière à un poste (confirmations de l'utilisateur du 2 novembre, répercutées dans le MCD le 3 novembre).
- **RG-44 — Informations affichées.** Pour chaque processus en cours, ORION affiche le nom, le compte Windows, le poste, la salle et son classement. Lorsqu'une action est demandée ou réalisée, son état et son résultat sont également affichés (application, 9 novembre).
- **RG-45 — Classement d'un processus.** Un processus utilisateur est classé « whitelist », « blacklist » ou « non référencé ».
- **RG-46 — Processus autorisé.** Tout processus qui n'appartient pas à la blacklist est autorisé. La whitelist désigne les processus explicitement reconnus comme autorisés ; un processus absent des deux listes est autorisé et classé « non référencé ».
- **RG-47 — Portée des listes.** Une entrée de whitelist ou de blacklist s'applique globalement ou à une école, un bâtiment ou une salle. Chaque entrée possède une seule portée ; une portée bâtiment désigne un bâtiment d’une école donnée (application, 9 novembre).
- **RG-48 — Cumul des règles.** Les règles applicables aux postes d'une salle se cumulent depuis le niveau global jusqu'à cette salle. Une interdiction héritée ne peut pas être annulée à un niveau inférieur.
- **RG-49 — Priorité de la blacklist.** Lorsqu'un processus correspond simultanément à la whitelist et à la blacklist, il est considéré comme blacklisté.
- **RG-50 — Gestion des listes.** Seuls l'administrateur et le super administrateur peuvent ajouter, modifier ou supprimer une entrée de whitelist ou de blacklist. L'administrateur gère les entrées de portée école, bâtiment ou salle de son école et consulte les entrées globales ; seul le super administrateur gère les entrées de portée globale (application, 9 novembre).
- **RG-51 — Traitement d'un processus whitelisté.** Un processus whitelisté est visible dans la supervision en temps réel, sans conservation de son historique d'exécution.
- **RG-52 — Traitement d'un processus non référencé.** Un processus non référencé reste autorisé, est visible dans la supervision en temps réel et fait l'objet d'un historique de détection.
- **RG-53 — Traitement d'un processus blacklisté.** Un processus blacklisté est arrêté automatiquement sur le poste concerné et fait l'objet d'une alerte et d'un historique dans ORION.
- **RG-54 — Arrêt automatique.** ORION déclenche l'arrêt automatique d'un processus blacklisté sans demander de confirmation ni de justification et sans prévenir l'utilisateur du poste.
- **RG-55 — Destinataires de l'alerte.** L'alerte provoquée par un processus blacklisté est notifiée à l'administrateur et au super administrateur ; le formateur la consulte dans les alertes de la salle qu'il supervise (application, 9 novembre).
- **RG-56 — Contenu de l'historique.** L'historique d'une détection blacklistée ou non référencée conserve le poste, la salle, le compte Windows, le nom du processus, la date de détection et le classement. Pour un processus blacklisté, il conserve également le résultat de l'arrêt automatique. Les détections sont conservées trente jours (application, 9 novembre).
- **RG-57 — Fréquence de supervision.** Les données de supervision d'un poste sont actualisées toutes les cinq secondes.
- **RG-58 — Poste déconnecté.** Un poste sans remontée depuis trente secondes est considéré comme déconnecté : ses processus en cours sont clos et il reste visible dans sa salle, sans processus affiché (application, 9 novembre).
- **RG-59 — Périmètre du formateur.** Le formateur peut superviser toutes les salles de son école de rattachement, mais doit entrer dans une salle pour consulter et gérer ses postes ; il ne dispose pas d'une vue globale de supervision (décision de l’utilisateur du 3 novembre).
- **RG-60 — Rattachement d'un utilisateur.** L’administrateur, le gestionnaire et le formateur sont rattachés à une et une seule école. Le super administrateur n’est rattaché à aucune école (décision de l’utilisateur du 3 novembre).
- **RG-61 — Noms et identification des lieux.** Une école et une salle possèdent chacune un nom. Le nom et le bâtiment d'une salle sont obligatoires. Un bâtiment est identifié dans son école, et un étage par son numéro dans son bâtiment (application, 9 novembre).
- **RG-62 — Identifiants de connexion.** Chaque utilisateur ORION s’authentifie via MindefConnect avant d’accéder à l’application (cadrage § 18).
- **RG-63 — Auteur d'une remontée.** Chaque remontée est déclarée par un et un seul utilisateur ORION. Un utilisateur ORION peut déclarer plusieurs remontées.
- **RG-64 — Traitement et suivi d'une remontée.** Le gestionnaire traite les remontées de son école ; l'administrateur peut également intervenir dans son école et le super administrateur dans toutes les écoles. Le gestionnaire peut faire passer une remontée de « en attente » à « remplacé » ; l'administrateur et le super administrateur peuvent la faire passer de « en attente » à « remplacé » ou à « corrigé ». Une remontée traitée ne change plus de statut. Chaque changement de statut est conservé avec sa date et son auteur. Le formateur suit l'avancement des remontées qu'il a lui-même créées (application, 9 novembre).

## 5. Règles complémentaires relatives aux droits et traitements

- **RG-65 — Administration des applications.** L’administrateur peut déclencher à distance l’installation et la désinstallation d’une application depuis ORION, pour un poste individuel ou l’ensemble des postes d’une salle (décision de l’utilisateur du 3 novembre).
- **RG-66 — Notification de l’auteur d’une remontée.** Le formateur reçoit dans ORION une notification lorsque le statut d’une remontée qu’il a lui-même créée change. Cette notification n’est pas envoyée par courriel (décision de l’utilisateur du 3 novembre).
- **RG-67 — Notification d’une nouvelle remontée.** Le gestionnaire reçoit dans ORION une notification à la création de chaque nouvelle remontée. Cette notification n’est pas envoyée par courriel (décision de l’utilisateur du 3 novembre).
- **RG-68 — Statistiques de supervision.** L’administrateur peut consulter dans ORION des statistiques d’utilisation des postes et des processus. Les indicateurs et leurs règles de calcul restent à définir (décision de l’utilisateur du 3 novembre).
- **RG-69 — Périmètre par école.** L’administrateur, le gestionnaire et le formateur accèdent uniquement aux données de leur école de rattachement. Le super administrateur accède aux données de toutes les écoles (décision de l’utilisateur du 3 novembre). Le catalogue des applications et les entrées de whitelist et de blacklist de portée globale sont communs à toutes les écoles (application, 9 novembre).
- **RG-70 — Gestion des comptes ORION.** L’administrateur peut créer, modifier, désactiver et réactiver les comptes rattachés à son école. Le super administrateur réalise ces actions pour les comptes de toutes les écoles. Le gestionnaire et le formateur ne gèrent pas les comptes ORION (décision de l’utilisateur du 3 novembre).
- **RG-71 — Profil unique.** Chaque utilisateur ORION possède exactement un profil. Le cumul des profils administrateur, gestionnaire, formateur et super administrateur n’est pas autorisé (décision de l’utilisateur du 3 novembre).
- **RG-72 — École du matériel.** Chaque matériel est rattaché à une et une seule école, y compris lorsqu’il est en stock. Lorsqu’il est affecté, sa salle appartient à cette école (arbitrage délégué par l’utilisateur le 9 novembre, en application de RG-09, RG-16 et RG-69). Ce rattachement ne peut pas être modifié (application, 9 novembre).
- **RG-73 — Conservation d’un matériel cité.** Un matériel concerné par une remontée ne peut pas être supprimé : sa fiche est conservée pour que la remontée reste consultable avec ses matériels (application et orientation de l’utilisateur, 9 novembre).

## 6. Règles relatives à l'organisation, à l'intégrité des données et à l'accès

- **RG-74 — Gestion des salles et des étages.** Seuls l'administrateur et le super administrateur créent, modifient et suppriment les salles et les étages de leur périmètre (application, 9 novembre).
- **RG-75 — Suppression d'une salle.** Une salle qui accueille des postes supervisés ne peut pas être supprimée. À la suppression d'une salle, ses matériels passent en stock (application, 9 novembre).
- **RG-76 — Gestion des écoles.** Seul le super administrateur crée et renomme les écoles (application, 9 novembre).
- **RG-77 — Postes supervisés et catalogue des applications.** Seuls l'administrateur et le super administrateur gèrent les postes supervisés et le catalogue des applications. Ce catalogue est commun à toutes les écoles. Un poste appartient à une salle existante (application, 9 novembre).
- **RG-78 — Consultation du parc par le formateur.** Le formateur consulte les salles et les matériels de son école, sans pouvoir les créer, les modifier, les affecter ni les supprimer (application, 9 novembre).
- **RG-79 — Intégrité d'une remontée.** Une remontée est numérotée par ORION et créée au statut « en attente ». Ses matériels appartiennent à son école. Elle ne peut être ni supprimée ni modifiée, à l'exception de son statut (RG-64). Le gestionnaire ne peut pas créer de remontée (application, 9 novembre).
- **RG-80 — Consultation des remontées.** Le gestionnaire et l'administrateur consultent toutes les remontées de leur école, et le super administrateur celles de toutes les écoles ; le formateur consulte uniquement les remontées qu'il a lui-même créées (application, 9 novembre).
- **RG-81 — Interventions sur les postes.** Une intervention (arrêt, installation, désinstallation ou réinstallation) porte sur un à cinq cents postes d'une seule école. Elle ne peut pas être supprimée. Son suivi est mis à jour poste par poste par les postes eux-mêmes ; lorsque tous les postes ont répondu, l’intervention est terminée si tous ont réussi et en échec sinon. Le formateur ne voit que les demandes d'arrêt (application, 9 novembre).
- **RG-82 — Protection des comptes ORION.** Un compte ORION n'est jamais supprimé ; il est désactivé. Son adresse électronique est unique. Un utilisateur ne peut ni modifier son propre profil ou son école de rattachement, ni désactiver son propre compte. Seul le super administrateur attribue le profil de super administrateur (application, 9 novembre).
- **RG-83 — Exclusion du gestionnaire de la supervision.** Le gestionnaire n'a accès ni aux postes, ni aux processus, ni aux détections, ni aux applications installées (application, 9 novembre).
- **RG-84 — Tableau de bord personnel et école affichée.** Chaque profil dispose d'un tableau de bord personnel qu'il peut personnaliser. Le super administrateur choisit l'école affichée ou l'ensemble des écoles (application, 9 novembre).
- **RG-85 — Accès par compte ORION actif.** Après l'authentification par MindefConnect (RG-62), l'accès à ORION exige un compte ORION actif correspondant à l'identité transmise. Une identité sans compte actif est refusée ; la désactivation d'un compte prend effet immédiatement (application, 9 novembre).
- **RG-86 — Gestion des garanties.** La date de fin de garantie d'un matériel est facultative ; le gestionnaire et l'administrateur la renseignent et la modifient. Une garantie est signalée comme proche de l'échéance six mois avant sa fin (client, 22 octobre), puis comme échue à son échéance. Seul le gestionnaire reçoit l'alerte de garantie (application, 9 novembre).
