/* ==========================================================================
   Domaine · éléments communs aux règles métier : formes d'écriture,
   erreurs, comparaison et rattachement d'un élément à son école.
   ========================================================================== */

import { randomUUID } from 'node:crypto';
import type { Actor, CollectionName, DisplayPrefs, Id, Item, WorkspaceState, WorkspaceView } from '#shared/types.ts';

type KeyOf<T> = T extends unknown ? keyof T : never;
type ValueOf<T, K extends PropertyKey> = T extends unknown ? (K extends keyof T ? T[K] : never) : never;
/** Élément d'une collection quelconque, traité par les règles communes : toute propriété d'élément, facultative */
export type LooseItem = { id: Id } & { [K in KeyOf<Item>]?: ValueOf<Item, K> };
/** Collections désignées par leur nom */
export type Lists = Record<CollectionName, LooseItem[]>;
/** Écriture du navigateur, préparée sur une révision : forme non vérifiée, contrôlée par mergeState */
export type WorkspaceInput = Partial<Omit<WorkspaceView, CollectionName | 'prefs'> & Lists & { prefs: Partial<DisplayPrefs> }>;
/** Écriture complète préparée comme par le navigateur (tests) : vue lue, puis modifiée librement */
export type Ecriture = Omit<WorkspaceView, CollectionName | 'prefs'> & Lists & Pick<WorkspaceInput, 'prefs'>;
/** Erreur portant le statut HTTP à renvoyer (fail) */
export type HttpError = Error & { status?: number; code?: string };

/**
 * Écriture en cours d'examen par mergeState, transmise aux règles de chaque domaine :
 * état enregistré, état produit, compte agissant, salles et matériels proposés (ou visibles),
 * éléments enregistrés de la collection et derniers numéros attribués.
 */
export interface Contexte {
  state: WorkspaceState;
  next: WorkspaceState;
  actor: Actor;
  now: number;
  salles: LooseItem[];
  materiels: LooseItem[];
  stored: Map<Id, LooseItem>;
  numeros: { materiel: number; remontee: number };
}

export const collections: CollectionName[] = ['ecoles', 'salles', 'etages', 'materiels', 'postes', 'remontees', 'detections', 'applications', 'comptes', 'regles', 'operations', 'processus', 'installations', 'recensements', 'constats'];

// Comparaison indépendante de l'ordre des propriétés : un élément relu en base ne garde pas l'ordre
// dans lequel le navigateur l'a envoyé, et plusieurs serveurs peuvent servir le même espace.
const canonical = (value: unknown) => JSON.stringify(value, (_key, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, v[k]])) : v));
export const same = (a: unknown, b: unknown) => canonical(a) === canonical(b);
export const fail: (status: number, message: string) => never = (status, message) => { throw Object.assign(new Error(message), { status }); };
export const assert: (condition: unknown, message?: string) => asserts condition = (condition, message = 'Données invalides.') => { if (!condition) fail(400, message); };
export const isAdmin = (actor: Actor) => ['admin', 'superadmin'].includes(actor.role);
export const id = (prefix: string) => `${prefix}-${randomUUID().slice(0, 8)}`;
/** Contrôle qu'entre old et x seuls les champs cités ont changé */
export const seulsModifies = (old: LooseItem, x: LooseItem, champs: readonly string[], message: string) => {
  const reste = (r: LooseItem) => Object.fromEntries(Object.entries(r).filter(([k]) => !champs.includes(k)));
  assert(same(reste(old), reste(x)), message);
};

/** École d'un élément : la sienne, sinon celle de sa salle, de son poste ou de son premier poste cible */
export const schoolOf = <E extends Id | null>(item: LooseItem, state: { salles: readonly { id: Id; ecoleId?: E }[]; postes: readonly LooseItem[] }): Id | E | undefined => item.ecoleId ?? state.salles.find((s) => s.id === (item.salleId ?? state.postes.find((p) => p.id === (item.posteId ?? item.cibles?.[0]))?.salleId))?.ecoleId;
