# Revue de modélisation ORION

Ces critères vérifient la traduction des sources ; ils n'ajoutent aucune fonctionnalité.

## Critères communs

- Définir le périmètre, les acteurs et les règles confirmées avant de dessiner.
- Employer les termes du glossaire ; signaler les termes non définis.
- Distinguer rôle applicatif, utilisateur authentifié et utilisateur de session supervisée.
- Vérifier les droits action par action ; un acteur abstrait d'un DCU n'ajoute pas un profil.
- Comparer source éditable et rendu ; ne pas choisir silencieusement une nouvelle référence.
- Laisser les styles Mermaid suivre le thème du lecteur, sauf demande explicite contraire.
- Conserver les diagrammes et les titres Markdown qui les identifient ou les organisent dans les fichiers qui leur sont consacrés, sans texte explicatif. Placer les définitions dans le glossaire, les questions et limites dans le cadrage et les contraintes confirmées dans les règles de gestion. Ne pas ajouter de notes ou commentaires explicatifs dans le diagramme pour contourner cette séparation.

## UML : cas d'utilisation, activités et contexte

- Un cas exprime un objectif d'acteur, plutôt qu'un écran ou une étape technique.
- `include` désigne un comportement nécessaire à l'exécution du cas appelant ; ce n'est pas une simple navigation fréquente.
- `extend` ajoute un comportement conditionnel à un cas de base complet. Préciser condition et point d'extension ; orienter la flèche de l'extension vers la base.
- Une généralisation implique un héritage des participations : vérifier les droits transmis.
- Mermaid peut servir d'approximation graphique ; une légende n'en fait pas une notation UML formellement complète.
- Vérifier la frontière : un agent peut être interne à la suite et externe au périmètre de l'application web.
- Vérifier responsabilités, conditions et issues décrites par les sources. Ne pas ajouter une confirmation, un statut, une notification ou une validation qui constituerait une nouvelle règle.
- Une simulation concerne uniquement les éléments explicitement simulés ; elle ne supprime pas les composants confirmés.

## MCD Merise

- Partir des objets et relations durables ; distinguer conception et choix de tables ou de clés étrangères.
- Justifier les cardinalités par une règle ou une source ; conserver les cardinalités inconnues comme questions.
- Examiner rattachements géographiques et exclusivité : plusieurs associations facultatives ne garantissent pas une localisation unique.
- Vérifier qu'un événement concernant plusieurs objets peut être regroupé et identifié : une association binaire ne représente pas nécessairement une remontée commune à plusieurs matériels.
- Pour une association ternaire d'exécution, vérifier si plusieurs occurrences du même triplet doivent être distinguées dans le temps. Signaler le besoin d'identité sans modifier hors périmètre un modèle validé ou protégé.
- Examiner les données d'historique requises : identité, date, contexte et résultat. Une donnée temporairement visible peut devoir être conservée dans l'historique.
- Une restriction de représentation, par exemple l'exclusion des booléens, ne supprime pas le besoin correspondant.
- Les décisions d'ORION évoluent : ne pas figer ici une ancienne définition de matériel, poste, session ou remontée.
