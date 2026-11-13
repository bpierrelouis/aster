# Fiche descriptive — Gestionnaire

- **Statut :** proposée à partir des réponses en vigueur ; à présenter au client.
- **Profil :** gestionnaire.
- **Rattachement :** une école.
- **Périmètre :** toutes les données de son école, sans restriction à un bâtiment.
- **Finalité :** maintenir l'inventaire du parc et traiter les remontées utilisateur.

## Périmètre fonctionnel

| Domaine | Capacités |
| --- | --- |
| Parc matériel | Créer, rechercher, consulter et modifier un matériel ; gérer le stock ; affecter ou déplacer un ou plusieurs matériels ; importer de nouveaux matériels en JSON |
| Suppression | Interdite au gestionnaire |
| Tableaux de bord | Consulter le tableau de bord du parc et celui des remontées |
| Remontées | Consulter et télécharger les PDF, traiter les remontées et recevoir une notification à leur création |
| Garanties | Renseigner la date de fin, consulter les indicateurs et recevoir les alertes si la fonctionnalité optionnelle est retenue |
| Administration et supervision | Aucun droit d'administration des postes, de supervision des processus, de gestion des listes ou de gestion des comptes ASTER |

Les droits détaillés sont consolidés dans la [matrice des droits](12-MATRICE-DROITS.md).

## UC-GEST-01 — Gérer le parc matériel

- **Objectif :** maintenir un inventaire fiable et connaître la localisation des équipements de l'école.
- **Déclencheur :** un matériel doit être enregistré, retrouvé, corrigé, affecté ou déplacé.
- **Préconditions :** le gestionnaire est authentifié ; les salles utilisées comme destinations appartiennent à son école.

### Scénario nominal

1. Le gestionnaire recherche un matériel ou ouvre la liste du parc.
2. ASTER limite les résultats à son école.
3. Le gestionnaire consulte une fiche, crée un matériel ou modifie ses informations.
4. Pour une création, il renseigne le modèle, la date de réception et l'état hors service ; la marque et le numéro de série restent facultatifs.
5. ASTER attribue automatiquement l'identifiant interne et enregistre le matériel.
6. Le gestionnaire peut ensuite affecter ou déplacer un ou plusieurs matériels vers une salle de son école.
7. ASTER applique immédiatement l'affectation ou le déplacement.

### Variantes et limites

- Un matériel peut rester en stock sans localisation.
- L'état est limité à « hors service : oui/non » et vaut « non » par défaut à la création.
- L'import JSON applique immédiatement les données, sans validation métier préalable.
- Le gestionnaire ne peut pas supprimer un matériel.
- Aucun historique des mouvements n'est exigé dans le périmètre confirmé.
- Si la gestion des garanties est retenue, le gestionnaire peut renseigner la date de fin. Une notification est créée six mois avant l'échéance et le matériel est signalé hors garantie à l'échéance.

### Résultats attendus

- Le matériel possède un identifiant ASTER et respecte les données obligatoires.
- Il est affecté au maximum à une salle ou reste en stock.
- Une opération peut porter sur plusieurs matériels.

### Questions ouvertes

- Critères de recherche, filtres, tris, pagination et exports.
- Schéma JSON, contrôles techniques, doublons et échecs partiels.
- Parcours de remise en stock et traitement d'une affectation partiellement échouée.
- Conditions empêchant la modification d'un matériel déjà lié à une remontée.

### Règles applicables

RG-03 à RG-10, RG-16 à RG-18, RG-25 à RG-29 et RG-69.

## UC-GEST-02 — Consulter et traiter les remontées

- **Objectif :** suivre les problèmes déclarés sur les matériels et leur résolution.
- **Déclencheur :** une nouvelle remontée est créée ou une remontée doit être traitée.
- **Préconditions :** le gestionnaire est authentifié ; la remontée appartient au périmètre de son école.

### Scénario nominal

1. Lorsqu'une remontée est créée, ASTER crée une notification destinée au gestionnaire.
2. La notification est affichée dans ASTER à la connexion de son ou ses destinataires.
3. Le gestionnaire ouvre le tableau de bord ou la liste des remontées.
4. Il consulte la remontée, les matériels concernés, leur localisation éventuelle et le PDF d'état des lieux.
5. Il peut télécharger le PDF.
6. Pour la transition explicitement confirmée, il fait passer une remontée de « en attente » à « remplacé ».
7. ASTER enregistre le statut commun à toute la remontée et crée la notification destinée à son auteur formateur.

### Variantes et limites

- Une remontée peut concerner plusieurs matériels mais possède un statut unique.
- Les statuts possibles sont « en attente », « remplacé » et « corrigé ».
- Le gestionnaire ne crée pas de remontée dans le périmètre actuellement confirmé.
- Aucun courriel n'est envoyé.
- La valeur initiale du statut et les transitions relatives à « corrigé » ne sont pas définies.

### Résultats attendus

- Le gestionnaire peut consulter et télécharger tous les PDF de son école.
- Le statut modifié s'applique à l'ensemble de la remontée.
- L'auteur formateur est informé dans ASTER lors du changement de statut.

### Questions ouvertes

- Désignation du ou des gestionnaires notifiés lorsqu'une école en compte plusieurs.
- Qualification, affectation à un intervenant, priorités et délais de traitement.
- Cycle complet des statuts, doublons et pièces jointes.
- Indicateurs, filtres et règles de calcul du tableau de bord.

### Règles applicables

RG-11 à RG-14, RG-23 à RG-25, RG-34 à RG-38, RG-66, RG-67 et RG-69.

## IHM issues de la maquette

Les écrans ci-dessous sont ceux du [démonstrateur de gestion des matériels](../design/maquettes/gestion-materiels.html).

### Tableau de bord du parc

![Tableau de bord du parc dans la maquette ASTER](assets/fiches-descriptives/IHM-MAQUETTE-TABLEAU-DE-BORD.png)

### Liste des matériels

![Liste des matériels dans la maquette ASTER](assets/fiches-descriptives/IHM-MAQUETTE-LISTE-MATERIELS.png)

### Ajout d'un matériel

![Ajout d'un matériel dans la maquette ASTER](assets/fiches-descriptives/IHM-MAQUETTE-AJOUT-MATERIEL.png)

### Fiche matériel

![Fiche d'un matériel dans la maquette ASTER](assets/fiches-descriptives/IHM-MAQUETTE-FICHE-MATERIEL.png)

### Affectation

![Affectation des matériels dans la maquette ASTER](assets/fiches-descriptives/IHM-MAQUETTE-AFFECTATION.png)

## Besoins en interface

- Tableau de bord du parc avec état des stocks et filtre par salle.
- Liste, recherche et fiche détaillée des matériels.
- Formulaire de création et de modification conforme aux champs confirmés.
- Interface d'affectation d'un ou plusieurs matériels.
- Tableau de bord et liste des remontées avec accès aux PDF.
- Vue de traitement d'une remontée et affichage des notifications à la connexion.
- Aucune action de suppression, d'administration des postes, de supervision ou de gestion des comptes.

## Contraintes transversales

- Application web utilisée avec les versions de Firefox installées sur les postes de l'équipe.
- Réseau interne NP disposant d'un accès à Internet.
- Authentification par login et mot de passe via Keycloak relié à LDAP ; disponibilité de l’instance et modalités d’intégration à préciser (cadrage § 18).
- Un seul profil par utilisateur.

## Sources

[Consignes du projet](01-CONSIGNES.md), [cadrage §§ 3 à 7 et 13 à 18](02-CADRAGE.md), [règles de gestion](04-REGLES-DE-GESTION.md), [DCU — Gestion du parc](08-DCU-GESTION-PARC.md), [DCU — Remontées utilisateur](11-DCU-REMONTEES-UTILISATEUR.md) et [matrice des droits](12-MATRICE-DROITS.md).
