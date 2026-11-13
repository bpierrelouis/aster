# Matrice des droits applicatifs — ASTER

Cette matrice consolide les droits connus des quatre profils ASTER. Elle ne remplace pas les règles de gestion ni les questions de cadrage qui constituent les sources de référence.

**Légende :**

- **Oui** : droit établi dans les sources ;
- **Non** : refus explicite ;
- **—** : droit non attribué à ce profil dans les sources.

Tous les droits recensés dans cette matrice sont désormais attribués. Les précisions techniques encore ouvertes ne modifient pas leur répartition entre les profils.

## Périmètre organisationnel

| Profil | Rattachement | Données accessibles |
| --- | --- | --- |
| Gestionnaire | Une école | Uniquement son école de rattachement |
| Formateur | Une école | Uniquement son école de rattachement |
| Administrateur | Une école | Uniquement son école de rattachement |
| Super administrateur | Aucun | Toutes les écoles |

## Gestion du parc

| Action | Gestionnaire | Formateur | Administrateur | Super administrateur | Périmètre ou condition | Sources |
| --- | --- | --- | --- | --- | --- | --- |
| Créer, rechercher, consulter et modifier un matériel | Oui | — | Oui | Oui | Le gestionnaire intervient sur l’ensemble du parc de son école, sans restriction à un bâtiment. | RG-15 à RG-17 et RG-69, DCU 08 |
| Affecter ou déplacer un ou plusieurs matériels | Oui | — | Oui | Oui | L’opération prend effet immédiatement et peut concerner plusieurs matériels. | RG-15, RG-16, RG-18, RG-26 et RG-27, DCU 08 |
| Importer de nouveaux matériels en JSON | Oui | — | Oui | Oui | Les données sont appliquées immédiatement, sans validation métier préalable. | RG-15, RG-28 et RG-29 |
| Supprimer un matériel | Non | — | Oui | Oui | L’interdiction du gestionnaire est explicite. | RG-15 et RG-17, DCU 08 |
| Consulter le tableau de bord du parc | Oui | — | Oui | Oui | La vue présente notamment l’état des stocks et peut être filtrée par salle. | RG-15, RG-24 et RG-36, DCU 08 |

## Remontées utilisateur

| Action | Gestionnaire | Formateur | Administrateur | Super administrateur | Périmètre ou condition | Sources |
| --- | --- | --- | --- | --- | --- | --- |
| Créer une remontée | — | Oui | Oui | Oui | La remontée concerne un ou plusieurs matériels. | RG-15 et RG-21, cadrage § 13, DCU 11 |
| Suivre l’avancement des remontées créées | — | Oui | Oui | Oui | Le formateur suit uniquement ses propres remontées. Le périmètre de consultation des administrateurs n’est pas détaillé. | RG-15, cadrage § 13 |
| Consulter un PDF d’état des lieux | Oui | Oui | Oui | Oui | Le formateur consulte uniquement le PDF d’une remontée qu’il a lui-même créée. | RG-15 et RG-23, cadrage § 15, DCU 11 |
| Télécharger un PDF d’état des lieux | Oui | Oui | Oui | Oui | Le formateur télécharge uniquement le PDF d’une remontée qu’il a lui-même créée. | RG-23, cadrage § 15, DCU 11 |
| Traiter une remontée | Oui | — | Oui | Oui | Le passage de « en attente » à « remplacé » est la seule transition explicitement attribuée. | RG-15, cadrage § 13 |
| Consulter le tableau de bord des remontées | Oui | — | Oui | Oui | Les indicateurs détaillés restent à définir. | RG-15, RG-24 et RG-36, cadrage § 14, DCU 11 |
| Recevoir une notification liée à une remontée | Oui | Oui | Non | Non | Le gestionnaire est notifié à la création d’une remontée. Le formateur est notifié lorsque le statut de l’une de ses propres remontées change. | RG-38, RG-39, RG-66 et RG-67, cadrage §§ 12 et 13, DCU 11 |

La transmission d’une remontée génère automatiquement son PDF d’état des lieux. Cette génération constitue un traitement automatique, pas un droit distinct.

## Supervision des postes

| Action | Gestionnaire | Formateur | Administrateur | Super administrateur | Périmètre ou condition | Sources |
| --- | --- | --- | --- | --- | --- | --- |
| Consulter l’état des postes et leurs processus utilisateur | — | Oui | Oui | Oui | Le formateur accède à toutes les salles de son école, mais doit en sélectionner une et ne dispose pas d’une vue globale. Les processus système sont exclus. | RG-15, RG-19, RG-20, RG-32, RG-59 et RG-69, cadrage § 10, DCU 10 |
| Arrêter manuellement un processus utilisateur affiché | — | Oui | Oui | Oui | L’arrêt porte uniquement sur un processus utilisateur présenté par ASTER. | RG-15, RG-19, RG-20 et RG-33, cadrage § 11, DCU 10 |
| Gérer les listes de processus autorisés et interdits | — | — | Oui | Oui | Les règles peuvent être globales ou porter sur une école, un bâtiment ou une salle. | RG-50, cadrage § 11, DCU 10 |
| Recevoir une alerte de processus blacklisté | — | Oui | Oui | Oui | Le formateur reçoit l’alerte lorsqu’il supervise la salle concernée. | RG-55, cadrage § 12, DCU 10 |
| Consulter des statistiques d’utilisation | — | — | Oui | Oui | Les indicateurs relatifs aux postes et aux processus ainsi que leurs règles de calcul restent à définir. | RG-68, cadrage § 14, DCU 10 |

## Administration des postes

| Action | Gestionnaire | Formateur | Administrateur | Super administrateur | Périmètre ou condition | Sources |
| --- | --- | --- | --- | --- | --- | --- |
| Consulter les applications installées sur un poste | — | — | Oui | Oui | Le mécanisme de collecte reste à identifier. | RG-15, cadrage § 8, DCU 09 |
| Déclencher l’installation ou la désinstallation d’une application | — | — | Oui | Oui | L’action cible un poste individuel ou l’ensemble des postes d’une salle. | RG-65, cadrage § 8, DCU 09 |
| Demander la réinstallation d’un poste ou d’une salle | — | — | Oui | Oui | Le mécanisme de déploiement reste à identifier. | RG-22 et RG-30, cadrage § 9, DCU 09 |

## Administration des comptes

| Action | Gestionnaire | Formateur | Administrateur | Super administrateur | Périmètre ou condition | Sources |
| --- | --- | --- | --- | --- | --- | --- |
| Créer, modifier, désactiver ou réactiver un compte ASTER | — | — | Oui | Oui | L’administrateur gère uniquement les comptes de son école. Le super administrateur gère les comptes de toutes les écoles. | RG-70, cadrage § 3 |

## Gestion des garanties — fonctionnalité optionnelle

| Action | Gestionnaire | Formateur | Administrateur | Super administrateur | Périmètre ou condition | Sources |
| --- | --- | --- | --- | --- | --- | --- |
| Renseigner ou modifier la date de fin de garantie | Oui | — | Oui | Oui | Applicable uniquement si le bonus de gestion des garanties est retenu. | Cadrage § 7, DCU 08 |
| Consulter les indicateurs de garantie | Oui | — | Oui | Oui | Les garanties proches de l’échéance et arrivées à échéance sont distinguées. | Cadrage §§ 7 et 14 |
| Recevoir une alerte de garantie | Oui | — | — | — | L’alerte est affichée dans ASTER ; aucun courriel n’est prévu. | RG-37 et RG-38, cadrage §§ 7 et 12 |

Sources générales : [cadrage consolidé](02-CADRAGE.md), [règles de gestion](04-REGLES-DE-GESTION.md), DCU [gestion du parc](08-DCU-GESTION-PARC.md), [administration des postes](09-DCU-ADMINISTRATION-POSTES.md), [supervision des postes](10-DCU-SUPERVISION-POSTES.md) et [remontées utilisateur](11-DCU-REMONTEES-UTILISATEUR.md).
