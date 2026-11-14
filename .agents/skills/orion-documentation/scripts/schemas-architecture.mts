// Génère les quatre schémas d'architecture, réelle et cible (icônes Lucide, licence ISC), depuis la racine du dépôt :
//   node .agents/skills/orion-documentation/scripts/schemas-architecture.mts application/node_modules/lucide-react simple docs/03-ARCHITECTURE/assets/ORION-VUE-SIMPLIFIEE.svg
//   node .agents/skills/orion-documentation/scripts/schemas-architecture.mts application/node_modules/lucide-react complet docs/03-ARCHITECTURE/assets/ORION-DEPLOIEMENT-VM.svg
//   node .agents/skills/orion-documentation/scripts/schemas-architecture.mts application/node_modules/lucide-react cible docs/03-ARCHITECTURE/assets/ORION-CIBLE-C1NP.svg
//   node .agents/skills/orion-documentation/scripts/schemas-architecture.mts application/node_modules/lucide-react cible-simple docs/03-ARCHITECTURE/assets/ORION-CIBLE-VUE-SIMPLIFIEE.svg
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
const ext = (x: number, y: number, w: number, h: number, ic: string, name: string, lines: string[], tag = '') => {
  rect(x, y, w, h, C.ext, C.extStroke);
  icon(ic, x + 12, y + 12, 22, '#3d5a78');
  text(x + 44, y + 28, name, 'service');
  if (tag) text(x + w - 10, y + 24, tag, 'tag', 'end');
  lines.forEach((l, i) => text(x + 44, y + 47 + i * 16, l, 'caption'));
};

const enclosure = (x: number, y: number, w: number, h: number, ic: string, name: string) => {
  rect(x, y, w, h, '#f7fafd', '#7aa7d6', { rx: 12, sw: 1.5 });
  icon(ic, x + 16, y + 12, 22);
  text(x + 46, y + 29, name, 'frame');
};

const rigelEnclosure = (x: number, y: number, w: number, h: number, site = '') => {
  enclosure(x, y, w, h, 'scan-line', site ? `RIGEL · ${site}` : 'RIGEL');
  if (w < 400) {
    text(x + 16, y + 51, 'Reconnaissance d’identifiants graphiques', 'caption');
    text(x + 16, y + 67, 'et extraction par lecture', 'caption');
  } else {
    text(x + (site ? 220 : 160), y + 28, 'Reconnaissance d’identifiants graphiques et extraction par lecture', 'caption');
  }
};

const ips = ["172.16.131.188","172.16.131.133","172.16.131.193","172.16.131.208","172.16.131.142","172.16.131.131","172.16.131.137","172.16.131.146","172.16.131.190","172.16.131.197"];

let W: number, H: number, title: string, desc: string;

if (kind === 'cible-simple') {
  W = 1780; H = 850;
  title = 'ORION — architecture cible';
  desc = 'Vue simplifiée des quatre VM ORION, de MindefConnect, du module externe RIGEL et des principaux échanges.';

  heading(title, 'Vue simplifiée · 1 000 postes actifs');
  enclosure(245, 102, 1185, 720, 'network', 'C1NP');
  enclosure(268, 257, 1139, 540, 'server', 'VM ORION');
  zone(280, 299, 215, 164, 'Entrée');
  zone(576, 299, 215, 450, 'Application');
  zone(872, 299, 215, 164, 'Base et collecte');
  zone(1170, 299, 225, 164, 'Stockage');

  card(32, 320, 'users', 'Firefox', '', '', { w: 145, stroke: C.extStroke });
  card(32, 466, 'monitor', 'Postes Windows', '', '', { w: 145, stroke: C.extStroke });
  card(520, 117, 'key-round', 'MindefConnect', 'Service d’identité', '', { w: 200, stroke: C.extStroke });
  card(290, 329, 'split', 'HAProxy et Apache', 'Interface React', 'VM 1 . Entrée', { w: 195 });
  card(586, 329, 'server', 'API Express', 'Administration des postes', 'VM 2 . Application', { w: 195 });
  card(586, 600, 'refresh-cw', 'Connecteur RIGEL', 'Conteneur versionné', 'VM 2 . Application', { w: 195 });
  card(882, 329, 'database', 'PostgreSQL et Logstash', 'Base et collecte des logs', 'VM 3 . Base et collecte', { w: 195 });
  card(1180, 329, 'hard-drive', 'Stockage C1NP', 'Fichiers de logs', 'VM 4 . Stockage', { w: 205 });
  card(1510, 110, 'smartphone', 'Téléphone', 'PWA RIGEL hors ligne', '', { w: 190, stroke: C.extStroke });
  rigelEnclosure(1480, 260, 270, 540);
  card(1510, 345, 'cloud', 'Relais RIGEL', 'Conteneur versionné', 'Hébergement à qualifier', { w: 190, stroke: C.extStroke });
  card(1510, 540, 'database', 'Stockage RIGEL', 'Service à qualifier', '', { w: 190, stroke: C.extStroke });

  arrow([[177, 385], [290, 385]]);
  label(231, 373, 'Interface', 'middle');
  arrow([[485, 385], [586, 385]]);
  label(535, 373, 'Requêtes', 'middle');
  arrow([[781, 385], [882, 385]]);
  label(832, 373, 'Données', 'middle');
  arrow([[1077, 385], [1180, 385]]);
  label(1128, 373, 'Stockage', 'middle');

  arrow([[105, 320], [105, 181], [520, 181]]);
  label(312, 170, 'Connexion', 'middle');
  arrow([[700, 329], [700, 247]]);
  label(708, 285, 'Identité');

  arrow([[177, 526], [340, 526], [340, 459]]);
  label(258, 516, 'Rapports et résultats', 'middle');
  arrow([[735, 457], [735, 485], [923, 485], [923, 459]]);
  label(830, 475, 'Logs', 'middle');
  arrow([[640, 600], [640, 459]]);
  label(648, 540, 'Événements');

  arrow([[1700, 174], [1765, 174], [1765, 409], [1702, 409]]); label(1732, 163, 'HTTPS 443', 'middle');
  arrow([[1605, 473], [1605, 538]]); label(1615, 510, 'Stockage');
  arrow([[781, 664], [1450, 664], [1450, 409], [1508, 409]]); label(1120, 653, 'HTTPS 443 sortant', 'middle');

} else if (kind === 'cible') {
  W = 2350; H = 710;
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

  frame(300, 245, 290, 282, 'VM 1 . Entrée', '2 vCPU · 8 Go RAM · 50 Go système');
  frame(690, 245, 355, 395, 'VM 2 . Application', '8 vCPU · 32 Go RAM · 50 Go système');
  frame(1140, 245, 295, 395, 'VM 3 . Base et collecte', '4 vCPU · 16 Go RAM · 50 Go système');
  frame(1570, 245, 290, 395, 'VM 4 . Stockage', '2 vCPU · 8 Go RAM · 50 Go système');
  ext(40, 318, 135, 70, 'users', 'Firefox', []);
  ext(40, 422, 175, 70, 'monitor', 'Postes Windows', []);
  ext(35, 535, 215, 70, 'server', 'Configuration Manager', ['Option A']);
  ext(420, 115, 265, 70, 'key-round', 'MindefConnect', ['Service d’identité']);
  svc(320, 318, 250, 70, 'split', 'HAProxy 3.2.16', ['HTTPS · TCP 443'], true);
  svc(320, 442, 250, 70, 'app-window', 'Apache 2.4.69', ['HTTP 8080 · boucle locale', 'Interface React 19.3.1'], true);
  svc(710, 318, 240, 70, 'server', 'Express 5.3.0', ['Node.js 22.22.3', 'API · TCP 3001'], true);
  svc(710, 442, 240, 70, 'monitor', 'Administration des postes', ['Configuration Manager ou M42', 'option à retenir'], true, false);
  svc(710, 545, 240, 70, 'refresh-cw', 'Connecteur RIGEL', ['image RIGEL versionnée', 'HTTPS 443 sortant']);
  svc(1160, 548, 255, 70, 'scroll-text', 'Logstash 8.19.14', ['Syslog sur TLS · TCP 6514'], true);
  svc(1160, 318, 255, 70, 'database', 'PostgreSQL 17.7', ['PostgreSQL sur TLS · TCP 5432'], true);
  vol(1177, 420, 220, '100 Go SSD', ['Données PostgreSQL locales']);
  svc(1590, 318, 250, 300, 'folder-sync', 'Fichiers', ['Service C1NP à qualifier'], true);
  vol(1605, 535, 220, '100 Go', ['Fichiers de logs']);
  ext(1980, 115, 220, 75, 'smartphone', 'Téléphone', ['PWA RIGEL hors ligne']);
  rigelEnclosure(1940, 215, 300, 430);
  ext(1980, 300, 220, 95, 'cloud', 'Relais RIGEL', ['image RIGEL versionnée', 'HTTPS 443', 'hébergement à qualifier'], 'conteneur');
  ext(1980, 500, 220, 90, 'database', 'Stockage RIGEL', ['service durable à qualifier']);

  arrow([[175, 340], [318, 340]]);
  label(245, 330, '1 · HTTPS 443', 'middle');
  arrow([[445, 388], [445, 440]]);
  label(454, 420, '2 · HTTP 8080');
  arrow([[570, 350], [708, 350]]);
  label(639, 339, '3 · HTTPS 3001', 'middle');
  arrow([[950, 350], [1158, 350]]);
  label(1054, 339, '4 · TLS 5432', 'middle');
  arrow([[105, 318], [105, 151], [418, 151]]);
  label(258, 140, '5 · HTTPS 443', 'middle');
  arrow([[950, 327], [1090, 327], [1090, 151], [687, 151]]);
  label(888, 140, '6 · HTTPS 443', 'middle');
  arrow([[1045, 600], [1158, 600]]);
  label(1100, 590, '7 · TLS 6514', 'middle');
  arrow([[1415, 583], [1588, 583]]);
  label(1500, 572, '8 · Service de fichiers', 'middle');
  arrow([[825, 388], [825, 440]]);
  label(815, 420, '10A · Demandes', 'end');
  arrow([[107, 492], [107, 533]]);
  label(116, 519, '11A');
  arrow([[710, 475], [640, 475], [640, 570], [252, 570]]);
  label(445, 560, '10A · API Configuration Manager', 'middle');
  arrow([[215, 457], [260, 457], [260, 370], [318, 370]]);
  label(244, 410, '10B · HTTPS 443', 'end');
  arrow([[2200, 152], [2235, 152], [2235, 345], [2202, 345]]); label(2243, 255, '12 · HTTPS 443');
  arrow([[2090, 395], [2090, 498]]); label(2100, 450, 'Stockage');
  arrow([[950, 590], [1020, 590], [1020, 652], [1930, 652], [1930, 365], [1978, 365]]); label(1450, 643, '13 · HTTPS 443 sortant par proxy', 'middle');
  arrow([[950, 560], [995, 560], [995, 375], [952, 375]]); label(987, 420, '14 · Canal protégé', 'end');
} else if (kind === 'simple') {
  W = 1680; H = 1250;
  title = 'ORION — architecture du démonstrateur';
  desc = 'Rôles du démonstrateur, regroupés par zone, et principaux échanges numérotés.';
  // Carte façon Azure : icône au-dessus, nom, rôle, VM
  const step = (x: number, y: number, n: string | number) => { add(`<circle cx="${x}" cy="${y}" r="11" fill="${C.blue}"/>`); text(x, y + 4.5, n, 'step', 'middle'); };

  heading(title, 'Vue simplifiée · dix VM');

  card(20, 240, 'users', 'Firefox', '', '', { stroke: C.extStroke, w: 150 });
  card(1500, 638, 'user-cog', 'Opérateur', 'SSH, client Docker', 'son propre poste', { stroke: C.extStroke, w: 150 });
  card(1500, 820, 'github', 'GitHub', 'intégration continue', 'Internet, par proxy', { stroke: C.extStroke, w: 150 });

  enclosure(230, 105, 1240, 695, 'network', 'Réseau privé du démonstrateur · 10 VM · accès par https://172.16.131.188');

  zone(255, 172, 210, 388, 'Entrée');
  zone(490, 172, 220, 388, 'Application');
  zone(735, 172, 220, 388, 'Données');
  zone(980, 172, 470, 180, 'Identité');
  zone(980, 372, 220, 188, 'Services simulés');
  zone(1230, 372, 220, 188, 'Collecte des logs');
  zone(490, 600, 220, 178, 'RIGEL');
  zone(980, 600, 470, 178, 'Pilotage');

  card(275, 212, 'split', 'HAProxy', 'entrée', 'orion-1');
  card(515, 212, 'app-window', 'Apache', 'Interface React', 'orion-4 et orion-5');
  card(515, 400, 'server', 'API Express', 'Application ORION', 'orion-4 et orion-5');
  card(760, 212, 'hard-drive', 'Stockage', 'NFS', 'orion-10');
  card(760, 400, 'database', 'PostgreSQL', 'données', 'orion-6 · secours 9');
  card(1005, 212, 'key-round', 'Keycloak', 'connexion', 'orion-7 · secours 9');
  card(1255, 212, 'book-user', 'OpenLDAP', 'annuaire', 'orion-7 · secours 9');
  card(1005, 400, 'monitor', 'Simulateur', 'Postes Windows et M42', 'orion-4 ou orion-5');
  card(1255, 400, 'scroll-text', 'Logstash', 'Collecte des logs', 'orion-8 · secours 9');
  card(515, 638, 'refresh-cw', 'Connecteur RIGEL', 'Conteneur versionné', 'orion-4 ou orion-5');
  card(1005, 638, 'rocket', 'Runner GitHub', 'déploiement', 'orion-3');
  card(1255, 638, 'boxes', 'Swarm', 'managers', 'orion-1, 2 et 3');

  card(275, 970, 'smartphone', 'Téléphone', 'PWA RIGEL hors ligne', '', { stroke: C.extStroke });
  rigelEnclosure(485, 910, 700, 200, 'Hidora');
  card(515, 970, 'cloud', 'Relais RIGEL', 'rigel.sh1.hidora.net', 'Conteneur versionné', { stroke: C.extStroke });
  card(755, 970, 'database', 'PostgreSQL RIGEL', 'Données chiffrées', 'TCP 5432', { stroke: C.extStroke });
  // Adresses des VM
  rect(255, 1120, 1195, 100, C.zone, C.zoneStroke, { rx: 6 });
  ips.forEach((ip, i) => text(270 + (i % 4) * 295, 1148 + Math.floor(i / 4) * 27, `orion-${i + 1} · ${ip}`, 'caption'));
  // ① navigateur → entrée, par son adresse
  arrow([[170, 276], [273, 276]]); step(210, 276, '1');
  // ② entrée → interface et API
  arrow([[445, 276], [513, 276]]); step(479, 276, '2');
  arrow([[445, 320], [480, 320], [480, 464], [513, 464]]); step(480, 392, '2');
  // ③ API → base
  arrow([[685, 464], [758, 464]]); step(722, 464, '3');
  // ④ base, annuaire et collecteur → stockage
  arrow([[845, 400], [845, 342]]); step(845, 371, '4');
  arrow([[1340, 340], [1340, 362], [900, 362], [900, 342]]);
  arrow([[1405, 400], [1405, 362], [900, 362], [900, 342]]); step(1120, 362, '4');
  // ⑤ entrée → connexion (Keycloak), qui lit l'annuaire
  arrow([[340, 212], [340, 150], [1150, 150], [1150, 210]]); step(940, 150, '5');
  arrow([[1175, 276], [1253, 276]]);
  // ⑥ postes simulés → API
  arrow([[1090, 528], [1090, 572], [680, 572], [680, 530]]); step(880, 572, '6');
  // ⑦ conteneurs → logs
  arrow([[640, 530], [640, 588], [1340, 588], [1340, 530]]); step(1180, 588, '7');
  // ⑧ opérateur → managers, depuis son poste
  arrow([[1500, 702], [1427, 702]]); step(1463, 702, '8');
  // ⑨ runner → GitHub (versions publiées), puis déploiement par un manager
  arrow([[1090, 766], [1090, 884], [1498, 884]]); step(1300, 884, '9');
  arrow([[1175, 702], [1253, 702]]); step(1214, 702, '9');
  // ⑩ téléphone → relais Hidora
  arrow([[445, 1034], [513, 1034]]); step(479, 1034, '10');
  arrow([[685, 1034], [753, 1034]]);
  // ⑪ connecteur → API et relais
  arrow([[575, 638], [575, 530]]); step(575, 580, '11');
  arrow([[670, 766], [670, 968]]); step(670, 860, '11');
} else {
  W = 1910; H = 1380;
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

  heading(title, 'Vue détaillée · dix VM');
  // Contenu décalé sous le titre
  add('<g transform="translate(0 -10)">');
  ext(20, 280, 170, 170, 'users', 'Firefox', ['172.16.131.188']);
  ext(20, 1150, 170, 110, 'user-cog', 'Opérateur', ['son poste, sur le', 'réseau', 'd’administration']);

  // Cluster Swarm
  enclosure(285, 140, 1195, 980, 'boxes', 'Cluster Docker Swarm « orion » · orion-1 à orion-9 · réseau overlay « orion »');

  // Colonne A : managers et entrée, secours, éléments communs
  groupe(305, 195, 275, 525, 'Managers et entrée', [1, 2], 'manager');
  text(339, 270, 'Swarm · TCP 2377', 'caption');
  svc(318, 367, 249, 250, 'split', 'HAProxy 3.2.16', ['image officielle', 'ports publiés sur l’hôte', 'HTTPS 443 · ORION, connexion', 'HTTPS 8444 · console Keycloak', '1 instance · orion-1']);
  svc(318, 632, 249, 72, 'clock', 'chrony', ['paquet Debian · orion-1', 'NTP 123/UDP'], true);
  rect(305, 750, 275, 126, C.amber, C.amberStroke);
  icon('cog', 317, 762, 18, '#a06a00');
  text(343, 777, 'Sur chaque VM', 'service');
  ['Debian 13 · Docker · OpenSSH 22', 'systemd-timesyncd → orion-1', 'syslog → 127.0.0.1:6514 → Logstash', 'images → proxy 172.16.0.1:8080', 'DNS du réseau · 7946 · 4789 · ESP'].forEach((l, i) => text(317, 799 + i * 16, l, 'caption'));
  groupe(305, 900, 275, 120, 'Secours', [9], 'worker');
  ['étiquettes pg, identite, logs', 'reprend PostgreSQL, l’identité', 'ou Logstash'].forEach((l, i) => text(339, 958 + i * 16, l, 'caption'));

  // Colonnes B et C : administration, application (services joints par HAProxy), rôles isolés
  groupe(650, 195, 780, 100, 'Manager et administration', [3], 'manager');
  svc(1040, 226, 290, 60, 'rocket', 'Runner GitHub Actions', ['2.338.2 · systemd · sans port d’écoute'], true);
  groupe(650, 305, 780, 345, 'Application', [4, 5], 'worker');
  svc(663, 375, 260, 86, 'app-window', 'Apache 2.4.69', ['image orion-web:<SHA Git>', 'httpd 2.4.69 · HTTP 8080', 'build React 19.3.1 · 2 instances']);
  svc(663, 505, 260, 130, 'server', 'Express 5.3.0', ['image orion-api:<SHA Git>', 'Node.js 22.22.3 · HTTP 3001', '2 instances · une par VM']);
  svc(1123, 470, 294, 72, 'monitor', 'Simulateur des postes', ['image orion-postes:<SHA Git>', 'Node.js 22.22.3 · 1 instance']);
  svc(1123, 558, 294, 72, 'refresh-cw', 'Connecteur RIGEL', ['image orion-connecteur:<SHA Git>', 'pile orion-rigel · 1 instance']);
  groupe(650, 690, 290, 330, 'Identité', [7], 'worker');
  svc(663, 750, 260, 72, 'key-round', 'Keycloak 26.7.4', ['image officielle · HTTP 8080', '1 instance · secours orion-9']);
  svc(663, 870, 260, 72, 'book-user', 'OpenLDAP 1.5.0', ['image osixia/openldap · LDAP 389', '1 instance · secours orion-9']);
  vol(663, 955, 260, 'Volumes NFS', ['ldap-data-nfs → /var/lib/ldap', 'ldap-config-nfs → /etc/ldap/slapd.d']);
  groupe(1110, 690, 320, 195, 'Logs', [8], 'worker');
  svc(1123, 750, 294, 72, 'scroll-text', 'Logstash 8.19.14', ['image officielle · TCP TLS 6514', '1 instance · secours orion-9']);
  vol(1123, 832, 294, 'logs-nfs', ['volume NFS · /var/log/orion']);
  groupe(1110, 905, 320, 195, 'PostgreSQL', [6], 'worker');
  svc(1123, 965, 294, 72, 'database', 'PostgreSQL 17.7', ['image officielle · TCP 5432', '1 instance · secours orion-9']);
  vol(1123, 1047, 294, 'pg-nfs', ['volume NFS · /var/lib/postgresql/data']);

  // Stockage, hors Swarm
  groupe(650, 1160, 780, 205, 'Stockage', [10], 'hors');
  svc(663, 1215, 754, 72, 'folder-sync', 'Serveur NFS', ['paquet nfs-kernel-server · NFSv4.2 · TCP 2049', 'partages /srv/orion/donnees et /srv/orion/logs'], true);
  vol(663, 1300, 370, 'Données · ext4 · fichier image 6 Go', ['/srv/orion/donnees : postgres, ldap-data, ldap-config']);
  vol(1047, 1300, 370, 'Logs · ext4 · fichier image 4 Go', ['/srv/orion/logs : conteneurs']);

  // Extérieur : téléphone, RIGEL sur Hidora, proxy du réseau, GitHub
  ext(1580, 150, 260, 80, 'smartphone', 'Téléphone', ['PWA RIGEL hors ligne']);
  rigelEnclosure(1555, 280, 310, 360, 'Hidora');
  ext(1580, 360, 260, 95, 'cloud', 'Relais RIGEL', ['rigel.sh1.hidora.net', 'image rigel:<SHA Git>', 'HTTPS 443 · HTTP interne 3000'], 'conteneur');
  ext(1580, 525, 260, 80, 'database', 'PostgreSQL RIGEL', ['données chiffrées', 'TCP 5432']);
  ext(1580, 690, 260, 80, 'network', 'Proxy du réseau', ['172.16.0.1:8080']);
  ext(1580, 850, 260, 80, 'github', 'GitHub', ['dépôt et GitHub Actions']);

  // Navigateur → HAProxy d'orion-1, par son adresse
  arrow([[190, 400], [316, 400]]); label(196, 394, 'HTTPS 443');
  // HAProxy → Apache, Express et Keycloak ; Express → HAProxy (adresse publique de Keycloak)
  arrow([[567, 418], [661, 418]]); label(575, 411, '8080');
  arrow([[567, 530], [661, 530]]); label(575, 523, '3001');
  arrow([[663, 575], [569, 575]]); label(575, 568, '443');
  arrow([[567, 600], [610, 600], [610, 786], [661, 786]]); label(616, 779, '8080');
  // Express → Apache, Keycloak, Logstash, PostgreSQL et OpenLDAP
  arrow([[880, 505], [880, 463]]); label(888, 488, '8080');
  arrow([[860, 635], [860, 748]]); label(868, 674, 'HTTP 8080');
  arrow([[923, 598], [1060, 598], [1060, 786], [1121, 786]]); label(1090, 779, 'TCP 6514', 'middle');
  arrow([[923, 612], [1040, 612], [1040, 1001], [1121, 1001]]); label(1080, 994, 'TCP 5432', 'middle');
  arrow([[923, 625], [985, 625], [985, 906], [925, 906]]); label(955, 899, 'LDAP 389', 'middle');
  // Keycloak → OpenLDAP ; postes simulés et connecteur → Express
  arrow([[790, 822], [790, 868]]); label(798, 850, 'LDAP 389');
  arrow([[1123, 520], [925, 520]]); label(1024, 513, 'HTTP 3001', 'middle');
  arrow([[1123, 575], [925, 575]]); label(1024, 568, 'HTTP 3001', 'middle');
  // Volumes de l'identité, des logs et de la base → serveur NFS d'orion-10
  arrow([[880, 1010], [880, 1213]]); label(888, 1080, 'NFS 2049');
  arrow([[1417, 852], [1460, 852], [1460, 1250], [1419, 1250]]); label(1452, 1150, 'NFS 2049', 'end');
  arrow([[1270, 1087], [1270, 1213]]); label(1278, 1150, 'NFS 2049');
  // VM → chrony d'orion-1
  arrow([[440, 750], [440, 706]]); label(448, 733, 'NTP 123');
  // Opérateur → cluster (SSH, client Docker vers un manager), stockage et console Keycloak
  arrow([[190, 1200], [560, 1200], [560, 1122]]); label(196, 1193, 'SSH 22 · client Docker vers un manager');
  arrow([[105, 1260], [105, 1345], [648, 1345]]); label(196, 1338, 'SSH 22');
  arrow([[105, 1150], [105, 1130], [262, 1130], [262, 580], [316, 580]]); label(255, 1124, 'HTTPS 8444 · console Keycloak', 'end');
  // Runner → orion-1 (déploiement de la pile) et → proxy du réseau ; connecteur → proxy
  arrow([[1040, 258], [582, 258]]); label(670, 281, 'SSH 22 · orion-1');
  arrow([[1330, 256], [1520, 256], [1520, 720], [1578, 720]]); label(1380, 248, 'TCP 8080', 'middle');
  arrow([[1417, 600], [1500, 600], [1500, 755], [1578, 755]]); label(1540, 748, 'TCP 8080', 'middle');
  // Proxy → GitHub et relais ; téléphone → relais ; relais → base
  arrow([[1710, 770], [1710, 848]]); label(1720, 815, 'HTTPS 443');
  arrow([[1840, 730], [1875, 730], [1875, 430], [1842, 430]]); label(1868, 680, 'HTTPS 443', 'end');
  arrow([[1840, 190], [1890, 190], [1890, 385], [1842, 385]]); label(1848, 178, 'HTTPS 443');
  arrow([[1710, 455], [1710, 523]]); label(1720, 494, 'TCP 5432');
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
