# Rédaction et mise en forme des livrables

Ce dossier contient les livrables mis en forme, remis aux cadres évaluateurs et au client : le dossier de spécifications des exigences (`DSE-ORION/`, PDF, annexes comprises), le dossier d’architecture technique (`DAT-ORION/`, PDF) et le dossier d’organisation (`DO-ORION/`, PDF, annexes comprises). Les règles ci-dessous s’appliquent à tous ; elles complètent celles d’[AGENTS.md](../AGENTS.md) (contenu cible, absence d’éléments du démonstrateur hors DAT, sources qui font foi).

## Sources et production

- Le contenu vient des documents de `docs/` : un livrable n’est jamais rédigé ou corrigé directement dans sa mise en forme. On corrige la source, puis on reproduit le livrable.
- Un livrable est un fichier unique : schémas et diagrammes y sont intégrés, sans renvoi à un autre fichier du dépôt.
- Le DAT est produit par `node .agents/skills/orion-documentation/scripts/dat-pdf.mts`, depuis la racine du dépôt, à partir de `docs/03-ARCHITECTURE/01-DOSSIER-ARCHITECTURE-TECHNIQUE.md` et des schémas de `docs/03-ARCHITECTURE/assets/`.
- Le DSE est produit par `node .agents/skills/orion-documentation/scripts/dse-pdf.mts`, depuis la racine du dépôt, à partir de `docs/02-ANALYSE/05-DOSSIER-SPECIFICATIONS-EXIGENCES.md`. Ses schémas sont rendus en vectoriel depuis les sources draw.io des diagrammes cités ; ses tableaux de cas d’utilisation et de règles sont établis depuis les fiches descriptives et les règles de gestion ; ses annexes reprennent les documents listés dans sa partie « Annexes ». Le premier lancement télécharge le moteur de rendu officiel de draw.io (version épinglée, empreinte vérifiée).
- Le DO est produit par `node .agents/skills/orion-documentation/scripts/do-pdf.mts`, depuis la racine du dépôt, à partir de `docs/04-ORGANISATION/05-DOSSIER-ORGANISATION.md` ; ses graphiques sont ceux de `docs/04-ORGANISATION/assets/` et ses annexes reprennent le backlog et le journal de bord.
- Éléments communs aux livrables (charte, page de garde, fiche, sommaire, pagination) : `livrable-pdf.mts`.
- Avant chaque remise, rendre le livrable en images et relire chaque page.

## Charte graphique

Charte commune à tous les livrables, issue de la [charte ORION](../design/charte-graphique/index.html) :

| Élément | Règle |
| --- | --- |
| Couleurs | Encre `#17243B` pour le texte, gris `#5B6475` pour les textes secondaires, Bleu Orion `#2563EB` pour les accents, nuit `#040B1E` pour la page de garde |
| Police | Segoe UI ; texte courant à 9,5 pt, tableaux à 8,5 pt ; jamais moins de 9 pt pour le texte courant |
| Logo | Logo officiel de `design/assets/logos/` (`orion-horizontal-inverse.svg` sur fond sombre) ; pas d’autre logotype |
| En-tête | « ✦ ORION · titre du document » à gauche, version et date à droite ; c’est le seul endroit où figure l’étoile dans les pages intérieures |
| Pied de page | Numéro de page « n / N », sans autre mention |
| Titres de chapitre | Numéro sur deux chiffres suivi du titre (« 06 Architecture cible »), souligné de Bleu Orion ; pas de bandeau ni de sous-titre qui répète le numéro ou le titre |
| Tableaux | En-tête encre, en petites capitales espacées, filet Bleu Orion ; lignes alternées `#F6F8FC` |
| Figures | Légende sous la figure : « Figure n – titre » |

## Page de garde

- Elle couvre toute la page, sans marge blanche.
- Elle porte le logo officiel, la définition du sigle (« Outil de Recensement, d’Intervention et d’Observation Numérique »), le titre du document et son sous-titre.
- Elle nomme l’équipe : « Équipe ASTER », puis chaque membre sous la forme grade abrégé, NOM, prénom, classés par grade (du plus élevé au moins élevé) puis par ordre alphabétique des noms :
  - SCH BAELDE Pierre-Louis
  - SCH VILBERT-TAHON Alexandre
  - SGT BONEY Brandon
  - SGT LE MAITRE Louis
  - SGT PHOMMAVONGSA Sacha
- Un cartouche donne la référence (`ORION-DSE`, `ORION-DAT`, `ORION-DO`…), la version et la date ; la diffusion figure en bas de page.
- Le texte est du texte, pas une image : la version et la date doivent pouvoir être mises à jour.

## Fiche du document et versions

- Une fiche du document suit la page de garde : projet, commanditaire, référence, version, rédaction, diffusion et, le cas échéant, périmètre et date de référence.
- Suivi des versions : soit une seule ligne pour la première édition (version 1.0), soit l’historique complet des versions remises. Jamais de mention « version remise », ni de message interne de travail.

## Sommaire et navigation

- Un sommaire paginé renvoie à toutes les parties du document, schémas compris ; chaque entrée est cliquable.
- Le PDF porte des signets reprenant les titres.

## Mise en page

- Format A4 portrait ; les schémas remplissent une page A4, en paysage ou, pour un schéma en hauteur, en portrait.
- Un schéma ne doit pas laisser de page presque vide dans le texte : le placer en fin de chapitre plutôt qu’au paragraphe qui y renvoie, avec un lien vers lui.
- Ne pas couper un tableau, une liste numérotée ou un paragraphe par un saut de page, sauf s’il ne tient pas sur une page. Une phrase qui introduit un tableau ou une liste reste sur la même page que lui.
- Aucun élément ne doit déborder de la largeur de la page : Chromium réduirait alors tout le document. Après une modification, contrôler la taille réelle de la police dans le PDF.
