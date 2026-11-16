// Produit le livrable PDF du dossier de spécifications des exigences (DSE), aux couleurs de la charte ORION, depuis la racine du dépôt :
//   node .agents/skills/orion-documentation/scripts/dse-pdf.mts [livrables/DSE-ORION/DSE-ORION.pdf]
// Sources : docs/02-ANALYSE/05-DOSSIER-SPECIFICATIONS-EXIGENCES.md (texte), les diagrammes draw.io qu'il cite (rendus en SVG
// par le moteur officiel draw.io, version épinglée, téléchargé une fois dans le dossier temporaire), les fiches descriptives et
// les règles de gestion (tableaux de cas et de règles), et les documents listés sous « Annexes » (annexes A, B…).
// Directives du Markdown : <!-- dse:cas UC-… -->, <!-- dse:catalogue -->, <!-- dse:matrice -->, <!-- dse:repartition-regles -->,
// <!-- dse:regles RG-… -->. Un paragraphe « *Tableau – titre* » titre et numérote le tableau qui le suit.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import {
  COMMANDITAIRE, DEFINITION, DIFFUSION, chromium, css, dataUri, dateCourte, dateFr, derniereVersion, documentHtml, esc, fiche, garde,
  imprimerPdf, inline as inlineMd, lireMarkdown, numero, sommaire, tableau, tableauSimple, type Entree, type Titre,
} from './livrable-pdf.mts';

const out = resolve(process.argv[2] ?? 'livrables/DSE-ORION/DSE-ORION.pdf');
const DSE = 'docs/02-ANALYSE/05-DOSSIER-SPECIFICATIONS-EXIGENCES.md';
const REGLES = 'docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/01-REGLES-DE-GESTION.md';
const FICHES = ['GESTIONNAIRE', 'FORMATEUR', 'ADMINISTRATEUR', 'SUPER-ADMINISTRATEUR']
  .map((p, i) => `docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/${12 + i}-FICHE-DESCRIPTIVE-${p}.md`);
const PROFILS: Record<string, string> = { GEST: 'Gestionnaire', FORM: 'Formateur', ADMIN: 'Administrateur', SADMIN: 'Super administrateur' };
const EDITION = '1.0';
const TITRE = 'Dossier de spécifications des exigences';
const registre = JSON.parse(readFileSync('archive/registre.json', 'utf8'));
const dateEdition = registre[DSE] ? derniereVersion(DSE).date : new Date().toISOString().slice(0, 10);

// Légende des schémas : préfixe par fichier draw.io (sans préfixe : nom de la page).
const PREFIXES: Record<string, string> = {
  '02-DIAGRAMMES-ACTIVITE': 'Activité métier – ', '08-DIAGRAMMES-ACTIVITE-CAS-UTILISATION': 'Activité – ',
  '09-DIAGRAMME-CLASSES-METIER': 'Classes métier – ', '10-DIAGRAMMES-SEQUENCE-SYSTEME': 'Séquence système – ',
  '01-DIAGRAMMES-ETATS': 'États – ', '02-DIAGRAMME-CLASSES-ANALYSE': 'Classes d’analyse – ',
  '01-DIAGRAMME-CLASSES-CONCEPTION': 'Classes de conception – ', '02-DIAGRAMMES-SEQUENCE-DETAILLES': 'Séquence détaillée – ',
  '03-MODELE-PHYSIQUE-DONNEES': 'MPD – ',
};

// --- Rendu des diagrammes draw.io ------------------------------------------------------
// Moteur officiel draw.io (jgraph), version épinglée et empreinte vérifiée ; exécuté localement dans Chromium.
const VIEWER = { url: 'https://cdn.jsdelivr.net/gh/jgraph/drawio@v26.0.9/src/main/webapp/js/viewer-static.min.js', sha256: '517c2c9317f57fcd1475e0f0c92ec1d52f7d0111e2e4f5509ca750ad460555d0' };
function viewer(): string {
  const f = join(tmpdir(), 'orion-drawio', 'viewer-static-26.0.9.min.js');
  if (!existsSync(f)) { mkdirSync(dirname(f), { recursive: true }); execFileSync('curl', ['-sSfL', '-o', f, VIEWER.url]); }
  const js = readFileSync(f);
  if (createHash('sha256').update(js).digest('hex') !== VIEWER.sha256) throw new Error(`Empreinte inattendue pour ${f} : supprimer le fichier et relancer.`);
  return js.toString('utf8');
}

type Schema = { svg: string; w: number; h: number };
async function rendreDrawio(fichiers: string[]): Promise<Map<string, Schema[]>> {
  const navigateur = await chromium().launch();
  const onglet = await navigateur.newPage();
  await onglet.setContent('<!doctype html><html><body></body></html>');
  await onglet.addScriptTag({ content: viewer() });
  const res = new Map<string, Schema[]>();
  for (const f of fichiers) {
    const pages: Schema[] = await onglet.evaluate((xml: string) => {
      const w = window as any;
      const doc = w.mxUtils.parseXml(xml);
      return [...doc.getElementsByTagName('diagram')].map((d: Element) => {
        const div = document.createElement('div'); document.body.appendChild(div);
        const graph = new w.Graph(div);
        // Chaque page est décodée dans son propre document : les identifiants de cellules se répètent d'une page à l'autre.
        const modele = w.mxUtils.parseXml(w.mxUtils.getXml(d.getElementsByTagName('mxGraphModel')[0])).documentElement;
        new w.mxCodec(modele.ownerDocument).decode(modele, graph.getModel());
        // Le titre dessiné dans la page est repris par la légende de la figure.
        const titre = graph.getModel().getCell('titre');
        if (titre) graph.getModel().remove(titre);
        const svg = graph.getSvg('#ffffff', 1, 6, false, null, true, null, null, null, false, false, 'light');
        div.remove();
        return { svg: w.mxUtils.getXml(svg), w: parseFloat(svg.getAttribute('width')), h: parseFloat(svg.getAttribute('height')) };
      });
    }, readFileSync(f, 'utf8'));
    res.set(f, pages);
  }
  await navigateur.close();
  return res;
}

// --- Sources ---------------------------------------------------------------------------
const slug = (s: string) => s.trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s/g, '-');
const tiret = (s: string) => s.replace(/ — /g, ' – ');

/** Diagramme cité : fichier draw.io voisin du lien (.md, .svg ou .drawio) */
function drawioDe(chemin: string): string | undefined {
  const f = chemin.replace(/\.(md|svg|drawio)$/, '.drawio');
  return existsSync(f) ? relative('.', f).replace(/\\/g, '/') : undefined;
}
/** Ancres des pages d'un diagramme : titres « ## » du Markdown, dans l'ordre des pages draw.io */
function ancresPages(drawio: string): string[] {
  const md = drawio.replace(/\.drawio$/, '.md');
  return existsSync(md) ? readFileSync(md, 'utf8').split(/\r?\n/).filter((l) => l.startsWith('## ')).map((l) => slug(l.slice(3))) : [];
}

// Règles de gestion : « - **RG-01 — Titre.** texte », regroupées par thème (« ## n. Thème »).
type Regle = { id: string; titre: string; texte: string };
const themes: { titre: string; regles: Regle[] }[] = [];
for (const l of lireMarkdown(REGLES).lignes) {
  const t = /^## \d+\. (.+)$/.exec(l);
  if (t) themes.push({ titre: t[1], regles: [] });
  const r = /^- \*\*(RG-\d+) — (.+?)\*\* ?(.*)$/.exec(l);
  if (r && themes.length) themes.at(-1)!.regles.push({ id: r[1], titre: r[2].replace(/\.$/, ''), texte: r[3] });
}
const regles = new Map(themes.flatMap((t) => t.regles).map((r) => [r.id, r]));
const rg = (n: number) => `RG-${String(n).padStart(2, '0')}`;
const developper = (liste: string) => [...liste.matchAll(/RG-(\d+)(?: à RG-(\d+))?/g)]
  .flatMap((m) => Array.from({ length: (m[2] ? +m[2] : +m[1]) - +m[1] + 1 }, (_, k) => rg(+m[1] + k)));

// Cas d'utilisation des fiches : code, intitulé et règles de gestion citées.
type Cas = { code: string; intitule: string; regles: string; profil: string };
const cas = new Map<string, Cas>();
for (const f of FICHES) {
  const l = lireMarkdown(f).lignes;
  l.forEach((ligne, i) => {
    const m = /^## (UC-([A-Z]+)-\d+) — (.+)$/.exec(ligne);
    if (!m) return;
    const fin = l.findIndex((x, k) => k > i && x.startsWith('## '));
    const bloc = l.slice(i, fin < 0 ? undefined : fin);
    const k = bloc.indexOf('### Règles de gestion');
    const liste = k < 0 ? '' : bloc.slice(k + 1).find((x) => x.trim()) ?? '';
    cas.set(m[1], { code: m[1], intitule: m[3], regles: liste.replace(/\.$/, ''), profil: PROFILS[m[2]] });
  });
}

// Annexes : documents listés sous « ## Annexes » du DSE.
const { lignes: lignesDse } = lireMarkdown(DSE);
const debutAnnexes = lignesDse.indexOf('## Annexes');
const annexes = lignesDse.slice(debutAnnexes + 1).map((l) => /^- \[([^\]]+)\]\(([^)]+)\)(?: : (.+))?$/.exec(l)).filter((m) => m)
  .map((m, i) => ({ lettre: String.fromCharCode(65 + i), titre: m![1], fichier: relative('.', resolve(dirname(DSE), m![2])).replace(/\\/g, '/'), contenu: m![3] ?? '' }));
const annexeDe = (f: string) => annexes.find((a) => a.fichier === f);

// --- Schémas, figures et tableaux numérotés ------------------------------------------
const diagrammes = new Set<string>();
const collecter = (fichier: string, lignes: string[]) => {
  for (const l of lignes) for (const m of l.matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)) {
    const d = !/^https?:/.test(m[1]) && drawioDe(resolve(dirname(fichier), m[1]));
    if (d) diagrammes.add(d);
  }
};
collecter(DSE, lignesDse.slice(0, debutAnnexes));
for (const a of annexes) collecter(a.fichier, lireMarkdown(a.fichier).lignes);
const schemas = await rendreDrawio([...diagrammes]);

type Figure = { id: string; numero: number; legende: string; html: string };
const figures: Figure[] = [];
const figuresSchemas = new Map<string, Figure>(); // « fichier#page » → figure
const tableaux: Entree[] = [];

function figureSchema(drawio: string, page: number): Figure {
  const cle = `${drawio}#${page}`;
  const existante = figuresSchemas.get(cle);
  if (existante) return existante;
  const s = schemas.get(drawio)![page];
  const nom = /<diagram [^>]*name="([^"]*)"/g;
  const noms = [...readFileSync(drawio, 'utf8').matchAll(nom)].map((m) => m[1].replace(/&apos;|'/g, '’').replace(/&amp;/g, '&'));
  const base = drawio.split('/').at(-1)!.replace(/\.drawio$/, '');
  const legende = tiret((PREFIXES[base] ?? '') + noms[page]);
  // Orientation et taille qui remplissent au mieux la page, sans agrandir le dessin de plus de moitié.
  const mm = 25.4 / 96;
  const [lw, lh, pw, ph] = [277, 170, 190, 252];
  const paysage = Math.min(lw / (s.w * mm), lh / (s.h * mm));
  const portrait = Math.min(pw / (s.w * mm), ph / (s.h * mm));
  const echelle = Math.min(Math.max(paysage, portrait), 1.5);
  const f: Figure = { id: `fig-${figures.length + 1}`, numero: figures.length + 1, legende, html: '' };
  f.html = `<section class="figure${portrait > paysage ? ' portrait' : ''}" id="${f.id}"><div class="cadre"><img style="width:${(s.w * mm * echelle).toFixed(1)}mm" src="data:image/svg+xml;base64,${Buffer.from(s.svg).toString('base64')}" alt="${esc(legende)}"></div><p class="legende"><span>Figure ${f.numero}</span> – ${esc(legende)}</p></section>`;
  figures.push(f);
  figuresSchemas.set(cle, f);
  return f;
}
/** Figures d'un lien vers un diagramme : toutes ses pages, ou la page de l'ancre */
function figuresDuLien(drawio: string, ancre: string | undefined): Figure[] {
  const pages = schemas.get(drawio)!;
  if (!ancre) return pages.map((_, i) => figureSchema(drawio, i));
  const i = ancresPages(drawio).indexOf(decodeURIComponent(ancre));
  if (i < 0) throw new Error(`Ancre introuvable dans ${drawio} : #${ancre}`);
  return [figureSchema(drawio, i)];
}
const renvoi = (fs: Figure[]) => (fs.length === 1 ? `figure ${fs[0].numero}` : `figures ${fs[0].numero} à ${fs.at(-1)!.numero}`);

// --- Conversion du Markdown ------------------------------------------------------------
const titres: Titre[] = [];
const ids = new Set<string>();
const sections = new Set<string>();
let enAttente: Figure[] = []; // schémas placés en fin de chapitre

/** Liens : schémas → figures, documents inclus → ancres internes, autres fichiers du dépôt → texte seul */
function lienDepuis(fichier: string) {
  return (t: string, url: string): string => {
    if (/^https?:/.test(url)) return `<a href="${esc(url)}">${t}</a>`;
    const [chemin, ancre] = url.split('#');
    const cible = chemin ? relative('.', resolve(dirname(fichier), chemin)).replace(/\\/g, '/') : fichier;
    const drawio = chemin && drawioDe(cible);
    if (drawio) {
      const fs = figuresDuLien(drawio, ancre);
      for (const f of fs) if (!enAttente.includes(f) && !document.includes(f.html)) enAttente.push(f);
      return `<a href="#${fs[0].id}">${t}</a> (${renvoi(fs)})`;
    }
    const annexe = annexeDe(cible);
    if (annexe) {
      const id = ancre && /^uc-/.test(ancre) ? ancre.split('--')[0] : `annexe-${annexe.lettre.toLowerCase()}`;
      return `<a href="#${id}">${t}</a>`;
    }
    return t;
  };
}
// Identifiants de règles et de cas → liens internes ; « § n.n » → section.
function liensAuto(html: string): string {
  return html.split(/(<a\b[\s\S]*?<\/a>|<[^>]+>)/).map((s, i) => (i % 2 ? s : s
    .replace(/\b(RG-\d{2,3})\b/g, (m) => (regles.has(m) ? `<a href="#${m.toLowerCase()}">${m}</a>` : m))
    .replace(/\b(UC-(?:GEST|FORM|ADMIN|SADMIN)-\d{2})\b/g, (m) => (cas.has(m) ? `<a href="#${m.toLowerCase()}">${m}</a>` : m))
    .replace(/§ (\d+\.\d+)/g, (m, n) => (sections.has(n) ? `<a href="#s-${n.replace('.', '-')}">${m}</a>` : m)))).join('');
}
const inlineDe = (fichier: string) => (s: string) => liensAuto(inlineMd(s, lienDepuis(fichier)));
let document = '';

const legendeTableau = (titre: string) => {
  const n = tableaux.length + 1;
  tableaux.push({ id: `tab-${n}`, html: `Tableau ${n} – ${esc(titre)}` });
  return `<p class="legende legende-tableau" id="tab-${n}"><span>Tableau ${n}</span> – ${esc(titre)}</p>`;
};

// Directives : tableaux établis depuis les fiches et les règles.
const lienCas = (c: string) => `<a href="#${c.toLowerCase()}">${c}</a>`;
function directive(nom: string, args: string[]): string {
  const i = inlineDe(DSE);
  if (nom === 'cas') return tableauSimple(['Cas d’utilisation', 'Intitulé', 'Acteur principal'], args.map((c) => {
    const u = cas.get(c); if (!u) throw new Error(`Cas inconnu : ${c}`);
    return [lienCas(c), i(u.intitule), u.profil];
  }), 'cas');
  if (nom === 'catalogue') return Object.values(PROFILS).map((p) => {
    const liste = [...cas.values()].filter((u) => u.profil === p);
    const id = `catalogue-${slug(p)}`;
    titres.push({ niveau: 4, id, html: `${p} (${liste.length} cas)` });
    return `<h4 id="${id}">${p} (${liste.length} cas)</h4>${legendeTableau(`Cas d’utilisation – ${p}`)}${tableauSimple(['Code', 'Intitulé', 'Règles de gestion'], liste.map((u) => [lienCas(u.code), i(u.intitule), i(u.regles)]), 'cas')}`;
  }).join('');
  if (nom === 'matrice') {
    const citees = new Set([...cas.values()].flatMap((u) => developper(u.regles)));
    const non = [...regles.keys()].filter((r) => !citees.has(r));
    return `<p>${i(`Les ${cas.size} cas d’utilisation citent ${[...regles.keys()].filter((r) => citees.has(r)).length} des ${regles.size} règles de gestion.${non.length ? ` Règles non citées par une fiche descriptive : ${non.join(', ')} ; elles s’appliquent à travers la matrice des droits, les diagrammes et les autres règles.` : ''}`)}</p>`
      + legendeTableau('Matrice cas d’utilisation – règles de gestion')
      + tableauSimple(['Cas d’utilisation', 'Règles de gestion appliquées'], [...cas.values()].map((u) => [lienCas(u.code), i(u.regles)]), 'cas');
  }
  if (nom === 'repartition-regles') return tableauSimple(['Thème', 'Règles', 'Nombre'], [
    ...themes.map((t) => [esc(t.titre), i(`${t.regles[0].id} à ${t.regles.at(-1)!.id}`), String(t.regles.length)]),
    ['<strong>Total</strong>', '', `<strong>${regles.size}</strong>`],
  ]);
  if (nom === 'regles') return `<ul class="regles">${args.map((r) => {
    const g = regles.get(r); if (!g) throw new Error(`Règle inconnue : ${r}`);
    return `<li><a href="#${r.toLowerCase()}"><strong>${r}</strong></a> <strong>– ${esc(g.titre)}.</strong> ${i(g.texte)}</li>`;
  }).join('')}</ul>`;
  throw new Error(`Directive inconnue : ${nom}`);
}

type Options = { fichier: string; decalage: number; annexe?: string; html: string[] };
/** Convertit des lignes Markdown ; `decalage` abaisse les titres (annexes), `annexe` préfixe leur numéro */
function convertir(lignes: string[], o: Options) {
  const inline = inlineDe(o.fichier);
  let parent = '';
  let n = 0;
  let legende = '';
  const sortie = (h: string) => { o.html.push(h); document += h; };
  const vider = () => { for (const f of enAttente) sortie(f.html); enAttente = []; };
  for (let i = 0; i < lignes.length; ) {
    const l = lignes[i];
    if (!l.trim()) { i++; continue; }
    const h = /^(#{2,4}) (.+)$/.exec(l);
    if (h) {
      const niveau = h[1].length + o.decalage;
      const texte = h[2];
      if (niveau === 3 && o.annexe && texte === 'Sources') { // liste de fichiers du dépôt : non remise
        i++; while (i < lignes.length && !lignes[i].startsWith('## ')) i++;
        continue;
      }
      if (niveau === 2) vider();
      const num = /^(\d+(?:\.\d+)?)\.? /.exec(texte)?.[1];
      const code = /^(UC-[A-Z]+-\d+) — /.exec(texte)?.[1];
      let id: string;
      let affiche = inline(texte);
      if (o.annexe && niveau === 3 && num) { id = `annexe-${o.annexe.toLowerCase()}-${num}`; affiche = `<span class="num">${o.annexe}.${num}</span> ${inline(texte.slice(num.length).replace(/^\.?\s*/, ''))}`; }
      else if (!o.annexe && num) { id = `s-${num.replace('.', '-')}`; affiche = `<span class="num">${numero(num)}</span> ${inline(texte.slice(num.length).replace(/^\.?\s*/, ''))}`; }
      else if (code) { id = code.toLowerCase(); affiche = `<span class="num">${code}</span> ${inline(texte.slice(code.length + 3))}`; }
      else id = `${parent || o.annexe?.toLowerCase() || 's'}-${++n}`;
      if (niveau <= 3) parent = id;
      if (ids.has(id)) id = `${id}-${++n}`;
      ids.add(id);
      if (niveau <= (o.annexe ? 3 : 4)) titres.push({ niveau, id, html: affiche });
      const classe = code ? ' class="cas"' : '';
      sortie(niveau === 2 ? `<div class="chapitre"><h2 id="${id}">${affiche}</h2></div>` : `<h${niveau} id="${id}"${classe}>${affiche}</h${niveau}>`);
      i++;
      continue;
    }
    const d = /^<!-- dse:([a-z-]+)((?: [A-Z0-9-]+)*) -->$/.exec(l.trim());
    if (d) { sortie((legende ? legendeTableau(legende) : '') + directive(d[1], d[2].trim().split(/\s+/).filter(Boolean))); legende = ''; i++; continue; }
    if (l.startsWith('<!--')) { while (i < lignes.length && !lignes[i].includes('-->')) i++; i++; continue; }
    if (l.startsWith('|')) {
      const bloc: string[] = [];
      while (i < lignes.length && lignes[i].startsWith('|')) bloc.push(lignes[i++]);
      sortie((legende ? legendeTableau(legende) : '') + tableau(bloc, inline));
      legende = '';
      continue;
    }
    const image = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(l.trim());
    if (image) {
      const f: Figure = { id: `fig-${figures.length + 1}`, numero: figures.length + 1, legende: `Maquette – ${image[1]}`, html: '' };
      f.html = `<figure class="capture" id="${f.id}"><img src="${dataUri(resolve(dirname(o.fichier), image[2]), 'image/png')}" alt="${esc(image[1])}"><figcaption class="legende"><span>Figure ${f.numero}</span> – ${esc(f.legende)}</figcaption></figure>`;
      figures.push(f);
      sortie(f.html);
      i++;
      continue;
    }
    if (/^(- |\d+\. )/.test(l)) {
      const ordonnee = /^\d+\. /.test(l);
      const items: string[] = [];
      while (i < lignes.length && /^(- |\d+\. )/.test(lignes[i])) items.push(lignes[i++].replace(/^(- |\d+\. )/, ''));
      const tag = ordonnee ? 'ol' : 'ul';
      sortie(`<${tag}>${items.map((t) => {
        const r = /^\*\*(RG-\d+) —/.exec(t)?.[1];
        return `<li${r ? ` id="${r.toLowerCase()}"` : ''}>${inline(t)}</li>`;
      }).join('')}</${tag}>`);
      continue;
    }
    const para: string[] = [];
    while (i < lignes.length && lignes[i].trim() && !/^(#|\||- |\d+\. |!\[|<!--)/.test(lignes[i])) para.push(lignes[i++]);
    const texte = para.join(' ');
    const t = /^\*Tableau – (.+)\*$/.exec(texte);
    if (t) { legende = t[1]; continue; }
    sortie(/^\*\*[^*]+\*\*$/.test(texte) ? `<p class="intertitre">${inline(texte)}</p>` : `<p>${inline(texte)}</p>`);
  }
  vider();
}

// Corps : chapitres du DSE (le paragraphe d'en-tête, avant le premier chapitre, décrit la source et n'est pas repris).
const corps: string[] = [];
const chapitres = lignesDse.slice(lignesDse.findIndex((l) => l.startsWith('## ')), debutAnnexes);
for (const l of chapitres) { const m = /^### (\d+\.\d+) /.exec(l); if (m) sections.add(m[1]); }
convertir(chapitres, { fichier: DSE, decalage: 0, html: corps });

// Annexes : page de présentation, puis un chapitre par document (titres abaissés d'un niveau).
titres.push({ niveau: 2, id: 'annexes', html: 'Annexes' });
const presentation = `<div class="chapitre"><h2 id="annexes">Annexes</h2></div>${tableauSimple(['Annexe', 'Document', 'Contenu'],
  annexes.map((a) => [a.lettre, `<a href="#annexe-${a.lettre.toLowerCase()}">${esc(a.titre)}</a>`, inlineDe(DSE)(a.contenu)]))}`;
corps.push(presentation);
for (const a of annexes) {
  const id = `annexe-${a.lettre.toLowerCase()}`;
  const titre = `<span class="num">${a.lettre}</span> ${esc(a.titre)}`;
  titres.push({ niveau: 2, id, html: titre });
  ids.add(id);
  corps.push(`<div class="chapitre annexe"><h2 id="${id}">${titre}</h2></div>`);
  convertir(lireMarkdown(a.fichier).lignes, { fichier: a.fichier, decalage: 1, annexe: a.lettre, html: corps });
}

// --- Page complète ---------------------------------------------------------------------
const style = css(TITRE, `Version ${EDITION} — ${dateFr(dateEdition)}`) + `
.legende-tableau { text-align: left; margin: 9pt 0 2pt; break-after: avoid; }
.capture { margin: 6pt 0 12pt; break-inside: avoid; text-align: center; }
.capture img { max-width: 100%; max-height: 105mm; border: .6pt solid var(--trait); border-radius: 2pt; }
.capture .legende { margin-top: 2.5mm; }
h3.cas { break-before: page; }
h3 .num, h4 .num { white-space: nowrap; }
table.cas td:first-child { white-space: nowrap; }
.regles li { margin-bottom: 5pt; }
`;
const page = (pages: Map<string, number>) => documentHtml(TITRE, style, `${garde({
  titre: 'Dossier de spécifications<br>des exigences',
  sousTitre: 'Capture du besoin, exigences fonctionnelles et non fonctionnelles, modèles d’analyse et de conception, traçabilité',
  cartouche: [['Référence', 'ORION-DSE'], ['Version', EDITION], ['Mise à jour', dateFr(dateEdition)], ['Rédaction', 'Équipe ASTER']],
})}
${fiche([
  ['Projet', `ORION – ${DEFINITION}`], ['Commanditaire', COMMANDITAIRE], ['Référence', 'ORION-DSE'],
  ['Version', `${EDITION} du ${dateFr(dateEdition)}`], ['Rédaction', 'Équipe ASTER'], ['Diffusion', DIFFUSION],
  ['Périmètre', `Exigences de l’application ORION en production ; annexes ${annexes[0].lettre} à ${annexes.at(-1)!.lettre}`],
], [[EDITION, dateCourte(dateEdition), 'Équipe ASTER', 'Première édition : exigences, modèles d’analyse et de conception, traçabilité et annexes.']])}
${sommaire(pages, titres, [
  { titre: 'Table des figures', entrees: figures.map((f) => ({ id: f.id, html: `Figure ${f.numero} – ${esc(f.legende)}` })) },
  { titre: 'Table des tableaux', entrees: tableaux },
])}
${corps.join('\n')}`);

const pdf = await imprimerPdf(page, [...titres.map((t) => t.id), ...figures.map((f) => f.id), ...tableaux.map((t) => t.id)]);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, pdf);
console.log(`${out} : ${titres.length} titres, ${figures.length} figures, ${tableaux.length} tableaux, ${annexes.length} annexes, version ${EDITION}`);
