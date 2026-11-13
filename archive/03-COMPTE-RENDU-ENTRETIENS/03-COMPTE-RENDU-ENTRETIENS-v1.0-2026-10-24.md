# Compte rendu des entretiens de cadrage — ASTER

Ce document conserve la trace historique des entretiens des 22 et 23 octobre. Les propos restent rattachés à leur date, y compris lorsqu’une réponse ultérieure les remplace. Pour chaque sujet, la dernière réponse fait foi ; les [questions de cadrage](02-CADRAGE.md) présentent les réponses en vigueur et les questions encore ouvertes.

## 1. Entretien du 23 octobre

### 1.1. Matériels, formations et applications métier

- Un matériel possède un « rôle », qui correspond à sa destination : à quoi ou à qui il sert. Ce rôle permet de l'utiliser pour une formation, par exemple en réseau ou en développement.
- Une application métier est décrite comme une application « de base » présente sur un poste. Le caractère éventuellement natif de cette application reste à préciser.
- L'« aptitude » d'un matériel est assimilée à sa garantie. La gestion de la garantie est présentée comme un bonus. La possibilité de proposer un renouvellement reste une question ouverte.

### 1.2. Profils et droits

- L'administrateur dispose de tous les droits et peut réaliser toutes les actions.
- Le formateur doit pouvoir accéder à une salle dans l'application et consulter les processus lancés sur les postes.
- Le formateur peut consulter et arrêter les processus utilisateur, par exemple un IDE ou un navigateur. Il ne peut pas arrêter les processus du système d'exploitation.
- Le gestionnaire peut consulter les états des lieux. La possibilité pour l'administrateur de les consulter reste une question ouverte dans les notes de cet entretien.
- La nécessité d'un rôle « stagiaire » n'est pas établie. La piste évoquée consiste plutôt à récupérer le nom de la session des utilisateurs pour identifier l'utilisateur associé aux processus.

### 1.3. Remontées de problèmes et documents d'état des lieux

- Pour signaler un problème, le formateur crée un rapport précisant le périphérique concerné, la salle si elle n'est pas connue et une description du problème.
- Le formulaire de remontée de problème génère un document d'état des lieux au format PDF.
- Le document doit notamment indiquer le type de matériel, le type de problème et l'emplacement. Une simple fenêtre contextuelle ne suffit pas.
- Dans les termes de cet entretien, le « document d'état des lieux » correspond au formulaire de signalement d'un problème et au PDF qui en résulte.

### 1.4. Notifications

- Les notifications sont diffusées uniquement dans l'application, sous la forme d'une fenêtre contextuelle à la connexion. Aucun courriel n'est prévu.

### 1.5. Administration des postes

- La masterisation consiste, pour l'administrateur, à réappliquer une image sur un poste (« replaquer » le poste).

### 1.6. Données et livrables

- Aucun fichier Excel, aucune donnée à importer et aucun exemple ne sont fournis.
- Un dossier d'architecture technique est demandé.
- Le client a formulé la remarque suivante à propos de l'évaluation : « Plus il y a de diagrammes, plus ça fera monter la note. »

## 2. Entretien du 22 octobre

### 2.1. Objectifs et démonstration

- Les deux problèmes à résoudre en priorité sont la gestion des périphériques, puis la supervision des processus.
- L'objectif est de faciliter la mise à jour, la recherche, la consultation et la visualisation des informations.
- La gestion des processus sera simulée : l'équipe ne dispose pas de machine virtuelle Windows, alors que Windows est la cible de l'application.
- Pour la démonstration, le périmètre comprend une seule école (ou emprise), un à deux bâtiments et six à huit salles par bâtiment. La possibilité d'en ajouter doit être prévue.
- Le client n'a pas cité de logiciel similaire.

### 2.2. Organisation et salles

- Le matériel est affecté à une salle. Aucun plan de salle n'est attendu.
- La gestion des salles temporaires ou hors service n'est pas prévue.
- Les gestionnaires interviennent à l'échelle globale, sans être limités à un bâtiment. Trois gestionnaires sont envisagés pour la démonstration.

### 2.3. Profils et droits

- Trois profils sont identifiés : administrateur, gestionnaire et formateur.
- L'administrateur peut réaliser toutes les actions.
- Le gestionnaire gère les stocks et affecte les matériels. Les opérations de création, de consultation et de modification lui sont accessibles, mais pas la suppression.
- Le formateur peut uniquement effectuer des remontées de problèmes.
- Seul l'administrateur peut gérer les processus.
- Seul le formateur peut créer des tickets.
- L'administrateur ne reçoit pas d'alerte concernant les tickets.

### 2.4. Matériels et inventaire

- Les matériels gérés sont des équipements informatiques, par exemple des souris, des claviers, des câbles Ethernet, des écrans, des rétroprojecteurs et des enceintes.
- L'identifiant d'un matériel est son numéro de série.
- Les données d'un matériel comprennent sa marque, sa date de fin de garantie, sa date d'arrivée (désignée également comme date d'affectation) et son statut : utilisé, en stock ou hors service.
- Aucun document n'est associé à la fiche d'un matériel.
- Un matériel peut être en stock sans localisation.
- Aucun historique des mouvements de matériels n'est attendu, en dehors d'éventuels journaux.
- Une solution doit être trouvée pour réaliser des affectations et des opérations de gestion sur plusieurs matériels à la fois ; les notes évoquent un « CRUD multiple ».
- Aucune campagne d'inventaire n'est prévue.

### 2.5. Tickets et remontées de problèmes

- Un ticket peut concerner plusieurs périphériques.
- Les statuts mentionnés pour un ticket sont « en attente » et « remplacé ».

### 2.6. Tableau de bord, garanties et notifications

- Le gestionnaire et l'administrateur disposent d'un tableau de bord global, avec un filtrage possible par salle. Il présente notamment l'état des stocks et les expirations.
- Une fin de garantie proche doit être signalée à partir de six mois avant l'échéance.
- Une notification est prévue à l'approche de la date de fin de garantie.

### 2.7. Données et imports

- La question d'Excel reste ouverte : « on verra ».
- Un import JSON est envisagé pour l'arrivée de nouveaux périphériques.
- L'import met les données à jour immédiatement, sans vérification.

### 2.8. Environnement, authentification et journaux

- La note relative au réseau est « réseau NP interne internet ». Le lien entre ces termes reste à préciser.
- Le système d'authentification n'est pas défini. LDAP a été évoqué, avec la réponse « je ne sais pas ».
- Les journaux constituent un bonus ; l'équipe est libre de proposer leur contenu et leur fonctionnement.
- Le navigateur cible est Firefox, dans les versions installées sur les postes de l'équipe.

### 2.9. Terminologie restant à préciser

- La notion de « formation induite » n'a pas été explicitée. Le client a répondu : « Ce n'est pas moi qui fais le sujet. »
