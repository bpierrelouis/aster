/* ==========================================================================
   Domaine · espace de travail : règles communes aux deux modes
   (comptes : comptes.ts ; parc : parc.ts ; remontées : remontees.ts ;
   postes et interventions : postes.ts ; recensement : recensement.ts ;
   import JSON : import.ts ; moteur d'écriture et fusion : ../persistance/)
   - Les droits s'appliquent au compte ORION connecté (profil, école).
   - Les valeurs d'autorité (auteur, dates, numéros, identifiants ORION,
     suivi des interventions) sont fixées par le serveur.
   - Les processus, détections et installations ne sont alimentés que par
     les postes (API d'agent) ; les utilisateurs demandent des interventions.
   - Les écritures concurrentes sont fusionnées élément par élément : seul
     un élément modifié des deux côtés provoque un conflit.
   ========================================================================== */

import { defaultLayouts } from '#shared/layouts.ts';
import { displayPrefs } from '#shared/ambiance.ts';
import { DAY } from '#shared/format.ts';
import { initializeOperations } from '#shared/operations-data.ts';
import { materielCite, numeroRemontee, rangDuNumero } from '#shared/catalog.ts';
import { assert, collections, fail, id, isAdmin, same, schoolOf } from './commun.ts';
import { regleCompte } from './comptes.ts';
import { regleLieu, regleMateriel } from './parc.ts';
import { regleRemontee } from './remontees.ts';
import { eteindreHorsService, regleIntervention, reglePoste } from './postes.ts';
import { regleConstat, regleRecensement } from './recensement.ts';
import type { Actor, CollectionName, Collections, Id, Item, PreferencesCompte, WorkspaceState, WorkspaceView } from '#shared/types.ts';
import type { Contexte, LooseItem, Lists, WorkspaceInput } from './commun.ts';

const SERVER_FIELDS: Partial<Record<CollectionName, Exclude<keyof LooseItem, 'id'>[]>> = { comptes: ['sujet'] }; // jamais transmis au navigateur
/** Valeurs tenues par le serveur seul (connexion, désactivation) ou remontées par les postes (API des postes) : une valeur du navigateur est ignorée */
const SERVER_HELD: Partial<Record<CollectionName, Exclude<keyof LooseItem, 'id'>[]>> = {
  comptes: ['derniereConnexion', 'dateDesactivation'],
  postes: ['allume', 'session', 'vuLe', 'adresseIp', 'os'],
};

/**
 * État d'un espace neuf : référentiels seuls (applications déployables et règles globales de départ).
 * Écoles, comptes et parc sont créés ensuite ; le jeu de démonstration est chargé par l'outil
 * outils/donnees-demonstration, jamais par le serveur.
 */
export function initialState(now = Date.now()): WorkspaceState {
  const vide = Object.fromEntries(collections.map((c) => [c, []])) as unknown as Pick<WorkspaceState, CollectionName>;
  const { applications, regles } = initializeOperations({});
  return { ...vide, applications, regles, version: 0, revision: 0, seededAt: now, preferences: {} };
}

/* ---------- Visibilité ---------- */

export function visibleTo(collection: CollectionName, item: LooseItem | undefined, state: WorkspaceState, actor: Actor) {
  if (!item) return false;
  if (collection === 'applications') return true;
  if (collection === 'regles' && item.portee === 'global') return isAdmin(actor);
  if (actor.role === 'superadmin') return true;
  if (collection === 'ecoles') return item.id === actor.ecoleId;
  if (schoolOf(item, state) !== actor.ecoleId) return false;
  if (['comptes', 'regles'].includes(collection)) return isAdmin(actor);
  if (collection === 'operations') return isAdmin(actor) || (actor.role === 'formateur' && item.type === 'arret');
  if (['postes', 'processus', 'detections', 'installations'].includes(collection)) return actor.role !== 'gestionnaire';
  if (['recensements', 'constats'].includes(collection)) return actor.role !== 'formateur';
  if (collection === 'remontees' && actor.role === 'formateur') return item.auteurId === actor.id;
  return true;
}

/** Élément sans les valeurs tenues par le serveur : ce que le navigateur peut modifier (fusion des écritures) */
export const editable = <T extends LooseItem>(collection: CollectionName, item: T | undefined): T | undefined => {
  const fields = SERVER_HELD[collection];
  if (!item || !fields) return item;
  const copy = { ...item };
  for (const f of fields) delete copy[f];
  return copy;
};

/** Élément proposé par le navigateur, avec les valeurs tenues par le serveur reprises de l'élément enregistré */
function withServerHeld<T extends LooseItem>(collection: CollectionName, item: T, stored: LooseItem | undefined): T {
  const fields = SERVER_HELD[collection];
  if (!fields) return item;
  const copy: LooseItem = { ...item };
  for (const f of fields) { if (stored?.[f] !== undefined) Object.assign(copy, { [f]: stored[f] }); else delete copy[f]; }
  return copy as T;
}

export const strip = <T extends LooseItem>(collection: CollectionName, item: T): T => {
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
  const result: Omit<WorkspaceView, CollectionName> & Partial<Lists> = { version: state.version, revision: state.revision, seededAt: state.seededAt, role: actor.role, moi: { ...actor }, ...preferencesOf(state, actor) };
  for (const c of collections) result[c] = structuredClone((state[c] ?? []).filter((x) => visibleTo(c, x, state, actor)).map((x) => strip(c, x)));
  return result as WorkspaceView; // chaque collection ne contient que ses éléments
}

/* ---------- Écritures des utilisateurs ---------- */

export function mergeState(state: WorkspaceState, input: WorkspaceInput, actor: Actor, now = Date.now()): WorkspaceState {
  assert(input && typeof input === 'object' && !Array.isArray(input));
  if (input.role !== actor.role) fail(403, 'Le profil est défini par la connexion.');
  const visible = Object.fromEntries(collections.map((c) => [c, state[c].filter((x) => visibleTo(c, x, state, actor))])) as Pick<Collections, CollectionName>;
  const next = structuredClone(state);
  const numeros = { materiel: Math.max(0, ...state.materiels.map((m) => rangDuNumero(m.idOrion))), remontee: Math.max(100, ...state.remontees.map((r) => rangDuNumero(r.id))) };
  const salles: LooseItem[] = Array.isArray(input.salles) ? input.salles : visible.salles;
  const materiels: LooseItem[] = Array.isArray(input.materiels) ? input.materiels : visible.materiels;

  for (const c of collections) {
    const sent: LooseItem[] = input[c] ?? visible[c].map((x) => strip(c, x));
    assert(Array.isArray(sent) && sent.length <= 20000);
    const ids = new Set<unknown>();
    for (const x of sent) { assert(x && typeof x.id === 'string' && x.id.length < 150 && !ids.has(x.id)); ids.add(x.id); }
    const stored = new Map<Id, LooseItem>(state[c].map((x) => [x.id, x]));
    const ctx: Contexte = { state, next, actor, now, salles, materiels, stored, numeros };
    const proposed = sent.map((x) => withServerHeld(c, x, stored.get(x.id)));
    const before = new Map<Id, LooseItem>(visible[c].map((x) => [x.id, x]));
    const changes = proposed.filter((x) => !same(x, before.has(x.id) ? strip(c, before.get(x.id)!) : undefined));
    const deleted: LooseItem[] = visible[c].filter((x) => !ids.has(x.id));
    if (!changes.length && !deleted.length) continue;

    if (c === 'ecoles' && actor.role !== 'superadmin') fail(403, 'Action réservée au super administrateur.');
    if (['salles', 'etages', 'applications', 'comptes', 'regles'].includes(c) && !isAdmin(actor)) fail(403, 'Action réservée aux administrateurs.');
    if (['processus', 'detections', 'installations'].includes(c)) fail(403, 'Ces données sont remontées par les postes.');
    if (c === 'materiels' && actor.role === 'formateur') fail(403, 'Modification du parc non autorisée.');
    if (c === 'materiels' && deleted.length && !isAdmin(actor)) fail(403, 'Suppression réservée aux administrateurs.');
    if (c === 'materiels' && deleted.some((m) => materielCite(state.remontees, m.id))) fail(400, 'Un matériel cité par une remontée est conservé.');
    // Seul un matériel du stock se supprime : un matériel affecté à une salle y retourne d'abord (décision de l'utilisateur du 13 novembre)
    if (c === 'materiels' && deleted.some((m) => m.salleId)) fail(400, 'Seul un matériel du stock peut être supprimé : renvoyez-le d’abord au stock.');
    if (c === 'postes' && !isAdmin(actor)) fail(403, 'Action réservée aux administrateurs.');
    if (c === 'comptes' && deleted.length) fail(403, 'Un compte se désactive ; il n’est pas supprimé.');
    if (c === 'operations' && deleted.length) fail(403, 'Une demande d’intervention ne peut pas être supprimée.');
    if (c === 'remontees' && deleted.length) fail(403, 'La suppression de remontées est indisponible.');
    if (c === 'recensements' && deleted.length) fail(403, 'Un recensement ou une installation se clôt ; il n’est pas supprimé.');
    if (c === 'constats' && deleted.length) fail(403, 'Un constat est conservé.');
    if (c === 'regles' && actor.role !== 'superadmin' && deleted.some((x) => x.portee === 'global')) fail(403, 'Règle globale réservée au super administrateur.');
    if (c === 'applications' && deleted.some((a) => state.installations.some((i) => i.applicationId === a.id) || state.operations.some((o) => o.applicationId === a.id))) {
      fail(400, 'Une application installée sur un poste ou citée par une intervention est conservée.');
    }

    for (const x of changes) {
      if (c === 'remontees' && !before.has(x.id)) x.id = numeroRemontee(++numeros.remontee);
      if (c === 'operations' && !before.has(x.id)) x.id = id('op');
      if (c === 'recensements' && !before.has(x.id)) x.id = id('rec');
      if (c === 'postes') {
        delete x.ecoleId; // l'école d'un poste est celle de sa salle
        // État, session, dernier rapport, adresse IP et système : remontés par le poste lui-même (postes.ts) ; un nouveau poste est éteint
        if (!stored.has(x.id)) Object.assign(x, { allume: false, session: null, vuLe: null });
        // Nom réseau en capitales : les rapports et les jetons des postes le désignent ainsi (jetonPoste)
        assert(typeof x.nomReseau === 'string', 'Nom réseau obligatoire.');
        x.nomReseau = x.nomReseau.trim().toUpperCase();
      }
      const old = before.get(x.id);
      if (!old && state[c].some((other) => other.id === x.id)) fail(409, 'Cet identifiant existe déjà.');
      const global = ['ecoles', 'applications'].includes(c) || (c === 'regles' && x.portee === 'global' && actor.role === 'superadmin') || (c === 'comptes' && x.role === 'superadmin' && actor.role === 'superadmin');
      if (!global && actor.role !== 'superadmin' && schoolOf(x, { ...next, salles }) !== actor.ecoleId) fail(403, 'Ressource hors de votre école.');
      if (old && (old.ecoleId ?? null) !== (x.ecoleId ?? null) && c !== 'comptes') fail(403, 'Le rattachement à une école ne peut pas être modifié.');
      if (c === 'regles' && (x.portee === 'global' || old?.portee === 'global') && actor.role !== 'superadmin') fail(403, 'Règle globale réservée au super administrateur.');

      if (c === 'comptes') regleCompte(x, old, ctx);
      if (c === 'operations') regleIntervention(x, old, ctx);
      if (c === 'remontees') regleRemontee(x, old, ctx);
      if (c === 'recensements') regleRecensement(x, old, next, actor, now);
      if (c === 'constats') regleConstat(x, old, actor, now);
      if (c === 'materiels') regleMateriel(x, old, ctx);
      if (c === 'postes') reglePoste(x, ctx);
      regleLieu(c, x);
    }
    // Éléments conservés repris de la copie next : eteindreHorsService les modifie ensuite sans toucher à state
    const visibleIds = new Set(visible[c].map((x) => x.id));
    const kept = new Map<Id, Item>(next[c].map((x) => [x.id, x]));
    (next as Lists)[c] = [...next[c].filter((x) => !visibleIds.has(x.id)), ...proposed.map((x) => (changes.includes(x) ? x : kept.get(x.id) ?? x))];
  }

  const inventoryIds = next.materiels.map((m) => m.idOrion);
  assert(new Set(inventoryIds).size === inventoryIds.length, 'Identifiants matériels en doublon.');
  assert(next.materiels.every((m) => !m.salleId || next.salles.some((s) => s.id === m.salleId && s.ecoleId === m.ecoleId)), 'Un matériel est affecté à une salle inconnue.');
  assert(next.postes.every((p) => next.salles.some((s) => s.id === p.salleId)), 'Un poste dépend de cette salle.');
  // Nom réseau unique sur tout le parc : il désigne le poste dans les rapports et les commandes des postes
  const nomsReseau = next.postes.map((p) => String(p.nomReseau ?? '').trim().toUpperCase());
  assert(nomsReseau.every((n) => n && n.length <= 63) && new Set(nomsReseau).size === nomsReseau.length, 'Ce nom réseau est déjà utilisé par un autre poste.');
  eteindreHorsService(next, now);

  // Préférences du compte connecté uniquement
  const prefs: PreferencesCompte = { ...(next.preferences?.[actor.id] ?? {}) };
  if (input.prefs && typeof input.prefs === 'object') prefs.prefs = displayPrefs(input.prefs);
  if (input.layouts?.[actor.role]) { assert(JSON.stringify(input.layouts![actor.role]).length < 50_000); prefs.layouts = input.layouts![actor.role]; }
  if (Number.isFinite(input.seenAt?.[actor.role])) prefs.seenAt = Math.min(input.seenAt![actor.role]!, now);
  if (actor.role === 'superadmin' && input.ecoleId) { assert(input.ecoleId === 'all' || next.ecoles.some((e) => e.id === input.ecoleId)); prefs.ecoleId = input.ecoleId; }
  next.preferences = { ...(next.preferences ?? {}), [actor.id]: prefs };
  next.revision = (state.revision || 0) + 1;
  return next;
}
