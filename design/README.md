# Design ORION

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 2.0 | 13/11/2026 | Ressource de préparation | Présenter l'identité ORION conforme à l'application et archiver les anciennes directions | [5 versions](../archive/README.md#design-readme) |
<!-- version:fin -->

Ce dossier rassemble l’identité visuelle en vigueur d’ORION et les maquettes de l’application. Les deux suivent l’état actuel de l’application : couleurs, mesures et composants proviennent de `application/frontend/src/workspace/styles/`, les ambiances de `application/shared/ambiance.ts`, la marque de `application/frontend/src/connexion/` et les icônes de `application/frontend/src/workspace/core/icons.ts`.

## Identité en vigueur

- [Charte graphique ORION 2.0](charte-graphique/index.html) : marque (étoile à quatre branches et logotype), palette (couleurs de charte, états métier, types de matériel, accents personnels), typographie (polices système, Marianne), iconographie, matériau verre, rayons, espacements, ombres et mouvements, composants communs, ambiances Orion et Minarm, chargement et mise en situation.
- [Maquettes de l’application](maquettes/index.html) : captures des écrans par module (connexion, tableaux de bord par profil, salles, matériels, remontées, supervision, administration, notifications, ambiances), avec le rôle de chaque écran et le profil concerné. Images dans `maquettes/captures/`.

## Ressources

- `assets/logos/orion-etoile.svg` : étoile ORION seule, en Bleu Orion.
- `assets/logos/orion-icone-application.svg` : icône d’application (étoile blanche sur carré nuit), identique à l’icône d’onglet de l’application.
- `assets/icons/` : icônes métier (grille 28), reprises telles quelles dans le jeu d’icônes de l’application.
- `assets/favicon.svg`, `assets/logos/orion-horizontal.svg` et `assets/logos/orion-horizontal-inverse.svg` : signature florale de la première direction, conservée pour la [présentation du 4 novembre](../presentations/2026-11-04-point-etape-client/index.html) qui l’emploie ; elle n’est plus l’identité de l’application.
- `MinDefConnect/` : références fournies le 6 novembre pour le parcours de connexion : [bouton d’accès](MinDefConnect/reference-bouton-acces-mindefconnect.png) et [formulaire de connexion](MinDefConnect/reference-formulaire-connexion-mindefconnect.png).

## Archives

Les directions et maquettes antérieures sont conservées dans les [archives](../archive/README.md) : direction florale ORION (`charte-graphique/index.html` 1.x et `charte-graphique-orion.html`), direction VIGIE non retenue, maquette de gestion des matériels, maquette « Inventory » et propositions A, B et C de tableau de bord. Les ressources qui ne servaient qu’à elles (logos VIGIE, animation de chargement florale) sont dans `archive/design-assets/`.
