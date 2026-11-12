/* ==========================================================================
   Suivi des interventions sur les postes (installation, désinstallation,
   réinitialisation ; shared/catalog.js), d'après les demandes et les résultats
   renvoyés par les postes, tenus par le serveur.
   - Une demande vise une salle entière (salleId) ou des postes d'une salle.
   - Poste : fait ou échec selon son résultat ; sans résultat, en cours s'il
     est allumé (il l'exécute à son prochain rapport), en attente s'il est
     éteint ou indisponible.
   - Demande : faite quand tous ses postes l'ont faite ; en échec quand tous
     ont répondu, dont un en échec ; en cours dès qu'un poste l'exécute ou y a
     répondu, tant que tous n'ont pas fini (installation commencée dans une
     salle dont des postes sont éteints) ; en attente tant qu'aucun poste n'a
     commencé, tous étant éteints ou indisponibles.
   ========================================================================== */

import { store } from './store.js';
import { cached, scope, index } from './selectors.js';
import { intervention } from '#shared/catalog.js';

const ORDRE = { echec: 0, encours: 1, attente: 2, fait: 3 }; // postes à surveiller d'abord

const etatPoste = (o, posteId) => {
  const r = o.resultats?.[posteId];
  if (r === 'reussie') return 'fait';
  if (r === 'echec') return 'echec';
  return index().poste.get(posteId)?.allume ? 'encours' : 'attente';
};

function suivi(o) {
  const postes = o.cibles.map((id) => ({ id, poste: index().poste.get(id), etat: etatPoste(o, id) }))
    .sort((a, b) => ORDRE[a.etat] - ORDRE[b.etat] || (a.poste?.nomReseau ?? '').localeCompare(b.poste?.nomReseau ?? '', 'fr', { numeric: true }));
  const n = { total: postes.length, fait: 0, echec: 0, encours: 0, attente: 0 };
  for (const p of postes) n[p.etat]++;
  const etat = n.fait === n.total ? 'fait' : n.fait + n.echec === n.total ? 'echec' : n.attente < n.total ? 'encours' : 'attente';
  return { o, postes, n, etat, cible: cibleDe(o, postes) };
}

/** Cible d'une demande : salle entière, postes d'une salle ou un poste ; label : texte court */
function cibleDe(o, postes) {
  const salle = index().salle.get(o.salleId ?? postes[0]?.poste?.salleId);
  if (o.salleId) return { kind: 'salle', salle, label: salle?.nom ?? 'Salle retirée' };
  if (postes.length > 1) return { kind: 'postes', salle, label: `${postes.length} postes · ${salle?.nom ?? ''}` };
  return { kind: 'poste', salle, poste: postes[0]?.poste, label: postes[0]?.poste?.nomReseau ?? 'Poste retiré' };
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

/** Objet de l'intervention : l'application, ou Windows pour une réinitialisation */
export const objetIntervention = (o) => (o.type === 'reinstallation' ? 'Windows' : application(o.applicationId)?.nom ?? 'l’application');

/** « Installation de Firefox », « Désinstallation d'Eclipse », « Réinitialisation de Windows » */
export function titreIntervention(o) {
  const nom = objetIntervention(o);
  return `${intervention(o.type).label} ${/^[aeiouyéèêàâîôû]/i.test(nom) ? 'd’' : 'de '}${nom}`;
}

/** Cible demandée, pour le message de confirmation : « la salle A101 », le nom du poste ou « 3 postes de A101 » */
export function cibleIntervention({ salleId, postes = [] }) {
  if (salleId) return `la salle ${index().salle.get(salleId)?.nom}`;
  const premier = index().poste.get(postes[0]);
  return postes.length > 1 ? `${postes.length} postes de ${index().salle.get(premier?.salleId)?.nom}` : premier?.nomReseau;
}
