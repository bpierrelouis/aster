/* ==========================================================================
   Sélecteurs : toutes les valeurs affichées sont calculées depuis l'état,
   dans le périmètre de l'école affichée (RG-69). Mémoïsés sur state.rev.
   ========================================================================== */

import { store, me, currentEcole } from './store.js';
import { DEVICE_TYPES, PROBLEMS, REMONTEE_STATUTS, problem, statut, phaseOf } from '#shared/catalog.js';
import { DAY } from '#shared/format.js';
import { can } from './permissions.js';

let memoRev = -1;
let memo = {};
/** Valeur calculée une fois par version de l'état */
export const cached = (key, fn) => {
  const rev = store.state.rev || 0;
  if (rev !== memoRev) { memo = {}; memoRev = rev; }
  if (!(key in memo)) memo[key] = fn();
  return memo[key];
};

const inScope = (ecoleId) => {
  const e = currentEcole();
  return !e || e === 'all' || ecoleId === e;
};

export const batimentLabel = (b) => `Bâtiment ${b}`;

export const index = () => cached('index', () => {
  const s = store.state;
  return {
    ecole: new Map(s.ecoles.map((e) => [e.id, e])),
    salle: new Map(s.salles.map((x) => [x.id, x])),
    materiel: new Map(s.materiels.map((m) => [m.id, m])),
    poste: new Map(s.postes.map((p) => [p.id, p])),
  };
});

export const scope = () => cached('scope', () => {
  const s = store.state;
  const salles = s.salles.filter((x) => inScope(x.ecoleId)).sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { numeric: true }));
  const materiels = s.materiels.filter((m) => inScope(m.ecoleId));
  const salleIds = new Set(salles.map((x) => x.id));
  const postes = s.postes.filter((p) => salleIds.has(p.salleId));
  return { salles, materiels, postes, salleIds };
});

export const batiments = () => cached('batiments', () => [...new Set(scope().salles.map((x) => x.batiment))].sort());
export const sallesOf = (batiment) => scope().salles.filter((x) => !batiment || x.batiment === batiment);
export const materielsOf = (salleId) => scope().materiels.filter((m) => (salleId ? m.salleId === salleId : !m.salleId));

const blank = () => ({ total: 0, hs: 0, ok: 0 });

export const parc = () => cached('parc', () => {
  const { salles, materiels, postes } = scope();
  const now = Date.now();
  const totals = { total: materiels.length, affectes: 0, stock: 0, hs: 0, ok: 0 };
  const byType = Object.fromEntries(DEVICE_TYPES.map((t) => [t.id, blank()]));
  const bySalle = new Map(salles.map((x) => [x.id, { ...blank(), types: {}, postes: 0, connectes: 0, attente: 0 }]));
  for (const m of materiels) {
    if (m.salleId) totals.affectes++; else totals.stock++;
    if (m.hs) totals.hs++; else totals.ok++;
    const t = byType[m.type]; if (t) { t.total++; m.hs ? t.hs++ : t.ok++; }
    const sl = m.salleId && bySalle.get(m.salleId);
    if (sl) { sl.total++; m.hs ? sl.hs++ : sl.ok++; sl.types[m.type] = (sl.types[m.type] ?? 0) + 1; }
  }
  for (const p of postes) { const sl = bySalle.get(p.salleId); if (sl) { sl.postes++; if (p.connecte) sl.connectes++; } }
  for (const r of remontees().attente) for (const id of r.materielIds) {
    const m = index().materiel.get(id); const sl = m?.salleId && bySalle.get(m.salleId);
    if (sl) sl.attente++;
  }
  const byBatiment = batiments().map((b) => {
    const list = salles.filter((x) => x.batiment === b);
    const c = { batiment: b, salles: list.length, ...blank() };
    for (const x of list) { const v = bySalle.get(x.id); c.total += v.total; c.hs += v.hs; c.ok += v.ok; }
    return c;
  });
  const stock = { ...blank() };
  for (const m of materiels) if (!m.salleId) { stock.total++; m.hs ? stock.hs++ : stock.ok++; }
  const sallesEquipees = salles.filter((x) => bySalle.get(x.id).total > 0).length;
  const garanties = { proches: [], echues: [] };
  for (const m of materiels) {
    if (!m.garantieFin) continue;
    if (m.garantieFin <= now) garanties.echues.push(m);
    else if (m.garantieFin - now <= 182 * DAY) garanties.proches.push(m);
  }
  const recents = [...materiels].sort((a, b) => b.dateReception - a.dateReception);
  const topSalles = [...salles].sort((a, b) => bySalle.get(b.id).total - bySalle.get(a.id).total);
  // Salles à surveiller : matériels hors service ou en remontée, les plus touchées d'abord
  const surveiller = salles.filter((x) => bySalle.get(x.id).hs + bySalle.get(x.id).attente > 0)
    .sort((a, b) => { const va = bySalle.get(a.id), vb = bySalle.get(b.id); return vb.hs + vb.attente - (va.hs + va.attente) || vb.hs - va.hs; });
  // Hors service par type et par bâtiment (dernière colonne : stock)
  const cols = [...batiments(), null];
  const col = (m) => (m.salleId ? cols.indexOf(index().salle.get(m.salleId)?.batiment) : cols.length - 1);
  const matrix = DEVICE_TYPES.map((t) => ({ t, cells: cols.map(() => 0) }));
  for (const m of materiels) if (m.hs) { const row = matrix.find((r) => r.t.id === m.type); const c = col(m); if (row && c >= 0) row.cells[c]++; }
  // Parc en fin de chaque semaine (12 semaines) et matériels reçus sur la période
  const W = 7 * DAY;
  const parcWeeks = Array.from({ length: 12 }, (_, i) => materiels.filter((m) => m.dateReception <= now - (11 - i) * W).length);
  const recus = materiels.filter((m) => m.dateReception > now - 12 * W).length;
  const deplacements = materiels.filter((m) => m.deplacement).sort((a, b) => a.deplacement.at - b.deplacement.at); // à déplacer, les plus anciens d'abord
  return {
    totals, byType, bySalle, byBatiment, stock, sallesEquipees, garanties, recents, topSalles, deplacements,
    surveiller, matrix: { cols, rows: matrix.filter((r) => r.cells.some(Boolean)) }, parcWeeks, recus,
    garantieTranches: garantieTranches(materiels, now), echeances: echeances(materiels, now),
  };
});

/** Garanties par échéance : échue, sous 6 mois, 6 à 12 mois, plus d'un an, non renseignée */
function garantieTranches(materiels, now) {
  const tranches = [
    { id: 'echue', label: 'Échue', until: now },
    { id: 'proche', label: 'Sous 6 mois', until: now + 182 * DAY },
    { id: 'annee', label: '6 à 12 mois', until: now + 365 * DAY },
    { id: 'longue', label: 'Plus d’un an', until: Infinity },
    { id: 'aucune', label: 'Non renseignée', until: null },
  ].map((b) => ({ ...b, n: 0 }));
  for (const m of materiels) (m.garantieFin ? tranches.find((b) => b.until !== null && m.garantieFin <= b.until) : tranches.at(-1)).n++;
  return tranches;
}

/** Fins de garantie à venir, mois par mois, du mois en cours au onzième suivant */
function echeances(materiels, now) {
  const d = new Date(now);
  return Array.from({ length: 12 }, (_, i) => {
    const from = new Date(d.getFullYear(), d.getMonth() + i, 1).getTime();
    const to = new Date(d.getFullYear(), d.getMonth() + i + 1, 1).getTime();
    return { from, n: materiels.filter((m) => m.garantieFin && m.garantieFin >= Math.max(from, now) && m.garantieFin < to).length };
  });
}

/** Date du traitement d'une remontée (remplacé ou corrigé), ou null tant qu'elle est en attente ou en cours */
export const treatedAt = (r) => r.historique.find((h) => statut(h.statut).phase === 'traitee')?.at ?? null;

/** Onglet de la liste des remontées qui présente une remontée, selon sa phase */
const PHASE_TAB = { attente: 'attente', encours: 'encours', traitee: 'traitees', validee: 'validees' };
export const remonteePath = (r) => `/remontees/${PHASE_TAB[phaseOf(r)]}/${r.id}`;
/** Phase d'une remontée à une date : celle de son dernier changement de statut à cette date (null avant sa création) */
const phaseAt = (r, t) => (r.createdAt > t ? null : statut(r.historique.findLast((h) => h.at <= t)?.statut ?? 'attente').phase);
const countAt = (list, t, phase) => list.filter((r) => phaseAt(r, t) === phase).length;
const median = (values) => {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b), k = Math.floor(s.length / 2);
  return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2;
};

/** Lundi 0 h de la semaine d'une date */
const mondayOf = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; };
const dayKey = (t) => new Date(t).toDateString();

/** Remontées créées par jour sur 12 semaines civiles (du lundi au dimanche), la semaine en cours comprise */
export const remonteesParJour = () => cached('remonteesParJour', () => {
  const counts = new Map();
  for (const r of remontees().visible) counts.set(dayKey(r.createdAt), (counts.get(dayKey(r.createdAt)) ?? 0) + 1);
  const first = mondayOf(Date.now());
  first.setDate(first.getDate() - 11 * 7);
  const today = new Date().setHours(0, 0, 0, 0);
  return Array.from({ length: 12 }, (_, w) => Array.from({ length: 7 }, (__, d) => {
    const at = new Date(first.getFullYear(), first.getMonth(), first.getDate() + w * 7 + d).getTime();
    return { at, n: counts.get(dayKey(at)) ?? 0, future: at > today };
  }));
});

/** Remontées des 12 dernières semaines pour 100 matériels, par bâtiment (localisation actuelle des matériels) */
export const remonteesParBatiment = () => cached('remonteesParBatiment', () => {
  const since = Date.now() - 12 * 7 * DAY;
  const recent = remontees().visible.filter((r) => r.createdAt > since);
  const rows = parc().byBatiment.map((b) => {
    const n = recent.filter((r) => remonteeContext(r).salles.some((x) => x.batiment === b.batiment)).length;
    return { batiment: b.batiment, n, total: b.total, taux: b.total ? (100 * n) / b.total : 0 };
  });
  const n = rows.reduce((t, r) => t + r.n, 0), total = rows.reduce((t, r) => t + r.total, 0);
  return { rows, moyenne: total ? (100 * n) / total : 0 };
});

/** Remontées visibles : toutes (gestionnaire, administrateurs) ou les siennes (formateur) */
export const remontees = () => cached('remontees', () => {
  const s = store.state;
  const mine = (r) => r.auteurId === me().id;
  const visible = s.remontees.filter((r) => inScope(r.ecoleId) && (can('remontee.viewAll') || mine(r)));
  const inPhase = (list, p) => list.filter((r) => phaseOf(r) === p);
  const attente = inPhase(visible, 'attente');
  const encours = inPhase(visible, 'encours');
  const traitees = inPhase(visible, 'traitee');   // remplacées ou corrigées, à valider par leur auteur
  const validees = inPhase(visible, 'validee');   // validées et closes par leur auteur
  const resolues = visible.filter((r) => treatedAt(r) !== null); // traitées, validées ou non
  const byStatut = Object.fromEntries(REMONTEE_STATUTS.map((s) => [s.id, 0]));
  for (const r of visible) byStatut[r.statut]++;
  const W = 7 * DAY;
  const now = Date.now();
  const start = now - 12 * W;
  const weeks = Array.from({ length: 12 }, (_, i) => ({ from: start + i * W, creees: 0, traitees: 0 }));
  for (const r of visible) {
    const wi = Math.floor((r.createdAt - start) / W);
    if (wi >= 0 && wi < 12) weeks[wi].creees++;
    const done = treatedAt(r);
    if (done) { const wd = Math.floor((done - start) / W); if (wd >= 0 && wd < 12) weeks[wd].traitees++; }
  }
  for (const w of weeks) { w.attente = countAt(visible, Math.min(w.from + W, now), 'attente'); w.solde = w.creees - w.traitees; }
  const recentTraitees = resolues.filter((r) => treatedAt(r) > now - 30 * DAY);
  const traiteesAvant = resolues.filter((r) => { const t = treatedAt(r); return t > now - 60 * DAY && t <= now - 30 * DAY; }).length;
  // Délai de traitement (création → remplacé ou corrigé), médiane sur 12 semaines et sur les 12 précédentes
  const delays = (from, to) => visible.map((r) => [r.createdAt, treatedAt(r)]).filter(([, d]) => d !== null && d > from && d <= to).map(([c, d]) => d - c);
  const delai = { median: median(delays(start, now)), avant: median(delays(start - 12 * W, start)) };
  // Par type de problème et par semaine
  const problemes = PROBLEMS.map((p) => ({ p, values: weeks.map(() => 0) }));
  for (const r of visible) {
    const wi = Math.floor((r.createdAt - start) / W);
    if (wi >= 0 && wi < 12) problemes.find((x) => x.p.id === problem(r.probleme).id).values[wi]++;
  }
  const mesRemontees = s.remontees.filter((r) => inScope(r.ecoleId) && mine(r));
  return {
    visible, attente, encours, traitees, validees, byStatut, weeks, recentTraitees, traiteesAvant, delai, problemes,
    attenteAvant: countAt(visible, now - 7 * DAY, 'attente'), // en attente il y a 7 jours
    aTraiter: [...attente, ...encours].sort((a, b) => a.createdAt - b.createdAt), // en attente ou en cours, les plus anciennes d'abord
    mine: mesRemontees, mineAttente: inPhase(mesRemontees, 'attente'), mineAValider: inPhase(mesRemontees, 'traitee'),
  };
});

/** Localisations d'une remontée : celles de ses matériels (RG-12, RG-34) */
export function remonteeContext(r) {
  const ix = index();
  const mats = r.materielIds.map((id) => ix.materiel.get(id)).filter(Boolean);
  const salles = [...new Map(mats.filter((m) => m.salleId).map((m) => [m.salleId, ix.salle.get(m.salleId)])).values()].filter(Boolean);
  return { mats, salles, first: mats[0] };
}

export const detections = () => cached('detections', () => {
  const { salleIds } = scope();
  return store.state.detections.filter((d) => salleIds.has(d.salleId));
});
