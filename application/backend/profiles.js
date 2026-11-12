// Profils ORION (portés par le compte ORION, pas par le fournisseur d'identité).
export const profiles = {
  superadmin: { label: 'Super administrateur', scope: 'Toutes les écoles' },
  admin: { label: 'Administrateur', scope: 'École de rattachement' },
  gestionnaire: { label: 'Gestionnaire', scope: 'École de rattachement' },
  formateur: { label: 'Formateur', scope: 'École de rattachement' },
};

/** Identité transmise par le fournisseur : sujet obligatoire, adresse électronique pour le rapprochement. */
export function identityFromClaims(claims) {
  if (typeof claims.sub !== 'string' || !claims.sub) throw new Error('Identité incomplète.');
  const email = typeof claims.email === 'string' ? claims.email.trim().toLowerCase() : null;
  return { sub: claims.sub, email, name: claims.name || claims.preferred_username || claims.sub };
}

/** Utilisateur présenté au navigateur, à partir du compte ORION actif. */
export function userFromAccount(actor, ecoleNom = null) {
  return {
    id: actor.id,
    name: actor.nom,
    email: actor.email,
    role: actor.role,
    profile: profiles[actor.role].label,
    scope: actor.role === 'superadmin' ? profiles.superadmin.scope : (ecoleNom ?? profiles[actor.role].scope),
  };
}
