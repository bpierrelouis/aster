/* ==========================================================================
   Espace de travail · rapports et résultats des postes (API d'agent)
   Seuls les postes alimentent processus, détections et installations.
   ========================================================================== */

import { processClass } from '#shared/operations-data.js';
import { DAY } from '#shared/format.js';
import { id, schoolOf } from './rules.js';

export const DISCONNECT_AFTER = 30_000; // poste sans rapport depuis ce délai : déconnecté

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
