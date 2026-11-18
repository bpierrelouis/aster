# ORION — Conducteur de la présentation finale du 19 novembre 2026

**Durée : 25 minutes d’exposé**, démonstration comprise, puis questions. Une personne tient la navigation du diaporama et de l’application (bascule par `Alt`+`Tab`), une autre surveille le temps.

**Minutage.** `py -3 minutage.py CONDUCTEUR.md` calibre la parole à environ 150 mots par minute, ajoute 1 s par révélation et 5 s par passage de parole. Pendant la démonstration, parole et manipulation se chevauchent : chaque étape retient la durée la plus longue des deux. Les horaires, arrondis à 5 s, restent des repères à confirmer par une répétition chronométrée.

Touches : `→` ou `Espace` révèle le bloc suivant, puis passe à la diapositive suivante ; `←` revient ; `N` affiche l’orateur et le minutage ; `F` plein écran. Chaque bloc n’apparaît qu’à notre action : l’orateur annonce, puis révèle.

## Répartition

| Orateur | Passage | Diapositives | Horaire | Durée |
| --- | --- | --- | --- | --- |
| SGT LE MAITRE | Ouverture, histoire, équipe, besoin, organisation | 1 à 6 | 0:00 → 3:20 | 3 min 20 |
| SCH BAELDE | Pile logicielle, architecture cible, fonctionnement | 7 à 9 | 3:20 → 5:30 | 2 min 10 |
| SGT PHOMMAVONGSA | Fil rouge et démonstration formateur | 10, 11 + application | 5:30 → 7:40 | 2 min 10 |
| SGT BONEY | Démonstration gestionnaire : import, RIGEL | 12 + application + téléphone | 7:40 → 10:05 | 2 min 25 |
| SCH VILBERT-TAHON | Démonstration administrateur ; récapitulatif | 13, 14 + application | 10:05 → 12:10 | 2 min 05 |
| SCH BAELDE | Difficultés | 15 | 12:10 → 13:15 | 1 min 05 |
| SCH VILBERT-TAHON | Évolutions, conclusion | 16, 17 | 13:15 → 14:45 | 1 min 30 |
| — | Marge pour les aléas de la démonstration | | 14:45 → 25:00 | 10 min 15 |

Passage de parole : chaque orateur termine par une phrase qui appelle le suivant **par son grade et son nom**, jamais par son prénom (en italique ci-dessous). Les prénoms Thomas, Sophie et Julien désignent les personnages de la démonstration. Les crochets sont des gestes, pas des paroles. Les diapositives ne portent que des mots-clés ; le public écoute l’orateur. Les étapes de démonstration sont dites, pas affichées.

## Préparation (la veille et une heure avant)

La démonstration se joue dans la salle de la présentation, **salle 119 du bâtiment 201** (École du numérique), créée par le jeu de démonstration (version 24, `DEMONSTRATION` dans `application/outils/donnees-demonstration/jeu.ts`) :

| Élément | Valeur |
| --- | --- |
| Bâtiment 201 | Rez-de-chaussée : amphithéâtre et salles 001 à 010 ; 1er étage : 101 à 120 ; 2e étage : 201 à 220 |
| Salle | 1er étage, salle 119 ; 14 postes `119-PC01` à `119-PC14`, tous allumés, session ouverte |
| Matériels | 41, tous en service ; étiquettes réelles : unités centrales des postes 7, 8 et 12 (`SS4SG0457`, `SS4SG0495`, `SS4SG0589`) et quatre écrans Philips ; recensés le 18 novembre : unités centrales des postes 1 à 4 (`S4SG0609`, `S4SG0263`, `S4SG0512`, `SS4SG0564`) et deux écrans Acer |
| Remontées de la salle | `REM-0148` vidéoprojecteur, corrigée ; `REM-0163` clavier, remplacé ; `REM-0176` câble réseau, en cours ; `REM-0177` souris, en attente (Hugo Fontaine) |
| Écran en panne (Thomas) | `MAT-0001`, Philips 242V8A, n° de série `UHB2039018980` |
| Logiciel interdit, déjà arrêté | Steam sur `119-PC05`, arrêté par ORION dès le premier rapport |
| Logiciel non référencé | Discord sur `119-PC03`, tourne jusqu’à ce que Thomas l’arrête ; le simulateur ne le relance pas |
| Écran de remplacement (Sophie) | `MAT-2033`, Philips 242V8A, n° de série `UHB2032009637`, en stock |
| Livraison du CND (Sophie) | [IMPORT-CND.json](IMPORT-CND.json) : 4 unités centrales Lenovo et 2 écrans Philips nouveaux, plus l’écran du stock `UHB2049004779`, déjà présent (non traité) |
| Application de la formation (Julien) | IntelliJ IDEA, absente des postes de la salle (image de référence seule) |

- Application déployée sur les VM, données rechargées en version 24 (le service `api` les recharge au déploiement ; sinon `npm run donnees:demo -- --reinitialiser`). Vérifier : Salles › bâtiment 201 › 119, 14 postes allumés.
- Ne rien modifier dans la salle 119 pendant les répétitions, ou recharger les données après la dernière répétition. Le rechargement efface aussi les matériels importés, l’ambiance choisie par Thomas et le tableau de bord personnalisé de Julien ; sinon, remettre l’ambiance Orion de Thomas et la disposition par défaut de Julien (Personnaliser › Disposition par défaut), et l’import ne trouverait plus que des matériels déjà présents.
- Trois onglets connectés avant de commencer, un par compte de présentation : Thomas (formateur), Sophie (gestionnaire), Julien (administrateur). Vérifier qu’ils sont encore connectés (30 minutes d’inactivité).
- [IMPORT-CND.json](IMPORT-CND.json) copié sur le poste de présentation, dans un dossier facile à atteindre depuis le sélecteur de fichier.
- Téléphone chargé, caméra autorisée, RIGEL déjà ouvert une fois.
- Imprimer [ETIQUETTES-DEMO.html](ETIQUETTES-DEMO.html) : QR de la salle 119, du stock et de l’écran `MAT-2033`. Coller l’étiquette de l’écran sur un écran posé dans la salle, qui joue l’écran de remplacement.
- Simulateur des postes actif : les postes de la salle 119 exécutent toujours les interventions et arrêtent les processus demandés, en quelques secondes.
- Projection : diaporama et application sur le même écran, plein écran ; téléphone montré par la webcam ou un miroir d’écran, sinon commenté à voix haute.
- Plan B : captures des écrans clés (`design/maquettes/captures/`) dans un onglet.

## SGT LE MAITRE — 0:00 → 3:20

### 1 — Écran d’attente

Diapositive vide, affichée pendant l’installation ; on avance pour lancer l’animation du logo.

### 2 — Couverture · 0:00 → 0:25

Bonjour à toutes et à tous. Nous sommes l’équipe ASTER, et nous vous présentons ORION : l’outil de recensement, d’intervention et d’observation numérique. ORION remplace les fichiers Excel des écoles par un outil unique, qui réunit le parc, les salles, les postes et ceux qui les utilisent. Au programme : notre organisation, la solution technique, une démonstration en direct dans cette salle, puis la suite du projet.

### 3 — Histoire · 0:25 → 1:05

Nos noms ne doivent rien au hasard. [Révéler.] ASTER, c’est l’équipe : une étoile à cinq branches. [Révéler.] ORION, c’est le produit : la constellation qui sert depuis toujours à s’orienter. C’est ce qu’on attend d’un outil de parc : savoir où est chaque matériel, et dans quel état. [Révéler.] RIGEL, l’étoile la plus brillante d’Orion, c’est le module mobile, celui qui va sur le terrain, téléphone en main. [Révéler.] Et M42, la nébuleuse d’Orion, c’est l’agent que nous proposons pour les postes Windows. Une seule identité, de l’écran de connexion jusqu’au téléphone.

### 4 — Équipe · 1:05 → 1:35

Ce produit, nous l’avons construit à cinq. [Révéler.] Le sergent-chef Baelde, Product Owner : le backlog, l’architecture et le déploiement. [Révéler.] Le sergent-chef Vilbert-Tahon : l’interface, les parcours et l’identité visuelle. [Révéler.] Le sergent Boney : la modélisation, la gestion du parc et les spécifications. [Révéler.] Moi-même, sergent Le Maitre, Scrum Master : le rythme de l’équipe et la remise. [Révéler.] Et le sergent Phommavongsa : les cycles de vie, la supervision des postes et la recette.

### 5 — Le besoin · 1:35 → 2:20

Le constat : dans les écoles, le parc se gère aujourd’hui dans des fichiers Excel. [Révéler.] Premier besoin : gérer le parc, savoir à tout moment où est chaque matériel et dans quel état. [Révéler.] Deuxième : administrer les postes à distance, installer un logiciel sur une salle entière sans passer de poste en poste. [Révéler.] Troisième : superviser les usages, voir ce qui tourne et arrêter ce qui est interdit. [Révéler.] Enfin, suivre les remontées des utilisateurs, du signalement à la réparation. Ce qu’ORION apporte : une information unique, à jour et tracée, partagée par le formateur, la gestionnaire et l’administrateur, chacun dans son périmètre.

### 6 — Organisation · 2:20 → 3:20

Nous avons travaillé en Scrum, avec des pratiques XP. [Révéler.] Les 22 et 23 octobre, l’entretien initial avec le client : deux jours pour comprendre le métier. [Révéler.] Le sprint 1, consacré à l’analyse : modèle métier, règles de gestion, droits, maquettes, et déjà un premier produit utilisable. [Révéler.] Le 4 novembre, la Review devant le client, sur ce premier produit centré sur les matériels. [Révéler.] Le 9, le sprint 2 : le développement. [Révéler.] Le 12, un second entretien pour arrêter les derniers points. [Révéler.] Puis la livraison et cette présentation. Un Product Owner arbitre le backlog, un Scrum Master tient la cadence, et chacun de nous a développé. Chaque matin, un point de quinze minutes. Et chaque version qui passe les tests automatisés est déployée sans intervention.

*Sergent-chef Baelde, la solution technique.*

## SCH BAELDE — 3:20 → 5:30

### 7 — Pile logicielle · 3:20 → 3:55

[Révéler la ligne applicative.] Un seul langage, TypeScript, du navigateur au serveur : les mêmes contrats de données sont vérifiés des deux côtés, et une seule compétence suffit pour maintenir l’ensemble. React pour l’interface, Node.js et Express pour l’API. Toutes les règles métier sont côté serveur : droits, contrôles, numérotation. [Révéler la ligne d’infrastructure.] PostgreSQL pour les données, HAProxy en entrée, Apache pour servir l’interface, Logstash pour centraliser les journaux. Toutes ces briques sont admises sur le C1NP par le cadre de cohérence technique du ministère.

### 8 — Architecture cible · 3:55 → 4:45

Voici l’architecture cible affichée. Tout commence dans le navigateur de l’utilisateur. [Révéler.] HAProxy constitue l’unique porte d’entrée, en HTTPS. [Révéler.] Un seul Apache sert les interfaces d’ORION et de RIGEL. [Révéler.] Un seul serveur Express porte l’API et toutes les règles métier. [Révéler.] PostgreSQL conserve les données, les sessions et le journal des écritures ; Express ne garde aucun état qui fasse autorité. [Révéler.] L’identité reste à MindefConnect : ORION ne stocke aucun mot de passe. [Révéler.] Les postes Windows remontent leur état par la même entrée. [Révéler.] Le téléphone RIGEL passe lui aussi par HAProxy et rejoint la même API. [Révéler.] Un front, un back, une base et une seule entrée : le parcours reste lisible de bout en bout.

### 9 — Fonctionnement · 4:45 → 5:30

Au quotidien, ORION fonctionne en boucle. [Révéler.] Le poste remonte son état : sessions, processus, logiciels installés. [Révéler.] ORION classe chaque processus : autorisé, interdit ou non référencé ; un processus interdit est arrêté automatiquement. [Révéler.] L’utilisateur demande une intervention : arrêter un processus, installer un logiciel, réinstaller une salle. [Révéler.] Le poste l’exécute et renvoie son résultat. Partout, le serveur fait foi : numéros, auteurs, dates et droits sont fixés par lui, jamais par le navigateur. Et quand deux personnes modifient en même temps, leurs écritures sont fusionnées : personne n’est bloqué.

*Sergent Phommavongsa, la démonstration.*

## SGT PHOMMAVONGSA — 5:30 → 7:40

### 10 — Fil rouge · 5:30 → 5:55

Une histoire : une rentrée, dans cette salle 119. [Révéler.] Thomas, formateur, prépare sa salle. [Révéler.] Sophie, gestionnaire, s’occupe des matériels de l’école. [Révéler.] Julien, administrateur, gère les postes et les règles. Chacun ne voit que ce qui le concerne, et la même information passe de l’un à l’autre, sans un seul fichier Excel.

### 11 — Scénario formateur · 5:55 → 7:40

[Révéler les étapes, puis basculer sur l’onglet de Thomas.]

1. **Connexion** — manipulation ≈ 8 s. « Thomas se connecte par le portail d’identité, MindefConnect en production : ORION ne gère aucun mot de passe. » [Afficher l’accueil.] « Son tableau de bord affiche ses salles, ses remontées et les postes allumés. »
2. **Son espace** — manipulation ≈ 12 s. [Menu du compte, en haut à droite ; une couleur dans la roue, puis le soleil ou la lune ; ambiance Minarm.] « Chacun règle ORION à sa main : couleur d’accent, mode clair ou sombre. Thomas choisit l’ambiance Minarm, aux couleurs des sites du ministère. Le réglage suit son compte, sur n’importe quel poste. » [Garder Minarm pour la suite.]
3. **Sa salle** — manipulation ≈ 8 s. [Salles › bâtiment 201 › 119.] « Voici la salle où nous sommes : le bâtiment 201 étage par étage, la salle 119 au premier. Quatorze postes allumés, les sessions ouvertes, chaque matériel à sa place. Thomas n’a rien saisi : tout vient de l’inventaire et des postes eux-mêmes. En un coup d’œil, il sait si sa salle est prête. »
4. **Un logiciel interdit** — manipulation ≈ 12 s. [Supervision, salle 119.] « Les processus, en temps réel. Sur le poste 5, Steam : il est interdit, ORION l’a arrêté dès le premier rapport et en garde la trace. » [Montrer `119-PC03`.] « Sur le poste 3, Discord : ni autorisé ni interdit, ORION le signale sans l’arrêter. Thomas n’en veut pas pendant son cours : il l’arrête. » [Bouton d’arrêt : « Arrêt demandé », puis Discord disparaît en quelques secondes.] « Le poste reçoit la demande, l’exécute, Discord disparaît. Mais rien n’empêche de le relancer demain : l’interdire revient à l’administrateur. » [Se tourner vers le sergent-chef Vilbert-Tahon.] « Julien, tu peux interdire Discord dans la salle ? » — SCH Vilbert-Tahon : « Je m’en occupe. »
5. **Un écran en panne** — manipulation ≈ 20 s. [Écran `MAT-0001` › **Signaler un problème**.] « Dernier point : un écran reste noir. Thomas le signale depuis la fiche du matériel. » [Type « Écran », description « L’écran reste noir alors que l’unité centrale démarre. », transmettre.] « La remontée part. Son numéro, son auteur et sa date sont fixés par le serveur. »

*La remontée est partie. Sergent Boney, c’est Sophie qui la reçoit.*

## SGT BONEY — 7:40 → 10:05

### 12 — Scénario gestionnaire et RIGEL · 7:40 → 10:05

[Révéler les étapes, puis basculer sur l’onglet de Sophie, téléphone à portée.]

1. **Prise en charge** — manipulation ≈ 10 s. [Cloche.] « Sophie est notifiée : la remontée de Thomas, sur l’écran MAT-0001. » [Remontées › **Prendre en charge** ; ouvrir l’état des lieux PDF.] « Elle la prend en charge. Si elle a besoin d’un document, l’état des lieux PDF est produit à la demande. »
2. **Une livraison du CND** — manipulation ≈ 15 s. [Matériels › Import JSON, choisir `IMPORT-CND.json`.] « Avant tout, Sophie enregistre la livraison du CND arrivée ce matin : elle importe le fichier, sans aucune saisie. » [Laisser l’analyse s’afficher.] « ORION l’analyse d’abord et rapproche chaque numéro de série de tout le parc. Six matériels sont nouveaux ; le septième, un écran, est déjà dans le stock : il ne sera pas créé deux fois. » [**Importer 6 matériels**.] « Chacun reçoit son identifiant ORION. »
3. **Un écran du stock** — manipulation ≈ 12 s. [Matériels › stock, écran `MAT-2033`, l’affecter à la salle 119.] « Pour remplacer l’écran, Sophie prend dans le stock un Philips du même modèle et l’affecte à la salle 119. » [Montrer le point orange.] « Le point orange : affecté, pas encore installé. ORION distingue ce qui est décidé de ce qui est réellement en place. »
4. **RIGEL dans la salle** — manipulation ≈ 45 s. [Salles › Déplacements, trajet Stock → 119, **Installer avec un téléphone**.] « Sophie se rend dans la salle avec son téléphone. Un QR code l’appaire à son compte, sans mot de passe. » [Téléphone : scanner l’appairage, le QR de la salle 119, puis l’étiquette de l’écran `MAT-2033`.] « Elle scanne l’étiquette de la salle, puis celle de l’écran posé. RIGEL lit les QR codes, les codes-barres et les Data Matrix. Plus de relevé papier, plus de ressaisie au retour. »
5. **Installation confirmée** — manipulation ≈ 35 s. [**Confirmer l’installation**, puis **Synchroniser** si besoin ; revenir sur ORION et attendre le vert, jusqu’à une demi-minute.] « Elle confirme. Sans réseau, le téléphone aurait gardé son travail jusqu’au retour de la connexion. Dans ORION, le point passe au vert : l’écran est en place, avec l’auteur et la date. »
6. **Thomas notifié** — manipulation ≈ 5 s. [Remontées › **Remplacé**.] « Sophie clôt la remontée : matériel remplacé, Thomas est notifié. Du signalement à la réparation, tout est tracé, sans ressaisie. »

Seulement si l’étape 6 se termine avant 9:20 au chronomètre, sinon le citer en une phrase : Matériels › Recensement, « Nouveau recensement » sur la salle 119, le bilan, la clôture. « Le même téléphone sert à l’inventaire d’une salle entière. »

*Sergent-chef Vilbert-Tahon, il manque le logiciel de la formation.*

## SCH VILBERT-TAHON — 10:05 → 12:10

### 13 — Scénario administrateur · 10:05 → 11:40

[Révéler les étapes, puis basculer sur l’onglet de Julien.]

1. **Les alertes** — manipulation ≈ 5 s. [Cloche.] « Julien ouvre ORION. Ses notifications résument la matinée : Steam arrêté sur le poste 5, l’écran de Thomas remplacé. »
2. **Son tableau de bord** — manipulation ≈ 20 s. [Accueil › **Personnaliser** › **Ajouter un widget**, « Matériels récemment enregistrés » ; le placer en tête, en grand ; **Terminé**.] « Il ajoute à son accueil les matériels récemment enregistrés : la livraison importée par Sophie y figure déjà. Chaque compte compose ses propres tableaux de bord. »
3. **Le logiciel interdit** — manipulation ≈ 20 s. [Supervision › Règles : Discord en liste noire, salle 119 ; enregistrer.] « Comme promis : Discord passe en liste noire pour la salle 119. Une règle vise l’école, un bâtiment ou une salle. S’il est relancé, ORION l’arrêtera de lui-même au rapport suivant, comme Steam ce matin. »
4. **L’installation sur toute la salle** — manipulation ≈ 15 s. [Administration › Interventions, installer IntelliJ IDEA sur la salle 119 ; suivre l’avancement.] « Reste le logiciel de la formation, IntelliJ IDEA. Julien demande l’installation pour toute la salle, en une fois. Les quatorze postes l’exécutent et renvoient leur résultat ; un poste éteint l’exécuterait à son retour. Julien est notifié à la fin. Ce qui demandait de passer sur chaque poste tient en une demande, avec un résultat vérifiable. »
5. **Un nouveau formateur** — manipulation ≈ 25 s. [Administration › Comptes, créer un formateur.] « Un nouveau formateur arrive : Julien crée son compte, avec son profil et son école. Aucun mot de passe : l’identité reste à MindefConnect. »

### 14 — Récapitulatif · 11:40 → 12:10

Trois métiers, une seule information. [Révéler.] Signaler : le formateur voit sa salle et signale un problème sans connaître le parc. [Révéler.] Réparer : la gestionnaire affecte et confirme, au bureau comme sur le terrain. [Révéler.] Équiper : l’administrateur fixe les règles et intervient sur les postes, résultats à l’appui.

*Sergent-chef Baelde, ce qui nous a résisté.*

## SCH BAELDE — 12:10 → 13:15

### 15 — Difficultés · 12:10 → 13:15

Trois contraintes, chacune levée. [Révéler.] MindefConnect n’était pas accessible pendant le projet. Nous avons utilisé un fournisseur d’identité de même protocole, OpenID Connect : le raccordement à MindefConnect relève de la configuration, pas du code. [Révéler.] L’agent des postes n’existe pas encore. Nous avons simulé les postes sur l’API prévue pour l’agent : toute la démonstration est passée par cette API. [Révéler.] Nos serveurs de démonstration n’étaient pas joignables depuis Internet : le téléphone passe par un relais aux échanges chiffrés. Sur le C1NP, il joindra ORION directement.

Et deux apprentissages. [Révéler.] Le scanner mobile : QR codes, codes-barres, Data Matrix, numéros de série, hors ligne, sur iOS comme sur Android ; il a fallu de nombreux essais. [Révéler.] L’organisation : le premier sprint a montré qu’il fallait un support partagé et une cadence tenue dès la première semaine ; nous l’avons corrigé pour le second.

*Sergent-chef Vilbert-Tahon, la suite.*

## SCH VILBERT-TAHON — 13:15 → 14:45

### 16 — Axes d’évolution · 13:15 → 14:00

La suite est cadrée, sur deux axes. Vers la production d’abord. [Révéler.] Le raccordement à MindefConnect et l’hébergement sur le C1NP. [Révéler.] L’agent des postes : M42, que nous proposons de développer, ou Configuration Manager si le ministère l’emploie déjà ; notre dossier d’architecture évalue les deux options. [Révéler.] Les statistiques d’utilisation des postes et des processus. Côté fonctionnel ensuite. [Révéler.] Les stages et formations : un matériel pourra être destiné à un type de stage ou de formation. [Révéler.] Le retrait d’un matériel plutôt que sa suppression, pour en garder l’historique. [Révéler.] Et les postes Linux, à côté des postes Windows.

### 17 — Conclusion · 14:00 → 14:45

Revenons à Thomas, Sophie et Julien. Avec ORION, le formateur voit sa salle et signale un problème en quelques clics. La gestionnaire suit chaque matériel, du stock à la salle, au bureau comme sur le terrain. L’administrateur équipe une salle entière en une seule demande. Le tout sur des briques admises sur le C1NP, avec un serveur qui fait foi et une architecture simple à exploiter. Ce que vous avez vu n’était pas une maquette : c’était l’application, déployée sur nos serveurs, avec un vrai téléphone. L’étape suivante que nous proposons : un pilote dans une école, sur le C1NP, avec MindefConnect. Merci de votre attention ; nous sommes à votre disposition pour vos questions.

## Aide-mémoire pour les questions

- **Pourquoi React et Node plutôt que Java ?** Contrats TypeScript partagés entre navigateur et serveur, chaîne unique, produits admis par le CCT sur le C1NP ; aucun besoin n’impose Java.
- **Hébergement ?** Cible : C1NP, avec HAProxy en entrée, Apache pour les interfaces, Express pour l’API, PostgreSQL pour les données et MindefConnect pour l’identité. Démonstrateur : dix VM Debian sous Docker Swarm, déploiement continu depuis la CI.
- **M42 ou Configuration Manager ?** Les deux options sont évaluées dans le DAT (§ 6.5) : Configuration Manager sans surcoût si les droits ministériels couvrent le parc, mais sans garantie de supervision continue des processus ; M42 estimé de 65 à 97 jours-hommes. Le choix se fait après un pilote en salle.
- **Pourquoi Keycloak dans la démonstration ?** Il tient lieu de MindefConnect, avec le même protocole OpenID Connect (code d’autorisation, PKCE) ; il n’authentifie que : le profil et l’école sont portés par ORION.
- **Sécurité ?** Session côté serveur (30 min d’inactivité), droits et périmètre contrôlés à chaque écriture, jeton propre à chaque poste, TLS à l’entrée, secrets hors des images, conteneurs sans privilèges, journaux transmis en TLS mutuel ; dans la cible, chiffrement jusqu’à Express et PostgreSQL.
- **Deux personnes modifient la même chose ?** Fusion élément par élément avec journal de révisions ; conflit signalé seulement sur le même élément.
- **Pourquoi JSONB pour les données des postes ?** Volume, évolution avec les rapports, fusion par élément ; référentiels et remontées restent relationnels (MLD du DSE).
- **L’OCR fonctionne ?** Lecture d’une bande de numéro de série par Tesseract, proposition corrigeable par l’utilisateur ; non éprouvée sur des étiquettes réelles.
- **Écarts avec les premières demandes du client ?** Choix d’équipe au-delà de la V1 (administrateur qui crée des remontées, import JSON contrôlé, recensement RIGEL) ; consignés au cadrage et soumis au client.
