# Fiche descriptive — Super administrateur

- **Statut :** proposée à partir des réponses en vigueur ; à présenter au client.
- **Profil :** super administrateur.
- **Rattachement :** aucune école.
- **Périmètre :** toutes les écoles.
- **Finalité :** exercer à l'échelle globale les mêmes droits fonctionnels que l'administrateur.

## Différence avec l'administrateur

Le super administrateur possède les mêmes capacités que l'administrateur. La différence confirmée porte uniquement sur le périmètre : l'administrateur est limité à son école de rattachement, tandis que le super administrateur accède aux données de toutes les écoles.

Afin d'éviter de dupliquer les scénarios, les parcours fonctionnels détaillés sont décrits dans la [fiche Administrateur](15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md). Ils s'appliquent au super administrateur avec les adaptations de périmètre ci-dessous.

## Périmètre fonctionnel

| Domaine | Capacités globales |
| --- | --- |
| Parc matériel | Toutes les actions sur les matériels de toutes les écoles, y compris suppression et import JSON |
| Administration des postes | Consultation des applications, installation, désinstallation et réinstallation sur les postes ou salles accessibles |
| Supervision | Consultation et arrêt des processus utilisateur, gestion des listes, alertes et statistiques |
| Remontées | Création et traitement ; consultation et téléchargement de tous les PDF ; tableau de bord |
| Comptes ASTER | Création, modification, désactivation et réactivation des comptes de toutes les écoles |
| Notifications de remontée | Aucune notification liée aux remontées |

## Adaptation des parcours administrateur

### Parc matériel

Les opérations de [UC-ADMIN-01](15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md#uc-admin-01--administrer-le-parc-matériel) portent sur les matériels de toutes les écoles. L'interface doit permettre d'identifier l'école avant d'agir et d'éviter toute ambiguïté sur le périmètre de l'opération.

### Administration des postes

Les opérations de [UC-ADMIN-02](15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md#uc-admin-02--administrer-les-applications-dun-poste-ou-dune-salle) et [UC-ADMIN-03](15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md#uc-admin-03--réinstaller-un-poste-ou-une-salle) s'appliquent aux postes et salles des écoles accessibles au super administrateur.

### Supervision

Le parcours [UC-ADMIN-04](15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md#uc-admin-04--superviser-les-postes-et-gérer-les-règles-de-processus) couvre toutes les écoles. Le super administrateur peut gérer les règles globales ainsi que celles portant sur une école, un bâtiment ou une salle.

### Remontées

Le parcours [UC-ADMIN-05](15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md#uc-admin-05--créer-consulter-et-traiter-les-remontées) permet de consulter et télécharger les PDF de toutes les écoles et de traiter les remontées accessibles. Le super administrateur ne reçoit pas de notification liée aux remontées.

### Comptes ASTER

Le parcours [UC-ADMIN-06](15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md#uc-admin-06--gérer-les-comptes-aster-de-lécole) est étendu aux comptes de toutes les écoles. L'autorité habilitée à créer, modifier ou désactiver un autre super administrateur reste à définir.

## Questions ouvertes propres au périmètre global

- Vue centrale et navigation entre les écoles.
- Filtres et indicateurs attendus au niveau global.
- Possibilité de comparer les écoles ou d'agréger leurs statistiques.
- Portée et priorité des règles globales de processus.
- Possibilité ou interdiction de réunir dans une même remontée des matériels de plusieurs écoles.
- Désignation des gestionnaires notifiés dans un éventuel cas multi-école.
- Autorité chargée de gérer les comptes super administrateur.
- Traçabilité des opérations globales sensibles.

## IHM issues de la maquette

La maquette couvre le parcours de gestion du parc à l'échelle d'une école. Ce socle est commun au super administrateur, mais le sélecteur d'école et la vue globale décrits dans cette fiche ne sont pas encore représentés.

![Liste des matériels dans la maquette ASTER](assets/fiches-descriptives/IHM-MAQUETTE-LISTE-MATERIELS.png)

Le parcours complet du parc est présenté dans la [fiche Gestionnaire](13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md#ihm-issues-de-la-maquette).

## Besoins en interface

- Sélecteur d'école ou indication explicite du périmètre global.
- Identification visible de l'école sur les listes, fiches, salles, postes et remontées.
- Confirmation du périmètre avant une opération distante ou groupée.
- Accès aux écrans de l'administrateur avec filtres globaux adaptés.
- Gestion des comptes de toutes les écoles sans rattacher le super administrateur à une école.

## Contraintes transversales

- Application web utilisée avec les versions de Firefox installées sur les postes de l'équipe.
- Réseau interne NP disposant d'un accès à Internet.
- Aucun agent ASTER ; utilisation des mécanismes Windows existants.
- Authentification par login et mot de passe ; mécanisme technique encore ouvert.
- Un seul profil par utilisateur.

## Règles applicables

RG-01, RG-15, RG-60, RG-62 et RG-69 à RG-71, complétées par toutes les règles applicables aux parcours de l'administrateur.

## Sources

[Cadrage §§ 2, 3 et 18](02-CADRAGE.md), [règles de gestion](04-REGLES-DE-GESTION.md), [fiche Administrateur](15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md), DCU [gestion du parc](08-DCU-GESTION-PARC.md), [administration des postes](09-DCU-ADMINISTRATION-POSTES.md), [supervision](10-DCU-SUPERVISION-POSTES.md) et [remontées utilisateur](11-DCU-REMONTEES-UTILISATEUR.md), ainsi que la [matrice des droits](12-MATRICE-DROITS.md).
