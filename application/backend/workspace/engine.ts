/* ==========================================================================
   Espace de travail · moteur sans état : révisions, fusion des écritures
   concurrentes par le journal des modifications ; dépôt du mode interface
   seule (fichier local ou mémoire). Le dépôt PostgreSQL (postgres.ts) utilise
   le même moteur.
   ========================================================================== */

import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { SEED_VERSION } from '#shared/seed.ts';
import { collections, same, fail, initialState, actorOf, accountForIdentity, scopedState, mergeState, schoolOf } from './rules.ts';
import { keyOf, parseKey, rebase } from './fusion.ts';
import { journal, raison } from '../journal.ts';
import { DISCONNECT_AFTER, applyReports, applyResults, markDisconnected, pendingCommands } from './postes.ts';
import { reportPdf } from './pdf.ts';
import { analyseImport, importMateriels } from './import.ts';
import { appairage, appliquerEvenements, campagnesPubliees, dechiffrerEvenements } from './recensement.ts';
import type { Bloc } from '#shared/recon.ts';
import type { Actor, Id, Item, WorkspaceState } from '#shared/types.ts';
import type { WorkspaceInput } from './rules.ts';
import type { Rapport, Resultat } from './postes.ts';
import type { ImportAnalyseInput, ImportInput } from './import.ts';

/** Entrée du journal : révision produite et valeur avant modification de chaque élément modifié (clé : keyOf) */
export interface JournalEntry { revision: number; before: Map<string, Item | undefined> }
/** Entrées du journal de révision supérieure à base */
export type Since = (base: number) => Promise<JournalEntry[]>;
interface Change<R> { next: WorkspaceState; result: R }
export interface Committed<R> extends Change<R> { before: WorkspaceState }
/** Dépôt de l'espace de travail (fichier, mémoire ou PostgreSQL) */
export interface Store {
  read(): Promise<WorkspaceState>;
  write<R>(change: (state: WorkspaceState, since: Since) => Promise<Change<R> & { entry: JournalEntry }>): Promise<Committed<R>>;
}

/** Éléments modifiés par collection : { materiels: "M1,M2", remontees: "R3" }, au plus 20 identifiants par collection */
function elements(keys: string[]) {
  const parCollection: Record<string, string[]> = {};
  for (const key of keys) { const [c, id] = parseKey(key); (parCollection[c] ??= []).push(id); }
  return Object.fromEntries(Object.entries(parCollection).map(([c, ids]) => [c, ids.length > 20 ? `${ids.slice(0, 20).join(',')},+${ids.length - 20}` : ids.join(',')]));
}

function diffKeys(before: WorkspaceState, after: WorkspaceState) {
  const changed = new Map<string, Item | undefined>();
  for (const c of collections) {
    const old = new Map<Id, Item>((before[c] ?? []).map((x) => [x.id, x]));
    const ids = new Set<Id>();
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
export function createEngine({ store }: { store: Store }) {
  const listeners = new Set<(before: WorkspaceState, after: WorkspaceState) => unknown>();
  /** auteur : compte à l'origine de l'écriture, journalisée avec les éléments modifiés (les écritures du système ne le sont pas) */
  async function write<R>(change: (state: WorkspaceState, since: Since) => Change<R> | Promise<Change<R>>, auteur?: Actor) {
    let modifies: string[] = [];
    const { before, next, result } = await store.write(async (state, since) => {
      const out = await change(state, since);
      const entry = { revision: out.next.revision, before: diffKeys(state, out.next) };
      modifies = [...entry.before.keys()];
      return { ...out, entry };
    });
    if (auteur) journal.info('enregistrement', { compte: auteur.id, profil: auteur.role, revision: next.revision, ...elements(modifies) });
    for (const fn of listeners) { try { await fn(before, next); } catch (error) { journal.error('apres_enregistrement', { erreur: raison(error) }); } }
    return result;
  }
  /** Modification par le système (postes, rapprochement d'identité). */
  const system = <R>(mutate: (s: WorkspaceState) => R) => write((state) => {
    const next = structuredClone(state);
    const result = mutate(next);
    next.revision = state.revision + 1;
    return { next, result };
  });
  return {
    snapshot: () => store.read(),
    onCommit: (fn: (before: WorkspaceState, after: WorkspaceState) => unknown) => listeners.add(fn),
    actor: async (accountId: Id) => actorOf(await store.read(), accountId),
    findAccount: async (identity: { sub?: string; email?: string | null }) => accountForIdentity(await store.read(), identity),
    read: async (actor: Actor) => scopedState(await store.read(), actor),
    /** baseRevision : révision annoncée par le navigateur, contrôlée par rebase */
    update: (input: WorkspaceInput, baseRevision: number, actor: Actor) => write(async (state, since) => {
      const next = mergeState(state, rebase(state, input, baseRevision, await since(baseRevision), actor), actor);
      return { next, result: scopedState(next, actor) };
    }, actor),
    /** Connexion réussie : identité rapprochée (sujet OIDC, absent en mode interface seule) et date de dernière connexion, fixées par le serveur */
    connexion: (accountId: Id, sub?: string) => system((s) => {
      const c = s.comptes.find((x) => x.id === accountId);
      if (!c) return;
      if (sub) c.sujet = sub;
      c.derniereConnexion = Date.now();
    }),
    /** Import JSON : rapprochement des numéros de série avec tout le parc, puis import (import.ts) */
    importAnalyse: async (actor: Actor, input: ImportAnalyseInput) => analyseImport(await store.read(), actor, input),
    importMateriels: (actor: Actor, input: ImportInput) => write((state) => {
      const { next, bilan } = importMateriels(state, actor, input, Date.now());
      return { next, result: { ...bilan, state: scopedState(next, actor) } };
    }, actor),
    /** État des lieux PDF, produit à la demande avec les informations actuelles, dans le périmètre du compte */
    async pdf(reportId: string, actor: Actor) {
      const state = await store.read();
      const report = scopedState(state, actor).remontees.find((r) => r.id === reportId);
      if (!report) fail(404, 'État des lieux introuvable.');
      return reportPdf(report, state);
    },
    /** Recensement mobile (recensement.ts) : appairage d'un téléphone, campagnes publiées et constats reçus par le connecteur */
    recon: {
      appairage: async (actor: Actor, id: Id, config: { secret: string; url: string | null }) => appairage(await store.read(), actor, id, config),
      campagnes: async (secret: string) => campagnesPubliees(await store.read(), secret),
      async evenements(secret: string, campagne: Id, blocs: { id: string; bloc: Bloc }[]) {
        const evenements = await dechiffrerEvenements(secret, campagne, blocs);
        return system((s) => appliquerEvenements(s, campagne, evenements));
      },
    },
    agent: {
      postes: async () => {
        const s = await store.read();
        const hs = new Set<Id | null>(s.materiels.filter((m) => m.hs).map((m) => m.id));
        return s.postes.map((p) => ({ id: p.id, nomReseau: p.nomReseau, salleId: p.salleId, ecoleId: schoolOf(p, s) ?? null, allume: p.allume, horsService: hs.has(p.materielId) }));
      },
      rapports: (rapports: Rapport[]) => system((s) => { const unknown = applyReports(s, rapports); return { inconnus: unknown, commandes: pendingCommands(s, rapports.map((r) => r.poste)) }; }),
      resultats: (resultats: Resultat[]) => system((s) => { applyResults(s, resultats); }),
      async sweep() {
        const stale = (await store.read()).postes.some((p) => p.allume && (!p.vuLe || Date.now() - p.vuLe >= DISCONNECT_AFTER));
        if (stale) await system((s) => markDisconnected(s));
      },
    },
  };
}
/** Moteur de l'espace de travail, quel que soit son dépôt */
export type Engine = ReturnType<typeof createEngine>;

/** Journal des dernières modifications, conservé pour fusionner les écritures concurrentes. */
export const JOURNAL_SIZE = 2000;

/** Mode interface seule : fichier local (ou mémoire). */
export async function createWorkspaceRepository({ file, initialState: provided }: { file?: string; initialState?: WorkspaceState } = {}) {
  let state = provided ?? initialState();
  if (file && !provided) {
    try {
      const saved = JSON.parse(await readFile(file, 'utf8')) as WorkspaceState;
      if (saved.version === SEED_VERSION) state = saved; // un jeu plus ancien est régénéré
    } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  }
  for (const c of collections) state[c] ??= [];
  state.revision ??= 0;
  state.preferences ??= {};
  // Un seul processus : la file d'écriture tient lieu de verrou ; le journal reste en mémoire.
  const journal: JournalEntry[] = [];
  let queue: Promise<unknown> = Promise.resolve();
  const store: Store = {
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
