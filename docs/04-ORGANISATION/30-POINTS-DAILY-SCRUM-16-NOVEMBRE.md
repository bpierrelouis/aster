# Points du daily scrum du lundi 16 novembre

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 1.3 | 15/11/2026 | Pilotage interne | Lien d’une remontée à son école tranché | [4 versions](../../archive/README.md#30-points-daily-scrum-16-novembre) |
<!-- version:fin -->

Situation au dimanche 15 novembre. Rendu de l’application le mardi 17, supports prêts le mercredi 18, présentation le jeudi 19 (horaire non fixé). Les numéros renvoient aux tickets du projet GitHub.

## 1. À boucler au plus vite

### Lundi 16

| Priorité | Sujet | Ticket | Responsables | Attendu |
| --- | --- | --- | --- | --- |
| 1 | Déployer la version de `dev` sur les VM | #103, #116 | BAELDE, LE MAÎTRE | Version servie vérifiée sur `/api/infos` ; connexion des trois jetons de présentation et d’un compte avec mot de passe ; premier super administrateur ; postes simulés ; recensement RIGEL de bout en bout. |
| 2 | Scénario complet par profil | #108 | PHOMMAVONGSA | Parcours de bout en bout (connexion, parc, salles, RIGEL, remontée, supervision, intervention, notifications, administration) avec le résultat attendu à chaque étape ; il sert de fil de la présentation. |
| 3 | Recette par domaine | #105, #106, #107 | BAELDE, BONNEY, PHOMMAVONGSA | Droits par profil, inventaire et affectations, supervision et remontées vérifiés sur les VM ; anomalies ouvertes en tickets. |
| 4 | Relecture du dossier de conception | #63 | BONNEY | Livrables 22 à 29, MCD refait le 15 novembre (déplacement, opération, paquet, système d’exploitation) et cohérence classes, séquences et modèles. |
| 5 | Relecture du dossier d’architecture | #70 | LE MAÎTRE | Relecture du DAT et de ses quatre schémas. |
| 6 | Tests de sécurité et durcissements | #109 | BAELDE, LE MAÎTRE | Résultats consignés avant le gel de la version. |

### Avant le rendu du mardi 17

| Sujet | Ticket | Responsables | Attendu |
| --- | --- | --- | --- |
| Version à remettre | #111 | BAELDE | Version gelée et identifiée, contrôle collectif et réserves consignés. |
| Dossier de remise | #112 | LE MAÎTRE | Livrables prévus au README et leurs ressources, liens contrôlés, aucune information propre au démonstrateur. |
| Documentation restante | #60, #61, #140 à #143 | BAELDE, BONNEY | Contradictions, décisions du 13 novembre et informations non reportées ; questions du cadrage déjà résolues fermées. |

### Avant la présentation du jeudi 19

| Sujet | Ticket | Responsables | Attendu |
| --- | --- | --- | --- |
| Support et répétition | #110 | LE MAÎTRE | Support prêt le 18, passages répartis, répétition faite. |
| Comptes rendus des cérémonies | #50 | LE MAÎTRE | Comptes rendus à jour jusqu’au daily du 16. |
| Prochain rendez-vous client | #114 | BAELDE | Date fixée ; points du cadrage § 23 préparés. |

Après la présentation : retirer les jetons « Accès de présentation » (#113).

## 2. Points à trancher

1. **Renommage de la base et du code (#162)** : tables sans préfixe `orion_`, relais RIGEL `operation` et `evenement`, « campagne » remplacée par « opération ». Le faire avant le gel du mardi 17, ou après le rendu ? Le changement touche une migration et les données des VM.
2. **Cible ou application dans les diagrammes (#161)** : le glossaire et les diagrammes 06, 07 et 26 à 29 présentent-ils RIGEL selon l’architecture cible (second Apache, sans relais) ou selon l’application actuelle (relais et connecteur) ? **Tranché par l’utilisateur le 15 novembre :** selon la cible ; livrables alignés.
3. **Retrait des matériels (#91)** : remplacer la suppression par un retrait daté et motivé (rédaction de RG-91 à valider), en V1 ou en V2 ?
4. **Tickets secondaires du sprint 2** : jeton d’un poste dans l’administration (#127), transfert d’un matériel hors service à l’import (#129), tests du détail de `/api/health` et `/api/infos` (#130). Les garder pour le rendu ou les reporter ?
5. **Lien direct d’une remontée à son école** (`RELEVER` du MCD) : justifier ce lien dans une règle de gestion, puisqu’il est conservé si un matériel change d’école (accord requis sur la rédaction). **Tranché par l’utilisateur le 15 novembre :** lien conservé, justifié dans RG-79.
6. **Règles du catalogue de la V2** : paquet requis pour installer, système d’exploitation restauré par une réinitialisation. Les rédiger maintenant ou à l’ouverture de la V2 ?
7. **Rendez-vous client et présentation** : date du prochain rendez-vous, points du cadrage § 23 présentés au client et horaire de la présentation du 19.

## 3. Reporté en V2

Agent M42 (#64), images Windows et paquets (#100), gestion du catalogue des applications et des systèmes d’exploitation, postes Linux (#153). Le MCD représente déjà les systèmes d’exploitation et les paquets.
