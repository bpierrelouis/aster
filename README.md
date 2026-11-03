# ASTER

**ASTER** (_Administration, Supervision et Traçabilité des Équipements et Ressources_) est une application web destinée aux écoles de formation. Elle s'appuie sur les mécanismes d'administration à distance fournis par Windows pour administrer et superviser les postes, sans installer d'agent ASTER sur les machines cibles.

Elle vise à remplacer la gestion du parc informatique sous Excel par un outil centralisé couvrant trois besoins principaux :

- gérer les équipements et leur affectation aux salles, dont le bâtiment est renseigné ;
- administrer et réinstaller les postes ;
- superviser leur utilisation et centraliser les remontées utilisateur.

## Documentation

Le sujet et les réponses du client constituent les sources de référence pour l’analyse et la conception du projet. Pour chaque sujet, la dernière réponse remplace les précédentes ; les comptes rendus d’entretiens en conservent l’historique et le cadrage présente les réponses en vigueur. Le glossaire sert de référence transversale ; les autres documents suivent cet ordre : consignes du sujet, questions de cadrage, comptes rendus des entretiens, puis analyse et diagrammes.

Les fichiers Markdown de diagrammes contiennent les diagrammes et les titres nécessaires pour les identifier et les organiser. Leurs définitions, règles, explications et limites sont documentées dans le glossaire, le cadrage et les règles de gestion.

- [Glossaire](docs/00-GLOSSAIRE.md) : abréviations et définitions des termes employés dans le projet.
- [Consignes du projet](docs/01-CONSIGNES.md) : besoin, périmètre fonctionnel, livrables et critères d’évaluation.
- [Questions de cadrage](docs/02-CADRAGE.md) : réponses en vigueur et questions encore ouvertes pour préparer l’architecture et le backlog.
- [Compte rendu des entretiens de cadrage](docs/03-COMPTE-RENDU-ENTRETIENS.md) : trace historique des échanges des 22 et 23 octobre.
- [Règles de gestion](docs/04-REGLES-DE-GESTION.md) : contraintes confirmées sur les données, les droits et les traitements.
- [MCD Merise proposé](docs/05-MCD-MERISE.svg) : modèle de travail à présenter au client pour validation, avec son [source Mocodo éditable](docs/05-MCD-MERISE-MOCODO.url).
- [Diagramme de contexte](docs/06-DIAGRAMME-CONTEXTE.md) : acteurs, composants de la suite et principaux échanges autour d’ASTER.
- [Diagrammes d’activité](docs/07-DIAGRAMMES-ACTIVITE.md) : parcours général selon les droits et les tableaux de bord spécialisés, création d'une remontée avec génération du PDF, supervision simulée des processus et notifications de garantie.
- [DCU — Gestion du parc](docs/08-DCU-GESTION-PARC.md) : recherche, inventaire, affectations et tableau de bord du parc.
- [DCU — Administration des postes](docs/09-DCU-ADMINISTRATION-POSTES.md) : consultation des applications et réinstallation des postes ou des salles par l'intermédiaire des mécanismes d'administration Windows.
- [DCU — Supervision des postes](docs/10-DCU-SUPERVISION-POSTES.md) : état des postes, processus, alertes et proposition de statistiques à valider.
- [DCU — Remontées utilisateur](docs/11-DCU-REMONTEES-UTILISATEUR.md) : création des remontées, consultation des PDF d'état des lieux et tableau de bord spécialisé.
- [Design](design/README.md) : charte graphique, ressources visuelles et maquettes d’interface.

## Outillage documentaire

Le skill local [aster-documentation](.agents/skills/aster-documentation/SKILL.md) accompagne le recueil du besoin, la rédaction, la synchronisation et l'audit. Il contient des modèles de décision, de règles de gestion, de cas d'utilisation, de story et backlog, et de dossier d'analyse. Ces modèles ne constituent pas des exigences validées.

Exemples de demandes :

- « Utilise $aster-documentation pour vérifier la cohérence du cadrage avec les règles et les DCU, sans modifier les fichiers. »
- « Utilise $aster-documentation pour répercuter cette réponse dans les documents concernés, en préservant les diagrammes protégés. »
- « Utilise $aster-documentation pour proposer les user stories stratégiques à partir du cadrage. »

Le [vérificateur documentaire](.agents/skills/aster-documentation/scripts/verifier_documentation.py) fonctionne avec Python 3.10 ou supérieur, sans dépendance supplémentaire. Depuis la racine du dépôt :

```sh
python3 .agents/skills/aster-documentation/scripts/verifier_documentation.py
```

Il contrôle l'existence des cibles des liens Markdown, les marqueurs de conflit Git, les noms et numéros des documents, leur présence dans le sommaire, les références aux règles de gestion, l'absence de texte hors diagramme dans les fichiers de diagrammes et les libellés des couples source Mocodo/rendu SVG. Il ne vérifie ni les ancres des liens, ni les cardinalités, ni la mise en page, ni la cohérence métier. Pour Mocodo, la présence des libellés ne prouve pas que les relations et cardinalités du rendu correspondent à la source. Les liens Markdown en raccourci sans référence explicite et les liens HTML ne sont pas contrôlés.

Les erreurs donnent un code de sortie non nul ; les avertissements demandent une vérification sans imposer de renumérotation. Les options `--json`, `--strict-warnings` et `--root CHEMIN` permettent respectivement une sortie structurée, un échec sur avertissement et le contrôle d'un autre dossier. Le vérificateur ne modifie aucun fichier. Les défauts déjà présents doivent être distingués des défauts introduits par le changement en cours.
