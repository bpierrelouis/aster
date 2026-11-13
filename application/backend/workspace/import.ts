/* ==========================================================================
   Espace de travail · import JSON des matériels (orientation de l'utilisateur
   du 11 novembre, cadrage § 23). Les numéros de série du fichier sont
   rapprochés de tout le parc, toutes écoles comprises, ce que le navigateur
   ne peut pas faire (il ne voit que son école) :
   - déjà présent dans l'école de destination, ou répété dans le fichier :
     la ligne n'est pas traitée ;
   - présent dans une autre école : le matériel existant est transféré si
     l'importeur l'a validé (échange entre écoles), sauf s'il est cité par
     une remontée en cours de son école ou si, hors service, le fichier le
     place dans une salle ; sinon la ligne n'est pas traitée ;
   - inconnu : un nouveau matériel est créé, avec les contrôles d'une
     création (identifiant ORION attribué, salle de l'école).
   Un matériel importé ou transféré est là où le fichier le déclare : pas de
   déplacement physique à suivre.
   ========================================================================== */

import { serieKey, remonteeOuverte } from '#shared/catalog.ts';
import { assert, fail, id, mergeState, scopedState } from './rules.ts';
import type { Actor, Id, Materiel, WorkspaceState } from '#shared/types.ts';
import type { LooseItem } from './rules.ts';

/** Demande d'analyse : école de destination et numéros de série du fichier ; contrôlée ici */
export interface ImportAnalyseInput { ecoleId?: Id; series?: unknown[] }
/** Import : lignes du fichier et numéros de série dont le transfert est validé ; contrôlé ici et par mergeState */
export interface ImportInput { ecoleId?: Id; materiels?: Record<string, unknown>[]; transferts?: unknown[] }

const FIELDS: (keyof Materiel)[] = ['type', 'modele', 'marque', 'serie', 'dateReception', 'garantieFin', 'hs', 'salleId'];

function checkTarget(state: WorkspaceState, actor: Actor, ecoleId: Id | undefined) {
  if (!['superadmin', 'admin', 'gestionnaire'].includes(actor.role)) fail(403, 'Import réservé aux gestionnaires et administrateurs.');
  assert(state.ecoles.some((e) => e.id === ecoleId) && (actor.role === 'superadmin' || actor.ecoleId === ecoleId), 'École de destination invalide.');
}

/** Matériels cités par une remontée ouverte (non terminée) : leur école doit pouvoir la traiter jusqu'au bout */
const inOpenReport = (state: WorkspaceState) => new Set(state.remontees.filter(remonteeOuverte).flatMap((r) => r.materielIds));

/** Matériel connu par numéro de série, celui de l'école de destination en priorité */
function knownSeries(state: WorkspaceState, ecoleId: Id | undefined) {
  const known = new Map<string, Materiel>();
  for (const m of state.materiels) {
    const k = serieKey(m.serie);
    if (k && (!known.has(k) || m.ecoleId === ecoleId)) known.set(k, m);
  }
  return known;
}

/** Correspondances des numéros de série d'un fichier, par numéro normalisé */
export function analyseImport(state: WorkspaceState, actor: Actor, { ecoleId, series }: ImportAnalyseInput = {}) {
  checkTarget(state, actor, ecoleId);
  assert(Array.isArray(series) && series.length <= 2000, 'Numéros de série invalides.');
  const known = knownSeries(state, ecoleId);
  const open = inOpenReport(state);
  const out: Record<string, { idOrion: string; modele: string; ecoleId: Id; ecole: string; hs: boolean; bloque: string | null }> = {};
  for (const k of new Set(series.map(serieKey).filter(Boolean) as string[])) {
    const m = known.get(k);
    if (!m) continue;
    const other = m.ecoleId !== ecoleId;
    out[k] = {
      idOrion: m.idOrion, modele: m.modele, ecoleId: m.ecoleId, ecole: state.ecoles.find((e) => e.id === m.ecoleId)?.nom ?? '', hs: m.hs,
      bloque: other && open.has(m.id) ? 'Cité par une remontée en cours dans son école' : null,
    };
  }
  return out;
}

/** Import : nouveaux matériels créés, transferts validés appliqués, le reste ignoré. Renvoie l'état suivant et le bilan. */
export function importMateriels(state: WorkspaceState, actor: Actor, { ecoleId, materiels, transferts }: ImportInput = {}, now = Date.now()) {
  checkTarget(state, actor, ecoleId);
  assert(Array.isArray(materiels) && materiels.length > 0 && materiels.length <= 2000, 'Import invalide.');
  const allowed = new Set((Array.isArray(transferts) ? transferts : []).map(serieKey).filter(Boolean));
  const known = knownSeries(state, ecoleId);
  const open = inOpenReport(state);
  const seen = new Set();
  const nouveaux: Partial<Materiel>[] = [];
  const moves: { id: Id; salleId: unknown }[] = [];
  let ignores = 0;
  for (const row of materiels) {
    assert(row && typeof row === 'object' && !Array.isArray(row), 'Import invalide.');
    const k = serieKey(row.serie);
    if (k && seen.has(k)) { ignores++; continue; } // répété dans le fichier
    if (k) seen.add(k);
    const m = k && known.get(k);
    if (!m) nouveaux.push(Object.fromEntries(FIELDS.filter((f) => row[f] !== undefined).map((f) => [f, row[f]])));
    // Un matériel hors service ne peut aller qu'au stock (rules.ts) : son transfert vers une salle n'est pas traité
    else if (m.ecoleId !== ecoleId && allowed.has(k) && !open.has(m.id) && !(m.hs && row.salleId)) moves.push({ id: m.id, salleId: row.salleId || null });
    else ignores++;
  }
  assert(nouveaux.length + moves.length > 0, 'Aucun nouveau matériel à importer.');

  // Nouveaux matériels : même écriture qu'une création depuis l'interface (seul le parc est transmis :
  // les autres collections et les préférences du compte restent inchangées)
  const created: LooseItem[] = nouveaux.map((r) => ({ hs: false, salleId: null, marque: null, serie: null, garantieFin: null, type: 'autre', ...r, id: id('m'), ecoleId }));
  const next = mergeState(state, { role: actor.role, materiels: [...scopedState(state, actor).materiels, ...created] }, actor, now);
  // Transferts : le matériel existant (identifiant ORION conservé) rejoint l'école de destination
  for (const t of moves) {
    assert(!t.salleId || next.salles.some((s) => s.id === t.salleId && s.ecoleId === ecoleId), 'Salle inconnue ou hors école.');
    const m = next.materiels.find((x) => x.id === t.id)!;
    Object.assign(m, { ecoleId, salleId: t.salleId });
    delete m.deplacement;
    delete m.installation;
  }
  return { next, bilan: { ajoutes: nouveaux.length, transferes: moves.length, ignores } };
}
