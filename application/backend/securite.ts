/* ==========================================================================
   Outils de sécurité communs au serveur, au relais et au connecteur
   ========================================================================== */

import { timingSafeEqual } from 'node:crypto';

/** Comparaison de deux secrets en temps constant (à longueur égale) : la durée ne révèle pas le préfixe commun */
export const egalConstant = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};
