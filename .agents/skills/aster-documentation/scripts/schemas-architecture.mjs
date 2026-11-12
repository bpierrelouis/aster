// Génère les deux schémas de l'architecture réelle (icônes Lucide, licence ISC), depuis la racine du dépôt :
//   node .agents/skills/aster-documentation/scripts/schemas-architecture.mjs application/node_modules/lucide-react simple docs/assets/architecture/ASTER-VUE-SIMPLIFIEE.svg
//   node .agents/skills/aster-documentation/scripts/schemas-architecture.mjs application/node_modules/lucide-react complet docs/assets/architecture/ASTER-DEPLOIEMENT-VM.svg
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

let W, H, title, desc;

if (kind === 'simple') {
  W = 1500; H = 810;
  title = 'ASTER — vue simplifiée de l’architecture réelle';
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

  text(40, 44, 'Architecture réelle du démonstrateur ASTER', 'title');
  text(40, 72, 'Sept machines virtuelles Debian 13 sur un réseau privé · services en conteneurs Docker', 'body');

  card(20, 300, 'users', 'Utilisateurs', 'Firefox', 'navigateur web', { stroke: C.extStroke, w: 150 });
  card(20, 600, 'user-cog', 'Opérateur', 'SSH, client Docker', 'son propre poste', { stroke: C.extStroke, w: 150 });

  rect(230, 105, 1240, 680, '#fff', '#7aa7d6', { rx: 8, dashed: true, sw: 1.5 });
  icon('network', 246, 117, 22);
  text(276, 134, 'Réseau privé du démonstrateur · 7 VM · accès par adresse IP', 'zname');

  zone(255, 172, 210, 388, 'Entrée');
  zone(490, 172, 220, 388, 'Application');
  zone(735, 172, 220, 388, 'Données');
  zone(980, 172, 470, 388, 'Services simulés');
  zone(255, 590, 210, 178, 'Journaux');

  card(275, 300, 'split', 'HAProxy', 'entrée', 'VM 01');
  card(515, 212, 'app-window', 'Apache', 'interface web', 'VM 02, 03 ou 06');
  card(515, 400, 'server', 'Express', 'API', 'VM 02, 03 ou 06');
  card(760, 400, 'database', 'PostgreSQL', 'données', 'VM 04');
  card(1005, 212, 'key-round', 'Keycloak', 'connexion', 'VM 05');
  card(1255, 212, 'book-user', 'OpenLDAP', 'annuaire', 'VM 05');
  card(1005, 400, 'monitor', 'Postes Windows', 'émulateur', 'VM 02, 03 ou 06');
  card(275, 628, 'scroll-text', 'Logstash', 'journaux', 'VM 07');

  // ① navigateur → entrée
  arrow([[170, 364], [273, 364]]); step(222, 364, '1');
  // ② entrée → interface et API
  arrow([[445, 340], [480, 340], [480, 276], [513, 276]]);
  arrow([[445, 390], [480, 390], [480, 464], [513, 464]]); step(480, 304, '2');
  // ③ API → base
  arrow([[685, 464], [758, 464]]); step(722, 464, '3');
  // ④ entrée → connexion (Keycloak), qui lit l'annuaire
  arrow([[340, 300], [340, 150], [1150, 150], [1150, 210]]); step(940, 150, '4');
  arrow([[1175, 276], [1253, 276]]);
  // ⑤ postes → API
  arrow([[1090, 528], [1090, 545], [640, 545], [640, 530]]); step(860, 545, '5');
  // ⑥ conteneurs → journaux
  arrow([[600, 530], [600, 692], [447, 692]]); step(600, 610, '6');
  // ⑦ opérateur → VM, par SSH depuis son poste
  arrow([[170, 664], [228, 664]]); step(199, 664, '7');
} else {
  W = 1420; H = 1135;
  title = 'ASTER — architecture réelle complète sur sept VM';
  desc = 'Placement des services, conteneurs ou services de l’hôte, rôles Swarm, versions, ports, volumes et flux.';
  const vm = (x, y, w, h, name, role, tone) => {
    rect(x, y, w, h, C.vm, C.vmStroke);
    icon('server', x + 12, y + 11, 16, '#5b7690');
    text(x + 34, y + 24, name, 'vm');
    text(x + 34, y + 41, role, 'caption');
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
  const vol = (x, y, w, name, path) => {
    rect(x, y, w, 40, C.green, C.greenStroke, { rx: 8 });
    icon('hard-drive', x + 10, y + 12, 16, '#2f7a4f');
    text(x + 34, y + 17, name, 'vol');
    text(x + 34, y + 32, path, 'caption');
  };
  const ext = (x, y, w, h, ic, name, lines) => {
    rect(x, y, w, h, C.ext, C.extStroke);
    icon(ic, x + 12, y + 12, 22, '#3d5a78');
    text(x + 44, y + 28, name, 'service');
    lines.forEach((l, i) => text(x + 44, y + 47 + i * 16, l, 'caption'));
  };

  text(40, 44, 'Architecture réelle complète sur sept VM', 'title');
  text(40, 72, 'Debian 13 · Docker · une pile Docker Swarm · accès par l’IP de la VM 01', 'body');

  ext(20, 205, 170, 130, 'users', 'Navigateur', ['Firefox', 'React 19.3.1']);
  ext(20, 1005, 170, 110, 'user-cog', 'Opérateur', ['son poste, sur le', 'réseau', 'd’administration']);

  // Cluster Swarm
  rect(285, 140, 1095, 835, '#f7fafd', '#7aa7d6', { rx: 12, dashed: true, sw: 1.5 });
  icon('boxes', 300, 152, 22);
  text(330, 169, 'Cluster Docker Swarm · VM 01 à 07 · réseau overlay « aster »', 'frame');

  // Colonne A : entrée, Swarm, éléments communs
  vm(305, 195, 275, 425, 'VM 01', 'Entrée', 'manager');
  svc(318, 245, 249, 270, 'split', 'HAProxy 3.2', ['image officielle', 'réseau de l’hôte', 'HTTPS 443 · ASTER', 'HTTPS 8443 · Keycloak', 'HTTPS 8444 · console Keycloak']);
  svc(318, 530, 249, 72, 'clock', 'chrony', ['paquet Debian', 'NTP 123/UDP'], true);
  rect(305, 640, 275, 115, '#fff', C.vmStroke);
  icon('boxes', 317, 652, 18, '#5b7690');
  text(343, 667, 'Docker Swarm', 'service');
  ['Managers : VM 01, 04, 05', 'Workers : VM 02, 03, 06, 07', '2377/TCP · 7946/TCP-UDP · 4789/UDP'].forEach((l, i) => text(317, 689 + i * 16, l, 'caption'));
  rect(305, 775, 275, 115, C.amber, C.amberStroke);
  icon('cog', 317, 787, 18, '#a06a00');
  text(343, 802, 'Sur chaque VM', 'service');
  ['Debian 13 · Docker · OpenSSH (22)', 'systemd-timesyncd → VM 01', 'pilote syslog de Docker → VM 07'].forEach((l, i) => text(317, 824 + i * 16, l, 'caption'));

  // Colonne B : services joints par HAProxy
  vm(650, 195, 300, 150, 'VM 02', 'Interface', 'worker');
  svc(663, 245, 274, 86, 'app-window', 'Apache 2.4', ['image sur httpd:2.4 · HTTP 8080', 'build React 19.3.1', '2 instances · VM 02, 03, 06']);
  vm(650, 365, 300, 150, 'VM 03', 'API', 'worker');
  svc(663, 415, 274, 86, 'server', 'Express 5.3', ['image sur node:22 · HTTP 3001', '2 instances · VM 02, 03, 06']);
  vm(650, 535, 300, 320, 'VM 05', 'Identité', 'manager');
  svc(663, 585, 274, 56, 'key-round', 'Keycloak 26.7.4', ['image officielle · HTTP 8080']);
  svc(663, 687, 274, 56, 'book-user', 'OpenLDAP 1.5.0', ['image osixia/openldap · LDAP 389']);
  vol(663, 753, 274, 'ldap-data', 'volume Docker · /var/lib/ldap');
  vol(663, 798, 274, 'ldap-config', 'volume Docker · /etc/ldap/slapd.d');

  // Colonne C : autres services
  vm(1030, 195, 330, 150, 'VM 06', 'Postes simulés', 'worker');
  svc(1043, 245, 304, 56, 'monitor', 'Émulateur des postes', ['image sur node:22 · 1 instance']);
  vm(1030, 365, 330, 175, 'VM 04', 'Base de données', 'manager');
  svc(1043, 415, 304, 56, 'database', 'PostgreSQL 17.7', ['image officielle · TCP 5432']);
  vol(1043, 481, 304, 'pg-data', 'volume Docker · /var/lib/pgsql/data');
  vm(1030, 560, 330, 175, 'VM 07', 'Journaux', 'worker');
  svc(1043, 610, 304, 56, 'scroll-text', 'Logstash 8.19', ['image officielle · TCP TLS 6514']);
  vol(1043, 676, 304, 'Dossier de la VM', '/var/log/aster · monté, hors volume Docker');

  // Flux du navigateur vers HAProxy
  [['443 · ASTER', 260], ['8443 · connexion', 295]].forEach(([t, y]) => { arrow([[190, y], [316, y]]); label(196, y - 6, t); });
  // HAProxy → Apache et Express ; Express → HAProxy (adresse publique de Keycloak)
  arrow([[567, 290], [661, 290]]); label(575, 283, '8080');
  arrow([[567, 445], [661, 445]]); label(575, 438, '3001');
  arrow([[663, 485], [569, 485]]); label(575, 478, '8443');
  // HAProxy → Keycloak
  arrow([[567, 505], [610, 505], [610, 613], [661, 613]]); label(616, 606, '8080');
  // Keycloak → OpenLDAP ; Express → PostgreSQL ; émulateur → Express
  arrow([[800, 641], [800, 685]]); label(808, 668, 'LDAP 389');
  arrow([[937, 443], [1041, 443]]); label(948, 436, 'TCP 5432');
  arrow([[1043, 273], [990, 273], [990, 420], [939, 420]]); label(958, 266, 'HTTP 3001');
  // Conteneurs de chaque VM → Logstash ; VM → chrony de la VM 01
  arrow([[440, 890], [440, 950], [1195, 950], [1195, 737]]); label(820, 944, 'syslog TLS 6514 · conteneurs de chaque VM', 'middle');
  arrow([[305, 830], [295, 830], [295, 566], [316, 566]]);
  // Opérateur → VM (SSH, client Docker vers un manager) et console Keycloak
  arrow([[190, 1080], [1100, 1080], [1100, 977]]); label(640, 1073, 'SSH 22 · les 7 VM · client Docker vers un manager', 'middle');
  arrow([[105, 1005], [105, 997], [262, 997], [262, 500], [316, 500]]); label(272, 993, 'HTTPS 8444 · console Keycloak');
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
