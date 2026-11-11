# Questions de cadrage du projet ASTER

**Document de travail interne, non destiné à la remise aux cadres évaluateurs.** Il conserve les réponses et leurs périmètres pour préparer les productions. Les documents remis décrivent la cible en production ; les modalités de réalisation et les comptes du démonstrateur sont réservés au [guide interne de développement](../application/README.md). Cette distinction a été fixée par l’utilisateur le 6 novembre.

Ce document présente les questions de cadrage et les réponses en vigueur, issues des [entretiens des 22 et 23 octobre et du 4 novembre](03-COMPTE-RENDU-ENTRETIENS.md), de l’application en cours de développement et des orientations apportées ensuite directement par l’utilisateur. Les réponses datées du 2 novembre ont été fournies par l’utilisateur dans les échanges de cadrage et ne font pas partie des comptes rendus d’entretien. Sur un même sujet, la décision du client prévaut ; à niveau de source égal, la réponse la plus récente remplace les précédentes, tandis que les précisions compatibles restent applicables. Les comptes rendus conservent uniquement la trace historique des entretiens. Les questions marquées **P0** conditionnent directement la faisabilité ou l’estimation des développements.

**Dernière consolidation :** le compte rendu du 4 novembre est répercuté dans les sections concernées. Les propositions techniques demandées lors de cet entretien, notamment la solution d’administration à distance, restent ouvertes tant qu’elles n’ont pas été validées par le client.

Le [MCD Merise](05-MCD-MERISE.svg) est le modèle conceptuel de référence des données conservées par ASTER. Le 9 novembre, l’utilisateur a fixé les sources qui font foi : les décisions du client prises en rendez-vous et l’application en cours de développement ; ses propres réponses restent des orientations révisables lorsqu’elles contredisent l’une ou l’autre. Aucune validation documentaire par le client n’est prévue. Les écarts entre les demandes du client et l’application sont regroupés au § 23 pour le prochain rendez-vous.

**Légende :**

- `[x]` : une réponse a été recueillie, y compris lorsqu’elle est négative ; cela ne vaut pas validation globale du besoin.
- `[ ]` : question ouverte. Une mention **Réponse partielle** précise les éléments déjà recueillis et ce qui reste effectivement à définir. Une ancienne réponse remplacée ne constitue pas une question ouverte.
- Question barrée : sans objet dans le périmètre indiqué par la note ; à rouvrir si ce périmètre évolue.

Les dates et numéros de section des annotations renvoient au compte rendu des entretiens. La simulation des processus ne dispense pas de définir leur comportement fonctionnel ; seules les questions de déploiement réel explicitement concernées sont barrées pour la démonstration. L’absence de fichiers de reprise ne supprime pas le besoin éventuel d’importer de nouveaux matériels.

## 1. Vision et objectifs

- [x] **P0** Quel problème doit être résolu en priorité par ASTER ? — 22 octobre, § 2.1 : gestion des périphériques en priorité, puis supervision des processus.
- [ ] **P0** Quel résultat concret permettra de considérer le projet comme réussi ? — **Réponse partielle, complétée par l'utilisateur le 3 novembre :** la gestion des matériels constitue le premier critère de réussite. Les actions ou scénarios précis permettant de vérifier ce critère restent à définir. Le 22 octobre (§ 2.1), le client demandait de faciliter la mise à jour, la recherche, la consultation et la visualisation.
- [x] **P0** Quel est le périmètre attendu pour la première version utilisable ? — Précision de l’utilisateur du 24 octobre : gestion complète des matériels, avec une démonstration pour une école, deux bâtiments et six à huit salles par bâtiment ; gestion des processus simulée. Le 4 novembre (§ 3.2), le client a rappelé de prévoir une salle de 40 postes dans la simulation. La gestion de plusieurs écoles est prévue à terme, hors des attendus de la V1. ASTER ne gère pas les formations (précision de l’utilisateur du 24 octobre).
- [ ] Quels défauts du fonctionnement actuel sous Excel faut-il corriger en priorité ?
- [x] Quelles fonctionnalités peuvent être simulées, maquettées ou reportées ? — 22 octobre, § 2.1 et 2.8 : gestion des processus simulée et journaux en bonus. 4 novembre, § 3.3 : connexion MindefConnect simulée dans le démonstrateur. 23 octobre, § 1.1 : gestion de la garantie en bonus.
- [ ] Qui valide le besoin, les priorités et le résultat final ?

## 2. Périmètre organisationnel

- [x] **P0** ASTER doit-il couvrir une seule école ou plusieurs établissements ? — Précision de l’utilisateur du 24 octobre : ASTER doit pouvoir gérer plusieurs écoles à terme, mais cette capacité ne fait pas partie des attendus de la V1. La démonstration de la V1 porte sur une seule école.
- [ ] Une administration centrale doit-elle avoir une vue sur l’ensemble des écoles ?
- [x] Quelles entités doivent être représentées : organisme, école, site, bâtiment, étage, salle ou autre ? — **Décision de l'utilisateur du 2 novembre, précisée dans le présent échange :** l'école et la salle sont des entités ; la salle est rattachée à une école et porte l'information de son bâtiment. Aucune entité `BATIMENT` autonome n'est nécessaire. L'école et la salle possèdent chacune un nom. Aucun niveau « étage » distinct n'est nécessaire : le code de la salle contient souvent le numéro de l'étage. **Arbitrage du 9 novembre, d’après l’application :** l’école, le bâtiment, l’étage et la salle sont représentés ; ce choix remplace la décision du 2 novembre (§ 5).
- [ ] Une salle peut-elle dépendre de plusieurs services ? Le rattachement à des formations relève de la piste d’évolution décrite au § 3 (4 novembre, § 3.2).
- [x] Faut-il gérer des salles temporaires, fermées ou indisponibles ? — 22 octobre, § 2.2 : pas de gestion des salles temporaires ou hors service.
- [ ] Combien d’écoles, de salles, de postes et d’autres matériels sont concernés aujourd’hui ? — **Réponse partielle :** précision de l’utilisateur du 24 octobre : démonstration pour une école, deux bâtiments et six à huit salles par bâtiment. La possibilité d’ajout est prévue (22 octobre, § 2.1). Le scénario de simulation comporte une salle de 40 postes (4 novembre, § 3.2). Les volumes réels ne sont pas précisés.

## 3. Utilisateurs, rôles et responsabilités

- [x] **P0** Quelles catégories d’utilisateurs utiliseront réellement l’application ? — **Décision de l’utilisateur du 3 novembre, remplaçant la liste du 24 octobre :** quatre profils existent dans ASTER : administrateur, gestionnaire, formateur et super administrateur. Aucun compte stagiaire n’est prévu.
- [x] À quelle organisation un utilisateur est-il rattaché ? — **Décision de l’utilisateur du 3 novembre :** l’administrateur, le gestionnaire et le formateur sont chacun rattachés à une école. Le super administrateur n’est rattaché à aucune école.
- [x] Le rattachement à une école limite-t-il les droits et les données accessibles ? — **Décision de l’utilisateur du 3 novembre :** l’administrateur, le gestionnaire et le formateur accèdent uniquement aux données de leur école de rattachement. Le super administrateur accède aux données de toutes les écoles.
- [x] Que recouvre précisément le terme « acteurs de la formation » ? — Précision de l’utilisateur du 24 octobre, complétée le 3 novembre : expression générale issue du sujet, sans rôle supplémentaire dans ASTER. Les profils sont administrateur, gestionnaire, formateur et super administrateur. ASTER ne gère pas les formations.
- [x] Quelles actions un gestionnaire de matériel peut-il consulter, créer, modifier ou supprimer ? — 22 octobre, § 2.2 et 2.3, complété par l’utilisateur le 3 novembre : gestion de l’ensemble des stocks de son école, affectation, création, consultation et modification des matériels ; pas de suppression.
- [x] Quelles actions un administrateur de salle technique peut-il réaliser ? — 23 octobre, § 1.2, complété par l’utilisateur le 3 novembre : l’administrateur dispose de tous les droits dans son école de rattachement. Le super administrateur dispose des mêmes droits sur l’ensemble des écoles.
- [x] Quelles actions un formateur peut-il réaliser sur les postes de sa salle ? — 23 octobre, § 1.2 et 1.3 : accéder à une salle, consulter et arrêter les processus utilisateur (IDE, navigateur, etc.), sans arrêter les processus système, et créer une remontée pour un problème.
- [x] Les droits d’un formateur sont-ils limités à certaines salles ? — Précision de l’utilisateur du 27 octobre, complétée le 3 novembre : le formateur peut accéder à toutes les salles de son école de rattachement, car il peut intervenir dans plusieurs salles. Ses actions restent limitées aux droits de son profil. Le 4 novembre (§ 3.2), le client a rappelé que les formations ne restreignent pas l’accès aux salles dans le périmètre actuel. Pour les présentations, mentionner comme évolution possible un accès aux salles selon les formations qui s’y déroulent.
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
- [x] **P0** Comment représenter l'état « hors service » dans le MCD tout en excluant les attributs booléens : par une entité d'état, une association ou une autre valeur persistante ? — **Arbitrage délégué par l’utilisateur le 9 novembre :** une date de mise hors service, vide lorsque le matériel est en service. Le même principe représente la désactivation d’un compte ASTER par une date de désactivation.
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
- [x] Faut-il représenter le site, le bâtiment, l’étage, la salle, le bureau, la baie ou le port réseau ? — **Décision de l'utilisateur du 2 novembre, précisée dans le présent échange :** la salle est rattachée à une école et renseigne son bâtiment, sans entité `BATIMENT` distincte. La localisation d'un matériel provient de la salle à laquelle il est affecté ; il n'est pas affecté directement à une école ou à un bâtiment. Aucun niveau « étage » distinct n'est prévu ; le code de la salle contient souvent le numéro de l'étage. **Arbitrage du 9 novembre, d’après l’application :** une école comprend des bâtiments, un bâtiment comprend des étages, dont certains peuvent ne contenir aucune salle, et une salle est située à un étage. Le bâtiment et l’étage sont identifiés, ce qui permet de repérer les salles par bâtiment comme le demande le client (4 novembre, § 3.2). Cette réponse remplace la décision du 2 novembre.
- [x] Un matériel peut-il être affecté à une personne plutôt qu’à une salle ? — **Réponse en vigueur, précisée par l'utilisateur le 2 novembre dans le présent échange :** non. Un matériel est affecté à une salle, jamais à une personne ; il peut également être en stock sans localisation.
- [x] Un matériel peut-il appartenir à un stock sans localisation précise ? — 22 octobre, § 2.4 : un matériel peut être en stock sans localisation. **Arbitrage délégué par l’utilisateur le 9 novembre :** un matériel, même en stock, reste rattaché à une école ; lorsqu’il est affecté, sa salle appartient à cette école (RG-72).
- [x] Un matériel cité par une remontée peut-il être supprimé ? — **Arbitrage délégué par l’utilisateur le 9 novembre :** non ; sa fiche est conservée pour que la remontée reste consultable avec ses matériels (RG-73).
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
- [ ] Si elle est détectée, quel mécanisme ou outil existant fournit ces informations ? — Le mécanisme de collecte, le format et le protocole restent à définir dans le cadre de l’étude du § 19.
- [ ] Qu’est-ce qui distingue une application métier d’une autre application ? — **Réponse partielle :** 23 octobre, § 1.1 : application « de base » présente sur un poste ; le caractère natif et la distinction exacte restent à préciser.
- [ ] Existe-t-il un référentiel officiel des applications métier ?
- [x] Faut-il relever le nom, la version, l’éditeur, la date d’installation et la licence ? — **Arbitrage délégué par l’utilisateur le 9 novembre :** le nom, la version et l’éditeur de l’application sont relevés ; la date d’installation et la licence ne le sont pas.
- [ ] Faut-il distinguer les applications obligatoires, autorisées, tolérées et interdites ?
- [x] Les règles dépendent-elles de l’école, de la salle, du poste ou de la formation en cours ? — **Réponse en vigueur de l'utilisateur du 2 novembre :** les règles de processus peuvent être globales ou concerner une école, un bâtiment ou une salle. La portée bâtiment désigne les salles dont l'information de bâtiment correspond ; elle ne suppose pas une entité `BATIMENT` autonome (décision de l'utilisateur du 2 novembre dans le présent échange). Les règles ne sont portées ni par un poste ni par une formation.
- [ ] Faut-il détecter les versions absentes, obsolètes ou non conformes ?
- [ ] Faut-il conserver l’historique des logiciels installés ?
- [ ] Qui peut modifier le référentiel des applications ?
- [x] ASTER doit-il installer ou désinstaller une application, ou seulement signaler sa présence ? — **Décision de l’utilisateur du 3 novembre :** l’administrateur peut déclencher à distance l’installation et la désinstallation d’une application depuis ASTER, pour un poste individuel ou l’ensemble des postes d’une salle. Le mécanisme reste à déterminer (§ 19).

## 9. Réinstallation des postes et des salles

- [x] **P0** Que signifie précisément « réinstaller » ou « replaquer » un poste ? — 23 octobre, § 1.5 : la masterisation consiste à réappliquer une image sur un poste, par l’administrateur.
- [x] **P0** ASTER doit-il exécuter la réinstallation, la déclencher dans un outil tiers ou seulement créer une demande ? — **Réponse de l’utilisateur du 3 novembre :** l’administrateur déclenche depuis ASTER la réapplication d’une image Windows au moyen d’un mécanisme de déploiement externe. L’infrastructure et l’interface de déclenchement restent à identifier.
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
- [x] Quelles données doivent remonter depuis chaque poste ? — **Orientation du 2 novembre, remplacée pour la persistance par le modèle du 9 novembre :** les processus internes sont exclus. `PROCESSUS`, `POSTE` et `COMPTE_WINDOWS` sont des entités distinctes. L’ancienne association ternaire `exécuter`, qui portait les dates d’exécution, n’est plus conservée : le MCD enregistre uniquement la détection d’un processus non référencé ou blacklisté (`DÉTECTION`) ; l’exécution en temps réel relève du traitement.
- [x] **P0** Quels identifiants et attributs persistants définissent `POSTE` et `COMPTE_WINDOWS` ? — **Réponse vérifiée dans la source du MCD et complétée par l’utilisateur le 2 novembre :** `POSTE` porte `Id_poste`, `nom_réseau`, `adresse_ip` et `adresse_mac`. `COMPTE_WINDOWS` porte l'identifiant interne `Id_compte` et le champ `nom_utilisateur`, qui correspond au nom du compte Windows utilisé sur le poste.
- [x] Un même nom de compte Windows utilisé sur plusieurs postes représente-t-il une seule entité ? — **Réponse de l'utilisateur du 2 novembre :** oui, il s'agit d'une seule et même entité `COMPTE_WINDOWS`. Elle ne représente pas une connexion particulière à un poste.
- [x] Faut-il renommer `SESSION` pour refléter cette signification ? — **Orientation de l'utilisateur du 2 novembre, répercutée dans le MCD :** l'entité est nommée `COMPTE_WINDOWS`, car elle représente un compte Windows commun à plusieurs postes et non une connexion particulière.
- [x] **P0** Un même processus peut-il être exécuté plusieurs fois par le même utilisateur de session sur le même poste ? Si oui, faut-il transformer `exécuter` en entité d'exécution identifiée afin de distinguer ces occurrences ? — **Arbitrage du 9 novembre, d’après l’application :** oui, un programme peut être relancé. L’exécution observée en temps réel relève du traitement et n’est pas conservée : le MCD ne garde que la détection d’un processus non référencé ou blacklisté (`DÉTECTION`).
- [x] Faut-il connaître l’état en ligne ou hors ligne des machines ? — **Réponse de l'utilisateur du 2 novembre :** oui. Après trois remontées manquées, soit environ quinze secondes, le poste est considéré comme déconnecté ; il reste affiché dans sa salle sans processus. **Arbitrage du 9 novembre, d’après l’application :** un poste sans remontée depuis trente secondes est considéré comme déconnecté (RG-58).
- [ ] Faut-il remonter les performances telles que CPU, mémoire, disque et réseau ?
- [ ] Faut-il remonter l’état des services, applications ou périphériques ?
- [x] Quelle fréquence de collecte est nécessaire ? — **Réponse de l'utilisateur du 2 novembre :** toutes les cinq secondes. Un léger décalage entre les postes et un recul progressif en cas d'erreur sont recommandés pour éviter des pics de charge simultanés.
- [x] Quelle ancienneté maximale d’une donnée est acceptable à l’écran ? — **Réponse de l'utilisateur du 2 novembre :** cinq secondes pour un poste connecté ; après environ quinze secondes sans remontée, le poste passe à l'état déconnecté et ses processus ne sont plus affichés. **Arbitrage du 9 novembre, d’après l’application :** un poste sans remontée depuis trente secondes est considéré comme déconnecté (RG-58).
- [x] Faut-il conserver un historique des mesures ? — **Réponse de l'utilisateur du 2 novembre :** oui pour les détections de processus blacklistés et non référencés. Les exécutions des processus de la whitelist ne sont pas historisées.
- [ ] Pendant combien de temps cet historique doit-il être conservé ? — **Réponse partielle de l'utilisateur du 2 novembre :** l'historique des processus blacklistés et non référencés doit être conservé ; sa durée de conservation reste à confirmer.
- [x] **P0** Parmi les données exigées par RG-56, lesquelles doivent rester persistantes dans le MCD malgré l'exclusion des valeurs temporaires et calculées ? — **Arbitrage du 9 novembre, d’après l’application :** une détection conserve le poste, et par lui la salle, le compte Windows, le processus, la date de détection et le classement. L’arrêt automatique est relié à la détection par l’intervention qu’elle provoque, qui porte sa date et son résultat. Le PID, la date de démarrage et la règle déclenchée ne sont pas conservés (RG-56).
- [ ] Un agent doit-il être installé sur les postes ? — **Étude demandée le 4 novembre (§ 3.3) :** préparer une proposition avec un agent et examiner les solutions existantes (§ 19). La décision du 3 novembre écartait l’agent. Le choix de la solution et l’autorisation de déployer un agent restent à confirmer.
- [ ] Si un agent est retenu, qui le déploie, le configure et le met à jour ? — À préciser dans la proposition.
- [ ] Comment ASTER échange-t-il avec les postes ? — ASTER porte les fonctions de supervision. Le sens des connexions, les services activés et les protocoles restent à définir selon la solution d’administration retenue (§ 19).
- [x] Comment gérer un poste temporairement déconnecté ? — **Réponse de l'utilisateur du 2 novembre :** il reste visible dans sa salle, sans liste de processus.
- [ ] La supervision doit-elle fonctionner sur plusieurs segments réseau isolés ?

## 11. Processus autorisés, interdits et arrêtés

- [x] **P0** Quels processus doivent être surveillés et pour quelle raison métier ? — **Réponse de l'utilisateur du 2 novembre :** surveiller les processus utilisateur afin de distinguer les processus reconnus, interdits et non référencés, vérifier l'utilisation des logiciels attendus et arrêter automatiquement les applications interdites. Les processus internes ne font pas partie des remontées.
- [x] Comment un processus métier est-il identifié de manière fiable ? — **Orientation du 2 novembre, précisée d’après l’application le 9 novembre :** `PROCESSUS` désigne un programme identifiable, et non une exécution particulière. Un programme est reconnu par son nom. L’ancienne association `exécuter` a été remplacée dans le MCD par `DÉTECTION` : le PID, temporaire et réutilisable, et les exécutions en temps réel ne sont pas conservés ; seules les détections sont historisées (§ 10).
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

- [ ] Quelles informations les utilisateurs rechercheront-ils le plus souvent ? — **Réponse partielle :** 22 octobre, § 2.1 : recherche, consultation et visualisation du matériel. Le 4 novembre (§ 3.2), le client a précisé le parcours attendu : repérer rapidement les salles par bâtiment, puis consulter le matériel présent dans une salle. Un plan de salle n’est pas nécessaire.
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

- [x] **P0** Quel système d’authentification doit être utilisé ? — **Décision de l’utilisateur du 6 novembre :** utiliser MindefConnect en production. Cette décision remplace le choix du 3 novembre d’un Keycloak relié à LDAP dans tous les environnements ; elle ne précise pas l’architecture interne de MindefConnect. La simulation de MindefConnect demandée le 4 novembre (§ 3.3) concerne le démonstrateur. Le montage de substitution et les comptes utilisés pour le démonstrateur sont documentés uniquement dans le [guide interne de développement](../application/README.md), sans valeur d’exigence de production.
- [ ] Quelles modalités d’intégration sont fournies par MindefConnect pour la production ? — **Décision du 6 novembre :** le service cible est fixé ; les accès, le contrat d’intégration, les attributs d’identité et de profil et les contraintes de déploiement restent à obtenir.
- [ ] L’authentification multifacteur est-elle requise ?
- [ ] Quelles règles de mot de passe s’appliquent en production si des comptes locaux sont nécessaires ?
- [x] Le MCD doit-il représenter un secret d'authentification ou une empreinte de mot de passe plutôt que le mot de passe lui-même ? — **Arbitrage délégué par l’utilisateur le 9 novembre :** aucun secret d’authentification n’est représenté, l’authentification étant confiée à MindefConnect ; le compte ASTER conserve l’identifiant transmis par ce service.
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
- [ ] Comment ASTER s’authentifie-t-il auprès de la solution d’administration à distance ? — Le compte technique, le protocole d’authentification et la gestion des secrets restent à définir.
- [ ] Comment les secrets, certificats et clés techniques sont-ils distribués et renouvelés ? — **Proposition pour le démonstrateur du 11 novembre :** secrets natifs Swarm pour les conteneurs, certificats des hôtes déposés par SSH depuis le poste de l’opérateur, rotation opérateur. Le choix pour la production reste ouvert. **Demande de l’utilisateur :** représenter l’administration SSH de toutes les VM ; accès proposé depuis le réseau d’administration vers leurs IP privées sur TCP 22. Voir le [dossier technique](17-DOSSIER-ARCHITECTURE-TECHNIQUE.md#45-architecture-réelle-sur-vm).

## 19. Architecture, réseau et intégrations

- [ ] **P0** Où l’application doit-elle être hébergée ?
- [x] Quels composants applicatifs distinguer dans l'architecture cible ? — **Décision de l'utilisateur du 3 novembre lors de la revue de la présentation :** distinguer un serveur front et un serveur back. Le front porte l'interface web ; le back porte les fonctions métier, les droits et les accès aux données et services. **Précision du 6 novembre :** PostgreSQL et préférence pour JavaScript ; l’initialisation utilise React/Vite et Express comme choix d’implémentation. Les modalités d’hébergement restent à préciser.
- [x] Où sont stockés les PDF d'état des lieux ? — **Décision de l'utilisateur du 3 novembre lors de la revue de l'architecture cible :** utiliser un stockage S3. La solution, son hébergement et sa configuration restent à préciser.
- [x] L’environnement cible dispose-t-il d’un accès à Internet ? — **Réponse de l'utilisateur du 3 novembre :** ASTER sera utilisé sur un réseau interne NP disposant d'un accès à Internet.
- [ ] Quels flux réseau entrants et sortants sont autorisés ? — **Précision de l’utilisateur du 11 novembre :** le réseau du démonstrateur sur VM ne dispose pas de DNS pour joindre les services depuis l’extérieur ; la résolution de noms interne de Docker reste utilisable. Les adresses IP et les ports proposés figurent dans le [dossier technique](17-DOSSIER-ARCHITECTURE-TECHNIQUE.md#45-architecture-réelle-sur-vm). Seule l’IP de la VM 01 est publiée, avec un port par service ; le filtrage reste à qualifier.
- [ ] Les écoles sont-elles reliées au même réseau ?
- [ ] Existe-t-il des réseaux ou zones de sécurité séparés ?
- [ ] Quels services et flux réseau la solution d’administration à distance nécessite-t-elle ? — À préciser après identification des options utilisables.
- [ ] Un fonctionnement partiel hors connexion est-il nécessaire ?
- [ ] **P0** Quelle solution d’administration des postes Windows peut être utilisée par ASTER ? — **Étude demandée le 4 novembre (§ 3.3) :** vérifier si un système existe déjà dans l’environnement cible, préparer une proposition avec un agent et examiner les logiciels existants. Indiquer le coût des solutions payantes proposées. Comparer la couverture des besoins de supervision et d’administration, dont la consultation et l’arrêt de processus, l’installation d’applications et la réinstallation des postes. Les outils disponibles et autorisés, leur couverture et le choix de la solution restent à confirmer.
- [ ] Quelles API, documentations et plateformes de test sont disponibles ?
- [ ] Quelles technologies sont imposées, recommandées ou interdites ? — **Réponse partielle, complétée par l’utilisateur du 6 novembre :** cible Windows et navigateur Firefox ; base PostgreSQL, préférence pour JavaScript et icônes Lucide si nécessaire. Connexion via MindefConnect (§ 18) et stockage S3 pour les PDF d’état des lieux. Le 4 novembre (§ 3.3), le client a demandé de vérifier les technologies et les langages utilisés au regard du cadre de cohérence technique. Le 11 novembre, l’utilisateur précise que le CCT prescrit HAProxy pour le reverse proxy ou la répartition de charge et Apache pour le serveur HTTP, avec justification en cas de choix de NGINX. Le même jour, l’utilisateur transmet le CCT 2026-2027 (version 3.7, édition 1 du 17 février 2026). **Orientation de l’utilisateur du 11 novembre :** l’architecture réelle n’utilise que des produits présents dans la colonne C1NP de son annexe « pile logicielle », hormis Docker et les substituts des services du réseau cible, comme Keycloak et OpenLDAP pour MindefConnect. Le [déploiement sur VM](17-DOSSIER-ARCHITECTURE-TECHNIQUE.md#45-architecture-réelle-sur-vm) retient donc HAProxy, Apache 2.4, PostgreSQL 17, Node.js 22, Express, React 19, chrony et Logstash ; Patroni, etcd et Rsyslog, absents du CCT, ne sont pas utilisés. **Précision de l’utilisateur du 11 novembre :** les VM fournies pour le démonstrateur sont sous Debian 13, avec Docker déjà installé ; le système n’est pas changé et aucun outil d’automatisation comme Ansible n’est ajouté. Ces VM préconfigurées n’existeront pas sur le C1NP : leur système est une exception, comme Docker. **Précision du même jour :** aucune sauvegarde n’est prévue pour la démonstration et aucun serveur de temps n’est disponible ; la VM 01 sert d’horloge de référence aux autres VM. **Précision du même jour :** pas de VM d’administration ; l’opérateur administre depuis son poste.
- [x] Comment séparer les persistances du démonstrateur sur VM ? **Orientation de l’utilisateur du 11 novembre.** PostgreSQL ASTER est réservé à Express pour les données métier et les sessions ASTER. La VM 06 conserve les identités dans OpenLDAP, à côté de Keycloak. Keycloak réimporte son realm à sa réinstallation et la perte de ses sessions est acceptée. Voir le [dossier technique](17-DOSSIER-ARCHITECTURE-TECHNIQUE.md#45-architecture-réelle-sur-vm).
- [x] Comment le démonstrateur sur VM réagit-il à une panne ? **Orientation de l’utilisateur du 11 novembre, qui remplace la reprise manuelle retenue le 10 novembre.** Aucune action manuelle n’est prévue : lorsqu’une VM ou un conteneur tombe et qu’un secours existe, celui-ci prend le relais automatiquement. Les serveurs web ne servent pas de reverse proxy : HAProxy assure ce rôle, séparément. Le puits de journaux peut se passer de conteneur ; les journaux sont accessibles directement sur le système de fichiers de la VM, pas dans un volume. **Orientation de l’utilisateur du 11 novembre, qui remplace les bascules proposées le même jour :** une architecture simple, compréhensible par un néophyte, sans haute disponibilité, mais avec un rôle par VM ; Keycloak et OpenLDAP, qui simulent ensemble MindefConnect, partagent une VM, et aucune copie hors site n’est prévue pour cette démonstration. **Précision du même jour :** Swarm peut relancer sur une autre VM les services sans données (Apache, Express et l’émulateur), sans les dupliquer. **Décision de l’utilisateur du même jour :** le back est refondu pour ne plus garder d’état en mémoire ; Apache et Express ont alors deux instances actives chacun, l’émulateur une seule. Chaque service a une seule instance, relancée automatiquement par Docker Swarm ou systemd ; la perte durable d’une VM rend son service indisponible jusqu’à son retour. Voir les [pannes et reprises](17-DOSSIER-ARCHITECTURE-TECHNIQUE.md#46-pannes-et-reprises).
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

- [ ] Qui surveillera le bon fonctionnement du serveur ASTER et de ses échanges avec la solution d’administration des postes ?
- [ ] À quelle fréquence les sauvegardes doivent-elles être réalisées ?
- [ ] Où les sauvegardes doivent-elles être stockées ?
- [ ] À quelle fréquence une restauration doit-elle être testée ?
- [ ] Comment les mises à jour de l’application seront-elles déployées ?
- [ ] Comment déployer les mises à jour d’un agent s’il est retenu ? — À préciser dans la proposition (§ 19).
- [ ] Une procédure de retour à la version précédente est-elle nécessaire ?
- [ ] Quels journaux techniques doivent être collectés ? — **Réponse partielle :** 22 octobre, § 2.8 : journaux en bonus, proposition libre de l’équipe ; contenu technique non précisé.
- [ ] Qui reçoit les alertes concernant le fonctionnement d’ASTER lui-même ?
- [ ] Quels outils de supervision technique sont déjà disponibles ?
- [ ] Quel niveau de documentation technique et d’exploitation est attendu ? — **Réponse partielle :** 23 octobre, § 1.6 : dossier d’architecture technique demandé ; niveau attendu pour les procédures d’exploitation non précisé.

## 22. Présentations client et nom du projet

- [x] Quel format adopter ? — 4 novembre, § 3.1 : montrer les usages et leurs bénéfices, présenter la maquette directement, même si elle se limite à l’interface, et garder les diagrammes, les détails techniques et les captures d’écran hors du support client. Chaque membre de l’équipe prend la parole, avec un temps de parole libre.
- [ ] Quel nom retenir ? — **Retour du 4 novembre (§ 3.1) :** ASTER plaît au client. Préparer un second nom et soumettre les deux propositions à son choix.
- [x] Quand aura lieu le prochain rendez-vous ? — Jeudi 12 novembre 2026 (4 novembre, § 3.4), à 10 h 45 (précision de l’utilisateur du 11 novembre).

## 23. Points à soumettre au client le 12 novembre

Ces points opposent une demande du client à l’application ou à une orientation de l’équipe. En attendant la réponse du client, les productions décrivant la cible suivent sa décision ; l’écart de l’application reste explicite pour préparer le rendez-vous.

- [ ] Qui peut créer une remontée ? — **Client :** « seul le formateur peut créer des remontées », alors que « l’administrateur peut réaliser toutes les actions » (22 octobre, § 2.3). **Application :** le formateur, l’administrateur et le super administrateur.
- [ ] Le statut « corrigé » est-il retenu ? — **Client :** statuts « en attente » et « remplacé » (22 octobre, § 2.5). **Application :** « corrigé » est ajouté et réservé aux administrateurs.
- [ ] Faut-il les statuts « en cours » et « validée », la validation qui clôt la remontée étant réservée à son auteur ? — **Client :** statuts « en attente » et « remplacé » (22 octobre, § 2.5). **Orientation de l’utilisateur du 11 novembre :** suivre l’avancement du travail du gestionnaire dans un backlog et faire clore la remontée par l’initiateur de la demande ; les règles de gestion ne traitent pas encore ce point. **Application :** « en attente » → « en cours » → « remplacé » ou « corrigé » → « validée » par l’auteur ; backlog pour le gestionnaire.
- [ ] Quel est l’identifiant d’un matériel ? — **Client :** le numéro de série (22 octobre, § 2.4). **Application :** un identifiant ASTER attribué automatiquement ; le numéro de série reste facultatif, car certains matériels cités par le client, comme les câbles, n’en ont pas.
- [ ] Combien de profils et d’écoles ? — **Client :** administrateur, gestionnaire et formateur ; une école pour la démonstration, extensible ; gestionnaires « à l’échelle globale » (22 octobre, §§ 2.1 à 2.3). **Application :** un profil super administrateur en plus et plusieurs écoles, chaque gestionnaire intervenant sur toute son école.
- [ ] Quels statuts pour un matériel ? — **Client :** utilisé, en stock ou hors service (22 octobre, § 2.4). **Application :** indication « hors service » distincte ; le stock correspond à l’absence de salle.
- [ ] Faut-il gérer l’installation physique des salles ? — **Orientation de l’utilisateur du 11 novembre, pas encore abordée avec le client :** une affectation enregistrée dans ASTER reste « en cours d’installation » jusqu’à la confirmation du déplacement physique du matériel, qui devient alors « installé » ; un matériel retiré d’une salle est « à rapatrier au stock » jusqu’à son rangement ; une salle est « en cours d’installation », avec son avancement en pourcentage, puis « équipée » une fois tout installé. Un matériel est donc « en stock », « installé », « en cours d’installation » ou « à rapatrier », ce qui rejoint les statuts « utilisé » et « en stock » cités par le client (22 octobre, § 2.4). Intérêt relevé par l’utilisateur : savoir où se trouve réellement une machine, pour le gestionnaire comme pour le formateur, à la suite d’une remontée ou d’un processus interdit ; réserve : une démarche de plus pour le gestionnaire. **Application :** point orange (en cours) ou vert (installé) par matériel, confirmation d’un clic sur le point orange ou pour tout un trajet (Salles › Déplacements : du stock vers une salle, d’une salle à une autre, d’une salle vers le stock), barre d’avancement par salle, backlog « Installations » du gestionnaire à côté de celui des remontées, indicateurs du tableau de bord et notification « x matériels à déplacer ».
- [ ] Faut-il proposer une application de scan pour l’installation des salles ? — **Proposition de l’utilisateur du 11 novembre, à présenter le 12 novembre :** une application de scan, réalisée par l’équipe pour un autre projet, sert à suivre les matériels d’une salle à l’autre. On scanne le QR code d’une salle, puis chaque matériel scanné ensuite est relocalisé dans cette salle ou confirmé comme déjà présent. Employée comme microservice, elle automatiserait la confirmation des déplacements : le point d’un matériel passerait de l’orange (« en cours d’installation ») au vert (« installé ») une fois scanné dans sa salle, ou le matériel serait rangé s’il est scanné au stock, ce qui allège la démarche du gestionnaire relevée au point précédent. **Application :** non intégrée ; la confirmation se fait aujourd’hui d’un clic sur le point orange (Salles › Déplacements). À préciser avec le client : étiquetage QR des salles, du stock et des matériels (identifiant ASTER), profil autorisé à scanner, authentification du microservice auprès d’ASTER (sur le modèle de l’API des postes, par jeton) et usage hors connexion.
- [ ] Faut-il gérer les livraisons et les demandes de nouveau matériel ? — **Proposition de l’utilisateur du 11 novembre, à présenter le 12 novembre :** un outil qui simplifierait la demande de nouveaux matériels, puis le suivi de la demande jusqu’à la livraison et l’entrée des matériels livrés dans le stock. **Réponse en vigueur (précision de l’utilisateur du 24 octobre, § 6) :** l’arrivée des matériels est prise en charge par saisie manuelle ou import JSON, sans connexion au système du CND. **Application :** non géré ; les matériels livrés s’enregistrent par saisie ou import JSON. À préciser avec le client : qui exprime un besoin (formateur, gestionnaire) et qui le valide, circuit de commande existant auprès du CND, suivi de la livraison et rattachement des matériels reçus à la demande.
- [ ] Faut-il gérer le « rôle » d’un matériel ? — **Client :** sa destination, par exemple pour une formation (23 octobre, § 1.1). **Application :** non géré ; seul le type de matériel est renseigné.
- [ ] Comment afficher les notifications ? — **Client :** fenêtre contextuelle à la connexion (23 octobre, § 1.4). **Application :** liste ouverte par l’utilisateur depuis l’en-tête. La documentation conserve la demande du client.
- [ ] Le tableau de bord du parc doit-il être filtré par salle ? — **Client :** oui (22 octobre, § 2.6). **Application :** pas de filtre par salle ; le détail par salle est présenté dans la vue des salles. La documentation conserve la demande du client.
- [ ] L’import JSON est-il appliqué sans aucun contrôle ? — **Client :** sans vérification (22 octobre, § 2.7). **Orientations de l’utilisateur du 11 novembre :** analyser le fichier dès qu’il est choisi pour prévisualiser les nouveaux matériels et faire remonter les incohérences ; n’ajouter que les nouveaux matériels, ne pas traiter ceux déjà présents (même numéro de série) ; signaler un matériel d’une autre école, que l’importeur peut transférer dans la sienne s’il s’agit d’un échange. Ces orientations ajoutent une vérification que le client n’a pas demandée. **Application :** un fichier mal formé ou incomplet est refusé en entier ; l’aperçu présente les incohérences, les matériels déjà présents ou répétés dans le fichier sont ignorés, un matériel d’une autre école est transféré si l’importeur l’active (sauf s’il est cité par une remontée en cours de son école). À préciser avec le client : qui autorise un transfert entre écoles, et si l’école d’origine doit en être informée.
- [ ] L’administrateur consulte-t-il les états des lieux ? — **Client :** question laissée ouverte (23 octobre, § 1.2). **Application :** oui, comme le gestionnaire.
- [ ] Un matériel cité par une remontée peut-il être supprimé ? — **Orientation de l’utilisateur :** conserver sa fiche pour préserver la remontée. **Application :** l’interface bloque cette suppression, mais le serveur ne garantit pas encore cette contrainte ; une suppression obtenue autrement laisse la remontée consultable sans la fiche du matériel.
