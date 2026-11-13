# ASTER — Suivi du backlog — Brouillon V1

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 1.0 | 13/11/2026 | Brouillon interne | Consolider le suivi des progressions | [1 version](../../archive/README.md#19-suivi-backlog-brouillon-v1) |
<!-- version:fin -->

**Date de situation : 13 novembre 2026.** Période observée : du 20 octobre au 13 novembre 2026. Référence locale : `07629612ff5078cf041f7ef4100ba249c464d576`.

**Destination : document interne de préparation du suivi de projet.** Cette version reste un brouillon : le rapprochement avec GitHub Projects n’a pas pu être effectué. Elle ne constitue ni un relevé de temps ni une attestation des travaux individuels.

## 1. Sources et méthode

Le suivi repose sur l’historique des commits accessibles depuis `HEAD`, leurs dates, auteurs, sujets et, pour les modèles individuels, les fichiers ajoutés. Les commits d’autres branches ne sont pas comptés comme intégrés. Les dates correspondent à la date d’auteur Git ; elles ne donnent pas la durée de réalisation.

- [Dépôt GitHub](https://github.com/bpierrelouis/aster) : les liens des tableaux ouvrent les commits concernés.
- [Consignes du projet](../01-CONSIGNES.md), notamment les exigences de présentation et de suivi du backlog.
- [Cadrage](../02-CADRAGE.md), notamment les § 19 à 23 pour l’architecture, les limites et les questions encore ouvertes.
- [Guide interne de l’application](../../application/README.md), référence pour les modalités de réalisation.
- Projet GitHub demandé : **« aster development »**. Son URL exacte, ses cartes, leurs responsables et leurs statuts n’ont pas été consultés. Le connecteur disponible ne propose pas la lecture des Projects et l’accès public à la page des projets du dépôt n’a pas abouti. Aucun numéro de carte ni statut ci-dessous ne lui est attribué.

Les identifiants `SUIVI-01` à `SUIVI-12` sont propres à ce document. Ils ne remplacent pas les identifiants du tableau GitHub. Les priorités et les suites proposées constituent des orientations de pilotage, pas des décisions client.

Pour rendre la progression lisible, le document utilise deux niveaux :

| Niveau | Signification |
| --- | --- |
| Trace Git | Un commit témoigne d’un ajout ou d’une modification. Il ne prouve pas, à lui seul, la recette ni le fonctionnement en production. |
| Estimation éditoriale | Une progression reconstituée pour expliquer les étapes entre les livraisons. Elle ne prouve ni une activité quotidienne ni une contribution supplémentaire d’une personne. |

Les pourcentages individuels de la § 4 sont volontairement arrondis et illustratifs. Ils portent sur un **lot de travail identifié**, jamais sur la productivité d’une personne ou sur la totalité du projet. Le nombre de commits n’est pas utilisé comme unité d’effort.

## 2. Progression générale

| Période | Progression observable | Explication de l’avancée |
| --- | --- | --- |
| 20–24 octobre | Consignes, cadrage, contexte et activité | Le besoin commence à être structuré. Les premiers diagrammes permettent de représenter les acteurs et le parcours général avant de détailler les fonctions. Traces : [288c524](https://github.com/bpierrelouis/aster/commit/288c524), [336ee74](https://github.com/bpierrelouis/aster/commit/336ee74), [cc22229](https://github.com/bpierrelouis/aster/commit/cc22229). |
| 2–5 novembre | Modèle de données, droits, fiches de profils, présentation et séquences | La conception se précise : les données et responsabilités sont décrites, puis certains échanges sont représentés en séquences. Traces : [23cb750](https://github.com/bpierrelouis/aster/commit/23cb750), [f7310c1](https://github.com/bpierrelouis/aster/commit/f7310c1), [c757f41](https://github.com/bpierrelouis/aster/commit/c757f41), [bde906a](https://github.com/bpierrelouis/aster/commit/bde906a). |
| 6–8 novembre | Connexion et socle applicatif | Le projet passe des représentations à un premier ensemble applicatif : connexion OIDC, règles partagées, API, données persistées et écrans navigables. Traces : [55e41d4](https://github.com/bpierrelouis/aster/commit/55e41d4), [59bcae8](https://github.com/bpierrelouis/aster/commit/59bcae8), [660a1ca](https://github.com/bpierrelouis/aster/commit/660a1ca), [1c50d70](https://github.com/bpierrelouis/aster/commit/1c50d70). |
| 9–10 novembre | Approfondissement des parcours et modèles complémentaires | Les tableaux de bord, salles, PDF et tableaux gagnent en précision. Les diagrammes de classes et d’états complètent la conception. Traces : [31f7e5b](https://github.com/bpierrelouis/aster/commit/31f7e5b), [fcdc0b8](https://github.com/bpierrelouis/aster/commit/fcdc0b8), [d1d10e5](https://github.com/bpierrelouis/aster/commit/d1d10e5), [dafc7e8](https://github.com/bpierrelouis/aster/commit/dafc7e8), [d4be5bf](https://github.com/bpierrelouis/aster/commit/d4be5bf). |
| 11–13 novembre | Préparation du déploiement, suivi des interventions et architecture cible | Les évolutions portent davantage sur l’exploitation et la consolidation : back sans état, CI, suivi d’installation, préparation des VM et description du C1NP. Les commits ne suffisent pas à déclarer la recette achevée. Traces : [09ed10b](https://github.com/bpierrelouis/aster/commit/09ed10b), [a20785a](https://github.com/bpierrelouis/aster/commit/a20785a), [a1032c8](https://github.com/bpierrelouis/aster/commit/a1032c8), [0762961](https://github.com/bpierrelouis/aster/commit/0762961). |

La progression correspond donc à trois étapes : comprendre et concevoir, construire les parcours, puis consolider leur réalisation et leur déploiement. Les ajouts de tests dans Git constituent des travaux de vérification ; leur réussite actuelle n’a pas été contrôlée dans le cadre de cette rédaction.

## 3. Backlog reconstitué à partir des livraisons

« Livré dans Git » signifie qu’une trace de réalisation est intégrée à l’historique observé. Ce statut ne signifie pas « accepté par le client ». Les contributeurs indiqués sont ceux des commits cités, sans prétendre représenter tous les participants au travail.

| ID | Lot et résultat recherché | Contributeurs visibles | État reconstitué au 13 novembre | Preuves principales | Suite proposée |
| --- | --- | --- | --- | --- | --- |
| SUIVI-01 | Structurer le besoin et les droits par profil | Pierre-Louis ; Alexandre pour la préparation du point du 12 novembre | Livraisons documentaires présentes ; questions ouvertes conservées | `288c524`, `f7310c1`, `c757f41`, `d4c0d8c` | Répercuter les prochaines réponses client sans effacer l’historique. |
| SUIVI-02 | Décrire les données et les échanges métier | Pierre-Louis ; auteurs `bbrandon971` et `brandon.boney` ; Sacha | MCD présent ; séquences, classes et états déposés en préparation | `23cb750`, `bde906a`, `31f7e5b`, `fcdc0b8` | Relire les modèles complémentaires avec les règles et les parcours actuels avant sélection pour remise. |
| SUIVI-03 | Permettre l’authentification et l’entrée dans l’espace | Pierre-Louis | Réalisation présente dans Git | `55e41d4`, `92a6b75`, `c3927cf` | Vérifier le parcours connecté et les droits ASTER ; distinguer le substitut local de MindefConnect cible. |
| SUIVI-04 | Porter les règles et données partagées côté serveur | Pierre-Louis | Socle livré ; adaptation aux instances multiples livrée | `59bcae8`, `660a1ca`, `09ed10b` | Rejouer les scénarios de concurrence et de persistance dans l’environnement retenu. |
| SUIVI-05 | Gérer les salles, le stock et l’affectation | Alexandre | Évolutions d’interface et d’affectation présentes | `33b04f4`, `304149c`, `dafc7e8` | Vérifier les déplacements complets et leur cohérence avec les droits. |
| SUIVI-06 | Produire et consulter les remontées et leurs PDF | Pierre-Louis ; Alexandre | PDF enrichi et téléchargement S3 présents ; suivi complété | `d1d10e5`, `847699f`, `c33b4fa` | Vérifier les droits de consultation et le lien entre remontée, matériel et PDF. |
| SUIVI-07 | Améliorer les tableaux de bord et la lisibilité | Alexandre ; Pierre-Louis | Plusieurs itérations livrées | `d3b256d`, `d4be5bf`, `d0b364c`, `7d7a97e` | Contrôler les écrans et les tailles d’affichage ; conserver une action à un seul endroit. |
| SUIVI-08 | Superviser les processus et préciser les règles | Alexandre | Évolutions présentes ; périmètre métier encore dépendant du cadrage | `540df05`, `22ada18` | Vérifier les indicateurs et règles attendus, sans considérer les questions ouvertes comme décidées. |
| SUIVI-09 | Suivre les interventions sur les postes | Alexandre | Suivi d’installation livré dans l’historique retenu | `a1032c8` | Tester demande, exécution par poste, retour du résultat et affichage ; distinguer émulation et intervention sur un poste réel. |
| SUIVI-10 | Automatiser les vérifications et la publication des images | Pierre-Louis ; Alexandre | Workflow et adaptations des tests présents | `a20785a`, `2fb3bb5`, `8b7391f`, `e975771` | Consigner les résultats réels de la CI et des tests avant clôture. |
| SUIVI-11 | Préparer l’exploitation du démonstrateur sur VM | Pierre-Louis ; Louis pour les adresses documentées | Configuration et documentation préparatoires présentes | `d7dff09`, `3396072`, `cecf0d7` | Confirmer la configuration effectivement déployée et effectuer les essais ; ne pas déduire un déploiement réussi du titre d’un commit. |
| SUIVI-12 | Décrire l’architecture cible et la montée en charge | Louis ; Pierre-Louis pour le dossier initial | Dossier enrichi ; étude de capacité en brouillon, sans mesure | `51bd591`, `09ac7b0`, `0762961` | Confirmer les services disponibles au C1NP et mesurer les capacités avant d’annoncer un dimensionnement. |

Les hashes courts de ce tableau se recherchent dans le [dépôt](https://github.com/bpierrelouis/aster) ou avec `git show <hash>`. Les jalons des § 2 et 4 donnent les liens directs des principales preuves.

## 4. Progression par personne

### 4.1. Pierre-Louis BAELDE — socle et intégration

**Progression attestée.** Du 20 octobre au début novembre, les commits portent sur les consignes, le cadrage, les données et les droits. Les 6–8 novembre marquent le passage à la connexion et au socle de l’application. Les 9–12 novembre apportent la fédération LDAP, le téléchargement des PDF, le back sans état et la CI.

**Progression estimée du lot « socle et intégration » :** 20 % au 24 octobre → 45 % au 5 novembre → 75 % au 8 novembre → 90 % au 12 novembre. Cette courbe illustre le passage de la préparation à l’intégration ; le solde représente les vérifications et la consolidation, pas une charge mesurée.

**Preuves :** [288c524](https://github.com/bpierrelouis/aster/commit/288c524), [55e41d4](https://github.com/bpierrelouis/aster/commit/55e41d4), [660a1ca](https://github.com/bpierrelouis/aster/commit/660a1ca), [09ed10b](https://github.com/bpierrelouis/aster/commit/09ed10b), [8b7391f](https://github.com/bpierrelouis/aster/commit/8b7391f).

**Prochaine étape proposée :** produire une trace de recette des parcours connectés et des essais d’exploitation.

### 4.2. Alexandre — interface et parcours métier

**Attribution :** les signatures `alexandre.vilbert`, `Alexandre VILBERT-TAHON` et `Alexvjr94` sont regroupées ici à titre d’hypothèse de travail, à confirmer avec l’équipe.

**Progression attestée.** Le 9 novembre, les modifications concernent la navigation, les salles, les tableaux de bord et les PDF. Le 10 novembre, les affectations, les tableaux et les graphiques sont approfondis. Le 12 novembre, les commits portent sur la supervision, le suivi de l’installation, l’import et les remontées.

**Progression estimée du lot « interface et parcours métier » :** 35 % au 9 novembre → 65 % au 10 novembre → 85 % au 12 novembre. Les premières livraisons rendent les parcours visibles ; les suivantes enrichissent les interactions et le suivi. Le reste concerne la recette et les ajustements aux réponses client.

**Preuves :** [d3b256d](https://github.com/bpierrelouis/aster/commit/d3b256d), [dafc7e8](https://github.com/bpierrelouis/aster/commit/dafc7e8), [d4be5bf](https://github.com/bpierrelouis/aster/commit/d4be5bf), [22ada18](https://github.com/bpierrelouis/aster/commit/22ada18), [a1032c8](https://github.com/bpierrelouis/aster/commit/a1032c8).

**Prochaine étape proposée :** vérifier les parcours par profil et les états d’une intervention, avec captures des écrans concernés.

### 4.3. Brandon — séquences et classes métier

**Attribution :** le regroupement des signatures `bbrandon971` et `brandon.boney` sous le prénom Brandon est une hypothèse à confirmer. Les deux signatures restent distinguées dans les preuves.

**Progression attestée.** Le 5 novembre, `bbrandon971` ajoute quatre images de préparation autour des séquences et d’un formulaire. Le 9 novembre, `brandon.boney` ajoute le diagramme de classes métier. Ces dépôts rendent les représentations disponibles ; ils n’établissent pas leur cohérence actuelle avec l’ensemble des règles.

**Progression estimée du lot « séquences et classes » :** 50 % au 5 novembre → 75 % au 9 novembre. Les étapes de préparation entre ces dates sont une reconstitution éditoriale ; aucune activité supplémentaire n’est attribuée comme un fait. Le solde représente une proposition de relecture et de finalisation.

**Preuves :** [bde906a](https://github.com/bpierrelouis/aster/commit/bde906a), [31f7e5b](https://github.com/bpierrelouis/aster/commit/31f7e5b), fichiers déposés dans `docs/temporaire/`.

**Prochaine étape proposée :** rapprocher classes, MCD et séquences des règles en vigueur, puis identifier les ressources à retenir pour la remise.

### 4.4. Sacha Phommavongsa — cycles de vie

**Progression attestée.** Le 9 novembre, un commit ajoute un brouillon des diagrammes d’états des remontées et des interventions. Cette contribution complète les parcours en représentant les changements d’état.

**Progression estimée du lot « diagrammes d’états » :** 70 % au dépôt du 9 novembre. Une seule livraison étant visible, aucune courbe quotidienne ou progression ultérieure n’est présentée comme observée. Une préparation puis une formalisation sont plausibles, mais non datables à partir de Git.

**Preuve :** [fcdc0b8](https://github.com/bpierrelouis/aster/commit/fcdc0b8), [brouillon des états](DIAGRAMMES-ETATS-BROUILLON-V1.md).

**Prochaine étape proposée :** vérifier les transitions avec les règles actuelles et les retours des postes ; actualiser le brouillon si nécessaire.

### 4.5. Louis Le Maître — architecture cible

**Attribution :** les commits cités portent la signature `Le-maitre Louis`.

**Progression attestée.** Le 12 novembre, les adresses des VM et une estimation de charge sont documentées. Le 13 novembre, l’architecture cible C1NP et sa traçabilité sont précisées. Le travail distingue ainsi les modalités du démonstrateur des choix de la cible.

**Progression estimée du lot « documentation d’architecture cible » :** 40 % au premier jalon du 12 novembre → 65 % après l’étude de charge → 80 % au 13 novembre. Ces valeurs illustrent l’enrichissement documentaire ; elles ne mesurent ni la disponibilité du C1NP ni la performance de l’application.

**Preuves :** [cecf0d7](https://github.com/bpierrelouis/aster/commit/cecf0d7), [09ac7b0](https://github.com/bpierrelouis/aster/commit/09ac7b0), [0762961](https://github.com/bpierrelouis/aster/commit/0762961).

**Prochaine étape proposée :** confronter les hypothèses de dimensionnement aux services réellement accessibles et aux mesures futures.

## 5. Points à traiter au prochain suivi

| Priorité proposée | Action | Motif et condition de clôture |
| --- | --- | --- |
| Haute | Rapprocher ce document de « aster development » | Relever URL, date de consultation, identifiants, statuts et responsables ; expliquer chaque écart avant de modifier un état. Aucun état GitHub ne peut encore être confirmé. |
| Haute | Réaliser et consigner la recette | Des commits de réalisation existent, mais ce suivi n’a exécuté aucun test applicatif. Clôturer les lots sur des résultats observables, pas seulement sur un commit. |
| Haute | Traiter les écarts client/application du cadrage § 23 | Notifications : fenêtre à la connexion demandée, liste dans l’en-tête réalisée. Import JSON : absence de vérification demandée, contrôles présents dans l’application. Conserver la décision client dans les livrables et obtenir une réponse sur l’écart. |
| Haute | Confirmer l’environnement déployé | Les versions successives de l’architecture ne prouvent pas la configuration réellement en service. Relever les services et VM effectivement utilisés et les résultats des essais. |
| Normale | Relire les modèles complémentaires | Séquences, classes et états sont dans les ressources préparatoires. Vérifier leur cohérence avant de les sélectionner comme productions à remettre ; aucune validation documentaire client n’est attendue. |
| Normale | Clarifier les sujets métier encore ouverts | Utiliser le cadrage, notamment les § 20 et 23 ; ne pas transformer le scan QR, la gestion des livraisons ou des hypothèses de capacité en besoins validés. |

## 6. Rapprochement prévu avec GitHub Projects

Le nom **« aster development »** est fourni par l’utilisateur le 13 novembre 2026. Le contenu du tableau n’étant pas accessible dans cette session, la présente section constitue une procédure de rapprochement, et non une copie du Project.

Pour chaque carte réellement consultée, compléter une ligne dans le format suivant :

| Carte et lien GitHub | Lot local correspondant | Responsable du Project | Statut du Project et date de relevé | Preuve de progression | Écart ou prochaine action |
| --- | --- | --- | --- | --- | --- |
| Non relevé — accès au tableau nécessaire | À rapprocher de SUIVI-01 à SUIVI-12 | Non relevé | Non relevé | Commits référencés dans ce document | Ajouter uniquement des informations effectivement consultées. |

Une carte peut couvrir plusieurs lots, et un lot peut correspondre à plusieurs cartes. Les colonnes du Project doivent être conservées telles qu’elles existent. Une carte terminée dans GitHub peut encore nécessiter une vérification documentaire ; inversement, une réalisation présente dans Git peut ne pas avoir été reportée dans le tableau.

## 7. Mise à jour du suivi

À chaque point d’équipe, relever le commit de référence et la date du tableau GitHub, ajouter les réalisations depuis le précédent point, puis expliquer ce qui a changé et ce qui reste à vérifier. Confirmer les regroupements d’identités avec l’équipe. Remplacer les estimations illustratives par les appréciations des responsables dès qu’elles sont disponibles.

Ne pas calculer de moyenne des pourcentages individuels : les lots n’ont ni la même taille ni une charge estimée commune. Ne pas annoncer une vélocité, un burndown ou un taux global de réalisation sans périmètre et estimation de référence. Conserver cette V1 comme brouillon tant que le rapprochement GitHub Projects est incomplet.
