/* ==========================================================================
   État des lieux PDF · texte : codage WinAnsi (accents français) et largeurs
   des polices standard Helvetica (millièmes de corps, 32 à 126), pour mesurer,
   tronquer et couper les lignes.
   ========================================================================== */

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
export const codes = (s: string) => [...String(s ?? '')].map(codeOf);

function charWidth(c: number, bold: boolean) {
  const table = bold ? BOLD : REGULAR;
  if (c >= 32 && c <= 126) return table[c - 32];
  if (c in OTHER_WIDTH) return OTHER_WIDTH[c];
  const base = String.fromCharCode(c).normalize('NFD').charCodeAt(0); // é, à, ç… : largeur de la lettre de base
  return base >= 32 && base <= 126 ? table[base - 32] : 556;
}
export const textWidth = (s: string, size: number, bold = false, spacing = 0) => codes(s).reduce((w, c) => w + (charWidth(c, bold) * size) / 1000 + spacing, 0);

/** Texte réduit à une largeur, terminé par « … » s'il dépasse. */
export function fit(s: string, width: number, size: number, bold?: boolean) {
  let t = String(s ?? '');
  if (textWidth(t, size, bold) <= width) return t;
  while (t && textWidth(`${t}…`, size, bold) > width) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}

/** Découpe en lignes d'une largeur donnée (paragraphes conservés, mots trop longs coupés). */
export function wrap(s: string, width: number, size: number) {
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
