# ASTER — Script oral du point d’étape client du 4 novembre 2026

## Format de l’entretien

**Durée maximale : 30 minutes, échanges compris.** Prévoir 20 minutes d’exposé, 8 minutes de discussion et 2 minutes de marge. Chacun dispose de **4 minutes d’exposé**. Les noms « Intervenant 1 » à « Intervenant 5 » sont à remplacer par les prénoms de l’équipe.

Le texte suit les 15 diapositives du [support existant](index.html). Il présente les interfaces comme des maquettes, le MCD comme une proposition et l’architecture comme une orientation à confirmer. Les données affichées sont fictives.

Les horaires sont des objectifs de répétition, pas des durées mesurées. Parler à un rythme posé et compter les moments où l’on montre l’écran. Pour cette séance, **le minutage ci-dessous prévaut sur les durées indicatives des notes intégrées au diaporama**, dont le cumul atteint 26 min 30 s sans les questions.

## Répartition entre les cinq intervenants

| Intervenant | Passage | Diapositives | Durée totale |
| --- | --- | --- | --- |
| 1 | Introduction, nom et identité visuelle de 00:00 à 03:00 ; conclusion de 19:00 à 20:00 | 1 à 3, puis rester sur la 15 | **4 min** |
| 2 | Besoin, objectifs et premier périmètre utile de 03:00 à 07:00 | 4 à 6 | **4 min** |
| 3 | Tableau de bord, liste et ajout de matériel de 07:00 à 11:00 | 7 à 9 | **4 min** |
| 4 | Fiche, affectation, remontées et supervision de 11:00 à 15:00 | 10 à 13 | **4 min** |
| 5 | Modèle de données et architecture de 15:00 à 19:00 | 14 et 15 | **4 min** |

Une personne conserve la navigation pendant tout l’exposé et change de diapositive au signal de l’orateur. Elle peut aussi présenter son propre passage. Une autre surveille les horaires. Ces responsabilités ne constituent pas des prises de parole supplémentaires.

Les indications entre crochets sont des gestes ou consignes de répétition ; elles ne se prononcent pas. Les transitions font partie du temps de chaque intervenant.

## Intervenant 1 — Introduction et identité proposée

### Diapositive 1 — ASTER, proposition de cadrage · 00:00 à 00:45

Bonjour à toutes et à tous, merci de nous recevoir.

Nous allons vous présenter notre compréhension du besoin, le premier périmètre que nous proposons de développer et les premières interfaces envisagées. Nous terminerons par le modèle de données et une première orientation d’architecture.

Notre objectif aujourd’hui est de vérifier que nous avançons dans la bonne direction, avant d’engager davantage la réalisation.

Nous avons prévu vingt minutes de présentation, puis un temps d’échange. Vous pouvez bien sûr nous interrompre pour une incompréhension ; nous garderons les discussions détaillées pour la fin afin de respecter les trente minutes disponibles.

### Diapositive 2 — Le nom ASTER proposé · 00:45 à 01:40

Nous proposons d’appeler l’application ASTER, pour Administration, Supervision et Traçabilité des Équipements et Ressources.

Ce nom rassemble les grandes fonctions du projet : gérer le parc, connaître la situation des équipements et préparer les actions d’administration et de supervision des postes.

Ce nom reste à valider avec vous, notamment pour éviter une confusion avec un outil déjà utilisé.

[Montrer le nom et laisser l’animation se terminer.]

La fleur sert de signe distinctif. L’idée est de disposer d’une identité simple, reconnaissable sur l’écran de connexion, dans la navigation et dans les documents produits par l’application.

### Diapositive 3 — Direction artistique proposée · 01:40 à 03:00

Cette identité se décline sur fond clair et sur fond sombre, avec la palette présentée ici.

L’encre sert de couleur sombre, l’iris et le lilas donnent l’identité principale, et les fonds clairs permettent de présenter les tableaux et les formulaires. La couleur dorée reprend le cœur de la fleur.

[Montrer les deux logos, puis les quatre familles d’icônes.]

Les icônes distinguent les matériels, les remontées, les processus et les applications. Nous proposons de retrouver ces repères dans la navigation, pour aider les utilisateurs à identifier les fonctions auxquelles ils ont accès.

Cette direction visuelle reste à discuter, notamment si une charte institutionnelle doit être respectée. Les maquettes qui suivent l’utilisent déjà.

L’enjeu principal reste toutefois l’usage : les informations importantes doivent se trouver facilement, les actions doivent être compréhensibles et l’interface doit correspondre au travail quotidien des utilisateurs.

Je passe maintenant la parole à l’intervenant 2, qui va présenter notre compréhension du besoin et la priorité que nous proposons pour la première réalisation.

## Intervenant 2 — Besoin et premier périmètre utile

### Diapositive 4 — Notre compréhension du projet · 03:00 à 04:15

À partir du sujet et de nos échanges, nous retenons d’abord un besoin de gestion des matériels informatiques. Aujourd’hui, le suivi repose sur des fichiers Excel. L’objectif est de centraliser les informations pour savoir quels matériels sont disponibles, où ils se trouvent et dans quel état ils sont.

Le deuxième ensemble concerne les remontées utilisateur : un formateur doit pouvoir signaler un problème sur un ou plusieurs matériels, et ce signalement doit produire un document d’état des lieux au format PDF.

Le troisième ensemble concerne la supervision et l’administration des postes Windows : consulter les processus utilisateur, agir sur ceux qui doivent être arrêtés et préparer les opérations sur les applications ou les images système.

La priorité déjà exprimée porte sur les matériels. L’ordre détaillé entre les autres fonctions reste une proposition de progression à confirmer avec vous.

### Diapositive 5 — Objectifs de la première version · 04:15 à 05:25

Pour la première version, nous voulons rendre le suivi du matériel réellement utilisable : enregistrer les équipements, retrouver leurs informations et gérer leur affectation aux salles.

Le périmètre de démonstration porte sur une seule école. Cela permet de travailler sur un contexte concret, avec ses bâtiments et ses salles, tout en gardant en tête les besoins plus larges déjà identifiés.

Nous avons également retenu la centralisation des remontées et la génération de leurs PDF. Les fonctions de supervision doivent être préparées, mais les processus seront simulés pour la démonstration.

Cette distinction est importante pour apprécier le résultat : les écrans que nous montrons aujourd’hui sont des maquettes ; la supervision simulée ne permettra pas, à elle seule, de démontrer une connexion réelle à des postes Windows.

### Diapositive 6 — La gestion des matériels comme MVP · 05:25 à 07:00

Nous proposons donc de commencer par un premier ensemble de fonctions utilisables, ce que nous appelons ici le MVP.

Le parcours est volontairement concret : un matériel arrive, il est enregistré ou importé, il peut être recherché et consulté, puis affecté à une salle. Il peut ensuite être déplacé ou remis en stock.

Prenons l’exemple d’un écran. Le gestionnaire l’enregistre avec son modèle et sa date de réception. ASTER lui attribue un identifiant interne. L’écran peut rester en stock sans salle, puis être affecté au moment où il est mis à disposition.

Le but est de vérifier un parcours complet, plutôt que de présenter plusieurs fonctions isolées dont aucune ne répondrait encore au besoin quotidien.

Lors de l’échange final, nous vous proposerons de choisir le scénario concret qui permettra de juger ce premier résultat. Nous pourrons ainsi nous appuyer sur une situation que vous reconnaissez et sur des critères de réussite partagés.

L’intervenant 3 va maintenant vous montrer comment ce parcours pourrait se traduire dans l’interface.

## Intervenant 3 — Tableau de bord, recherche et enregistrement

### Diapositive 7 — Tableau de bord du parc · 07:00 à 08:00

Nous commençons par le tableau de bord du parc. Les chiffres et les matériels présentés ici sont fictifs : ils servent à illustrer l’organisation de l’écran.

La proposition consiste à donner une vue rapide du parc et de son état, puis à permettre d’accéder aux informations détaillées. Le tableau de bord doit notamment faire apparaître le stock et permettre une lecture par salle.

[Montrer les indicateurs puis la liste des matériels récemment enregistrés.]

Les indicateurs précis et leurs calculs restent à définir avec vous. Nous cherchons d’abord à vérifier quelles informations vous aideront à décider ou à agir, avant de multiplier les chiffres affichés.

### Diapositive 8 — Liste des matériels · 08:00 à 09:20

La liste des matériels constitue l’écran de travail pour retrouver un équipement.

On y voit le modèle, l’identifiant ASTER, le numéro de série lorsqu’il existe, la date de réception, la localisation et l’état du matériel. La recherche et les filtres proposés doivent permettre de réduire rapidement la liste à ce qui intéresse l’utilisateur.

[Montrer la recherche, le filtre de localisation et le filtre d’état. Utiliser un seul exemple si la maquette est manipulée.]

Par exemple, un gestionnaire peut vouloir retrouver les écrans disponibles en stock avant d’équiper une salle. Il doit pouvoir identifier les matériels concernés sans parcourir l’ensemble du parc ligne par ligne.

L’identifiant interne reste distinct du numéro de série : il permet de repérer chaque matériel dans ASTER, y compris lorsqu’aucun numéro de série n’est disponible.

Cette vue concerne le parc de l’école du gestionnaire ; son accès n’est pas limité à un seul bâtiment. Nous souhaitons recueillir votre avis sur les colonnes et les recherches que vous effectuez le plus souvent.

### Diapositive 9 — Ajout d’un matériel · 09:20 à 11:00

Le formulaire d’ajout reprend les informations nécessaires à l’enregistrement.

Les éléments obligatoires déjà identifiés sont le modèle, la date de réception et l’indication « hors service », qui vaut « non » à la création. Le modèle peut être une désignation simple si aucune référence constructeur n’est connue.

La marque et le numéro de série restent facultatifs. L’identifiant interne est attribué automatiquement ; l’utilisateur n’a donc pas à le saisir.

[Montrer les champs obligatoires, puis le choix d’affectation.]

Le matériel peut être affecté à une salle dès son enregistrement ou rester en stock, sans localisation. Cela permet de représenter aussi bien un équipement reçu et disponible qu’un équipement déjà utilisé dans une salle.

L’import JSON constitue une autre possibilité pour enregistrer les matériels. L’écran présenté ici illustre la saisie manuelle ; il ne montre pas encore le parcours détaillé de l’import.

Ces maquettes servent à vérifier l’ordre des informations et la compréhension des champs avant leur réalisation. L’intervenant 4 va poursuivre avec la consultation d’une fiche, l’affectation des matériels et les autres parcours envisagés.

## Intervenant 4 — Affectation, remontées et actions sur les postes

### Diapositive 10 — Fiche matériel · 11:00 à 11:40

La fiche rassemble les informations d’un matériel : son identifiant, son modèle, sa marque éventuelle, son numéro de série, sa date de réception, sa localisation et son état.

[Montrer les informations, puis les actions de modification et d’affectation.]

L’utilisateur retrouve ainsi le même équipement depuis la liste et peut agir selon ses droits. Le gestionnaire peut créer et modifier les matériels ; la suppression reste réservée à l’administrateur.

### Diapositive 11 — Affectation des matériels · 11:40 à 12:30

L’affectation peut concerner plusieurs matériels en une opération. On sélectionne les lignes, puis la salle de destination, ou le stock si les matériels ne sont plus localisés dans une salle.

[Montrer la sélection et la destination sans répéter toute la démonstration.]

Le changement prend effet immédiatement, sans validation d’une seconde personne. Un matériel peut être affecté au maximum à une salle ; il n’est pas affecté directement à une personne.

L’objectif est de faciliter les opérations courantes, notamment lorsqu’il faut équiper ou réorganiser une salle entière.

### Diapositive 12 — Parcours proposé pour les remontées · 12:30 à 13:45

Pour déclarer un problème, le formateur ou l’administrateur sélectionne un ou plusieurs matériels et décrit le problème rencontré.

ASTER génère alors le PDF d’état des lieux à partir de la remontée. La localisation présentée vient des matériels concernés lorsqu’ils sont affectés à une salle.

Le gestionnaire suit le traitement ; l’administrateur peut également intervenir. Les statuts retenus sont « en attente », « remplacé » et « corrigé ». Le statut concerne l’ensemble de la remontée, même si plusieurs matériels sont concernés.

Par exemple, un signalement peut concerner deux écrans. Il reste une seule remontée avec un statut commun ; le suivi ne prévoit pas ici un traitement distinct pour chaque écran.

Le formateur peut suivre ses propres remontées et reçoit une notification dans ASTER lorsque leur statut change. Les transitions détaillées qui ne sont pas encore définies devront être précisées ; nous ne les considérons pas comme acquises à partir de ce schéma.

### Diapositive 13 — Gestion proposée des processus et applications · 13:45 à 15:00

Nous distinguons ici deux fonctions.

La supervision porte sur les processus utilisateur des postes d’une salle. Le formateur peut consulter ces processus et demander leur arrêt, sans accéder aux processus système. Les règles de blacklist sont gérées par l’administrateur ; un processus interdit doit être arrêté automatiquement et produire une alerte.

L’administration des applications concerne la consultation des logiciels installés et les opérations d’installation ou de réinstallation. La masterisation consiste à réappliquer une image système à un poste ou à une salle.

Dans les deux cas, ASTER doit utiliser les mécanismes Windows existants, sans installer d’agent ASTER sur les postes. Les services utilisables restent à confirmer. L’intervenant 5 va présenter les conséquences de cette contrainte sur notre conception.

## Intervenant 5 — Modèle de données et architecture initiale

### Diapositive 14 — MCD proposé · 15:00 à 17:00

Ce modèle conceptuel de données est une proposition de travail. Nous vous le présentons pour vérifier les notions métier et leurs relations ; il n’a pas encore été validé dans son ensemble.

[Montrer successivement école et salle, matériel, puis poste et processus.]

Le premier ensemble représente l’organisation : les salles appartiennent à une école et portent l’information du bâtiment. Les matériels peuvent être localisés dans une salle ou rester en stock, sans localisation.

Le deuxième point important est la distinction entre le matériel suivi dans l’inventaire et le poste utilisé pour la supervision. Un écran ou un câble est un matériel, mais ne se supervise pas comme un poste Windows. La représentation doit rendre cette différence compréhensible.

Pour la supervision, le modèle distingue le poste, le programme concerné et le compte Windows qui l’utilise. Le compte Windows observé sur une machine ne doit pas être confondu avec le compte d’un utilisateur qui se connecte à ASTER.

Nous devons aussi vérifier que le modèle représente correctement les remontées et les droits. En particulier, une remontée doit pouvoir regrouper plusieurs matériels tout en conservant une description et un statut communs.

Nous ne proposons pas de commenter chaque relation aujourd’hui. Nous cherchons d’abord à confirmer le vocabulaire et les situations métier ; les corrections du modèle suivront ces réponses. Sa présence dans la présentation ne signifie pas que toutes les cardinalités ou tous les attributs sont définitivement arrêtés.

### Diapositive 15 — Architecture cible initiale · 17:00 à 19:00

L’architecture distingue maintenant deux serveurs : le front, qui fournit l’interface web, et le back, qui porte les fonctions métier, les droits et les échanges avec les services.

[Montrer le parcours depuis Firefox vers le serveur front, puis vers le serveur back.]

Pour la connexion, nous prévoyons Keycloak relié à LDAP. Keycloak sera présent dans tous les cas : nous devons vérifier s’il existe déjà sur le réseau cible ou s’il faut le mettre en place.

[Montrer Keycloak et LDAP, puis les deux stockages sous le serveur back.]

La base de données conserve les informations métier du parc, des profils et des remontées. Les PDF d’état des lieux sont conservés dans un stockage S3, auquel le back accède pour les documents. La solution de stockage et son hébergement restent à préciser.

Enfin, le back s’appuie sur les services Windows autorisés pour agir sur les postes, sans installer d’agent ASTER sur les machines cibles.

Les composants sont ainsi identifiés, mais les services Windows utilisables, les flux, les hébergements et les modalités d’intégration doivent encore être confirmés. La démonstration simulée ne remplace pas les tests sur l’environnement cible.

Je redonne la parole à l’intervenant 1 pour conclure et ouvrir l’échange sur les points prioritaires.

## Intervenant 1 — Conclusion · 19:00 à 20:00

Pour terminer, nous proposons de concentrer le premier développement sur un parcours complet de gestion des matériels, puis de poursuivre selon les priorités que nous confirmerons ensemble.

Les interfaces présentées donnent une base concrète pour discuter des usages. Le modèle de données et l’architecture doivent encore être consolidés à partir de vos retours.

Nous aimerions utiliser les prochaines minutes pour préciser trois points : le scénario qui permettra de juger la première version, les corrections les plus importantes sur les parcours montrés et les possibilités techniques d’administration Windows.

Commençons par le premier : quel scénario concret souhaitez-vous pouvoir réaliser pour considérer que la gestion des matériels répond à votre besoin ?

## Échange avec le client · 20:00 à 28:00

L’intervenant 1 distribue la parole ; les autres répondent sur leur partie. Une personne note les décisions et les inconnues sans relire tout le compte rendu à voix haute. Les quatre minutes par personne concernent l’exposé préparé ; les réponses pendant la discussion se répartissent selon les sujets, sans chronométrer le client.

| Créneau | Point à traiter | Relais dans l’équipe | Question ou relance |
| --- | --- | --- | --- |
| 20:00–23:00 | Critère de réussite du premier périmètre | Intervenant 2 | À partir de la réponse à la conclusion : « Quelles étapes doivent absolument réussir dans ce scénario ? » |
| 23:00–25:00 | Corrections prioritaires des parcours et interfaces | Intervenants 3 et 4 | « Parmi les écrans et parcours montrés, quel est le principal écart avec votre façon de travailler ? » |
| 25:00–28:00 | Faisabilité des fonctions Windows | Intervenant 5 | « Quels services d’administration Windows sommes-nous autorisés à utiliser ? » Si le client ne peut pas répondre : « Qui pourrait nous confirmer ce point et les conditions de test ? » |

Poser les questions successivement et écouter la réponse avant de relancer. Recueillir les remarques sur le nom et la direction artistique si elles viennent ; si un point demande une longue discussion, le noter pour le reprendre après les sujets bloquants. Demander si une charte imposée doit être récupérée si ce point n’a pas été traité.

Une réponse inconnue doit rester un point à confirmer avec un interlocuteur identifié si possible. Ne pas transformer une préférence exprimée en validation de l’ensemble du produit, du MCD ou de l’architecture.

## Clôture et marge · 28:00 à 30:00 au plus tard

[Intervenant 1 — environ 30 secondes ; adapter aux réponses réellement obtenues.]

Merci pour ces précisions. Nous allons consigner les décisions prises aujourd’hui, répercuter les corrections dans les documents concernés et conserver les points techniques encore ouverts. Nous vous transmettrons ce récapitulatif pour vérifier que nous avons bien compris vos retours.

[Si un point reste ouvert, rappeler uniquement le point, l’interlocuteur et la prochaine étape réellement convenus. Ne pas annoncer de délai non décidé. Terminer avant la trentième minute.]

## Répétition et conduite de séance

- Répéter une fois avec les cinq personnes et les changements de diapositives. Vérifier les passages de relais à 03:00, 07:00, 11:00, 15:00 et 19:00. Ajuster le débit ou raccourcir les exemples pour tenir les quatre minutes ; ne pas accélérer jusqu’à devenir difficile à suivre.
- Si le client intervient longuement pendant l’exposé, compter ce temps dans les huit minutes d’échange. À 28 minutes, passer à la clôture même si toutes les questions n’ont pas été traitées.
- Dans les maquettes, montrer un seul exemple par écran. Ne pas consacrer du temps à saisir plusieurs matériels ou à essayer toutes les options.
- En cas de problème de manipulation, rester sur l’écran affiché et expliquer le parcours. Les captures et données du support servent à illustrer le besoin ; elles ne prouvent pas qu’une application métier complète fonctionne déjà.
- Ne pas lire le MCD attribut par attribut. Le rendu proposé reste à consolider : notamment, le champ « hors service » n’apparaît pas dans la définition actuelle de `MATERIEL`, et le regroupement de plusieurs matériels sous une même remontée mérite une reprise de la représentation. Ne pas affirmer que ces points sont déjà correctement modélisés.
- La garantie et les journaux généraux sont des bonus ; ne pas les ajouter spontanément aux engagements du premier périmètre. Keycloak relié à LDAP, la séparation front/back et le stockage S3 sont retenus. La disponibilité de Keycloak et les modalités d’intégration, d’hébergement et d’administration Windows restent à confirmer.

## Sources de préparation

- [Sujet et attendus](../../docs/01-CONSIGNES.md) : objectifs généraux et livrables.
- [Cadrage en vigueur](../../docs/02-CADRAGE.md) : §§ 1 à 5 pour le périmètre, les profils et les matériels ; §§ 8 à 15 pour l’administration, les processus, les remontées et les PDF ; §§ 18 et 19 pour l’authentification et l’architecture.
- [Entretiens historiques](../../docs/03-COMPTE-RENDU-ENTRETIENS.md) : origine du besoin, à lire avec les précisions plus récentes du cadrage.
- [Règles de gestion](../../docs/04-REGLES-DE-GESTION.md) : champs, droits et traitements confirmés.
- [Source éditable du MCD proposé](../../docs/05-MCD-MERISE-MOCODO.url) : vocabulaire et représentation actuels, sans validation globale.
- [Contenu du diaporama et notes existantes](slides.js) et [maquette de gestion des matériels](../../design/maquettes/gestion-materiels.html).

Ce script prépare la prise de parole ; il ne remplace ni le cadrage ni le compte rendu des décisions qui seront prises pendant l’entretien.
