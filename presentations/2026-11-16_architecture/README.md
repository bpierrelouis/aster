# ORION — Voyage dans l’architecture

Présentation HTML autonome des architectures réelle et cible, préparée le 16 novembre 2026. Support d’explication technique ; il ne constitue pas une modification du DAT ni une validation des intégrations cibles.

## Ouvrir

Ouvrir [index.html](index.html) dans Firefox, Edge ou Chrome récent. Aucune installation, connexion réseau ou compilation n’est nécessaire. Conserver ce dossier entier pour partager la présentation : les scripts, styles et logos sont locaux.

Le parcours comporte 27 étapes : 17 pour le déploiement réel et 10 pour la cible C1NP. La caméra zoome, dézoome et se déplace entre les machines. Les particules suivent les flèches actives ; les protocoles figurent sur les liaisons. Les cartes restent explorables hors du parcours.

## Commandes

| Commande | Action |
| --- | --- |
| `←` / `→` | Étape précédente / suivante |
| `Espace` | Lire ou suspendre le parcours automatique ; environ 10 secondes par étape |
| `F` | Plein écran |
| `O` | Vue d’ensemble de l’architecture courante |
| `+` / `−` ou molette | Zoom autour du centre ou du pointeur |
| Glisser le fond | Déplacer la caméra |
| Clic sur une machine | Aller à son explication |
| **Le parcours** | Choisir directement une étape |
| **Animations** (icône de mouvement, en haut) | Suspendre ou réactiver les mouvements ; suspend aussi le parcours |
| `?` | Aide, raccourcis et sources |

La préférence système `prefers-reduced-motion` supprime les mouvements spatiaux et les particules animées. Les flèches, les informations et la navigation restent disponibles. Une navigation manuelle ou l’ouverture d’une fenêtre suspend le parcours automatique. Les ancres `#reel/01` à `#reel/17` et `#cible/01` à `#cible/10` ouvrent une étape précise.

## Sources et arbitrage

- Architecture réelle : correction de l’utilisateur du 16 novembre, [cadrage, § 19](../../docs/01-CONTEXTE/02-CADRAGE.md#19-architecture-réseau-et-intégrations), [rôles des VM](../../application/infra/vm/installer.sh) et [réplicats applicatifs](../../application/infra/vm/pile.yaml). Les protocoles sont rapprochés de [HAProxy](../../application/infra/vm/haproxy.cfg), de la [pile RIGEL indépendante](../../application/infra/vm/pile-rigel.yaml), du [collecteur](../../application/infra/vm/logstash.conf) et de la [configuration des VM](../../application/infra/vm/vm.sh).
- Architecture cible : [DAT, § 6](../../docs/03-ARCHITECTURE/18-DOSSIER-ARCHITECTURE-TECHNIQUE.md#6-architecture-cible). Les quatre VM constituent un gabarit d’essai pour 1 000 postes, et non une capacité mesurée. Les flux TLS internes sont proposés ; l’identité, l’administration Windows et l’exploitation restent à qualifier selon le DAT.
- Identité graphique : [logos ORION](../../design/assets/logos/) et [sources et licences des logos techniques](assets/logos/SOURCES.md).
- Animation et accessibilité : [guide Motion de Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance/guides/ui-behaviors/motion) et [transformations CSS, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform). La caméra utilise `transform`, les textes `opacity` et `transform` ; le contrôle des mouvements reste disponible en plus de la préférence système.

**Correction de l’utilisateur du 16 novembre 2026 :** le cluster conserve trois managers (orion-1 à orion-3), avec un quorum de deux. Cette correction remplace la répartition précédente à quatre managers. Le support rejoint les scripts actuels : orion-4 et orion-5 sont workers applicatifs ; Apache et Express ont chacun deux instances, une par VM. Le DAT et les schémas documentaires restent à aligner sur cette correction, comme l’indique le [backlog technique, § 6](../../docs/04-ORGANISATION/21-BACKLOG-TECHNIQUE-ET-FEUILLE-DE-ROUTE.md#6-dossier-darchitecture--écarts-à-traiter-dat). Aucun état d’exécution sur les VM n’a été mesuré pour produire ce support. Les documents d’architecture protégés et la configuration applicative n’ont pas été modifiés.

Les schémas interactifs sont des vues pédagogiques propres à ce support. Les cartes regroupent les services d’une VM ; le pilote syslog et le maillage Swarm sont regroupés dans le flux de collecte réel. La reprise sur orion-9 est un exemple explicatif de panne, sans action sur l’infrastructure. La carte cible conserve PostgreSQL sur le SSD local de VM 3 et les fichiers de logs sur VM 4 ; le déplacement de la base vers NFS reste conditionnel. MindefConnect est extérieur aux quatre VM ORION. Aucun relais ni connecteur n’est représenté dans la cible RIGEL.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| [index.html](index.html) | Structure, commandes et fenêtres accessibles |
| [styles.css](styles.css) | Mise en page, thèmes des rôles et animations de flux |
| [architecture.js](architecture.js) | Machines, liaisons, coordonnées et contenu des 27 étapes |
| [presentation.js](presentation.js) | Caméra, navigation, lecture et interactions |
| [assets/logos/](assets/logos/) | Logos locaux et leurs licences |
