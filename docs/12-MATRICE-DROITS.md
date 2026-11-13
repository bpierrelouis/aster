# Matrice des droits applicatifs — ORION

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 2.0 | 13/11/2026 | Production destinée à la remise | Prise en charge « en cours » puis « remplacé » ou « corrigé » par le gestionnaire ; remontées et notifications des administrateurs ; type de problème obligatoire | [5 versions](../archive/README.md#12-matrice-droits) |
<!-- version:fin -->

Cette matrice consolide les droits connus des quatre profils ORION. Elle ne remplace pas les règles de gestion ni les questions de cadrage qui constituent les sources de référence.

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

Le super administrateur choisit l’école affichée ou l’ensemble des écoles (RG-84).

## Organisation des écoles et des salles

| Action | Gestionnaire | Formateur | Administrateur | Super administrateur | Périmètre ou condition | Sources |
| --- | --- | --- | --- | --- | --- | --- |
| Consulter les salles et leur matériel | Oui | Oui | Oui | Oui | Consultation seule pour le formateur. | RG-17, RG-69 et RG-78 |
| Créer, modifier ou supprimer une salle ou un étage | Non | Non | Oui | Oui | Une salle qui accueille des postes ne peut pas être supprimée ; ses matériels passent en stock. | RG-74 et RG-75 |
| Créer ou renommer une école | Non | Non | Non | Oui | Le super administrateur intervient sur toutes les écoles. | RG-15 et RG-76 |

## Gestion du parc

| Action | Gestionnaire | Formateur | Administrateur | Super administrateur | Périmètre ou condition | Sources |
| --- | --- | --- | --- | --- | --- | --- |
| Rechercher et consulter un matériel | Oui | Oui | Oui | Oui | Consultation seule pour le formateur. | RG-17, RG-69 et RG-78, DCU 08 |
| Créer et modifier un matériel | Oui | Non | Oui | Oui | Le gestionnaire intervient sur l’ensemble du parc de son école, sans restriction à un bâtiment. | RG-15 à RG-17, RG-69 et RG-78, DCU 08 |
| Affecter ou déplacer un ou plusieurs matériels | Oui | Non | Oui | Oui | L’opération prend effet immédiatement et peut concerner plusieurs matériels. Les matériels d’une même opération appartiennent à une même école. | RG-15, RG-16, RG-18, RG-26, RG-27, RG-72 et RG-78, DCU 08 |
| Importer de nouveaux matériels en JSON | Oui | Non | Oui | Oui | Les données sont appliquées immédiatement, sans validation métier préalable ; seuls la lisibilité du fichier et les données obligatoires sont contrôlés. | RG-15, RG-28 et RG-29 |
| Supprimer un matériel | Non | Non | Oui | Oui | L’interdiction du gestionnaire est explicite. Un matériel concerné par une remontée ne peut pas être supprimé. | RG-15, RG-17, RG-73 et RG-78, DCU 08 |
| Consulter le tableau de bord du parc | Oui | Non | Oui | Oui | La vue présente notamment l’état des stocks et peut être filtrée par salle. | RG-15, RG-24 et RG-36, DCU 08 |

## Remontées utilisateur

| Action | Gestionnaire | Formateur | Administrateur | Super administrateur | Périmètre ou condition | Sources |
| --- | --- | --- | --- | --- | --- | --- |
| Créer une remontée | Non | Oui | Oui | Oui | La remontée concerne un ou plusieurs matériels de l’école de la remontée. | RG-15, RG-21 et RG-79, DCU 11 |
| Consulter les remontées et leur suivi | Oui | Oui | Oui | Oui | Le formateur consulte uniquement ses propres remontées ; le gestionnaire et l’administrateur consultent toutes les remontées de leur école. | RG-15, RG-64 et RG-80, DCU 11 |
| Consulter un PDF d’état des lieux | Oui | Oui | Oui | Oui | Le formateur consulte uniquement le PDF d’une remontée qu’il a lui-même créée. | RG-15 et RG-23, DCU 11 |
| Télécharger un PDF d’état des lieux | Oui | Oui | Oui | Oui | Le formateur télécharge uniquement le PDF d’une remontée qu’il a lui-même créée. | RG-23, DCU 11 |
| Traiter une remontée | Oui | Non | Oui | Oui | Prise en charge (« en attente » → « en cours »), puis fin du traitement en « remplacé » ou « corrigé », avec les mêmes transitions pour les trois profils. Une remontée terminée ne change plus de statut. | RG-15 et RG-64, DCU 11 |
| Supprimer une remontée ou en modifier le contenu | Non | Non | Non | Non | Seul le statut d’une remontée peut être modifié. | RG-79 |
| Consulter le tableau de bord des remontées | Oui | Non | Oui | Oui | Les indicateurs détaillés restent à définir. | RG-15, RG-24 et RG-36, DCU 11 |
| Recevoir une notification liée à une remontée | Oui | Oui | Oui | Oui | Le gestionnaire est notifié à la création d’une remontée. Le formateur, l’administrateur et le super administrateur sont notifiés lorsque le statut de l’une de leurs propres remontées change. | RG-38, RG-39, RG-66 et RG-67, DCU 11 |

ORION génère le PDF d’état des lieux à chaque consultation ou téléchargement autorisé, sans le conserver (RG-35). Cette génération constitue un traitement automatique, pas un droit distinct.

## Supervision des postes

| Action | Gestionnaire | Formateur | Administrateur | Super administrateur | Périmètre ou condition | Sources |
| --- | --- | --- | --- | --- | --- | --- |
| Consulter l’état des postes et leurs processus utilisateur | Non | Oui | Oui | Oui | Le formateur accède à toutes les salles de son école, mais doit en sélectionner une et ne dispose pas d’une vue globale. Les processus système sont exclus. | RG-15, RG-19, RG-20, RG-32, RG-59, RG-69 et RG-83, DCU 10 |
| Arrêter manuellement un processus utilisateur affiché | Non | Oui | Oui | Oui | L’arrêt porte uniquement sur un processus utilisateur en cours présenté par ORION, avec un seul arrêt en attente ; le résultat est renvoyé par le poste. | RG-15, RG-19, RG-20 et RG-33, DCU 10 |
| Gérer les listes de processus autorisés et interdits | Non | Non | Oui | Oui | L’administrateur gère les règles de portée école, bâtiment ou salle de son école et consulte les règles globales ; seul le super administrateur gère les règles globales. | RG-15, RG-47 et RG-50, DCU 10 |
| Recevoir une alerte de processus blacklisté | Non | Oui | Oui | Oui | Notifiée à l’administrateur et au super administrateur ; le formateur la consulte dans les alertes de la salle qu’il supervise. | RG-55, DCU 10 |
| Consulter des statistiques d’utilisation | Non | Non | Oui | Oui | Les indicateurs relatifs aux postes et aux processus ainsi que leurs règles de calcul restent à définir. | RG-68, DCU 10 |

## Administration des postes

| Action | Gestionnaire | Formateur | Administrateur | Super administrateur | Périmètre ou condition | Sources |
| --- | --- | --- | --- | --- | --- | --- |
| Consulter les applications installées sur un poste | Non | Non | Oui | Oui | Les applications installées sont remontées par les postes ; la solution d’administration à distance reste à retenir. | RG-15 et RG-83, DCU 09 |
| Déclencher l’installation ou la désinstallation d’une application | Non | Non | Oui | Oui | L’action cible un poste individuel ou l’ensemble des postes d’une salle. Le résultat est suivi pour chaque poste. | RG-65 et RG-81, DCU 09 |
| Demander la réinstallation d’un ou de plusieurs postes, notamment d’une salle | Non | Non | Oui | Oui | Le mécanisme de déploiement reste à identifier. | RG-22, RG-30 et RG-81, DCU 09 |
| Gérer les postes supervisés et le catalogue des applications | Non | Non | Oui | Oui | Le catalogue des applications est commun à toutes les écoles. | RG-69 et RG-77 |

## Administration des comptes

| Action | Gestionnaire | Formateur | Administrateur | Super administrateur | Périmètre ou condition | Sources |
| --- | --- | --- | --- | --- | --- | --- |
| Créer, modifier, désactiver ou réactiver un compte ORION | Non | Non | Oui | Oui | L’administrateur gère uniquement les comptes de son école. Le super administrateur gère les comptes de toutes les écoles. Un compte n’est jamais supprimé. Personne ne modifie son propre profil ni ne désactive son propre compte. Seul le super administrateur attribue le profil de super administrateur. | RG-70 et RG-82 |

## Gestion des garanties

| Action | Gestionnaire | Formateur | Administrateur | Super administrateur | Périmètre ou condition | Sources |
| --- | --- | --- | --- | --- | --- | --- |
| Renseigner ou modifier la date de fin de garantie | Oui | Non | Oui | Oui | La date de fin de garantie est facultative. | RG-86, DCU 08 |
| Consulter les indicateurs de garantie | Oui | Non | Oui | Oui | Les garanties proches de l’échéance (six mois) et arrivées à échéance sont distinguées. | RG-36 et RG-86 |
| Recevoir une alerte de garantie | Oui | Non | Non | Non | L’alerte est affichée dans ORION ; aucun courriel n’est prévu. | RG-37, RG-38 et RG-86 |

Sources générales : [règles de gestion](04-REGLES-DE-GESTION.md), [cadrage consolidé](02-CADRAGE.md), DCU [gestion du parc](08-DCU-GESTION-PARC.md), [administration des postes](09-DCU-ADMINISTRATION-POSTES.md), [supervision des postes](10-DCU-SUPERVISION-POSTES.md) et [remontées utilisateur](11-DCU-REMONTEES-UTILISATEUR.md).
