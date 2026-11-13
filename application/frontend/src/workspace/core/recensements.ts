/* ==========================================================================
   Recensement mobile (RECON) : campagnes de l'école affichée et leur bilan,
   d'après les constats intégrés par le serveur (backend/workspace/recensement.ts).
   - Attendus : matériels affectés aux salles de la campagne ;
   - Vus : matériels d'un constat de présence, de confirmation ou de
     relocalisation dans la campagne ;
   - À traiter : codes inconnus, écarts et refus non encore traités.
   ========================================================================== */

import { cached, scope } from './selectors.ts';
import { store, currentEcole } from './store.ts';
import { dateMed, plural } from '#shared/format.ts';
import type { Constat, Id, Materiel, Recensement, Salle } from '#shared/types.ts';

/** Avancement d'une salle : matériels attendus et ceux déjà vus */
export interface BilanSalle { salle: Salle; attendus: Materiel[]; vus: Materiel[] }

const VU: readonly Constat['resultat'][] = ['confirme', 'present', 'deplace'];
const A_TRAITER: readonly Constat['resultat'][] = ['inconnu', 'ecart', 'refuse'];

/** Campagne en cours : ni close, ni expirée */
export const ouverte = (r: Recensement, now = Date.now()) => !r.close && r.expireLe > now;
export const aTraiter = (c: Constat) => A_TRAITER.includes(c.resultat) && !c.traite;
/** Échéance ou clôture d'une campagne */
export const echeance = (r: Recensement) => (r.close ? `Close le ${dateMed(r.close.at)}` : ouverte(r) ? `Jusqu’au ${dateMed(r.expireLe)}` : `Expirée le ${dateMed(r.expireLe)}`);
/** Périmètre d'une campagne */
export const perimetre = (r: Recensement) => (r.salleIds.length ? plural(r.salleIds.length, 'salle') : 'Toute l’école');

/** Campagnes de l'école affichée : en cours d'abord, puis les plus récentes */
export const recensements = () => cached('recensements', () => {
  const e = currentEcole();
  return store.state.recensements.filter((r) => !e || e === 'all' || r.ecoleId === e).sort((a, b) => Number(ouverte(b)) - Number(ouverte(a)) || b.at - a.at);
});

/** Bilan d'une campagne : salles, constats (récents d'abord), avancement, à traiter */
export const bilan = (r: Recensement) => cached(`recensement:${r.id}`, () => {
  const { salles: toutes, materiels } = scope();
  const salles = toutes.filter((s) => s.ecoleId === r.ecoleId && (!r.salleIds.length || r.salleIds.includes(s.id)));
  const constats = store.state.constats.filter((c) => c.recensementId === r.id).sort((a, b) => b.at - a.at);
  const vus = new Set<Id>(constats.filter((c) => c.materielId && VU.includes(c.resultat)).map((c) => c.materielId!));
  const parSalle: BilanSalle[] = salles.map((salle) => {
    const attendus = materiels.filter((m) => m.salleId === salle.id);
    return { salle, attendus, vus: attendus.filter((m) => vus.has(m.id)) };
  });
  const attendus = parSalle.reduce((n, s) => n + s.attendus.length, 0);
  const vusTotal = parSalle.reduce((n, s) => n + s.vus.length, 0);
  return {
    salles, parSalle, constats, attendus, vus: vusTotal,
    pct: attendus ? vusTotal / attendus : 0,
    confirmes: constats.filter((c) => c.resultat === 'confirme').length,
    deplaces: constats.filter((c) => ['deplace', 'range'].includes(c.resultat)).length,
    aTraiter: constats.filter(aTraiter),
  };
});

/** Constats à traiter dans les campagnes en cours de l'école affichée (menu) */
export const aTraiterEnCours = () => cached('recensements:aTraiter', () => recensements().filter((r) => ouverte(r)).reduce((n, r) => n + bilan(r).aTraiter.length, 0));
