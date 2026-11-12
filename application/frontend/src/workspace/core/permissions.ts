/* ==========================================================================
   Droits par profil, d'après docs/12-MATRICE-DROITS.md
   - Administrateur : tous les droits dans son école (RG-15)
   - Super administrateur : mêmes droits, toutes les écoles (RG-15, RG-69)
   - Gestionnaire : parc et remontées, sans suppression (RG-16 à RG-18)
   - Formateur : salles, supervision, création et suivi de ses remontées (RG-19, RG-21)
   L'interface ne masque pas une action d'un écran : elle la désactive et
   explique pourquoi. Les modules entiers non accessibles sont retirés du menu.
   ========================================================================== */

import { store } from './store.ts';
import type { RoleId } from '#shared/types.ts';

const ALL = [
  'dashboard.perso', 'dashboard.parc', 'dashboard.remontees', 'dashboard.customize',
  'salle.view', 'salle.manage', 'salle.delete',
  'materiel.view', 'materiel.create', 'materiel.edit', 'materiel.move', 'materiel.import', 'materiel.delete',
  'remontee.create', 'remontee.viewAll', 'remontee.treat', 'pdf.viewAll',
  'supervision.view', 'administration.view', 'ecole.switch',
] as const;
/** Droit d'une action ou d'un module */
export type Capability = (typeof ALL)[number];

const CAPS: Record<RoleId, Set<Capability>> = {
  admin: new Set(ALL.filter((c) => c !== 'ecole.switch')),
  superadmin: new Set(ALL),
  gestionnaire: new Set([
    'dashboard.perso', 'dashboard.parc', 'dashboard.remontees', 'dashboard.customize',
    'salle.view', 'materiel.view', 'materiel.create', 'materiel.edit', 'materiel.move', 'materiel.import',
    'remontee.viewAll', 'remontee.treat', 'pdf.viewAll',
  ]),
  formateur: new Set([
    'dashboard.perso', 'dashboard.customize', 'salle.view', 'materiel.view',
    'remontee.create', 'supervision.view',
  ]),
};

export const can = (cap: Capability) => CAPS[store.state.role]?.has(cap) ?? false;

/** Raison lisible d'un refus, pour l'infobulle */
export function why(cap: Capability) {
  if (can(cap)) return '';
  if (cap === 'materiel.delete' || cap === 'salle.delete') return 'Suppression réservée aux administrateurs';
  if (cap === 'salle.manage') return 'Gestion des salles réservée aux administrateurs';
  if (cap === 'remontee.create') return 'Création réservée aux formateurs et administrateurs';
  if (cap === 'remontee.treat') return 'Traitement réservé aux gestionnaires et administrateurs';
  return 'Action réservée aux gestionnaires et administrateurs';
}
