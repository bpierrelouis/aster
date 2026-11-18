# ORION — Conducteur de la présentation finale du 19 novembre 2026

**Durée : 25 minutes d’exposé**, démonstration comprise, puis questions. Les horaires sont des objectifs de répétition ; les textes sont calibrés pour environ 130 mots par minute, et les durées indiquées dans les démonstrations comprennent les manipulations. Une personne tient la navigation du diaporama et de l’application (bascule par `Alt`+`Tab`), une autre surveille le temps.

Touches : `→` ou `Espace` révèle le bloc suivant, puis passe à la diapositive suivante ; `←` revient ; `N` affiche l’orateur et le minutage ; `F` plein écran. Chaque bloc n’apparaît qu’à notre action : l’orateur annonce, puis révèle.

## Répartition

| Orateur | Passage | Diapositives | Horaire | Durée |
| --- | --- | --- | --- | --- |
| LE MAITRE | Ouverture, histoire, équipe, besoin, organisation | 1 à 6 | 0:00 → 5:00 | 5 min |
| BAELDE | Pile logicielle, architecture animée, fonctionnement | 7 à 9 | 5:00 → 8:30 | 3 min 30 |
| PHOMMAVONGSA | Fil rouge et démonstration formateur, thème | 10, 11 + application | 8:30 → 12:30 | 4 min |
| BONEY | Démonstration gestionnaire : import JSON, RIGEL | 12 + application + téléphone | 12:30 → 17:10 | 4 min 40 |
| VILBERT-TAHON | Démonstration administrateur : tableau de bord, règles, installation, comptes ; récapitulatif | 13, 14 + application | 17:10 → 21:15 | 4 min 05 |
| BAELDE | Difficultés | 15 | 21:15 → 22:45 | 1 min 30 |
| VILBERT-TAHON | Évolutions, conclusion | 16, 17 | 22:45 → 24:30 | 1 min 45 |
| — | Marge | | 24:30 → 25:00 | 30 s |

Transitions : chaque orateur termine par une phrase qui annonce le suivant et son sujet (en italique). Les crochets sont des gestes, pas des paroles. Le texte n’est pas sur les diapositives : elles ne portent que des mots-clés, révélés le long d’une ligne guide ; le public écoute l’orateur. Les étapes de démonstration ci-dessous sont dites, pas affichées.

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

## LE MAITRE — 0:00 → 5:00

### 1 — Écran d’attente

Diapositive vide, affichée pendant l’installation ; on avance pour lancer l’animation du logo.

### 2 — Couverture · 0:00 → 0:45

Bonjour à toutes et à tous, et merci d’être là. Nous sommes l’équipe ASTER, et nous allons vous présenter ORION : l’outil de recensement, d’intervention et d’observation numérique. Derrière ce nom, une idée simple : réunir enfin dans un seul outil le parc informatique des écoles de formation, les matériels, les salles, les postes et ceux qui les utilisent.

Nous avons vingt-cinq minutes. D’abord d’où vient ORION, qui l’a construit et comment nous nous sommes organisés. Ensuite ce qu’il y a sous le capot. Puis le cœur de la présentation : une démonstration en direct, ici même. Et pour finir, ce qui nous a résisté et la suite.

### 3 — Histoire · 0:45 → 1:45

Un mot sur les noms, parce qu’ils ne doivent rien au hasard. Tout part d’une étoile. [Révéler.] ASTER, c’est nous : une équipe, et une étoile à cinq branches. [Révéler.] ORION, c’est le produit : la constellation que l’on reconnaît du premier coup d’œil, celle qui sert depuis toujours à s’orienter. C’est exactement ce qu’on attend d’un outil de parc : savoir où l’on est et ce qui s’y trouve. [Révéler.] Dans cette constellation, RIGEL est l’étoile la plus brillante : c’est notre module mobile, celui qui quitte le bureau et va sur le terrain, dans les salles, téléphone en main. [Révéler.] Et M42, la nébuleuse d’Orion, c’est l’agent qui vit dans chaque poste Windows et qui nous parle. Une marque, une étoile, un seul bleu : vous retrouverez la même identité de l’écran de connexion jusqu’au téléphone. Ce n’est pas un prototype, c’est un produit.

### 4 — Équipe · 1:45 → 2:30

Ce produit, nous l’avons construit à cinq. [Révéler carte par carte.] Pierre-Louis, Product Owner : le backlog, l’architecture et le déploiement. Alexandre : l’interface, les parcours utilisateurs et l’identité visuelle que vous voyez à l’écran. Brandon : la modélisation, la gestion du parc et le dossier de spécifications. Moi-même, Louis, Scrum Master : le rythme de l’équipe, la remise et cette présentation. Et Sacha : les cycles de vie, la supervision des postes et la recette, profil par profil. Vous entendrez chacun d’entre nous aujourd’hui.

### 5 — Le besoin · 2:30 → 3:30

Le point de départ, c’est votre sujet. Aujourd’hui, dans les écoles, le matériel se gère dans des fichiers Excel. L’objectif : les remplacer par un outil centralisé, fiable, adapté à chaque acteur de la formation, du formateur à l’administrateur. [Révéler.] Premier besoin : gérer le parc, savoir à tout moment où est chaque matériel et dans quel état. [Révéler.] Deuxième : administrer les postes à distance, installer un logiciel ou réinstaller une salle sans passer de poste en poste. [Révéler.] Troisième : superviser leur utilisation, voir ce qui tourne et arrêter ce qui est interdit. [Révéler.] Et un fil commun aux trois : les remontées des utilisateurs, suivies du signalement jusqu’à la réparation, avec un état des lieux PDF à la demande.

### 6 — Organisation · 3:30 → 5:00

Pour y arriver, nous avons travaillé en Scrum, avec des pratiques XP. [Révéler l’entretien initial.] Tout commence par l’entretien initial avec le client, les 22 et 23 octobre : deux journées pour comprendre le métier. [Révéler les vacances et le sprint 1.] Au retour des vacances, le sprint 1, consacré à l’analyse : modèle métier, règles de gestion, droits, maquettes, et déjà un premier produit utilisable. [Révéler la Review.] Le 4 novembre, la Review devant le client, sur ce MVP centré sur la gestion des matériels. Il a été très satisfait, au point de nous demander davantage de choix de direction artistique. [Révéler le sprint 2.] Le 9 novembre, le sprint 2 : le développement. [Révéler l’entretien du 12.] Un nouvel entretien client, le 12, a précisé les derniers points. [Révéler la livraison.] Puis la livraison et cette présentation.

Au quotidien : un Product Owner, qui porte la vision et arbitre le backlog ; un Scrum Master, qui protège le rythme ; cinq développeurs, puisque chacun de nous a codé. Un Daily de quinze minutes à neuf heures. Et, côté XP, des tests automatisés et une intégration continue qui déploie chaque version. Ce que nous en retenons : le cadre ne suffit pas. Il faut un support partagé et quelqu’un qui tient la cadence dès la première semaine. C’est ce que nous avons corrigé entre les deux sprints.

*Pierre-Louis, qu’est-ce qu’il y a sous le capot ?*

## BAELDE — 5:00 → 8:30

### 7 — Pile logicielle · 5:00 → 6:00

[Révéler la ligne applicative.] Une seule langue, TypeScript, du navigateur au serveur. Ce n’est pas un détail : les mêmes contrats de données sont vérifiés des deux côtés, et une même équipe passe de l’interface à l’API sans changer d’outil. React pour l’interface. Node.js et Express pour l’API, et surtout pour toutes les règles métier : droits, contrôles, numérotation, tout est côté serveur. [Révéler la ligne d’infrastructure.] PostgreSQL pour les données. HAProxy, l’entrée unique, qui chiffre les échanges. Apache, qui sert les fichiers de l’interface. Et Logstash, qui centralise les journaux. Toutes ces briques figurent dans le cadre de cohérence technique du ministère : rien d’exotique à faire valider pour passer en production.

### 8 — Architecture animée · 6:00 → 7:30

Comment ces briques travaillent ensemble. [Étape 1.] Tout commence dans le navigateur de l’utilisateur. [Étape 2.] Il n’a qu’une seule porte : HAProxy, en HTTPS. [Étape 3.] Derrière, Apache sert l’interface : de simples fichiers. [Étape 4.] Express porte l’API et toutes les règles ; il en tourne deux instances : si l’une s’arrête, l’autre prend le relais. [Étape 5.] PostgreSQL garde les données, les sessions et le journal des écritures : le serveur lui-même ne garde rien en mémoire. [Étape 6.] L’identité, elle, reste à MindefConnect : le navigateur s’y connecte, Express échange avec lui pour ouvrir la session. ORION ne voit ni ne stocke aucun mot de passe. [Étape 7.] Les postes Windows, avec leur agent M42, remontent leur état toutes les quelques secondes, par la même porte. [Étape 8.] Et RIGEL : le téléphone passe lui aussi par HAProxy et parle au même back. [Dézoom.] Un front, un back, une base, une seule entrée. Simple à comprendre, simple à exploiter.

### 9 — Fonctionnement · 7:30 → 8:30

Au quotidien, tout tourne autour d’une boucle. [Révéler.] Le poste remonte son état : allumé, session ouverte, processus en cours, logiciels installés. [Révéler.] ORION classe chaque processus : autorisé, interdit ou non référencé ; un interdit est arrêté automatiquement. [Révéler.] L’utilisateur demande une intervention : arrêter un processus, installer un logiciel, réinstaller une salle. [Révéler.] Le poste l’exécute et renvoie son résultat, poste par poste. Un principe partout : le serveur fait foi. Numéros, auteurs, dates et droits sont fixés par le serveur, jamais par le navigateur. Et quand deux personnes modifient en même temps, leurs écritures sont fusionnées élément par élément : personne n’est bloqué.

*Sacha, Brandon et Alexandre vont vous le montrer avec une histoire.*

## PHOMMAVONGSA — 8:30 → 12:30

### 10 — Fil rouge · 8:30 → 9:15

Une histoire simple : une rentrée, ici même, en salle 119. [Révéler.] Thomas, formateur, prépare sa salle pour accueillir ses stagiaires. [Révéler.] Sophie, gestionnaire du parc, s’occupe des matériels de l’école. [Révéler.] Julien, administrateur de l’école, gère les postes et les règles. Chacun a son compte et ne voit que ce qui le concerne. Un signalement, une réparation confirmée sur place, une salle prête pour la formation : vous allez voir la même information passer de l’un à l’autre, sans un seul fichier Excel.

### 11 — Scénario formateur · 9:15 → 12:30

[Révéler les étapes, puis basculer sur l’onglet de Thomas.]

1. **Connexion** (≈ 20 s). « Thomas arrive le matin. Il s’identifie avec MindefConnect, comme pour ses autres applications : ORION ne lui demande rien de plus. » [Afficher l’accueil.] « Il arrive sur son tableau de bord : ses salles, ses remontées, les postes allumés. »
2. **Son espace** (≈ 35 s). [Menu du compte, en haut à droite.] « Chacun règle ORION à sa main. » [Choisir une couleur dans la roue, puis le soleil ou la lune.] « Thomas choisit sa couleur d’accent, et passe en clair ou en sombre, quel que soit le réglage de sa machine. » [Choisir l’ambiance Minarm.] « Il peut aussi prendre l’ambiance Minarm, aux couleurs des sites du ministère, avec la Marianne. Ce réglage est enregistré sur son compte : il le retrouve sur n’importe quel poste. » [Garder Minarm pour la suite.]
3. **Sa salle** (≈ 40 s). [Salles › bâtiment 201 › 119.] « Voici la salle où nous sommes. Le bâtiment s’affiche étage par étage, et la salle 119 au premier. Ses 14 postes sont allumés, on voit qui a ouvert une session, et chaque matériel est à sa place : écrans, unités centrales, certaines avec leurs vraies étiquettes. Thomas n’a rien eu à saisir : tout vient de l’inventaire et des postes eux-mêmes. »
4. **Un logiciel interdit** (≈ 55 s). [Supervision, salle 119.] « Ici, les processus en temps réel. Sur le poste 5, quelqu’un a lancé Steam. Steam est interdit : ORION l’a arrêté dès le premier rapport, sans que Thomas intervienne, et la trace reste. » [Montrer `119-PC03`.] « Sur le poste 3, Discord tourne. Il n’est ni autorisé ni interdit : ORION le signale, sans l’arrêter. Mais Thomas, lui, ne veut pas de Discord pendant son cours. » [Bouton d’arrêt de Discord sur `119-PC03` : « Arrêt demandé », puis Discord disparaît en quelques secondes.] « Il l’arrête lui-même : le poste reçoit la demande, l’exécute, et Discord disparaît. Mais un stagiaire pourra le relancer demain. Ce n’est pas au formateur de l’interdire : c’est à l’administrateur. » [Se tourner vers Alexandre.] « Julien, j’ai dû arrêter Discord sur le poste 3. Tu peux l’interdire dans la salle ? » — Alexandre : « Je m’en occupe tout à l’heure. »
5. **Un écran en panne** (≈ 45 s). [Écran `MAT-0001` › **Signaler un problème**.] « Dernier point : un écran reste noir. Thomas le signale depuis la fiche du matériel. » [Type « Écran », description « L’écran reste noir alors que l’unité centrale démarre. », transmettre.] « La remontée est en attente. Son numéro, son auteur et sa date sont fixés par le serveur : personne ne peut les falsifier. Thomas n’a pas besoin de savoir qui la traitera. »

*La remontée est partie. Brandon, c’est Sophie qui la reçoit.*

## BONEY — 12:30 → 17:10

### 12 — Scénario gestionnaire et RIGEL · 12:30 → 17:10

[Révéler les étapes, puis basculer sur l’onglet de Sophie, téléphone à portée.]

1. **Prise en charge** (≈ 40 s). [Cloche.] « Sophie est notifiée : une nouvelle remontée, celle que Thomas vient d’envoyer, sur l’écran `MAT-0001`. » [Remontées › **Prendre en charge**.] « Elle la prend en charge : la remontée passe en cours de traitement. » [Ouvrir l’état des lieux PDF.] « Si elle a besoin d’un document, l’état des lieux PDF est produit à la demande, avec les informations du moment. »
2. **Une livraison du CND** (≈ 45 s). [Matériels › Import JSON, choisir `IMPORT-CND.json`.] « Avant de chercher un écran, Sophie enregistre la livraison du CND arrivée ce matin. Pas de saisie matériel par matériel : elle importe le fichier de la livraison. » [Laisser l’analyse s’afficher.] « ORION analyse le fichier avant d’importer et rapproche chaque numéro de série de tout le parc. Six matériels sont nouveaux. Le septième, un écran, est déjà dans le stock de l’école : il ne sera pas créé une seconde fois. Un matériel d’une autre école serait proposé en transfert, à valider. » [**Importer 6 matériels**.] « Chacun reçoit son identifiant ORION, attribué par le serveur. »
3. **Un écran du stock** (≈ 40 s). [Matériels › stock, écran `MAT-2033`.] « Pour remplacer l’écran, Sophie cherche dans le stock : un Philips, le même modèle que celui en panne. Elle l’affecte à la salle 119. » [Montrer le point orange.] « Remarquez le point orange : l’écran est affecté, mais pas encore installé. ORION distingue ce qui est décidé dans l’application de ce qui est réellement en place dans la salle. »
4. **RIGEL dans la salle** (≈ 1 min 10). [Salles › Déplacements, trajet Stock → 119, **Installer avec un téléphone**.] « Sophie se rend dans la salle, avec son téléphone. Un QR code l’appaire à son compte, sans mot de passe à taper. » [Téléphone : scanner l’appairage, puis le QR de la salle 119 sur l’étiquette imprimée.] « Elle ouvre la salle en scannant son étiquette. » [Scanner l’étiquette de l’écran `MAT-2033`.] « Puis l’écran qu’elle vient de poser : RIGEL lit les QR codes, mais aussi les codes-barres et les Data Matrix des étiquettes. »
5. **Installation confirmée** (≈ 55 s). [**Confirmer l’installation**, puis **Synchroniser** si besoin.] « Elle confirme. Le téléphone a travaillé ici, dans la salle ; sans réseau, il aurait gardé son travail et l’aurait envoyé au retour de la connexion. » [Revenir sur ORION, attendre le passage au vert : quelques secondes à une demi-minute.] « Dans ORION, le point passe au vert : l’écran est en place, avec l’auteur et la date de la confirmation. »
6. **Thomas notifié** (≈ 30 s). [Remontées › **Remplacé**.] « Sophie clôt la remontée : matériel remplacé. Thomas est notifié. Du signalement à la réparation, tout est tracé, et personne n’a ressaisi une ligne. »

Seulement en cas d’avance, sinon le citer : Matériels › Recensement, « Nouveau recensement » sur la salle 119, le bilan, la clôture. « Le même téléphone sert à l’inventaire d’une salle entière. »

*La salle a son écran. Alexandre, il manque le logiciel de la formation : c’est Julien.*

## VILBERT-TAHON — 17:10 → 21:15

### 13 — Scénario administrateur · 17:10 → 20:45

[Révéler les étapes, puis basculer sur l’onglet de Julien.]

1. **Les alertes** (≈ 30 s). [Cloche.] « Julien, administrateur, ouvre ORION. Ses notifications résument la matinée : Steam arrêté sur le poste 5, la remontée de Thomas traitée et l’écran remplacé. Il n’a rien eu à faire pour le savoir. »
2. **Son tableau de bord** (≈ 35 s). [Accueil › **Personnaliser** › **Ajouter un widget**, « Matériels récemment enregistrés » ; le placer en tête, en grand ; **Terminé**.] « Julien veut aussi suivre le parc depuis son accueil. Il personnalise son tableau de bord : il ajoute la liste des matériels récemment enregistrés, la place en tête et l’agrandit. La livraison importée par Sophie tout à l’heure y est déjà. Chaque compte garde sa disposition, et peut créer d’autres tableaux de bord dans le sous-menu de l’accueil. »
3. **Le logiciel interdit** (≈ 1 min). [Supervision › Règles.] « Comme promis à Thomas : il a arrêté Discord sur le poste 3, mais rien n’empêche un stagiaire de le relancer. Julien décide : Discord n’a rien à faire en formation. Il l’ajoute à la blacklist, pour la salle 119 : une règle peut viser toute l’école, un bâtiment ou une salle. » [Enregistrer, montrer la règle dans la liste.] « Désormais, si Discord est relancé dans cette salle, ORION le classe interdit dès le rapport suivant et l’arrête de lui-même, comme Steam ce matin. Thomas n’aura plus à s’en occuper. »
4. **L’installation sur toute la salle** (≈ 1 min). [Administration › Interventions, installer IntelliJ IDEA sur la salle 119.] « Reste le logiciel de la formation, IntelliJ IDEA, absent de la salle. Julien demande l’installation en une fois, pour la salle entière. » [Suivre l’avancement.] « Les 14 postes reçoivent la demande, l’exécutent et renvoient leur résultat, poste par poste. Un poste éteint l’exécuterait à son retour. Julien est notifié quand tout est terminé : il n’a pas eu à passer de poste en poste. »
5. **Un nouveau formateur** (≈ 30 s). [Administration › Comptes, créer un formateur.] « Enfin, un nouveau formateur arrive. Julien crée son compte ORION : son profil et son école. Pas de mot de passe : l’identité reste à MindefConnect. »

### 14 — Récapitulatif · 20:45 → 21:15

Ce que vous venez de voir. [Révéler.] Signaler : le formateur voit sa salle et signale un problème sans rien connaître du parc. [Révéler.] Réparer : la gestionnaire enregistre, affecte et confirme, dans ORION et sur le terrain, avec la même information. [Révéler.] Équiper : l’administrateur décide pour les postes et les règles, résultats à l’appui. Trois métiers, une seule information.

*Pierre-Louis, ce qui nous a résisté.*

## BAELDE — 21:15 → 22:45

### 15 — Difficultés · 21:15 → 22:45

Tout n’a pas été simple. D’abord, ce que nous n’avions pas. [Révéler.] MindefConnect : nous n’y avions pas accès. Nous l’avons remplacé par Keycloak et un annuaire, avec le même protocole : le jour venu, on change de fournisseur, pas de protocole. [Révéler.] L’agent M42 des postes n’existe pas encore. Nous l’avons simulé, mais sur la vraie API : quand l’agent existera, il se branchera tel quel. [Révéler.] Et nos serveurs n’étaient pas joignables depuis Internet. Pour que le téléphone travaille quand même, RIGEL passe par un relais extérieur, avec des échanges chiffrés de bout en bout.

Ensuite, ce que nous avons dû apprendre. [Révéler.] Faire fonctionner le scanner, tout simplement : QR codes, codes-barres, Data Matrix, lecture des numéros de série, hors ligne, sur iOS comme sur Android. Ce qui paraît évident sur le papier nous a demandé beaucoup d’essais. [Révéler.] Et notre organisation : le premier sprint nous a montré ce qui manquait ; nous l’avons corrigé avant le second.

*Alexandre, pour la suite.*

## VILBERT-TAHON — 22:45 → 24:30

### 16 — Axes d’évolution · 22:45 → 23:45

La suite est déjà cadrée, sur deux axes. Vers la production d’abord. [Révéler.] MindefConnect réel et l’hébergement sur C1NP : le téléphone joint alors directement ORION, sans relais. [Révéler.] L’agent M42 réel sur les postes, avec des paquets distribués par Medusa. [Révéler.] Et des statistiques d’utilisation, que nous définirons avec vous.

Côté fonctionnel ensuite. [Révéler.] Le rôle d’un matériel, sa destination : réseau ou développement, par exemple. [Révéler.] Retirer un matériel du parc plutôt que le supprimer, pour en garder l’historique. [Révéler.] Et prendre en charge les postes Linux. Et, plus loin, un observatoire anonymisé des parcours. Aucune de ces évolutions ne demande de reprendre l’architecture : elles s’ajoutent à ce qui existe.

### 17 — Conclusion · 23:45 → 24:30

Pour conclure, revenons à Thomas, Sophie et Julien. ORION, c’est un parc lisible pour ceux qui l’utilisent : le formateur voit sa salle. Actionnable pour ceux qui le gèrent : la gestionnaire et l’administrateur agissent, au bureau comme sur le terrain. Et un socle prêt pour la production : des briques du ministère, un serveur qui fait foi, une architecture simple à exploiter. Ce que vous avez vu tout à l’heure n’était pas une maquette : c’était l’application, déployée sur nos serveurs, et un vrai téléphone. Merci de votre attention. Nous sommes prêts à répondre à vos questions.

## Aide-mémoire pour les questions

- **Pourquoi React et Node plutôt que Java ?** Contrats TypeScript partagés navigateur et serveur, chaîne unique, produits du CCT ; aucun besoin imposant Java.
- **Pourquoi Keycloak ?** Substitut local de MindefConnect, même protocole OpenID Connect avec PKCE ; il n’authentifie que, le profil et l’école sont portés par ORION.
- **Sécurité ?** Session côté serveur (30 min d’inactivité), droits et périmètre contrôlés à chaque écriture, jeton propre à chaque poste, RIGEL chiffré de bout en bout sans entrée réseau, TLS à l’entrée, secrets Swarm, conteneurs sans privilèges, journaux en TLS mutuel.
- **Deux personnes modifient la même chose ?** Fusion élément par élément avec journal de révisions ; conflit signalé seulement sur le même élément.
- **Pourquoi JSONB pour les données des postes ?** Volume, évolution avec les rapports, fusion par élément ; référentiels et remontées restent relationnels (MLD du DSE).
- **L’OCR marche ?** Lecture d’une bande de numéro de série par Tesseract, proposition corrigeable, jamais validée sans l’agent ; non éprouvé sur des étiquettes réelles.
- **1 000 ou 5 000 postes ?** Gabarit cible chiffré dans le DAT, hypothèses explicites ; rien d’annoncé comme mesuré.
- **Déploiement ?** Dix VM Debian, Docker Swarm, un rôle par VM, reprise automatique, déploiement continu depuis la CI (détail dans le DAT et la présentation d’architecture du 16 novembre).
- **Écarts avec les premières demandes du client ?** Choix d’équipe au-delà de la V1 (administrateur qui crée des remontées, import JSON contrôlé, recensement RIGEL) ; consignés au cadrage et soumis au client.
