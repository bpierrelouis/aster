# Instructions de travail — ASTER

Ces instructions s'appliquent à tout le dépôt.

## Sources et lectures ciblées

- Pour l'analyse et la conception, utiliser le sommaire et les parcours du `README.md`, puis lire les passages utiles des consignes, des entretiens et du cadrage. Ne pas déduire le besoin du seul code ou des diagrammes.
- Commencer par les noms de fichiers, titres et recherches ciblées (`rg`). Élargir si une dépendance, une incertitude ou le périmètre demandé le justifie ; ne pas relire intégralement la documentation à chaque tâche. Réutiliser les passages déjà lus dans le chat tant qu'ils sont disponibles et inchangés.
- Le cadrage présente les réponses en vigueur : la plus récente remplace les précédentes sur le même sujet ; les précisions compatibles restent applicables. Conserver les entretiens datés comme historique, sans modifier leur sens ni présenter les anciennes réponses comme des contradictions à arbitrer.
- Distinguer réponses recueillies, décisions validées, hypothèses, propositions et questions réellement ouvertes. Ne pas inventer de règle, de fonctionnalité ou de validation ; ne pas laisser ouverte une question déjà résolue.
- Pour le recueil, la rédaction, la synchronisation ou l'audit documentaire, utiliser le skill [aster-documentation](.agents/skills/aster-documentation/SKILL.md). Ses modèles sont des aides, pas des exigences.

## Classement et représentations

- Conserver l'ordre : consignes du sujet, cadrage, entretiens, puis analyse et diagrammes ; le glossaire est transversal. Les entretiens précèdent la conception dans les noms et le sommaire.
- Dans `docs/`, utiliser un préfixe numérique, un titre explicite en majuscules et des tirets. Choisir la position logique avant le numéro ; actualiser sommaire, liens et références après ajout, déplacement ou renommage.
- Les fichiers Markdown de diagrammes contiennent uniquement les diagrammes (blocs ou images) et leurs titres Markdown. Aucune prose, liste, légende annexe ni explication déplacée dans une note ou un commentaire du diagramme.
- Répartir l'information : définitions dans le glossaire, réponses et questions dans le cadrage, contraintes confirmées dans les règles de gestion, conventions de représentation ici. Avant de retirer une explication d'un diagramme, transférer toute précision pertinente manquante au document de référence.
- Ne pas modifier le contenu des premiers diagrammes de contexte et d'activité sans demande de mise à jour de l'utilisateur. Un renommage préserve leur contenu. Lors d'une mise à jour autorisée, appliquer les réponses en vigueur ; leur protection provisoire ne remet pas ces réponses en question.
- Placer les travaux non finalisés dans `docs/temporaire/`, avec un nom indiquant le statut de brouillon et la version connue. Ne pas présenter le MCD Merise proposé comme validé.

## Vérifications

- Pour les changements documentaires et audits concernés, exécuter le vérificateur décrit dans le README. Il contrôle la structure ; compléter par la relecture des sources et du sens métier.
- Vérifier classement, numérotation, sommaire, liens locaux et références aux anciens noms. Préserver les fichiers hors périmètre et le travail préexistant ; signaler séparément les défauts préexistants.
- Relire les changements et exécuter `git diff --check` avant livraison. Ne rapporter que les vérifications réellement effectuées.

## Git

- Consulter `git status` et les différences indexées et non indexées avant d'intervenir. Ne jamais effacer, annuler, remiser ou inclure du travail sans rapport pour obtenir un dépôt propre.
- Créer des commits uniquement sur demande ; cela autorise un enregistrement local, pas une publication. Ne pas amender, réécrire l'historique ou forcer une publication sans demande explicite.
- Faire de petits commits cohérents, une intention par commit, avec les liens et renommages nécessaires. Indexer explicitement les fichiers ou portions concernés ; éviter `git add .` et `git add -A` sans périmètre.
- Format : `type(portee): description`, portée facultative ; types `docs`, `feat`, `fix`, `refactor`, `test`, `chore`, `style` (forme seule). Titre français à l'infinitif, résultat concret, 72 caractères visés, sans point final ni formule vague. Corps facultatif : pourquoi, changements importants, contrôles effectués.
- Avant commit, relire `git diff --cached`, exécuter `git diff --cached --check` et les contrôles adaptés. Après commit, vérifier statut et dernier commit ; communiquer identifiant, titre et changements restants.
- Ne pas versionner secrets, environnements locaux, caches, dépendances installées ou sorties temporaires. Conserver les livrables et brouillons attendus aux emplacements prévus ; compléter les exclusions seulement si nécessaire.
- Pour une nouvelle branche, utiliser un nom court avec le préfixe `codex/`, sauf demande contraire.
