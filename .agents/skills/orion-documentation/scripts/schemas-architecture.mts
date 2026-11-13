// Génère les deux schémas de l'architecture réelle (icônes Lucide, licence ISC), depuis la racine du dépôt :
//   node .agents/skills/orion-documentation/scripts/schemas-architecture.mjs application/node_modules/lucide-react simple docs/assets/architecture/ORION-VUE-SIMPLIFIEE.svg
//   node .agents/skills/orion-documentation/scripts/schemas-architecture.mjs application/node_modules/lucide-react complet docs/assets/architecture/ORION-DEPLOIEMENT-VM.svg
// Coordonnées écrites à la main ; règles de contenu et de tracé dans AGENTS.md (Architecture technique).
import { readFileSync, writeFileSync } from 'node:fs';

const [, , lucideDir, kind, out] = process.argv;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function iconNode(name) {
  const src = readFileSync(`${lucideDir}/dist/esm/icons/${name}.js`, 'utf8');
  const body = src.slice(src.indexOf('[', src.indexOf('createLucideIcon(')), src.lastIndexOf(']);') + 1);
  return JSON.parse(body.replace(/(\w+):/g, '"$1":').replace(/,\s*"key":\s*"[^"]*"/g, ''));
}
const C = {
  ink: '#142a40', sub: '#425a72', blue: '#0f6cbd', line: '#0f6cbd',
  zone: '#f3f8fd', zoneStroke: '#9cc0e4', vm: '#ffffff', vmStroke: '#b9c7d6',
  green: '#e6f4ec', greenStroke: '#8fc4a3', amber: '#fff6e5', amberStroke: '#e3bd6d', ext: '#eef3f8', extStroke: '#b3c3d3',
};
const used = new Set();
const parts = [];
const add = (s) => parts.push(s);
const icon = (name, x, y, size = 20, color = C.blue) => { used.add(name); add(`<use href="#i-${name}" x="${x}" y="${y}" width="${size}" height="${size}" style="color:${color}"/>`); };
const text = (x, y, s, cls, anchor = 'start') => add(`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${esc(s)}</text>`);
const rect = (x, y, w, h, fill, stroke, opts = {}) => add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${opts.rx ?? 10}" fill="${fill}" stroke="${stroke}"${opts.dashed ? ' stroke-dasharray="7 5"' : ''}${opts.sw ? ` stroke-width="${opts.sw}"` : ''}/>`);
function arrow(points, opts = {}) {
  const d = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
  add(`<path d="${d}" class="flow${opts.dashed ? ' auto' : ''}" marker-end="url(#arrow)"/>`);
}
const label = (x, y, s, anchor = 'start') => text(x, y, s, 'route', anchor);
function pill(xRight, y, s, tone) {
  const w = s.length * 7.2 + 14;
  const fill = { manager: '#d7e8fb', worker: '#e8eef5', hors: C.amber }[tone];
  rect(xRight - w, y, w, 19, fill, 'none', { rx: 9.5 });
  text(xRight - w / 2, y + 13.5, s, 'badge', 'middle');
}

const ips = ["172.16.131.188","172.16.131.133","172.16.131.193","172.16.131.208","172.16.131.142","172.16.131.131","172.16.131.137","172.16.131.146","172.16.131.190","172.16.131.197"];

let W, H, title, desc;

if (kind === 'simple') {
  W = 1500; H = 935;
  title = 'ORION — vue simplifiée de l’architecture réelle';
  desc = 'Rôles du démonstrateur, regroupés par zone, et principaux échanges numérotés.';
  // Carte façon Azure : icône au-dessus, nom, rôle, VM
  const card = (x, y, ic, name, role, vm, opts = {}) => {
    const w = opts.w ?? 170;
    rect(x, y, w, 128, '#fff', opts.stroke ?? '#c8d6e4', { rx: 8 });
    icon(ic, x + w / 2 - 18, y + 14, 36, opts.color ?? C.blue);
    text(x + w / 2, y + 72, name, 'cname', 'middle');
    text(x + w / 2, y + 91, role, 'crole', 'middle');
    text(x + w / 2, y + 112, vm, 'cvm', 'middle');
  };
  const zone = (x, y, w, h, name) => { rect(x, y, w, h, C.zone, C.zoneStroke, { rx: 6 }); text(x + 14, y + 24, name, 'zname'); };
  const step = (x, y, n) => { add(`<circle cx="${x}" cy="${y}" r="11" fill="${C.blue}"/>`); text(x, y + 4.5, n, 'step', 'middle'); };

  text(40, 44, 'Architecture réelle du démonstrateur ORION', 'title');
  text(40, 72, 'Déploiement proposé · dix VM Debian 13 · réseau privé · conteneurs Docker, DNS et stockage NFS', 'body');

  card(20, 240, 'users', 'Utilisateurs', 'Firefox', 'navigateur web', { stroke: C.extStroke, w: 150 });
  card(20, 625, 'user-cog', 'Opérateur', 'SSH, client Docker', 'son propre poste', { stroke: C.extStroke, w: 150 });

  rect(230, 105, 1240, 695, '#fff', '#7aa7d6', { rx: 8, dashed: true, sw: 1.5 });
  icon('network', 246, 117, 22);
  text(276, 134, 'Réseau privé du démonstrateur · 10 VM · accès par orion.internal', 'zname');

  zone(255, 172, 210, 388, 'Entrée');
  zone(490, 172, 220, 388, 'Application');
  zone(735, 172, 220, 388, 'Données');
  zone(980, 172, 470, 388, 'Services simulés');
  zone(255, 600, 210, 178, 'Pilotage');

  card(275, 212, 'split', 'HAProxy', 'entrée', 'orion-1 et orion-2');
  card(275, 400, 'globe', 'BIND', 'DNS', 'orion-1 et orion-2');
  card(515, 212, 'app-window', 'Apache', 'interface web', 'orion-4 et orion-5');
  card(515, 400, 'server', 'Express', 'API', 'orion-4 et orion-5');
  card(760, 212, 'hard-drive', 'Stockage', 'NFS', 'orion-10');
  card(760, 400, 'database', 'PostgreSQL', 'données', 'orion-6 · secours 9');
  card(1005, 212, 'key-round', 'Keycloak', 'connexion', 'orion-7 · secours 9');
  card(1255, 212, 'book-user', 'OpenLDAP', 'annuaire', 'orion-7 · secours 9');
  card(1005, 400, 'monitor', 'Postes Windows', 'émulateur', 'orion-4 ou orion-5');
  card(275, 638, 'boxes', 'Swarm', 'managers', 'orion-1, 2 et 3');
  card(1255, 400, 'scroll-text', 'Logstash', 'logs', 'orion-8 · secours 9');

  // Adresses des VM
  rect(255, 815, 1195, 100, C.zone, C.zoneStroke, { rx: 6 });
  ips.forEach((ip, i) => text(270 + (i % 4) * 295, 843 + Math.floor(i / 4) * 27, `orion-${i + 1} · ${ip}`, 'caption'));
  // ① navigateur → DNS, puis entrée
  arrow([[170, 276], [273, 276]]); step(210, 276, '1');
  arrow([[170, 340], [240, 340], [240, 464], [273, 464]]); step(240, 402, '1');
  // ② entrée → interface et API
  arrow([[445, 276], [513, 276]]); step(479, 276, '2');
  arrow([[445, 320], [480, 320], [480, 464], [513, 464]]); step(480, 392, '2');
  // ③ API → base
  arrow([[685, 464], [758, 464]]); step(722, 464, '3');
  // ④ base, annuaire et collecteur → stockage
  arrow([[845, 400], [845, 342]]); step(845, 371, '4');
  arrow([[1340, 340], [1340, 370], [900, 370], [900, 342]]);
  arrow([[1300, 400], [1300, 370], [900, 370], [900, 342]]); step(1120, 370, '4');
  // ⑤ entrée → connexion (Keycloak), qui lit l'annuaire
  arrow([[340, 212], [340, 150], [1150, 150], [1150, 210]]); step(940, 150, '5');
  arrow([[1175, 276], [1253, 276]]);
  // ⑥ postes → API
  arrow([[1090, 528], [1090, 545], [640, 545], [640, 530]]); step(860, 545, '6');
  // ⑦ conteneurs → logs
  arrow([[600, 530], [600, 580], [1340, 580], [1340, 530]]); step(970, 580, '7');
  // ⑧ opérateur → VM, par SSH depuis son poste
  arrow([[170, 702], [273, 702]]); step(222, 702, '8');
} else {
  W = 1420; H = 1440;
  title = 'ORION — architecture réelle complète sur dix VM';
  desc = 'Placement des services par VM ou groupe de VM, conteneurs ou services de l’hôte, rôles Swarm, versions, ports, volumes et flux.';
  // VM ou groupe de VM : rôle en titre, puis une ligne par VM (nom d'hôte et IPv4)
  const groupe = (x, y, w, h, role, vms, tone) => {
    rect(x, y, w, h, C.vm, C.vmStroke);
    icon('server', x + 12, y + 11, 16, '#5b7690');
    text(x + 34, y + 24, role, 'vm');
    vms.forEach((n, i) => text(x + 34, y + 41 + i * 17, `orion-${n} · ${ips[n - 1]}`, 'caption'));
    pill(x + w - 10, y + 10, { manager: 'MANAGER', worker: 'WORKER', hors: 'HORS SWARM' }[tone], tone);
  };
  // Service : conteneur (bleu) ou service de l'hôte (ambre)
  const svc = (x, y, w, h, ic, name, lines, host = false) => {
    rect(x, y, w, h, host ? C.amber : '#f2f7fd', host ? C.amberStroke : '#aac6e3', { rx: 8 });
    icon(ic, x + 10, y + 10, 20, host ? '#a06a00' : C.blue);
    text(x + 38, y + 25, name, 'service');
    text(x + w - 10, y + 24, host ? 'service hôte' : 'conteneur', host ? 'tag host' : 'tag', 'end');
    lines.forEach((l, i) => text(x + 38, y + 43 + i * 16, l, 'caption'));
  };
  const vol = (x, y, w, name, lines) => {
    rect(x, y, w, 25 + lines.length * 15, C.green, C.greenStroke, { rx: 8 });
    icon('hard-drive', x + 10, y + 12, 16, '#2f7a4f');
    text(x + 34, y + 17, name, 'vol');
    lines.forEach((l, i) => text(x + 34, y + 32 + i * 15, l, 'caption'));
  };
  const ext = (x, y, w, h, ic, name, lines) => {
    rect(x, y, w, h, C.ext, C.extStroke);
    icon(ic, x + 12, y + 12, 22, '#3d5a78');
    text(x + 44, y + 28, name, 'service');
    lines.forEach((l, i) => text(x + 44, y + 47 + i * 16, l, 'caption'));
  };

  text(40, 44, 'Architecture réelle complète sur dix VM', 'title');
  text(40, 72, 'Déploiement proposé · Debian 13 · Docker Swarm · DNS BIND · stockage NFS · accès par orion.internal', 'body');

  ext(20, 280, 170, 170, 'users', 'Navigateur', ['Firefox', 'React 19.3.1', 'DNS : orion-1, orion-2']);
  ext(20, 1150, 170, 110, 'user-cog', 'Opérateur', ['son poste, sur le', 'réseau', 'd’administration']);

  // Cluster Swarm
  rect(285, 140, 1095, 1005, '#f7fafd', '#7aa7d6', { rx: 12, dashed: true, sw: 1.5 });
  icon('boxes', 300, 152, 22);
  text(330, 169, 'Cluster Docker Swarm « orion » · orion-1 à orion-9 · réseau overlay « orion »', 'frame');

  // Colonne A : managers, entrée et DNS ; éléments communs
  groupe(305, 195, 275, 585, 'Managers et entrée', [1, 2, 3], 'manager');
  svc(318, 285, 249, 72, 'globe', 'BIND 9.20', ['DNS 53/TCP-UDP · port de l’hôte', '2 instances · orion-1, orion-2']);
  svc(318, 367, 249, 250, 'split', 'HAProxy 3.2', ['image officielle', 'ports publiés sur l’hôte', 'HTTPS 443 · ORION', 'HTTPS 8443 · Keycloak', 'HTTPS 8444 · console Keycloak', '2 instances · orion-1, orion-2', 'Swarm 2377/TCP']);
  svc(318, 632, 249, 72, 'clock', 'chrony', ['paquet Debian · orion-1', 'NTP 123/UDP'], true);
  vol(318, 714, 249, 'Volumes NFS de BIND', ['bind-1-*-nfs (orion-1)', 'bind-2-*-nfs (orion-2)']);
  rect(305, 960, 275, 110, C.amber, C.amberStroke);
  icon('cog', 317, 972, 18, '#a06a00');
  text(343, 987, 'Sur chaque VM', 'service');
  ['Debian 13 · Docker · OpenSSH (22)', 'systemd-timesyncd → orion-1', 'DNS → orion-1, orion-2 · syslog 6514', '7946/TCP-UDP · 4789/UDP · ESP'].forEach((l, i) => text(317, 1009 + i * 16, l, 'caption'));

  // Colonnes B et C : application (services joints par HAProxy), rôles isolés et secours
  groupe(650, 195, 710, 375, 'Application', [4, 5], 'worker');
  svc(663, 375, 274, 86, 'app-window', 'Apache 2.4', ['image sur httpd:2.4 · HTTP 8080', 'build React 19.3.1', '2 instances · une par VM']);
  svc(663, 471, 274, 86, 'server', 'Express 5.3', ['image sur node:22 · HTTP 3001', '2 instances · une par VM']);
  svc(1043, 435, 304, 72, 'monitor', 'Émulateur des postes', ['image sur node:22', '1 instance · orion-4 ou orion-5']);
  groupe(650, 590, 300, 325, 'Identité', [7], 'worker');
  svc(663, 650, 274, 72, 'key-round', 'Keycloak 26.7.4', ['image officielle · HTTP 8080', '1 instance · secours orion-9']);
  svc(663, 768, 274, 72, 'book-user', 'OpenLDAP 1.5.0', ['image osixia/openldap · LDAP 389', '1 instance · secours orion-9']);
  vol(663, 850, 274, 'Volumes NFS', ['ldap-data-nfs → /var/lib/ldap', 'ldap-config-nfs → /etc/ldap/slapd.d']);
  groupe(650, 935, 300, 192, 'Logs', [8], 'worker');
  svc(663, 995, 274, 72, 'scroll-text', 'Logstash 8.19', ['TCP TLS 6514 · maillage Swarm', '1 instance · secours orion-9']);
  vol(663, 1077, 274, 'logs-nfs', ['volume NFS · /var/log/orion']);
  groupe(1030, 590, 330, 195, 'PostgreSQL', [6], 'worker');
  svc(1043, 650, 304, 72, 'database', 'PostgreSQL 17.7', ['image officielle · TCP 5432', '1 instance · secours orion-9']);
  vol(1043, 732, 304, 'pg-nfs', ['volume NFS · /var/lib/postgresql/data']);
  groupe(1030, 805, 240, 130, 'Secours', [9], 'worker');
  ['étiquettes pg, identite, logs', 'reprend PostgreSQL,', 'l’identité ou Logstash'].forEach((l, i) => text(1064, 875 + i * 16, l, 'caption'));

  // Stockage, hors Swarm
  groupe(650, 1180, 710, 235, 'Stockage', [10], 'hors');
  svc(663, 1235, 684, 72, 'folder-sync', 'Serveur NFS', ['paquet nfs-kernel-server · NFSv4.2 · TCP 2049', 'partages /srv/orion/donnees et /srv/orion/logs'], true);
  vol(663, 1320, 330, 'Disque des données · ext4', ['/srv/orion/donnees : postgres, ldap-data, ldap-config', 'bind/1, bind/2 (cache et données des DNS)']);
  vol(1010, 1320, 337, 'Disque des logs · ext4', ['/srv/orion/logs : conteneurs, bind']);

  // Flux du navigateur : DNS (BIND), puis HAProxy, sur un des managers
  [['DNS 53', 320], ['443 · ORION', 400], ['8443 · connexion', 435]].forEach(([t, y]) => { arrow([[190, y], [316, y]]); label(196, y - 6, t); });
  // HAProxy → Apache et Express ; Express → HAProxy (adresse publique de Keycloak)
  arrow([[567, 418], [661, 418]]); label(575, 411, '8080');
  arrow([[567, 500], [661, 500]]); label(575, 493, '3001');
  arrow([[663, 540], [569, 540]]); label(575, 533, '8443');
  // HAProxy → Keycloak
  arrow([[567, 600], [610, 600], [610, 686], [661, 686]]); label(616, 679, '8080');
  // Keycloak → OpenLDAP ; Express → PostgreSQL ; émulateur → Express
  arrow([[800, 722], [800, 766]]); label(808, 749, 'LDAP 389');
  arrow([[937, 540], [1000, 540], [1000, 686], [1041, 686]]); label(943, 533, 'TCP 5432');
  arrow([[1043, 490], [939, 490]]); label(958, 483, 'HTTP 3001');
  // Volumes de BIND, de l'identité, des logs et de la base → serveur NFS d'orion-10
  arrow([[567, 741], [625, 741], [625, 1270], [661, 1270]]); label(633, 1166, 'NFS 2049');
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
