/* ==========================================================================
   Suivi des interventions sur les postes (installation, désinstallation,
   réinstallation ; shared/catalog.js), d'après les demandes et les résultats
   renvoyés par les postes, tenus par le serveur.
   - Une demande vise une salle entière (salleId) ou un seul poste.
   - Poste : fait ou échec selon son résultat ; sans résultat, en cours s'il
     est connecté (il l'exécute à son prochain rapport), en attente s'il est
     éteint ou indisponible.
   - Demande : faite quand tous ses postes l'ont faite ; en échec quand tous
     ont répondu, dont un en échec ; en cours tant qu'un poste connecté
     l'exécute ; en attente quand il ne reste que des postes indisponibles.
   ========================================================================== */

import { store } from './store.js';
import { cached, scope, index } from './selectors.js';
import { intervention } from '#shared/catalog.js';

const ORDRE = { echec: 0, encours: 1, attente: 2, fait: 3 }; // postes à surveiller d'abord

const etatPoste = (o, posteId) => {
  const r = o.resultats?.[posteId];
  if (r === 'reussie') return 'fait';
  if (r === 'echec') return 'echec';
  return index().poste.get(posteId)?.connecte ? 'encours' : 'attente';
};

function suivi(o) {
  const postes = o.cibles.map((id) => ({ id, poste: index().poste.get(id), etat: etatPoste(o, id) }))
    .sort((a, b) => ORDRE[a.etat] - ORDRE[b.etat] || (a.poste?.nomReseau ?? '').localeCompare(b.poste?.nomReseau ?? '', 'fr', { numeric: true }));
  const n = { total: postes.length, fait: 0, echec: 0, encours: 0, attente: 0 };
  for (const p of postes) n[p.etat]++;
  const etat = n.fait === n.total ? 'fait' : n.fait + n.echec === n.total ? 'echec' : n.encours ? 'encours' : 'attente';
  return { o, postes, n, etat, salle: o.salleId ? index().salle.get(o.salleId) : null, poste: o.salleId ? null : postes[0]?.poste ?? null };
}

/** Interventions du périmètre, les plus récentes d'abord */
export const interventions = () => cached('interventions', () => {
  const ids = new Set(scope().postes.map((p) => p.id));
  return (store.state.operations ?? [])
    .filter((o) => intervention(o.type) && o.cibles?.some((id) => ids.has(id)))
    .map(suivi)
    .sort((a, b) => (b.o.at ?? 0) - (a.o.at ?? 0));
});

/** Interventions qui ne sont pas finies : en cours ou en attente de postes */
export const interventionsOuvertes = () => interventions().filter((x) => x.etat === 'encours' || x.etat === 'attente');

const application = (id) => (store.state.applications ?? []).find((a) => a.id === id);

/** Objet de l'intervention : l'application, ou Windows pour une réinstallation */
export const objetIntervention = (o) => (o.type === 'reinstallation' ? 'Windows' : application(o.applicationId)?.nom ?? 'l’application');

/** « Installation de Firefox », « Désinstallation d'Eclipse », « Réinstallation de Windows » */
export function titreIntervention(o) {
  const nom = objetIntervention(o);
  return `${intervention(o.type).label} ${/^[aeiouyéèêàâîôû]/i.test(nom) ? 'd’' : 'de '}${nom}`;
}

/** « la salle A101 » ou le nom du poste */
export const cibleIntervention = ({ salleId, posteId }) => (salleId ? `la salle ${index().salle.get(salleId)?.nom}` : index().poste.get(posteId)?.nomReseau);
