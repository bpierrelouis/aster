/* ==========================================================================
   Espace de travail · règles métier communes aux deux modes
   (postes : postes.ts ; import JSON : import.ts ; moteur d'écriture :
   engine.ts ; fusion des écritures concurrentes : fusion.ts ; API : routes.ts)
   - Les droits s'appliquent au compte ORION connecté (profil, école).
   - Les valeurs d'autorité (auteur, dates, numéros, identifiants ORION,
     suivi des interventions) sont fixées par le serveur.
   - Les processus, détections et installations ne sont alimentés que par
     les postes (API d'agent) ; les utilisateurs demandent des interventions.
   - Les écritures concurrentes sont fusionnées élément par élément : seul
     un élément modifié des deux côtés provoque un conflit.
   ========================================================================== */

import { randomUUID } from 'node:crypto';
import { seed } from '#shared/seed.ts';
import { defaultLayouts } from '#shared/layouts.ts';
import { displayPrefs } from '#shared/ambiance.ts';
import { DAY } from '#shared/format.ts';
import { normalizeProblemLabel, PROBLEM_LABEL_HELP } from '#shared/problem-label.ts';
import { batimentCode } from '#shared/buildings.ts';
import { regleConstat, regleRecensement } from './recensement.ts';
import { initializeOperations, IMAGE_REFERENCE } from '#shared/operations-data.ts';
import { isRole, materielCite, numeroMateriel, numeroRemontee, rangDuNumero, PROBLEMS } from '#shared/catalog.ts';
import type { Actor, CollectionName, Collections, Compte, DisplayPrefs, Id, Item, OperationType, PreferencesCompte, RemonteeStatut, WorkspaceState, WorkspaceView } from '#shared/types.ts';

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

export const collections: CollectionName[] = ['ecoles', 'salles', 'etages', 'materiels', 'postes', 'remontees', 'detections', 'applications', 'comptes', 'regles', 'operations', 'processus', 'installations', 'recensements', 'constats'];
const OPERATION_TYPES: readonly string[] = ['installation', 'desinstallation', 'reinstallation', 'arret'] satisfies OperationType[];
const SERVER_FIELDS: Partial<Record<CollectionName, Exclude<keyof LooseItem, 'id'>[]>> = { comptes: ['sujet'] }; // jamais transmis au navigateur
/** Valeurs tenues par le serveur seul (connexion, désactivation) ou remontées par les postes (API des postes) : une valeur du navigateur est ignorée */
const SERVER_HELD: Partial<Record<CollectionName, Exclude<keyof LooseItem, 'id'>[]>> = {
  comptes: ['derniereConnexion', 'dateDesactivation'],
  postes: ['allume', 'session', 'vuLe', 'adresseIp', 'os'],
};

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
  Object.assign(state, { processus: [], detections: [], installations: [], recensements: [], constats: [], revision: 0 });
  for (const p of state.postes) { p.session = null; p.vuLe = null; }
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
export function accountForIdentity(state: WorkspaceState, { sub, email }: { sub?: string; email?: string | null }): Compte | null {
  const bySubject = sub ? state.comptes.find((c) => c.sujet === sub) : undefined;
  if (bySubject) return bySubject;
  const mail = String(email ?? '').toLowerCase();
  const byEmail = mail ? state.comptes.find((c) => c.email.toLowerCase() === mail) : undefined;
  if (byEmail?.sujet && byEmail.sujet !== sub) return null; // adresse reprise par une autre identité
  return byEmail ?? null;
}

/* ---------- Visibilité ---------- */

export const schoolOf = <E extends Id | null>(item: LooseItem, state: { salles: readonly { id: Id; ecoleId?: E }[]; postes: readonly LooseItem[] }): Id | E | undefined => item.ecoleId ?? state.salles.find((s) => s.id === (item.salleId ?? state.postes.find((p) => p.id === (item.posteId ?? item.cibles?.[0]))?.salleId))?.ecoleId;

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
  let lastOrionId = Math.max(0, ...state.materiels.map((m) => rangDuNumero(m.idOrion)));
  let lastReportId = Math.max(100, ...state.remontees.map((r) => rangDuNumero(r.id)));
  const salles = Array.isArray(input.salles) ? input.salles : visible.salles;
  const materiels = Array.isArray(input.materiels) ? input.materiels : visible.materiels;

  for (const c of collections) {
    const sent: LooseItem[] = input[c] ?? visible[c].map((x) => strip(c, x));
    assert(Array.isArray(sent) && sent.length <= 20000);
    const ids = new Set<unknown>();
    for (const x of sent) { assert(x && typeof x.id === 'string' && x.id.length < 150 && !ids.has(x.id)); ids.add(x.id); }
    const stored = new Map<Id, LooseItem>(state[c].map((x) => [x.id, x]));
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
    if (c === 'recensements' && deleted.length) fail(403, 'Une campagne se clôt ; elle n’est pas supprimée.');
    if (c === 'constats' && deleted.length) fail(403, 'Un constat est conservé.');
    if (c === 'regles' && actor.role !== 'superadmin' && deleted.some((x) => x.portee === 'global')) fail(403, 'Règle globale réservée au super administrateur.');

    for (const x of changes) {
      if (c === 'remontees' && !before.has(x.id)) x.id = numeroRemontee(++lastReportId);
      if (c === 'operations' && !before.has(x.id)) x.id = id('op');
      if (c === 'recensements' && !before.has(x.id)) x.id = id('rec');
      if (c === 'postes') {
        delete x.ecoleId; // l'école d'un poste est celle de sa salle
        // État, session, dernier rapport, adresse IP et système : remontés par le poste lui-même (postes.ts) ; un nouveau poste est éteint
        if (!stored.has(x.id)) Object.assign(x, { allume: false, session: null, vuLe: null });
      }
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
        assert(isRole(x.role), 'Profil inconnu.');
        assert(typeof x.actif === 'boolean');
        if (x.role === 'superadmin') { if (actor.role !== 'superadmin') fail(403, 'Profil réservé au super administrateur.'); x.ecoleId = null; }
        else assert(next.ecoles.some((e) => e.id === x.ecoleId), 'École de rattachement obligatoire.');
        if (actor.role !== 'superadmin' && x.ecoleId !== actor.ecoleId) fail(403, 'Ressource hors de votre école.');
        assert(!state.comptes.some((o) => o.id !== x.id && o.email.toLowerCase() === x.email), 'Cette adresse est déjà utilisée par un autre compte.');
        if (old?.id === actor.id) assert(x.actif && x.role === old.role && (x.ecoleId ?? null) === (old.ecoleId ?? null), 'Vous ne pouvez pas modifier votre propre profil ni désactiver votre compte.');
        const account = stored.get(x.id);
        // Identité rapprochée : fixée par le serveur seul, conservée tant que l'adresse ne change pas
        if (account?.sujet && account.email!.toLowerCase() === x.email) x.sujet = account.sujet; else delete x.sujet;
        // Date de désactivation : fixée à la désactivation, conservée tant qu'elle dure, retirée à la réactivation
        if (x.actif) delete x.dateDesactivation;
        else if (!account || account.actif) x.dateDesactivation = now;
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
        if (x.type === 'reinstallation') x.image = IMAGE_REFERENCE; else delete x.image; // image fixée par le serveur
        Object.assign(x, { ecoleId: schoolOf(postes[0]!, next), at: now, par: actor.nom, parId: actor.id, statut: 'enregistree', resultats: Object.fromEntries(x.cibles.map((pid) => [pid, 'en_attente'])) });
      }
      if (c === 'remontees') {
        if (!old) {
          if (actor.role === 'gestionnaire') fail(403, 'Création de remontée non autorisée.');
          Object.assign(x, { auteur: actor.nom, auteurId: actor.id, createdAt: now, statut: 'attente', historique: [{ statut: 'attente', at: now, par: actor.nom, parId: actor.id }] });
        } else {
          // Cycle : en attente → en cours (prise en charge) → remplacé ou corrigé : terminée. Le gestionnaire seul
          // prend en charge et termine ; la prise en charge précède toujours la fin (décisions de l'utilisateur du 13 novembre)
          const possibles = ({ attente: ['encours'], encours: ['remplace', 'corrige'] } as Partial<Record<string, string[]>>)[old.statut!] ?? [];
          if (actor.role !== 'gestionnaire') fail(403, 'Prise en charge et traitement réservés au gestionnaire.');
          if (old.statut === 'attente' && ['remplace', 'corrige'].includes(x.statut!)) fail(400, 'Prenez d’abord la remontée en charge avant de la terminer.');
          assert(possibles.includes(x.statut!), 'Transition de statut indisponible.');
          const stable = (r: LooseItem) => Object.fromEntries(Object.entries(r).filter(([k]) => !['statut', 'historique'].includes(k)));
          assert(same(stable(old), stable(x)), 'Seul le traitement peut être modifié.');
          x.historique = [...old.historique!, { statut: x.statut as RemonteeStatut, at: now, par: actor.nom, parId: actor.id }];
        }
        // Type de problème obligatoire à la création : un type proposé, ou le libellé précisé pour « Autre »
        if (!old) assert(x.probleme != null && String(x.probleme).trim(), 'Type de problème obligatoire : choisissez un type ou précisez le problème.');
        if (x.probleme != null) {
          assert(typeof x.probleme === 'string' && x.probleme.trim() && x.probleme.length <= 100, 'Type de problème invalide.');
          if (!old && !PROBLEMS.some((p) => p.id === x.probleme)) {
            const label = normalizeProblemLabel(x.probleme);
            assert(!label.invalid, `Type de problème invalide. ${PROBLEM_LABEL_HELP}`);
            x.probleme = label.value.trim();
          } else x.probleme = x.probleme.trim();
        }
        assert(typeof x.description === 'string' && x.description.trim() && x.description.length <= 12000, 'Description obligatoire.');
        assert(Array.isArray(x.materielIds) && x.materielIds.length > 0 && x.materielIds.every((mid) => materiels.some((m) => m.id === mid && m.ecoleId === x.ecoleId)), 'Matériels invalides.');
      }
      if (c === 'recensements') regleRecensement(x, old, next, actor, now);
      if (c === 'constats') regleConstat(x, old, actor, now);
      if (c === 'materiels') {
        assert(typeof x.modele === 'string' && x.modele.trim() && x.modele.length <= 250 && Number.isFinite(x.dateReception) && typeof x.hs === 'boolean');
        assert(!x.salleId || salles.some((s) => s.id === x.salleId && s.ecoleId === x.ecoleId), 'Salle inconnue ou hors école.');
        // Un matériel hors service ne peut qu'être remis en service ou renvoyé au stock (orientation de l'utilisateur du 12 novembre)
        if (old && x.hs && x.salleId && x.salleId !== (old.salleId ?? null)) fail(400, 'Un matériel hors service ne peut aller qu’au stock.');
        // Date de mise hors service : fixée au passage hors service, conservée tant qu'il dure, retirée au retour en service
        if (!x.hs) delete x.dateHs;
        else if (old?.hs) { if (old.dateHs) x.dateHs = old.dateHs; else delete x.dateHs; }
        else x.dateHs = now;
        if (old) assert(old.idOrion === x.idOrion, 'Identifiant ORION immuable.');
        else x.idOrion = numeroMateriel(++lastOrionId);
        // Installation physique : toute nouvelle affectation reste en cours (deplacement) jusqu'à la confirmation du
        // déplacement physique, qui devient le dernier déplacement confirmé (installation). Les deux sont tenus ici ;
        // le navigateur peut seulement retirer deplacement (confirmation, réservée au gestionnaire) et sa valeur d'installation est ignorée.
        // de : emplacement physique d'origine (null pour le stock), conservé si le matériel n'a pas encore bougé.
        const keepInstallation = () => { if (old?.installation) x.installation = old.installation; else delete x.installation; };
        if (!old) { delete x.deplacement; delete x.installation; } // un matériel déclaré ou importé est là où il est déclaré
        else if ((old.salleId ?? null) !== (x.salleId ?? null)) {
          const de = old.deplacement ? old.deplacement.de : old.salleId ?? null;
          if (de === (x.salleId ?? null)) { delete x.deplacement; keepInstallation(); } // retour à son emplacement physique
          else { x.deplacement = { de, at: now, par: actor.nom, parId: actor.id }; delete x.installation; }
        } else if (x.deplacement && !same(x.deplacement, old.deplacement)) fail(400, 'Le suivi du déplacement est tenu par le serveur.');
        else if (old.deplacement && !x.deplacement) {
          // Confirmation de l'installation : gestionnaire seul, dans ORION ou avec RIGEL ; les administrateurs initient et suivent (décision de l'utilisateur du 14 novembre)
          if (actor.role !== 'gestionnaire') fail(403, 'Confirmation de l’installation réservée au gestionnaire.');
          x.installation = { de: old.deplacement.de, at: now, par: actor.nom, parId: actor.id };
        }
        else keepInstallation();
      }
      if (['salles', 'etages'].includes(c) || (c === 'regles' && x.portee === 'batiment')) x.batiment = batimentCode(x.batiment); // code en capitales, comme à la saisie
      if (c === 'salles') assert(typeof x.nom === 'string' && x.nom.trim() && typeof x.batiment === 'string' && x.batiment.trim() && Number.isInteger(x.etage ?? 0) && (x.etage ?? 0) >= -5 && (x.etage ?? 0) <= 30);
      if (c === 'etages') assert(Number.isInteger(x.niveau) && x.niveau! >= -5 && x.niveau! <= 30 && typeof x.batiment === 'string' && x.batiment.trim());
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
