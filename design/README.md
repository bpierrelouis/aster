# Design ORION

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 2.2 | 13/11/2026 | Ressource de préparation | Icônes métier en Bleu Orion, captures compressées | [7 versions](../archive/README.md#design-readme) |
<!-- version:fin -->

Ce dossier rassemble l’identité visuelle en vigueur d’ORION et les maquettes de l’application. Les deux suivent l’état actuel de l’application : couleurs, mesures et composants proviennent de `application/frontend/src/workspace/styles/`, les ambiances de `application/shared/ambiance.ts`, la marque de `application/frontend/src/connexion/` et les icônes de `application/frontend/src/workspace/core/icons.ts`.

## Identité en vigueur

- [Charte graphique ORION 2.0](charte-graphique/index.html) : marque (étoile à quatre branches et logotype), palette (couleurs de charte, états métier, types de matériel, accents personnels), typographie (polices système, Marianne), iconographie, matériau verre, rayons, espacements, ombres et mouvements, composants communs, ambiances Orion et Minarm, chargement et mise en situation.
- [Maquettes de l’application](maquettes/index.html) : les 37 écrans par module (connexion, tableaux de bord par profil, salles, matériels, remontées, supervision, administration, notifications, ambiances), avec le rôle de chaque écran et le profil concerné. Chaque écran est présenté en maquette simplifiée, à gauche, à côté de sa capture, à droite (l’une sous l’autre sur écran étroit). Captures dans `maquettes/captures/`, maquettes simplifiées dans `maquettes/simplifiees/`, sous le même nom.

## Maquettes simplifiées

- Fil de fer basse fidélité de chaque capture : zones de navigation, cartes, champs, boutons et libellés principaux ; les données sont remplacées par des blocs gris.
- Conventions communes : cadre 1440 × 900, grille de l’application (menu latéral de 120 px, contenu de 164 à 1400 px, quatre colonnes de 295 px ou deux de 609 px, gouttière de 18 px), palette neutre de gris (fond `#F4F4F5`, surfaces blanches, traits `#D4D4D8`, blocs `#E4E4E7` et `#D4D4D8`, valeurs `#A1A1AA`, élément actif `#52525B`), police Inter (repli Arial). Les ambiances sombres reprennent les mêmes gris inversés ; l’ambiance Minarm remplace l’étoile par un médaillon.
- Importation dans Figma : glisser le fichier `.svg` sur le canevas, ou Fichier > Importer. Chaque fichier devient un cadre nommé d’après l’écran ; ses groupes sont nommés par zone (« Menu latéral », « Onglets », « Barre d’outils », cartes, tableaux, fenêtres) et ses textes restent modifiables. Aucun style externe, filtre ni image intégrée.

## Ressources

- `assets/logos/orion-etoile.svg` : étoile ORION seule, en Bleu Orion.
- `assets/logos/orion-icone-application.svg` : icône d’application (étoile blanche sur carré nuit), identique à l’icône d’onglet de l’application.
- `assets/icons/` : icônes métier (grille 28, trait Bleu Orion `#2563EB`), reprises telles quelles dans le jeu d’icônes de l’application.
- `assets/logos/orion-horizontal.svg` et `assets/logos/orion-horizontal-inverse.svg` : signature horizontale, étoile ORION à gauche du nom (étoile Bleu Orion et texte encre sur fond clair ; étoile blanche à lueur bleue et texte blanc sur fond sombre).
- `assets/favicon.svg` : étoile Bleu Orion sur carré clair, déclinaison claire de l’icône d’application.
- Ces trois fichiers, qui portaient la fleur de la première direction, sont employés par la [présentation du 4 novembre](../presentations/2026-11-04-point-etape-client/index.html) ; la fleur reste consultable dans les archives.
- `MinDefConnect/` : références fournies le 6 novembre pour le parcours de connexion : [bouton d’accès](MinDefConnect/reference-bouton-acces-mindefconnect.png) et [formulaire de connexion](MinDefConnect/reference-formulaire-connexion-mindefconnect.png).

## Archives

Les directions et maquettes antérieures sont conservées dans les [archives](../archive/README.md) : direction florale ORION (`charte-graphique/index.html` 1.x et `charte-graphique-orion.html`), direction VIGIE non retenue, maquette de gestion des matériels, maquette « Inventory » et propositions A, B et C de tableau de bord. Les ressources qui ne servaient qu’à elles (logos VIGIE, animation de chargement florale) sont dans `archive/design-assets/`.
