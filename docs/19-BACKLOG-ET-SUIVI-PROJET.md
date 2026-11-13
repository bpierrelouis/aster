# ASTER — Backlog et suivi du projet

**Période : du 20 octobre au 19 novembre 2026.**

**Version préparée le 13 novembre 2026 — échéance de remise : 19 novembre 2026.**

Ce livrable présente le backlog, la répartition des responsabilités entre les cinq membres du groupe et les étapes de préparation de la remise du 19 novembre. Il rassemble les tâches, les résultats attendus et le suivi de leur avancement. Il constitue un support de présentation de l’organisation du projet, distinct des consignes de développement.

## 1. Objectif et périmètre

Le backlog organise le projet en vingt tâches : compréhension du besoin, conception, réalisation des parcours, vérification et préparation de la remise. Chaque tâche possède un responsable, un appui, un résultat attendu et une échéance. Le responsable coordonne la tâche ; l’appui contribue à la relecture et à la continuité du travail.

Le périmètre couvre la gestion du parc, les salles et affectations, la supervision, les interventions, les remontées et leurs états des lieux, les profils, l’architecture et les productions de conception. Les fonctionnalités encore ouvertes dans le cadrage ne sont pas considérées comme acquises : les propositions de scan QR et de suivi des commandes restent en dehors du périmètre de clôture présenté ici.

La connexion cible repose sur MindefConnect. Les choix d’outillage local, les comptes de test et les consignes de lancement ne font pas partie de ce livrable.

## 2. Répartition des responsabilités

| Membre | Domaine principal | Tâches pilotées | Contribution transversale |
| --- | --- | --- | --- |
| Pierre-Louis BAELDE | Intégration et cohérence d’ensemble | BL-01 à BL-04 | Besoin, données, connexion et coordination de la livraison |
| Alexandre VILBERT-TAHON | Interface et parcours utilisateurs | BL-05 à BL-08 | Navigation, tableaux de bord, salles et cohérence visuelle |
| Brandon | Modélisation et gestion du parc | BL-09 à BL-12 | Séquences, classes, inventaire et vérification des affectations |
| Sacha Phommavongsa | Cycles de vie et supervision | BL-13 à BL-16 | États, règles de supervision, interventions et recette des profils |
| Louis Le Maître | Architecture et préparation de la remise | BL-17 à BL-20 | Architecture, flux, dossier technique et assemblage des livrables |

Les tâches n’ont pas toutes la même taille. Leur nombre décrit la répartition des responsabilités ; il ne mesure ni le temps consacré ni la contribution individuelle totale.

## 3. Backlog de référence pour la remise

Les priorités organisent la préparation de l’échéance : **P1** pour les parcours et productions essentiels, **P2** pour leur consolidation et leur présentation. Les critères ci-dessous définissent le résultat attendu pour chaque tâche.

| ID | Tâche | Responsable | Appui | Priorité | Période prévue | Résultat attendu à la clôture |
| --- | --- | --- | --- | --- | --- | --- |
| BL-01 | Structurer le besoin et les profils | Pierre-Louis | Brandon | P1 | 20/10–03/11 | Périmètre et responsabilités présentés sans confondre décisions et questions ouvertes. |
| BL-02 | Consolider le modèle de données | Pierre-Louis | Brandon | P1 | 02/11–09/11 | MCD, vocabulaire et règles relus ensemble ; écarts identifiés. |
| BL-03 | Intégrer la connexion et les droits | Pierre-Louis | Sacha | P1 | 06/11–16/11 | Parcours de connexion et accès par profil couverts par les vérifications prévues. |
| BL-04 | Préparer la livraison d’ensemble | Pierre-Louis | Louis | P1 | 11/11–19/11 | Version de remise identifiée, contrôle collectif et réserves consignés. |
| BL-05 | Organiser la navigation des écrans | Alexandre | Pierre-Louis | P1 | 06/11–10/11 | Écrans accessibles par leur parcours et leur adresse ; navigation cohérente. |
| BL-06 | Construire les tableaux de bord | Alexandre | Sacha | P2 | 09/11–16/11 | Informations utiles au profil, tableaux et graphiques lisibles. |
| BL-07 | Finaliser les vues salles et stock | Alexandre | Brandon | P1 | 09/11–16/11 | Salles lisibles et ordonnées ; stock et affectations compréhensibles. |
| BL-08 | Harmoniser l’interface et les captures | Alexandre | Louis | P2 | 10/11–18/11 | Libellés, tableaux et captures cohérents avec le parcours cible. |
| BL-09 | Décrire les échanges en séquences | Brandon | Pierre-Louis | P1 | 03/11–13/11 | Échanges des principaux parcours représentés et reliés aux cas concernés. |
| BL-10 | Consolider les classes métier | Brandon | Louis | P1 | 05/11–16/11 | Responsabilités des classes et relations cohérentes avec les données décrites. |
| BL-11 | Vérifier la gestion de l’inventaire | Brandon | Alexandre | P1 | 10/11–17/11 | Création, consultation et affectation couvertes ; écart sur l’import distingué de la demande client. |
| BL-12 | Relire le dossier de conception | Brandon | Sacha | P2 | 13/11–18/11 | Modèles, droits et fiches cohérents ; ressources de remise sélectionnées. |
| BL-13 | Formaliser les cycles de vie | Sacha | Brandon | P1 | 05/11–13/11 | États des remontées et interventions représentés, transitions relues. |
| BL-14 | Vérifier la supervision des postes | Sacha | Alexandre | P1 | 10/11–16/11 | Consultation des processus et règles examinées avec les droits attendus. |
| BL-15 | Vérifier interventions et remontées | Sacha | Pierre-Louis | P1 | 12/11–17/11 | Demande, retour du poste, suivi et consultation du PDF couverts par les scénarios. |
| BL-16 | Coordonner la recette par profil | Sacha | Louis | P1 | 13/11–18/11 | Scénarios par profil, résultats et réserves rassemblés. |
| BL-17 | Décrire l’architecture et les flux | Louis | Pierre-Louis | P1 | 03/11–13/11 | Architecture réelle et cible distinguées, flux et composants décrits. |
| BL-18 | Relire le dossier technique | Louis | Brandon | P1 | 12/11–17/11 | Texte, schémas et contraintes concordants ; hypothèses de capacité explicites. |
| BL-19 | Préparer le support et la présentation | Louis | Alexandre | P2 | 13/11–18/11 | Support cohérent avec le dossier et passages répartis entre les cinq membres. |
| BL-20 | Assembler le dossier de remise | Louis | Sacha | P1 | 16/11–19/11 | Livrables et ressources nécessaires réunis, liens contrôlés et réserves explicites. |

## 4. Jalons et évolution du travail

| Jalon | Orientation | Progression du travail | Résultat visé |
| --- | --- | --- | --- |
| 24 octobre | Comprendre le besoin | Recueillir les attentes, identifier les acteurs et poser les premiers parcours. | Base de cadrage et premières représentations. |
| 5 novembre | Détailler la conception | Préciser les données, droits, profils et échanges ; préparer la présentation du projet. | Ensemble de conception utilisable pour organiser les parcours. |
| 10 novembre | Relier conception et parcours | Approfondir les écrans, tableaux, salles, remontées et cycles de vie. | Parcours cohérents et premières relectures croisées. |
| 13 novembre | Consolider | Répartir les dernières vérifications et préparer l’assemblage des productions. | Liste des points restant à traiter et responsabilités de clôture. |
| 16 novembre — prévision | Stabiliser les parcours essentiels | Terminer la revue de la connexion, des salles, des tableaux de bord et de la supervision. | Résultats des premières vérifications regroupés. |
| 18 novembre — prévision | Préparer la remise | Achever les relectures, réunir les captures et répéter la présentation. | Dossier préparé et réserves identifiées. |
| 19 novembre — prévision | Clôturer le périmètre de remise | Contrôler le contenu retenu et identifier la version remise. | Remise du dossier et présentation collective. |

## 5. Progression par membre

Les taux ci-dessous sont des estimations de progression du lot de chaque membre. Les colonnes datées après le 13 novembre indiquent les objectifs d’avancement. Une valeur de 100 % correspond à la clôture visée du lot de remise, avec ses réserves éventuelles.

| Membre | 24/10 | 05/11 | 10/11 | 13/11 | 16/11 prévu | 18/11 prévu | 19/11 prévu |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pierre-Louis | 15 % | 40 % | 65 % | 80 % | 90 % | 95 % | 100 % |
| Alexandre | 10 % | 30 % | 65 % | 80 % | 90 % | 100 % | 100 % |
| Brandon | 15 % | 40 % | 60 % | 75 % | 85 % | 100 % | 100 % |
| Sacha | 10 % | 30 % | 60 % | 75 % | 85 % | 100 % | 100 % |
| Louis | 10 % | 35 % | 55 % | 75 % | 85 % | 95 % | 100 % |

### Pierre-Louis — du cadrage à l’intégration

La progression commence par la structuration du besoin et des droits, puis se concentre sur les données et la connexion. Une fois le socle disponible, le travail se déplace vers la cohérence entre les parcours et les règles. Entre le 13 et le 19 novembre, l’objectif est de traiter les derniers points d’intégration et de coordonner la version de remise. La progression finale est plus lente, car elle dépend des retours de recette des autres lots.

### Alexandre — des écrans aux parcours harmonisés

La première phase prépare la navigation et la présentation des informations. La progression s’accélère avec les tableaux de bord et les vues salles et stock, qui rendent les parcours directement lisibles. La dernière période porte sur les ajustements d’interface et les captures. La clôture du lot est visée le 18 novembre pour laisser le dernier jour au contrôle collectif.

### Brandon — des modèles à la vérification du parc

La conception des séquences et des classes structure la première partie du lot. Le travail se poursuit par une confrontation avec les parcours d’inventaire et d’affectation, puis par la relecture du dossier de conception. Du 13 au 18 novembre, la progression dépend de la résolution des écarts entre représentations, vocabulaire et règles. Le résultat attendu est un ensemble de modèles cohérents et sélectionnés pour la remise.

### Sacha — des états à la recette métier

Les cycles de vie donnent d’abord une vue des étapes d’une remontée et d’une intervention. La supervision et le suivi des opérations permettent ensuite de construire des scénarios de vérification complets. La fin du lot est consacrée à la recette par profil : examiner les actions permises, les changements d’état et les résultats visibles. L’objectif du 18 novembre est de disposer d’une synthèse des vérifications et des réserves.

### Louis — de l’architecture à la remise

Le lot commence par la description des composants et des échanges, puis précise la distinction entre architecture réelle et architecture cible. La progression se poursuit avec la relecture des schémas et du dossier technique. Entre le 13 et le 19 novembre, l’effort se déplace vers le support de présentation, les liens et la sélection des productions. La clôture dépend de la disponibilité des contributions et résultats des quatre autres lots.

## 6. Plan de clôture du 14 au 19 novembre

| Date prévue | Pierre-Louis | Alexandre | Brandon | Sacha | Louis |
| --- | --- | --- | --- | --- | --- |
| 14/11 | Revoir connexion et droits | Revoir tableaux de bord | Relire classes et séquences | Préparer les scénarios par profil | Relire composants et flux |
| 15/11 | Examiner les points d’intégration | Ajuster salles et stock | Vérifier les parcours d’inventaire | Examiner les règles de supervision | Vérifier les schémas et références |
| 16/11 | Consolider les retours sur les accès | Stabiliser les parcours essentiels | Croiser modèles et affectations | Vérifier interventions et remontées | Préparer le plan du dossier |
| 17/11 | Participer à la recette croisée | Préparer les captures retenues | Finaliser la revue de l’inventaire | Rassembler les résultats métier | Finaliser la revue technique |
| 18/11 | Préparer la version à remettre | Finaliser interface et captures | Clôturer la relecture de conception | Clôturer la synthèse de recette | Assembler le support et organiser la répétition |
| 19/11 | Identifier la version remise | Contrôler le parcours présenté | Contrôler la présence des modèles | Présenter les vérifications et réserves | Contrôler le dossier et assurer la remise |

Le contrôle final et la présentation mobilisent les cinq membres. Une tâche non aboutie est accompagnée d’une réserve ; elle n’est pas déclarée réalisée par le seul effet de l’échéance.

## 7. Dépendances et points de vigilance

| Sujet | Conséquence sur le suivi | Traitement prévu |
| --- | --- | --- |
| Cohérence données, classes et règles | Une évolution peut affecter plusieurs représentations. | Relecture croisée Pierre-Louis–Brandon avant clôture de la conception. |
| États et affichage des interventions | Un écran seul ne suffit pas à décrire le résultat d’une opération. | Croisement des parcours Alexandre–Sacha avec les règles et retours des postes. |
| Architecture et dossier de remise | Les schémas doivent correspondre au périmètre qu’ils décrivent. | Relecture Louis–Pierre-Louis et distinction explicite entre réel et cible. |
| Import JSON et notifications | Des écarts entre demande client et application sont consignés au cadrage. | Conserver ces écarts comme réserves tant qu’une réponse n’est pas recueillie. |
| Volumétrie et hébergement cible | Les hypothèses ne constituent pas des capacités mesurées. | Ne pas annoncer de dimensionnement confirmé dans la clôture du projet. |
| Dépendances entre les lots | La remise dépend de la disponibilité des modèles, captures et vérifications. | Regrouper les contributions le 18 novembre et réserver le 19 au contrôle final. |

## 8. Références et traçabilité

Les références suivantes retracent les travaux déposés dans le projet. Les estimations d’avancement et la répartition des responsabilités sont présentées séparément dans les tableaux de suivi.

| Domaine | Références historiques |
| --- | --- |
| Besoin et profils | [Cadrage initial — 288c524](https://github.com/bpierrelouis/aster/commit/288c524), [droits — f7310c1](https://github.com/bpierrelouis/aster/commit/f7310c1), [fiches — c757f41](https://github.com/bpierrelouis/aster/commit/c757f41) |
| Modélisation | [MCD — 23cb750](https://github.com/bpierrelouis/aster/commit/23cb750), [séquences — bde906a](https://github.com/bpierrelouis/aster/commit/bde906a), [classes — 31f7e5b](https://github.com/bpierrelouis/aster/commit/31f7e5b), [états — fcdc0b8](https://github.com/bpierrelouis/aster/commit/fcdc0b8) |
| Connexion et intégration | [Connexion — 55e41d4](https://github.com/bpierrelouis/aster/commit/55e41d4), [règles partagées — 59bcae8](https://github.com/bpierrelouis/aster/commit/59bcae8), [API — 660a1ca](https://github.com/bpierrelouis/aster/commit/660a1ca) |
| Parcours utilisateurs | [Tableaux de bord — d3b256d](https://github.com/bpierrelouis/aster/commit/d3b256d), [salles — dafc7e8](https://github.com/bpierrelouis/aster/commit/dafc7e8), [supervision — 22ada18](https://github.com/bpierrelouis/aster/commit/22ada18), [suivi — a1032c8](https://github.com/bpierrelouis/aster/commit/a1032c8) |
| Architecture | [Dossier initial — 51bd591](https://github.com/bpierrelouis/aster/commit/51bd591), [cible C1NP — 0762961](https://github.com/bpierrelouis/aster/commit/0762961) |

Le projet GitHub **« aster development »** est la référence de tableau demandée pour le suivi. Son contenu n’ayant pas été consulté, les identifiants BL-01 à BL-20 sont propres à ce document : ils ne reproduisent ni les cartes, ni les statuts, ni les affectations du Project.

## 9. Contenu attendu de la remise du 19 novembre

- Backlog, répartition des responsabilités et évolution des lots.
- Glossaire, règles de gestion, modèles, diagrammes, matrice des droits et fiches retenus pour la remise.
- Dossier d’architecture et ressources nécessaires à sa lecture.
- Synthèse des vérifications effectivement réalisées et des réserves restantes.
- Support de présentation et répartition des passages entre les cinq membres.

La clôture porte sur le périmètre remis. Les questions métier encore ouvertes et les évolutions ultérieures restent identifiables, sans être présentées comme décidées ou achevées.
