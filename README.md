# ORION

**ORION** (_Outil de Recensement, d’Intervention et d’Observation Numérique_) est une application web destinée aux écoles de formation. Elle vise à administrer et superviser les postes Windows à distance. La solution d’administration reste à déterminer.

L’architecture cible distingue un serveur front pour l’interface et un serveur back pour les fonctions métier. La connexion utilise MindefConnect ; les PDF d’état des lieux sont produits à la demande par le serveur back, sans stockage. Les modalités d’intégration de MindefConnect restent à préciser dans le cadrage.

Elle vise à remplacer la gestion du parc informatique sous Excel par un outil centralisé couvrant trois besoins principaux :

- gérer les équipements et leur affectation aux salles, dont le bâtiment est renseigné ;
- administrer et réinstaller les postes ;
- superviser leur utilisation et centraliser les remontées utilisateur.

## Développement

Le dossier [application/](application/README.md) regroupe le front React/Vite (`frontend/`), le back Express (`backend/`) et l’infrastructure PostgreSQL/Keycloak (`infra/`). Le code applicatif est écrit en JavaScript ; les icônes de l’interface utilisent Lucide.

Avec Node.js 22.22 ou supérieur et Docker Desktop démarré :

```sh
cd application
npm ci
npm run infra:up
npm run dev
```

Ouvrir [ORION en local](http://localhost:5173). Le [guide interne de développement](application/README.md) contient les modalités d’utilisation du démonstrateur, les comptes de test, les contrôles et la configuration.

## Documentation

Le sujet, les décisions prises avec le client en rendez-vous et l’application en cours de développement constituent les sources de référence pour l’analyse et la conception du projet ; les orientations données par l’équipe restent révisables tant qu’elles ne sont pas confirmées par le client. Pour chaque sujet, la décision du client prévaut, puis la dernière réponse remplace les précédentes ; les comptes rendus d’entretiens en conservent l’historique et le cadrage présente les réponses en vigueur. Le glossaire sert de référence transversale ; les autres documents suivent cet ordre : consignes du sujet, questions de cadrage, comptes rendus des entretiens, puis analyse et diagrammes.

Les conventions de travail, les protections des diagrammes et les règles de contribution sont définies dans [AGENTS.md](AGENTS.md).

### Destination des documents

Les productions remises aux cadres évaluateurs décrivent l’application cible en production. Les choix propres au démonstrateur restent dans les documents internes. Cette distinction, fixée par l’utilisateur le 6 novembre, concerne également les textes et captures d’interface intégrés aux livrables.

| Destination | Fichiers concernés | Règle de contenu |
| --- | --- | --- |
| Productions destinées à la remise | Glossaire `docs/00-*`, règles et productions `docs/04-*` à `docs/18-*`, avec leurs images nécessaires dans `docs/assets/` | Fonctionnement cible, droits, données et contraintes de production ; aucune modalité propre au démonstrateur, sauf l’architecture réelle que le dossier d’architecture technique doit présenter, sans identifiant ni consigne de lancement |
| Sources de travail internes | Cadrage `docs/02-*` et entretiens `docs/03-*` | Réponses en vigueur et historique des échanges ; ne pas les joindre automatiquement à une remise |
| Source fournie par l’encadrement | Consignes `docs/01-*` | Sujet et critères d’évaluation, distincts des productions de l’équipe |
| Réalisation et exploitation internes | `application/`, son README et ses configurations ; README général et `AGENTS.md` | Implémentation, démarrage, comptes de test et limites du démonstrateur |
| Brouillons et ressources de préparation | `docs/temporaire/`, `design/` et sources éditables des modèles | Travaux et ressources à sélectionner avant inclusion dans un livrable |
| Supports datés | `presentations/` | Conserver le contexte historique ; sélectionner et adapter le support destiné à chaque nouvelle remise |

Aucune validation documentaire par le client n’est prévue : les productions font référence dès qu’elles sont à jour, et les questions réellement ouvertes ne deviennent pas des décisions. Avant une remise, sélectionner les documents et leurs ressources ; ne pas remettre indistinctement l’ensemble du dépôt ou du dossier `docs/`.

### Sommaire

- [Glossaire](docs/00-GLOSSAIRE.md) : abréviations et définitions des termes employés dans le projet.
- [Consignes du projet](docs/01-CONSIGNES.md) : besoin, périmètre fonctionnel, livrables et critères d’évaluation.
- [Questions de cadrage](docs/02-CADRAGE.md) : réponses en vigueur et questions encore ouvertes pour préparer l’architecture et le backlog.
- [Compte rendu des entretiens de cadrage](docs/03-COMPTE-RENDU-ENTRETIENS.md) : trace historique des échanges des 22 et 23 octobre et du 4 novembre.
- [Règles de gestion](docs/04-REGLES-DE-GESTION.md) : contraintes confirmées sur les données, les droits et les traitements.
- [MCD Merise](docs/05-MCD-MERISE.svg) : modèle conceptuel des données conservées par ORION, établi d’après les décisions du client et l’application, avec son [source Mocodo éditable](docs/05-MCD-MERISE-MOCODO.url).
- [Diagramme de contexte](docs/06-DIAGRAMME-CONTEXTE.md) : acteurs, composants de la suite et principaux échanges autour d’ORION.
- [Diagrammes d’activité](docs/07-DIAGRAMMES-ACTIVITE.md) : parcours général selon les droits et les tableaux de bord spécialisés, création d'une remontée avec génération du PDF, supervision des processus et notifications de garantie.
- [DCU — Gestion du parc](docs/08-DCU-GESTION-PARC.md) : recherche, inventaire, affectations et tableau de bord du parc.
- [DCU — Administration des postes](docs/09-DCU-ADMINISTRATION-POSTES.md) : consultation des applications et installation et désinstallation d’applications, réinstallation des postes ou des salles.
- [DCU — Supervision des postes](docs/10-DCU-SUPERVISION-POSTES.md) : état des postes, processus, alertes et statistiques d'utilisation dont les indicateurs restent à définir.
- [DCU — Remontées utilisateur](docs/11-DCU-REMONTEES-UTILISATEUR.md) : création des remontées, consultation des PDF d'état des lieux et tableau de bord spécialisé.
- [Matrice des droits applicatifs](docs/12-MATRICE-DROITS.md) : droits confirmés et conditions d’application pour chaque profil.
- [Fiche descriptive — Gestionnaire](docs/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md) : périmètre, parcours, interface et questions ouvertes du gestionnaire.
- [Fiche descriptive — Formateur](docs/14-FICHE-DESCRIPTIVE-FORMATEUR.md) : supervision, alertes et remontées accessibles au formateur.
- [Fiche descriptive — Administrateur](docs/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md) : parc, postes, supervision, remontées et comptes de son école.
- [Fiche descriptive — Super administrateur](docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md) : adaptation globale des capacités de l'administrateur à toutes les écoles.
- [Dossier d’architecture technique](docs/17-DOSSIER-ARCHITECTURE-TECHNIQUE.md) : contexte et contraintes, justification des briques, démonstrateur local et déploiement sur VM, versions et architecture cible sur le C1NP, avec une annexe sur Keycloak.
- [Diagrammes d’architecture](docs/18-DIAGRAMMES-ARCHITECTURE.md) : vue simplifiée et vue complète du démonstrateur sur dix VM, puis vues simplifiée et détaillée de la cible sur quatre VM C1NP.
- [Design](design/README.md) : charte graphique, ressources visuelles et maquettes d’interface.
- [Présentations](presentations/README.md) : supports datés et instructions pour les consulter.

Les [diagrammes d’activité détaillés des cas d’utilisation — brouillon V2](docs/temporaire/DIAGRAMMES-ACTIVITE-CAS-UTILISATION-BROUILLON-V2.md) complètent les DCU par des parcours acteur/ORION, représentés en Mermaid comme approximations de diagrammes d’activité UML. Ils couvrent l’import JSON, la modification d’un matériel, la création d’une remontée, le changement de profil, l’ajout d’une règle de processus et les propositions de création de salle et d’école.

Le [reste à faire — brouillon V1](docs/temporaire/RESTE-A-FAIRE-BROUILLON-V1.md) recense, en interne, ce qui n’a pas été traité après le contrôle et l’analyse de sécurité du 13 novembre : préparation du prochain déploiement, sécurité à décider ou à réaliser, application et documentation.

Leurs sources sont le [cadrage](docs/02-CADRAGE.md) (§§ 4, 6 et 17 pour les matériels ; §§ 13 et 15 pour les remontées ; § 11 pour les règles ; §§ 2 et 3 pour les écoles, salles et profils), les [règles de gestion](docs/04-REGLES-DE-GESTION.md) et les fiches [Administrateur](docs/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md) (UC-ADMIN-06) et [Super administrateur](docs/16-FICHE-DESCRIPTIVE-SUPER-ADMINISTRATEUR.md). L’import décrit uniquement le succès avec un fichier exploitable et des données conformes, sans validation métier préalable ; les contrôles techniques, doublons et échecs partiels restent à préciser. Le scénario de remontée se limite aux matériels d’une même école ; les remontées multi-écoles et leurs destinataires restent ouverts. Les transitions de profil et la gestion des comptes super administrateur, les droits de création des salles et les modalités de création des écoles restent à préciser ; la création d’école est une proposition hors V1. Ces parcours n’ajoutent aucune règle validée et ne modifient pas les premiers diagrammes d’activité.

## Retrouver une information

Utiliser le sommaire ci-dessus, puis les sections indiquées ci-dessous. Ces parcours orientent la recherche ; ils ne recopient pas les décisions et ne remplacent pas leurs sources. Les numéros de section se rapportent au cadrage actuel.

| Sujet | Entrée dans le cadrage | Vues à consulter selon la tâche |
| --- | --- | --- |
| Objectifs et périmètre | §§ 1 et 2 | Consignes du sujet et entretien concerné |
| Profils, droits et comptes | §§ 2, 3 et 18 | Règles, matrice des droits, fiches des profils concernés |
| Matériels, salles, affectations et import | §§ 4 à 6 et 17 | Glossaire, règles, DCU gestion du parc, MCD |
| Garanties | § 7 | Règles, matrice des droits |
| Applications et réinstallation | §§ 8, 9 et 19 | Règles, DCU administration des postes |
| Processus et alertes | §§ 10 à 12 | Règles, DCU supervision, matrice des droits |
| Remontées et PDF d’état des lieux | §§ 13 et 15 | Règles, DCU remontées, matrice, fiches concernées |
| Tableaux de bord et ergonomie | §§ 14 et 16 | DCU concernés, fiches descriptives, maquettes |
| Architecture et exploitation | §§ 18 à 21 | Sources citées et questions encore ouvertes |
| Présentations client et nom du projet | § 22 | Entretien du 4 novembre et dossier des présentations |

Pour la charte, une maquette ou un support client, commencer directement par le README de `design/` ou de `presentations/`. Les propositions présentées ne valent pas validation du client. Pour le fonctionnement du démonstrateur, les contrats HTTP et les règles serveur effectivement réalisées, consulter le [guide de l’application](application/README.md) et le code concerné.

Pour une recherche ciblée, repérer d’abord les titres ou les identifiants de règles avec `rg -n`, puis lire les passages utiles et leurs sources. Élargir aux dépendances si nécessaire. Une lecture complète reste adaptée à un audit global explicitement demandé.

## Outillage documentaire

Le skill local [orion-documentation](.agents/skills/orion-documentation/SKILL.md) accompagne le recueil du besoin, la rédaction, la synchronisation et l'audit. Il contient des modèles de décision, de règles de gestion, de cas d'utilisation, de story et backlog, et de dossier d'analyse. Ces modèles ne constituent pas des exigences validées.

### Skills complémentaires

Ces skills sont installés dans `.agents/skills/`. Utiliser celui qui correspond au résultat demandé, sans les charger tous pour une tâche ordinaire. Le skill `orion-documentation` reste la référence pour les sources métier et la synchronisation des livrables ORION.

| Skill | Valeur ajoutée | Exemple de demande |
| --- | --- | --- |
| [create-specification](.agents/skills/create-specification/SKILL.md) | Exigences précises, critères d’acceptation, interfaces et cas limites ; modèle adapté aux sources et au classement ORION. | « Utilise $create-specification pour proposer les critères d’acceptation de l’import JSON, sans inventer les modalités ouvertes. » |
| [create-architectural-decision-record](.agents/skills/create-architectural-decision-record/SKILL.md) | Comparaison des options, justification d’un choix technique et conséquences positives ou négatives ; statut proposé tant que le choix n’est pas validé. | « Utilise $create-architectural-decision-record pour documenter les options d’administration Windows et les points à confirmer. » |
| [investigate-codebase](.agents/skills/investigate-codebase/SKILL.md) | Analyse ciblée du code, de ses dépendances et des impacts d’un changement, avec preuves et inconnues explicites. Utile sur les démonstrateurs actuels puis sur l’application lorsqu’elle sera développée. | « Utilise $investigate-codebase en mode IMPACT, profondeur scan, pour analyser ce changement de maquette. » |
| [karpathy-guidelines](.agents/skills/karpathy-guidelines/SKILL.md) | Discipline de développement : hypothèses explicites, solution la plus simple, modifications limitées au strict nécessaire et critères de réussite vérifiables. | « Utilise $karpathy-guidelines pour corriger ce défaut d’affichage en ne modifiant que les lignes nécessaires. » |

Sources installées : [github/awesome-copilot](https://github.com/github/awesome-copilot/tree/8178d1939a203f691067073dcab2a3f1e14072d3/skills), révision `8178d1939a203f691067073dcab2a3f1e14072d3`, pour les deux modèles documentaires ; [Data-System-School/agent-skills](https://github.com/Data-System-School/agent-skills/tree/a117418ab3596c59d641cab4cb89bdbe560fb277/investigate-codebase), révision `a117418ab3596c59d641cab4cb89bdbe560fb277`, pour l’analyse ; [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills/tree/2c606141936f1eeef17fa3043a72095b4765b9c2/skills/karpathy-guidelines), révision `2c606141936f1eeef17fa3043a72095b4765b9c2`, pour la discipline de développement (licence MIT déclarée dans l’en-tête du skill, sans modification). Les licences MIT sont conservées dans les dossiers des skills. Les adaptations ORION sont signalées dans les deux modèles ; l’investigateur conserve sa méthode d’origine. Aucun skill ne valide une décision métier à la place du client ni ne lève les protections d’`AGENTS.md`.

### Explorer le code avec Graphify

Le [skill Graphify](.agents/skills/graphify/SKILL.md), issu du [projet officiel](https://github.com/Graphify-Labs/graphify), aide à explorer les relations dans le code. Il complète les recherches ciblées et les sources ORION selon les règles d’`AGENTS.md`. Le skill est regroupé avec les autres dans `.agents/skills/` ; l’outil Python est installé hors du dépôt.

Le script partagé installe la version prévue dans le compte utilisateur, hors du dépôt. Il nécessite Python 3.10 ou supérieur et un accès Internet pour télécharger les dépendances.

Windows (PowerShell, depuis la racine du dépôt) :

```powershell
py -3 .agents/skills/graphify/scripts/graphify.py --install
py -3 .agents/skills/graphify/scripts/graphify.py --version
```

Linux et macOS :

```sh
python3 .agents/skills/graphify/scripts/graphify.py --install
python3 .agents/skills/graphify/scripts/graphify.py --version
```

Le même script transmet les commandes à Graphify, sans activation d’environnement ni modification du PATH. Par exemple, sous Windows :

```powershell
py -3 .agents/skills/graphify/scripts/graphify.py query "Quelles sont les dépendances de ce module ?"
py -3 .agents/skills/graphify/scripts/graphify.py update .
```

Sous Linux et macOS, remplacer `py -3` par `python3`. Sur certaines distributions Linux, le paquet système `python3-venv` est nécessaire. L’environnement est stocké dans `%LOCALAPPDATA%/graphify/venv` sous Windows, `${XDG_DATA_HOME:-~/.local/share}/graphify/venv` sous Linux et `~/Library/Application Support/graphify/venv` sous macOS.

Dans Codex, demander `$graphify` pour construire le graphe lorsque le code et les besoins d’exploration le justifient. Utiliser ensuite le script ci-dessus pour interroger le graphe et le mettre à jour après modification du code indexé. Aucun graphe n’est fourni initialement. `graphify-out/` est exclu de Git. L’analyse du code est locale ; l’analyse sémantique des documents consomme des tokens du modèle utilisé.

### Utiliser le skill ORION

Exemples de demandes :

- « Utilise $orion-documentation pour vérifier la cohérence du cadrage avec les règles et les DCU, sans modifier les fichiers. »
- « Utilise $orion-documentation pour répercuter cette réponse dans les documents concernés, en préservant les diagrammes protégés. »
- « Utilise $orion-documentation pour proposer les user stories stratégiques à partir du cadrage. »

Le [vérificateur documentaire](.agents/skills/orion-documentation/scripts/verifier_documentation.py) fonctionne avec Python 3.10 ou supérieur, sans dépendance supplémentaire. Depuis la racine du dépôt :

```sh
python3 .agents/skills/orion-documentation/scripts/verifier_documentation.py
```

Il contrôle l'existence des cibles des liens Markdown, les marqueurs de conflit Git, les noms et numéros des documents, leur présence dans le sommaire, les références aux règles de gestion, l'absence de texte hors diagramme dans les fichiers de diagrammes et les libellés des couples source Mocodo/rendu SVG. Il ne vérifie ni les ancres des liens, ni les cardinalités, ni la mise en page, ni la cohérence métier. Pour Mocodo, la présence des libellés ne prouve pas que les relations et cardinalités du rendu correspondent à la source. Les liens Markdown en raccourci sans référence explicite et les liens HTML ne sont pas contrôlés.

Les erreurs donnent un code de sortie non nul ; les avertissements demandent une vérification sans imposer de renumérotation. Les options `--json`, `--strict-warnings` et `--root CHEMIN` permettent respectivement une sortie structurée, un échec sur avertissement et le contrôle d'un autre dossier. Le vérificateur ne modifie aucun fichier. Les défauts déjà présents doivent être distingués des défauts introduits par le changement en cours.
