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
  hors: '#eceff2', horsStroke: '#a9b4bf', horsInk: '#66788a',
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

// Vue détaillée du démonstrateur : bordure bleue pour les services du système ORION
let systeme = false;
const svc = (x: number, y: number, w: number, h: number, ic: string, name: string, lines: string[], host = false, showTag = true, hors = false) => {
  rect(x, y, w, h, hors ? C.hors : host ? C.amber : '#f2f7fd', hors ? C.horsStroke : systeme ? C.blue : host ? C.amberStroke : '#aac6e3', { rx: 8, sw: systeme && !hors ? 2.5 : undefined });
  icon(ic, x + 10, y + 10, 20, hors ? C.horsInk : host ? '#a06a00' : C.blue);
  text(x + 38, y + 25, name, 'service');
  if (showTag) text(x + w - 10, y + 24, host ? 'service hôte' : 'conteneur', hors ? 'tag hors' : host ? 'tag host' : 'tag', 'end');
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
  W = 1470; H = 780;
  title = 'ORION — architecture cible';
  desc = 'Vue simplifiée des quatre VM ORION, de MindefConnect, du téléphone RIGEL et des principaux échanges.';

  heading(title, 'Vue simplifiée');
  enclosure(245, 102, 1185, 440, 'network', 'C1NP');
  enclosure(268, 257, 1139, 260, 'server', 'VM ORION');
  zone(280, 299, 215, 164, 'Entrée');
  zone(576, 299, 215, 164, 'Application');
  zone(872, 299, 215, 164, 'Base et collecte');
  zone(1170, 299, 225, 164, 'Stockage');

  card(32, 320, 'users', 'Firefox', '', '', { w: 145, stroke: C.extStroke });
  card(32, 466, 'monitor', 'Postes Windows', '', '', { w: 145, stroke: C.extStroke });
  card(32, 612, 'smartphone', 'Téléphone', 'PWA RIGEL hors ligne', '', { w: 145, stroke: C.extStroke });
  card(520, 117, 'key-round', 'MindefConnect', 'Service d’identité', '', { w: 200, stroke: C.extStroke });
  card(290, 329, 'split', 'HAProxy et Apache', 'Interfaces ORION et RIGEL', 'VM 1 . Entrée', { w: 195 });
  card(586, 329, 'server', 'API Express', 'Administration des postes', 'VM 2 . Application', { w: 195 });
  card(882, 329, 'database', 'PostgreSQL et Logstash', 'Base et collecte des logs', 'VM 3 . Base et collecte', { w: 195 });
  card(1180, 329, 'hard-drive', 'Stockage NFS', 'Fichiers de logs', 'VM 4 . Stockage', { w: 205 });

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
  arrow([[177, 676], [440, 676], [440, 459]]);
  label(308, 666, 'Recensement · nom public', 'middle');
  arrow([[735, 457], [735, 485], [923, 485], [923, 459]]);
  label(830, 475, 'Logs', 'middle');
} else if (kind === 'cible') {
  W = 2180; H = 770;
  title = 'ORION — architecture cible';
  desc = 'Quatre VM et les principaux flux applicatifs et de collecte. Les flux d’exploitation sont détaillés dans le DAT.';
  const frame = (x: number, y: number, w: number, h: number, name: string) => {
    rect(x, y, w, h, C.vm, C.vmStroke);
    icon('server', x + 12, y + 11, 16, '#5b7690');
    text(x + 34, y + 24, name, 'vm');
  };
  heading(title, 'Vue détaillée');

  enclosure(250, 94, 1890, 640, 'network', 'C1NP');
  rect(275, 201, 1855, 460, '#fff', C.zoneStroke, { rx: 12 });
  text(300, 228, 'VM ORION', 'frame');

  frame(300, 245, 490, 395, 'VM 1 . Entrée');
  frame(940, 245, 355, 395, 'VM 2 . Application');
  frame(1390, 245, 295, 395, 'VM 3 . Base et collecte');
  frame(1820, 245, 290, 395, 'VM 4 . Stockage');
  ext(40, 318, 135, 70, 'users', 'Firefox', []);
  ext(40, 395, 175, 70, 'smartphone', 'Téléphone', ['PWA RIGEL hors ligne']);
  ext(40, 510, 175, 70, 'monitor', 'Postes Windows', []);
  ext(35, 655, 215, 70, 'server', 'Configuration Manager', ['Option A']);
  ext(420, 115, 265, 70, 'key-round', 'MindefConnect', ['Service d’identité']);
  svc(320, 318, 460, 130, 'split', 'HAProxy 3.2.16', ['HTTPS · TCP 443'], true);
  svc(320, 500, 220, 70, 'app-window', 'Apache 2.4.69', ['HTTP 8080 · boucle locale', 'Interface React 19.3.1'], true);
  svc(560, 500, 220, 70, 'scan-line', 'Apache 2.4.69', ['HTTP 8081 · boucle locale', 'PWA RIGEL'], true);
  svc(960, 318, 240, 70, 'server', 'Express 5.3.0', ['Node.js 22.22.3', 'API · TCP 3001'], true);
  svc(960, 442, 240, 70, 'monitor', 'Administration des postes', ['Configuration Manager ou M42', 'option à retenir'], true, false);
  svc(1410, 548, 255, 70, 'scroll-text', 'Logstash 8.19.14', ['Syslog sur TLS · TCP 6514'], true);
  svc(1410, 318, 255, 70, 'database', 'PostgreSQL 17.7', ['PostgreSQL sur TLS · TCP 5432'], true);
  vol(1427, 420, 220, '100 Go SSD', ['Données PostgreSQL locales']);
  svc(1840, 318, 250, 300, 'folder-sync', 'Serveur NFS', ['NFSv4.2 · TCP 2049'], true);
  vol(1855, 535, 220, '100 Go', ['Fichiers de logs']);

  arrow([[175, 340], [318, 340]]);
  label(245, 330, '1 · HTTPS 443', 'middle');
  arrow([[215, 410], [318, 410]]);
  label(266, 400, '12 · HTTPS 443', 'middle');
  arrow([[430, 448], [430, 498]]);
  label(438, 478, '2 · HTTP 8080');
  arrow([[670, 448], [670, 498]]);
  label(678, 478, '13 · HTTP 8081');
  arrow([[780, 350], [958, 350]]);
  label(869, 339, '3 · HTTPS 3001', 'middle');
  arrow([[1200, 350], [1408, 350]]);
  label(1304, 339, '4 · TLS 5432', 'middle');
  arrow([[105, 318], [105, 151], [418, 151]]);
  label(258, 140, '5 · HTTPS 443', 'middle');
  arrow([[1200, 327], [1340, 327], [1340, 151], [687, 151]]);
  label(1013, 140, '6 · HTTPS 443', 'middle');
  arrow([[1295, 600], [1408, 600]]);
  label(1350, 590, '7 · TLS 6514', 'middle');
  arrow([[1665, 583], [1838, 583]]);
  label(1750, 572, '8 · NFS 2049', 'middle');
  arrow([[1075, 388], [1075, 440]]);
  label(1065, 420, '10A · Demandes', 'end');
  arrow([[107, 580], [107, 653]]);
  label(116, 620, '11A');
  arrow([[960, 475], [890, 475], [890, 690], [252, 690]]);
  label(570, 680, '10A · API Configuration Manager', 'middle');
  arrow([[215, 545], [260, 545], [260, 435], [318, 435]]);
  label(252, 488, '10B · HTTPS 443', 'end');
} else if (kind === 'simple') {
  W = 1720; H = 1160;
  title = 'ORION — architecture du démonstrateur';
  desc = 'Système ORION encadré, substituts et pilotage du démonstrateur à l’extérieur, principaux échanges numérotés.';
  // Carte façon Azure : icône au-dessus, nom, rôle, VM
  const step = (x: number, y: number, n: string | number) => { add(`<circle cx="${x}" cy="${y}" r="11" fill="${C.blue}"/>`); text(x, y + 4.5, n, 'step', 'middle'); };

  heading(title, 'Vue simplifiée · dix VM');

  card(20, 240, 'users', 'Firefox', '', '', { stroke: C.extStroke, w: 150 });
  card(20, 860, 'smartphone', 'Téléphone', 'PWA RIGEL hors ligne', '', { stroke: C.extStroke, w: 150 });
  card(1500, 672, 'user-cog', 'Opérateur', 'SSH, client Docker', 'son propre poste', { stroke: C.extStroke, w: 150 });

  // Système ORION : entrée, interface, API, base, logs, stockage et RIGEL
  enclosure(210, 105, 990, 795, 'package', 'Système ORION');
  zone(235, 172, 210, 388, 'Entrée');
  zone(470, 172, 220, 388, 'Application');
  zone(715, 172, 220, 388, 'Données');
  zone(960, 372, 220, 188, 'Collecte des logs');
  card(255, 212, 'split', 'HAProxy', 'entrée', 'orion-1');
  card(490, 212, 'app-window', 'Apache', 'Interface React', 'orion-4 et orion-5');
  card(490, 400, 'server', 'API Express', 'Application ORION', 'orion-4 et orion-5');
  card(735, 212, 'hard-drive', 'Stockage', 'NFS', 'orion-10');
  card(735, 400, 'database', 'PostgreSQL', 'données', 'orion-6 · secours 9');
  card(985, 400, 'scroll-text', 'Logstash', 'Collecte des logs', 'orion-8 · secours 9');
  rigelEnclosure(420, 620, 760, 260);
  zone(700, 667, 465, 195, 'Hidora');
  card(450, 700, 'refresh-cw', 'Connecteur RIGEL', 'Conteneur versionné', 'orion-4 ou orion-5');
  card(720, 700, 'cloud', 'Relais RIGEL', 'rigel.sh1.hidora.net', 'Conteneur versionné');
  card(965, 700, 'database', 'PostgreSQL RIGEL', 'Données chiffrées', 'TCP 5432');

  // Hors du système : substituts de MindefConnect, simulateur et pilotage du démonstrateur
  zone(1230, 172, 470, 180, 'Identité');
  zone(1230, 372, 220, 188, 'Services simulés');
  zone(1230, 640, 220, 188, 'Pilotage');
  card(1250, 212, 'key-round', 'Keycloak', 'connexion', 'orion-7 · secours 9');
  card(1500, 212, 'book-user', 'OpenLDAP', 'annuaire', 'orion-7 · secours 9');
  card(1250, 400, 'monitor', 'Simulateur', 'Postes Windows et M42', 'orion-4 ou orion-5');
  card(1250, 672, 'boxes', 'Swarm', 'managers', 'orion-1, 2 et 3');

  // Adresses des VM
  rect(210, 1010, 1490, 125, C.zone, C.zoneStroke, { rx: 6 });
  text(225, 1036, 'Réseau privé du démonstrateur · 10 VM · accès par https://172.16.131.188', 'zname');
  ips.forEach((ip, i) => text(225 + (i % 4) * 295, 1064 + Math.floor(i / 4) * 25, `orion-${i + 1} · ${ip}`, 'caption'));
  // ① navigateur → entrée, par son adresse
  arrow([[170, 276], [253, 276]]); step(190, 276, '1');
  // ② entrée → interface et API
  arrow([[425, 276], [488, 276]]); step(456, 276, '2');
  arrow([[425, 320], [458, 320], [458, 464], [488, 464]]); step(458, 392, '2');
  // ③ API → base
  arrow([[660, 464], [733, 464]]); step(697, 464, '3');
  // ④ base, annuaire et collecteur → stockage
  arrow([[820, 400], [820, 342]]); step(820, 371, '4');
  arrow([[1130, 400], [1130, 362], [880, 362], [880, 342]]);
  arrow([[1585, 340], [1585, 362], [880, 362], [880, 342]]); step(1010, 362, '4');
  // ⑤ entrée → connexion (Keycloak), qui lit l'annuaire
  arrow([[340, 212], [340, 150], [1335, 150], [1335, 210]]); step(940, 150, '5');
  arrow([[1420, 276], [1498, 276]]);
  // ⑥ postes simulés → API
  arrow([[1335, 528], [1335, 610], [580, 610], [580, 530]]); step(1130, 610, '6');
  // ⑦ conteneurs → logs
  arrow([[630, 528], [630, 585], [1070, 585], [1070, 530]]); step(850, 585, '7');
  // ⑧ opérateur → managers, depuis son poste
  arrow([[1500, 736], [1422, 736]]); step(1461, 736, '8');
  // ⑨ téléphone → relais Hidora, qui enregistre dans sa base
  arrow([[170, 924], [805, 924], [805, 830]]); step(500, 924, '9');
  arrow([[890, 764], [963, 764]]);
  // ⑩ connecteur → API et relais
  arrow([[535, 700], [535, 530]]); step(535, 592, '10');
  arrow([[620, 764], [718, 764]]); step(669, 764, '10');
} else {
  W = 2240; H = 1500;
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
  // Légende : système ORION ou démonstrateur
  systeme = true;
  rect(1640, 30, 22, 16, '#f2f7fd', C.blue, { rx: 4, sw: 2.5 });
  text(1672, 43, 'Système ORION : entrée, interface, API, base, logs, stockage et RIGEL', 'caption');
  rect(1640, 58, 22, 16, C.hors, C.horsStroke, { rx: 4 });
  text(1672, 71, 'Hors système : substituts de MindefConnect, simulation, horloge', 'caption');
  // Contenu décalé sous le titre
  add('<g transform="translate(0 -10)">');
  ext(20, 150, 160, 90, 'users', 'Firefox', ['172.16.131.188']);

  // Cluster Swarm
  enclosure(215, 140, 1265, 980, 'boxes', 'Cluster Docker Swarm « orion » · orion-1 à orion-9 · réseau overlay chiffré « orion » · VXLAN 4789/UDP · ESP');

  // Colonne A : managers et entrée, secours
  groupe(305, 195, 275, 565, 'Managers et entrée', [1, 2], 'manager');
  svc(318, 367, 249, 250, 'split', 'HAProxy 3.2.16', ['image officielle', 'ports publiés sur l’hôte', 'HTTPS 443 · ORION, connexion', 'HTTPS 8444 · console Keycloak', '1 instance · orion-1']);
  svc(318, 632, 249, 72, 'clock', 'chrony', ['paquet Debian · orion-1', 'NTP 123/UDP'], true, true, true);
  groupe(305, 900, 275, 120, 'Secours', [9], 'worker');
  ['étiquettes pg, identite, logs', 'reprend PostgreSQL, l’identité', 'ou Logstash'].forEach((l, i) => text(339, 958 + i * 16, l, 'caption'));

  // Colonnes B et C : manager, application (services joints par HAProxy), rôles isolés
  groupe(650, 195, 780, 100, 'Manager', [3], 'manager');
  groupe(650, 305, 780, 345, 'Application', [4, 5], 'worker');
  svc(663, 375, 260, 86, 'app-window', 'Apache 2.4.69', ['image orion-web:<SHA Git>', 'httpd 2.4.69 · HTTP 8080', 'build React 19.3.1 · 2 instances']);
  svc(663, 505, 260, 130, 'server', 'Express 5.3.0', ['image orion-api:<SHA Git>', 'Node.js 22.22.3 · HTTP 3001', '2 instances · une par VM']);
  svc(1123, 470, 294, 72, 'monitor', 'Simulateur des postes', ['image orion-postes:<SHA Git>', 'Node.js 22.22.3 · 1 instance'], false, true, true);
  svc(1123, 558, 294, 72, 'refresh-cw', 'Connecteur RIGEL', ['image orion-connecteur:<SHA Git>', 'pile orion-rigel · 1 instance']);
  groupe(650, 690, 290, 330, 'Identité', [7], 'worker');
  svc(663, 750, 260, 72, 'key-round', 'Keycloak 26.7.4', ['image officielle · HTTP 8080', '1 instance · secours orion-9'], false, true, true);
  svc(663, 870, 260, 72, 'book-user', 'OpenLDAP 1.5.0', ['image osixia/openldap · LDAP 389', '1 instance · secours orion-9'], false, true, true);
  vol(663, 955, 260, 'Volumes NFS', ['ldap-data-nfs → /var/lib/ldap', 'ldap-config-nfs → /etc/ldap/slapd.d']);
  groupe(1110, 690, 320, 195, 'Logs', [8], 'worker');
  svc(1123, 750, 294, 72, 'scroll-text', 'Logstash 8.19.14', ['image officielle · TCP TLS 6514', '1 instance · secours orion-9']);
  vol(1123, 832, 294, 'logs-nfs', ['volume NFS · /var/log/orion']);
  groupe(1110, 905, 320, 195, 'PostgreSQL', [6], 'worker');
  svc(1123, 965, 294, 72, 'database', 'PostgreSQL 17.7', ['image officielle · TCP 5432', '1 instance · secours orion-9']);
  vol(1123, 1047, 294, 'pg-nfs', ['volume NFS · /var/lib/postgresql/data']);

  // Opérateur et stockage, hors Swarm
  ext(300, 1180, 260, 90, 'user-cog', 'Opérateur', ['son poste, sur le réseau', 'd’administration']);
  groupe(650, 1160, 780, 205, 'Stockage', [10], 'hors');
  svc(663, 1215, 754, 72, 'folder-sync', 'Serveur NFS', ['paquet nfs-kernel-server · NFSv4.2 · TCP 2049', 'partages /srv/orion/donnees et /srv/orion/logs'], true);
  vol(663, 1300, 370, 'Données · ext4 · fichier image 6 Go', ['/srv/orion/donnees : postgres, ldap-data, ldap-config']);
  vol(1047, 1300, 370, 'Logs · ext4 · fichier image 4 Go', ['/srv/orion/logs : conteneurs']);

  // Services de l'hôte communs aux VM
  rect(210, 1400, 1385, 80, C.amber, C.amberStroke);
  icon('cog', 224, 1413, 18, '#a06a00');
  text(250, 1428, 'Sur chaque VM', 'service');
  text(1585, 1427, 'service hôte', 'tag host', 'end');
  text(250, 1449, 'orion-1 à orion-10 · Debian 13 · OpenSSH 22 · systemd-timesyncd · résolveur DNS · apt', 'caption');
  text(250, 1466, 'orion-1 à orion-9 · Docker · pilote syslog → 127.0.0.1:6514 · téléchargement des images', 'caption');

  // Extérieur : proxy du réseau, DNS, registres, RIGEL sur Hidora, téléphone
  ext(1640, 520, 240, 100, 'network', 'Proxy du réseau', ['172.16.0.1:8080']);
  ext(1680, 1400, 200, 80, 'globe', 'DNS du réseau', ['172.16.143.251']);
  ext(1960, 520, 240, 100, 'package', 'Registres et dépôts', ['Docker Hub · docker.elastic.co', 'dépôts Debian']);
  rigelEnclosure(1940, 700, 280, 360, 'Hidora');
  svc(1965, 780, 230, 95, 'cloud', 'Relais RIGEL', ['rigel.sh1.hidora.net', 'image rigel:<SHA Git>', 'HTTPS 443 · HTTP interne 3000']);
  svc(1965, 945, 230, 80, 'database', 'PostgreSQL RIGEL', ['données chiffrées', 'TCP 5432'], false, false);
  ext(1640, 850, 240, 80, 'smartphone', 'Téléphone', ['PWA RIGEL hors ligne']);

  // Navigateur → HAProxy d'orion-1, par son adresse (interface, API, connexion et console Keycloak)
  arrow([[80, 240], [80, 400], [316, 400]]); label(88, 330, 'HTTPS 443 · 8444');
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
  // Opérateur → cluster (SSH, client Docker vers un manager) et stockage
  arrow([[330, 1180], [330, 1122]]); label(338, 1156, 'SSH 22 · client Docker vers un manager');
  arrow([[560, 1225], [648, 1225]]); label(568, 1218, 'SSH 22');
  // Chaque VM → managers (Swarm), chrony d'orion-1, Logstash (maillage de routage), proxy et DNS du réseau
  arrow([[230, 1400], [230, 668], [316, 668]]); label(222, 1330, 'NTP 123/UDP', 'end');
  arrow([[255, 1400], [255, 740], [303, 740]]); label(263, 1330, 'Swarm TCP 2377 · 7946');
  arrow([[1500, 1400], [1500, 786], [1419, 786]]); label(1459, 779, 'TLS 6514', 'middle');
  arrow([[1580, 1400], [1580, 600], [1638, 600]]); label(1588, 1200, 'TCP 8080');
  arrow([[1595, 1440], [1678, 1440]]); label(1636, 1433, 'DNS 53', 'middle');
  // Connecteur → proxy
  arrow([[1417, 570], [1638, 570]]); label(1560, 563, 'TCP 8080', 'middle');
  // Proxy → registres et relais ; Hidora → registres
  arrow([[1880, 570], [1958, 570]]); label(1919, 563, 'HTTPS 443', 'middle');
  arrow([[1760, 620], [1760, 805], [1963, 805]]); label(1768, 700, 'HTTPS 443');
  arrow([[2080, 700], [2080, 622]]); label(2088, 666, 'HTTPS 443');
  // Téléphone → relais ; relais → base
  arrow([[1880, 860], [1963, 860]]); label(1921, 853, 'HTTPS 443', 'middle');
  arrow([[2080, 875], [2080, 943]]); label(2088, 914, 'TCP 5432');
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
.tag.hors{fill:#66788a}
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
