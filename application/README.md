# Développement ASTER

Document interne de réalisation et d’exploitation, exclu des productions remises aux cadres évaluateurs. Les comptes, facilités et limites décrits ici concernent uniquement le démonstrateur ; ils ne constituent pas des règles de production et ne doivent pas être affichés dans l’interface ni recopiés dans les livrables.

## Périmètre

L’application couvre l’ensemble des écrans : tableaux de bord personnalisables (dont des tableaux que chaque compte ajoute au sous-menu de l’accueil), salles par bâtiment avec tous leurs étages (vue éclatée), stock, déplacements et installation physique des salles, inventaire et import JSON des matériels, remontées (backlogs des remontées et des installations pour le gestionnaire, validation par l’auteur) et états des lieux, supervision des postes (processus, détections, règles, statistiques) et administration (postes, applications, bâtiments, comptes).

Repères d’interface : le menu indique l’écran affiché par la couleur d’accent et une icône légèrement agrandie, sans bulle, le titre de chaque écran est réservé aux lecteurs d’écran. Les actions d’un écran (Personnaliser, Nouvelle salle…) sont placées dans la barre haute et restent visibles. Le contenu repose sur le fond de l’ambiance (voir ci-dessous) ; ses cartes entrent en glissant de gauche à droite et, au défilement, se replient sous la barre haute (animations pilotées par le défilement, ignorées par les navigateurs qui ne les gèrent pas). Aucune barre de défilement n’est affichée, et le défilement ne rebondit pas à ses limites (`overscroll-behavior: none` sur la page et les zones qui défilent). Une zone qui déborde (tableau, liste, panneau latéral) occupe toute la hauteur disponible : au maximum, le bas de sa fenêtre s’aligne sur celui du menu et des autres fenêtres, et un fondu à son bas signale la suite tant qu’il en reste ; dans un panneau collant, la hauteur ne dépend pas du défilement de la page ([frontend/src/workspace/ui/peek.js](frontend/src/workspace/ui/peek.js)). Les rangées de cartes qui défilent avec la page (tableau de bord, bâtiments) coupent toujours la suivante à 40 %. Les tableaux défilent dans leur cadre, en-tête toujours visible. Échap ferme la fenêtre munie d’une croix ouverte en dernier : la fiche d’un matériel, puis la fiche de sa salle, ou le détail d’une remontée ; les fenêtres modales et les menus se ferment d’eux-mêmes, et la frappe dans un champ n’est pas interrompue ([hooks/use-escape.js](frontend/src/workspace/hooks/use-escape.js)). Une fenêtre de verre ne défile jamais elle-même : son contenu défile à l’intérieur (panneau des salles, détail d’une remontée, dont les actions restent dessous), pour que son liseré et son fond restent en place. La légende de la vue des salles est collée en haut de la scène. Les étages d’un bâtiment sont ceux de ses salles, rangées en grille la plus proche d’un carré ; un étage ou une salle choisi est mis en évidence parmi tous les étages. L’écran Stock ne montre que le stock. Le crayon de la vue d’un bâtiment, ou Administration › Bâtiments, renomme un bâtiment d’une école : le bâtiment étant une information des salles, ses salles, ses étages et ses règles de processus prennent le nouveau nom, et la vue du bâtiment suit ce nom ; un nom déjà utilisé dans l’école est refusé ([shared/buildings.js](shared/buildings.js)).

Équiper une salle : le bouton « + » de la fiche de la salle (profils autorisés à affecter du matériel) ouvre la fenêtre d’équipement ; c’est le seul ajout de matériel depuis une salle (la création d’une fiche se fait dans Matériels ou depuis le stock). La fenêtre demande un nombre de postes et un ou deux écrans par poste, puis prend, dans le stock en service de l’école (matériels déjà rangés d’abord, puis ceux encore à rapatrier) et dans l’ordre des identifiants ASTER, autant d’unités centrales, d’écrans et de chaque périphérique (clavier, souris…) ; chaque composant peut être retiré de la composition et le nombre de postes est borné par le stock. Un second bloc propose les matériels secondaires du stock par modèle (vidéoprojecteur, réseau, audio, impression, autres), avec une quantité chacun. Dans la vue d’une salle, la fiche des matériels sélectionnés se range sous la liste du panneau, sans la recouvrir : seule la liste défile ; sans sélection, la même place montre l’aide à la sélection multiple (Ctrl ou Maj), toujours visible. L’affectation passe par la même écriture que le glisser-déposer, validée par le serveur ([views/salles/salles-affectation.jsx](frontend/src/workspace/views/salles/salles-affectation.jsx)).

Administration › Postes : même carte que l’inventaire ([DataPanel](frontend/src/workspace/widgets/parts.jsx) : recherche et salle, tableau défilant, 25 postes par page, nombre de postes en bas à gauche, sans bandeau au-dessus du tableau) ; colonnes Poste, Emplacement (« bâtiment – étage – salle », par exemple « A – 1er – A101 », `emplacement` de [core/selectors.js](frontend/src/workspace/core/selectors.js)), Matériel (unité centrale rattachée au poste, `materielId` : identifiant et modèle), État et Applications. « Réinitialiser » (nommé « Réinstaller » jusqu’au 12 novembre ; type `reinstallation` inchangé), dans la barre haute, demande la réinitialisation de Windows : la salle filtrée dans le tableau est proposée ; avec « Toutes les salles », aucune salle n’est choisie d’avance. État d’un poste (orientation de l’utilisateur du 12 novembre, `etatPoste` de [shared/catalog.js](shared/catalog.js)) : « Éteint ou indisponible » (aucun rapport depuis 30 secondes), « Allumé » (rapports sans session ouverte) ou « Connecté » (session ouverte, avec le compte de l’utilisateur), allumé et connecté ayant le même témoin vert ; un poste dont l’unité centrale est hors service est « Matériel hors service » : le serveur ignore ses rapports et l’éteint ([backend/workspace/rules.js](backend/workspace/rules.js), `eteindreHorsService`). Le nom de l’utilisateur de la session figure dans le tableau, dans la fiche du poste et dans les cartes des postes de Supervision › Salles ([PosteEtat](frontend/src/workspace/widgets/parts.jsx)). Administration › Applications : chaque application a « Installer » et « Désinstaller » (rouge) ; la fiche d’un poste (« Ouvrir ») propose aussi « Désinstaller » pour chaque application installée et « Installer » pour les autres. Chaque demande vise une salle entière ou un ou plusieurs postes d’une même salle (« Postes ») : la fenêtre ([administration-intervention-form.jsx](frontend/src/workspace/views/administration/administration-intervention-form.jsx)) porte l’intervention dans son titre et son bouton (« Installer Firefox », « Réinitialiser Windows »), propose la salle filtrée, puis les postes de la salle choisie, à cocher, et résume les postes visés, ceux qui démarrent aussitôt (allumés) et ceux qui attendront leur retour (éteints ou indisponibles). Pour une salle, le serveur fixe lui-même la liste de ses postes ; sans salle, une demande vise des postes d’une seule salle ([backend/workspace/rules.js](backend/workspace/rules.js)). Administration › Interventions ([administration-interventions.jsx](frontend/src/workspace/views/administration/administration-interventions.jsx), seul écran de suivi, compteur des demandes non terminées dans le sous-menu) suit installations, désinstallations et réinitialisations comme les remontées : une ligne par demande (une salle entière ou plusieurs postes tiennent sur une ligne, avec leur avancement), et un détail avec le suivi (demande, intervention sur les postes, fin) et l’état de chaque poste. États ([shared/catalog.js](shared/catalog.js), calculés dans [core/interventions.js](frontend/src/workspace/core/interventions.js)) : en attente (poste éteint ou indisponible, il l’exécutera à son retour), en cours (poste allumé), fait (« Installé », « Désinstallé », « Réinitialisé ») ou échec renvoyé par le poste ; une demande est en attente tant qu’aucun poste ne l’a commencée (tous éteints ou indisponibles), en cours dès qu’un poste l’exécute ou y a répondu, jusqu’à ce que tous aient fini. Quand une demande se termine (faite ou en échec), les administrateurs en sont notifiés (`termineLe`, fixé par le serveur). L’arrêt d’un processus reste suivi dans Supervision. Les tableaux (inventaire, supervision, administration) marquent la ligne survolée d’un fond neutre et la ligne sélectionnée de la teinte d’accent avec un filet à gauche ; inventaire et postes partagent la même pagination ([widgets/parts.jsx](frontend/src/workspace/widgets/parts.jsx)). Processus, règles, détections et applications portent le logo de leur application ([ui/app-icon.jsx](frontend/src/workspace/ui/app-icon.jsx) ; logos, sources et licences dans [assets/apps/](frontend/src/workspace/assets/apps/SOURCES.md)) ; une application sans logo connu affiche un cercle barré, comme sur Apple ; en ambiance sombre, les logos noirs ou très sombres (Steam, Eclipse, Tor) sont posés sur un disque blanc à peine plus grand qu’eux, qui les entoure d’un fin contour et remplit leurs parties découpées (le piston de Steam), sinon transparentes sur le fond sombre. Supervision s’ouvre sur Alertes, premier onglet de son sous-menu ([views/supervision](frontend/src/workspace/views/supervision/supervision.jsx)). La recherche, présente sur chaque onglet, ignore casse, accents et espaces ; chaque mot cherché doit figurer dans le texte, et un exécutable se trouve aussi par le nom de son application (« libreoffice » trouve soffice.exe). Dans Salles, un poste trouvé par son nom montre tous ses processus en cours, sinon seulement ceux qui correspondent. Le référentiel des logiciels connus (`LOGICIELS`, [shared/operations-data.js](shared/operations-data.js)) donne pour chaque logiciel ses exécutables, son nom, son logo et son classement de départ ; il en tire les règles globales de départ : une liste blanche (navigateurs, outils de développement, LibreOffice, Teams) et une liste noire (jeux et plateformes de jeux, téléchargement pair à pair, contournement du filtrage, prise de main à distance non autorisée, triche). VLC, Discord et Spotify restent non référencés : ils sont détectés et historisés.

Remontées : le cycle d’une remontée est « en attente » → « en cours » (prise en charge par le gestionnaire ou un administrateur) → « remplacé » ou « corrigé » (traitement, au choix du gestionnaire ou d’un administrateur) : la remontée est alors terminée. Le client n’a pas retenu la validation par l’auteur (12 novembre). Le suivi de la transmission à la fin du traitement (étapes franchies avec leur date et leur auteur, puis étapes restantes) est défini une fois ([shared/catalog.js](shared/catalog.js), `suiviRemontee`) et présenté dans le détail, dans l’état des lieux affiché et dans son PDF. Le serveur contrôle chaque transition ([backend/workspace/rules.js](backend/workspace/rules.js)) ; statuts et phases sont définis une seule fois ([shared/catalog.js](shared/catalog.js)). « En cours » est une orientation de l’utilisateur du 11 novembre (cadrage, § 23). Sous-menus ([views/remontees/remontees-tabs.js](frontend/src/workspace/views/remontees/remontees-tabs.js)) : le gestionnaire a deux backlogs, « Remontées » et « Installations » (installation physique des salles, voir ci-dessous), aux mêmes colonnes et icônes : « En attente » (sablier), « En cours » (flèches tournantes) et « Terminées » (coche verte), cette dernière ne gardant que les 30 derniers jours (`TERMINEES_RECENTES`) ; une carte de remontée ouvre le détail et ses actions ; puis la liste de toutes les remontées ; les autres profils ont une liste par phase (en attente, en cours, terminées), toutes et, pour les administrateurs, les leurs. Une adresse d’onglet absente du profil mène à son onglet par défaut. Les listes et le backlog présentent chaque remontée une fois, par son type de problème et son lieu ; ses matériels sont dans le détail. Icônes : « Remplacé » a deux flèches opposées, « Corrigé » une coche simple. Dans une remontée en cours, le gestionnaire déclare chaque matériel en service ou hors service par un interrupteur placé à côté ([views/remontees/remontees-materiels.jsx](frontend/src/workspace/views/remontees/remontees-materiels.jsx)) ; un matériel hors service d’une salle ne peut qu’être remis en service ou renvoyé au stock (règle tenue par le serveur, orientation de l’utilisateur du 12 novembre) : « Relocaliser dans le stock », « Remplacer par » un matériel en service du stock de même type, ou les deux, lancent chacun un déplacement, à confirmer dans Salles › Déplacements. Les indicateurs comptent comme « traitée » une remontée remplacée ou corrigée et datent le traitement de ce passage (la prise en charge n’en est pas un).

Notifications ([core/notifications.js](frontend/src/workspace/core/notifications.js)) : le menu de la cloche présente un résumé par nature, et la pastille compte ces sujets. Le gestionnaire voit « x nouvelles remontées » de la semaine, « x matériels sous garantie échue » et « x matériels arrivent à échéance » (fin de garantie dans les 6 mois). L’auteur d’une remontée (formateur ou administrateur) voit « x remontées terminées » de la semaine ; le formateur voit aussi « x remontées prises en charge » de la semaine. Les administrateurs voient « x interventions terminées » de la semaine (installation, désinstallation ou réinitialisation, faites ou en échec) et « x processus interdits ont été lancés ». Chaque ligne mène à l’écran concerné : remontées, inventaire filtré par l’adresse `?garantie=Échue` ou `?garantie=À échéance`, supervision. « Voir toutes les notifications » ouvre l’espace Notifications (`/notifications`, [views/notifications](frontend/src/workspace/views/notifications/notifications.jsx)), une carte par sujet avec le détail de chaque notification.

Installation physique des salles (orientation de l’utilisateur du 11 novembre, à soumettre au client, cadrage § 23) : une affectation enregistrée dans ASTER (glisser-déposer, fiche, équipement d’une salle, retour au stock) reste en cours tant que le déplacement physique n’est pas confirmé. Le serveur tient deux champs du matériel ([backend/workspace/rules.js](backend/workspace/rules.js)) : `deplacement` (en cours : emplacement physique d’origine, date, auteur), ouvert à chaque changement d’affectation, qui garde l’origine si le matériel n’a pas encore bougé, disparaît si le matériel revient à son emplacement d’origine et refuse toute autre modification ; et `installation` (dernier déplacement confirmé : origine, date, auteur), qu’il enregistre quand le navigateur retire `deplacement` (seule modification permise, qui confirme le déplacement) et dont il ignore toute valeur envoyée par le navigateur. Un matériel est « En stock », « Installé », « En cours d’installation » ou « À rapatrier au stock » ([shared/catalog.js](shared/catalog.js)) : un point orange signale ce qui est en cours, un point vert ce qui est à sa place. L’avancement ([core/installations.js](frontend/src/workspace/core/installations.js)) se calcule par trajet (même origine, même destination) : déplacements confirmés depuis le plus ancien encore en cours. Une salle est « En cours d’installation » tant qu’un trajet y arrive ou en part, avec une barre d’avancement en pourcentage (orange, verte à 100 %), puis « Équipée ». Salles › Déplacements (icône des deux flèches en cercle) présente une carte par trajet, « Stock › Atelier 2 », « C201 › C202 » ou « Atelier 1 › Stock » (à rapatrier), avec son avancement et ses matériels : le point orange d’un matériel le passe au vert d’un clic, un matériel à la fois (pas de confirmation groupée) ; en tête, « x matériels à déplacer » ; les cartes se répartissent en colonnes, chacune dans la moins remplie, sans grand espace entre elles ([GroupGrid](frontend/src/workspace/widgets/parts.jsx), aussi pour l’espace Notifications) ([views/salles/salles-deplacements.jsx](frontend/src/workspace/views/salles/salles-deplacements.jsx), [views/salles/installation.jsx](frontend/src/workspace/views/salles/installation.jsx)). La fiche d’une salle en cours d’installation montre son avancement et y renvoie ; la vue d’ensemble donne le pourcentage des salles en cours ; les pastilles en cours ont un contour pointillé orange ; la fiche d’un matériel montre son point et son trajet ; l’inventaire les signale. Le backlog « Installations » du gestionnaire (Remontées › Installations, [views/remontees/remontees-installations.jsx](frontend/src/workspace/views/remontees/remontees-installations.jsx)) range les salles en « En attente » (rien de confirmé), « En cours » et « Terminées » (équipées depuis moins de 30 jours) ; le gestionnaire reçoit « x matériels à déplacer ». Le sous-menu compact réduit les onglets inactifs à leur icône. Une application de scan (QR code de la salle, puis des matériels) pourrait faire passer les points au vert automatiquement ; elle n’est pas intégrée et sera proposée au client (cadrage, § 23).

Tableaux de bord : les indicateurs affichent leur libellé en haut et leur valeur en bas, sans icône ni pastille de couleur, suivie d’une variation datée quand l’historique le permet (remontées en attente par rapport à il y a 7 jours, traitées par rapport aux 30 jours précédents, matériels reçus sur 12 semaines, délai médian de traitement par rapport aux 12 semaines précédentes). Tant que sa valeur n’est pas nulle, un indicateur de matériels hors service a un fond de carte rouge discret, un indicateur de remontées en attente un fond jaune discret, un indicateur de matériels à déplacer un fond orangé discret. Les widgets et les diagrammes n’ont que leur titre. Couleurs des graphiques : les grandeurs et les catégories sans état prennent la couleur d’accent et ses teintes ; les couleurs d’état ne servent qu’aux états (rouge hors service, jaune en attente, vert traité ou en service, gris stock, orangé garantie proche). Diagrammes du catalogue ([widgets/diagrams.jsx](frontend/src/workspace/widgets/diagrams.jsx), [widgets/catalog-parc.jsx](frontend/src/workspace/widgets/catalog-parc.jsx), [widgets/catalog-remontees.jsx](frontend/src/workspace/widgets/catalog-remontees.jsx) ; formes dans [ui/charts-shapes.jsx](frontend/src/workspace/ui/charts-shapes.jsx), [ui/charts-bars.jsx](frontend/src/workspace/ui/charts-bars.jsx) et [ui/charts-heat.jsx](frontend/src/workspace/ui/charts-heat.jsx)) : types de problème (anneau), remontées par type et par semaine (petits multiples), flux et solde hebdomadaire des remontées, ancienneté des remontées en attente, remontées à traiter, remontées par jour (calendrier), remontées pour 100 matériels par bâtiment, part hors service par bâtiment (avec la moyenne de l’école), hors service par type et par bâtiment (matrice), salles à surveiller, matériels à déplacer et installation des salles (avancement par salle), matériels en salle et en stock, matériels par bâtiment, postes allumés par bâtiment, réceptions par trimestre, garanties du parc (barre segmentée ou pyramide selon la taille), échéances de garantie par mois, taux de disponibilité et matériels par marque. Les dispositions par défaut regroupent sur l’accueil ce qui demande une action (indicateurs, remontées à traiter, installation des salles et matériels à déplacer pour le gestionnaire, salles à surveiller), puis le détail du parc et des remontées dans leurs onglets ; un compte qui a déjà enregistré sa disposition les obtient par « Disposition par défaut » ou par la galerie. Le widget « Détections de processus » affiche le logo de chaque application et son classement en toutes lettres. À l’affichage d’un tableau de bord, les graphiques s’animent une fois : barres et colonnes poussent depuis leur base, courbes dévoilées de gauche à droite, anneaux et jauge qui pivotent, cases du calendrier en fondu ([styles/diagrams.css](frontend/src/workspace/styles/diagrams.css)) ; les mises à jour des données ne rejouent pas l’animation, et le réglage « réduire les animations » du système la supprime.

Préférences d’affichage, par compte ([shared/ambiance.js](shared/ambiance.js), appliquées au document par [core/theme.js](frontend/src/workspace/core/theme.js)), validées par le serveur (une valeur inconnue, comme les anciennes `brume` ou `frost`, ou `vigie`, retirée le 12 novembre, revient au défaut ; `aster`, ambiance par défaut jusqu’au 12 novembre, et `aube` ou `encre` deviennent `orion`) : ambiance, tonalité, verre et couleur. Orion et Minarm suivent le réglage clair ou sombre de la machine ; le soleil ou la lune en haut à droite du menu du compte force l’autre tonalité (`tone` : `light` ou `dark`) ; revenir à la tonalité de la machine la suit de nouveau (`auto`).

| Ambiance (identifiant) | Couleurs | Fond | Marque du menu |
| --- | --- | --- | --- |
| Orion (`orion`, défaut) | Surfaces neutres et accent personnel ; textes blancs en sombre | Clair : halos et voile lumineux de la couleur choisie ; sombre : noir légèrement bleuté, quelques étoiles blanches, halo blanc central élargi, fondu vers le bleu des coins, zones noires préservées, halo bleu renforcé en haut, halos de la couleur choisie et cartes bleu nuit | Étoile colorée en clair, blanche avec lueur de la couleur choisie en sombre |
| Minarm (`minarm`) | Couleurs du Système de design de l’État (DSFR), celles des sites ministériels comme impots.gouv.fr : bleu France, gris neutres, couleurs système (succès, erreur, avertissement) et illustratives pour les catégories ; clair ou sombre selon le réglage de la machine, suivi en direct ([core/theme.js](frontend/src/workspace/core/theme.js)) | Uni : fond gris très clair (#F6F6F6) et cartes blanches, ou fond #161616 et cartes #1E1E1E | Marianne dans un cercle (dessin officiel complété en haut et en bas) ; au survol, le médaillon grandit légèrement et un reflet le traverse |

Le menu du compte rapproche Orion et Minarm et propose une pastille sans pictogramme, alignée à gauche sous « Couleur », qui déploie huit couleurs en cercle (bleu par défaut). Les pastilles sont isolées, chacune avec un contour, sans disque commun. La pastille centrale reste fixe ; la roue utilise une couche native qui peut dépasser le bord du menu, avec un rayon ajusté sur mobile. Elles se superposent au contenu sans agrandir le menu : déploiement progressif horaire, puis repli antihoraire automatique après sélection. Les animations sont supprimées si le système le demande. En sombre, les pastilles sont éclaircies et la sélection utilise une coche foncée. La couleur principale est indépendante de l’ambiance, enregistrée par compte et validée côté serveur (`shared/ambiance.js`) ; les états métier et les catégories gardent leurs couleurs. Les tuiles d’icônes et les boutons utilisent des fonds teintés discrets, sans halo coloré. Un reflet satiné très léger souligne les surfaces et les boutons. Les cartes sombres ont un filet blanc sur les 40 % centraux de leur bord inférieur. Les diagrammes, barres et pastilles conservent leurs teintes avec un dégradé continu légèrement translucide, un reflet doux et une lueur discrète en sombre, sans bandes métalliques. La finition couvre aussi les barres d’état et de statut, les progressions, les repères des listes et des légendes, les petits graphiques et les totaux des calendriers. Les cartes de chaleur conservent leurs paliers et reçoivent seulement un reflet. Les lavis des indicateurs d’alerte (hors service, attente, installation) sont plus soutenus, surtout en sombre. Cette finition est centralisée dans `styles/chart-finish.css` et `ui/charts-paint.jsx`. Retirer l’import de la feuille dans `workspace.jsx` restitue les aplats, sans retirer le halo ni le filet blanc.

Les changements d’apparence n’envoient que les préférences au serveur : l’activité des postes ne peut pas faire rejeter un choix de couleur ou de tonalité.

Les couleurs et les fonds sont des jetons ([styles/tokens.css](frontend/src/workspace/styles/tokens.css) : `--backdrop`, `--backdrop-waves`, `--backdrop-edge`, flèche des listes déroulantes `--chevron`) : les composants utilisent `--accent` et ne codent aucune couleur d’ambiance. `data-tone` (clair ou sombre) regroupe les réglages communs aux ambiances sombres, où aucune lumière ne suit le pointeur. Le verre a deux niveaux : Liquide (clair, presque transparent, liseré lumineux ; réfraction des bords des barres fixes dans Chrome et Edge, sans mention dans le menu du compte) et Opaque (surfaces pleines, filet net).

Ambiance Minarm (ministère des Armées, nommée État jusqu’au 11 novembre ; une préférence `etat` devient `minarm`) : valeurs reprises du paquet officiel [@gouvfr/dsfr](https://www.npmjs.com/package/@gouvfr/dsfr) 1.15.4 (Service d’information du Gouvernement, licence Etalab 2.0 ; documentation : [systeme-de-design.gouv.fr](https://www.systeme-de-design.gouv.fr/), rubrique Couleurs), modes clair et sombre (jetons `background-*`, `text-*`, `border-*`, `*-blue-france`, `success`, `error`, `warning` et couleurs illustratives). La police Marianne n’est pas reprise. Le symbole de la Marianne ([ui/marianne.jsx](frontend/src/workspace/ui/marianne.jsx), tracés du bloc-marque du DSFR) remplace la fleur dans le menu, dans un cercle : le dessin officiel, coupé en haut et en bas, y est complété (haut de la tête, buste). Au survol, le médaillon grandit légèrement et un reflet le traverse, comme sur une médaille, sans déformer le dessin officiel (animation supprimée si le système demande de réduire les animations) : la marque de l’État est réservée aux services de l’État, ce qui correspond à la cible d’ASTER (ministère des Armées), mais son emploi reste à confirmer avec le client.

PostgreSQL et JavaScript répondent à la demande de l’utilisateur du 6 novembre 2026. React, React Router, Vite, Express et OpenID Connect sont des choix d’implémentation. L’interface est une seule application React : la page de connexion, puis l’espace de travail, chargé seulement après la connexion, avec une adresse par écran (`/accueil`, `/salles/batiment/A`, `/remontees/backlog`, `/remontees/attente`…). Le thème Keycloak reprend les captures de référence du [bouton d’accès](../design/MinDefConnect/reference-bouton-acces-mindefconnect.png) et du [formulaire de connexion](../design/MinDefConnect/reference-formulaire-connexion-mindefconnect.png).

## Deux modes de lancement

| Mode | Commande | Ce qui est réel |
| --- | --- | --- |
| Application connectée | `npm run infra:up` puis `npm run dev` | Connexion OIDC, comptes ASTER, données dans PostgreSQL, états des lieux PDF produits à la demande, API des postes |
| Interface seule | `npm run dev:ui` | Mêmes règles et même API, sans Docker : données dans un fichier temporaire, utilisateur fixé par `ASTER_UI_ROLE` |

Les deux modes ne peuvent pas tourner en même temps : ils utilisent le port 5173.

### Application connectée

Prérequis : Node.js 22.22 ou supérieur (exigé par React Router), npm, Docker avec Docker Compose. Depuis la racine du dépôt :

```sh
cd application
npm ci
npm run infra:up
npm run dev
```

`npm run dev` lance le serveur Express, l’interface Vite et l’émulateur de postes (`npm run dev:postes`).

| Service | Adresse | Usage |
| --- | --- | --- |
| Interface ASTER | http://localhost:5173 | Point d’entrée |
| Serveur Express | http://localhost:3001 | API, parcours OIDC, API des postes ; accessible par le proxy Vite |
| Keycloak | http://localhost:8081 | Fournisseur d’identité local, substitut de MindefConnect |
| Console Keycloak | http://localhost:8081/admin | Administration technique du fournisseur |
| PostgreSQL ASTER | localhost:5432 | Base `aster` : données métier et sessions |
| Annuaire LDAP (OpenLDAP, `osixia/openldap` 1.5.0) | réseau Docker uniquement | Identités des utilisateurs (`ou=people,dc=aster,dc=demo`), fédérées par Keycloak |

Utiliser le nom d’hôte `localhost`, qui correspond aux redirections OIDC déclarées. Le port 8081 évite le port 8080 déjà utilisé sur la machine. Les conteneurs exposent leurs ports uniquement sur la boucle locale.

Les valeurs de développement sont fournies par défaut. Pour les modifier, copier `.env.example` vers `.env` dans `application/` et adapter la configuration. Les secrets de démonstration sont publics et destinés exclusivement au démarrage local.

### Interface seule

```sh
cd application
npm ci
npm run dev:ui
```

L’utilisateur est d’abord le premier compte actif du profil `ASTER_UI_ROLE` (`admin` par défaut ; `superadmin`, `gestionnaire`, `formateur`), par exemple `ASTER_UI_ROLE=formateur npm run dev:ui`. Le menu du compte propose alors « Changer d’utilisateur » pour passer à n’importe quel compte actif et voir l’application avec son profil ([views/shell/user-switch.jsx](frontend/src/workspace/views/shell/user-switch.jsx), routes `/api/dev` de [ui-development.js](frontend/ui-development.js)) ; ce choix n’existe ni dans l’application connectée ni dans le build de production (`import.meta.env.MODE`). Les postes sont émulés en mémoire (désactivables avec `ASTER_UI_AGENTS=0`). Les données sont conservées dans un fichier du dossier temporaire et régénérées quand la version du jeu de données change. Ce mode se limite à la boucle locale et n’est pas inclus dans le build de production.

## Identité et comptes

Le 6 novembre, l’utilisateur a retenu MindefConnect pour la production. Dans le démonstrateur, Keycloak tient lieu de MindefConnect ; depuis le 9 novembre, à la demande de l’utilisateur, il fédère un annuaire LDAP local qui contient les identités des utilisateurs ([infra/ldap/aster-utilisateurs.ldif](infra/ldap/aster-utilisateurs.ldif), chargé au premier démarrage). Keycloak n’a plus de base PostgreSQL : sa configuration est réimportée depuis [le realm](infra/keycloak/aster-realm.json) et ses données internes, sans valeur propre, sont perdues à la recréation du conteneur.

- L’annuaire ne porte que l’identité : identifiant (`uid`), nom (`cn`, `givenName`, `sn`) et adresse (`mail`). Les profils ne sont pas stockés dans l’annuaire : MindefConnect, en cible, ne transmettra pas les profils ASTER, et le profil comme l’école sont gérés dans ASTER.

- Le fournisseur authentifie et transmet une identité (sujet OIDC, adresse électronique). Le serveur échange le code, vérifie le jeton signé, le state, le nonce et PKCE, puis conserve la session dans PostgreSQL. Le navigateur ne reçoit qu’un cookie HttpOnly.
- Le profil, l’école de rattachement et l’état actif sont portés par le compte ASTER (table `aster_compte`), géré dans Administration › Comptes par l’administrateur de l’école ou le super administrateur. Le realm ne définit aucun rôle.
- À la connexion, l’identité est rapprochée du compte par son sujet, sinon par son adresse ; le sujet est alors enregistré. Une identité sans compte actif est refusée avec un message explicite.
- Le compte est relu à chaque requête : une désactivation ferme les sessions en cours et un changement de profil s’applique immédiatement.
- Le nom, l’auteur et la date des remontées, l’auteur des interventions et les numéros (remontées, identifiants ASTER) sont fixés par le serveur à partir du compte connecté.
- Préférences d’affichage, dispositions des tableaux de bord (tableaux personnalisés compris : liste `tableaux` et widgets de chacun), dernière consultation des notifications et école affichée par le super administrateur sont enregistrées par compte (table `aster_preference`).

**Démonstrateur uniquement :** comme le Keycloak local remplace MindefConnect, le serveur crée l’identité de chaque compte ASTER actif qui n’en a pas (au démarrage et après chaque modification des comptes), avec le compte technique `keycloak-admin`. La fédération étant en écriture, Keycloak l’enregistre dans l’annuaire LDAP (`uid` = partie de l’adresse avant `@`). Un compte créé dans ASTER permet donc de se connecter aussitôt. En production, ce provisionnement est désactivé : les identités existent chez le fournisseur.

### Comptes du démonstrateur

| Adresse | Nom ASTER | Profil | École |
| --- | --- | --- | --- |
| superadmin@aster.demo | S. Lefèvre | Super administrateur | Toutes |
| admin@aster.demo | C. Durand | Administrateur | École du numérique |
| gestionnaire@aster.demo | G. Bernard | Gestionnaire | École du numérique |
| formateur@aster.demo | L. Martin | Formateur | École du numérique |
| n.petit@aster.demo, r.garcia@aster.demo, m.robert@aster.demo | N. Petit, R. Garcia, M. Robert | Formateur | École du numérique |
| a.moreau@aster.demo | A. Moreau | Administrateur | École des réseaux |
| e.dubois@aster.demo | E. Dubois | Gestionnaire | École des réseaux |
| j.lambert@aster.demo | J. Lambert | Formateur | École des réseaux |

Les quatre premiers acceptent aussi l’identifiant court (`superadmin`, `admin`, `gestionnaire`, `formateur`). Laisser le mot de passe vide : le realm `aster` utilise délibérément un flux qui identifie un utilisateur existant sans secret ; le champ mot de passe du thème est en lecture seule et n’est pas transmis. L’inscription et la récupération du mot de passe renvoient vers l’administrateur.

Les tests de bout en bout utilisent aussi `nouveau.formateur@aster.demo` (créé puis désactivé par le test) et `sans.compte@aster.demo` (identité sans compte ASTER).

La consigne de présentation du 6 novembre impose de conserver ces modalités dans ce guide interne : aucune liste de comptes, indication de mot de passe vide, étiquette de démonstration ou aide technique de démarrage ne doit apparaître dans l’interface ou dans les productions remises aux cadres.

Le compte technique de la console Keycloak est `keycloak-admin` avec le mot de passe local `keycloak-admin-local`. Il est distinct du super administrateur ASTER. Les sessions ASTER expirent au plus tard à l’expiration du jeton d’identité, ou après une heure ; une déconnexion détruit la session ASTER puis termine la session Keycloak.

## Données

Le serveur applique les droits à chaque écriture ([backend/workspace/rules.js](backend/workspace/rules.js)), puis l’enregistre en une transaction ([backend/workspace/postgres.js](backend/workspace/postgres.js)) :

| Table | Contenu |
| --- | --- |
| `aster_ecole`, `aster_etage`, `aster_salle` | Écoles, étages par bâtiment, salles |
| `aster_materiel` | Matériels ; identifiant ASTER unique, salle facultative (stock) |
| `aster_remontee`, `aster_remontee_materiel` | Remontées, auteur, statut (contrainte tirée du catalogue des statuts, remplacée au démarrage), historique ; matériels concernés |
| `aster_compte`, `aster_preference` | Comptes ASTER (profil, école, actif, sujet OIDC) ; préférences par compte |
| `aster_donnee` | Postes, processus, détections, applications, installations, règles, interventions (JSONB) |
| `aster_espace` | Version du jeu de données et numéro de révision, verrouillé à chaque écriture |
| `aster_journal` | Éléments modifiés par les dernières révisions, pour fusionner les écritures concurrentes (`json`, qui conserve l’ordre des propriétés) |

Au premier démarrage, ou quand la version du jeu de données change, les tables sont initialisées avec une école de quatre bâtiments (1 à 5 niveaux, jusqu’à 8 salles par étage), une seconde école, l’inventaire, les remontées passées (à tous les stades : en attente, en cours, terminées) et les comptes ci-dessus. Installation physique : l’Atelier 2 reçoit huit matériels du stock (trois déjà installés), deux écrans sont à déplacer de C201 vers C202, trois matériels de l’Atelier 1 sont à rapatrier au stock et la B203 a fini d’être équipée il y a trois jours. Le stock de l’École du numérique contient de quoi équiper une nouvelle salle, reçu ces dernières semaines (garanties en cours) : 20 unités centrales, 40 écrans, 20 claviers, 20 souris et des matériels secondaires (vidéoprojecteurs, commutateurs, bornes Wi-Fi, câbles, audio, imprimantes, onduleurs ou stations d’accueil). Matériels › Import JSON (orientation de l’utilisateur du 11 novembre, à soumettre au client, cadrage § 23) vérifie le fichier dès qu’il est choisi (ou le JSON dès qu’il est collé), puis le serveur rapproche ses numéros de série de tout le parc, toutes écoles comprises (`POST /api/workspace/import/analyse`, [backend/workspace/import.js](backend/workspace/import.js)) ; le navigateur, qui ne voit que son école, ne pourrait pas le faire. Le fichier se choisit en un geste ; le JSON à coller est facultatif, replié comme l’exemple. Pendant l’analyse, l’étoile ORION respire, entourée de petites étoiles qui scintillent, comme à l’ouverture de l’application ([Loader](frontend/src/workspace/widgets/parts.jsx), affiché au moins un instant). L’aperçu, sur toute la largeur ([views/inventaire/inventaire-import.jsx](frontend/src/workspace/views/inventaire/inventaire-import.jsx)), met en avant son bilan (nouveaux matériels prêts à être ajoutés, matériels d’une autre école à accepter ou non, déjà présents et en double, non traités), puis présente d’abord les incohérences, avec une alerte : un matériel d’une autre école porte un interrupteur « Transférer » (échange entre écoles), désactivé s’il est cité par une remontée en cours dans son école ; un matériel déjà présent dans l’école, ou une ligne qui répète un numéro de série du fichier, est « Non traité » ; les autres sont « Prêts à être ajoutés ». `POST /api/workspace/import` n’ajoute que les nouveaux matériels (identifiant ASTER attribué) et transfère les matériels validés, qui gardent leur identifiant et rejoignent l’école à l’emplacement indiqué par le fichier ; le serveur refait le rapprochement et renvoie le bilan (ajoutés, transférés, non traités). Le tableau de l’aperçu, à colonnes fixes, s’affiche en entier par pages de 25 et défile avec la page, sans défilement intérieur. Pendant l’import, le bouton montre un chargement, puis une coche tracée sur fond vert (« Import terminé »), avant de revenir à son état initial, sans fichier sélectionné ; la liste reste affichée avec le résultat de chaque ligne (« Ajouté », « Transféré », « Non traité »). Pour l’essayer, [tests/fixtures/import-stock-salle.json](tests/fixtures/import-stock-salle.json) contient un autre lot de 139 matériels : 137 absents des données de départ (d’autres modèles, HP ProDesk 400 G9, écrans Iiyama ProLite, claviers K120…, et des numéros de série inédits, sans salle : ils entrent en stock), un écran déjà présent dans l’École du numérique (non traité) et une unité centrale de l’École des réseaux (à accepter ou non). Un test serveur vérifie ces deux matériels connus et l’absence de tout autre modèle existant. L’activité des postes (processus, détections, installations) part de zéro et n’est alimentée que par les postes. Chaque poste est rattaché à une unité centrale de sa salle ; les sessions ouvertes portent des comptes fictifs (`UTILISATEURS`, comme `camille.durand`). Simulation ([shared/seed.js](shared/seed.js)) : les unités centrales de B104-PC07, B104-PC08 et A014-PC02 sont hors service ; les salles A105 et C203 sont fermées (`SALLES_FERMEES` : l’émulateur garde leurs postes éteints) ; quatre interventions de départ : une désinstallation de LibreOffice sur C203 et une réinitialisation sur A105, en attente, une installation de Postman sur A014-PC02, en attente, et une installation d’IntelliJ IDEA sur B104, en cours, que ses deux postes hors service ne finissent pas.

L’état des lieux PDF d’une remontée n’est pas conservé : le serveur le produit à chaque demande, avec les informations actuelles (`GET /api/workspace/reports/:id/pdf`, après contrôle de la session et du périmètre du compte ; [backend/workspace/engine.js](backend/workspace/engine.js)). Le document A4 ([backend/workspace/pdf.js](backend/workspace/pdf.js), sans dépendance) comprend un bandeau ASTER (référence, statut, type de problème), l’école et le déclarant, la localisation, la description, le tableau des matériels concernés (type, identifiant ASTER, numéro de série, salle, état), le suivi de la transmission à la clôture et un pied de page numéroté portant la date de la dernière étape ; il passe sur plusieurs pages si nécessaire. Les deux modes procèdent de la même façon.

Le serveur ne garde aucun état qui fasse autorité : plusieurs serveurs Express peuvent partager la même base. Chaque écriture verrouille la ligne de révision (`aster_espace`), relit l’état, applique les règles puis enregistre ; un serveur ne réutilise sa copie de l’état que si la base porte toujours la même révision. Les écritures concurrentes sont fusionnées élément par élément à partir du journal des 2 000 dernières révisions, conservé en base (`aster_journal`) : une écriture préparée sur une révision antérieure n’échoue que si le même élément a été modifié entre-temps. Les éléments sont comparés indépendamment de l’ordre de leurs propriétés. Le navigateur reprend toutes les quatre secondes les modifications des autres utilisateurs et des postes (requête conditionnelle par ETag).

## Postes

Les postes communiquent par l’API `/api/agent` du serveur, authentifiée par un jeton porteur (`AGENT_TOKEN`) :

| Route | Rôle |
| --- | --- |
| `GET /api/agent/postes` | Postes connus d’ASTER |
| `POST /api/agent/rapports` | Processus utilisateur en cours et applications installées ; réponse : interventions à exécuter |
| `POST /api/agent/resultats` | Résultat de chaque intervention (`reussie` ou `echec`) |

À chaque rapport, ASTER met à jour l’état des postes, ouvre ou clôt les processus, classe les nouveaux processus selon les règles (globales, école, bâtiment, salle) et enregistre une détection pour un processus non référencé ou interdit. Un processus interdit déclenche automatiquement une demande d’arrêt. Un rapport indique la session ouverte (`session` : compte Windows, ou `null` si le poste est seulement allumé) ; un poste sans rapport depuis 30 secondes est considéré éteint ou indisponible. Les arrêts demandés par un formateur, les installations, désinstallations et réinitialisations demandées par un administrateur suivent le même circuit : demande enregistrée, exécution par le poste, résultat par poste, puis statut « Terminée » ou « Échec ».

**Démonstrateur uniquement :** les postes Windows sont émulés par [backend/demonstrateur/agents.js](backend/demonstrateur/agents.js), qui utilise l’API réelle (programmes utilisateur, déconnexions, programmes interdits occasionnels, exécution des interventions avec un faible taux d’échec). Les postes émulés lancent surtout des outils de développement et de bureautique autorisés, rarement des programmes non référencés ou interdits ; leur image de référence comprend Firefox, VS Code, Git et Python, complétée au hasard par d’autres applications du catalogue. Le protocole, l’authentification par poste et le déploiement d’un agent réel sur Windows restent à définir.

## État, description et documentation de l’API

Ces routes sont publiques, sans connexion (application connectée seulement) :

| Route | Rôle |
| --- | --- |
| `GET /api/health` | État de chaque service : adresse `hôte:port`, IP résolues, port, état (`up`, `down` ou `not-configured`), temps de réponse ou erreur ; pour les postes, nombre de postes allumés (`connected` : rapport reçu depuis moins de 30 secondes). État global `ok`, `degraded` (service facultatif indisponible) ou `unavailable` : réponse 503 seulement si la base de données ou le fournisseur d’identité est indisponible |
| `GET /api/infos` | Description du système (version, mode, démarrage), de l’instance qui répond (nom d’hôte, IP, Node.js) et du rôle de chaque service |
| `GET /api/docs/` | Documentation interactive (Swagger UI) |
| `GET /api/openapi.json` | Spécification OpenAPI 3.1 de toutes les routes ([backend/openapi.js](backend/openapi.js)) |

Les services et leurs contrôles sont définis dans [backend/services.js](backend/services.js) : réponse HTTP pour le point d’entrée (`APP_URL`), le serveur web, le fournisseur d’identité et son administration ; requête SQL pour la base ; connexion TCP pour l’annuaire et le collecteur de journaux. Dans Docker Swarm, l’IP d’un service joint par son nom est son adresse virtuelle sur le réseau overlay. Aucun identifiant n’est publié. Toute route ajoutée au serveur est décrite dans `backend/openapi.js`.

## Structure

Le frontend suit l’organisation habituelle d’un projet React : tout le code de l’interface est sous `src/`, rangé par rôle (données, crochets, composants génériques, widgets, un dossier par écran) ; les fichiers sont nommés en minuscules avec des tirets. Le code commun au navigateur et au serveur (référentiels, formats, données de départ, règle de renommage des bâtiments, préférences d’affichage) est dans `shared/`, importé par l’alias `#shared/…` (champ `imports` de `package.json`, compris par Node et par Vite). Le serveur sépare règles métier, moteur d’écriture, routes HTTP et stockage ; les facilités propres au démonstrateur sont isolées dans `backend/demonstrateur/`.

```text
application/
├── shared/                      # Commun au navigateur et au serveur, sans DOM
│   ├── catalog.js               # Référentiels : types de matériel, états, statuts, profils
│   ├── format.js                # Dates et nombres en français
│   ├── seed.js                  # Données de départ (SEED_VERSION)
│   ├── ambiance.js              # Préférences d'affichage valides
│   ├── buildings.js             # Renommage d'un bâtiment
│   └── operations-data.js       # Applications et règles de processus de départ
├── frontend/
│   ├── index.html               # Point d'entrée unique
│   ├── vite.config.js
│   ├── ui-development.js        # Mode interface seule (greffon Vite)
│   └── src/
│       ├── main.jsx             # Montage React et routeur
│       ├── app.jsx              # Session : connexion ou espace de travail
│       ├── connexion/           # Pages publiques : connexion, chargement, marques, styles
│       └── workspace/           # Espace de travail, chargé après la connexion
│           ├── workspace.jsx    # Routes des écrans
│           ├── assets/          # Logos des applications (sources et licences : assets/apps/SOURCES.md)
│           ├── core/            # Données et règles d'affichage : store, sélecteurs, droits, verre, thème
│           ├── hooks/           # useStore, useTitle
│           ├── ui/              # Composants génériques : fenêtres, formulaires, icônes, graphiques
│           ├── widgets/         # Widgets des tableaux de bord et éléments d'affichage partagés
│           ├── views/           # Un dossier par écran (shell, dashboard, salles, remontees…)
│           └── styles/          # Feuilles de style, importées dans un ordre fixe par workspace.jsx
├── backend/
│   ├── index.js                 # Serveur Express, OIDC, sessions
│   ├── start-production.js
│   ├── config.js
│   ├── profiles.js              # Profils ASTER et utilisateur présenté au navigateur
│   ├── services.js              # Description et état des services (/api/infos, /api/health)
│   ├── openapi.js               # Spécification OpenAPI (Swagger UI sur /api/docs)
│   ├── workspace/
│   │   ├── rules.js             # Droits, visibilité, fusion des écritures concurrentes
│   │   ├── postes.js            # Rapports et résultats des postes
│   │   ├── engine.js            # Moteur sans état, révisions et fusion ; dépôt du mode interface seule
│   │   ├── postgres.js          # Dépôt PostgreSQL
│   │   ├── routes.js            # API de l'espace et des postes
│   │   └── pdf.js               # État des lieux PDF
│   └── demonstrateur/
│       ├── identity-provisioning.js  # Identités dans l’annuaire via Keycloak
│       └── agents.js            # Postes émulés
├── infra/
│   ├── compose.yaml             # PostgreSQL ASTER, annuaire LDAP, Keycloak
│   ├── keycloak/                # Realm (fédération LDAP) et thème de connexion
│   ├── ldap/                    # Identités de départ de l’annuaire (LDIF)
│   └── images/                  # Lecture des secrets et configuration Apache des images
├── tests/                       # Tests d’interface et de bout en bout ; fixtures/ : fichiers d’import
├── Dockerfile                   # Images web, api et postes
└── .env.example
```

Les classes CSS étant partagées entre écrans (tableaux `ops-`, contenus de widgets `w-`), les feuilles de style restent regroupées dans `styles/` et chargées dans un ordre fixe, qui détermine la cascade. Les tests du serveur (`*.test.js`) sont placés à côté des modules qu’ils vérifient.

Les volumes Docker du projet Compose `aster` séparent et conservent les données PostgreSQL d’ASTER, l’annuaire LDAP (`ldap-data`, `ldap-config`). Le fichier LDIF n’est chargé que si l’annuaire est vide : pour le recharger, supprimer les deux volumes LDAP. `npm run infra:down` arrête les services sans supprimer les données. Keycloak réimporte son realm à chaque recréation de son conteneur ; les identités manquantes sont créées dans l’annuaire par le serveur au démarrage. Ne pas supprimer un volume sans vérifier les données qu’il contient.

## Vérifications

```sh
npm test               # Règles, API, identité ; intégration PostgreSQL si l'infrastructure est démarrée
npm run build
npm run test:ui        # Page de connexion
npm run test:workspace # Écrans de l'espace de travail en mode interface seule (port 5174)
```

Les tests d’intégration utilisent un schéma PostgreSQL temporaire, supprimé à la fin ; ils sont ignorés si l’infrastructure est absente. Les tests Playwright utilisent Google Chrome s’il est installé (comme sur les machines de la CI), sinon le Chromium de Playwright, à installer une fois avec `npx playwright install chromium` ([tests/navigateur.js](tests/navigateur.js)). `npm run test:ui` démarre l’interface sur le port 5173, ou réutilise celle qui y tourne déjà : il doit s’agir de `npm run dev:frontend`, pas du mode interface seule.

Avec l’infrastructure et `npm run dev` démarrés :

```sh
npm run test:e2e
```

Ces tests passent réellement par Keycloak pour chaque profil et vérifient : l’identité et les modules par profil, la session persistante et la déconnexion ; la création d’un compte puis la connexion de ce nouvel utilisateur, la coupure de session à sa désactivation ; le refus d’une identité sans compte ASTER ; l’enregistrement d’un matériel en base ; une remontée transmise et son état des lieux PDF, produit à la demande ; un arrêt de processus exécuté par un poste ; le refus des écritures d’une autre origine, d’un state incorrect et d’un retour sans demande préalable.

## Production

La cible est le véritable MindefConnect. Son contrat d’intégration, ses accès, les attributs d’identité transmis et les redirections doivent être obtenus. L’adaptateur OIDC configurable ne constitue pas une intégration MindefConnect validée. Aucun déploiement de production n’est effectué ici.

`npm run build` produit l’interface dans `frontend/dist/`. `npm start` démarre le serveur en mode production et sert cette interface ; il exige `APP_URL`, `DATABASE_URL`, `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, un `SESSION_SECRET` d’au moins 32 caractères et un `AGENT_TOKEN` d’au moins 32 caractères. Les valeurs de démonstration sont refusées et le provisionnement des identités est désactivé. Le serveur écoute sur la boucle locale et attend un proxy HTTPS de confiance devant lui.

Variables complémentaires, notamment pour le démonstrateur déployé sur VM en conteneurs :

| Variable | Rôle | Valeur par défaut |
| --- | --- | --- |
| `HOST` | Adresse d’écoute du serveur ; `0.0.0.0` dans un conteneur, pour être joint par le proxy et par l’émulateur | `127.0.0.1` |
| `IDENTITY_PROVISIONING` | `true` : crée dans le Keycloak local les identités des comptes actifs, même en mode production ; exige alors un `KEYCLOAK_ADMIN_PASSWORD` dédié | actif hors production seulement |
| `KEYCLOAK_ADMIN_URL` | Adresse de l’API d’administration de Keycloak, si elle diffère de l’émetteur (sur les VM : `http://keycloak:8080`) | origine de `OIDC_ISSUER` |
| `NODE_EXTRA_CA_CERTS` | Fichier de l’autorité de certification à reconnaître pour joindre Keycloak en HTTPS (variable native de Node.js) | aucune |
| `ASTER_API` | Adresse du serveur pour l’émulateur des postes (sur les VM : `http://api:3001`) | `http://127.0.0.1:3001` |
| `WEB_URL` | Serveur web contrôlé par `/api/health` (sur les VM : `http://apache:8080`) | non contrôlé |
| `LDAP_URL` | Annuaire contrôlé par `/api/health` (sur les VM : `ldap://ldap:389`) | non contrôlé |
| `SYSLOG_URL` | Collecteur de journaux contrôlé par `/api/health` (sur les VM : `tcp://<IP VM 08>:6514`) | non contrôlé |
| `ASTER_VERSION` | Version publiée par `/api/infos` ; fixée à la construction de l’image (commit) | aucune |

### Images et intégration continue

Le [Dockerfile](Dockerfile) produit une image par cible :

| Cible | Contenu | Port | Commande de construction |
| --- | --- | --- | --- |
| `web` | Apache 2.4 et le build React ; toute adresse sans fichier renvoie `index.html` | `8080` | `docker build --target web .` |
| `api` | Express en mode production, écoute sur `0.0.0.0` | `3001` | `docker build --target api .` |
| `postes` | Émulateur des postes | aucun | `docker build --target postes .` |

Au démarrage, les images `api` et `postes` transmettent chaque secret Docker Swarm `/run/secrets/NOM` au service dans la variable d’environnement `NOM` ([infra/images/secrets.sh](infra/images/secrets.sh)) : le secret porte donc le nom de la variable (`SESSION_SECRET`, `DATABASE_URL`…). Le contrôle de santé de `api` vérifie seulement que le serveur répond, pas que PostgreSQL et Keycloak sont joignables : une panne d’un service voisin ne fait pas relancer les instances d’Express.

Le workflow GitHub Actions [ci.yml](../.github/workflows/ci.yml) exécute, à chaque push sur `main` seulement, `npm test`, `npm run build`, `npm run test:ui` et `npm run test:workspace`, puis, dans un second job, `npm run test:e2e` avec l’infrastructure Compose (serveur et postes lancés sans `.env`, sur les valeurs par défaut). Un nouveau push annule l’exécution en cours. En cas d’échec, les traces Playwright et les journaux du serveur sont téléchargeables depuis la page de l’exécution (7 jours). Si les tests passent, il publie les trois images sur Docker Hub en public, sous `<compte>/aster-web`, `<compte>/aster-api` et `<compte>/aster-postes`, avec le SHA du commit pour étiquette.

Pour la publication, créer sur Docker Hub un jeton d’accès en lecture et écriture (Account settings → Personal access tokens), puis, dans le dépôt GitHub (Settings → Secrets and variables → Actions), la variable `DOCKERHUB_USERNAME` (nom du compte Docker Hub) et le secret `DOCKERHUB_TOKEN` (le jeton, pas le mot de passe). Sans la variable, les tests s’exécutent et la publication est ignorée.

Les images ne contiennent ni configuration ni secret : sur les VM, chaque service les reçoit au démarrage (variables d’environnement et secrets Docker Swarm). `.env.example` ne sert qu’au poste de développement.

Ne pas utiliser `infra/compose.yaml` en production : il contient le flux sans mot de passe, les comptes locaux, l’émulateur de postes et des secrets publics. Les paramètres d’hébergement et les exigences complémentaires restent à définir dans le cadrage.
