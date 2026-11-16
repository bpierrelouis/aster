# ORION — Audit final avant remise

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 1.0 | 16/11/2026 | Pilotage interne | Consigner l’audit final avant remise et sa notation | [1 version](../../archive/README.md#04-audit-final-avant-remise) |
<!-- version:fin -->

Audit réalisé le 16 novembre 2026 au soir sur la branche `dev` (commit `11a97b7`), en lecture seule, pour la remise du 17 novembre à 12 h. Cinq audits indépendants : application, architecture et DAT, documents d'analyse et DSE, diagrammes, remise et organisation. Seuls les problèmes critiques et majeurs sont retenus ; les points mineurs sont volontairement ignorés. Document de pilotage interne : il cite des éléments du démonstrateur et n'est pas remis.

Les notes sont des estimations de l'équipe, pas une évaluation officielle. L'écart connu entre les diagrammes refaits le 16 novembre et le DSE en PDF n'est pas compté : le DSE et le DAT sont notés sur leur structure et leur sommaire.

## 1. Notes

### 1.1. Par partie

| Grande partie | Partie | Note /20 |
| --- | --- | --- |
| Application | Sécurité | 15 |
| | Règles métier côté serveur | 15 |
| | Robustesse et données | 16 |
| | Interface | 17 |
| | Qualité du code et conventions | 17 |
| | Tests | 17 |
| | Guide de l'application (`application/README.md`) | 16 |
| Architecture | Structure et sommaire du DAT | 15 |
| | Exactitude du DAT par rapport à la configuration | 15 |
| | Schémas d'architecture | 15 |
| | Conformité au CCT | 17 |
| | Sécurité de l'infrastructure | 14 |
| | Haute disponibilité et reprise | 15 |
| | CI/CD | 16 |
| | Livrable DAT en PDF | 13 |
| Analyse documentaire | Glossaire | 15 |
| | Cadrage | 11 |
| | Règles de gestion | 14 |
| | Matrice des droits | 16 |
| | Fiches descriptives | 15 |
| | DSE : structure et sommaire | 15 |
| Diagrammes | Modélisation métier | 14 |
| | Cas d'utilisation | 16 |
| | Activités des cas d'utilisation | 17 |
| | Classes métier, MCD et classes d'analyse | 14 |
| | Séquences système et détaillées | 14,5 |
| | États | 14 |
| | Conception et modèle physique | 14 |
| Remise et organisation | Couverture des consignes | 12 |
| | Livrables | 12 |
| | Organisation (backlog, journal, graphiques) | 8 |
| | Présentation du 19 novembre | 5 |
| | Hygiène du dépôt | 17 |

### 1.2. Par grande partie

| Grande partie | Note /20 | Justification |
| --- | --- | --- |
| Application | 16 | Application sérieuse, droits appliqués par le serveur, tests au vert ; trois contournements de règles côté serveur faciles à corriger. |
| Architecture et DAT | 15 | DAT rigoureux et fidèle à la configuration ; contraintes de la cible, configurations jointes et comptes sans mot de passe font perdre des points évitables. |
| Analyse documentaire et DSE | 14 | Ensemble cohérent et tracé ; écarts au client mal exposés et cadrage en retard sur l'application. |
| Diagrammes (refaits le 16 novembre) | 14,5 | Fond solide (droits, statuts, flux) ; cohérence entre niveaux de modélisation et notation à reprendre par endroits. |
| Remise et organisation | 11 | Produit et analyse solides ; preuve de la démarche Agile, deux exigences des consignes, branche publiée et support de présentation manquants. |

### 1.3. Ensemble

Pondération des consignes (§ 7) : analyse et gestion de projet coefficient 5, technique coefficient 5, présentation coefficient 2.

| Critère | Parties retenues | Note /20 |
| --- | --- | --- |
| Analyse et gestion de projet (coef. 5) | Analyse documentaire 14, diagrammes 14,5, organisation 8 | 12,2 |
| Technique (coef. 5) | Application 16, architecture 15 | 15,5 |
| Présentation (coef. 2) | Support absent à ce jour | 5 |
| **Remise du 17 novembre (hors présentation)** | | **13,8** |
| **Ensemble pondéré, présentation actuelle comprise** | | **12,4** |

### 1.4. Diagrammes : anciens (présents dans le DSE) et nouveaux

Le DSE en PDF du 16 novembre (commit `21bb429`) est construit à partir des sources draw.io dans leur état d'avant les corrections du 16 novembre ; le dégagement des chevauchements fait ensuite sur ces sources n'a pas été renoté. Les anciennes notes viennent de l'audit du 16 novembre après-midi.

| Famille | Anciens diagrammes (DSE) | Nouveaux diagrammes |
| --- | --- | --- |
| Contexte et activités métier | 12,5 et 12 | 14 |
| Cas d'utilisation | 10 à 18 selon le diagramme (parc et remontées 10) | 16 |
| Activités des cas d'utilisation | 15 | 17 |
| Classes métier, MCD, classes d'analyse | 16,5 ; 15,5 ; 11,5 | 14 |
| Séquences système et détaillées | 13 et 14 (sources draw.io seules : 11 et 12) | 14,5 |
| États | 14 (source draw.io seule : 12) | 14 |
| Conception et modèle physique | conception en modules, non notée ; modèle physique 17,5 | 14 (conception 12, modèle physique 17) |
| **Synthèse** | **≈ 14 (draw.io du DSE plus bas, ≈ 12)** | **14,5** |

Les anciennes sources draw.io, celles du DSE, réservaient encore au seul gestionnaire le traitement des remontées, la confirmation des installations et RIGEL (RG-15) ; les nouveaux diagrammes corrigent ce point partout et alignent Markdown et draw.io. L'audit plus exigeant des nouveaux diagrammes (cohérence entre niveaux de modélisation) explique que certaines notes ne montent pas davantage.

## 2. Problèmes critiques

| N° | Problème | Preuve | Correction | Effort |
| --- | --- | --- | --- | --- |
| C1 | Contraintes de la cible contredites : MindefConnect est sur Internet, accès à Medusa et Sismel exigés | Consignes l. 272 ; DAT l. 24 et 383 « MindefConnect, hébergé sur le C1NP » ; Medusa et Sismel absents du dépôt ; schémas de la cible | MindefConnect sur Internet (§§ 2, 6.1, flux 5 et 6) ; flux vers Medusa et Sismel au § 6.2 ; générateur de schémas, SVG, PDF du DAT | 60 min |
| C2 | Configurations de l'architecture réelle non remises avec le DAT | Consignes l. 263 ; DAT l. 300-320 renvoie à un « dossier de configuration du livrable » absent ; § 4.8 exclut le realm et le thème que le `Dockerfile` copie ; chemins `images/…` ≠ `infra/images/…` ; `ci-cd.yml` non listé | `livrables/DAT-ORION/configuration/` (Dockerfile, `infra/` sans `compose.yaml`, `ci-cd.yml`) dans leur arborescence ; aligner le § 4.8 | 45 min |
| C3 | Connexion sans mot de passe : décrite dans le livrable, inexacte et active sur les VM | DAT l. 70 « trois comptes » ; le realm en exempte quatre, dont le super administrateur ; `pile.yaml:177` active l'option ; la page de connexion affiche les comptes ; DAT l. 184 donne une commande d'exploitation | Retirer DAT l. 70 et 184 ; `${ORION_COMPTES_PRESENTATION:-false}`, activé seulement pour la présentation | 20 min |
| C4 | Écarts au client non déclarés dans le DSE | Entretiens : « aucune campagne d'inventaire », « aucun historique », « seul le formateur peut créer des remontées », « sans vérification » ; RG-21, 39, 72, 93, 95 ; le PO-05 du DSE ne cite que 4 écarts sur une douzaine ; recensement absent du § 23 du cadrage | Tableau au PO-05 (demande du client, choix retenu, justification) ; point recensement au § 23 du cadrage | 60 min |
| C5 | « Paramétrer les formations induites » retiré sans décision du client | Consignes l. 77 et 160 ; DSE l. 106 et 341 ; le client a cité un « rôle pour une formation » (entretiens l. 17), absent du modèle | Ligne justifiée au § 11.1 du DSE et point ouvert ; écart au cadrage | 25 min |
| C6 | Cérémonies Scrum non attestées ; journal qui raconte au passé les 17, 18 et 19 novembre | Backlog l. 103 et 271 ; journal l. 44-46 et 98-106 ; Review et Retrospective du sprint 1 un dimanche (l. 131) | Retirer ou marquer « prévu » les entrées futures ; comptes rendus réels des cérémonies ; corriger les dates | 90 min |
| C7 | La branche publiée `main` ne contient pas la remise | `origin/main` en retard de plus de 13 commits : ni DSE ni DAT en PDF, ni `livrables/README.md` | Fusionner `dev` dans `main` après les corrections | 10 min |
| C8 | Aucun support pour la présentation du 19 novembre | `presentations/` : point d'étape du 4 novembre et parcours d'architecture seulement | Support complet (organisation, produit, démonstration, choix), échéance le 18 | 4 h |

## 3. Problèmes majeurs

### 3.1. Application

| N° | Problème | Preuve | Correction | Effort |
| --- | --- | --- | --- | --- |
| A1 | Le navigateur fixe des valeurs d'autorité des interventions | `postes.ts:162-185` conserve `auto`, `detectionId`, `termineLe` ; un formateur peut marquer « réussi » l'arrêt d'une autre détection | Ne garder que les champs de saisie, comme `SAISIE_REMONTEE` ; test négatif | 15 min |
| A2 | Tout administrateur modifie le catalogue global des applications | `espace.ts:137` et `:169` ; test `espace.test.ts:322` ; contraire à RG-77 et RG-15 | Refus 403, ou super administrateur seul ; adapter le test | 10 min |
| A3 | Lien poste–unité centrale non garanti | `import.ts:87` transfère l'unité centrale d'un poste d'une autre école ; deux postes peuvent partager une unité centrale | Exclure ces matériels de l'import ; unicité dans `mergeState` ; deux tests | 20 min |
| A4 | Le formateur reçoit les applications installées | `espace.ts:59` ; matrice l. 93 « Non » | `installations` réservé aux administrateurs | 10 min |
| A5 | Guide de l'application : liens cassés | `application/README.md` l. 13, 19, 206 ; dossier `infra/rigel/` inexistant (l. 384) | Corriger les trois cibles, retirer la ligne | 10 min |

### 3.2. Architecture et DAT

| N° | Problème | Correction | Effort |
| --- | --- | --- | --- |
| T1 | Vue complète sans le runner d'orion-3 ni ses flux ; Firefox porte l'adresse d'orion-1 | Remettre le runner et ses deux flux dans le générateur ; retirer l'adresse de Firefox | 30 min |
| T2 | « Un volume n'est jamais utilisé par deux instances » faux en cas de coupure réseau (PostgreSQL sur NFS) | Nuancer les §§ 4.5 et 4.6 | 10 min |
| T3 | Tableau des secrets incomplet (`PROVISIONING_PASSWORD_SECRET`) et origine des secrets inexacte | Compléter le tableau et la phrase | 10 min |
| T4 | La CI peut annuler un déploiement en cours (`cancel-in-progress: true` au niveau du workflow) | `cancel-in-progress: false` ou exclusion de `main` | 5 min |
| T5 | Ni partie Sécurité ni partie Qualité du code explicites (consignes l. 196, 249-252) | Deux sections de synthèse au DAT, réel et cible | 60 min |

### 3.3. Analyse documentaire et DSE

| N° | Problème | Correction | Effort |
| --- | --- | --- | --- |
| D1 | Cadrage : une quinzaine de questions résolues restent ouvertes ; réponses obsolètes (conservation, tableau de bord du formateur, recherche globale, exception RIGEL, notifications) | Cocher ou marquer « réponse partielle » ; actualiser | 40 min |
| D2 | RG et fiches remises citent des sources internes (« décision de l'utilisateur » ×42, « cadrage § 23 ») | « (équipe, date) » ou « (client, date) » ; renvoi au PO-05 | 30 min |
| D3 | RG-92 donne RIGEL au super administrateur | « …avec RIGEL pour le gestionnaire et l'administrateur » | 5 min |
| D4 | Glossaire : manquent Alerte, Notification, Tableau de bord, Garantie, Catalogue ; mauvaise référence (RG-82) ; ligne 83 ambiguë | Cinq entrées, référence, reformulation | 20 min |
| D5 | DSE : pas de chapitre Interfaces externes ; exigences non fonctionnelles sans contraintes de la cible (puits de logs, `/api/health`, `/api/infos`), journalisation, données personnelles ; pas de priorité par exigence ; statistiques « à définir » alors que l'application les calcule (RG-68, PO-03) | Chapitre, exigences, colonne priorité, indicateurs | 60 min |
| D6 | Exigence formulée pour l'équipe : « Firefox depuis les postes de l'équipe » (DSE ENF-01, fiches) | « postes des écoles » | 10 min |
| D7 | Fiche administrateur l. 393-396 : traitement réservé au gestionnaire, contre RG-64 ; fiche super administrateur l. 349 sans les matériels à déplacer | Reformuler | 10 min |
| D8 | DSE et DAT en PDF antérieurs aux dernières sources (RG-39, fiches, diagrammes) | Une seule régénération, après les corrections | 15 min |

### 3.4. Diagrammes

| N° | Problème | Correction | Effort |
| --- | --- | --- | --- |
| U1 | Multiplicités divergentes entre niveaux : auteur d'une remontée (1 / 0..1), déplacement (historique / en cours et dernière installation), Processus programme ou exécution | Aligner, ou nommer « Exécution » le processus de l'analyse et de la conception | 40 min |
| U2 | Conception sans Déplacement, Détection, Étage ni Installation ; « OperationRigel » au lieu d'« Operation » | Ajouter les classes, renommer | 45 min |
| U3 | Séquence détaillée RIGEL contraire au code : relais et connecteur absents, méthode `rigel.instantane` inexistante | Lignes de vie relais et connecteur, ordre réel | 30 min |
| U4 | États : pseudo-état initial à deux sorties, gardes sur la transition initiale, transitions sans événement | Choix après un seul initial ; événements `when(…)` | 30 min |
| U5 | Le modèle physique ne découle pas visiblement du MCD (JSONB, bâtiment, système, paquet…) | Tableau de correspondance au DSE § 10.3 | 30 min |
| U6 | Activités métier : décision à gardes non exclusives, décisions servant de fusion | Gardes exclusives, nœuds de fusion | 30 min |
| U7 | La solution d'administration des postes porte trois noms | Le nom du glossaire partout | 20 min |
| U8 | Notification des matériels à déplacer adressée au seul gestionnaire (08, séquence système 4) ; aucun cas d'utilisation associé | Gestionnaire, administrateur et super administrateur ; cas « Recevoir une notification des matériels à déplacer » | 30 min |

### 3.5. Remise et organisation

| N° | Problème | Correction | Effort |
| --- | --- | --- | --- |
| R1 | Backlog GitHub reconstitué les 13 et 14 novembre (124 tickets sur 166) ; burndown plat au sprint 1 ; « chaque ticket cite la tâche et les commits » inexact | Assumer et dater la reconstitution ; nuancer ; préparer l'argument oral | 30 min |
| R2 | Documents d'organisation remis encore au 14 novembre, colonnes « prévu », langage interne (« l'utilisateur ») et mentions du démonstrateur (journal l. 72, 173-174) | Mettre à jour au 16 novembre ; reformuler | 30 min |

## 4. Ordre de traitement proposé pour le 17 novembre

1. Sécurité et règles serveur : A1, A2, A3, A4, puis C3 (environ 1 h 15).
2. Exigences du sujet : C1, C5, C4, D5, T5 (environ 4 h).
3. Cohérence documentaire : D1, D2, D3, D6, D7, A5, T1 à T4 (environ 2 h).
4. Diagrammes, selon le temps : U8, U7, U3, U1, U2 (environ 2 h 30).
5. Organisation : C6, R1, R2 (environ 2 h 30).
6. Une seule régénération du DSE et du DAT (D8), configurations jointes (C2), vérifications, puis fusion dans `main` (C7).

Le support de la présentation (C8) suit, pour le 18 novembre.
