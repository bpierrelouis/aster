# Fiche descriptive — Formateur

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 1.4 | 12/11/2026 | Production destinée à la remise | Renommer ASTER en ORION dans tout le dépôt | [5 versions](../archive/README.md#14-fiche-descriptive-formateur) |
<!-- version:fin -->

- **Statut :** établie à partir des décisions en vigueur.
- **Profil :** formateur.
- **Rattachement :** une école.
- **Périmètre :** toutes les salles de son école, après sélection d'une salle ; aucune vue globale de supervision.
- **Finalité :** superviser les postes d'une salle et signaler les problèmes rencontrés sur les matériels.

## Périmètre fonctionnel

| Domaine | Capacités |
| --- | --- |
| Salles | Consulter les salles par bâtiment et par étage, et le matériel de chaque salle, sans modification |
| Supervision | Choisir une salle de son école, consulter l'état de ses postes et leurs processus utilisateur ; demander l'arrêt d'un processus affiché |
| Alertes | Consulter les détections de processus blacklistés et non référencés de la salle choisie, avec le résultat de l'arrêt automatique |
| Remontées | Créer une remontée, y compris depuis une salle ; suivre ses propres remontées ; consulter, télécharger et imprimer son propre PDF d'état des lieux |
| Notifications | Recevoir dans ORION une notification lorsque le statut de l'une de ses remontées change |
| Tableau de bord | Consulter et composer son tableau de bord personnel (ses remontées en attente, salles de l'école) |
| Exclusions | Aucun accès à l'inventaire, à la modification du parc, à l'administration des postes, aux listes de processus, aux statistiques, aux comptes ORION ni au traitement des remontées |

Les droits détaillés sont consolidés dans la [matrice des droits](12-MATRICE-DROITS.md).

## UC-FORM-01 — Superviser une salle et ses processus utilisateur

- **Objectif :** connaître l'état des postes d'une salle et intervenir sur les processus utilisateur.
- **Déclencheur :** le formateur sélectionne une salle de son école dans l'espace de supervision.
- **Préconditions :** le formateur est authentifié ; la salle appartient à son école ; la solution d’administration à distance est disponible.

### Scénario nominal

1. Le formateur sélectionne une salle.
2. ORION affiche tous les postes de cette salle et leur état connecté ou déconnecté.
3. Les données sont actualisées automatiquement en quelques secondes.
4. Pour chaque poste connecté, ORION présente ses processus utilisateur en cours, avec leur nom, le compte Windows et leur classement.
5. Le formateur peut rechercher un poste ou un processus.
6. Il demande l'arrêt d'un processus utilisateur ; ORION indique que l'arrêt est demandé.
7. ORION transmet l'ordre au poste, qui l'exécute ; le processus disparaît de la liste une fois arrêté.

### Variantes et limites

- Un poste sans remontée depuis trente secondes est considéré comme déconnecté et reste affiché sans processus.
- Les processus système ne sont ni présentés au formateur ni proposés comme cible d'arrêt.
- Un processus whitelisté reste visible sans historique.
- Un processus non référencé reste autorisé, visible et historisé.
- Un processus blacklisté est arrêté automatiquement sans confirmation ni justification.
- L'utilisateur du poste n'est pas prévenu avant l'arrêt automatique.
- Un seul arrêt peut être demandé à la fois pour un même processus.

### Résultats attendus

- Le formateur dispose de l'état courant de la salle sélectionnée.
- L'arrêt manuel porte uniquement sur un processus utilisateur présenté dans ORION.
- L'état de la demande d'arrêt est affiché.

### Questions ouvertes

- Solution d’administration à distance, flux, comptes techniques et sécurisation des échanges.
- Présentation au formateur de l'échec d'un arrêt manuel.
- Données supplémentaires à remonter et fonctionnement sur des segments réseau isolés.
- Contraintes internes ou juridiques liées à la surveillance de l'activité.

### Règles applicables

RG-19, RG-20, RG-25, RG-31 à RG-33, RG-44 à RG-49, RG-51 à RG-54, RG-56 à RG-59 et RG-69.

## UC-FORM-02 — Consulter les détections de processus d'une salle

- **Objectif :** prendre connaissance des processus interdits et non référencés détectés dans une salle, et du résultat de l'arrêt automatique.
- **Déclencheur :** le formateur ouvre les alertes de supervision.
- **Préconditions :** le formateur a choisi une salle de son école.

### Scénario nominal

1. Le formateur choisit la salle.
2. ORION liste les détections de cette salle : processus, classement, poste, salle, compte Windows, date de détection et résultat (arrêt réussi, en échec ou en cours pour un processus blacklisté, historisé pour un processus non référencé).
3. Il peut filtrer par poste ou processus.

### Variantes et limites

- Le formateur ne reçoit pas de notification de processus blacklisté ; il consulte les détections de la salle choisie.
- Aucun courriel n'est envoyé.
- Le traitement, l'acquittement ou la clôture d'une détection ne sont pas définis.

### Résultats attendus

- Le formateur peut consulter les détections de la salle qu'il supervise.

### Questions ouvertes

- Niveaux de gravité, statuts et regroupement des détections.
- Acquittement et durée de conservation.

### Règles applicables

RG-38, RG-52 à RG-54, RG-56 et RG-69.

## UC-FORM-03 — Créer une remontée et suivre son avancement

- **Objectif :** déclarer un problème concernant un ou plusieurs matériels et suivre sa résolution.
- **Déclencheur :** le formateur constate un problème sur un matériel.
- **Préconditions :** le formateur est authentifié et peut sélectionner au moins un matériel de son école.

### Scénario nominal

1. Le formateur choisit une salle par bâtiment, ou le stock, puis un ou plusieurs matériels ; depuis une salle, les matériels sélectionnés sont repris.
2. ORION affiche la localisation de chaque matériel lorsqu'elle est renseignée.
3. Il choisit éventuellement un type de problème (ne s'allume pas, pas d'image, connexion, casse, fonctionnement anormal, autre) et saisit la description obligatoire.
4. ORION attribue le numéro de la remontée, enregistre le formateur comme auteur et le statut « en attente ».
5. Le formateur peut consulter, télécharger ou imprimer le PDF d'état des lieux, qu'ORION génère à chaque demande avec les informations actuelles de la remontée.
6. Il suit l'avancement et l'historique de ses propres remontées.
7. Lorsqu'un statut change, il reçoit une notification dans ORION.

### Variantes et limites

- Une remontée peut concerner plusieurs matériels de son école mais possède un seul statut.
- Un matériel en stock ne possède pas de localisation de salle.
- Les statuts possibles sont « en attente », « remplacé » et « corrigé » ; une remontée traitée ne change plus de statut.
- Sans type de problème choisi, la remontée est classée « autre ».
- Le formateur ne traite pas lui-même la remontée.
- Il ne consulte ni ne télécharge les PDF créés par d'autres auteurs.
- Aucun courriel n'est envoyé.

### Résultats attendus

- La remontée conserve un auteur unique et les matériels concernés.
- Le PDF est généré à chaque demande, sans être conservé.
- Le formateur suit uniquement ses propres remontées et reçoit leurs notifications de changement de statut.

### Questions ouvertes

- Priorités, pièces jointes et complément après création.
- Signature du PDF.

### Règles applicables

RG-11 à RG-14, RG-21, RG-23, RG-34 à RG-38, RG-63, RG-64, RG-66 et RG-69.

## Besoins en interface

- Vue des salles par bâtiment et par étage, avec le matériel de chaque salle et une action de signalement.
- Choix d'une salle, vue des postes connectés et déconnectés et de leurs processus, action d'arrêt avec son état.
- Liste des détections de la salle choisie.
- Formulaire de remontée avec choix de la salle ou du stock et sélection de plusieurs matériels.
- Espace limité aux remontées du formateur, avec statut, suivi et accès au PDF.
- Affichage des notifications dans ORION.
- Tableau de bord personnel composable ; aucune vue globale de supervision.

## Contraintes transversales

- Application web utilisée avec les versions de Firefox installées sur les postes de l'équipe.
- Réseau interne NP disposant d'un accès à Internet.
- Authentification via MindefConnect ; modalités d’intégration à préciser (cadrage § 18).
- Un seul profil par utilisateur.

## Sources

[Consignes du projet](01-CONSIGNES.md), [cadrage §§ 3 et 10 à 19](02-CADRAGE.md), [règles de gestion](04-REGLES-DE-GESTION.md), [DCU — Gestion du parc](08-DCU-GESTION-PARC.md), [DCU — Supervision des postes](10-DCU-SUPERVISION-POSTES.md), [DCU — Remontées utilisateur](11-DCU-REMONTEES-UTILISATEUR.md) et [matrice des droits](12-MATRICE-DROITS.md).
