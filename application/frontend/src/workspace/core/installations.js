/* ==========================================================================
   Installation physique des salles (shared/catalog.js, LOGISTIQUE), d'après
   les champs tenus par le serveur : deplacement (en cours) et installation
   (dernier déplacement confirmé).
   - Trajet : matériels qui vont d'un même lieu à un même autre (stock ou
     salle). Avancement : déplacements confirmés depuis le plus ancien encore
     en cours, sur l'ensemble du trajet ; le trajet disparaît une fois fini.
   - Salle : ses trajets à l'arrivée et au départ. Elle est en cours
     d'installation tant qu'un trajet la concerne, équipée ensuite ; une
     installation finie depuis moins d'un mois (30 jours) reste « terminée ».
   ========================================================================== */

import { cached, scope, index } from './selectors.js';
import { SALLE_STATUTS, TERMINEES_RECENTES } from '#shared/catalog.js';

const key = (de, vers) => `${de ?? ''}>${vers ?? ''}`;
const progress = (x) => {
  const total = x.enCours.length + x.faits.length;
  return { ...x, total, pct: total ? x.faits.length / total : 1 };
};

export const installations = () => cached('installations', () => {
  const { materiels, salleIds } = scope();
  const now = Date.now();
  // Trajets en cours, puis déplacements confirmés depuis leur début
  const trajets = new Map();
  for (const m of materiels) if (m.deplacement) {
    const k = key(m.deplacement.de, m.salleId);
    if (!trajets.has(k)) trajets.set(k, { de: m.deplacement.de ?? null, vers: m.salleId ?? null, enCours: [], faits: [], debut: Infinity });
    const t = trajets.get(k);
    t.enCours.push(m);
    t.debut = Math.min(t.debut, m.deplacement.at);
  }
  const confirmes = materiels.filter((m) => m.installation);
  for (const m of confirmes) {
    const t = trajets.get(key(m.installation.de, m.salleId));
    if (t && m.installation.at >= t.debut) t.faits.push(m);
  }
  const routes = [...trajets.values()].map(progress).sort((a, b) => a.debut - b.debut);

  // Par salle : ses trajets à l'arrivée (à installer) et au départ (à retirer)
  const bySalle = new Map();
  const room = (id) => {
    if (!bySalle.has(id)) bySalle.set(id, { salle: index().salle.get(id), aInstaller: [], aRetirer: [], enCours: [], faits: [], debut: Infinity });
    return bySalle.get(id);
  };
  for (const t of routes) for (const id of [t.vers, t.de]) {
    if (!id || !salleIds.has(id)) continue;
    const x = room(id);
    (id === t.vers ? x.aInstaller : x.aRetirer).push(...t.enCours);
    x.enCours.push(...t.enCours);
    x.faits.push(...t.faits);
    x.debut = Math.min(x.debut, t.debut);
  }
  const enCours = [...bySalle.values()].map(progress).sort((a, b) => a.debut - b.debut);
  for (const x of enCours) bySalle.set(x.salle.id, x);

  // Installations terminées récemment : salles sans trajet, avec un déplacement confirmé depuis moins d'un mois
  const finies = new Map();
  for (const m of confirmes.filter((x) => x.installation.at > now - TERMINEES_RECENTES)) for (const id of new Set([m.salleId, m.installation.de])) {
    if (!id || !salleIds.has(id) || bySalle.has(id)) continue;
    if (!finies.has(id)) finies.set(id, { salle: index().salle.get(id), enCours: [], aInstaller: [], aRetirer: [], faits: [], fin: 0 });
    const x = finies.get(id);
    x.faits.push(m);
    x.fin = Math.max(x.fin, m.installation.at);
  }
  const terminees = [...finies.values()].map(progress).sort((a, b) => b.fin - a.fin);

  return { routes, enCours, terminees, bySalle }; // matériels à déplacer : parc().deplacements (core/selectors.js)
});

/** Installation en cours d'une salle, ou null si la salle est équipée */
export const installationOf = (salleId) => installations().bySalle.get(salleId) ?? null;

/** Statut d'une salle qui contient du matériel ou en attend : en cours d'installation ou équipée ; null sinon */
export const salleStatut = (salleId, total) => (installationOf(salleId) ? SALLE_STATUTS.installation : total ? SALLE_STATUTS.equipee : null);
