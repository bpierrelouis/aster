/* ==========================================================================
   Remontées · onglets par profil, partagés par le sous-menu et l'écran
   - Gestionnaire : backlogs (avancement de son travail) des remontées et
     des installations des salles, et toutes les remontées.
   - Autres profils : une liste par phase (en attente, en cours, terminées),
     toutes, et les siennes pour qui peut aussi tout voir.
   ========================================================================== */

import { store } from '../../core/store.ts';
import { can } from '../../core/permissions.ts';
import { REMONTEE_PHASES } from '#shared/catalog.ts';
import type { Remontees } from '../../core/selectors.ts';
import type { RemonteePhase } from '#shared/types.ts';

const phase = (id: RemonteePhase) => REMONTEE_PHASES.find((p) => p.id === id)!;

export const TABS = {
  backlog: { label: 'Remontées', icon: 'layers' },
  installations: { label: 'Installations', icon: 'refresh' },
  attente: { ...phase('attente'), list: (rm: Remontees) => rm.attente, empty: ['checkCircle', 'Aucune remontée en attente. Tout est pris en charge.'] },
  encours: { ...phase('encours'), list: (rm: Remontees) => rm.encours, empty: ['checkCircle', 'Aucune remontée en cours de traitement.'] },
  terminees: { ...phase('terminee'), list: (rm: Remontees) => rm.terminees, empty: ['checkCircle', 'Aucune remontée terminée pour le moment.'] },
  toutes: { label: 'Toutes', icon: 'list', list: (rm: Remontees) => rm.visible, empty: ['documents', 'Aucune remontée.'] },
  miennes: { label: 'Mes remontées', icon: 'user', list: (rm: Remontees) => rm.mine, empty: ['documents', 'Vous n’avez pas encore créé de remontée.'] },
};
/** Identifiant d'un onglet des remontées */
export type TabId = keyof typeof TABS;

/** Onglets du compte connecté ; le premier est l'onglet par défaut */
export function remonteeTabs(): TabId[] {
  if (store.state.role === 'gestionnaire') return ['backlog', ...(can('materiel.move') ? ['installations' as const] : []), 'toutes'];
  return ['attente', 'encours', 'terminees', 'toutes', ...(can('remontee.create') && can('remontee.viewAll') ? ['miennes' as const] : [])];
}
