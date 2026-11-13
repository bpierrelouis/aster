# Fiche descriptive — Administrateur

- **Statut :** proposée à partir des réponses en vigueur ; à présenter au client.
- **Profil :** administrateur.
- **Rattachement :** une école.
- **Périmètre :** toutes les données et fonctionnalités de son école.
- **Finalité :** administrer le parc, les postes, la supervision, les remontées et les comptes de son école.

## Périmètre fonctionnel

| Domaine | Capacités |
| --- | --- |
| Parc matériel | Toutes les actions, y compris l'import JSON et la suppression |
| Administration des postes | Consulter les applications ; installer ou désinstaller une application ; demander la réinstallation d'un poste ou d'une salle |
| Supervision | Consulter les postes et processus, arrêter un processus utilisateur, gérer les listes, recevoir les alertes et consulter les statistiques |
| Remontées | Créer et traiter une remontée ; consulter et télécharger tous les PDF ; consulter le tableau de bord |
| Comptes ASTER | Créer, modifier, désactiver et réactiver les comptes rattachés à son école |
| Notifications de remontée | Aucune notification liée aux remontées |

Les droits détaillés sont consolidés dans la [matrice des droits](12-MATRICE-DROITS.md).

## UC-ADMIN-01 — Administrer le parc matériel

- **Objectif :** maintenir l'inventaire de l'école, y compris lorsque la suppression d'un matériel est nécessaire.
- **Déclencheur :** un matériel doit être créé, retrouvé, modifié, affecté, déplacé, importé ou supprimé.
- **Préconditions :** l'administrateur est authentifié ; les données concernées appartiennent à son école.

### Scénario nominal

1. L'administrateur recherche ou ouvre un matériel.
2. Il crée ou modifie sa fiche conformément aux données obligatoires.
3. ASTER attribue l'identifiant interne lors d'une création.
4. L'administrateur affecte ou déplace un ou plusieurs matériels si nécessaire.
5. ASTER applique immédiatement l'opération autorisée.

### Variantes et limites

- L'administrateur peut importer de nouveaux matériels en JSON ; les données sont appliquées immédiatement sans validation métier préalable.
- Il peut supprimer un matériel, sous réserve des contraintes de suppression restant à définir.
- Un matériel reste en stock sans localisation ou est affecté au maximum à une salle.
- La gestion des garanties demeure optionnelle.

### Questions ouvertes

- Contrôles JSON, doublons et échecs partiels.
- Contraintes de suppression liées aux remontées.
- Parcours de remise en stock et journalisation éventuelle.
- Indicateurs et filtres du tableau de bord du parc.

### Règles applicables

RG-03 à RG-10, RG-15, RG-25 à RG-29 et RG-69.

## UC-ADMIN-02 — Administrer les applications d'un poste ou d'une salle

- **Objectif :** consulter les applications installées et déclencher leur installation ou leur désinstallation.
- **Déclencheur :** l'administrateur sélectionne un poste ou une salle de son école.
- **Préconditions :** la cible appartient à son école ; la solution d’administration à distance est disponible et autorisée.

### Scénario nominal

1. L'administrateur sélectionne un poste.
2. ASTER obtient la liste de ses applications au moyen de la solution d’administration à distance retenue.
3. ASTER présente les informations retournées.
4. L'administrateur choisit une application et une opération d'installation ou de désinstallation.
5. ASTER transmet la demande à la solution d’administration à distance retenue.

### Variantes et limites

- La cible peut être un poste ou l'ensemble des postes d'une salle.
- La réussite, le suivi et les échecs partiels ne sont pas encore définis.

### Questions ouvertes

- Solution d’administration à distance, protocole, compte technique et gestion des secrets.
- Informations à afficher pour une application.
- Origine, validation et version des paquets.
- Confirmation, suivi, reprise et journalisation des opérations.

### Règles applicables

RG-15, RG-65 et RG-69.

## UC-ADMIN-03 — Réinstaller un poste ou une salle

- **Objectif :** demander depuis ASTER la réapplication d'une image système.
- **Déclencheur :** l'administrateur sélectionne un poste ou une salle à replaquer.
- **Préconditions :** la cible appartient à son école ; un mécanisme de déploiement est disponible et autorisé.

### Scénario nominal

1. L'administrateur sélectionne un poste.
2. Il demande sa réinstallation depuis ASTER.
3. ASTER transmet la demande au mécanisme de déploiement retenu.
4. Ce mécanisme prend en charge la réapplication de l'image.

### Variantes et limites

- La cible peut être une salle entière.
- ASTER ne développe pas son propre moteur d'image.
- L'annulation et l'interruption ne sont pas demandées dans ASTER.

### Questions ouvertes

- Outil existant et interface d'automatisation.
- Images de référence, sélection de l'image et données locales.
- Planification, confirmation renforcée et ciblage partiel d'une salle.
- Suivi, signalement des échecs, reprise et capacité simultanée.

### Règles applicables

RG-15, RG-22, RG-30 et RG-69.

## UC-ADMIN-04 — Superviser les postes et gérer les règles de processus

- **Objectif :** superviser les postes de l'école, intervenir sur les processus utilisateur et définir les règles de classement.
- **Déclencheur :** l'administrateur ouvre une salle, la gestion des listes ou les statistiques.
- **Préconditions :** les postes sont connus dans ASTER ; la solution d’administration à distance est disponible.

### Scénario nominal

1. L'administrateur sélectionne une salle et consulte l'état de ses postes.
2. ASTER présente les processus utilisateur et les actualise toutes les cinq secondes.
3. L'administrateur peut demander l'arrêt manuel d'un processus utilisateur affiché.
4. Il peut créer, modifier ou supprimer une entrée de whitelist ou de blacklist dans les limites de son périmètre.
5. ASTER applique les règles cumulées et arrête automatiquement un processus blacklisté.
6. ASTER crée l'alerte et conserve l'historique confirmé.
7. L'administrateur peut consulter les statistiques d'utilisation disponibles.

### Variantes et limites

- Les processus système ne sont pas proposés comme cible d'un arrêt manuel.
- La blacklist est prioritaire et une interdiction héritée ne peut pas être annulée localement.
- Après environ quinze secondes sans remontée, un poste est déconnecté et reste visible sans processus.
- Le droit de consulter des statistiques est confirmé ; leurs indicateurs ne le sont pas encore.

### Questions ouvertes

- Articulation entre les règles de portée globale et le périmètre d'une école.
- Solution d’administration à distance, flux et sécurisation.
- Indicateurs, périodes, calculs, filtres et exports statistiques.
- Statuts, traitement et durée de conservation des alertes et historiques.

### Règles applicables

RG-15, RG-31 à RG-33, RG-40 à RG-58, RG-68 et RG-69.

## UC-ADMIN-05 — Créer, consulter et traiter les remontées

- **Objectif :** déclarer un problème, consulter les états des lieux et intervenir dans le traitement.
- **Déclencheur :** l'administrateur crée ou ouvre une remontée de son école.
- **Préconditions :** l'administrateur est authentifié ; les matériels concernés appartiennent à son périmètre.

### Scénario nominal

1. L'administrateur sélectionne un ou plusieurs matériels et saisit la description du problème.
2. ASTER enregistre la remontée et génère automatiquement son PDF d'état des lieux.
3. L'administrateur consulte ou télécharge le PDF.
4. Il peut traiter la remontée et effectuer la transition confirmée de « en attente » à « remplacé ».
5. ASTER enregistre le statut commun à toute la remontée.

### Variantes et limites

- L'administrateur peut consulter et télécharger tous les PDF de son école.
- Il peut consulter le tableau de bord des remontées.
- Il ne reçoit aucune notification liée aux remontées.
- Les transitions relatives au statut « corrigé » restent à définir.

### Questions ouvertes

- Mode d'obtention du type de problème inclus dans le PDF.
- Cycle complet des statuts, qualification, affectation et délais.
- Modèle, archivage, immutabilité et versionnement du PDF.
- Indicateurs et filtres du tableau de bord.

### Règles applicables

RG-11 à RG-15, RG-21, RG-23 à RG-25, RG-34 à RG-39 et RG-69.

## UC-ADMIN-06 — Gérer les comptes ASTER de l'école

- **Objectif :** créer et maintenir les comptes rattachés à l'école de l'administrateur.
- **Déclencheur :** un compte doit être créé, modifié, désactivé ou réactivé.
- **Préconditions :** l'administrateur est authentifié ; le compte appartient à son école.

### Scénario nominal

1. L'administrateur renseigne le login et les informations du compte.
2. Il attribue exactement un profil autorisé dans son périmètre et sélectionne son école de rattachement.
3. ASTER vérifie le périmètre et enregistre le compte.

### Variantes et limites

- L'administrateur peut modifier, désactiver ou réactiver un compte de son école.
- Il ne gère pas les comptes super administrateur, faute de règle confirmant cette autorité.
- La suppression définitive d'un compte n'est pas confirmée.

### Questions ouvertes

- Données d'identité obligatoires.
- Modalités d’intégration à MindefConnect et articulation avec la gestion des comptes ASTER (cadrage § 18).
- Changement de profil ou d'école, sessions actives et revue des droits.
- Traçabilité des opérations sur les comptes.

### Règles applicables

RG-01, RG-15, RG-60, RG-62 et RG-69 à RG-71.

## IHM issues de la maquette

Les maquettes ci-dessous illustrent le volet de gestion du parc commun à l’administrateur et au gestionnaire.

### Tableau de bord du parc

![Tableau de bord du parc dans la maquette ASTER](assets/fiches-descriptives/IHM-MAQUETTE-TABLEAU-DE-BORD.png)

### Fiche matériel

![Fiche d'un matériel dans la maquette ASTER](assets/fiches-descriptives/IHM-MAQUETTE-FICHE-MATERIEL.png)

Les autres écrans disponibles sont présentés dans la [fiche Gestionnaire](13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md#ihm-issues-de-la-maquette).

## Besoins en interface

- Tous les écrans du parc, avec suppression réservée aux profils administrateurs.
- Sélection d'un poste ou d'une salle pour l'administration distante.
- Consultation des applications, installation, désinstallation et réinstallation.
- Supervision des postes et processus, gestion des listes, alertes et statistiques.
- Création, consultation et traitement des remontées avec accès aux PDF.
- Gestion des comptes limitée à l'école.
- Aucun écran ne doit laisser penser que l'administrateur possède un périmètre global sur toutes les écoles.

## Contraintes transversales

- Application web utilisée avec les versions de Firefox installées sur les postes de l'équipe.
- Réseau interne NP disposant d'un accès à Internet.
- Authentification via MindefConnect ; modalités d’intégration à préciser (cadrage § 18).
- Un seul profil par utilisateur.

## Sources

[Consignes du projet](01-CONSIGNES.md), [cadrage consolidé](02-CADRAGE.md), [règles de gestion](04-REGLES-DE-GESTION.md), [DCU — Gestion du parc](08-DCU-GESTION-PARC.md), [DCU — Administration des postes](09-DCU-ADMINISTRATION-POSTES.md), [DCU — Supervision des postes](10-DCU-SUPERVISION-POSTES.md), [DCU — Remontées utilisateur](11-DCU-REMONTEES-UTILISATEUR.md) et [matrice des droits](12-MATRICE-DROITS.md).
