import { role } from '#shared/catalog.ts';
import type { Actor } from '#shared/types.ts';

// Les profils sont portés par le compte ORION, pas par le fournisseur d'identité.

/** Identité transmise par le fournisseur : sujet obligatoire, adresse électronique pour le rapprochement. */
export function identityFromClaims(claims: Record<string, unknown>) {
  if (typeof claims.sub !== 'string' || !claims.sub) throw new Error('Identité incomplète.');
  // Adresse retenue pour le rapprochement seulement si le fournisseur l'a vérifiée
  const email = claims.email_verified === true && typeof claims.email === 'string' ? claims.email.trim().toLowerCase() : null;
  return { sub: claims.sub, email };
}

/** Utilisateur présenté au navigateur, à partir du compte ORION actif. */
export function userFromAccount(actor: Actor, ecoleNom: string | null = null) {
  return {
    id: actor.id,
    name: actor.nom,
    email: actor.email,
    role: actor.role,
    profile: role(actor.role).label,
    scope: actor.role === 'superadmin' ? 'Toutes les écoles' : (ecoleNom ?? 'École de rattachement'),
  };
}
