/* ==========================================================================
   Sélecteurs : toutes les valeurs affichées sont calculées depuis l'état,
   dans le périmètre de l'école affichée (RG-69). Mémoïsés sur state.rev.
   ========================================================================== */

import { store, me, currentEcole } from './store.js';
import { DEVICE_TYPES } from '#shared/catalog.js';
import { DAY } from '#shared/format.js';
import { can } from './permissions.js';

let memoRev = -1;
let memo = {};
const cached = (key, fn) => {
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

export function locate(m) {
  const salle = m?.salleId ? index().salle.get(m.salleId) : null;
  return { salle, ecole: index().ecole.get(m?.ecoleId) };
}

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
  return { totals, byType, bySalle, byBatiment, stock, sallesEquipees, garanties, recents, topSalles };
});

/** Remontées visibles : toutes (gestionnaire, administrateurs) ou les siennes (formateur) */
export const remontees = () => cached('remontees', () => {
  const s = store.state;
  const mine = (r) => r.auteurId === me().id;
  const visible = s.remontees.filter((r) => inScope(r.ecoleId) && (can('remontee.viewAll') || mine(r)));
  const attente = visible.filter((r) => r.statut === 'attente');
  const traitees = visible.filter((r) => r.statut !== 'attente');
  const byStatut = { attente: attente.length, remplace: 0, corrige: 0 };
  for (const r of traitees) byStatut[r.statut]++;
  const W = 7 * DAY;
  const now = Date.now();
  const start = now - 12 * W;
  const weeks = Array.from({ length: 12 }, (_, i) => ({ from: start + i * W, creees: 0, traitees: 0 }));
  for (const r of visible) {
    const wi = Math.floor((r.createdAt - start) / W);
    if (wi >= 0 && wi < 12) weeks[wi].creees++;
    const done = r.historique.find((h) => h.statut !== 'attente');
    if (done) { const wd = Math.floor((done.at - start) / W); if (wd >= 0 && wd < 12) weeks[wd].traitees++; }
  }
  const recentTraitees = traitees.filter((r) => r.historique.at(-1).at > now - 30 * DAY);
  const mesRemontees = s.remontees.filter((r) => inScope(r.ecoleId) && mine(r));
  return { visible, attente, traitees, byStatut, weeks, recentTraitees, mine: mesRemontees, mineAttente: mesRemontees.filter((r) => r.statut === 'attente') };
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
