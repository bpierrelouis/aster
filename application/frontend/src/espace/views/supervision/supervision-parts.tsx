/* ==========================================================================
   Supervision : éléments communs aux onglets (classement d'un processus,
   texte de recherche d'un exécutable).
   ========================================================================== */

import { CLASSEMENTS } from '#shared/catalog.ts';
import { logiciel } from '#shared/referentiels.ts';
import type { Classement } from '#shared/types.ts';

export function Status({ c }: { c: Classement }) {
  return <span className="ops-status"><span className={`led led--${CLASSEMENTS[c]?.led || 'wait'}`}></span>{CLASSEMENTS[c]?.label || c}</span>;
}

/** Un exécutable se cherche aussi par le nom de son application */
export const processText = (nom: string) => `${nom} ${logiciel(nom)?.nom ?? ''}`;
