/* ==========================================================================
   Domaine · règles de classement des processus (whitelist / blacklist)
   RG-47 : une seule portée par règle (globale, école, bâtiment ou salle) ;
   RG-50 : droits contrôlés par mergeState (espace.ts).
   ========================================================================== */

import { assert } from './commun.ts';
import type { Portee } from '#shared/types.ts';
import type { Contexte, LooseItem } from './commun.ts';

const CLASSEMENTS: readonly unknown[] = ['whitelist', 'blacklist'];
const PORTEES: readonly unknown[] = ['global', 'ecole', 'batiment', 'salle'] satisfies Portee[];

/** Règle créée ou modifiée : nom, classement et portée valides ; seuls les rattachements de sa portée sont conservés */
export function regleRegle(x: LooseItem, { next, salles }: Contexte) {
  assert(typeof x.nom === 'string' && x.nom.trim() && x.nom.trim().length <= 120, 'Nom du processus obligatoire.');
  x.nom = x.nom.trim();
  assert(CLASSEMENTS.includes(x.classement), 'Classement inconnu.');
  assert(PORTEES.includes(x.portee), 'Portée inconnue.');
  if (x.portee !== 'batiment') delete x.batiment;
  if (x.portee !== 'salle') delete x.salleId;
  if (x.portee === 'global') { x.ecoleId = null; return; }
  assert(next.ecoles.some((e) => e.id === x.ecoleId), 'École inconnue.');
  if (x.portee === 'batiment') assert(salles.some((s) => s.ecoleId === x.ecoleId && s.batiment === x.batiment), 'Bâtiment inconnu dans cette école.');
  if (x.portee === 'salle') assert(salles.some((s) => s.id === x.salleId && s.ecoleId === x.ecoleId), 'Salle inconnue dans cette école.');
}
