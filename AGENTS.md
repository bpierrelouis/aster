# Instructions de travail — ASTER

Ces instructions s'appliquent à l'ensemble du dépôt.

## Sources et ordre documentaire

- Lire le `README.md`, les consignes du sujet et les comptes rendus des entretiens avant de travailler sur l'analyse ou la conception.
- Toute analyse, règle fonctionnelle ou représentation doit s'appuyer sur les informations du sujet et des entretiens. Ne pas déduire le besoin des seuls diagrammes existants.
- Organiser la documentation selon ses dépendances : sujet et consignes, questions de cadrage, comptes rendus des entretiens, puis analyse et diagrammes.
- Les entretiens doivent toujours précéder les documents de conception qu'ils alimentent, dans la numérotation des fichiers comme dans le sommaire du README.
- Respecter la convention existante dans `docs/` : préfixe numérique, titre explicite en majuscules et mots séparés par des tirets. Choisir la position logique avant d'attribuer un numéro ; ne pas simplement ajouter le prochain numéro disponible.
- Lors d'un ajout, d'un déplacement ou d'un renommage, vérifier l'ordre global et mettre à jour les liens et références concernés.

## Fidélité aux entretiens

- Conserver tous les éléments recueillis, leur date et leur sens. La reformulation et la mise en page peuvent améliorer la lisibilité sans modifier le fond.
- Pour chaque sujet, la dernière réponse du client remplace les précédentes. Appliquer cette réponse dans le cadrage et les documents qui en dépendent ; ne pas laisser une question ouverte au motif qu’une ancienne réponse était différente.
- Les comptes rendus d’entretiens servent de trace historique : conserver les propos datés, même lorsqu’ils sont remplacés. Le document de cadrage présente les réponses en vigueur, sans juxtaposer les anciennes réponses comme des contradictions à arbitrer.
- Une réponse antérieure reste applicable si elle n’a pas été remplacée. Une précision récente complète les informations compatibles ; elle ne supprime pas les réponses sur d’autres sujets.
- Garder ouvertes uniquement les questions auxquelles aucune réponse suffisante n’a été apportée. Ne pas inventer de réponse à une question réellement non résolue.
- Distinguer les propos recueillis, les décisions validées, les hypothèses et les propositions. Ne pas transformer une question ou une possibilité en exigence acquise.
- Ne pas ajouter de règle métier ou de fonctionnalité qui ne provient pas des sources ou d'une demande explicite de l'utilisateur.

## Diagrammes et brouillons

- Consigne actuelle : ne pas modifier le contenu des premiers diagrammes de contexte et d'activité tant que l'utilisateur n'en demande pas la mise à jour. Leur renommage pour corriger l'ordre documentaire doit préserver leur contenu.
- Les diagrammes devront suivre les dernières réponses du client lors de leur mise à jour autorisée. Le maintien provisoire des premiers diagrammes ne remet pas en question les réponses en vigueur dans le cadrage.
- Placer les documents de travail non finalisés dans `docs/temporaire/`, avec un nom indiquant clairement leur statut de brouillon et leur version si elle est connue.
- Ne pas présenter le MCD Merise provisoire comme un modèle validé.

## Vérifications avant livraison

- Vérifier la cohérence du classement, de la numérotation et du sommaire.
- Vérifier les liens locaux des documents modifiés et rechercher les références aux anciens noms après un renommage.
- Vérifier que les documents hors du périmètre demandé et les modifications préexistantes de l'utilisateur sont préservés.
- Exécuter `git diff --check` et relire les changements avant de rendre compte du travail.

## Git et messages de commit

- Créer des commits uniquement sur demande de l'utilisateur. Une demande de commit autorise l'enregistrement local des changements concernés, pas leur publication distante.
- Avant toute opération, consulter `git status` et les différences indexées et non indexées pour identifier le périmètre et préserver le travail préexistant.
- Construire des commits cohérents et aussi petits que possible : une intention par commit, avec les documents, liens et renommages nécessaires à sa cohérence. Séparer les changements indépendants.
- Sélectionner explicitement les fichiers ou portions à indexer ; éviter `git add .` et `git add -A` sans périmètre. Ne pas embarquer des changements sans rapport avec la demande.
- Utiliser le format `type(portee): description`, avec une portée facultative et un type adapté : `docs`, `feat`, `fix`, `refactor`, `test`, `chore` ou `style`. Réserver `style` aux changements de forme sans effet fonctionnel.
- Rédiger le titre en français, avec un verbe à l'infinitif et un résultat concret ; viser 72 caractères maximum, sans point final. Éviter les messages vagues comme « mise à jour », « corrections » ou « divers ».
- Si nécessaire, ajouter un corps après une ligne vide pour expliquer le pourquoi, les changements importants et les vérifications réellement effectuées. Ne pas annoncer de validation non exécutée.
- Avant le commit, relire `git diff --cached`, exécuter `git diff --cached --check` et les vérifications adaptées au changement. Pour la documentation, contrôler les liens, les références et la numérotation.
- Ne pas versionner de secrets, fichiers locaux d'environnement, caches, dépendances installées ou sorties temporaires. Conserver les livrables et brouillons explicitement attendus aux emplacements prévus ; compléter les exclusions Git seulement si nécessaire.
- Ne pas effacer, annuler, remiser ou inclure du travail sans rapport pour obtenir artificiellement un dépôt propre. Ne pas réécrire l'historique, amender un commit ou forcer une publication sans demande explicite.
- Pour une nouvelle branche de travail, utiliser un nom court et descriptif avec le préfixe `codex/`, sauf convention explicitement demandée par l'utilisateur.
- Après le commit, vérifier `git status` et le dernier commit ; communiquer son identifiant, son titre et les éventuels changements restants. Viser un état propre dans le périmètre autorisé, sans supprimer le travail d'autrui.
