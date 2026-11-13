# Questions de cadrage du projet ASTER

Ce document présente les questions de cadrage et les réponses en vigueur, issues des [entretiens des 22 et 23 octobre](03-COMPTE-RENDU-ENTRETIENS.md) et des précisions apportées ensuite par l’utilisateur. Pour chaque sujet, la dernière réponse remplace les précédentes. Les réponses antérieures restent applicables lorsqu’elles n’ont pas été remplacées ; les comptes rendus conservent uniquement la trace historique des échanges. Les questions marquées **P0** conditionnent directement la faisabilité ou l’estimation des développements.

**Légende :**

- `[x]` : une réponse a été recueillie, y compris lorsqu’elle est négative ; cela ne vaut pas validation globale du besoin.
- `[ ]` : question ouverte. Une mention **Réponse partielle** précise les éléments déjà recueillis et ce qui reste effectivement à définir. Une ancienne réponse remplacée ne constitue pas une question ouverte.
- Question barrée : sans objet dans le périmètre indiqué par la note ; à rouvrir si ce périmètre évolue.

Les dates et numéros de section des annotations renvoient au compte rendu des entretiens. La simulation des processus ne dispense pas de définir leur comportement fonctionnel ; seules les questions de déploiement réel explicitement concernées sont barrées pour la démonstration. L’absence de fichiers de reprise ne supprime pas le besoin éventuel d’importer de nouveaux matériels.

## 1. Vision et objectifs

- [x] **P0** Quel problème doit être résolu en priorité par ASTER ? — 22 octobre, § 2.1 : gestion des périphériques en priorité, puis supervision des processus.
- [ ] **P0** Quel résultat concret permettra de considérer le projet comme réussi ? — **Réponse partielle :** 22 octobre, § 2.1 : faciliter la mise à jour, la recherche, la consultation et la visualisation. Les critères concrets de réussite restent à définir.
- [x] **P0** Quel est le périmètre attendu pour la première version utilisable ? — Précision de l’utilisateur du 24 octobre : gestion complète des matériels, avec une démonstration pour une école, deux bâtiments et six à huit salles par bâtiment ; gestion des processus simulée. La gestion de plusieurs écoles est prévue à terme, hors des attendus de la V1. ASTER ne gère pas les formations (précision de l’utilisateur du 24 octobre).
- [ ] Quels défauts du fonctionnement actuel sous Excel faut-il corriger en priorité ?
- [x] Quelles fonctionnalités peuvent être simulées, maquettées ou reportées ? — 22 octobre, § 2.1 et 2.8 : gestion des processus simulée et journaux en bonus. 23 octobre, § 1.1 : gestion de la garantie en bonus.
- [ ] Qui valide le besoin, les priorités et le résultat final ?

## 2. Périmètre organisationnel

- [x] **P0** ASTER doit-il couvrir une seule école ou plusieurs établissements ? — Précision de l’utilisateur du 24 octobre : ASTER doit pouvoir gérer plusieurs écoles à terme, mais cette capacité ne fait pas partie des attendus de la V1. La démonstration de la V1 porte sur une seule école.
- [ ] Une administration centrale doit-elle avoir une vue sur l’ensemble des écoles ?
- [x] Quelles entités doivent être représentées : organisme, école, site, bâtiment, étage, salle ou autre ? — Précision de l’utilisateur du 24 octobre : école, bâtiment et salle. Aucun niveau « étage » distinct n’est nécessaire : le code de la salle contient souvent le numéro de l’étage.
- [ ] Une salle peut-elle dépendre de plusieurs services ou formations ?
- [x] Faut-il gérer des salles temporaires, fermées ou indisponibles ? — 22 octobre, § 2.2 : pas de gestion des salles temporaires ou hors service.
- [ ] Combien d’écoles, de salles, de postes et d’autres matériels sont concernés aujourd’hui ? — **Réponse partielle :** précision de l’utilisateur du 24 octobre : démonstration pour une école, deux bâtiments et six à huit salles par bâtiment. La possibilité d’ajout est prévue (22 octobre, § 2.1). Les volumes réels et les nombres de postes et matériels ne sont pas précisés.

## 3. Utilisateurs, rôles et responsabilités

- [x] **P0** Quelles catégories d’utilisateurs utiliseront réellement l’application ? — Précision de l’utilisateur du 24 octobre : exactement trois types d’utilisateurs, administrateur, gestionnaire et formateur ; aucun compte stagiaire.
- [x] Que recouvre précisément le terme « acteurs de la formation » ? — Précision de l’utilisateur du 24 octobre : expression générale issue du sujet, sans rôle supplémentaire dans ASTER. Seuls les profils administrateur, gestionnaire et formateur existent. ASTER ne gère pas les formations.
- [x] Quelles actions un gestionnaire de matériel peut-il consulter, créer, modifier ou supprimer ? — 22 octobre, § 2.2 et 2.3 : gestion globale des stocks, affectation, création, consultation et modification des matériels ; pas de suppression.
- [x] Quelles actions un administrateur de salle technique peut-il réaliser ? — 23 octobre, § 1.2 : l’administrateur dispose de tous les droits et peut réaliser toutes les actions.
- [x] Quelles actions un formateur peut-il réaliser sur les postes de sa salle ? — 23 octobre, § 1.2 et 1.3 : accéder à une salle, consulter et arrêter les processus utilisateur (IDE, navigateur, etc.), sans arrêter les processus système, et signaler un problème.
- [ ] Les droits d’un formateur sont-ils limités à ses salles et à ses périodes de formation ?
- [x] Existe-t-il un rôle de consultation seule ? — 22 octobre, § 2.3 : aucun profil de consultation seule parmi les trois profils identifiés.
- [x] Existe-t-il un rôle d’administrateur fonctionnel chargé du paramétrage ? — Un seul profil administrateur dispose de tous les droits (23 octobre, § 1.2). La confirmation des trois seuls types d’utilisateurs le 24 octobre exclut un profil fonctionnel distinct.
- [x] Existe-t-il un rôle d’administrateur technique chargé de l’exploitation ? — Un seul profil administrateur dispose de tous les droits (23 octobre, § 1.2). La confirmation des trois seuls types d’utilisateurs le 24 octobre exclut un profil technique distinct.
- [ ] Un utilisateur peut-il cumuler plusieurs rôles ?
- [ ] Qui crée, modifie, désactive et réactive les comptes ?
- [x] Qui autorise les opérations sensibles sur les postes ? — Précision de l’utilisateur du 24 octobre : chaque utilisateur autorisé peut agir directement, dans la limite de ses droits, sans accord préalable d’une autre personne. L’administrateur dispose de tous les droits et réalise la masterisation ; le formateur peut arrêter les processus utilisateur, hors processus système (23 octobre, § 1.2 et 1.5).
- [x] Certaines opérations nécessitent-elles une validation par une seconde personne ? — Précision de l’utilisateur du 24 octobre : non, l’utilisateur autorisé peut agir directement dans la limite de ses droits.
- [ ] Faut-il déléguer temporairement des droits en cas d’absence ?

## 4. Modèle du parc informatique

- [x] **P0** Qu’est-ce qu’un « matériel » dans ASTER ? — Précision de l’utilisateur du 24 octobre : tout équipement informatique. Il n’existe pas de liste exhaustive des types à ce jour.
- [ ] **P0** Quelle différence faut-il faire entre matériel, machine, unité centrale et poste ?
- [ ] Un poste correspond-il à une unité centrale seule ou à un ensemble comprenant écran et périphériques ?
- [x] Quels types de matériels doivent être gérés dans la première version ? — Précision de l’utilisateur du 24 octobre : tous les équipements informatiques ; aucune liste exhaustive n’existe à ce jour. Les exemples cités lors des entretiens ne limitent pas le périmètre.
- [x] Faut-il gérer les écrans, imprimantes, vidéoprojecteurs, commutateurs, bornes Wi-Fi et périphériques ? — Précision de l’utilisateur du 24 octobre : tous les équipements informatiques sont concernés, sans exclusion de type ; aucune liste exhaustive n’existe à ce jour.
- [ ] Les équipements réseau font-ils partie de l’inventaire ou de la topologie technique ?
- [ ] Peut-on créer de nouveaux types de matériels sans modifier l’application ?
- [x] Quelles informations sont obligatoires pour chaque type de matériel ? — Précisions de l’utilisateur du 24 octobre : modèle, date de réception et statut obligatoires. L’identifiant interne est attribué et géré automatiquement par ASTER ; il est consultable, sans saisie par l’utilisateur. Le numéro de série est renseigné lorsqu’il existe et peut rester vide pour un matériel qui n’en possède pas. Le modèle est obligatoire et peut être une simple désignation du matériel, notamment pour un câble ; il ne désigne pas nécessairement une référence constructeur. La marque peut ne pas être renseignée, notamment pour un câble. Le statut est limité à « hors service : oui/non », avec « hors service : non » comme valeur par défaut à la création. La gestion de la garantie reste un bonus (23 octobre, § 1.1) ; seule sa date de fin est renseignée, sans date de début ni durée (précision de l’utilisateur du 24 octobre).
- [x] Quel identifiant fait foi : numéro d’inventaire, numéro de série, étiquette interne ou autre ? — Précision de l’utilisateur du 24 octobre : identifiant interne unique attribué et géré automatiquement par ASTER, consultable mais non saisi par l’utilisateur. Le numéro de série constitue une information distincte, renseignée lorsqu’il existe.
- [x] Un matériel peut-il posséder plusieurs identifiants ? — Précision de l’utilisateur du 24 octobre : chaque matériel possède un identifiant interne géré par l’application et peut aussi avoir un numéro de série lorsqu’il en possède un.
- [x] Faut-il gérer la marque, le modèle, le fournisseur, la date d’achat, la garantie et la valeur ? — Précisions de l’utilisateur du 24 octobre : modèle obligatoire, pouvant simplement désigner le matériel ; marque pouvant rester non renseignée, notamment pour un câble. Aucun fournisseur, aucune valeur et aucune date d’achat. La gestion de la garantie reste un bonus (23 octobre, § 1.1) ; seule sa date de fin est renseignée, sans date de début ni durée (précision de l’utilisateur du 24 octobre).
- [ ] Faut-il gérer les caractéristiques techniques des machines ?
- [x] Faut-il joindre des documents, photographies ou factures à une fiche matériel ? — 22 octobre, § 2.4 : aucun document associé à la fiche matériel.
- [ ] Faut-il imprimer des étiquettes, codes-barres ou QR codes ?
- [ ] Quelles règles empêchent la création de doublons ?

## 5. Localisation, affectation et cycle de vie

- [x] **P0** Quel niveau de précision est attendu pour localiser un matériel ? — 22 octobre, § 2.2 : affectation à la salle, sans plan de salle.
- [x] Faut-il représenter le site, le bâtiment, l’étage, la salle, le bureau, la baie ou le port réseau ? — Précision de l’utilisateur du 24 octobre : école, bâtiment et salle, sans niveau « étage » distinct ; le code de la salle contient souvent le numéro de l’étage. Le matériel est localisé à la salle, sans plan de salle (22 octobre, § 2.2).
- [x] Un matériel peut-il être affecté à une personne plutôt qu’à une salle ? — Non. Le matériel est affecté à une salle, pas à une personne (réponse du client, rappelée par l’utilisateur le 24 octobre). Un matériel peut également être en stock sans localisation (22 octobre, § 2.4).
- [x] Un matériel peut-il appartenir à un stock sans localisation précise ? — 22 octobre, § 2.4 : un matériel peut être en stock sans localisation.
- [x] Une affectation peut-elle être temporaire et comporter des dates de début et de fin ? — Non. Réponse du client du 22 octobre, rappelée par l’utilisateur le 24 octobre : « pas d’autres dates ». Aucune période d’affectation avec dates de début et de fin n’est à gérer.
- [x] Qui peut déplacer un matériel ? — 22 octobre, § 2.3 : le gestionnaire affecte les matériels ; l’administrateur dispose de tous les droits.
- [x] Un déplacement doit-il être validé avant de devenir effectif ? — Précision de l’utilisateur du 24 octobre : non, aucune validation préalable ; le déplacement devient effectif directement.
- [x] Faut-il gérer les mouvements groupés de plusieurs matériels ? — 22 octobre, § 2.4 : une solution d’affectation et de gestion de plusieurs matériels à la fois est demandée ; les modalités restent à concevoir.
- [x] Faut-il conserver l’historique complet des localisations et des affectations ? — 22 octobre, § 2.4 et 2.8 : pas d’historique des mouvements, en dehors d’éventuels journaux proposés en bonus.
- [x] Quels sont les états possibles d’un matériel : en stock, affecté, prêté, en panne, en réparation, réformé ou autre ? — Précision de l’utilisateur du 24 octobre : le statut se limite à « hors service : oui/non », avec « hors service : non » comme valeur par défaut à la création. Cette réponse remplace la liste de statuts du 22 octobre.
- [ ] Quelles transitions entre ces états sont autorisées ?
- [ ] Faut-il gérer les prêts, retours, pertes, vols, réparations et mises au rebut ?
- [x] Faut-il réaliser des campagnes d’inventaire physique ? — 22 octobre, § 2.4 : aucune campagne d’inventaire prévue.
- [ ] ~~Comment un écart entre l’inventaire théorique et l’inventaire réel doit-il être traité ?~~ — Sans objet pour les campagnes d’inventaire, écartées le 22 octobre (§ 2.4). À rouvrir si un autre besoin de rapprochement d’inventaire apparaît.

## 6. Matériels provenant du CND

- [ ] Que signifie précisément « matériel arrivant depuis le CND » ?
- [x] Le CND fournit-il un fichier, une API, un bordereau ou un autre document ? — Précision de l’utilisateur du 24 octobre : l’arrivée des matériels est prise en charge par saisie manuelle ou import JSON, sans connexion directe au système du CND. Aucune donnée ni aucun exemple ne sont fournis (23 octobre, § 1.6).
- [ ] Quelles informations accompagnent les matériels reçus ?
- [x] Faut-il enregistrer une réception complète ou chaque équipement séparément ? — Précision de l’utilisateur du 24 octobre : chaque matériel est enregistré individuellement, par saisie manuelle ou import JSON, avec une date de réception. Aucune notion de lot ni de réception à gérer dans ASTER.
- [ ] ~~Qui contrôle et valide la réception ?~~ — Sans objet : aucune notion de réception à gérer dans ASTER ; seule la date de réception est conservée sur le matériel (précision de l’utilisateur du 24 octobre).
- [ ] ~~Comment traiter un matériel manquant, endommagé ou non conforme ?~~ — Sans objet, précision de l’utilisateur du 24 octobre : ASTER ne gère pas les réceptions.
- [ ] ~~Faut-il conserver le lien entre un matériel et son bordereau de réception ?~~ — Sans objet : aucune notion de réception à gérer dans ASTER ; seule la date de réception est conservée sur le matériel (précision de l’utilisateur du 24 octobre).
- [x] Une intégration automatique avec un système du CND est-elle possible ou attendue ? — Précision de l’utilisateur du 24 octobre : non, aucune connexion directe au système du CND ; seules la saisie manuelle et l’import JSON sont prévus pour enregistrer les nouveaux matériels.

## 7. Aptitudes et formations induites

- [x] **P0** Que désigne exactement une « aptitude » dans le contexte du matériel ? — 23 octobre, § 1.1 : l’aptitude est assimilée à la garantie du matériel ; sa gestion est un bonus.
- [x] L’aptitude concerne-t-elle un matériel, un utilisateur, une salle ou une formation ? — 23 octobre, § 1.1 : elle concerne le matériel, puisqu’elle est assimilée à sa garantie.
- [x] Comment la date de début et la durée d’une aptitude sont-elles déterminées ? — Précision de l’utilisateur du 24 octobre : seule la date de fin de garantie est renseignée ; aucune date de début ni durée de garantie à gérer.
- [x] Que doit-il se passer lorsqu’une aptitude arrive à expiration ? — Précision de l’utilisateur du 24 octobre : à l’expiration de sa garantie, le matériel doit être signalé comme « hors garantie ».
- [x] Faut-il produire une alerte avant l’expiration ? — 23 octobre, § 1.1 : gestion de la garantie en bonus. Si ce bonus est réalisé, le signalement et la notification sont prévus six mois avant la fin de garantie (22 octobre, § 2.6, seuil non remplacé).
- [x] Qui peut créer, modifier ou renouveler une aptitude ? — Précision de l’utilisateur du 24 octobre : le gestionnaire et l’administrateur peuvent renseigner et modifier la date de fin de garantie. À l’expiration, le matériel est signalé comme « hors garantie » ; aucun mécanisme distinct de renouvellement n’est prévu.
- [ ] ~~**P0** Qu’est-ce qu’une « formation induite » ?~~ — Précision de l’utilisateur du 24 octobre : ASTER ne gère pas les formations ; cette notion issue du sujet n’est pas à modéliser comme une formation à gérer.
- [ ] ~~La formation induite concerne-t-elle l’utilisation, la maintenance ou l’administration d’un matériel ?~~ — Précision de l’utilisateur du 24 octobre : aucune gestion des formations dans ASTER.
- [ ] ~~Faut-il seulement associer des formations à un matériel ou suivre les personnes formées ?~~ — Précision de l’utilisateur du 24 octobre : aucune gestion des formations ni suivi des personnes formées. Le rôle ou la destination d’un matériel (réseau, développement, etc.) reste une information sur le matériel, évoquée le 23 octobre (§ 1.1).
- [ ] ~~Existe-t-il déjà un référentiel officiel des aptitudes et des formations ?~~ — Sans objet, précision de l’utilisateur du 24 octobre : les informations concernées se limitent à la date de fin de garantie et à l’indication « hors service : oui/non » du matériel ; aucun référentiel d’aptitudes ni gestion des formations à prévoir.
- [ ] ~~ASTER doit-il échanger des données avec un système de gestion de la formation ?~~ — Précision de l’utilisateur du 24 octobre : aucune gestion des formations dans le périmètre d’ASTER ; aucun échange de ce type n’est attendu dans ce périmètre.

## 8. Applications installées

- [ ] **P0** La liste des applications doit-elle être déclarée manuellement ou détectée automatiquement sur les postes ?
- [ ] Si elle est détectée, quel mécanisme ou outil existant fournit ces informations ?
- [ ] Qu’est-ce qui distingue une application métier d’une autre application ? — **Réponse partielle :** 23 octobre, § 1.1 : application « de base » présente sur un poste ; le caractère natif et la distinction exacte restent à préciser.
- [ ] Existe-t-il un référentiel officiel des applications métier ?
- [ ] Faut-il relever le nom, la version, l’éditeur, la date d’installation et la licence ?
- [ ] Faut-il distinguer les applications obligatoires, autorisées, tolérées et interdites ?
- [ ] Les règles dépendent-elles de l’école, de la salle, du poste ou de la formation en cours ?
- [ ] Faut-il détecter les versions absentes, obsolètes ou non conformes ?
- [ ] Faut-il conserver l’historique des logiciels installés ?
- [ ] Qui peut modifier le référentiel des applications ?
- [ ] ASTER doit-il installer ou désinstaller une application, ou seulement signaler sa présence ?

## 9. Réinstallation des postes et des salles

- [x] **P0** Que signifie précisément « réinstaller » ou « replaquer » un poste ? — 23 octobre, § 1.5 : la masterisation consiste à réappliquer une image sur un poste, par l’administrateur.
- [ ] **P0** ASTER doit-il exécuter la réinstallation, la déclencher dans un outil tiers ou seulement créer une demande ?
- [ ] Existe-t-il déjà un outil de déploiement d’images système ?
- [ ] Une API ou une interface d’automatisation de cet outil est-elle disponible ?
- [x] Quels systèmes d’exploitation doivent être pris en charge ? — 22 octobre, § 2.1 : Windows est la cible de l’application.
- [ ] Quelles images ou configurations de référence existent ?
- [ ] Qui crée, valide et publie une image de référence ?
- [ ] Comment choisir l’image à appliquer à un poste ou à une salle ?
- [ ] Une réinstallation doit-elle préserver certaines données locales ?
- [ ] Comment les données à préserver sont-elles sauvegardées et restaurées ?
- [ ] Une opération doit-elle être immédiate ou planifiée ?
- [ ] Faut-il vérifier que la salle est libre avant de démarrer ?
- [ ] Qui peut autoriser, annuler ou interrompre une réinstallation ? — **Réponse partielle :** 23 octobre, § 1.5 : l’administrateur réalise la masterisation ; les droits d’annulation et d’interruption ne sont pas détaillés.
- [ ] Faut-il demander une confirmation renforcée pour une salle complète ?
- [ ] Peut-on réinstaller seulement une partie des postes d’une salle ?
- [ ] Comment suivre la progression de l’opération ?
- [ ] Comment signaler un échec partiel ou total ?
- [ ] Une reprise automatique est-elle attendue après un échec ?
- [ ] Quel compte rendu doit être conservé après l’opération ?
- [ ] Combien de réinstallations simultanées l’infrastructure peut-elle supporter ?

## 10. Supervision des postes

- [x] **P0** Que signifie « superviser un poste » pour le commanditaire ? — 23 octobre, § 1.2 : consulter les processus lancés sur les postes d’une salle et permettre au formateur d’arrêter les processus utilisateur, hors processus système. La gestion des processus est simulée pour la démonstration (22 octobre, § 2.1).
- [ ] **P0** La supervision doit-elle être en temps réel ou périodique ?
- [ ] Quelles données doivent remonter depuis chaque poste ? — **Réponse partielle :** précision de l’utilisateur du 24 octobre : pour le moment, le nom de la session utilisateur et les processus lancés, hors processus internes. La question reste ouverte à la demande de l’utilisateur.
- [ ] Faut-il connaître l’état en ligne ou hors ligne des machines ?
- [ ] Faut-il remonter les performances telles que CPU, mémoire, disque et réseau ?
- [ ] Faut-il remonter l’état des services, applications ou périphériques ?
- [ ] Quelle fréquence de collecte est nécessaire ?
- [ ] Quelle ancienneté maximale d’une donnée est acceptable à l’écran ?
- [ ] Faut-il conserver un historique des mesures ?
- [ ] Pendant combien de temps cet historique doit-il être conservé ?
- [ ] ~~Un agent doit-il être installé sur les postes ?~~ — Sans objet pour la démonstration avec processus simulés (22 octobre, § 2.1). Le besoin d’un agent pour une supervision réelle reste à étudier au-delà de cette simulation.
- [ ] ~~Si oui, qui déploie, configure et met à jour cet agent ?~~ — Sans objet pour la démonstration avec processus simulés (22 octobre, § 2.1) ; à rouvrir si un agent réel est prévu.
- [ ] ~~Les postes peuvent-ils joindre le serveur ou le serveur doit-il contacter les postes ?~~ — Sans objet pour la collecte réelle des processus pendant la démonstration simulée (22 octobre, § 2.1) ; à rouvrir pour une supervision réelle.
- [ ] Comment gérer un poste temporairement déconnecté ?
- [ ] La supervision doit-elle fonctionner sur plusieurs segments réseau isolés ?

## 11. Processus autorisés, interdits et arrêtés

- [ ] **P0** Quels processus doivent être surveillés et pour quelle raison métier ? — **Réponse partielle :** précision de l’utilisateur du 24 octobre : surveiller les processus utilisateur afin que le formateur puisse vérifier que les stagiaires utilisent les logiciels attendus et fermer les applications indésirables. Les processus internes ne font pas partie des remontées. La question reste ouverte à la demande de l’utilisateur pour d’éventuels compléments.
- [ ] Comment un processus métier est-il identifié de manière fiable ?
- [ ] Les règles sont-elles globales ou propres à une école, une salle, un poste ou une formation ?
- [ ] « Autoriser » signifie-t-il simplement ne pas alerter ou permettre explicitement l’exécution ?
- [ ] « Interdire » signifie-t-il signaler, bloquer le lancement ou arrêter automatiquement ?
- [ ] Qui crée et valide les listes de processus autorisés ou interdits ?
- [ ] Comment gérer les changements de nom ou de version d’un programme ?
- [x] Quels rôles peuvent arrêter un processus à distance ? — 23 octobre, § 1.2 : l’administrateur, qui dispose de tous les droits, et le formateur pour les processus utilisateur uniquement, hors processus du système d’exploitation.
- [ ] Dans quelles situations l’arrêt d’un processus est-il autorisé ?
- [ ] L’utilisateur du poste doit-il être averti avant l’arrêt ?
- [ ] Une justification doit-elle être saisie avant une action distante ?
- [x] Quelles protections empêchent l’arrêt d’un processus système critique ? — Précision de l’utilisateur du 24 octobre : les processus internes ne font pas partie des remontées ; ils ne sont donc pas proposés au formateur pour consultation ou arrêt.
- [ ] Faut-il journaliser l’auteur, la date, le motif et le résultat de chaque action ? — **Réponse partielle :** 22 octobre, § 2.8 : journaux en bonus, contenu laissé libre à l’équipe ; les champs à tracer ne sont pas définis.
- [ ] Existe-t-il des contraintes juridiques ou internes concernant la surveillance de l’activité des utilisateurs ?

## 12. Alertes

- [ ] **P0** Quels événements doivent générer une alerte ? — **Réponse partielle :** précision de l’utilisateur du 24 octobre : garanties proches de leur échéance et garanties arrivées à échéance, dans le cadre du bonus de gestion de la garantie. L’administrateur ne reçoit pas d’alerte ticket (22 octobre, § 2.3). La question reste ouverte à la demande de l’utilisateur pour d’éventuels compléments.
- [ ] Quels niveaux de gravité doivent être utilisés ?
- [ ] Qui reçoit chaque type d’alerte ? — **Réponse partielle :** précision de l’utilisateur du 24 octobre : le gestionnaire reçoit les alertes de garantie. Le gestionnaire et l’administrateur disposent chacun, sur leur tableau de bord, d’un indicateur pour les garanties proches de l’échéance et d’un indicateur pour les garanties arrivées à échéance. L’administrateur ne reçoit pas d’alerte ticket (22 octobre, § 2.3). Les destinataires d’éventuels autres types d’alertes restent à définir.
- [ ] Les destinataires dépendent-ils de l’école, de la salle ou du matériel concerné ?
- [x] Par quels canaux les alertes doivent-elles être transmises ? — 23 octobre, § 1.4 : uniquement dans l’application, par fenêtre contextuelle à la connexion ; aucun courriel.
- [ ] Quels seuils déclenchent une alerte ? — **Réponse partielle :** six mois avant la fin de garantie (22 octobre, § 2.6) et à l’échéance de la garantie (précision de l’utilisateur du 24 octobre), dans le cadre du bonus de gestion de la garantie. Les autres seuils ne sont pas précisés.
- [ ] Qui peut modifier ces seuils ?
- [ ] Faut-il déclencher une alerte dès le premier événement ou après plusieurs occurrences ?
- [ ] Comment regrouper les alertes identiques ou répétitives ?
- [ ] Quels statuts une alerte peut-elle prendre ?
- [ ] Faut-il affecter une alerte à un responsable ?
- [ ] Une alerte doit-elle posséder un délai de traitement ou une date d’échéance ?
- [ ] Faut-il prévoir une escalade automatique lorsqu’une alerte reste sans réponse ?
- [ ] Qui peut acquitter, clôturer ou rouvrir une alerte ?
- [ ] Faut-il conserver l’historique des alertes et de leur traitement ?

## 13. Remontées utilisateur

- [x] **P0** Qu’est-ce qu’une remontée utilisateur : incident, demande, suggestion, questionnaire ou autre ? — 23 octobre, § 1.3 : signalement d’un problème sur un périphérique, via un formulaire générant un PDF d’état des lieux.
- [x] Qui peut créer une remontée ? — 22 octobre, § 2.3 et 23 octobre, § 1.3 : le formateur crée les signalements ; seul ce profil est explicitement autorisé à créer des tickets.
- [ ] L’utilisateur doit-il être authentifié ?
- [ ] Une remontée anonyme est-elle autorisée ?
- [x] Quelles informations doivent obligatoirement être fournies ? — Périphérique concerné et description du problème (23 octobre, § 1.3). Précision de l’utilisateur du 24 octobre : la salle est retrouvée automatiquement à partir du matériel sélectionné lorsqu’elle est connue ; sinon, elle peut être renseignée manuellement ou laissée vide. La salle n’est donc pas obligatoire.
- [ ] La salle et le poste doivent-ils être détectés automatiquement ? — **Réponse partielle :** précision de l’utilisateur du 24 octobre : la salle est retrouvée automatiquement à partir du matériel sélectionné lorsqu’elle est connue ; sinon, elle peut être renseignée manuellement ou laissée vide. La détection automatique du poste n’est pas précisée.
- [ ] Quelles catégories et priorités doivent être proposées ?
- [ ] L’utilisateur peut-il joindre une capture d’écran ou un document ?
- [ ] Quels formats et tailles de pièces jointes sont autorisés ?
- [x] Quels statuts composent le cycle de traitement d’une remontée ? — 22 octobre, § 2.5 : « en attente » et « remplacé » sont les statuts mentionnés ; les transitions ne sont pas détaillées.
- [ ] Qui reçoit et qualifie une nouvelle remontée ?
- [ ] Comment une remontée est-elle affectée à un intervenant ?
- [ ] L’utilisateur peut-il suivre son traitement et compléter sa demande ?
- [ ] Doit-il recevoir des notifications lors des changements de statut ?
- [ ] Une remontée peut-elle être transformée en alerte ou liée à une alerte existante ?
- [ ] Comment traiter les doublons concernant le même incident ?
- [ ] Faut-il mesurer les délais de prise en charge et de résolution ?

## 14. Tableau de bord et statistiques

- [ ] **P0** À quelles décisions le tableau de bord doit-il aider ? — **Réponse partielle :** 22 octobre, § 2.6 : visualisation de l’état des stocks et des expirations ; les décisions à prendre à partir de ces indicateurs ne sont pas détaillées.
- [ ] Quels indicateurs sont attendus par les gestionnaires de matériel ? — **Réponse partielle :** état des stocks (22 octobre, § 2.6) et, dans le cadre du bonus de gestion de la garantie, deux indicateurs distincts : garanties proches de l’échéance et garanties arrivées à échéance (précision de l’utilisateur du 24 octobre). Les calculs des indicateurs restent à définir.
- [ ] Quels indicateurs sont attendus par les administrateurs techniques ? — **Réponse partielle :** état des stocks (22 octobre, § 2.6) et, comme pour le gestionnaire, deux indicateurs distincts dans le cadre du bonus de gestion de la garantie : garanties proches de l’échéance et garanties arrivées à échéance (précision de l’utilisateur du 24 octobre). Les calculs des indicateurs restent à définir.
- [ ] Quels indicateurs sont attendus par les formateurs ?
- [ ] Quels indicateurs sont attendus au niveau central ?
- [ ] Les données doivent-elles être instantanées, quotidiennes, hebdomadaires ou mensuelles ?
- [x] Quels filtres doivent être disponibles ? — 22 octobre, § 2.6 : vue globale avec filtrage par salle.
- [ ] Faut-il comparer des périodes, des écoles ou des salles ?
- [ ] Faut-il afficher des tendances et des historiques ?
- [ ] Les utilisateurs peuvent-ils personnaliser leur tableau de bord ?
- [ ] Faut-il permettre d’explorer le détail à partir d’un indicateur ?
- [ ] Les statistiques doivent-elles être exportables ?
- [ ] Sous quels formats les exports sont-ils attendus ?
- [ ] Existe-t-il des règles officielles de calcul des indicateurs ?
- [ ] Qui valide la définition et le calcul de chaque indicateur ?

## 15. Documents d’état des lieux

- [x] **P0** Que doit contenir un document d’état des lieux ? — PDF de signalement indiquant notamment le périphérique ou type de matériel, le type de problème et une description (23 octobre, § 1.3). La salle ou l’emplacement figure lorsqu’il est renseigné ; la salle peut rester vide (précision de l’utilisateur du 24 octobre).
- [x] À quel moment et dans quel but ce document est-il produit ? — 23 octobre, § 1.3 : produit lors du signalement d’un problème par le formateur, à partir du formulaire de remontée.
- [x] Le document concerne-t-il une salle, une école, une période ou un ensemble de matériels ? — 23 octobre, § 1.3 : le document est un signalement de problème concernant un périphérique, avec sa salle ou son emplacement.
- [ ] Existe-t-il un modèle officiel à respecter ?
- [x] Quels champs, tableaux et indicateurs doivent y figurer ? — Périphérique ou type de matériel, type de problème et description ; aucun tableau ou indicateur supplémentaire n’est mentionné (23 octobre, § 1.3). La salle ou l’emplacement figure lorsqu’il est renseigné ; la salle peut rester vide (précision de l’utilisateur du 24 octobre).
- [ ] Le document doit-il inclure des photographies ou des observations ? — **Réponse partielle :** 23 octobre, § 1.3 : une description du problème est prévue ; photographies non précisées.
- [x] Quels formats sont nécessaires : PDF, Word, Excel ou impression papier ? — 23 octobre, § 1.3 : PDF généré à partir du formulaire de problème.
- [ ] Le document doit-il être signé ou validé ?
- [ ] Une numérotation officielle est-elle requise ?
- [ ] Faut-il archiver chaque version générée ?
- [ ] Un document déjà produit doit-il rester identique même si les données changent ensuite ?
- [ ] Qui peut générer, consulter et télécharger ces documents ? — **Réponse partielle :** 23 octobre, § 1.2 et 1.3 : génération par le formateur et consultation par le gestionnaire ; l’administrateur dispose de tous les droits. Les modalités de téléchargement ne sont pas précisées.

## 16. Recherche, consultation et ergonomie

- [ ] Quelles informations les utilisateurs rechercheront-ils le plus souvent ? — **Réponse partielle :** 22 octobre, § 2.1 : recherche, consultation et visualisation du matériel ; les informations les plus recherchées ne sont pas hiérarchisées.
- [ ] Quels critères de recherche et filtres sont nécessaires ? — **Réponse partielle :** 22 octobre, § 2.6 : filtre par salle pour le tableau de bord ; critères de recherche des matériels non détaillés.
- [ ] Faut-il permettre une recherche globale dans toute l’application ?
- [ ] Quels volumes de résultats doivent être affichés ou exportés ?
- [x] Quelles actions groupées sont nécessaires ? — 22 octobre, § 2.4 : affectation et gestion de plusieurs matériels à la fois. Le gestionnaire ne peut pas supprimer de matériel (§ 2.3).
- [ ] Responsive ? L’interface doit-elle être utilisable sur tablette ou téléphone ?
- [x] Quels navigateurs et versions doivent être pris en charge ? — 22 octobre, § 2.8 : Firefox, dans les versions installées sur les postes de l’équipe.
- [ ] Existe-t-il des exigences d’accessibilité numérique ?
- [ ] L’application doit-elle être disponible dans plusieurs langues ?
- [ ] Faut-il proposer une aide intégrée ou un guide utilisateur ?

## 17. Reprise des fichiers Excel

- [x] **P0** Peut-on obtenir des exemples (anonymisés) des fichiers Excel actuellement utilisés ? — 23 octobre, § 1.6 : aucun fichier Excel ni exemple fourni.
- [ ] ~~Toutes les écoles utilisent-elles le même modèle de fichier ?~~ — Sans objet pour la reprise actuellement documentée : aucun fichier Excel ni exemple fourni le 23 octobre (§ 1.6). À rouvrir si des fichiers sont transmis.
- [ ] ~~Quelles feuilles, colonnes, formules et règles métier sont utilisées ?~~ — Sans objet pour la reprise actuellement documentée : aucun fichier Excel ni exemple fourni le 23 octobre (§ 1.6). À rouvrir si des fichiers sont transmis.
- [x] Quel volume de données doit être repris ? — 23 octobre, § 1.6 : aucune donnée de reprise fournie. Cela ne tranche pas la capacité d’import JSON évoquée le 22 octobre (§ 2.7).
- [ ] ~~Quelle est la qualité actuelle des données ?~~ — Sans objet à ce stade : aucune donnée de reprise fournie le 23 octobre (§ 1.6).
- [ ] ~~Qui corrigera les données incomplètes ou incohérentes avant l’import ?~~ — Sans objet pour les données de reprise non fournies (23 octobre, § 1.6). Les contrôles d’un éventuel import JSON constituent un sujet distinct.
- [ ] ~~Comment faire correspondre les valeurs existantes avec les nouveaux référentiels ?~~ — Sans objet pour les données de reprise non fournies (23 octobre, § 1.6). À rouvrir si une reprise est demandée.
- [ ] ~~Comment détecter et traiter les doublons ?~~ — Sans objet pour la reprise non fournie (23 octobre, § 1.6). La prévention des doublons de matériel reste ouverte en section 4.
- [ ] ~~Faut-il conserver les identifiants historiques ?~~ — Sans objet pour les données de reprise non fournies (23 octobre, § 1.6). À rouvrir si une reprise est demandée.
- [ ] ~~L’import Excel est-il limité à la migration initiale ?~~ — Sans objet à ce stade : 23 octobre, § 1.6 : aucun fichier Excel ni donnée de reprise fourni ; pas de reprise Excel à traiter actuellement. L’import JSON de nouveaux périphériques reste un sujet distinct.
- [ ] Les utilisateurs doivent-ils pouvoir effectuer eux-mêmes de nouveaux imports ? — **Réponse partielle :** précision de l’utilisateur du 24 octobre : saisie manuelle et import JSON prévus pour les nouveaux matériels, sans connexion directe au CND. La mise à jour par import est immédiate, sans vérification (22 octobre, § 2.7). Les rôles autorisés à importer restent à préciser.
- [ ] Faut-il conserver un export Excel pour les échanges ou le mode dégradé ?
- [ ] ~~Comment vérifier et valider le résultat d’une migration ?~~ — Sans objet pour la reprise actuellement documentée : aucune donnée fournie le 23 octobre (§ 1.6). À rouvrir si une migration est demandée.

## 18. Authentification et sécurité

- [ ] **P0** Quel système d’authentification doit être utilisé ? — **Réponse partielle :** 22 octobre, § 2.8 : système non défini ; LDAP évoqué sans confirmation (« je ne sais pas »).
- [ ] Une intégration à Active Directory, LDAP ou un SSO est-elle disponible ? — **Réponse partielle :** 22 octobre, § 2.8 : LDAP évoqué, disponibilité et intégration non confirmées.
- [ ] L’authentification multifacteur est-elle requise ?
- [ ] Quelles règles de mot de passe s’appliquent si des comptes locaux sont utilisés ?
- [ ] Comment les comptes quittant l’organisation sont-ils désactivés ?
- [ ] Comment les droits sont-ils attribués et revus ?
- [ ] Faut-il limiter l’accès selon le réseau, le site ou le type de terminal ?
- [ ] Quelles données sont considérées comme sensibles ?
- [ ] Existe-t-il une classification de sécurité à respecter ?
- [ ] Quelles données personnelles seront enregistrées ? — **Réponse partielle :** 23 octobre, § 1.2 : récupération du nom de session envisagée pour identifier l’utilisateur associé aux processus ; autres données personnelles non précisées.
- [ ] Quelles durées de conservation s’appliquent aux données et aux journaux ?
- [ ] Quelles actions doivent être tracées dans un journal d’audit ? — **Réponse partielle :** 22 octobre, § 2.8 : journaux en bonus et proposition libre ; actions à tracer non définies.
- [ ] Qui peut consulter les journaux d’audit ?
- [ ] Les journaux doivent-ils être protégés contre la modification ?
- [ ] ~~Comment les éventuels agents installés sur les postes s’authentifient-ils auprès du serveur ?~~ — Sans objet pour la démonstration des processus simulés (22 octobre, § 2.1), sans agent réel prévu pour cette simulation. À rouvrir si un agent est retenu.
- [ ] Comment les secrets, certificats et clés techniques sont-ils distribués et renouvelés ?

## 19. Architecture, réseau et intégrations

- [ ] **P0** Où l’application doit-elle être hébergée ?
- [ ] L’environnement cible dispose-t-il d’un accès à Internet ? — **Réponse partielle :** 22 octobre, § 2.8 : note « réseau NP interne internet », dont le sens reste à préciser ; accès à Internet non confirmé.
- [ ] Quels flux réseau entrants et sortants sont autorisés ?
- [ ] Les écoles sont-elles reliées au même réseau ?
- [ ] Existe-t-il des réseaux ou zones de sécurité séparés ?
- [ ] Les postes supervisés peuvent-ils communiquer directement avec le serveur ?
- [ ] Un fonctionnement partiel hors connexion est-il nécessaire ?
- [ ] Quels systèmes existants doivent être intégrés à ASTER ?
- [ ] Quelles API, documentations et plateformes de test sont disponibles ?
- [ ] Quelles technologies sont imposées, recommandées ou interdites ? — **Réponse partielle :** 22 octobre, § 2.1 et 2.8 : cible Windows et navigateur Firefox ; autres choix techniques non précisés.
- [ ] Les composants open source sont-ils autorisés ?
- [ ] Existe-t-il des contraintes de licences logicielles ?
- [ ] L’utilisation de conteneurs est-elle autorisée dans l’environnement cible ?
- [ ] Quels environnements doivent être prévus : développement, test, recette et production ?
- [ ] Qui fournit et administre les serveurs, bases de données, certificats et noms de domaine ?

## 20. Volumétrie, performance et disponibilité

- [ ] Combien d’utilisateurs simultanés faut-il supporter ?
- [ ] Combien de postes peuvent remonter des données en même temps ?
- [ ] Quelle quantité de données de supervision sera produite par jour ?
- [ ] Quels temps de réponse sont attendus pour les principales actions ?
- [ ] Quelle durée maximale est acceptable pour un import ou un export ?
- [ ] Quelle disponibilité du service est requise ?
- [ ] Quelles périodes d’indisponibilité sont acceptables ?
- [ ] Quel délai de rétablissement est attendu après une panne ?
- [ ] Quelle quantité de données peut être perdue en cas d’incident ?
- [ ] Faut-il mettre en place de la haute disponibilité ?
- [ ] Quelles règles d’archivage ou de purge doivent limiter la croissance des données ?

## 21. Sauvegarde, exploitation et maintenance

- [ ] Qui surveillera le bon fonctionnement du serveur et des éventuels agents ?
- [ ] À quelle fréquence les sauvegardes doivent-elles être réalisées ?
- [ ] Où les sauvegardes doivent-elles être stockées ?
- [ ] À quelle fréquence une restauration doit-elle être testée ?
- [ ] Comment les mises à jour de l’application seront-elles déployées ?
- [ ] ~~Comment les mises à jour des agents seront-elles déployées ?~~ — Sans objet pour la démonstration des processus simulés (22 octobre, § 2.1). À rouvrir si un agent réel est retenu.
- [ ] Une procédure de retour à la version précédente est-elle nécessaire ?
- [ ] Quels journaux techniques doivent être collectés ? — **Réponse partielle :** 22 octobre, § 2.8 : journaux en bonus, proposition libre de l’équipe ; contenu technique non précisé.
- [ ] Qui reçoit les alertes concernant le fonctionnement d’ASTER lui-même ?
- [ ] Quels outils de supervision technique sont déjà disponibles ?
- [ ] Quel niveau de documentation technique et d’exploitation est attendu ? — **Réponse partielle :** 23 octobre, § 1.6 : dossier d’architecture technique demandé ; niveau attendu pour les procédures d’exploitation non précisé.
