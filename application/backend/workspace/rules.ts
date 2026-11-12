/* ==========================================================================
   Espace de travail · règles métier communes aux deux modes
   (postes : postes.ts ; import JSON : import.ts ; moteur d'écriture :
   engine.ts ; API : routes.ts)
   - Les droits s'appliquent au compte ORION connecté (profil, école).
   - Les valeurs d'autorité (auteur, dates, numéros, identifiants ORION,
     suivi des interventions) sont fixées par le serveur.
   - Les processus, détections et installations ne sont alimentés que par
     les postes (API d'agent) ; les utilisateurs demandent des interventions.
   - Les écritures concurrentes sont fusionnées élément par élément : seul
     un élément modifié des deux côtés provoque un conflit.
   ========================================================================== */

import { randomUUID } from 'node:crypto';
import { seed, defaultLayouts } from '#shared/seed.ts';
import { displayPrefs } from '#shared/ambiance.ts';
import { DAY } from '#shared/format.ts';
import { initializeOperations } from '#shared/operations-data.ts';
import type { Actor, CollectionName, Collections, DisplayPrefs, Id, Item, OperationType, PreferencesCompte, RemonteeStatut, RoleId, WorkspaceState, WorkspaceView } from '#shared/types.ts';
import type { JournalEntry } from './engine.ts';

type KeyOf<T> = T extends unknown ? keyof T : never;
type ValueOf<T, K extends PropertyKey> = T extends unknown ? (K extends keyof T ? T[K] : never) : never;
/** Élément d'une collection quelconque, traité par les règles communes : toute propriété d'élément, facultative */
export type LooseItem = { id: Id } & { [K in KeyOf<Item>]?: ValueOf<Item, K> };
/** Collections désignées par leur nom */
export type Lists = Record<CollectionName, LooseItem[]>;
/** Écriture du navigateur, préparée sur une révision : forme non vérifiée, contrôlée par mergeState */
export type WorkspaceInput = Partial<Omit<WorkspaceView, CollectionName | 'prefs'> & Lists & { prefs: Partial<DisplayPrefs> }>;
/** Erreur portant le statut HTTP à renvoyer (fail) */
export type HttpError = Error & { status?: number; code?: string };

export const collections: CollectionName[] = ['ecoles', 'salles', 'etages', 'materiels', 'postes', 'remontees', 'detections', 'applications', 'comptes', 'regles', 'operations', 'processus', 'installations'];
export const ROLES: readonly string[] = ['superadmin', 'admin', 'gestionnaire', 'formateur'] satisfies RoleId[];
const OPERATION_TYPES: readonly string[] = ['installation', 'desinstallation', 'reinstallation', 'arret'] satisfies OperationType[];
const SERVER_FIELDS: Partial<Record<CollectionName, Exclude<keyof LooseItem, 'id'>[]>> = { comptes: ['sujet'] }; // jamais transmis au navigateur

// Comparaison indépendante de l'ordre des propriétés : un élément relu en base ne garde pas l'ordre
// dans lequel le navigateur l'a envoyé, et plusieurs serveurs peuvent servir le même espace.
const canonical = (value: unknown) => JSON.stringify(value, (_key, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, v[k]])) : v));
export const same = (a: unknown, b: unknown) => canonical(a) === canonical(b);
export const fail: (status: number, message: string) => never = (status, message) => { throw Object.assign(new Error(message), { status }); };
export const assert: (condition: unknown, message?: string) => asserts condition = (condition, message = 'Données invalides.') => { if (!condition) fail(400, message); };
const isAdmin = (actor: Actor) => ['admin', 'superadmin'].includes(actor.role);
export const id = (prefix: string) => `${prefix}-${randomUUID().slice(0, 8)}`;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Données de départ : référentiels, parc et interventions de la simulation ; aucune activité de poste avant le premier rapport. */
export function initialState(): WorkspaceState {
  const state = initializeOperations(seed());
  Object.assign(state, { processus: [], detections: [], installations: [], revision: 0 });
  for (const p of state.postes) { p.allume = false; p.session = null; p.vuLe = null; }
  return state as WorkspaceState; // complété par Object.assign
}

/** Un poste dont l'unité centrale est hors service ne peut être ni allumé ni connecté : il s'éteint, ses processus s'arrêtent. */
export function eteindreHorsService(s: WorkspaceState, now = Date.now()) {
  const hs = new Set<Id | null>(s.materiels.filter((m) => m.hs).map((m) => m.id));
  for (const p of s.postes) {
    if (!p.allume || !hs.has(p.materielId)) continue;
    Object.assign(p, { allume: false, session: null });
    for (const proc of s.processus) if (proc.posteId === p.id && !proc.stoppedAt) proc.stoppedAt = now;
  }
}

/* ---------- Comptes et identité ---------- */

/** Utilisateur agissant : compte actif uniquement. */
export function actorOf(state: WorkspaceState, accountId: Id): Actor | null {
  const c = state.comptes.find((x) => x.id === accountId);
  return c && c.actif ? { id: c.id, nom: c.nom, email: c.email, role: c.role, ecoleId: c.ecoleId ?? null } : null;
}

/** Compte correspondant à une identité du fournisseur (sujet OIDC, sinon adresse électronique). */
export function accountForIdentity(state: WorkspaceState, { sub, email }: { sub?: string; email?: string | null }) {
  const bySubject = sub && state.comptes.find((c) => c.sujet === sub);
  if (bySubject) return bySubject;
  const mail = String(email ?? '').toLowerCase();
  const byEmail = mail && state.comptes.find((c) => c.email.toLowerCase() === mail);
  if (byEmail && byEmail.sujet && byEmail.sujet !== sub) return null; // adresse reprise par une autre identité
  return byEmail ?? null;
}

/* ---------- Visibilité ---------- */

export const schoolOf = <E extends Id | null>(item: LooseItem, state: { salles: readonly { id: Id; ecoleId?: E }[]; postes: readonly LooseItem[] }): Id | E | undefined => item.ecoleId ?? state.salles.find((s) => s.id === (item.salleId ?? state.postes.find((p) => p.id === (item.posteId ?? item.cibles?.[0]))?.salleId))?.ecoleId;

function visibleTo(collection: CollectionName, item: LooseItem | undefined, state: WorkspaceState, actor: Actor) {
  if (!item) return false;
  if (collection === 'applications') return true;
  if (collection === 'regles' && item.portee === 'global') return isAdmin(actor);
  if (actor.role === 'superadmin') return true;
  if (collection === 'ecoles') return item.id === actor.ecoleId;
  if (schoolOf(item, state) !== actor.ecoleId) return false;
  if (['comptes', 'regles'].includes(collection)) return isAdmin(actor);
  if (collection === 'operations') return isAdmin(actor) || (actor.role === 'formateur' && item.type === 'arret');
  if (['postes', 'processus', 'detections', 'installations'].includes(collection)) return actor.role !== 'gestionnaire';
  if (collection === 'remontees' && actor.role === 'formateur') return item.auteurId === actor.id;
  return true;
}

const strip = <T extends LooseItem>(collection: CollectionName, item: T): T => {
  const fields = SERVER_FIELDS[collection];
  if (!fields) return item;
  const copy = { ...item };
  for (const f of fields) delete copy[f];
  return copy;
};

function preferencesOf(state: WorkspaceState, actor: Actor) {
  const p: PreferencesCompte = state.preferences?.[actor.id] ?? {};
  return {
    prefs: displayPrefs(p.prefs),
    layouts: { [actor.role]: p.layouts ?? defaultLayouts()[actor.role] },
    seenAt: { [actor.role]: p.seenAt ?? (state.seededAt ?? Date.now()) - 3 * DAY },
    ecoleId: actor.role === 'superadmin' ? (p.ecoleId ?? state.ecoles[0]?.id ?? 'all') : actor.ecoleId,
  };
}

/** Données transmises au navigateur pour ce compte. */
export function scopedState(state: WorkspaceState, actor: Actor): WorkspaceView {
  const result: Omit<WorkspaceView, CollectionName> & Partial<Lists> = { version: state.version, revision: state.revision, rev: state.rev ?? state.revision, seededAt: state.seededAt, role: actor.role, moi: { ...actor }, ...preferencesOf(state, actor) };
  for (const c of collections) result[c] = structuredClone((state[c] ?? []).filter((x) => visibleTo(c, x, state, actor)).map((x) => strip(c, x)));
  return result as WorkspaceView; // chaque collection ne contient que ses éléments
}

/* ---------- Fusion des écritures concurrentes ---------- */

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

/* ---------- Écritures des utilisateurs ---------- */

export function mergeState(state: WorkspaceState, input: WorkspaceInput, actor: Actor, now = Date.now()): WorkspaceState {
  assert(input && typeof input === 'object' && !Array.isArray(input));
  if (input.role !== actor.role) fail(403, 'Le profil est défini par la connexion.');
  const visible = Object.fromEntries(collections.map((c) => [c, state[c].filter((x) => visibleTo(c, x, state, actor))])) as Pick<Collections, CollectionName>;
  const next = structuredClone(state);
  let lastOrionId = Math.max(0, ...state.materiels.map((m) => Number(String(m.idOrion).slice(4)) || 0));
  let lastReportId = Math.max(100, ...state.remontees.map((r) => Number(String(r.id).slice(4)) || 0));
  const salles = Array.isArray(input.salles) ? input.salles : visible.salles;
  const materiels = Array.isArray(input.materiels) ? input.materiels : visible.materiels;

  for (const c of collections) {
    const proposed: LooseItem[] = input[c] ?? visible[c].map((x) => strip(c, x));
    assert(Array.isArray(proposed) && proposed.length <= 20000);
    const ids = new Set<unknown>();
    for (const x of proposed) { assert(x && typeof x.id === 'string' && x.id.length < 150 && !ids.has(x.id)); ids.add(x.id); }
    const before = new Map<Id, LooseItem>(visible[c].map((x) => [x.id, x]));
    const changes = proposed.filter((x) => !same(x, before.has(x.id) ? strip(c, before.get(x.id)!) : undefined));
    const deleted: LooseItem[] = visible[c].filter((x) => !ids.has(x.id));
    if (!changes.length && !deleted.length) continue;

    if (c === 'ecoles' && actor.role !== 'superadmin') fail(403, 'Action réservée au super administrateur.');
    if (['salles', 'etages', 'applications', 'comptes', 'regles'].includes(c) && !isAdmin(actor)) fail(403, 'Action réservée aux administrateurs.');
    if (['processus', 'detections', 'installations'].includes(c)) fail(403, 'Ces données sont remontées par les postes.');
    if (c === 'materiels' && actor.role === 'formateur') fail(403, 'Modification du parc non autorisée.');
    if (c === 'materiels' && deleted.length && !isAdmin(actor)) fail(403, 'Suppression réservée aux administrateurs.');
    if (c === 'postes' && !isAdmin(actor)) fail(403, 'Action réservée aux administrateurs.');
    if (c === 'comptes' && deleted.length) fail(403, 'Un compte se désactive ; il n’est pas supprimé.');
    if (c === 'operations' && deleted.length) fail(403, 'Une demande d’intervention ne peut pas être supprimée.');
    if (c === 'remontees' && deleted.length) fail(403, 'La suppression de remontées est indisponible.');
    if (c === 'regles' && actor.role !== 'superadmin' && deleted.some((x) => x.portee === 'global')) fail(403, 'Règle globale réservée au super administrateur.');

    for (const x of changes) {
      if (c === 'remontees' && !before.has(x.id)) x.id = `REM-${String(++lastReportId).padStart(4, '0')}`;
      if (c === 'operations' && !before.has(x.id)) x.id = id('op');
      const old = before.get(x.id);
      if (!old && state[c].some((other) => other.id === x.id)) fail(409, 'Cet identifiant existe déjà.');
      const global = ['ecoles', 'applications'].includes(c) || (c === 'regles' && x.portee === 'global' && actor.role === 'superadmin') || (c === 'comptes' && x.role === 'superadmin' && actor.role === 'superadmin');
      if (!global && actor.role !== 'superadmin' && schoolOf(x, { ...next, salles }) !== actor.ecoleId) fail(403, 'Ressource hors de votre école.');
      if (old && (old.ecoleId ?? null) !== (x.ecoleId ?? null) && c !== 'comptes') fail(403, 'Le rattachement à une école ne peut pas être modifié.');
      if (c === 'regles' && (x.portee === 'global' || old?.portee === 'global') && actor.role !== 'superadmin') fail(403, 'Règle globale réservée au super administrateur.');

      if (c === 'comptes') {
        assert(typeof x.nom === 'string' && x.nom.trim() && x.nom.length <= 120, 'Nom obligatoire.');
        assert(typeof x.email === 'string' && EMAIL.test(x.email) && x.email.length <= 254, 'Adresse électronique invalide.');
        x.email = x.email.trim().toLowerCase();
        assert(ROLES.includes(x.role!), 'Profil inconnu.');
        assert(typeof x.actif === 'boolean');
        if (x.role === 'superadmin') { if (actor.role !== 'superadmin') fail(403, 'Profil réservé au super administrateur.'); x.ecoleId = null; }
        else assert(next.ecoles.some((e) => e.id === x.ecoleId), 'École de rattachement obligatoire.');
        if (actor.role !== 'superadmin' && x.ecoleId !== actor.ecoleId) fail(403, 'Ressource hors de votre école.');
        assert(!state.comptes.some((o) => o.id !== x.id && o.email.toLowerCase() === x.email), 'Cette adresse est déjà utilisée par un autre compte.');
        if (old?.id === actor.id) assert(x.actif && x.role === old.role && (x.ecoleId ?? null) === (old.ecoleId ?? null), 'Vous ne pouvez pas modifier votre propre profil ni désactiver votre compte.');
        const stored = state.comptes.find((o) => o.id === x.id);
        if (stored?.sujet && stored.email.toLowerCase() === x.email) x.sujet = stored.sujet; // identité déjà rapprochée
      }
      if (c === 'operations') {
        if (old) fail(403, 'Le suivi d’une intervention est mis à jour par les postes.');
        assert(OPERATION_TYPES.includes(x.type!), 'Intervention inconnue.');
        if (!isAdmin(actor)) assert(actor.role === 'formateur' && x.type === 'arret', 'Action réservée aux administrateurs.');
        // Cible : une salle entière, dont le serveur fixe les postes, ou des postes d'une même salle
        if (x.salleId && x.type !== 'arret') {
          x.cibles = next.postes.filter((p) => p.salleId === x.salleId).map((p) => p.id);
          assert(x.cibles.length, 'Cette salle ne compte aucun poste.');
        } else {
          delete x.salleId;
          assert(Array.isArray(x.cibles) && x.cibles.length, 'Choisissez au moins un poste.');
        }
        assert(x.cibles.length <= 500 && new Set(x.cibles).size === x.cibles.length, 'Postes cibles invalides.');
        const postes = x.cibles.map((pid) => next.postes.find((p) => p.id === pid));
        assert(postes.every((p) => p && (actor.role === 'superadmin' || schoolOf(p, next) === actor.ecoleId)), 'Postes hors périmètre.');
        assert(new Set(postes.map((p) => p!.salleId)).size === 1, 'Une intervention concerne une seule salle.');
        if (x.type === 'arret') {
          const proc = next.processus.find((p) => p.id === x.processusId);
          assert(x.cibles.length === 1 && proc && !proc.stoppedAt && proc.posteId === x.cibles[0], 'Seul un processus en cours peut être arrêté.');
          assert(!next.operations.some((o) => o.type === 'arret' && o.processusId === proc.id && o.statut === 'enregistree'), 'Un arrêt est déjà demandé pour ce processus.');
        }
        if (['installation', 'desinstallation'].includes(x.type!)) assert(next.applications.some((a) => a.id === x.applicationId), 'Application inconnue.');
        Object.assign(x, { ecoleId: schoolOf(postes[0]!, next), at: now, par: actor.nom, parId: actor.id, statut: 'enregistree', resultats: Object.fromEntries(x.cibles.map((pid) => [pid, 'en_attente'])) });
      }
      if (c === 'remontees') {
        if (!old) {
          if (actor.role === 'gestionnaire') fail(403, 'Création de remontée non autorisée.');
          Object.assign(x, { auteur: actor.nom, auteurId: actor.id, createdAt: now, statut: 'attente', historique: [{ statut: 'attente', at: now, par: actor.nom, parId: actor.id }] });
        } else {
          // Cycle : en attente → en cours → remplacé ou corrigé (traitement, gestionnaire ou administrateur) : terminée
          const treatment = ['remplace', 'corrige'];
          const possibles = ({ attente: ['encours', ...treatment], encours: treatment } as Partial<Record<string, string[]>>)[old.statut!] ?? [];
          if (actor.role === 'formateur') fail(403, 'Traitement non autorisé.');
          assert(possibles.includes(x.statut!), 'Transition de statut indisponible.');
          const stable = (r: LooseItem) => Object.fromEntries(Object.entries(r).filter(([k]) => !['statut', 'historique'].includes(k)));
          assert(same(stable(old), stable(x)), 'Seul le traitement peut être modifié.');
          x.historique = [...old.historique!, { statut: x.statut as RemonteeStatut, at: now, par: actor.nom, parId: actor.id }];
        }
        assert(typeof x.description === 'string' && x.description.trim() && x.description.length <= 12000, 'Description obligatoire.');
        assert(Array.isArray(x.materielIds) && x.materielIds.length > 0 && x.materielIds.every((mid) => materiels.some((m) => m.id === mid && m.ecoleId === x.ecoleId)), 'Matériels invalides.');
      }
      if (c === 'materiels') {
        assert(typeof x.modele === 'string' && x.modele.trim() && x.modele.length <= 250 && Number.isFinite(x.dateReception) && typeof x.hs === 'boolean');
        assert(!x.salleId || salles.some((s) => s.id === x.salleId && s.ecoleId === x.ecoleId), 'Salle inconnue ou hors école.');
        // Un matériel hors service ne peut qu'être remis en service ou renvoyé au stock (orientation de l'utilisateur du 12 novembre)
        if (old && x.hs && x.salleId && x.salleId !== (old.salleId ?? null)) fail(400, 'Un matériel hors service ne peut aller qu’au stock.');
        if (old) assert(old.idOrion === x.idOrion, 'Identifiant Orion immuable.');
        else x.idOrion = `MAT-${String(++lastOrionId).padStart(4, '0')}`;
        // Installation physique : toute nouvelle affectation reste en cours (deplacement) jusqu'à la confirmation du
        // déplacement physique, qui devient le dernier déplacement confirmé (installation). Les deux sont tenus ici ;
        // le navigateur peut seulement retirer deplacement (confirmation) et sa valeur d'installation est ignorée.
        // de : emplacement physique d'origine (null pour le stock), conservé si le matériel n'a pas encore bougé.
        const keepInstallation = () => { if (old?.installation) x.installation = old.installation; else delete x.installation; };
        if (!old) { delete x.deplacement; delete x.installation; } // un matériel déclaré ou importé est là où il est déclaré
        else if ((old.salleId ?? null) !== (x.salleId ?? null)) {
          const de = old.deplacement ? old.deplacement.de : old.salleId ?? null;
          if (de === (x.salleId ?? null)) { delete x.deplacement; keepInstallation(); } // retour à son emplacement physique
          else { x.deplacement = { de, at: now, par: actor.nom, parId: actor.id }; delete x.installation; }
        } else if (x.deplacement && !same(x.deplacement, old.deplacement)) fail(400, 'Le suivi du déplacement est tenu par le serveur.');
        else if (old.deplacement && !x.deplacement) x.installation = { de: old.deplacement.de, at: now, par: actor.nom, parId: actor.id };
        else keepInstallation();
      }
      if (c === 'salles') assert(typeof x.nom === 'string' && x.nom.trim() && typeof x.batiment === 'string' && x.batiment.trim() && Number.isInteger(x.etage ?? 0) && (x.etage ?? 0) >= -5 && (x.etage ?? 0) <= 30);
      if (c === 'etages') assert(Number.isInteger(x.niveau) && x.niveau! >= -5 && x.niveau! <= 30 && typeof x.batiment === 'string' && x.batiment.trim());
    }
    const visibleIds = new Set(visible[c].map((x) => x.id));
    const kept = new Map<Id, Item>(state[c].map((x) => [x.id, x]));
    (next as Lists)[c] = [...state[c].filter((x) => !visibleIds.has(x.id)), ...proposed.map((x) => (changes.includes(x) ? x : kept.get(x.id) ?? x))];
  }

  const inventoryIds = next.materiels.map((m) => m.idOrion);
  assert(new Set(inventoryIds).size === inventoryIds.length, 'Identifiants matériels en doublon.');
  assert(next.materiels.every((m) => !m.salleId || next.salles.some((s) => s.id === m.salleId && s.ecoleId === m.ecoleId)), 'Un matériel est affecté à une salle inconnue.');
  assert(next.postes.every((p) => next.salles.some((s) => s.id === p.salleId)), 'Un poste dépend de cette salle.');
  eteindreHorsService(next, now);

  // Préférences du compte connecté uniquement
  const prefs: PreferencesCompte = { ...(next.preferences?.[actor.id] ?? {}) };
  if (input.prefs && typeof input.prefs === 'object') prefs.prefs = displayPrefs(input.prefs);
  if (Array.isArray(input.layouts?.[actor.role]?.perso) || input.layouts?.[actor.role]) { assert(JSON.stringify(input.layouts![actor.role]).length < 50_000); prefs.layouts = input.layouts![actor.role]; }
  if (Number.isFinite(input.seenAt?.[actor.role])) prefs.seenAt = Math.min(input.seenAt![actor.role]!, now);
  if (actor.role === 'superadmin' && input.ecoleId) { assert(input.ecoleId === 'all' || next.ecoles.some((e) => e.id === input.ecoleId)); prefs.ecoleId = input.ecoleId; }
  next.preferences = { ...(next.preferences ?? {}), [actor.id]: prefs };
  next.revision = (state.revision || 0) + 1;
  next.rev = (state.rev || 0) + 1;
  return next;
}
