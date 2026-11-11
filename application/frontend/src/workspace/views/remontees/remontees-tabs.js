/* ==========================================================================
   Remontées · onglets par profil, partagés par le sous-menu et l'écran
   - Gestionnaire : backlogs (avancement de son travail) des remontées et
     des installations des salles, et toutes les remontées.
   - Autres profils : une liste par phase (en attente, en cours, traitées,
     validées), toutes, et les siennes pour qui peut aussi tout voir.
   ========================================================================== */

import { store } from '../../core/store.js';
import { can } from '../../core/permissions.js';
import { REMONTEE_PHASES } from '#shared/catalog.js';

const phase = (id) => REMONTEE_PHASES.find((p) => p.id === id);

export const TABS = {
  backlog: { label: 'Remontées', icon: 'layers' },
  installations: { label: 'Installations', icon: 'refresh' },
  attente: { ...phase('attente'), list: (rm) => rm.attente, empty: ['checkCircle', 'Aucune remontée en attente. Tout est pris en charge.'] },
  encours: { ...phase('encours'), list: (rm) => rm.encours, empty: ['checkCircle', 'Aucune remontée en cours de traitement.'] },
  traitees: { ...phase('traitee'), list: (rm) => rm.traitees, empty: ['hourglass', 'Aucune remontée traitée en attente de validation.'] },
  validees: { ...phase('validee'), list: (rm) => rm.validees, empty: ['checkCircle', 'Aucune remontée validée pour le moment.'] },
  toutes: { label: 'Toutes', icon: 'list', list: (rm) => rm.visible, empty: ['documents', 'Aucune remontée.'] },
  miennes: { label: 'Mes remontées', icon: 'user', list: (rm) => rm.mine, empty: ['documents', 'Vous n’avez pas encore créé de remontée.'] },
};

/** Onglets du compte connecté ; le premier est l'onglet par défaut */
export function remonteeTabs() {
  if (store.state.role === 'gestionnaire') return ['backlog', ...(can('materiel.move') ? ['installations'] : []), 'toutes'];
  return ['attente', 'encours', 'traitees', 'validees', 'toutes', ...(can('remontee.create') && can('remontee.viewAll') ? ['miennes'] : [])];
}
