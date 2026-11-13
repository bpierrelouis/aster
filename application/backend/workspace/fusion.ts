/* ==========================================================================
   Espace de travail · fusion des écritures concurrentes : une écriture
   préparée sur une révision ancienne est rejouée sur l'état courant, élément
   par élément ; seul un élément modifié des deux côtés provoque un conflit.
   ========================================================================== */

import { collections, fail, same, strip, visibleTo } from './rules.ts';
import type { Actor, Id, Item, WorkspaceState } from '#shared/types.ts';
import type { JournalEntry } from './engine.ts';
import type { LooseItem, WorkspaceInput } from './rules.ts';

export const keyOf = (c: string, itemId: Id) => `${c}\u0000${itemId}`;

/**
 * Rejoue les modifications du navigateur (préparées sur la révision base) sur l'état courant.
 * log : [{ revision, before: Map(clé → valeur avant modification) }].
 */
export function rebase(state: WorkspaceState, input: WorkspaceInput, base: number, log: JournalEntry[], actor: Actor): WorkspaceInput {
  if (!Number.isInteger(base)) fail(400, 'Révision manquante.');
  if (base === state.revision) return input;
  const entries = log.filter((e) => e.revision > base);
  if (base > state.revision || !entries.length || entries[0].revision !== base + 1) fail(409, 'Les données ont changé. Rechargez la page avant de réessayer.');
  const atBase = new Map<string, Item | undefined>();
  for (const e of entries) for (const [k, v] of e.before) if (!atBase.has(k)) atBase.set(k, v);
  const out = { ...input };
  for (const c of collections) {
    if (!Array.isArray(input[c])) continue;
    const list: (LooseItem | null)[] = [...input[c]];
    const index = new Map(list.map((x, i) => [x!.id, i] as const));
    for (const [k, baseItem] of atBase) {
      const [col, itemId] = k.split('\u0000');
      if (col !== c) continue;
      const current = state[c].find((x) => x.id === itemId);
      const currentView = visibleTo(c, current, state, actor) ? strip(c, current!) : undefined;
      const baseView = visibleTo(c, baseItem, state, actor) ? strip(c, baseItem!) : undefined;
      const client = index.has(itemId) ? list[index.get(itemId)!] : undefined;
      if (same(client, currentView)) continue;
      if (!same(client, baseView)) fail(409, 'Cet élément a été modifié entre-temps. Rechargez la page avant de réessayer.');
      // Élément non modifié par le navigateur : la version courante s'applique
      if (currentView && index.has(itemId)) list[index.get(itemId)!] = currentView;
      else if (currentView) { index.set(itemId, list.length); list.push(currentView); }
      else if (index.has(itemId)) list.splice(index.get(itemId)!, 1, null);
    }
    out[c] = list.filter(Boolean) as LooseItem[];
  }
  return out;
}
