/* ==========================================================================
   Espace de travail · règles métier communes aux deux modes
   - Les droits s'appliquent au compte ASTER connecté (profil, école).
   - Les valeurs d'autorité (auteur, dates, numéros, identifiants ASTER,
     suivi des interventions) sont fixées par le serveur.
   - Les processus, détections et installations ne sont alimentés que par
     les postes (API d'agent) ; les utilisateurs demandent des interventions.
   - Les écritures concurrentes sont fusionnées élément par élément : seul
     un élément modifié des deux côtés provoque un conflit.
   ========================================================================== */

import express from 'express';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { seed, SEED_VERSION, DEFAULT_PREFS, defaultLayouts } from '../frontend/workspace/core/seed.js';
import { initializeOperations, processClass } from '../frontend/workspace/core/operations-data.js';
import { reportPdf } from './workspace-pdf.js';

export const collections = ['ecoles', 'salles', 'etages', 'materiels', 'postes', 'remontees', 'detections', 'applications', 'comptes', 'regles', 'operations', 'processus', 'installations'];
export const ROLES = ['superadmin', 'admin', 'gestionnaire', 'formateur'];
const OPERATION_TYPES = ['installation', 'desinstallation', 'reinstallation', 'arret'];
const SERVER_FIELDS = { comptes: ['sujet'] }; // jamais transmis au navigateur
const DAY = 24 * 3600 * 1000;
export const DISCONNECT_AFTER = 30_000; // poste sans rapport depuis ce délai : déconnecté

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const assert = (condition, message = 'Données invalides.') => { if (!condition) fail(400, message); };
const isAdmin = (actor) => ['admin', 'superadmin'].includes(actor.role);
const id = (prefix) => `${prefix}-${randomUUID().slice(0, 8)}`;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Données de départ : référentiels et parc ; aucune activité de poste avant le premier rapport. */
export function initialState() {
  const state = initializeOperations(seed());
  Object.assign(state, { processus: [], detections: [], operations: [], installations: [], revision: 0 });
  for (const p of state.postes) { p.connecte = false; p.vuLe = null; }
  return state;
}

/* ---------- Comptes et identité ---------- */

/** Utilisateur agissant : compte actif uniquement. */
export function actorOf(state, accountId) {
  const c = state.comptes.find((x) => x.id === accountId);
  return c && c.actif ? { id: c.id, nom: c.nom, email: c.email, role: c.role, ecoleId: c.ecoleId ?? null } : null;
}

/** Compte correspondant à une identité du fournisseur (sujet OIDC, sinon adresse électronique). */
export function accountForIdentity(state, { sub, email }) {
  const bySubject = sub && state.comptes.find((c) => c.sujet === sub);
  if (bySubject) return bySubject;
  const mail = String(email ?? '').toLowerCase();
  const byEmail = mail && state.comptes.find((c) => c.email.toLowerCase() === mail);
  if (byEmail && byEmail.sujet && byEmail.sujet !== sub) return null; // adresse reprise par une autre identité
  return byEmail ?? null;
}

/* ---------- Visibilité ---------- */

const schoolOf = (item, state) => item.ecoleId ?? state.salles.find((s) => s.id === (item.salleId ?? state.postes.find((p) => p.id === (item.posteId ?? item.cibles?.[0]))?.salleId))?.ecoleId;

function visibleTo(collection, item, state, actor) {
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

const strip = (collection, item) => {
  const fields = SERVER_FIELDS[collection];
  if (!fields) return item;
  const copy = { ...item };
  for (const f of fields) delete copy[f];
  return copy;
};

export function preferencesOf(state, actor) {
  const p = state.preferences?.[actor.id] ?? {};
  return {
    prefs: { ...DEFAULT_PREFS, ...(p.prefs ?? {}) },
    layouts: { [actor.role]: p.layouts ?? defaultLayouts()[actor.role] },
    seenAt: { [actor.role]: p.seenAt ?? (state.seededAt ?? Date.now()) - 3 * DAY },
    ecoleId: actor.role === 'superadmin' ? (p.ecoleId ?? state.ecoles[0]?.id ?? 'all') : actor.ecoleId,
  };
}

/** Données transmises au navigateur pour ce compte. */
export function scopedState(state, actor) {
  const result = { version: state.version, revision: state.revision, rev: state.rev ?? state.revision, seededAt: state.seededAt, role: actor.role, moi: { ...actor }, ...preferencesOf(state, actor) };
  for (const c of collections) result[c] = structuredClone((state[c] ?? []).filter((x) => visibleTo(c, x, state, actor)).map((x) => strip(c, x)));
  return result;
}

/* ---------- Fusion des écritures concurrentes ---------- */

const keyOf = (c, itemId) => `${c}\u0000${itemId}`;

/**
 * Rejoue les modifications du navigateur (préparées sur la révision base) sur l'état courant.
 * log : [{ revision, before: Map(clé → valeur avant modification) }].
 */
export function rebase(state, input, base, log, actor) {
  if (!Number.isInteger(base)) fail(400, 'Révision manquante.');
  if (base === state.revision) return input;
  const entries = log.filter((e) => e.revision > base);
  if (base > state.revision || !entries.length || entries[0].revision !== base + 1) fail(409, 'Les données ont changé. Rechargez la page avant de réessayer.');
  const atBase = new Map();
  for (const e of entries) for (const [k, v] of e.before) if (!atBase.has(k)) atBase.set(k, v);
  const out = { ...input };
  for (const c of collections) {
    if (!Array.isArray(input[c])) continue;
    const list = [...input[c]];
    const index = new Map(list.map((x, i) => [x.id, i]));
    for (const [k, baseItem] of atBase) {
      const [col, itemId] = k.split('\u0000');
      if (col !== c) continue;
      const current = state[c].find((x) => x.id === itemId);
      const currentView = visibleTo(c, current, state, actor) ? strip(c, current) : undefined;
      const baseView = visibleTo(c, baseItem, state, actor) ? strip(c, baseItem) : undefined;
      const client = index.has(itemId) ? list[index.get(itemId)] : undefined;
      if (same(client, currentView)) continue;
      if (!same(client, baseView)) fail(409, 'Cet élément a été modifié entre-temps. Rechargez la page avant de réessayer.');
      // Élément non modifié par le navigateur : la version courante s'applique
      if (currentView && index.has(itemId)) list[index.get(itemId)] = currentView;
      else if (currentView) { index.set(itemId, list.length); list.push(currentView); }
      else if (index.has(itemId)) list.splice(index.get(itemId), 1, null);
    }
    out[c] = list.filter(Boolean);
  }
  return out;
}

/* ---------- Écritures des utilisateurs ---------- */

export function mergeState(state, input, actor, now = Date.now()) {
  assert(input && typeof input === 'object' && !Array.isArray(input));
  if (input.role !== actor.role) fail(403, 'Le profil est défini par la connexion.');
  const visible = Object.fromEntries(collections.map((c) => [c, state[c].filter((x) => visibleTo(c, x, state, actor))]));
  const next = structuredClone(state);
  let lastAsterId = Math.max(0, ...state.materiels.map((m) => Number(String(m.idAster).slice(4)) || 0));
  let lastReportId = Math.max(100, ...state.remontees.map((r) => Number(String(r.id).slice(4)) || 0));
  const salles = Array.isArray(input.salles) ? input.salles : visible.salles;
  const materiels = Array.isArray(input.materiels) ? input.materiels : visible.materiels;

  for (const c of collections) {
    const proposed = input[c] ?? visible[c].map((x) => strip(c, x));
    assert(Array.isArray(proposed) && proposed.length <= 20000);
    const ids = new Set();
    for (const x of proposed) { assert(x && typeof x.id === 'string' && x.id.length < 150 && !ids.has(x.id)); ids.add(x.id); }
    const before = new Map(visible[c].map((x) => [x.id, x]));
    const changes = proposed.filter((x) => !same(x, before.has(x.id) ? strip(c, before.get(x.id)) : undefined));
    const deleted = visible[c].filter((x) => !ids.has(x.id));
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
        assert(ROLES.includes(x.role), 'Profil inconnu.');
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
        assert(OPERATION_TYPES.includes(x.type), 'Intervention inconnue.');
        if (!isAdmin(actor)) assert(actor.role === 'formateur' && x.type === 'arret', 'Action réservée aux administrateurs.');
        assert(Array.isArray(x.cibles) && x.cibles.length && x.cibles.length <= 500 && new Set(x.cibles).size === x.cibles.length, 'Postes cibles invalides.');
        const postes = x.cibles.map((pid) => next.postes.find((p) => p.id === pid));
        assert(postes.every((p) => p && (actor.role === 'superadmin' || schoolOf(p, next) === actor.ecoleId)), 'Postes hors périmètre.');
        assert(new Set(postes.map((p) => schoolOf(p, next))).size === 1, 'Une intervention concerne une seule école.');
        if (x.type === 'arret') {
          const proc = next.processus.find((p) => p.id === x.processusId);
          assert(x.cibles.length === 1 && proc && !proc.stoppedAt && proc.posteId === x.cibles[0], 'Seul un processus en cours peut être arrêté.');
          assert(!next.operations.some((o) => o.type === 'arret' && o.processusId === proc.id && o.statut === 'enregistree'), 'Un arrêt est déjà demandé pour ce processus.');
        }
        if (['installation', 'desinstallation'].includes(x.type)) assert(next.applications.some((a) => a.id === x.applicationId), 'Application inconnue.');
        Object.assign(x, { ecoleId: schoolOf(postes[0], next), at: now, par: actor.nom, parId: actor.id, statut: 'enregistree', resultats: Object.fromEntries(x.cibles.map((pid) => [pid, 'en_attente'])) });
      }
      if (c === 'remontees') {
        if (!old) {
          if (actor.role === 'gestionnaire') fail(403, 'Création de remontée non autorisée.');
          Object.assign(x, { auteur: actor.nom, auteurId: actor.id, createdAt: now, statut: 'attente', historique: [{ statut: 'attente', at: now, par: actor.nom, parId: actor.id }] });
        } else {
          if (actor.role === 'formateur') fail(403, 'Traitement non autorisé.');
          assert(old.statut === 'attente' && (actor.role === 'gestionnaire' ? ['remplace'] : ['remplace', 'corrige']).includes(x.statut), 'Transition de statut indisponible.');
          const stable = (r) => Object.fromEntries(Object.entries(r).filter(([k]) => !['statut', 'historique'].includes(k)));
          assert(same(stable(old), stable(x)), 'Seul le traitement peut être modifié.');
          x.historique = [...old.historique, { statut: x.statut, at: now, par: actor.nom, parId: actor.id }];
        }
        assert(typeof x.description === 'string' && x.description.trim() && x.description.length <= 12000, 'Description obligatoire.');
        assert(Array.isArray(x.materielIds) && x.materielIds.length > 0 && x.materielIds.every((mid) => materiels.some((m) => m.id === mid && m.ecoleId === x.ecoleId)), 'Matériels invalides.');
      }
      if (c === 'materiels') {
        assert(typeof x.modele === 'string' && x.modele.trim() && x.modele.length <= 250 && Number.isFinite(x.dateReception) && typeof x.hs === 'boolean');
        assert(!x.salleId || salles.some((s) => s.id === x.salleId && s.ecoleId === x.ecoleId), 'Salle inconnue ou hors école.');
        if (old) assert(old.idAster === x.idAster, 'Identifiant ASTER immuable.');
        else x.idAster = `MAT-${String(++lastAsterId).padStart(4, '0')}`;
      }
      if (c === 'salles') assert(typeof x.nom === 'string' && x.nom.trim() && typeof x.batiment === 'string' && x.batiment.trim() && Number.isInteger(x.etage ?? 0) && (x.etage ?? 0) >= -5 && (x.etage ?? 0) <= 30);
      if (c === 'etages') assert(Number.isInteger(x.niveau) && x.niveau >= -5 && x.niveau <= 30 && typeof x.batiment === 'string' && x.batiment.trim());
    }
    const visibleIds = new Set(visible[c].map((x) => x.id));
    const kept = new Map(state[c].map((x) => [x.id, x]));
    next[c] = [...state[c].filter((x) => !visibleIds.has(x.id)), ...proposed.map((x) => (changes.includes(x) ? x : kept.get(x.id) ?? x))];
  }

  const inventoryIds = next.materiels.map((m) => m.idAster);
  assert(new Set(inventoryIds).size === inventoryIds.length, 'Identifiants matériels en doublon.');
  assert(next.materiels.every((m) => !m.salleId || next.salles.some((s) => s.id === m.salleId && s.ecoleId === m.ecoleId)), 'Un matériel est affecté à une salle inconnue.');
  assert(next.postes.every((p) => next.salles.some((s) => s.id === p.salleId)), 'Un poste dépend de cette salle.');

  // Préférences du compte connecté uniquement
  const prefs = { ...(next.preferences?.[actor.id] ?? {}) };
  if (input.prefs && typeof input.prefs === 'object') prefs.prefs = { ambiance: String(input.prefs.ambiance ?? DEFAULT_PREFS.ambiance).slice(0, 20), glass: String(input.prefs.glass ?? DEFAULT_PREFS.glass).slice(0, 20) };
  if (Array.isArray(input.layouts?.[actor.role]?.perso) || input.layouts?.[actor.role]) { assert(JSON.stringify(input.layouts[actor.role]).length < 50_000); prefs.layouts = input.layouts[actor.role]; }
  if (Number.isFinite(input.seenAt?.[actor.role])) prefs.seenAt = Math.min(input.seenAt[actor.role], now);
  if (actor.role === 'superadmin' && input.ecoleId) { assert(input.ecoleId === 'all' || next.ecoles.some((e) => e.id === input.ecoleId)); prefs.ecoleId = input.ecoleId; }
  next.preferences = { ...(next.preferences ?? {}), [actor.id]: prefs };
  next.revision = (state.revision || 0) + 1;
  next.rev = (state.rev || 0) + 1;
  return next;
}

/* ---------- Postes (API d'agent) ---------- */

/** Rapports des postes : processus utilisateur en cours et applications installées. */
export function applyReports(s, rapports, now = Date.now()) {
  const byName = new Map(s.postes.map((p) => [p.nomReseau, p]));
  const unknown = [];
  for (const r of rapports) {
    const p = byName.get(r?.poste);
    if (!p) { unknown.push(r?.poste); continue; }
    const ecoleId = schoolOf(p, s);
    p.connecte = true;
    p.vuLe = now;
    const reported = new Map((Array.isArray(r.processus) ? r.processus : []).slice(0, 200)
      .filter((x) => typeof x?.nom === 'string' && x.nom.length <= 120)
      .map((x) => [`${x.nom.toLowerCase()}|${String(x.compte ?? '').slice(0, 120)}`, { nom: x.nom, compte: String(x.compte ?? '') }]));
    for (const proc of s.processus) {
      if (proc.posteId !== p.id || proc.stoppedAt) continue;
      const k = `${proc.nom.toLowerCase()}|${proc.compte}`;
      if (reported.has(k)) reported.delete(k); else proc.stoppedAt = now;
    }
    for (const { nom, compte } of reported.values()) {
      const proc = { id: id('exec'), posteId: p.id, salleId: p.salleId, ecoleId, nom, compte, startedAt: now, stoppedAt: null };
      s.processus.push(proc);
      const classement = processClass(s, proc);
      if (classement === 'whitelist') continue;
      const detection = { id: id('det'), at: now, posteId: p.id, salleId: p.salleId, ecoleId, processus: nom, compte, classement, arret: null };
      s.detections.push(detection);
      // Processus interdit : arrêt automatique demandé au poste
      if (classement === 'blacklist') s.operations.push({ id: id('op'), type: 'arret', auto: true, cibles: [p.id], processusId: proc.id, detectionId: detection.id, ecoleId, at: now, par: 'ASTER', parId: null, statut: 'enregistree', resultats: { [p.id]: 'en_attente' } });
    }
    if (Array.isArray(r.applications)) {
      const apps = new Set(r.applications.filter((a) => s.applications.some((x) => x.id === a)));
      s.installations = s.installations.filter((i) => i.posteId !== p.id || apps.has(i.applicationId));
      for (const a of apps) if (!s.installations.some((i) => i.posteId === p.id && i.applicationId === a)) s.installations.push({ id: `${p.id}-${a}`, posteId: p.id, salleId: p.salleId, ecoleId, applicationId: a });
    }
  }
  markDisconnected(s, now);
  // Historique borné : processus arrêtés et détections conservés sur une durée limitée
  s.processus = s.processus.filter((x) => !x.stoppedAt || now - x.stoppedAt < 3600_000);
  s.detections = s.detections.filter((d) => now - d.at < 30 * DAY).slice(-2000);
  return unknown;
}

export function markDisconnected(s, now = Date.now()) {
  for (const p of s.postes) {
    if (!p.connecte || (p.vuLe && now - p.vuLe < DISCONNECT_AFTER)) continue;
    p.connecte = false;
    for (const proc of s.processus) if (proc.posteId === p.id && !proc.stoppedAt) proc.stoppedAt = now;
  }
}

/** Commandes en attente pour des postes donnés (par nom réseau). */
export function pendingCommands(s, posteNames) {
  const names = new Set(posteNames);
  const postes = new Map(s.postes.filter((p) => names.has(p.nomReseau)).map((p) => [p.id, p]));
  const out = [];
  for (const op of s.operations) {
    if (op.statut !== 'enregistree') continue;
    for (const [pid, etat] of Object.entries(op.resultats ?? {})) {
      if (etat !== 'en_attente' || !postes.has(pid)) continue;
      const proc = op.processusId && s.processus.find((x) => x.id === op.processusId);
      out.push({ operation: op.id, poste: postes.get(pid).nomReseau, type: op.type, applicationId: op.applicationId ?? null, image: op.image ?? null, processus: proc ? { nom: proc.nom, compte: proc.compte } : null });
    }
  }
  return out;
}

/** Résultats d'exécution renvoyés par les postes. */
export function applyResults(s, resultats, now = Date.now()) {
  const byName = new Map(s.postes.map((p) => [p.nomReseau, p]));
  for (const r of resultats) {
    const op = s.operations.find((o) => o.id === r?.operation);
    const p = byName.get(r?.poste);
    if (!op || !p || op.resultats?.[p.id] !== 'en_attente' || !['reussie', 'echec'].includes(r.statut)) continue;
    op.resultats[p.id] = r.statut;
    const ok = r.statut === 'reussie';
    if (op.type === 'arret') {
      if (ok) { const proc = s.processus.find((x) => x.id === op.processusId); if (proc && !proc.stoppedAt) proc.stoppedAt = now; }
      const det = op.detectionId && s.detections.find((d) => d.id === op.detectionId);
      if (det) det.arret = ok ? 'réussi' : 'échec';
    } else if (ok && op.type === 'installation' && !s.installations.some((i) => i.posteId === p.id && i.applicationId === op.applicationId)) {
      s.installations.push({ id: `${p.id}-${op.applicationId}`, posteId: p.id, salleId: p.salleId, ecoleId: schoolOf(p, s), applicationId: op.applicationId });
    } else if (ok && op.type === 'desinstallation') {
      s.installations = s.installations.filter((i) => !(i.posteId === p.id && i.applicationId === op.applicationId));
    } else if (ok && op.type === 'reinstallation') {
      for (const proc of s.processus) if (proc.posteId === p.id && !proc.stoppedAt) proc.stoppedAt = now;
    }
    const states = Object.values(op.resultats);
    if (states.every((x) => x !== 'en_attente')) { op.statut = states.every((x) => x === 'reussie') ? 'terminee' : 'echec'; op.termineLe = now; }
  }
}

/* ---------- Moteur : file d'écriture, révisions, journal des modifications ---------- */

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
      return pdf ? pdf(report, state) : reportPdf(report, state);
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

/* ---------- Routeurs ---------- */

/** actor : fonction (req) => utilisateur agissant, ou null sans session valide. */
export function createWorkspaceRouter({ repository, actor }) {
  const router = express.Router();
  router.use(express.json({ limit: '8mb' }));
  router.use(async (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    try {
      const current = await actor(req);
      if (!current) return res.status(401).json({ error: 'Connexion nécessaire.' });
      res.locals.actor = current;
      next();
    } catch (error) { next(error); }
  });
  router.get('/', (req, res) => {
    const etag = `"${repository.state.revision}-${res.locals.actor.id}"`;
    res.set('ETag', etag);
    if (req.get('If-None-Match') === etag) return res.status(304).end();
    res.json(repository.read(res.locals.actor));
  });
  router.put('/', async (req, res, next) => {
    try { res.json(await repository.update(req.body?.state, req.body?.baseRevision, res.locals.actor)); } catch (e) { next(e); }
  });
  router.get('/reports/:id/pdf', async (req, res, next) => {
    try {
      const pdf = await repository.pdf(req.params.id, res.locals.actor);
      res.type('application/pdf').set('Content-Disposition', `inline; filename="${req.params.id.replace(/[^a-zA-Z0-9-]/g, '')}.pdf"`).send(pdf);
    } catch (e) { next(e); }
  });
  router.use(errorHandler('Espace de travail'));
  return router;
}

/** API des postes : authentification par jeton porteur. */
export function createAgentRouter({ repository, token }) {
  const expected = Buffer.from(String(token));
  const router = express.Router();
  router.use(express.json({ limit: '4mb' }));
  router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    const given = Buffer.from(String(req.get('Authorization') ?? '').replace(/^Bearer /, ''));
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return res.status(401).json({ error: 'Poste non authentifié.' });
    next();
  });
  router.get('/postes', (_req, res) => res.json({ postes: repository.agent.postes() }));
  router.post('/rapports', async (req, res, next) => {
    try {
      const rapports = req.body?.rapports;
      assert(Array.isArray(rapports) && rapports.length <= 2000, 'Rapports invalides.');
      res.json(await repository.agent.rapports(rapports));
    } catch (e) { next(e); }
  });
  router.post('/resultats', async (req, res, next) => {
    try {
      const resultats = req.body?.resultats;
      assert(Array.isArray(resultats) && resultats.length <= 5000, 'Résultats invalides.');
      await repository.agent.resultats(resultats);
      res.json({ ok: true });
    } catch (e) { next(e); }
  });
  router.use(errorHandler('Postes'));
  return router;
}

const errorHandler = (label) => (error, _req, res, _next) => {
  if (!error.status) console.error(`${label} :`, error.code || error.name, error.message);
  res.status(error.status || 500).json({ error: error.status ? error.message : 'Enregistrement momentanément indisponible.' });
};
