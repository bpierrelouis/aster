/* ==========================================================================
   Espace de travail · moteur sans état : révisions, fusion des écritures
   concurrentes par le journal des modifications ; dépôt du mode interface
   seule (fichier local ou mémoire). Le dépôt PostgreSQL (postgres.js) utilise
   le même moteur.
   ========================================================================== */

import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { SEED_VERSION } from '#shared/seed.js';
import { collections, same, keyOf, fail, initialState, actorOf, accountForIdentity, scopedState, rebase, mergeState } from './rules.js';
import { DISCONNECT_AFTER, applyReports, applyResults, markDisconnected, pendingCommands } from './postes.js';
import { reportPdf } from './pdf.js';
import { analyseImport, importMateriels } from './import.js';

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
 * Moteur sans état : chaque opération relit l'état courant dans le dépôt (store), si bien que
 * plusieurs serveurs peuvent servir le même espace de travail.
 * store.read() → état courant, à ne pas modifier.
 * store.write(change) → sous verrou exclusif, relit l'état, appelle change(state, journalDepuis)
 *   qui renvoie { next, result, entry }, enregistre next et l'entrée du journal, puis renvoie
 *   { before, next, result }. journalDepuis(base) donne les entrées de révision supérieure à base.
 * onCommit(before, after) est appelé après chaque enregistrement fait par ce serveur.
 */
export function createEngine({ store, pdf }) {
  const listeners = new Set();
  async function write(change) {
    const { before, next, result } = await store.write(async (state, since) => {
      const out = await change(state, since);
      return { ...out, entry: { revision: out.next.revision, before: diffKeys(state, out.next) } };
    });
    for (const fn of listeners) { try { await fn(before, next); } catch (error) { console.error('Après enregistrement :', error.message); } }
    return result;
  }
  /** Modification par le système (postes, rapprochement d'identité). */
  const system = (mutate) => write((state) => {
    const next = structuredClone(state);
    const result = mutate(next);
    next.revision = state.revision + 1;
    next.rev = (state.rev ?? state.revision) + 1;
    return { next, result };
  });
  return {
    snapshot: () => store.read(),
    onCommit: (fn) => listeners.add(fn),
    actor: async (accountId) => actorOf(await store.read(), accountId),
    findAccount: async (identity) => accountForIdentity(await store.read(), identity),
    read: async (actor) => scopedState(await store.read(), actor),
    update: (input, baseRevision, actor) => write(async (state, since) => {
      const next = mergeState(state, rebase(state, input, baseRevision, await since(baseRevision), actor), actor);
      return { next, result: scopedState(next, actor) };
    }),
    bindIdentity: (accountId, sub) => system((s) => { const c = s.comptes.find((x) => x.id === accountId); if (c) c.sujet = sub; }),
    /** Import JSON : rapprochement des numéros de série avec tout le parc, puis import (import.js) */
    importAnalyse: async (actor, input) => analyseImport(await store.read(), actor, input),
    importMateriels: (actor, input) => write((state) => {
      const { next, bilan } = importMateriels(state, actor, input, Date.now());
      return { next, result: { ...bilan, state: scopedState(next, actor) } };
    }),
    async pdf(reportId, actor) {
      const state = await store.read();
      const report = scopedState(state, actor).remontees.find((r) => r.id === reportId);
      if (!report) fail(404, 'État des lieux introuvable.');
      // Avec stockage : lien signé ; interface seule (sans stockage) : document produit à la demande
      return pdf ? pdf(report, state) : { body: reportPdf(report, state) };
    },
    agent: {
      postes: async () => (await store.read()).postes.map((p) => ({ id: p.id, nomReseau: p.nomReseau, salleId: p.salleId, connecte: p.connecte })),
      rapports: (rapports) => system((s) => { const unknown = applyReports(s, rapports); return { inconnus: unknown, commandes: pendingCommands(s, rapports.map((r) => r.poste)) }; }),
      resultats: (resultats) => system((s) => { applyResults(s, resultats); }),
      async sweep() {
        const stale = (await store.read()).postes.some((p) => p.connecte && (!p.vuLe || Date.now() - p.vuLe >= DISCONNECT_AFTER));
        if (stale) await system((s) => markDisconnected(s));
      },
    },
  };
}

/** Journal des dernières modifications, conservé pour fusionner les écritures concurrentes. */
export const JOURNAL_SIZE = 2000;

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
  // Un seul processus : la file d'écriture tient lieu de verrou ; le journal reste en mémoire.
  const journal = [];
  let queue = Promise.resolve();
  const store = {
    read: async () => state,
    write(change) {
      const op = queue.then(async () => {
        const out = await change(state, async (base) => journal.filter((e) => e.revision > base));
        if (file) {
          await mkdir(dirname(file), { recursive: true });
          await writeFile(`${file}.tmp`, JSON.stringify(out.next), { mode: 0o600 });
          await rename(`${file}.tmp`, file);
        }
        journal.push(out.entry);
        if (journal.length > JOURNAL_SIZE) journal.splice(0, journal.length - JOURNAL_SIZE);
        const before = state;
        state = out.next;
        return { before, next: out.next, result: out.result };
      });
      queue = op.catch(() => {});
      return op;
    },
  };
  return createEngine({ store });
}
