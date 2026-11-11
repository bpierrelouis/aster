/* ==========================================================================
   Préférences d'affichage d'un compte : ambiance (couleurs et marque),
   tonalité forcée des ambiances qui suivent la machine et niveau de verre.
   Les couleurs sont dans styles/tokens.css, le matériau dans
   styles/glass.css. Partagé avec le serveur, qui valide les préférences ;
   l'application au document est dans frontend/src/workspace/core/theme.js.
   ========================================================================== */

export const AMBIANCES = [
  // Aster : Aube (blanc, encre, iris) en clair, Encre (noir, blanc, or) en sombre, selon le réglage de la machine.
  // Une préférence enregistrée « aube » ou « encre » (avant le 11 novembre) revient à ce défaut.
  { id: 'aster', label: 'Aster', tone: 'auto' },
  // Minarm (ministère des Armées) : couleurs du Système de design de l'État (DSFR) et Marianne ; selon le réglage de la machine
  { id: 'minarm', label: 'Minarm', tone: 'auto' },
  { id: 'orion', label: 'Orion', tone: 'dark' },
  { id: 'vigie', label: 'Vigie', tone: 'light' },
];

export const GLASS = [
  { id: 'liquid', label: 'Liquide', tip: 'Verre clair et transparent, bords lumineux' },
  { id: 'solid', label: 'Opaque', tip: 'Surfaces pleines, sans transparence' },
];

// Tonalité des ambiances « auto » (Aster, Minarm) : celle de la machine, ou forcée en clair ou en sombre
export const TONES = [{ id: 'auto' }, { id: 'light' }, { id: 'dark' }];

const known = (list, id) => list.find((x) => x.id === id) ?? list[0];
const RENAMED = { etat: 'minarm' }; // ambiance État renommée Minarm le 11 novembre

/** Préférences valides : une valeur inconnue (ancienne ambiance, verre givré) revient au défaut. */
export const displayPrefs = (p = {}) => ({
  ambiance: known(AMBIANCES, RENAMED[p.ambiance] ?? p.ambiance).id,
  tone: known(TONES, p.tone).id,
  glass: known(GLASS, p.glass).id,
});
