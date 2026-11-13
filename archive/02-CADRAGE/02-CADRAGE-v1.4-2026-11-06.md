# Questions de cadrage du projet ASTER

**Document de travail interne, non destiné à la remise aux cadres évaluateurs.** Il conserve les réponses et leurs périmètres pour préparer les productions. Les documents remis décrivent la cible en production ; les modalités de réalisation et les comptes du démonstrateur sont réservés au [guide interne de développement](../application/README.md). Cette distinction a été fixée par l’utilisateur le 6 novembre.

Ce document présente les questions de cadrage et les réponses en vigueur, issues des [entretiens des 22 et 23 octobre](03-COMPTE-RENDU-ENTRETIENS.md) et des réponses apportées ensuite directement par l’utilisateur. Les réponses datées du 2 novembre ont été fournies par l’utilisateur dans les échanges de cadrage et ne font pas partie des comptes rendus d’entretien. Pour chaque sujet, la dernière réponse remplace les précédentes. Les réponses antérieures restent applicables lorsqu’elles n’ont pas été remplacées ; les comptes rendus conservent uniquement la trace historique des entretiens. Les questions marquées **P0** conditionnent directement la faisabilité ou l’estimation des développements.

Le [MCD Merise](05-MCD-MERISE.svg) constitue un modèle de travail proposé. Il n'a pas encore été validé par le client et doit lui être présenté. Les décisions fonctionnelles déjà recueillies restent documentées dans le présent cadrage ; le modèle et ses cardinalités devront être confirmés avant de devenir la référence conceptuelle.

**Légende :**

- `[x]` : une réponse a été recueillie, y compris lorsqu’elle est négative ; cela ne vaut pas validation globale du besoin.
- `[ ]` : question ouverte. Une mention **Réponse partielle** précise les éléments déjà recueillis et ce qui reste effectivement à définir. Une ancienne réponse remplacée ne constitue pas une question ouverte.
- Question barrée : sans objet dans le périmètre indiqué par la note ; à rouvrir si ce périmètre évolue.

Les dates et numéros de section des annotations renvoient au compte rendu des entretiens. La simulation des processus ne dispense pas de définir leur comportement fonctionnel ; seules les questions de déploiement réel explicitement concernées sont barrées pour la démonstration. L’absence de fichiers de reprise ne supprime pas le besoin éventuel d’importer de nouveaux matériels.

## 1. Vision et objectifs

- [x] **P0** Quel problème doit être résolu en priorité par ASTER ? — 22 octobre, § 2.1 : gestion des périphériques en priorité, puis supervision des processus.
- [ ] **P0** Quel résultat concret permettra de considérer le projet comme réussi ? — **Réponse partielle, complétée par l'utilisateur le 3 novembre :** la gestion des matériels constitue le premier critère de réussite. Les actions ou scénarios précis permettant de vérifier ce critère restent à définir. Le 22 octobre (§ 2.1), le client demandait de faciliter la mise à jour, la recherche, la consultation et la visualisation.
- [x] **P0** Quel est le périmètre attendu pour la première version utilisable ? — Précision de l’utilisateur du 24 octobre : gestion complète des matériels, avec une démonstration pour une école, deux bâtiments et six à huit salles par bâtiment ; gestion des processus simulée. La gestion de plusieurs écoles est prévue à terme, hors des attendus de la V1. ASTER ne gère pas les formations (précision de l’utilisateur du 24 octobre).
- [ ] Quels défauts du fonctionnement actuel sous Excel faut-il corriger en priorité ?
- [x] Quelles fonctionnalités peuvent être simulées, maquettées ou reportées ? — 22 octobre, § 2.1 et 2.8 : gestion des processus simulée et journaux en bonus. 23 octobre, § 1.1 : gestion de la garantie en bonus.
- [ ] Qui valide le besoin, les priorités et le résultat final ?

## 2. Périmètre organisationnel

- [x] **P0** ASTER doit-il couvrir une seule école ou plusieurs établissements ? — Précision de l’utilisateur du 24 octobre : ASTER doit pouvoir gérer plusieurs écoles à terme, mais cette capacité ne fait pas partie des attendus de la V1. La démonstration de la V1 porte sur une seule école.
- [ ] Une administration centrale doit-elle avoir une vue sur l’ensemble des écoles ?
- [x] Quelles entités doivent être représentées : organisme, école, site, bâtiment, étage, salle ou autre ? — **Décision de l'utilisateur du 2 novembre, précisée dans le présent échange :** l'école et la salle sont des entités ; la salle est rattachée à une école et porte l'information de son bâtiment. Aucune entité `BATIMENT` autonome n'est nécessaire. L'école et la salle possèdent chacune un nom. Aucun niveau « étage » distinct n'est nécessaire : le code de la salle contient souvent le numéro de l'étage.
- [ ] Une salle peut-elle dépendre de plusieurs services ou formations ?
- [x] Faut-il gérer des salles temporaires, fermées ou indisponibles ? — 22 octobre, § 2.2 : pas de gestion des salles temporaires ou hors service.
- [ ] Combien d’écoles, de salles, de postes et d’autres matériels sont concernés aujourd’hui ? — **Réponse partielle :** précision de l’utilisateur du 24 octobre : démonstration pour une école, deux bâtiments et six à huit salles par bâtiment. La possibilité d’ajout est prévue (22 octobre, § 2.1). Les volumes réels et les nombres de postes et matériels ne sont pas précisés.

## 3. Utilisateurs, rôles et responsabilités

- [x] **P0** Quelles catégories d’utilisateurs utiliseront réellement l’application ? — **Décision de l’utilisateur du 3 novembre, remplaçant la liste du 24 octobre :** quatre profils existent dans ASTER : administrateur, gestionnaire, formateur et super administrateur. Aucun compte stagiaire n’est prévu.
- [x] À quelle organisation un utilisateur est-il rattaché ? — **Décision de l’utilisateur du 3 novembre :** l’administrateur, le gestionnaire et le formateur sont chacun rattachés à une école. Le super administrateur n’est rattaché à aucune école.
- [x] Le rattachement à une école limite-t-il les droits et les données accessibles ? — **Décision de l’utilisateur du 3 novembre :** l’administrateur, le gestionnaire et le formateur accèdent uniquement aux données de leur école de rattachement. Le super administrateur accède aux données de toutes les écoles.
- [x] Que recouvre précisément le terme « acteurs de la formation » ? — Précision de l’utilisateur du 24 octobre, complétée le 3 novembre : expression générale issue du sujet, sans rôle supplémentaire dans ASTER. Les profils sont administrateur, gestionnaire, formateur et super administrateur. ASTER ne gère pas les formations.
- [x] Quelles actions un gestionnaire de matériel peut-il consulter, créer, modifier ou supprimer ? — 22 octobre, § 2.2 et 2.3, complété par l’utilisateur le 3 novembre : gestion de l’ensemble des stocks de son école, affectation, création, consultation et modification des matériels ; pas de suppression.
- [x] Quelles actions un administrateur de salle technique peut-il réaliser ? — 23 octobre, § 1.2, complété par l’utilisateur le 3 novembre : l’administrateur dispose de tous les droits dans son école de rattachement. Le super administrateur dispose des mêmes droits sur l’ensemble des écoles.
- [x] Quelles actions un formateur peut-il réaliser sur les postes de sa salle ? — 23 octobre, § 1.2 et 1.3 : accéder à une salle, consulter et arrêter les processus utilisateur (IDE, navigateur, etc.), sans arrêter les processus système, et créer une remontée pour un problème.
- [x] Les droits d’un formateur sont-ils limités à certaines salles ? — Précision de l’utilisateur du 27 octobre, complétée le 3 novembre : le formateur peut accéder à toutes les salles de son école de rattachement, car il peut intervenir dans plusieurs salles. Ses actions restent limitées aux droits de son profil.
- [ ] ~~Les droits d’un formateur sont-ils limités à certaines périodes d’utilisation ?~~ — **Sans objet, décision de l’utilisateur du 3 novembre :** aucune limitation temporelle des droits du formateur n’est demandée.
- [x] Existe-t-il un rôle de consultation seule ? — 22 octobre, § 2.3, complété par l’utilisateur le 3 novembre : aucun profil de consultation seule parmi les quatre profils identifiés.
- [x] Existe-t-il un rôle d’administrateur fonctionnel chargé du paramétrage ? — **Décision de l’utilisateur du 3 novembre :** l’administrateur et le super administrateur possèdent les mêmes droits fonctionnels ; ils se distinguent par leur périmètre d’accès aux écoles. Aucun profil fonctionnel distinct n’est prévu.
- [x] Existe-t-il un rôle d’administrateur technique chargé de l’exploitation ? — **Décision de l’utilisateur du 3 novembre :** l’administrateur et le super administrateur possèdent les mêmes droits applicatifs ; ils se distinguent par leur périmètre d’accès aux écoles. Aucun profil technique distinct n’est prévu.
- [x] Un utilisateur peut-il cumuler plusieurs rôles ? — **Décision de l’utilisateur du 3 novembre :** non. Chaque utilisateur ASTER possède exactement un profil parmi administrateur, gestionnaire, formateur et super administrateur.
- [x] Qui crée, modifie, désactive et réactive les comptes ? — **Décision de l’utilisateur du 3 novembre :** l’administrateur gère les comptes rattachés à son école. Le super administrateur gère les comptes de toutes les écoles. Le gestionnaire et le formateur ne gèrent pas les comptes ASTER.
- [x] Qui autorise les opérations sensibles sur les postes ? — Précision de l’utilisateur du 24 octobre, complétée le 3 novembre : chaque utilisateur autorisé peut agir directement, dans la limite de ses droits, sans accord préalable d’une autre personne. L’administrateur et le super administrateur disposent de tous les droits sur leur périmètre et réalisent la masterisation ; le formateur peut arrêter les processus utilisateur, hors processus système (23 octobre, § 1.2 et 1.5).
- [x] Certaines opérations nécessitent-elles une validation par une seconde personne ? — Précision de l’utilisateur du 24 octobre : non, l’utilisateur autorisé peut agir directement dans la limite de ses droits.
- [ ] ~~Faut-il déléguer temporairement des droits en cas d’absence ?~~ — **Sans objet, décision de l’utilisateur du 3 novembre :** aucun mécanisme de délégation temporaire des droits n’est demandé.

## 4. Modèle du parc informatique

- [x] **P0** Qu’est-ce qu’un « matériel » dans ASTER ? — Précision de l’utilisateur du 24 octobre : tout équipement informatique. Il n’existe pas de liste exhaustive des types à ce jour.
- [x] **P0** Quelle différence faut-il faire entre matériel, machine, unité centrale et poste ? — **Réponse en vigueur de l'utilisateur du 2 novembre :** dans le modèle conceptuel d'ASTER, le poste est une entité autonome de supervision des processus. Il est distinct du matériel d'inventaire et ne le spécialise pas. Cette réponse remplace la qualification précédente du poste comme matériel de type PC.
- [ ] Un poste correspond-il à une unité centrale seule ou à un ensemble comprenant écran et périphériques ? — **Réponse partielle de l'utilisateur du 2 novembre :** cette composition n'intervient pas dans la supervision des processus et ne crée aucun lien conceptuel entre `POSTE` et `MATERIEL`. La granularité propre à l'inventaire reste à préciser.
- [x] Quels types de matériels doivent être gérés dans la première version ? — Précision de l’utilisateur du 24 octobre : tous les équipements informatiques ; aucune liste exhaustive n’existe à ce jour. Les exemples cités lors des entretiens ne limitent pas le périmètre.
- [x] Faut-il gérer les écrans, imprimantes, vidéoprojecteurs, commutateurs, bornes Wi-Fi et périphériques ? — Précision de l’utilisateur du 24 octobre : tous les équipements informatiques sont concernés, sans exclusion de type ; aucune liste exhaustive n’existe à ce jour.
- [ ] Les équipements réseau font-ils partie de l’inventaire ou de la topologie technique ?
- [ ] Peut-on créer de nouveaux types de matériels sans modifier l’application ?
- [x] Quelles informations sont obligatoires pour chaque type de matériel ? — Précisions de l’utilisateur du 24 octobre : modèle, date de réception et statut obligatoires. L’identifiant interne est attribué et géré automatiquement par ASTER ; il est consultable, sans saisie par l’utilisateur. Le numéro de série est renseigné lorsqu’il existe et peut rester vide pour un matériel qui n’en possède pas. Le modèle est obligatoire et peut être une simple désignation du matériel, notamment pour un câble ; il ne désigne pas nécessairement une référence constructeur. La marque peut ne pas être renseignée, notamment pour un câble. Le statut est limité à « hors service : oui/non », avec « hors service : non » comme valeur par défaut à la création. La gestion de la garantie reste un bonus (23 octobre, § 1.1) ; seule sa date de fin est renseignée, sans date de début ni durée (précision de l’utilisateur du 24 octobre).
- [ ] **P0** Comment représenter l'état « hors service » dans le MCD tout en excluant les attributs booléens : par une entité d'état, une association ou une autre valeur persistante ?
- [x] Quel identifiant fait foi : numéro d’inventaire, numéro de série, étiquette interne ou autre ? — Précision de l’utilisateur du 24 octobre : identifiant interne unique attribué et géré automatiquement par ASTER, consultable mais non saisi par l’utilisateur. Le numéro de série constitue une information distincte, renseignée lorsqu’il existe.
- [x] Un matériel peut-il posséder plusieurs identifiants ? — Précision de l’utilisateur du 24 octobre : chaque matériel possède un identifiant interne géré par l’application et peut aussi avoir un numéro de série lorsqu’il en possède un.
- [ ] **P0** Les identifiants ajoutés à `ECOLE`, `SALLE`, `UTILISATEUR`, `REMONTEE` et `REGLE_PROCESSUS` sont-ils obligatoires, internes et uniques ?
- [x] Faut-il gérer la marque, le modèle, le fournisseur, la date d’achat, la garantie et la valeur ? — Précisions de l’utilisateur du 24 octobre : modèle obligatoire, pouvant simplement désigner le matériel ; marque pouvant rester non renseignée, notamment pour un câble. Aucun fournisseur, aucune valeur et aucune date d’achat. La gestion de la garantie reste un bonus (23 octobre, § 1.1) ; seule sa date de fin est renseignée, sans date de début ni durée (précision de l’utilisateur du 24 octobre).
- [ ] Faut-il gérer les caractéristiques techniques des machines ?
- [x] Faut-il joindre des documents, photographies ou factures à une fiche matériel ? — 22 octobre, § 2.4 : aucun document associé à la fiche matériel.
- [ ] Faut-il imprimer des étiquettes, codes-barres ou QR codes ?
- [ ] Quelles règles empêchent la création de doublons ?

## 5. Localisation, affectation et cycle de vie

- [x] **P0** Quel niveau de précision est attendu pour localiser un matériel ? — **Réponse en vigueur, précisée par l'utilisateur le 2 novembre dans le présent échange :** un matériel est affecté à une salle ou reste en stock sans localisation. Le bâtiment est connu par l'information portée par la salle ; il ne constitue pas une destination d'affectation autonome.
- [x] Faut-il représenter le site, le bâtiment, l’étage, la salle, le bureau, la baie ou le port réseau ? — **Décision de l'utilisateur du 2 novembre, précisée dans le présent échange :** la salle est rattachée à une école et renseigne son bâtiment, sans entité `BATIMENT` distincte. La localisation d'un matériel provient de la salle à laquelle il est affecté ; il n'est pas affecté directement à une école ou à un bâtiment. Aucun niveau « étage » distinct n'est prévu ; le code de la salle contient souvent le numéro de l'étage.
- [x] Un matériel peut-il être affecté à une personne plutôt qu’à une salle ? — **Réponse en vigueur, précisée par l'utilisateur le 2 novembre dans le présent échange :** non. Un matériel est affecté à une salle, jamais à une personne ; il peut également être en stock sans localisation.
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
- [x] Faut-il produire une alerte avant l’expiration ? — 23 octobre, § 1.1 : gestion de la garantie en bonus. Si ce bonus est réalisé, l'indication et la notification sont prévues six mois avant la fin de garantie (22 octobre, § 2.6, seuil non remplacé).
- [x] Qui peut créer, modifier ou renouveler une aptitude ? — Précision de l’utilisateur du 24 octobre : le gestionnaire et l’administrateur peuvent renseigner et modifier la date de fin de garantie. À l’expiration, le matériel est signalé comme « hors garantie » ; aucun mécanisme distinct de renouvellement n’est prévu.
- [ ] ~~**P0** Qu’est-ce qu’une « formation induite » ?~~ — Précision de l’utilisateur du 24 octobre : ASTER ne gère pas les formations ; cette notion issue du sujet n’est pas à modéliser comme une formation à gérer.
- [ ] ~~La formation induite concerne-t-elle l’utilisation, la maintenance ou l’administration d’un matériel ?~~ — Précision de l’utilisateur du 24 octobre : aucune gestion des formations dans ASTER.
- [ ] ~~Faut-il seulement associer des formations à un matériel ou suivre les personnes formées ?~~ — Précision de l’utilisateur du 24 octobre : aucune gestion des formations ni suivi des personnes formées. Le rôle ou la destination d’un matériel (réseau, développement, etc.) reste une information sur le matériel, évoquée le 23 octobre (§ 1.1).
- [ ] ~~Existe-t-il déjà un référentiel officiel des aptitudes et des formations ?~~ — Sans objet, précision de l’utilisateur du 24 octobre : les informations concernées se limitent à la date de fin de garantie et à l’indication « hors service : oui/non » du matériel ; aucun référentiel d’aptitudes ni gestion des formations à prévoir.
- [ ] ~~ASTER doit-il échanger des données avec un système de gestion de la formation ?~~ — Précision de l’utilisateur du 24 octobre : aucune gestion des formations dans le périmètre d’ASTER ; aucun échange de ce type n’est attendu dans ce périmètre.

## 8. Applications installées

- [ ] **P0** La liste des applications doit-elle être déclarée manuellement ou détectée automatiquement sur les postes ?
- [ ] Si elle est détectée, quel mécanisme ou outil existant fournit ces informations ? — **Réponse partielle de l'utilisateur du 3 novembre :** l'application web ASTER doit utiliser les mécanismes d'administration à distance déjà fournis par Windows, sans installer d'agent sur les machines cibles. Le mécanisme de collecte, le format et le protocole restent à définir.
- [ ] Qu’est-ce qui distingue une application métier d’une autre application ? — **Réponse partielle :** 23 octobre, § 1.1 : application « de base » présente sur un poste ; le caractère natif et la distinction exacte restent à préciser.
- [ ] Existe-t-il un référentiel officiel des applications métier ?
- [ ] Faut-il relever le nom, la version, l’éditeur, la date d’installation et la licence ?
- [ ] Faut-il distinguer les applications obligatoires, autorisées, tolérées et interdites ?
- [x] Les règles dépendent-elles de l’école, de la salle, du poste ou de la formation en cours ? — **Réponse en vigueur de l'utilisateur du 2 novembre :** les règles de processus peuvent être globales ou concerner une école, un bâtiment ou une salle. La portée bâtiment désigne les salles dont l'information de bâtiment correspond ; elle ne suppose pas une entité `BATIMENT` autonome (décision de l'utilisateur du 2 novembre dans le présent échange). Les règles ne sont portées ni par un poste ni par une formation.
- [ ] Faut-il détecter les versions absentes, obsolètes ou non conformes ?
- [ ] Faut-il conserver l’historique des logiciels installés ?
- [ ] Qui peut modifier le référentiel des applications ?
- [x] ASTER doit-il installer ou désinstaller une application, ou seulement signaler sa présence ? — **Décision de l'utilisateur du 3 novembre :** l’administrateur peut déclencher à distance l’installation et la désinstallation d’une application depuis l’application web ASTER, pour un poste individuel ou l’ensemble des postes d’une salle. L’opération utilise les mécanismes d’administration Windows existants, sans agent ASTER ; le mécanisme précis reste à identifier.

## 9. Réinstallation des postes et des salles

- [x] **P0** Que signifie précisément « réinstaller » ou « replaquer » un poste ? — 23 octobre, § 1.5 : la masterisation consiste à réappliquer une image sur un poste, par l’administrateur.
- [x] **P0** ASTER doit-il exécuter la réinstallation, la déclencher dans un outil tiers ou seulement créer une demande ? — **Réponse de l'utilisateur du 3 novembre :** l'administrateur lance la demande depuis l'application web ASTER, qui doit s'appuyer sur les mécanismes de déploiement Windows sans installer d'agent ASTER ni développer son propre moteur d'image. L'infrastructure et l'interface de déclenchement restent à identifier.
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
- [ ] ~~Qui peut annuler ou interrompre une réinstallation ?~~ — **Sans objet, décision de l’utilisateur du 3 novembre :** ces actions ne sont pas demandées dans ASTER. L’administrateur reste le seul profil autorisé à déclencher la réinstallation.
- [ ] Faut-il demander une confirmation renforcée pour une salle complète ?
- [ ] Peut-on réinstaller seulement une partie des postes d’une salle ?
- [ ] Comment suivre la progression de l’opération ?
- [ ] Comment signaler un échec partiel ou total ?
- [ ] Une reprise automatique est-elle attendue après un échec ?
- [ ] Quel compte rendu doit être conservé après l’opération ?
- [ ] Combien de réinstallations simultanées l’infrastructure peut-elle supporter ?

## 10. Supervision des postes

- [x] **P0** Que signifie « superviser un poste » pour le commanditaire ? — **Réponse du 23 octobre, § 1.2, complétée par l'utilisateur les 2 et 3 novembre :** consulter les processus utilisateur des postes d'une salle, permettre leur arrêt manuel et appliquer automatiquement les règles de blacklist. Le formateur peut entrer dans toutes les salles de son école de rattachement, mais ne dispose pas d'une vue globale de supervision. La gestion des processus est simulée pour la démonstration (22 octobre, § 2.1).
- [x] **P0** La supervision doit-elle être en temps réel ou périodique ? — **Réponse de l'utilisateur du 2 novembre :** supervision périodique actualisée toutes les cinq secondes.
- [x] Quelles données doivent remonter depuis chaque poste ? — **Réponse de l'utilisateur du 2 novembre :** les processus internes sont exclus. Dans le MCD, `PROCESSUS` conserve uniquement un identifiant et un nom ; `POSTE` et `COMPTE_WINDOWS` sont des entités distinctes reliées au processus par l'association ternaire `exécuter`. Cette association porte les dates de démarrage, de détection et d'arrêt. Les autres informations de supervision relèvent des traitements.
- [x] **P0** Quels identifiants et attributs persistants définissent `POSTE` et `COMPTE_WINDOWS` ? — **Réponse vérifiée dans la source du MCD et complétée par l’utilisateur le 2 novembre :** `POSTE` porte `Id_poste`, `nom_réseau`, `adresse_ip` et `adresse_mac`. `COMPTE_WINDOWS` porte l'identifiant interne `Id_compte` et le champ `nom_utilisateur`, qui correspond au nom du compte Windows utilisé sur le poste.
- [x] Un même nom de compte Windows utilisé sur plusieurs postes représente-t-il une seule entité ? — **Réponse de l'utilisateur du 2 novembre :** oui, il s'agit d'une seule et même entité `COMPTE_WINDOWS`. Elle ne représente pas une connexion particulière à un poste.
- [x] Faut-il renommer `SESSION` pour refléter cette signification ? — **Décision de l'utilisateur du 2 novembre, répercutée dans la proposition de MCD le 3 novembre :** l'entité est nommée `COMPTE_WINDOWS`, car elle représente un compte Windows commun à plusieurs postes et non une connexion particulière. Le MCD complet reste à valider par le client.
- [ ] **P0** Un même processus peut-il être exécuté plusieurs fois par le même utilisateur de session sur le même poste ? Si oui, faut-il transformer `exécuter` en entité d'exécution identifiée afin de distinguer ces occurrences ?
- [x] Faut-il connaître l’état en ligne ou hors ligne des machines ? — **Réponse de l'utilisateur du 2 novembre :** oui. Après trois remontées manquées, soit environ quinze secondes, le poste est considéré comme déconnecté ; il reste affiché dans sa salle sans processus.
- [ ] Faut-il remonter les performances telles que CPU, mémoire, disque et réseau ?
- [ ] Faut-il remonter l’état des services, applications ou périphériques ?
- [x] Quelle fréquence de collecte est nécessaire ? — **Réponse de l'utilisateur du 2 novembre :** toutes les cinq secondes. Un léger décalage entre les postes et un recul progressif en cas d'erreur sont recommandés pour éviter des pics de charge simultanés.
- [x] Quelle ancienneté maximale d’une donnée est acceptable à l’écran ? — **Réponse de l'utilisateur du 2 novembre :** cinq secondes pour un poste connecté ; après environ quinze secondes sans remontée, le poste passe à l'état déconnecté et ses processus ne sont plus affichés.
- [x] Faut-il conserver un historique des mesures ? — **Réponse de l'utilisateur du 2 novembre :** oui pour les détections de processus blacklistés et non référencés. Les exécutions des processus de la whitelist ne sont pas historisées.
- [ ] Pendant combien de temps cet historique doit-il être conservé ? — **Réponse partielle de l'utilisateur du 2 novembre :** l'historique des processus blacklistés et non référencés doit être conservé ; sa durée de conservation reste à confirmer.
- [ ] **P0** Parmi les données exigées par RG-56, lesquelles doivent rester persistantes dans le MCD malgré l'exclusion des valeurs temporaires et calculées ?
- [x] Un agent doit-il être installé sur les postes ? — **Réponse en vigueur de l'utilisateur du 3 novembre :** non. L'installation d'un agent ASTER sur les machines cibles est interdite. Cette décision remplace la réponse du 2 novembre qui prévoyait un agent.
- [ ] ~~Si oui, qui déploie, configure et met à jour cet agent ?~~ — Sans objet depuis la décision du 3 novembre interdisant l'installation d'un agent ASTER.
- [ ] Comment ASTER échange-t-il avec les postes au moyen des mécanismes Windows ? — **Réponse partielle de l'utilisateur du 3 novembre :** l'application web ASTER conserve la gestion des processus et utilise les mécanismes d'administration à distance fournis par Windows. Le sens des connexions, les services activés et les protocoles restent à définir.
- [x] Comment gérer un poste temporairement déconnecté ? — **Réponse de l'utilisateur du 2 novembre :** il reste visible dans sa salle, sans liste de processus.
- [ ] La supervision doit-elle fonctionner sur plusieurs segments réseau isolés ?

## 11. Processus autorisés, interdits et arrêtés

- [x] **P0** Quels processus doivent être surveillés et pour quelle raison métier ? — **Réponse de l'utilisateur du 2 novembre :** surveiller les processus utilisateur afin de distinguer les processus reconnus, interdits et non référencés, vérifier l'utilisation des logiciels attendus et arrêter automatiquement les applications interdites. Les processus internes ne font pas partie des remontées.
- [x] Comment un processus métier est-il identifié de manière fiable ? — **Réponse en vigueur de l'utilisateur du 2 novembre :** chaque processus possède un identifiant et un nom. Précision de l'utilisateur du 2 novembre dans le présent échange : `PROCESSUS` désigne un programme identifiable, et non une exécution particulière de ce programme. L'association `exécuter` décrit son exécution par un utilisateur de session sur un poste et porte les dates correspondantes. Le PID, temporaire et réutilisable par la machine, n'est pas conservé dans le MCD.
- [x] Les règles sont-elles globales ou propres à une école, une salle, un poste ou une formation ? — **Réponse en vigueur de l'utilisateur du 2 novembre :** elles peuvent être globales ou définies pour une école, un bâtiment ou une salle. La portée bâtiment concerne les salles identifiées par leur information de bâtiment, sans entité `BATIMENT` autonome (décision de l'utilisateur du 2 novembre dans le présent échange). Un poste ne porte pas de règle de processus. Les règles applicables se cumulent jusqu'à la salle ; une interdiction héritée ne peut pas être annulée à un niveau inférieur.
- [x] « Autoriser » signifie-t-il simplement ne pas alerter ou permettre explicitement l’exécution ? — **Réponse de l'utilisateur du 2 novembre :** tout processus absent de la blacklist est autorisé. La whitelist identifie explicitement les processus reconnus comme autorisés ; les autres processus autorisés sont classés « non référencés ».
- [x] « Interdire » signifie-t-il signaler, bloquer le lancement ou arrêter automatiquement ? — **Réponse de l'utilisateur du 2 novembre :** un processus blacklisté est arrêté automatiquement et génère une alerte. La blacklist est prioritaire sur la whitelist.
- [x] Qui crée et valide les listes de processus autorisés ou interdits ? — **Réponse de l'utilisateur du 2 novembre :** pour la version actuelle, seul l'administrateur gère les listes.
- [ ] Comment gérer les changements de nom ou de version d’un programme ?
- [x] Quels rôles peuvent arrêter un processus à distance ? — 23 octobre, § 1.2 : l’administrateur, qui dispose de tous les droits, et le formateur pour les processus utilisateur uniquement, hors processus du système d’exploitation.
- [x] Dans quelles situations l’arrêt d’un processus est-il autorisé ? — **Réponse du 23 octobre, § 1.2, complétée par l'utilisateur le 2 novembre :** le formateur ou l'administrateur peut arrêter manuellement un processus utilisateur remonté ; un processus blacklisté est arrêté automatiquement.
- [x] L’utilisateur du poste doit-il être averti avant l’arrêt ? — **Réponse de l'utilisateur du 2 novembre :** non.
- [x] Une justification doit-elle être saisie avant une action distante ? — **Réponse de l'utilisateur du 2 novembre :** non. L'arrêt automatique ne demande pas non plus de confirmation.
- [x] Quelles protections empêchent l’arrêt d’un processus système critique ? — Précision de l’utilisateur du 24 octobre : les processus internes ne font pas partie des remontées ; ils ne sont donc pas proposés au formateur pour consultation ou arrêt.
- [x] Faut-il journaliser l’auteur, la date, le motif et le résultat de chaque action ? — **Réponse de l'utilisateur du 2 novembre :** les détections blacklistées et non référencées sont historisées avec le poste, la salle, l'utilisateur, le nom, le PID, la date de démarrage, la date de détection et le classement. Pour un processus blacklisté, les données conservent également la règle déclenchée, la date de l'arrêt automatique et son résultat. Les processus de la whitelist ne possèdent pas de données d'historisation. La durée de conservation reste ouverte.
- [ ] Existe-t-il des contraintes juridiques ou internes concernant la surveillance de l’activité des utilisateurs ?

## 12. Alertes

- [ ] **P0** Quels événements doivent générer une alerte ? — **Réponse partielle de l'utilisateur, complétée le 3 novembre :** garanties proches de leur échéance et garanties arrivées à échéance dans le cadre du bonus, détection d'un processus blacklisté, création d’une remontée pour le gestionnaire et changement de statut d’une remontée pour son auteur formateur. L’administrateur ne reçoit pas d’alerte concernant une remontée (22 octobre, § 2.3). D'éventuels autres événements restent à définir.
- [ ] Quels niveaux de gravité doivent être utilisés ?
- [ ] Qui reçoit chaque type d’alerte ? — **Réponse partielle de l'utilisateur, complétée le 3 novembre :** le gestionnaire reçoit les alertes de garantie et une notification à la création de chaque nouvelle remontée ; le gestionnaire et l’administrateur disposent des indicateurs de garantie correspondants. Une alerte de processus blacklisté est destinée à l'administrateur et au formateur qui supervise la salle concernée. Le formateur reçoit une notification lorsque le statut de l’une de ses propres remontées change. L’administrateur ne reçoit pas d’alerte concernant une remontée (22 octobre, § 2.3). Les destinataires d’éventuels autres types d’alertes restent à définir.
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

- [x] **P0** Qu’est-ce qu’une remontée utilisateur : incident, demande, suggestion, questionnaire ou autre ? — 23 octobre, § 1.3 : déclaration d’un problème sur un périphérique, via un formulaire générant un PDF d’état des lieux.
- [x] Qui peut créer une remontée ? — **Réponse en vigueur de l'utilisateur du 2 novembre :** le formateur et l'administrateur peuvent créer des remontées, puisque l'administrateur peut réaliser toutes les actions. Cette réponse complète les propos du 22 octobre qui réservaient explicitement leur création au formateur. Chaque remontée conserve le lien vers l'utilisateur ASTER qui la déclare.
- [x] L’utilisateur doit-il être authentifié ? — **Réponse de l’utilisateur du 2 novembre, précisée le 6 novembre :** oui. L’authentification est obligatoire et la cible utilise MindefConnect (§ 18).
- [ ] Une remontée anonyme est-elle autorisée ?
- [x] Quelles informations doivent obligatoirement être fournies ? — **Réponse de l'utilisateur du 2 novembre :** le ou les matériels concernés et la description du problème sont obligatoires. La remontée ne possède pas de lien direct avec une salle ; la localisation présentée provient de chaque matériel concerné.
- [x] La salle et le poste doivent-ils être détectés automatiquement ? — **Réponse de l'utilisateur du 2 novembre :** aucun rattachement direct de la remontée à une salle ou à un poste n'est conservé. La localisation affichée est celle du matériel concerné lorsqu'elle est renseignée.
- [ ] Quelles catégories et priorités doivent être proposées ?
- [ ] L’utilisateur peut-il joindre une capture d’écran ou un document ?
- [ ] Quels formats et tailles de pièces jointes sont autorisés ?
- [x] Quels statuts composent le cycle de traitement d’une remontée ? — **Réponse en vigueur de l'utilisateur du 2 novembre :** « en attente », « remplacé » et « corrigé ». Cette réponse complète les statuts « en attente » et « remplacé » recueillis le 22 octobre (§ 2.5). Précision de l’utilisateur du 2 novembre dans le présent échange : le statut porte sur la remontée entière, même lorsqu’elle concerne plusieurs matériels ; aucun statut de traitement par matériel n’est prévu. Précision compatible de l’utilisateur du 27 octobre : le gestionnaire peut faire passer une remontée de « en attente » à « remplacé » ; l’administrateur le peut également puisqu’il dispose de tous les droits. Les autres transitions éventuelles ne sont pas définies.
- [x] Qui est chargé du traitement des signalements ? — Précision de l’utilisateur du 27 octobre : le traitement des tickets relève du travail du gestionnaire. L’administrateur peut également intervenir puisqu’il dispose de tous les droits.
- [ ] Qui reçoit et qualifie une nouvelle remontée ? — **Réponse partielle, complétée par l’utilisateur le 3 novembre :** le gestionnaire reçoit dans ASTER une notification à la création de chaque nouvelle remontée. Le traitement relève du gestionnaire, avec intervention possible de l’administrateur (précision du 27 octobre) ; les modalités de qualification restent à préciser.
- [ ] Comment une remontée est-elle affectée à un intervenant ?
- [x] Le formateur peut-il suivre le traitement de ses signalements ? — Précision de l’utilisateur du 27 octobre : oui, le formateur peut consulter l’avancement des signalements qu’il a créés.
- [ ] Le formateur peut-il compléter un signalement après sa création ?
- [x] Doit-il recevoir des notifications lors des changements de statut ? — **Décision de l’utilisateur du 3 novembre :** le formateur reçoit dans ASTER une notification lorsque le statut d’une remontée qu’il a lui-même créée change. Aucun courriel n’est envoyé.
- [ ] Une remontée peut-elle être transformée en alerte ou liée à une alerte existante ?
- [ ] Comment traiter les doublons concernant le même incident ?
- [ ] Faut-il mesurer les délais de prise en charge et de résolution ?

## 14. Tableaux de bord et statistiques

- [ ] **P0** À quelles décisions les tableaux de bord doivent-ils aider ? — **Réponse partielle, complétée par l'utilisateur le 2 novembre :** plusieurs tableaux de bord spécialisés sont prévus. Le tableau de bord du parc présente notamment l'état des stocks et, dans le cadre du bonus, les expirations de garantie. Un tableau de bord distinct est consacré aux remontées. Les décisions et les indicateurs détaillés restent à préciser.
- [ ] Quels indicateurs sont attendus par les gestionnaires de matériel ? — **Réponse partielle :** état des stocks (22 octobre, § 2.6) et, dans le cadre du bonus de gestion de la garantie, deux indicateurs distincts : garanties proches de l’échéance et garanties arrivées à échéance (précision de l’utilisateur du 24 octobre). Les calculs des indicateurs restent à définir.
- [ ] Quels indicateurs sont attendus par les administrateurs techniques ? — **Réponse partielle, complétée par l’utilisateur le 3 novembre :** l'administrateur accède aux tableaux de bord spécialisés du parc et des remontées et peut consulter des statistiques d’utilisation des postes et des processus. Les indicateurs et leurs règles de calcul restent à définir. Pour le parc, les éléments déjà recueillis sont l'état des stocks et, dans le cadre du bonus, les garanties proches de l'échéance et arrivées à échéance.
- [ ] Quels indicateurs sont attendus par les formateurs ? — Aucun tableau de bord formateur n'est défini à ce stade ; ses éventuels indicateurs restent à préciser.
- [ ] Quels indicateurs sont attendus au niveau central ?
- [ ] Les données doivent-elles être instantanées, quotidiennes, hebdomadaires ou mensuelles ?
- [ ] Quels filtres doivent être disponibles ? — **Réponse partielle :** le tableau de bord du parc propose une vue globale filtrable par salle (22 octobre, § 2.6). Les filtres des autres tableaux de bord spécialisés restent à préciser.
- [ ] Faut-il comparer des périodes, des écoles ou des salles ?
- [ ] Faut-il afficher des tendances et des historiques ?
- [ ] Les utilisateurs peuvent-ils personnaliser leur tableau de bord ?
- [ ] Faut-il permettre d’explorer le détail à partir d’un indicateur ?
- [ ] Les statistiques doivent-elles être exportables ?
- [ ] Sous quels formats les exports sont-ils attendus ?
- [ ] Existe-t-il des règles officielles de calcul des indicateurs ?
- [ ] Qui valide la définition et le calcul de chaque indicateur ?

## 15. Documents d’état des lieux

- [x] **P0** Que doit contenir un document d’état des lieux ? — **Réponse de l'utilisateur du 2 novembre :** le PDF indique notamment le matériel ou son type, le type de problème et une description. La localisation de chaque matériel concerné peut y figurer lorsqu'il est affecté à une salle ; l'école et le bâtiment sont connus par cette salle, et non par une affectation directe du matériel à ces niveaux (décision de l'utilisateur du 2 novembre dans le présent échange).
- [x] À quel moment et dans quel but ce document est-il produit ? — produit lors de la création d’une remontée par le formateur ou l'administrateur, à partir du formulaire de la remontée.
- [x] Le document concerne-t-il une salle, une école, une période ou un ensemble de matériels ? — **Réponse de l'utilisateur du 2 novembre :** le document concerne le ou les matériels de la remontée. Il n'est pas rattaché directement à une salle ; les localisations éventuelles proviennent des matériels concernés.
- [ ] Existe-t-il un modèle officiel à respecter ?
- [x] Quels champs, tableaux et indicateurs doivent y figurer ? — **Réponse de l'utilisateur du 2 novembre :** matériel ou type de matériel, type de problème et description ; aucun tableau ou indicateur supplémentaire n'est mentionné. La localisation de chaque matériel peut figurer lorsqu'elle est renseignée.
- [ ] Le document doit-il inclure des photographies ou des observations ? — **Réponse partielle :** 23 octobre, § 1.3 : une description du problème est prévue ; photographies non précisées.
- [x] Quels formats sont nécessaires : PDF, Word, Excel ou impression papier ? — 23 octobre, § 1.3 : PDF généré à partir du formulaire de problème.
- [ ] Le document doit-il être signé ou validé ?
- [ ] Une numérotation officielle est-elle requise ?
- [ ] Faut-il archiver chaque version générée ?
- [ ] Un document déjà produit doit-il rester identique même si les données changent ensuite ?
- [x] Qui peut générer, consulter et télécharger ces documents ? — **Décision de l’utilisateur du 3 novembre :** le formateur et l’administrateur génèrent les documents en créant une remontée. Le gestionnaire et l’administrateur peuvent consulter et télécharger tous les PDF d’état des lieux. Le formateur peut consulter et télécharger uniquement le PDF d’une remontée qu’il a lui-même créée.

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
- [x] Les utilisateurs doivent-ils pouvoir effectuer eux-mêmes de nouveaux imports ? — **Réponse en vigueur de l'utilisateur du 2 novembre :** le gestionnaire et l'administrateur peuvent importer en JSON de nouveaux matériels, sans connexion directe au CND. La mise à jour par import est immédiate, sans vérification (22 octobre, § 2.7).
- [ ] Faut-il conserver un export Excel pour les échanges ou le mode dégradé ?
- [ ] ~~Comment vérifier et valider le résultat d’une migration ?~~ — Sans objet pour la reprise actuellement documentée : aucune donnée fournie le 23 octobre (§ 1.6). À rouvrir si une migration est demandée.

## 18. Authentification et sécurité

- [x] **P0** Quel système d’authentification doit être utilisé ? — **Décision de l’utilisateur du 6 novembre :** utiliser MindefConnect en production. Cette décision remplace le choix du 3 novembre d’un Keycloak relié à LDAP dans tous les environnements ; elle ne précise pas l’architecture interne de MindefConnect. Le montage de substitution et les comptes utilisés pour le démonstrateur sont documentés uniquement dans le [guide interne de développement](../application/README.md), sans valeur d’exigence de production.
- [ ] Quelles modalités d’intégration sont fournies par MindefConnect pour la production ? — **Décision du 6 novembre :** le service cible est fixé ; les accès, le contrat d’intégration, les attributs d’identité et de profil et les contraintes de déploiement restent à obtenir.
- [ ] L’authentification multifacteur est-elle requise ?
- [ ] Quelles règles de mot de passe s’appliquent en production si des comptes locaux sont nécessaires ?
- [ ] Le MCD doit-il représenter un secret d'authentification ou une empreinte de mot de passe plutôt que le mot de passe lui-même ?
- [ ] Comment les comptes quittant l’organisation sont-ils désactivés ?
- [ ] Comment les droits sont-ils attribués et revus ?
- [ ] Faut-il limiter l’accès selon le réseau, le site ou le type de terminal ?
- [ ] Quelles données sont considérées comme sensibles ?
- [ ] Existe-t-il une classification de sécurité à respecter ?
- [ ] Quelles données personnelles seront enregistrées ? — **Réponse partielle :** 23 octobre, § 1.2, complété par l'utilisateur le 2 novembre : le nom du compte Windows utilisé sur le poste est représenté par `COMPTE_WINDOWS.nom_utilisateur` pour identifier l'utilisateur associé aux programmes exécutés. Les autres données personnelles restent à préciser.
- [ ] Quelles durées de conservation s’appliquent aux données et aux journaux ?
- [ ] Quelles actions doivent être tracées dans un journal d’audit ? — **Réponse partielle :** 22 octobre, § 2.8 : journaux en bonus et proposition libre ; actions à tracer non définies.
- [ ] Qui peut consulter les journaux d’audit ?
- [ ] Les journaux doivent-ils être protégés contre la modification ?
- [ ] Comment ASTER s'authentifie-t-il auprès des services Windows d'administration à distance ? — **Réponse partielle de l'utilisateur du 3 novembre :** aucun agent ASTER ne peut être installé ; l'application web doit utiliser les mécanismes Windows existants. Le compte technique, le protocole d'authentification et la gestion des secrets restent à définir.
- [ ] Comment les secrets, certificats et clés techniques sont-ils distribués et renouvelés ?

## 19. Architecture, réseau et intégrations

- [ ] **P0** Où l’application doit-elle être hébergée ?
- [x] Quels composants applicatifs distinguer dans l'architecture cible ? — **Décision de l'utilisateur du 3 novembre lors de la revue de la présentation :** distinguer un serveur front et un serveur back. Le front porte l'interface web ; le back porte les fonctions métier, les droits et les accès aux données et services. **Précision du 6 novembre :** PostgreSQL et préférence pour JavaScript ; l’initialisation utilise React/Vite et Express comme choix d’implémentation. Les modalités d’hébergement restent à préciser.
- [x] Où sont stockés les PDF d'état des lieux ? — **Décision de l'utilisateur du 3 novembre lors de la revue de l'architecture cible :** utiliser un stockage S3. La solution, son hébergement et sa configuration restent à préciser.
- [x] L’environnement cible dispose-t-il d’un accès à Internet ? — **Réponse de l'utilisateur du 3 novembre :** ASTER sera utilisé sur un réseau interne NP disposant d'un accès à Internet.
- [ ] Quels flux réseau entrants et sortants sont autorisés ?
- [ ] Les écoles sont-elles reliées au même réseau ?
- [ ] Existe-t-il des réseaux ou zones de sécurité séparés ?
- [ ] Quels services Windows peuvent être utilisés par ASTER et selon quels flux ? — **Réponse partielle de l'utilisateur du 3 novembre :** aucun agent ASTER ne peut être installé sur les postes ; les fonctions distantes doivent utiliser les mécanismes d'administration à distance fournis par Windows.
- [ ] Un fonctionnement partiel hors connexion est-il nécessaire ?
- [ ] **P0** Quels mécanismes d'administration Windows peuvent être utilisés par ASTER ? — **Réponse partielle de l'utilisateur du 3 novembre :** l'application web doit permettre de consulter et d'arrêter les processus à distance au moyen des mécanismes fournis par Windows. Les services autorisés, leur configuration et les mécanismes utilisables pour l'installation d'applications et la masterisation restent à confirmer avec le client.
- [ ] Quelles API, documentations et plateformes de test sont disponibles ?
- [ ] Quelles technologies sont imposées, recommandées ou interdites ? — **Réponse partielle, complétée par l’utilisateur du 6 novembre :** cible Windows et navigateur Firefox ; base PostgreSQL, préférence pour JavaScript et icônes Lucide si nécessaire. Connexion via MindefConnect (§ 18) et stockage S3 pour les PDF d’état des lieux. Les autres contraintes techniques restent à préciser.
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

- [ ] Qui surveillera le bon fonctionnement du serveur ASTER et de ses échanges avec les services Windows d'administration à distance ?
- [ ] À quelle fréquence les sauvegardes doivent-elles être réalisées ?
- [ ] Où les sauvegardes doivent-elles être stockées ?
- [ ] À quelle fréquence une restauration doit-elle être testée ?
- [ ] Comment les mises à jour de l’application seront-elles déployées ?
- [ ] ~~Comment les mises à jour des agents ASTER seront-elles déployées ?~~ — Sans objet depuis la décision du 3 novembre interdisant l'installation d'un agent ASTER.
- [ ] Une procédure de retour à la version précédente est-elle nécessaire ?
- [ ] Quels journaux techniques doivent être collectés ? — **Réponse partielle :** 22 octobre, § 2.8 : journaux en bonus, proposition libre de l’équipe ; contenu technique non précisé.
- [ ] Qui reçoit les alertes concernant le fonctionnement d’ASTER lui-même ?
- [ ] Quels outils de supervision technique sont déjà disponibles ?
- [ ] Quel niveau de documentation technique et d’exploitation est attendu ? — **Réponse partielle :** 23 octobre, § 1.6 : dossier d’architecture technique demandé ; niveau attendu pour les procédures d’exploitation non précisé.
