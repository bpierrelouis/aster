# Fiche descriptive — Formateur

- **Statut :** proposée à partir des réponses en vigueur ; à présenter au client.
- **Profil :** formateur.
- **Rattachement :** une école.
- **Périmètre :** toutes les salles de son école, après sélection d'une salle ; aucune vue globale de supervision.
- **Finalité :** superviser les postes d'une salle et signaler les problèmes rencontrés sur les matériels.

## Périmètre fonctionnel

| Domaine | Capacités |
| --- | --- |
| Supervision | Consulter l'état des postes et leurs processus utilisateur ; arrêter manuellement un processus affiché |
| Alertes | Recevoir une alerte lorsqu'un processus blacklisté est détecté dans la salle supervisée |
| Remontées | Créer une remontée, suivre son statut, consulter et télécharger son propre PDF d'état des lieux |
| Notifications | Recevoir dans ASTER une notification lorsque le statut de l'une de ses remontées change |
| Exclusions | Aucun accès à la gestion du parc, à l'administration des postes, aux listes de processus, aux statistiques d'administration, aux comptes ASTER ou au traitement des remontées |

Les droits détaillés sont consolidés dans la [matrice des droits](12-MATRICE-DROITS.md).

## UC-FORM-01 — Superviser une salle et ses processus utilisateur

- **Objectif :** connaître l'état des postes d'une salle et intervenir sur les processus utilisateur.
- **Déclencheur :** le formateur sélectionne une salle de son école dans l'espace de supervision.
- **Préconditions :** le formateur est authentifié ; la salle appartient à son école ; les mécanismes Windows sont disponibles.

### Scénario nominal

1. Le formateur sélectionne une salle.
2. ASTER affiche les postes de cette salle et leur état connecté ou déconnecté.
3. Les données sont actualisées toutes les cinq secondes.
4. Le formateur sélectionne un poste connecté.
5. ASTER présente uniquement ses processus utilisateur avec leur nom, compte Windows, poste, salle, date de démarrage et classement.
6. Le formateur sélectionne un processus utilisateur et demande son arrêt.
7. ASTER transmet l'ordre au moyen des mécanismes Windows retenus et affiche le résultat.

### Variantes et limites

- Après trois collectes manquées, soit environ quinze secondes, un poste est considéré comme déconnecté et reste affiché sans processus.
- Les processus système ne sont ni présentés au formateur ni proposés comme cible d'arrêt.
- Un processus whitelisté reste visible sans historique.
- Un processus non référencé reste autorisé, visible et historisé.
- Un processus blacklisté est arrêté automatiquement sans confirmation ni justification.
- L'utilisateur du poste n'est pas prévenu avant l'arrêt automatique.

### Résultats attendus

- Le formateur dispose de l'état courant de la salle sélectionnée.
- L'arrêt manuel porte uniquement sur un processus utilisateur présenté dans ASTER.
- Le résultat de l'action est affiché.

### Questions ouvertes

- Mécanismes Windows, flux, comptes techniques et sécurisation des échanges.
- Gestion des échecs d'arrêt manuel et journalisation de cette action.
- Données supplémentaires à remonter et fonctionnement sur des segments réseau isolés.
- Contraintes internes ou juridiques liées à la surveillance de l'activité.

### Règles applicables

RG-19, RG-20, RG-25, RG-31 à RG-33, RG-44 à RG-49, RG-51 à RG-59 et RG-69.

## UC-FORM-02 — Consulter une alerte de processus blacklisté

- **Objectif :** prendre connaissance de la détection et de l'arrêt automatique d'un processus interdit dans la salle supervisée.
- **Déclencheur :** un processus blacklisté est détecté pendant la supervision d'une salle.
- **Préconditions :** le formateur supervise la salle concernée.

### Scénario nominal

1. ASTER classe le processus comme blacklisté et demande son arrêt automatique.
2. ASTER conserve l'historique prévu et crée une alerte destinée notamment au formateur qui supervise la salle.
3. À sa connexion, le formateur voit la notification de l'alerte.
4. Il consulte les informations disponibles sur la détection et le résultat de l'arrêt.

### Variantes et limites

- Aucun courriel n'est envoyé.
- Le traitement, l'acquittement ou la clôture d'une alerte ne sont pas définis.

### Résultats attendus

- Le formateur peut consulter l'alerte correspondant à la salle qu'il supervise.

### Questions ouvertes

- Niveaux de gravité, statuts et regroupement des alertes.
- Gestion du caractère lu ou non lu, acquittement et durée de conservation.

### Règles applicables

RG-37, RG-38, RG-53 à RG-56 et RG-69.

## UC-FORM-03 — Créer une remontée et suivre son avancement

- **Objectif :** déclarer un problème concernant un ou plusieurs matériels et suivre sa résolution.
- **Déclencheur :** le formateur constate un problème sur un matériel.
- **Préconditions :** le formateur est authentifié et peut sélectionner au moins un matériel de son école.

### Scénario nominal

1. Le formateur sélectionne un ou plusieurs matériels.
2. ASTER affiche leur localisation lorsqu'elle est renseignée.
3. Le formateur saisit la description obligatoire et transmet la remontée.
4. ASTER enregistre le formateur comme auteur et attribue un statut commun à toute la remontée.
5. ASTER génère automatiquement le PDF d'état des lieux avec les informations confirmées.
6. Le formateur peut consulter et télécharger ce PDF.
7. Il consulte ensuite l'avancement de ses propres remontées.
8. Lorsqu'un statut change, ASTER crée une notification et l'affiche à sa connexion.

### Variantes et limites

- Une remontée peut concerner plusieurs matériels mais possède un seul statut.
- Un matériel en stock ne possède pas de localisation de salle.
- Les statuts possibles sont « en attente », « remplacé » et « corrigé » ; la valeur initiale et le cycle complet ne sont pas définis.
- Le formateur ne traite pas lui-même la remontée.
- Il ne consulte ni ne télécharge les PDF créés par d'autres auteurs.
- Aucun courriel n'est envoyé.

### Résultats attendus

- La remontée conserve un auteur unique et les matériels concernés.
- Le PDF est généré automatiquement.
- Le formateur suit uniquement ses propres remontées et reçoit leurs notifications de changement de statut.

### Questions ouvertes

- Mode d'obtention du type de problème inclus dans le PDF.
- Catégories, priorités, pièces jointes et complément après création.
- Modèle, numérotation, signature, archivage et immutabilité du PDF.
- Recherche, filtres, notifications lues et conservation des PDF.

### Règles applicables

RG-11 à RG-14, RG-21, RG-23, RG-34 à RG-38, RG-63, RG-66 et RG-69.

## Besoins en interface

- Sélection d'une salle avant l'affichage des postes.
- Vue des postes connectés et déconnectés.
- Liste des processus utilisateur avec les informations confirmées.
- Action d'arrêt manuel et affichage du résultat.
- Affichage des alertes de processus blacklistés à la connexion.
- Formulaire de remontée avec sélection de plusieurs matériels.
- Espace limité aux remontées du formateur, avec statut et accès au PDF.
- Aucune vue globale de supervision ni tableau de bord formateur confirmé.

## Contraintes transversales

- Application web utilisée avec les versions de Firefox installées sur les postes de l'équipe.
- Réseau interne NP disposant d'un accès à Internet.
- Aucun agent ASTER installé sur les postes ; utilisation des mécanismes Windows existants.
- Authentification via MindefConnect ; modalités d’intégration à préciser (cadrage § 18).
- Un seul profil par utilisateur.

## Sources

[Consignes du projet](01-CONSIGNES.md), [cadrage §§ 3 et 10 à 19](02-CADRAGE.md), [règles de gestion](04-REGLES-DE-GESTION.md), [DCU — Supervision des postes](10-DCU-SUPERVISION-POSTES.md), [DCU — Remontées utilisateur](11-DCU-REMONTEES-UTILISATEUR.md) et [matrice des droits](12-MATRICE-DROITS.md).
