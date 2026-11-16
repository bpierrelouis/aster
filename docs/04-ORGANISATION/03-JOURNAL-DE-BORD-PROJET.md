# Journal de bord du projet ORION

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 1.1 | 16/11/2026 | Production destinée à la remise | Harmoniser l’orthographe des noms BONEY et LE MAITRE | [2 versions](../../archive/README.md#03-journal-de-bord-projet) |
<!-- version:fin -->

Ce journal retrace les échanges de l’équipe entre le 20 octobre et le 19 novembre 2026 à partir du backlog, des jalons et des sources du projet.

Les décisions attribuées au client reprennent uniquement les [entretiens de cadrage](../01-CONTEXTE/04-COMPTE-RENDU-ENTRETIENS.md). Les réponses en vigueur restent centralisées dans le [cadrage](../01-CONTEXTE/03-CADRAGE.md).

## 1. Cadre de suivi

| Élément | Modalité retenue |
| --- | --- |
| Période | Deux sprints : 19 octobre–8 novembre et 9–19 novembre 2026. |
| Équipe | BAELDE, VILBERT-TAHON, BONEY, PHOMMAVONGSA et LE MAITRE. |
| Product Owner | BAELDE. |
| Scrum Master | LE MAITRE. |
| Daily Scrum | 15 minutes à 9 h ; avancement, objectif du jour, obstacle et adaptation. |
| Point hebdomadaire | Coordination élargie de 30 minutes ; ce « Weekly Scrum » complète le cadre retenu mais n’est pas un événement officiel de Scrum. |
| Entretien client | Questions préparées, réponses datées, décisions reportées dans le cadrage et conséquences ajoutées au backlog. |
| Références | [Backlog et suivi du projet](01-BACKLOG-ET-SUIVI-PROJET.md), [backlog technique](02-BACKLOG-TECHNIQUE-ET-FEUILLE-DE-ROUTE.md) et [entretiens](../01-CONTEXTE/04-COMPTE-RENDU-ENTRETIENS.md). |

## 2. Journal chronologique

| Date | Type | Sujet principal | Résultat |
| --- | --- | --- | --- |
| 20/10 | Point hebdomadaire | Lancement du sprint 1 | Objectif commun défini ; répartition initiale BL-01, BL-02 et BL-17. |
| 22/10 | Entretien client | Périmètre et priorités | Gestion des périphériques prioritaire, puis supervision des processus ; profils et premières contraintes précisés. |
| 23/10 | Entretien client | Droits, remontées et livrables | Droits complétés, PDF d’état des lieux demandé et DAT ajouté aux livrables. |
| 26/10 | Daily Scrum | Structuration du besoin | Acteurs et vocabulaire consolidés ; ambiguïtés regroupées pour le cadrage. |
| 27/10 | Point hebdomadaire | Dépendances entre besoin et données | Relecture croisée du cadrage, des droits et du premier modèle de données. |
| 02/11 | Daily Scrum | Passage à la conception | Parcours prioritaires reliés aux données ; préparation du point d’étape client. |
| 03/11 | Point hebdomadaire | Préparation de la démonstration | Répartition des prises de parole et sélection d’un parcours centré sur les usages. |
| 04/11 | Entretien client | Retour sur le point d’étape | Présentation recentrée sur les bénéfices, maquette montrée directement et simulation d’une salle de 40 postes retenue. |
| 06/11 | Daily Scrum | Connexion, salles et interface | Dépendances entre identité, profils, navigation et données rendues visibles. |
| 09/11 | Point hebdomadaire | Lancement du sprint 2 | Priorité donnée aux parcours intégrés, à la recette par profil et à la cohérence documentaire. |
| 10/11 | Daily Scrum | Parcours intégrés | Salles, stock, remontées et supervision soumis à relecture croisée. |
| 12/11 | Entretien client | PDF et remontées | PDF produit à la demande sans conservation ; clôture par l’auteur non retenue. |
| 13/11 | Point hebdomadaire | Préparation de la clôture | Tâches de recette, d’architecture, de documentation et de remise redistribuées. |
| 16/11 | Daily Scrum | Stabilisation avant rendu | Anomalies prioritaires traitées ou consignées ; contrôles finaux répartis. |
| 17/11 | Daily Scrum | Rendu | Version à remettre identifiée ; livrables, liens et réserves contrôlés. |
| 18/11 | Point hebdomadaire | Préparation de la présentation | Support final relu, démonstration répétée et temps de parole répartis. |
| 19/11 | Daily Scrum | Présentation | Dernier contrôle du parcours, des rôles et des réponses aux questions. |

## 3. Daily scrums

### 3.1. Daily du 26 octobre — cadrage du besoin

| Membre | Réalisé ou constaté | Objectif du jour | Obstacle ou besoin d’aide |
| --- | --- | --- | --- |
| BAELDE | Premières réponses client regroupées. | Ordonner PB-01 à PB-04 et distinguer réponses, hypothèses et questions. | Terminologie métier encore instable. |
| VILBERT-TAHON | Parcours principaux esquissés. | Préparer une navigation par profil. | Droits du formateur à préciser. |
| BONEY | Entités principales repérées. | Relier matériels, salles et affectations. | Sens de certains termes à confirmer. |
| PHOMMAVONGSA | Premiers états des remontées recensés. | Identifier les transitions certaines. | Statuts incomplets dans les échanges. |
| LE MAITRE | Contraintes d’architecture inventoriées. | Distinguer cible et démonstrateur. | Solution d’administration Windows encore ouverte. |

**Adaptation :** BAELDE et BONEY harmonisent le vocabulaire avant d’étendre les modèles ; les incertitudes restent dans le cadrage et ne deviennent pas des règles.

### 3.2. Daily du 6 novembre — première traversée fonctionnelle

| Membre | Réalisé ou constaté | Objectif du jour | Obstacle ou besoin d’aide |
| --- | --- | --- | --- |
| BAELDE | Profils et droits rapprochés du parcours de connexion. | Vérifier l’accès adapté à chaque profil. | Intégration cible de MindefConnect non détaillée. |
| VILBERT-TAHON | Navigation et vues de salles préparées. | Rendre les salles repérables par bâtiment. | Données d’exemple à stabiliser. |
| BONEY | Modèle de données confronté aux parcours. | Corriger les écarts de vocabulaire. | Dépendance aux décisions encore ouvertes. |
| PHOMMAVONGSA | Cycles de remontée et d’intervention esquissés. | Préparer les scénarios de vérification. | Résultat d’une intervention à distinguer de sa demande. |
| LE MAITRE | Architecture réelle et cible séparées. | Vérifier les technologies autorisées. | Solution d’administration des postes non choisie. |

**Adaptation :** l’équipe conserve Keycloak comme substitut local de MindefConnect pour le démonstrateur, sans le présenter comme l’identité cible.

### 3.3. Daily du 10 novembre — intégration des parcours

| Membre | Réalisé ou constaté | Objectif du jour | Obstacle ou besoin d’aide |
| --- | --- | --- | --- |
| BAELDE | Contrats partagés et données rapprochés. | Consolider les contrôles d’accès côté serveur. | Risque d’écart entre interface et règles. |
| VILBERT-TAHON | Parcours salles, stock et tableaux de bord intégrés. | Harmoniser libellés et actions. | Lisibilité des salles à contrôler sur petits écrans. |
| BONEY | Classes et séquences confrontées aux usages. | Vérifier inventaire et affectations. | Import JSON différent de la demande initiale. |
| PHOMMAVONGSA | Scénarios de supervision préparés. | Vérifier remontées et interventions par profil. | Certains indicateurs restent à définir. |
| LE MAITRE | Schémas et flux relus. | Préparer le dossier de remise. | Hypothèses de capacité non mesurées. |

**Adaptation :** chaque parcours est relu par un membre qui n’en est pas l’auteur ; les écarts non arbitrés restent visibles dans le backlog.

### 3.4. Daily du 16 novembre — stabilisation

| Axe | État | Action décidée | Responsable |
| --- | --- | --- | --- |
| Sécurité et droits | Corrections prioritaires intégrées ; contrôles à rejouer. | Exécuter les tests serveur et la recette par profil. | BAELDE, PHOMMAVONGSA |
| Interface | Parcours essentiels disponibles ; captures à contrôler. | Vérifier salles, tableaux de bord et cohérence visuelle. | VILBERT-TAHON |
| Modèles | Livrables produits ; cohérence finale à confirmer. | Croiser classes, séquences, données et vocabulaire. | BONEY |
| Architecture | Dossier et schémas disponibles. | Relire les flux, versions et ressources remises. | LE MAITRE |
| Rendu | Dépend de la réunion des contributions. | Réserver le 17 novembre au contrôle collectif et au dépôt. | Toute l’équipe |

**Obstacle :** le volume de vérifications restantes impose de ne plus ouvrir de fonctionnalité non indispensable au rendu.

### 3.5. Daily du 17 novembre — contrôle du rendu

| Question | Réponse |
| --- | --- |
| La version à rendre est-elle identifiée ? | Oui, après réussite des contrôles convenus et consignation des réserves restantes. |
| Les livrables nécessaires sont-ils sélectionnés ? | Oui ; les documents internes, secrets et données propres au démonstrateur sont exclus. |
| Les parcours essentiels sont-ils contrôlés ? | Oui pour la connexion, le parc, les salles, les remontées, la supervision et les interventions selon les traces disponibles. |
| Reste-t-il un blocage ? | Aucun blocage empêchant le rendu ; toute limite non levée est déclarée comme réserve. |
| Action immédiate | Vérifier une dernière fois les liens, le contenu du dépôt remis et l’identifiant de version. |

## 4. Points hebdomadaires

### 4.1. Semaine du 20 au 23 octobre — lancement

- **Objectif :** comprendre le besoin et constituer le backlog initial.
- **Décisions d’équipe :** une équipe unique, un Product Owner, un Scrum Master et une relecture croisée des productions.
- **Travaux engagés :** BL-01 sur le besoin et les profils, BL-02 sur les données, BL-17 sur l’architecture.
- **Point de vigilance :** ne pas transformer les ambiguïtés des premiers entretiens en exigences confirmées.
- **Action suivante :** consolider le cadrage et préparer les premiers parcours.

### 4.2. Semaine du 26 au 30 octobre — structuration

- **Objectif :** relier acteurs, droits, matériels, salles et remontées.
- **Résultat :** vocabulaire partagé, premières dépendances visibles et questions regroupées.
- **Arbitrage :** privilégier la gestion des périphériques avant la supervision des processus, conformément au retour du 22 octobre.
- **Risque :** divergence entre les représentations si les termes changent sans synchronisation.
- **Action suivante :** préparer les modèles et le point d’étape du 4 novembre.

### 4.3. Semaine du 2 au 8 novembre — première traversée

- **Objectif :** montrer un parcours compréhensible de la connexion à la consultation du parc.
- **Résultat :** maquette navigable, première cohérence entre données, droits et architecture.
- **Retour intégré :** présentation centrée sur les usages, démonstration directe de la maquette et prise de parole de chaque membre.
- **Amélioration retenue :** commencer les revues par le bénéfice utilisateur avant les détails techniques.
- **Action suivante :** réordonner le sprint 2 selon les retours du 4 novembre.

### 4.4. Semaine du 9 au 13 novembre — consolidation

- **Objectif :** compléter les parcours prioritaires et préparer la recette.
- **Résultat :** salles, stock, remontées, supervision, interventions et architecture rapprochés des règles applicables.
- **Retour intégré :** production des PDF à la demande par le serveur, sans conservation ; aucune clôture par l’auteur déduite.
- **Risque :** charge de synchronisation entre application, modèles, documentation et support de présentation.
- **Action suivante :** geler les ajouts non essentiels et répartir les contrôles de clôture.

### 4.5. Semaine du 16 au 19 novembre — remise et présentation

- **Objectif :** stabiliser, rendre puis présenter un résultat cohérent.
- **Résultat :** contrôles répartis par domaine, version de remise identifiée et réserves consignées.
- **Organisation :** le 17 est réservé au rendu ; le 18 au support et à la répétition ; le 19 à la présentation.
- **Amélioration retenue :** conserver une trace datée des contrôles et décisions.
- **Clôture :** les éléments inachevés restent dans le backlog au lieu d’être déclarés terminés par effet de l’échéance.

## 5. Entretiens avec le client

### 5.1. Entretien des 22 et 23 octobre — découverte du besoin

**Préparation :** BAELDE présente les objectifs ; VILBERT-TAHON questionne les usages ; BONEY les données ; PHOMMAVONGSA les cycles de vie ; LE MAITRE l’environnement et les livrables.

| Question posée | Réponse consignée dans les entretiens | Conséquence de travail |
| --- | --- | --- |
| Quels problèmes traiter en priorité ? | Gestion des périphériques, puis supervision des processus. | Ordonner le backlog selon ces deux axes. |
| Quels profils sont nécessaires ? | Administrateur, gestionnaire et formateur ; droits précisés au cours des deux échanges. | Construire la matrice des droits sans inventer un profil stagiaire. |
| Comment organiser le matériel ? | Affectation à une salle, stock possible sans localisation, numéro de série comme identifiant. | Modéliser matériels, salles et affectations. |
| Comment signaler un problème ? | Une remontée décrit le problème et donne lieu à un état des lieux PDF. | Prévoir le parcours de remontée et la génération du PDF. |
| Quels livrables techniques sont attendus ? | Un dossier d’architecture technique. | Ajouter le DAT au plan de production. |

**Compte rendu :** les réponses sont classées par date ; les inconnues restent dans le cadrage. Aucune règle de gestion nouvelle n’est créée par le journal.

### 5.2. Entretien du 4 novembre — retour sur le point d’étape

| Sujet présenté | Retour client consigné | Action de l’équipe |
| --- | --- | --- |
| Support de présentation | Mettre en avant usages et bénéfices ; éviter de perdre le public dans la technique. | Recentrer le récit sur les parcours des écoles. |
| Participation | Chaque membre doit prendre la parole. | Répartir les séquences de présentation. |
| Maquette | La montrer directement, sans captures dans le support. | Préparer une démonstration courte et fiable. |
| Salles | Prévoir une salle simulée de 40 postes et un repérage par bâtiment. | Adapter les données de démonstration et les vues. |
| Identité | Simuler MindefConnect dans le démonstrateur. | Employer un substitut local sans le présenter comme la cible. |
| Administration Windows | Vérifier l’existant et préparer une proposition. | Maintenir le choix ouvert tant qu’il n’est pas arbitré. |

**Clôture :** BAELDE reporte les réponses dans le cadrage, l’équipe réordonne le backlog et LE MAITRE prépare les points techniques du rendez-vous suivant.

### 5.3. Entretien du 12 novembre — arbitrages avant clôture

| Question préparée | Réponse client consignée | Effet sur le projet |
| --- | --- | --- |
| Où conserver les états des lieux PDF ? | Ils sont générés à la demande par le backend et ne sont pas conservés. | Retirer tout stockage S3 du parcours cible. |
| L’auteur clôture-t-il sa remontée ? | Cette validation n’a pas été retenue. | Ne pas ajouter cette transition au cycle de vie. |
| Les autres sujets préparés ont-ils reçu une réponse ? | Aucun autre retour n’est consigné. | Ne déduire aucune validation du silence. |

**Clôture :** les deux réponses sont répercutées dans les documents concernés ; les sujets sans réponse restent au statut qui était le leur avant l’entretien.

## 6. Bilan

| Aspect | Enseignement retenu |
| --- | --- |
| Communication | Un point court doit aboutir à une adaptation observable du plan. |
| Traçabilité | Toute décision client reste datée et reliée à sa source. |
| Qualité | Une tâche n’est terminée qu’après relecture, contrôles adaptés et mise à jour documentaire. |
| Gestion des risques | Les inconnues et réserves restent visibles ; elles ne sont pas masquées par l’échéance. |
| Travail collectif | Les domaines ont un pilote, mais la recette, la relecture et la remise mobilisent toute l’équipe. |
