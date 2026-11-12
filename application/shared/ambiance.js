/* ==========================================================================
   Préférences d'affichage d'un compte : ambiance (couleurs et marque),
   tonalité forcée des ambiances qui suivent la machine et niveau de verre.
   Les couleurs sont dans styles/tokens.css, le matériau dans
   styles/glass.css. Partagé avec le serveur, qui valide les préférences ;
   l'application au document est dans frontend/src/workspace/core/theme.js.
   ========================================================================== */

export const AMBIANCES = [
  // Orion (défaut) : surfaces neutres et halos de la couleur choisie ; noir spatial et étoiles en sombre,
  // selon le réglage de la machine. Une préférence enregistrée « aube » ou « encre » (avant le 11 novembre) revient à ce défaut.
  { id: 'orion', label: 'Orion', tone: 'auto' },
  // Minarm (ministère des Armées) : couleurs du Système de design de l'État (DSFR) et Marianne ; selon le réglage de la machine
  { id: 'minarm', label: 'Minarm', tone: 'auto' },
];

// Accent personnel, indépendant de la marque et des couleurs des états métier.
export const ACCENTS = [
  { id: 'blue', label: 'Bleu', color: '#2563eb' },
  { id: 'violet', label: 'Violet', color: '#7655ba' },
  { id: 'pink', label: 'Rose', color: '#b4477c' },
  { id: 'red', label: 'Rouge', color: '#b94848' },
  { id: 'orange', label: 'Orange', color: '#a65e24' },
  { id: 'green', label: 'Vert', color: '#38764c' },
  { id: 'teal', label: 'Sarcelle', color: '#277c80' },
  { id: 'slate', label: 'Ardoise', color: '#596b85' },
];

export const GLASS = [
  { id: 'liquid', label: 'Liquide', tip: 'Verre clair et transparent, bords lumineux' },
  { id: 'solid', label: 'Opaque', tip: 'Surfaces pleines, sans transparence' },
];

// Tonalité des ambiances « auto » (Orion, Minarm) : celle de la machine, ou forcée en clair ou en sombre
export const TONES = [{ id: 'auto' }, { id: 'light' }, { id: 'dark' }];

// Étoile ORION à quatre branches (charte ORION), marque de l'application : tracé SVG dans un carré de 40,
// dessiné par l'interface (frontend/src/connexion/brand.jsx) et par l'état des lieux PDF (backend/workspace/pdf.js)
export const ORION_STAR = 'M20 0C21.5 13 27 18.5 40 20C27 21.5 21.5 27 20 40C18.5 27 13 21.5 0 20C13 18.5 18.5 13 20 0Z';

const known = (list, id) => list.find((x) => x.id === id) ?? list[0];
// Ambiance État renommée Minarm le 11 novembre ; l'ambiance par défaut « aster » devient « orion », nom de l'application, le 12 novembre
// Ambiance Vigie retirée le 12 novembre : une préférence « vigie » revient au défaut
const RENAMED = { etat: 'minarm', aster: 'orion' };

/** Préférences valides : une valeur inconnue (ancienne ambiance, verre givré) revient au défaut. */
export const displayPrefs = (p = {}) => ({
  ambiance: known(AMBIANCES, RENAMED[p.ambiance] ?? p.ambiance).id,
  tone: known(TONES, p.tone).id,
  glass: known(GLASS, p.glass).id,
  accent: known(ACCENTS, p.accent).id,
});
