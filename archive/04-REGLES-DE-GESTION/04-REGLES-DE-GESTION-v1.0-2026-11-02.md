# Règles de gestion de l'application ASTER

Ce document formalise uniquement les règles confirmées qui imposent une contrainte sur les données, les droits des utilisateurs ou les traitements réalisés par ASTER. Il s'appuie sur les [consignes du projet](01-CONSIGNES.md), le [cadrage consolidé](02-CADRAGE.md) et les [entretiens des 22 et 23 octobre](03-COMPTE-RENDU-ENTRETIENS.md).

Les limites du périmètre, les fonctionnalités optionnelles, les questions ouvertes et les réponses historiques remplacées restent documentées dans le cadrage et les comptes rendus, mais ne sont pas considérées ici comme des règles de gestion.

## 1. Règles relatives aux données

- **RG-01 — Profils utilisateurs.** Le profil d'un utilisateur est obligatoirement l'une des trois valeurs suivantes : administrateur, gestionnaire ou formateur.
- **RG-02 — Organisation géographique.** Une salle appartient à une école et porte l'information de son bâtiment. Le bâtiment ne constitue pas une entité autonome (décision de l'utilisateur du 2 novembre).
- **RG-03 — Identifiant du matériel.** Chaque matériel possède un identifiant interne unique, attribué et géré automatiquement par ASTER, consultable mais non saisi par l'utilisateur.
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
- **RG-14 — Contenu de l'état des lieux.** Le PDF d'état des lieux contient le matériel ou son type, le type de problème, sa description et la localisation du ou des matériels lorsqu'elle est renseignée.

## 2. Règles relatives aux droits

- **RG-15 — Droits de l'administrateur.** L'administrateur peut réaliser toutes les actions proposées par ASTER.
- **RG-16 — Périmètre du gestionnaire.** Le gestionnaire intervient sur l'ensemble du parc, sans restriction à un bâtiment.
- **RG-17 — Gestion des matériels.** Le gestionnaire peut créer, consulter et modifier les matériels, mais ne peut pas les supprimer.
- **RG-18 — Stocks et affectations.** Le gestionnaire peut gérer les stocks, affecter les matériels et les déplacer.
- **RG-19 — Supervision par le formateur.** Le formateur peut accéder à une salle, consulter les processus utilisateur qui y sont remontés et arrêter ces processus.
- **RG-20 — Protection des processus système.** Le formateur ne peut ni consulter ni arrêter les processus du système d'exploitation.
- **RG-21 — Création d'une remontée.** Le formateur et l'administrateur peuvent créer une remontée concernant un ou plusieurs matériels.
- **RG-22 — Masterisation.** L'administrateur réalise la masterisation d'un poste ou d'une salle.
- **RG-23 — Consultation des états des lieux.** Le gestionnaire et l'administrateur peuvent consulter les PDF d'état des lieux.
- **RG-24 — Accès aux tableaux de bord.** Le gestionnaire et l'administrateur peuvent consulter les tableaux de bord spécialisés du parc et des remontées.

## 3. Règles relatives aux traitements

- **RG-25 — Exécution d'une action autorisée.** Une action autorisée est exécutée sans validation préalable d'une seconde personne.
- **RG-26 — Prise d'effet d'une affectation.** Une affectation ou un déplacement de matériel prend effet immédiatement.
- **RG-27 — Affectation groupée.** Une même opération d'affectation peut concerner plusieurs matériels.
- **RG-28 — Enregistrement d'un matériel.** Chaque matériel est enregistré individuellement par saisie manuelle ou par import JSON. L'import JSON est accessible au gestionnaire et à l'administrateur.
- **RG-29 — Traitement d'un import JSON.** Les données d'un import JSON sont appliquées immédiatement, sans étape de validation métier préalable.
- **RG-30 — Masterisation d'un poste.** La masterisation réapplique une image système sur le poste Windows concerné.
- **RG-31 — Données de supervision.** La supervision remonte les processus utilisateur lancés sur le poste et l'utilisateur associé à chacun d'eux.
- **RG-32 — Filtrage des processus.** Les processus internes du système d'exploitation sont exclus des données de supervision présentées au formateur.
- **RG-33 — Arrêt d'un processus.** L'arrêt demandé par un utilisateur autorisé porte uniquement sur un processus utilisateur remonté par ASTER.
- **RG-34 — Détermination de la localisation de la remontée.** ASTER présente la localisation de chaque matériel concerné lorsqu'elle est renseignée.
- **RG-35 — Génération de l'état des lieux.** La transmission d'une remontée génère automatiquement son document d'état des lieux au format PDF.
- **RG-36 — Tableaux de bord spécialisés.** ASTER propose plusieurs tableaux de bord spécialisés, dont un tableau de bord du parc et un tableau de bord des remontées. Le tableau de bord du parc présente l'état des stocks et permet un filtrage par salle.
- **RG-37 — Affichage des notifications.** Une notification est affichée dans ASTER sous la forme d'une fenêtre contextuelle lors de la connexion de son destinataire.
- **RG-38 — Canal de notification.** ASTER n'envoie pas les notifications par courriel.
- **RG-39 — Alertes de remontée.** Aucune alerte relative à une remontée n'est envoyée à l'administrateur.

## 4. Règles spécifiques à la supervision des processus

- **RG-40 — Séparation des domaines.** Les postes de supervision des processus et les matériels d'inventaire constituent deux ensembles de données indépendants. Un poste est géré dans le domaine de la supervision et un matériel dans celui du parc.
- **RG-41 — Identification d'un processus.** Un processus désigne un programme identifiable, distinct d'une exécution particulière. Il possède un identifiant et un nom (précision de l'utilisateur du 2 novembre).
- **RG-42 — Contexte d'exécution.** Une exécution associe un programme identifiable (`PROCESSUS`), un compte Windows (`COMPTE_WINDOWS`) et un poste. Elle porte les dates de démarrage, de détection et d'arrêt.
- **RG-43 — Compte Windows supervisé.** Le compte Windows associé à l'exécution d'un programme est représenté par l'entité `COMPTE_WINDOWS`, qui possède un identifiant interne et le champ `identifiant`. Le MCD conserve temporairement l'ancien nom `SESSION` et l'attribut `Id_session`, dans l'attente de sa mise à jour ultérieure par l'utilisateur. Cette entité est distincte de l'utilisateur authentifié dans ASTER. Le champ `identifiant` correspond au nom du compte Windows utilisé sur le poste. Un même nom de compte Windows utilisé sur plusieurs postes représente une seule et même entité, et non une connexion particulière à un poste (confirmations de l'utilisateur du 2 novembre).
- **RG-44 — Informations affichées.** Pour chaque processus, ASTER affiche le nom, l'utilisateur, le poste, la salle, la date de démarrage et son classement. Lorsqu'une action est réalisée, son résultat est également affiché.
- **RG-45 — Classement d'un processus.** Un processus utilisateur est classé « whitelist », « blacklist » ou « non référencé ».
- **RG-46 — Processus autorisé.** Tout processus qui n'appartient pas à la blacklist est autorisé. La whitelist désigne les processus explicitement reconnus comme autorisés ; un processus absent des deux listes est autorisé et classé « non référencé ».
- **RG-47 — Portée des listes.** Une entrée de whitelist ou de blacklist s'applique globalement ou à une école, un bâtiment ou une salle. La portée bâtiment concerne les salles identifiées par leur information de bâtiment, sans entité bâtiment autonome.
- **RG-48 — Cumul des règles.** Les règles applicables aux postes d'une salle se cumulent depuis le niveau global jusqu'à cette salle. Une interdiction héritée ne peut pas être annulée à un niveau inférieur.
- **RG-49 — Priorité de la blacklist.** Lorsqu'un processus correspond simultanément à la whitelist et à la blacklist, il est considéré comme blacklisté.
- **RG-50 — Gestion des listes.** Seul l'administrateur peut ajouter, modifier ou supprimer une entrée de whitelist ou de blacklist.
- **RG-51 — Traitement d'un processus whitelisté.** Un processus whitelisté est visible dans la supervision en temps réel, sans conservation de son historique d'exécution.
- **RG-52 — Traitement d'un processus non référencé.** Un processus non référencé reste autorisé, est visible dans la supervision en temps réel et fait l'objet d'un historique de détection.
- **RG-53 — Traitement d'un processus blacklisté.** Un processus blacklisté est arrêté automatiquement et fait l'objet d'une alerte et d'un historique.
- **RG-54 — Arrêt automatique.** L'arrêt automatique d'un processus blacklisté ne demande ni confirmation ni justification et ne prévient pas l'utilisateur du poste.
- **RG-55 — Destinataires de l'alerte.** L'alerte provoquée par un processus blacklisté est destinée à l'administrateur et au formateur qui supervise la salle concernée.
- **RG-56 — Contenu de l'historique.** L'historique d'une détection blacklistée ou non référencée conserve le poste, la salle, l'utilisateur, le nom, le PID, la date de démarrage, la date de détection et le classement. Pour un processus blacklisté, il conserve également la règle déclenchée, la date de l'arrêt automatique et son résultat.
- **RG-57 — Fréquence de supervision.** Les données de supervision d'un poste sont actualisées toutes les cinq secondes.
- **RG-58 — Poste déconnecté.** Après trois remontées manquées, soit environ quinze secondes, le poste est considéré comme déconnecté. Il reste visible dans sa salle, sans processus affiché.
- **RG-59 — Périmètre du formateur.** Le formateur peut superviser toutes les salles, mais doit entrer dans une salle pour consulter et gérer ses postes ; il ne dispose pas d'une vue globale de supervision.
- **RG-60 — Rattachement d'un utilisateur.** Chaque utilisateur ASTER est rattaché à une et une seule école.
- **RG-61 — Noms et information de bâtiment.** Une école et une salle possèdent chacune un nom. Le bâtiment est une information de la salle, sans identité autonome.
- **RG-62 — Identifiants de connexion.** Chaque utilisateur ASTER possède un login et un mot de passe.
- **RG-63 — Auteur d'une remontée.** Chaque remontée est déclarée par un et un seul utilisateur ASTER. Un utilisateur ASTER peut déclarer plusieurs remontées.
- **RG-64 — Agent ASTER.** Un agent appartenant à la suite ASTER est installé sur chaque machine cible.
