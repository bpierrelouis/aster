/* ==========================================================================
   Sélecteurs : toutes les valeurs affichées sont calculées depuis l'état,
   dans le périmètre de l'école affichée (RG-69). Mémoïsés sur state.rev.
   ========================================================================== */

import { store, me, currentEcole } from './store.ts';
import { DEVICE_TYPES, PROBLEMS, REMONTEE_STATUTS, problem, statut, phaseOf } from '#shared/catalog.ts';
import { DAY } from '#shared/format.ts';
import { can } from './permissions.ts';
import type { DeviceTypeId, Id, Materiel, Mouvement, Remontee, RemonteePhase, RemonteeStatut, Salle, Timestamp, Trace } from '#shared/types.ts';

/** Effectif de matériels : total, hors service, en état */
export interface Effectif { total: number; hs: number; ok: number }
/** Chiffres d'une salle : matériels (par type), postes allumés, matériels en remontée en attente */
export interface SalleStats extends Effectif { types: Partial<Record<DeviceTypeId, number>>; postes: number; allumes: number; attente: number }
/** Matériel dont le déplacement physique n'est pas encore confirmé */
export type MaterielADeplacer = Materiel & { deplacement: Mouvement };
/** Remontées d'une semaine : créées, traitées, en attente en fin de semaine et solde (créées − traitées) */
export interface SemaineRemontees { from: Timestamp; creees: number; traitees: number; attente: number; solde: number }
/** Localisations d'une remontée : ses matériels, leurs salles et le premier matériel (absent s'ils ont été retirés) */
export interface RemonteeContext { mats: Materiel[]; salles: Salle[]; first: Materiel | undefined }

let memoRev = -1;
let memo: Record<string, unknown> = {};
/** Valeur calculée une fois par version de l'état */
export const cached = <T>(key: string, fn: () => T): T => {
  const rev = store.state.rev || 0;
  if (rev !== memoRev) { memo = {}; memoRev = rev; }
  if (!(key in memo)) memo[key] = fn();
  return memo[key] as T;
};

const inScope = (ecoleId: Id) => {
  const e = currentEcole();
  return !e || e === 'all' || ecoleId === e;
};

/** Auteur et date d'une action, affichés sans attendre la réponse du serveur, qui les remplace par les siens (backend/workspace/rules.ts) */
export const traceProvisoire = (): Trace => ({ at: Date.now(), par: me().nom, parId: me().id });

/** Fiche d'un matériel, dans sa salle ou au stock */
export const materielPath = (m: Pick<Materiel, 'id' | 'salleId'>) => `/salles/${m.salleId ? `salle/${m.salleId}` : 'stock'}?m=${m.id}`;

/** Garantie d'un matériel : hors garantie à sa date de fin, à échéance dans les 6 mois qui la précèdent */
export const GARANTIE_PROCHE = 182 * DAY;
export const GARANTIES = ['Hors garantie', 'À échéance', 'En cours', 'Non renseignée'] as const;
export type Garantie = (typeof GARANTIES)[number];
export const garantie = (m: Pick<Materiel, 'garantieFin'>, now = Date.now()): Garantie =>
  !m.garantieFin ? 'Non renseignée' : m.garantieFin <= now ? 'Hors garantie' : m.garantieFin - now <= GARANTIE_PROCHE ? 'À échéance' : 'En cours';
/** Inventaire filtré sur une garantie (lien d'une notification) */
export const garantiePath = (g: Garantie) => `/materiels/inventaire?garantie=${encodeURIComponent(g)}`;

export const batimentLabel = (b: string) => `Bâtiment ${b}`;
/** Étage : « Rez-de-chaussée », « 1er étage », « Sous-sol 1 » ; forme courte : RDC, 1er, SS1 */
export const floorLabel = (n: number) => n === 0 ? 'Rez-de-chaussée' : n < 0 ? `Sous-sol ${Math.abs(n)}` : `${n}${n === 1 ? 'er' : 'e'} étage`;
export const floorShort = (n: number) => n === 0 ? 'RDC' : n < 0 ? `SS${Math.abs(n)}` : `${n}${n === 1 ? 'er' : 'e'}`;
/** Emplacement d'une salle, format unique de l'application : « A101 · Bâtiment A · 1er étage » */
export const emplacement = (s: Salle | null | undefined) => (s ? `${s.nom} · ${batimentLabel(s.batiment)} · ${floorLabel(Number(s.etage ?? 0))}` : '');

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
export const sallesOf = (batiment?: string | null) => scope().salles.filter((x) => !batiment || x.batiment === batiment);
/** Choix de salles : nom et bâtiment communs aux listes filtrables. */
export const optionsSalles = (salles: readonly Salle[] = scope().salles) => salles.map((s) => ({ value: s.id, label: s.nom, group: batimentLabel(s.batiment) }));
/** Choix d'affectation : stock et salles regroupées par bâtiment. */
export function affectationOptions(ecoleId: Id | null) {
  const salles = scope().salles.filter((x) => !ecoleId || x.ecoleId === ecoleId);
  return [{ value: '', label: 'Stock (sans localisation)' }, ...optionsSalles(salles)];
}

export const materielsOf = (salleId?: Id | null) => scope().materiels.filter((m) => (salleId ? m.salleId === salleId : !m.salleId));

const blank = (): Effectif => ({ total: 0, hs: 0, ok: 0 });

export const parc = () => cached('parc', () => {
  const { salles, materiels, postes } = scope();
  const now = Date.now();
  const totals = { total: materiels.length, affectes: 0, stock: 0, hs: 0, ok: 0 };
  const byType = Object.fromEntries(DEVICE_TYPES.map((t) => [t.id, blank()])) as Record<DeviceTypeId, Effectif>;
  const bySalle = new Map<Id, SalleStats>(salles.map((x) => [x.id, { ...blank(), types: {}, postes: 0, allumes: 0, attente: 0 }]));
  for (const m of materiels) {
    if (m.salleId) totals.affectes++; else totals.stock++;
    if (m.hs) totals.hs++; else totals.ok++;
    const t = byType[m.type]; if (t) { t.total++; m.hs ? t.hs++ : t.ok++; }
    const sl = m.salleId && bySalle.get(m.salleId);
    if (sl) { sl.total++; m.hs ? sl.hs++ : sl.ok++; sl.types[m.type] = (sl.types[m.type] ?? 0) + 1; }
  }
  for (const p of postes) { const sl = bySalle.get(p.salleId); if (sl) { sl.postes++; if (p.allume) sl.allumes++; } }
  for (const r of remontees().attente) for (const id of r.materielIds) {
    const m = index().materiel.get(id); const sl = m?.salleId && bySalle.get(m.salleId);
    if (sl) sl.attente++;
  }
  const byBatiment = batiments().map((b) => {
    const list = salles.filter((x) => x.batiment === b);
    const c = { batiment: b, salles: list.length, ...blank() };
    for (const x of list) { const v = bySalle.get(x.id)!; c.total += v.total; c.hs += v.hs; c.ok += v.ok; }
    return c;
  });
  const stock = { ...blank() };
  for (const m of materiels) if (!m.salleId) { stock.total++; m.hs ? stock.hs++ : stock.ok++; }
  const sallesEquipees = salles.filter((x) => bySalle.get(x.id)!.total > 0).length;
  const garanties: { proches: Materiel[]; echues: Materiel[] } = { proches: [], echues: [] };
  for (const m of materiels) {
    const g = garantie(m, now);
    if (g === 'Hors garantie') garanties.echues.push(m);
    else if (g === 'À échéance') garanties.proches.push(m);
  }
  const recents = [...materiels].sort((a, b) => b.dateReception - a.dateReception);
  const topSalles = [...salles].sort((a, b) => bySalle.get(b.id)!.total - bySalle.get(a.id)!.total);
  // Salles à surveiller : matériels hors service ou en remontée, les plus touchées d'abord
  const surveiller = salles.filter((x) => bySalle.get(x.id)!.hs + bySalle.get(x.id)!.attente > 0)
    .sort((a, b) => { const va = bySalle.get(a.id)!, vb = bySalle.get(b.id)!; return vb.hs + vb.attente - (va.hs + va.attente) || vb.hs - va.hs; });
  // Hors service par type et par bâtiment (dernière colonne : stock)
  const cols = [...batiments(), null];
  const col = (m: Materiel) => (m.salleId ? cols.indexOf(index().salle.get(m.salleId)?.batiment as string) : cols.length - 1);
  const matrix = DEVICE_TYPES.map((t) => ({ t, cells: cols.map(() => 0) }));
  for (const m of materiels) if (m.hs) { const row = matrix.find((r) => r.t.id === m.type); const c = col(m); if (row && c >= 0) row.cells[c]++; }
  // Parc en fin de chaque semaine (12 semaines) et matériels reçus sur la période
  const W = 7 * DAY;
  const parcWeeks = Array.from({ length: 12 }, (_, i) => materiels.filter((m) => m.dateReception <= now - (11 - i) * W).length);
  const recus = materiels.filter((m) => m.dateReception > now - 12 * W).length;
  const deplacements = (materiels.filter((m) => m.deplacement) as MaterielADeplacer[]).sort((a, b) => a.deplacement.at - b.deplacement.at); // à déplacer, les plus anciens d'abord
  return {
    totals, byType, bySalle, byBatiment, stock, sallesEquipees, garanties, recents, topSalles, deplacements,
    surveiller, matrix: { cols, rows: matrix.filter((r) => r.cells.some(Boolean)) }, parcWeeks, recus,
    garantieTranches: garantieTranches(materiels, now), echeances: echeances(materiels, now),
  };
});

/** Garanties par échéance : échue, sous 6 mois, 6 à 12 mois, plus d'un an, non renseignée */
function garantieTranches(materiels: Materiel[], now: number) {
  const tranches = [
    { id: 'echue', label: 'Hors garantie', until: now },
    { id: 'proche', label: 'Sous 6 mois', until: now + GARANTIE_PROCHE },
    { id: 'annee', label: '6 à 12 mois', until: now + 365 * DAY },
    { id: 'longue', label: 'Plus d’un an', until: Infinity },
    { id: 'aucune', label: 'Non renseignée', until: null },
  ].map((b) => ({ ...b, n: 0 }));
  for (const m of materiels) (m.garantieFin ? tranches.find((b) => b.until !== null && m.garantieFin! <= b.until) : tranches.at(-1))!.n++;
  return tranches;
}

/** Fins de garantie à venir, mois par mois, du mois en cours au onzième suivant */
function echeances(materiels: Materiel[], now: number) {
  const d = new Date(now);
  return Array.from({ length: 12 }, (_, i) => {
    const from = new Date(d.getFullYear(), d.getMonth() + i, 1).getTime();
    const to = new Date(d.getFullYear(), d.getMonth() + i + 1, 1).getTime();
    return { from, n: materiels.filter((m) => m.garantieFin && m.garantieFin >= Math.max(from, now) && m.garantieFin < to).length };
  });
}

/** Date du traitement d'une remontée (remplacé ou corrigé), ou null tant qu'elle est en attente ou en cours */
export const treatedAt = (r: Remontee) => r.historique.find((h) => statut(h.statut).phase === 'terminee')?.at ?? null;

/** Onglet de la liste des remontées qui présente une remontée, selon sa phase */
const PHASE_TAB: Record<RemonteePhase, string> = { attente: 'attente', encours: 'encours', terminee: 'terminees' };
export const remonteePath = (r: Remontee) => `/remontees/${PHASE_TAB[phaseOf(r)]}/${r.id}`;
/** Phase d'une remontée à une date : celle de son dernier changement de statut à cette date (null avant sa création) */
const phaseAt = (r: Remontee, t: number) => (r.createdAt > t ? null : statut(r.historique.findLast((h) => h.at <= t)?.statut ?? 'attente').phase);
const countAt = (list: Remontee[], t: number, phase: RemonteePhase) => list.filter((r) => phaseAt(r, t) === phase).length;
const median = (values: number[]) => {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b), k = Math.floor(s.length / 2);
  return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2;
};

/** Lundi 0 h de la semaine d'une date */
const mondayOf = (t: number) => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; };
const dayKey = (t: number) => new Date(t).toDateString();

/** Remontées créées par jour sur 12 semaines civiles (du lundi au dimanche), la semaine en cours comprise */
export const remonteesParJour = () => cached('remonteesParJour', () => {
  const counts = new Map<string, number>();
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
  const mine = (r: Remontee) => r.auteurId === me().id;
  const visible = s.remontees.filter((r) => inScope(r.ecoleId) && (can('remontee.viewAll') || mine(r)));
  const inPhase = (list: Remontee[], p: RemonteePhase) => list.filter((r) => phaseOf(r) === p);
  const attente = inPhase(visible, 'attente');
  const encours = inPhase(visible, 'encours');
  const terminees = inPhase(visible, 'terminee'); // remplacées ou corrigées
  const resolues = visible.filter((r) => treatedAt(r) !== null);
  const byStatut = Object.fromEntries(REMONTEE_STATUTS.map((s) => [s.id, 0])) as Record<RemonteeStatut, number>;
  for (const r of visible) byStatut[r.statut]++;
  const W = 7 * DAY;
  const now = Date.now();
  const start = now - 12 * W;
  // attente et solde : complétés ci-dessous, une fois les semaines comptées
  const weeks = Array.from({ length: 12 }, (_, i) => ({ from: start + i * W, creees: 0, traitees: 0 }) as SemaineRemontees);
  for (const r of visible) {
    const wi = Math.floor((r.createdAt - start) / W);
    if (wi >= 0 && wi < 12) weeks[wi].creees++;
    const done = treatedAt(r);
    if (done) { const wd = Math.floor((done - start) / W); if (wd >= 0 && wd < 12) weeks[wd].traitees++; }
  }
  for (const w of weeks) { w.attente = countAt(visible, Math.min(w.from + W, now), 'attente'); w.solde = w.creees - w.traitees; }
  const recentTraitees = resolues.filter((r) => treatedAt(r)! > now - 30 * DAY);
  const traiteesAvant = resolues.filter((r) => { const t = treatedAt(r)!; return t > now - 60 * DAY && t <= now - 30 * DAY; }).length;
  // Délai de traitement (création → remplacé ou corrigé), médiane sur 12 semaines et sur les 12 précédentes
  const delays = (from: number, to: number) => visible.map((r): [number, number | null] => [r.createdAt, treatedAt(r)]).filter(([, d]) => d !== null && d > from && d <= to).map(([c, d]) => d! - c);
  const delai = { median: median(delays(start, now)), avant: median(delays(start - 12 * W, start)) };
  // Par type de problème et par semaine
  const problemes = PROBLEMS.map((p) => ({ p, values: weeks.map(() => 0) }));
  for (const r of visible) {
    const wi = Math.floor((r.createdAt - start) / W);
    if (wi >= 0 && wi < 12) problemes.find((x) => x.p.id === problem(r.probleme).id)!.values[wi]++;
  }
  const mesRemontees = s.remontees.filter((r) => inScope(r.ecoleId) && mine(r));
  return {
    visible, attente, encours, terminees, byStatut, weeks, recentTraitees, traiteesAvant, delai, problemes,
    attenteAvant: countAt(visible, now - 7 * DAY, 'attente'), // en attente il y a 7 jours
    aTraiter: [...attente, ...encours].sort((a, b) => a.createdAt - b.createdAt), // en attente ou en cours, les plus anciennes d'abord
    mine: mesRemontees, mineAttente: inPhase(mesRemontees, 'attente'),
  };
});

/** Localisations d'une remontée : celles de ses matériels (RG-12, RG-34) */
export function remonteeContext(r: Remontee): RemonteeContext {
  const ix = index();
  const mats = r.materielIds.map((id) => ix.materiel.get(id)).filter(Boolean) as Materiel[];
  const salles = [...new Map(mats.filter((m) => m.salleId).map((m) => [m.salleId, ix.salle.get(m.salleId!)])).values()].filter(Boolean) as Salle[];
  return { mats, salles, first: mats[0] };
}

export type Index = ReturnType<typeof index>;
export type Scope = ReturnType<typeof scope>;
export type Parc = ReturnType<typeof parc>;
export type Remontees = ReturnType<typeof remontees>;

export const detections = () => cached('detections', () => {
  const { salleIds } = scope();
  return store.state.detections.filter((d) => salleIds.has(d.salleId));
});
