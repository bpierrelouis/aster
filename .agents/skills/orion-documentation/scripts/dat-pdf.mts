// Produit le livrable PDF du dossier d'architecture technique (DAT), aux couleurs de la charte ORION, depuis la racine du dépôt :
//   node .agents/skills/orion-documentation/scripts/dat-pdf.mts [livrables/DAT-ORION/DAT-ORION.pdf]
// Sources : docs/03-ARCHITECTURE/01-DOSSIER-ARCHITECTURE-TECHNIQUE.md, les quatre schémas de docs/03-ARCHITECTURE/assets/,
// le logo de design/assets/logos/ et la version du registre archive/registre.json. Chromium de Playwright (application/node_modules).
// Charte commune avec le DSE ; page de garde, fiche du document, sommaire paginé et cliquable, texte en portrait A4, schémas en paysage A4 ; signets PDF générés.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { inflateSync } from 'node:zlib';

const out = resolve(process.argv[2] ?? 'livrables/DAT-ORION/DAT-ORION.pdf');
const DAT = 'docs/03-ARCHITECTURE/01-DOSSIER-ARCHITECTURE-TECHNIQUE.md';
const ASSETS = 'docs/03-ARCHITECTURE/assets';
const require = createRequire(resolve('application/package.json'));
const { chromium } = require('playwright');

// --- Sources -----------------------------------------------------------------
const md = readFileSync(DAT, 'utf8').replace(/\r\n/g, '\n');
const registre = JSON.parse(readFileSync('archive/registre.json', 'utf8'));
const derniere = registre[DAT].versions.at(-1) as { version: string; date: string };
const dateFr = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const svgData = (f: string) => `data:image/svg+xml;base64,${readFileSync(f).toString('base64')}`;
const logo = svgData('design/assets/logos/orion-horizontal-inverse.svg');

// Schémas : ancre du fichier des diagrammes → figure insérée après le paragraphe qui y renvoie.
const figures = [
  { ancre: 'vue-simplifiée', id: 'fig-1', fichier: 'ORION-VUE-SIMPLIFIEE.svg', titre: 'Architecture réelle — vue simplifiée' },
  { ancre: 'architecture-réelle-sur-vm', id: 'fig-2', fichier: 'ORION-DEPLOIEMENT-VM.svg', titre: 'Architecture réelle sur VM — vue complète' },
  { ancre: 'vue-simplifiée-de-la-cible', id: 'fig-3', fichier: 'ORION-CIBLE-VUE-SIMPLIFIEE.svg', titre: 'Architecture cible sur le C1NP — vue simplifiée' },
  { ancre: 'vue-détaillée-de-la-cible', id: 'fig-4', fichier: 'ORION-CIBLE-C1NP.svg', titre: 'Architecture cible sur le C1NP — vue détaillée' },
].map((f, i) => ({ ...f, numero: i + 1 }));

// --- Markdown → HTML (sous-ensemble employé par le DAT) ---------------------------
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
type Titre = { niveau: number; id: string; texte: string };
const titres: Titre[] = [];
const idsSections = new Set<string>();

function inline(s: string): string {
  const codes: string[] = [];
  let h = s.replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(`<code>${esc(c)}</code>`) - 1}\u0000`);
  h = esc(h);
  h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, url: string) => {
    const fig = figures.find((f) => url.endsWith(`#${f.ancre}`) && url.includes('02-DIAGRAMMES'));
    if (fig) return `<a href="#${fig.id}">${t} (figure ${fig.numero})</a>`;
    return `<a class="ext" href="${url}">${t}</a>`;
  });
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/(?<!§)§ (\d+(?:\.\d+)?)/g, (m, n) => (idsSections.has(`s-${n.replace('.', '-')}`) ? `<a href="#s-${n.replace('.', '-')}">${m}</a>` : m));
  return h.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[+i]);
}

function tableau(lignes: string[]): string {
  const cells = (l: string) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  const entete = cells(lignes[0]);
  const align = cells(lignes[1]).map((c) => (c.endsWith(':') ? ' class="num"' : ''));
  const td = (c: string, i: number) => (align[i] && c.length > 24 ? ' class="num long"' : align[i]);
  const corps = lignes.slice(2).map((l) => `<tr>${cells(l).map((c, i) => `<td${td(c, i)}>${inline(c)}</td>`).join('')}</tr>`);
  return `<table><thead><tr>${entete.map((c, i) => `<th${align[i]}>${inline(c)}</th>`).join('')}</tr></thead><tbody>${corps.join('')}</tbody></table>`;
}

function figure(f: (typeof figures)[number]): string {
  return `<section class="figure" id="${f.id}"><div class="cadre"><img src="${svgData(`${ASSETS}/${f.fichier}`)}" alt="${esc(f.titre)}"></div><h3 class="legende"><span>Figure ${f.numero}</span> – ${esc(f.titre)}</h3></section>`;
}

// Titre, date et périmètre vont sur la page de garde.
const lignes = md.split('\n');
const meta = (cle: string) => lignes.find((l) => l.startsWith(`**${cle} :**`))?.replace(/^\*\*[^*]+\*\*\s*/, '') ?? '';
const dateReference = meta('Date de référence');
const perimetre = meta('Périmètre');
const corpsMd = lignes.filter((l) => !l.startsWith('# ') && !l.startsWith('**Date de référence') && !l.startsWith('**Périmètre'));

// Premier passage : identifiants des sections, pour lier les « § n.n ».
for (const l of corpsMd) {
  const m = /^(#{2,3}) (\d+(?:\.\d+)?)\.? /.exec(l);
  if (m) idsSections.add(`s-${m[2].replace('.', '-')}`);
}

const numero = (n: string) => (n.includes('.') ? n : n.padStart(2, '0'));

function rendre(): string {
  const html: string[] = [];
  let parent = '';
  let n4 = 0;
  // Schémas en paysage regroupés en fin de chapitre, pour ne pas laisser de page presque vide dans le texte.
  let enAttente: string[] = [];
  const vider = () => { html.push(...enAttente); enAttente = []; };
  for (let i = 0; i < corpsMd.length; ) {
    const l = corpsMd[i];
    if (!l.trim()) { i++; continue; }
    const h = /^(#{2,4}) (.+)$/.exec(l);
    if (h) {
      const niveau = h[1].length;
      const texte = h[2];
      if (niveau === 2) vider();
      const num = /^(\d+(?:\.\d+)?)\.? /.exec(texte)?.[1];
      let id: string;
      if (niveau <= 3 && num) { id = `s-${num.replace('.', '-')}`; parent = id; n4 = 0; } else id = `${parent}-${++n4}`;
      titres.push({ niveau, id, texte });
      const affiche = num ? `<span class="num">${numero(num)}</span> ${inline(texte.slice(num.length).replace(/^\.?\s*/, ''))}` : inline(texte);
      const titre = `<h${niveau} id="${id}">${affiche}</h${niveau}>`;
      html.push(niveau === 2 && num ? `<div class="chapitre">${titre}</div>` : titre);
      i++;
      continue;
    }
    if (l.startsWith('|')) {
      const bloc: string[] = [];
      while (i < corpsMd.length && corpsMd[i].startsWith('|')) bloc.push(corpsMd[i++]);
      html.push(tableau(bloc));
      continue;
    }
    if (/^(- |\d+\. )/.test(l)) {
      const ordonnee = /^\d+\. /.test(l);
      const items: string[] = [];
      while (i < corpsMd.length && /^(- |\d+\. )/.test(corpsMd[i])) items.push(corpsMd[i++].replace(/^(- |\d+\. )/, ''));
      const tag = ordonnee ? 'ol' : 'ul';
      html.push(`<${tag}>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</${tag}>`);
      continue;
    }
    const para: string[] = [];
    while (i < corpsMd.length && corpsMd[i].trim() && !/^(#|\||- |\d+\. )/.test(corpsMd[i])) para.push(corpsMd[i++]);
    const texte = para.join(' ');
    html.push(/^\*\*[^*]+\*\*$/.test(texte) ? `<p class="intertitre">${inline(texte)}</p>` : `<p>${inline(texte)}</p>`);
    for (const f of figures) if (texte.includes(`#${f.ancre})`)) enAttente.push(figure(f));
  }
  vider();
  return html.join('\n');
}
const corps = rendre();

// --- Page complète -------------------------------------------------------------
function sommaire(pages: Map<string, number>): string {
  const entree = (id: string, niveau: number, texte: string) => {
    const num = /^(\d+(?:\.\d+)?)\.? /.exec(texte)?.[1];
    const libelle = num ? `<span class="num">${numero(num)}</span> ${inline(texte.slice(num.length).replace(/^\.?\s*/, ''))}` : inline(texte);
    return `<li class="n${niveau}"><a href="#${id}"><span class="lib">${libelle}</span><span class="pts"></span><span class="pg">${pages.get(id) ?? '00'}</span></a></li>`;
  };
  const items = titres.map((t) => entree(t.id, t.niveau, t.texte));
  const figs = figures.map((f) => entree(f.id, 3, `Figure ${f.numero} – ${f.titre}`));
  return `<section class="sommaire" id="sommaire"><h2 class="titre-sommaire">Sommaire</h2><ol>${items.join('')}</ol><h3 class="titre-figures">Schémas d’architecture</h3><ol>${figs.join('')}</ol></section>`;
}

// Édition du livrable : première édition remise, distincte des versions de travail du registre.
const EDITION = '1.0';
const versionTexte = `Version ${EDITION} — ${dateFr(derniere.date)}`;
// Charte commune aux livrables (DSE) : encre #17243B, gris #5B6475, Bleu Orion, Segoe UI ; titres de chapitre sans bandeau.
const css = `
:root { --nuit:#040b1e; --encre:#17243b; --gris:#5b6475; --bleu:#2563eb; --lumiere:#3b82f6; --ciel:#93c5fd; --ink:#17243b; --ink2:#5b6475; --trait:rgb(23 36 59/.12); --zebre:#f6f8fc; --teinte:#eef3fe; }
@page { size: A4 portrait; margin: 22mm 18mm 20mm 20mm;
  @top-left { content: "✦  ORION  ·  Dossier d’architecture technique"; font: 500 7.5pt "Segoe UI", "Segoe UI Symbol", system-ui, sans-serif; color: #5b6475; vertical-align: bottom; padding-bottom: 4mm; }
  @top-right { content: "${versionTexte}"; font: 500 7.5pt "Segoe UI", system-ui, sans-serif; color: #5b6475; vertical-align: bottom; padding-bottom: 4mm; }
  @bottom-right { content: counter(page) " / " counter(pages); font: 600 8pt "Segoe UI", system-ui, sans-serif; color: #2563eb; vertical-align: top; padding-top: 4mm; } }
@page garde { margin: 0; background: #040b1e; @top-left { content: none } @top-right { content: none } @bottom-right { content: none } }
@page paysage { size: A4 landscape; margin: 14mm 10mm 12mm 10mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font: 9.5pt/1.5 "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif; color: var(--ink); hyphens: auto; }
a { color: var(--bleu); text-decoration: none; }
code { font: 8.4pt/1.3 Consolas, "SF Mono", ui-monospace, monospace; color: #1e3a8a; background: var(--teinte); padding: .5pt 2.5pt; border-radius: 3px; hyphens: none; overflow-wrap: anywhere; }
p { margin: 0 0 7pt; text-align: justify; orphans: 3; widows: 3; }
strong { font-weight: 650; }
ul, ol { margin: 0 0 8pt; padding-left: 14pt; }
li { margin: 0 0 3pt; text-align: justify; }
ul li::marker { color: var(--bleu); }
ol li::marker { color: var(--bleu); font-weight: 650; }
h2, h3, h4 { font-family: "Segoe UI Variable Display", "Segoe UI", system-ui, sans-serif; break-after: avoid; color: var(--encre); }
.chapitre { break-before: page; break-after: avoid; }
h2 { font-size: 22pt; font-weight: 300; line-height: 1.15; margin: 0 0 14pt; padding-bottom: 7pt; border-bottom: 1.5pt solid var(--bleu); letter-spacing: -.005em; }
h2 .num { color: var(--bleu); margin-right: 5pt; }
h3 { font-size: 13pt; font-weight: 500; margin: 16pt 0 7pt; padding-bottom: 3pt; border-bottom: .6pt solid var(--trait); }
h3 .num { color: var(--bleu); margin-right: 3pt; }
h4 { font-size: 11pt; font-weight: 600; margin: 12pt 0 5pt; color: var(--bleu); }
.intertitre { margin-top: 10pt; break-after: avoid; }
table { width: 100%; border-collapse: collapse; margin: 4pt 0 11pt; font-size: 8.5pt; line-height: 1.4; }
thead { display: table-header-group; }
th { background: var(--encre); color: #fff; font-weight: 600; font-size: 7.2pt; letter-spacing: .08em; text-transform: uppercase; text-align: left; padding: 5pt 5pt 4pt; vertical-align: bottom; border-bottom: 1.2pt solid var(--bleu); }
td { padding: 4pt 5pt; border-bottom: .6pt solid var(--trait); vertical-align: top; }
tbody tr:nth-child(even) td { background: var(--zebre); }
tr { break-inside: avoid; }
table, ol, p { break-inside: avoid; }
p:has(+ ul, + ol, + table) { break-after: avoid; }
td.num, th.num { text-align: right; white-space: nowrap; }
th.num { white-space: normal; }
td.long { white-space: normal; }
td:first-child { hyphens: manual; }
td code { font-size: 7.9pt; }

/* Page de garde : constellation d’Orion, logo officiel, définition du sigle, équipe */
.garde { page: garde; width: 100vw; height: 100vh; position: relative; overflow: hidden; color: #fff;
  background: radial-gradient(110mm 90mm at 78% 18%, rgb(37 99 235/.38), transparent 70%), radial-gradient(150mm 120mm at 0% 100%, rgb(37 99 235/.22), transparent 70%), linear-gradient(170deg, #0b1a3c 0%, #050d24 55%, #040b1e 100%); }
.garde .ciel { position: absolute; inset: 0; width: 100%; height: 100%; }
.garde .haut { position: absolute; left: 22mm; right: 22mm; top: 16mm; font: 600 7.5pt "Segoe UI", sans-serif; letter-spacing: .26em; text-transform: uppercase; color: rgb(255 255 255/.85); }
.garde .haut span { color: rgb(255 255 255/.45); margin-left: 3mm; }
.garde .bloc { position: absolute; left: 22mm; right: 22mm; top: 62mm; }
.garde .logo { width: 74mm; display: block; margin-left: -2mm; }
.garde .definition { margin: 4mm 0 9mm; font: 600 7.6pt "Segoe UI", sans-serif; letter-spacing: .2em; text-transform: uppercase; color: var(--lumiere); text-align: left; }
.garde .trait { width: 16mm; height: .9mm; border-radius: 1mm; background: var(--lumiere); box-shadow: 0 0 4mm rgb(59 130 246/.8); margin-bottom: 8mm; }
.garde .h1 { font: 650 31pt/1.1 "Segoe UI Variable Display", "Segoe UI", sans-serif; margin: 0 0 4mm; letter-spacing: -.015em; }
.garde .sous { font: 300 12pt/1.45 "Segoe UI", sans-serif; color: rgb(255 255 255/.72); margin: 0; max-width: 140mm; text-align: left; }
.garde .equipe { position: absolute; left: 22mm; right: 22mm; bottom: 66mm; }
.garde .equipe .titre { font: 600 7.5pt "Segoe UI", sans-serif; letter-spacing: .26em; text-transform: uppercase; color: var(--ciel); margin-bottom: 3.5mm; }
.garde .equipe ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 1.8mm; }
.garde .equipe li { margin: 0; font-size: 10pt; color: #fff; text-align: left; }
.garde .equipe .grade { display: inline-block; min-width: 11mm; font-weight: 700; color: var(--ciel); font-size: 8.5pt; letter-spacing: .08em; }
.garde .equipe .nom { font-weight: 650; letter-spacing: .02em; }
.garde .cartouche { position: absolute; left: 22mm; right: 22mm; bottom: 26mm; display: grid; grid-template-columns: 1fr .7fr 1.2fr 1.2fr; gap: 4mm; padding: 5mm 6mm; border-radius: 4mm;
  background: linear-gradient(145deg, rgb(255 255 255/.10), rgb(255 255 255/.03)); border: .5pt solid rgb(255 255 255/.22); }
.garde .cartouche div { font: 600 6.5pt "Segoe UI", sans-serif; letter-spacing: .2em; text-transform: uppercase; color: var(--ciel); }
.garde .cartouche b { display: block; margin-top: 1.8mm; font: 600 10pt "Segoe UI", sans-serif; letter-spacing: 0; text-transform: none; color: #fff; }
.garde .bas { position: absolute; left: 22mm; right: 22mm; bottom: 13mm; display: flex; justify-content: space-between; font: 500 6.5pt "Segoe UI", sans-serif; letter-spacing: .2em; text-transform: uppercase; color: rgb(255 255 255/.45); }

/* Fiche du document */
.fiche { break-before: page; }
.fiche .sous-titre { margin: 16pt 0 5pt; }
.fiche td:first-child { width: 28%; font-weight: 600; }

/* Sommaire */
.sommaire { break-before: page; line-height: 1.42; }
.sommaire h2 { margin-bottom: 8pt; }
.sommaire ol { list-style: none; padding: 0; margin: 0 0 8pt; }
.sommaire li { margin: 0; break-inside: avoid; text-align: left; }
.sommaire a { display: flex; align-items: baseline; color: var(--ink); }
.sommaire .lib { flex: none; max-width: 88%; }
.sommaire .pts { flex: 1; border-bottom: .8pt dotted rgb(23 36 59/.3); margin: 0 4pt; transform: translateY(-2.5pt); }
.sommaire .pg { flex: none; min-width: 14pt; text-align: right; font-variant-numeric: tabular-nums; color: var(--bleu); font-weight: 600; }
.sommaire .num { color: var(--bleu); display: inline-block; min-width: 17pt; font-weight: 600; }
.sommaire .n2 { font-size: 10.5pt; font-weight: 600; margin-top: 5pt; }
.sommaire .n3 { font-size: 9.5pt; padding-left: 17pt; margin-top: 1pt; }
.sommaire .n4 { font-size: 8.8pt; padding-left: 34pt; color: var(--ink2); line-height: 1.38; }
.sommaire .n4 a { color: var(--ink2); }
.titre-figures { margin-top: 10pt; }

/* Schémas en paysage, légende sous le schéma */
.figure { page: paysage; break-before: page; break-after: page; height: 184mm; display: flex; flex-direction: column; }
.figure .cadre { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; }
.figure img { max-width: 100%; max-height: 100%; }
.figure .legende { flex: none; margin: 3mm 0 0; padding: 0; border: 0; text-align: center; font: 400 9pt "Segoe UI", sans-serif; color: var(--gris); }
.figure .legende span { color: var(--bleu); font-weight: 600; letter-spacing: .12em; }
`;

// Équipe : par grade (du plus élevé au moins élevé), puis par ordre alphabétique des noms.
const GRADES = ['SCH', 'SGT'];
const equipe = [
  { grade: 'SCH', nom: 'BAELDE', prenom: 'Pierre-Louis' },
  { grade: 'SCH', nom: 'VILBERT-TAHON', prenom: 'Alexandre' },
  { grade: 'SGT', nom: 'LE MAITRE', prenom: 'Louis' },
  { grade: 'SGT', nom: 'PHOMMAVONGSA', prenom: 'Sacha' },
  { grade: 'SGT', nom: 'BONEY', prenom: 'Brandon' },
].sort((a, b) => GRADES.indexOf(a.grade) - GRADES.indexOf(b.grade) || a.nom.localeCompare(b.nom, 'fr'));
const definition = 'Outil de Recensement, d’Intervention et d’Observation Numérique';

// Ciel de la page de garde (millimètres) : constellation d’Orion et poussière d’étoiles, tirage fixe.
function ciel(): string {
  const etoiles: [number, number, number, string][] = [
    [140, 34, 2.2, '#ffb46b'], [162, 20, 1.5, '#dbeafe'], [184, 45, 1.5, '#dbeafe'], [154, 86, 1.3, '#dbeafe'],
    [162, 81, 1.3, '#dbeafe'], [170, 76, 1.3, '#dbeafe'], [143, 118, 1.3, '#dbeafe'], [186, 112, 2.4, '#bfdbfe'],
  ];
  const liens = [[0, 1], [1, 2], [0, 3], [3, 4], [4, 5], [2, 5], [3, 6], [5, 7]];
  let graine = 7;
  const alea = () => ((graine = (graine * 16807) % 2147483647) / 2147483647);
  const poussiere = Array.from({ length: 170 }, () => `<circle cx="${(alea() * 210).toFixed(1)}" cy="${(alea() * 297).toFixed(1)}" r="${(0.12 + alea() * 0.3).toFixed(2)}" fill="#fff" opacity="${(0.15 + alea() * 0.55).toFixed(2)}"/>`).join('');
  const branche = (x: number, y: number, t: number, c: string) => `<path transform="translate(${x - t} ${y - t}) scale(${t / 20})" fill="${c}" d="M20 0C21.5 13 27 18.5 40 20C27 21.5 21.5 27 20 40C18.5 27 13 21.5 0 20C13 18.5 18.5 13 20 0Z"/>`;
  return `<svg class="ciel" viewBox="0 0 210 297" preserveAspectRatio="xMidYMid slice"><defs>
<radialGradient id="halo"><stop offset="0" stop-color="#93c5fd" stop-opacity=".75"/><stop offset="1" stop-color="#2563eb" stop-opacity="0"/></radialGradient>
<radialGradient id="halo-o"><stop offset="0" stop-color="#ffb46b" stop-opacity=".8"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient></defs>
${poussiere}
${liens.map(([a, b]) => `<line x1="${etoiles[a][0]}" y1="${etoiles[a][1]}" x2="${etoiles[b][0]}" y2="${etoiles[b][1]}" stroke="#bfdbfe" stroke-opacity=".32" stroke-width=".22"/>`).join('')}
${etoiles.map(([x, y, t, c], i) => `<circle cx="${x}" cy="${y}" r="${t * 3.2}" fill="url(#${i === 0 ? 'halo-o' : 'halo'})"/>${branche(x, y, t, c)}`).join('')}
</svg>`;
}

function fiche(): string {
  const lignes = [
    ['Projet', `ORION – ${definition}`], ['Commanditaire', 'DRHAT / PFORM – écoles de formation'], ['Référence', 'ORION-DAT'],
    ['Version', `${EDITION} du ${dateFr(derniere.date)}`], ['Date de référence', esc(dateReference)], ['Rédaction', 'Équipe ASTER'],
    ['Diffusion', 'Client et cadres évaluateurs'], ['Périmètre', inline(perimetre.charAt(0).toUpperCase() + perimetre.slice(1))],
  ];
  const t = (entete: string[], corps: string[][]) => `<table><thead><tr>${entete.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${corps.map((l) => `<tr>${l.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  return `<section class="fiche"><h2 class="titre-fiche">Fiche du document</h2>
${t(['Rubrique', 'Valeur'], lignes)}
<h3 class="sous-titre">Suivi des versions</h3>
${t(['Version', 'Date', 'Auteur', 'Objet'], [[EDITION, new Date(`${derniere.date}T12:00:00`).toLocaleDateString('fr-FR'), 'Équipe ASTER', 'Première édition : architecture réelle sur VM et architecture cible sur le C1NP.']])}</section>`;
}

const page = (pages: Map<string, number>) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>ORION — Dossier d’architecture technique</title><style>${css}</style></head><body>
<section class="garde">${ciel()}
<div class="haut">DRHAT / PFORM<span>·  Écoles de formation</span></div>
<div class="bloc"><img class="logo" src="${logo}" alt="ORION"><div class="definition">${definition}</div><div class="trait"></div>
<div class="h1">Dossier d’architecture<br>technique</div>
<p class="sous">Architecture réelle du démonstrateur sur VM et architecture cible sur le C1NP</p></div>
<div class="equipe"><div class="titre">Équipe ASTER</div><ul>${equipe.map((m) => `<li><span class="grade">${m.grade}</span><span class="nom">${esc(m.nom)}</span> ${esc(m.prenom)}</li>`).join('')}</ul></div>
<div class="cartouche"><div>Référence<b>ORION-DAT</b></div><div>Version<b>${EDITION}</b></div><div>Mise à jour<b>${dateFr(derniere.date)}</b></div><div>Date de référence<b>${esc(dateReference)}</b></div></div>
<div class="bas"><span>Projet ORION</span><span>Diffusion : client et cadres évaluateurs</span></div></section>
${fiche()}
${sommaire(pages)}
${corps}
</body></html>`;

// --- Pagination : numéros de page lus dans les destinations du PDF -------------
function pagesDesAncres(pdf: Buffer): Map<string, number> {
  const src = pdf.toString('latin1');
  const objets = new Map<string, string>();
  for (const m of src.matchAll(/(\d+) 0 obj\s*([\s\S]*?)endobj/g)) objets.set(m[1], m[2]);
  // Flux d'objets éventuels
  for (const corps of [...objets.values()]) {
    if (!/\/Type\s*\/ObjStm/.test(corps)) continue;
    const n = +/\/N (\d+)/.exec(corps)![1], first = +/\/First (\d+)/.exec(corps)![1];
    const deb = corps.indexOf('stream') + 6 + (corps[corps.indexOf('stream') + 6] === '\r' ? 2 : 1);
    const data = inflateSync(Buffer.from(corps.slice(deb, corps.lastIndexOf('endstream')), 'latin1')).toString('latin1');
    const ent = data.slice(0, first).trim().split(/\s+/).map(Number);
    for (let k = 0; k < n; k++) objets.set(String(ent[2 * k]), data.slice(first + ent[2 * k + 1], k + 1 < n ? first + ent[2 * k + 3] : undefined));
  }
  const ordre: string[] = [];
  const parcourir = (id: string) => {
    const o = objets.get(id)!;
    if (/\/Type\s*\/Pages/.test(o)) for (const k of /\/Kids\s*\[([^\]]*)\]/.exec(o)![1].matchAll(/(\d+) 0 R/g)) parcourir(k[1]);
    else ordre.push(id);
  };
  const catalogue = [...objets.values()].find((o) => /\/Type\s*\/Catalog/.test(o))!;
  parcourir(/\/Pages (\d+) 0 R/.exec(catalogue)![1]);
  const res = new Map<string, number>();
  // Destinations nommées de Chromium : /Dests << /ancre [page 0 R /XYZ x y 0] … >>
  const dests = objets.get(/\/Dests (\d+) 0 R/.exec(catalogue)?.[1] ?? '') ?? '';
  const nom = (s: string) => s.replace(/#([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  for (const m of dests.matchAll(/\/([^\s/[\]<>()]+)\s*\[\s*(\d+) 0 R\s*\/XYZ/g)) res.set(Buffer.from(nom(m[1]), 'latin1').toString('utf8'), ordre.indexOf(m[2]) + 1);
  return res;
}

const navigateur = await chromium.launch();
const onglet = await navigateur.newPage();
async function imprimer(pages: Map<string, number>): Promise<Buffer> {
  await onglet.setContent(page(pages), { waitUntil: 'load' });
  return onglet.pdf({ preferCSSPageSize: true, printBackground: true, outline: true, tagged: true });
}
let pages = new Map<string, number>();
let pdf = await imprimer(pages);
for (let passe = 0; passe < 3; passe++) {
  const lues = pagesDesAncres(pdf);
  const manquantes = [...titres.map((t) => t.id), ...figures.map((f) => f.id)].filter((id) => !lues.has(id));
  if (manquantes.length) throw new Error(`Ancres absentes du PDF : ${manquantes.join(', ')}`);
  if ([...lues].every(([k, v]) => pages.get(k) === v)) break;
  pages = lues;
  pdf = await imprimer(pages);
}
await navigateur.close();
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, pdf);
console.log(`${out} : ${titres.length} titres, ${figures.length} schémas, version ${EDITION}`);
