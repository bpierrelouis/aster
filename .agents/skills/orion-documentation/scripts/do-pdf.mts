// Produit le livrable PDF du dossier d'organisation (DO), aux couleurs de la charte ORION, depuis la racine du dépôt :
//   node .agents/skills/orion-documentation/scripts/do-pdf.mts [livrables/DO-ORION/DO-ORION.pdf]
// Sources : docs/04-ORGANISATION/05-DOSSIER-ORGANISATION.md (texte), les graphiques SVG qu'il cite (docs/04-ORGANISATION/assets/)
// et les documents listés sous « Annexes » (annexes A, B…). Un paragraphe « *Tableau – titre* » titre et numérote le tableau
// qui le suit. Éléments communs : livrable-pdf.mts.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import {
  COMMANDITAIRE, DEFINITION, DIFFUSION, css, dateCourte, dateFr, derniereVersion, documentHtml, esc, fiche, garde, imprimerPdf,
  inline as inlineMd, lireMarkdown, numero, sommaire, svgData, tableau, tableauSimple, type Entree, type Titre,
} from './livrable-pdf.mts';

const out = resolve(process.argv[2] ?? 'livrables/DO-ORION/DO-ORION.pdf');
const DO = 'docs/04-ORGANISATION/05-DOSSIER-ORGANISATION.md';
const EDITION = '1.0';
const TITRE = 'Dossier d’organisation';
const registre = JSON.parse(readFileSync('archive/registre.json', 'utf8'));
const dateEdition = registre[DO] ? derniereVersion(DO).date : new Date().toISOString().slice(0, 10);

// Annexes : documents listés sous « ## Annexes ».
const { lignes: lignesDo } = lireMarkdown(DO);
const debutAnnexes = lignesDo.indexOf('## Annexes');
const annexes = lignesDo.slice(debutAnnexes + 1).map((l) => /^- \[([^\]]+)\]\(([^)]+)\)(?: : (.+))?$/.exec(l)).filter((m) => m)
  .map((m, i) => ({ lettre: String.fromCharCode(65 + i), titre: m![1], fichier: relative('.', resolve(dirname(DO), m![2])).replace(/\\/g, '/'), contenu: m![3] ?? '' }));

type Figure = { id: string; numero: number; legende: string; html: string };
const figures: Figure[] = [];
const figuresFichiers = new Map<string, Figure>();
const tableaux: Entree[] = [];
const titres: Titre[] = [];
const ids = new Set<string>();
const sections = new Set<string>();

/** Graphique SVG cité : une figure en paysage, une seule fois par fichier */
function figureImage(fichier: string, legende: string): Figure {
  const existante = figuresFichiers.get(fichier);
  if (existante) return existante;
  const f: Figure = { id: `fig-${figures.length + 1}`, numero: figures.length + 1, legende, html: '' };
  f.html = `<section class="figure" id="${f.id}"><div class="cadre"><img src="${svgData(fichier)}" alt="${esc(legende)}"></div><p class="legende"><span>Figure ${f.numero}</span> – ${esc(legende)}</p></section>`;
  figures.push(f);
  figuresFichiers.set(fichier, f);
  return f;
}

/** Liens : annexes → ancres internes, graphiques → figures, « § n.n » du corps → section, autres fichiers du dépôt → texte seul */
function lienDepuis(fichier: string, corps: boolean) {
  return (t: string, url: string): string => {
    if (/^https?:/.test(url)) return `<a href="${esc(url)}">${t}</a>`;
    const [chemin, ancre] = url.split('#');
    const cible = chemin ? relative('.', resolve(dirname(fichier), chemin)).replace(/\\/g, '/') : fichier;
    if (/\.svg$/.test(cible)) { const f = figureImage(cible, t); return `<a href="#${f.id}">${t}</a> (figure ${f.numero})`; }
    const annexe = annexes.find((a) => a.fichier === cible);
    if (annexe) return `<a href="#annexe-${annexe.lettre.toLowerCase()}">${t}</a>${ancre ? '' : ''}`;
    return corps && !chemin && ancre ? `<a href="#${ancre}">${t}</a>` : t;
  };
}
const liensSections = (html: string) => html.split(/(<a\b[\s\S]*?<\/a>|<[^>]+>)/)
  .map((s, i) => (i % 2 ? s : s.replace(/§ (\d+\.\d+)/g, (m, n) => (sections.has(n) ? `<a href="#s-${n.replace('.', '-')}">${m}</a>` : m)))).join('');
const inlineDe = (fichier: string, corps: boolean) => (s: string) => {
  const h = inlineMd(s, lienDepuis(fichier, corps));
  return corps ? liensSections(h) : h;
};

const legendeTableau = (titre: string) => {
  const n = tableaux.length + 1;
  tableaux.push({ id: `tab-${n}`, html: `Tableau ${n} – ${esc(titre)}` });
  return `<p class="legende legende-tableau" id="tab-${n}"><span>Tableau ${n}</span> – ${esc(titre)}</p>`;
};

type Options = { fichier: string; decalage: number; annexe?: string; html: string[] };
/** Convertit des lignes Markdown ; `decalage` abaisse les titres (annexes), `annexe` préfixe leur numéro */
function convertir(lignes: string[], o: Options) {
  const inline = inlineDe(o.fichier, !o.annexe);
  let parent = '';
  let n = 0;
  let legende = '';
  let enAttente: Figure[] = []; // graphiques placés en fin de chapitre
  const vider = () => { for (const f of enAttente) o.html.push(f.html); enAttente = []; };
  for (let i = 0; i < lignes.length; ) {
    const l = lignes[i];
    if (!l.trim()) { i++; continue; }
    const h = /^(#{2,4}) (.+)$/.exec(l);
    if (h) {
      const niveau = h[1].length + o.decalage;
      const texte = h[2];
      if (niveau === 2) vider();
      const num = /^(\d+(?:\.\d+)?)\.? /.exec(texte)?.[1];
      let id: string;
      let affiche = inline(texte);
      if (o.annexe && niveau === 3 && num) { id = `annexe-${o.annexe.toLowerCase()}-${num}`; affiche = `<span class="num">${o.annexe}.${num}</span> ${inline(texte.slice(num.length).replace(/^\.?\s*/, ''))}`; }
      else if (!o.annexe && num) { id = `s-${num.replace('.', '-')}`; affiche = `<span class="num">${numero(num)}</span> ${inline(texte.slice(num.length).replace(/^\.?\s*/, ''))}`; }
      else id = `${parent || o.annexe?.toLowerCase() || 's'}-${++n}`;
      if (niveau <= 3) parent = id;
      if (ids.has(id)) id = `${id}-${++n}`;
      ids.add(id);
      if (niveau <= (o.annexe ? 3 : 4)) titres.push({ niveau, id, html: affiche });
      o.html.push(niveau === 2 ? `<div class="chapitre"><h2 id="${id}">${affiche}</h2></div>` : `<h${niveau} id="${id}">${affiche}</h${niveau}>`);
      i++;
      continue;
    }
    if (l.startsWith('|')) {
      const bloc: string[] = [];
      while (i < lignes.length && lignes[i].startsWith('|')) bloc.push(lignes[i++]);
      o.html.push((legende ? legendeTableau(legende) : '') + tableau(bloc, inline));
      legende = '';
      continue;
    }
    const image = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(l.trim());
    if (image) {
      const f = figureImage(relative('.', resolve(dirname(o.fichier), image[2])).replace(/\\/g, '/'), image[1]);
      if (!enAttente.includes(f) && !o.html.includes(f.html)) enAttente.push(f);
      i++;
      continue;
    }
    if (/^(- |\d+\. )/.test(l)) {
      const ordonnee = /^\d+\. /.test(l);
      const items: string[] = [];
      while (i < lignes.length && /^(- |\d+\. )/.test(lignes[i])) items.push(lignes[i++].replace(/^(- |\d+\. )/, ''));
      const tag = ordonnee ? 'ol' : 'ul';
      o.html.push(`<${tag}>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</${tag}>`);
      continue;
    }
    const para: string[] = [];
    while (i < lignes.length && lignes[i].trim() && !/^(#|\||- |\d+\. |!\[)/.test(lignes[i])) para.push(lignes[i++]);
    const texte = para.join(' ');
    const t = /^\*Tableau – (.+)\*$/.exec(texte);
    if (t) { legende = t[1]; continue; }
    o.html.push(/^\*\*[^*]+\*\*$/.test(texte) ? `<p class="intertitre">${inline(texte)}</p>` : `<p>${inline(texte)}</p>`);
  }
  vider();
}

// Corps : chapitres du DO (le paragraphe d'en-tête, avant le premier chapitre, décrit la source et n'est pas repris).
const corps: string[] = [];
const chapitres = lignesDo.slice(lignesDo.findIndex((l) => l.startsWith('## ')), debutAnnexes);
for (const l of chapitres) { const m = /^### (\d+\.\d+) /.exec(l); if (m) sections.add(m[1]); }
convertir(chapitres, { fichier: DO, decalage: 0, html: corps });

// Annexes : page de présentation, puis un chapitre par document (titres abaissés d'un niveau).
titres.push({ niveau: 2, id: 'annexes', html: 'Annexes' });
corps.push(`<div class="chapitre"><h2 id="annexes">Annexes</h2></div>${tableauSimple(['Annexe', 'Document', 'Contenu'],
  annexes.map((a) => [a.lettre, `<a href="#annexe-${a.lettre.toLowerCase()}">${esc(a.titre)}</a>`, inlineDe(DO, true)(a.contenu)]))}`);
for (const a of annexes) {
  const id = `annexe-${a.lettre.toLowerCase()}`;
  const titre = `<span class="num">${a.lettre}</span> ${esc(a.titre)}`;
  titres.push({ niveau: 2, id, html: titre });
  ids.add(id);
  corps.push(`<div class="chapitre annexe"><h2 id="${id}">${titre}</h2></div>`);
  // Les paragraphes d'en-tête en gras (période, version préparée) décrivent le document source ; ils sont repris tels quels.
  convertir(lireMarkdown(a.fichier).lignes, { fichier: a.fichier, decalage: 1, annexe: a.lettre, html: corps });
}

// --- Page complète ---------------------------------------------------------------------
const style = css(TITRE, `Version ${EDITION} — ${dateFr(dateEdition)}`) + `
.legende-tableau { text-align: left; margin: 9pt 0 2pt; break-after: avoid; }
h3 .num, h4 .num { white-space: nowrap; }
`;
const page = (pages: Map<string, number>) => documentHtml(TITRE, style, `${garde({
  titre: 'Dossier<br>d’organisation',
  sousTitre: 'Organisation Agile de l’équipe, backlog et son suivi, cérémonies Scrum-XP, journal des échanges et bilan',
  cartouche: [['Référence', 'ORION-DO'], ['Version', EDITION], ['Mise à jour', dateFr(dateEdition)], ['Rédaction', 'Équipe ASTER']],
})}
${fiche([
  ['Projet', `ORION – ${DEFINITION}`], ['Commanditaire', COMMANDITAIRE], ['Référence', 'ORION-DO'],
  ['Version', `${EDITION} du ${dateFr(dateEdition)}`], ['Rédaction', 'Équipe ASTER'], ['Diffusion', DIFFUSION],
  ['Périmètre', `Organisation du projet du 20 octobre au 19 novembre 2026 ; annexes ${annexes[0].lettre} à ${annexes.at(-1)!.lettre}`],
], [[EDITION, dateCourte(dateEdition), 'Équipe ASTER', 'Première édition : organisation, méthode, backlog, suivi, journal et annexes.']])}
${sommaire(pages, titres, [
  { titre: 'Table des figures', entrees: figures.map((f) => ({ id: f.id, html: `Figure ${f.numero} – ${esc(f.legende)}` })) },
  { titre: 'Table des tableaux', entrees: tableaux },
])}
${corps.join('\n')}`);

const pdf = await imprimerPdf(page, [...titres.map((t) => t.id), ...figures.map((f) => f.id), ...tableaux.map((t) => t.id)]);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, pdf);
console.log(`${out} : ${titres.length} titres, ${figures.length} figures, ${tableaux.length} tableaux, ${annexes.length} annexes, version ${EDITION}`);
