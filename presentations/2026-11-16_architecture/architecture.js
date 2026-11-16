/* Sources, arbitrages et limites : README.md. Les coordonnées sont locales à chaque carte. */
"use strict";

window.ORION_ARCHITECTURE = {
  boards: [
    {
      id: "reel", x: 0, title: "L’architecture réelle", subtitle: "10 VM · Déploiement du démonstrateur",
      bounds: [-20, -170, 2450, 1620],
      zone: [370, 0, 1660, 1390], zoneLabel: "Docker Swarm · 3 managers · 6 workers", zoneLogo: "docker",
      nodes: [
        { id: "browser", x: 40, y: 425, w: 250, h: 200, title: "Navigateur", role: "Utilisateur ORION", type: "external", icon: "browser", services: [{ name: "Interface React", logo: "react", meta: "HTTPS · 443" }] },
        { id: "github", x: 40, y: 45, w: 250, h: 190, title: "GitHub", role: "Intégration continue", type: "external", services: [{ name: "GitHub Actions", logo: "github", meta: "Tests et publication" }] },
        { id: "r1", x: 420, y: 405, w: 290, h: 240, title: "orion-1", role: "Entrée HTTPS", type: "entry", badge: "manager", address: "172.16.131.188", services: [{ name: "HAProxy", logo: "haproxy", meta: "443 · 8444 (console)" }] },
        { id: "r2", x: 730, y: 45, w: 260, h: 215, title: "orion-2", role: "Quorum Swarm", badge: "manager", address: "172.16.131.133", services: [{ name: "Orchestration", logo: "docker", meta: "1 voix sur 3" }] },
        { id: "r3", x: 1060, y: 45, w: 300, h: 215, title: "orion-3", role: "Déploiement continu", badge: "manager", address: "172.16.131.193", services: [{ name: "Runner Actions", logo: "github", meta: "Service de l’hôte" }] },
        { id: "r4", x: 870, y: 390, w: 330, h: 270, title: "orion-4", role: "Application · instance 1", type: "app", badge: "worker", address: "172.16.131.208", services: [{ name: "Apache · React", logo: "apache", meta: "HTTP · 8080" }, { name: "Node.js · Express", logo: "nodejs", meta: "HTTP · 3001" }] },
        { id: "r5", x: 870, y: 750, w: 330, h: 270, title: "orion-5", role: "Application · instance 2", type: "app", badge: "worker", address: "172.16.131.142", services: [{ name: "Apache · React", logo: "apache", meta: "HTTP · 8080" }, { name: "Node.js · Express", logo: "nodejs", meta: "HTTP · 3001" }] },
        { id: "r6", x: 1430, y: 470, w: 330, h: 220, title: "orion-6", role: "Données et sessions", type: "data", badge: "worker", address: "172.16.131.131", services: [{ name: "PostgreSQL", logo: "postgresql", meta: "TCP · 5432" }] },
        { id: "r7", x: 1430, y: 60, w: 330, h: 270, title: "orion-7", role: "Identité", type: "identity", badge: "worker", address: "172.16.131.137", services: [{ name: "Keycloak", logo: "keycloak", meta: "HTTP · 8080" }, { name: "OpenLDAP", logo: "openldap", meta: "LDAP · 389" }] },
        { id: "r8", x: 1430, y: 820, w: 330, h: 220, title: "orion-8", role: "Collecte des logs", type: "logs", badge: "worker", address: "172.16.131.146", services: [{ name: "Logstash", logo: "logstash", meta: "Syslog TLS · 6514" }] },
        { id: "r9", x: 1430, y: 1130, w: 330, h: 245, title: "orion-9", role: "Secours commun", type: "data", badge: "worker", address: "172.16.131.190", className: "spare", note: "Reprise de la base, de l’identité ou de la collecte" },
        { id: "r10", x: 2090, y: 460, w: 300, h: 290, title: "orion-10", role: "Stockage partagé", type: "storage", badge: "hors Swarm", address: "172.16.131.197", services: [{ name: "Données", icon: "disk", meta: "PostgreSQL et LDAP" }, { name: "Logs", icon: "disk", meta: "Disque séparé · NFS" }] },
        { id: "agents", x: 870, y: 1140, w: 330, h: 205, title: "Postes simulés", role: "Sur orion-4 ou orion-5", type: "external", services: [{ name: "Simulateur Node.js", logo: "windows", meta: "Postes + agent Windows" }] },
        { id: "connector", x: 420, y: 1140, w: 290, h: 205, title: "Connecteur", role: "Sur orion-4 ou orion-5", type: "app", badge: "orion-rigel", services: [{ name: "Node.js", logo: "nodejs", meta: "Pile indépendante" }] },
        { id: "proxy", x: 40, y: 930, w: 250, h: 140, title: "Proxy réseau", role: "172.16.0.1 : 8080", type: "external" },
        { id: "relay", x: 40, y: 1170, w: 250, h: 220, title: "RIGEL · Hidora", role: "Téléphone ↔ relais", type: "external", services: [{ name: "Relais public", icon: "phone", meta: "HTTPS · blocs chiffrés" }], note: "PostgreSQL du relais" }
      ],
      edges: [
        { id: "web", d: "M290 525H420", label: "HTTPS · 443", lx: 354, ly: 499 },
        { id: "app1", d: "M710 525H870", label: "HTTP · 8080 / 3001", lx: 790, ly: 501 },
        { id: "app2", d: "M710 585H755V860H870", label: "HTTP · 8080 / 3001", lx: 765, ly: 836 },
        { id: "identity", d: "M710 440H765V295H1390V195H1430", label: "HTTP · 8080", lx: 1235, ly: 280 },
        { id: "db1", d: "M1200 525H1300V580H1430", label: "TCP · 5432", lx: 1350, ly: 555 },
        { id: "db2", d: "M1200 865H1350V625H1430", label: "TCP · 5432", lx: 1280, ly: 840 },
        { id: "data", d: "M1760 580H2090", label: "NFS · 2049", lx: 1917, ly: 559 },
        { id: "ldap-data", d: "M1760 215H1990V510H2090", label: "NFS · 2049", lx: 1880, ly: 193 },
        { id: "logging", d: "M1200 930H1430", label: "Syslog TLS · 6514", lx: 1345, ly: 905 },
        { id: "logs", d: "M1760 930H1940V650H2090", label: "NFS · 2049", lx: 1838, ly: 907 },
        { id: "agents", d: "M1035 1140V1090H1250V970H1200", label: "API des postes · 3001", lx: 1144, ly: 1066 },
        { id: "ci", d: "M1060 150H1030V-35H165V45", label: "HTTPS sortant · via proxy", lx: 615, ly: -55 },
        { id: "deploy", d: "M1060 210H1030V270H735V370H565V405", label: "SSH · 22", lx: 875, ly: 294 },
        { id: "recover", d: "M1760 1230H2040V705H2090", label: "Même volume NFS", lx: 1885, ly: 1207, scenario: true },
        { id: "poll", d: "M420 1230H330V1000H290", label: "Relève sortante", lx: 362, ly: 1120 },
        { id: "relay", d: "M165 1070V1170", label: "HTTPS · 443", lx: 226, ly: 1128 },
        { id: "merge", d: "M710 1250H795V965H870", label: "HTTP · 3001", lx: 800, ly: 1075 }
      ]
    },
    {
      id: "cible", x: 3500, title: "L’architecture cible", subtitle: "C1NP · Gabarit initial d’essai pour 1 000 postes",
      bounds: [-20, -170, 2230, 1620],
      zone: [440, 280, 1660, 990], zoneLabel: "C1NP · 4 VM dédiées à ORION", zoneIcon: "shield",
      nodes: [
        { id: "browser", x: 30, y: 390, w: 280, h: 200, title: "Navigateur", role: "Utilisateur ORION", type: "external", services: [{ name: "Interface React", logo: "react", meta: "HTTPS · 443" }] },
        { id: "mindef", x: 1100, y: 30, w: 330, h: 200, title: "MindefConnect", role: "Identité du ministère", type: "identity", badge: "hors des 4 VM", services: [{ name: "Fournisseur OIDC", icon: "shield", meta: "HTTPS · 443" }] },
        { id: "c1", x: 490, y: 350, w: 360, h: 340, title: "VM 1", role: "Entrée et interfaces", type: "entry", address: "2 vCPU · 8 Go RAM", services: [{ name: "HAProxy", logo: "haproxy", meta: "HTTPS · 443" }, { name: "Apache · ORION", logo: "apache", meta: "HTTP local · 8080" }, { name: "Apache · RIGEL", logo: "apache", meta: "HTTP local · 8081" }] },
        { id: "c2", x: 1100, y: 420, w: 330, h: 260, title: "VM 2", role: "Application", type: "app", address: "8 vCPU · 32 Go RAM", services: [{ name: "Node.js · Express", logo: "nodejs", meta: "HTTPS · 3001 proposé" }, { name: "Administration PC", logo: "windows", meta: "Composant à préciser" }] },
        { id: "c3", x: 1710, y: 350, w: 330, h: 330, title: "VM 3", role: "Base et collecte", type: "data", address: "4 vCPU · 16 Go RAM", services: [{ name: "PostgreSQL", logo: "postgresql", meta: "TLS · 5432 · SSD local" }, { name: "Logstash", logo: "logstash", meta: "TLS · 6514 · file locale" }], note: "100 Go SSD pour la base" },
        { id: "c4", x: 1710, y: 1000, w: 330, h: 220, title: "VM 4", role: "Fichiers de logs", type: "storage", address: "2 vCPU · 8 Go RAM", services: [{ name: "Serveur NFSv4.2", icon: "disk", meta: "TCP · 2049 · 100 Go logs" }] },
        { id: "windows", x: 30, y: 740, w: 280, h: 220, title: "Postes Windows", role: "Choix d’intégration ouvert", type: "external", services: [{ name: "Config. Manager", logo: "windows", meta: "OU agent M42 à développer" }] },
        { id: "phone", x: 30, y: 1120, w: 280, h: 220, title: "Téléphone", role: "PWA RIGEL", type: "external", services: [{ name: "Mode hors ligne", icon: "phone", meta: "IndexedDB · synchronisation" }], note: "Nom public sur Internet" }
      ],
      edges: [
        { id: "web", d: "M310 490H490", label: "HTTPS · 443", lx: 396, ly: 467 },
        { id: "api", d: "M850 520H1100", label: "HTTPS · 3001 proposé", lx: 975, ly: 496 },
        { id: "db", d: "M1430 510H1710", label: "PostgreSQL TLS · 5432", lx: 1565, ly: 486 },
        { id: "browser-oidc", d: "M310 430H365V135H1100", label: "OIDC · HTTPS 443", lx: 725, ly: 112 },
        { id: "server-oidc", d: "M1265 420V230", label: "OIDC · HTTPS 443", lx: 1360, ly: 317 },
        { id: "entry-logs", d: "M670 690V820H1785V680", label: "Syslog TLS · 6514", lx: 1130, ly: 800 },
        { id: "api-logs", d: "M1430 605H1545V650H1710", label: "Syslog TLS · 6514", lx: 1562, ly: 700 },
        { id: "log-files", d: "M1875 680V1000", label: "NFSv4.2 · 2049", lx: 1958, ly: 855 },
        { id: "rigel", d: "M310 1230H390V610H490", label: "HTTPS · 443", lx: 399, ly: 1045 }
      ]
    }
  ],

  steps: [
    {
      id: "reel/01", board: "reel", chapter: "Le déploiement", menu: "Une vue d’ensemble", kicker: "Architecture réelle",
      title: "Dix machines.\nUn même système.", description: "De l’entrée HTTPS aux données, chaque machine a un rôle. La carte se rapproche des services à mesure que le parcours avance.",
      facts: [["Infrastructure", "10 VM Debian 13"], ["Organisation", "3 managers · 6 workers · 1 stockage"]],
      takeaway: "Cliquez sur une VM pour l’explorer, ou avancez avec la flèche →.", caption: "Une entrée · un back métier · des services d’infrastructure"
    },
    {
      id: "reel/02", board: "reel", chapter: "L’entrée", menu: "orion-1 · Le point d’entrée", kicker: "orion-1 · 172.16.131.188", nodes: ["r1"],
      title: "Tout commence\nici.", description: "Le navigateur joint HAProxy en HTTPS. Il termine TLS et dirige chaque requête vers l’interface, l’API ou Keycloak.",
      facts: [["Entrée unique", "https://172.16.131.188"], ["Console Keycloak", "HTTPS · 8444 /admin/"]],
      takeaway: "HAProxy assure seul le reverse proxy et la répartition entre les deux VM applicatives. Il est fixé sur orion-1.", edges: ["web"], focus: [250, 270, 650, 600], caption: "Navigateur → HAProxy · HTTPS 443"
    },
    {
      id: "reel/03", board: "reel", chapter: "Le parcours web", menu: "Charger l’interface", kicker: "Du navigateur à l’interface", nodes: ["browser", "r1", "r4", "r5"],
      title: "L’interface\narrive du front.", description: "HAProxy répartit les requêtes entre les deux Apache. Ils servent les fichiers de l’interface React ; les règles métier sont exécutées par Express.",
      facts: [["À l’extérieur", "HTTPS · 443"], ["Dans Swarm", "HTTP · 8080 sur overlay chiffré"]],
      takeaway: "Deux instances Apache, une sur chaque VM applicative.", edges: ["web", "app1", "app2"], focus: [0, 250, 1270, 850], caption: "Navigateur → HAProxy → Apache → interface React"
    },
    {
      id: "reel/04", board: "reel", chapter: "L’application", menu: "orion-4 · Exécuter les règles", kicker: "orion-4 · 172.16.131.208", nodes: ["r4"],
      title: "Un back unique.\nDes règles communes.", description: "Express contrôle les droits, applique les règles métier et génère les PDF à la demande. Apache et Express sont des services distincts.",
      facts: [["Front", "Apache · fichiers React"], ["Back", "Node.js · Express · HTTP 3001"]],
      takeaway: "Les PDF sont produits à chaque demande et ne sont pas conservés.", edges: ["app1", "db1"], focus: [710, 235, 800, 570], caption: "HAProxy → Express → PostgreSQL"
    },
    {
      id: "reel/05", board: "reel", chapter: "L’application", menu: "orion-5 · La seconde instance", kicker: "orion-5 · 172.16.131.142", nodes: ["r4", "r5"],
      title: "Deux instances.\nLe même état.", description: "orion-5 est worker applicatif. Il exécute aussi Apache et Express ; les sessions et les données restent dans PostgreSQL pour être partagées entre les instances.",
      facts: [["Répartition", "2 Apache · 2 Express"], ["Placement", "1 instance de chaque par VM"]],
      takeaway: "Express ne conserve aucun état qui fasse autorité en mémoire. Si une VM applicative tombe, l’autre instance reste disponible.", edges: ["app1", "app2", "db1", "db2"], focus: [730, 290, 1080, 850], caption: "orion-4 et orion-5 → une même base"
    },
    {
      id: "reel/06", board: "reel", chapter: "L’identité", menu: "orion-7 · Authentifier", kicker: "orion-7 · 172.16.131.137", nodes: ["r7"],
      title: "L’identité\na son service.", description: "Keycloak authentifie l’utilisateur avec OpenLDAP. Dans le démonstrateur, cet ensemble tient lieu de MindefConnect.",
      facts: [["Navigateur → Keycloak", "HTTPS via HAProxy"], ["Keycloak → OpenLDAP", "LDAP · 389 sur overlay chiffré"]],
      takeaway: "Le fournisseur vérifie l’identité. Le compte ORION porte le profil, l’école et l’état actif.", edges: ["identity", "ldap-data"], focus: [1210, -20, 780, 565], caption: "HAProxy → Keycloak → OpenLDAP"
    },
    {
      id: "reel/07", board: "reel", chapter: "L’identité", menu: "Ouvrir une session ORION", kicker: "Parcours OIDC", nodes: ["r1", "r4", "r7", "r6"],
      title: "Identité vérifiée.\nDroits appliqués.", description: "Après le retour OIDC, Express rapproche l’identité du compte ORION actif. La session est conservée dans PostgreSQL et le navigateur reçoit un cookie HttpOnly.",
      facts: [["Authentification", "Authorization Code · PKCE"], ["Autorisation", "Compte, profil et école dans ORION"]],
      takeaway: "Les rôles Keycloak ne déterminent pas les droits applicatifs.", edges: ["web", "app1", "identity", "db1"], focus: [350, 0, 1480, 770], caption: "Redirection OIDC → retour ORION → session PostgreSQL"
    },
    {
      id: "reel/08", board: "reel", chapter: "Les données", menu: "orion-6 · La base d’autorité", kicker: "orion-6 · 172.16.131.131", nodes: ["r6"],
      title: "Une base\nfait autorité.", description: "PostgreSQL conserve les données métier, les comptes, les sessions et le journal de fusion. Les deux Express s’appuient sur cet état sans conserver de données d’autorité en mémoire.",
      facts: [["Moteur", "PostgreSQL 17.7 · TCP 5432"], ["Écritures concurrentes", "Fusion élément par élément"]],
      takeaway: "Dans l’architecture réelle, le volume de la base est hébergé sur orion-10.", edges: ["db1", "db2", "data"], focus: [1190, 365, 1200, 470], caption: "Express → PostgreSQL → volume NFS partagé"
    },
    {
      id: "reel/09", board: "reel", chapter: "Le stockage", menu: "orion-10 · Conserver les fichiers", kicker: "orion-10 · 172.16.131.197", nodes: ["r10"],
      title: "Les services bougent.\nLes données restent.", description: "Cette VM reste hors Swarm. Elle partage les données persistantes et les fichiers de logs en NFS, sur deux disques séparés.",
      facts: [["Disque de données", "PostgreSQL et OpenLDAP"], ["Disque de logs", "Fichiers centralisés par service"]],
      takeaway: "Les volumes ne restent jamais sur la VM qui exécute le conteneur. Le stockage partagé reste un point de dépendance.", edges: ["data", "ldap-data", "logs"], focus: [1690, 335, 740, 690], caption: "NFSv4.2 · TCP 2049 · données et logs séparés"
    },
    {
      id: "reel/10", board: "reel", chapter: "Les logs", menu: "orion-8 · Collecter les traces", kicker: "orion-8 · 172.16.131.146", nodes: ["r8", "r10"],
      title: "Des traces\nau même endroit.", description: "Les conteneurs envoient leurs logs par le pilote syslog Docker. Logstash reçoit le flux sous TLS et écrit les fichiers sur le partage NFS.",
      facts: [["Collecte", "Syslog TLS · 6514"], ["Conservation", "Fichiers par service et par jour"]],
      takeaway: "Le schéma regroupe le pilote local et le maillage Swarm. Les journaux système et ceux du collecteur restent locaux.", edges: ["logging", "logs"], focus: [1140, 450, 1280, 690], caption: "Conteneurs → pilote Docker / Swarm → Logstash → NFS"
    },
    {
      id: "reel/11", board: "reel", chapter: "Les postes", menu: "Faire remonter l’état d’un poste", kicker: "Le simulateur des postes", nodes: ["agents", "r5", "r6"],
      title: "Le poste\nprend l’initiative.", description: "Le simulateur représente les postes Windows et leur agent. Il envoie l’état des postes à l’API réelle et reçoit les interventions en attente dans la réponse.",
      facts: [["Rapport", "POST /api/agent/rapports"], ["Règles", "Autorisations vérifiées par Express"]],
      takeaway: "Processus, détections et installations sont alimentés par les postes.", edges: ["agents", "db2"], focus: [750, 640, 1080, 770], caption: "Poste simulé → rapport → API → interventions dans la réponse"
    },
    {
      id: "reel/12", board: "reel", chapter: "Les postes", menu: "Exécuter une intervention", kicker: "Une demande, puis un résultat", nodes: ["agents", "r5"],
      title: "Demander.\nExécuter. Confirmer.", description: "L’utilisateur demande une intervention. Le simulateur la récupère, l’exécute sur l’état simulé et renvoie son résultat au serveur.",
      facts: [["Retour du poste", "POST /api/agent/resultats"], ["Suivi", "Historique fixé par le serveur"]],
      takeaway: "Le futur agent M42 n’est pas développé. C’est le simulateur qui reproduit ce circuit complet.", edges: ["agents", "db2"], focus: [730, 640, 1080, 770], caption: "Demande → récupération → exécution simulée → résultat"
    },
    {
      id: "reel/13", board: "reel", chapter: "Le pilotage", menu: "orion-2 · Maintenir le quorum", kicker: "orion-2 · 172.16.131.133", nodes: ["r1", "r2", "r3"],
      title: "Trois managers.\nDeux voix suffisent.", description: "orion-1, orion-2 et orion-3 maintiennent l’état du cluster. Les workers exécutent les services selon les contraintes de placement.",
      facts: [["Managers", "orion-1 · orion-2 · orion-3"], ["Quorum", "2 managers disponibles sur 3"]],
      takeaway: "Le quorum permet l’orchestration ; il ne rend pas l’entrée HAProxy redondante.", focus: [350, -70, 1110, 790], caption: "Pilotage Swarm distinct de l’exécution applicative"
    },
    {
      id: "reel/14", board: "reel", chapter: "Le déploiement", menu: "orion-3 · Livrer une version", kicker: "orion-3 · 172.16.131.193", nodes: ["github", "r3", "r1"],
      title: "Une version publiée.\nUn déploiement suivi.", description: "La CI teste et publie les images. Le runner reçoit les travaux GitHub par une connexion sortante via le proxy, puis lance le déploiement sur orion-1 en SSH.",
      facts: [["Runner", "Service de l’hôte, hors pile"], ["Déploiement", "SSH · 22 → docker stack deploy"]],
      takeaway: "Les images publiées sont immuables. Le runner est propre à l’architecture réelle.", edges: ["ci", "deploy"], focus: [0, -100, 1460, 810], caption: "GitHub Actions → images publiées → runner → manager Swarm"
    },
    {
      id: "reel/15", board: "reel", chapter: "La continuité", menu: "orion-9 · Reprendre un service", kicker: "orion-9 · 172.16.131.190", nodes: ["r9", "r10"], failed: ["r6"], recover: "r9",
      title: "Une VM tombe.\nLe service est recréé.", description: "Exemple : si orion-6 tombe, Swarm recrée PostgreSQL sur orion-9 et remonte le même volume NFS. Le secours est commun à la base, à l’identité et à la collecte.",
      facts: [["Reprise", "Automatique sur la VM de secours"], ["État conservé", "Même stockage sur orion-10"]],
      takeaway: "Une courte interruption reste possible. Une VM applicative peut tomber ; l’autre instance reste disponible. L’entrée et le stockage restent des points de dépendance.", edges: ["recover"], focus: [1340, 440, 1110, 980], caption: "Exemple de panne : PostgreSQL repris sur orion-9"
    },
    {
      id: "reel/16", board: "reel", chapter: "RIGEL en réel", menu: "RIGEL · Un connecteur sortant", kicker: "Téléphone, relais et connecteur", nodes: ["relay", "proxy", "connector", "r5"],
      title: "Le mobile passe\npar un relais.", description: "Le téléphone échange avec le relais public Hidora. Le connecteur relève les blocs chiffrés via le proxy sortant, puis les intègre par Express dans PostgreSQL ORION.",
      facts: [["Hors ligne", "Travail conservé dans IndexedDB"], ["Isolation", "Pile orion-rigel indépendante"]],
      takeaway: "Aucune connexion n’est initiée depuis Internet vers les VM ORION. Le connecteur peut déchiffrer les blocs.", edges: ["poll", "relay", "merge", "db2"], focus: [-10, 650, 1410, 810], caption: "Téléphone ↔ Hidora ← relève sortante du connecteur → API ORION"
    },
    {
      id: "reel/17", board: "reel", chapter: "De la réalisation à la cible", menu: "Prendre du recul", kicker: "Vue d’ensemble", title: "Le démonstrateur\nmet les flux en place.",
      description: "Swarm sépare les rôles, réplique le front et le back sur orion-4 et orion-5, puis rattache les données à un stockage partagé. La cible réorganise ces fonctions dans l’environnement C1NP.",
      facts: [["Architecture réelle", "10 VM · conteneurs et substituts d’identité"], ["Architecture cible", "4 VM · MindefConnect · intégrations à qualifier"]],
      takeaway: "La cible garde un back métier unique. Elle ne reprend ni Swarm, ni Keycloak/OpenLDAP, ni le runner.", caption: "Dézoomer pour comprendre, puis passer à la cible →"
    },
    {
      id: "cible/01", board: "cible", chapter: "La cible C1NP", menu: "Quatre VM, quatre rôles", kicker: "Architecture cible", title: "Quatre machines.\nDes rôles regroupés.",
      description: "Le premier gabarit d’essai regroupe l’entrée, l’application, la base avec la collecte, puis les fichiers de logs. MindefConnect reste extérieur aux quatre VM ORION.",
      facts: [["Gabarit d’essai", "1 000 postes · capacité à mesurer"], ["Total initial", "16 vCPU · 64 Go RAM · 400 Go"]],
      takeaway: "Les capacités, le système des VM et les modalités d’exploitation restent à qualifier avec l’hébergeur.", caption: "C1NP · architecture proposée · aucune IP cible fixée"
    },
    {
      id: "cible/02", board: "cible", chapter: "L’entrée cible", menu: "VM 1 · Une entrée, deux fronts", kicker: "VM 1 · Entrée", nodes: ["c1"],
      title: "Une entrée.\nDeux interfaces.", description: "HAProxy reçoit le HTTPS. Sur la même VM, un Apache sert ORION et un second Apache sert la PWA RIGEL, chacun sur une adresse de boucle locale.",
      facts: [["ORION", "Apache · HTTP local 8080"], ["RIGEL", "Apache · HTTP local 8081"]],
      takeaway: "Le nom public RIGEL expose uniquement ses fichiers et les routes /api/rigel.", edges: ["web", "api"], focus: [300, 245, 860, 670], caption: "HTTPS → HAProxy → Apache ORION ou Apache RIGEL"
    },
    {
      id: "cible/03", board: "cible", chapter: "L’application cible", menu: "VM 2 · Les règles métier", kicker: "VM 2 · Application", nodes: ["c2"],
      title: "Le métier\nreste dans Express.", description: "Le back applique les droits, traite les données et génère les PDF. Il est partagé par ORION et RIGEL, avec les mêmes règles serveur.",
      facts: [["Entrée → back", "HTTPS · 3001 proposé"], ["Back → base", "PostgreSQL sur TLS · 5432"]],
      takeaway: "La terminaison TLS sur VM 2 reste à mettre en place : le serveur actuel écoute en HTTP.", edges: ["api", "db"], focus: [835, 285, 1110, 590], caption: "HAProxy → Express → PostgreSQL · flux internes sur TLS proposés"
    },
    {
      id: "cible/04", board: "cible", chapter: "L’identité cible", menu: "MindefConnect · L’identité du ministère", kicker: "C1NP · hors des 4 VM ORION", nodes: ["mindef", "c2", "browser"],
      title: "MindefConnect\nprend le relais.", description: "Le navigateur et Express joignent le fournisseur d’identité en HTTPS. ORION conserve les comptes, profils, écoles et droits applicatifs dans sa base.",
      facts: [["Protocole visé", "OIDC · HTTPS 443"], ["À obtenir", "Contrat d’intégration du fournisseur"]],
      takeaway: "L’authentification cible est définie ; ses modalités d’intégration ne sont pas encore qualifiées.", edges: ["browser-oidc", "server-oidc"], focus: [0, -25, 1530, 800], caption: "Navigateur ↔ MindefConnect ↔ Express · identité et droits séparés"
    },
    {
      id: "cible/05", board: "cible", chapter: "Les données cibles", menu: "VM 3 · Base et collecte", kicker: "VM 3 · Base et collecte", nodes: ["c3"],
      title: "La base commence\nsur SSD local.", description: "PostgreSQL utilise d’abord le SSD de VM 3. Logstash partage cette VM avec une file locale bornée ; ses ressources doivent préserver le fonctionnement de la base.",
      facts: [["Base", "100 Go SSD local"], ["Mémoire de la VM", "16 Go RAM · ressources à mesurer"]],
      takeaway: "Déplacer la base sur VM 4 est une option conditionnée aux essais de durabilité et de latence, pas un choix acquis.", edges: ["db"], focus: [1440, 240, 740, 590], caption: "PostgreSQL local · stockage distant de la base conditionnel"
    },
    {
      id: "cible/06", board: "cible", chapter: "La collecte cible", menu: "Rassembler les logs", kicker: "Émetteurs → collecteur", nodes: ["c1", "c2", "c3"],
      title: "Collecter avant\nde conserver.", description: "Les émetteurs des VM 1 et 2 envoient les traces à Logstash sur VM 3. Le collecteur écrit les fichiers centralisés sur VM 4.",
      facts: [["Transport proposé", "Syslog RFC 5424 sur TLS · 6514"], ["Reprise à qualifier", "Files bornées et essais de coupure"]],
      takeaway: "Une connexion ouverte ne prouve pas qu’un événement est conservé. Le raccordement et la reprise doivent être vérifiés.", edges: ["entry-logs", "api-logs", "log-files"], focus: [410, 265, 1720, 1050], caption: "Émetteurs → Logstash (VM 3) → fichiers NFS (VM 4)"
    },
    {
      id: "cible/07", board: "cible", chapter: "Le stockage cible", menu: "VM 4 · Les fichiers de logs", kicker: "VM 4 · Stockage", nodes: ["c4"],
      title: "Un stockage\ndédié aux logs.", description: "VM 4 héberge le serveur NFS et les fichiers centralisés. Dans le gabarit initial, elle n’exécute ni PostgreSQL, ni Logstash, ni l’application.",
      facts: [["Accès prévu", "NFSv4.2 · TCP 2049 · depuis VM 3"], ["Capacité d’essai", "100 Go pour les logs"]],
      takeaway: "La sauvegarde PostgreSQL doit utiliser un stockage indépendant des quatre VM ; sa capacité et sa restauration restent à qualifier.", edges: ["log-files"], focus: [1470, 745, 710, 650], caption: "VM 4 conserve les fichiers ; VM 3 exécute le collecteur"
    },
    {
      id: "cible/08", board: "cible", chapter: "Les postes cibles", menu: "Administration Windows · Un choix ouvert", kicker: "Deux options exclusives", nodes: ["windows", "c2"],
      title: "Un choix\nreste à faire.", description: "Configuration Manager réutiliserait un service ministériel, s’il existe, ou nécessiterait une infrastructure dédiée. L’autre option est M42, un agent Windows à développer par ASTER.",
      facts: [["Option A", "Configuration Manager · contrat à obtenir"], ["Option B", "M42 · agent à développer"]],
      takeaway: "Une installation dédiée de Configuration Manager nécessiterait au moins une VM Windows Server hors des quatre VM ORION. Aucune option n’est retenue.", focus: [0, 365, 1520, 710], caption: "Option A ou option B · composant côté ORION sur VM 2"
    },
    {
      id: "cible/09", board: "cible", chapter: "RIGEL en cible", menu: "RIGEL · Rejoindre la même entrée", kicker: "Un nom public · le même back", nodes: ["phone", "c1", "c2", "c3"],
      title: "Le mobile rejoint\nla même architecture.", description: "Le téléphone charge RIGEL par un nom public pointant vers HAProxy. Il synchronise son travail avec le même Express et la même base ORION.",
      facts: [["Pendant une coupure", "Travail local dans IndexedDB"], ["Au retour du réseau", "HTTPS → /api/rigel → PostgreSQL"]],
      takeaway: "La cible ne comporte ni relais Hidora, ni connecteur. L’exposition publique est limitée au front et à l’API RIGEL.", edges: ["rigel", "api", "db"], focus: [-10, 275, 2100, 1140], caption: "Téléphone → HAProxy → Express → PostgreSQL · sans relais"
    },
    {
      id: "cible/10", board: "cible", chapter: "La trajectoire", menu: "Retenir les différences", kicker: "Du réel à la cible", title: "Les mêmes fonctions.\nUn autre déploiement.",
      description: "La cible regroupe les fonctions sur quatre VM C1NP, remplace les substituts d’identité par MindefConnect et rattache RIGEL à l’entrée commune.",
      facts: [["Ce qui reste", "React · Apache · Express · PostgreSQL · Logstash"], ["À qualifier", "Charge · TLS interne · identité · exploitation"]],
      takeaway: "Le gabarit est un point de départ d’essai. Le dimensionnement et la résilience attendue se confirment par les mesures et les contrats d’exploitation.", caption: "Une carte lisible · des responsabilités distinctes · des intégrations explicites"
    }
  ]
};
