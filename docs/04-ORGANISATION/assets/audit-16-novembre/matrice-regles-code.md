# Matrice de lecture des règles de gestion RG-01 à RG-100

Annexe de l’[audit avant rendu du 16 novembre](../../31-AUDIT-AVANT-RENDU-16-NOVEMBRE.md). Révision auditée : 3fbaa9a. Chaque référence localise un mécanisme ou un rendu lu ; elle ne vaut pas test réussi de chaque proposition de la règle. Les parcours métier des deux modes convergent vers `backend/domaine/espace.ts` ; les dépendances externes (Windows, MindefConnect) restent distinctes. Les règles d’affichage ont naturellement des traces côté navigateur, après filtrage serveur.


| Règle | Référence documentaire explicite (hors définition) | Trace du code | Conclusion de lecture / limite |
| --- | --- | --- | --- |
| RG-01 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md:214` | `application/backend/domaine/comptes.ts:44` | Profil contrôlé serveur |
| RG-02 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md:238` | `application/backend/domaine/parc.ts:49` | Bornes étage et bâtiment contrôlés ; entités explicites du MCD représentées par champs/collection étages |
| RG-03 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md:71` | `application/backend/domaine/parc.ts:26` | Numéro fixé serveur ; collision interne à suivre rapport code |
| RG-04 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md:71` | `application/backend/domaine/import.ts:94` | Série facultative ; rapprochement si renseignée |
| RG-05 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md:71` | `application/backend/domaine/parc.ts:16` | Modèle, dateRéception et booléen exigés |
| RG-06 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md:71` | `application/backend/domaine/parc.ts:16` | Désignation texte libre non vide |
| RG-07 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md:71` | `application/backend/domaine/import.ts:94` | Marque absente initialisée à null |
| RG-08 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md:71` | `application/backend/domaine/import.ts:94 ; application/backend/domaine/parc.ts:16` | Défaut false import ; écriture workspace exige booléen, défaut fourni par formulaire |
| RG-09 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md:71` | `application/backend/domaine/parc.ts:17` | Salle de l’école ou stock null |
| RG-10 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md:71` | `application/backend/domaine/parc.ts:17 ; application/shared/types.ts` | Modèle matériel sans destination personne |
| RG-11 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md:140` | `application/backend/domaine/remontees.ts:42` | Description et au moins un matériel exigés |
| RG-12 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md:140` | `application/backend/documents/pdf.ts:145` | Lieu dérivé des matériels du document produit |
| RG-13 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:71` | `application/backend/domaine/remontees.ts:25` | Transitions serveur, étape obligatoire |
| RG-14 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md:140` | `application/backend/documents/pdf.ts:145` | Contenu PDF ; tests PDF principaux exécutés par agent principal |
| RG-15 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:36` | `application/backend/domaine/espace.ts:133 ; application/backend/domaine/remontees.ts:26 ; application/backend/domaine/recensement.ts:46` | Contrôles admin/global/gestionnaire ; RG15 ne rappelle pas exception RIGEL, RG92–94 précisent |
| RG-16 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:44` | `application/backend/domaine/espace.ts:55` | École de rattachement appliquée |
| RG-17 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:34` | `application/backend/domaine/espace.ts:136` | Écritures parc autorisées hors formateur, suppression admin seulement |
| RG-18 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:45` | `application/backend/domaine/parc.ts:33` | Affectation et déplacement serveur |
| RG-19 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:83` | `application/backend/domaine/postes.ts:157` | Formateur autorisé arrêt utilisateur |
| RG-20 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:83` | `application/backend/domaine/postes.ts:62 ; application/outils/simulateur-postes/agents.ts:31` | Contrat agent : processus transmis déclarés utilisateur ; pas classificateur système serveur indépendant |
| RG-21 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:67` | `application/backend/domaine/remontees.ts:19` | Création refusée gestionnaire ; stock refusé formateur |
| RG-22 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:95` | `application/backend/domaine/postes.ts:169` | Cibles d’une seule salle, image imposée |
| RG-23 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:69` | `application/backend/persistance/engine.ts:124 ; application/backend/domaine/espace.ts:60` | PDF limité à remontée visible |
| RG-24 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:47` | `application/frontend/src/espace/core/permissions.ts:30` | Droit d’affichage tableau ; serveur filtre données |
| RG-25 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md:71` | `application/backend/domaine/espace.ts:111` | Écriture directe après contrôles, pas second valideur |
| RG-26 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:45` | `application/backend/domaine/parc.ts:33` | Salle affectée immédiatement, déplacement physique distinct |
| RG-27 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:45` | `application/backend/domaine/espace.ts:120` | Collections traitées ensemble, plusieurs matériels |
| RG-28 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:54` | `application/backend/domaine/import.ts:69` | Import de nouveaux matériels avec droits/perimètre |
| RG-29 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:6` | `application/backend/domaine/import.ts:71 ; application/backend/api/routes.ts:33` | Bornes2000éléments/8 Mo ; validation domaine des nouvelles lignes |
| RG-30 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:95` | `application/backend/domaine/postes.ts:176 ; application/outils/simulateur-postes/agents.ts:116` | Image référence imposée ; exécution réelle Windows hors réalisation M42 |
| RG-31 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md:68` | `application/backend/domaine/postes.ts:48` | Rapport poste utilisateur/processus |
| RG-32 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:83` | `application/backend/domaine/postes.ts:62 ; application/outils/simulateur-postes/agents.ts:31` | Même limite contrat agent que RG20 |
| RG-33 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:84` | `application/backend/domaine/postes.ts:170` | Processus en cours et un arrêt en attente ; résultat applyResults |
| RG-34 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/13-FICHE-DESCRIPTIVE-GESTIONNAIRE.md:140` | `application/backend/documents/pdf.ts:145` | Localisation depuis matériels au moment production |
| RG-35 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:77` | `application/backend/persistance/engine.ts:124` | PDF produit à la demande sans stockage |
| RG-36 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:47` | `application/frontend/src/espace/core/selectors.ts:93` | Agrégats parc ; affichage spécialisé, RG36 mise à jour |
| RG-37 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:121` | `application/frontend/src/espace/core/notifications.ts:46` | Notifications calculées et rendues navigateur, sur données déjà filtrées serveur |
| RG-38 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:75` | `application/frontend/src/espace/core/notifications.ts:46` | Canal interface ; aucun chemin courriel identifié dans périmètre lu |
| RG-39 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:75` | `application/frontend/src/espace/core/notifications.ts:94` | Interventions propres et blacklist ; évolution propres remontées ligne78 |
| RG-40 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md:155` | `application/backend/domaine/postes.ts:147` | Unité centrale matériel reliée poste, domaines séparés |
| RG-41 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md:68` | `application/shared/referentiels.ts:106 ; application/backend/domaine/postes.ts:71` | Classement par nom insensible casse ; exécutions stockées, programme conceptuel dénormalisé |
| RG-42 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md:68` | `application/backend/domaine/postes.ts:71` | Date première observation serveur ; exécutions arrêtées conservées1h technique, détections30j |
| RG-43 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md:68` | `application/backend/domaine/postes.ts:71` | Compte Windows dénormalisé chaîne nom, aucune table/idCompteurWindows dédiée dans MPD actuel |
| RG-44 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md:68` | `application/backend/domaine/postes.ts:71 ; application/frontend/src/espace/core/selectors.ts` | Contexte poste/lieu/compte ; statut intervention depuis données serveur |
| RG-45 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md:68` | `application/shared/referentiels.ts:111` | Trois classements |
| RG-46 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md:68` | `application/shared/referentiels.ts:111` | Tout absent blacklist autorisé |
| RG-47 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:85` | `application/shared/referentiels.ts:109 ; application/backend/domaine/espace.ts:169` | Portées appliquées ; validation contenu règles lacunaire, anomalie majeure rapport code |
| RG-48 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md:68` | `application/shared/referentiels.ts:111` | Cumul des règles, une blacklist suffit |
| RG-49 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md:68` | `application/shared/referentiels.ts:111` | Blacklist prioritaire |
| RG-50 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:85` | `application/backend/domaine/espace.ts:134 ; application/backend/domaine/espace.ts:169` | Droits admin école/global contrôlés ; lacune validation voir RG47 |
| RG-51 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md:68` | `application/backend/domaine/postes.ts:74` | Whitelist pas de détection ; exécution temporaire de traitement reste1h après arrêt |
| RG-52 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md:68` | `application/backend/domaine/postes.ts:75` | Nonref détection conservée |
| RG-53 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md:68` | `application/backend/domaine/postes.ts:78` | Intervention automatique blacklist liée détection |
| RG-54 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md:68` | `application/backend/domaine/postes.ts:78` | Aucune confirmation utilisateur |
| RG-55 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:86` | `application/frontend/src/espace/core/notifications.ts:94 ; application/backend/domaine/espace.ts:58` | Notification admin ; formateur données de son école accessibles vue salle |
| RG-56 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md:98` | `application/backend/domaine/postes.ts:75 ; application/backend/domaine/postes.ts:89` | Salle figée et30j ; modèle conceptuel ne matérialise pas salle historique(D06) |
| RG-57 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md:68` | `application/outils/simulateur-postes/agents.ts:71` | Émulateur toutes3s ; exigence5s cible non exercée poste réel |
| RG-58 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md:68` | `application/backend/domaine/postes.ts:93` | Déconnexion30s et fin processus |
| RG-59 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:83` | `application/backend/domaine/espace.ts:55 ; application/frontend/src/espace/core/permissions.ts:38` | École serveur ; sélection salle dans vue formateur, données école autorisées |
| RG-60 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md:214` | `application/backend/domaine/comptes.ts:46` | Superadmin sans école, autres profil école requise |
| RG-61 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md:238` | `application/backend/domaine/parc.ts:49` | Salle nom/bâtiment/étage obligatoire |
| RG-62 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md:214` | `application/backend/index.ts:135` | OIDC ; Keycloak substitut local, intégration MindefConnect cible non exercée |
| RG-63 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md:137` | `application/backend/domaine/remontees.ts:21` | Auteur unique fixé serveur |
| RG-64 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:68` | `application/backend/domaine/remontees.ts:25` | Gestionnaire seul et historique transitions |
| RG-65 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:94` | `application/backend/domaine/postes.ts:157 ; application/backend/domaine/postes.ts:175` | Installation/désinstallation admin, application référentiel |
| RG-66 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:75` | `application/frontend/src/espace/core/notifications.ts:78` | Évolution des seules remontées de l’auteur |
| RG-67 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:75` | `application/frontend/src/espace/core/notifications.ts:52` | Nouvelles remontées gestionnaire, fenêtre semaine |
| RG-68 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:87` | `application/frontend/src/espace/core/permissions.ts:30` | Statistiques réservées admin ; indicateurs cible encore à définir selon RG68 |
| RG-69 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:34` | `application/backend/domaine/espace.ts:53 ; application/backend/domaine/espace.ts:55` | Multi-école superadmin et filtrage école pour autres |
| RG-70 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:103` | `application/backend/domaine/comptes.ts:40 ; application/backend/domaine/espace.ts:134` | Gestion comptes admin et rattachement contrôlé |
| RG-71 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md:214` | `application/backend/domaine/comptes.ts:44` | Un seul champ profil appartenant catalogue |
| RG-72 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:45` | `application/backend/domaine/parc.ts:17 ; application/backend/domaine/import.ts:99` | École matérielle et salle, transfert validé explicite |
| RG-73 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:46` | `application/backend/domaine/espace.ts:138` | Matériel cité conservé |
| RG-74 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:35` | `application/backend/domaine/espace.ts:134` | Gestion lieux admin |
| RG-75 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:35` | `application/backend/domaine/espace.ts:188 ; application/backend/domaine/espace.ts:189` | Suppression salle interdit poste ; passage stock demandé par interface dans même écriture |
| RG-76 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:36` | `application/backend/domaine/espace.ts:133` | Écoles superadmin |
| RG-77 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:97` | `application/backend/domaine/espace.ts:141 ; application/backend/domaine/postes.ts:176` | Administration poste ; catalogue affiché référentiel, gestion UI catalogue absenteV1 |
| RG-78 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:34` | `application/backend/domaine/espace.ts:136` | Parc lecture seule formateur |
| RG-79 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:67` | `application/backend/domaine/remontees.ts:19 ; application/backend/domaine/espace.ts:144 ; application/backend/domaine/espace.ts:168` | Identité/auteur/date/statut, suppression interdite et école inchangée |
| RG-80 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:68` | `application/backend/domaine/espace.ts:60` | Formateur ses remontées, autres école/global |
| RG-81 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:94` | `application/backend/domaine/postes.ts:166 ; application/backend/domaine/postes.ts:138 ; application/backend/domaine/espace.ts:143` | 1–500cibles, résultat par poste, fin succès/échec, suppression refusée |
| RG-82 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:103` | `application/backend/domaine/comptes.ts:49 ; application/backend/domaine/comptes.ts:50 ; application/backend/domaine/espace.ts:142` | Email unique, protections auto-compte, pas suppression |
| RG-83 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:83` | `application/backend/domaine/espace.ts:58` | Supervision exclue gestionnaire |
| RG-84 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:28` | `application/backend/domaine/espace.ts:195` | Préférences compte et école affichée superadmin |
| RG-85 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/15-FICHE-DESCRIPTIVE-ADMINISTRATEUR.md:214` | `application/backend/domaine/comptes.ts:16 ; application/backend/index.ts` | Compte actif relu session ; tests e2e agent principal |
| RG-86 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:119` | `application/frontend/src/espace/core/selectors.ts:45 ; application/frontend/src/espace/core/notifications.ts:65` | Proximité garantie182jours équivaut approximation6mois ; seul gestionnaire notifié |
| RG-87 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:45` | `application/backend/domaine/parc.ts:20 ; application/backend/domaine/recensement.ts:295` | Déplacement HS vers salle refusé ; création HS salle non traitée comme déplacement |
| RG-88 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/14-FICHE-DESCRIPTIVE-FORMATEUR.md:68` | `application/backend/domaine/postes.ts:181` | PosteUC hors service éteint et processus arrêtés |
| RG-89 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:69` | `application/backend/documents/pdf.ts:145 ; application/shared/catalog.ts:81` | Statut et suivi PDF produit sans conservation |
| RG-90 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:97` | `application/backend/domaine/postes.ts:147` | Champ materielId unique par poste ; unicité inverse matériel→poste non contrôlée, MCD cardinalité0..1 à qualifier |
| RG-91 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:46` | `application/backend/domaine/espace.ts:138 ; application/backend/domaine/espace.ts:140` | Suppression stock non cité seulement |
| RG-92 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:48` | `application/backend/domaine/parc.ts:40 ; application/backend/domaine/recensement.ts:132` | Confirmation gestionnaire, clôture auto installation |
| RG-93 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:57` | `application/backend/domaine/recensement.ts:51 ; application/backend/domaine/espace.ts:145` | Recensement gestionnaire14j, suppression/réouverture refusées |
| RG-94 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:55` | `application/backend/domaine/recensement.ts:151 ; application/backend/domaine/recensement.ts:277` | Appairage et refus observation dépassée ; stockage offline mobile |
| RG-95 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:59` | `application/backend/domaine/recensement.ts:255 ; application/backend/domaine/espace.ts:146` | Création code inconnu serveur, constats conservés |
| RG-96 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:58` | `application/backend/domaine/recensement.ts:280` | Lieu ouvert et relocalisation/déplacement selon action |
| RG-97 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:112` | `application/backend/domaine/espace.ts:197` | Affichage propre au compte conservé serveur |
| RG-98 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:110` | `application/frontend/src/espace/views/shell/shell-menus.tsx:121 ; application/backend/domaine/espace.ts:62` | Recherche casse ignorée sur données visibles ; stock exclu formateur |
| RG-99 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:113` | `application/backend/index.ts:190` | Session détruite puis end-sessionOIDC, journalisation |
| RG-100 | `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/12-MATRICE-DROITS.md:104` | `application/backend/domaine/comptes.ts:33 ; application/backend/index.ts:88` | Amorçage unique sans compte, adresse exploitant |
