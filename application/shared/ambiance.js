/* ==========================================================================
   Préférences d'affichage d'un compte : ambiance (couleurs et marque) et
   niveau de verre. Les couleurs sont dans styles/tokens.css, le matériau dans
   styles/glass.css. Partagé avec le serveur, qui valide les préférences ;
   l'application au document est dans frontend/src/workspace/core/theme.js.
   ========================================================================== */

export const AMBIANCES = [
  { id: 'aube', label: 'Aube', tone: 'light' },
  { id: 'encre', label: 'Encre', tone: 'dark' },
  { id: 'orion', label: 'Orion', tone: 'dark' },
  { id: 'vigie', label: 'Vigie', tone: 'light' },
];

export const GLASS = [
  { id: 'liquid', label: 'Liquide', tip: 'Verre clair et transparent, bords lumineux' },
  { id: 'solid', label: 'Opaque', tip: 'Surfaces pleines, sans transparence' },
];

const known = (list, id) => list.find((x) => x.id === id) ?? list[0];

/** Préférences valides : une valeur inconnue (ancienne ambiance, verre givré) revient au défaut. */
export const displayPrefs = (p = {}) => ({ ambiance: known(AMBIANCES, p.ambiance).id, glass: known(GLASS, p.glass).id });
