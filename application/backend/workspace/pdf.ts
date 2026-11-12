/* ==========================================================================
   État des lieux PDF (RG-14, RG-35) : document A4 autonome, sans dépendance.
   - Bandeau aux couleurs de la charte ORION, version imprimée (nuit et
     Bleu Orion sur blanc) : logotype, référence, statut, type de problème.
   - Cartes : école et déclarant, localisation, matériels concernés.
   - Description, tableau des matériels (type, identifiant, série,
     localisation, état), suivi de la remontée de la transmission à la
     clôture (shared/catalog.ts), pied de page numéroté.
   Polices standard Helvetica, codage WinAnsi (accents français).
   ========================================================================== */

import { deflateSync } from 'node:zlib';
import { deviceType, problem, statut, suiviRemontee } from '#shared/catalog.ts';
import { dateFull, dateMed, num } from '#shared/format.ts';
import { ORION_STAR } from '#shared/ambiance.ts';
import type { Collections, Materiel, Remontee, Salle } from '#shared/types.ts';

/** Couleur RVB, composantes de 0 à 1 */
type Rgb = number[];
type Style = { fill?: Rgb; stroke?: Rgb; width?: number; dash?: number[] | null };
type TextOptions = { size?: number; bold?: boolean; color?: Rgb; align?: 'left' | 'right' | 'center'; spacing?: number };
/** Ligne du tableau des matériels : fiche de l'inventaire, ou fiche retirée (deleted) */
type MaterielLigne = Pick<Materiel, 'id' | 'idOrion' | 'modele'> & Partial<Materiel> & { deleted?: boolean };

const W = 595.28, H = 841.89, M = 40, CW = W - 2 * M;
const BOTTOM = H - 62; // limite du contenu, au-dessus du pied de page

const hex = (h: string): Rgb => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const mix = (c: Rgb, ratio: number) => c.map((v) => v * ratio + (1 - ratio)); // teinte claire d'une couleur
// Charte ORION, version imprimée : nuit (encre) et Bleu Orion sur blanc, teintes claires du bleu (tokens.css) ;
// les types de matériel suivent la palette catégorielle --c1 à --c8
const C = {
  encre: hex('#040b1e'), bleu: hex('#2563eb'), mist: hex('#e1eafc'), brume: hex('#f3f6fc'),
  tint: hex('#eef3fd'), line: hex('#dfe5f0'), ink2: hex('#52617b'), ink3: hex('#8a93a6'),
  iris: hex('#6954c0'), coeur: hex('#e8b84e'), // statuts « remplacé » et « en attente » (STATUT_COLOR)
  ok: hex('#0ca30c'), okText: hex('#087a08'), crit: hex('#d03b3b'), critText: hex('#b02c2c'), white: [1, 1, 1],
};
// Étoile ORION : point de départ, puis quatre courbes de Bézier de trois points, dans un carré de 40
const STAR = ORION_STAR.match(/[\d.]+/g)!.map(Number);
const TYPE_COLOR = { uc: '#6954c0', videoprojecteur: '#eb6834', reseau: '#1baf7a', peripherique: '#d99a1e', ecran: '#2a78d6', audio: '#e87ba4', imprimante: '#008300', autre: '#64748b' };
const STATUT_COLOR: Record<string, Rgb> = { attente: C.coeur, encours: hex('#2a78d6'), remplace: C.iris, corrige: C.ok, validee: hex('#7c879b') }; // --c5 et --stock pour « en cours » et « validée »

/* --------------------------------------------------------------------------
   Texte : codage WinAnsi et largeurs Helvetica (millièmes de corps, 32 à 126)
   -------------------------------------------------------------------------- */
const REGULAR = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584];
const BOLD = [278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584];
const WINANSI: Record<number, number> = { 0x20ac: 0x80, 0x2026: 0x85, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x0152: 0x8c, 0x0153: 0x9c, 0x0178: 0x9f, 0x202f: 0xa0, 0x2009: 0x20, 0x2212: 0x2d };
const OTHER_WIDTH: Record<number, number> = { 0x80: 556, 0x85: 1000, 0x91: 222, 0x92: 222, 0x93: 333, 0x94: 333, 0x95: 350, 0x96: 556, 0x97: 1000, 0x8c: 1000, 0x9c: 944, 0xa0: 278, 0xab: 556, 0xbb: 556, 0xb0: 400, 0xb7: 278 };

function codeOf(ch: string) {
  const u = ch.codePointAt(0)!;
  if ((u >= 32 && u <= 126) || (u >= 0xa0 && u <= 0xff)) return u;
  if (u in WINANSI) return WINANSI[u];
  if (u === 9 || u === 10 || u === 13) return 32;
  const base = ch.normalize('NFD').codePointAt(0)!; // lettre accentuée hors Latin-1 : lettre de base
  return base >= 32 && base <= 126 ? base : 0x3f;
}
const codes = (s: string) => [...String(s ?? '')].map(codeOf);

function charWidth(c: number, bold: boolean) {
  const table = bold ? BOLD : REGULAR;
  if (c >= 32 && c <= 126) return table[c - 32];
  if (c in OTHER_WIDTH) return OTHER_WIDTH[c];
  const base = String.fromCharCode(c).normalize('NFD').charCodeAt(0); // é, à, ç… : largeur de la lettre de base
  return base >= 32 && base <= 126 ? table[base - 32] : 556;
}
const textWidth = (s: string, size: number, bold = false, spacing = 0) => codes(s).reduce((w, c) => w + (charWidth(c, bold) * size) / 1000 + spacing, 0);

/** Texte réduit à une largeur, terminé par « … » s'il dépasse. */
function fit(s: string, width: number, size: number, bold?: boolean) {
  let t = String(s ?? '');
  if (textWidth(t, size, bold) <= width) return t;
  while (t && textWidth(`${t}…`, size, bold) > width) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}

/** Découpe en lignes d'une largeur donnée (paragraphes conservés, mots trop longs coupés). */
function wrap(s: string, width: number, size: number) {
  const lines: string[] = [];
  for (const para of String(s ?? '').split(/\r?\n/)) {
    let line = '';
    for (const word of para.split(/\s+/).filter(Boolean)) {
      let w = word;
      while (textWidth(w, size) > width) {
        let cut = w.length;
        while (cut > 1 && textWidth(w.slice(0, cut), size) > width) cut--;
        if (line) { lines.push(line); line = ''; }
        lines.push(w.slice(0, cut));
        w = w.slice(cut);
      }
      const next = line ? `${line} ${w}` : w;
      if (textWidth(next, size) <= width) line = next;
      else { lines.push(line); line = w; }
    }
    lines.push(line);
  }
  while (lines.length > 1 && !lines.at(-1)) lines.pop();
  return lines;
}

/* --------------------------------------------------------------------------
   Dessin : coordonnées depuis le haut de la page, converties pour le PDF
   -------------------------------------------------------------------------- */
const f = (v: number) => +v.toFixed(2);
const rgb = (c: Rgb) => c.map(f).join(' ');
const K = 0.5523; // approximation du cercle par des courbes de Bézier

function roundPath(x: number, top: number, w: number, h: number, r: number) {
  const y = H - top - h;
  const k = r * K;
  return `${f(x + r)} ${f(y)} m ${f(x + w - r)} ${f(y)} l ${f(x + w - r + k)} ${f(y)} ${f(x + w)} ${f(y + r - k)} ${f(x + w)} ${f(y + r)} c `
    + `${f(x + w)} ${f(y + h - r)} l ${f(x + w)} ${f(y + h - r + k)} ${f(x + w - r + k)} ${f(y + h)} ${f(x + w - r)} ${f(y + h)} c `
    + `${f(x + r)} ${f(y + h)} l ${f(x + r - k)} ${f(y + h)} ${f(x)} ${f(y + h - r + k)} ${f(x)} ${f(y + h - r)} c `
    + `${f(x)} ${f(y + r)} l ${f(x)} ${f(y + r - k)} ${f(x + r - k)} ${f(y)} ${f(x + r)} ${f(y)} c h`;
}
const ellipsePath = (cx: number, cy: number, rx: number, ry: number) => `${f(cx + rx)} ${f(cy)} m ${f(cx + rx)} ${f(cy + ry * K)} ${f(cx + rx * K)} ${f(cy + ry)} ${f(cx)} ${f(cy + ry)} c `
  + `${f(cx - rx * K)} ${f(cy + ry)} ${f(cx - rx)} ${f(cy + ry * K)} ${f(cx - rx)} ${f(cy)} c `
  + `${f(cx - rx)} ${f(cy - ry * K)} ${f(cx - rx * K)} ${f(cy - ry)} ${f(cx)} ${f(cy - ry)} c `
  + `${f(cx + rx * K)} ${f(cy - ry)} ${f(cx + rx)} ${f(cy - ry * K)} ${f(cx + rx)} ${f(cy)} c h`;

function canvas() {
  const pages: string[][] = [];
  let ops: string[];
  const paint = (path: string, { fill, stroke, width = 1, dash }: Style) => {
    if (dash) ops.push(`[${dash.join(' ')}] 0 d`);
    if (stroke) ops.push(`${rgb(stroke)} RG ${f(width)} w`);
    if (fill) ops.push(`${rgb(fill)} rg`);
    ops.push(`${path} ${fill && stroke ? 'B' : fill ? 'f' : 'S'}`);
    if (dash) ops.push('[] 0 d');
  };
  return {
    pages,
    newPage() { ops = []; pages.push(ops); },
    select(i: number) { ops = pages[i]; },
    rect(x: number, top: number, w: number, h: number, fill: Rgb) { paint(`${f(x)} ${f(H - top - h)} ${f(w)} ${f(h)} re`, { fill }); },
    round(x: number, top: number, w: number, h: number, r: number, style: Style) { paint(roundPath(x, top, w, h, r), style); },
    circle(cx: number, cy: number, r: number, style: Style) { paint(ellipsePath(cx, H - cy, r, r), style); },
    line(x1: number, y1: number, x2: number, y2: number, stroke: Rgb, width = 1, dash?: number[] | null) { paint(`${f(x1)} ${f(H - y1)} m ${f(x2)} ${f(H - y2)} l`, { stroke, width, dash }); },
    /** Coche blanche centrée sur (cx, cy) */
    check(cx: number, cy: number, s: number) { paint(`${f(cx - s)} ${f(H - cy)} m ${f(cx - s / 3)} ${f(H - cy - s * 0.7)} l ${f(cx + s)} ${f(H - cy + s * 0.65)} l`, { stroke: C.white, width: 1.6 }); },
    /** Dégradé bleu clair du bandeau, souligné de Bleu Orion */
    band(top: number, h: number) {
      ops.push(`q 0 ${f(H - top - h)} ${f(W)} ${f(h)} re W n /SH sh Q`);
      paint(`0 ${f(H - top - h)} ${f(W)} 1.5 re`, { fill: C.bleu });
    },
    /** Étoile ORION centrée sur (cx, cy), de côté size (alpha : transparence /GA) */
    star(cx: number, cy: number, size: number, color: Rgb, alpha = false) {
      const s = size / 40;
      const pt = (i: number) => `${f(cx + (STAR[i] - 20) * s)} ${f(H - cy - (STAR[i + 1] - 20) * s)}`;
      let path = `${pt(0)} m`;
      for (let i = 2; i < STAR.length; i += 6) path += ` ${pt(i)} ${pt(i + 2)} ${pt(i + 4)} c`;
      ops.push(alpha ? 'q /GA gs' : 'q', `${rgb(color)} rg ${path} h f Q`);
    },
    /** Texte sur sa ligne de base ; align : left | right | center */
    text(s: string, x: number, baseline: number, { size = 10, bold = false, color = C.encre, align = 'left', spacing = 0 }: TextOptions = {}) {
      const w = textWidth(s, size, bold, spacing);
      const left = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
      const hexText = codes(s).map((c) => c.toString(16).padStart(2, '0')).join('');
      ops.push(`BT /${bold ? 'F2' : 'F1'} ${f(size)} Tf ${f(spacing)} Tc ${rgb(color)} rg 1 0 0 1 ${f(left)} ${f(H - baseline)} Tm <${hexText}> Tj ET`);
      return w;
    },
  };
}

/** Assemblage du fichier : catalogue, polices, transparence, dégradé, pages. */
function assemble(pages: string[][]) {
  const objects: (string | Buffer | null)[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    null, // pages, plus bas
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    '<< /Type /ExtGState /ca 0.13 /CA 0.13 >>',
    `<< /ShadingType 2 /ColorSpace /DeviceRGB /Coords [0 ${f(H)} ${f(W)} ${f(H - 160)}] /Function << /FunctionType 2 /Domain [0 1] /C0 [${rgb(C.mist)}] /C1 [${rgb(C.brume)}] /N 1 >> /Extend [true true] >>`,
  ];
  const resources = '/Resources << /Font << /F1 3 0 R /F2 4 0 R >> /ExtGState << /GA 5 0 R >> /Shading << /SH 6 0 R >> >>';
  const kids: string[] = [];
  for (const ops of pages) {
    const stream = deflateSync(Buffer.from(ops.join('\n'), 'latin1'));
    const n = objects.length + 1;
    kids.push(`${n} 0 R`);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${f(W)} ${f(H)}] ${resources} /Contents ${n + 1} 0 R >>`);
    objects.push(Buffer.concat([Buffer.from(`<< /Length ${stream.length} /Filter /FlateDecode >>\nstream\n`), stream, Buffer.from('\nendstream')]));
  }
  objects[1] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pages.length} >>`;
  const chunks = [Buffer.from('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n', 'latin1')];
  let length = chunks[0].length;
  const offsets = objects.map((obj, i) => {
    const offset = length;
    const body = Buffer.concat([Buffer.from(`${i + 1} 0 obj\n`), Buffer.isBuffer(obj) ? obj : Buffer.from(obj!, 'latin1'), Buffer.from('\nendobj\n')]);
    chunks.push(body);
    length += body.length;
    return offset;
  });
  chunks.push(Buffer.from(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`
    + `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${length}\n%%EOF\n`));
  return Buffer.concat(chunks);
}

/* --------------------------------------------------------------------------
   Document
   -------------------------------------------------------------------------- */
export function reportPdf(report: Remontee, state: Pick<Collections, 'materiels' | 'salles' | 'ecoles'>) {
  const cv = canvas();
  const mats: MaterielLigne[] = report.materielIds.map((id) => state.materiels.find((m) => m.id === id) ?? { id, idOrion: id, modele: 'Matériel supprimé', deleted: true });
  const roomOf = (m: MaterielLigne) => state.salles.find((s) => s.id === m.salleId);
  const rooms = [...new Set(mats.map(roomOf).filter(Boolean) as Salle[])];
  const hs = mats.filter((m) => m.hs).length;
  const ecole = state.ecoles.find((e) => e.id === report.ecoleId)?.nom ?? '';
  const pb = problem(report.probleme);
  const st = statut(report.statut);
  const steps = suiviRemontee(report);
  const updated = steps.findLast((s) => !s.todo)!.at!;
  let y = 0;

  // Logotype ORION, version imprimée : capitales espacées, étoile nuit au-dessus du « I », séparée de lui d'un tiers
  // de corps (capitales Helvetica : 0,718 corps) ; renvoie sa largeur
  const logo = (x: number, baseline: number, size: number) => {
    const spacing = size / 2;
    const width = cv.text('ORION', x, baseline, { size, spacing }) - spacing;
    cv.star(x + textWidth('OR', size, false, spacing) + textWidth('I', size) / 2, baseline - size * (0.718 + 0.32 + 0.33), size * 0.66, C.encre);
    return width;
  };
  const firstHeader = () => {
    cv.band(0, 152);
    cv.star(W - 84, 76, 150, C.bleu, true);
    logo(M, 47, 19);
    cv.text('État des lieux', M, 66, { size: 9.5, color: C.ink2 });
    cv.text('Remontée', W - M, 34, { size: 8.5, color: C.ink2, align: 'right' });
    cv.text(report.id, W - M, 58, { size: 21, bold: true, align: 'right' });
    const pw = textWidth(st.label, 8.5, true) + 28;
    cv.round(W - M - pw, 68, pw, 20, 10, { fill: C.white, stroke: C.line, width: 0.8 });
    cv.circle(W - M - pw + 12, 78, 3.6, { fill: STATUT_COLOR[st.id] });
    cv.text(st.label, W - M - pw + 20, 81, { size: 8.5, bold: true });
    cv.text(fit(pb.label, CW, 22, true), M, 114, { size: 22, bold: true });
    cv.text(fit(`Transmise le ${dateFull(report.createdAt)} par ${report.auteur}`, CW, 10), M, 134, { size: 10, color: C.ink2 });
    y = 170;
  };
  const nextHeader = () => {
    cv.band(0, 50);
    const width = logo(M, 32, 11);
    cv.text('État des lieux', M + width + 12, 32, { size: 9, color: C.ink2 });
    cv.text(report.id, W - M, 32, { size: 11, bold: true, align: 'right' });
    y = 74;
  };
  const ensure = (h: number) => { if (y + h > BOTTOM) { cv.newPage(); nextHeader(); } };
  const section = (title: string, next: number) => {
    ensure(26 + next);
    cv.round(M, y, 4, 14, 2, { fill: C.bleu });
    cv.text(title, M + 12, y + 11.5, { size: 12, bold: true });
    y += 24;
  };

  cv.newPage();
  firstHeader();

  // Cartes : école et déclarant, localisation, matériels
  const cards = [
    { label: 'ÉCOLE', value: ecole, sub: `Déclarée par ${report.auteur}`, color: C.bleu },
    { label: 'LOCALISATION', value: rooms.length ? rooms.map((r) => r.nom).join(', ') : 'Stock', sub: rooms.length ? [...new Set(rooms.map((r) => `Bâtiment ${r.batiment}`))].join(', ') : 'Sans localisation', color: hex(TYPE_COLOR.reseau) },
    { label: 'MATÉRIELS', value: `${num(mats.length)} matériel${mats.length > 1 ? 's' : ''}`, sub: hs ? `dont ${num(hs)} hors service` : 'Tous en service', color: hs ? C.crit : C.ok },
  ];
  const cardW = (CW - 20) / 3;
  cards.forEach((c, i) => {
    const x = M + i * (cardW + 10);
    cv.round(x, y, cardW, 60, 10, { fill: C.brume });
    cv.circle(x + 15, y + 15.5, 3.2, { fill: c.color });
    cv.text(c.label, x + 24, y + 18.5, { size: 7.5, bold: true, color: C.ink3, spacing: 0.6 });
    cv.text(fit(c.value, cardW - 24, 11.5, true), x + 12, y + 37, { size: 11.5, bold: true });
    cv.text(fit(c.sub, cardW - 24, 8.5), x + 12, y + 51, { size: 8.5, color: C.ink2 });
  });
  y += 82;

  // Description, découpée sur plusieurs pages si nécessaire
  const lines = wrap(report.description, CW - 40, 10.5);
  section('Description du problème', 15 + 26);
  for (let i = 0; i < lines.length;) {
    ensure(15 + 26);
    const chunk = lines.slice(i, i + Math.max(1, Math.floor((BOTTOM - y - 26) / 15)));
    const h = chunk.length * 15 + 22;
    cv.round(M, y, CW, h, 10, { fill: C.tint });
    cv.round(M + 12, y + 11, 3, h - 22, 1.5, { fill: C.bleu });
    chunk.forEach((l, k) => cv.text(l, M + 26, y + 22 + k * 15, { size: 10.5 }));
    y += h + 8;
    i += chunk.length;
  }
  y += 12;

  // Matériels concernés
  const cols = [{ label: 'MATÉRIEL', w: 176 }, { label: 'IDENTIFIANT ORION', w: 88 }, { label: 'N° DE SÉRIE', w: 88 }, { label: 'LOCALISATION', w: 96 }, { label: 'ÉTAT', w: CW - 448 }];
  const colX = cols.map((_, i) => M + cols.slice(0, i).reduce((s, c) => s + c.w, 0));
  const tableHead = () => {
    cv.round(M, y, CW, 24, 7, { fill: C.encre });
    cv.rect(M, y + 12, CW, 12, C.encre);
    cols.forEach((c, i) => cv.text(c.label, colX[i] + 10, y + 15.5, { size: 7, bold: true, color: C.white, spacing: 0.5 }));
    y += 24;
  };
  section('Matériels concernés', 24 + 38);
  tableHead();
  mats.forEach((m, k) => {
    if (y + 38 > BOTTOM) { cv.newPage(); nextHeader(); tableHead(); }
    const t = deviceType(m.type);
    const color = hex(TYPE_COLOR[t.id]);
    const room = roomOf(m);
    cv.rect(M, y, CW, 38, k % 2 ? C.brume : C.white);
    cv.line(M, y + 38, M + CW, y + 38, C.line, 0.6);
    cv.round(colX[0] + 10, y + 10, 18, 18, 5, { fill: mix(color, 0.16) });
    cv.round(colX[0] + 15, y + 15, 8, 8, 2.5, { fill: color });
    cv.text(fit(m.modele, cols[0].w - 46, 9.5, true), colX[0] + 36, y + 16.5, { size: 9.5, bold: true });
    cv.text(fit(m.deleted ? 'Fiche retirée de l’inventaire' : [t.label, m.marque].filter(Boolean).join(' · '), cols[0].w - 46, 8), colX[0] + 36, y + 28.5, { size: 8, color: C.ink2 });
    cv.text(fit(m.idOrion, cols[1].w - 16, 9, true), colX[1] + 10, y + 22.5, { size: 9, bold: true });
    cv.text(fit(m.serie ?? '—', cols[2].w - 16, 9), colX[2] + 10, y + 22.5, { size: 9, color: m.serie ? C.encre : C.ink3 });
    cv.text(fit(room ? room.nom : m.deleted ? '—' : 'Stock', cols[3].w - 16, 9, true), colX[3] + 10, y + 16.5, { size: 9, bold: true });
    if (!m.deleted) cv.text(fit(room ? `Bâtiment ${room.batiment}` : 'Sans localisation', cols[3].w - 16, 8), colX[3] + 10, y + 28.5, { size: 8, color: C.ink2 });
    if (!m.deleted) {
      cv.circle(colX[4] + 13, y + 19.5, 3.2, { fill: m.hs ? C.crit : C.ok });
      cv.text(m.hs ? 'Hors service' : 'En service', colX[4] + 21, y + 22.5, { size: 8.5, bold: true, color: m.hs ? C.critText : C.okText });
    }
    y += 38;
  });
  y += 26;

  // Suivi, de la transmission à la clôture : étapes franchies, puis étapes restantes en pointillés
  const ROW = 36;
  section('Suivi de la remontée', ROW);
  steps.forEach((s, i) => {
    ensure(ROW);
    const cx = M + 12, cy = y + 12;
    const next = steps[i + 1];
    if (next && y + 2 * ROW <= BOTTOM) cv.line(cx, cy + 11, cx, cy + ROW - 11, next.todo ? C.line : C.bleu, 2, next.todo ? [3, 3] : null);
    if (s.todo) cv.circle(cx, cy, 9, { fill: C.white, stroke: C.ink3, width: 1.2, dash: [2.5, 2] });
    else { cv.circle(cx, cy, 9, { fill: STATUT_COLOR[s.statut] ?? C.bleu }); cv.check(cx, cy, 3.6); }
    cv.text(s.label, M + 32, y + 9.5, { size: 10, bold: true, color: s.todo ? C.ink2 : C.encre });
    cv.text(fit(s.todo ? `À venir · ${s.sub}` : `${dateFull(s.at!)} · ${s.par}`, CW - 32, 8.5), M + 32, y + 22.5, { size: 8.5, color: C.ink2 });
    y += ROW;
  });

  // Pied de page numéroté
  const total = cv.pages.length;
  for (let i = 0; i < total; i++) {
    cv.select(i);
    cv.line(M, H - 46, W - M, H - 46, C.line, 0.6);
    cv.star(M + 5, H - 28.5, 11, C.encre);
    cv.text(fit(`Document établi par Orion le ${dateMed(report.createdAt)}${updated > report.createdAt ? `, mis à jour le ${dateMed(updated)}` : ''}${ecole ? ` · ${ecole}` : ''}`, CW - 120, 8), M + 17, H - 25.5, { size: 8, color: C.ink2 });
    cv.text(`${report.id} · page ${i + 1} sur ${total}`, W - M, H - 25.5, { size: 8, color: C.ink2, align: 'right' });
  }
  return assemble(cv.pages);
}
