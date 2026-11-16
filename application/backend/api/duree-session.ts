/* Durée de la session ORION, indépendante de celle des jetons du fournisseur d'identité (recommandations OWASP) :
   fermée après 30 minutes sans action de l'utilisateur, et au plus tard 12 heures après la connexion. */
export const INACTIVITE_MAX = 30 * 60 * 1000;
export const DUREE_MAX = 12 * 60 * 60 * 1000;
// Une prolongation par minute au plus : la session n'est pas réenregistrée à chaque requête
const PROLONGATION_MIN = 60 * 1000;

export type DureeSession = { ouverteLe?: number; activeLe?: number };

/** Session en cours : ni inactive depuis trop longtemps, ni ouverte depuis trop longtemps (une session sans dates est expirée). */
export const sessionValide = (s: DureeSession, now = Date.now()) =>
  now - s.activeLe! < INACTIVITE_MAX && now - s.ouverteLe! < DUREE_MAX;

/** Enregistre l'activité de l'utilisateur ; vrai si la session a changé. */
export function prolonger(s: DureeSession, arrierePlan: boolean, now = Date.now()) {
  if (arrierePlan || now - s.activeLe! < PROLONGATION_MIN) return false;
  s.activeLe = now;
  return true;
}
