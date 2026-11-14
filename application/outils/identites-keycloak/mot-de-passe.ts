/* ==========================================================================
   Démonstrateur uniquement : mot de passe de chaque compte, dérivé du secret
   PROVISIONING_PASSWORD_SECRET et de l'adresse électronique. Différent pour
   chaque compte, stable d'un démarrage à l'autre, jamais versionné ni stocké
   en clair (l'annuaire n'en garde qu'une empreinte).
   ========================================================================== */

import { createHmac } from 'node:crypto';

// Lettres et chiffres sans caractères ambigus (i, l, o, 0, 1), pour une saisie sans erreur
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

/** Mot de passe du compte : trois groupes de quatre caractères (environ 59 bits), par exemple « k7m2-p9qx-4hrt ». */
export function motDePasse(secret: string, email: string) {
  const octets = createHmac('sha256', secret).update(email.trim().toLowerCase()).digest();
  const car = Array.from(octets.subarray(0, 12), (o) => ALPHABET[o % ALPHABET.length]).join('');
  return `${car.slice(0, 4)}-${car.slice(4, 8)}-${car.slice(8)}`;
}
