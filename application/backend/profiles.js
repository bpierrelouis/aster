export const profiles = {
  super_admin: { label: 'Super administrateur', scope: 'Toutes les écoles' },
  admin: { label: 'Administrateur', scope: 'École de rattachement' },
  gestionnaire: { label: 'Gestionnaire', scope: 'École de rattachement' },
  formateur: { label: 'Formateur', scope: 'École de rattachement' },
};

export function userFromClaims(claims) {
  const roles = Array.isArray(claims.aster_roles) ? claims.aster_roles : [];
  const assigned = Object.keys(profiles).filter((role) => roles.includes(role));
  if (assigned.length !== 1 || typeof claims.sub !== 'string' || !claims.sub) {
    throw new Error('Un unique profil ASTER reconnu est nécessaire.');
  }
  const role = assigned[0];
  return {
    id: claims.sub,
    name: claims.name || claims.preferred_username || claims.sub,
    email: claims.email || null,
    role,
    profile: profiles[role].label,
    scope: profiles[role].scope,
  };
}
