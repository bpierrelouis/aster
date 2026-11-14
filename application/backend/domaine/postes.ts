/* ==========================================================================
   Domaine · postes et interventions
   - Rapports et résultats des postes (API d'agent) : seuls les postes
     alimentent processus, détections et installations.
   - Interventions demandées par les utilisateurs : cibles, image et suivi
     fixés par le serveur, puis exécutées par les postes.
   ========================================================================== */

import { IMAGE_REFERENCE, processClass } from '#shared/operations-data.ts';
import { DAY, HOUR } from '#shared/format.ts';
import { assert, fail, id, isAdmin, schoolOf } from './commun.ts';
import type { Id, OperationType, Processus, ResultatPoste, WorkspaceState } from '#shared/types.ts';
import type { Contexte, LooseItem } from './commun.ts';

export const DISCONNECT_AFTER = 30_000; // poste sans rapport depuis ce délai : poste déconnecté
/** Adresse IPv4 en notation décimale pointée (quatre octets de 0 à 255, sans zéro initial) */
const IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
export const isIpv4 = (value: unknown): value is string => typeof value === 'string' && IPV4.test(value);

/** Rapport d'un poste, tel que l'envoie l'agent ; chaque champ est contrôlé ici */
export interface Rapport {
  poste: string;
  session?: string | null;
  /** Adresse IPv4 du poste */
  adresseIp?: string;
  /** Système d'exploitation installé (« Windows 11 ») */
  os?: string;
  processus?: { nom: string; compte?: string | null }[];
  applications?: Id[];
}
/** Résultat d'exécution d'une intervention, renvoyé par un poste ; contrôlé ici */
export interface Resultat { operation: Id; poste: string; statut: ResultatPoste }
/** Commande en attente pour un poste */
export interface Commande {
  operation: Id;
  poste: string;
  type: OperationType;
  applicationId: Id | null;
  image: string | null;
  processus: Pick<Processus, 'nom' | 'compte'> | null;
}

/**
 * Rapports des postes : session ouverte (compte Windows, ou aucune si le poste est seulement allumé), adresse IP
 * (conservée si absente ou invalide), système d'exploitation (conservé si absent), processus utilisateur en cours et applications installées. Le rapport d'un
 * poste dont l'unité centrale est hors service est ignoré : ce poste ne peut être ni allumé ni connecté (eteindreHorsService).
 */
export function applyReports(s: WorkspaceState, rapports: Rapport[], now = Date.now()) {
  const byName = new Map(s.postes.map((p) => [p.nomReseau, p]));
  const hs = new Set<Id | null>(s.materiels.filter((m) => m.hs).map((m) => m.id));
  const unknown: string[] = [];
  for (const r of rapports) {
    const p = byName.get(r?.poste);
    if (!p) { unknown.push(r?.poste); continue; }
    if (hs.has(p.materielId)) continue;
    const ecoleId = schoolOf(p, s);
    p.allume = true;
    p.session = typeof r.session === 'string' && r.session.trim() ? r.session.trim().slice(0, 120) : null;
    p.vuLe = now;
    if (isIpv4(r.adresseIp)) p.adresseIp = r.adresseIp;
    if (typeof r.os === 'string' && r.os.trim()) p.os = r.os.trim().slice(0, 80);
    const reported = new Map((Array.isArray(r.processus) ? r.processus : []).slice(0, 200)
      .filter((x) => typeof x?.nom === 'string' && x.nom.length <= 120)
      .map((x) => [`${x.nom.toLowerCase()}|${String(x.compte ?? '').slice(0, 120)}`, { nom: x.nom, compte: String(x.compte ?? '').slice(0, 120) }]));
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
      if (classement === 'blacklist') s.operations.push({ id: id('op'), type: 'arret', auto: true, cibles: [p.id], processusId: proc.id, detectionId: detection.id, ecoleId: ecoleId!, at: now, par: 'ORION', parId: null, statut: 'enregistree', resultats: { [p.id]: 'en_attente' } });
    }
    if (Array.isArray(r.applications)) {
      const apps = new Set(r.applications.filter((a) => s.applications.some((x) => x.id === a)));
      s.installations = s.installations.filter((i) => i.posteId !== p.id || apps.has(i.applicationId));
      for (const a of apps) if (!s.installations.some((i) => i.posteId === p.id && i.applicationId === a)) s.installations.push({ id: `${p.id}-${a}`, posteId: p.id, salleId: p.salleId, ecoleId, applicationId: a });
    }
  }
  markDisconnected(s, now);
  // Historique borné : processus arrêtés et détections conservés sur une durée limitée
  s.processus = s.processus.filter((x) => !x.stoppedAt || now - x.stoppedAt < HOUR);
  s.detections = s.detections.filter((d) => now - d.at < 30 * DAY).slice(-2000);
  return unknown;
}

export function markDisconnected(s: WorkspaceState, now = Date.now()) {
  for (const p of s.postes) {
    if (!p.allume || (p.vuLe && now - p.vuLe < DISCONNECT_AFTER)) continue;
    Object.assign(p, { allume: false, session: null });
    for (const proc of s.processus) if (proc.posteId === p.id && !proc.stoppedAt) proc.stoppedAt = now;
  }
}

/** Commandes en attente pour des postes donnés (par nom réseau). */
export function pendingCommands(s: WorkspaceState, posteNames: string[]) {
  const names = new Set(posteNames);
  const postes = new Map(s.postes.filter((p) => names.has(p.nomReseau)).map((p) => [p.id, p]));
  const out: Commande[] = [];
  for (const op of s.operations) {
    if (op.statut !== 'enregistree') continue;
    for (const [pid, etat] of Object.entries(op.resultats ?? {})) {
      if (etat !== 'en_attente' || !postes.has(pid)) continue;
      const proc = op.processusId && s.processus.find((x) => x.id === op.processusId);
      out.push({ operation: op.id, poste: postes.get(pid)!.nomReseau, type: op.type, applicationId: op.applicationId ?? null, image: op.image ?? null, processus: proc ? { nom: proc.nom, compte: proc.compte } : null });
    }
  }
  return out;
}

/** Résultats d'exécution renvoyés par les postes. */
export function applyResults(s: WorkspaceState, resultats: Resultat[], now = Date.now()) {
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
      s.installations.push({ id: `${p.id}-${op.applicationId}`, posteId: p.id, salleId: p.salleId, ecoleId: schoolOf(p, s), applicationId: op.applicationId! });
    } else if (ok && op.type === 'desinstallation') {
      s.installations = s.installations.filter((i) => !(i.posteId === p.id && i.applicationId === op.applicationId));
    } else if (ok && op.type === 'reinstallation') {
      for (const proc of s.processus) if (proc.posteId === p.id && !proc.stoppedAt) proc.stoppedAt = now;
    }
    const states = Object.values(op.resultats);
    if (states.every((x) => x !== 'en_attente')) { op.statut = states.every((x) => x === 'reussie') ? 'terminee' : 'echec'; op.termineLe = now; }
  }
}

/* ---------- Écritures des utilisateurs ---------- */

const OPERATION_TYPES: readonly string[] = ['installation', 'desinstallation', 'reinstallation', 'arret'] satisfies OperationType[];

/** Poste déclaré ou modifié : unité centrale, un matériel de ce type, de l'école de la salle du poste */
export function reglePoste(x: LooseItem, { next, salles }: Contexte) {
  if (x.materielId == null) return;
  const uc = next.materiels.find((m) => m.id === x.materielId);
  assert(uc && uc.type === 'uc' && uc.ecoleId === schoolOf(x, { ...next, salles }), 'L’unité centrale doit être un matériel de l’école du poste.');
}

/** Demande d'intervention : le suivi est ensuite tenu par les postes */
export function regleIntervention(x: LooseItem, old: LooseItem | undefined, { next, actor, now }: Contexte) {
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

/** Un poste dont l'unité centrale est hors service ne peut être ni allumé ni connecté : il s'éteint, ses processus s'arrêtent. */
export function eteindreHorsService(s: WorkspaceState, now = Date.now()) {
  const hs = new Set<Id | null>(s.materiels.filter((m) => m.hs).map((m) => m.id));
  for (const p of s.postes) {
    if (!p.allume || !hs.has(p.materielId)) continue;
    Object.assign(p, { allume: false, session: null });
    for (const proc of s.processus) if (proc.posteId === p.id && !proc.stoppedAt) proc.stoppedAt = now;
  }
}
