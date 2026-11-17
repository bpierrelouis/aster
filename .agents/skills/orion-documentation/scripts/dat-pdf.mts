// Produit le livrable PDF du dossier d'architecture technique (DAT), aux couleurs de la charte ORION, depuis la racine du dépôt :
//   node .agents/skills/orion-documentation/scripts/dat-pdf.mts [livrables/DAT-ORION/DAT-ORION.pdf]
// Sources : docs/03-ARCHITECTURE/01-DOSSIER-ARCHITECTURE-TECHNIQUE.md, les quatre schémas de docs/03-ARCHITECTURE/assets/,
// le logo de design/assets/logos/ et la version du registre archive/registre.json. Éléments communs : livrable-pdf.mts.
// Copie aussi, dans le sous-dossier configurations/ du PDF, les fichiers de configuration de l'architecture réelle joints au DAT (§ 4.8).
// Page de garde, fiche du document, sommaire paginé et cliquable, texte en portrait A4, schémas en paysage A4 ; signets PDF générés.
import { copyFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import {
  COMMANDITAIRE, DEFINITION, DIFFUSION, css, dateCourte, dateFr, derniereVersion, documentHtml, esc, fiche, garde, imprimerPdf,
  inline as inlineMd, lireMarkdown, numero, sommaire, svgData, tableau, type Titre,
} from './livrable-pdf.mts';

const out = resolve(process.argv[2] ?? 'livrables/DAT-ORION/DAT-ORION.pdf');
const DAT = 'docs/03-ARCHITECTURE/01-DOSSIER-ARCHITECTURE-TECHNIQUE.md';
const ASSETS = 'docs/03-ARCHITECTURE/assets';
const derniere = derniereVersion(DAT);

// Schémas : ancre du fichier des diagrammes → figure insérée après le paragraphe qui y renvoie.
const figures = [
  { ancre: 'vue-simplifiée', id: 'fig-1', fichier: 'ORION-VUE-SIMPLIFIEE.svg', titre: 'Architecture réelle — vue simplifiée' },
  { ancre: 'architecture-réelle-sur-vm', id: 'fig-2', fichier: 'ORION-DEPLOIEMENT-VM.svg', titre: 'Architecture réelle sur VM — vue complète' },
  { ancre: 'vue-simplifiée-de-la-cible', id: 'fig-3', fichier: 'ORION-CIBLE-VUE-SIMPLIFIEE.svg', titre: 'Architecture cible sur le C1NP — vue simplifiée' },
  { ancre: 'vue-détaillée-de-la-cible', id: 'fig-4', fichier: 'ORION-CIBLE-C1NP.svg', titre: 'Architecture cible sur le C1NP — vue détaillée' },
].map((f, i) => ({ ...f, numero: i + 1 }));

const titres: Titre[] = [];
const idsSections = new Set<string>();

function lien(t: string, url: string): string {
  const fig = figures.find((f) => url.endsWith(`#${f.ancre}`) && url.includes('02-DIAGRAMMES'));
  if (fig) return `<a href="#${fig.id}">${t} (figure ${fig.numero})</a>`;
  return `<a class="ext" href="${url}">${t}</a>`;
}
const inline = (s: string) => inlineMd(s, lien)
  .replace(/(?<!§)§ (\d+(?:\.\d+)?)/g, (m, n) => (idsSections.has(`s-${n.replace('.', '-')}`) ? `<a href="#s-${n.replace('.', '-')}">${m}</a>` : m));

function figure(f: (typeof figures)[number]): string {
  return `<section class="figure" id="${f.id}"><div class="cadre"><img src="${svgData(`${ASSETS}/${f.fichier}`)}" alt="${esc(f.titre)}"></div><h3 class="legende"><span>Figure ${f.numero}</span> – ${esc(f.titre)}</h3></section>`;
}

// Titre, date et périmètre vont sur la page de garde.
const { lignes } = lireMarkdown(DAT);
const meta = (cle: string) => lignes.find((l) => l.startsWith(`**${cle} :**`))?.replace(/^\*\*[^*]+\*\*\s*/, '') ?? '';
const dateReference = meta('Date de référence');
const perimetre = meta('Périmètre');
const corpsMd = lignes.filter((l) => !l.startsWith('**Date de référence') && !l.startsWith('**Périmètre'));

// Premier passage : identifiants des sections, pour lier les « § n.n ».
for (const l of corpsMd) {
  const m = /^(#{2,3}) (\d+(?:\.\d+)?)\.? /.exec(l);
  if (m) idsSections.add(`s-${m[2].replace('.', '-')}`);
}

const libelle = (texte: string) => {
  const num = /^(\d+(?:\.\d+)?)\.? /.exec(texte)?.[1];
  return num ? `<span class="num">${numero(num)}</span> ${inline(texte.slice(num.length).replace(/^\.?\s*/, ''))}` : inline(texte);
};

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
      titres.push({ niveau, id, html: libelle(texte) });
      const titre = `<h${niveau} id="${id}">${libelle(texte)}</h${niveau}>`;
      html.push(niveau === 2 && num ? `<div class="chapitre">${titre}</div>` : titre);
      i++;
      continue;
    }
    if (l.startsWith('|')) {
      const bloc: string[] = [];
      while (i < corpsMd.length && corpsMd[i].startsWith('|')) bloc.push(corpsMd[i++]);
      html.push(tableau(bloc, inline));
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

// Édition du livrable : première édition remise, distincte des versions de travail du registre.
const EDITION = '1.0';
const TITRE = 'Dossier d’architecture technique';
const style = css(TITRE, `Version ${EDITION} — ${dateFr(derniere.date)}`);

const page = (pages: Map<string, number>) => documentHtml(TITRE, style, `${garde({
  titre: 'Dossier d’architecture<br>technique',
  sousTitre: 'Architecture réelle du démonstrateur sur VM et architecture cible sur le C1NP',
  cartouche: [['Référence', 'ORION-DAT'], ['Version', EDITION], ['Mise à jour', dateFr(derniere.date)], ['Date de référence', esc(dateReference)]],
})}
${fiche([
  ['Projet', `ORION – ${DEFINITION}`], ['Commanditaire', COMMANDITAIRE], ['Référence', 'ORION-DAT'],
  ['Version', `${EDITION} du ${dateFr(derniere.date)}`], ['Date de référence', esc(dateReference)], ['Rédaction', 'Équipe ASTER'],
  ['Diffusion', DIFFUSION], ['Périmètre', inline(perimetre.charAt(0).toUpperCase() + perimetre.slice(1))],
], [[EDITION, dateCourte(derniere.date), 'Équipe ASTER', 'Première édition : architecture réelle sur VM et architecture cible sur le C1NP.']])}
${sommaire(pages, titres, [{ titre: 'Schémas d’architecture', entrees: figures.map((f) => ({ id: f.id, html: `Figure ${f.numero} – ${esc(f.titre)}` })) }])}
${corps}`);

const pdf = await imprimerPdf(page, [...titres.map((t) => t.id), ...figures.map((f) => f.id)]);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, pdf);
console.log(`${out} : ${titres.length} titres, ${figures.length} schémas, version ${EDITION}`);

// Configurations jointes au DAT (§ 4.8), copiées dans le sous-dossier configurations/ du PDF, sous leur seul nom de fichier.
const CONFIGURATIONS = [
  'Dockerfile', 'infra/images/apache-orion.conf', 'infra/images/secrets.sh', 'infra/vm/vm.sh', 'infra/vm/pile.yaml',
  'infra/vm/pile-rigel.yaml', 'infra/vm/haproxy.cfg', 'infra/vm/logstash.conf', 'infra/vm/installer.sh', 'infra/vm/deployer.sh',
  'infra/vm/deploiement.sh', 'infra/vm/postgres-roles.sh', 'infra/vm/runner.sh', 'infra/ldap/orion-utilisateurs.ldif',
];
const dossierConfigurations = `${dirname(out)}/configurations`;
mkdirSync(dossierConfigurations, { recursive: true });
for (const f of CONFIGURATIONS) copyFileSync(`application/${f}`, `${dossierConfigurations}/${basename(f)}`);
console.log(`${CONFIGURATIONS.length} configurations copiées dans ${dossierConfigurations}`);
