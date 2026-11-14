/* ==========================================================================
   Droits par profil, d'après docs/12-MATRICE-DROITS.md
   - Administrateur : tous les droits dans son école (RG-15), sauf la prise en
     charge et le traitement des remontées (décision de l'utilisateur du
     13 novembre), la confirmation d'une installation et le recensement RIGEL,
     réservés au gestionnaire, qu'il suit en lecture (décisions du 14 novembre)
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
  'materiel.view', 'materiel.create', 'materiel.edit', 'materiel.move', 'materiel.import', 'materiel.delete', 'materiel.recensement', 'recensement.view', 'installation.confirm',
  'remontee.create', 'remontee.viewAll', 'remontee.treat', 'pdf.viewAll',
  'supervision.view', 'administration.view', 'ecole.switch',
] as const;
/** Droit d'une action ou d'un module */
export type Capability = (typeof ALL)[number];

/** Droits du seul gestionnaire : traitement des remontées, confirmation des installations, recensement RIGEL */
const GESTIONNAIRE: readonly Capability[] = ['remontee.treat', 'installation.confirm', 'materiel.recensement'];

const CAPS: Record<RoleId, Set<Capability>> = {
  admin: new Set(ALL.filter((c) => !['ecole.switch', ...GESTIONNAIRE].includes(c))),
  superadmin: new Set(ALL.filter((c) => !GESTIONNAIRE.includes(c))),
  gestionnaire: new Set([
    'dashboard.perso', 'dashboard.parc', 'dashboard.remontees', 'dashboard.customize',
    'salle.view', 'materiel.view', 'materiel.create', 'materiel.edit', 'materiel.move', 'materiel.import', 'materiel.recensement', 'recensement.view', 'installation.confirm',
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
  if (cap === 'remontee.treat') return 'Prise en charge et traitement réservés au gestionnaire';
  if (cap === 'installation.confirm') return 'Confirmation par le gestionnaire';
  return 'Action réservée aux gestionnaires et administrateurs';
}
