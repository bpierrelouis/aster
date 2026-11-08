/* ==========================================================================
   Référentiels ASTER : types de matériel, états, statuts de remontée,
   profils. Une entité = une icône + une couleur, partout dans l'application.
   Sources : docs/00-GLOSSAIRE, docs/04-REGLES-DE-GESTION, docs/12-MATRICE-DROITS.
   ========================================================================== */

/* Types de matériel : le cadrage ne fixe pas de liste exhaustive (§ 4) ;
   ces catégories servent au classement visuel et restent modifiables. */
export const DEVICE_TYPES = [
  { id: 'uc', label: 'Unité centrale', plural: 'Unités centrales', icon: 'tower', color: 'var(--c1)' },
  { id: 'videoprojecteur', label: 'Vidéoprojecteur', plural: 'Vidéoprojecteurs', icon: 'projector', color: 'var(--c2)' },
  { id: 'reseau', label: 'Réseau', plural: 'Matériel réseau', icon: 'switch', color: 'var(--c3)' },
  { id: 'peripherique', label: 'Périphérique', plural: 'Périphériques', icon: 'periph', color: 'var(--c4)' },
  { id: 'ecran', label: 'Écran', plural: 'Écrans', icon: 'monitor', color: 'var(--c5)' },
  { id: 'audio', label: 'Audio et vidéo', plural: 'Audio et vidéo', icon: 'speaker', color: 'var(--c6)' },
  { id: 'imprimante', label: 'Imprimante', plural: 'Imprimantes', icon: 'printer', color: 'var(--c7)' },
  { id: 'autre', label: 'Autre', plural: 'Autres', icon: 'materiel', color: 'var(--c8)' },
];

/* État binaire « hors service : oui/non » (RG-08) et localisation (RG-09) */
export const ETATS = {
  ok: { id: 'ok', label: 'En service', icon: 'checkCircle', led: 'ok' },
  hs: { id: 'hs', label: 'Hors service', icon: 'power', led: 'hs' },
};
export const STOCK = { label: 'Stock', long: 'En stock, sans localisation', icon: 'stockage' };

/* Statuts d'une remontée (RG-13) */
export const REMONTEE_STATUTS = [
  { id: 'attente', label: 'En attente', icon: 'hourglass', color: 'var(--wait)', led: 'wait' },
  { id: 'remplace', label: 'Remplacé', icon: 'swap', color: 'var(--iris)', led: 'ok' },
  { id: 'corrige', label: 'Corrigé', icon: 'checkCircle', color: 'var(--ok)', led: 'ok' },
];

/* Types de problème (contenu de l'état des lieux, RG-14) : liste proposée */
export const PROBLEMS = [
  { id: 'power', label: 'Ne s’allume pas', icon: 'noPower' },
  { id: 'display', label: 'Pas d’image', icon: 'noDisplay' },
  { id: 'network', label: 'Connexion', icon: 'noNetwork' },
  { id: 'broken', label: 'Casse', icon: 'broken' },
  { id: 'malfunction', label: 'Fonctionnement anormal', icon: 'malfunction' },
  { id: 'other', label: 'Autre', icon: 'other' },
];

/* Profils (RG-01) */
export const ROLES = [
  { id: 'admin', label: 'Administrateur', icon: 'shield', color: 'var(--iris)' },
  { id: 'gestionnaire', label: 'Gestionnaire', icon: 'materiel', color: 'var(--c5)' },
  { id: 'formateur', label: 'Formateur', icon: 'user', color: 'var(--c3)' },
  { id: 'superadmin', label: 'Super administrateur', icon: 'school', color: 'var(--encre)' },
];

/* Classement d'un processus (RG-45) */
export const CLASSEMENTS = {
  blacklist: { label: 'Blacklist', icon: 'shieldX', led: 'hs' },
  nonref: { label: 'Non référencé', icon: 'malfunction', led: 'wait' },
  whitelist: { label: 'Whitelist', icon: 'shield', led: 'ok' },
};

export const byId = (list, id) => list.find((x) => x.id === id);
export const deviceType = (id) => byId(DEVICE_TYPES, id) ?? DEVICE_TYPES[7];
export const statut = (id) => byId(REMONTEE_STATUTS, id) ?? REMONTEE_STATUTS[0];
export const problem = (id) => byId(PROBLEMS, id) ?? PROBLEMS[5];
export const role = (id) => byId(ROLES, id) ?? ROLES[0];
export const etat = (m) => (m?.hs ? ETATS.hs : ETATS.ok);
