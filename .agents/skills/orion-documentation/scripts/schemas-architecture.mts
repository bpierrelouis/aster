// Génère les deux schémas de l'architecture réelle (icônes Lucide, licence ISC), depuis la racine du dépôt :
//   node .agents/skills/orion-documentation/scripts/schemas-architecture.mts application/node_modules/lucide-react simple docs/assets/architecture/ORION-VUE-SIMPLIFIEE.svg
//   node .agents/skills/orion-documentation/scripts/schemas-architecture.mts application/node_modules/lucide-react complet docs/assets/architecture/ORION-DEPLOIEMENT-VM.svg
//   node .agents/skills/orion-documentation/scripts/schemas-architecture.mts application/node_modules/lucide-react cible docs/assets/architecture/ORION-CIBLE-C1NP.svg
//   node .agents/skills/orion-documentation/scripts/schemas-architecture.mts application/node_modules/lucide-react cible-simple docs/assets/architecture/ORION-CIBLE-VUE-SIMPLIFIEE.svg
// Coordonnées écrites à la main ; règles de contenu et de tracé dans AGENTS.md (Architecture technique).
import { readFileSync, writeFileSync } from 'node:fs';

const [, , lucideDir, kind, out] = process.argv;
type Pt = [number, number];
type Ton = 'manager' | 'worker' | 'hors';
/** Nœud d'icône Lucide : [balise, attributs] */
type IconNode = [string, Record<string, string>][];

const esc = (s: unknown) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function iconNode(name: string): IconNode {
  const src = readFileSync(`${lucideDir}/dist/esm/icons/${name}.js`, 'utf8');
  const body = src.slice(src.indexOf('[', src.indexOf('createLucideIcon(')), src.lastIndexOf(']);') + 1);
  return JSON.parse(body.replace(/(\w+):/g, '"$1":').replace(/,\s*"key":\s*"[^"]*"/g, ''));
}
const C = {
  ink: '#142a40', sub: '#425a72', blue: '#0f6cbd', line: '#0f6cbd',
  zone: '#f3f8fd', zoneStroke: '#9cc0e4', vm: '#ffffff', vmStroke: '#b9c7d6',
  green: '#e6f4ec', greenStroke: '#8fc4a3', amber: '#fff6e5', amberStroke: '#e3bd6d', ext: '#eef3f8', extStroke: '#b3c3d3',
};
const used = new Set<string>();
const parts: string[] = [];
const add = (s: string) => parts.push(s);
const icon = (name: string, x: number, y: number, size = 20, color = C.blue) => { used.add(name); add(`<use href="#i-${name}" x="${x}" y="${y}" width="${size}" height="${size}" style="color:${color}"/>`); };
const text = (x: number, y: number, s: string | number, cls: string, anchor = 'start') => add(`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${esc(s)}</text>`);
const rect = (x: number, y: number, w: number, h: number, fill: string, stroke: string, opts: { rx?: number; dashed?: boolean; sw?: number } = {}) => add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${opts.rx ?? 10}" fill="${fill}" stroke="${stroke}"${opts.dashed ? ' stroke-dasharray="7 5"' : ''}${opts.sw ? ` stroke-width="${opts.sw}"` : ''}/>`);
function arrow(points: Pt[], opts: { dashed?: boolean } = {}) {
  const d = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
  add(`<path d="${d}" class="flow${opts.dashed ? ' auto' : ''}" marker-end="url(#arrow)"/>`);
}
const label = (x: number, y: number, s: string, anchor = 'start') => text(x, y, s, 'route', anchor);
function pill(xRight: number, y: number, s: string, tone: Ton) {
  const w = s.length * 7.2 + 14;
  const fill = { manager: '#d7e8fb', worker: '#e8eef5', hors: C.amber }[tone];
  rect(xRight - w, y, w, 19, fill, 'none', { rx: 9.5 });
  text(xRight - w / 2, y + 13.5, s, 'badge', 'middle');
}

const heading = (name: string, detail: string) => {
  text(40, 46, name, 'title');
  text(40, 74, detail, 'body');
};
const card = (x: number, y: number, ic: string, name: string, role: string, vm: string, opts: { w?: number; stroke?: string; color?: string } = {}) => {
  const w = opts.w ?? 170;
  rect(x, y, w, 128, '#fff', opts.stroke ?? '#c8d6e4', { rx: 8 });
  icon(ic, x + w / 2 - 18, y + 14, 36, opts.color ?? C.blue);
  text(x + w / 2, y + (role ? 72 : 92), name, 'cname', 'middle');
  if (role) text(x + w / 2, y + 91, role, 'crole', 'middle');
  if (vm) text(x + w / 2, y + 112, vm, 'cvm', 'middle');
};
const zone = (x: number, y: number, w: number, h: number, name: string) => { rect(x, y, w, h, C.zone, C.zoneStroke, { rx: 6 }); text(x + 14, y + 24, name, 'zname'); };

const svc = (x: number, y: number, w: number, h: number, ic: string, name: string, lines: string[], host = false, showTag = true) => {
  rect(x, y, w, h, host ? C.amber : '#f2f7fd', host ? C.amberStroke : '#aac6e3', { rx: 8 });
  icon(ic, x + 10, y + 10, 20, host ? '#a06a00' : C.blue);
  text(x + 38, y + 25, name, 'service');
  if (showTag) text(x + w - 10, y + 24, host ? 'service hôte' : 'conteneur', host ? 'tag host' : 'tag', 'end');
  lines.forEach((l, i) => text(x + 38, y + 43 + i * 16, l, 'caption'));
};
const vol = (x: number, y: number, w: number, name: string, lines: string[]) => {
  rect(x, y, w, 25 + lines.length * 15, C.green, C.greenStroke, { rx: 8 });
  icon('hard-drive', x + 10, y + 12, 16, '#2f7a4f');
  text(x + 34, y + 17, name, 'vol');
  lines.forEach((l, i) => text(x + 34, y + 32 + i * 15, l, 'caption'));
};
const ext = (x: number, y: number, w: number, h: number, ic: string, name: string, lines: string[]) => {
  rect(x, y, w, h, C.ext, C.extStroke);
  icon(ic, x + 12, y + 12, 22, '#3d5a78');
  text(x + 44, y + 28, name, 'service');
  lines.forEach((l, i) => text(x + 44, y + 47 + i * 16, l, 'caption'));
};

const enclosure = (x: number, y: number, w: number, h: number, ic: string, name: string) => {
  rect(x, y, w, h, '#f7fafd', '#7aa7d6', { rx: 12, sw: 1.5 });
  icon(ic, x + 16, y + 12, 22);
  text(x + 46, y + 29, name, 'frame');
};

const ips = ["172.16.131.188","172.16.131.133","172.16.131.193","172.16.131.208","172.16.131.142","172.16.131.131","172.16.131.137","172.16.131.146","172.16.131.190","172.16.131.197"];

let W: number, H: number, title: string, desc: string;

if (kind === 'cible-simple') {
  W = 1460; H = 626;
  title = 'ORION — architecture cible';
  desc = 'Vue simplifiée des quatre VM ORION, du service MindefConnect et des principaux échanges.';

  heading(title, 'Vue simplifiée · 1 000 postes actifs');
  enclosure(245, 102, 1185, 500, 'network', 'C1NP');
  enclosure(268, 257, 1139, 320, 'server', 'VM ORION');
  zone(280, 299, 215, 164, 'Entrée');
  zone(576, 299, 215, 164, 'Application');
  zone(872, 299, 215, 164, 'Base et collecte');
  zone(1170, 299, 225, 164, 'Stockage');

  card(32, 320, 'users', 'Firefox', '', '', { w: 145, stroke: C.extStroke });
  card(32, 466, 'monitor', 'Postes Windows', '', '', { w: 145, stroke: C.extStroke });
  card(465, 117, 'key-round', 'MindefConnect', 'Service d’identité', '', { w: 200, stroke: C.extStroke });
  card(290, 329, 'split', 'HAProxy et Apache', 'Interface React', 'VM 1 . Entrée', { w: 195 });
  card(586, 329, 'server', 'API Express', 'Administration des postes', 'VM 2 . Application', { w: 195 });
  card(882, 329, 'database', 'PostgreSQL et Logstash', 'Base et collecte des logs', 'VM 3 . Base et collecte', { w: 195 });
  card(1180, 329, 'hard-drive', 'Stockage NFS', 'Logs et données PostgreSQL', 'VM 4 . Stockage', { w: 205 });

  arrow([[177, 385], [290, 385]]);
  label(231, 373, 'Interface', 'middle');
  arrow([[485, 385], [586, 385]]);
  label(535, 373, 'Requêtes', 'middle');
  arrow([[781, 385], [882, 385]]);
  label(832, 373, 'Données', 'middle');
  arrow([[1077, 385], [1180, 385]]);
  label(1128, 373, 'Stockage', 'middle');

  arrow([[105, 320], [105, 181], [465, 181]]);
  label(337, 170, 'Connexion', 'middle');
  arrow([[586, 349], [552, 349], [552, 257], [707, 257], [707, 181], [665, 181]]);
  label(717, 226, 'Identité');

  arrow([[177, 526], [640, 526], [640, 457]]);
  label(505, 516, 'Rapports et résultats', 'middle');
  arrow([[605, 457], [605, 491], [177, 491]]);
  label(515, 481, 'Interventions', 'middle');

  add('<path d="M389 457V483 M389 499V518" class="flow"/>');
  arrow([[389, 534], [389, 551], [980, 551], [980, 457]]);
  label(850, 540, 'Logs', 'middle');
  arrow([[735, 457], [735, 485], [923, 485], [923, 457]]);
  label(830, 475, 'Logs', 'middle');

} else if (kind === 'cible') {
  W = 1920; H = 710;
  title = 'ORION — architecture cible';
  desc = 'Quatre VM et les principaux flux applicatifs et de collecte. Les flux d’exploitation sont détaillés dans le DAT.';
  const frame = (x: number, y: number, w: number, h: number, name: string, sizing: string) => {
    rect(x, y, w, h, C.vm, C.vmStroke);
    icon('server', x + 12, y + 11, 16, '#5b7690');
    text(x + 34, y + 24, name, 'vm');
    text(x + 34, y + 45, sizing, 'caption');
  };
  heading(title, 'Vue détaillée · 1 000 postes actifs');

  enclosure(250, 94, 1640, 587, 'network', 'C1NP');
  rect(275, 201, 1605, 460, '#fff', C.zoneStroke, { rx: 12 });
  text(300, 228, 'VM ORION', 'frame');

  frame(300, 245, 250, 282, 'VM 1 . Entrée', '2 vCPU · 8 Go RAM · 50 Go système');
  frame(690, 245, 295, 282, 'VM 2 . Application', '8 vCPU · 32 Go RAM · 50 Go système');
  frame(1140, 245, 295, 395, 'VM 3 . Base et collecte', '4 vCPU · 16 Go RAM · 50 Go système');
  frame(1570, 245, 290, 395, 'VM 4 . Stockage', '2 vCPU · 8 Go RAM · 50 Go système');
  ext(40, 318, 135, 70, 'users', 'Firefox', []);
  ext(40, 422, 155, 70, 'monitor', 'Postes Windows', []);
  ext(420, 115, 265, 70, 'key-round', 'MindefConnect', ['Service d’identité']);
  svc(320, 318, 210, 70, 'split', 'HAProxy 3.2.16', ['HTTPS · TCP 443'], true);
  svc(320, 442, 210, 70, 'app-window', 'Apache 2.4.69', ['HTTP 8080 · boucle locale', 'Interface React 19.3.1'], true);
  svc(710, 318, 255, 70, 'server', 'Express 5.3.0', ['Node.js 22.22.3', 'API · TCP 3001'], true);
  svc(710, 442, 255, 70, 'monitor', 'Administration des postes', ['Système et version à préciser'], true, false);
  svc(1160, 548, 255, 70, 'scroll-text', 'Logstash 8.19.14', ['Syslog sur TLS · TCP 6514'], true);
  svc(1160, 318, 255, 70, 'database', 'PostgreSQL 17.7', ['PostgreSQL sur TLS · TCP 5432'], true);
  svc(1590, 318, 250, 300, 'folder-sync', 'Serveur NFSv4.2', ['TCP 2049 · réseau privé'], true);
  vol(1605, 420, 220, '100 Go SSD', ['Données PostgreSQL']);
  vol(1605, 535, 220, '100 Go', ['Fichiers de logs']);

  arrow([[175, 340], [320, 340]]);
  label(245, 330, '1 · HTTPS 443', 'middle');
  arrow([[425, 388], [425, 442]]);
  label(434, 420, '2 · HTTP 8080');
  arrow([[530, 350], [710, 350]]);
  label(620, 339, '3 · HTTPS 3001', 'middle');
  arrow([[965, 350], [1160, 350]]);
  label(1062, 339, '4 · TLS 5432', 'middle');
  arrow([[105, 318], [105, 151], [420, 151]]);
  label(258, 140, '5 · HTTPS 443', 'middle');
  arrow([[965, 327], [1018, 327], [1018, 151], [685, 151]]);
  label(852, 140, '6 · HTTPS 443', 'middle');
  add('<path d="M500 527V542" class="flow"/>');
  arrow([[500, 558], [500, 596], [1160, 596]]);
  label(800, 585, '7 · TLS 6514', 'middle');
  arrow([[965, 380], [1040, 380], [1040, 562], [1160, 562]]);
  label(1050, 551, '7 · TLS 6514', 'middle');
  arrow([[1415, 583], [1590, 583]]);
  label(1500, 572, '8 · NFS 2049', 'middle');
  arrow([[1415, 350], [1590, 350]]);
  label(1500, 339, '9 · NFS 2049', 'middle');
  arrow([[837, 388], [837, 442]]);
  label(847, 420, '10 · Demandes');
  arrow([[107, 492], [107, 550], [633, 550], [633, 475], [710, 475]]);
  label(280, 545, '11 · Rapports et résultats', 'middle');
  arrow([[710, 459], [608, 459], [608, 510], [164, 510], [164, 492]]);
  label(294, 500, '12 · Interventions', 'middle');
} else if (kind === 'simple') {
  W = 1500; H = 1075;
  title = 'ORION — architecture du démonstrateur';
  desc = 'Rôles du démonstrateur, regroupés par zone, et principaux échanges numérotés.';
  // Carte façon Azure : icône au-dessus, nom, rôle, VM
  const step = (x: number, y: number, n: string | number) => { add(`<circle cx="${x}" cy="${y}" r="11" fill="${C.blue}"/>`); text(x, y + 4.5, n, 'step', 'middle'); };

  heading(title, 'Vue simplifiée · dix VM');

  card(20, 240, 'users', 'Firefox', '', '', { stroke: C.extStroke, w: 150 });
  card(20, 625, 'user-cog', 'Opérateur', 'SSH, client Docker', 'son propre poste', { stroke: C.extStroke, w: 150 });
  card(20, 800, 'github', 'GitHub', 'intégration continue', 'Internet, par proxy', { stroke: C.extStroke, w: 150 });

  enclosure(230, 105, 1240, 695, 'network', 'Réseau privé du démonstrateur · 10 VM · accès par https://172.16.131.188');

  zone(255, 172, 210, 388, 'Entrée');
  zone(490, 172, 220, 388, 'Application');
  zone(735, 172, 220, 388, 'Données');
  zone(980, 172, 470, 180, 'Identité du démonstrateur');
  zone(980, 372, 220, 188, 'Émulation');
  zone(1230, 372, 220, 188, 'Collecte des logs');
  zone(255, 600, 455, 178, 'Pilotage');

  card(275, 212, 'split', 'HAProxy', 'entrée', 'orion-1');
  card(515, 212, 'app-window', 'Apache', 'Interface React', 'orion-4 et orion-5');
  card(515, 400, 'server', 'API Express', 'Application ORION', 'orion-4 et orion-5');
  card(760, 212, 'hard-drive', 'Stockage', 'NFS', 'orion-10');
  card(760, 400, 'database', 'PostgreSQL', 'données', 'orion-6 · secours 9');
  card(1005, 212, 'key-round', 'Keycloak', 'connexion', 'orion-7 · secours 9');
  card(1255, 212, 'book-user', 'OpenLDAP', 'annuaire', 'orion-7 · secours 9');
  card(1005, 400, 'monitor', 'Émulateur de postes', 'Postes Windows', 'orion-4 ou orion-5');
  card(275, 638, 'boxes', 'Swarm', 'managers', 'orion-1, 2 et 3');
  card(515, 638, 'rocket', 'Runner GitHub', 'déploiement', 'orion-3');
  card(1255, 400, 'scroll-text', 'Logstash', 'Collecte des logs', 'orion-8 · secours 9');

  // Adresses des VM
  rect(255, 955, 1195, 100, C.zone, C.zoneStroke, { rx: 6 });
  ips.forEach((ip, i) => text(270 + (i % 4) * 295, 983 + Math.floor(i / 4) * 27, `orion-${i + 1} · ${ip}`, 'caption'));
  // ① navigateur → entrée, par son adresse
  arrow([[170, 276], [273, 276]]); step(210, 276, '1');
  // ② entrée → interface et API
  arrow([[445, 276], [513, 276]]); step(479, 276, '2');
  arrow([[445, 320], [480, 320], [480, 464], [513, 464]]); step(480, 392, '2');
  // ③ API → base
  arrow([[685, 464], [758, 464]]); step(722, 464, '3');
  // ④ base, annuaire et collecteur → stockage
  arrow([[845, 400], [845, 342]]); step(845, 371, '4');
  arrow([[1340, 340], [1340, 370], [900, 370], [900, 342]]);
  arrow([[1405, 400], [1405, 370], [900, 370], [900, 342]]); step(1120, 370, '4');
  // ⑤ entrée → connexion (Keycloak), qui lit l'annuaire
  arrow([[340, 212], [340, 150], [1150, 150], [1150, 210]]); step(940, 150, '5');
  arrow([[1175, 276], [1253, 276]]);
  // ⑥ postes → API
  arrow([[1090, 528], [1090, 545], [640, 545], [640, 530]]); step(860, 545, '6');
  // ⑦ conteneurs → logs
  arrow([[600, 530], [600, 580], [1340, 580], [1340, 530]]); step(970, 580, '7');
  // ⑧ opérateur → VM, par SSH depuis son poste
  arrow([[170, 702], [273, 702]]); step(222, 702, '8');
  // ⑨ runner → GitHub (versions publiées), puis déploiement par un manager
  arrow([[600, 766], [600, 864], [172, 864]]); step(386, 864, '9');
  arrow([[513, 702], [447, 702]]); step(480, 702, '9');
} else {
  W = 1420; H = 1510;
  title = 'ORION — architecture du démonstrateur';
  desc = 'Placement des services par VM ou groupe de VM, conteneurs ou services de l’hôte, rôles Swarm, versions, ports, volumes et flux.';
  // VM ou groupe de VM : rôle en titre, puis une ligne par VM (nom d'hôte et IPv4)
  const groupe = (x: number, y: number, w: number, h: number, role: string, vms: number[], tone: Ton) => {
    rect(x, y, w, h, C.vm, C.vmStroke);
    icon('server', x + 12, y + 11, 16, '#5b7690');
    text(x + 34, y + 24, role, 'vm');
    vms.forEach((n, i) => text(x + 34, y + 41 + i * 17, `orion-${n} · ${ips[n - 1]}`, 'caption'));
    pill(x + w - 10, y + 10, { manager: 'MANAGER', worker: 'WORKER', hors: 'HORS SWARM' }[tone], tone);
  };
  // Service : conteneur (bleu) ou service de l'hôte (ambre)

  heading(title, 'Vue détaillée · dix VM');
  // Contenu décalé sous le titre, pour placer GitHub au-dessus du cluster
  add('<g transform="translate(0 70)">');
  ext(1010, 25, 280, 90, 'github', 'GitHub', ['dépôt et GitHub Actions', 'par le proxy 172.16.0.1:8080']);

  ext(20, 280, 170, 170, 'users', 'Firefox', ['172.16.131.188']);
  ext(20, 1150, 170, 110, 'user-cog', 'Opérateur', ['son poste, sur le', 'réseau', 'd’administration']);

  // Cluster Swarm
  enclosure(285, 140, 1095, 1005, 'boxes', 'Cluster Docker Swarm « orion » · orion-1 à orion-9 · réseau overlay « orion »');

  // Colonne A : managers et entrée ; éléments communs
  groupe(305, 195, 275, 525, 'Managers et entrée', [1, 2], 'manager');
  svc(318, 367, 249, 250, 'split', 'HAProxy 3.2.16', ['image officielle', 'ports publiés sur l’hôte', 'HTTPS 443 · ORION, connexion', 'HTTPS 8444 · console Keycloak', '1 instance · orion-1', 'Swarm 2377/TCP']);
  svc(318, 632, 249, 72, 'clock', 'chrony', ['paquet Debian · orion-1', 'NTP 123/UDP'], true);
  rect(305, 960, 275, 110, C.amber, C.amberStroke);
  icon('cog', 317, 972, 18, '#a06a00');
  text(343, 987, 'Sur chaque VM', 'service');
  ['Debian 13 · Docker · OpenSSH (22)', 'systemd-timesyncd → orion-1', 'DNS du réseau · syslog 127.0.0.1:6514', '7946/TCP-UDP · 4789/UDP · ESP'].forEach((l, i) => text(317, 1009 + i * 16, l, 'caption'));

  // Colonnes B et C : application (services joints par HAProxy), rôles isolés et secours
  groupe(650, 195, 710, 100, 'Manager et administration', [3], 'manager');
  svc(960, 226, 304, 60, 'rocket', 'Runner GitHub Actions', ['2.338.2 · systemd · sans port d’écoute'], true);
  groupe(650, 305, 710, 265, 'Application', [4, 5], 'worker');
  svc(663, 375, 274, 86, 'app-window', 'Apache 2.4.69', ['image sur httpd:2.4.69 · HTTP 8080', 'build React 19.3.1', '2 instances · une par VM']);
  svc(663, 471, 274, 86, 'server', 'Express 5.3.0', ['Node.js 22.22.3 · HTTP 3001', '2 instances · une par VM']);
  svc(1043, 435, 304, 72, 'monitor', 'Émulateur de postes', ['Postes Windows · Node.js 22.22.3', '1 instance · orion-4 ou orion-5']);
  groupe(650, 590, 300, 325, 'Identité', [7], 'worker');
  svc(663, 650, 274, 72, 'key-round', 'Keycloak 26.7.4', ['image officielle · HTTP 8080', '1 instance · secours orion-9']);
  svc(663, 768, 274, 72, 'book-user', 'OpenLDAP 1.5.0', ['image osixia/openldap · LDAP 389', '1 instance · secours orion-9']);
  vol(663, 850, 274, 'Volumes NFS', ['ldap-data-nfs → /var/lib/ldap', 'ldap-config-nfs → /etc/ldap/slapd.d']);
  groupe(650, 935, 300, 192, 'Logs', [8], 'worker');
  svc(663, 995, 274, 72, 'scroll-text', 'Logstash 8.19.14', ['TCP TLS 6514 · maillage Swarm', '1 instance · secours orion-9']);
  vol(663, 1077, 274, 'logs-nfs', ['volume NFS · /var/log/orion']);
  groupe(1030, 590, 330, 195, 'PostgreSQL', [6], 'worker');
  svc(1043, 650, 304, 72, 'database', 'PostgreSQL 17.7', ['image officielle · TCP 5432', '1 instance · secours orion-9']);
  vol(1043, 732, 304, 'pg-nfs', ['volume NFS · /var/lib/postgresql/data']);
  groupe(1030, 805, 240, 130, 'Secours', [9], 'worker');
  ['étiquettes pg, identite, logs', 'reprend PostgreSQL,', 'l’identité ou Logstash'].forEach((l, i) => text(1064, 875 + i * 16, l, 'caption'));

  // Stockage, hors Swarm
  groupe(650, 1180, 710, 235, 'Stockage', [10], 'hors');
  svc(663, 1235, 684, 72, 'folder-sync', 'Serveur NFS', ['paquet nfs-kernel-server · NFSv4.2 · TCP 2049', 'partages /srv/orion/donnees et /srv/orion/logs'], true);
  vol(663, 1320, 330, 'Données · ext4 · fichier image 6 Go', ['/srv/orion/donnees : postgres, ldap-data, ldap-config']);
  vol(1010, 1320, 337, 'Logs · ext4 · fichier image 4 Go', ['/srv/orion/logs : conteneurs']);

  // Flux du navigateur : HAProxy d'orion-1, par son adresse
  arrow([[190, 400], [316, 400]]); label(196, 394, 'HTTPS 443');
  // HAProxy → Apache et Express ; Express → HAProxy (adresse publique de Keycloak)
  arrow([[567, 418], [661, 418]]); label(575, 411, '8080');
  arrow([[567, 500], [661, 500]]); label(575, 493, '3001');
  arrow([[663, 540], [569, 540]]); label(575, 533, '443');
  // HAProxy → Keycloak
  arrow([[567, 600], [610, 600], [610, 686], [661, 686]]); label(616, 679, '8080');
  // Keycloak → OpenLDAP ; Express → PostgreSQL ; émulateur → Express
  arrow([[800, 722], [800, 766]]); label(808, 749, 'LDAP 389');
  arrow([[937, 540], [1000, 540], [1000, 686], [1041, 686]]); label(943, 533, 'TCP 5432');
  arrow([[1043, 490], [939, 490]]); label(958, 483, 'HTTP 3001');
  // Volumes de l'identité, des logs et de la base → serveur NFS d'orion-10
  arrow([[937, 878], [990, 878], [990, 1233]]); label(998, 1166, 'NFS 2049');
  arrow([[900, 1117], [900, 1233]]); label(908, 1166, 'NFS 2049');
  arrow([[1310, 772], [1310, 1160], [1230, 1160], [1230, 1233]]); label(1302, 1100, 'NFS 2049', 'end');
  // Conteneurs de chaque VM → Logstash (maillage de routage) ; VM → chrony d'orion-1
  arrow([[580, 1040], [661, 1040]]); label(588, 1033, '6514');
  arrow([[305, 985], [295, 985], [295, 668], [316, 668]]);
  // Opérateur → VM (SSH, client Docker vers un manager) et console Keycloak
  arrow([[190, 1200], [560, 1200], [560, 1147]]); label(196, 1193, 'SSH 22 · client Docker vers un manager');
  arrow([[105, 1260], [105, 1390], [648, 1390]]); label(196, 1383, 'SSH 22');
  arrow([[105, 1150], [105, 1142], [262, 1142], [262, 580], [316, 580]]); label(255, 1137, 'HTTPS 8444 · console Keycloak', 'end');
  // Runner → GitHub (par le proxy du réseau) et → orion-1 (déploiement de la pile)
  arrow([[1150, 226], [1150, 117]]); label(1158, 172, 'HTTPS 443');
  arrow([[960, 258], [582, 258]]); label(670, 281, 'SSH 22 · orion-1');
  add('</g>');
}
const defs = [...used].map((n) => `<symbol id="i-${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconNode(n).map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')}/>`).join('')}</symbol>`).join('\n');
writeFileSync(out, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title>
<desc id="desc">${esc(desc)}</desc>
<defs>
<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="${C.line}"/></marker>
<marker id="arrow-start" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M10 0 L0 5 L10 10 Z" fill="${C.line}"/></marker>
${defs}
</defs>
<style>
text{font-family:'Segoe UI',Arial,Helvetica,sans-serif;fill:${C.ink}}
.title{font-size:30px;font-weight:bold}
.body{font-size:15px;fill:${C.sub}}
.frame,.zname{font-size:16px;font-weight:bold}
.vm{font-size:15px;font-weight:bold}
.service{font-size:14px;font-weight:bold}
.cname{font-size:15px;font-weight:bold}
.crole{font-size:12.5px;fill:${C.sub}}
.cvm{font-size:12px;font-weight:bold;fill:${C.blue}}
.caption{font-size:12.5px;fill:${C.sub}}
.vol{font-size:12.5px;font-weight:bold;fill:#24603d}
.tag{font-size:10.5px;font-weight:bold;fill:${C.blue};letter-spacing:.3px}
.tag.host{fill:#a06a00}
.badge{font-size:10.5px;font-weight:bold;fill:#254e78;letter-spacing:.5px}
.step{font-size:13px;font-weight:bold;fill:#fff}
.route{font-size:11.5px;font-weight:bold;fill:#0b4f8a;paint-order:stroke;stroke:#fff;stroke-width:4;stroke-linejoin:round}
.flow{fill:none;stroke:${C.line};stroke-width:2}
.auto{stroke-dasharray:6 4}
</style>
<rect width="${W}" height="${H}" fill="#fff"/>
${parts.join('\n')}
</svg>
`);
