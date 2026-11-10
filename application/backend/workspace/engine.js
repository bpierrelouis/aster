/* ==========================================================================
   Espace de travail · moteur : file d'écriture, révisions, journal des
   modifications ; dépôt du mode interface seule (fichier local ou mémoire).
   Le dépôt PostgreSQL (postgres.js) utilise le même moteur.
   ========================================================================== */

import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { SEED_VERSION } from '#shared/seed.js';
import { collections, same, keyOf, fail, initialState, actorOf, accountForIdentity, scopedState, rebase, mergeState } from './rules.js';
import { DISCONNECT_AFTER, applyReports, applyResults, markDisconnected, pendingCommands } from './postes.js';
import { reportPdf } from './pdf.js';

function diffKeys(before, after) {
  const changed = new Map();
  for (const c of collections) {
    const old = new Map((before[c] ?? []).map((x) => [x.id, x]));
    const ids = new Set();
    for (const x of after[c] ?? []) { ids.add(x.id); if (!same(x, old.get(x.id))) changed.set(keyOf(c, x.id), old.get(x.id)); }
    for (const [itemId, x] of old) if (!ids.has(itemId)) changed.set(keyOf(c, itemId), x);
  }
  return changed;
}

/**
 * persist(before, after) enregistre une nouvelle révision (fichier ou PostgreSQL).
 * onCommit(before, after) est appelé après enregistrement.
 */
export function createEngine({ state: initial, persist, pdf }) {
  let state = initial;
  const log = [];
  const listeners = new Set();
  let queue = Promise.resolve();
  const run = (task) => { const op = queue.then(task); queue = op.catch(() => {}); return op; };
  async function commit(next) {
    await persist(state, next);
    log.push({ revision: next.revision, before: diffKeys(state, next) });
    if (log.length > 2000) log.splice(0, log.length - 2000);
    const before = state;
    state = next;
    for (const fn of listeners) { try { await fn(before, next); } catch (error) { console.error('Après enregistrement :', error.message); } }
  }
  /** Modification par le système (postes, rapprochement d'identité). */
  const system = (mutate) => run(async () => {
    const next = structuredClone(state);
    const result = mutate(next);
    next.revision = state.revision + 1;
    next.rev = (state.rev ?? state.revision) + 1;
    await commit(next);
    return result;
  });
  return {
    get state() { return state; },
    onCommit: (fn) => listeners.add(fn),
    actor: (accountId) => actorOf(state, accountId),
    findAccount: (identity) => accountForIdentity(state, identity),
    read: (actor) => scopedState(state, actor),
    update: (input, baseRevision, actor) => run(async () => {
      const next = mergeState(state, rebase(state, input, baseRevision, log, actor), actor);
      await commit(next);
      return scopedState(state, actor);
    }),
    bindIdentity: (accountId, sub) => system((s) => { const c = s.comptes.find((x) => x.id === accountId); if (c) c.sujet = sub; }),
    async pdf(reportId, actor) {
      const report = scopedState(state, actor).remontees.find((r) => r.id === reportId);
      if (!report) fail(404, 'État des lieux introuvable.');
      // Avec stockage : lien signé ; interface seule (sans stockage) : document produit à la demande
      return pdf ? pdf(report, state) : { body: reportPdf(report, state) };
    },
    agent: {
      postes: () => state.postes.map((p) => ({ id: p.id, nomReseau: p.nomReseau, salleId: p.salleId, connecte: p.connecte })),
      rapports: (rapports) => system((s) => { const unknown = applyReports(s, rapports); return { inconnus: unknown, commandes: pendingCommands(s, rapports.map((r) => r.poste)) }; }),
      resultats: (resultats) => system((s) => { applyResults(s, resultats); }),
      sweep: () => (state.postes.some((p) => p.connecte && (!p.vuLe || Date.now() - p.vuLe >= DISCONNECT_AFTER)) ? system((s) => markDisconnected(s)) : Promise.resolve()),
    },
  };
}

/** Mode interface seule : fichier local (ou mémoire). */
export async function createWorkspaceRepository({ file, initialState: provided } = {}) {
  let state = provided ?? initialState();
  if (file && !provided) {
    try {
      const saved = JSON.parse(await readFile(file, 'utf8'));
      if (saved.version === SEED_VERSION) state = saved; // un jeu plus ancien est régénéré
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  for (const c of collections) state[c] ??= [];
  state.revision ??= 0;
  state.preferences ??= {};
  return createEngine({
    state,
    async persist(_before, next) {
      if (!file) return;
      await mkdir(dirname(file), { recursive: true });
      await writeFile(`${file}.tmp`, JSON.stringify(next), { mode: 0o600 });
      await rename(`${file}.tmp`, file);
    },
  });
}
