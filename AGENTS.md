# Instructions de travail — ASTER

Ces instructions s'appliquent à tout le dépôt.

## Sous-agents

- L'utilisateur autorise le recours autonome à autant de sous-agents que nécessaire, dans les limites techniques disponibles, sans demander de confirmation supplémentaire. Déléguer et paralléliser les tâches lorsque cela aide à les mener à bien ; les mêmes consignes et limites d'autorisation s'appliquent à tous les sous-agents.

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

## Livrables remis et documents internes

- Distinguer systématiquement la destination du document et son statut de validation. Le classement des fichiers destinés à la remise aux cadres évaluateurs, des sources et des documents internes est défini dans le README. Un document destiné à être remis n’est pas pour autant validé.
- Les productions destinées à la remise (glossaire, règles de gestion, modèles, diagrammes, matrice des droits et fiches descriptives) décrivent le fonctionnement cible en production. Ne pas y intégrer les décisions de réalisation du démonstrateur : comptes de test, mots de passe vides, Keycloak local de substitution, simulations, limitations du prototype ou consignes de lancement.
- Décrire la connexion cible via MindefConnect. Ne pas transformer une facilité de démonstration en règle métier, en contrainte de sécurité ou en élément de l’architecture de production. Ne pas affirmer qu’une fonctionnalité est déjà implémentée ni qu’une décision encore ouverte est validée.
- Conserver les modalités du démonstrateur, ses comptes et sa configuration dans `application/README.md` et dans le code/configuration de développement. Le cadrage et les entretiens sont des sources de travail internes ; préserver l’historique des entretiens. Ne pas recopier les identifiants de démonstration dans les livrables ni dans le README général.
- L’interface présentée aux utilisateurs suit le parcours cible : aucun badge de démonstrateur, liste de comptes de test, message de simulation ou indication de mot de passe vide. Les limites de réalisation sont documentées en interne ; les messages d’interface restent exacts et ne prétendent pas réaliser une opération indisponible.
- Avant une remise, sélectionner les productions prévues dans le README et leurs ressources nécessaires. Ne pas exporter tout le dépôt ou tout `docs/` comme si chaque fichier était un livrable. Relire les textes, titres, diagrammes, captures et aides pour vérifier l’absence d’informations propres au démonstrateur.

## Application

- Le guide de référence du code est [application/README.md](application/README.md) : modes de lancement, comptes de démonstration, tables, API des postes, tests. Le tenir à jour à chaque évolution du code ; sauf demande contraire, ne pas modifier la documentation hors de `application/` pour une tâche de code.
- Deux modes partagent les mêmes règles serveur (`backend/workspace.js`) : application connectée (`npm run infra:up` puis `npm run dev`) et interface seule (`npm run dev:ui`, sans Docker). Toute règle métier s’écrit côté serveur et doit fonctionner dans les deux modes. Les deux utilisent le port 5173 : ne jamais arrêter un processus lancé par l’utilisateur pour libérer un port ; demander ou utiliser un autre port.
- Avec l’infrastructure, aucune simulation dans le parcours des données : PostgreSQL pour les données métier, stockage S3 pour les états des lieux, Keycloak pour l’identité. Seuls les postes Windows sont émulés (`backend/agents.js`), et uniquement au travers de l’API réelle `/api/agent`.
- Identité : pas de LDAP. Keycloak tient lieu de MindefConnect (décision du 6 novembre) et ne fait qu’authentifier. Le profil, l’école et l’état actif sont portés par le compte ASTER (`aster_compte`) ; les rôles Keycloak ne sont pas lus. La création d’identités dans Keycloak (`backend/identity-provisioning.js`) est une facilité du démonstrateur, désactivée en production.
- Valeurs d’autorité fixées par le serveur, jamais par le navigateur : identifiant ASTER, numéro de remontée, auteur, dates, historique, suivi des interventions. Un navigateur ne voit qu’une partie des données : ne jamais calculer côté client une valeur unique à partir de ce qu’il voit.
- Processus, détections et installations ne sont alimentés que par les postes ; un utilisateur demande une intervention (opération), le poste l’exécute et renvoie le résultat. Les écritures concurrentes sont fusionnées élément par élément (`rebase`) : ne pas réintroduire de contrôle global de révision qui bloquerait les utilisateurs pendant l’activité des postes.
- Changer la forme des données de départ impose d’incrémenter `SEED_VERSION` (`frontend/workspace/core/seed.js`) : la base et le fichier du mode interface seule sont alors régénérés.
- Stockage S3 local : SeaweedFS (les images MinIO ne sont plus distribuées publiquement). Épingler toute image ou dépendance sur une version exacte.
- Interface : pas de doublon d’action (une action à un seul endroit par écran), conformément aux principes Apple appliqués au projet ; noms des salles toujours lisibles dans la vue éclatée, salles en ordre alphabétique et de hauteur fixe. Aucun libellé de démonstration ou domaine `.local` dans l’interface.

## Conception du code

- Appliquer le skill [karpathy-guidelines](.agents/skills/karpathy-guidelines/SKILL.md) : hypothèses explicites, solution la plus simple, changements limités à la demande, critères de réussite vérifiés.
- KISS : la solution la plus simple qui répond au besoin réel ; pas de configuration, d'abstraction ni de cas imaginaires non demandés.
- DRY : une règle, un format ou un élément d'interface n'existe qu'à un endroit. Dates et nombres dans `core/format.js` ; éléments d'affichage partagés dans `widgets/parts.jsx` ; fenêtres, confirmations et notifications dans `ui/overlays.jsx`. Factoriser à partir de la deuxième occurrence d'une même intention ; deux rendus qui se ressemblent mais n'ont pas le même rôle restent séparés (une petite répétition vaut mieux qu'une abstraction fausse).
- SOLID, appliqué aux composants : une responsabilité par module (données et règles dans `core/`, affichage dans `views/`, `widgets/` et `ui/`) ; un écran qui dépasse environ 300 lignes est découpé par sous-partie (scène, liste, panneau, formulaires) ; on étend par ajout (catalogue de widgets, routes) plutôt qu'en modifiant les modules communs.
- Arbitrage : dans une tâche, factoriser le code qu'on écrit ou modifie ; signaler, sans le corriger, un défaut de conception hors du périmètre demandé. Un nettoyage plus large fait l'objet d'une demande ou d'une proposition explicite, vérifiée par les mêmes tests.
- Cohérence de l'interface React : rendu en JSX uniquement (pas de HTML en chaîne) ; formulaires en `<form onSubmit>` avec bouton `submit` (Entrée enregistre partout) ; attributs `data-*` réservés à ce qu'utilisent le CSS, les tests ou les infobulles ; navigation par `react-router`, une adresse par écran.
- Un travail réparti entre sous-agents suit les mêmes conventions ; l'agent principal harmonise les écarts avant livraison.

## Vérifications

- Pour le code de `application/` : `npm test`, `npm run build`, `npm run test:ui`, `npm run test:workspace` ; avec l’infrastructure et `npm run dev` démarrés, `npm run test:e2e`. Contrôler les écrans modifiés par des captures. Les tests créant des données doivent pouvoir être rejoués ; supprimer les artefacts de test créés (schémas, compartiments) une fois inutiles.
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

## Graphify

- Le skill `$graphify` est regroupé dans `.agents/skills/graphify/`. L’outil est installé hors du dépôt par le script multiplateforme `.agents/skills/graphify/scripts/graphify.py --install` (avec `py -3` sous Windows, `python3` sous Linux/macOS). Transmettre ses commandes à ce script sans activer d’environnement.
- Pour explorer le code, si `graphify-out/graph.json` existe et est à jour, commencer par une requête ciblée (`query`, `path`, `explain`) lorsque cela aide à localiser les dépendances. Vérifier les conclusions dans les fichiers sources ; compléter par `rg` si le graphe est incomplet, obsolète ou insuffisant.
- Sans graphe, conserver les recherches ciblées ordinaires. Construire le graphe lorsque le volume de code ou les explorations répétées le justifient ; après une modification de code indexé, le mettre à jour avec le script et les arguments `update .`.
- Le graphe est un outil de navigation, pas une source de validation métier. Les règles de lecture, de chronologie et de protection documentaire ci-dessus restent prioritaires sur les consignes génériques du skill.
- `graphify-out/` reste local et exclu de Git. L'analyse sémantique des documents utilise un modèle ; elle ne fait pas partie de l'installation et ne doit pas être lancée automatiquement pour une simple recherche.
