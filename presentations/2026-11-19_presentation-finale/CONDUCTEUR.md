# ORION — Conducteur de la présentation finale du 19 novembre 2026

**Durée : 25 minutes d’exposé**, démonstration comprise, puis questions. Les horaires sont des objectifs de répétition. Une personne tient la navigation du diaporama et de l’application (bascule par `Alt`+`Tab`), une autre surveille le temps.

Touches : `→` ou `Espace` révèle le bloc suivant, puis passe à la diapositive suivante ; `←` revient ; `N` affiche l’orateur et le minutage ; `F` plein écran. Chaque bloc n’apparaît qu’à notre action : l’orateur annonce, puis révèle.

## Répartition

| Orateur | Passage | Diapositives | Horaire | Durée |
| --- | --- | --- | --- | --- |
| LE MAITRE | Ouverture, histoire, équipe, besoin, organisation | 1 à 6 | 0:00 → 5:30 | 5 min 30 |
| BAELDE | Pile logicielle, architecture animée, fonctionnement | 7 à 9 | 5:30 → 9:00 | 3 min 30 |
| PHOMMAVONGSA | Fil rouge et démonstration formateur | 10, 11 + application | 9:00 → 12:30 | 3 min 30 |
| BONEY | Démonstration gestionnaire et RIGEL | 12 + application + téléphone | 12:30 → 17:00 | 4 min 30 |
| VILBERT-TAHON | Démonstration administrateur, récapitulatif | 13, 14 + application | 17:00 → 20:30 | 3 min 30 |
| BAELDE | Difficultés | 15 | 20:30 → 22:00 | 1 min 30 |
| VILBERT-TAHON | Évolutions, conclusion | 16, 17 | 22:00 → 24:00 | 2 min |
| — | Marge | | 24:00 → 25:00 | 1 min |

Transitions : chaque orateur termine par une phrase qui annonce le suivant et son sujet (en italique). Les crochets sont des gestes, pas des paroles. Le texte n’est pas sur les diapositives : elles ne portent que des mots-clés, révélés le long d’une ligne guide ; le public écoute l’orateur. Les étapes de démonstration ci-dessous sont dites, pas affichées.

## Préparation (la veille et une heure avant)

La démonstration se joue dans la salle de la présentation, **salle 119 du bâtiment 201** (École du numérique), créée par le jeu de démonstration (version 24, `DEMONSTRATION` dans `application/outils/donnees-demonstration/jeu.ts`) :

| Élément | Valeur |
| --- | --- |
| Bâtiment 201 | Rez-de-chaussée : amphithéâtre et salles 001 à 010 ; 1er étage : 101 à 120 ; 2e étage : 201 à 220 |
| Salle | 1er étage, salle 119 ; 14 postes `119-PC01` à `119-PC14`, tous allumés, session ouverte |
| Matériels | 40, tous en service, aucune remontée ; postes 7, 8 et 12 : unités centrales aux étiquettes réelles (`SS4SG0457`, `SS4SG0495`, `SS4SG0589`) |
| Écran en panne (Thomas) | `MAT-0001`, Philips 242V8A, n° de série `UHB2039018980` |
| Logiciel interdit, déjà arrêté | Steam sur `119-PC05`, arrêté par ORION dès le premier rapport |
| Logiciel non référencé | Discord sur `119-PC03`, tourne tant qu’aucune règle ne l’interdit |
| Écran de remplacement (Sophie) | `MAT-2303`, Philips 242V8A, n° de série `UHB2032009637`, en stock |
| Application de la formation (Julien) | IntelliJ IDEA, absente des postes de la salle (image de référence seule) |

- Application déployée sur les VM, données rechargées en version 24 (le service `api` les recharge au déploiement ; sinon `npm run donnees:demo -- --reinitialiser`). Vérifier : Salles › bâtiment 201 › 119, 14 postes allumés.
- Ne rien modifier dans la salle 119 pendant les répétitions, ou recharger les données après la dernière répétition.
- Trois onglets connectés avant de commencer, un par compte de présentation : Thomas (formateur), Sophie (gestionnaire), Julien (administrateur). Vérifier qu’ils sont encore connectés (30 minutes d’inactivité).
- Téléphone chargé, caméra autorisée, RIGEL déjà ouvert une fois.
- Imprimer [ETIQUETTES-DEMO.html](ETIQUETTES-DEMO.html) : QR de la salle 119, du stock et de l’écran `MAT-2303`. Coller l’étiquette de l’écran sur un écran posé dans la salle, qui joue l’écran de remplacement.
- Simulateur des postes actif : les postes de la salle 119 exécutent toujours les interventions et arrêtent les processus demandés, en quelques secondes.
- Projection : diaporama et application sur le même écran, plein écran ; téléphone montré par la webcam ou un miroir d’écran, sinon commenté à voix haute.
- Plan B : captures des écrans clés (`design/maquettes/captures/`) dans un onglet.

## LE MAITRE — 0:00 → 5:30

### 1 — Écran d’attente

Diapositive vide, affichée pendant l’installation ; on avance pour lancer l’animation du logo.

### 2 — Couverture · 0:00

Bonjour à toutes et à tous. Nous sommes l’équipe ASTER et nous vous présentons ORION : le parc informatique des écoles de formation, enfin dans un seul outil.

Vingt-cinq minutes : d’où vient ORION, qui l’a fait et comment ; ce qu’il y a dessous ; puis trois utilisateurs qui se passent le relais dans l’application. Et pour finir, ce qui nous a résisté et la suite.

### 3 — Histoire · 0:45

[Révéler nom par nom : la ligne guide descend jusqu’à chaque nom.] Tout part d’une étoile. ASTER, c’est nous : une équipe, cinq branches. ORION, c’est le produit : la constellation qu’on reconnaît du premier coup d’œil et qui sert à s’orienter, exactement ce qu’on attend d’un outil de parc. Dans cette constellation, RIGEL est l’étoile la plus brillante : c’est notre module mobile, celui qui va sur le terrain, dans les salles. Et M42, la nébuleuse d’Orion, c’est l’agent qui vit dans chaque poste et qui nous parle. Une marque, une étoile, un seul bleu : vous verrez la même identité de l’écran de connexion au téléphone. C’est un produit, pas un prototype.

### 4 — Équipe · 1:45

[Révéler carte par carte.] Pierre-Louis, Product Owner : backlog, architecture, déploiement. Alexandre : l’interface, les parcours utilisateurs et cette identité visuelle. Brandon : la modélisation, la gestion du parc, le dossier de spécifications. Moi-même, Scrum Master, la remise et cette présentation. Sacha : les cycles de vie, la supervision, la recette par profil.

### 5 — Le besoin · 2:30

[Révéler bloc par bloc.] Aujourd’hui, le parc se gère dans des fichiers Excel. ORION répond à trois besoins : gérer le parc ; administrer les postes à distance ; superviser leur utilisation. Et un fil commun : les remontées des utilisateurs, suivies du signalement jusqu’à l’état des lieux PDF.

### 6 — Organisation · 3:15

[Révéler la frise point par point.] Scrum avec des pratiques XP. Tout commence par l’entretien initial avec le client, les 22 et 23 octobre. [Vacances, puis sprint 1.] Au retour des vacances, le sprint 1 : l’analyse, avec la Review du 4 novembre devant le client sur le MVP ; il a été très satisfait, au point de demander plus de choix de direction artistique. [Sprint 2.] Le 9 novembre, le sprint 2 : le développement, un nouvel entretien client le 12, puis la livraison et cette présentation. Un Product Owner, un Scrum Master, cinq développeurs, un Daily de quinze minutes à neuf heures. Ce que nous retenons : le cadre ne suffit pas, il faut un support partagé et quelqu’un qui tient la cadence dès la première semaine.

*Pierre-Louis, qu’est-ce qu’il y a sous le capot ?*

## BAELDE — 5:30 → 9:00

### 7 — Pile logicielle · 5:30

[Révéler la ligne applicative, puis la ligne d’infrastructure.] Une seule langue, TypeScript, du navigateur au serveur : les mêmes contrats de données des deux côtés. React pour l’interface. Node et Express pour l’API et toutes les règles métier. PostgreSQL pour les données. HAProxy, l’entrée unique. Apache, qui sert l’interface. Logstash pour les journaux. Toutes ces briques sont dans le cadre de cohérence technique du ministère.

### 8 — Architecture animée · 6:45

[Révéler étape par étape ; les flèches s’animent.] Tout commence dans le navigateur. Une seule porte : HAProxy, en HTTPS. Derrière, Apache sert l’interface, et Express porte l’API et toutes les règles. PostgreSQL garde les données, les sessions et le journal des écritures. L’identité, elle, reste à MindefConnect : le navigateur s’y connecte, et Express échange avec lui pour ouvrir la session ; ORION ne connaît aucun mot de passe. Les postes Windows, avec leur agent M42, se présentent toutes les cinq secondes. Et RIGEL : le téléphone passe par la même porte, HAProxy, et parle au même back. [Dézoom.] Un front, un back, une base, une seule entrée.

### 9 — Fonctionnement · 8:00

[Révéler les quatre étapes.] Au quotidien : les postes remontent leur état ; ORION classe chaque processus, autorisé, interdit, non référencé, et arrête les interdits ; l’utilisateur demande une intervention, le poste l’exécute et renvoie son résultat. Un principe partout : le serveur fait foi. Numéros, auteurs, dates, droits sont fixés côté serveur. Et deux écritures simultanées sont fusionnées élément par élément, personne n’est bloqué.

*Sacha, Brandon et Alexandre vous le montrent avec une histoire.*

## PHOMMAVONGSA — 9:00 → 12:30

### 10 — Fil rouge · 9:00

[Révéler les trois personnages.] Une rentrée ici même, en salle 119. Thomas, formateur, prépare sa salle. Sophie, gestionnaire du parc. Julien, administrateur de l’école. Un signalement, une réparation confirmée sur place, une salle prête : la même information passe de l’un à l’autre.

### 11 — Scénario formateur · 9:45

[Révéler les étapes, puis basculer sur l’onglet de Thomas.]

1. Connexion : « Thomas s’identifie avec MindefConnect, ORION ne lui demande rien d’autre. » Accueil : le tableau de bord de son école.
2. Salles › bâtiment 201 › 119 : « la salle où nous sommes ». La vue éclatée, les 14 postes allumés et leurs sessions, les matériels en place.
3. Supervision, salle 119 : les processus en temps réel. Sur `119-PC05`, Steam, interdit, a déjà été arrêté par ORION. Sur `119-PC03`, Discord tourne : il n’est pas référencé, ORION le signale sans l’arrêter.
4. Écran `MAT-0001` : **Signaler un problème**, type « Écran », « L’écran reste noir alors que l’unité centrale démarre. », transmettre. La remontée apparaît en attente, numérotée et horodatée par le serveur.

*La remontée est partie. Brandon, c’est Sophie qui la reçoit.*

## BONEY — 12:30 → 17:00

### 12 — Scénario gestionnaire et RIGEL · 12:30

[Révéler les étapes, puis basculer sur l’onglet de Sophie, téléphone à portée.]

1. Cloche : « une nouvelle remontée » de Thomas sur l’écran `MAT-0001`. Remontées › **Prendre en charge**. L’état des lieux PDF, produit à la demande.
2. Matériels › stock : l’écran `MAT-2303`, Philips comme celui en panne, affecté à la salle 119. Point orange : en cours de déplacement, ORION sait qu’il n’est pas encore en place.
3. Salles › Déplacements : le trajet Stock → 119. **Installer avec un téléphone** : le QR d’appairage s’affiche.
4. Téléphone : scanner l’appairage, ouvrir la salle 119 par son QR (étiquette imprimée), scanner l’étiquette de l’écran `MAT-2303`, **Confirmer l’installation**. Dans ORION, le point passe au vert, avec l’auteur et la date. « Le téléphone a travaillé ici, dans la salle ; il marche même sans réseau. »
5. Remontées : **Remplacé**. Thomas est notifié.

Si le temps le permet : Matériels › Recensement, « Nouveau recensement » sur la salle 119, le bilan, la clôture.

*La salle a son écran. Alexandre, il manque le logiciel de la formation : c’est Julien.*

## VILBERT-TAHON — 17:00 → 20:30

### 13 — Scénario administrateur · 17:00

[Révéler les étapes, puis basculer sur l’onglet de Julien.]

1. Cloche : Steam arrêté sur `119-PC05`, la remontée de Thomas remplacée.
2. Supervision › Règles : Discord, repéré par Thomas, en blacklist, portée salle 119. « Au prochain rapport, il est arrêté » : en quelques secondes, Discord disparaît de `119-PC03`.
3. Administration › Interventions : installer IntelliJ IDEA sur toute la salle 119. Les 14 postes exécutent et renvoient leur résultat, poste par poste.
4. Administration › Comptes : créer un formateur, profil et école ; l’identité reste à MindefConnect.

### 14 — Récapitulatif · 20:00

[Révéler Signaler, Réparer, Équiper.] Le formateur voit sa salle et signale sans rien connaître du parc. Le gestionnaire agit dans ORION et sur le terrain avec la même information. L’administrateur décide pour les postes et les règles, résultats à l’appui.

*Pierre-Louis, ce qui nous a résisté.*

## BAELDE — 20:30 → 22:00

### 15 — Difficultés · 20:30

[Révéler point par point.] Ce que nous n’avions pas : MindefConnect, que nous avons simulé avec Keycloak et un annuaire, sans changer le protocole ; l’agent M42 des postes, simulé lui aussi, mais sur l’API réelle, le jour où l’agent existe il se branche tel quel ; et un réseau exposé, d’où RIGEL extériorisé derrière un relais chiffré. Ce que nous avons dû apprendre : faire fonctionner le scanner, tout simplement, QR, codes-barres, Data Matrix, lecture OCR des numéros de série, hors ligne, sur iOS comme sur Android ; et améliorer l’organisation de l’équipe entre les deux sprints.

*Alexandre, pour la suite.*

## VILBERT-TAHON — 22:00 → 24:00

### 16 — Axes d’évolution · 22:00

[Révéler.] Vers la production : MindefConnect réel et l’hébergement C1NP, où RIGEL n’a plus besoin de relais ; l’agent M42 réel sur les postes, les paquets distribués par Medusa ; des statistiques d’utilisation définies avec le client. Côté fonctionnel : les formations induites et le rôle d’un matériel, le retrait des matériels plutôt que leur suppression, les postes Linux, un observatoire anonymisé des parcours.

### 17 — Conclusion · 23:00

ORION, c’est un parc lisible pour ceux qui l’utilisent, actionnable pour ceux qui le gèrent, et un socle prêt pour la production. Merci. Nous répondons à vos questions.

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
